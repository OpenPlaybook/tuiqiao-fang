// 接 DeepSeek：AI 评委（中文改写、理由、成语造句；英语短句）。只评不聊。
// API Key 只在服务器上：环境变量 DEEPSEEK_API_KEY、.env.local，或者 DATA_DIR/deepseek-key.txt（教师后台可以写入）。
import fs from 'node:fs';
import path from 'node:path';
import type { Player, WriteSub } from '../src/shared/types';
import { ITEM_BY_ID } from '../src/shared/bank';
import { AI_QUOTA, EN_SYSTEM, ZH_SYSTEM, cleanEn, cleanZh, judgeUser, type EnJudge, type ZhJudge } from '../src/shared/ai';

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };
export interface AiLog { t: number; pid: string; name: string; item: string; step: string; role: string; text: string; out: ZhJudge | EnJudge | null; ms: number; ok: boolean; err?: string }

const MODELS = ['deepseek-flash', 'deepseek-v4-pro'];
const ENDPOINT = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/chat/completions';
const MOCK = process.env.AI_MOCK === '1';

export const createAi = (DATA: string, players: Map<string, Player>) => {
  const KEY_FILE = path.join(DATA, 'deepseek-key.txt');
  const SET_FILE = path.join(DATA, 'ai-settings.json');
  const LOG_FILE = path.join(DATA, 'ai-log.jsonl');
  const readJson = <T,>(f: string, d: T): T => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) as T; } catch { return d; } };
  let key = (process.env.DEEPSEEK_API_KEY || (fs.existsSync(KEY_FILE) ? fs.readFileSync(KEY_FILE, 'utf8') : '')).trim();
  const settings = { model: 'deepseek-flash', quota: AI_QUOTA, extra: {} as Record<string, number>, ...readJson<Record<string, unknown>>(SET_FILE, {}) } as { model: string; quota: number; extra: Record<string, number> };
  const logs: AiLog[] = [];
  try { for (const line of fs.readFileSync(LOG_FILE, 'utf8').split('\n').slice(-5000)) if (line.trim()) logs.push(JSON.parse(line)); } catch { /* 还没有日志 */ }
  const used = new Map<string, number>();
  for (const l of logs) if (l.ok) used.set(l.pid, (used.get(l.pid) ?? 0) + 1);
  let lastTest: { ok: boolean; msg: string; t: number } | null = null;
  let active = 0;
  const saveSettings = () => fs.writeFileSync(SET_FILE, JSON.stringify(settings, null, 2));

  const ready = () => MOCK || !!key;
  const left = (pid: string) => Math.max(0, settings.quota + (settings.extra[pid] ?? 0) - (used.get(pid) ?? 0));
  const log = (e: AiLog) => { logs.push(e); if (logs.length > 8000) logs.splice(0, 2000); fs.appendFile(LOG_FILE, JSON.stringify(e) + '\n', () => {}); };

  const complete = async (messages: Msg[], json = true) => {
    const once = async (asJson: boolean) => {
      const body: Record<string, unknown> = { model: settings.model, messages, stream: false, max_tokens: 600, temperature: 0.2, thinking: { type: 'disabled' } };
      if (asJson) body.response_format = { type: 'json_object' };
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 40000);
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body), signal: ctl.signal }).finally(() => clearTimeout(timer));
      if (!r.ok) {
        const t = await r.text().catch(() => '');
        throw new Error(r.status === 401 ? 'API Key 不对（401）' : r.status === 402 ? 'DeepSeek 账户余额不足（402）' : r.status === 429 ? '请求太多，稍等一下再试（429）' : `DeepSeek 出错（${r.status}）${t.slice(0, 120)}`);
      }
      const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
      return j.choices?.[0]?.message?.content ?? '';
    };
    let out = await once(json);
    if (!/\{[\s\S]*"/.test(out)) out = await once(false); // JSON 模式偶尔返回空白：换普通模式再要一次
    const m = out.match(/\{[\s\S]*\}/);
    return JSON.parse(m ? m[0] : out) as Record<string, unknown>;
  };

  // 模拟回答（AI_MOCK=1，只用于本地测试和截图）
  const mock = (w: WriteSub, text: string): ZhJudge | EnJudge => {
    if (w.role !== 'en') {
      const g = text.trim().length < 6 ? 0 : text.length > 24 ? 3 : 2;
      return { grade: g, praise: g ? '（模拟）细节写得具体，读者能看见画面。' : '', issue: g < 3 ? '（模拟）还可以再具体一点。' : '', tip: '（模拟）加一个动作或声音试试。', ...(w.role === 'use' ? { correct: g > 0 } : {}) };
    }
    const errs: EnJudge['errors'] = [];
    for (const [re, fix, why] of [[/\bdon't\b/i, "doesn't", '第三人称单数用 doesn’t'], [/\bvery like\b/i, 'really like', 'very 不能直接修饰动词'], [/\bhave a piano\b/i, 'have a piano lesson', '少了 lesson']] as [RegExp, string, string][]) {
      const m = text.match(re); if (m) errs.push({ wrong: m[0], fix, kind: 'grammar', why });
    }
    if (/\bcan not\b/i.test(text)) errs.push({ wrong: text.match(/can not/i)![0], fix: "can't", kind: 'spelling', why: 'can not 一般写成 cannot 或 can’t' });
    const verdict = !/[a-z]{3}/i.test(text) ? 'off' : errs.length === 0 ? 'perfect' : errs.length <= 2 ? 'minor' : 'major';
    return { verdict, errors: errs, natural: w.examples[0], comment: verdict === 'perfect' ? '（模拟）意思清楚，语气也礼貌。' : '（模拟）意思清楚，有一处小错。' };
  };

  type Body = { pid?: string; token?: string; item?: string; step?: string; text?: string };
  const handleJudge = async (b: Body, send: (code: number, body: unknown) => void) => {
    const p = b.pid ? players.get(b.pid) : undefined;
    if (!p || p.token !== b.token) return send(403, '身份不对，请重新登录');
    const it = ITEM_BY_ID[String(b.item)];
    const w = it?.steps.find((s) => s.key === b.step && s.kind === 'write') as WriteSub | undefined;
    if (!it || !w) return send(400, '找不到这道题');
    const text = String(b.text ?? '').trim().slice(0, 400);
    if (!text) return send(400, '先写一句话');
    if (!ready()) return send(503, 'AI 还没有接好，请告诉老师');
    if (left(p.pid) <= 0) return send(429, '这节课的 AI 评分次数用完了');
    if (active >= 12) return send(429, '同时找 AI 的人太多了，等几秒再交');
    active++;
    const t0 = Date.now();
    try {
      let out: ZhJudge | EnJudge;
      if (MOCK) { await new Promise((r) => setTimeout(r, 500)); out = mock(w, text); }
      else {
        const sys = w.role === 'en' ? EN_SYSTEM : ZH_SYSTEM[w.role];
        const raw = await complete([{ role: 'system', content: sys }, { role: 'user', content: judgeUser(it, w, text) }]);
        out = w.role === 'en' ? cleanEn(raw as Partial<EnJudge>, text) : cleanZh(raw as Partial<ZhJudge>, w.role);
      }
      used.set(p.pid, (used.get(p.pid) ?? 0) + 1);
      log({ t: Date.now(), pid: p.pid, name: p.name, item: it.id, step: w.key, role: w.role, text, out, ms: Date.now() - t0, ok: true });
      return send(200, { out, left: left(p.pid) });
    } catch (e) {
      const msg = String((e as Error).message || e);
      log({ t: Date.now(), pid: p.pid, name: p.name, item: it.id, step: w.key, role: w.role, text, out: null, ms: Date.now() - t0, ok: false, err: msg });
      return send(502, msg.includes('abort') ? 'AI 回复太慢了，再交一次试试' : msg);
    } finally { active--; }
  };

  const status = () => ({ ready: ready(), mock: MOCK, hasKey: !!key, keyTail: key ? key.slice(-4) : '', model: settings.model, models: MODELS, quota: settings.quota, lastTest, active, used: [...used.values()].reduce((a, b) => a + b, 0) });
  const teacher = async (r: string, body: Record<string, unknown>, send: (code: number, body: unknown) => void) => {
    if (r === 'ai/status') return send(200, status());
    if (r === 'ai/logs') return send(200, logs.slice(-1500));
    if (r === 'ai/settings') {
      if (typeof body.key === 'string') { key = body.key.trim(); if (key) fs.writeFileSync(KEY_FILE, key + '\n', { mode: 0o600 }); else if (fs.existsSync(KEY_FILE)) fs.unlinkSync(KEY_FILE); lastTest = null; }
      if (typeof body.model === 'string' && MODELS.includes(body.model)) settings.model = body.model;
      if (typeof body.quota === 'number') settings.quota = Math.max(0, Math.min(500, Math.round(body.quota)));
      if (typeof body.addFor === 'string') settings.extra[body.addFor] = (settings.extra[body.addFor] ?? 0) + Number(body.add ?? 10);
      saveSettings();
      return send(200, status());
    }
    if (r === 'ai/test') {
      if (!key && !MOCK) { lastTest = { ok: false, msg: '还没有设置 API Key', t: Date.now() }; return send(200, status()); }
      try {
        const t0 = Date.now();
        const out = MOCK ? { ok: '好的' } : await complete([{ role: 'user', content: '只输出 JSON：{"ok":"好的"}' }]);
        lastTest = { ok: true, msg: `连接正常（${settings.model}，用时 ${((Date.now() - t0) / 1000).toFixed(1)} 秒）：${JSON.stringify(out).slice(0, 30)}`, t: Date.now() };
      } catch (e) { lastTest = { ok: false, msg: String((e as Error).message || e), t: Date.now() }; }
      return send(200, status());
    }
    return send(404, 'no such api');
  };
  const resetUsage = () => { used.clear(); settings.extra = {}; saveSettings(); };
  /** 好句子：中文 3 分、英语 perfect 的，最新的在前 */
  const goodTexts = () => logs.filter((l) => l.ok && l.out && ('grade' in l.out ? l.out.grade >= 3 : l.out.verdict === 'perfect')).slice(-300).reverse();
  return { ready, left, handleJudge, teacher, status, logs, resetUsage, goodTexts };
};
