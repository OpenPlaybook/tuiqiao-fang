// 排序、自己写（AI 评）这两种步骤的界面；别的题型在 steps2.tsx。每一步做完调用 onDone(得分 0—1)。
import { useContext, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowUp, Check, Loader2, Sparkles, X } from 'lucide-react';
import type { Item, OrderSub, WriteSub } from '../shared/types';
import type { EnJudge, ZhJudge } from '../shared/ai';
import { MAX_TRIES } from '../shared/ai';
import { Art, Btn, LETTERS, Rich, isEnter, shuffleIdx } from '../components/ui';
import { addBonus, getState, logAnswer, setAiLeft, toast, useGame } from '../game/store';
import { api } from '../game/api';
import { sfx } from '../game/sound';
import { SaveCtx, useSaved } from './steps2';
import { DEMO } from '../game/demo';

export interface StepProps<S> { it: Item; s: S; onDone: (score: number) => void; color: string }
const triesScore = (t: number) => (t <= 1 ? 1 : t === 2 ? 0.67 : 0.34);

export const Msg = ({ ok, children }: { ok: boolean | null; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0, x: ok === false ? [0, -6, 6, -4, 4, 0] : 0 }} transition={{ duration: 0.3 }}
    className={`mt-3 rounded-2xl border-2 px-4 py-3 leading-relaxed ${ok === true ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : ok === false ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>{children}</motion.div>
);
const Q = ({ text }: { text: string }) => <div className="mb-3 text-lg font-black"><Rich text={text} /></div>;

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

// ---------------- 自己写：AI 评 ----------------
const tokens = (t: string) => t.split(/(\s+)/);
export const WriteView = ({ it, s, onDone, color }: StepProps<WriteSub>) => {
  const p = useGame((g) => g.player);
  const pre = useContext(SaveCtx); // 拓展里：步骤号前面带拓展号（服务器按它找题）
  const [sv, save] = useSaved<{ sc: number; t: string }>(it, s.key);
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
  const finish = (score: number) => { if (done) return; setDone(true); save({ sc: score, t: text.trim() }); onDone(score); };
  const [demoShown, setDemoShown] = useState(false);
  const submit = async () => {
    const t = text.trim();
    if (!t || busy || !p) return;
    if (DEMO) { logAnswer(it, { q: s.key, v: t, ok: null }); setDemoShown(true); sfx('hint'); if (!s.bonus) finish(1); return; } // 演示版不评分：算完成，不要求变式练习
    setBusy(true); setErr('');
    try {
      const r = await api.judge({ pid: p.pid, token: p.token, item: it.id, step: pre + s.key, text: t });
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
  // 做过的：显示当时写的，不再重写
  if (sv && !done) return <div><Q text={s.q} /><div className="rounded-2xl bg-white px-4 py-2 text-lg font-bold chunky">{sv.t || '（没有写）'}</div><div className="mt-2 flex items-center gap-1.5 font-bold" style={{ color }}><Check size={18} />这一步完成了</div></div>;
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

