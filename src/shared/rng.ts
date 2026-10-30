// 每个学生、每道题一套固定的随机数：同一个学生换台电脑也一样，同桌之间不一样。
export type Rng = {
  (): number; // [0, 1)
  int: (a: number, b: number) => number; // a..b（含两端）
  pick: <T>(xs: readonly T[]) => T;
  shuffle: <T>(xs: readonly T[]) => T[];
  sign: () => 1 | -1;
};

export const hashStr = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

export const makeRng = (key: string): Rng => {
  let a = hashStr(key) || 1;
  const next = () => { // mulberry32
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = next as Rng;
  r.int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  r.pick = (xs) => xs[Math.floor(next() * xs.length)];
  r.shuffle = (xs) => { const b = [...xs]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  r.sign = () => (next() < 0.5 ? -1 : 1);
  return r;
};

/** 某个学生某道题的随机数：pid 是服务器给的学生编号 */
export const rngFor = (pid: string, puzzleId: string, salt = '') => makeRng(`${pid}|${puzzleId}|${salt}`);

// ---------------- 数字格式 ----------------
/** 保留 d 位小数并去掉末尾的 0 */
export const fmt = (x: number, d = 2) => {
  if (!isFinite(x)) return String(x);
  const s = x.toFixed(d);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
};
/** 有效数字 */
export const sig = (x: number, n = 3) => (x === 0 ? '0' : fmt(Number(x.toPrecision(n)), 12));
/** 科学计数法，KaTeX 写法：6.02 \times 10^{23} */
export const sci = (x: number, n = 3) => {
  if (x === 0) return '0';
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / 10 ** e;
  return `${fmt(Number(m.toPrecision(n)), 6)} \\times 10^{${e}}`;
};
/** 判断学生填的数对不对：tol 为相对误差（默认 2%），abs 为绝对误差 */
export const near = (v: number, ans: number, tol = 0.02, abs = 0) =>
  isFinite(v) && Math.abs(v - ans) <= Math.max(abs, Math.abs(ans) * tol, 1e-9);
/** 把学生输入的文字转成数：支持 1.5、-3、1/3、2.5e3、6.02×10^23、30%、中文逗号等 */
export const parseNum = (s: string): number => {
  let t = String(s).trim().replace(/[，,\s]/g, '').replace(/[−—–]/g, '-').replace(/[×xX*]10\^?\(?(-?\d+)\)?/, 'e$1').replace(/。$/, '');
  if (!t) return NaN;
  const pct = t.endsWith('%');
  if (pct) t = t.slice(0, -1);
  let v: number;
  const m = t.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (m) v = Number(m[1]) / Number(m[2]);
  else v = Number(t);
  return pct ? v / 100 : v;
};
