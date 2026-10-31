// 播放式故事：画面（水墨 + 镜头推拉）+ 配音 + 字幕，一句一句往下播；播到题就停，题在画面里做。
// 画面尽量大：字幕、进度条都在画面里；右边窄栏是“台本”（播过的每一句，可点的字随时能点；做过的题、拓展入口挂在题下面），最下面可以问 AI。
// 做过的题点进度条上的标记、或者台本里的题，就能回来看自己的答案；拓展在居中弹窗里，按“讲—例—练”往下走。
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CornerUpLeft, Glasses, Loader2, Pause, Play as PlayIcon, RotateCcw, Send, Volume2, VolumeX, X } from 'lucide-react';
import type { Back, Ext, Gloss, Item, Line, MisSub, Play } from '../shared/types';
import { PLAY_BY_ID, voiceFile, voiceLine, type Mode } from '../shared/play';
import { resultOf, scoredSteps, taskItem } from '../shared/adapt';
import { Art, Btn, GlossContext, Rich, Stars, centerOf } from '../components/ui';
import { finishItem, fly, getState as useGameState, logPlay, markUnsure, setData, setExtDone, startItem, toast, useGame } from '../game/store';
import type { AskOut } from '../shared/ai';
import { api } from '../game/api';
import { sfx } from '../game/sound';
import { PlayStep, SaveCtx, TeachView, ansOf, layoutOf } from '../items/steps2';
import { DEMO } from '../game/demo';
import { Film } from '../film/Film';

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
  const [mode, setMode] = useState<Mode>(() => { try { const m = localStorage.getItem('tq-mode'); return m === 'wy' || m === 'dz' ? m : 'bh'; } catch { return 'bh'; } });
  const lineDur = (l: Line) => { const v = voiceLine(l, mode); return (dur[voiceFile(v)] ?? EST(v.read ?? v.t)) + (l.pause ?? 0.35); };
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
  const [glossPop, setGlossPop] = useState<{ w: string; g: Gloss; x: number; y: number; lv: 1 | 2; more?: boolean; wrong?: number[]; got?: boolean } | null>(null);
  const [extOpen, setExtOpen] = useState<{ it: Item; ext: Ext } | null>(null);
  // 点字的小窗：点外面任何地方就关上
  const glossRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!glossPop) return;
    const f = (e: PointerEvent) => { if (!glossRef.current?.contains(e.target as Node)) setGlossPop(null); };
    const tm = setTimeout(() => document.addEventListener('pointerdown', f, true));
    return () => { clearTimeout(tm); document.removeEventListener('pointerdown', f, true); };
  }, [glossPop?.w, glossPop?.x]);
  const [bottomEl, setBottomEl] = useState<HTMLDivElement | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const timer = useRef<number | null>(null);
  const t0 = useRef(0);
  const line = lines[idx];
  const item = items[idx];

  // 播放区占满左边；画面（16:9）在里面尽量大、居中，多出来的地方是黑边（上下或左右）
  const box = useRef<HTMLDivElement>(null);
  const [bs, setBs] = useState({ w: 960, h: 600 });
  useLayoutEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setBs({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const vw = Math.max(320, Math.min(bs.w, (bs.h * 16) / 9)), vh = (vw * 9) / 16;
  const vx = (bs.w - vw) / 2, vy = Math.max(0, (bs.h - vh) / 2);
  const CTRL = 38; // 控制条高度：贴着播放区最下面

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
    const l = lines[idx], file = voiceFile(voiceLine(l, mode)), d = lineDur(l);
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
  }, [idx, phase, muted, dur, mode]);
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
  const onGloss = (w: string, g: Gloss, el: HTMLElement) => { const r = el.getBoundingClientRect(); sfx('hint'); setGlossPop({ w, g, x: r.left + r.width / 2, y: r.bottom, lv: 1 }); logPlay(id, 'gloss', w); };
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

  const stem = atTask && taskLay !== 'card' && !line.card && !line.hide ? line : null; // 做题时，字幕展开成答题区：这句话就是题干
  return (
    <GlossContext.Provider value={{ gloss: play.gloss, onGloss }}>
      <div className="flex h-[calc(100dvh-66px)] gap-2 overflow-hidden p-2" onClick={() => setGlossPop(null)}>
        {/* ---------- 播放区：占满左边 ---------- */}
        <div ref={box} className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-[#1C1916]">
          {/* 画面 */}
          <div className="absolute overflow-hidden" style={{ left: vx, top: vy, width: vw, height: vh }}>
            {line.shots
              ? <Film shots={line.shots} lid={`${id}-${idx}`} prog={() => (phase === 'play' ? (performance.now() - t0.current) / 1000 / lineDur(line) : phase === 'task' || phase === 'end' ? 1 : phase === 'cover' ? 0 : elapsed / lineDur(line))} />
              : <Cam key={`${idx}-${phase === 'play' ? 'p' : 's'}`} cam={cam} dur={lineDur(line)} moving={phase === 'play'}>{scene && <Art spec={scene} className="h-full w-full" />}</Cam>}
            <AnimatePresence>
              {showCard && (
                <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`absolute left-1/2 top-[7%] max-w-[86%] -translate-x-1/2 rounded-xl px-6 py-3 shadow-2xl ${line.card!.kind === 'ai' ? 'bg-sky-50/95' : 'bg-[#F7EFD9]/95'}`}>
                  {line.card!.by && <div className="mb-1 text-xs font-black text-[#8A6A2F]">{line.card!.by}</div>}
                  <div className={`${line.card!.kind === 'poem' ? 'kai text-center leading-[1.85]' : line.card!.kind === 'yuan' ? 'kai leading-relaxed' : ''}`} style={{ fontSize: Math.max(18, Math.min(27, vw / 40)) }}><Rich text={line.card!.t} /></div>
                </motion.div>
              )}
            </AnimatePresence>
            {atTask && <TaskView key={item!.id} it={item!} line={line} prev={lines[idx - 1]} stem={stem} mode={mode} color={play.color} bh={bs.h - CTRL} bottomEl={bottomEl} onCont={cont} onExt={(ext) => setExtOpen({ it: item!, ext })} onBack={jump} onHint={(h) => { setHint(h); markUnsure(item!); }} />}
            {hint && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-3 top-3 z-20 flex max-w-[44%] gap-2 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-xl">
                <Glasses size={20} className="mt-0.5 shrink-0 text-sky-600" /><div className="text-[15px] font-bold leading-relaxed"><Rich text={hint} /></div>
                <button onClick={() => setHint(null)} className="-mr-1 -mt-1 self-start rounded-full p-0.5 text-ink2 hover:bg-black/5"><X size={14} /></button>
              </motion.div>
            )}
            {/* 字幕：在画面里，躲开下面的控制条 */}
            {showSub && !stem && (
              <div className="absolute inset-x-0 bg-gradient-to-t from-black/70 to-black/0 px-6 pb-1.5 pt-6 text-center font-bold leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,.7)]" style={{ fontSize: subSize, bottom: Math.max(0, CTRL - vy) }}>
                {line.who && <span className={`mr-2 rounded-md px-2 py-0.5 align-middle text-[0.62em] ${line.voice === 'ai' ? 'bg-sky-600' : 'bg-[#8A6A2F]'}`}>{line.voice === 'ai' ? <Glasses size={16} className="inline" /> : <Rich text={line.who} />}</span>}
                <LineText key={idx} l={line} mode={mode} />
              </div>
            )}
            {phase === 'cover' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white">
                <div className="kai text-5xl">{play.title}</div>
                <div className="mt-2 text-lg opacity-85">{play.sub}</div>
                <button onClick={() => { sfx('click'); setPhase('play'); }} className="mt-6 flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-lg font-black text-[#2B2722]"><PlayIcon size={22} />{lastDone >= 0 ? '接着看' : '开始'}</button>
              </div>
            )}
            {phase === 'end' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 text-white">
                <div className="kai text-4xl">这一回看完了</div>
                {play.next && PLAY_BY_ID[play.next] ? <Btn size="lg" color={play.color} onClick={() => go(`/c/${play.next}`)}>翻到下一回 ›</Btn> : <Btn size="lg" color={play.color} onClick={() => go('/')}>合上书</Btn>}
                {play.nextNote && <div className="text-sm opacity-85">{play.nextNote}</div>}
                <button onClick={() => { setIdx(0); setPhase('play'); }} className="flex items-center gap-1 text-sm font-bold underline opacity-85"><RotateCcw size={14} />从头再看</button>
              </div>
            )}
          </div>
          {/* 左上角：目录、回目（有黑边就在黑边里） */}
          <div className="absolute left-2 top-2 z-20 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-white backdrop-blur-sm">
            <button onClick={() => go('/')} className="text-[13px] font-bold underline opacity-90">目录</button>
            <span className="kai text-[17px]">{play.title}</span>
          </div>
          {retTo && PLAY_BY_ID[retTo[0]] && <button onClick={() => go(`/c/${retTo[0]}?at=${retTo[1]}`)} className="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-black text-[#2B2722] shadow"><CornerUpLeft size={15} />回到{PLAY_BY_ID[retTo[0]].title.split('　')[0]}</button>}
          {/* 最下面一摞：答题区（从字幕的位置展开，有黑边就往黑边里长）→ 控制条（播放区最下面） */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col">
            <div ref={setBottomEl} />
            <div className="flex items-center gap-2 bg-black/70 px-3 text-white" style={{ height: CTRL }}>
              <button onClick={playPause} disabled={phase === 'task' && !(done(idx) && extOk(idx))} className="rounded-full p-1 hover:bg-white/15 disabled:opacity-40" title={phase === 'play' ? '暂停' : '播放'}>{phase === 'play' ? <Pause size={18} /> : <PlayIcon size={18} />}</button>
              <div className="relative h-5 flex-1 cursor-pointer" onClick={barClick}>
                <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25" />
                <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/35" style={{ width: `${(starts[Math.max(maxIdx, far) + 1] / total) * 100}%` }} />
                <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ width: `${(nowT / total) * 100}%`, background: '#F2C14E' }} />
                {lines.map((l, k) => {
                  if (!l.task || !items[k]) return null;
                  const st = stateOf(items[k], p.recs[items[k]!.id]);
                  return (
                    <button key={k} onClick={(e) => { e.stopPropagation(); openTask(k); }} disabled={k > maxIdx} title={k > maxIdx ? '还没看到这里' : st === 'all' ? `做完了：${items[k]!.label}` : st === 'part' ? `题做完了，还有拓展没做：${items[k]!.label}` : '轮到你做这道题'}
                      className="absolute top-1/2 z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center disabled:cursor-not-allowed" style={{ left: `${(starts[k + 1] / total) * 100}%` }}>
                      <span className={`h-3.5 w-3.5 rounded-full border-2 ${k > maxIdx ? 'border-white/60 bg-white/30' : st === 'all' ? 'border-white bg-emerald-500' : st === 'part' ? 'border-emerald-400 bg-[#1C1916]' : 'border-white bg-amber-400'} ${idx === k && phase === 'task' ? 'ring-2 ring-amber-200' : ''}`} />
                    </button>
                  );
                })}
              </div>
              <span className="w-[86px] text-right text-xs tabular-nums opacity-85">{fmt(nowT)} / {fmt(total)}</span>
              <div className="flex overflow-hidden rounded-full bg-white/15 text-[12px] font-bold" title="白话：现代汉语讲；文言：出自《史记》的句子用原文讲、配音念原文；对照：原文下面附白话">
                {([['bh', '白话'], ['wy', '文言'], ['dz', '对照']] as const).map(([m, t]) => <button key={m} onClick={() => { setMode(m); try { localStorage.setItem('tq-mode', m); } catch { /* */ } }} className={`px-2 py-0.5 ${mode === m ? 'bg-white text-[#2B2722]' : 'hover:bg-white/10'}`}>{t}</button>)}
              </div>
              <button onClick={() => { const m = !muted; setMuted(m); try { localStorage.setItem('tq-mute', m ? '1' : '0'); } catch { /* */ } }} className="rounded-full p-1 hover:bg-white/15" title={muted ? '打开配音' : '关掉配音（只看字幕）'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            </div>
          </div>
        </div>

        {/* ---------- 台本（AI 眼镜） ---------- */}
        <Script play={play} mode={mode} items={items} far={Math.min(far, n - 1)} idx={idx} phase={phase} maxIdx={maxIdx} onSeek={seek} onTask={openTask} onExt={(it, ext) => setExtOpen({ it, ext })} onBack={jump} askHint={askHint} line={line} item={atTask ? item : null} />
      </div>

      {glossPop && (() => {
        // 点字：先给这个字词的意思；要是还不明白，再展开“在这句话里”（两层都记下来）
        const above = glossPop.y > window.innerHeight * 0.62;
        return (
          <div ref={glossRef} className="fixed z-[100] w-max max-w-[min(340px,92vw)] rounded-2xl bg-white px-4 py-2.5 shadow-2xl ring-2 ring-sky-200" style={{ left: Math.min(window.innerWidth - 178, Math.max(178, glossPop.x)), top: above ? glossPop.y - 30 : glossPop.y + 8, transform: `translate(-50%, ${above ? '-100%' : '0'})` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-baseline gap-2"><Glasses size={16} className="shrink-0 self-center text-sky-600" /><b className="kai text-2xl">{glossPop.w}</b>{glossPop.g.py && <span className="text-[15px] text-ink2">{glossPop.g.py}</span>}</div>
            <div className="mt-0.5 text-[15px] leading-relaxed">{glossPop.g.d}</div>
            {glossPop.g.s && (glossPop.lv === 1
              ? <button onClick={() => { sfx('click'); setGlossPop({ ...glossPop, lv: 2 }); logPlay(id, 'gloss2', glossPop.w); }} className="mt-1.5 text-[14px] font-black text-sky-700 underline">放在这句话里怎么理解？</button>
              : <div className="mt-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-[15px] leading-relaxed"><div className="text-[12px] font-black text-sky-700">在这句话里</div>{glossPop.g.s}</div>)}
            {glossPop.g.more && (!glossPop.more
              ? <button onClick={() => { sfx('click'); setGlossPop({ ...glossPop, more: true, wrong: [] }); }} className="mt-1.5 block text-[14px] font-black text-[#9A5B2E] underline">🧭 这个字还能怎么用？</button>
              : <div className="mt-1.5 max-w-[320px] rounded-lg bg-amber-50 px-2.5 py-1.5 text-[15px] leading-relaxed">
                  <div>{glossPop.g.more.t}</div>
                  <div className="mt-1 font-black">{glossPop.g.more.q}</div>
                  <div className="mt-1 flex flex-wrap gap-1">{glossPop.g.more.opts.map(([t, ok], i) => {
                    const bad = glossPop.wrong?.includes(i), good = glossPop.got && ok;
                    return <button key={i} disabled={glossPop.got || bad} onClick={() => {
                      if (ok) { sfx('ok'); const first = !(useGameState().player?.recs[`${id}-log`]?.log ?? []).some((e) => e.q === 'more' && e.v === glossPop.w); logPlay(id, 'more', glossPop.w); if (first) toast({ emoji: '🧭', title: '探索分 +1', text: `“${glossPop.w}”的别的用法` }); setGlossPop({ ...glossPop, got: true }); }
                      else { sfx('no'); setGlossPop({ ...glossPop, wrong: [...(glossPop.wrong ?? []), i] }); }
                    }} className={`rounded-lg border-2 px-2 py-0.5 text-left font-bold ${good ? 'border-emerald-400 bg-emerald-50' : bad ? 'border-rose-200 bg-rose-50 text-ink2 line-through' : 'border-[#E6DCC6] bg-white hover:border-amber-300'}`}>{t}</button>;
                  })}</div>
                </div>)}
            {glossPop.g.back && <button onClick={() => jump(glossPop.g.back!)} className="mt-2 flex items-center gap-1 text-sm font-black text-sky-700 underline"><CornerUpLeft size={14} />{glossPop.g.back.label}</button>}
          </div>
        );
      })()}
      <AnimatePresence>{extOpen && <ExtModal key={extOpen.it.id + extOpen.ext.id} it={extOpen.it} ext={extOpen.ext} color={play.color} onClose={() => setExtOpen(null)} gloss={play.gloss} onGloss={(w, g, el) => onGloss(w, g, el)} />}</AnimatePresence>
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
function TaskView({ it, line, prev, stem, mode, color, bh, bottomEl, onCont, onExt, onBack, onHint }: { it: Item; line: Line; prev?: Line; stem: Line | null; mode: Mode; color: string; bh: number; bottomEl: HTMLDivElement | null; onCont: () => void; onExt: (e: Ext) => void; onBack: (b: Back) => void; onHint: (h: string) => void }) {
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
        {(it.ext ?? []).map((e) => <ExtChip key={e.id} e={e} done={exts[e.id] !== undefined} onClick={() => onExt(e)} />)}
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
        lay === 'card' ? (foot ? <div className="mx-2 mb-1.5 overflow-auto rounded-xl bg-[#FFFDF8]/96 px-4 py-3 shadow-xl [&>div]:mt-0 [&>div]:border-0 [&>div]:pt-0" style={{ maxHeight: bh * 0.4 }}>{foot}</div> : null) : (
          <motion.div ref={ref} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onClick={(e) => e.stopPropagation()} className="relative mx-2 mb-1.5 overflow-auto rounded-xl bg-[#FFFDF8]/96 px-4 py-2.5 shadow-xl backdrop-blur" style={{ maxHeight: bh * (lay === 'big' ? 0.86 : 0.62) }}>
            {hintBtn && <div className="float-right ml-2">{hintBtn}</div>}
            {stem && <div className="mb-1.5 text-[17px] font-bold leading-relaxed">{stem.who && <span className={`mr-1.5 rounded-md px-1.5 py-0.5 align-middle text-[12px] text-white ${stem.voice === 'ai' ? 'bg-sky-600' : 'bg-[#8A6A2F]'}`}>{stem.voice === 'ai' ? <Glasses size={14} className="inline" /> : <Rich text={stem.who} />}</span>}<LineText l={stem} mode={mode} /></div>}
            {body}
            {foot}
          </motion.div>
        ), bottomEl)}
    </>
  );
}
const ExtChip = ({ e, done, onClick }: { e: Ext; done: boolean; onClick: () => void }) => (
  <button onClick={onClick} className={`flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-[13px] font-bold ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-[#E6DCC6] bg-white hover:border-amber-300'}`}>
    {e.title}{done && <span className="text-emerald-600">✓</span>}
  </button>
);
/** 一道题做到哪了：todo 没做；part 做了，还有拓展没做；all 题和拓展都做完了 */
const stateOf = (it: Item | null, r: { status?: string; data?: Record<string, unknown> } | undefined) => !it ? 'all' : r?.status !== 'done' ? 'todo' : (it.ext ?? []).every((e) => extsOf(r)[e.id] !== undefined) ? 'all' : 'part';

/** 一句话按讲解模式显示：白话；文言（出自《史记》的用原文，旁边可以点开白话）；对照（原文，下面是白话） */
function LineText({ l, mode }: { l: Line; mode: Mode }) {
  const [show, setShow] = useState(false);
  if (mode === 'bh' || !l.wy) return <Rich text={l.t} />;
  return (
    <>
      <span className="kai text-[1.08em]"><Rich text={l.wy} /></span>
      {mode === 'wy' && <button onClick={(e) => { e.stopPropagation(); setShow(!show); }} className="ml-1.5 rounded-md border border-current px-1 align-middle text-[0.6em] font-bold opacity-75 hover:opacity-100">{show ? '收起' : '白话'}</button>}
      {(mode === 'dz' || show) && <span className="mt-0.5 block text-[0.9em] font-normal opacity-90"><Rich text={l.t} /></span>}
    </>
  );
}

// ---------------- 右边：看过的内容（可点的字带虚线，随时能点；谁说的一眼看得出；不套框，省地方）----------------
function Script({ play, mode, items, far, idx, phase, maxIdx, onSeek, onTask, onExt, onBack, askHint, line, item }: { play: Play; mode: Mode; items: (Item | null)[]; far: number; idx: number; phase: string; maxIdx: number; onSeek: (k: number) => void; onTask: (k: number) => void; onExt: (it: Item, e: Ext) => void; onBack: (b: Back) => void; askHint: string; line: Line; item: Item | null }) {
  const p = useGame((s) => s.player)!;
  const cur = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollInto(list.current, cur.current); }, [idx, far]);
  return (
    <aside className="glosslog hidden w-[350px] shrink-0 flex-col overflow-hidden rounded-2xl bg-[#FFFDF8] shadow-sm lg:flex">
      <div className="border-b border-[#EFE6D2] px-3 py-1.5">
        <div className="text-[16px] font-black">看过的内容</div>
        <div className="text-[13px] text-ink2">点一句，回到那里看；点虚线的字，看解释</div>
      </div>
      <div ref={list} className="min-h-0 flex-1 overflow-auto py-1">
        {play.lines.slice(0, far + 1).map((l, k) => {
          const it = items[k], r = it ? p.recs[it.id] : undefined, isDone = r?.status === 'done';
          const showTask = it && (k < far || isDone || (k === idx && phase === 'task'));
          const yuan = l.card && (l.card.kind === 'yuan' || l.card.kind === 'poem');
          const on = k === idx;
          return (
            <div key={k} ref={on ? cur : undefined} className={on ? 'bg-amber-50 shadow-[inset_3px_0_0_#E0A030]' : ''}>
              <div onClick={() => onSeek(k)} className={`cursor-pointer px-3 py-1 leading-relaxed hover:bg-[#F6EFDF] ${l.voice === 'ai' ? 'text-sky-900' : 'text-[#2F2A24]'} ${yuan ? 'kai text-[17px]' : 'text-[15px]'}`}>
                {l.voice === 'ai' && <Glasses size={15} className="mr-1 inline align-[-2px] text-sky-600" />}
                {l.who && l.voice !== 'ai' && <span className="mr-1 font-sans text-[13px] font-black text-[#9A5B2E]"><Rich text={l.who} />：</span>}
                {!l.who && yuan && l.card?.by && <span className="mr-1 font-sans text-[12px] font-black text-[#8A6A2F]">{l.card.by}</span>}
                <LineText l={l} mode={mode} />
              </div>
              {showTask && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 pb-1 pl-6 text-[13px]">
                  <button onClick={() => onTask(k)} disabled={k > maxIdx} className="flex items-center gap-1 font-black hover:underline">
                    {isDone ? <Stars n={r!.stars} size={13} /> : <span className="rounded-full bg-amber-400 px-1.5 text-[11px] text-white">待做</span>}
                    {isDone ? it.label : '轮到你'}
                  </button>
                  {isDone && (it.ext ?? []).map((e) => { const d = extsOf(r)[e.id] !== undefined; return <button key={e.id} onClick={() => onExt(it, e)} className={`font-bold hover:underline ${d ? 'text-emerald-700' : 'text-[#9A5B2E]'}`}>· {e.title}{d ? ' ✓' : ''}</button>; })}
                  {isDone && (it.back ?? []).map((b) => <button key={b.label} onClick={() => onBack(b)} className="flex items-center gap-0.5 text-left font-bold text-sky-700 hover:underline"><CornerUpLeft size={12} className="shrink-0" />{b.label}</button>)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Ask play={play} item={item} line={line} before={play.lines.slice(Math.max(0, idx - 2), idx).map((l) => l.t)} hint={askHint} />
    </aside>
  );
}

// ---------------- 问 AI：不直接给全部答案——先讲一半，问你一个小问题，你想对了再讲后一半（想对了得 1 个探索分） ----------------
function Ask({ play, item, line, before, hint }: { play: Play; item: Item | null; line: Line; before: string[]; hint: string }) {
  const p = useGame((s) => s.player)!;
  const aiOn = useGame((s) => s.config.ai);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<(AskOut & { ask: string; fb?: string; open: boolean }) | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [got, setGot] = useState<number | null>(null);
  const [err, setErr] = useState('');
  if (!aiOn) return null;
  const ask = async (text?: string) => {
    const t = (text ?? q).trim(); if (!t || busy) return;
    setBusy(true); setErr(''); logPlay(play.id, 'ask', t);
    try {
      const r: AskOut = DEMO
        ? (await new Promise((res) => setTimeout(res, 500)), { a1: '（演示版没有连接 AI。课堂版里，我会先讲一半，再问你一个小问题，让你自己想出后一半。）', q: '', opts: [], a2: '' })
        : await api.ask({ pid: p.pid, token: p.token, play: play.id, item: item?.id ?? '', line: line.t, before, q: t });
      setA({ ...r, ask: t, open: true }); setWrong([]); setGot(null); setQ('');
    } catch (e) { setErr(String((e as Error).message || e)); } finally { setBusy(false); }
  };
  const pick = (i: number) => {
    if (!a || got !== null || wrong.includes(i)) return;
    if (a.opts[i].ok) { sfx('ok'); setGot(i); if (!wrong.length) logPlay(play.id, 'askok', a.ask); toast({ emoji: '🧭', title: wrong.length ? '想通了' : '探索分 +1', text: wrong.length ? '' : '你自己想出了后一半' }); }
    else { sfx('no'); setWrong((w) => [...w, i]); }
  };
  const fb = (v: string) => { if (!a) return; logPlay(play.id, 'askfb', `${v}｜${a.ask}`); setA({ ...a, fb: v }); sfx('click'); };
  const showRest = !a?.q || got !== null;
  return (
    <div className="border-t border-[#EFE6D2] px-3 py-2.5">
      {a?.open && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-[104px] right-3 z-[60] max-h-[72vh] w-[min(470px,94vw)] overflow-auto rounded-2xl bg-white px-4 py-3 text-[15px] leading-relaxed shadow-2xl ring-2 ring-sky-200">
          <div className="mb-1 flex items-start gap-2"><Glasses size={18} className="mt-0.5 shrink-0 text-sky-600" /><div className="flex-1 text-[13px] text-ink2">你问：{a.ask}</div><button onClick={() => setA({ ...a, open: false })} className="rounded-full p-0.5 text-ink2 hover:bg-black/5" aria-label="关上"><X size={16} /></button></div>
          <div>{a.a1}</div>
          {a.q && (
            <div className="mt-2">
              <div className="font-black text-sky-800">{a.q}</div>
              <div className="mt-1 flex flex-wrap gap-1.5">{a.opts.map((o, i) => (
                <div key={i} className="max-w-full" style={{ minWidth: wrong.includes(i) || got === i ? 'min(100%, 260px)' : undefined }}>
                  <button onClick={() => pick(i)} disabled={got !== null || wrong.includes(i)} className={`w-full rounded-lg border-2 px-2.5 py-1 text-left font-bold ${got === i ? 'border-emerald-400 bg-emerald-50' : wrong.includes(i) ? 'border-rose-200 bg-rose-50 text-ink2 line-through' : 'border-[#E6DCC6] bg-white hover:border-sky-300'}`}>{o.t}</button>
                  {(wrong.includes(i) || got === i) && <div className={`rounded-b-lg px-2.5 py-1 text-[14px] ${got === i ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>{o.why}</div>}
                </div>
              ))}</div>
            </div>
          )}
          {showRest && a.a2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">{a.a2}</motion.div>}
          {showRest && (a.fb ? <div className="mt-1.5 text-xs text-ink2">已记下：{a.fb}。老师会看到。</div> : <div className="mt-2 flex items-center gap-1.5 text-xs"><span className="text-ink2">讲清楚了吗？</span>{['清楚了', '没说清', '好像不对'].map((v) => <button key={v} onClick={() => fb(v)} className="rounded-full border border-sky-200 bg-white px-2 py-0.5 font-bold">{v}</button>)}</div>)}
        </motion.div>
      )}
      <div className="mb-1 flex items-center gap-1 text-[13px] font-black text-ink2"><Glasses size={15} className="text-sky-600" />还有不明白的？问我{a && !a.open && <button onClick={() => setA({ ...a, open: true })} className="ml-auto font-bold text-sky-700 underline">看刚才的回答</button>}</div>
      <div className="flex gap-1.5"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) ask(); }} maxLength={120} placeholder={`比如：${hint}`} className="min-w-0 flex-1 rounded-lg border-2 border-[#E6DCC6] bg-white px-2.5 py-1 text-[14px] outline-none focus:border-sky-300" /><button disabled={!q.trim() || busy} onClick={() => ask()} className="rounded-lg bg-sky-600 px-2.5 text-white disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}</button></div>
      {!q && !busy && <button onClick={() => ask(hint)} className="mt-1 text-left text-[13px] font-bold text-sky-700 underline">就问这个：{hint}</button>}
      {err && <div className="mt-1 text-sm text-rose-700">{err}</div>}
    </div>
  );
}

// ---------------- 拓展（居中弹窗）：像老师上课一样一步一问——讲一小段，紧跟着问一句；答对了才往下讲。做过的直接显示答案 ----------------
function ExtModal({ it, ext, color, onClose, gloss, onGloss }: { it: Item; ext: Ext; color: string; onClose: () => void; gloss: Record<string, Gloss>; onGloss: (w: string, g: Gloss, el: HTMLElement) => void }) {
  const rec = useGame((s) => s.player?.recs[it.id]);
  const required = requiredExts(it, rec).some((e) => e.id === ext.id);
  const already = extsOf(rec)[ext.id] !== undefined;
  const pre = ext.id + ':';
  const qs = ext.steps.map((s, i) => (s.kind === 'teach' ? -1 : i)).filter((i) => i >= 0); // 要答的那几问
  const [cur, setCur] = useState(() => {
    if (already) return qs.length;
    const a = ansOf(it); let k = 0; while (k < qs.length && a[pre + ext.steps[qs[k]].key]) k++; return k;
  });
  const [scores] = useState<Record<number, number>>(() => Object.fromEntries(qs.map((i) => [i, ansOf(it)[pre + ext.steps[i].key]?.sc]).filter((x) => x[1] !== undefined)));
  const finished = cur >= qs.length;
  const upto = finished ? ext.steps.length - 1 : qs[cur]; // 显示到第几步
  useEffect(() => { if (!qs.length && !already) setExtDone(it, ext.id, 1); }, []);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const firstShown = useRef(cur);
  useEffect(() => { if (cur > firstShown.current) { const k = qs[cur] ?? ext.steps.length - 1; let j = k; while (j > 0 && ext.steps[j - 1].kind === 'teach') j--; scrollInto(boxRef.current, refs.current[j]); setTimeout(() => scrollInto(boxRef.current, refs.current[k]), 350); } }, [cur]);
  const answered = (i: number, x: number) => {
    if (i !== qs[cur]) return;
    scores[i] = x;
    setTimeout(() => {
      if (cur + 1 < qs.length) { setCur(cur + 1); return; }
      const vs = Object.values(scores);
      setExtDone(it, ext.id, vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 1); setCur(qs.length); sfx('star');
    }, 900);
  };
  const canClose = !required || finished;
  return (
    <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2B2722]/55 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => canClose && onClose()}>
      <motion.div ref={boxRef} initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} className="card relative max-h-[90vh] w-full max-w-[860px] overflow-auto px-5 py-4" onClick={(e) => e.stopPropagation()}>
        <GlossContext.Provider value={{ gloss, onGloss }}>
          <SaveCtx.Provider value={pre}>
            <div className="mb-2 flex items-center gap-2"><span className="text-lg font-black">{ext.title}</span>
              {qs.length > 1 && <span className="flex gap-1">{qs.map((_, k) => <span key={k} className={`h-1.5 w-4 rounded-full ${k < cur ? 'bg-emerald-500' : k === cur ? '' : 'bg-[#E6DCC6]'}`} style={k === cur && !finished ? { background: color } : {}} />)}</span>}
              {canClose && <button onClick={onClose} className="ml-auto rounded-full p-1.5 text-ink2 hover:bg-black/5" aria-label="关闭"><X size={20} /></button>}</div>
            <div className="space-y-2">
              {ext.steps.map((s, i) => i <= upto && (
                <motion.div key={s.key} ref={(el) => { refs.current[i] = el; }} initial={i > (qs[firstShown.current] ?? -1) ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }}>
                  {s.kind === 'teach' ? <TeachView s={s} color={color} /> : <PlayStep it={it} s={s} color={color} onDone={(x) => answered(i, x)} />}
                </motion.div>
              ))}
            </div>
            {finished && (
              <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
                {ext.reveal && <span className="text-sm text-emerald-700">刚才那道题每个选项的解释，已经揭开了。</span>}
                <Btn color={color} onClick={onClose}>回到故事 ›</Btn>
              </div>
            )}
            {!finished && !required && <div className="mt-2 text-right"><button onClick={onClose} className="text-sm font-bold text-ink2 underline">先不做了，回到故事</button></div>}
          </SaveCtx.Provider>
        </GlossContext.Provider>
      </motion.div>
    </motion.div>
  );
}
