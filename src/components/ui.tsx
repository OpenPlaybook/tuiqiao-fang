import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { useGame, onFly, onToast, logout } from '../game/store';
import { soundOn, setSound, sfx } from '../game/sound';
import { sideOf, starsOf } from '../shared/adapt';
import { renderArt } from '../art/ink';
import type { Art as ArtSpec } from '../shared/types';
import { DEMO } from '../game/demo';

// ---------------- 文字：**加粗**、*斜体*、___ 空、\n 换行；⟦词⟧ 可点（AI 眼镜释义）、⟪字⟫ 注拼音、⟨1⟩ 题的位置、〔原文｜白话〕点一下看白话 ----------------
import { createContext, useContext } from 'react';
import type { Gloss } from '../shared/types';
import type { GlossAt } from '../shared/gloss';
/** onGloss 的 at：被点的那一处在哪段文字里、是第几个——句中解释按它找（不同句子里的同一个字，解释不一样） */
export interface GlossCtx { gloss: Record<string, Gloss>; onGloss?: (w: string, g: Gloss, el: HTMLElement, at?: GlossAt) => void; marker?: (n: string, text?: string) => ReactNode }
export const GlossContext = createContext<GlossCtx>({ gloss: {} });
const TOK = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_{3,}|⟦[^⟧]+⟧|⟪[^⟫]+⟫|⟨[^⟩]+⟩|〔[^〕]+〕)/;
/** 讲解里引的文言：原文后面一个小“译”字，点开在后面接着显示白话（学生需要才看） */
const Yi = ({ wy, bh }: { wy: string; bh: string }) => {
  const [on, setOn] = useState(false);
  return (
    <span>
      <Rich text={wy} />
      <button onClick={(e) => { e.stopPropagation(); sfx('click'); setOn(!on); }} className="mx-0.5 inline-block rounded border border-[#9A5B2E]/50 px-1 align-[1px] text-[0.72em] font-bold leading-[1.35] text-[#9A5B2E] hover:bg-[#9A5B2E]/10">{on ? '收起' : '译'}</button>
      {on && <span className="rounded bg-[#9A5B2E]/10 px-1 font-normal text-[#5B4636]">（<Rich text={bh} />）</span>}
    </span>
  );
};
export const Rich = ({ text, className = '', fill, fills }: { text: string; className?: string; fill?: string; fills?: string[] }) => {
  const ctx = useContext(GlossContext);
  const lines = text.split('\n');
  let b = 0;
  const seen: Record<string, number> = {}; // 每个 ⟦词⟧ 是这段文字里的第几个（按出现的先后）
  const piece = (part: string, j: number): ReactNode => {
    // **字**：标出来的字（红色 + 底色），放在本来就是粗体的地方（选项、卡片）也看得出来
    if (/^\*\*/.test(part)) return <b key={j} className="kw">{part.slice(2, -2).split(TOK).map(piece)}</b>;
    if (/^\*[^*]/.test(part) && part.endsWith('*')) return <em key={j}>{part.slice(1, -1)}</em>;
    if (/^_{3,}$/.test(part)) return <span key={j} className="blank">{fills?.[b++] ?? fill ?? '\u00a0'}</span>;
    if (part.startsWith('⟦')) {
      const w = part.slice(1, -1), g = ctx.gloss[w], n = (seen[w] = (seen[w] ?? -1) + 1);
      if (!g) return <span key={j}>{w}</span>;
      // 鼠标放上去才看得出能点；点了才出释义
      return <span key={j} className="gloss" role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); ctx.onGloss?.(w, g, e.currentTarget, { text, n }); }}>{w}</span>;
    }
    if (part.startsWith('⟪')) { const w = part.slice(1, -1), py = ctx.gloss[w]?.py; return py ? <ruby key={j}>{w}<rt>{py}</rt></ruby> : <span key={j}>{w}</span>; }
    if (part.startsWith('〔')) { const [wy, bh] = part.slice(1, -1).split('｜'); return bh ? <Yi key={j} wy={wy} bh={bh} /> : <span key={j}>{wy}</span>; }
    if (part.startsWith('⟨')) { const [n, ...t] = part.slice(1, -1).split('|'); return <span key={j}>{ctx.marker ? ctx.marker(n, t.length ? t.join('|') : undefined) : t.length ? <Rich text={t.join('|')} /> : null}</span>; }
    return <span key={j}>{part}</span>;
  };
  return (
    <span className={className}>
      {lines.map((ln, i) => <span key={i}>{i > 0 && <br />}{ln.split(TOK).map(piece)}</span>)}
    </span>
  );
};

// ---------------- 画 ----------------
export const Art = ({ spec, className = '', style }: { spec: ArtSpec; className?: string; style?: CSSProperties }) => {
  const html = useMemo(() => renderArt(typeof spec === 'string' ? spec : { k: spec.k, p: spec.p }), [JSON.stringify(spec)]);
  return <div className={`art overflow-hidden ${className}`} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
};

// ---------------- 按钮 ----------------
type BtnProps = { children: ReactNode; onClick?: () => void; color?: string; shadow?: string; className?: string; disabled?: boolean; size?: 'sm' | 'md' | 'lg'; ink?: string; title?: string };
export const Btn = ({ children, onClick, color = '#2B2722', shadow, className = '', disabled, size = 'md', ink = '#fff', title }: BtnProps) => {
  const pad = size === 'sm' ? 'px-4 py-1.5 text-sm' : size === 'lg' ? 'px-8 py-3 text-xl' : 'px-6 py-2.5 text-base';
  return (
    <button title={title} disabled={disabled} onClick={() => { sfx('click'); onClick?.(); }} className={`btn3d ${pad} ${className}`}
      style={{ background: color, color: ink, ['--sh' as string]: shadow ?? 'rgba(0,0,0,.3)' }}>{children}</button>
  );
};

export const StarIcon = ({ size = 24, on = true }: { size?: number; on?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" fill={on ? '#E0A526' : '#E7DFCF'} stroke={on ? '#B9801A' : '#CFC4AE'} strokeWidth="1.2" strokeLinejoin="round" /></svg>
);
export const Stars = ({ n, max = 3, size = 22 }: { n: number; max?: number; size?: number }) => <span className="inline-flex gap-0.5">{Array.from({ length: max }, (_, i) => <StarIcon key={i} size={size} on={i < n} />)}</span>;

export const AVATARS = ['🦊', '🐼', '🐯', '🦉', '🐰', '🐨', '🦁', '🐸', '🐧', '🐱', '🐶', '🦄'];
export const Avatar = ({ i, size = 40 }: { i: number; size?: number }) => (
  <span className="inline-flex items-center justify-center rounded-full bg-white chunky" style={{ width: size, height: size, fontSize: size * 0.6 }}>{AVATARS[i % AVATARS.length]}</span>
);

// ---------------- 星星计数器、飞星星 ----------------
let counterEl: HTMLElement | null = null;
/** 支线“探索”分：问 AI 自己想出后一半、看字的别的用法 */
const SideCounter = () => {
  const p = useGame((s) => s.player);
  const n = p ? sideOf(p) : 0;
  if (!n) return null;
  return <motion.div key={n} initial={{ scale: 1.3 }} animate={{ scale: 1 }} title="探索分：问 AI 时自己想出了答案、去看了字的别的用法" className="flex items-center gap-1 rounded-full border-2 border-sky-200 bg-white/90 px-3 py-1 chunky"><span className="text-lg">🧭</span><span className="text-xl font-black tabular-nums text-sky-700">{n}</span></motion.div>;
};
const StarCounter = () => {
  const p = useGame((s) => s.player);
  const n = p ? starsOf(p) : 0;
  const [bump, setBump] = useState(0);
  const prev = useRef(n);
  useEffect(() => { if (n > prev.current) setBump((b) => b + 1); prev.current = n; }, [n]);
  return (
    <motion.div ref={(el) => { counterEl = el; }} key={bump} initial={{ scale: bump ? 1.3 : 1 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 rounded-full border-2 border-amber-200 bg-white/90 px-3 py-1 chunky">
      <StarIcon size={24} /><span className="text-2xl font-black tabular-nums text-amber-700">{n}</span>
    </motion.div>
  );
};
export const FlyLayer = () => {
  const [items, setItems] = useState<{ id: number; x: number; y: number; dx: number; dy: number; k: number }[]>([]);
  useEffect(() => onFly((f) => {
    const r = counterEl?.getBoundingClientRect();
    const tx = r ? r.left + 18 : window.innerWidth - 80, ty = r ? r.top + 16 : 30;
    const add = Array.from({ length: Math.min(f.n, 6) }, (_, k) => ({ id: f.id * 10 + k, x: f.x, y: f.y, dx: tx - f.x, dy: ty - f.y, k }));
    setItems((it) => [...it, ...add]);
    setTimeout(() => setItems((it) => it.filter((i) => !add.some((a) => a.id === i.id))), 1400);
  }), []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      {items.map((i) => (
        <motion.div key={i.id} className="absolute" style={{ left: i.x - 16, top: i.y - 16 }} initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
          animate={{ x: [0, (i.k - 1) * 26, i.dx], y: [0, -70, i.dy], scale: [0.4, 1.4, 0.7], opacity: [0, 1, 1] }} transition={{ duration: 0.95, delay: i.k * 0.08, times: [0, 0.35, 1] }}>
          <StarIcon size={32} />
        </motion.div>
      ))}
    </div>
  );
};
export const Toasts = () => {
  const [ts, setTs] = useState<{ id: number; emoji: string; title: string; text?: string }[]>([]);
  useEffect(() => onToast((t) => { setTs((x) => [...x, t]); setTimeout(() => setTs((x) => x.filter((y) => y.id !== t.id)), 3200); }), []);
  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-[95] flex -translate-x-1/2 flex-col items-center gap-3">
      <AnimatePresence>
        {ts.map((t) => (
          <motion.div key={t.id} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-2xl bg-[#2B2722] px-5 py-3 text-white chunky">
            <span className="text-3xl">{t.emoji}</span><div><div className="text-lg font-black">{t.title}</div>{t.text && <div className="text-sm opacity-85">{t.text}</div>}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const Modal = ({ open, onClose, children, width = 640 }: { open: boolean; onClose?: () => void; children: ReactNode; width?: number }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2B2722]/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="card relative max-h-[92vh] w-full overflow-auto p-6" style={{ maxWidth: width }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
          {onClose && <button className="absolute right-3 top-3 rounded-full p-1.5 text-ink2 hover:bg-black/5" onClick={onClose} aria-label="关闭"><X size={22} /></button>}
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const TopBar = () => {
  const p = useGame((s) => s.player);
  const [snd, setSnd] = useState(soundOn);
  if (!p) return null;
  return (
    <div className="sticky top-0 z-40 border-b-2 border-[#E6DCC6] bg-[#FBF7EE]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4">
        <a href="#/" className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-zhu text-lg font-black text-white kai">字</span><span className="kai text-2xl font-bold tracking-widest">字里行间</span></a>
        <div className="ml-auto flex items-center gap-2.5">
          <StarCounter />
          <SideCounter />
          <button onClick={() => { setSound(!snd); setSnd(!snd); }} className="rounded-full border-2 border-[#E6DCC6] bg-white/90 p-2 text-ink2" title={snd ? '关闭声音' : '打开声音'}>{snd ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
          {DEMO ? <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800" title="不用登录、不保存记录；刷新页面就从头开始">演示版</span> : <>
          <a href="#/me" className="flex items-center gap-2 pl-1"><Avatar i={p.avatar} size={40} /><div className="leading-tight"><div className="font-black">{p.name}</div><div className="text-xs text-ink2">{p.sid}</div></div></a>
          <button className="ml-1 text-xs text-ink2 underline" onClick={() => { if (confirm('确定要退出吗？进度已经保存，用同样的姓名和学校可以重新进入。')) logout(); }}>退出</button></>}
        </div>
      </div>
    </div>
  );
};

export const AttentionOverlay = () => {
  const on = useGame((s) => s.config.attention);
  const msg = useGame((s) => s.config.message);
  return (
    <AnimatePresence>
      {on && (
        <motion.div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#2B2722]/95 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="kai text-7xl">请看大屏幕</div>
          <div className="mt-5 text-xl opacity-80">{msg || '老师有话说。你的进度已经保存好了。'}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const centerOf = (el: Element | null | undefined) => { const r = el?.getBoundingClientRect(); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 }; };
export const seeded = (key: string) => { let h = 2166136261; for (const ch of key) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; };
export const shuffleIdx = (n: number, key: string) => { const r = seeded(key); const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const LETTERS = 'ABCDEFGH';
export const isEnter = (e: { key: string; keyCode: number; nativeEvent: { isComposing?: boolean } }) => e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229;
