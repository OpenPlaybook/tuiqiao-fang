import {taskBudget} from '../src/shared/reward-budget';
import type {Classroom} from './schema';
import type {Player,Rec,StationId} from '../src/shared/types';
import {ITEMS} from '../src/shared/bank';
import {sideOf,STATIONS,TRACKS,avgLvOf,bonusOf,doneRecs,stationDone,stationStars,starsOf,thetaLv,thetaOf,unsureOf} from '../src/shared/adapt';
import {aiLeft,aiStatus,aiReady} from './ai';
export function classroomStats(state:Classroom){
const players=new Map(Object.entries(state.players)),lastSeen=new Map(Object.entries(state.lastSeen)),config=state.config;
const ai={left:(pid:string)=>aiLeft(state,pid),ready:aiReady,status:()=>aiStatus(state),asks:()=>state.ai.logs.filter(l=>l.role==='ask'&&l.ok),goodTexts:()=>state.ai.logs.filter(l=>l.ok&&l.out&&(l.out.grade===3||l.out.verdict==='perfect')).reverse()};
const currentOf = (p: Player) => {
  let best: { st: StationId; t: number } | null = null;
  for (const r of Object.values(p.recs)) { const t = r.log.length ? r.log[r.log.length - 1].t : r.t0; if (!best || t > best.t) best = { st: r.st, t }; }
  return best ? STATIONS.find((s) => s.id === best!.st)?.name ?? '' : '';
};
const summary = (p: Player) => ({
  pid: p.pid, name: p.name, sid: p.sid, avatar: p.avatar, stars: starsOf(p), bonus: bonusOf(p), unsure: unsureOf(p),
  done: doneRecs(p, (r) => !r.prac).length, avgLv: avgLvOf(p),
  side: sideOf(p), gloss: Object.values(p.recs).reduce((a, r) => a + r.log.filter((e) => e.q === 'gloss').length, 0), gloss2: Object.values(p.recs).reduce((a, r) => a + r.log.filter((e) => e.q === 'gloss2').length, 0), asks: Object.values(p.recs).reduce((a, r) => a + r.log.filter((e) => e.q === 'ask').length, 0),
  theta: Object.fromEntries(TRACKS.map((t) => [t.id, Math.round(thetaLv(thetaOf(p, t.id)) * 10) / 10])),
  stations: Object.fromEntries(STATIONS.map((s) => [s.id, { stars: stationStars(p, s.id), done: stationDone(p, s.id) }])),
  lastSeen: lastSeen.get(p.pid) ?? p.updatedAt, current: currentOf(p), createdAt: p.createdAt, aiLeft: ai.left(p.pid),
});
/** 学生点开的字：每一回、每个字词，多少人点开看了意思、多少人又展开看了“在这句话里”（人数，不是次数） */
const glossList = (ps: Player[]) => {
  const m = new Map<string, { play: string; w: string; n1: Set<string>; n2: Set<string> }>();
  for (const p of ps) for (const r of Object.values(p.recs)) {
    if (!r.id.endsWith('-log')) continue;
    const play = r.id.replace('-log', '');
    for (const e of r.log) {
      if (e.q !== 'gloss' && e.q !== 'gloss2') continue;
      const k = play + '|' + e.v, g = m.get(k) ?? { play, w: e.v, n1: new Set(), n2: new Set() };
      (e.q === 'gloss' ? g.n1 : g.n2).add(p.pid); m.set(k, g);
    }
  }
  return [...m.values()].map((g) => ({ play: g.play, w: g.w, n1: g.n1.size, n2: g.n2.size })).sort((a, b) => a.play.localeCompare(b.play) || b.n1 - a.n1);
};
/** 学生的提问（和“清楚了 / 没说清 / 好像不对”的反馈） */
const askList = (ps: Player[]) => {
  const out: { name: string; play: string; q: string; a: string; fb: string; t: number }[] = [];
  const answers = new Map(ai.asks().map((l) => [l.pid + '|' + l.text, l.out && 'a' in l.out ? String(l.out.a) : '']));
  for (const p of ps) for (const r of Object.values(p.recs)) {
    if (!r.id.endsWith('-log')) continue;
    const fbs = r.log.filter((e) => e.q === 'askfb');
    for (const e of r.log) if (e.q === 'ask') out.push({ name: p.name, play: r.id.replace('-log', ''), q: e.v, a: answers.get(p.pid + '|' + e.v) ?? '', fb: fbs.find((f) => f.v.endsWith('｜' + e.v))?.v.split('｜')[0] ?? '', t: e.t });
  }
  return out.sort((a, b) => b.t - a.t).slice(0, 300);
};
const teacherState = () => {
  const ps = [...players.values()];
  const items = ITEMS.filter(it=>it.steps.length).map((it) => {
    const rs = ps.map((p) => p.recs[it.id]).filter(Boolean) as Rec[];
    const dn = rs.filter((r) => r.status === 'done');
    const wrong = new Map<string, number>(), opens = new Map<string, number>();
    let firstN = 0, firstOk = 0;
    for (const r of rs) {
      const seen = new Set<string>();
      for (const e of r.log) {
        if (e.q === 'open' || e.q === 'gloss') { opens.set(e.v, (opens.get(e.v) ?? 0) + 1); continue; }
        if (e.ok === null) continue;
        if (!seen.has(e.q)) { seen.add(e.q); firstN++; if (e.ok) firstOk++; }
        if (!e.ok) wrong.set(e.v, (wrong.get(e.v) ?? 0) + 1);
      }
    }
    return { id: it.id, st: it.st, lv: it.lv, label: it.label, maxStars: taskBudget(it.id), n: rs.length, done: dn.length, avgStars: dn.length ? dn.reduce((s, r) => s + r.stars, 0) / dn.length : 0, unsure: rs.reduce((s, r) => s + r.unsure, 0), firstN, firstOk, wrong: [...wrong.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([v, n]) => ({ v, n })), opens: [...opens.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([v, n]) => ({ v, n })) };
  }).filter((x) => x.st !== 'log' && (x.n > 0 || STATIONS.some((s) => s.id === x.st)));
  return { config: { ...config, aiReady: ai.ready() }, players: ps.map(summary).sort((a, b) => b.stars - a.stars), items, good: ai.goodTexts().slice(0, 120), asks: askList(ps), glosses: glossList(ps), now: Date.now(), ai: ai.status() };
};
const csvCell = (v: unknown) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const exportCsv = () => {
  const head = ['姓名', '学校', '星星',  '妙笔分', '完成题数', '平均难度', ...TRACKS.map((t) => `能力·${t.name}（1—4）`), '不确定次数', ...STATIONS.map((s) => `${s.name} 星星`)];
  const rows = [...players.values()].map(summary).sort((a, b) => b.stars - a.stars).map((s) => [s.name, s.sid, s.stars, s.bonus, s.done, s.avgLv.toFixed(2), ...TRACKS.map((t) => s.theta[t.id]), s.unsure, ...STATIONS.map((x) => s.stations[x.id].stars)]);
  return '﻿' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
};


return {teacherState,exportCsv};
}
