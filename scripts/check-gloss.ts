// 核对可点的字（npm run check:gloss，出包前自动跑）：
//   1. 文字里的 ⟦词⟧ 在这一回的释义表里有没有；
//   2. 句中解释（gloss.s）的每一条，那段原文是不是真的出现在这个字所在的句子里、把这个字包住了；
//   3. 故事里（字幕、原文、画面卡片）每一处有句中解释的字，都要找得到自己那一条——找不到，点开就只有第一层。
// 和网页用同一套查法（src/shared/gloss.ts），网页上看到什么，这里就查什么。
import { PLAYS, PLAY_ITEMS } from '../src/shared/play';
import { enSpans, sentAtPos, sentOf } from '../src/shared/gloss';

let bad = 0;
const err = (m: string) => { bad++; console.log('✗ ' + m); };
const warn = (m: string) => console.log('· ' + m);
for (const play of PLAYS) {
  const used = new Set<string>(); // 用上了的“字|那段原文”
  const items = new Set(play.lines.flatMap((l) => l.task ?? []));
  const visit = (text: string, where: string, story: boolean) => {
    // ⟨1|…⟩ 里面的是另一段文字（Rich 单独排）
    for (const m of text.matchAll(/⟨\d+\|([^⟩]*)⟩/g)) visit(m[1], where, story);
    const seen: Record<string, number> = {};
    for (const m of text.replace(/⟨[^⟩]*⟩/g, (x) => ' '.repeat(x.length)).matchAll(/⟦([^⟧]+)⟧/g)) {
      const w = m[1], n = (seen[w] = (seen[w] ?? -1) + 1), g = play.gloss[w];
      if (!g) { warn(`${play.id} ${where}：“${w}”没有释义，显示成普通字`); continue; }
      if (!g.s) continue;
      const hit = sentOf(g, w, { text, n });
      if (hit) used.add(`${w}|${hit[0]}`);
      else if (story) err(`${play.id} ${where}：“${w}”在这句里没有句中解释（这句是：${text.replace(/[⟦⟧⟪⟫*]/g, '').slice(0, 40)}）`);
    }
  };
  const walk = (v: unknown, where: string, story: boolean) => {
    if (typeof v === 'string') visit(v, where, story);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${where}[${i}]`, story));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'gloss' && k !== 'read' && k !== 'wyRead' && k !== 'shots') walk(x, `${where}.${k}`, story);
  };
  play.lines.forEach((l, i) => walk({ t: l.t, wy: l.wy, card: l.card?.t, who: l.who }, `第 ${i + 1} 句`, true));
  // 英文：释义表里的词、词组在句子里一出现就能点（不靠 ⟦⟧），每一处也要找得到自己的句中解释
  if (play.lang === 'en') play.lines.forEach((l, i) => {
    if (l.tr === undefined) return;
    const plain = l.t.replace(/[⟦⟧]|\*\*/g, '');
    for (const [a, b, k] of enSpans(plain, play.gloss)) {
      const g = play.gloss[k]; if (!g.s) continue;
      const hit = sentAtPos(g, plain, a, b);
      if (hit) used.add(`${k}|${hit[0]}`); else err(`${play.id} 第 ${i + 1} 句：“${k}”在这句里没有句中解释（${plain.slice(0, 40)}）`);
    }
    if (/\{/.test(l.tr) && !l.trHard) warn(`${play.id} 第 ${i + 1} 句：中文分了关键词，却没写 trHard`);
  });
  for (const it of PLAY_ITEMS) if (items.has(it.id)) walk(it, it.id, false);
  for (const [w, g] of Object.entries(play.gloss)) for (const frag of Object.keys(g.s ?? {})) {
    if (!frag.includes(w)) err(`${play.id} “${w}”的句中解释“${frag}”里没有这个字`);
    else if (!used.has(`${w}|${frag}`)) err(`${play.id} “${w}”的句中解释“${frag}”对不上任何一处（原文改过？）`);
  }
}
console.log(bad ? `\n有 ${bad} 处要改` : '可点的字：全部对得上');
process.exit(bad ? 1 : 0);
