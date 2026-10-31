// 自适应：能力估计、选题的难度版本、挑变式练习、星星与加权分。学生端和服务器共用，结果只取决于玩家记录。
import type { Item, KNode, Lv, Player, Rec, StationId, Track, Vocab } from './types';
import { ITEMS, ITEM_BY_ID, VOCAB } from './bank';
import { CHAPTERS, CHAPTER_BY_ID, NODE_BY_ID, chapterSlots } from './story';
import { PLAYS, PLAY_BY_ID } from './play';

export interface StationMeta { id: StationId; name: string; sub: string; n: number; track: Track; emoji: string; color: string; part: string }
/** 一章里的题（每道题是几个难度版本）：中文用播放式（PLAYS），英文还是第二版的故事页（CHAPTERS） */
export const slotsOf = (st: StationId): string[][] => PLAY_BY_ID[st] ? PLAY_BY_ID[st].lines.filter((l) => l.task).map((l) => l.task!) : CHAPTER_BY_ID[st] ? chapterSlots(CHAPTER_BY_ID[st]).map((x) => x.task) : [];
export const STATIONS: StationMeta[] = [
  ...PLAYS.map((c) => ({ id: c.id, name: c.title, sub: c.sub, n: slotsOf(c.id).length, track: 'zh' as Track, emoji: '📜', color: c.color, part: '中文 · 楚汉' })),
  ...CHAPTERS.filter((c) => c.line === 'en').map((c) => ({ id: c.id, name: c.title, sub: c.sub, n: chapterSlots(c).length, track: c.line, emoji: '🔎', color: c.color, part: 'English · The Golden Panda' })),
];
export const ST: Record<StationId, StationMeta> = Object.fromEntries(STATIONS.map((s) => [s.id, s]));
export const TRACKS: { id: Track; name: string }[] = [{ id: 'zh', name: '中文' }, { id: 'en', name: '英语' }];
export const trackOf = (st: StationId): Track => ST[st]?.track ?? (/^e/.test(st) ? 'en' : 'zh');
/** 一道题属于哪条线：看它讲的知识点，或者它所在的章、题号前缀 */
export const lineOf = (it: Item): Track => (it.node && NODE_BY_ID[it.node]?.line) || (CHAPTER_BY_ID[it.st]?.line ?? (/^(en|ew)/.test(it.id) ? 'en' : 'zh'));

export const B: Record<Lv, number> = { 1: -1.2, 2: -0.3, 3: 0.6, 4: 1.5 };
export const W: Record<Lv, number> = { 1: 1, 2: 1.5, 3: 2, 4: 2.6 };
export const LV_NAME: Record<Lv, string> = { 1: '★', 2: '★★', 3: '★★★', 4: '👑' };
const THETA0 = -0.6;
const pExpect = (th: number, b: number) => 1 / (1 + Math.exp(-1.4 * (th - b)));

// ---------------- 英语起点：词汇热身（保留，现在不强制） ----------------
export const vocabScore = (known: string[]) => {
  let s = 0, fake = 0;
  for (const v of VOCAB) if (known.includes(v.w)) { if (v.band < 0) fake++; else s += [1, 1.5, 2][v.band]; }
  return { score: Math.max(0, s - 2 * fake), fake };
};
const vocabTheta = (v: Vocab) => Math.max(-1.5, Math.min(1.5, -1.5 + 3 * (v.score / 13.5)));

// ---------------- 能力估计（按完成的先后重放一遍；故事题和变式练习都算） ----------------
export const doneRecs = (p: Player, f: (r: Rec) => boolean = () => true) =>
  Object.values(p.recs).filter((r) => r.status === 'done' && ITEM_BY_ID[r.id] && f(r)).sort((a, b) => (a.t1 ?? 0) - (b.t1 ?? 0));
export const thetaOf = (p: Player, tr: Track) => {
  let th = tr === 'en' && p.vocab ? vocabTheta(p.vocab) : THETA0;
  doneRecs(p, (r) => lineOf(ITEM_BY_ID[r.id]) === tr).forEach((r, i) => {
    const K = Math.max(0.35, 0.8 - 0.05 * i);
    th += K * (r.perf - pExpect(th, B[ITEM_BY_ID[r.id].lv]));
  });
  return Math.max(-2.5, Math.min(2.5, th));
};
export const thetaLv = (th: number) => Math.max(1, Math.min(4, 1 + (th + 1.65) / 0.9));

// ---------------- 一章的进度 ----------------
export const stationRecs = (p: Player, st: StationId) => Object.values(p.recs).filter((r) => r.st === st && !r.prac);
export const stationDone = (p: Player, st: StationId) => stationRecs(p, st).filter((r) => r.status === 'done').length;
export const stationFinished = (p: Player, st: StationId) => stationDone(p, st) >= (ST[st]?.n ?? 0);
const pickLv = (vs: Item[], target: number) => vs.reduce((a, b) => (Math.abs(B[b.lv] - target) < Math.abs(B[a.lv] - target) - 1e-9 ? b : a), vs[0]);
/** 第 k 道题（同一道题的几个难度版本里挑一个；做过的就是做过的那个） */
export const slotItem = (p: Player, st: StationId, k: number): Item | null => taskItem(p, slotsOf(st)[k], trackOf(st));
/** 一道题的几个难度版本里挑一个（做过的就是做过的那个） */
export const taskItem = (p: Player, ids: string[] | undefined, tr: Track): Item | null => {
  if (!ids?.length) return null;
  const had = ids.find((id) => p.recs[id] && !p.recs[id].prac);
  if (had) return ITEM_BY_ID[had];
  const vs = ids.map((id) => ITEM_BY_ID[id]).filter(Boolean);
  return vs.length ? pickLv(vs, thetaOf(p, tr) - 0.1) : null;
};
export const nextItem = (p: Player, st: StationId): Item | null => {
  const n = ST[st]?.n ?? 0;
  for (let k = 0; k < n; k++) { const it = slotItem(p, st, k); if (it && p.recs[it.id]?.status !== 'done') return it; }
  return null;
};
/** 变式练习：这个知识点下还没做过的题里，挑难度最合适的 */
export const pickPractice = (p: Player, node: KNode | undefined, exclude: string[] = []): Item | null => {
  if (!node) return null;
  const vs = node.practice.map((id) => ITEM_BY_ID[id]).filter((it) => it && !p.recs[it.id] && !exclude.includes(it.id));
  return vs.length ? pickLv(vs, thetaOf(p, node.line) - 0.2) : null;
};

// ---------------- 一题的星星与表现 ----------------
export const scoredSteps = (it: Item) => it.steps.filter((s) => !(s.kind === 'write' && s.bonus));
/** 每一步的得分（第一次就对 1，第二次 0.67，之后 0.34）→ 星星和“表现”（答错到最后才对的算 0，用了“不确定”打七折） */
export const resultOf = (scores: number[], unsure: number) => {
  const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;
  const perfStep = (x: number): number => (x >= 0.99 ? 1 : x >= 0.84 ? 0.75 : x >= 0.66 ? 0.5 : x >= 0.49 ? 0.3 : 0);
  const perf = scores.length ? scores.map(perfStep).reduce((a, b) => a + b, 0) / scores.length : 1;
  return { stars: Math.max(1, Math.round(3 * mean)), perf: Math.max(0, Math.min(1, perf * (unsure > 0 ? 0.7 : 1))) };
};
/** 第一次就答对、没点“不确定”：可以不做变式练习 */
export const cleanFirst = (r: Rec | undefined) => !!r && r.status === 'done' && r.perf >= 0.99;

// ---------------- 汇总 ----------------
/** 拓展也算主线星星：每做完一个拓展（得分六成以上）加 1 颗 */
export const extStars = (r: Rec) => Object.values((r.data?.ext as Record<string, number>) ?? {}).filter((x) => x >= 0.6).length;
const recStars = (r: Rec) => (r.status === 'done' ? r.stars : 0) + extStars(r);
export const starsOf = (p: Player) => Object.values(p.recs).reduce((s, r) => s + recStars(r), 0);
/** 支线“探索”分：问 AI 时自己想出了后一半（askok）、点字时去看了这个字的别的用法并答对（more，同一个字只算一次） */
export const sideOf = (p: Player) => Object.values(p.recs).filter((r) => r.id.endsWith('-log')).reduce((s, r) => s + r.log.filter((e) => e.q === 'askok').length + new Set(r.log.filter((e) => e.q === 'more').map((e) => e.v)).size, 0);
export const bonusOf = (p: Player) => Object.values(p.recs).reduce((s, r) => s + (r.bonus || 0), 0);
export const weightedOf = (p: Player) => Math.round((doneRecs(p).reduce((s, r) => s + r.stars * W[ITEM_BY_ID[r.id].lv] + extStars(r), 0) + bonusOf(p)) * 10) / 10;
export const stationStars = (p: Player, st: StationId) => stationRecs(p, st).reduce((s, r) => s + recStars(r), 0);
export const unsureOf = (p: Player) => Object.values(p.recs).reduce((s, r) => s + (r.unsure || 0), 0);
export const avgLvOf = (p: Player, tr?: Track) => { const d = doneRecs(p, (r) => !r.prac && (!tr || trackOf(r.st) === tr)); return d.length ? d.reduce((s, r) => s + ITEM_BY_ID[r.id].lv, 0) / d.length : 0; };
export const pracOf = (p: Player) => { const d = doneRecs(p, (r) => !!r.prac); return { n: d.length, ok: d.filter((r) => r.perf >= 0.99).length }; };
export const maxStars = () => STATIONS.reduce((s, x) => s + 3 * x.n, 0);
export const newPlayer = (pid: string, token: string, name: string, sid: string, avatar: number): Player => ({ pid, token, name, sid, avatar, createdAt: Date.now(), recs: {}, updatedAt: Date.now() });
export { ITEMS };
