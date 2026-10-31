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

// ---------------- 英文：每个词都能点 ----------------
// 英文句子不靠 ⟦⟧ 标出可点的词：释义表里的词、词组（has been in Beijing for two weeks、look at……）在句子里一出现就能点，
// 点哪个词，就给它所在的那个词组（长的优先，不重叠）。⟦⟧ 只用来给生词画虚线。
const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** 句子（去掉标记的文字）里，释义表的词组都在哪儿：[开始, 结束, 词条] */
export const enSpans = (plain: string, gloss: Record<string, Gloss>) => {
  const hits: [number, number, string][] = [];
  for (const k of Object.keys(gloss)) {
    const re = new RegExp(`(?<![A-Za-z’'])${esc(k)}(?![A-Za-z’'])`, 'gi');
    for (const m of plain.matchAll(re)) hits.push([m.index!, m.index! + m[0].length, k]);
  }
  hits.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]) || a[0] - b[0]);
  const out: [number, number, string][] = [];
  for (const h of hits) if (!out.some((o) => h[0] < o[1] && o[0] < h[1])) out.push(h);
  return out.sort((a, b) => a[0] - b[0]);
};
/** 句中解释：哪一条的那段原文把 [s, e) 包住（大小写不论） */
export const sentAtPos = (g: Gloss, plain: string, s: number, e: number): [string, string] | null => {
  if (!g.s) return null;
  const low = plain.toLowerCase();
  for (const [frag, x] of Object.entries(g.s)) for (let i = low.indexOf(frag.toLowerCase()); i >= 0; i = low.indexOf(frag.toLowerCase(), i + 1)) if (i <= s && e <= i + frag.length) return [frag, x];
  return null;
};
