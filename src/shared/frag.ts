// 碎片拼接的顺序检查（学生端和题目核对共用）
import type { FragSub } from './types';

/** 顺序不卡死，只查三条：事情之间的先后（seq 一样的可以互换）；评价放在它说的那件事后面；总结放在事情讲完以后。没问题返回 null */
export const orderProblem = (F: FragSub['frags'], chosen: number[]): string | null => {
  const ones = F.filter((f) => f.layer === 1 && f.ok);
  const seqOf = (i: number) => F[i].seq ?? ones.indexOf(F[i]);
  const l1 = chosen.filter((i) => F[i].layer === 1);
  for (let a = 0; a < l1.length; a++) for (let b = a + 1; b < l1.length; b++) if (seqOf(l1[a]) > seqOf(l1[b])) return `事情的先后不对：“${F[l1[b]].t}”应该在“${F[l1[a]].t}”前面。`;
  const first = chosen.findIndex((i) => F[i].layer === 1), last = chosen.reduce((m, i, k) => (F[i].layer === 1 ? k : m), -1);
  for (const [k, i] of chosen.entries()) {
    const f = F[i];
    if (f.layer === 2) {
      const dep = f.after ? chosen.findIndex((j) => F[j].layer === 1 && F[j].ev === f.after) : first;
      if (k < dep) return f.after ? `“${f.t}”是在评价“${F[chosen[dep]].t}”这件事——先把这件事说出来，再放这一句。` : `“${f.t}”是评价，先把事情说出来，再放这一句。`;
    }
    if (f.layer === 3 && k < last) return `“${f.t}”是最后的总结，放到事情都说完以后。`;
  }
  return null;
};
