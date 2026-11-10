// 按内容估算每一站要多久（目录图上的“约几分钟”）：
//   看故事 = 每一句（白话版）配音的实际时长 + 句间 0.8 秒；
//   题和必做拓展按每一步的类型和长短计（见 stepSec）：读字按每秒 6 个字，选择题读题读选项再加几秒，填空每空 6 秒，分类每张 4 秒，连线每对 5 秒，排序每项 5 秒，
//   改译文按段落长短和错处个数，打字 20 秒，写一句 75 秒；讲解（teach）不用点，只算读的时间。
//   选做拓展、支线任务不算进合计（支线单列）。2026-11-01 按真实操作试做《泗水亭长》校正过（试做 5 分 50 秒）；有了学生的真实用时再校正。
import { readFileSync, writeFileSync } from 'node:fs';
import { PLAYS, PLAY_BY_ID, voiceFile } from '../src/shared/play';
import { ITEM_BY_ID } from '../src/shared/bank';
import { NODES } from '../src/shared/play/storymap';
import { sideOnly } from '../src/shared/adapt';
import type { Sub } from '../src/shared/types';

const durs: Record<string, number> = JSON.parse(readFileSync('public/voice/index.json', 'utf8'));
const len = (t: string) => t.replace(/[⟦⟧⟨⟩*{}_]/g, '').length;
const read = (t: string) => len(t) / 6;
/** 一步大约几秒 */
const stepSec = (x: Sub): number => {
  switch (x.kind) {
    case 'teach': return 1 + read(x.t) + (x.ex ?? []).reduce((a, e) => a + read(e) * 0.6, 0) + (x.art ? 4 : 0);
    case 'choice': return 2 + read(x.q) + x.opts.reduce((a, o) => a + read(o.t) * 0.6, 0) + 3;
    case 'fill': return 4 + read(x.q) + x.sents.length * 6;
    case 'sort': return 4 + read(x.q) + x.cards.length * 4;
    case 'match': return 4 + read(x.q) + x.left.length * 5;
    case 'order': return 4 + read(x.q) + x.items.length * 5;
    case 'type': return 8 + read(x.q) + 12;
    case 'write': return 75;
    case 'mis': return 6 + read(x.q) + x.segs.reduce((a, g) => a + read(g.t) + (g.bad ? 15 : 0), 0);
    case 'spot': return 15 + read(x.q) + 15;
    case 'long': return 10 + read(x.text) * 0.5 + Object.keys(x.qs).length * 12;
    case 'frag': return 60;
    default: return 15;
  }
};
const rows = PLAYS.map((p) => {
  let story = 0, miss = 0, q = 0, ext = 0, side = 0;
  for (const [k, l] of p.lines.entries()) {
    for (const id of l.side ?? []) { const it = ITEM_BY_ID[id]; if (it) side += it.steps.reduce((a, s) => a + stepSec(s), 0) + 5; }
    if (sideOnly(p.lines, k)) continue; // 只为出支线题才有的句子：播放时跳过
    const d = durs[voiceFile(l)];
    if (d === undefined) { miss++; story += plainLen(l.t) / 5; } else story += d;
    story += 0.8;
    if (l.task?.length) {
      const it = ITEM_BY_ID[l.task[0]];
      if (!it) continue;
      q += it.steps.reduce((a, s) => a + stepSec(s), 0) + 5; // 做完看讲解 5 秒
      for (const e of it.ext ?? []) if (e.need === 'always') ext += e.steps.reduce((a, s) => a + stepSec(s), 0);
    }
  }
  const total = story + q + ext;
  return { id: p.id, title: p.title, story, q, ext, total, side, miss };
});
function plainLen(t: string) { return t.replace(/[⟦⟧*]/g, '').length; }
// --detail lb1：逐句列出配音、题、拓展各几秒（和真人试做的计时对照）
const di = process.argv.indexOf('--detail');
if (di > 0) {
  const p = PLAYS.find((x) => x.id === process.argv[di + 1]);
  for (const l of p?.lines ?? []) {
    let s = `说 ${(durs[voiceFile(l)] ?? 0).toFixed(1)}s`;
    const it = l.task?.length ? ITEM_BY_ID[l.task[0]] : undefined;
    if (it) {
      s += ` | 题 ${(it.steps.reduce((a, x) => a + stepSec(x), 0) + 5).toFixed(0)}s`;
      for (const e of it.ext ?? []) s += ` | 拓展${e.need === 'always' ? '' : '(选做)'} ${e.steps.reduce((a, x) => a + stepSec(x), 0).toFixed(0)}s [${e.steps.map((x) => x.kind + Math.round(stepSec(x))).join(' ')}]`;
    }
    console.log(s);
  }
}
const fmt = (s: number) => (s / 60).toFixed(1).padStart(5);
console.log('站       故事  题   拓展  合计  支线（分钟；合计是主线：故事 + 题 + 必做拓展）');
for (const r of rows) console.log(`${r.id.padEnd(5)} ${fmt(r.story)} ${fmt(r.q)} ${fmt(r.ext)} ${fmt(r.total)} ${fmt(r.side)}  ${r.title}${r.miss ? `（${r.miss} 句没有配音，按字数估）` : ''}`);
const isEn = (id: string) => PLAY_BY_ID[id]?.lang === 'en'; // 英文有两个故事（en、ec），按 lang 分
const zh = rows.filter((r) => !isEn(r.id)), en = rows.filter((r) => isEn(r.id));
const h = (rs: typeof rows, f: (r: (typeof rows)[number]) => number) => (rs.reduce((a, r) => a + f(r), 0) / 3600).toFixed(1);
console.log(`主线：中文 ${h(zh, (r) => r.total)} 小时，英文 ${h(en, (r) => r.total)} 小时；支线（只算题，不算拓展）：中文 ${h(zh, (r) => r.side)} 小时，英文 ${h(en, (r) => r.side)} 小时`);
if (process.argv.includes('--write')) {
  let s = readFileSync('src/shared/play/storymap.ts', 'utf8');
  for (const n of NODES) {
    const r = rows.find((x) => x.id === n.id); if (!r) continue;
    const m = Math.max(1, Math.round(r.total / 60));
    s = s.replace(new RegExp(`(\\{ id: '${n.id}',[^\\n]*?mins: )\\d+`), `$1${m}`);
  }
  writeFileSync('src/shared/play/storymap.ts', s);
  console.log('已写进 storymap.ts');
}
