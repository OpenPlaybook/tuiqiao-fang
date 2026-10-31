// 接 DeepSeek：AI 评委（中文改写、理由、成语造句；英语短句）。只评不聊。
// API Key 只在服务器上：环境变量 DEEPSEEK_API_KEY、.env.local，或者 DATA_DIR/deepseek-key.txt（教师后台可以写入）。
import fs from 'node:fs';
import path from 'node:path';
import type { Player, WriteSub } from '../src/shared/types';
import { ITEM_BY_ID } from '../src/shared/bank';
import { AI_QUOTA, askSystem, askUser, cleanAsk, type AskOut, EN_SYSTEM, ZH_SYSTEM, cleanEn, cleanZh, judgeUser, type EnJudge, type ZhJudge } from '../src/shared/ai';
import { PLAY_BY_ID, plainText } from '../src/shared/play';

type Msg = { role: 'system' | 'user' | 'assistant'; content: string };
export interface AiLog { t: number; pid: string; name: string; item: string; step: string; role: string; text: string; out: ZhJudge | EnJudge | { a: string } | null; ms: number; ok: boolean; err?: string }

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

  const callOnce = async (messages: Msg[], asJson: boolean, maxTokens = 600) => {
      const body: Record<string, unknown> = { model: settings.model, messages, stream: false, max_tokens: maxTokens, temperature: 0.2, thinking: { type: 'disabled' } };
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
  /** 普通文字回答（学生提问） */
  const completeText = (messages: Msg[]) => callOnce(messages, false, 400);
  const complete = async (messages: Msg[], json = true) => {
    const once = (asJson: boolean) => callOnce(messages, asJson);
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
    // 题里的写作，或者拓展里的写作（拓展的步骤号是“拓展号:步骤号”）
    const [xid, xkey] = String(b.step).includes(':') ? String(b.step).split(':') : ['', String(b.step)];
    const steps = xid ? it?.ext?.find((e) => e.id === xid)?.steps : it?.steps;
    const w = steps?.find((s) => s.key === xkey && s.kind === 'write') as WriteSub | undefined;
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


  // 学生自己提问：结合正在看的那一句回答
  /** 一道题的答案文字（给 AI 看“不能说”，也用来检查有没有说漏） */
  const answerOf = (it: (typeof ITEM_BY_ID)[string]) => {
    const s0 = it.steps[0];
    if (s0?.kind === 'choice') return s0.opts[s0.ok[0]].t.replace(/[⟦⟧*]/g, '');
    if (s0?.kind === 'spot' && s0.fix) return s0.fix.opts[s0.fix.ok[0]].t;
    return '';
  };
  const handleAsk = async (b: Record<string, unknown>, send: (code: number, body: unknown) => void) => {
    const p = b.pid ? players.get(String(b.pid)) : undefined;
    if (!p || p.token !== b.token) return send(403, '身份不对，请重新登录');
    const play = PLAY_BY_ID[String(b.play)], it = ITEM_BY_ID[String(b.item)];
    const q = String(b.q ?? '').trim().slice(0, 120);
    if (!play || !q) return send(400, '先写下你的问题');
    if (!ready()) return send(503, 'AI 还没有接好，请告诉老师');
    if (left(p.pid) <= 0) return send(429, '这节课的 AI 次数用完了');
    if (active >= 12) return send(429, '同时找 AI 的人太多了，等几秒再问');
    active++;
    const t0 = Date.now();
    try {
      const step = it?.steps.find((x) => 'q' in x) as { q?: string } | undefined;
      const taskDone = it ? p.recs[it.id]?.status === 'done' : undefined;
      const answer = it ? answerOf(it) : '';
      const before = (Array.isArray(b.before) ? (b.before as unknown[]) : []).map((x) => plainText(String(x)).slice(0, 120)).slice(-2);
      let out: AskOut = MOCK
        ? { a1: `（模拟）你问的是“${q}”。我先讲一半：这件事和你正在看的这一句有关。`, q: '你觉得后一半会是什么？', opts: [{ t: '和这一句里的人有关', ok: true, why: '对。' }, { t: '和这一句没关系', ok: false, why: '再读读这一句。' }], a2: '（模拟）后一半：所以故事接着往下走。' }
        : cleanAsk(await complete([{ role: 'system', content: askSystem(play.lang) }, { role: 'user', content: askUser({ title: play.title, before, line: plainText(String(b.line ?? '')), task: it ? `${it.label}：${step?.q ?? ''}` : undefined, taskDone, answer, q }) }]));
      // 题还没做完，回答里却带出了答案：换成只给方向
      const nz = (t: string) => t.replace(/[\s，。、“”‘’！？…（）()：:；;——-]/g, '');
      // 字面没说出来，也可能换了个说法：题还没做完时，再让模型判断一次“这段回答是不是把答案告诉学生了”；漏了就重答一次，还漏就只给方向
      const leaks = async (o: AskOut) => {
        if (!it || taskDone || !answer) return false;
        const flat = nz([o.a1, o.q, o.a2, ...o.opts.map((x) => x.t + x.why)].join(''));
        if (nz(answer).length >= 2 && flat.includes(nz(answer))) return true;
        if (MOCK) return false;
        try {
          const j = JSON.parse(((await callOnce([{ role: 'system', content: '你检查一段给初中生的回答。题目答案是 A。如果这段回答（包括它的选项和后半段）直接说出了 A，或者换个说法说出了 A 的意思，让学生不用想就能答对这道题，输出 {"leak": true}；只是给了思路、或者讲的是别的事，输出 {"leak": false}。只输出 JSON。' }, { role: 'user', content: `题目：${step?.q ?? it.label}\n答案 A：${answer}\n回答：${JSON.stringify(o)}` }], true, 30)).match(/\{[\s\S]*\}/) ?? ['{}'])[0]);
          return j.leak === true;
        } catch { return false; }
      };
      let leak = await leaks(out);
      if (leak && !MOCK) {
        out = cleanAsk(await complete([{ role: 'system', content: askSystem(play.lang) }, { role: 'user', content: askUser({ title: play.title, before, line: plainText(String(b.line ?? '')), task: it ? `${it.label}：${step?.q ?? ''}` : undefined, taskDone, answer, q }) + `\n注意：上一次的回答把题的答案说出来了。这次不要说出、也不要暗示“${answer}”。学生问的如果和这道题无关，就只回答他问的事。` }]));
        leak = await leaks(out);
      }
      if (leak) out = { a1: `这道题还在做，我先不说答案。给你一个方向：${it.hints[0] ?? '回到原文，一个字一个字地看。'}`, q: '', opts: [], a2: '' };
      if (!out.a1) throw new Error('AI 这次没回答上来，再问一次');
      used.set(p.pid, (used.get(p.pid) ?? 0) + 1);
      log({ t: Date.now(), pid: p.pid, name: p.name, item: String(b.item ?? ''), step: play.id, role: 'ask', text: q, out: { a: [out.a1, out.q, out.a2].filter(Boolean).join(' / '), ...out }, ms: Date.now() - t0, ok: true });
      return send(200, { ...out, left: left(p.pid) });
    } catch (e) {
      const msg = String((e as Error).message || e);
      log({ t: Date.now(), pid: p.pid, name: p.name, item: String(b.item ?? ''), step: play.id, role: 'ask', text: q, out: null, ms: Date.now() - t0, ok: false, err: msg });
      return send(502, msg.includes('abort') ? 'AI 回复太慢了，再问一次' : msg);
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
  const goodTexts = () => logs.filter((l) => l.ok && l.out && ('grade' in l.out ? l.out.grade >= 3 : 'verdict' in l.out && l.out.verdict === 'perfect')).slice(-300).reverse();
  const asks = () => logs.filter((l) => l.role === 'ask' && l.ok).slice(-300).reverse();
  return { ready, left, handleJudge, handleAsk, asks, teacher, status, logs, resetUsage, goodTexts };
};
