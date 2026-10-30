// 生成《关卡内容与答案.md》：node dist-server/answers.js > ../关卡内容与答案.md
import { ITEMS, SLOTS, ROOMS } from '../src/shared/bank';
import { STATIONS, LV_NAME } from '../src/shared/adapt';
import type { Sub } from '../src/shared/types';

const plain = (s: string) => s.replace(/\*\*/g, '').replace(/\n/g, ' / ');
const sub = (s: Sub): string => {
  switch (s.kind) {
    case 'choice': return `- ${plain(s.q)}${s.multi ? '（多选）' : ''}${s.master ? '（名家对抗：先选再揭晓）' : ''}\n${s.opts.map((o, i) => `  - ${s.ok.includes(i) ? '**✓ ' : ''}${o.t}${s.ok.includes(i) ? '**' : ''}：${o.why}`).join('\n')}`;
    case 'spot': return `- ${plain(s.q)}：${s.segs.map((g, i) => (s.bad.includes(i) ? `【${g}】` : g)).join('')}${s.fix ? '\n' + sub(s.fix) : ''}`;
    case 'sort': return `- ${plain(s.q)}\n${s.cards.map((c) => `  - ${c.t} → **${s.bins[c.bin]}**：${c.why}`).join('\n')}`;
    case 'match': return `- ${plain(s.q)}：${s.left.map((l, i) => `${l} → **${s.right[s.pairs[i]]}**`).join('；')}。${s.why}`;
    case 'order': return `- ${plain(s.q)}：${s.items.map((t, i) => `${t}${s.tags ? `（${s.tags[i]}）` : ''}`).join(' → ')}`;
    case 'mis': return `- ${plain(s.q)}\n  - 原文：${s.src}\n  - AI 译文：${s.segs.map((g) => (g.bad ? `【${g.t}】` : g.t)).join('')}\n${s.segs.filter((g) => g.bad).map((g) => `  - ${g.bad!.word}：**${g.bad!.opts[g.bad!.ok]}**。${g.bad!.why}`).filter((x, i, a) => a.indexOf(x) === i).join('\n')}`;
    case 'write': return `- ${plain(s.q)}${s.bonus ? '（加分题）' : ''}（AI 评）\n  - 要点：${s.criteria.join('；')}\n  - 参考：${s.examples.join(' ｜ ')}`;
  }
};
const out: string[] = ['# 第六堂课 关卡内容与答案', '', '由网站题库自动生成（`网站/` 里 `npm run build` 后运行 `node dist-server/answers.js`）。难度：★ / ★★ / ★★★ / 👑。每个学生按能力从题库里抽题，每关题数一样。', ''];
for (const S of STATIONS) {
  out.push(`## ${S.emoji} ${S.name}（每人 ${S.n} 题，题库 ${ITEMS.filter((i) => i.st === S.id).length} 题）`, '');
  const items = ITEMS.filter((i) => i.st === S.id).sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0) || a.lv - b.lv);
  let lastSlot = 0;
  for (const it of items) {
    if (it.slot && it.slot !== lastSlot) {
      lastSlot = it.slot; const sl = SLOTS.find((x) => x.no === it.slot)!;
      out.push(`### 第 ${it.slot} 道谜 · ${ROOMS[sl.room].name}`, '', ...sl.before.map((b) => `> ${b.who ? b.who + '：' : ''}${b.t}`), '');
    }
    out.push(`#### ${it.label}　${LV_NAME[it.lv]}　\`${it.id}\``, '', plain(it.intro), '', ...it.steps.map(sub), '', `讲解：${plain(it.explain)}`, ...(it.know ? ['', `来历：${plain(it.know)}`] : []), '');
  }
}
console.log(out.join('\n'));
