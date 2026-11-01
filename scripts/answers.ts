// 生成《关卡内容与答案.md》：npm run build 以后，node dist-server/answers.js > ../关卡内容与答案.md
// 按播放式故事的每一回、每一道题列出：题目、答案和解释、拓展（讲了什么、问了什么、答案）。
import { PLAYS } from '../src/shared/play';
import { ITEM_BY_ID } from '../src/shared/bank';
import { LV_NAME } from '../src/shared/adapt';
import type { Sub } from '../src/shared/types';

const plain = (s: string) => s.replace(/\*\*/g, '').replace(/[⟦⟧⟪⟫]/g, '').replace(/⟨\d+\|([^⟩]*)⟩/g, '【$1】').replace(/\n/g, ' / ');
const sub = (s: Sub): string => {
  switch (s.kind) {
    case 'choice': return `- ${plain(s.q)}${s.multi ? '（多选）' : ''}\n${s.opts.map((o, i) => `  - ${s.ok.includes(i) ? '**✓ ' : ''}${plain(o.t)}${s.ok.includes(i) ? '**' : ''}：${plain(o.why)}`).join('\n')}`;
    case 'spot': return `- ${plain(s.q)}：${s.segs.map((g, i) => (s.bad.includes(i) ? `【${g}】` : g)).join('')}${s.fix ? '\n' + sub(s.fix) : ''}`;
    case 'sort': return `- ${plain(s.q)}\n${s.cards.map((c) => `  - ${plain(c.t)} → **${s.bins[c.bin]}**：${c.why}`).join('\n')}`;
    case 'match': return `- ${plain(s.q)}：${s.left.map((l, i) => `${plain(l)} → **${s.right[s.pairs[i]]}**`).join('；')}。${s.why}`;
    case 'order': return `- ${plain(s.q)}：${s.items.map((t, i) => `${t}${s.tags ? `（${s.tags[i]}）` : ''}`).join(' → ')}`;
    case 'mis': return `- ${plain(s.q)}\n  - 原文：${plain(s.src)}\n  - AI 译文：${s.segs.map((g) => (g.bad ? `【${g.t}】` : g.t)).join('')}\n${s.segs.filter((g) => g.bad).map((g) => `  - ${g.bad!.word}：**${g.bad!.opts[g.bad!.ok]}**。${g.bad!.why}`).join('\n')}`;
    case 'write': return `- ${plain(s.q)}（AI 评）\n  - 要点：${s.criteria.join('；')}\n  - 参考：${s.examples.join(' ｜ ')}`;
    case 'fill': return `- ${plain(s.q)}\n${s.sents.map((x) => `  - ${plain(x.t).replace(/_{3,}/, `**${x.a}**`)}：${x.why}`).join('\n')}`;
    case 'type': return `- ${plain(s.q)}：**${s.accept[0]}**。${s.why}`;
    case 'frag': return `- ${plain(s.q)}\n  - 参考：${s.model}`;
    case 'long': return `- ${plain(s.q)}\n  - ${plain(s.text)}\n${Object.entries(s.qs).map(([k, q]) => `  - 【${k}】${sub(q).replace(/^- /, '')}`).join('\n')}`;
    case 'teach': return `- （讲）${plain(s.t)}`;
  }
};
const out: string[] = ['# 第六堂课 关卡内容与答案', '', '由网站内容自动生成（`网站/` 里 `npm run build` 后运行 `node dist-server/answers.js`）。每一回是一段播放式故事，播到题就停；一道题有几个难度版本的，按学生能力挑一个。难度：★ / ★★ / ★★★ / 👑。', ''];
for (const P of PLAYS) {
  out.push(`## ${P.title}　${P.sub}`, '');
  P.lines.forEach((l, k) => {
    for (const id of l.side ?? []) {
      const it = ITEM_BY_ID[id]; if (!it) continue;
      out.push(`### 支线任务（第 ${k + 1} 句）：${it.label}　${LV_NAME[it.lv]}　\`${it.id}\``, '', ...it.steps.map(sub), '', `讲解：${plain(it.explain)}`, '');
      for (const e of it.ext ?? []) out.push(`**拓展：${e.title}**（选做）`, '', ...e.steps.map(sub), '');
    }
    if (!l.task) return;
    out.push(`### 第 ${k + 1} 句：${plain(l.t)}`, '');
    for (const id of l.task) {
      const it = ITEM_BY_ID[id]; if (!it) continue;
      out.push(`#### ${it.label}　${LV_NAME[it.lv]}　\`${it.id}\``, '', ...it.steps.map(sub), '', `讲解：${plain(it.explain)}`, '');
    }
    const it = ITEM_BY_ID[l.task[0]];
    for (const e of it?.ext ?? []) out.push(`**拓展：${e.title}**（${e.need === 'always' ? '必做' : e.need === 'wrong' ? '答错了要做' : '选做'}）`, '', ...e.steps.map(sub), '');
  });
}
console.log(out.join('\n'));
