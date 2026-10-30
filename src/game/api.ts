import type { Player, GameConfig } from '../shared/types';
import type { EnJudge, ZhJudge } from '../shared/ai';

// 所有接口都用相对路径：网站挂在哪个子路径下都能用。
const req = async <T,>(path: string, body?: unknown, headers: Record<string, string> = {}, timeout = 8000): Promise<T> => {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(path, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: body === undefined ? undefined : JSON.stringify(body), signal: ctl.signal, cache: 'no-store' });
    if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
    return (await r.json()) as T;
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('连接超时');
    throw e;
  } finally { clearTimeout(timer); }
};

export interface AiStatus { ready: boolean; mock: boolean; hasKey: boolean; keyTail: string; model: string; models: string[]; quota: number; lastTest: { ok: boolean; msg: string; t: number } | null; active: number; used: number }
export interface AiLog { t: number; pid: string; name: string; item: string; step: string; role: string; text: string; out: ZhJudge | EnJudge | { examples: { s: string; note: string }[] } | null; ms: number; ok: boolean; err?: string }
export interface PlayerSummary {
  pid: string; name: string; sid: string; avatar: number; stars: number; weighted: number; bonus: number; unsure: number; done: number; avgLv: number; prac?: { n: number; ok: number };
  theta: Record<string, number>; stations: Record<string, { stars: number; done: number }>; vocab?: number; lastSeen: number; current: string; createdAt: number; aiLeft: number;
}
export interface ItemStat { id: string; st: string; lv: number; label: string; n: number; done: number; avgStars: number; unsure: number; firstN: number; firstOk: number; wrong: { v: string; n: number }[]; opens?: { v: string; n: number }[] }
export interface TeacherState { config: GameConfig; players: PlayerSummary[]; items: ItemStat[]; good: AiLog[]; now: number; ai: AiStatus }

export const api = {
  join: (name: string, sid: string, avatar: number) => req<{ player: Player }>('api/join', { name, sid, avatar }),
  sync: (p: Player) => req<{ ok: true }>('api/sync', { player: p }),
  config: (pid?: string) => req<GameConfig>(`api/config${pid ? `?pid=${encodeURIComponent(pid)}` : ''}`),
  examples: (b: { pid: string; token: string; node: string; item: string; seen: string[] }) => req<{ examples: { s: string; note: string }[]; left: number }>('api/ai/examples', b, {}, 45000),
  judge: (b: { pid: string; token: string; item: string; step: string; text: string }) => req<{ out: ZhJudge | EnJudge; left: number }>('api/ai/judge', b, {}, 45000),
  teacher: {
    state: (pin: string) => req<TeacherState>('api/teacher/state', undefined, { 'x-pin': pin }),
    player: (pin: string, pid: string) => req<Player>(`api/teacher/player?pid=${encodeURIComponent(pid)}`, undefined, { 'x-pin': pin }),
    setConfig: (pin: string, c: Partial<GameConfig>) => req<GameConfig>('api/teacher/config', c, { 'x-pin': pin }),
    del: (pin: string, pid: string) => req<{ ok: true }>('api/teacher/delete', { pid }, { 'x-pin': pin }),
    reset: (pin: string) => req<{ ok: true }>('api/teacher/reset', { confirm: 'RESET' }, { 'x-pin': pin }),
    aiLogs: (pin: string) => req<AiLog[]>('api/teacher/ai/logs', undefined, { 'x-pin': pin }),
    aiSettings: (pin: string, b: Record<string, unknown>) => req<AiStatus>('api/teacher/ai/settings', b, { 'x-pin': pin }),
    aiTest: (pin: string) => req<AiStatus>('api/teacher/ai/test', {}, { 'x-pin': pin }, 60000),
  },
};
