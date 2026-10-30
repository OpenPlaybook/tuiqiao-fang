// 自适应：能力估计、选下一题、星星与加权分。学生端和服务器共用，结果只取决于玩家记录（换台电脑也一样）。
import type { Item, Lv, Player, Rec, StationId, Track, Vocab } from './types';
import { ITEMS, ITEM_BY_ID, VOCAB } from './bank';

export interface StationMeta { id: StationId; name: string; sub: string; n: number; track: Track; emoji: string; color: string; part: string }
export const STATIONS: StationMeta[] = [
  { id: 'ci', name: '一字之差', sub: '近义词 · 易混词', n: 6, track: 'zh', emoji: '🔍', color: '#B4532A', part: '字词坊' },
  { id: 'cy', name: '成语小剧场', sub: '成语的意思和用法', n: 6, track: 'zh', emoji: '🎭', color: '#7A4E9C', part: '字词坊' },
  { id: 'bj', name: '编辑部', sub: '病句 · 推敲 · 分寸', n: 6, track: 'zh', emoji: '✒️', color: '#2F6E5B', part: '字词坊' },
  { id: 'zj', name: '太史公的竹简', sub: '成语 · 文言 · 历史 · 诗', n: 12, track: 'gu', emoji: '📜', color: '#8A6A2F', part: '古今通道' },
  { id: 'en1', name: 'Ben’s Week', sub: 'Words in situations', n: 7, track: 'en', emoji: '☕', color: '#2563EB', part: 'English' },
  { id: 'en2', name: 'Write & Fix', sub: 'Find it, fix it, write it', n: 5, track: 'en', emoji: '✍️', color: '#DB2777', part: 'English' },
];
export const ST: Record<StationId, StationMeta> = Object.fromEntries(STATIONS.map((s) => [s.id, s])) as Record<StationId, StationMeta>;
export const TRACKS: { id: Track; name: string }[] = [{ id: 'zh', name: '现代汉语' }, { id: 'gu', name: '文言与历史' }, { id: 'en', name: '英语' }];
export const trackOf = (st: StationId): Track => ST[st].track;

export const B: Record<Lv, number> = { 1: -1.2, 2: -0.3, 3: 0.6, 4: 1.5 };
export const W: Record<Lv, number> = { 1: 1, 2: 1.5, 3: 2, 4: 2.6 };
export const LV_NAME: Record<Lv, string> = { 1: '★', 2: '★★', 3: '★★★', 4: '👑' };
const THETA0 = -0.6;
const pExpect = (th: number, b: number) => 1 / (1 + Math.exp(-1.4 * (th - b)));

// ---------------- 英语起点：词汇热身 ----------------
export const vocabScore = (known: string[]) => {
  let s = 0, fake = 0;
  for (const v of VOCAB) if (known.includes(v.w)) { if (v.band < 0) fake++; else s += [1, 1.5, 2][v.band]; }
  return { score: Math.max(0, s - 2 * fake), fake };
};
const vocabTheta = (v: Vocab) => Math.max(-1.5, Math.min(1.5, -1.5 + 3 * (v.score / 13.5)));

// ---------------- 能力估计（按完成的先后重放一遍） ----------------
export const doneRecs = (p: Player, f: (r: Rec) => boolean = () => true) =>
  Object.values(p.recs).filter((r) => r.status === 'done' && ITEM_BY_ID[r.id] && f(r)).sort((a, b) => (a.t1 ?? 0) - (b.t1 ?? 0));
export const thetaOf = (p: Player, tr: Track) => {
  let th = tr === 'en' && p.vocab ? vocabTheta(p.vocab) : THETA0;
  doneRecs(p, (r) => trackOf(r.st) === tr).forEach((r, i) => {
    const K = Math.max(0.35, 0.8 - 0.05 * i);
    th += K * (r.perf - pExpect(th, B[ITEM_BY_ID[r.id].lv]));
  });
  return Math.max(-2.5, Math.min(2.5, th));
};
/** 能力值换算成 1—4（★—👑），给老师看 */
export const thetaLv = (th: number) => Math.max(1, Math.min(4, 1 + (th + 1.65) / 0.9));

// ---------------- 选下一题 ----------------
const seeded = (key: string) => { let h = 2166136261; for (const ch of key) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; };
export const stationRecs = (p: Player, st: StationId) => Object.values(p.recs).filter((r) => r.st === st);
export const stationDone = (p: Player, st: StationId) => stationRecs(p, st).filter((r) => r.status === 'done').length;
export const stationFinished = (p: Player, st: StationId) => stationDone(p, st) >= ST[st].n;

export const nextItem = (p: Player, st: StationId): Item | null => {
  const recs = stationRecs(p, st);
  const doing = recs.find((r) => r.status === 'doing');
  if (doing && ITEM_BY_ID[doing.id]) return ITEM_BY_ID[doing.id];
  const done = doneRecs(p, (r) => r.st === st);
  if (done.length >= ST[st].n) return null;
  const target = thetaOf(p, ST[st].track) - 0.1; // 第一次就答对的可能大约一半多一点：够一够能做到
  if (st === 'zj') {
    // 竹简：第几道谜是固定的，只在几个难度版本里挑
    const slot = done.length + 1;
    const vs = ITEMS.filter((i) => i.st === 'zj' && i.slot === slot);
    return vs.reduce((a, b) => (Math.abs(B[b.lv] - target) < Math.abs(B[a.lv] - target) - 1e-9 ? b : a), vs[0]) ?? null;
  }
  const items = done.map((r) => ITEM_BY_ID[r.id]);
  const usedTopics = new Set(items.map((i) => i.topic));
  const last2 = done.slice(-2);
  const mastered = last2.length === 2 && ITEM_BY_ID[last2[0].id].type === ITEM_BY_ID[last2[1].id].type && last2.every((r) => r.perf >= 0.85) ? ITEM_BY_ID[last2[1].id].type : null;
  const last = done[done.length - 1];
  const struggling = last && last.perf < 0.5 ? ITEM_BY_ID[last.id].type : null;
  const typeCount: Record<string, number> = {};
  for (const i of items) typeCount[i.type] = (typeCount[i.type] ?? 0) + 1;
  const rnd = seeded(`${p.pid}|${st}|${done.length}`);
  const cands = ITEMS.filter((i) => i.st === st && !p.recs[i.id] && !usedTopics.has(i.topic));
  let best: Item | null = null, bestCost = Infinity;
  for (const i of cands) {
    const cost = Math.abs(B[i.lv] - target)
      + (i.type === mastered ? 0.9 : 0)
      + (struggling && i.type === struggling ? -0.35 : 0)
      + 0.25 * (typeCount[i.type] ?? 0)
      + 0.3 * rnd();
    if (cost < bestCost) { bestCost = cost; best = i; }
  }
  return best;
};

// ---------------- 一题的星星与表现 ----------------
/** 计分的步骤（加分题不算） */
export const scoredSteps = (it: Item) => it.steps.filter((s) => !(s.kind === 'write' && s.bonus));
/** 每一步的得分（0.34—1：第一次就对 1，第二次 0.67，之后 0.34）→ 星星和“表现”。
 *  星星：至少 1 颗（做完就有）；表现用来估计能力：答错到最后才对的步骤算 0，用了“不确定”打七折。 */
export const resultOf = (scores: number[], unsure: number) => {
  const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;
  const perfStep = (x: number): number => (x >= 0.99 ? 1 : x >= 0.84 ? 0.75 : x >= 0.66 ? 0.5 : x >= 0.49 ? 0.3 : 0);
  const perf = scores.length ? scores.map(perfStep).reduce((a, b) => a + b, 0) / scores.length : 1;
  return { stars: Math.max(1, Math.round(3 * mean)), perf: Math.max(0, Math.min(1, perf * (unsure > 0 ? 0.7 : 1))) };
};

// ---------------- 汇总 ----------------
export const starsOf = (p: Player) => Object.values(p.recs).reduce((s, r) => s + (r.status === 'done' ? r.stars : 0), 0);
export const bonusOf = (p: Player) => Object.values(p.recs).reduce((s, r) => s + (r.bonus || 0), 0);
export const weightedOf = (p: Player) => Math.round((doneRecs(p).reduce((s, r) => s + r.stars * W[ITEM_BY_ID[r.id].lv], 0) + bonusOf(p)) * 10) / 10;
export const stationStars = (p: Player, st: StationId) => stationRecs(p, st).reduce((s, r) => s + (r.status === 'done' ? r.stars : 0), 0);
export const unsureOf = (p: Player) => Object.values(p.recs).reduce((s, r) => s + (r.unsure || 0), 0);
export const avgLvOf = (p: Player, tr?: Track) => { const d = doneRecs(p, (r) => !tr || trackOf(r.st) === tr); return d.length ? d.reduce((s, r) => s + ITEM_BY_ID[r.id].lv, 0) / d.length : 0; };
export const maxStars = () => STATIONS.reduce((s, x) => s + 3 * x.n, 0);
export const newPlayer = (pid: string, token: string, name: string, sid: string, avatar: number): Player => ({ pid, token, name, sid, avatar, createdAt: Date.now(), recs: {}, updatedAt: Date.now() });
