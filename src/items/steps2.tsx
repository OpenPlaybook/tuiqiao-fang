// 播放式故事用的题：都在画面里做，所以要紧凑。
// 选项下面直接出反馈的选择题、选词填句、打字短答、碎片拼接；长文本、点出毛病、改错直接在画面里的卡片上做（点那个词，弹出贴着它的小窗）。
// 每一步做完把“最后的样子”存进记录（data.ans），回来看到的就是自己做过的答案；拓展的步骤用 SaveCtx 加前缀，免得和正题撞名。
import { Fragment, createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type React from 'react';
import { Reorder, motion } from 'motion/react';
import { Glasses, GripVertical, Lock, X } from 'lucide-react';
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
/** 选项的顺序：一律打乱（按学号 + 题号固定，刷新不变）；“都说得通”“以上都……”这种总括的放最后 */
export const optOrder = (opts: { t: string }[], seed: string) => {
  const o = shuffleIdx(opts.length, seed), last = (i: number) => /^(都|以上|两个都|三个都)/.test(plain(opts[i].t)) || /都说得通|都有可能/.test(opts[i].t);
  return [...o.filter((i) => !last(i)), ...o.filter(last)];
};
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
  const order = useMemo(() => optOrder(s.opts, pid + it.id + s.key), [pid, it.id, s.key]);
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
  const pid = useGame((g) => g.player?.pid ?? '');
  const bank = useMemo(() => shuffleIdx(s.bank.length, pid + it.id + s.key + 'b').map((i) => s.bank[i]), [pid]); // 词的顺序打乱，不跟着句子的顺序
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
      {!solved && <div className="mb-2 flex flex-wrap items-center gap-1.5">{bank.map((w) => <button key={w} onClick={() => { sfx('click'); setSel(sel === w ? null : w); }} className={`rounded-full border-2 px-3 py-0.5 font-black ${sel === w ? 'text-white' : 'border-[#E6DCC6] bg-white'}`} style={sel === w ? { background: color, borderColor: color } : {}}>{w}</button>)}<span className="ml-1 text-sm text-ink2">{sel ? `放进哪一句？点那一句的空。` : '先点词，再点空。'}</span></div>}
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
const norm = (t: string) => t.replace(/[\s，。、“”"'‘’！？!?.,；;：:（）()]/g, '').toLowerCase(); // 英文不分大小写
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
    setMsg({ ok: false, t: near ?? (t === 1 ? '不太对，再想想。' : `提示：第一个${/[a-z]/i.test(s.accept[0][0]) ? '字母' : '字'}是“${s.accept[0][0]}”。`) });
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
  const pid = useGame((g) => g.player?.pid ?? '');
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
              <div className="flex flex-wrap gap-1.5">{shuffleIdx(ob.opts.length, pid + it.id + s.key + open).map((k) => { const o = ob.opts[k]; return <button key={k} disabled={wrongOpt.includes(k)} onClick={() => choose(open, k)} className={`rounded-lg border-2 px-2.5 py-1 text-left font-bold ${wrongOpt.includes(k) ? 'border-rose-200 bg-rose-50 text-ink2 line-through' : 'border-[#E6DCC6] bg-white hover:border-amber-400'}`}>{o}</button>; })}</div>
              {wrongOpt.length > 0 && <div className="mt-1.5 text-sm text-rose-800">“{ob.opts[wrongOpt[wrongOpt.length - 1]]}”不对。{s.src ? `再想想“${open}”在这里是什么意思。` : '再想想。'}</div>}
            </>
          )}
        </Pop>
      )}
    </div>
  );
};

// ---------------- 讲：老师讲一小段，和后面那一问并在同一个气泡里说 ----------------
export const TeachBody = ({ s }: { s: TeachSub }) => (
  <div>
    {s.q && <div className="font-black">{s.q}</div>}
    <Rich text={s.t} />
    {s.art && <div className="mt-1.5 max-w-[520px]">{isViz(s.art) ? <Viz spec={s.art} /> : <Art spec={s.art} className="aspect-[56/22] rounded-lg" />}</div>}
    {s.ex && <div className="mt-1 space-y-0.5">{s.ex.map((e, i) => <div key={i} className="kai text-[17px]"><Rich text={e} /></div>)}</div>}
  </div>
);
export const TeachView = ({ s }: { s: TeachSub; color?: string }) => <Bubble who="ai"><TeachBody s={s} /></Bubble>;
/** 选择题的问句（并进上一个气泡时也用它） */
export const ChoiceQ = ({ s }: { s: ChoiceSub }) => <div><span className="font-bold"><Rich text={s.q} /></span>{s.multi && <span className="ml-1 text-[14px] opacity-70">（可以选好几个）</span>}</div>;

// ---------------- 对话：眼镜在左边讲、问；我的回答在右边 ----------------
/** 一个对话气泡。who='ai' 在左边（读书眼镜），'me' 在右边（学生自己）；tone 是眼镜回话的颜色（对 / 错） */
export const Bubble = ({ who, tone, wide, children }: { who: 'ai' | 'me'; tone?: 'ok' | 'no'; wide?: boolean; children: React.ReactNode }) => (
  who === 'ai'
    ? <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700"><Glasses size={16} /></span>
        <div className={`rounded-2xl rounded-tl-md px-3.5 py-2 text-[16px] leading-[1.8] ${wide ? 'min-w-0 flex-1' : 'max-w-[86%]'} ${tone === 'ok' ? 'bg-emerald-50 text-emerald-950' : tone === 'no' ? 'bg-rose-50 text-rose-950' : 'bg-[#F2F5F7] text-ink'}`}>{children}</div>
      </div>
    : <div className="flex justify-end"><div className="max-w-[80%] rounded-2xl rounded-tr-md bg-[#F6E3BF] px-3.5 py-2 text-[16px] font-bold leading-[1.7] text-[#4A3A20]">{children}</div></div>
);
/** 选择题做成对话：眼镜问 → 我点一个回答（出现在右边）→ 眼镜接着说为什么；错了接着选。
 *  眼镜连着说的话并成一个气泡：lead 是问之前要讲的（并在问句前面）；答对以后，tail（下一段讲解、下一问）接在这条回话后面，
 *  中间一道虚线隔开——上面是说刚才那个回答，下面是接着往下讲。hideQ：问句已经在上一个气泡里说过了。 */
export const ChoiceChat = ({ it, s, onDone, color, lead, tail, hideQ, wideTail }: StepProps<ChoiceSub> & { lead?: React.ReactNode; tail?: React.ReactNode; hideQ?: boolean; wideTail?: boolean }) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const [sv, save] = useSaved<ChoiceSaved>(it, s.key);
  const order = useMemo(() => optOrder(s.opts, pid + it.id + s.key), [pid, it.id, s.key]);
  // 回答的记录：每次交的那几个选项（做过的从存档里排出来：先是答错的，最后是答对的）
  const [hist, setHist] = useState<number[][]>(() => (sv ? [...sv.wrong.map((i) => [i]), sv.pick] : []));
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(!!sv);
  const [sel, setSel] = useState<number[]>([]);
  const [gave, setGave] = useState(false); // 三次都没对：眼镜直接说答案
  const multi = !!s.multi;
  const wrong = hist.flat().filter((i) => !s.ok.includes(i));
  const send = (p: number[]) => {
    if (!p.length || solved) return;
    const t = tries + 1; setTries(t);
    const right = multi ? p.length === s.ok.length && p.every((i) => s.ok.includes(i)) : s.ok.includes(p[0]);
    logAnswer(it, { q: s.key, v: p.map((i) => plain(s.opts[i].t)).join(' / '), ok: right }, [s.key, t]);
    const h = [...hist, p]; setHist(h); setSel([]);
    const w = h.flat().filter((i) => !s.ok.includes(i));
    if (right) { sfx('ok'); setSolved(true); save({ sc: triesScore(t), wrong: w, pick: p }); onDone(triesScore(t)); return; }
    sfx('no');
    if (t >= 3) { setSolved(true); setGave(true); save({ sc: 0.34, wrong: w, pick: s.ok }); onDone(0.34); }
  };
  // 最后一条回话：后面有话接着说，就并进同一个气泡
  const last = (body: React.ReactNode) => (tail
    ? <Bubble who="ai" wide={wideTail}><div className="text-emerald-800">{body}</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1.5 space-y-1 border-t border-dashed border-[#CFD9E0] pt-1.5">{tail}</motion.div></Bubble>
    : <Bubble who="ai" tone="ok">{body}</Bubble>);
  const reply = (p: number[], k: number) => {
    const right = multi ? p.length === s.ok.length && p.every((i) => s.ok.includes(i)) : s.ok.includes(p[0]);
    if (right) return last(<>{multi ? (s.ok.length > 1 ? '都对了。' : '对。') : <Rich text={s.opts[p[0]].why} />}{multi && p.map((i) => <div key={i} className="text-[15px]">· {plain(s.opts[i].t)}：<Rich text={s.opts[i].why} /></div>)}</>);
    const bad = p.filter((i) => !s.ok.includes(i)), miss = s.ok.filter((i) => !p.includes(i)).length;
    return <Bubble who="ai" tone="no">{bad.map((i) => <div key={i}>{bad.length > 1 && <b>{plain(s.opts[i].t)}：</b>}<Rich text={s.opts[i].why} /></div>)}{!bad.length && multi && <div>还少了 {miss} 个。</div>}{k === hist.length - 1 && !solved && <div className="mt-0.5 text-[14px] opacity-75">再想想，换一个。</div>}</Bubble>;
  };
  const left = order.filter((i) => !wrong.includes(i));
  return (
    <div className="space-y-2">
      {!hideQ && <Bubble who="ai">{lead && <div className="mb-1 space-y-1">{lead}</div>}<ChoiceQ s={s} /></Bubble>}
      {hist.map((p, k) => (
        <div key={k} className="space-y-2">
          <Bubble who="me">{p.map((i) => plain(s.opts[i].t)).join('、')}</Bubble>
          {reply(p, k)}
        </div>
      ))}
      {gave && last(<>答案是：<b>{s.ok.map((i) => plain(s.opts[i].t)).join('、')}</b>。{s.ok.length === 1 && <Rich text={s.opts[s.ok[0]].why} />}</>)}
      {!solved && (
        <div className="flex flex-wrap items-center justify-end gap-1.5 pl-10">
          {left.map((i) => (
            <button key={i} onClick={() => { sfx('click'); if (multi) setSel((x) => (x.includes(i) ? x.filter((y) => y !== i) : [...x, i])); else send([i]); }}
              className={`max-w-full rounded-2xl border-2 px-3 py-1 text-left text-[15px] font-bold leading-snug transition ${sel.includes(i) ? 'bg-[#F6E3BF]' : 'border-[#E6DCC6] bg-white hover:border-[#D9B77A] hover:bg-[#FFF8EA]'}`}
              style={sel.includes(i) ? { borderColor: color } : {}}><Rich text={s.opts[i].t} /></button>
          ))}
          {multi && <button disabled={!sel.length} onClick={() => send(sel)} className="rounded-full px-3.5 py-1 text-[14px] font-black text-white disabled:opacity-40" style={{ background: color }}>就这些</button>}
        </div>
      )}
    </div>
  );
};

// ---------------- 分类：把卡片拖进格子（褒贬色带也是同一个组件，格子排成一条从贬到褒的色带） ----------------
/** 上面一排没放的卡片，下面几个格子。拖过去就放进去（也可以先点卡片、再点格子）；放进去的卡片还能再拖、再点，换个格子或者拖回上面。
 *  检查以后，错了只说错了几张、不说是哪几张（让学生自己再想想怎么分）；做对了，每张卡片下面说为什么。scale：格子从左到右是“贬 → 中 → 褒”，上面画一条色带。 */
export const SortPlay = ({ it, s, onDone, color, init }: StepProps<SortSub> & { init?: boolean }) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const order = useMemo(() => shuffleIdx(s.cards.length, pid + it.id + s.key), [pid]);
  const [put, setPut] = useState<Record<number, number>>(init ? Object.fromEntries(s.cards.map((c, i) => [i, c.bin])) : {});
  const [bad, setBad] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(!!init);
  const [sel, setSel] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ i: number; x: number; y: number; x0: number; y0: number; on: boolean } | null>(null);
  const [hover, setHover] = useState<number | null>(null); // 拖到哪个格子上面了（-1 是上面那一排）
  const all = Object.keys(put).length === s.cards.length;
  const check = () => {
    const t = tries + 1; setTries(t);
    const wrong = s.cards.map((c, i) => (put[i] === c.bin ? -1 : i)).filter((i) => i >= 0);
    logAnswer(it, { q: s.key, v: s.cards.map((c, i) => `${plain(c.t)}→${s.bins[put[i]]}`).join('；'), ok: !wrong.length }, [s.key, t]);
    if (!wrong.length || t >= 3) { sfx(wrong.length ? 'flip' : 'ok'); setSolved(true); setBad([]); setSel(null); setPut(Object.fromEntries(s.cards.map((c, i) => [i, c.bin]))); onDone(wrong.length ? 0.34 : triesScore(t)); return; }
    sfx('no'); setBad(wrong);
  };
  const place = (i: number, j: number) => { if (solved) return; sfx('click'); setPut((p) => { const q = { ...p }; if (j < 0) delete q[i]; else q[i] = j; return q; }); setBad([]); setSel(null); };
  const zoneAt = (x: number, y: number) => { const z = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-bin]') as HTMLElement | null; return z ? Number(z.dataset.bin) : null; };
  // 拖：按下以后挪了一点才算拖（没挪就是“点”：选中它）
  useEffect(() => {
    if (!drag) return;
    const mv = (e: PointerEvent) => { const on = drag.on || Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6; setDrag({ ...drag, x: e.clientX, y: e.clientY, on }); if (on) setHover(zoneAt(e.clientX, e.clientY)); };
    const up = (e: PointerEvent) => {
      if (drag.on) { const z = zoneAt(e.clientX, e.clientY); if (z !== null) place(drag.i, z); }
      else { sfx('click'); setSel((x) => (x === drag.i ? null : drag.i)); }
      setDrag(null); setHover(null);
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up, { once: true });
    return () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
  }, [drag]);
  const card = (i: number) => {
    const c = s.cards[i], on = sel === i, ghost = drag?.on && drag.i === i;
    return (
      <div key={i} onPointerDown={(e) => { if (solved) return; e.preventDefault(); setDrag({ i, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, on: false }); }}
        className={`select-none rounded-lg border-2 px-2.5 py-1 text-[15px] font-bold leading-snug transition ${solved ? 'border-emerald-200 bg-white' : on ? 'cursor-grab bg-[#FFF3D6]' : 'cursor-grab border-[#E6DCC6] bg-white hover:border-amber-300'} ${ghost ? 'opacity-30' : ''}`}
        style={{ ...(on ? { borderColor: color } : {}), touchAction: 'none' }}>
        <Rich text={c.t} />
        {solved && <div className="mt-0.5 text-[13px] font-normal leading-snug text-emerald-800">✓ <Rich text={c.why} /></div>}
      </div>
    );
  };
  const pool = order.filter((i) => put[i] === undefined);
  const zone = (j: number) => ({ 'data-bin': j, onClick: () => { if (sel !== null) place(sel, j); } });
  return (
    <div>
      <Q text={s.q} />
      {/* 还没放的卡片 */}
      {!solved && (
        <div {...zone(-1)} className={`mb-1.5 flex min-h-[44px] flex-wrap gap-1.5 rounded-lg border-2 border-dashed p-1.5 ${hover === -1 ? 'border-amber-400 bg-amber-50' : 'border-transparent'}`}>
          {pool.map(card)}
          {!pool.length && <span className="self-center text-[13px] text-ink2">都放好了。想换，就把卡片拖到别的格子（或者拖回这里）。</span>}
        </div>
      )}
      {s.scale && <div className="h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg, #C0392B, #E9DFCB 50%, #2E8B57)' }} />}
      <div className={`grid gap-1.5 ${s.scale ? 'mt-1' : ''}`} style={{ gridTemplateColumns: `repeat(${s.bins.length}, minmax(0, 1fr))` }}>
        {s.bins.map((b, j) => {
          const hot = hover === j || (sel !== null && !solved);
          return (
            <div key={j} {...zone(j)} className={`min-h-[90px] rounded-lg border-2 border-dashed px-1.5 pb-1.5 pt-1 transition ${hover === j ? 'border-amber-400 bg-amber-50' : hot ? 'cursor-pointer border-amber-300 bg-amber-50/40' : 'border-[#E6DCC6] bg-white/60'}`}>
              <div className={`mb-1 text-center text-[13px] font-black ${s.scale ? (j === 0 ? 'text-rose-700' : j === s.bins.length - 1 ? 'text-emerald-700' : 'text-ink2') : 'text-ink2'}`}>{b}</div>
              <div className="flex flex-col gap-1">{order.filter((i) => put[i] === j).map(card)}</div>
            </div>
          );
        })}
      </div>
      {!solved && <div className="mt-2 flex items-center gap-3"><Btn size="sm" color={color} disabled={!all} onClick={check}>检查</Btn>{bad.length > 0 ? <span className="text-sm font-bold text-rose-700">有 {bad.length} 张放错了。再想想：每张卡片说的到底是哪一种？</span> : <span className="text-sm text-ink2">把卡片拖进格子；也可以先点卡片，再点格子。</span>}</div>}
      {/* 拖着走的那张 */}
      {drag?.on && createPortal(<div className="pointer-events-none fixed z-[120] max-w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 bg-white px-2.5 py-1 text-[15px] font-bold shadow-xl" style={{ left: drag.x, top: drag.y, borderColor: color }}><Rich text={s.cards[drag.i].t} /></div>, document.body)}
    </div>
  );
};
/** 连一连：左右两栏，中间画线。点左边一项、再点右边一项（先点右边也行，或者从一边拖到另一边）就连上；再连一次就换。
 *  右边的顺序打乱；一项右边可以连好几项左边（比如“这几句各是哪个意思”）。检查以后，连对的绿线，连错的红色虚线。 */
const LINE_C = ['#2F5DA8', '#C2552E', '#7A4FA0', '#2F8A57', '#B8862A', '#B8352A', '#3A8A9A', '#8A5A3A'];
export const MatchPlay = ({ it, s, onDone, color, init }: StepProps<MatchSub> & { init?: boolean }) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const rorder = useMemo(() => shuffleIdx(s.right.length, pid + it.id + s.key + 'r'), [pid]);
  const [sel, setSel] = useState<Record<number, number>>(init ? Object.fromEntries(s.pairs.map((p, i) => [i, p])) : {});
  const [bad, setBad] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(!!init);
  const [pickL, setPickL] = useState<number | null>(null);
  const [pickR, setPickR] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ side: 'l' | 'r'; i: number; x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const lRef = useRef<(HTMLDivElement | null)[]>([]), rRef = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<{ w: number; h: number; l: { x: number; y: number }[]; r: { x: number; y: number }[] }>({ w: 0, h: 0, l: [], r: [] });
  // 量每一项的位置（线从左边一项的右边缘，连到右边一项的左边缘）
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const measure = () => {
      const b = el.getBoundingClientRect();
      const at = (e: HTMLDivElement | null, side: 'l' | 'r') => { if (!e) return { x: 0, y: 0 }; const r = e.getBoundingClientRect(); return { x: (side === 'l' ? r.right : r.left) - b.left, y: r.top + r.height / 2 - b.top }; };
      setGeo({ w: b.width, h: b.height, l: s.left.map((_, i) => at(lRef.current[i], 'l')), r: s.right.map((_, j) => at(rRef.current[j], 'r')) });
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect();
  }, [s]);
  const link = (i: number, j: number) => { if (solved) return; sfx('click'); setSel((p) => ({ ...p, [i]: j })); setBad((x) => x.filter((y) => y !== i)); setPickL(null); setPickR(null); };
  const tapL = (i: number) => { if (solved) return; if (pickR !== null) return link(i, pickR); sfx('click'); setPickL(pickL === i ? null : i); };
  const tapR = (j: number) => { if (solved) return; if (pickL !== null) return link(pickL, j); sfx('click'); setPickR(pickR === j ? null : j); };
  // 拖：从一边按下，拖到另一边松开
  const local = (e: React.PointerEvent) => { const b = box.current!.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  const down = (side: 'l' | 'r', i: number) => (e: React.PointerEvent) => { if (solved) return; setDrag({ side, i, ...local(e) }); };
  const move = (e: React.PointerEvent) => { if (drag) setDrag({ ...drag, ...local(e) }); };
  const up = (e: React.PointerEvent) => {
    if (!drag) return;
    const t = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('[data-m]') as HTMLElement | null;
    const [side, k] = (t?.dataset.m ?? '').split(':');
    if (side && side !== drag.side) link(drag.side === 'l' ? drag.i : Number(k), drag.side === 'l' ? Number(k) : drag.i);
    else if (side === drag.side && Number(k) === drag.i) (drag.side === 'l' ? tapL : tapR)(drag.i);
    setDrag(null);
  };
  const all = Object.keys(sel).length === s.left.length;
  const check = () => {
    const t = tries + 1; setTries(t);
    const wrong = s.left.map((_, i) => (sel[i] === s.pairs[i] ? -1 : i)).filter((i) => i >= 0);
    logAnswer(it, { q: s.key, v: s.left.map((l, i) => `${plain(l)}→${s.right[sel[i]]}`).join('；'), ok: !wrong.length }, [s.key, t]);
    if (!wrong.length || t >= 3) { sfx(wrong.length ? 'flip' : 'ok'); setSolved(true); setBad([]); setSel(Object.fromEntries(s.pairs.map((p, i) => [i, p]))); onDone(wrong.length ? 0.34 : triesScore(t)); return; }
    sfx('no'); setBad(wrong);
  };
  const item = (side: 'l' | 'r', k: number, text: string, on: boolean, linked: boolean, tone: string) => (
    <div key={k} ref={(e) => { (side === 'l' ? lRef : rRef).current[k] = e; }} data-m={`${side}:${k}`} onPointerDown={down(side, k)}
      className={`relative cursor-pointer select-none rounded-lg border-2 px-2.5 py-1.5 text-[15px] font-bold leading-snug transition ${on ? 'bg-[#FFF3D6]' : linked ? 'bg-white' : 'bg-[#FBF7EE] hover:border-amber-300'} ${side === 'l' ? 'pr-4' : 'pl-4'}`}
      style={{ borderColor: on ? color : linked ? tone : '#E6DCC6', touchAction: 'none' }}>
      <Rich text={text} />
      <span className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 bg-white ${side === 'l' ? '-right-[7px]' : '-left-[7px]'}`} style={{ borderColor: on || linked ? tone : '#CFC4AE', background: linked ? tone : '#fff' }} />
    </div>
  );
  const toneL = (i: number) => (solved ? '#059669' : bad.includes(i) ? '#E11D48' : LINE_C[i % LINE_C.length]);
  return (
    <div>
      <Q text={s.q} />
      <div ref={box} className="relative grid grid-cols-[1fr_minmax(56px,12%)_1fr] items-center gap-y-1.5" onPointerMove={move} onPointerUp={up} onPointerLeave={() => setDrag(null)}>
        {(s.lh || s.rh) && <><div className="text-[12px] font-black text-ink2">{s.lh}</div><div /><div className="text-[12px] font-black text-ink2">{s.rh}</div></>}
        {Array.from({ length: Math.max(s.left.length, s.right.length) }, (_, row) => (
          <Fragment key={row}>
            <div>{row < s.left.length && item('l', row, s.left[row], pickL === row || drag?.side === 'l' && drag.i === row, sel[row] !== undefined, toneL(row))}</div>
            <div />
            <div>{row < rorder.length && (() => { const j = rorder[row], li = Object.keys(sel).map(Number).filter((i) => sel[i] === j); return item('r', j, s.right[j], pickR === j || drag?.side === 'r' && drag.i === j, li.length > 0, li.length ? toneL(li[0]) : '#CFC4AE'); })()}</div>
          </Fragment>
        ))}
        <svg className="pointer-events-none absolute inset-0" width={geo.w} height={geo.h}>
          {Object.entries(sel).map(([i0, j]) => { const i = Number(i0), a = geo.l[i], b = geo.r[j]; if (!a || !b) return null; const c = toneL(i), mx = (a.x + b.x) / 2;
            return <path key={i} d={`M${a.x + 6},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x - 6},${b.y}`} stroke={c} strokeWidth="3" fill="none" strokeDasharray={bad.includes(i) ? '6 5' : undefined} />; })}
          {drag && (() => { const a = drag.side === 'l' ? geo.l[drag.i] : geo.r[drag.i]; return a ? <path d={`M${a.x},${a.y} L${drag.x},${drag.y}`} stroke={color} strokeWidth="3" strokeDasharray="4 4" fill="none" /> : null; })()}
        </svg>
      </div>
      {!solved && <div className="mt-2 flex items-center gap-3"><Btn size="sm" color={color} disabled={!all} onClick={check}>检查</Btn>{bad.length > 0 ? <span className="text-sm font-bold text-rose-700">有 {bad.length} 条线连错了（红色虚线），改一改。</span> : <span className="text-sm text-ink2">点左边一项，再点右边一项，就连上了；也可以直接拖过去。</span>}</div>}
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
