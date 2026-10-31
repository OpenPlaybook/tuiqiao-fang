// 播放式故事用的题：选项下面直接出反馈的选择题、选词填句、打字短答、碎片拼接、长文本（题标在文本上）。
// 其余题型（点出毛病、AI 误译、分类、连线、排序）沿用 steps.tsx。
import { useContext, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Lock } from 'lucide-react';
import type { ChoiceSub, FillSub, FragSub, Item, LongSub, Sub, TypeSub } from '../shared/types';
import { Art, Btn, GlossContext, LETTERS, Rich, shuffleIdx } from '../components/ui';
import { Viz, isViz } from '../components/viz';
import { logAnswer, useGame } from '../game/store';
import { sfx } from '../game/sound';
import { MatchView, MisView, OrderView, SortView, SpotView, WriteView, type StepProps } from './steps';

const triesScore = (t: number) => (t <= 1 ? 1 : t === 2 ? 0.67 : 0.34);
const Q = ({ text }: { text: string }) => <div className="mb-3 text-[17px] font-black"><Rich text={text} /></div>;
const Why = ({ tone, children }: { tone: 'ok' | 'no' | 'mute'; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`mx-1 mb-1 rounded-b-xl px-3 pb-2 pt-1.5 text-[15px] leading-relaxed ${tone === 'ok' ? 'bg-emerald-50 text-emerald-900' : tone === 'no' ? 'bg-rose-50 text-rose-900' : 'bg-[#F4EFE4] text-ink2'}`}>{children}</motion.div>
);

// ---------------- 选择：反馈写在选项下面 ----------------
export const ChoiceInline = ({ it, s, onDone, color, revealed }: StepProps<ChoiceSub> & { revealed?: boolean }) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const order = useMemo(() => (s.keep ? s.opts.map((_, i) => i) : shuffleIdx(s.opts.length, pid + it.id + s.key)), [pid, it.id, s.key]);
  const [pick, setPick] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [note, setNote] = useState('');
  const multi = !!s.multi, reveal = s.reveal ?? 'all';
  const toggle = (i: number) => { if (solved || wrong.includes(i)) return; sfx('click'); setPick((p) => (multi ? (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]) : [i])); };
  const submit = () => {
    if (!pick.length) return;
    const t = tries + 1; setTries(t);
    const right = multi ? pick.length === s.ok.length && pick.every((i) => s.ok.includes(i)) : s.ok.includes(pick[0]);
    logAnswer(it, { q: s.key, v: pick.map((i) => s.opts[i].t).join(' / '), ok: right }, [s.key, t]);
    if (right) { sfx('ok'); setSolved(true); setNote(''); onDone(triesScore(t)); return; }
    sfx('no');
    const bad = multi ? pick.filter((i) => !s.ok.includes(i)) : pick;
    setWrong((w) => [...w, ...bad]); setPick((p) => p.filter((i) => s.ok.includes(i)));
    if (multi) { const miss = s.ok.filter((i) => !pick.includes(i)).length; setNote(bad.length ? '' : `还少选了 ${miss} 个。`); }
    if (t >= 3) { setSolved(true); setPick(s.ok); setNote('答案已经标出来了。'); onDone(0.34); }
  };
  const showWhy = (i: number) => {
    const o = s.opts[i], isOk = s.ok.includes(i);
    if (wrong.includes(i)) return <Why tone="no"><Rich text={o.why} />{o.art && <OptArt a={o.art} />}</Why>;
    if (!solved) return null;
    if (isOk) return <Why tone="ok"><Rich text={o.why} />{o.art && <OptArt a={o.art} />}</Why>;
    if (reveal === 'all' || (reveal === 'ext' && revealed)) return <Why tone="mute"><Rich text={o.why} />{o.art && <OptArt a={o.art} />}</Why>;
    if (reveal === 'ext') return <Why tone="mute"><span className="flex items-center gap-1"><Lock size={14} />做完拓展，再来看这个选项</span></Why>;
    return null;
  };
  return (
    <div>
      <Q text={s.q} />
      <div className={`grid gap-2 ${s.cols === 1 || s.opts.some((o) => o.t.length > 16) ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {order.map((i, k) => {
          const o = s.opts[i], on = pick.includes(i), x = wrong.includes(i), good = solved && s.ok.includes(i);
          const py = s.py?.[o.t];
          return (
            <div key={i}>
              <button onClick={() => toggle(i)} disabled={solved || x}
                className={`flex w-full items-start gap-3 rounded-xl border-2 px-4 py-2.5 text-left text-[17px] leading-snug transition ${good ? 'border-emerald-400 bg-emerald-50' : x ? 'border-rose-200 bg-rose-50/60 text-ink2' : on ? 'bg-amber-50' : 'border-[#E6DCC6] bg-white hover:border-[#CDBE9E]'}`}
                style={on && !good ? { borderColor: color } : {}}>
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: good ? '#059669' : x ? '#E5A3A3' : on ? color : '#C9BEA7' }}>{multi ? (on || good ? '✓' : '') : LETTERS[k]}</span>
                <span className={`font-bold ${x ? 'line-through decoration-rose-300' : ''}`}>{py ? <ruby>{o.t}<rt>{py}</rt></ruby> : <Rich text={o.t} />}</span>
              </button>
              {showWhy(i)}
            </div>
          );
        })}
      </div>
      {note && <div className="mt-2 text-sm font-bold text-rose-700">{note}</div>}
      {!solved && <div className="mt-3"><Btn size="sm" color={color} disabled={!pick.length} onClick={submit}>确定</Btn>{multi && <span className="ml-3 text-sm text-ink2">（可以选好几个）</span>}</div>}
    </div>
  );
};
const OptArt = ({ a }: { a: NonNullable<ChoiceSub['opts'][number]['art']> }) => <div className="mt-2 max-w-[360px]">{isViz(a) ? <Viz spec={a} /> : <Art spec={a} className="aspect-[56/22] rounded-lg border border-[#E6DCC6]" />}</div>;

// ---------------- 选词填句 ----------------
export const FillView = ({ it, s, onDone, color }: StepProps<FillSub>) => {
  const [sel, setSel] = useState<string | null>(null);
  const [put, setPut] = useState<Record<number, string>>({});
  const [bad, setBad] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const place = (i: number) => { if (solved || !sel) return; sfx('click'); setPut((p) => ({ ...p, [i]: sel })); setBad((b) => b.filter((x) => x !== i)); setSel(null); };
  const all = s.sents.every((_, i) => put[i]);
  const check = () => {
    const t = tries + 1; setTries(t);
    const wrongs = s.sents.map((x, i) => (put[i] === x.a ? -1 : i)).filter((i) => i >= 0);
    logAnswer(it, { q: s.key, v: s.sents.map((_, i) => put[i]).join(' / '), ok: !wrongs.length }, [s.key, t]);
    if (!wrongs.length || t >= 3) { sfx(wrongs.length ? 'flip' : 'ok'); setSolved(true); setBad([]); setPut(Object.fromEntries(s.sents.map((x, i) => [i, x.a]))); onDone(wrongs.length ? 0.34 : triesScore(t)); return; }
    sfx('no'); setBad(wrongs);
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="mb-3 flex flex-wrap gap-2">{s.bank.map((w) => <button key={w} disabled={solved} onClick={() => { sfx('click'); setSel(sel === w ? null : w); }} className={`rounded-full border-2 px-3.5 py-1 font-black ${sel === w ? 'text-white' : 'border-[#E6DCC6] bg-white'}`} style={sel === w ? { background: color, borderColor: color } : {}}>{w}</button>)}</div>
      {!solved && <div className="mb-2 text-sm text-ink2">{sel ? `把“${sel}”放进哪一句？点那一句的空。` : '先点一个词，再点句子里的空。'}</div>}
      <div className="space-y-2">
        {s.sents.map((x, i) => {
          const parts = x.t.split(/_{3,}/);
          return (
            <div key={i} className={`rounded-xl border-2 bg-white px-4 py-2.5 ${bad.includes(i) ? 'border-rose-300' : solved ? 'border-emerald-200' : 'border-[#E6DCC6]'}`}>
              <div className="text-[17px] leading-relaxed"><Rich text={parts[0]} /><button onClick={() => place(i)} className={`mx-1 inline-block min-w-[4.5em] rounded-md border-b-[3px] px-2 text-center font-black ${put[i] ? '' : 'text-transparent'}`} style={{ borderColor: color, color: put[i] ? color : undefined }}>{put[i] ?? '＿＿'}</button><Rich text={parts[1] ?? ''} /></div>
              {bad.includes(i) && <div className="mt-1 text-sm text-rose-700">这一句再想想。</div>}
              {solved && <div className="mt-1 text-sm text-emerald-800">✓ <Rich text={x.why} /></div>}
            </div>
          );
        })}
      </div>
      {!solved && <div className="mt-3"><Btn size="sm" color={color} disabled={!all} onClick={check}>检查</Btn></div>}
    </div>
  );
};

// ---------------- 打字短答 ----------------
const norm = (t: string) => t.replace(/[\s，。、“”"'‘’！？!?.,；;：:（）()]/g, '');
export const TypeView = ({ it, s, onDone, color }: StepProps<TypeSub>) => {
  const [v, setV] = useState('');
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean | null; t: string } | null>(null);
  const [solved, setSolved] = useState(false);
  const check = () => {
    const x = norm(v); if (!x) return;
    const t = tries + 1; setTries(t);
    const ok = s.accept.some((a) => norm(a) === x);
    logAnswer(it, { q: s.key, v, ok }, [s.key, t]);
    if (ok) { sfx('ok'); setSolved(true); setMsg({ ok: true, t: s.why }); onDone(triesScore(t)); return; }
    sfx('no');
    const near = Object.entries(s.near ?? {}).find(([k]) => norm(k) === x)?.[1];
    if (t >= 3) { setSolved(true); setMsg({ ok: null, t: `答案是“${s.accept[0]}”。${s.why}` }); onDone(0.34); return; }
    setMsg({ ok: false, t: near ?? (t === 1 ? '不太对，再想想。' : `提示：第一个字是“${s.accept[0][0]}”。`) });
  };
  return (
    <div>
      <Q text={s.q} />
      {!solved && <div className="flex gap-2"><input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) check(); }} placeholder={s.ph} className="w-60 rounded-xl border-2 border-[#E6DCC6] bg-white px-3 py-2 text-lg font-bold outline-none focus:border-amber-400" /><Btn size="sm" color={color} disabled={!v.trim()} onClick={check}>确定</Btn></div>}
      {msg && <Why tone={msg.ok ? 'ok' : msg.ok === false ? 'no' : 'mute'}>{solved && msg.ok && <b className="mr-1">{v}　✓</b>}<Rich text={msg.t} /></Why>}
    </div>
  );
};

// ---------------- 碎片拼接（概括、鉴赏）：缺了哪一层就提醒补上，不点明“三步” ----------------
export const FragView = ({ it, s, onDone, color }: StepProps<FragSub>) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const order = useMemo(() => shuffleIdx(s.frags.length, pid + it.id + s.key), [pid]);
  const [chosen, setChosen] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean | null; t: React.ReactNode } | null>(null);
  const [solved, setSolved] = useState(false);
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
      setMsg({ ok: true, t: <>写得完整！{mi < fi && <span>（先说发生了什么、最后说意义，读起来会更顺。）</span>}<div className="mt-1 text-ink2">也可以这样写：{s.model}</div></> });
      onDone(triesScore(t)); return;
    }
    sfx('no');
    setMsg({ ok: false, t: <>{xs.map((i) => <div key={i}>✗ “{s.frags[i].t}”：{s.frags[i].why ?? '这一句不对。'}</div>)}{!xs.length && miss.length > 0 && <div>{s.need[miss[0]]}</div>}</> });
    if (t >= 4) { setSolved(true); setMsg({ ok: null, t: <>可以这样写：{s.model}</> }); onDone(0.34); }
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="min-h-[64px] rounded-xl border-2 border-dashed px-4 py-3 text-[17px] leading-relaxed" style={{ borderColor: color + '88' }}>
        {chosen.length ? chosen.map((i, k) => <button key={i} onClick={() => add(i)} disabled={solved} className="mr-1 rounded-md px-1 hover:bg-rose-50">{s.frags[i].t}{k === chosen.length - 1 ? '。' : '，'}</button>) : <span className="text-ink2">点下面的碎片，按顺序拼成一段话。点这里的句子可以拿掉。</span>}
      </div>
      {!solved && <div className="mt-3 flex flex-wrap gap-2">{order.filter((i) => !chosen.includes(i)).map((i) => <button key={i} onClick={() => add(i)} className="rounded-xl border-2 border-[#E6DCC6] bg-white px-3 py-1.5 text-left text-[15px] font-bold hover:border-amber-300">{s.frags[i].t}</button>)}</div>}
      {msg && <div className="mt-2"><Why tone={msg.ok ? 'ok' : msg.ok === false ? 'no' : 'mute'}>{msg.t}</Why></div>}
      {!solved && <div className="mt-3"><Btn size="sm" color={color} disabled={chosen.length < 2} onClick={check}>写好了</Btn></div>}
    </div>
  );
};

// ---------------- 长文本：题标在文本上，点哪个做哪个 ----------------
export const LongView = ({ it, s, onDone, color }: StepProps<LongSub>) => {
  const parent = useContext(GlossContext);
  const keys = Object.keys(s.qs);
  const [active, setActive] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, number>>({});
  const finishOne = (k: string, x: number) => {
    const d = { ...done, [k]: x }; setDone(d);
    setTimeout(() => setActive(keys.find((q) => d[q] === undefined) ?? null), 900);
    if (keys.every((q) => d[q] !== undefined)) onDone(keys.reduce((a, q) => a + d[q], 0) / keys.length);
  };
  const marker = (n: string) => (
    <button onClick={(e) => { e.stopPropagation(); sfx('click'); setActive(n); }} className={`mx-0.5 inline-flex h-6 w-6 -translate-y-1 items-center justify-center rounded-full align-middle text-xs font-black text-white ${active === n ? 'ring-4 ring-amber-300' : ''}`} style={{ background: done[n] !== undefined ? '#059669' : color }}>{done[n] !== undefined ? <Check size={14} /> : '?'}</button>
  );
  const sub = active ? s.qs[active] : null;
  return (
    <div>
      <Q text={s.q} />
      <GlossContext.Provider value={{ ...parent, marker }}>
        <div className="rounded-2xl border-2 border-[#D8C08A] bg-[#F7EFD9] px-5 py-4">
          {s.title && <div className="mb-1 text-sm font-black text-[#8A6A2F]">{s.title}</div>}
          <div className="kai text-[24px] leading-[2.1]"><Rich text={s.text} /></div>
        </div>
      </GlossContext.Provider>
      <div className="mt-2 text-sm text-ink2">已经做了 {Object.keys(done).length} / {keys.length} 个“？”</div>
      {sub && done[active!] === undefined && (
        <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl border-2 bg-white p-4" style={{ borderColor: color + '55' }}>
          {sub.kind === 'choice' ? <ChoiceInline it={it} s={sub} color={color} onDone={(x) => finishOne(active!, x)} /> : <TypeView it={it} s={sub} color={color} onDone={(x) => finishOne(active!, x)} />}
        </motion.div>
      )}
    </div>
  );
};

/** 播放式故事里一道题的一步 */
export const PlayStep = ({ it, s, color, onDone, revealed }: { it: Item; s: Sub; color: string; onDone: (x: number) => void; revealed?: boolean }) => {
  switch (s.kind) {
    case 'choice': return <ChoiceInline it={it} s={s} color={color} onDone={onDone} revealed={revealed} />;
    case 'fill': return <FillView it={it} s={s} color={color} onDone={onDone} />;
    case 'type': return <TypeView it={it} s={s} color={color} onDone={onDone} />;
    case 'frag': return <FragView it={it} s={s} color={color} onDone={onDone} />;
    case 'long': return <LongView it={it} s={s} color={color} onDone={onDone} />;
    case 'spot': return <SpotView it={it} s={s} color={color} onDone={onDone} renderFix={(fix, done) => <ChoiceInline it={it} s={fix} color={color} onDone={done} />} />;
    case 'mis': return <MisView it={it} s={s} color={color} onDone={onDone} />;
    case 'sort': return <SortView it={it} s={s} color={color} onDone={onDone} />;
    case 'match': return <MatchView it={it} s={s} color={color} onDone={onDone} />;
    case 'order': return <OrderView it={it} s={s} color={color} onDone={onDone} />;
    case 'write': return <WriteView it={it} s={s} color={color} onDone={onDone} />;
  }
};
