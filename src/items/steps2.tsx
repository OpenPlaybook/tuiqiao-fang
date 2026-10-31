// 播放式故事用的题：都在画面里做，所以要紧凑。
// 选项下面直接出反馈的选择题、选词填句、打字短答、碎片拼接；长文本、点出毛病、改错直接在画面里的卡片上做（点那个词，弹出贴着它的小窗）。
// 每一步做完把“最后的样子”存进记录（data.ans），回来看到的就是自己做过的答案；拓展的步骤用 SaveCtx 加前缀，免得和正题撞名。
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type React from 'react';
import { Reorder, motion } from 'motion/react';
import { GripVertical, Lock, X } from 'lucide-react';
import type { ChoiceSub, FillSub, FragSub, Item, LongSub, MatchSub, MisSub, SortSub, SpotSub, Sub, TeachSub, TypeSub } from '../shared/types';
import { Art, Btn, GlossContext, LETTERS, Rich, shuffleIdx } from '../components/ui';
import { Viz, isViz } from '../components/viz';
import { getState, logAnswer, setData, useGame } from '../game/store';
import { sfx } from '../game/sound';
import { OrderView, WriteView } from './steps';

const triesScore = (t: number) => (t <= 1 ? 1 : t === 2 ? 0.67 : 0.34);

// ---------------- 存答案 ----------------
export const SaveCtx = createContext('');
type Ans = Record<string, { sc: number } & Record<string, unknown>>;
export const ansOf = (it: Item): Ans => (getState().player?.recs[it.id]?.data?.ans as Ans) ?? {};
/** 这一步存下来的样子（做完才有）和存的方法 */
export function useSaved<T extends { sc: number }>(it: Item, key: string): [T | undefined, (v: T) => void] {
  const k = useContext(SaveCtx) + key;
  const v = useGame((g) => (g.player?.recs[it.id]?.data?.ans as Ans | undefined)?.[k]) as T | undefined;
  return [v, (x: T) => setData(it, { ans: { ...ansOf(it), [k]: x } })];
}

const Q = ({ text }: { text: string }) => (text ? <div className="mb-2 text-[16px] font-black"><Rich text={text} /></div> : null);
export const Why = ({ tone, children }: { tone: 'ok' | 'no' | 'mute'; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mx-1 rounded-b-lg px-2.5 pb-1.5 pt-1 text-[14px] leading-relaxed ${tone === 'ok' ? 'bg-emerald-50 text-emerald-900' : tone === 'no' ? 'bg-rose-50 text-rose-900' : 'bg-[#F4EFE4] text-ink2'}`}>{children}</motion.div>
);
const plain = (t: string) => t.replace(/[⟦⟧⟪⟫*]/g, '');
/** 改好的样子：~~删掉的~~ 划掉，++加上的++ 绿色 */
export const Diff = ({ text }: { text: string }) => <>{text.split(/(~~[^~]+~~|\+\+[^+]+\+\+)/).map((p, i) => p.startsWith('~~') ? <s key={i} className="text-rose-500 decoration-2">{p.slice(2, -2)}</s> : p.startsWith('++') ? <b key={i} className="text-emerald-700">{p.slice(2, -2)}</b> : <span key={i}>{p}</span>)}</>;

// ---------------- 选择：反馈写在选项下面；单选点一下就算选了，多选才要“确定” ----------------
type ChoiceSaved = { sc: number; wrong: number[]; pick: number[] };
export const ChoiceInline = ({ it, s, onDone, color, revealed, compact }: StepProps<ChoiceSub> & { revealed?: boolean; compact?: boolean }) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const [saved, save] = useSaved<ChoiceSaved>(it, s.key);
  const pre = useContext(SaveCtx);
  // 早先做完、还没存答案的题：从答题记录里把当时点过的选项找回来
  const sv = useMemo<ChoiceSaved | undefined>(() => {
    if (saved) return saved;
    const r = getState().player?.recs[it.id];
    if (pre || r?.status !== 'done') return undefined;
    const es: { v: string; ok: boolean | null }[] = [];
    for (const e of r.log) { if (e.q !== s.key) continue; es.push(e); if (e.ok) break; }
    const okE = es.find((e) => e.ok); if (!okE) return undefined;
    const idx = (v: string) => v.split(' / ').map((t) => s.opts.findIndex((o) => o.t === t || plain(o.t) === t)).filter((i) => i >= 0);
    return { sc: 1, wrong: [...new Set(es.filter((e) => !e.ok).flatMap((e) => idx(e.v)).filter((i) => !s.ok.includes(i)))], pick: idx(okE.v) };
  }, []);
  const order = useMemo(() => (s.keep ? s.opts.map((_, i) => i) : shuffleIdx(s.opts.length, pid + it.id + s.key)), [pid, it.id, s.key]);
  const [pick, setPick] = useState<number[]>(sv?.pick ?? []);
  const [wrong, setWrong] = useState<number[]>(sv?.wrong ?? []);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(!!sv);
  const [note, setNote] = useState('');
  const multi = !!s.multi, reveal = s.reveal ?? (pre ? 'chosen' : 'all'); // 拓展里一步一问：只在点过的选项下面说为什么，少占地方
  const finish = (sc: number, w: number[], p: number[]) => { setSolved(true); save({ sc, wrong: w, pick: p }); onDone(sc); };
  const submit = (p: number[]) => {
    if (!p.length) return;
    const t = tries + 1; setTries(t);
    const right = multi ? p.length === s.ok.length && p.every((i) => s.ok.includes(i)) : s.ok.includes(p[0]);
    logAnswer(it, { q: s.key, v: p.map((i) => plain(s.opts[i].t)).join(' / '), ok: right }, [s.key, t]);
    if (right) { sfx('ok'); setNote(''); setPick(p); finish(triesScore(t), wrong, p); return; }
    sfx('no');
    const bad = multi ? p.filter((i) => !s.ok.includes(i)) : p;
    const w = [...wrong, ...bad];
    setWrong(w); setPick(p.filter((i) => s.ok.includes(i)));
    if (multi) { const miss = s.ok.filter((i) => !p.includes(i)).length; setNote(bad.length ? '' : `还少选了 ${miss} 个。`); }
    if (t >= 3) { setPick(s.ok); setNote('答案已经标出来了。'); finish(0.34, w, s.ok); }
  };
  const click = (i: number) => {
    if (solved || wrong.includes(i)) return;
    sfx('click');
    if (multi) setPick((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
    else submit([i]);
  };
  const whyOf = (i: number) => {
    const o = s.opts[i], isOk = s.ok.includes(i);
    const body = <><Rich text={o.why} />{o.art && <OptArt a={o.art} />}</>;
    if (wrong.includes(i)) return <Why tone="no">{body}</Why>;
    if (!solved) return null;
    if (isOk) return <Why tone="ok">{body}</Why>;
    if (reveal === 'all' || (reveal === 'ext' && revealed)) return <Why tone="mute">{body}</Why>;
    if (reveal === 'ext') return <Why tone="mute"><span className="flex items-center gap-1"><Lock size={13} />做完拓展再看</span></Why>;
    return null;
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="flex flex-wrap items-start gap-1.5">
        {order.map((i, k) => {
          const o = s.opts[i], on = pick.includes(i), x = wrong.includes(i), good = solved && s.ok.includes(i);
          const py = s.py?.[o.t], why = whyOf(i);
          return (
            <div key={i} className="max-w-full" style={{ flex: '0 1 auto', minWidth: why ? 'min(100%, 280px)' : undefined }}>
              <button onClick={() => click(i)} disabled={solved || x}
                className={`flex w-full items-start gap-2 rounded-lg border-2 px-2.5 py-1.5 text-left leading-snug transition ${compact ? 'text-[15px]' : 'text-[16px]'} ${good ? 'border-emerald-400 bg-emerald-50' : x ? 'border-rose-200 bg-rose-50/70 text-ink2' : on ? 'bg-amber-50' : 'border-[#E6DCC6] bg-white hover:border-[#CDBE9E]'}`}
                style={on && !good ? { borderColor: color } : {}}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: good ? '#059669' : x ? '#E5A3A3' : on ? color : '#C9BEA7' }}>{multi ? (on || good ? '✓' : '') : LETTERS[k]}</span>
                <span className={`font-bold ${x ? 'line-through decoration-rose-300' : ''}`}><Rich text={o.t} />{py && <span className="ml-1.5 text-[0.85em] font-semibold text-[#7A6A58] no-underline">{py}</span>}</span>
              </button>
              {why}
            </div>
          );
        })}
      </div>
      {note && <div className="mt-1.5 text-sm font-bold text-rose-700">{note}</div>}
      {!solved && multi && <div className="mt-2 flex items-center gap-3"><Btn size="sm" color={color} disabled={!pick.length} onClick={() => submit(pick)}>确定</Btn><span className="text-sm text-ink2">（可以选好几个）</span></div>}
    </div>
  );
};
const OptArt = ({ a }: { a: NonNullable<ChoiceSub['opts'][number]['art']> }) => <div className="mt-1.5 max-w-[300px]">{isViz(a) ? <Viz spec={a} /> : <Art spec={a} className="aspect-[56/22] rounded-lg border border-[#E6DCC6]" />}</div>;

// ---------------- 选词填句 ----------------
type FillSaved = { sc: number; put: Record<number, string> };
export const FillView = ({ it, s, onDone, color }: StepProps<FillSub>) => {
  const [sv, save] = useSaved<FillSaved>(it, s.key);
  const [sel, setSel] = useState<string | null>(null);
  const [put, setPut] = useState<Record<number, string>>(sv?.put ?? {});
  const [bad, setBad] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(!!sv);
  const place = (i: number) => { if (solved || !sel) return; sfx('click'); setPut((p) => ({ ...p, [i]: sel })); setBad((b) => b.filter((x) => x !== i)); setSel(null); };
  const all = s.sents.every((_, i) => put[i]);
  const check = () => {
    const t = tries + 1; setTries(t);
    const wrongs = s.sents.map((x, i) => (put[i] === x.a ? -1 : i)).filter((i) => i >= 0);
    logAnswer(it, { q: s.key, v: s.sents.map((_, i) => put[i]).join(' / '), ok: !wrongs.length }, [s.key, t]);
    if (!wrongs.length || t >= 3) {
      sfx(wrongs.length ? 'flip' : 'ok'); setSolved(true); setBad([]);
      const right = Object.fromEntries(s.sents.map((x, i) => [i, x.a]));
      setPut(right); const sc = wrongs.length ? 0.34 : triesScore(t); save({ sc, put: right }); onDone(sc); return;
    }
    sfx('no'); setBad(wrongs);
  };
  return (
    <div>
      <Q text={s.q} />
      {!solved && <div className="mb-2 flex flex-wrap items-center gap-1.5">{s.bank.map((w) => <button key={w} onClick={() => { sfx('click'); setSel(sel === w ? null : w); }} className={`rounded-full border-2 px-3 py-0.5 font-black ${sel === w ? 'text-white' : 'border-[#E6DCC6] bg-white'}`} style={sel === w ? { background: color, borderColor: color } : {}}>{w}</button>)}<span className="ml-1 text-sm text-ink2">{sel ? `放进哪一句？点那一句的空。` : '先点词，再点空。'}</span></div>}
      <div className="space-y-1.5">
        {s.sents.map((x, i) => {
          const parts = x.t.split(/_{3,}/);
          return (
            <div key={i} className={`rounded-lg border-2 bg-white px-3 py-1.5 ${bad.includes(i) ? 'border-rose-300' : solved ? 'border-emerald-200' : 'border-[#E6DCC6]'}`}>
              <div className="text-[16px] leading-relaxed"><Rich text={parts[0]} /><button onClick={() => place(i)} className={`mx-1 inline-block min-w-[4em] rounded-md border-b-[3px] px-1.5 text-center font-black ${put[i] ? '' : 'text-transparent'}`} style={{ borderColor: color, color: put[i] ? color : undefined }}>{put[i] ?? '＿＿'}</button><Rich text={parts[1] ?? ''} /></div>
              {bad.includes(i) && <div className="text-sm text-rose-700">这一句再想想。</div>}
              {solved && <div className="text-sm text-emerald-800">✓ <Rich text={x.why} /></div>}
            </div>
          );
        })}
      </div>
      {!solved && <div className="mt-2"><Btn size="sm" color={color} disabled={!all} onClick={check}>检查</Btn></div>}
    </div>
  );
};

// ---------------- 打字短答 ----------------
const norm = (t: string) => t.replace(/[\s，。、“”"'‘’！？!?.,；;：:（）()]/g, '');
type TypeSaved = { sc: number; v: string; ok: boolean };
export const TypeView = ({ it, s, onDone, color }: StepProps<TypeSub>) => {
  const [sv, save] = useSaved<TypeSaved>(it, s.key);
  const [v, setV] = useState(sv?.v ?? '');
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean | null; t: string } | null>(sv ? (sv.ok ? { ok: true, t: s.why } : { ok: null, t: `答案是“${s.accept[0]}”。${s.why}` }) : null);
  const [solved, setSolved] = useState(!!sv);
  const check = () => {
    const x = norm(v); if (!x) return;
    const t = tries + 1; setTries(t);
    const ok = s.accept.some((a) => norm(a) === x);
    logAnswer(it, { q: s.key, v, ok }, [s.key, t]);
    if (ok) { sfx('ok'); setSolved(true); setMsg({ ok: true, t: s.why }); save({ sc: triesScore(t), v, ok }); onDone(triesScore(t)); return; }
    sfx('no');
    const near = Object.entries(s.near ?? {}).find(([k]) => norm(k) === x)?.[1];
    if (t >= 3) { setSolved(true); setMsg({ ok: null, t: `答案是“${s.accept[0]}”。${s.why}` }); save({ sc: 0.34, v, ok: false }); onDone(0.34); return; }
    setMsg({ ok: false, t: near ?? (t === 1 ? '不太对，再想想。' : `提示：第一个字是“${s.accept[0][0]}”。`) });
  };
  return (
    <div>
      <Q text={s.q} />
      {!solved ? <div className="flex gap-2"><input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) check(); }} placeholder={s.ph} className="w-56 rounded-lg border-2 border-[#E6DCC6] bg-white px-3 py-1.5 text-lg font-bold outline-none focus:border-amber-400" /><Btn size="sm" color={color} disabled={!v.trim()} onClick={check}>确定</Btn></div>
        : <div className="inline-block rounded-t-lg bg-white px-3 py-1 text-lg font-black" style={{ color: msg?.ok ? '#047857' : undefined }}>{v}{msg?.ok && '　✓'}</div>}
      {msg && <Why tone={msg.ok ? 'ok' : msg.ok === false ? 'no' : 'mute'}><Rich text={msg.t} /></Why>}
    </div>
  );
};

// ---------------- 碎片拼接（概括、鉴赏）：一层一层查——先看故事讲对、讲全没有，再看第二层，最后看第三层 ----------------
type FragSaved = { sc: number; chosen: number[]; ok: boolean };
export const FragView = ({ it, s, onDone, color }: StepProps<FragSub>) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const [sv, save] = useSaved<FragSaved>(it, s.key);
  const pool = useMemo(() => shuffleIdx(s.frags.length, pid + it.id + s.key), [pid]);
  const [chosen, setChosen] = useState<number[]>(sv?.chosen ?? []);
  const [tries, setTries] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean | null; lines: React.ReactNode[]; bad: number[]; n: number } | null>(sv ? { ok: sv.ok ? true : null, lines: [sv.ok ? '写得完整！' : '', <span className="text-ink2">也可以这样写：{s.model}</span>], bad: [], n: 0 } : null);
  const [solved, setSolved] = useState(!!sv);
  const add = (i: number) => { if (solved || chosen.includes(i)) return; sfx('click'); setChosen((c) => [...c, i]); };
  const drop = (i: number) => { if (solved) return; sfx('click'); setChosen((c) => c.filter((x) => x !== i)); };
  const F = s.frags;
  const check = () => {
    const t = tries + 1; setTries(t);
    const L = (n: 1 | 2 | 3) => chosen.filter((i) => F[i].layer === n);
    const wrongIn = (xs: number[]) => xs.filter((i) => !F[i].ok);
    const say = (i: number) => <>✗ “{F[i].t}”：{F[i].why ?? '这一句不对。'}</>;
    let lines: React.ReactNode[] = [], bad: number[] = [], ok = false;
    const l1 = L(1), w1 = wrongIn(l1), evs = new Set(l1.filter((i) => F[i].ok).map((i) => F[i].ev));
    const miss = Object.keys(s.events).filter((e) => !evs.has(e));
    if (!l1.length) lines = [s.need[1]];
    else if (w1.length) { bad = w1; lines = w1.map(say); }
    else if (miss.length) lines = [s.events[miss[0]]];
    else {
      const l2 = L(2), w2 = wrongIn(l2);
      if (!l2.length) lines = [s.need[2]];
      else if (w2.length) { bad = w2; lines = w2.map(say); }
      else {
        const l3 = L(3), w3 = wrongIn(l3);
        if (!l3.length) lines = [s.need[3]];
        else if (w3.length) { bad = w3; lines = w3.map(say); }
        else {
          const layers = chosen.map((i) => F[i].layer);
          if (layers.some((v, k) => k && v < layers[k - 1])) lines = [s.order];
          else ok = true;
        }
      }
    }
    logAnswer(it, { q: s.key, v: chosen.map((i) => F[i].t).join('｜'), ok }, [s.key, t]);
    if (ok) {
      sfx('ok'); setSolved(true);
      setFb({ ok: true, lines: ['写得完整！', <span className="text-ink2">也可以这样写：{s.model}</span>], bad: [], n: t });
      save({ sc: triesScore(t), chosen, ok: true }); onDone(triesScore(t)); return;
    }
    sfx('no');
    if (t >= 6) { setSolved(true); setFb({ ok: null, lines: [<>可以这样写：{s.model}</>], bad: [], n: t }); save({ sc: 0.34, chosen, ok: false }); onDone(0.34); return; }
    setFb({ ok: false, lines, bad, n: t });
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 text-[13px] font-bold text-ink2">你拼的（按住拖动可以换顺序）</div>
          {chosen.length ? (
            <Reorder.Group as="div" axis="y" values={chosen} onReorder={(v) => !solved && setChosen(v)} className="space-y-1">
              {chosen.map((i, k) => (
                <Reorder.Item as="div" key={i} value={i} dragListener={!solved} className={`flex cursor-grab items-start gap-1.5 rounded-lg border-2 bg-white px-2 py-1 text-[15px] leading-snug active:cursor-grabbing ${fb?.bad.includes(i) ? 'border-rose-300 bg-rose-50' : solved ? 'border-emerald-200' : 'border-[#E6DCC6]'}`}>
                  {!solved && <GripVertical size={16} className="mt-0.5 shrink-0 text-[#B9AD95]" />}
                  <span className="shrink-0 font-black" style={{ color }}>{k + 1}</span>
                  <span className="flex-1">{F[i].t}{k === chosen.length - 1 ? '。' : '，'}</span>
                  {!solved && <button onPointerDown={(e) => e.stopPropagation()} onClick={() => drop(i)} className="shrink-0 rounded-full p-0.5 text-ink2 hover:bg-rose-100 hover:text-rose-700" aria-label="拿掉"><X size={15} /></button>}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : <div className="rounded-lg border-2 border-dashed px-3 py-2 text-[14px] text-ink2" style={{ borderColor: color + '66' }}>点右边的句子，加到这里。</div>}
        </div>
        {!solved && (
          <div>
            <div className="mb-1 text-[13px] font-bold text-ink2">可以用的句子（不用全用）</div>
            <div className="flex flex-wrap gap-1">{pool.filter((i) => !chosen.includes(i)).map((i) => <button key={i} onClick={() => add(i)} className="rounded-lg border-2 border-[#E6DCC6] bg-white px-2 py-0.5 text-left text-[14px] font-bold leading-snug hover:border-amber-300">{F[i].t}</button>)}</div>
          </div>
        )}
      </div>
      {fb && <div className="mt-2"><Why tone={fb.ok ? 'ok' : fb.ok === false ? 'no' : 'mute'}>{fb.n > 1 && !fb.ok && <span className="mr-1 text-[12px] opacity-70">第 {fb.n} 次检查：</span>}{fb.lines.map((l, k) => <div key={k}>{l}</div>)}</Why></div>}
      {!solved && <div className="mt-2"><Btn size="sm" color={color} disabled={!chosen.length} onClick={check}>检查</Btn></div>}
    </div>
  );
};

// ---------------- 画面里的卡片：长文本、点出毛病、改错都在卡片上做 ----------------
/** 贴着某个词的小弹窗：放在最上层（不会被画面、拓展弹窗的边裁掉），下面放不下就放到词的上面 */
const usePop = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return { wrap, at: (el: HTMLElement) => setAnchor(el), anchor, close: () => setAnchor(null) };
};
const Pop = ({ anchor, children, onClose, w = 400 }: { anchor: HTMLElement | null; children: React.ReactNode; onClose: () => void; w?: number }) => {
  const [, tick] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => {
    if (!anchor) return;
    const f = () => tick((x) => x + 1);
    window.addEventListener('scroll', f, true); window.addEventListener('resize', f);
    return () => { window.removeEventListener('scroll', f, true); window.removeEventListener('resize', f); };
  }, [anchor]);
  useLayoutEffect(() => { const hh = box.current?.offsetHeight ?? 0; if (Math.abs(hh - h) > 2) setH(hh); });
  if (!anchor || !anchor.isConnected) return null;
  const rs = anchor.getClientRects(), last = rs[rs.length - 1] ?? anchor.getBoundingClientRect(), first = rs[0] ?? last;
  const width = Math.min(w, window.innerWidth - 16);
  const left = Math.max(8, Math.min(window.innerWidth - width - 8, last.left + last.width / 2 - width / 2));
  const below = last.bottom + 8, up = first.top - h - 8;
  const top = below + h + 8 <= window.innerHeight || up < 8 ? Math.min(below, Math.max(8, window.innerHeight - h - 8)) : up;
  return createPortal(
    <motion.div ref={box} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="fixed z-[95] overflow-auto rounded-xl bg-white p-3 text-left font-sans text-[15px] text-ink shadow-2xl ring-2 ring-amber-200" style={{ width, left, top, maxHeight: window.innerHeight - 16 }}>
      <button onClick={onClose} className="absolute right-1.5 top-1.5 rounded-full p-1 text-ink2 hover:bg-black/5" aria-label="关上"><X size={15} /></button>
      {children}
    </motion.div>, document.body);
};
const Badge = ({ color, children }: { color: string; children: React.ReactNode }) => <span className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 align-middle font-sans text-[13px] font-black text-white" style={{ background: color }}>{children}</span>;
const Note = ({ tone, children }: { tone: 'ok' | 'no' | 'mute'; children: React.ReactNode }) => <div className={`mt-1.5 rounded-lg px-2.5 py-1 font-sans text-[14px] leading-relaxed ${tone === 'ok' ? 'bg-emerald-50 text-emerald-900' : tone === 'no' ? 'bg-rose-50 text-rose-900' : 'bg-[#F4EFE4] text-ink2'}`}>{children}</div>;

// 长文本：题针对的字、词、句画上线、标上号；点它，题就弹在它下面
export const LongView = ({ it, s, onDone, color }: StepProps<LongSub>) => {
  const parent = useContext(GlossContext);
  const pre = useContext(SaveCtx);
  const subPre = s.key + '.';
  const ans = useGame((g) => g.player?.recs[it.id]?.data?.ans as Ans | undefined) ?? {};
  const [, save] = useSaved<{ sc: number }>(it, s.key);
  const keys = Object.keys(s.qs);
  const doneMap: Record<string, number> = Object.fromEntries(keys.filter((k) => ans[pre + subPre + k]).map((k) => [k, ans[pre + subPre + k].sc]));
  const [active, setActive] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const reported = useRef(!!ans[pre + s.key]);
  const { wrap, at, anchor, close } = usePop();
  const finishOne = (k: string, x: number) => {
    const q = s.qs[k];
    setNote(`${k}　${q.kind === 'choice' ? q.opts[q.ok[0]].why : q.why}`);
    setTimeout(() => { setActive((a) => (a === k ? null : a)); close(); }, 1300); // 做完了，小窗自己关上
    const d = { ...doneMap, [k]: x };
    if (!reported.current && keys.every((q) => d[q] !== undefined)) { reported.current = true; const sc = keys.reduce((a, q) => a + d[q], 0) / keys.length; save({ sc }); onDone(sc); }
  };
  const marker = (n: string, text?: string) => {
    const d = doneMap[n] !== undefined;
    return (
      <span role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); sfx('click'); at(e.currentTarget); setActive(n); }} className={`mark ${d ? 'mark-done' : ''} ${active === n ? 'mark-on' : ''}`} style={{ '--c': color } as React.CSSProperties}>
        {text && <Rich text={text} />}<sup className="mark-no">{d ? '✓' : n}</sup>
      </span>
    );
  };
  const sub = active ? s.qs[active] : null;
  const left = keys.length - Object.keys(doneMap).length;
  return (
    <div ref={wrap} className="relative" onClick={() => { setActive(null); close(); }}>
      <div className="mb-1 flex items-center font-sans text-xs font-black text-[#8A6A2F]">{s.title}<Badge color={left ? color : '#059669'}>{left ? s.q || `画线的地方各有一问，点一点（还剩 ${left} 个）` : '都做完了 ✓'}</Badge></div>
      <GlossContext.Provider value={{ ...parent, marker }}>
        <div className="kai text-[22px] leading-[2.15]"><Rich text={s.text} /></div>
      </GlossContext.Provider>
      {note && <Note tone="ok"><Rich text={note} /></Note>}
      {sub && active && (
        <Pop anchor={anchor} onClose={() => { setActive(null); close(); }} w={440}>
          <SaveCtx.Provider value={pre + subPre}>
            {sub.kind === 'choice' ? <ChoiceInline key={active} it={it} s={sub} color={color} compact onDone={(x) => finishOne(active, x)} /> : <TypeView key={active} it={it} s={sub} color={color} onDone={(x) => finishOne(active, x)} />}
          </SaveCtx.Provider>
        </Pop>
      )}
    </div>
  );
};

// 点出毛病：句子就在卡片上，点有毛病的那一段，在它下面选怎么改
type SpotSaved = { sc: number; missed: number[]; at: number; sp: number };
export const SpotCard = ({ it, s, onDone, color }: StepProps<SpotSub>) => {
  const pre = useContext(SaveCtx);
  const [sv, save] = useSaved<SpotSaved>(it, s.key);
  const fixSaved = useGame((g) => !!(g.player?.recs[it.id]?.data?.ans as Ans | undefined)?.[pre + s.key + '.fix']);
  const [tries, setTries] = useState(0);
  const [found, setFound] = useState<number | null>(sv?.at ?? null);
  const [missed, setMissed] = useState<number[]>(sv?.missed ?? []);
  const [msg, setMsg] = useState<{ ok: boolean | null; t: string } | null>(null);
  const [sp, setSp] = useState(sv?.sp ?? 1);
  const { wrap, at, anchor, close } = usePop();
  const [popOpen, setPopOpen] = useState(false);
  const segEls = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => { if (found !== null && segEls.current[found]) at(segEls.current[found]!); }, []);
  const fixAns = useGame((g) => (g.player?.recs[it.id]?.data?.ans as Ans | undefined)?.[pre + s.key + '.fix']) as { pick?: number[] } | undefined;
  const fixOpt = s.fix && fixAns?.pick?.length ? s.fix.opts[fixAns.pick[0]] : null;
  const fixedText = fixOpt && s.fixed?.[fixOpt.t];
  const hit = (i: number, sc: number, m: number[]) => { setFound(i); setSp(sc); if (!s.fix) { save({ sc, missed: m, at: i, sp: sc }); onDone(sc); } else setPopOpen(true); };
  const click = (i: number, el: HTMLElement) => {
    if (found !== null) { if (s.bad.includes(i)) { at(el); setPopOpen(true); } return; }
    if (missed.includes(i)) return;
    const t = tries + 1; setTries(t);
    const ok = s.bad.includes(i);
    logAnswer(it, { q: s.key, v: s.segs[i], ok }, [s.key, t]);
    if (ok) { sfx('ok'); at(el); setMsg(null); hit(i, triesScore(t), missed); return; }
    sfx('no'); const m = [...missed, i]; setMissed(m); setMsg({ ok: false, t: s.miss?.[i] ?? '这里没有问题，再找找。' });
    if (t >= 3) { const b = s.bad[0]; if (segEls.current[b]) at(segEls.current[b]!); setMsg({ ok: null, t: '毛病在标出来的地方。' }); hit(b, 0.34, m); }
  };
  const latin = s.segs.some((g) => /[a-zA-Z]{2}/.test(g));
  return (
    <div ref={wrap} className="relative" onClick={() => { setPopOpen(false); close(); }}>
      <div className="text-[22px] leading-[2.1]">
        {fixedText ? <span onClick={(e) => { e.stopPropagation(); at(e.currentTarget); setPopOpen(true); }} className="cursor-pointer"><Diff text={fixedText} /></span> : s.segs.map((g, i) => (
          <span key={i}><span ref={(el) => { segEls.current[i] = el; }} onClick={(e) => { e.stopPropagation(); click(i, e.currentTarget); }} className={`seg ${found === null && !missed.includes(i) ? 'seg-click' : ''} ${found !== null && s.bad.includes(i) ? 'cursor-pointer bg-rose-100 text-rose-800 underline decoration-rose-500 decoration-wavy underline-offset-8' : missed.includes(i) ? 'text-ink2/60' : ''}`}>{g}</span>{latin && i < s.segs.length - 1 ? ' ' : ''}</span>
        ))}
        <Badge color={found !== null && (!s.fix || fixSaved) ? '#059669' : color}>{found !== null && (!s.fix || fixSaved) ? '改好了 ✓' : found !== null ? '找到了，选怎么改' : s.q}</Badge>
      </div>
      {msg && !fixOpt && <Note tone={msg.ok ? 'ok' : msg.ok === false ? 'no' : 'mute'}>{msg.t}</Note>}
      {fixOpt && !popOpen && <Note tone="ok"><b>{fixOpt.t}</b>：<Rich text={fixOpt.why} /></Note>}
      {s.fix && found !== null && popOpen && (
        <Pop anchor={anchor} onClose={() => setPopOpen(false)}>
          <SaveCtx.Provider value={pre + s.key + '.'}>
            <ChoiceInline it={it} s={s.fix} color={color} compact onDone={(x) => { const sc = (sp + x) / 2; save({ sc, missed, at: found, sp }); onDone(sc); setTimeout(() => { setPopOpen(false); close(); }, 1300); }} />
          </SaveCtx.Provider>
        </Pop>
      )}
      {s.fix && found !== null && !popOpen && <div className="mt-1 font-sans text-[13px] text-ink2">{fixSaved ? '点句子，看看为什么这样改。' : '点画波浪线的地方，选怎么改。'}</div>}
    </div>
  );
};

// 改错（AI 误译、AI 写的稿子）：点有错的那几个字，在它下面选正确的
type MisSaved = { sc: number; fixed: string[]; gave?: boolean };
export const MisCard = ({ it, s, onDone, color }: StepProps<MisSub>) => {
  const [sv, save] = useSaved<MisSaved>(it, s.key);
  const groups = useMemo(() => [...new Set(s.segs.filter((g) => g.bad).map((g) => g.bad!.word))], [s]);
  const [fixed, setFixed] = useState<string[]>(sv?.fixed ?? []);
  const [open, setOpen] = useState<string | null>(null);
  const [okClicked, setOkClicked] = useState<number[]>([]);
  const [penalty, setPenalty] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean | null; t: React.ReactNode } | null>(null);
  const [wrongOpt, setWrongOpt] = useState<number[]>([]);
  const done = fixed.length === groups.length;
  const { wrap, at, anchor, close } = usePop();
  const click = (i: number, el: HTMLElement) => {
    const g = s.segs[i];
    if (g.bad) { at(el); setOpen(g.bad.word); setWrongOpt([]); if (!fixed.includes(g.bad.word)) sfx('hint'); return; }
    if (done || okClicked.includes(i)) return;
    sfx('no'); setOkClicked((x) => [...x, i]); setPenalty((p) => p + 0.12);
    logAnswer(it, { q: s.key, v: `误点：${g.t}`, ok: false });
    setMsg({ ok: false, t: s.src ? '这一段 AI 译得没问题。' : '这一段没问题。' }); setOpen(null);
  };
  const choose = (word: string, k: number) => {
    const b = s.segs.find((g) => g.bad?.word === word)!.bad!;
    const right = k === b.ok;
    logAnswer(it, { q: s.key + ':' + word, v: b.opts[k], ok: right });
    if (!right) { sfx('no'); setPenalty((p) => p + 0.15); setWrongOpt((w) => [...w, k]); return; }
    sfx('ok');
    const f = [...fixed, word]; setFixed(f); setOpen(null); close(); // 改对了，小窗关上；为什么写在下面
    setMsg({ ok: true, t: <><b>{s.src ? word : b.opts[b.ok].replace(/^\*/, '')}</b>：<Rich text={b.why} /></> });
    if (f.length === groups.length) { const sc = Math.max(0.34, 1 - penalty); save({ sc, fixed: f }); onDone(sc); }
  };
  const giveUp = () => { setFixed(groups); setOpen(null); close(); setMsg({ ok: null, t: '错处都标出来了，点一点，看看每一处为什么错。' }); save({ sc: 0.34, fixed: groups, gave: true }); onDone(0.34); };
  const ob = open ? s.segs.find((g) => g.bad?.word === open)!.bad! : null;
  return (
    <div ref={wrap} className="relative" onClick={() => { setOpen(null); close(); }}>
      <div className="text-[20px] leading-[2.05]">
        {s.segs.map((g, i) => {
          const isFixed = g.bad && fixed.includes(g.bad.word);
          return (
            <span key={i} onClick={(e) => { e.stopPropagation(); click(i, e.currentTarget); }} className={`seg ${!done && !isFixed ? 'seg-click' : ''} ${isFixed ? 'cursor-pointer bg-emerald-100' : okClicked.includes(i) ? 'text-ink2/70' : open && g.bad?.word === open ? 'bg-amber-200' : ''}`}>
              {isFixed ? (g.bad!.fixed ? <Diff text={g.bad!.fixed} /> : <><s className="text-rose-500/80">{g.t}</s> <b className="text-emerald-800">{g.bad!.opts[g.bad!.ok]}</b></>) : g.t}
            </span>
          );
        })}
        <Badge color={done ? '#059669' : color}>{done ? '都改好了 ✓' : `${s.q}（还剩 ${groups.length - fixed.length} 处）`}</Badge>
      </div>
      {msg && <Note tone={msg.ok ? 'ok' : msg.ok === false ? 'no' : 'mute'}>{msg.t}</Note>}
      {!done && fixed.length < groups.length && <div className="mt-1 text-right font-sans text-[13px]"><button onClick={(e) => { e.stopPropagation(); giveUp(); }} className="text-ink2 underline">我找不到了，告诉我</button></div>}
      {ob && open && (
        <Pop anchor={anchor} onClose={() => { setOpen(null); close(); }} w={380}>
          {fixed.includes(open) ? (
            <div className="pr-5"><b className="text-emerald-800">{ob.opts[ob.ok].replace(/^\*/, '')}</b><div className="mt-1 leading-relaxed"><Rich text={ob.why} /></div></div>
          ) : (
            <>
              <div className="mb-2 pr-5 font-black">{s.src ? <>“<span className="kai text-lg">{open}</span>”在这里是什么意思？</> : <>这里有毛病。怎么改？</>}</div>
              <div className="flex flex-wrap gap-1.5">{ob.opts.map((o, k) => <button key={k} disabled={wrongOpt.includes(k)} onClick={() => choose(open, k)} className={`rounded-lg border-2 px-2.5 py-1 text-left font-bold ${wrongOpt.includes(k) ? 'border-rose-200 bg-rose-50 text-ink2 line-through' : 'border-[#E6DCC6] bg-white hover:border-amber-400'}`}>{o}</button>)}</div>
              {wrongOpt.length > 0 && <div className="mt-1.5 text-sm text-rose-800">“{ob.opts[wrongOpt[wrongOpt.length - 1]]}”不对。{s.src ? `再想想“${open}”在这里是什么意思。` : '再想想。'}</div>}
            </>
          )}
        </Pop>
      )}
    </div>
  );
};

// ---------------- 讲：老师讲一小段，和后面那一问一起出现 ----------------
export const TeachView = ({ s, color }: { s: TeachSub; color: string }) => (
  <div className="rounded-lg border-l-4 bg-[#FBF6EA] px-3.5 py-2 text-[16px] leading-[1.85]" style={{ borderColor: color }}>
    {s.q && <div className="font-black">{s.q}</div>}
    <Rich text={s.t} />
    {s.art && <div className="mx-auto mt-1.5 max-w-[560px]">{isViz(s.art) ? <Viz spec={s.art} /> : <Art spec={s.art} className="aspect-[56/22] rounded-lg" />}</div>}
    {s.ex && <div className="mt-1 space-y-0.5 border-t border-dashed border-[#E2D5B8] pt-1">{s.ex.map((e, i) => <div key={i}><Rich text={e} /></div>)}</div>}
  </div>
);

// ---------------- 分类、连线：一项一行，几列并排，省地方 ----------------
export const SortPlay = ({ it, s, onDone, color, init }: StepProps<SortSub> & { init?: boolean }) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const order = useMemo(() => shuffleIdx(s.cards.length, pid + it.id + s.key), [pid]);
  const [put, setPut] = useState<Record<number, number>>(init ? Object.fromEntries(s.cards.map((c, i) => [i, c.bin])) : {});
  const [bad, setBad] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(!!init);
  const all = Object.keys(put).length === s.cards.length;
  const check = () => {
    const t = tries + 1; setTries(t);
    const wrong = s.cards.map((c, i) => (put[i] === c.bin ? -1 : i)).filter((i) => i >= 0);
    logAnswer(it, { q: s.key, v: s.cards.map((c, i) => `${plain(c.t)}→${s.bins[put[i]]}`).join('；'), ok: !wrong.length }, [s.key, t]);
    if (!wrong.length || t >= 3) { sfx(wrong.length ? 'flip' : 'ok'); setSolved(true); setBad([]); setPut(Object.fromEntries(s.cards.map((c, i) => [i, c.bin]))); onDone(wrong.length ? 0.34 : triesScore(t)); return; }
    sfx('no'); setBad(wrong);
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
        {order.map((i) => {
          const c = s.cards[i];
          return (
            <div key={i} className={`rounded-lg border-2 bg-white px-2.5 py-1 ${bad.includes(i) ? 'border-rose-300' : solved ? 'border-emerald-200' : 'border-[#E6DCC6]'}`}>
              <div className="flex flex-wrap items-center gap-1">
                <span className="mr-auto text-[15px] font-bold leading-snug"><Rich text={c.t} /></span>
                {s.bins.map((b, j) => <button key={j} disabled={solved} onClick={() => { sfx('click'); setPut((p) => ({ ...p, [i]: j })); setBad((x) => x.filter((y) => y !== i)); }} className={`rounded-full border-2 px-2 py-0 text-[13px] font-black ${put[i] === j ? 'text-white' : 'border-[#E6DCC6] bg-[#FBF7EE] text-ink2'}`} style={put[i] === j ? { background: color, borderColor: color } : {}}>{b}</button>)}
              </div>
              {(solved || bad.includes(i)) && <div className={`text-[13px] leading-snug ${bad.includes(i) ? 'text-rose-700' : 'text-emerald-800'}`}>{bad.includes(i) ? '✗ 放错了，再想想。' : <>✓ <Rich text={c.why} /></>}</div>}
            </div>
          );
        })}
      </div>
      {!solved && <div className="mt-2 flex items-center gap-3"><Btn size="sm" color={color} disabled={!all} onClick={check}>检查</Btn>{bad.length > 0 && <span className="text-sm font-bold text-rose-700">有 {bad.length} 个放错了。</span>}</div>}
    </div>
  );
};
export const MatchPlay = ({ it, s, onDone, color, init }: StepProps<MatchSub> & { init?: boolean }) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const rorder = useMemo(() => shuffleIdx(s.right.length, pid + it.id + s.key + 'r'), [pid]);
  const [sel, setSel] = useState<Record<number, number>>(init ? Object.fromEntries(s.pairs.map((p, i) => [i, p])) : {});
  const [bad, setBad] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(!!init);
  const all = Object.keys(sel).length === s.left.length;
  const check = () => {
    const t = tries + 1; setTries(t);
    const wrong = s.left.map((_, i) => (sel[i] === s.pairs[i] ? -1 : i)).filter((i) => i >= 0);
    logAnswer(it, { q: s.key, v: s.left.map((l, i) => `${plain(l)}→${s.right[sel[i]]}`).join('；'), ok: !wrong.length }, [s.key, t]);
    if (!wrong.length || t >= 3) { sfx(wrong.length ? 'flip' : 'ok'); setSolved(true); setBad([]); setSel(Object.fromEntries(s.pairs.map((p, i) => [i, p]))); onDone(wrong.length ? 0.34 : triesScore(t)); return; }
    sfx('no'); setBad(wrong);
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="divide-y divide-[#EFE6D2] overflow-hidden rounded-lg border-2 border-[#E6DCC6] bg-white">
        {s.left.map((l, i) => (
          <div key={i} className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-1.5 ${bad.includes(i) ? 'bg-rose-50' : ''}`}>
            <div className="min-w-[200px] flex-1 text-[15px] font-bold leading-snug"><Rich text={l} /></div>
            <div className="flex flex-wrap gap-1">
              {rorder.map((j) => <button key={j} disabled={solved} onClick={() => { sfx('click'); setSel((p) => ({ ...p, [i]: j })); setBad((x) => x.filter((y) => y !== i)); }} className={`rounded-lg border-2 px-2 py-0.5 text-left text-[13px] font-bold ${sel[i] === j ? 'text-white' : solved ? 'hidden' : 'border-[#E6DCC6] bg-[#FBF7EE] text-ink'}`} style={sel[i] === j ? { background: solved ? '#059669' : color, borderColor: solved ? '#059669' : color } : {}}>{s.right[j]}</button>)}
            </div>
          </div>
        ))}
      </div>
      {!solved && <div className="mt-2 flex items-center gap-3"><Btn size="sm" color={color} disabled={!all} onClick={check}>检查</Btn>{bad.length > 0 && <span className="text-sm font-bold text-rose-700">有 {bad.length} 行不对，再改改。</span>}</div>}
      {solved && <div className="mt-1.5"><Why tone="ok"><Rich text={s.why} /></Why></div>}
    </div>
  );
};

export interface StepProps<S> { it: Item; s: S; onDone: (score: number) => void; color: string }
/** 播放式故事里一道题的一步（连线、分类、排序：做完只存分数，回来直接显示正确答案） */
export const PlayStep = ({ it, s, color, onDone, revealed }: { it: Item; s: Sub; color: string; onDone: (x: number) => void; revealed?: boolean }) => {
  const [sv, save] = useSaved<{ sc: number }>(it, s.key);
  const keep = (x: number) => { save({ sc: x }); onDone(x); };
  switch (s.kind) {
    case 'choice': return <ChoiceInline it={it} s={s} color={color} onDone={onDone} revealed={revealed} />;
    case 'fill': return <FillView it={it} s={s} color={color} onDone={onDone} />;
    case 'type': return <TypeView it={it} s={s} color={color} onDone={onDone} />;
    case 'frag': return <FragView it={it} s={s} color={color} onDone={onDone} />;
    case 'long': return <LongView it={it} s={s} color={color} onDone={onDone} />;
    case 'spot': return <SpotCard it={it} s={s} color={color} onDone={onDone} />;
    case 'mis': return <MisCard it={it} s={s} color={color} onDone={onDone} />;
    case 'sort': return <SortPlay it={it} s={s} color={color} onDone={keep} init={!!sv} />;
    case 'match': return <MatchPlay it={it} s={s} color={color} onDone={keep} init={!!sv} />;
    case 'order': return <OrderView it={it} s={s} color={color} onDone={keep} />;
    case 'write': return <WriteView it={it} s={s} color={color} onDone={onDone} />;
    case 'teach': return null;
  }
};
/** 题在画面里怎么摆：卡片上做 / 下方小弹层 / 大弹层 */
export const layoutOf = (s: Sub | undefined): 'card' | 'panel' | 'big' => (!s ? 'panel' : ['mis', 'spot', 'long'].includes(s.kind) ? 'card' : ['frag', 'match', 'sort', 'fill', 'order'].includes(s.kind) ? 'big' : 'panel');
