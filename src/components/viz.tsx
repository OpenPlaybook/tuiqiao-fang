// 讲解用的画面和小动画：时间线、借进借出的箭头、褒贬天平、礼貌刻度、句子主干、词性变化、文言词义、“看”的一家人。
// 其余的（水墨、表情、眼睛……）交给 Art。
import { motion } from 'motion/react';
import type { Art as ArtSpec } from '../shared/types';
import { Art } from './ui';

const INK = '#2B2722', ZHU = '#B8352A', GRN = '#2F7A4A', BLUE = '#2563EB', GRAY = '#7A7068', GOLD = '#D9A441';
type P = Record<string, unknown>;
const loop = { duration: 2.6, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' as const };

// ---------------- 时间线：现在完成时 / 一般过去时 ----------------
const Timeline = ({ p }: { p: P }) => {
  if (p.mode === 'cont') return <TimelineCont />;
  const perfect = p.mode !== 'past';
  return (
    <svg viewBox="0 0 640 230" className="w-full">
      <line x1="30" y1="140" x2="610" y2="140" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M610,140 l-14,-9 v18 z" fill={INK} />
      <text x="40" y="180" fontSize="20" fill={GRAY} fontWeight="700">过去 past</text>
      <line x1="520" y1="120" x2="520" y2="160" stroke={ZHU} strokeWidth="4" />
      <text x="520" y="185" fontSize="22" fill={ZHU} fontWeight="900" textAnchor="middle">现在 now</text>
      <circle cx="200" cy="140" r="12" fill={BLUE} />
      <text x="200" y="110" fontSize="20" fill={BLUE} fontWeight="800" textAnchor="middle">{perfect ? '（某个时候）被拿走' : '2:15 被拿走'}</text>
      <text x="200" y="88" fontSize="18" fill={BLUE} textAnchor="middle">{perfect ? 'has taken' : 'took (at 2:15)'}</text>
      {perfect ? (
        <>
          <motion.rect x="200" y="132" height="16" rx="8" fill={GOLD} opacity=".75" initial={{ width: 0 }} animate={{ width: [0, 320, 320] }} transition={loop} />
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 1] }} transition={{ ...loop, times: [0, 0.55, 0.7, 1] }}>
            <text x="520" y="70" fontSize="40" textAnchor="middle">🏆</text>
            <line x1="495" y1="45" x2="545" y2="85" stroke={ZHU} strokeWidth="6" strokeLinecap="round" />
            <text x="520" y="215" fontSize="20" fill={INK} fontWeight="800" textAnchor="middle">现在还不在！</text>
          </motion.g>
          <text x="360" y="212" fontSize="18" fill={GRAY} textAnchor="middle">结果一直留到现在</text>
        </>
      ) : (
        <>
          <motion.circle cx="200" cy="140" r="22" fill="none" stroke={BLUE} strokeWidth="3" animate={{ r: [12, 30], opacity: [1, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />
          <text x="520" y="70" fontSize="22" fill={GRAY} textAnchor="middle">（现在怎样？</text>
          <text x="520" y="96" fontSize="22" fill={GRAY} textAnchor="middle">没有说）</text>
          <text x="360" y="212" fontSize="18" fill={GRAY} textAnchor="middle">只说过去那一刻发生了什么</text>
        </>
      )}
    </svg>
  );
};

// ---------------- 过去进行时：一段“正在做”，那一刻落在中间 ----------------
const TimelineCont = () => (
  <svg viewBox="0 0 640 230" className="w-full">
    <line x1="30" y1="140" x2="610" y2="140" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    <path d="M610,140 l-14,-9 v18 z" fill={INK} />
    <text x="40" y="180" fontSize="20" fill={GRAY} fontWeight="700">过去 past</text>
    <line x1="540" y1="120" x2="540" y2="160" stroke={GRAY} strokeWidth="3" />
    <text x="540" y="185" fontSize="20" fill={GRAY} fontWeight="800" textAnchor="middle">现在 now</text>
    <motion.rect x="110" y="128" height="24" rx="12" fill={GOLD} opacity=".8" initial={{ width: 0 }} animate={{ width: [0, 300, 300] }} transition={loop} />
    <text x="260" y="112" fontSize="22" fill="#8A5A10" fontWeight="900" textAnchor="middle">was eating（一直在吃）</text>
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 1] }} transition={{ ...loop, times: [0, 0.45, 0.55, 1] }}>
      <line x1="260" y1="60" x2="260" y2="160" stroke={ZHU} strokeWidth="4" strokeDasharray="6 5" />
      <text x="260" y="48" fontSize="22" fill={ZHU} fontWeight="900" textAnchor="middle">💡→⚫ 2:15 灯灭了</text>
      <text x="260" y="208" fontSize="19" fill={INK} fontWeight="800" textAnchor="middle">灯灭的那一刻，正在吃——已经吃了一会儿</text>
    </motion.g>
  </svg>
);

// ---------------- borrow / lend：同一个动作，主语不同 ----------------
const Give = () => (
  <svg viewBox="0 0 640 250" className="w-full">
    <text x="110" y="120" fontSize="64" textAnchor="middle">🧑</text><text x="110" y="160" fontSize="22" fontWeight="800" textAnchor="middle" fill={INK}>you</text>
    <text x="530" y="120" fontSize="64" textAnchor="middle">👱</text><text x="530" y="160" fontSize="22" fontWeight="800" textAnchor="middle" fill={INK}>Ben</text>
    <line x1="170" y1="100" x2="470" y2="100" stroke={GRAY} strokeWidth="3" strokeDasharray="8 8" />
    <motion.text y="112" fontSize="40" textAnchor="middle" initial={{ x: 180 }} animate={{ x: [180, 460, 460] }} transition={loop}>📒</motion.text>
    <path d="M470,100 l-16,-10 v20 z" fill={GRAY} />
    <rect x="20" y="180" width="290" height="58" rx="14" fill={ZHU} opacity=".1" /><text x="165" y="206" fontSize="20" fontWeight="900" textAnchor="middle" fill={ZHU}>You lend Ben your notebook.</text><text x="165" y="229" fontSize="17" textAnchor="middle" fill={INK}>从你这边看：借出去</text>
    <rect x="330" y="180" width="290" height="58" rx="14" fill={BLUE} opacity=".1" /><text x="475" y="206" fontSize="20" fontWeight="900" textAnchor="middle" fill={BLUE}>Ben borrows your notebook.</text><text x="475" y="229" fontSize="17" textAnchor="middle" fill={INK}>从 Ben 那边看：借进来</text>
    <text x="320" y="40" fontSize="20" fill={GRAY} textAnchor="middle">同一个本子，同一条路——看谁是主语</text>
  </svg>
);

// ---------------- 褒贬天平 / 程度刻度 ----------------
const Scale = ({ p }: { p: P }) => {
  const L = (p.left as string[]) ?? [], M = (p.mid as string[]) ?? [], R = (p.right as string[]) ?? [];
  const chip = (t: string, i: number, c: string) => <motion.span key={t} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }} className="rounded-full px-3 py-1 text-[15px] font-black" style={{ background: c + '1A', color: c }}>{t}</motion.span>;
  return (
    <div className="w-full">
      <div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, ${ZHU}, #E7DFCF 50%, ${GRN})` }} />
      <div className="mt-1 flex justify-between text-sm font-black"><span style={{ color: ZHU }}>{String(p.lt ?? '贬')}</span><span style={{ color: GRN }}>{String(p.rt ?? '褒')}</span></div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="flex flex-wrap gap-1.5">{L.map((t, i) => chip(t, i, ZHU))}</div>
        <div className="flex flex-wrap justify-center gap-1.5">{M.map((t, i) => chip(t, i + L.length, GRAY))}</div>
        <div className="flex flex-wrap justify-end gap-1.5">{R.map((t, i) => chip(t, i + L.length + M.length, GRN))}</div>
      </div>
    </div>
  );
};
const Meter = ({ p }: { p: P }) => {
  const items = (p.items as [string, number][]) ?? [];
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm font-black"><span style={{ color: ZHU }}>生硬</span><span style={{ color: GRN }}>客气</span></div>
      <div className="relative mt-1 h-3 rounded-full" style={{ background: `linear-gradient(90deg, ${ZHU}, ${GOLD}, ${GRN})` }} />
      <div className="relative mt-1 h-[150px]">
        {items.map(([t, v], i) => (
          <motion.div key={t} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.25 }} className="absolute flex flex-col items-center" style={{ left: `${v * 100}%`, top: (i % 2) * 70, transform: 'translateX(-50%)' }}>
            <span className="h-4 w-0.5 bg-[#2B2722]" />
            <span className="whitespace-nowrap rounded-lg bg-white px-2 py-0.5 text-[14px] font-bold shadow">{t}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ---------------- 句子主干：缺了谁 ----------------
const Trunk = ({ p }: { p: P }) => {
  const parts = (p.parts as [string, string][]) ?? [];
  const tag: Record<string, [string, string]> = { pp: ['介词短语（不能当主语）', GRAY], v: ['谓语', BLUE], o: ['宾语', GRN], rest: ['', INK], s: ['主语', ZHU] };
  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end gap-1.5">
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="flex flex-col items-center">
          <span className="rounded-xl border-[3px] border-dashed px-4 py-2 text-2xl font-black" style={{ borderColor: ZHU, color: ZHU }}>？</span>
          <span className="mt-1 text-xs font-black" style={{ color: ZHU }}>主语在哪？</span>
        </motion.div>
        {parts.map(([t, k], i) => (
          <div key={i} className="flex flex-col items-center">
            <span className={`rounded-xl px-3 py-2 text-xl font-bold ${k === 'pp' ? 'line-through decoration-2' : ''}`} style={{ background: tag[k][1] + '14', color: tag[k][1] }}>{t}</span>
            <span className="mt-1 text-xs font-bold" style={{ color: tag[k][1] }}>{tag[k][0]}</span>
          </div>
        ))}
      </div>
      {typeof p.q === 'string' && <div className="mt-3 text-lg font-black" style={{ color: ZHU }}>{p.q}</div>}
    </div>
  );
};

// ---------------- 词性变化：饭 → 饭信 ----------------
const Morph = ({ p }: { p: P }) => {
  const [a, am] = (p.from as string[]) ?? ['', ''], [b, bm] = (p.to as string[]) ?? ['', ''];
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="rounded-2xl bg-[#F7EFD9] px-5 py-3 text-center"><div className="kai text-5xl">{a}</div><div className="mt-1 text-sm font-bold text-ink2">{am}</div></div>
      <motion.div animate={{ x: [0, 10, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-3xl" style={{ color: ZHU }}>➜</motion.div>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-2xl border-2 px-5 py-3 text-center" style={{ borderColor: ZHU }}><div className="kai text-5xl" style={{ color: ZHU }}>{b}</div><div className="mt-1 text-sm font-black" style={{ color: ZHU }}>{bm}</div></motion.div>
    </div>
  );
};

// ---------------- 文言一句：关键字换成今天的话 ----------------
const Gloss = ({ p }: { p: P }) => {
  const s = String(p.s ?? ''), g = (p.g as [string, string][]) ?? [];
  const keys = g.map(([w]) => w.split('……')[0]);
  const parts: { t: string; hit: boolean }[] = [];
  let i = 0;
  while (i < s.length) { const k = keys.find((w) => w && s.startsWith(w, i)); if (k) { parts.push({ t: k, hit: true }); i += k.length; } else { parts.push({ t: s[i], hit: false }); i++; } }
  return (
    <div className="w-full">
      <div className="kai text-3xl leading-relaxed">{parts.map((x, j) => <span key={j} className={x.hit ? 'rounded bg-amber-100 px-0.5' : ''} style={x.hit ? { color: ZHU } : {}}>{x.t}</span>)}</div>
      <div className="mt-3 flex flex-wrap gap-2">{g.map(([w, m], j) => <motion.span key={w} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + j * 0.2 }} className="rounded-xl bg-white px-3 py-1.5 text-[15px] font-bold shadow-sm"><span className="kai text-lg" style={{ color: ZHU }}>{w}</span> ＝ {m}</motion.span>)}</div>
    </div>
  );
};

// ---------------- “看”的一家人（眼睛） ----------------
const EyesGrid = ({ p }: { p: P }) => (
  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">{((p.ks as string[]) ?? []).map((k) => <div key={k} className="overflow-hidden rounded-xl border-2 border-[#E6DCC6] bg-white"><Art spec={{ k: 'eyes', p: { k } }} className="aspect-[56/22]" /></div>)}</div>
);
// ---------------- look / see / watch ----------------
const LSW = () => (
  <div className="grid grid-cols-3 gap-3 text-center">
    {[
      ['look at', '把眼睛转过去', <svg key="a" viewBox="0 0 120 70"><motion.text x="20" y="45" fontSize="34" animate={{ rotate: [0, 18, 18, 0] }} transition={loop} style={{ originX: '35px', originY: '35px' }}>👀</motion.text><text x="80" y="48" fontSize="34">🕐</text></svg>],
      ['see', '东西进了眼睛：看见', <svg key="b" viewBox="0 0 120 70"><text x="10" y="45" fontSize="34">👁️</text><motion.text y="45" fontSize="30" animate={{ x: [95, 50, 50] }} transition={loop}>🐦</motion.text></svg>],
      ['watch', '盯着看一段时间', <svg key="c" viewBox="0 0 120 70"><text x="6" y="45" fontSize="34">👀</text><text x="70" y="45" fontSize="34">📺</text><motion.rect x="10" y="58" height="6" rx="3" fill={BLUE} animate={{ width: [0, 100] }} transition={loop} /></svg>],
    ].map(([w, d, g]) => <div key={String(w)} className="rounded-2xl bg-white px-2 py-3 shadow-sm">{g}<div className="text-xl font-black" style={{ color: BLUE }}>{w}</div><div className="text-sm text-ink2">{d}</div></div>)}
  </div>
);

// ---------------- 两个场景对比：这个词说的是左边，原文发生的是右边 ----------------
const Contrast = ({ p }: { p: P }) => {
  const a = (p.a as string[]) ?? ['', ''], b = (p.b as string[]) ?? ['', ''];
  return (
    <div className="grid grid-cols-2 gap-2">
      {[a, b].map(([ic, t], i) => <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.3 }} className={`rounded-xl px-3 py-2 text-center ${i ? 'bg-emerald-50' : 'bg-rose-50'}`}><div className="text-3xl">{ic}</div><div className="mt-1 text-sm font-bold">{t}</div></motion.div>)}
    </div>
  );
};

const VIZ: Record<string, (props: { p: P }) => React.ReactElement> = { timeline: Timeline, give: Give, scale: Scale, meter: Meter, trunk: Trunk, morph: Morph, gloss: Gloss, eyesgrid: EyesGrid, lsw: LSW, contrast: Contrast };
export const isViz = (spec?: ArtSpec) => !!spec && typeof spec !== 'string' && !!VIZ[spec.k];
export const Viz = ({ spec, className = '' }: { spec: ArtSpec; className?: string }) => {
  if (typeof spec !== 'string' && VIZ[spec.k]) { const C = VIZ[spec.k]; return <div className={className}><C p={(spec.p ?? {}) as P} /></div>; }
  return <Art spec={spec} className={`aspect-[16/10] rounded-2xl border-2 border-[#E6DCC6] ${className}`} />;
};
