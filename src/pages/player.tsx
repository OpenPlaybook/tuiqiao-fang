// 播放式故事：画面（水墨 + 镜头推拉）+ 配音 + 字幕，一句一句往下播；播到题就停，题出现在画面下面；
// 右边是 AI 眼镜（提示、讲解、拓展、回扣、提问）；拓展在居中弹窗里做小题。进度条可以拉回去重看。
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CornerUpLeft, Glasses, HelpCircle, Loader2, Pause, Play as PlayIcon, Send, Volume2, VolumeX, X } from 'lucide-react';
import type { Back, Ext, Gloss, Item, Line, Play } from '../shared/types';
import { PLAY_BY_ID, voiceFile } from '../shared/play';
import { resultOf, scoredSteps, taskItem } from '../shared/adapt';
import { Art, Btn, GlossContext, Rich, Stars, centerOf } from '../components/ui';
import { finishItem, fly, logPlay, markUnsure, setData, setExtDone, startItem, useGame } from '../game/store';
import { api } from '../game/api';
import { sfx } from '../game/sound';
import { PlayStep } from '../items/steps2';
import { DEMO } from '../game/demo';

export const go = (path: string) => { window.location.hash = path; };
const EST = (t: string) => Math.max(2.2, Array.from(t.replace(/[⟦⟧⟪⟫*]/g, '')).length / 5.2 + 0.5);

// ---------------- 配音：voice/index.json 记着每个文件的时长 ----------------
let voiceIdx: Promise<Record<string, number>> | null = null;
// 演示版（单个 HTML）把配音内嵌成 window.__VOICE__（文件名 → data URL）和 window.__VOICE_IDX__（时长）
const W = window as unknown as { __VOICE__?: Record<string, string>; __VOICE_IDX__?: Record<string, number> };
const getVoiceIdx = () => (voiceIdx ??= W.__VOICE_IDX__ ? Promise.resolve(W.__VOICE_IDX__) : fetch('voice/index.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));

const useHashQuery = () => {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  return { at: q.get('at'), ret: q.get('ret') };
};

export default function PlayerPage({ id }: { id: string }) {
  const play = PLAY_BY_ID[id];
  const p = useGame((s) => s.player)!;
  const { at, ret } = useHashQuery();
  const lines = play.lines;
  const n = lines.length;
  // 每一句挑出这道题的难度版本（做过的就是做过的那个）
  // 难度版本在走到这道题时才挑（能力一路在变）；开始做以后就固定了
  const items = lines.map((l) => (l.task ? taskItem(p, l.task, 'zh') : null));
  const done = (k: number) => !items[k] || p.recs[items[k]!.id]?.status === 'done';
  const extOk = (k: number) => { const it = items[k]; if (!it) return true; const r = p.recs[it.id]; return requiredExts(it, r).every((e) => ((r?.data?.ext as Record<string, number>) ?? {})[e.id] !== undefined); };
  const firstOpen = lines.findIndex((_, k) => !done(k) || !extOk(k));
  const maxIdx = firstOpen === -1 ? n - 1 : firstOpen;

  const [dur, setDur] = useState<Record<string, number>>({});
  useEffect(() => { getVoiceIdx().then(setDur); }, []);
  const lineDur = (l: Line) => (dur[voiceFile(l)] ?? EST(l.read ?? l.t)) + (l.pause ?? 0.35);
  const starts = useMemo(() => { const out: number[] = []; let t = 0; for (const l of lines) { out.push(t); t += lineDur(l); } out.push(t); return out; }, [dur, id]);

  // 接着看：从最后做完的那道题后面一句开始（拓展没做完就停在那道题上）
  const lastDone = lines.reduce((a, l, k) => (l.task && items[k] && p.recs[items[k]!.id]?.status === 'done' ? k : a), -1);
  const resume = lastDone < 0 ? 0 : Math.min(maxIdx, extOk(lastDone) ? lastDone + 1 : lastDone);
  const startAt = at ? Math.max(0, lines.findIndex((l, k) => l.id === at || String(k) === at)) : Math.min(resume, n - 1);
  const [idx, setIdx] = useState(startAt);
  const [phase, setPhase] = useState<'cover' | 'play' | 'pause' | 'task' | 'end'>(at ? 'pause' : 'cover');
  const [muted, setMuted] = useState(() => { try { return localStorage.getItem('tq-mute') === '1'; } catch { return false; } });
  const [elapsed, setElapsed] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [glossPop, setGlossPop] = useState<{ w: string; g: Gloss; x: number; y: number } | null>(null);
  const [extOpen, setExtOpen] = useState<{ it: Item; ext: Ext } | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | null>(null);
  const t0 = useRef(0);
  const line = lines[idx];
  const item = items[idx];

  const stop = () => { audio.current?.pause(); if (timer.current) { clearTimeout(timer.current); timer.current = null; } };
  const endLine = useCallback(() => {
    stop();
    if (lines[idx].task && (!done(idx) || !extOk(idx))) { setPhase('task'); return; }
    if (idx >= n - 1) { setPhase('end'); return; }
    setIdx((k) => k + 1);
  }, [idx, p]);
  // 播一句：有配音就放配音，放完换下一句；没有就按字数估算
  useEffect(() => {
    if (phase !== 'play') return;
    const l = lines[idx], file = voiceFile(l), d = lineDur(l);
    t0.current = performance.now();
    setElapsed(0);
    if (!muted && dur[file]) {
      const a = (audio.current ??= new Audio());
      a.src = W.__VOICE__?.[file] ?? `voice/${file}`; a.currentTime = 0;
      a.onended = () => { timer.current = window.setTimeout(endLine, (l.pause ?? 0.35) * 1000); };
      a.play().catch(() => { timer.current = window.setTimeout(endLine, d * 1000); });
    } else timer.current = window.setTimeout(endLine, d * 1000);
    const iv = window.setInterval(() => setElapsed((performance.now() - t0.current) / 1000), 200); // 进度条 5 次 / 秒就够了
    return () => { clearInterval(iv); stop(); };
  }, [idx, phase, muted, dur]);
  useEffect(() => { setHint(null); }, [idx]);
  // 必做的拓展：题做完以后自动弹出
  useEffect(() => {
    if (phase !== 'task' || !item || !done(idx) || extOpen) return;
    const r = p.recs[item.id], need = requiredExts(item, r).find((e) => ((r?.data?.ext as Record<string, number>) ?? {})[e.id] === undefined);
    if (need) { const tm = setTimeout(() => setExtOpen({ it: item, ext: need }), 900); return () => clearTimeout(tm); }
  }, [phase, idx, p, extOpen]);

  const seek = (k: number) => { if (k > maxIdx) return; stop(); sfx('click'); setIdx(k); setPhase('play'); };
  const playPause = () => {
    if (phase === 'play') { stop(); setPhase('pause'); return; }
    if (phase === 'end') { setIdx(0); setPhase('play'); return; }
    if (phase === 'task') return;
    setPhase('play');
  };
  const cont = () => { if (idx >= n - 1) { setPhase('end'); return; } setIdx((k) => k + 1); setPhase('play'); };
  const jump = (b: Back) => { stop(); go(`/c/${b.ch}?at=${b.line}&ret=${id}:${idx}`); };
  const onGloss = (w: string, g: Gloss, el: HTMLElement) => { const c = centerOf(el); sfx('hint'); setGlossPop({ w, g, x: c.x, y: c.y }); logPlay(id, 'gloss', w); };

  // 画面：这一句之前最近的一次换景
  const sceneIdx = (() => { for (let k = idx; k >= 0; k--) if (lines[k].scene) return k; return 0; })();
  const scene = lines[sceneIdx].scene;
  const cam = line.cam ?? lines[sceneIdx].cam ?? [50, 50, 1.05, 50, 50, 1.05];
  const total = starts[n], nowT = starts[idx] + (phase === 'play' ? Math.min(elapsed, lineDur(line)) : phase === 'cover' ? 0 : lineDur(line));
  const atTask = phase === 'task' && !!item;
  const showSub = !(atTask && line.hide) && !line.card && phase !== 'cover';
  const retTo = ret ? ret.split(':') : null;

  return (
    <GlossContext.Provider value={{ gloss: play.gloss, onGloss }}>
      <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_360px]" onClick={() => setGlossPop(null)}>
        <div>
          <div className="mb-2 flex items-center gap-3">
            <button onClick={() => go('/')} className="text-sm font-bold text-ink2 underline">目录</button>
            <div className="kai text-2xl" style={{ color: play.color }}>{play.title}</div>
            {retTo && PLAY_BY_ID[retTo[0]] && <button onClick={() => go(`/c/${retTo[0]}?at=${retTo[1]}`)} className="ml-auto flex items-center gap-1 rounded-full bg-[#2B2722] px-3 py-1 text-sm font-black text-white"><CornerUpLeft size={15} />回到{PLAY_BY_ID[retTo[0]].title.split('　')[0]}</button>}
          </div>
          {/* ---------- 画面 ---------- */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#2B2722] shadow-xl">
            <Cam key={`${idx}-${phase === 'play' ? 'p' : 's'}`} cam={cam} dur={lineDur(line)} moving={phase === 'play'}>{scene && <Art spec={scene} className="h-full w-full" />}</Cam>
            <AnimatePresence>
              {line.card && phase !== 'cover' && !(atTask && line.hide) && (
                <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`absolute left-1/2 top-[8%] max-w-[82%] -translate-x-1/2 rounded-xl px-6 py-4 shadow-2xl ${line.card.kind === 'ai' ? 'bg-sky-50/95' : 'bg-[#F7EFD9]/95'}`}>
                  {line.card.by && <div className="mb-1 text-xs font-black text-[#8A6A2F]">{line.card.by}</div>}
                  <div className={`${line.card.kind === 'poem' ? 'kai text-center text-[26px] leading-[1.9]' : line.card.kind === 'yuan' ? 'kai text-[26px] leading-relaxed' : 'text-xl'}`}><Rich text={line.card.t} /></div>
                </motion.div>
              )}
            </AnimatePresence>
            {hint && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-4 top-4 flex max-w-[48%] gap-2 rounded-2xl bg-white/95 px-4 py-3 shadow-xl">
                <Glasses size={22} className="shrink-0 text-sky-600" /><div className="text-[15px] font-bold leading-relaxed"><span className="text-sky-700">AI 眼镜：</span><Rich text={hint} /></div>
              </motion.div>
            )}
            {showSub && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/55 to-transparent px-6 pb-4 pt-10">
                <div className="text-center text-[21px] font-bold leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,.6)]">
                  {line.who && <span className={`mr-2 rounded-md px-2 py-0.5 text-sm ${line.voice === 'ai' ? 'bg-sky-600' : 'bg-[#8A6A2F]'}`}><Rich text={line.who} /></span>}
                  <Rich text={line.t} />
                </div>
              </div>
            )}
            {phase === 'cover' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white">
                <div className="kai text-5xl">{play.title}</div>
                <div className="mt-2 text-lg opacity-85">{play.sub}</div>
                <button onClick={() => { sfx('click'); setPhase('play'); }} className="mt-6 flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-lg font-black text-[#2B2722]"><PlayIcon size={22} />{lastDone >= 0 ? '接着看' : '开始'}</button>
              </div>
            )}
          </div>
          {/* ---------- 播放条 ---------- */}
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2">
            <button onClick={playPause} disabled={phase === 'task'} className="rounded-full p-1.5 hover:bg-black/5 disabled:opacity-40">{phase === 'play' ? <Pause size={20} /> : <PlayIcon size={20} />}</button>
            <div className="relative h-6 flex-1">
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#E6DCC6]" />
              <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full" style={{ width: `${(nowT / total) * 100}%`, background: play.color }} />
              <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black/10" style={{ width: `${(starts[maxIdx + 1] / total) * 100}%` }} />
              {lines.map((l, k) => (
                <button key={k} title={k > maxIdx ? '还没看到这里' : `从这里看`} onClick={() => seek(k)} className="absolute top-0 h-6" style={{ left: `${(starts[k] / total) * 100}%`, width: `${((starts[k + 1] - starts[k]) / total) * 100}%`, cursor: k > maxIdx ? 'not-allowed' : 'pointer' }}>
                  {l.task && <span className={`absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white ${done(k) ? 'bg-emerald-500' : 'bg-amber-400'}`} />}
                </button>
              ))}
            </div>
            <span className="w-24 text-right text-sm tabular-nums text-ink2">{fmt(nowT)} / {fmt(total)}</span>
            <button onClick={() => { const m = !muted; setMuted(m); try { localStorage.setItem('tq-mute', m ? '1' : '0'); } catch { /* */ } }} className="rounded-full p-1.5 hover:bg-black/5" title={muted ? '打开配音' : '关掉配音（只看字幕）'}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
          </div>
          {/* ---------- 题：长在画面下面 ---------- */}
          {item && (atTask || (done(idx) && phase !== 'cover')) && (
            <TaskTray key={item.id} it={item} line={line} color={play.color} active={atTask} onCont={cont} onExt={(ext) => setExtOpen({ it: item, ext })} />
          )}
          {phase === 'end' && (
            <div className="mt-4 flex items-center justify-end gap-3">
              <span className="text-ink2">{!play.next || !PLAY_BY_ID[play.next] ? play.nextNote : ''}</span>
              {play.next && PLAY_BY_ID[play.next] ? <Btn size="lg" color={play.color} onClick={() => go(`/c/${play.next}`)}>翻到下一回 ›{play.nextNote ? <span className="ml-2 text-sm font-bold opacity-80">（{play.nextNote}）</span> : null}</Btn> : <Btn size="lg" color={play.color} onClick={() => go('/')}>合上书</Btn>}
            </div>
          )}
        </div>

        {/* ---------- AI 眼镜（侧边） ---------- */}
        <Side play={play} item={item} line={line} atTask={atTask} phase={phase} onHint={(h) => { setHint(h); if (item) markUnsure(item); }} onExt={(ext) => item && setExtOpen({ it: item, ext })} onBack={jump} />
      </div>

      {glossPop && (
        <div className="fixed z-[70] max-w-[320px] -translate-x-1/2 rounded-2xl bg-white px-4 py-3 shadow-2xl ring-2 ring-sky-200" style={{ left: Math.min(window.innerWidth - 170, Math.max(170, glossPop.x)), top: glossPop.y + 18 }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 text-sm font-black text-sky-700"><Glasses size={16} />AI 眼镜</div>
          <div className="mt-1 text-lg"><b className="kai text-2xl">{glossPop.w}</b>{glossPop.g.py && <span className="ml-2 text-ink2">{glossPop.g.py}</span>}</div>
          <div className="mt-0.5 leading-relaxed">{glossPop.g.d}</div>
          {glossPop.g.back && <button onClick={() => jump(glossPop.g.back!)} className="mt-2 flex items-center gap-1 text-sm font-black text-sky-700 underline"><CornerUpLeft size={14} />{glossPop.g.back.label}</button>}
        </div>
      )}
      <AnimatePresence>{extOpen && <ExtModal key={extOpen.it.id + extOpen.ext.id} it={extOpen.it} ext={extOpen.ext} color={play.color} onClose={() => setExtOpen(null)} gloss={play.gloss} onGloss={onGloss} />}</AnimatePresence>
    </GlossContext.Provider>
  );
}
/** 镜头：一句话的时间里，从起点慢慢推到终点 */
function Cam({ cam, dur, moving, children }: { cam: number[]; dur: number; moving: boolean; children: React.ReactNode }) {
  const [end, setEnd] = useState(false);
  useEffect(() => { if (!moving) return; const r = requestAnimationFrame(() => requestAnimationFrame(() => setEnd(true))); return () => cancelAnimationFrame(r); }, [moving]);
  const at = moving ? (end ? 1 : 0) : 1, c = [cam[0] + (cam[3] - cam[0]) * at, cam[1] + (cam[4] - cam[1]) * at, cam[2] + (cam[5] - cam[2]) * at];
  return <div className="absolute inset-0" style={{ transformOrigin: `${c[0]}% ${c[1]}%`, transform: `scale(${c[2]})`, transition: moving && end ? `transform ${dur}s linear, transform-origin ${dur}s linear` : 'none' }}>{children}</div>;
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** 这道题哪些拓展必做：always 都要；wrong 要看这道题有没有答错过、点过“不确定” */
export const requiredExts = (it: Item, r: { perf?: number; unsure?: number; status?: string } | undefined) => {
  if (!r || r.status !== 'done') return [];
  const struggled = (r.perf ?? 1) < 0.99 || (r.unsure ?? 0) > 0;
  return (it.ext ?? []).filter((e) => e.need === 'always' || (e.need === 'wrong' && struggled));
};

// ---------------- 画面下面的题 ----------------
function TaskTray({ it, line, color, active, onCont, onExt }: { it: Item; line: Line; color: string; active: boolean; onCont: () => void; onExt: (e: Ext) => void }) {
  const rec = useGame((s) => s.player?.recs[it.id]);
  const finished = rec?.status === 'done';
  const steps = scoredSteps(it);
  const [scores, setScores] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { startItem(it); }, [it.id]);
  useEffect(() => { if (active) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [active]);
  const exts = (rec?.data?.ext as Record<string, number>) ?? {};
  const revealed = (it.ext ?? []).some((e) => e.reveal && exts[e.id] !== undefined);
  const need = requiredExts(it, rec).filter((e) => exts[e.id] === undefined);
  const [live, setLive] = useState(false); // 这一次打开页面时做的：做完以后题还留在原处（选项下面的反馈都看得见）
  const stepDone = (i: number, x: number) => {
    const sc = [...scores]; sc[i] = x; setScores(sc); setLive(true);
    if (i + 1 < steps.length) { setTimeout(() => setStep(i + 1), 600); return; }
    const { stars, perf } = resultOf(sc, rec?.unsure ?? 0);
    setTimeout(() => { finishItem(it, stars, perf); sfx('star'); const c = centerOf(ref.current); fly(c.x, c.y, stars); setData(it, { scores: sc }); }, 400);
  };
  if (finished && !active) return (
    <div ref={ref} className="mt-3 flex items-center gap-3 rounded-xl border-2 bg-white/70 px-4 py-2" style={{ borderColor: color + '33' }}>
      <Stars n={rec!.stars} size={18} /><span className="font-bold">这道题做过了：{it.label}</span><span className="ml-auto text-sm text-ink2">讲解在右边</span>
    </div>
  );
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl border-2 bg-[#FFFDF8] p-5 shadow-sm" style={{ borderColor: color + '55' }}>
      {(!finished || live) && steps.map((s, i) => i <= step && <div key={s.key} className={i < step ? 'mb-3 opacity-60' : 'mb-3'}><PlayStep it={it} s={s} color={color} onDone={(x) => { if (i === step && !finished) stepDone(i, x); }} revealed={revealed} /></div>)}
      {finished && !live && <div className="mb-3"><DoneReview it={it} color={color} revealed={revealed} /></div>}
      {finished && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EFE6D2] pt-3">
          <Stars n={rec!.stars} size={22} /><span className="font-black">完成！</span>
          {need.length > 0 ? <Btn size="sm" color={color} onClick={() => onExt(need[0])}>先做拓展：{need[0].title}</Btn> : <Btn color={color} onClick={onCont}>继续播放 ▶</Btn>}
        </div>
      )}
    </motion.div>
  );
}
/** 做完以后还能看到自己的题（选项下面的解释）：用记录重放一遍太复杂，这里只列出选择题的解释 */
function DoneReview({ it, color, revealed }: { it: Item; color: string; revealed: boolean }) {
  const rec = useGame((g) => g.player?.recs[it.id]);
  const s = it.steps.find((x) => x.kind === 'choice');
  if (!s || s.kind !== 'choice') return null;
  const reveal = s.reveal ?? 'all';
  const picked = new Set((rec?.log ?? []).filter((e) => e.q === s.key).flatMap((e) => e.v.split(' / ')));
  return (
    <details className="rounded-xl bg-white/70 px-3 py-1.5" open>
      <summary className="cursor-pointer text-sm font-black text-ink2">{s.q.replace(/\*\*/g, '')}</summary>
      <div className="mt-1 space-y-1 text-[15px]">{s.opts.map((o, i) => {
        const ok = s.ok.includes(i), show = ok || picked.has(o.t) || reveal === 'all' || (reveal === 'ext' && revealed);
        return <div key={i}><b style={{ color: ok ? '#047857' : undefined }}>{ok ? '✓' : '·'} <Rich text={o.t} /></b>{show ? <>：<Rich text={o.why} /></> : reveal === 'ext' ? <span className="text-ink2">（做完拓展再看）</span> : null}</div>;
      })}</div>
    </details>
  );
}

// ---------------- AI 眼镜（侧边） ----------------
function Side({ play, item, line, atTask, phase, onHint, onExt, onBack }: { play: Play; item: Item | null; line: Line; atTask: boolean; phase: string; onHint: (h: string) => void; onExt: (e: Ext) => void; onBack: (b: Back) => void }) {
  const p = useGame((s) => s.player)!;
  const rec = item ? p.recs[item.id] : undefined;
  const finished = rec?.status === 'done';
  const [hintN, setHintN] = useState(0);
  useEffect(() => setHintN(0), [item?.id]);
  const exts = (rec?.data?.ext as Record<string, number>) ?? {};
  const need = item ? requiredExts(item, rec).map((e) => e.id) : [];
  return (
    <div className="lg:sticky lg:top-20 lg:self-start">
      <div className="card p-5">
        <div className="mb-3 flex items-center gap-2"><Glasses size={22} className="text-sky-600" /><span className="text-lg font-black">AI 眼镜</span></div>
        {!item || (!atTask && !finished) ? (
          <div className="text-[15px] leading-relaxed text-ink2">看不懂的字，把鼠标放上去试试：能点的，点一下我就告诉你。</div>
        ) : !finished ? (
          <div>
            <div className="text-[15px] text-ink2">停在这里了：轮到你。</div>
            {item.hints.length > 0 && hintN < item.hints.length && <button onClick={() => { sfx('hint'); onHint(item.hints[hintN]); setHintN(hintN + 1); }} className="mt-3 flex items-center gap-1.5 rounded-full border-2 border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-black text-sky-800"><HelpCircle size={16} />{hintN ? '还是不确定，再提示一下' : '不确定？给我一点提示'}</button>}
            {hintN > 0 && <div className="mt-2 text-xs text-ink2">提示不扣星。</div>}
          </div>
        ) : (
          <div>
            <div className="text-[16px] leading-relaxed"><Rich text={item.explain} /></div>
            {(item.back ?? []).map((b) => <button key={b.label} onClick={() => onBack(b)} className="mt-3 flex items-center gap-1.5 text-left text-sm font-black text-sky-700 underline"><CornerUpLeft size={15} className="shrink-0" />{b.label}</button>)}
            {(item.ext ?? []).length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-sm font-black text-ink2">拓展</div>
                <div className="space-y-1.5">{item.ext!.map((e) => (
                  <button key={e.id} onClick={() => onExt(e)} className="flex w-full items-center gap-2 rounded-xl border-2 border-[#E6DCC6] bg-white px-3 py-2 text-left text-sm font-bold hover:border-amber-300">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-black text-white ${need.includes(e.id) ? 'bg-rose-500' : 'bg-[#9C8F7A]'}`}>{need.includes(e.id) ? '必做' : '选做'}</span>
                    <span className="flex-1">{e.title}</span>{exts[e.id] !== undefined && <span className="text-emerald-600">✓</span>}
                  </button>
                ))}</div>
              </div>
            )}
          </div>
        )}
        <Ask play={play} item={item} line={line} />
      </div>
      {phase === 'end' && <div className="mt-3 text-center text-sm text-ink2">这一回看完了。可以把进度条拉回去，重看任何一段。</div>}
    </div>
  );
}

// ---------------- 自己提问（小） ----------------
function Ask({ play, item, line }: { play: Play; item: Item | null; line: Line }) {
  const p = useGame((s) => s.player)!;
  const aiOn = useGame((s) => s.config.ai);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<{ q: string; a: string; fb?: string } | null>(null);
  const [err, setErr] = useState('');
  if (!aiOn) return null;
  const ask = async () => {
    const t = q.trim(); if (!t || busy) return;
    setBusy(true); setErr(''); logPlay(play.id, 'ask', t);
    try {
      if (DEMO) { await new Promise((r) => setTimeout(r, 500)); setA({ q: t, a: '（演示版没有连接 AI。课堂版里，我会结合你正在看的这一句来回答。）' }); }
      else { const r = await api.ask({ pid: p.pid, token: p.token, play: play.id, item: item?.id ?? '', line: line.t, q: t }); setA({ q: t, a: r.a }); }
      setQ('');
    } catch (e) { setErr(String((e as Error).message || e)); } finally { setBusy(false); }
  };
  const fb = (v: string) => { if (!a) return; logPlay(play.id, 'askfb', `${v}｜${a.q}`); setA({ ...a, fb: v }); sfx('click'); };
  return (
    <div className="mt-5 border-t border-[#EFE6D2] pt-4">
      <div className="mb-1.5 text-sm font-black text-ink2">还有不明白的？问我</div>
      <div className="flex gap-1.5"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) ask(); }} maxLength={120} placeholder="比如：项羽为什么不渡江？" className="min-w-0 flex-1 rounded-xl border-2 border-[#E6DCC6] bg-white px-3 py-1.5 text-sm outline-none focus:border-sky-300" /><button disabled={!q.trim() || busy} onClick={ask} className="rounded-xl bg-sky-600 px-3 text-white disabled:opacity-50">{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button></div>
      {err && <div className="mt-1 text-sm text-rose-700">{err}</div>}
      {a && (
        <div className="mt-2 rounded-xl bg-sky-50 px-3 py-2 text-[15px] leading-relaxed">
          <div className="text-xs text-ink2">你问：{a.q}</div>
          <div className="mt-0.5">{a.a}</div>
          {a.fb ? <div className="mt-1 text-xs text-ink2">已记下：{a.fb}。老师会看到。</div> : <div className="mt-1.5 flex gap-1.5 text-xs">{['清楚了', '没说清', '好像不对'].map((v) => <button key={v} onClick={() => fb(v)} className="rounded-full border border-sky-200 bg-white px-2 py-0.5 font-bold">{v}</button>)}</div>}
        </div>
      )}
    </div>
  );
}

// ---------------- 拓展（居中弹窗，一道接一道） ----------------
function ExtModal({ it, ext, color, onClose, gloss, onGloss }: { it: Item; ext: Ext; color: string; onClose: () => void; gloss: Record<string, Gloss>; onGloss: (w: string, g: Gloss, el: HTMLElement) => void }) {
  const rec = useGame((s) => s.player?.recs[it.id]);
  const required = requiredExts(it, rec).some((e) => e.id === ext.id);
  const already = ((rec?.data?.ext as Record<string, number>) ?? {})[ext.id] !== undefined;
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(already);
  const [round, setRound] = useState(0);
  const onStep = (i: number, x: number) => {
    const sc = [...scores]; sc[i] = x; setScores(sc);
    if (i + 1 < ext.steps.length) { setTimeout(() => setStep(i + 1), 700); return; }
    setExtDone(it, ext.id, sc.reduce((a, b) => a + b, 0) / sc.length); setFinished(true); sfx('star');
  };
  const canClose = !required || finished;
  return (
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2B2722]/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => canClose && onClose()}>
      <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} className="card relative max-h-[90vh] w-full max-w-[760px] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
        <GlossContext.Provider value={{ gloss, onGloss }}>
          <div className="mb-4 flex items-center gap-2"><span className={`rounded-full px-2.5 py-0.5 text-xs font-black text-white ${required ? 'bg-rose-500' : 'bg-[#9C8F7A]'}`}>{required ? '必做' : '选做'}</span><span className="text-xl font-black">拓展：{ext.title}</span>
            {canClose && <button onClick={onClose} className="ml-auto rounded-full p-1.5 text-ink2 hover:bg-black/5" aria-label="关闭"><X size={20} /></button>}</div>
          {ext.steps.map((s, i) => i <= step && <div key={`${s.key}-${round}`} className={i < step ? 'mb-4 opacity-60' : 'mb-4'}><PlayStep it={it} s={s} color={color} onDone={(x) => { if (i === step) onStep(i, x); }} /></div>)}
          {finished && (
            <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
              {ext.reveal && <span className="text-sm text-emerald-700">这道题选项的解释，已经揭开了。</span>}
              {!required && <button onClick={() => { setStep(0); setScores([]); setFinished(false); setRound((r) => r + 1); }} className="text-sm font-bold text-ink2 underline">再做一遍</button>}
              <Btn color={color} onClick={onClose}>{required ? '好，回到故事 ›' : '关上'}</Btn>
            </div>
          )}
          {!finished && !required && <div className="mt-2 text-right"><button onClick={onClose} className="text-sm font-bold text-ink2 underline">跳过，继续故事</button></div>}
        </GlossContext.Provider>
      </motion.div>
    </motion.div>
  );
}
