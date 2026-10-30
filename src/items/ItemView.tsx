// 一道题：情境 → 一步一步作答 →（不确定：看图和提示，不扣星）→ 讲解、来历、加分题、竖屏讲解视频。
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Lock, PlayCircle } from 'lucide-react';
import type { Item, Sub } from '../shared/types';
import { Art, Btn, Rich, Stars, centerOf } from '../components/ui';
import { resultOf } from '../shared/adapt';
import { finishItem, fly, markUnsure, setData, startItem, useGame } from '../game/store';
import { sfx } from '../game/sound';
import { ChoiceView, MatchView, MisView, OrderView, SortView, SpotView, WriteView } from './steps';

const isScored = (s: Sub) => !(s.kind === 'write' && s.bonus);

const StepView = ({ it, s, color, onDone }: { it: Item; s: Sub; color: string; onDone: (x: number) => void }) => {
  switch (s.kind) {
    case 'choice': return <ChoiceView it={it} s={s} color={color} onDone={onDone} />;
    case 'spot': return <SpotView it={it} s={s} color={color} onDone={onDone} />;
    case 'sort': return <SortView it={it} s={s} color={color} onDone={onDone} />;
    case 'match': return <MatchView it={it} s={s} color={color} onDone={onDone} />;
    case 'order': return <OrderView it={it} s={s} color={color} onDone={onDone} />;
    case 'mis': return <MisView it={it} s={s} color={color} onDone={onDone} />;
    case 'write': return <WriteView it={it} s={s} color={color} onDone={onDone} />;
  }
};

// ---------------- 竖屏讲解视频 ----------------
let manifest: Promise<string[]> | null = null;
const getManifest = () => (manifest ??= fetch('shorts/index.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).catch(() => []));
export const VideoPanel = ({ topic, unlocked, color }: { topic: string; unlocked: boolean; color: string }) => {
  const [has, setHas] = useState<boolean | null>(null);
  const [play, setPlay] = useState(false);
  useEffect(() => { getManifest().then((m) => setHas(m.includes(topic))); setPlay(false); }, [topic]);
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] border-[6px] border-[#2B2722] bg-[#2B2722] shadow-xl">
        {has && unlocked && play ? <video className="h-full w-full object-cover" src={`shorts/${encodeURIComponent(topic)}.mp4`} controls autoPlay playsInline />
          : (
            <button disabled={!has || !unlocked} onClick={() => { sfx('click'); setPlay(true); }} className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#3A332B] to-[#1F1B17] px-5 text-center text-white">
              {has && unlocked ? <PlayCircle size={64} style={{ color }} /> : <Lock size={44} className="opacity-60" />}
              <div className="kai text-2xl">讲解小视频</div>
              <div className="text-sm opacity-75">{has === false ? '这道题的视频还在做' : unlocked ? '点一下播放（看不看都可以）' : '答完，或者答错一次，就能看'}</div>
            </button>
          )}
      </div>
    </div>
  );
};

export default function ItemView({ it, color, k, n, onNext, title }: { it: Item; color: string; k: number; n: number; onNext: () => void; title: string }) {
  const rec = useGame((s) => s.player?.recs[it.id]);
  useEffect(() => { startItem(it); }, [it.id]);
  const scored = it.steps.filter(isScored);
  const bonus = it.steps.filter((s) => !isScored(s));
  const saved = (rec?.data ?? {}) as { step?: number; scores?: number[] };
  const [step, setStep] = useState(saved.step ?? 0);
  const [scores, setScores] = useState<number[]>(saved.scores ?? []);
  const [hint, setHint] = useState(0);
  const [live, setLive] = useState<number[]>([]); // 这次打开页面以后做完的步骤（之前做完的只显示一行）
  const finished = rec?.status === 'done';
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setStep(saved.step ?? 0); setScores(saved.scores ?? []); setHint(0); setLive([]); }, [it.id]);
  const unlocked = finished || !!rec?.log.some((e) => e.ok === false);

  const stepDone = (i: number, x: number) => {
    const sc = [...scores]; sc[i] = x; setScores(sc); setLive((l) => [...l, i]);
    const next = i + 1;
    setData(it, { step: next, scores: sc });
    if (next < scored.length) { setTimeout(() => setStep(next), 650); return; }
    const { stars, perf } = resultOf(sc, rec?.unsure ?? 0);
    setTimeout(() => {
      finishItem(it, stars, perf);
      sfx('star');
      const c = centerOf(doneRef.current); fly(c.x, c.y, stars);
      setTimeout(() => doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    }, 500);
  };
  const unsure = () => { markUnsure(it); setHint((h) => h + 1); sfx('hint'); };
  const showArt = it.art && (hint > 0 || finished);
  // 答完以后，把正确答案填进句子里的空
  const first = scored[0];
  const fills = finished && first?.kind === 'choice' && !first.multi && /_{3}/.test(it.intro) && first.ok.length === 1 ? first.opts[first.ok[0]].t.split(/；|……/) : undefined;

  return (
    <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="rounded-full px-3 py-1 text-sm font-black text-white" style={{ background: color }}>{title}</span>
          <div className="flex gap-1.5">{Array.from({ length: n }, (_, i) => <span key={i} className="h-2.5 w-7 rounded-full" style={{ background: i < k ? color : i === k ? color + '88' : '#E6DCC6' }} />)}</div>
          <span className="text-sm font-bold text-ink2">第 {k + 1} / {n} 题</span>
        </div>
        <div className="card p-6">
          <div className="text-xl leading-relaxed"><Rich text={it.intro} fills={fills} /></div>
          {it.npc && it.pic && typeof it.pic !== 'string' && (() => {
            const lastOk = rec?.log.filter((e) => e.ok !== null).slice(-1)[0]?.ok;
            const say = finished ? it.npc.good : lastOk === false ? it.npc.bad : '';
            const mood = finished ? 'happy' : lastOk === false ? 'confused' : String(it.pic.p?.mood ?? 'happy');
            return (
              <div className="mt-4 flex items-end gap-4">
                <Art spec={{ k: 'ben', p: { ...it.pic.p, mood } }} className="aspect-[400/260] w-[300px] shrink-0 rounded-2xl border-2 border-[#E6DCC6]" />
                {say && <motion.div key={say} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={`relative mb-6 rounded-2xl border-2 px-4 py-3 text-lg font-bold ${finished ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}><Rich text={say} /></motion.div>}
              </div>
            );
          })()}
          {it.pic && !it.npc && <Art spec={it.pic} className={`mt-4 rounded-2xl border-2 border-[#E6DCC6] ${typeof it.pic !== 'string' && it.pic.k === 'idiom' ? 'aspect-[4/3] max-w-[640px]' : typeof it.pic !== 'string' && it.pic.k === 'ben' ? 'aspect-[400/260] max-w-[360px]' : 'aspect-[16/10] max-w-[640px]'}`} />}
          {showArt && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><Art spec={it.art!} className="mt-4 aspect-[16/10] max-w-[520px] rounded-2xl border-2 border-[#E6DCC6]" /></motion.div>}
          {!finished && it.hints.length > 0 && (
            <div className="mt-4">
              {it.hints.slice(0, hint).map((h, i) => <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-2 font-bold text-amber-900">💡 <Rich text={h} /></motion.div>)}
              {hint < it.hints.length && (
                <button onClick={unsure} className="flex items-center gap-1.5 rounded-full border-2 border-[#E6DCC6] bg-white px-4 py-1.5 text-sm font-black text-ink2 hover:border-amber-300">
                  <HelpCircle size={18} />{hint === 0 ? '不确定？看看提示（不扣星）' : '还不确定，再给一点提示'}
                </button>
              )}
            </div>
          )}
        </div>

        {scored.map((s, i) => i <= step && (
          <motion.div key={it.id + s.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mt-4 p-6">
            {(i < step || finished) && !live.includes(i) ? <div className="font-bold text-ink2">✓ {s.q.replace(/\*\*/g, '')}</div>
              : <StepView it={it} s={s} color={color} onDone={(x) => { if (i === step && !finished) stepDone(i, x); }} />}
          </motion.div>
        ))}

        <div ref={doneRef} />
        {finished && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
            <div className="card flex items-center gap-4 p-5" style={{ borderColor: color + '55' }}>
              <Stars n={rec?.stars ?? 0} size={34} />
              <div className="flex-1 text-[17px] leading-relaxed"><Rich text={it.explain} /></div>
            </div>
            {it.know && <div className="flex gap-3 rounded-2xl border-2 border-[#D8C08A] bg-[#F7EFD9] px-5 py-4"><span className="text-2xl">📜</span><div className="leading-relaxed"><b>来历 · 涨知识</b><div className="mt-0.5"><Rich text={it.know} /></div></div></div>}
            {bonus.map((s) => <div key={s.key} className="card border-amber-200 p-6"><StepView it={it} s={s} color={color} onDone={() => {}} /></div>)}
            <div className="flex justify-end"><Btn size="lg" color={color} onClick={onNext}>{k + 1 >= n ? '完成这一关 →' : '下一题 →'}</Btn></div>
          </motion.div>
        )}
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <VideoPanel topic={it.topic} unlocked={unlocked} color={color} />
        <div className="mt-3 text-center text-sm text-ink2">觉得简单，可以不看。</div>
      </div>
    </div>
  );
}
