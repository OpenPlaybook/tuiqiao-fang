// 学生端页面：登录、地图、关卡（普通关 / 竹简故事 / 英语词汇热身）、我的成绩。
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import type { StationId } from '../shared/types';
import { ITEM_BY_ID, VOCAB } from '../shared/bank';
import { ROOMS, SLOTS, FINAL_LINE, FINAL_NOTE } from '../shared/bank';
import { STATIONS, ST, doneRecs, nextItem, stationDone, stationStars, starsOf } from '../shared/adapt';
import { Art, Avatar, AVATARS, Btn, Rich, Stars, isEnter, shuffleIdx } from '../components/ui';
import { getState, isOpen, join, setVocab, useGame } from '../game/store';
import { sfx } from '../game/sound';
import ItemView from '../items/ItemView';

export const go = (path: string) => { window.location.hash = path; };

// ---------------- 登录 ----------------
export function JoinPage() {
  const [name, setName] = useState('');
  const [sid, setSid] = useState('');
  const [av, setAv] = useState(() => Math.floor(Math.random() * AVATARS.length));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ok = name.trim().length > 0 && sid.trim().length > 0;
  const submit = async () => { if (!ok || busy) return; setBusy(true); setErr(''); try { await join(name.trim(), sid.trim(), av); } catch (e) { setErr(String((e as Error).message || e)); } finally { setBusy(false); } };
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card grid w-full max-w-[1000px] grid-cols-[400px_1fr] overflow-hidden p-0">
        <div className="relative">
          <Art spec={{ k: 'ink', p: { k: 'tuiqiao' } }} className="absolute inset-0 h-full" />
          <div className="relative flex h-full flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-8 text-white">
            <div className="kai text-5xl tracking-widest">推敲坊</div>
            <div className="mt-2 text-lg opacity-90">一个字，一个词，一句话——推还是敲？</div>
            <div className="mt-3 text-sm opacity-75">语文 · 历史 · English</div>
          </div>
        </div>
        <div className="p-10">
          <div className="text-3xl font-black">欢迎来到推敲坊</div>
          <div className="mt-1 text-ink2">填好名字就能开始。换一台电脑，用同样的姓名和学校还能接着做。</div>
          <label className="mt-7 block text-lg font-black">你的姓名</label>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="例如：王小明" className="mt-2 w-full rounded-2xl border-2 border-[#E6DCC6] bg-white px-5 py-3 text-xl font-bold outline-none focus:border-amber-400" />
          <label className="mt-5 block text-lg font-black">你的学校</label>
          <input value={sid} onChange={(e) => setSid(e.target.value)} maxLength={20} placeholder="例如：人大附中" onKeyDown={(e) => isEnter(e) && submit()} className="mt-2 w-full rounded-2xl border-2 border-[#E6DCC6] bg-white px-5 py-3 text-xl font-bold outline-none focus:border-amber-400" />
          <div className="mt-5 text-lg font-black">选一个头像</div>
          <div className="mt-3 flex flex-wrap gap-2.5">{AVATARS.map((_, i) => <button key={i} onClick={() => setAv(i)} className={`rounded-full ${i === av ? 'ring-4 ring-amber-400' : 'opacity-75'}`}><Avatar i={i} size={52} /></button>)}</div>
          {err && <div className="mt-4 rounded-xl bg-rose-50 px-4 py-2 font-bold text-rose-700">{err}</div>}
          <div className="mt-8"><Btn size="lg" color="#B8352A" shadow="#7E2219" disabled={!ok || busy} onClick={submit}>{busy ? '正在进入……' : '进入推敲坊 →'}</Btn></div>
        </div>
      </motion.div>
    </div>
  );
}

// ---------------- 地图 ----------------
const PARTS = [
  { name: '字词坊', desc: '近义词、成语、病句、推敲——每个词都有分寸', scene: { k: 'scape', p: { k: '秀丽' } } },
  { name: '古今通道', desc: '跟着司马迁拾竹简：成语、文言、历史、诗', scene: { k: 'ink', p: { k: 'changan' } } },
  { name: 'English', desc: 'Ben 来北京的一周：词在情境里才有意思', scene: { k: 'ben', p: { place: 'cafe', mood: 'happy' } } },
];
export function MapPage() {
  const p = useGame((s) => s.player)!;
  const st = useGame((s) => s);
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="mb-5 flex items-end gap-4">
        <div className="kai text-4xl">今天的推敲</div>
        <div className="pb-1 text-ink2">每一关的题数一样；做到哪儿，题目跟着你调。拿不准就点“不确定”，看提示不扣星。</div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {PARTS.map((part) => (
          <div key={part.name} className="card overflow-hidden p-0">
            <Art spec={part.scene} className="aspect-[16/8]" />
            <div className="p-5">
              <div className="kai text-3xl">{part.name}</div>
              <div className="mt-1 text-ink2">{part.desc}</div>
              <div className="mt-4 space-y-2.5">
                {STATIONS.filter((x) => x.part === part.name).map((x) => {
                  const open = isOpen(st, x.id), dn = stationDone(p, x.id), stars = stationStars(p, x.id);
                  return (
                    <motion.button key={x.id} whileHover={open ? { y: -2 } : {}} disabled={!open} onClick={() => { sfx('click'); go(`/s/${x.id}`); }}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${open ? 'bg-white hover:shadow' : 'bg-[#F1EBDD] opacity-70'}`} style={{ borderColor: open ? x.color + '66' : '#E6DCC6' }}>
                      <span className="text-3xl">{x.emoji}</span>
                      <div className="flex-1"><div className="text-lg font-black" style={{ color: x.color }}>{x.name}</div><div className="text-sm text-ink2">{x.sub}</div></div>
                      {open ? <div className="text-right"><div className="text-sm font-bold text-ink2">{dn} / {x.n}</div><div className="flex items-center justify-end gap-1 text-sm font-black text-amber-700">★ {stars}</div></div> : <span className="flex items-center gap-1 text-sm font-bold text-ink2"><Lock size={16} />等老师开放</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- 一关 ----------------
export function StationPage({ st }: { st: StationId }) {
  const p = useGame((s) => s.player)!;
  const S = ST[st];
  const open = useGame((s) => isOpen(s, st));
  // 当前这道题固定下来：做完以后停在讲解上，点“下一题”才换
  const [curId, setCurId] = useState<string | null | undefined>(undefined);
  const cur = curId === undefined ? nextItem(p, st)?.id ?? null : curId;
  useEffect(() => { if (curId === undefined && cur && p.recs[cur]) setCurId(cur); }, [cur, curId, p.recs]);
  if (!S) return null;
  if (!open) return <div className="mx-auto max-w-[700px] px-4 py-16 text-center"><div className="kai text-4xl">{S.name}</div><div className="mt-3 text-ink2">这一关老师还没开放。</div><div className="mt-6"><Btn onClick={() => go('/')}>回地图</Btn></div></div>;
  if ((st === 'en1' || st === 'en2') && !p.vocab) return <VocabCheck />;
  if (st === 'zj') return <StoryPage />;
  const it = cur ? ITEM_BY_ID[cur] : null;
  if (!it) return <StationDone st={st} />;
  const k = stationDone(p, st) - (p.recs[it.id]?.status === 'done' ? 1 : 0);
  return <ItemView key={it.id} it={it} color={S.color} k={k} n={S.n} title={S.name} onNext={() => { setCurId(nextItem(getState().player!, st)?.id ?? null); window.scrollTo(0, 0); }} />;
}
const StationDone = ({ st }: { st: StationId }) => {
  const p = useGame((s) => s.player)!;
  const S = ST[st];
  const recs = doneRecs(p, (r) => r.st === st);
  useEffect(() => { sfx('win'); }, []);
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10">
      <div className="card p-8 text-center">
        <div className="text-6xl">{S.emoji}</div>
        <div className="kai mt-2 text-4xl">「{S.name}」完成！</div>
        <div className="mt-3 flex justify-center"><Stars n={stationStars(p, st)} max={S.n * 3} size={26} /></div>
        <div className="mt-6 space-y-1.5 text-left">{recs.map((r) => <div key={r.id} className="flex items-center gap-3 rounded-xl bg-[#FBF7EE] px-4 py-2"><Stars n={r.stars} size={18} /><span className="font-bold">{ITEM_BY_ID[r.id].label}</span>{r.bonus > 0 && <span className="ml-auto text-sm font-black text-amber-700">妙笔 +{r.bonus}</span>}</div>)}</div>
        <div className="mt-8"><Btn size="lg" color={S.color} onClick={() => go('/')}>回地图，去下一关 →</Btn></div>
      </div>
    </div>
  );
};

// ---------------- 英语：词汇热身 ----------------
function VocabCheck() {
  const pid = useGame((s) => s.player?.pid ?? '');
  const order = useMemo(() => shuffleIdx(VOCAB.length, pid + 'vocab'), [pid]);
  const [known, setKnown] = useState<string[]>([]);
  return (
    <div className="mx-auto max-w-[820px] px-4 py-10">
      <div className="card p-8">
        <div className="text-3xl font-black">Warm-up：你认识哪些词？</div>
        <div className="mt-2 text-ink2">点一下你<b>认识</b>的词（知道意思就算）。不认识的别点——里面藏了几个编出来的假词，点了会被发现哦。这一步只是为了给你配合适的题。</div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {order.map((i) => { const w = VOCAB[i].w, on = known.includes(w); return <button key={w} onClick={() => { sfx('click'); setKnown((k) => (on ? k.filter((x) => x !== w) : [...k, w])); }} className={`rounded-2xl border-2 px-4 py-4 text-2xl font-black ${on ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-[#E6DCC6] bg-white'}`}>{on ? '✓ ' : ''}{w}</button>; })}
        </div>
        <div className="mt-8 flex items-center gap-4"><Btn size="lg" color="#2563EB" shadow="#1E40AF" onClick={() => setVocab(known)}>Let’s go →</Btn><span className="text-sm text-ink2">选好了就点。</span></div>
      </div>
    </div>
  );
}

// ---------------- 竹简故事 ----------------
function StoryPage() {
  const p = useGame((s) => s.player)!;
  const S = ST.zj;
  // 当前这道谜：做完以后先停在它的“后话”，点“往下走”才换下一道
  const [curId, setCurId] = useState<string | null>(() => nextItem(p, 'zj')?.id ?? null);
  const it = curId ? ITEM_BY_ID[curId] : null;
  const dn = stationDone(p, 'zj');
  const slot = it ? SLOTS.find((s) => s.no === it.slot) : undefined;
  const [phase, setPhase] = useState<'before' | 'item' | 'after'>(() => { const r = it && p.recs[it.id]; return r?.status === 'done' ? 'after' : r ? 'item' : 'before'; });
  const [beat, setBeat] = useState(0);
  const slips = doneRecs(p, (r) => r.st === 'zj').map((r) => ITEM_BY_ID[r.id].slip).filter(Boolean) as string[];
  if (!it || !slot) return <StoryEnd slips={slips} />;
  const room = ROOMS[slot.room];
  const beats = phase === 'after' ? slot.after : slot.before;
  const SlipBar = () => (
    <div className="mx-auto mb-3 flex max-w-[1280px] items-center gap-2 overflow-x-auto px-4 no-scrollbar">
      <span className="shrink-0 text-sm font-black text-[#8A6A2F]">拾回的竹简 {slips.length}/12</span>
      {slips.map((s, i) => <span key={i} className="kai shrink-0 rounded-md border border-[#9C8150] bg-[#E3CC94] px-2 py-1 text-sm">{s}</span>)}
    </div>
  );
  if (phase === 'item') return <><div className="pt-4"><SlipBar /></div><ItemView key={it.id} it={it} color={S.color} k={dn - (p.recs[it.id]?.status === 'done' ? 1 : 0)} n={S.n} title={`${S.name} · ${room.name}`} onNext={() => { setPhase('after'); setBeat(0); window.scrollTo(0, 0); }} /></>;
  const next = () => {
    sfx('flip');
    if (beat + 1 < beats.length) return setBeat(beat + 1);
    if (phase === 'before') { setPhase('item'); window.scrollTo(0, 0); return; }
    const nx = nextItem(getState().player!, 'zj');
    setCurId(nx?.id ?? null); setPhase('before'); setBeat(0); window.scrollTo(0, 0);
  };
  return (
    <div className="pt-4">
      <SlipBar />
      <div className="mx-auto max-w-[1000px] px-4">
        <div className="card overflow-hidden p-0">
          <div className="relative"><Art spec={slot.scene} className="aspect-[16/9]" />
            <div className="absolute left-4 top-4 rounded-xl bg-black/55 px-4 py-2 text-white"><div className="kai text-2xl">{room.name}</div>{room.time && <div className="text-sm opacity-80">{room.time}</div>}</div>
            {phase === 'after' && it.slip && <motion.div initial={{ y: 30, opacity: 0, rotate: -6 }} animate={{ y: 0, opacity: 1, rotate: -3 }} className="absolute bottom-5 right-6 rounded-md border-2 border-[#9C8150] bg-[#E3CC94] px-4 py-3 shadow-lg"><div className="text-xs font-black text-[#6E5530]">拾回一枚竹简</div><div className="kai text-2xl">{it.slip}</div></motion.div>}
          </div>
          <div className="min-h-[150px] p-6">
            {beats.slice(0, beat + 1).map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`mb-2 text-xl leading-relaxed ${i < beat ? 'opacity-55' : ''}`}>
                {b.who ? <><span className="kai mr-2 rounded bg-[#8A6A2F] px-2 py-0.5 text-base text-white">{b.who}</span><Rich text={b.t} /></> : <span className="text-ink2"><Rich text={b.t} /></span>}
              </motion.div>
            ))}
            <div className="mt-4 flex justify-end"><Btn color={S.color} onClick={next}>{beat + 1 < beats.length ? '继续 ▸' : phase === 'before' ? '解开这道谜 →' : '往下走 →'}</Btn></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function StoryEnd({ slips }: { slips: string[] }) {
  useEffect(() => { sfx('win'); }, []);
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <div className="card overflow-hidden p-0">
        <Art spec={{ k: 'ink', p: { k: 'museum' } }} className="aspect-[16/8]" />
        <div className="p-8 text-center">
          <div className="text-sm font-black text-[#8A6A2F]">十二枚竹简，串成了一卷</div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">{slips.map((s, i) => <span key={i} className="kai rounded-md border border-[#9C8150] bg-[#E3CC94] px-3 py-1.5 text-lg">{s}</span>)}</div>
          <div className="kai mt-8 text-4xl leading-relaxed tracking-wider">{FINAL_LINE}</div>
          <div className="mx-auto mt-4 max-w-[720px] text-left leading-relaxed text-ink2">{FINAL_NOTE}</div>
          <div className="mt-8"><Btn size="lg" color="#8A6A2F" onClick={() => go('/')}>回到推敲坊 →</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ---------------- 我的成绩 ----------------
export function MePage() {
  const p = useGame((s) => s.player)!;
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <div className="card p-8">
        <div className="flex items-center gap-4"><Avatar i={p.avatar} size={64} /><div><div className="text-3xl font-black">{p.name}</div><div className="text-ink2">{p.sid}</div></div><div className="ml-auto text-right"><div className="text-4xl font-black text-amber-700">★ {starsOf(p)}</div><div className="text-sm text-ink2">共 {STATIONS.reduce((s, x) => s + x.n * 3, 0)} 颗</div></div></div>
        <div className="mt-6 space-y-2">{STATIONS.map((x) => <div key={x.id} className="flex items-center gap-3 rounded-xl bg-[#FBF7EE] px-4 py-2.5"><span className="text-2xl">{x.emoji}</span><span className="font-black" style={{ color: x.color }}>{x.name}</span><span className="ml-auto text-sm text-ink2">{stationDone(p, x.id)} / {x.n} 题</span><span className="w-16 text-right font-black text-amber-700">★ {stationStars(p, x.id)}</span></div>)}</div>
        <div className="mt-6"><Btn onClick={() => go('/')}>回地图</Btn></div>
      </div>
    </div>
  );
}
export { Rich };
