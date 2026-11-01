import { useSyncExternalStore } from 'react';
import { STATION_IDS, type GameConfig, type Item, type LogEntry, type Player, type Rec, type StationId } from '../shared/types';
import { newPlayer } from '../shared/adapt';
import { api } from './api';
import { DEMO } from './demo';

interface State { player: Player | null; config: GameConfig; online: boolean; lastOk: number }
const allOpen = (v: boolean) => Object.fromEntries(STATION_IDS.map((s) => [s, v])) as Record<StationId, boolean>;
const DEFAULT_CONFIG: GameConfig = { open: allOpen(false), attention: false, message: '', ai: true };
function allOpenConfig(): GameConfig { return { open: allOpen(true), attention: false, message: '', ai: true }; }
const LS_KEY = 'tq-player-v1';
const load = (): Player | null => { try { const s = localStorage.getItem(LS_KEY); return s ? (JSON.parse(s) as Player) : null; } catch { return null; } };
// 演示版：一个本地的“访客”，所有章节都开着，不保存
let state: State = DEMO
  ? { player: newPlayer('demo', 'demo', '访客', '演示版', 3), config: { ...allOpenConfig(), ai: true }, online: true, lastOk: Date.now() }
  : { player: load(), config: DEFAULT_CONFIG, online: true, lastOk: Date.now() };
const subs = new Set<() => void>();
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; subs.forEach((f) => f()); };
export const useGame = <T,>(sel: (s: State) => T): T => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => sel(state));
export const getState = () => state;

// 离线 30 秒以上：所有关卡自动开放，进度先存在本机，连上后再同步
export const OFFLINE_MS = 30000;
export const isOpen = (s: State, st: StationId) => s.config.open[/^en\d/.test(st) ? 'en' : 'zh'] || s.config.open[st] || Date.now() - s.lastOk > OFFLINE_MS;

// ---------------- 飞星星、提示条 ----------------
type Fly = { x: number; y: number; n: number; id: number };
type Toast = { id: number; emoji: string; title: string; text?: string };
const flySubs = new Set<(f: Fly) => void>();
const toastSubs = new Set<(t: Toast) => void>();
let seq = 0;
export const onFly = (f: (f: Fly) => void) => { flySubs.add(f); return () => { flySubs.delete(f); }; };
export const onToast = (f: (t: Toast) => void) => { toastSubs.add(f); return () => { toastSubs.delete(f); }; };
export const fly = (x: number, y: number, n: number) => flySubs.forEach((f) => f({ x, y, n, id: ++seq }));
export const toast = (t: Omit<Toast, 'id'>) => toastSubs.forEach((f) => f({ ...t, id: ++seq }));

// ---------------- 持久化与同步 ----------------
let dirty = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
const save = (p: Player) => { if (DEMO) return; try { localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* 存不了就算了 */ } };
export const syncNow = async () => {
  if (DEMO) return;
  const p = state.player;
  if (!p || !dirty) return;
  dirty = false;
  try { await api.sync(p); set({ online: true, lastOk: Date.now() }); } catch (e) {
    if (String((e as Error).message).includes('清空')) { logout(); return; } // 老师清空了记录：这台电脑上的旧记录作废
    dirty = true; set({ online: false });
  }
};
const mutate = (f: (p: Player) => void) => {
  const p = state.player;
  if (!p) return;
  const q: Player = JSON.parse(JSON.stringify(p));
  f(q);
  q.updatedAt = Date.now();
  save(q);
  set({ player: q });
  dirty = true;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(syncNow, 700);
};
export const pollConfig = async () => {
  if (DEMO) return;
  try { const c = await api.config(state.player?.pid); set({ config: c, online: true, lastOk: Date.now() }); if (dirty) syncNow(); } catch { set({ online: false }); }
};
export const setAiLeft = (n: number) => set({ config: { ...state.config, aiLeft: n } });

const rid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
export const join = async (name: string, sid: string, avatar: number) => {
  let p: Player;
  try { p = (await api.join(name, sid, avatar)).player; } catch { p = newPlayer(rid(), rid().replace(/-/g, ''), name, sid, avatar); set({ online: false }); }
  const local = state.player;
  if (local && local.pid === p.pid && local.updatedAt > p.updatedAt) p = local;
  save(p); set({ player: p }); dirty = true; syncNow();
};
export const logout = () => { try { localStorage.removeItem(LS_KEY); } catch { /* */ } set({ player: null }); };

// ---------------- 题目进度 ----------------
// 变式练习的记录 st 记成 'p'，不算进章节的题数
const ensure = (p: Player, it: Item): Rec => (p.recs[it.id] ??= { id: it.id, st: it.st, status: 'doing', stars: 0, perf: 0, unsure: 0, tries: {}, bonus: 0, log: [], t0: Date.now() });
export const startItem = (it: Item) => { if (!state.player?.recs[it.id]) mutate((p) => { ensure(p, it); }); };
/** 记一笔“点开了什么”（哪里不明白、一家人、AI 举例）：老师在后台看全班卡在哪 */
export const logOpen = (it: Item, what: string) => mutate((p) => { ensure(p, it).log.push({ q: 'open', v: what.slice(0, 80), ok: null, t: Date.now() }); });
export const logAnswer = (it: Item, e: Omit<LogEntry, 't'>, tries?: [string, number]) => mutate((p) => {
  const r = ensure(p, it);
  r.log.push({ ...e, v: e.v.slice(0, 600), t: Date.now() });
  if (tries) r.tries[tries[0]] = tries[1];
});
export const markUnsure = (it: Item) => mutate((p) => { ensure(p, it).unsure++; });
export const setData = (it: Item, data: Record<string, unknown>) => mutate((p) => { const r = ensure(p, it); r.data = { ...(r.data ?? {}), ...data }; });
export const finishItem = (it: Item, stars: number, perf: number) => mutate((p) => { const r = ensure(p, it); if (r.status === 'done') return; r.status = 'done'; r.stars = stars; r.perf = perf; r.t1 = Date.now(); });
export const addBonus = (it: Item, n: number) => mutate((p) => { const r = ensure(p, it); r.bonus = Math.max(r.bonus, n); });
/** 播放式故事里的记录（点字、提问）：记在这一回的“记录”条目上 */
export const logPlay = (playId: string, q: 'gloss' | 'gloss2' | 'more' | 'ask' | 'askok' | 'askfb', v: string) => mutate((p) => {
  const r = (p.recs[`${playId}-log`] ??= { id: `${playId}-log`, st: 'p', prac: true, status: 'doing', stars: 0, perf: 0, unsure: 0, tries: {}, bonus: 0, log: [], t0: Date.now() });
  r.log.push({ q, v: v.slice(0, 300), ok: null, t: Date.now() });
});
/** 拓展做完了：记在这道题的 data.ext 里 */
export const setExtDone = (it: Item, extId: string, score: number) => mutate((p) => { const r = ensure(p, it); r.data = { ...(r.data ?? {}), ext: { ...((r.data?.ext as Record<string, number>) ?? {}), [extId]: score } }; });
