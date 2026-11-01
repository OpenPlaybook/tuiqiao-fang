// 自适应：能力估计、选题的难度版本、星星与加权分。学生端和服务器共用，结果只取决于玩家记录。
import type { Item, Line, Lv, Player, Rec, StationId, Track } from './types';
import { ITEMS, ITEM_BY_ID } from './bank';
import { PLAYS, PLAY_BY_ID } from './play';
import { NODES, NODE_BY_ID, laneHas, lanesOf } from './play/storymap';

export interface StationMeta { id: StationId; name: string; sub: string; n: number; track: Track; emoji: string; color: string; part: string }
/** 一回里的题（每道题是几个难度版本） */
export const slotsOf = (st: StationId): string[][] => PLAY_BY_ID[st]?.lines.filter((l) => l.task).map((l) => l.task!) ?? [];
export const STATIONS: StationMeta[] = PLAYS.map((c) => c.lang === 'en'
  ? { id: c.id, name: c.title, sub: c.sub, n: slotsOf(c.id).length, track: 'en' as Track, emoji: '🔎', color: c.color, part: 'English · The Golden Panda' }
  : { id: c.id, name: c.title, sub: c.sub, n: slotsOf(c.id).length, track: 'zh' as Track, emoji: '📜', color: c.color, part: '中文 · 逐鹿天下' });
export const ST: Record<StationId, StationMeta> = Object.fromEntries(STATIONS.map((s) => [s.id, s]));
export const TRACKS: { id: Track; name: string }[] = [{ id: 'zh', name: '中文' }, { id: 'en', name: '英语' }];
export const trackOf = (st: StationId): Track => ST[st]?.track ?? (/^e/.test(st) ? 'en' : 'zh');
/** 老师给每个关卡（中文 zh、英文 en）分开设开放方式：closed 不开放；progress 按进度（读完一站，下一站才打开）；all 全部开放（哪一站都能点开）。
 *  存在 config.open 里：zh / en 是开不开，zhAll / enAll 是不是全部开放。旧设置里没有这些键时照旧推：某一回开着 = 这个关卡开着，all = 任意看 */
export type OpenMode = 'closed' | 'progress' | 'all';
export const openMode = (o: Record<string, boolean>, t: Track): OpenMode => {
  const on = o[t] ?? Object.entries(o).some(([k, v]) => v && new RegExp('^' + t + '\\d').test(k));
  return !on ? 'closed' : (o[t + 'All'] ?? !!o.all) ? 'all' : 'progress';
};
export const openPatch = (t: Track, m: OpenMode): Record<string, boolean> => ({ [t]: m !== 'closed', [t + 'All']: m === 'all' });
/** 一道题属于哪条线：看它所在的回 */
export const lineOf = (it: Item): Track => trackOf(it.st);

export const B: Record<Lv, number> = { 1: -1.2, 2: -0.3, 3: 0.6, 4: 1.5 };
export const W: Record<Lv, number> = { 1: 1, 2: 1.5, 3: 2, 4: 2.6 };
export const LV_NAME: Record<Lv, string> = { 1: '★', 2: '★★', 3: '★★★', 4: '👑' };
const THETA0 = -0.6;
const pExpect = (th: number, b: number) => 1 / (1 + Math.exp(-1.4 * (th - b)));

// ---------------- 能力估计（按完成的先后重放一遍） ----------------
export const doneRecs = (p: Player, f: (r: Rec) => boolean = () => true) =>
  Object.values(p.recs).filter((r) => r.status === 'done' && ITEM_BY_ID[r.id] && f(r)).sort((a, b) => (a.t1 ?? 0) - (b.t1 ?? 0));
export const thetaOf = (p: Player, tr: Track) => {
  let th = THETA0;
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

// ---------------- 一题的星星与表现 ----------------
export const scoredSteps = (it: Item) => it.steps.filter((s) => !(s.kind === 'write' && s.bonus));
/** 每一步的得分（第一次就对 1，第二次 0.67，之后 0.34）→ 星星和“表现”（答错到最后才对的算 0，用了“不确定”打七折） */
export const resultOf = (scores: number[], unsure: number) => {
  const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 1;
  const perfStep = (x: number): number => (x >= 0.99 ? 1 : x >= 0.84 ? 0.75 : x >= 0.66 ? 0.5 : x >= 0.49 ? 0.3 : 0);
  const perf = scores.length ? scores.map(perfStep).reduce((a, b) => a + b, 0) / scores.length : 1;
  return { stars: Math.max(1, Math.round(3 * mean)), perf: Math.max(0, Math.min(1, perf * (unsure > 0 ? 0.7 : 1))) };
};

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
/** 只为出支线题才有的句子（出题的问句、AI 眼镜的错译、小结）：播放时跳过，这句话放进支线任务的弹窗里 */
export const sideOnly = (lines: Line[], k: number) => {
  const l = lines[k];
  if (!l?.prompt || l.task?.length) return false;
  const t = l.prompt === true ? l : lines.find((x) => x.id === l.prompt);
  return !!t && !t.task?.length && !!t.side?.length;
};
/** 一站的支线任务（挂在各句上的可选题） */
export const sideItemsOf = (id: string): Item[] => (PLAY_BY_ID[id]?.lines ?? []).flatMap((l) => (l.side ?? []).map((x) => ITEM_BY_ID[x]).filter(Boolean));
/** 一站最多能得几颗星：每道题 3 颗，再加这道题的每个拓展 1 颗（选做的也算——全做完才是满星）；支线任务也算 */
export const maxStarsOf = (id: string) => (PLAY_BY_ID[id]?.lines ?? []).reduce((a, l) => { const it = l.task?.length ? ITEM_BY_ID[l.task[0]] : null; return a + (it ? 3 + (it.ext?.length ?? 0) : 0); }, 0)
  + sideItemsOf(id).reduce((a, it) => a + 3 + (it.ext?.length ?? 0), 0);
/** 一站的探索分：问 AI 时自己想出了后一半、点字去看了别的用法并答对（同一个字只算一次） */
export const stationSide = (p: Player, id: string) => { const r = p.recs[`${id}-log`]; return r ? r.log.filter((e) => e.q === 'askok').length + new Set(r.log.filter((e) => e.q === 'more').map((e) => e.v)).size : 0; };
export const unsureOf = (p: Player) => Object.values(p.recs).reduce((s, r) => s + (r.unsure || 0), 0);
export const avgLvOf = (p: Player, tr?: Track) => { const d = doneRecs(p, (r) => !r.prac && (!tr || trackOf(r.st) === tr)); return d.length ? d.reduce((s, r) => s + ITEM_BY_ID[r.id].lv, 0) / d.length : 0; };
export const maxStars = () => STATIONS.reduce((s, x) => s + 3 * x.n, 0);
export const newPlayer = (pid: string, token: string, name: string, sid: string, avatar: number, roundId: string): Player => ({ pid, token, roundId, revision: 0, name, sid, avatar, createdAt: Date.now(), recs: {}, updatedAt: Date.now() });
export { ITEMS };

// ---------------- 按进度解锁 ----------------
export const extsOf = (r: { data?: Record<string, unknown> } | undefined) => (r?.data?.ext as Record<string, number>) ?? {};
/** 这道题哪些拓展必做：always 都要；wrong 要看这道题有没有答错过、点过“不确定” */
export const requiredExts = (it: Item, r: { perf?: number; unsure?: number; status?: string } | undefined) => {
  if (!r || r.status !== 'done') return [];
  const struggled = (r.perf ?? 1) < 0.99 || (r.unsure ?? 0) > 0;
  return (it.ext ?? []).filter((e) => e.need === 'always' || (e.need === 'wrong' && struggled));
};
/** 这一站做完了：每一句的题（按难度挑出的那一道）都做完，必做的拓展也做完——和播放页“做完才能往下”是同一个标准（支线任务不算） */
export const playComplete = (p: Player | null | undefined, id: string) => {
  const play = PLAY_BY_ID[id];
  if (!p || !play) return false;
  const tr = (play.lang ?? 'zh') as Track;
  return play.lines.every((l) => {
    const it = l.task ? taskItem(p, l.task, tr) : null;
    if (!it) return true;
    const r = p.recs[it.id];
    return r?.status === 'done' && requiredExts(it, r).every((e) => extsOf(r)[e.id] !== undefined);
  });
};
/** 这一站在某条线上的前一站 */
export const prevOnLane = (id: string, lane: string) => {
  const n = NODE_BY_ID[id];
  return n ? NODES.filter((x) => x.row < n.row && laneHas(x, lane as never)).sort((a, b) => b.row - a.row)[0] : undefined;
};
/** 按自己的进度，这一站能不能看：每条线的第一站一开始就能看；后面的站要先读完这条线上的前一站（★ 汇合的站：哪条线的前一站读完都行）。英文一章一章往下 */
export const progressOpen = (p: Player | null | undefined, id: string) => {
  const en = /^en(\d)$/.exec(id);
  if (en) return Number(en[1]) <= 1 || playComplete(p, `en${Number(en[1]) - 1}`);
  if (!NODE_BY_ID[id]) return true;
  return lanesOf(id).some((lane) => { const prev = prevOnLane(id, lane); return !prev || playComplete(p, prev.id); });
};
/** 要先读完哪几站（给锁着的站写提示用） */
export const needFirst = (id: string): string[] => {
  const en = /^en(\d)$/.exec(id);
  if (en) return Number(en[1]) > 1 ? [`en${Number(en[1]) - 1}`] : [];
  return [...new Set(lanesOf(id).map((lane) => prevOnLane(id, lane)?.id).filter((x): x is string => !!x))];
};
