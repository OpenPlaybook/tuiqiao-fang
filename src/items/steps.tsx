// 各种小步骤的界面：选择、点出毛病、分类、连线、排序、AI 误译、自己写。
// 每一步做完调用 onDone(得分 0—1)。
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUp, Check, Loader2, Sparkles, X } from 'lucide-react';
import type { ChoiceSub, Item, MatchSub, MisSub, OrderSub, SortSub, SpotSub, WriteSub } from '../shared/types';
import type { EnJudge, ZhJudge } from '../shared/ai';
import { MAX_TRIES } from '../shared/ai';
import { Art, Btn, LETTERS, Rich, isEnter, shuffleIdx } from '../components/ui';
import { addBonus, getState, logAnswer, setAiLeft, toast, useGame } from '../game/store';
import { api } from '../game/api';
import { sfx } from '../game/sound';
import { DEMO } from '../game/demo';

export interface StepProps<S> { it: Item; s: S; onDone: (score: number) => void; color: string }
const triesScore = (t: number) => (t <= 1 ? 1 : t === 2 ? 0.67 : 0.34);

export const Msg = ({ ok, children }: { ok: boolean | null; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0, x: ok === false ? [0, -6, 6, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}
    className={`mt-3 rounded-2xl border-2 px-4 py-3 leading-relaxed ${ok === true ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : ok === false ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>{children}</motion.div>
);
const Q = ({ text }: { text: string }) => <div className="mb-3 text-lg font-black"><Rich text={text} /></div>;

// ---------------- 选择 ----------------
export const ChoiceView = ({ it, s, onDone, color }: StepProps<ChoiceSub>) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const order = useMemo(() => (s.keep || s.master ? s.opts.map((_, i) => i) : shuffleIdx(s.opts.length, pid + it.id + s.key)), [pid, it.id, s.key]);
  const [pick, setPick] = useState<number[]>([]);
  const [crossed, setCrossed] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean | null; text: React.ReactNode } | null>(null);
  const multi = !!s.multi;
  const toggle = (i: number) => { if (solved || crossed.includes(i)) return; sfx('click'); setPick((p) => (multi ? (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]) : [i])); };
  const finish = (score: number) => { setSolved(true); onDone(score); };
  const submit = () => {
    if (!pick.length) return;
    const t = tries + 1; setTries(t);
    const v = pick.map((i) => s.opts[i].t).join(' / ');
    if (s.master) {
      const i = pick[0], ok = s.ok.includes(i), fine = s.fine?.includes(i);
      const tt = ok ? 1 : fine ? 2 : 3;
      logAnswer(it, { q: s.key, v, ok }, [s.key, tt]);
      sfx(ok ? 'ok' : 'flip');
      setMsg({ ok: ok ? true : null, text: ok ? <><b>你和原作想到一起了！</b> {s.opts[i].why}</> : <><b>{fine ? '说得过去，不过原作不是它。' : '原作不是它。'}</b> {s.opts[i].why}<div className="mt-2"><b>原作：</b>{s.opts[s.ok[0]].t}——{s.opts[s.ok[0]].why}</div></> });
      return finish(triesScore(tt));
    }
    const right = multi ? pick.length === s.ok.length && pick.every((i) => s.ok.includes(i)) : s.ok.includes(pick[0]);
    logAnswer(it, { q: s.key, v, ok: right }, [s.key, t]);
    if (right) { sfx('ok'); setMsg({ ok: true, text: multi ? '全对！' : s.opts[pick[0]].why }); return finish(triesScore(t)); }
    sfx('no');
    if (multi) {
      const wrongPicked = pick.filter((i) => !s.ok.includes(i)), missing = s.ok.filter((i) => !pick.includes(i)).length;
      setMsg({ ok: false, text: <>{wrongPicked.map((i) => <div key={i}>✗ <b>{s.opts[i].t}</b>：{s.opts[i].why}</div>)}{missing > 0 && <div>还少选了 {missing} 个。</div>}</> });
      setCrossed((c) => [...c, ...wrongPicked]); setPick((p) => p.filter((i) => s.ok.includes(i)));
    } else {
      setMsg({ ok: false, text: <><b>{s.opts[pick[0]].t}</b>：{s.opts[pick[0]].why}<div className="mt-1 text-sm opacity-80">再想想，选一个别的。</div></> });
      setCrossed((c) => [...c, pick[0]]); setPick([]);
    }
    if (t >= 3) {
      setMsg({ ok: null, text: <>答案是：<b>{s.ok.map((i) => s.opts[i].t).join('、')}</b>。{s.ok.length === 1 ? s.opts[s.ok[0]].why : ''}</> });
      setPick(s.ok); finish(0.34);
    }
  };
  const showAll = solved;
  const arts = s.opts.filter((o) => o.art);
  return (
    <div>
      <Q text={s.q} />
      <div className={`grid gap-2.5 ${s.cols === 1 || s.opts.some((o) => o.t.length > 18) ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {order.map((i, k) => {
          const o = s.opts[i], on = pick.includes(i), x = crossed.includes(i), good = showAll && s.ok.includes(i);
          return (
            <motion.button key={i} whileHover={!solved && !x ? { y: -2 } : {}} onClick={() => toggle(i)} disabled={solved || x}
              className={`flex items-start gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[17px] leading-snug transition ${good ? 'border-emerald-400 bg-emerald-50' : x ? 'border-rose-100 bg-rose-50/60 text-ink2 line-through opacity-70' : on ? 'bg-amber-50' : 'border-[#E6DCC6] bg-white hover:border-[#CDBE9E]'}`}
              style={on && !good ? { borderColor: color } : {}}>
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: good ? '#059669' : x ? '#E5A3A3' : on ? color : '#C9BEA7' }}>{multi ? (on || good ? '✓' : '') : LETTERS[k]}</span>
              <span className={`font-bold ${/[a-zA-Z]{3}/.test(o.t) ? '' : ''}`}>{o.t}</span>
            </motion.button>
          );
        })}
      </div>
      {!solved && <div className="mt-4"><Btn color={color} disabled={!pick.length} onClick={submit}>{s.master ? '就选它，揭晓原作' : '提交'}</Btn>{multi && <span className="ml-3 text-sm text-ink2">（可以选好几个）</span>}</div>}
      {msg && <Msg ok={msg.ok}>{msg.text}</Msg>}
      {showAll && (s.master || s.opts.length > 2) && (
        <details className="mt-3 rounded-2xl border-2 border-[#E6DCC6] bg-white/70 px-4 py-2" open={s.master}>
          <summary className="cursor-pointer font-black text-ink2">每个选项为什么对、为什么不对</summary>
          <div className="mt-2 space-y-1.5 text-[15px] leading-relaxed">{s.opts.map((o, i) => <div key={i}><b className={s.ok.includes(i) ? 'text-emerald-700' : ''}>{s.ok.includes(i) ? '✓' : '·'} {o.t}</b>：{o.why}</div>)}</div>
        </details>
      )}
      {showAll && arts.length > 1 && (
        <div className="mt-4">
          <div className="mb-2 font-black">换一个词，画面就变了</div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{s.opts.map((o, i) => o.art && <div key={i} className={`overflow-hidden rounded-xl border-2 bg-white ${s.ok.includes(i) ? 'border-emerald-400' : 'border-[#E6DCC6]'}`}><Art spec={o.art} className="aspect-[16/10]" /><div className="px-2 py-1 text-sm font-bold">{o.t}</div></div>)}</div>
        </div>
      )}
    </div>
  );
};

// ---------------- 点出毛病 ----------------
export const SpotView = ({ it, s, onDone, color }: StepProps<SpotSub>) => {
  const [tries, setTries] = useState(0);
  const [found, setFound] = useState(false);
  const [missed, setMissed] = useState<number[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean | null; text: string } | null>(null);
  const [spotScore, setSpotScore] = useState(1);
  const latin = s.segs.some((g) => /[a-zA-Z]{2}/.test(g)); // 英语句子：段和段之间要有空格
  const click = (i: number) => {
    if (found || missed.includes(i)) return;
    const t = tries + 1; setTries(t);
    const ok = s.bad.includes(i);
    logAnswer(it, { q: s.key, v: s.segs[i], ok }, [s.key, t]);
    if (ok) { sfx('ok'); setFound(true); setSpotScore(triesScore(t)); setMsg({ ok: true, text: '找到了！毛病就在这里。' }); if (!s.fix) onDone(triesScore(t)); return; }
    sfx('no'); setMissed((m) => [...m, i]); setMsg({ ok: false, text: s.miss?.[i] ?? '这里没有问题，再找找。' });
    if (t >= 3) { setFound(true); setSpotScore(0.34); setMsg({ ok: null, text: '毛病在标出来的地方。' }); if (!s.fix) onDone(0.34); }
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="rounded-2xl border-2 border-[#E6DCC6] bg-white px-5 py-4 text-2xl leading-[2.2]">
        {s.segs.map((g, i) => (
          <span key={i}><span onClick={() => click(i)} className={`seg ${!found && !missed.includes(i) ? 'seg-click' : ''} ${found && s.bad.includes(i) ? 'bg-rose-100 text-rose-800 underline decoration-rose-500 decoration-wavy underline-offset-8' : missed.includes(i) ? 'text-ink2/60' : ''}`}>{g}</span>{latin && i < s.segs.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
      {msg && <Msg ok={msg.ok}>{msg.text}</Msg>}
      {found && s.fix && <div className="mt-5"><ChoiceView it={it} s={s.fix} color={color} onDone={(x) => onDone((spotScore + x) / 2)} /></div>}
    </div>
  );
};

// ---------------- 分类 ----------------
export const SortView = ({ it, s, onDone, color }: StepProps<SortSub>) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const order = useMemo(() => shuffleIdx(s.cards.length, pid + it.id + s.key), [pid]);
  const [put, setPut] = useState<Record<number, number>>({});
  const [bad, setBad] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const all = Object.keys(put).length === s.cards.length;
  const check = () => {
    const t = tries + 1; setTries(t);
    const wrong = s.cards.map((c, i) => (put[i] === c.bin ? -1 : i)).filter((i) => i >= 0);
    logAnswer(it, { q: s.key, v: s.cards.map((c, i) => `${c.t}→${s.bins[put[i]]}`).join('；'), ok: wrong.length === 0 }, [s.key, t]);
    if (!wrong.length || t >= 3) { sfx(wrong.length ? 'flip' : 'ok'); setSolved(true); setBad([]); setPut(Object.fromEntries(s.cards.map((c, i) => [i, c.bin]))); onDone(wrong.length ? 0.34 : triesScore(t)); return; }
    sfx('no'); setBad(wrong);
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="space-y-2">
        {order.map((i) => {
          const c = s.cards[i];
          return (
            <div key={i} className={`rounded-2xl border-2 bg-white px-4 py-2.5 ${bad.includes(i) ? 'border-rose-300' : solved ? 'border-emerald-200' : 'border-[#E6DCC6]'}`}>
              <div className="text-[17px] font-bold">{c.t}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {s.bins.map((b, j) => <button key={j} disabled={solved} onClick={() => { sfx('click'); setPut((p) => ({ ...p, [i]: j })); setBad((x) => x.filter((y) => y !== i)); }} className={`rounded-full border-2 px-3 py-1 text-sm font-black ${put[i] === j ? 'text-white' : 'border-[#E6DCC6] bg-[#FBF7EE] text-ink2'}`} style={put[i] === j ? { background: color, borderColor: color } : {}}>{b}</button>)}
              </div>
              {(solved || bad.includes(i)) && <div className={`mt-1.5 text-sm ${bad.includes(i) ? 'text-rose-700' : 'text-emerald-800'}`}>{bad.includes(i) ? '✗ 放错了。' : '✓ '}{solved ? c.why : ''}</div>}
            </div>
          );
        })}
      </div>
      {!solved && <div className="mt-4"><Btn color={color} disabled={!all} onClick={check}>检查</Btn>{bad.length > 0 && <span className="ml-3 font-bold text-rose-700">有 {bad.length} 句放错了，再改改。</span>}</div>}
    </div>
  );
};

// ---------------- 连线（每一行选一个） ----------------
export const MatchView = ({ it, s, onDone, color }: StepProps<MatchSub>) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const rorder = useMemo(() => shuffleIdx(s.right.length, pid + it.id + s.key + 'r'), [pid]);
  const [sel, setSel] = useState<Record<number, number>>({});
  const [bad, setBad] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const all = Object.keys(sel).length === s.left.length;
  const check = () => {
    const t = tries + 1; setTries(t);
    const wrong = s.left.map((_, i) => (sel[i] === s.pairs[i] ? -1 : i)).filter((i) => i >= 0);
    logAnswer(it, { q: s.key, v: s.left.map((l, i) => `${l}→${s.right[sel[i]]}`).join('；'), ok: !wrong.length }, [s.key, t]);
    if (!wrong.length || t >= 3) { sfx(wrong.length ? 'flip' : 'ok'); setSolved(true); setBad([]); setSel(Object.fromEntries(s.pairs.map((p, i) => [i, p]))); onDone(wrong.length ? 0.34 : triesScore(t)); return; }
    sfx('no'); setBad(wrong);
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1.4fr] gap-3 px-1 text-sm font-black text-ink2"><div>{s.lh ?? ''}</div><div>{s.rh ?? ''}</div></div>
        {s.left.map((l, i) => (
          <div key={i} className={`grid grid-cols-[1fr_1.4fr] items-center gap-3 rounded-2xl border-2 bg-white px-4 py-2.5 ${bad.includes(i) ? 'border-rose-300' : solved ? 'border-emerald-200' : 'border-[#E6DCC6]'}`}>
            <div className="text-[17px] font-black">{l}</div>
            <div className="flex flex-wrap gap-1.5">
              {rorder.map((j) => <button key={j} disabled={solved} onClick={() => { sfx('click'); setSel((p) => ({ ...p, [i]: j })); setBad((x) => x.filter((y) => y !== i)); }} className={`rounded-xl border-2 px-2.5 py-1 text-left text-sm font-bold ${sel[i] === j ? 'text-white' : 'border-[#E6DCC6] bg-[#FBF7EE] text-ink'}`} style={sel[i] === j ? { background: color, borderColor: color } : {}}>{s.right[j]}</button>)}
            </div>
          </div>
        ))}
      </div>
      {!solved && <div className="mt-4"><Btn color={color} disabled={!all} onClick={check}>检查</Btn>{bad.length > 0 && <span className="ml-3 font-bold text-rose-700">有 {bad.length} 行不对，再改改。</span>}</div>}
      {solved && <Msg ok={true}>{s.why}</Msg>}
    </div>
  );
};

// ---------------- 排序 ----------------
export const OrderView = ({ it, s, onDone, color }: StepProps<OrderSub>) => {
  const pid = useGame((g) => g.player?.pid ?? '');
  const init = useMemo(() => { let o = shuffleIdx(s.items.length, pid + it.id + s.key); if (o.every((x, i) => x === i)) o = o.reverse(); return o; }, [pid]);
  const [ord, setOrd] = useState<number[]>(init);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [checked, setChecked] = useState(false);
  const mv = (k: number, d: number) => { const j = k + d; if (j < 0 || j >= ord.length) return; sfx('click'); const o = [...ord]; [o[k], o[j]] = [o[j], o[k]]; setOrd(o); setChecked(false); };
  const check = () => {
    const t = tries + 1; setTries(t); setChecked(true);
    const ok = ord.every((x, i) => x === i);
    logAnswer(it, { q: s.key, v: ord.map((i) => s.items[i]).join(' → '), ok }, [s.key, t]);
    if (ok || t >= 3) { sfx(ok ? 'ok' : 'flip'); setSolved(true); setOrd(s.items.map((_, i) => i)); onDone(ok ? triesScore(t) : 0.34); } else sfx('no');
  };
  return (
    <div>
      <Q text={s.q} />
      <div className="space-y-2">
        {ord.map((x, k) => (
          <motion.div layout key={x} className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-2.5 ${checked && !solved ? (x === k ? 'border-emerald-300' : 'border-rose-300') : solved ? 'border-emerald-200' : 'border-[#E6DCC6]'}`}>
            <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: color }}>{k + 1}</span>
            <span className="flex-1 text-[17px] font-bold">{s.items[x]}</span>
            {solved && s.tags && <span className="rounded-full bg-amber-100 px-3 py-0.5 text-sm font-black text-amber-800">{s.tags[x]}</span>}
            {!solved && <><button onClick={() => mv(k, -1)} className="rounded-lg p-1 hover:bg-black/5"><ArrowUp size={20} /></button><button onClick={() => mv(k, 1)} className="rounded-lg p-1 hover:bg-black/5"><ArrowDown size={20} /></button></>}
          </motion.div>
        ))}
      </div>
      {!solved && <div className="mt-4"><Btn color={color} onClick={check}>检查</Btn>{checked && <span className="ml-3 font-bold text-rose-700">红框的位置不对，再调一调。</span>}</div>}
      {solved && <Msg ok={true}>{s.why}</Msg>}
    </div>
  );
};

// ---------------- AI 误译 ----------------
export const MisView = ({ it, s, onDone, color }: StepProps<MisSub>) => {
  const groups = useMemo(() => [...new Set(s.segs.filter((g) => g.bad).map((g) => g.bad!.word))], [s]);
  const [fixed, setFixed] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [ok, setOk] = useState<string[]>([]); // 点过、但 AI 译对了的段
  const [penalty, setPenalty] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean | null; text: React.ReactNode } | null>(null);
  const [done, setDone] = useState(false);
  const click = (i: number) => {
    if (done) return;
    const g = s.segs[i];
    if (g.bad) { if (!fixed.includes(g.bad.word)) { sfx('hint'); setOpen(g.bad.word); setMsg(null); } return; }
    if (ok.includes(String(i))) return;
    sfx('no'); setOk((x) => [...x, String(i)]); setPenalty((p) => p + 0.12);
    logAnswer(it, { q: s.key, v: `误点：${g.t}`, ok: false });
    setMsg({ ok: false, text: '这一段 AI 译得没问题。' });
  };
  const choose = (word: string, k: number) => {
    const b = s.segs.find((g) => g.bad?.word === word)!.bad!;
    const right = k === b.ok;
    logAnswer(it, { q: s.key + ':' + word, v: b.opts[k], ok: right });
    if (!right) { sfx('no'); setPenalty((p) => p + 0.15); setMsg({ ok: false, text: <>“{b.opts[k]}”不对。再想想“{word}”在这里是什么意思。</> }); return; }
    sfx('ok');
    const f = [...fixed, word]; setFixed(f); setOpen(null);
    setMsg({ ok: true, text: <><b>{word}</b>：{b.why}</> });
    if (f.length === groups.length) { setDone(true); const sc = Math.max(0.34, 1 - penalty); onDone(sc); toast({ emoji: '🔍', title: '你比 AI 译得准！', text: `挑出了 ${groups.length} 处错` }); }
  };
  const giveUp = () => { setFixed(groups); setDone(true); setOpen(null); setMsg({ ok: null, text: '错处都标出来了，看看每一处为什么错。' }); onDone(0.34); };
  const ob = open ? s.segs.find((g) => g.bad?.word === open)!.bad! : null;
  return (
    <div>
      <Q text={s.q} />
      <div className="rounded-2xl border-2 border-[#D8C08A] bg-[#F7EFD9] px-5 py-3"><div className="text-sm font-black text-[#8A6A2F]">原文</div><div className="kai mt-1 text-2xl leading-relaxed">{s.src}</div></div>
      <div className="mt-3 rounded-2xl border-2 border-sky-200 bg-sky-50/70 px-5 py-3">
        <div className="flex items-center gap-1.5 text-sm font-black text-sky-800"><Sparkles size={16} />翻译 AI 的译文（点你觉得译错的地方）</div>
        <div className="mt-1 text-xl leading-[2.1]">
          {s.segs.map((g, i) => {
            const isFixed = g.bad && fixed.includes(g.bad.word);
            return (
              <span key={i} onClick={() => click(i)} className={`seg ${!done && !isFixed ? 'seg-click' : ''} ${isFixed ? 'bg-emerald-100' : ok.includes(String(i)) ? 'text-ink2/70' : open && g.bad?.word === open ? 'bg-amber-200' : ''}`}>
                {isFixed ? <><s className="text-rose-500/80">{g.t}</s> <b className="text-emerald-800">{g.bad!.opts[g.bad!.ok]}</b></> : g.t}
              </span>
            );
          })}
        </div>
      </div>
      {ob && open && (
        <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
          <div className="font-black">原文里的“<span className="kai text-xl">{open}</span>”，在这里是什么意思？</div>
          <div className="mt-2 flex flex-wrap gap-2">{ob.opts.map((o, k) => <button key={k} onClick={() => choose(open, k)} className="rounded-xl border-2 border-[#E6DCC6] bg-white px-3 py-1.5 font-bold hover:border-amber-400">{o}</button>)}</div>
        </div>
      )}
      {msg && <Msg ok={msg.ok}>{msg.text}</Msg>}
      {!done && <div className="mt-3 flex items-center gap-3 text-sm text-ink2"><span>还有 <b className="text-ink">{groups.length - fixed.length}</b> 处错没挑出来</span>{fixed.length < groups.length && <button onClick={giveUp} className="underline">我找不到了，告诉我</button>}</div>}
      {done && <div className="mt-3 text-sm text-ink2" style={{ color }}>AI 也会按今天的意思去套古代的字——和我们最容易犯的错一模一样。</div>}
    </div>
  );
};

// ---------------- 自己写：AI 评 ----------------
const tokens = (t: string) => t.split(/(\s+)/);
export const WriteView = ({ it, s, onDone, color }: StepProps<WriteSub>) => {
  const p = useGame((g) => g.player);
  const aiOn = useGame((g) => g.config.ai);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [n, setN] = useState(0); // 交了几次
  const [help, setHelp] = useState(0);
  const [zh, setZh] = useState<ZhJudge | null>(null);
  const [best, setBest] = useState(0);
  const [en, setEn] = useState<EnJudge | null>(null);
  const [hunt, setHunt] = useState<{ text: string; clicks: number[]; found: number[]; reveal: boolean } | null>(null);
  const [foundAll, setFoundAll] = useState(false);
  const [done, setDone] = useState(false);
  const isEn = s.lang === 'en';
  const finish = (score: number) => { if (done) return; setDone(true); onDone(score); };
  const [demoShown, setDemoShown] = useState(false);
  const submit = async () => {
    const t = text.trim();
    if (!t || busy || !p) return;
    if (DEMO) { logAnswer(it, { q: s.key, v: t, ok: null }); setDemoShown(true); sfx('hint'); if (!s.bonus) finish(1); return; } // 演示版不评分：算完成，不要求变式练习
    setBusy(true); setErr('');
    try {
      const r = await api.judge({ pid: p.pid, token: p.token, item: it.id, step: s.key, text: t });
      setAiLeft(r.left);
      const k = n + 1; setN(k);
      logAnswer(it, { q: s.key, v: t, ok: null });
      if (!isEn) {
        const o = r.out as ZhJudge; setZh(o);
        if (o.grade > best) { setBest(o.grade); addBonus(it, o.grade); }
        sfx(o.grade >= 2 ? 'star' : 'hint');
        if (o.grade >= 3 || k >= MAX_TRIES) finish(1);
      } else {
        const o = r.out as EnJudge; setEn(o);
        const cap = help === 0 ? 1 : help === 1 ? 0.75 : 0.5;
        if (o.verdict === 'perfect') { sfx('ok'); finish(Math.min(cap, k === 1 ? 1 : foundAll ? 0.85 : k === 2 ? 0.67 : 0.5)); }
        else if (o.verdict === 'off') { sfx('no'); setHunt(null); if (k >= MAX_TRIES) finish(0.34); }
        else { sfx('hint'); setHunt(o.errors.length ? { text: t, clicks: [], found: [], reveal: false } : null); setFoundAll(false); if (k >= MAX_TRIES) finish(0.34); }
      }
    } catch (e) { setErr(String((e as Error).message || e)); } finally { setBusy(false); }
  };
  // 先自己找错：点句子里的词
  const errIdx = (tok: string, ti: number, all: string[]) => {
    if (!en) return -1;
    let pos = 0; for (let i = 0; i < ti; i++) pos += all[i].length;
    const lo = hunt!.text.toLowerCase();
    return en.errors.findIndex((e) => { const a = lo.indexOf(e.wrong.toLowerCase()); return a >= 0 && pos < a + e.wrong.length && pos + tok.length > a; });
  };
  const clickTok = (ti: number, all: string[]) => {
    if (!hunt || hunt.reveal || !all[ti].trim()) return;
    const ei = errIdx(all[ti], ti, all);
    const found = ei >= 0 && !hunt.found.includes(ei) ? [...hunt.found, ei] : hunt.found;
    const clicks = [...hunt.clicks, ti];
    sfx(ei >= 0 ? 'ok' : 'no');
    const allFound = found.length === en!.errors.length;
    if (allFound) { setFoundAll(true); toast({ emoji: '🔎', title: '你自己找到了！', text: '现在改一改，再交一次' }); }
    setHunt({ ...hunt, clicks, found, reveal: allFound || clicks.length - found.length >= 3 });
  };
  const toks = hunt ? tokens(hunt.text) : [];
  const left = useGame((g) => g.config.aiLeft);
  if (!aiOn) return <Msg ok={null}>老师暂时关闭了 AI 评分。{s.bonus ? '这道加分题可以先跳过。' : ''}{!s.bonus && !done && <button className="ml-2 underline" onClick={() => finish(0.67)}>先跳过</button>}</Msg>;
  return (
    <div>
      <Q text={s.q} />
      {s.model && <div className="mb-3 rounded-2xl bg-[#F7EFD9] px-4 py-2 text-lg"><span className="text-sm font-black text-[#8A6A2F]">范句　</span><b>{s.model}</b></div>}
      {help >= 1 && s.words && <div className="mb-2 flex flex-wrap gap-2"><span className="text-sm font-black text-ink2">可以用这些词：</span>{s.words.map((w) => <span key={w} className="rounded-full bg-white px-3 py-0.5 font-bold chunky">{w}</span>)}</div>}
      {help >= 2 && s.frame && <div className="mb-2 rounded-xl bg-white px-4 py-2 font-bold chunky">句子框架：{s.frame}</div>}
      {!done && (
        <div className="flex flex-col gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (isEnter(e) && !e.shiftKey) { e.preventDefault(); submit(); } }} rows={2} maxLength={300} placeholder={s.ph ?? ''}
            className={`w-full resize-none rounded-2xl border-2 border-[#E6DCC6] bg-white px-4 py-3 text-xl outline-none focus:border-amber-400 ${isEn ? '' : ''}`} spellCheck={false} autoCorrect="off" autoCapitalize="off" />
          <div className="flex flex-wrap items-center gap-3">
            <Btn color={color} disabled={!text.trim() || busy} onClick={submit}>{busy ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} />AI 正在看……</span> : n ? '改好了，再交一次' : '交给 AI 评'}</Btn>
            {isEn && (s.words || s.frame) && help < (s.frame ? 2 : 1) && <button onClick={() => { setHelp(help + 1); sfx('hint'); logAnswer(it, { q: s.key + ':help', v: String(help + 1), ok: null }); }} className="text-sm font-bold text-ink2 underline">写不出来？给我点帮助{help ? '（再给一点）' : ''}</button>}
            {s.bonus && <span className="text-sm text-ink2">加分题，不写也能过关。{n > 0 && `还能交 ${MAX_TRIES - n} 次。`}</span>}
            {typeof left === 'number' && left < 10 && <span className="text-sm text-rose-700">这节课还能找 AI {left} 次</span>}
          </div>
        </div>
      )}
      {err && <Msg ok={false}>{err}</Msg>}
      {demoShown && <Msg ok={null}><b>演示版没有连接 AI，不能现场评分。</b>课堂版里，AI 会判断“很好 / 有小错 / 有大问题”，有错先让你自己找。<div className="mt-1">参考写法：{s.examples.map((e) => <div key={e} className="font-bold">· {e}</div>)}</div></Msg>}
      {zh && (
        <Msg ok={zh.grade >= 2 ? true : null}>
          <div className="flex items-center gap-2 font-black">AI 评委：{Array.from({ length: 3 }, (_, i) => <span key={i} className={i < zh.grade ? '' : 'opacity-25'}>✒️</span>)} <span className="text-sm font-bold text-ink2">（妙笔 {zh.grade} 分{s.role === 'use' ? (zh.correct ? '，成语用对了' : '，成语用得不对') : ''}）</span></div>
          {zh.praise && <div>👍 {zh.praise}</div>}{zh.issue && <div>🔧 {zh.issue}</div>}{zh.tip && !done && <div>➡️ {zh.tip}</div>}
          {!done && zh.grade < 3 && <div className="mt-1 text-sm opacity-75">可以改一改再交，妙笔分取最高的一次。</div>}
        </Msg>
      )}
      {en && (
        <Msg ok={en.verdict === 'perfect' ? true : en.verdict === 'off' ? false : null}>
          <div className="font-black">{en.verdict === 'perfect' ? '✅ 很好！没有错。' : en.verdict === 'minor' ? `🟡 意思对了，有 ${en.errors.length} 处小错${en.errors.some((e) => e.kind === 'punctuation') ? '（包括标点）' : ''}。` : en.verdict === 'major' ? `🟠 有 ${en.errors.length} 处问题，意思还不太清楚。` : '⚪ 还没有写对题目。'}</div>
          {(!hunt || hunt.reveal || done) && <div>{en.comment}</div>}
          {hunt && !done && (
            <div className="mt-2">
              <div className="text-sm font-black">{hunt.reveal ? '错在这些地方：' : '先别急着看答案——自己找一找：点出你觉得错的词。'}</div>
              <div className="mt-1 text-2xl leading-[2]">{toks.map((tk, ti) => { const ei = errIdx(tk, ti, toks); const on = hunt.reveal ? ei >= 0 : hunt.found.includes(ei) && ei >= 0; const miss = hunt.clicks.includes(ti) && ei < 0; return <span key={ti} onClick={() => clickTok(ti, toks)} className={`seg ${tk.trim() && !hunt.reveal ? 'seg-click' : ''} ${on ? 'bg-rose-100 text-rose-800 underline decoration-wavy decoration-rose-500 underline-offset-8' : miss ? 'text-ink2/50' : ''}`}>{tk}</span>; })}</div>
              {hunt.reveal && <div className="mt-1 space-y-0.5 text-[15px]">{en.errors.map((e, i) => <div key={i}>✗ <b>{e.wrong}</b>{hunt.found.includes(i) ? '（你找到了）' : ''}：{e.why}</div>)}</div>}
              {!hunt.reveal && <div className="mt-1 text-sm">已经找到 {hunt.found.length} / {en.errors.length} 处</div>}
              <div className="mt-1 text-sm opacity-80">在上面的框里改好，再交一次。</div>
            </div>
          )}
          {en.verdict === 'off' && !done && s.frame && help < 2 && <div className="mt-1 text-sm">点“给我点帮助”，看看可以用哪些词、怎么搭句子。</div>}
          {(done || en.verdict === 'perfect') && en.natural && <div className="mt-2 rounded-xl bg-white/80 px-3 py-1.5"><span className="text-sm font-black text-ink2">地道的说法：</span><b>{en.natural}</b></div>}
          {done && en.verdict !== 'perfect' && en.errors.length > 0 && <div className="mt-1 space-y-0.5 text-[15px]">{en.errors.map((e, i) => <div key={i}>✗ <b>{e.wrong}</b> → <b className="text-emerald-800">{e.fix}</b>：{e.why}</div>)}</div>}
        </Msg>
      )}
      {!done && n > 0 && !s.bonus && en && en.verdict !== 'perfect' && n >= MAX_TRIES - 1 && <div className="mt-2 text-sm text-ink2">还剩最后一次机会。</div>}
      {s.bonus && !done && n > 0 && <button onClick={() => finish(1)} className="mt-2 text-sm font-bold text-ink2 underline">就这样，不改了</button>}
      {!s.bonus && done && <div className="mt-2 flex items-center gap-1.5 font-bold" style={{ color }}><Check size={18} />这一步完成了</div>}
      {s.bonus && done && best > 0 && <div className="mt-2 font-bold text-amber-700">妙笔分 +{best}</div>}
      {!p && <X />}
    </div>
  );
};

export const getPid = () => getState().player?.pid ?? '';
