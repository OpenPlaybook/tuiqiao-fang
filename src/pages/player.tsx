// 播放式故事：画面（水墨 + 镜头推拉）+ 配音 + 字幕，一句一句往下播；播到题就停，题在画面里做。
// 画面尽量大：字幕、进度条都在画面里；右边窄栏是“台本”（播过的每一句，可点的字随时能点；做过的题、拓展入口挂在题下面），最下面可以问 AI。
// 做过的题点进度条上的标记、或者台本里的题，就能回来看自己的答案；拓展在居中弹窗里，按“讲—例—练”往下走。
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CornerUpLeft, Glasses, Loader2, Pause, Play as PlayIcon, RotateCcw, Send, Volume2, VolumeX, X } from 'lucide-react';
import type { Back, Ext, Gloss, Item, Line, MisSub, Play } from '../shared/types';
import { PLAY_BY_ID, voiceFile } from '../shared/play';
import { resultOf, scoredSteps, taskItem } from '../shared/adapt';
import { Art, Btn, GlossContext, Rich, Stars, centerOf } from '../components/ui';
import { finishItem, fly, logPlay, markUnsure, setData, setExtDone, startItem, useGame } from '../game/store';
import { api } from '../game/api';
import { sfx } from '../game/sound';
import { PlayStep, SaveCtx, TeachView, ansOf, layoutOf } from '../items/steps2';
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
const extsOf = (r: { data?: Record<string, unknown> } | undefined) => (r?.data?.ext as Record<string, number>) ?? {};
/** 只滚动外面那个框，不带着整页一起滚（scrollIntoView 会滚动所有外层） */
const scrollInto = (box: HTMLElement | null, el: HTMLElement | null | undefined) => {
  if (!box || !el) return;
  const b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
  if (r.top < b.top) box.scrollBy({ top: r.top - b.top - 8, behavior: 'smooth' });
  else if (r.bottom > b.bottom) box.scrollBy({ top: r.bottom - b.bottom + 8, behavior: 'smooth' });
};

export default function PlayerPage({ id }: { id: string }) {
  const play = PLAY_BY_ID[id];
  const p = useGame((s) => s.player)!;
  const { at, ret } = useHashQuery();
  const lines = play.lines;
  const n = lines.length;
  // 每一句挑出这道题的难度版本（做过的就是做过的那个）
  const items = lines.map((l) => (l.task ? taskItem(p, l.task, 'zh') : null));
  const done = (k: number) => !items[k] || p.recs[items[k]!.id]?.status === 'done';
  const extOk = (k: number) => { const it = items[k]; if (!it) return true; const r = p.recs[it.id]; return requiredExts(it, r).every((e) => extsOf(r)[e.id] !== undefined); };
  const firstOpen = lines.findIndex((_, k) => !done(k) || !extOk(k));
  const maxIdx = firstOpen === -1 ? n - 1 : firstOpen;

  const [dur, setDur] = useState<Record<string, number>>({});
  useEffect(() => { getVoiceIdx().then(setDur); }, []);
  const lineDur = (l: Line) => (dur[voiceFile(l)] ?? EST(l.read ?? l.t)) + (l.pause ?? 0.35);
  const starts: number[] = []; { let t = 0; for (const l of lines) { starts.push(t); t += lineDur(l); } starts.push(t); }

  // 接着看：从最后做完的那道题后面一句开始（拓展没做完就停在那道题上）
  const lastDone = lines.reduce((a, l, k) => (l.task && items[k] && p.recs[items[k]!.id]?.status === 'done' ? k : a), -1);
  const resume = lastDone < 0 ? 0 : Math.min(maxIdx, extOk(lastDone) ? lastDone + 1 : lastDone);
  const startAt = at ? Math.max(0, lines.findIndex((l, k) => l.id === at || String(k) === at)) : Math.min(resume, n - 1);
  const [idx, setIdx] = useState(startAt);
  const [far, setFar] = useState(Math.max(startAt, lastDone)); // 台本里显示到哪一句
  useEffect(() => setFar((f) => Math.max(f, idx)), [idx]);
  const [phase, setPhase] = useState<'cover' | 'play' | 'pause' | 'task' | 'end'>(at ? 'pause' : 'cover');
  const [muted, setMuted] = useState(() => { try { return localStorage.getItem('tq-mute') === '1'; } catch { return false; } });
  const [elapsed, setElapsed] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [glossPop, setGlossPop] = useState<{ w: string; g: Gloss; x: number; y: number } | null>(null);
  const [extOpen, setExtOpen] = useState<{ it: Item; ext: Ext } | null>(null);
  const [bottomEl, setBottomEl] = useState<HTMLDivElement | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | null>(null);
  const t0 = useRef(0);
  const line = lines[idx];
  const item = items[idx];

  // 画面大小：在留给它的地方里尽量大（16:9）
  const box = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(960);
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => { const { width, height } = e.contentRect; setVw(Math.max(320, Math.floor(Math.min(width, (height * 16) / 9)))); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const vh = (vw * 9) / 16;

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
  useEffect(() => { setHint(null); }, [idx, phase]);
  // 必做的拓展：题做完以后自动弹出
  useEffect(() => {
    if (phase !== 'task' || !item || !done(idx) || extOpen) return;
    const r = p.recs[item.id], need = requiredExts(item, r).find((e) => extsOf(r)[e.id] === undefined);
    if (need) { const tm = setTimeout(() => setExtOpen({ it: item, ext: need }), 1200); return () => clearTimeout(tm); }
  }, [phase, idx, p, extOpen]);

  const seek = (k: number) => { if (k > maxIdx && k > far) return; stop(); sfx('click'); setIdx(k); setPhase('play'); };
  const openTask = (k: number) => { if (k > maxIdx || !items[k]) return; stop(); sfx('click'); setIdx(k); setPhase('task'); };
  const playPause = () => {
    if (phase === 'play') { stop(); setPhase('pause'); return; }
    if (phase === 'end') { setIdx(0); setPhase('play'); return; }
    if (phase === 'task') { if (done(idx) && extOk(idx)) cont(); return; }
    setPhase('play');
  };
  const cont = () => { if (idx >= n - 1) { setPhase('end'); return; } setIdx((k) => k + 1); setPhase('play'); };
  const jump = (b: Back) => { stop(); go(`/c/${b.ch}?at=${b.line}&ret=${id}:${idx}`); };
  const onGloss = (w: string, g: Gloss, el: HTMLElement) => { const c = centerOf(el); sfx('hint'); setGlossPop({ w, g, x: c.x, y: c.y }); logPlay(id, 'gloss', w); };
  const barClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), t = ((e.clientX - r.left) / r.width) * starts[n];
    let k = 0; while (k + 1 < n && starts[k + 1] <= t) k++;
    seek(Math.min(k, Math.max(maxIdx, far)));
  };

  // 画面：这一句之前最近的一次换景
  const sceneIdx = (() => { for (let k = idx; k >= 0; k--) if (lines[k].scene) return k; return 0; })();
  const scene = lines[sceneIdx].scene;
  const cam = line.cam ?? lines[sceneIdx].cam ?? [50, 50, 1.05, 50, 50, 1.05];
  const total = starts[n], nowT = starts[idx] + (phase === 'play' ? Math.min(elapsed, lineDur(line)) : phase === 'cover' ? 0 : lineDur(line));
  const atTask = phase === 'task' && !!item;
  const taskLay = atTask ? layoutOf(scoredSteps(item!)[0]) : null;
  const showCard = line.card && phase !== 'cover' && !(atTask && (line.hide || taskLay === 'card'));
  const showSub = !(atTask && line.hide) && !line.card && phase !== 'cover';
  const retTo = ret ? ret.split(':') : null;
  const subSize = Math.max(15, Math.min(24, vw / 48));
  const askHint = (atTask && item?.ask) || lines.slice(0, idx + 1).reverse().find((l) => l.ask)?.ask || '这一段有什么看不懂的？';

  return (
    <GlossContext.Provider value={{ gloss: play.gloss, onGloss }}>
      <div className="flex h-[calc(100dvh-66px)] gap-3 overflow-hidden px-3 py-2" onClick={() => setGlossPop(null)}>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1.5 flex items-center gap-3">
            <button onClick={() => go('/')} className="text-sm font-bold text-ink2 underline">目录</button>
            <div className="kai text-xl" style={{ color: play.color }}>{play.title}</div>
            {retTo && PLAY_BY_ID[retTo[0]] && <button onClick={() => go(`/c/${retTo[0]}?at=${retTo[1]}`)} className="ml-auto flex items-center gap-1 rounded-full bg-[#2B2722] px-3 py-1 text-sm font-black text-white"><CornerUpLeft size={15} />回到{PLAY_BY_ID[retTo[0]].title.split('　')[0]}</button>}
          </div>
          <div ref={box} className="flex min-h-0 flex-1 items-start justify-center">
            {/* ---------- 画面 ---------- */}
            <div className="relative overflow-hidden rounded-2xl bg-[#2B2722] shadow-xl" style={{ width: vw, height: vh }}>
              <Cam key={`${idx}-${phase === 'play' ? 'p' : 's'}`} cam={cam} dur={lineDur(line)} moving={phase === 'play'}>{scene && <Art spec={scene} className="h-full w-full" />}</Cam>
              <AnimatePresence>
                {showCard && (
                  <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`absolute left-1/2 top-[6%] max-w-[86%] -translate-x-1/2 rounded-xl px-6 py-3 shadow-2xl ${line.card!.kind === 'ai' ? 'bg-sky-50/95' : 'bg-[#F7EFD9]/95'}`}>
                    {line.card!.by && <div className="mb-1 text-xs font-black text-[#8A6A2F]">{line.card!.by}</div>}
                    <div className={`${line.card!.kind === 'poem' ? 'kai text-center leading-[1.85]' : line.card!.kind === 'yuan' ? 'kai leading-relaxed' : ''}`} style={{ fontSize: Math.max(18, Math.min(27, vw / 40)) }}><Rich text={line.card!.t} /></div>
                  </motion.div>
                )}
              </AnimatePresence>
              {atTask && <TaskView key={item!.id} it={item!} line={line} prev={lines[idx - 1]} color={play.color} vh={vh} bottomEl={bottomEl} onCont={cont} onExt={(ext) => setExtOpen({ it: item!, ext })} onBack={jump} onHint={(h) => { setHint(h); markUnsure(item!); }} />}
              {hint && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-3 top-3 z-20 flex max-w-[44%] gap-2 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-xl">
                  <Glasses size={20} className="mt-0.5 shrink-0 text-sky-600" /><div className="text-[15px] font-bold leading-relaxed"><Rich text={hint} /></div>
                  <button onClick={() => setHint(null)} className="-mr-1 -mt-1 self-start rounded-full p-0.5 text-ink2 hover:bg-black/5"><X size={14} /></button>
                </motion.div>
              )}
              {/* 下面一摞：题的小弹层 → 字幕 → 控制条 */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col">
                <div ref={setBottomEl} />
                {showSub && (
                  <div className="bg-gradient-to-t from-black/70 to-black/0 px-6 pb-1.5 pt-6 text-center font-bold leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,.7)]" style={{ fontSize: subSize }}>
                    {line.who && <span className={`mr-2 rounded-md px-2 py-0.5 align-middle text-[0.62em] ${line.voice === 'ai' ? 'bg-sky-600' : 'bg-[#8A6A2F]'}`}>{line.voice === 'ai' ? <Glasses size={16} className="inline" /> : <Rich text={line.who} />}</span>}
                    <Rich text={line.t} />
                  </div>
                )}
                <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 text-white">
                  <button onClick={playPause} disabled={phase === 'task' && !(done(idx) && extOk(idx))} className="rounded-full p-1 hover:bg-white/15 disabled:opacity-40" title={phase === 'play' ? '暂停' : '播放'}>{phase === 'play' ? <Pause size={18} /> : <PlayIcon size={18} />}</button>
                  <div className="relative h-5 flex-1 cursor-pointer" onClick={barClick}>
                    <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25" />
                    <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/35" style={{ width: `${(starts[Math.max(maxIdx, far) + 1] / total) * 100}%` }} />
                    <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ width: `${(nowT / total) * 100}%`, background: '#F2C14E' }} />
                    {lines.map((l, k) => l.task && items[k] && (
                      <button key={k} onClick={(e) => { e.stopPropagation(); openTask(k); }} disabled={k > maxIdx} title={k > maxIdx ? '还没看到这里' : done(k) ? `看这道题：${items[k]!.label}` : '轮到你做这道题'}
                        className="absolute top-1/2 z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center disabled:cursor-not-allowed" style={{ left: `${(starts[k + 1] / total) * 100}%` }}>
                        <span className={`h-3 w-3 rounded-full border-2 border-white ${k > maxIdx ? 'bg-white/40' : done(k) ? 'bg-emerald-500' : 'bg-amber-400'} ${idx === k && phase === 'task' ? 'ring-2 ring-amber-200' : ''}`} />
                      </button>
                    ))}
                  </div>
                  <span className="w-[86px] text-right text-xs tabular-nums opacity-85">{fmt(nowT)} / {fmt(total)}</span>
                  <button onClick={() => { const m = !muted; setMuted(m); try { localStorage.setItem('tq-mute', m ? '1' : '0'); } catch { /* */ } }} className="rounded-full p-1 hover:bg-white/15" title={muted ? '打开配音' : '关掉配音（只看字幕）'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
                </div>
              </div>
              {phase === 'cover' && (
                <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center bg-black/45 text-white">
                  <div className="kai text-5xl">{play.title}</div>
                  <div className="mt-2 text-lg opacity-85">{play.sub}</div>
                  <button onClick={() => { sfx('click'); setPhase('play'); }} className="mt-6 flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-lg font-black text-[#2B2722]"><PlayIcon size={22} />{lastDone >= 0 ? '接着看' : '开始'}</button>
                </div>
              )}
              {phase === 'end' && (
                <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-4 bg-black/50 text-white">
                  <div className="kai text-4xl">这一回看完了</div>
                  {play.next && PLAY_BY_ID[play.next] ? <Btn size="lg" color={play.color} onClick={() => go(`/c/${play.next}`)}>翻到下一回 ›</Btn> : <Btn size="lg" color={play.color} onClick={() => go('/')}>合上书</Btn>}
                  {play.nextNote && <div className="text-sm opacity-85">{play.nextNote}</div>}
                  <button onClick={() => { setIdx(0); setPhase('play'); }} className="flex items-center gap-1 text-sm font-bold underline opacity-85"><RotateCcw size={14} />从头再看</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- 台本 ---------- */}
        <Script play={play} items={items} far={Math.min(far, n - 1)} idx={idx} phase={phase} maxIdx={maxIdx} onSeek={seek} onTask={openTask} onExt={(it, ext) => setExtOpen({ it, ext })} onBack={jump} askHint={askHint} line={line} item={atTask ? item : null} />
      </div>

      {glossPop && (
        <div className="fixed z-[70] max-w-[320px] -translate-x-1/2 rounded-2xl bg-white px-4 py-3 shadow-2xl ring-2 ring-sky-200" style={{ left: Math.min(window.innerWidth - 170, Math.max(170, glossPop.x)), top: Math.min(window.innerHeight - 150, glossPop.y + 18) }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-baseline gap-2"><Glasses size={16} className="shrink-0 self-center text-sky-600" /><b className="kai text-2xl">{glossPop.w}</b>{glossPop.g.py && <span className="text-ink2">{glossPop.g.py}</span>}</div>
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

// ---------------- 画面里的题 ----------------
// 卡片上做的（长文本、点毛病、改错）：卡片在画面上方；其余在画面下方的小弹层 / 大弹层里。做完了，下面出讲解、拓展、继续。
function TaskView({ it, line, prev, color, vh, bottomEl, onCont, onExt, onBack, onHint }: { it: Item; line: Line; prev?: Line; color: string; vh: number; bottomEl: HTMLDivElement | null; onCont: () => void; onExt: (e: Ext) => void; onBack: (b: Back) => void; onHint: (h: string) => void }) {
  const rec = useGame((s) => s.player?.recs[it.id]);
  const finished = rec?.status === 'done';
  const steps = scoredSteps(it);
  const [step, setStep] = useState(() => { const a = ansOf(it); let k = 0; while (k < steps.length - 1 && a[steps[k].key]) k++; return k; });
  const [scores] = useState<number[]>(() => steps.map((s) => ansOf(it)[s.key]?.sc ?? 0));
  const [hintN, setHintN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { startItem(it); }, [it.id]);
  const exts = extsOf(rec);
  const revealed = (it.ext ?? []).some((e) => e.reveal && exts[e.id] !== undefined);
  const need = requiredExts(it, rec).filter((e) => exts[e.id] === undefined);
  const stepDone = (i: number, x: number) => {
    scores[i] = x;
    if (i + 1 < steps.length) { setTimeout(() => setStep(i + 1), 700); return; }
    if (finished) return;
    const { stars, perf } = resultOf(scores, rec?.unsure ?? 0);
    setTimeout(() => { finishItem(it, stars, perf); sfx('star'); const c = centerOf(ref.current); fly(c.x, c.y, stars); setData(it, { scores }); }, 400);
  };
  const s = steps[step], lay = layoutOf(s);
  const body = <div key={s.key}><PlayStep it={it} s={s} color={color} onDone={(x) => stepDone(step, x)} revealed={revealed} /></div>;
  const hintBtn = !finished && hintN < it.hints.length && (
    <button onClick={(e) => { e.stopPropagation(); sfx('hint'); onHint(it.hints[hintN]); setHintN(hintN + 1); }} className="flex shrink-0 items-center gap-1 rounded-full border-2 border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[13px] font-black text-sky-800" title="给我一点提示（不扣星）"><Glasses size={15} />{hintN ? '再提示' : '提示'}</button>
  );
  const foot = finished && (
    <div className="mt-2 border-t border-[#EFE6D2] pt-2">
      <div className="flex gap-2 text-[15px] leading-relaxed"><Glasses size={18} className="mt-0.5 shrink-0 text-sky-600" /><div><Rich text={it.explain} /></div></div>
      {(it.back ?? []).map((b) => <button key={b.label} onClick={() => onBack(b)} className="ml-6 mt-1 flex items-center gap-1 text-left text-sm font-black text-sky-700 underline"><CornerUpLeft size={14} className="shrink-0" />{b.label}</button>)}
      <div className="sticky -bottom-3 -mx-4 -mb-3 mt-2 flex flex-wrap items-center gap-2 bg-[#FFFDF8] px-4 pb-2 pt-1.5">
        <Stars n={rec!.stars} size={18} />
        {(it.ext ?? []).map((e) => <ExtChip key={e.id} e={e} need={need.some((x) => x.id === e.id) || requiredExts(it, rec).some((x) => x.id === e.id)} done={exts[e.id] !== undefined} onClick={() => onExt(e)} />)}
        <span className="ml-auto" />
        {need.length > 0 ? <Btn size="sm" color={color} onClick={() => onExt(need[0])}>先做拓展</Btn> : <Btn size="sm" color={color} onClick={onCont}>继续 ▶</Btn>}
      </div>
    </div>
  );
  const mis = s.kind === 'mis' ? (s as MisSub) : null;
  const cardKind = s.kind === 'long' || (mis && mis.src) ? 'yuan' : 'ai';
  return (
    <>
      {lay === 'card' && (
        <motion.div ref={ref} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute left-1/2 top-[4%] z-10 max-h-[64%] w-[90%] -translate-x-1/2 overflow-visible">
          {mis?.src && <div className="mb-1.5 rounded-xl bg-[#F7EFD9]/95 px-5 py-2 shadow-xl"><div className="text-xs font-black text-[#8A6A2F]">{prev?.card?.by ?? '原文'}</div><div className="kai text-[22px] leading-relaxed"><Rich text={prev?.card?.t ?? mis.src} /></div></div>}
          <div className={`rounded-xl px-5 py-3 shadow-2xl ${cardKind === 'yuan' && !mis ? 'bg-[#F7EFD9]/96' : 'bg-sky-50/96'}`}>
            <div className="mb-0.5 flex items-center gap-2">
              {cardKind === 'ai' || mis ? <span className="flex items-center gap-1 text-xs font-black text-sky-700"><Glasses size={15} />{mis?.title ?? (mis?.src ? '译文' : line.who === 'AI 眼镜' ? '小结' : '')}</span> : null}
              <span className="ml-auto">{hintBtn}</span>
            </div>
            {body}
          </div>
        </motion.div>
      )}
      {bottomEl && createPortal(
        lay === 'card' ? (foot ? <div className="mx-3 mb-2 overflow-auto rounded-xl bg-[#FFFDF8]/96 px-4 py-3 shadow-xl [&>div]:mt-0 [&>div]:border-0 [&>div]:pt-0" style={{ maxHeight: vh * 0.4 }}>{foot}</div> : null) : (
          <motion.div ref={ref} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={(e) => e.stopPropagation()} className="relative mx-3 mb-2 overflow-auto rounded-xl bg-[#FFFDF8]/96 px-4 py-3 shadow-xl backdrop-blur" style={{ maxHeight: vh * (lay === 'big' ? 0.8 : 0.6) }}>
            {hintBtn && <div className="float-right ml-2">{hintBtn}</div>}
            {body}
            {foot}
          </motion.div>
        ), bottomEl)}
    </>
  );
}
const ExtChip = ({ e, need, done, onClick }: { e: Ext; need: boolean; done: boolean; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-1.5 rounded-full border-2 border-[#E6DCC6] bg-white px-2.5 py-0.5 text-[13px] font-bold hover:border-amber-300">
    <span className={`rounded-full px-1.5 text-[11px] font-black text-white ${need ? 'bg-rose-500' : 'bg-[#9C8F7A]'}`}>{need ? '必做' : '选做'}</span>{e.title}{done && <span className="text-emerald-600">✓</span>}
  </button>
);

// ---------------- 台本（右边窄栏） ----------------
function Script({ play, items, far, idx, phase, maxIdx, onSeek, onTask, onExt, onBack, askHint, line, item }: { play: Play; items: (Item | null)[]; far: number; idx: number; phase: string; maxIdx: number; onSeek: (k: number) => void; onTask: (k: number) => void; onExt: (it: Item, e: Ext) => void; onBack: (b: Back) => void; askHint: string; line: Line; item: Item | null }) {
  const p = useGame((s) => s.player)!;
  const cur = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollInto(list.current, cur.current); }, [idx, far]);
  return (
    <aside className="hidden w-[330px] shrink-0 flex-col overflow-hidden rounded-2xl border-2 border-[#E6DCC6] bg-[#FFFDF8] lg:flex">
      <div className="border-b border-[#EFE6D2] px-4 py-2"><div className="font-black">台本</div><div className="text-xs text-ink2">看不懂的字，鼠标放上去试试，能点的点一下就有解释。点一句，从那里看。</div></div>
      <div ref={list} className="min-h-0 flex-1 space-y-0.5 overflow-auto px-2 py-2">
        {play.lines.slice(0, far + 1).map((l, k) => {
          const it = items[k], r = it ? p.recs[it.id] : undefined, isDone = r?.status === 'done';
          const showTask = it && (k < far || isDone || (k === idx && phase === 'task'));
          return (
            <div key={k} ref={k === idx ? cur : undefined}>
              <div onClick={() => onSeek(k)} className={`cursor-pointer rounded-lg px-2 py-1 text-[14px] leading-relaxed hover:bg-[#F6EFDF] ${k === idx ? 'bg-[#F6EFDF] ring-1 ring-[#E2D2AE]' : ''} ${l.card?.kind === 'yuan' || l.card?.kind === 'poem' ? 'kai text-[16px]' : ''}`}>
                {l.who && <span className={`mr-1 rounded px-1 py-px align-middle font-sans text-[11px] font-black text-white ${l.voice === 'ai' ? 'bg-sky-600' : 'bg-[#8A6A2F]'}`}>{l.voice === 'ai' ? <Glasses size={12} className="inline" /> : <Rich text={l.who} />}</span>}
                <Rich text={l.t} />
              </div>
              {showTask && (
                <div className="mb-1 ml-3 mt-0.5 rounded-lg border border-[#E6DCC6] bg-white px-2 py-1.5">
                  <button onClick={() => onTask(k)} disabled={k > maxIdx} className="flex w-full items-center gap-1.5 text-left text-[13px] font-black">
                    {isDone ? <Stars n={r!.stars} size={13} /> : <span className="rounded-full bg-amber-400 px-1.5 text-[11px] text-white">待做</span>}
                    <span className="flex-1">{isDone ? it.label : '轮到你'}</span><span className="text-[11px] font-bold text-ink2">{isDone ? '看看' : ''}</span>
                  </button>
                  {isDone && (it.ext ?? []).length > 0 && <div className="mt-1 flex flex-wrap gap-1">{it.ext!.map((e) => <ExtChip key={e.id} e={e} need={requiredExts(it, r).some((x) => x.id === e.id)} done={extsOf(r)[e.id] !== undefined} onClick={() => onExt(it, e)} />)}</div>}
                  {isDone && (it.back ?? []).map((b) => <button key={b.label} onClick={() => onBack(b)} className="mt-1 flex items-center gap-1 text-left text-[12px] font-black text-sky-700 underline"><CornerUpLeft size={12} className="shrink-0" />{b.label}</button>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Ask play={play} item={item} line={line} hint={askHint} />
    </aside>
  );
}

// ---------------- 自己提问（小） ----------------
function Ask({ play, item, line, hint }: { play: Play; item: Item | null; line: Line; hint: string }) {
  const p = useGame((s) => s.player)!;
  const aiOn = useGame((s) => s.config.ai);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<{ q: string; a: string; fb?: string } | null>(null);
  const [err, setErr] = useState('');
  if (!aiOn) return null;
  const ask = async (text?: string) => {
    const t = (text ?? q).trim(); if (!t || busy) return;
    setBusy(true); setErr(''); logPlay(play.id, 'ask', t);
    try {
      if (DEMO) { await new Promise((r) => setTimeout(r, 500)); setA({ q: t, a: '（演示版没有连接 AI。课堂版里，我会结合你正在看的这一句来回答。）' }); }
      else { const r = await api.ask({ pid: p.pid, token: p.token, play: play.id, item: item?.id ?? '', line: line.t, q: t }); setA({ q: t, a: r.a }); }
      setQ('');
    } catch (e) { setErr(String((e as Error).message || e)); } finally { setBusy(false); }
  };
  const fb = (v: string) => { if (!a) return; logPlay(play.id, 'askfb', `${v}｜${a.q}`); setA({ ...a, fb: v }); sfx('click'); };
  return (
    <div className="border-t border-[#EFE6D2] px-3 py-2.5">
      {a && (
        <div className="mb-2 max-h-[30vh] overflow-auto rounded-xl bg-sky-50 px-3 py-2 text-[14px] leading-relaxed">
          <div className="text-xs text-ink2">你问：{a.q}</div>
          <div className="mt-0.5">{a.a}</div>
          {a.fb ? <div className="mt-1 text-xs text-ink2">已记下：{a.fb}。老师会看到。</div> : <div className="mt-1.5 flex gap-1.5 text-xs">{['清楚了', '没说清', '好像不对'].map((v) => <button key={v} onClick={() => fb(v)} className="rounded-full border border-sky-200 bg-white px-2 py-0.5 font-bold">{v}</button>)}</div>}
        </div>
      )}
      <div className="mb-1 flex items-center gap-1 text-xs font-black text-ink2"><Glasses size={14} className="text-sky-600" />还有不明白的？问我</div>
      <div className="flex gap-1.5"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) ask(); }} maxLength={120} placeholder={`比如：${hint}`} className="min-w-0 flex-1 rounded-lg border-2 border-[#E6DCC6] bg-white px-2.5 py-1 text-[13px] outline-none focus:border-sky-300" /><button disabled={!q.trim() || busy} onClick={() => ask()} className="rounded-lg bg-sky-600 px-2.5 text-white disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}</button></div>
      {!q && !busy && <button onClick={() => ask(hint)} className="mt-1 text-left text-[12px] font-bold text-sky-700 underline">就问这个：{hint}</button>}
      {err && <div className="mt-1 text-sm text-rose-700">{err}</div>}
    </div>
  );
}

// ---------------- 拓展（居中弹窗：讲—例—练，一段接一段；做过的直接显示答案） ----------------
function ExtModal({ it, ext, color, onClose, gloss, onGloss }: { it: Item; ext: Ext; color: string; onClose: () => void; gloss: Record<string, Gloss>; onGloss: (w: string, g: Gloss, el: HTMLElement) => void }) {
  const rec = useGame((s) => s.player?.recs[it.id]);
  const required = requiredExts(it, rec).some((e) => e.id === ext.id);
  const already = extsOf(rec)[ext.id] !== undefined;
  const pre = ext.id + ':';
  const [step, setStep] = useState(() => {
    if (already) return ext.steps.length;
    const a = ansOf(it); if (!ext.steps.some((s) => a[pre + s.key])) return 0;
    let k = 0; while (k < ext.steps.length && (ext.steps[k].kind === 'teach' || a[pre + ext.steps[k].key])) k++; return k;
  });
  const [scores] = useState<Record<number, number>>(() => Object.fromEntries(ext.steps.map((s, i) => [i, ansOf(it)[pre + s.key]?.sc]).filter((x) => x[1] !== undefined)));
  const finished = step >= ext.steps.length;
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (step > 0 && !already) scrollInto(boxRef.current, refs.current[Math.min(step, ext.steps.length - 1)]); }, [step]);
  const next = (i: number, x?: number) => {
    if (i !== step) return;
    if (x !== undefined) scores[i] = x;
    if (i + 1 < ext.steps.length) { setTimeout(() => setStep(i + 1), x === undefined ? 0 : 700); return; }
    const vs = Object.values(scores);
    setExtDone(it, ext.id, vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 1); setStep(ext.steps.length); sfx('star');
  };
  const canClose = !required || finished;
  return (
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2B2722]/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => canClose && onClose()}>
      <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} ref={boxRef} className="card relative max-h-[90vh] w-full max-w-[820px] overflow-auto p-5" onClick={(e) => e.stopPropagation()}>
        <GlossContext.Provider value={{ gloss, onGloss }}>
          <SaveCtx.Provider value={pre}>
            <div className="mb-3 flex items-center gap-2"><span className={`rounded-full px-2.5 py-0.5 text-xs font-black text-white ${required ? 'bg-rose-500' : 'bg-[#9C8F7A]'}`}>{required ? '必做' : '选做'}</span><span className="text-xl font-black">{ext.title}</span>
              {canClose && <button onClick={onClose} className="ml-auto rounded-full p-1.5 text-ink2 hover:bg-black/5" aria-label="关闭"><X size={20} /></button>}</div>
            <div className="space-y-3">
              {ext.steps.map((s, i) => i <= step && (
                <div key={s.key} ref={(el) => { refs.current[i] = el; }}>
                  {s.kind === 'teach' ? <TeachView s={s} color={color} done={i < step} onDone={() => next(i)} /> : <PlayStep it={it} s={s} color={color} onDone={(x) => next(i, x)} />}
                </div>
              ))}
            </div>
            {finished && (
              <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                {ext.reveal && <span className="text-sm text-emerald-700">刚才那道题每个选项的解释，已经揭开了。</span>}
                <Btn color={color} onClick={onClose}>{required ? '好，回到故事 ›' : '关上'}</Btn>
              </div>
            )}
            {!finished && !required && <div className="mt-3 text-right"><button onClick={onClose} className="text-sm font-bold text-ink2 underline">先不做了，回到故事</button></div>}
          </SaveCtx.Provider>
        </GlossContext.Provider>
      </motion.div>
    </motion.div>
  );
}
