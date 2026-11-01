// 写题用的小工具：让题库文件短一点、好读一点。
import type { Art, ChoiceSub, Item, MatchSub, MisSeg, MisSub, Opt, OrderSub, SortSub, SpotSub, Sub, WriteSub } from '../types';

/** 选项：[文字, 为什么, 图]；文字前加 * 是正确答案，加 ~ 是“说得过去”（名家对抗里给 2 颗星） */
export type O = [string, string, Art?];
export const C = (key: string, q: string, opts: O[], x: Partial<ChoiceSub> = {}): ChoiceSub => {
  const ok: number[] = [], fine: number[] = [];
  const os: Opt[] = opts.map(([t, why, art], i) => {
    let s = t;
    // 开头的 * 是正确答案；开头正好是 **（标红的字）不算——要标红又是正确答案，写 ***字**
    if (s.startsWith('*') && !/^\*\*(?!\*)/.test(s)) { ok.push(i); s = s.slice(1); } else if (s.startsWith('~')) { fine.push(i); s = s.slice(1); }
    return art ? { t: s, why, art } : { t: s, why };
  });
  return { kind: 'choice', key, q, opts: os, ok, ...(fine.length ? { fine } : {}), ...x };
};
/** 点出毛病：句子用 | 分段；bad 是有毛病的段（点哪一段都算找到） */
export const S = (key: string, q: string, segs: string, bad: number[], fix?: ChoiceSub, miss?: Record<number, string>, fixed?: Record<string, string>): SpotSub =>
  ({ kind: 'spot', key, q, segs: segs.split('|'), bad, ...(fix ? { fix } : {}), ...(miss ? { miss } : {}), ...(fixed ? { fixed } : {}) });
/** AI 误译：段落是字符串（译对了）或 [AI 的译法, 原文里的字, 选项（* 是对的）, 为什么] */
export const M = (key: string, q: string, src: string, segs: (string | [string, string, string[], string, string?])[], title?: string): MisSub => ({
  kind: 'mis', key, q, src, ...(title ? { title } : {}),
  segs: segs.map((s): MisSeg => typeof s === 'string' ? { t: s } : { t: s[0], bad: { word: s[1], opts: s[2].map((o) => (/^\*(?!\*(?!\*))/.test(o) ? o.slice(1) : o)), ok: s[2].findIndex((o) => /^\*(?!\*(?!\*))/.test(o)), why: s[3], ...(s[4] ? { fixed: s[4] } : {}) } }),
});
export const Mt = (key: string, q: string, left: string[], right: string[], pairs: number[], why: string, x: Partial<MatchSub> = {}): MatchSub => ({ kind: 'match', key, q, left, right, pairs, why, ...x });
export const Od = (key: string, q: string, items: string[], why: string, tags?: string[], rank?: number[]): OrderSub => ({ kind: 'order', key, q, items, why, ...(tags ? { tags } : {}), ...(rank ? { rank } : {}) });
export const So = (key: string, q: string, bins: string[], cards: [string, number, string][]): SortSub => ({ kind: 'sort', key, q, bins, cards: cards.map(([t, bin, why]) => ({ t, bin, why })) });
export const Wr = (key: string, q: string, w: Omit<WriteSub, 'kind' | 'key' | 'q'>): WriteSub => ({ kind: 'write', key, q, ...w });
export const item = (m: Omit<Item, 'steps'>, ...steps: Sub[]): Item => ({ ...m, steps });
