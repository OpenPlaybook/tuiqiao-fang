// 推敲坊 · 服务器：只用 Node 自带模块。提供网页、学生进度同步、AI 评委转发、教师后台接口。
// 数据存在 DATA_DIR（默认 ./data）里的 JSON 文件中，每 5 分钟留一份备份。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { STATION_IDS, type GameConfig, type Player, type Rec, type StationId } from '../src/shared/types';
import { ITEMS, ITEM_BY_ID } from '../src/shared/bank';
import { STATIONS, TRACKS, avgLvOf, bonusOf, doneRecs, newPlayer, pracOf, stationDone, stationStars, starsOf, thetaLv, thetaOf, unsureOf, weightedOf } from '../src/shared/adapt';
import { createAi } from './ai';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
for (const f of ['.env.local', '.env']) {
  try {
    for (const line of fs.readFileSync(path.join(ROOT, f), 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  } catch { /* 没有这个文件 */ }
}
const PORT = Number(process.env.PORT || 8083);
const HOST = process.env.HOST || '0.0.0.0';
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(path.join(DATA, 'backup'), { recursive: true });

const PIN_FILE = path.join(DATA, 'teacher-pin.txt');
const PIN = (process.env.TEACHER_PIN || (fs.existsSync(PIN_FILE) ? fs.readFileSync(PIN_FILE, 'utf8').trim() : '') || String(crypto.randomInt(100000, 999999))).trim();
if (!process.env.TEACHER_PIN) fs.writeFileSync(PIN_FILE, PIN + '\n');

const PLAYERS_FILE = path.join(DATA, 'players.json');
const CONFIG_FILE = path.join(DATA, 'config.json');
const readJson = <T,>(f: string, d: T): T => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) as T; } catch { return d; } };
const players = new Map<string, Player>(Object.entries(readJson<Record<string, Player>>(PLAYERS_FILE, {})));
const allOpen = (v: boolean) => Object.fromEntries(STATION_IDS.map((s) => [s, v])) as Record<StationId, boolean>;
let config: GameConfig = { open: allOpen(false), attention: false, message: '', ai: true, ...readJson<Partial<GameConfig>>(CONFIG_FILE, {}) };
const lastSeen = new Map<string, number>();
const ai = createAi(DATA, players);

const writeAtomic = (f: string, s: string) => { const tmp = f + '.tmp'; fs.writeFileSync(tmp, s); fs.renameSync(tmp, f); };
let dirty = false;
const flush = () => { if (!dirty) return; dirty = false; writeAtomic(PLAYERS_FILE, JSON.stringify(Object.fromEntries(players))); };
setInterval(flush, 2000);
setInterval(() => {
  if (players.size === 0) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  fs.writeFileSync(path.join(DATA, 'backup', `players-${stamp}.json`), JSON.stringify(Object.fromEntries(players)));
}, 5 * 60 * 1000);
const saveConfig = () => writeAtomic(CONFIG_FILE, JSON.stringify(config, null, 2));
for (const sig of ['SIGINT', 'SIGTERM'] as const) process.on(sig, () => { dirty = true; flush(); process.exit(0); });

// ---------------- 合并：同一个学生在两处登录时，不丢进度 ----------------
const better = (a: Rec | undefined, b: Rec): Rec => {
  if (!a) return b;
  if ((a.status === 'done') !== (b.status === 'done')) return a.status === 'done' ? a : b;
  if (a.status === 'done') { // 都做完了：星星、完成时间留先做完的那份；记录（点开的“不明白”等）取更长的，妙笔分取高的
    const first = (a.t1 ?? 0) <= (b.t1 ?? 0) ? a : b;
    return { ...first, log: b.log.length >= a.log.length ? b.log : a.log, bonus: Math.max(a.bonus || 0, b.bonus || 0), data: b.data ?? a.data };
  }
  return b.log.length >= a.log.length ? b : a;
};
const num = (v: unknown, lo: number, hi: number) => Math.max(lo, Math.min(hi, Number(v) || 0));
const sanitize = (p: Player): Player => {
  const recs: Record<string, Rec> = {};
  for (const [id, r] of Object.entries(p.recs || {})) {
    const it = ITEM_BY_ID[id];
    if (!it || !r) continue;
    recs[id] = {
      id, st: r.prac ? 'p' : it.st, ...(r.prac ? { prac: true } : {}), status: r.status === 'done' ? 'done' : 'doing',
      stars: num(r.stars, 0, 3), perf: num(r.perf, 0, 1), unsure: num(r.unsure, 0, 20), bonus: num(r.bonus, 0, 9),
      tries: Object.fromEntries(Object.entries(r.tries || {}).slice(0, 12).map(([k, v]) => [String(k).slice(0, 20), num(v, 0, 50)])),
      log: Array.isArray(r.log) ? r.log.slice(-200).map((e) => ({ q: String(e.q).slice(0, 40), v: String(e.v).slice(0, 600), ok: e.ok === null ? null : !!e.ok, t: Number(e.t) || 0 })) : [],
      data: r.data && JSON.stringify(r.data).length < 12000 ? r.data : undefined,
      t0: Number(r.t0) || Date.now(), t1: r.t1 ? Number(r.t1) : undefined,
    };
  }
  return {
    pid: p.pid, token: p.token, name: String(p.name).slice(0, 20), sid: String(p.sid).slice(0, 20), avatar: Number(p.avatar) || 0,
    createdAt: Number(p.createdAt) || Date.now(), recs,
    vocab: p.vocab && typeof p.vocab === 'object' ? { known: (p.vocab.known || []).map(String).slice(0, 20), fake: num(p.vocab.fake, 0, 5), score: num(p.vocab.score, 0, 20), t: Number(p.vocab.t) || Date.now() } : undefined,
    updatedAt: Date.now(),
  };
};
const merge = (old: Player, inc: Player): Player => {
  const recs = { ...old.recs };
  for (const [id, r] of Object.entries(inc.recs)) recs[id] = better(recs[id], r);
  return { ...inc, token: old.token, pid: old.pid, createdAt: old.createdAt, recs, vocab: old.vocab ?? inc.vocab };
};

// ---------------- 统计 ----------------
const currentOf = (p: Player) => {
  let best: { st: StationId; t: number } | null = null;
  for (const r of Object.values(p.recs)) { const t = r.log.length ? r.log[r.log.length - 1].t : r.t0; if (!best || t > best.t) best = { st: r.st, t }; }
  return best ? STATIONS.find((s) => s.id === best!.st)?.name ?? '' : '';
};
const summary = (p: Player) => ({
  pid: p.pid, name: p.name, sid: p.sid, avatar: p.avatar, stars: starsOf(p), weighted: weightedOf(p), bonus: bonusOf(p), unsure: unsureOf(p),
  done: doneRecs(p, (r) => !r.prac).length, avgLv: avgLvOf(p), prac: pracOf(p),
  theta: Object.fromEntries(TRACKS.map((t) => [t.id, Math.round(thetaLv(thetaOf(p, t.id)) * 10) / 10])),
  stations: Object.fromEntries(STATIONS.map((s) => [s.id, { stars: stationStars(p, s.id), done: stationDone(p, s.id) }])),
  vocab: p.vocab?.score, lastSeen: lastSeen.get(p.pid) ?? p.updatedAt, current: currentOf(p), createdAt: p.createdAt, aiLeft: ai.left(p.pid),
});
const teacherState = () => {
  const ps = [...players.values()];
  const items = ITEMS.map((it) => {
    const rs = ps.map((p) => p.recs[it.id]).filter(Boolean) as Rec[];
    const dn = rs.filter((r) => r.status === 'done');
    const wrong = new Map<string, number>(), opens = new Map<string, number>();
    let firstN = 0, firstOk = 0;
    for (const r of rs) {
      const seen = new Set<string>();
      for (const e of r.log) {
        if (e.q === 'open') { opens.set(e.v, (opens.get(e.v) ?? 0) + 1); continue; }
        if (e.ok === null) continue;
        if (!seen.has(e.q)) { seen.add(e.q); firstN++; if (e.ok) firstOk++; }
        if (!e.ok) wrong.set(e.v, (wrong.get(e.v) ?? 0) + 1);
      }
    }
    return { id: it.id, st: it.st, lv: it.lv, label: it.label, n: rs.length, done: dn.length, avgStars: dn.length ? dn.reduce((s, r) => s + r.stars, 0) / dn.length : 0, unsure: rs.reduce((s, r) => s + r.unsure, 0), firstN, firstOk, wrong: [...wrong.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([v, n]) => ({ v, n })), opens: [...opens.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([v, n]) => ({ v, n })) };
  }).filter((x) => x.n > 0 || STATIONS.some((s) => s.id === x.st));
  return { config: { ...config, aiReady: ai.ready() }, players: ps.map(summary).sort((a, b) => b.weighted - a.weighted), items, good: ai.goodTexts().slice(0, 120), now: Date.now(), ai: ai.status() };
};
const csvCell = (v: unknown) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const exportCsv = () => {
  const head = ['姓名', '学校', '星星', '加权分', '妙笔分', '完成题数', '平均难度', ...TRACKS.map((t) => `能力·${t.name}（1—4）`), '不确定次数', '词汇热身', ...STATIONS.map((s) => `${s.name} 星星`)];
  const rows = [...players.values()].map(summary).sort((a, b) => b.weighted - a.weighted).map((s) => [s.name, s.sid, s.stars, s.weighted, s.bonus, s.done, s.avgLv.toFixed(2), ...TRACKS.map((t) => s.theta[t.id]), s.unsure, s.vocab ?? '', ...STATIONS.map((x) => s.stations[x.id].stars)]);
  return '﻿' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
};

// ---------------- HTTP ----------------
const MIME: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
const send = (res: http.ServerResponse, code: number, body: unknown, type = 'application/json; charset=utf-8', extra: Record<string, string> = {}) => {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const readBody = (req: http.IncomingMessage) => new Promise<unknown>((ok, bad) => {
  let n = 0; const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => { n += c.length; if (n > 2_000_000) { bad(new Error('too large')); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { ok(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { bad(e); } });
  req.on('error', bad);
});
/** 静态文件；视频支持 Range（拖动进度条） */
const serveStatic = (req: http.IncomingMessage, res: http.ServerResponse, url: string) => {
  let rel = decodeURIComponent(url.split('?')[0]);
  const i = rel.lastIndexOf('/assets/'), j = rel.lastIndexOf('/shorts/');
  rel = i >= 0 ? rel.slice(i) : j >= 0 ? rel.slice(j) : '/' + path.basename(rel);
  if (rel === '/' || !path.extname(rel)) rel = '/index.html';
  const f = path.join(DIST, path.normalize(rel));
  if (!f.startsWith(DIST) || !fs.existsSync(f)) return send(res, 404, 'not found', 'text/plain');
  const type = MIME[path.extname(f)] ?? 'application/octet-stream';
  const size = fs.statSync(f).size;
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range && type === 'video/mp4') {
    const a = range[1] ? Number(range[1]) : 0, b = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1, 'Cache-Control': 'public, max-age=86400' });
    return fs.createReadStream(f, { start: a, end: b }).pipe(res);
  }
  const immutable = rel.startsWith('/assets/');
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : type === 'video/mp4' ? 'public, max-age=86400' : 'no-cache' });
  fs.createReadStream(f).pipe(res);
};

const server = http.createServer(async (req, res) => {
  const url = req.url || '/';
  const m = url.match(/\/api\/([a-z0-9/.]+)(\?.*)?$/);
  if (!m) return serveStatic(req, res, url);
  const route = m[1];
  const qs = new URLSearchParams(m[2] ?? '');
  try {
    if (route === 'config') {
      const pid = qs.get('pid');
      if (pid && players.has(pid)) lastSeen.set(pid, Date.now());
      return send(res, 200, { ...config, aiReady: ai.ready(), aiLeft: pid && players.has(pid) ? ai.left(pid) : undefined });
    }
    if (route === 'join' && req.method === 'POST') {
      const b = (await readBody(req)) as { name?: string; sid?: string; avatar?: number };
      const name = String(b.name ?? '').trim().slice(0, 20), sid = String(b.sid ?? '').trim().slice(0, 20);
      if (!name || !sid) return send(res, 400, '请填写姓名和学校');
      let p = [...players.values()].find((x) => x.name === name && x.sid === sid);
      if (!p) { p = newPlayer(crypto.randomUUID(), crypto.randomBytes(16).toString('hex'), name, sid, Number(b.avatar) || 0); players.set(p.pid, p); dirty = true; }
      else if (typeof b.avatar === 'number') { p.avatar = b.avatar; dirty = true; }
      lastSeen.set(p.pid, Date.now());
      return send(res, 200, { player: p });
    }
    if (route === 'sync' && req.method === 'POST') {
      const b = (await readBody(req)) as { player?: Player };
      const inc = b.player;
      if (!inc || !inc.pid || !inc.token) return send(res, 400, 'bad player');
      const old = players.get(inc.pid);
      if (!old) {
        if (!String(inc.name ?? '').trim() || !String(inc.sid ?? '').trim()) return send(res, 400, 'bad player');
        const s = sanitize(inc);
        players.set(s.pid, { ...s, token: String(inc.token).slice(0, 64) });
      } else {
        if (old.token !== inc.token) return send(res, 403, '身份不对，请重新登录');
        players.set(old.pid, merge(old, sanitize(inc)));
      }
      lastSeen.set(inc.pid, Date.now());
      dirty = true;
      return send(res, 200, { ok: true, player: players.get(inc.pid) });
    }
    if (route === 'ai/examples' && req.method === 'POST') {
      if (!config.ai) return send(res, 403, '老师暂时关闭了 AI');
      return void (await ai.handleExamples((await readBody(req)) as Record<string, unknown>, (code, body) => send(res, code, body)));
    }
    if (route === 'ai/judge' && req.method === 'POST') {
      if (!config.ai) return send(res, 403, '老师暂时关闭了 AI 评分');
      return void (await ai.handleJudge((await readBody(req)) as Record<string, string>, (code, body) => send(res, code, body)));
    }
    if (route.startsWith('teacher/')) {
      const pin = String(req.headers['x-pin'] ?? qs.get('pin') ?? '');
      if (pin !== PIN) return send(res, 401, '口令不对');
      const r = route.slice(8);
      if (r === 'state') return send(res, 200, teacherState());
      if (r === 'player') { const p = players.get(String(qs.get('pid'))); return p ? send(res, 200, p) : send(res, 404, '没有这个学生'); }
      if (r.startsWith('ai/')) return void (await ai.teacher(r, req.method === 'POST' ? ((await readBody(req)) as Record<string, unknown>) : {}, (code, body) => send(res, code, body)));
      if (r === 'config' && req.method === 'POST') {
        const b = (await readBody(req)) as Partial<GameConfig>;
        config = { ...config, ...b, open: { ...config.open, ...(b.open ?? {}) } };
        delete config.aiReady; delete config.aiLeft;
        saveConfig();
        return send(res, 200, config);
      }
      if (r === 'export.csv') return send(res, 200, exportCsv(), 'text/csv; charset=utf-8', { 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('推敲坊-成绩.csv')}` });
      if (r === 'export.json') return send(res, 200, JSON.stringify(Object.fromEntries(players), null, 1), 'application/json; charset=utf-8', { 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('推敲坊-全部记录.json')}` });
      if (r === 'delete' && req.method === 'POST') { const b = (await readBody(req)) as { pid?: string }; if (b.pid) { players.delete(b.pid); dirty = true; } return send(res, 200, { ok: true }); }
      if (r === 'reset' && req.method === 'POST') {
        const b = (await readBody(req)) as { confirm?: string };
        if (b.confirm !== 'RESET') return send(res, 400, '需要确认');
        flush();
        if (fs.existsSync(PLAYERS_FILE)) fs.copyFileSync(PLAYERS_FILE, path.join(DATA, 'backup', `players-before-reset-${Date.now()}.json`));
        players.clear(); dirty = true; flush(); ai.resetUsage();
        return send(res, 200, { ok: true });
      }
    }
    return send(res, 404, 'no such api');
  } catch (e) {
    return send(res, 500, String((e as Error).message || e), 'text/plain; charset=utf-8');
  }
});

server.listen(PORT, HOST, () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i!.address);
  console.log('\n  推敲坊 已启动');
  console.log(`  学生打开：  ${ips.length ? ips.map((ip) => `http://${ip}:${PORT}/`).join('  或  ') : `http://localhost:${PORT}/`}`);
  console.log('  教师后台：  在上面的地址后加 #/teacher   口令在 data/teacher-pin.txt');
  console.log(`  数据保存在：${DATA}`);
  console.log(`  AI：${ai.status().mock ? '模拟模式（AI_MOCK=1）' : ai.ready() ? `已设置 API Key（${ai.status().model}）` : '还没有设置 DeepSeek API Key，到教师后台粘贴'}\n`);
});
