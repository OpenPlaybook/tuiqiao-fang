// 播放式故事：画面（水墨 + 镜头推拉）+ 配音 + 字幕，一句一句往下播；播到题就停，题在画面里做。
// 画面尽量大：字幕、进度条都在画面里；右边窄栏是“台本”（播过的每一句，可点的字随时能点；做过的题、拓展入口挂在题下面），最下面可以问 AI。
// 做过的题点进度条上的标记、或者台本里的题，就能回来看自己的答案；拓展在居中弹窗里，按“讲—例—练”往下走。
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CornerUpLeft, Glasses, Loader2, Pause, Play as PlayIcon, RotateCcw, Send, Volume2, VolumeX, X } from 'lucide-react';
import type { Back, Ext, Gloss, Item, Line, MisSub, Play } from '../shared/types';
import { MODES, MODE_TIP, PLAY_BY_ID, enLevel, modeKey, plainText, voiceFile, voiceLine, wordVoice, type Mode } from '../shared/play';
import { resultOf, scoredSteps, taskItem } from '../shared/adapt';
import { Art, Btn, GlossContext, Rich, Stars, centerOf, shuffleIdx } from '../components/ui';
import { type GlossAt, sentOf } from '../shared/gloss';
import { finishItem, fly, getState as useGameState, logPlay, markUnsure, setData, setExtDone, startItem, toast, useGame } from '../game/store';
import type { AskOut } from '../shared/ai';
import { api } from '../game/api';
import { sfx } from '../game/sound';
import { Bubble, ChoiceChat, ChoiceQ, PlayStep, SaveCtx, TeachBody, ansOf, layoutOf } from '../items/steps2';
import { DEMO } from '../game/demo';
import { loadVoice, planVoices, unlockAudio, voiceIndex, voiceReady, voiceSrc } from './voiceLoad';
import { Film } from '../film/Film';

export const go = (path: string) => { window.location.hash = path; };
const EST = (t: string) => Math.max(2.2, Array.from(t.replace(/[⟦⟧⟪⟫*]/g, '')).length / 5.2 + 0.5);


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
  const lang = play.lang ?? 'zh', en = lang === 'en';
  const items = lines.map((l) => (l.task ? taskItem(p, l.task, lang) : null));
  const done = (k: number) => !items[k] || p.recs[items[k]!.id]?.status === 'done';
  const extOk = (k: number) => { const it = items[k]; if (!it) return true; const r = p.recs[it.id]; return requiredExts(it, r).every((e) => extsOf(r)[e.id] !== undefined); };
  const firstOpen = lines.findIndex((_, k) => !done(k) || !extOk(k));
  const maxIdx = firstOpen === -1 ? n - 1 : firstOpen;

  // 配音的时长表（voice/index.json）；配音文件按需取，见 voiceLoad.ts
  const [durMap, setDur] = useState<Record<string, number> | null>(null);
  const dur = durMap ?? {};
  const [retry, setRetry] = useState(0); // 点“重试”：时长表、这一句的配音重新取
  const [idxFail, setIdxFail] = useState(false);
  useEffect(() => { if (durMap) return; let alive = true; voiceIndex().then((d) => alive && setDur(d)).catch(() => alive && setIdxFail(true)); return () => { alive = false; }; }, [retry]);
  // 讲解方式：中文默认“白话”，英文默认“英文字幕”（中间那一档）
  const [mode, setMode] = useState<Mode>(() => { const ms = MODES[lang].map((x) => x.m), d: Mode = en ? 'en2' : 'bh'; try { const m = localStorage.getItem(modeKey(lang)) as Mode; return ms.includes(m) ? m : d; } catch { return d; } });
  const lineDur = (l: Line) => { const v = voiceLine(l, mode); return (dur[voiceFile(v)] ?? EST(v.read ?? v.t)) + (l.pause ?? 0.35); };
  const starts: number[] = []; { let t = 0; for (const l of lines) { starts.push(t); t += lineDur(l); } starts.push(t); }

  // 接着看：从最后做完的那道题后面一句开始（拓展没做完就停在那道题上）
  const lastDone = lines.reduce((a, l, k) => (l.task && items[k] && p.recs[items[k]!.id]?.status === 'done' ? k : a), -1);
  const resume = lastDone < 0 ? 0 : Math.min(maxIdx, extOk(lastDone) ? lastDone + 1 : lastDone);
  const startAt = at ? Math.max(0, lines.findIndex((l, k) => l.id === at || String(k) === at)) : Math.min(resume, n - 1);
  const [idx, setIdx] = useState(startAt);
  const [far, setFar] = useState(Math.max(startAt, lastDone)); // 台本里显示到哪一句
  useEffect(() => setFar((f) => Math.max(f, idx)), [idx]);
  // 从别的回跳回来（或者跳到某一句）：那一句有题，就直接把题摆出来（做过的显示答案），不用再点
  const [phase, setPhase] = useState<'cover' | 'play' | 'pause' | 'task' | 'end'>(at ? (lines[startAt]?.task && items[startAt] && startAt <= maxIdx ? 'task' : 'pause') : 'cover');
  const [muted, setMuted] = useState(() => { try { return localStorage.getItem('tq-mute') === '1'; } catch { return false; } });
  const [elapsed, setElapsed] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [glossPop, setGlossPop] = useState<{ w: string; g: Gloss; sent: [string, string] | null; x: number; y: number; lv: 1 | 2; more?: boolean; wrong?: number[]; got?: boolean } | null>(null);
  const [extOpen, setExtOpen] = useState<{ it: Item; ext: Ext } | null>(null);
  const [askPreset, setAskPreset] = useState<{ q: string; n: number } | null>(null); // 结束页上点的问题，交给右边的“问 AI”
  const aiOn = useGame((s) => s.config.ai);
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
  /** 学生点了播放（手势里）：顺手把声音解锁（iPhone、iPad 要这样，后面几句才放得出声） */
  const unlock = () => unlockAudio((audio.current ??= new Audio()));
  // 等配音：wait = 'load' 加载中（画面停在这一句开头），'fail' 取不到（让学生选重试或先看字幕）
  const [wait, setWait] = useState<null | 'load' | 'fail'>(null);
  const waiting = useRef(false);
  const [skipAt, setSkipAt] = useState(-1); // 这一句的配音取不到，学生选了“先看字幕”
  const [noVoice, setNoVoice] = useState(false); // 时长表都取不到：这一次就不放配音了
  const subsOnly = useRef(false); // 选过“先看字幕”：后面再有取不到的句子，就不再停下来问
  const endLine = useCallback(() => {
    stop();
    if (lines[idx].task && (!done(idx) || !extOk(idx))) { setPhase('task'); return; }
    if (idx >= n - 1) { setPhase('end'); return; }
    setIdx((k) => k + 1);
  }, [idx, p]);
  // 播一句：这一句的配音取到了才开始（画面、进度条都从这时算起），放完换下一句；没有配音就按字数估算时长
  useEffect(() => {
    waiting.current = false; setWait(null);
    if (phase !== 'play') return;
    let alive = true, iv = 0;
    const l = lines[idx], file = voiceFile(voiceLine(l, mode));
    const start = (src?: string) => {
      if (!alive) return;
      waiting.current = false; setWait(null);
      const d = lineDur(l);
      t0.current = performance.now(); setElapsed(0);
      if (src) {
        const a = (audio.current ??= new Audio());
        a.src = src; a.currentTime = 0;
        a.onended = () => { timer.current = window.setTimeout(endLine, (l.pause ?? 0.35) * 1000); };
        a.play().catch(() => { timer.current = window.setTimeout(endLine, d * 1000); });
      } else timer.current = window.setTimeout(endLine, d * 1000);
      iv = window.setInterval(() => setElapsed((performance.now() - t0.current) / 1000), 200); // 进度条 5 次 / 秒就够了
    };
    const hold = (w: 'load' | 'fail') => { waiting.current = true; setElapsed(0); setWait(w); };
    if (muted || noVoice || skipAt === idx) start();
    else if (!durMap) hold(idxFail ? 'fail' : 'load'); // 时长表来了会再跑一遍
    else if (!durMap[file]) start(); // 这一句本来就没有配音
    else if (voiceReady(file)) start(voiceSrc(file));
    else { hold('load'); loadVoice(file, 0).then((u) => start(u), () => { if (!alive) return; if (subsOnly.current) start(); else hold('fail'); }); }
    return () => { alive = false; clearInterval(iv); stop(); };
  }, [idx, phase, muted, durMap, mode, retry, skipAt, noVoice, idxFail]);
  // 预先取：从这一句往后，眼前几句马上取，其余后台慢慢取（换讲解方式就按新的方式重排）
  useEffect(() => {
    if (!durMap || muted || noVoice) return;
    planVoices(lines.slice(idx).map((l) => voiceFile(voiceLine(l, mode))).filter((f) => durMap[f]));
  }, [idx, mode, durMap, muted, noVoice]);
  const wordAudio = useRef<HTMLAudioElement | null>(null);
  const sayWord = (w: string) => { const file = voiceFile(wordVoice(w)); loadVoice(file, 0).then((u) => { const a = (wordAudio.current ??= new Audio()); a.src = u; a.play().catch(() => {}); }, () => {}); };
  const retryVoice = () => { sfx('click'); setIdxFail(false); setWait('load'); setRetry((r) => r + 1); };
  const skipVoice = () => { sfx('click'); subsOnly.current = true; if (!durMap) setNoVoice(true); else setSkipAt(idx); };
  useEffect(() => { setHint(null); }, [idx, phase]);
  // 必做的拓展：题做完以后自动弹出
  useEffect(() => {
    if (phase !== 'task' || !item || !done(idx) || extOpen || ret) return; // 从别的回跳过来只是看一眼：不自动弹拓展，免得挡住“回到……”
    const r = p.recs[item.id], need = requiredExts(item, r).find((e) => extsOf(r)[e.id] === undefined);
    if (need) { const tm = setTimeout(() => setExtOpen({ it: item, ext: need }), 1200); return () => clearTimeout(tm); }
  }, [phase, idx, p, extOpen]);

  const seek = (k: number) => { if (k > maxIdx && k > far) return; stop(); unlock(); sfx('click'); setIdx(k); setPhase('play'); };
  const openTask = (k: number) => { if (k > maxIdx || !items[k]) return; stop(); sfx('click'); setIdx(k); setPhase('task'); };
  const playPause = () => {
    if (phase === 'play') { stop(); setPhase('pause'); return; }
    unlock();
    if (phase === 'end') { setIdx(0); setPhase('play'); return; }
    if (phase === 'task') { if (done(idx) && extOk(idx)) cont(); return; }
    setPhase('play');
  };
  const cont = () => { unlock(); if (idx >= n - 1) { setPhase('end'); return; } setIdx((k) => k + 1); setPhase('play'); };
  const jump = (b: Back) => { stop(); go(`/c/${b.ch}?at=${b.line}&ret=${id}:${idx}`); };
  // 句中解释按被点的那一处找：同一个字在别的句子里，不拿这句的解释
  const onGloss = (w: string, g: Gloss, el: HTMLElement, at?: GlossAt) => { const r = el.getBoundingClientRect(); sfx('hint'); setGlossPop({ w, g, sent: sentOf(g, w, at), x: r.left + r.width / 2, y: r.bottom, lv: 1 }); logPlay(id, 'gloss', w); };
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
  const showSub = !(atTask && line.hide) && !line.card && phase !== 'cover' && phase !== 'end'; // 看完了：最后那句放在结束页上，字幕不再重复
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
              ? <Film shots={line.shots} lid={`${id}-${idx}`} prog={() => (phase === 'play' ? (waiting.current ? 0 : (performance.now() - t0.current) / 1000 / lineDur(line)) : phase === 'task' || phase === 'end' ? 1 : phase === 'cover' ? 0 : elapsed / lineDur(line))} />
              : <Cam key={`${idx}-${phase === 'play' ? 'p' : 's'}`} cam={cam} dur={lineDur(line)} moving={phase === 'play'}>{scene && <Art spec={scene} className="h-full w-full" />}</Cam>}
            <AnimatePresence>
              {showCard && (
                <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`absolute left-1/2 top-[7%] max-w-[86%] -translate-x-1/2 rounded-xl px-6 py-3 shadow-2xl ${line.card!.kind === 'ai' ? 'bg-sky-50/95' : 'bg-[#F7EFD9]/95'}`}>
                  {line.card!.by && <div className="mb-1 text-xs font-black text-[#8A6A2F]">{line.card!.by}</div>}
                  <div className={`${line.card!.kind === 'poem' ? 'kai text-center leading-[1.85]' : line.card!.kind === 'yuan' ? 'kai leading-relaxed' : ''}`} style={{ fontSize: Math.max(18, Math.min(27, vw / 40)) }}><Rich text={line.card!.t} /></div>
                </motion.div>
              )}
            </AnimatePresence>
            {atTask && <TaskView key={item!.id} en={en} it={item!} line={line} prev={lines[idx - 1]} stem={stem} mode={mode} color={play.color} bh={bs.h - CTRL} bottomEl={bottomEl} onCont={cont} onExt={(ext) => setExtOpen({ it: item!, ext })} onBack={jump} onHint={(h) => { setHint(h); markUnsure(item!); }} />}
            {hint && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-3 top-3 z-20 flex max-w-[44%] gap-2 rounded-2xl bg-white/95 px-3.5 py-2.5 shadow-xl">
                <Glasses size={20} className="mt-0.5 shrink-0 text-sky-600" /><div className="text-[15px] font-bold leading-relaxed"><Rich text={hint} /></div>
                <button onClick={() => setHint(null)} className="-mr-1 -mt-1 self-start rounded-full p-0.5 text-ink2 hover:bg-black/5"><X size={14} /></button>
              </motion.div>
            )}
            {/* 字幕：在画面里，躲开下面的控制条 */}
            {showSub && !stem && (
              <div className="subline absolute inset-x-0 bg-gradient-to-t from-black/70 to-black/0 px-6 pb-1.5 pt-6 text-center font-bold leading-relaxed text-white [text-shadow:0_1px_3px_rgba(0,0,0,.7)]" style={{ fontSize: subSize, bottom: Math.max(0, CTRL - vy) }}>
                {line.who && <span className={`mr-2 rounded-md px-2 py-0.5 align-middle text-[0.62em] ${line.voice === 'ai' ? 'bg-sky-600' : 'bg-[#8A6A2F]'}`}>{line.voice === 'ai' ? <Glasses size={16} className="inline" /> : <Rich text={line.who} />}</span>}
                <LineText key={idx} l={line} mode={mode} lock={!!item && !done(idx)} max={2} />
              </div>
            )}
            {/* 等配音：加载中（过 0.35 秒还没好才显示，免得一闪）；取不到就让学生选 */}
            {phase === 'play' && wait && (
              <div className="absolute inset-0 z-[15] flex items-center justify-center">
                {wait === 'load'
                  ? <div className="tq-appear flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[15px] font-bold text-white"><Loader2 size={18} className="animate-spin" />配音加载中…</div>
                  : <div className="rounded-2xl bg-white/95 px-5 py-3 text-center shadow-xl">
                      <div className="text-[17px] font-black">配音没加载出来</div>
                      <div className="text-[14px] text-ink2">网络可能不太好，可以再试一次，也可以先看字幕。</div>
                      <div className="mt-2 flex items-center justify-center gap-3"><Btn size="sm" color={play.color} onClick={retryVoice}>重试</Btn><button onClick={skipVoice} className="text-[14px] font-bold text-ink2 underline">先看字幕，接着往下</button></div>
                    </div>}
              </div>
            )}
            {phase === 'cover' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/45 text-white">
                <div className={en ? 'font-serif text-5xl font-black' : 'kai text-5xl'}>{play.title}</div>
                <div className="mt-2 text-lg opacity-85">{play.sub}</div>
                <button onClick={() => { sfx('click'); unlock(); setPhase('play'); }} className="mt-6 flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-lg font-black text-[#2B2722]"><PlayIcon size={22} />{lastDone >= 0 ? '接着看' : '开始'}</button>
              </div>
            )}
            {phase === 'end' && (
              // 看完了也能接着探索：最后那句话（字可以点），几个可以直接问 AI 眼镜的问题
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-auto bg-black/60 px-6 py-4 text-white">
                <div className={en ? 'font-serif text-3xl font-black' : 'kai text-4xl'}>这一回看完了</div>
                <div className={`max-w-[80%] rounded-xl bg-white/95 px-5 py-2.5 text-center leading-relaxed text-[#2B2722] ${en ? 'font-serif text-[19px]' : 'kai text-[21px]'}`}><LineText l={lines[n - 1]} mode={mode} min={2} /></div>
                {(play.endAsk?.length ?? 0) > 0 && aiOn && (
                  <div className="max-w-[86%] text-center">
                    <div className="text-[14px] opacity-90">点一点画虚线的字，看看意思；还想知道更多，问问 AI 眼镜：</div>
                    <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">{play.endAsk!.map((q) => <button key={q} onClick={() => { sfx('click'); setAskPreset((x) => ({ q, n: (x?.n ?? 0) + 1 })); }} className="rounded-full bg-sky-50 px-3 py-1 text-[14px] font-bold text-sky-900 hover:bg-white">🔎 {q}</button>)}</div>
                  </div>
                )}
                <div className="mt-1 flex items-center gap-3">
                  {play.next && PLAY_BY_ID[play.next] ? <Btn color={play.color} onClick={() => go(`/c/${play.next}`)}>翻到下一回 ›</Btn> : <Btn color={play.color} onClick={() => go('/')}>合上书</Btn>}
                  <button onClick={() => { setIdx(0); setPhase('play'); }} className="flex items-center gap-1 text-sm font-bold underline opacity-85"><RotateCcw size={14} />从头再看</button>
                </div>
                {play.nextNote && <div className="text-sm opacity-80">{play.nextNote}</div>}
              </div>
            )}
          </div>
          {/* 左上角：目录、回目（有黑边就在黑边里） */}
          <div className="absolute left-2 top-2 z-20 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-white backdrop-blur-sm">
            <button onClick={() => go('/')} className="text-[13px] font-bold underline opacity-90">目录</button>
            <span className={en ? 'font-serif text-[16px] font-bold' : 'kai text-[17px]'}>{play.title}</span>
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
              <div className="flex overflow-hidden rounded-full bg-white/15 text-[12px] font-bold" title={MODE_TIP[lang]}>
                {MODES[lang].map(({ m, t }) => <button key={m} onClick={() => { setMode(m); try { localStorage.setItem(modeKey(lang), m); } catch { /* */ } }} className={`px-2 py-0.5 ${mode === m ? 'bg-white text-[#2B2722]' : 'hover:bg-white/10'}`}>{t}</button>)}
              </div>
              <button onClick={() => { const m = !muted; setMuted(m); try { localStorage.setItem('tq-mute', m ? '1' : '0'); } catch { /* */ } }} className="rounded-full p-1 hover:bg-white/15" title={muted ? '打开配音' : '关掉配音（只看字幕）'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            </div>
          </div>
        </div>

        {/* ---------- 台本（AI 眼镜） ---------- */}
        <Script play={play} mode={mode} items={items} far={Math.min(far, n - 1)} idx={idx} phase={phase} maxIdx={maxIdx} onSeek={seek} onTask={openTask} onExt={(it, ext) => setExtOpen({ it, ext })} onBack={jump} askHint={askHint} line={line} item={atTask ? item : null} askPreset={askPreset} />
      </div>

      {glossPop && (() => {
        // 点字：先给这个字词的意思；要是还不明白，再展开“在这句话里”（两层都记下来）
        const above = glossPop.y > window.innerHeight * 0.62;
        return (
          <div ref={glossRef} className="fixed z-[100] w-max max-w-[min(340px,92vw)] rounded-2xl bg-white px-4 py-2.5 shadow-2xl ring-2 ring-sky-200" style={{ left: Math.min(window.innerWidth - 178, Math.max(178, glossPop.x)), top: above ? glossPop.y - 30 : glossPop.y + 8, transform: `translate(-50%, ${above ? '-100%' : '0'})` }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-baseline gap-2"><Glasses size={16} className="shrink-0 self-center text-sky-600" /><b className={en ? 'font-serif text-[22px]' : 'kai text-2xl'}>{glossPop.w}</b>{glossPop.g.py && <span className="text-[15px] text-ink2">{glossPop.g.py}</span>}{en && <button onClick={() => sayWord(glossPop.w)} className="self-center rounded-full p-1 text-sky-700 hover:bg-sky-50" title="听一听"><Volume2 size={17} /></button>}</div>
            <div className="mt-0.5 text-[15px] leading-relaxed">{glossPop.g.d}</div>
            {glossPop.sent && (glossPop.lv === 1
              ? <button onClick={() => { sfx('click'); setGlossPop({ ...glossPop, lv: 2 }); logPlay(id, 'gloss2', glossPop.w); }} className="mt-1.5 text-[14px] font-black text-sky-700 underline">放在这句话里怎么理解？</button>
              : <div className="mt-1.5 rounded-lg bg-sky-50 px-2.5 py-1.5 text-[15px] leading-relaxed"><div className="text-[12px] font-black text-sky-700">在这句话里</div><span className="kai text-[1.05em]">“{glossPop.sent[0]}”</span>：{glossPop.sent[1]}</div>)}
            {glossPop.g.more && (!glossPop.more
              ? <button onClick={() => { sfx('click'); setGlossPop({ ...glossPop, more: true, wrong: [] }); }} className="mt-1.5 block text-[14px] font-black text-[#9A5B2E] underline">🧭 这个{en ? '词' : '字'}还能怎么用？</button>
              : <div className="mt-1.5 max-w-[320px] rounded-lg bg-amber-50 px-2.5 py-1.5 text-[15px] leading-relaxed">
                  <div>{glossPop.g.more.t}</div>
                  <div className="mt-1 font-black">{glossPop.g.more.q}</div>
                  <div className="mt-1 flex flex-wrap gap-1">{shuffleIdx(glossPop.g.more.opts.length, p.pid + glossPop.w).map((i) => { const [t, ok] = glossPop.g.more!.opts[i];
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
function TaskView({ en, it, line, prev, stem, mode, color, bh, bottomEl, onCont, onExt, onBack, onHint }: { en: boolean; it: Item; line: Line; prev?: Line; stem: Line | null; mode: Mode; color: string; bh: number; bottomEl: HTMLDivElement | null; onCont: () => void; onExt: (e: Ext) => void; onBack: (b: Back) => void; onHint: (h: string) => void }) {
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
          {mis?.src && <div className="mb-1.5 rounded-xl bg-[#F7EFD9]/95 px-5 py-2 shadow-xl"><div className="text-xs font-black text-[#8A6A2F]">{prev?.card?.by ?? '原文'}</div><div className={en ? 'font-serif text-[20px] leading-relaxed' : 'kai text-[22px] leading-relaxed'}><Rich text={prev?.card?.t ?? mis.src} /></div></div>}
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
            {stem && <div className="mb-1.5 text-[17px] font-bold leading-relaxed">{stem.who && <span className={`mr-1.5 rounded-md px-1.5 py-0.5 align-middle text-[12px] text-white ${stem.voice === 'ai' ? 'bg-sky-600' : 'bg-[#8A6A2F]'}`}>{stem.voice === 'ai' ? <Glasses size={14} className="inline" /> : <Rich text={stem.who} />}</span>}<LineText l={stem} mode={mode} lock={!finished} min={2} /></div>}
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
/** 给 AI 看的这一句：有原文就一起带上（学生看的是白话还是原文都能答） */
const aiText = (l: Line) => (l.wy ? `${l.t}（原文：${l.wy}）` : l.tr ? `${l.t}（中文意思：${l.tr}）` : l.t);
/** lock：这句有题、还没做完——中文先不给（不然一看中文就知道答案了） */
function LineText({ l, mode, lock, min = 0, max = 4, more }: { l: Line; mode: Mode; lock?: boolean; min?: number; max?: number; more?: { at: number; set: (k: number) => void } }) {
  const [show, setShow] = useState(false);
  // 英文故事：按这一档（或者右边点开到的那一级）显示，见 EnLine
  if (l.tr !== undefined) return <EnLine l={l} level={Math.min(max, Math.max(min, more?.at ?? enLevel(mode)))} lock={lock} onMore={more ? () => more.set(Math.max(min, more.at) + 1) : undefined} />;
  if (mode === 'bh' || !l.wy) return <Rich text={l.t} />;
  return (
    <>
      <span className="kai text-[1.08em]"><Rich text={l.wy} /></span>
      {mode === 'wy' && <button onClick={(e) => { e.stopPropagation(); setShow(!show); }} className="ml-1.5 rounded-md border border-current px-1 align-middle text-[0.6em] font-bold opacity-75 hover:opacity-100">{show ? '收起' : '白话'}</button>}
      {(mode === 'dz' || show) && <span className="mt-0.5 block text-[0.9em] font-normal opacity-90"><Rich text={l.t} /></span>}
    </>
  );
}

/** 英文的一句，分五级：0 只听；1 露一部分词（长一点的词、生词只露首字母）；2 整句英文；3 部分翻译（这句里生词、短语的意思；没有生词的句子，给半句中文）；4 全部翻译。
 *  播放器的字幕最多到 2；3、4 只在右边那一栏点开（onMore：点一下往下开一级）。lock：这句有题、还没做完——最多看到整句英文。 */
const MORE_LABEL = ['看一点英文', '看整句', '看部分翻译', '看全部翻译'];
function EnLine({ l, level, lock, onMore }: { l: Line; level: number; lock?: boolean; onMore?: () => void }) {
  const { gloss } = useContext(GlossContext);
  const lv = lock ? Math.min(level, 2) : level;
  const words = [...l.t.matchAll(/⟦([^⟧]+)⟧/g)].map((m) => m[1]).filter((w, i, a) => gloss[w] && a.indexOf(w) === i);
  const next = lv < 4 && !(lock && lv >= 2) ? lv : -1;
  return (
    <>
      {lv === 0 ? <span className="opacity-70">🎧 …</span> : lv === 1 ? <span className="tracking-wide">{maskEn(l.t)}</span> : <Rich text={l.t} />}
      {lv === 3 && (words.length > 0
        ? <span className="mt-0.5 block text-[0.8em] font-normal opacity-90">{words.map((w) => <span key={w} className="mr-2 whitespace-nowrap"><b>{w}</b> {gloss[w].d.split(/[。；]/)[0]}</span>)}</span>
        : <span className="mt-0.5 block text-[0.86em] font-normal opacity-90">{halfZh(l.tr!)}</span>)}
      {lv >= 4 && <span className="mt-0.5 block text-[0.86em] font-normal opacity-90"><Rich text={l.tr!} /></span>}
      {lock && level > 2 && <span className="mt-0.5 block text-[0.75em] font-normal opacity-70">（做完这道题，再看中文）</span>}
      {onMore && next >= 0 && <button onClick={(e) => { e.stopPropagation(); sfx('click'); onMore(); }} className="ml-1.5 rounded-md border border-current px-1 align-middle text-[0.62em] font-bold opacity-70 hover:opacity-100">▸ {MORE_LABEL[next]}</button>}
    </>
  );
}
/** 部分翻译（没有生词的句子）：中文按标点分成几小段，隔一段给一段，其余留成“……” */
const halfZh = (t: string) => { const seg = plainText(t).match(/[^，。！？；：—…]+[，。！？；：—…]*/g) ?? [t]; return seg.length > 1 ? seg.map((x, i) => (i % 2 === 0 ? x : '……')).join('') : `${[...seg[0]].slice(0, Math.ceil(seg[0].length / 2)).join('')}……`; };
/** 部分字幕：长一点的小写词、生词只露首字母（f········），短词、人名照常显示；标点留着，能帮着串起来 */
const EASY = new Set('from with will have been that this they them what when were your into very just some then than there their about after back does were here also only over well much many more most each other could would should shall must'.split(' '));
const maskEn = (t: string) => t.replace(/⟦([^⟧]+)⟧/g, (_, w: string) => w.replace(/[A-Za-z’']+/g, (x) => x[0] + '·'.repeat(x.length - 1)))
  .replace(/\*\*/g, '').replace(/(^|[^A-Za-z·’'])([a-z][a-z’']{3,})/g, (m, a: string, x: string) => (EASY.has(x) ? m : a + x[0] + '·'.repeat(x.length - 1))); // 常用的小词照常露出来

// ---------------- 右边：看过的内容（可点的字带虚线，随时能点；谁说的一眼看得出；不套框，省地方）----------------
function Script({ play, mode, items, far, idx, phase, maxIdx, onSeek, onTask, onExt, onBack, askHint, line, item, askPreset }: { play: Play; mode: Mode; items: (Item | null)[]; far: number; idx: number; phase: string; maxIdx: number; onSeek: (k: number) => void; onTask: (k: number) => void; onExt: (it: Item, e: Ext) => void; onBack: (b: Back) => void; askHint: string; line: Line; item: Item | null; askPreset: { q: string; n: number } | null }) {
  const p = useGame((s) => s.player)!;
  const cur = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollInto(list.current, cur.current); }, [idx, far]);
  const [open, setOpen] = useState<Record<number, number>>({}); // 英文：每一句点开到第几级
  useEffect(() => setOpen({}), [mode]);
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
                <LineText l={l} mode={mode} lock={!!it && !isDone} more={{ at: open[k] ?? enLevel(mode), set: (v) => setOpen((o) => ({ ...o, [k]: v })) }} />
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
      <Ask play={play} item={item} line={line} before={play.lines.slice(Math.max(0, idx - 2), idx).map(aiText)} hint={askHint} preset={askPreset} />
    </aside>
  );
}

// ---------------- 问 AI：不直接给全部答案——先讲一半，问你一个小问题，你想对了再讲后一半（想对了得 1 个探索分） ----------------
function Ask({ play, item, line, before, hint, preset }: { play: Play; item: Item | null; line: Line; before: string[]; hint: string; preset: { q: string; n: number } | null }) {
  const p = useGame((s) => s.player)!;
  const aiOn = useGame((s) => s.config.ai);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<(AskOut & { ask: string; fb?: string; open: boolean }) | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [got, setGot] = useState<number | null>(null);
  const [err, setErr] = useState('');
  const askRef = useRef<(t?: string) => void>(() => {});
  useEffect(() => { if (preset) askRef.current(preset.q); }, [preset?.n]); // 结束页上点了一个问题：直接问
  if (!aiOn) return null;
  const ask = async (text?: string) => {
    const t = (text ?? q).trim(); if (!t || busy) return;
    setBusy(true); setErr(''); logPlay(play.id, 'ask', t);
    try {
      const r: AskOut = DEMO
        ? (await new Promise((res) => setTimeout(res, 500)), { a1: '（演示版没有连接 AI。课堂版里，我会先讲一半，再问你一个小问题，让你自己想出后一半。）', q: '', opts: [], a2: '' })
        : await api.ask({ pid: p.pid, token: p.token, play: play.id, item: item?.id ?? '', line: aiText(line), before, q: t });
      setA({ ...r, ask: t, open: true }); setWrong([]); setGot(null); setQ('');
    } catch (e) { setErr(String((e as Error).message || e)); } finally { setBusy(false); }
  };
  askRef.current = ask;
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
              <div className="mt-1 flex flex-wrap gap-1.5">{shuffleIdx(a.opts.length, a.ask + a.q).map((i) => { const o = a.opts[i]; return (
                <div key={i} className="max-w-full" style={{ minWidth: wrong.includes(i) || got === i ? 'min(100%, 260px)' : undefined }}>
                  <button onClick={() => pick(i)} disabled={got !== null || wrong.includes(i)} className={`w-full rounded-lg border-2 px-2.5 py-1 text-left font-bold ${got === i ? 'border-emerald-400 bg-emerald-50' : wrong.includes(i) ? 'border-rose-200 bg-rose-50 text-ink2 line-through' : 'border-[#E6DCC6] bg-white hover:border-sky-300'}`}>{o.t}</button>
                  {(wrong.includes(i) || got === i) && <div className={`rounded-b-lg px-2.5 py-1 text-[14px] ${got === i ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>{o.why}</div>}
                </div>
              ); })}</div>
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
function ExtModal({ it, ext, color, onClose, gloss, onGloss }: { it: Item; ext: Ext; color: string; onClose: () => void; gloss: Record<string, Gloss>; onGloss: (w: string, g: Gloss, el: HTMLElement, at?: GlossAt) => void }) {
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
  const endRef = useRef<HTMLDivElement>(null);
  // 眼镜连着说的话并成一个气泡：讲解并到后面那一问的前面；答对以后，下一段讲解和下一问接在那条回话后面
  // （分类、连线这类要动手的，也接在那条回话后面，同一个气泡放宽）
  type Piece = { i: number; lead: ReactNode[]; tail: ReactNode[]; hideQ: boolean; wide?: boolean };
  const pieces: Piece[] = [];
  let carry: ReactNode[] = [], lastChoice: Piece | null = null;
  for (let i = 0; i <= upto; i++) {
    const s = ext.steps[i];
    if (s.kind === 'teach') { carry.push(<TeachBody key={s.key} s={s} />); continue; }
    if (lastChoice && s.kind !== 'choice') {
      lastChoice.tail.push(...carry, <div key={'p' + s.key} ref={(el) => { refs.current[i] = el; }} className="pt-1"><PlayStep it={it} s={s} color={color} onDone={(x) => answered(i, x)} /></div>);
      lastChoice.wide = true; carry = []; lastChoice = null; continue;
    }
    if (lastChoice && s.kind === 'choice') { lastChoice.tail.push(...carry, <ChoiceQ key={'q' + s.key} s={s} />); carry = []; }
    const pc: Piece = { i, lead: carry, tail: [], hideQ: !!lastChoice };
    carry = []; pieces.push(pc); lastChoice = s.kind === 'choice' ? pc : null;
  }
  const endMsg = ext.reveal ? '这一段讲完了。刚才那道题每个选项为什么对、为什么不对，现在都能看了。' : '这一段讲完了。';
  let trailing: ReactNode[] | null = null;
  if (finished) { const rest = [...carry, <div key="end">{endMsg}</div>]; if (lastChoice) lastChoice.tail.push(...rest); else trailing = rest; }
  // 新的话接在上一个气泡后面：先让上一个气泡的底露出来，再滚到新的一问
  useEffect(() => {
    if (cur <= firstShown.current) return;
    const k = qs[cur], prev = [...pieces].reverse().find((pc) => k === undefined || pc.i < k);
    scrollInto(boxRef.current, prev && refs.current[prev.i]);
    setTimeout(() => scrollInto(boxRef.current, k !== undefined ? refs.current[k] : endRef.current), 350);
  }, [cur]);
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
      <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} className="card relative flex max-h-[90vh] w-full max-w-[860px] flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <GlossContext.Provider value={{ gloss, onGloss }}>
          <SaveCtx.Provider value={pre}>
            {/* 标题栏不跟着滚：一直看得到在做哪一段、第几问 */}
            <div className="mx-5 mt-4 flex shrink-0 items-center gap-2 border-b border-[#EFE6D2] pb-2"><Glasses size={20} className="text-sky-600" /><span className="text-lg font-black">{ext.title}</span>
              {qs.length > 1 && <span className="flex gap-1">{qs.map((_, k) => <span key={k} className={`h-1.5 w-4 rounded-full ${k < cur ? 'bg-emerald-500' : k === cur ? '' : 'bg-[#E6DCC6]'}`} style={k === cur && !finished ? { background: color } : {}} />)}</span>}
              {canClose && <button onClick={onClose} className="ml-auto rounded-full p-1.5 text-ink2 hover:bg-black/5" aria-label="关闭"><X size={20} /></button>}</div>
            {/* 和读书眼镜的对话：它在左边讲、问，我的回答在右边 */}
            <div ref={boxRef} className="min-h-0 flex-1 overflow-auto px-5 pb-4 pt-3"><div className="space-y-2.5">
              {pieces.map(({ i, lead, tail, hideQ, wide }) => { const s = ext.steps[i]; return (
                <motion.div key={s.key} ref={(el) => { refs.current[i] = el; }} initial={i > (qs[firstShown.current] ?? -1) ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }}>
                  {s.kind === 'choice' ? <ChoiceChat it={it} s={s} color={color} onDone={(x) => answered(i, x)} lead={lead.length ? lead : undefined} tail={tail.length ? tail : undefined} hideQ={hideQ} wideTail={wide} />
                    : <Bubble who="ai" wide>{lead.length > 0 && <div className="mb-2 space-y-1">{lead}</div>}<PlayStep it={it} s={s} color={color} onDone={(x) => answered(i, x)} /></Bubble>}
                </motion.div>
              ); })}
              {trailing && <Bubble who="ai" tone="ok"><div className="space-y-1">{trailing}</div></Bubble>}
              <div ref={endRef} />
            </div>
            {!finished && !required && <div className="mt-2 text-right"><button onClick={onClose} className="text-sm font-bold text-ink2 underline">先不做了，回到故事</button></div>}</div>
            {finished && <div className="shrink-0 border-t border-[#EFE6D2] px-5 py-2.5 text-right"><Btn color={color} onClick={onClose}>回到故事 ›</Btn></div>}
          </SaveCtx.Provider>
        </GlossContext.Provider>
      </motion.div>
    </motion.div>
  );
}
