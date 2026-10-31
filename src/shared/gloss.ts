// 可点的字（AI 眼镜释义）：第二层“在这句话里”按出处找。
// 一个字可能在好几句话里出现（“骓”在“骏马名骓”里，也在“骓不逝”里），所以句中解释不能挂在字上，要挂在“这个字所在的那一小段原文”上：
//   gloss.骓.s = { 骓不逝: '连我的乌骓马都不肯往前走了。', 骏马名骓: '…' }
// 点开时，看被点的那个字落在哪一段里；哪一条都不包住它，就不显示第二层（绝不把别的句子的解释拿过来）。
// scripts/check-gloss.mjs 会逐条核对：每一段原文都要真的出现在这个字所在的句子里，故事里每一处这个字都要有对应的一条。
import type { Gloss } from './types';

/** 去掉字幕里的标记：⟦词⟧ → 词，⟪字⟫ → 字，**加粗** → 加粗，⟨1|几个字⟩ → 几个字 */
export const plainText = (t: string) => t.replace(/⟨\d+\|([^⟩]*)⟩/g, '$1').replace(/⟨[^⟩]*⟩/g, '').replace(/⟦([^⟧]*)⟧/g, '$1').replace(/⟪([^⟫]*)⟫/g, '$1').replace(/\*\*/g, '');

/** 被点的那一处：它所在的整段文字（带标记）、是这段里第几个 ⟦w⟧（从 0 数） */
export interface GlossAt { text: string; n: number }

/** 第 n 个 ⟦w⟧ 在去掉标记以后的文字里从第几个字开始（⟨1|…⟩ 里面的不算：Rich 把它当成另一段文字单独排） */
export const glossPos = (text: string, w: string, n: number) => {
  const masked = text.replace(/⟨[^⟩]*⟩/g, (m) => '\u0001'.repeat(m.length));
  let i = -1;
  for (let k = 0; k <= n; k++) { i = masked.indexOf(`⟦${w}⟧`, i + 1); if (i < 0) return -1; }
  return plainText(`${text.slice(0, i)}\u0000${text.slice(i)}`).indexOf('\u0000');
};

/** 这一处对应哪一条句中解释：[那一段原文, 解释]；没有就是 null */
export const sentOf = (g: Gloss, w: string, at?: GlossAt): [string, string] | null => {
  if (!g.s || !at) return null;
  const plain = plainText(at.text), p = glossPos(at.text, w, at.n);
  if (p < 0) return null;
  for (const [frag, s] of Object.entries(g.s)) {
    for (let i = plain.indexOf(frag); i >= 0; i = plain.indexOf(frag, i + 1)) if (i <= p && p + w.length <= i + frag.length) return [frag, s];
  }
  return null;
};
