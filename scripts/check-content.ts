// 核对题目本身（npm run check:content）：每一道主线题、支线题和它们的拓展，答案都对得上、能做完。
//   连线一对一（几项归到同一个是分类题），分类每格不止一张（一格一张是连线题）；
//   选择：有正确答案，序号不越界，选项不重复；填空：每句一个空，答案在词库里，词库不重复（同一个词可以填两处）；分类、连线、排序、挑错、改错：序号不越界；
//   每道题、每段拓展里的步骤 key 不重复；拓展紧接着把正题再问一遍的，提醒出来；题都挂在句子上，一道题不挂两处；原文（wy）不用“……”省略；节点里不写默认阅读顺序的话。
import { PLAYS } from '../src/shared/play';
import { ITEM_BY_ID } from '../src/shared/bank';
import type { Item, Sub } from '../src/shared/types';
import { orderProblem } from '../src/shared/frag';

let bad = 0;
const err = (m: string) => { bad++; console.log('✗ ' + m); };
const plain = (t: string) => t.replace(/[⟦⟧*]/g, '');

const checkStep = (s: Sub, where: string) => {
  const w = `${where} ${s.key}`;
  if (/[〔〕]/.test(JSON.stringify(s))) err(`${w}：引用原文须用可点字词及释义表，不使用整句翻译标记`);
  if (s.kind === 'choice') for (const o of s.opts) if ((o.t.match(/\*\*/g) ?? []).length % 2) err(`${w}：选项“${o.t.slice(0, 20)}”的 ** 没配对（开头的 * 会被当成正确答案的记号，标红又是正确答案要写 ***字**）`);
  switch (s.kind) {
    case 'choice': {
      if (!s.ok.length) err(`${w}：没有正确答案`);
      if (s.ok.some((i) => i < 0 || i >= s.opts.length)) err(`${w}：正确答案序号越界`);
      if (!s.multi && s.ok.length + (s.fine?.length ?? 0) >= s.opts.length) err(`${w}：每个选项都算对`);
      const ts = s.opts.map((o) => plain(o.t));
      if (new Set(ts).size !== ts.length) err(`${w}：选项重复`);
      if (s.opts.some((o) => !o.why)) err(`${w}：有选项没写为什么`);
      break;
    }
    case 'fill':
      if (new Set(s.bank).size !== s.bank.length) err(`${w}：词库里有重复的词`);
      for (const x of s.sents) {
        if ((x.t.match(/___/g) ?? []).length !== 1) err(`${w}：“${x.t.slice(0, 20)}”不是正好一个空`);
        if (!s.bank.includes(x.a)) err(`${w}：答案“${x.a}”不在词库里`);
        for (const y of x.alt ?? []) if (!s.bank.includes(y) || y === x.a) err(`${w}：也可以填的“${y}”不在词库里，或和答案重复`);
      }
      { // 填空要有干扰项（词比用到的词多），干扰词要在讲解里点名说为什么不行（用户 2026-11-01）
        const used = new Set(s.sents.flatMap((x) => [x.a, ...(x.alt ?? [])]));
        const extra = s.bank.filter((b) => !used.has(b));
        if (!extra.length) err(`${w}：填空没有干扰项（词库里的词都是答案）`);
        for (const b of extra) if (!s.sents.some((x) => x.why.includes(b))) err(`${w}：干扰词“${b}”在讲解里没有点名说为什么不行`);
      }
      break;
    case 'sort':
      if (s.cards.some((c) => c.bin < 0 || c.bin >= s.bins.length)) err(`${w}：卡片的格子序号越界`);
      // 分类是“好几张归到同一格”；每格只放一张，那是一对一，应该做连线
      if (s.bins.every((_, i) => s.cards.filter((c) => c.bin === i).length <= 1)) err(`${w}：每个格子只有一张卡片——这是一对一，应该做连线`);
      break;
    case 'match':
      // 右边可以多几个干扰项
      if (s.pairs.length !== s.left.length || s.pairs.some((j) => j < 0 || j >= s.right.length)) err(`${w}：连线的配对不对`);
      // 连线是一对一；几项连到同一个，那是分类，应该做分类题
      if (new Set(s.pairs).size !== s.pairs.length) err(`${w}：有几项连到同一个——这是分类，应该做分类题`);
      // 讲解分到每一对（做完显示在那一对下面），不堆成最后一大段（用户 2026-11-02）
      if (!s.whys || s.whys.length !== s.left.length || s.whys.some((x) => !x)) err(`${w}：连线要给每一对写讲解（whys，和 left 一样多）`);
      break;
    case 'order':
      if (s.items.length < 2) err(`${w}：排序少于两项`);
      if (s.rank && (s.rank.length !== s.items.length || s.rank.some((r, i) => i && r < s.rank![i - 1]))) err(`${w}：rank 要和 items 一样长，并且按写的顺序从小到大`);
      break;
    case 'frag': {
      const evs = new Set(s.frags.map((f) => f.ev).filter(Boolean));
      for (const f of s.frags) if (f.after && !evs.has(f.after)) err(`${w}：“${f.t}”的 after 指向不存在的事件 ${f.after}`);
      // 标准答案（对的句子按写的顺序）本身要能通过顺序检查
      const model = s.frags.map((_, i) => i).filter((i) => s.frags[i].ok);
      const bad = orderProblem(s.frags, model); if (bad) err(`${w}：按写的顺序拼都过不了：${bad}`);
      break;
    }
    case 'spot':
      if (!s.bad.length || s.bad.some((i) => i < 0 || i >= s.segs.length)) err(`${w}：毛病的序号越界`);
      if (s.fix) { checkStep(s.fix, `${w}.fix`); for (const k of Object.keys(s.fixed ?? {})) if (!s.fix.opts.some((o) => o.t === k)) err(`${w}：fixed 的“${k}”不是 fix 的选项`); }
      break;
    case 'mis':
      for (const g of s.segs) if (g.bad && (g.bad.ok < 0 || g.bad.ok >= g.bad.opts.length)) err(`${w}：错译“${g.t}”的正确选项越界`);
      if (!s.segs.some((g) => g.bad)) err(`${w}：没有要改的地方`);
      break;
    case 'type':
      if (!s.accept.length) err(`${w}：没有可接受的答案`);
      break;
    case 'teach':
      if (!s.t.trim()) err(`${w}：讲解是空的`);
      break;
  }
};
const keysOk = (steps: Sub[], where: string) => {
  const ks = steps.map((s) => s.key);
  const dup = ks.filter((k, i) => ks.indexOf(k) !== i);
  if (dup.length) err(`${where}：步骤 key 重复（${[...new Set(dup)].join('、')}）`);
};
const checkItem = (it: Item) => {
  if (!it.steps.length) err(`${it.id}：没有题`);
  if (!it.explain) err(`${it.id}：没有讲解`);
  keysOk(it.steps, it.id);
  it.steps.forEach((s) => checkStep(s, it.id));
  const eids = (it.ext ?? []).map((e) => e.id);
  if (new Set(eids).size !== eids.length) err(`${it.id}：拓展 id 重复`);
  for (const e of it.ext ?? []) { keysOk(e.steps, `${it.id}/${e.id}`); e.steps.forEach((s) => checkStep(s, `${it.id}/${e.id}`)); }
};

const used = new Map<string, string>();
for (const play of PLAYS) {
  const ids = new Set(play.lines.map((l) => l.id).filter(Boolean));
  play.lines.forEach((l, k) => {
    const where = `${play.id} 第 ${k + 1} 句`;
    if (l.wy?.includes('……')) err(`${where}：原文用了“……”省略`);
    if (/戴上.{0,4}眼镜|最后一晚/.test(l.t)) err(`${where}：默认了阅读顺序（${l.t.slice(0, 16)}）`);
    if (typeof l.prompt === 'string' && !ids.has(l.prompt)) err(`${where}：prompt 指向的句子“${l.prompt}”不存在`);
    for (const id of [...(l.task ?? []), ...(l.side ?? [])]) {
      const it = ITEM_BY_ID[id];
      if (!it) { err(`${where}：题 ${id} 不存在`); continue; }
      if (it.st !== play.id) err(`${where}：题 ${id} 的 st 是 ${it.st}`);
      if (used.has(id)) err(`${where}：题 ${id} 已经挂在 ${used.get(id)}`);
      used.set(id, where);
      for (const x of it.lock?.lines ?? []) if (!ids.has(x)) err(`${id}：lock.lines 里的“${x}”不是这一站的句号`);
      checkItem(it);
    }
  });
}
for (const it of Object.values(ITEM_BY_ID)) if (!it.id.endsWith('-log') && !used.has(it.id)) err(`${it.id}：没有挂在任何句子上`);
// 拓展里有没有把正题原样再问一遍（问法和正确答案都很像）：只提醒，不算错——换个地方回扣是好的，紧接着再考同一题是重复
const clean = (t: string) => t.replace(/[⟦⟧*“”"‘’'（）()——，。、：；？！!?,.:;\s\-—_]/g, '').toLowerCase();
const grams = (t: string) => { const c = clean(t); const g = new Set<string>(); for (let i = 0; i < c.length - 1; i++) g.add(c.slice(i, i + 2)); return g; };
const sim = (a: string, b: string) => { const A = grams(a), B = grams(b); if (!A.size || !B.size) return 0; let n = 0; A.forEach((x) => B.has(x) && n++); return n / Math.min(A.size, B.size); };
const okOf = (c: Extract<Sub, { kind: 'choice' }>) => c.ok.map((i) => c.opts[i].t).join('/');
for (const id of used.keys()) {
  const it = ITEM_BY_ID[id];
  for (const m of it.steps) if (m.kind === 'choice') for (const e of it.ext ?? []) for (const x of e.steps)
    if (x.kind === 'choice' && sim(okOf(m), okOf(x)) >= 0.6 && sim(m.q, x.q) >= 0.45) console.log(`· ${id}/${e.id} ${x.key}：拓展里又问了一遍正题（“${x.q.slice(0, 20)}”）`);
}
console.log(bad ? `\n题目：${bad} 处要改` : `题目：${used.size} 道题（含拓展）全部对得上`);
if (bad) process.exit(1);
