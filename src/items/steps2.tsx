// 播放式故事用的题：都在画面里做，所以要紧凑。
// 选项下面直接出反馈的选择题、选词填句、打字短答、碎片拼接；长文本、点出毛病、改错直接在画面里的卡片上做（点那个词，弹出贴着它的小窗）。
// 每一步做完把“最后的样子”存进记录（data.ans），回来看到的就是自己做过的答案；拓展的步骤用 SaveCtx 加前缀，免得和正题撞名。
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { motion } from 'motion/react';
import { Check, Lock, X } from 'lucide-react';
import type { ChoiceSub, FillSub, FragSub, Item, LongSub, MisSub, SpotSub, Sub, TeachSub, TypeSub } from '../shared/types';
import { Art, Btn, GlossContext, LETTERS, Rich, shuffleIdx } from '../components/ui';
import { Viz, isViz } from '../components/viz';
import { getState, logAnswer, setData, useGame } from '../game/store';
import { sfx } from '../game/sound';
import { MatchView, OrderView, SortView, WriteView } from './steps';

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

// ---------------- 选择：反馈写在选项下面 ----------------
type ChoiceSaved = { sc: number; wrong: number[]; pick: number[] };
export const ChoiceInline = ({ it, s, onDone, color, revealed, compact }: StepProps<ChoiceSub> & { revealed?: boolean; compact?: boolean }) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const [sv, save] = useSaved<ChoiceSaved>(it, s.key);
  const order = useMemo(() => (s.keep ? s.opts.map((_, i) => i) : shuffleIdx(s.opts.length, pid + it.id + s.key)), [pid, it.id, s.key]);
  const [pick, setPick] = useState<number[]>(sv?.pick ?? []);
  const [wrong, setWrong] = useState<number[]>(sv?.wrong ?? []);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(!!sv);
  const [note, setNote] = useState('');
  const multi = !!s.multi, reveal = s.reveal ?? 'all';
  const toggle = (i: number) => { if (solved || wrong.includes(i)) return; sfx('click'); setPick((p) => (multi ? (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]) : [i])); };
  const finish = (sc: number, w: number[], p: number[]) => { setSolved(true); save({ sc, wrong: w, pick: p }); onDone(sc); };
  const submit = () => {
    if (!pick.length) return;
    const t = tries + 1; setTries(t);
    const right = multi ? pick.length === s.ok.length && pick.every((i) => s.ok.includes(i)) : s.ok.includes(pick[0]);
    logAnswer(it, { q: s.key, v: pick.map((i) => plain(s.opts[i].t)).join(' / '), ok: right }, [s.key, t]);
    if (right) { sfx('ok'); setNote(''); finish(triesScore(t), wrong, pick); return; }
    sfx('no');
    const bad = multi ? pick.filter((i) => !s.ok.includes(i)) : pick;
    const w = [...wrong, ...bad];
    setWrong(w); setPick((p) => p.filter((i) => s.ok.includes(i)));
    if (multi) { const miss = s.ok.filter((i) => !pick.includes(i)).length; setNote(bad.length ? '' : `还少选了 ${miss} 个。`); }
    if (t >= 3) { setPick(s.ok); setNote('答案已经标出来了。'); finish(0.34, w, s.ok); }
  };
  const showWhy = (i: number) => {
    const o = s.opts[i], isOk = s.ok.includes(i);
    const body = <><Rich text={o.why} />{o.art && <OptArt a={o.art} />}</>;
    if (wrong.includes(i)) return <Why tone="no">{body}</Why>;
    if (!solved) return null;
    if (isOk) return <Why tone="ok">{body}</Why>;
    if (reveal === 'all' || (reveal === 'ext' && revealed)) return <Why tone="mute">{body}</Why>;
    if (reveal === 'ext') return <Why tone="mute"><span className="flex items-center gap-1"><Lock size={13} />做完拓展再看</span></Why>;
    return null;
  };
  const maxLen = Math.max(...s.opts.map((o) => plain(o.t).length));
  const hasArt = s.opts.some((o) => o.art);
  const cols = s.cols ?? (compact ? (maxLen <= 8 ? 2 : 1) : maxLen <= 5 && s.opts.length <= 5 && !hasArt ? s.opts.length : maxLen <= 15 ? 2 : 1);
  return (
    <div>
      <Q text={s.q} />
      <div className="grid items-start gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {order.map((i, k) => {
          const o = s.opts[i], on = pick.includes(i), x = wrong.includes(i), good = solved && s.ok.includes(i);
          const py = s.py?.[o.t];
          return (
            <div key={i}>
              <button onClick={() => toggle(i)} disabled={solved || x}
                className={`flex w-full items-start gap-2 rounded-lg border-2 px-2.5 py-1.5 text-left leading-snug transition ${compact ? 'text-[15px]' : 'text-[16px]'} ${good ? 'border-emerald-400 bg-emerald-50' : x ? 'border-rose-200 bg-rose-50/70 text-ink2' : on ? 'bg-amber-50' : 'border-[#E6DCC6] bg-white hover:border-[#CDBE9E]'}`}
                style={on && !good ? { borderColor: color } : {}}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: good ? '#059669' : x ? '#E5A3A3' : on ? color : '#C9BEA7' }}>{multi ? (on || good ? '✓' : '') : LETTERS[k]}</span>
                <span className={`font-bold ${x ? 'line-through decoration-rose-300' : ''}`}>{py ? <ruby>{o.t}<rt>{py}</rt></ruby> : <Rich text={o.t} />}</span>
              </button>
              {showWhy(i)}
            </div>
          );
        })}
      </div>
      {note && <div className="mt-1.5 text-sm font-bold text-rose-700">{note}</div>}
      {!solved && <div className="mt-2 flex items-center gap-3"><Btn size="sm" color={color} disabled={!pick.length} onClick={submit}>确定</Btn>{multi && <span className="text-sm text-ink2">（可以选好几个）</span>}</div>}
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

// ---------------- 碎片拼接（概括、鉴赏）：缺了哪一层就提醒补上，不点明“三步” ----------------
type FragSaved = { sc: number; chosen: number[]; ok: boolean };
export const FragView = ({ it, s, onDone, color }: StepProps<FragSub>) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const [sv, save] = useSaved<FragSaved>(it, s.key);
  const order = useMemo(() => shuffleIdx(s.frags.length, pid + it.id + s.key), [pid]);
  const [chosen, setChosen] = useState<number[]>(sv?.chosen ?? []);
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean | null; t: React.ReactNode } | null>(sv ? { ok: sv.ok ? true : null, t: <>{sv.ok ? '写得完整！' : ''}<div className="text-ink2">也可以这样写：{s.model}</div></> } : null);
  const [solved, setSolved] = useState(!!sv);
  const add = (i: number) => { if (solved) return; sfx('click'); setChosen((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i])); setMsg(null); };
  const check = () => {
    const t = tries + 1; setTries(t);
    const tags = chosen.map((i) => s.frags[i].tag);
    const xs = chosen.filter((i) => s.frags[i].tag === 'x');
    const miss = (['f', 't', 'm'] as const).filter((g) => !tags.includes(g));
    const ok = !xs.length && !miss.length;
    logAnswer(it, { q: s.key, v: chosen.map((i) => s.frags[i].t).join('｜'), ok }, [s.key, t]);
    if (ok) {
      sfx('ok'); setSolved(true);
      const fi = tags.indexOf('f'), mi = tags.lastIndexOf('m');
      setMsg({ ok: true, t: <>写得完整！{mi < fi && <span>（先说发生了什么、最后说意义，读起来会更顺。）</span>}<div className="text-ink2">也可以这样写：{s.model}</div></> });
      save({ sc: triesScore(t), chosen, ok: true }); onDone(triesScore(t)); return;
    }
    sfx('no');
    setMsg({ ok: false, t: <>{xs.map((i) => <div key={i}>✗ “{s.frags[i].t}”：{s.frags[i].why ?? '这一句不对。'}</div>)}{!xs.length && miss.length > 0 && <div>{s.need[miss[0]]}</div>}</> });
    if (t >= 4) { setSolved(true); setMsg({ ok: null, t: <>可以这样写：{s.model}</> }); save({ sc: 0.34, chosen, ok: false }); onDone(0.34); }
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="min-h-[52px] rounded-lg border-2 border-dashed bg-white/70 px-3 py-2 text-[16px] leading-relaxed" style={{ borderColor: color + '88' }}>
        {chosen.length ? chosen.map((i, k) => <button key={i} onClick={() => add(i)} disabled={solved} className="mr-0.5 rounded px-0.5 text-left hover:bg-rose-50">{s.frags[i].t}{k === chosen.length - 1 ? '。' : '，'}</button>) : <span className="text-ink2">点下面的碎片，按顺序拼起来；点这里的句子可以拿掉。</span>}
      </div>
      {!solved && <div className="mt-2 flex flex-wrap gap-1.5">{order.filter((i) => !chosen.includes(i)).map((i) => <button key={i} onClick={() => add(i)} className="rounded-lg border-2 border-[#E6DCC6] bg-white px-2.5 py-1 text-left text-[14px] font-bold hover:border-amber-300">{s.frags[i].t}</button>)}</div>}
      {msg && <div className="mt-1.5"><Why tone={msg.ok ? 'ok' : msg.ok === false ? 'no' : 'mute'}>{msg.t}</Why></div>}
      {!solved && <div className="mt-2"><Btn size="sm" color={color} disabled={chosen.length < 2} onClick={check}>写好了</Btn></div>}
    </div>
  );
};

// ---------------- 画面里的卡片：长文本、点出毛病、改错都在卡片上做 ----------------
/** 贴着某个词的小弹窗：位置相对卡片 */
const usePop = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const at = (el: HTMLElement) => {
    const rs = el.getClientRects(), r = rs[rs.length - 1] ?? el.getBoundingClientRect(), b = wrap.current!.getBoundingClientRect();
    setPos({ x: r.left - b.left + r.width / 2, y: r.bottom - b.top });
  };
  return { wrap, at, pos, setPos };
};
const Pop = ({ pos, wrap, children, onClose, w = 400 }: { pos: { x: number; y: number } | null; wrap: React.RefObject<HTMLDivElement | null>; children: React.ReactNode; onClose: () => void; w?: number }) => {
  if (!pos) return null;
  const W = wrap.current?.clientWidth ?? 800, width = Math.min(w, W - 16);
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="absolute z-30 rounded-xl bg-white p-3 text-left font-sans text-[15px] shadow-2xl ring-2 ring-amber-200" style={{ width, left: Math.max(8, Math.min(W - width - 8, pos.x - width / 2)), top: pos.y + 8 }}>
      <button onClick={onClose} className="absolute right-1.5 top-1.5 rounded-full p-1 text-ink2 hover:bg-black/5" aria-label="关上"><X size={15} /></button>
      {children}
    </motion.div>
  );
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
  const reported = useRef(!!ans[pre + s.key]);
  const { wrap, at, pos, setPos } = usePop();
  const finishOne = (k: string, x: number) => {
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
    <div ref={wrap} className="relative" onClick={() => { setActive(null); setPos(null); }}>
      <div className="mb-1 flex items-center font-sans text-xs font-black text-[#8A6A2F]">{s.title}<Badge color={left ? color : '#059669'}>{left ? s.q || `画线的地方各有一问，点一点（还剩 ${left} 个）` : '都做完了 ✓'}</Badge></div>
      <GlossContext.Provider value={{ ...parent, marker }}>
        <div className="kai text-[22px] leading-[2.15]"><Rich text={s.text} /></div>
      </GlossContext.Provider>
      {sub && active && (
        <Pop pos={pos} wrap={wrap} onClose={() => { setActive(null); setPos(null); }} w={440}>
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
  const { wrap, at, pos, setPos } = usePop();
  const [popOpen, setPopOpen] = useState(false);
  const segEls = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => { if (found !== null && segEls.current[found]) at(segEls.current[found]!); }, []);
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
    <div ref={wrap} className="relative" onClick={() => { setPopOpen(false); setPos(null); }}>
      <div className="text-[22px] leading-[2.1]">
        {s.segs.map((g, i) => (
          <span key={i}><span ref={(el) => { segEls.current[i] = el; }} onClick={(e) => { e.stopPropagation(); click(i, e.currentTarget); }} className={`seg ${found === null && !missed.includes(i) ? 'seg-click' : ''} ${found !== null && s.bad.includes(i) ? 'cursor-pointer bg-rose-100 text-rose-800 underline decoration-rose-500 decoration-wavy underline-offset-8' : missed.includes(i) ? 'text-ink2/60' : ''}`}>{g}</span>{latin && i < s.segs.length - 1 ? ' ' : ''}</span>
        ))}
        <Badge color={found !== null && (!s.fix || fixSaved) ? '#059669' : color}>{found !== null && (!s.fix || fixSaved) ? '改好了 ✓' : found !== null ? '找到了，选怎么改' : s.q}</Badge>
      </div>
      {msg && <Note tone={msg.ok ? 'ok' : msg.ok === false ? 'no' : 'mute'}>{msg.t}</Note>}
      {s.fix && found !== null && popOpen && (
        <Pop pos={pos} wrap={wrap} onClose={() => setPopOpen(false)}>
          <SaveCtx.Provider value={pre + s.key + '.'}>
            <ChoiceInline it={it} s={s.fix} color={color} compact onDone={(x) => { const sc = (sp + x) / 2; save({ sc, missed, at: found, sp }); onDone(sc); }} />
          </SaveCtx.Provider>
        </Pop>
      )}
      {s.fix && found !== null && !popOpen && <div className="mt-1 font-sans text-[13px] text-ink2">点画波浪线的地方，{fixSaved ? '看看怎么改的' : '选怎么改'}。</div>}
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
  const { wrap, at, pos, setPos } = usePop();
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
    const f = [...fixed, word]; setFixed(f); setMsg(null);
    if (f.length === groups.length) { const sc = Math.max(0.34, 1 - penalty); save({ sc, fixed: f }); onDone(sc); }
  };
  const giveUp = () => { setFixed(groups); setOpen(null); setPos(null); setMsg({ ok: null, t: '错处都标出来了，点一点，看看每一处为什么错。' }); save({ sc: 0.34, fixed: groups, gave: true }); onDone(0.34); };
  const ob = open ? s.segs.find((g) => g.bad?.word === open)!.bad! : null;
  return (
    <div ref={wrap} className="relative" onClick={() => { setOpen(null); setPos(null); }}>
      <div className="text-[20px] leading-[2.05]">
        {s.segs.map((g, i) => {
          const isFixed = g.bad && fixed.includes(g.bad.word);
          return (
            <span key={i} onClick={(e) => { e.stopPropagation(); click(i, e.currentTarget); }} className={`seg ${!done && !isFixed ? 'seg-click' : ''} ${isFixed ? 'cursor-pointer bg-emerald-100' : okClicked.includes(i) ? 'text-ink2/70' : open && g.bad?.word === open ? 'bg-amber-200' : ''}`}>
              {isFixed ? (g.bad!.fixed ? <b className="text-emerald-800">{g.bad!.fixed}</b> : <><s className="text-rose-500/80">{g.t}</s> <b className="text-emerald-800">{g.bad!.opts[g.bad!.ok]}</b></>) : g.t}
            </span>
          );
        })}
        <Badge color={done ? '#059669' : color}>{done ? '都改好了 ✓' : `${s.q}（还剩 ${groups.length - fixed.length} 处）`}</Badge>
      </div>
      {msg && <Note tone={msg.ok ? 'ok' : msg.ok === false ? 'no' : 'mute'}>{msg.t}</Note>}
      {!done && fixed.length < groups.length && <div className="mt-1 text-right font-sans text-[13px]"><button onClick={(e) => { e.stopPropagation(); giveUp(); }} className="text-ink2 underline">我找不到了，告诉我</button></div>}
      {ob && open && (
        <Pop pos={pos} wrap={wrap} onClose={() => { setOpen(null); setPos(null); }} w={380}>
          {fixed.includes(open) ? (
            <div className="pr-5"><b className="text-emerald-800">{ob.fixed ?? ob.opts[ob.ok]}</b><div className="mt-1 leading-relaxed"><Rich text={ob.why} /></div></div>
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

// ---------------- 讲：老师讲一段 ----------------
export const TeachView = ({ s, color, onDone, done }: { s: TeachSub; color: string; onDone: () => void; done: boolean }) => (
  <div className="rounded-xl border-l-4 bg-[#FBF6EA] px-4 py-3" style={{ borderColor: color }}>
    {s.q && <div className="mb-1 text-[17px] font-black">{s.q}</div>}
    <div className="text-[16px] leading-[1.9]"><Rich text={s.t} /></div>
    {s.art && <div className="mx-auto mt-2 max-w-[560px]">{isViz(s.art) ? <Viz spec={s.art} /> : <Art spec={s.art} className="aspect-[56/22] rounded-lg" />}</div>}
    {s.ex && <div className="mt-2 space-y-1 border-t border-dashed border-[#E2D5B8] pt-2">{s.ex.map((e, i) => <div key={i} className="text-[16px] leading-relaxed"><Rich text={e} /></div>)}</div>}
    {!done && <div className="mt-2 text-right"><button onClick={() => { sfx('click'); onDone(); }} className="rounded-full px-4 py-1 text-sm font-black text-white" style={{ background: color }}>接着 ›</button></div>}
  </div>
);

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
    case 'sort': return <SortView it={it} s={s} color={color} onDone={keep} init={!!sv} />;
    case 'match': return <MatchView it={it} s={s} color={color} onDone={keep} init={!!sv} />;
    case 'order': return <OrderView it={it} s={s} color={color} onDone={keep} />;
    case 'write': return <WriteView it={it} s={s} color={color} onDone={onDone} />;
    case 'teach': return null;
  }
};
/** 题在画面里怎么摆：卡片上做 / 下方小弹层 / 大弹层 */
export const layoutOf = (s: Sub | undefined): 'card' | 'panel' | 'big' => (!s ? 'panel' : ['mis', 'spot', 'long'].includes(s.kind) ? 'card' : ['frag', 'match', 'sort', 'fill', 'order'].includes(s.kind) ? 'big' : 'panel');
