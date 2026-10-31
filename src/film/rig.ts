// 人物、马、特写（脸、手）的画法。人物是“骨架 + 衣服”：给出每个关节的角度（姿势），就能画出走、坐、作揖、爬、跪着洗、唱、舞。
// 角度都用“度”：手臂、腿 0 = 垂直向下，90 = 水平朝前（面朝的方向），180 = 朝上；肘、膝是在上一节的基础上再弯。
import { GOLD, INK, RED, SKIN, f, lerp, rng, wav } from './core';

export interface Pose { lean: number; head: number; aF: number; eF: number; aB: number; eB: number; lF: number; kF: number; lB: number; kB: number; dy?: number }
export interface Look {
  robe: string; robe2?: string; pants: string; hair: 'knot' | 'kerchief' | 'helmet' | 'bun' | 'messy' | 'crown' | 'cap' | 'scholar'; hairC?: string;
  long?: boolean; armor?: boolean; patches?: boolean; sleeve?: 'wide' | 'tight' | 'bare'; beard?: 'stub' | 'long'; sword?: boolean; cape?: string; trim?: string; belt?: string; tall?: number; wide?: number;
}
export const LOOKS: Record<string, Look> = {
  hanxin: { robe: '#6E7378', robe2: '#5D6267', pants: '#3E3B38', hair: 'knot', patches: true, sleeve: 'tight', sword: true, belt: '#4A3A2C', tall: 1.06 },
  king: { robe: '#6B2E28', robe2: '#4E211D', pants: '#2E2622', hair: 'crown', sleeve: 'wide', trim: GOLD, sword: true, belt: '#2B2722', tall: 1.06 },
  general: { robe: '#5A4A3A', robe2: '#3E342A', pants: '#2E2622', hair: 'knot', sleeve: 'tight', armor: true, cape: '#7A2A22', sword: true, tall: 1.06 },
  piaomu: { robe: '#8A7B66', robe2: '#76684F', pants: '#5B5045', hair: 'kerchief', hairC: '#D9D2C4', long: true, sleeve: 'tight', belt: '#5B4E40', tall: 0.92 },
  tuhu: { robe: '#4A3F36', robe2: '#3A322B', pants: '#2F2924', hair: 'messy', sleeve: 'bare', beard: 'stub', belt: '#8A3A2A', wide: 1.18 },
  xiangyu: { robe: '#3A3436', robe2: '#2A2527', pants: '#221E1E', hair: 'helmet', armor: true, cape: '#8E2B22', sword: true, beard: 'stub', tall: 1.1, wide: 1.1 },
  yuji: { robe: '#D8C3B0', robe2: '#C2A894', pants: '#9C8572', hair: 'bun', long: true, sleeve: 'wide', trim: '#A8322A', belt: '#A8322A', tall: 0.96 },
  soldier: { robe: '#4E4640', robe2: '#3B3530', pants: '#2A2522', hair: 'helmet', armor: true, sleeve: 'tight' },
  hanSoldier: { robe: '#3F4A52', robe2: '#2F383E', pants: '#232A2E', hair: 'helmet', armor: true, sleeve: 'tight' },
  tingzhang: { robe: '#6A6152', robe2: '#574F42', pants: '#3A342C', hair: 'cap', beard: 'long', sleeve: 'tight', belt: '#3A342C' },
  poetTang: { robe: '#6B7A6A', robe2: '#5A6859', pants: '#3A3F38', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#3A3F38' },
  poetSong: { robe: '#5E6678', robe2: '#4E5566', pants: '#33373F', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#33373F' },
  poetLi: { robe: '#A9898C', robe2: '#957578', pants: '#6E5658', hair: 'bun', long: true, sleeve: 'wide', trim: '#5E3A3E', belt: '#5E3A3E' },
  liubang: { robe: '#7A2A22', robe2: '#5E201A', pants: '#2E2622', hair: 'crown', sleeve: 'wide', trim: GOLD, beard: 'long', long: true },
  crowd1: { robe: '#7A7064', pants: '#4A4239', hair: 'cap', sleeve: 'tight' },
  crowd2: { robe: '#6A6F66', pants: '#3F433C', hair: 'knot', sleeve: 'tight' },
  crowd3: { robe: '#8C7B62', pants: '#4E4436', hair: 'kerchief', hairC: '#CFC6B2', long: true, sleeve: 'tight' },
  crowd4: { robe: '#5D564E', pants: '#35302B', hair: 'messy', sleeve: 'tight', beard: 'stub' },
  rebel: { robe: '#5C5248', pants: '#3A332C', hair: 'kerchief', hairC: '#8C3A2E', sleeve: 'bare' },
};

// ---------------- 姿势 ----------------
export const P = {
  stand: (): Pose => ({ lean: 0, head: 0, aF: 6, eF: 12, aB: -6, eB: 10, lF: 4, kF: 0, lB: -4, kB: 0 }),
  walk: (ph: number, k = 1): Pose => { const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2); return { lean: 4 * k, head: 2, aF: -18 * s * k, eF: 18, aB: 18 * s * k, eB: 18, lF: 24 * s * k, kF: Math.max(0, 34 * c) * k, lB: -24 * s * k, kB: Math.max(0, -34 * c) * k, dy: -Math.abs(c) * 4 * k }; },
  sit: (): Pose => ({ lean: -4, head: 6, aF: 50, eF: 30, aB: 30, eB: 50, lF: 82, kF: 84, lB: 74, kB: 78 }),
  sitCross: (): Pose => ({ lean: 0, head: 0, aF: 30, eF: 50, aB: 20, eB: 60, lF: 88, kF: 150, lB: 82, kB: 150 }),
  bow: (u: number): Pose => ({ lean: 36 * u, head: 10 * u, aF: lerp(6, 34, u), eF: lerp(12, 96, u), aB: lerp(-6, 30, u), eB: lerp(10, 100, u), lF: 3, kF: 0, lB: -3, kB: 0 }), // 作揖：两手在胸前合抱
  crawl: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: 76, head: -24, aF: 8 + 14 * s, eF: 4, aB: 8 - 14 * s, eB: 4, lF: -4 + 10 * s, kF: 92, lB: -4 - 10 * s, kB: 92 }; },
  kneelWash: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: 42, head: 8, aF: 42 + 14 * s, eF: 8, aB: 34 - 12 * s, eB: 12, lF: 64, kF: 154, lB: 56, kB: 146 }; },
  akimbo: (): Pose => ({ lean: -6, head: -6, aF: -38, eF: 112, aB: -40, eB: 108, lF: 16, kF: 0, lB: -16, kB: 0 }),
  legsApart: (u: number): Pose => ({ lean: -8, head: -8, aF: lerp(-38, 28, u), eF: lerp(112, -6, u), aB: -40, eB: 108, lF: 22, kF: 0, lB: -22, kB: 0 }),
  point: (u = 1): Pose => ({ lean: -2, head: -4, aF: lerp(10, 86, u), eF: lerp(20, -4, u), aB: -20, eB: 90, lF: 8, kF: 0, lB: -10, kB: 0 }),
  give: (u: number): Pose => ({ lean: 10 * u, head: 6, aF: lerp(30, 74, u), eF: lerp(60, 8, u), aB: lerp(26, 70, u), eB: lerp(64, 14, u), lF: 6, kF: 0, lB: -6, kB: 0 }),
  drink: (u: number): Pose => ({ ...P.sitCross(), head: -10 * u, aF: lerp(50, 118, u), eF: lerp(40, 92, u) }),
  sing: (ph = 0): Pose => ({ lean: -8, head: -18, aF: 132 + 6 * Math.sin(ph * 6.28), eF: -14, aB: 30, eB: 40, lF: 14, kF: 0, lB: -14, kB: 0 }),
  dance: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: 10 * s, head: -8 * s, aF: 110 + 50 * s, eF: -10, aB: 70 - 50 * s, eB: -6, lF: 10 + 8 * s, kF: 8, lB: -10, kB: 4 }; },
  weep: (): Pose => ({ lean: 14, head: 22, aF: 128, eF: 84, aB: 10, eB: 40, lF: 4, kF: 0, lB: -4, kB: 0 }),
  laugh: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 4); return { lean: -10 + 14 * s, head: -18 + 10 * s, aF: 84, eF: -4, aB: 24, eB: 96, lF: 8, kF: 0, lB: -8, kB: 0 }; },
  rideRun: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: 18, head: -8, aF: 64, eF: 30, aB: 120 + 10 * s, eB: -20, lF: 70, kF: 70, lB: 60, kB: 64 }; },
  cheer: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: -4, head: -10, aF: 150 + 18 * s, eF: -10, aB: 40, eB: 30, lF: 8, kF: 0, lB: -8, kB: 0 }; },
  slump: (): Pose => ({ lean: 30, head: 30, aF: 24, eF: 60, aB: 16, eB: 70, lF: 82, kF: 84, lB: 74, kB: 80 }),
  write: (ph: number): Pose => ({ lean: 6, head: 6, aF: 64 + 4 * Math.sin(ph * 12), eF: 30, aB: -8, eB: 10, lF: 4, kF: 0, lB: -4, kB: 0 }),
  mix: (a: Pose, b: Pose, t: number): Pose => Object.fromEntries(Object.keys(a).map((k) => [k, lerp((a as unknown as Record<string, number>)[k] ?? 0, (b as unknown as Record<string, number>)[k] ?? 0, t)])) as unknown as Pose,
};

const rad = (d: number) => (d * Math.PI) / 180;
const dirOf = (a: number) => [Math.sin(rad(a)), Math.cos(rad(a))]; // 0 = 向下，90 = 向前
const add = (p: number[], d: number[], l: number) => [p[0] + d[0] * l, p[1] + d[1] * l];
const pt = (p: number[]) => `${f(p[0])},${f(p[1])}`;
const darker = (c: string, k = 0.78) => { const n = parseInt(c.slice(1), 16); const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`; };

export interface PersonOpts { x: number; y: number; s?: number; face?: 1 | -1; who: string; pose: Pose; g?: number; a?: number; hold?: 'rod' | 'bowl' | 'cup' | 'spear' | 'basket' | 'reins' | 'brush' | 'torch' | 'pole' | 'scroll' | 'punt'; detail?: boolean; mood?: 'calm' | 'sneer' | 'sad' | 'shock' | 'laugh' }
/** 画一个人。x、y 是两脚中间落地的点 */
export const person = (o: PersonOpts) => {
  const L = LOOKS[o.who] ?? LOOKS.crowd1, s = o.s ?? 1, fc = o.face ?? 1, g = o.g ?? 0, p = o.pose;
  const T = 46 * (L.tall ?? 1), S = 46 * (L.tall ?? 1), TOR = 60 * (L.tall ?? 1), UA = 33, FA = 31, W = L.wide ?? 1;
  // 先算脚落地：髋的高度 = 最低那只脚 / 膝到髋的距离
  const legPts = (l: number, k: number) => { const kn = add([0, 0], dirOf(l), T), an = add(kn, dirOf(l - k), S); return [kn, an]; };
  const [kF0, aF0] = legPts(p.lF, p.kF), [kB0, aB0] = legPts(p.lB, p.kB);
  const hipY = -Math.max(kF0[1], aF0[1], kB0[1], aB0[1]) + (p.dy ?? 0) - 4;
  const hip = [0, hipY];
  const kF = [kF0[0], kF0[1] + hipY], anF = [aF0[0], aF0[1] + hipY], kB = [kB0[0], kB0[1] + hipY], anB = [aB0[0], aB0[1] + hipY];
  const up = [Math.sin(rad(p.lean)), -Math.cos(rad(p.lean))], side = [-up[1], up[0]]; // side：朝前的垂线
  const sh = add(hip, up, TOR), neck = add(sh, up, 8);
  const hd = [Math.sin(rad(p.lean + p.head)), -Math.cos(rad(p.lean + p.head))];
  const hc = add(neck, hd, 15);
  const armPts = (a: number, e: number) => { const el = add(sh, dirOf(a), UA), wr = add(el, dirOf(a + e), FA); return [el, wr]; };
  const [elF, wrF] = armPts(p.aF, p.eF), [elB, wrB] = armPts(p.aB, p.eB);
  const robe = L.robe, robe2 = L.robe2 ?? darker(robe), ol = `stroke="${INK}" stroke-opacity=".55" stroke-width="1.4" stroke-linejoin="round"`;
  let out = '';
  // 披风（在最后面）
  if (L.cape) { const sw = wav(g, 1.6) * 6; out += `<path d="M${pt(add(sh, side, -6))} Q${f(sh[0] - 34 + sw)},${f((sh[1] + hip[1]) / 2)} ${f(hip[0] - 40 + sw * 1.5)},${f(hip[1] + 52)} L${f(hip[0] - 4)},${f(hip[1] + 40)} L${pt(add(sh, side, 8))} Z" fill="${L.cape}" ${ol}/>`; }
  // 后面的胳膊
  const arm = (el: number[], wr: number[], c: string, front: boolean) => {
    let a = `<path d="M${pt(sh)} L${pt(el)} L${pt(wr)}" stroke="${c}" stroke-width="${L.sleeve === 'bare' ? 9 : 12}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (L.sleeve === 'bare') a = `<path d="M${pt(sh)} L${pt(el)}" stroke="${c}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M${pt(el)} L${pt(wr)}" stroke="${SKIN}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${pt(el)} L${pt(wr)}" stroke="${INK}" stroke-opacity=".35" stroke-width="1" fill="none"/>`;
    if (L.sleeve === 'wide') { const dv = [wr[0] - el[0], wr[1] - el[1]], n = Math.hypot(dv[0], dv[1]) || 1, pp = [-dv[1] / n, dv[0] / n]; a += `<path d="M${pt(add(el, pp, 6))} L${pt(add(wr, pp, 11))} Q${f(wr[0] + 4)},${f(wr[1] + 16)} ${pt(add(wr, pp, -9))} L${pt(add(el, pp, -6))} Z" fill="${c}" ${ol}/>`; }
    if (L.trim && L.sleeve === 'wide') a += `<circle cx="${f(wr[0])}" cy="${f(wr[1])}" r="7" fill="none" stroke="${L.trim}" stroke-width="2" opacity=".8"/>`;
    a += `<circle cx="${f(wr[0])}" cy="${f(wr[1])}" r="5.6" fill="${SKIN}" stroke="${INK}" stroke-opacity=".45" stroke-width="1"/>`;
    return front ? a : `<g opacity=".95">${a}</g>`;
  };
  out += arm(elB, wrB, robe2, false);
  // 后腿
  const leg = (kn: number[], an: number[], c: string) => `<path d="M${pt(hip)} L${pt(kn)} L${pt(an)}" stroke="${c}" stroke-width="${13 * W}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${f(an[0] - 4)},${f(an[1] + 2)} q${f(9)},${f(-6)} ${f(17)},${f(1)}" stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  out += leg(kB, anB, darker(L.pants, 0.85));
  // 下摆
  const hemK = L.long ? 0.9 : 0.42;
  const hF = [lerp(kF[0], anF[0], hemK) + 13 * W, lerp(kF[1], anF[1], hemK) + 4], hB = [lerp(kB[0], anB[0], hemK) - 12 * W, lerp(kB[1], anB[1], hemK) + 4];
  const wF = add(hip, side, 15 * W), wB = add(hip, side, -16 * W);
  const hemSw = wav(g, 2.2) * 2;
  out += leg(kF, anF, L.pants);
  out += `<path d="M${pt(wB)} Q${f(wB[0] - 10 + hemSw)},${f((wB[1] + hB[1]) / 2)} ${f(hB[0] + hemSw)},${f(hB[1])} Q${f((hB[0] + hF[0]) / 2)},${f(Math.max(hB[1], hF[1]) + 6)} ${f(hF[0] + hemSw)},${f(hF[1])} Q${f(wF[0] + 10)},${f((wF[1] + hF[1]) / 2)} ${pt(wF)} Z" fill="${robe2}" ${ol}/>`;
  // 身子
  const sF = add(sh, side, 21 * W), sB = add(sh, side, -20 * W);
  out += `<path d="M${pt(wB)} L${pt(sB)} Q${pt(add(sh, up, 7))} ${pt(sF)} L${pt(wF)} Z" fill="${robe}" ${ol}/>`;
  if (L.patches) out += `<rect x="${f(sh[0] - 12)}" y="${f(sh[1] + 18)}" width="11" height="9" fill="#8E9398" opacity=".8" transform="rotate(${f(p.lean)} ${f(sh[0])} ${f(sh[1])})"/><rect x="${f(hB[0] + 8)}" y="${f(hB[1] - 18)}" width="10" height="8" fill="#7E8388" opacity=".8"/>`;
  if (L.armor) for (let i = 1; i <= 4; i++) { const a0 = add(add(hip, up, TOR * i / 5.2), side, -18 * W), a1 = add(add(hip, up, TOR * i / 5.2), side, 19 * W); out += `<path d="M${pt(a0)} Q${pt(add(add(hip, up, TOR * i / 5.2 - 4), side, 0))} ${pt(a1)}" stroke="#8A7E6A" stroke-width="1.6" fill="none" opacity=".8"/>`; }
  if (L.armor) out += `<path d="M${pt(add(sh, side, -14))} q${f(side[0] * 16 + up[0] * 8)},${f(side[1] * 16 + up[1] * 8)} ${f(side[0] * 30)},${f(side[1] * 30)}" stroke="#8A7E6A" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  // 领口、腰带
  out += `<path d="M${pt(add(sh, side, 10))} L${pt(add(add(sh, up, -20), side, 2))} L${pt(add(sh, side, -6))}" stroke="${L.trim ?? '#E9DFCB'}" stroke-width="2" fill="none" opacity=".75"/>`;
  out += `<path d="M${pt(add(add(hip, up, 9), side, -16 * W))} L${pt(add(add(hip, up, 9), side, 15 * W))}" stroke="${L.belt ?? INK}" stroke-width="6"/>`;
  // 佩剑
  if (L.sword && o.hold !== 'spear') { const h0 = add(add(hip, up, 6), side, 10), h1 = add(h0, [-side[0] * 0.95 - up[0] * 0.3, -side[1] * 0.95 - up[1] * 0.3 + 0.32], 62); out += `<path d="M${pt(h0)} L${pt(h1)}" stroke="#3A2A1E" stroke-width="5" stroke-linecap="round"/><path d="M${pt(h0)} L${pt(add(h0, [side[0] * 0.9 + up[0] * 0.4, side[1] * 0.9 + up[1] * 0.4], 16))}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="${f(h0[0])}" cy="${f(h0[1])}" r="3" fill="${GOLD}"/>`; }
  // 头
  out += headSide(hc, p.lean + p.head, L, g, o.detail ?? s >= 1.6, o.mood ?? 'calm');
  // 手里拿的
  const hold = o.hold;
  if (hold === 'rod') { const tx = wrF[0] + 210, ty = wrF[1] - 120, ex = tx + 24, ey = -8; out += `<path d="M${pt(wrF)} L${f(tx)},${f(ty)}" stroke="#5A4630" stroke-width="2.4"/><path d="M${f(tx)},${f(ty)} Q${f(tx + 6 + wav(g, 3) * 3)},${f((ty + ey) / 2)} ${f(ex)},${f(ey)}" stroke="${INK}" stroke-opacity=".55" stroke-width="1" fill="none"/>` + [0, 1, 2].map((i) => { const k = (g * 0.45 + i / 3) % 1; return `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="${f(4 + k * 30)}" ry="${f(1.5 + k * 6)}" fill="none" stroke="${INK}" stroke-opacity="${f(0.45 * (1 - k))}" stroke-width="1.2"/>`; }).join(''); }
  if (hold === 'bowl') out += bowl(wrF[0] + 8, wrF[1] - 4, 0.55, g);
  if (hold === 'cup') out += `<path d="M${f(wrF[0] - 6)},${f(wrF[1] - 10)} h12 l-2,10 h-8 z" fill="#8A6A3A" stroke="${INK}" stroke-width="1"/>`;
  if (hold === 'spear') out += `<line x1="${f(wrF[0])}" y1="${f(wrF[1] + 40)}" x2="${f(wrF[0] + 6)}" y2="${f(wrF[1] - 150)}" stroke="#4A3A2A" stroke-width="3"/><path d="M${f(wrF[0] + 6)},${f(wrF[1] - 150)} l-5,12 h10 z" fill="#8A8A8A"/>`;
  if (hold === 'basket') out += `<path d="M${f(wrB[0] - 18)},${f(wrB[1] + 4)} h36 l-5,22 h-26 z" fill="#9C7E52" stroke="${INK}" stroke-opacity=".6"/><path d="M${f(wrB[0] - 14)},${f(wrB[1] + 4)} q14,-16 28,0" stroke="#7A5E3A" stroke-width="2" fill="none"/>`;
  if (hold === 'reins') out += `<path d="M${pt(wrF)} q40,10 90,-4" stroke="#3A2A1E" stroke-width="2" fill="none"/>`;
  if (hold === 'brush') out += `<line x1="${f(wrF[0])}" y1="${f(wrF[1])}" x2="${f(wrF[0] + 6)}" y2="${f(wrF[1] - 26)}" stroke="#5A4630" stroke-width="2.5"/>`;
  if (hold === 'torch') out += `<line x1="${f(wrF[0])}" y1="${f(wrF[1] + 8)}" x2="${f(wrF[0] + 4)}" y2="${f(wrF[1] - 40)}" stroke="#4A3A2A" stroke-width="3"/><path d="M${f(wrF[0] + 4)},${f(wrF[1] - 40)} q-8,-14 0,-30 q10,14 0,30" fill="#E07A2E"/>`;
  if (hold === 'pole') out += `<line x1="${f(wrF[0] - 10)}" y1="${f(wrF[1] + 60)}" x2="${f(wrF[0] + 14)}" y2="${f(wrF[1] - 170)}" stroke="#6E5A3A" stroke-width="3.5"/><path d="M${f(wrF[0] + 14)},${f(wrF[1] - 170)} q30,${f(8 + wav(g, 1.3) * 6)} 60,${f(2 + wav(g, 1.3, 0.3) * 8)} l0,40 q-30,${f(6 + wav(g, 1.3) * 6)} -60,-4 z" fill="#8C3A2E"/>`;
  if (hold === 'punt') out += `<line x1="${f(wrB[0] - 60)}" y1="${f(-hipY * 0 + 40)}" x2="${f(wrB[0] + 30)}" y2="${f(wrB[1] - 120)}" stroke="#6E5A3A" stroke-width="4"/>`; // 撑船的长篙
  if (hold === 'scroll') out += `<rect x="${f(wrF[0] - 3)}" y="${f(wrF[1] - 16)}" width="34" height="22" fill="#EFE3C6" stroke="#8A6A3A"/>`;
  out += arm(elF, wrF, robe, true);
  return `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${f(s * fc)},${f(s)})" opacity="${o.a ?? 1}">${out}</g>`;
};

/** 侧面的头：头型、头发 / 头盔 / 头巾、脸（大一点时才画眼睛、眉毛、嘴） */
const headSide = (c: number[], ang: number, L: Look, g: number, detail: boolean, mood: string) => {
  const r = 15;
  let o = `<g transform="translate(${f(c[0])},${f(c[1])}) rotate(${f(ang)})">`;
  const hairC = L.hairC ?? '#1E1A18';
  if (L.hair === 'bun') o += `<path d="M-12,4 Q-22,30 -14,58 Q-10,${f(64 + wav(g, 2.5) * 2)} -4,58 Q-8,30 -4,6 Z" fill="${hairC}"/>`; // 长发垂在背后
  o += `<circle cx="0" cy="0" r="${r}" fill="${SKIN}" stroke="${INK}" stroke-opacity=".6" stroke-width="1.2"/>`;
  o += `<path d="M${r - 1},-3 q5,4 1,8" fill="${SKIN}" stroke="${INK}" stroke-opacity=".6" stroke-width="1.2"/>`; // 鼻子
  if (L.hair === 'knot' || L.hair === 'crown' || L.hair === 'scholar' || L.hair === 'cap' || L.hair === 'messy') o += `<path d="M${-r},2 Q${-r - 2},${-r - 2} 0,${-r - 1} Q${r - 2},${-r} ${r - 2},-7 Q4,-8 -2,-4 Q-6,6 -9,10 Z" fill="${hairC}"/>`;
  if (L.hair === 'knot') o += `<circle cx="-4" cy="${-r - 5}" r="6.5" fill="${hairC}"/><rect x="-9" y="${-r - 2}" width="10" height="3" fill="#D9CFBD"/>`;
  if (L.hair === 'scholar') o += `<path d="M-12,${-r + 1} q12,-14 24,-2 l-2,-8 q-10,-8 -20,0 z" fill="${INK}"/><path d="M-12,-8 q-6,10 -4,24" stroke="${INK}" stroke-width="2" fill="none"/>`;
  if (L.hair === 'crown') o += `<rect x="-11" y="${-r - 16}" width="22" height="12" fill="${INK}"/><rect x="-14" y="${-r - 18}" width="28" height="4" fill="${GOLD}"/><path d="M-12,${-r - 14} l-4,${f(26 + wav(g, 2) * 2)} M12,${-r - 14} l4,${f(26 + wav(g, 2, 0.3) * 2)}" stroke="${GOLD}" stroke-width="1.5"/>`;
  if (L.hair === 'cap') o += `<path d="M${-r - 2},-4 Q0,${-r - 12} ${r + 1},-5 Q0,-9 ${-r - 2},-4 Z" fill="#4A4238"/>`;
  if (L.hair === 'messy') o += `<path d="M${-r},-2 l-5,-8 l6,2 l-1,-9 l7,5 l2,-9 l5,7 l5,-6 l1,8 l6,-2 l-4,7" fill="${hairC}"/><path d="M-15,-6 l27,-4" stroke="#8A3A2A" stroke-width="3"/>`;
  if (L.hair === 'kerchief') o += `<path d="M${-r - 2},6 Q${-r - 4},${-r - 6} 2,${-r - 3} Q${r + 1},${-r} ${r},-4 Q2,-9 -6,-2 Q-10,8 -12,14 Z" fill="${hairC}" stroke="${INK}" stroke-opacity=".4"/><path d="M${-r - 1},4 q-9,4 -12,14 q6,-2 10,-8" fill="${hairC}" stroke="${INK}" stroke-opacity=".35"/>`;
  if (L.hair === 'helmet') o += `<path d="M${-r - 3},4 Q${-r - 4},${-r - 8} 0,${-r - 5} Q${r + 3},${-r - 4} ${r + 2},-5 L${r - 2},-3 Q2,-8 -8,-2 L-10,10 Z" fill="#3A3330" stroke="#8A7E6A" stroke-width="1.4"/><path d="M0,${-r - 5} l0,-6" stroke="#8A7E6A" stroke-width="2"/><path d="M0,${-r - 11} q${f(-8 + wav(g, 1.4) * 3)},-6 ${f(-16 + wav(g, 1.4) * 5)},${f(6)}" stroke="${RED}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  if (L.hair === 'bun') o += `<path d="M${-r},4 Q${-r - 2},${-r - 4} 0,${-r - 1} Q${r - 2},${-r} ${r - 3},-8 Q2,-9 -4,-4 Q-8,6 -10,10 Z" fill="${hairC}"/><ellipse cx="-6" cy="${-r - 7}" rx="9" ry="6" fill="${hairC}"/><path d="M-16,${-r - 9} l22,-3" stroke="${GOLD}" stroke-width="2"/><circle cx="7" cy="${-r - 11}" r="2.5" fill="${RED}"/>`;
  if (L.beard === 'stub') o += `<path d="M${r - 6},8 q-6,8 -16,6" stroke="${INK}" stroke-opacity=".35" stroke-width="3" fill="none" stroke-dasharray="1.5 2"/>`;
  if (L.beard === 'long') o += `<path d="M${r - 5},9 q-2,${f(18 + wav(g, 2.4) * 1.5)} -10,${f(26)} q-2,-12 -4,-22 z" fill="#5A5048"/>`;
  if (detail) {
    const eyeY = -3, sq = mood === 'sneer' ? 0.5 : mood === 'shock' ? 1.6 : 1;
    o += `<path d="M5,${eyeY} q3,${f(-1.6 * sq)} 6,0" stroke="${INK}" stroke-width="1.6" fill="none"/>`;
    const bA = mood === 'sneer' ? -14 : mood === 'sad' ? 14 : mood === 'shock' ? -6 : 0;
    o += `<path d="M3,${eyeY - 6} l9,0" stroke="${INK}" stroke-width="1.8" transform="rotate(${bA} 7 ${eyeY - 6})"/>`;
    const mo = mood === 'laugh' ? `<path d="M${r - 6},8 q-4,5 -8,1" fill="#5A2A22"/>` : mood === 'sneer' ? `<path d="M${r - 5},8 q-4,1 -7,-2" stroke="${INK}" stroke-width="1.3" fill="none"/>` : mood === 'shock' ? `<ellipse cx="${r - 7}" cy="9" rx="2" ry="3" fill="#5A2A22"/>` : `<path d="M${r - 5},9 l-5,0" stroke="${INK}" stroke-width="1.2"/>`;
    o += mo;
    o += `<path d="M-3,-3 q-4,3 0,7" stroke="${INK}" stroke-opacity=".5" stroke-width="1.2" fill="none"/>`; // 耳朵
  }
  return o + '</g>';
};

/** 碗：米饭、热气 */
export const bowl = (x: number, y: number, s = 1, g = 0, steam = true) => {
  let o = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-30,0 Q-28,26 0,30 Q28,26 30,0 Z" fill="#8A6A48" stroke="${INK}" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="30" ry="8" fill="#6E543A" stroke="${INK}" stroke-width="1.5"/><path d="M-24,0 Q0,-18 24,0 Z" fill="#F7F2E6" stroke="${INK}" stroke-opacity=".3"/>`;
  if (steam) for (let i = 0; i < 3; i++) { const k = ((g * 0.5 + i / 3) % 1); o += `<path d="M${-10 + i * 10},${f(-14 - k * 40)} q${f(6 + wav(g, 1.2, i) * 4)},-10 0,-20" stroke="#fff" stroke-width="3" fill="none" opacity="${f(0.7 * Math.sin(k * Math.PI))}" stroke-linecap="round"/>`; }
  return o + '</g>';
};

// ---------------- 马（侧面，朝右） ----------------
export const horse = (o: { x: number; y: number; s?: number; face?: 1 | -1; g?: number; gait?: 'stand' | 'run' | 'paw' | 'walk'; ph?: number; head?: number; c?: string; spots?: boolean; rider?: string; riderPose?: Pose; a?: number }) => {
  const s = o.s ?? 1, fc = o.face ?? 1, g = o.g ?? 0, c = o.c ?? '#1C1918', ph = o.ph ?? g;
  const legA = (base: number, phase: number, amp: number) => (o.gait === 'run' ? base + Math.sin((ph + phase) * Math.PI * 2) * amp : o.gait === 'walk' ? base + Math.sin((ph + phase) * Math.PI * 2) * amp * 0.45 : base);
  const leg = (hx: number, hy: number, a: number, k: number, front: boolean, sh: number) => {
    const kn = [hx + Math.sin(rad(a)) * 44, hy + Math.cos(rad(a)) * 44], b = a + (front ? -k : k), ho = [kn[0] + Math.sin(rad(b)) * 46, kn[1] + Math.cos(rad(b)) * 46];
    return `<path d="M${f(hx)},${f(hy)} L${pt(kn)}" stroke="${sh ? darker(c, 0.8) : c}" stroke-width="${front ? 19 : 22}" stroke-linecap="round" fill="none"/><path d="M${pt(kn)} L${pt(ho)}" stroke="${sh ? darker(c, 0.8) : c}" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M${f(ho[0] - 7)},${f(ho[1])} h15" stroke="#3A3330" stroke-width="9" stroke-linecap="round"/>`;
  };
  const paw = o.gait === 'paw' ? Math.max(0, Math.sin(g * 2.2)) * 40 : 0;
  const run = o.gait === 'run' ? 1 : 0, bob = run ? Math.sin(ph * Math.PI * 4) * 4 : 0;
  const hdA = (o.head ?? 0) + (o.gait === 'paw' ? Math.sin(g * 1.7) * 6 : 0) + (run ? Math.sin(ph * Math.PI * 2) * 5 : 0);
  let out = '';
  out += leg(50, -92 + bob, legA(4, 0.5, 34), legA(14, 0.25, 20), true, 1);
  out += leg(-56, -96 + bob, legA(-6, 0, 30), legA(26, 0.5, 18), false, 1);
  // 尾巴
  const tw = wav(g, 1.8) * 10 + (run ? 18 : 0);
  out += `<path d="M-80,${f(-116 + bob)} Q${f(-112 - tw * 0.4)},${f(-96 + bob)} ${f(-108 - tw)},${f(-40 + bob - run * 30)}" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-82,${f(-112 + bob)} Q${f(-104 - tw * 0.6)},${f(-80 + bob)} ${f(-96 - tw * 1.1)},${f(-30 + bob - run * 30)}" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>`;
  // 身子
  out += `<path d="M-90,${f(-104 + bob)} Q-92,${f(-140 + bob)} -54,${f(-142 + bob)} Q10,${f(-150 + bob)} 58,${f(-134 + bob)} Q92,${f(-124 + bob)} 90,${f(-94 + bob)} Q84,${f(-70 + bob)} 50,${f(-72 + bob)} Q0,${f(-66 + bob)} -54,${f(-76 + bob)} Q-90,${f(-80 + bob)} -90,${f(-104 + bob)} Z" fill="${c}"/>`;
  if (o.spots ?? true) { const r = rng(17); for (let i = 0; i < 22; i++) out += `<circle cx="${f(-70 + r() * 140)}" cy="${f(-128 + r() * 44 + bob)}" r="${f(2 + r() * 3)}" fill="#D9D4CC" opacity="${f(0.35 + r() * 0.35)}"/>`; }
  // 脖子、头
  out += `<g transform="translate(58,${f(-116 + bob)}) rotate(${f(hdA)})"><path d="M-30,4 Q-18,-58 22,-90 L58,-70 Q36,-34 30,18 Z" fill="${c}"/><path d="M18,-92 Q36,-112 58,-104 Q74,-94 92,-68 L120,-34 Q128,-22 118,-14 Q104,-8 90,-16 Q70,-30 50,-50 Q30,-64 18,-92 Z" fill="${c}"/><path d="M30,-104 l-4,-20 l12,14 M40,-106 l4,-19 l7,16" stroke="${c}" stroke-width="5" fill="${c}"/><ellipse cx="52" cy="-84" rx="5" ry="3.6" fill="#E9DFCB"/><circle cx="53" cy="-84" r="2.2" fill="#1E1A18"/><path d="M114,-22 q-6,3 -12,0" stroke="#5A504A" stroke-width="2" fill="none"/><path d="M110,-30 q-4,-2 -2,-6" stroke="#5A504A" stroke-width="2" fill="none"/>`;
  for (let i = 0; i < 9; i++) { const t = i / 8, mx = lerp(-24, 22, t), my = lerp(-4, -92, t); out += `<path d="M${f(mx)},${f(my)} q${f(-16 - wav(g, 1.5, t) * 6 - run * 10)},${f(4)} ${f(-24 - run * 12)},${f(14)}" stroke="#121010" stroke-width="6" stroke-linecap="round" fill="none"/>`; }
  out += `</g>`;
  out += leg(40, -94 + bob, legA(-2, 0, 32) + paw, legA(10, 0.75, 22) + paw * 1.6, true, 0);
  out += leg(-46, -98 + bob, legA(6, 0.5, 30), legA(22, 0, 18), false, 0);
  if (o.rider) out += `<g transform="translate(-6,${f(-128 + bob)})">${person({ x: 0, y: 70, who: o.rider, pose: o.riderPose ?? P.rideRun(ph), g, s: 1 })}</g>`;
  return `<g transform="translate(${f(o.x)},${f(o.y)}) scale(${f(s * fc)},${f(s)})" opacity="${o.a ?? 1}">${out}</g>`;
};

// ---------------- 特写：侧脸（朝右） ----------------
export interface FaceOpts { x: number; y: number; s?: number; face?: 1 | -1; who: 'hanxin' | 'xiangyu' | 'yuji' | 'piaomu' | 'tuhu'; g?: number; open?: number; brow?: number; mouth?: number; tear?: number; look?: number; shake?: number; nod?: number; id: string }
export const faceCU = (o: FaceOpts) => {
  const s = o.s ?? 1, fc = o.face ?? 1, g = o.g ?? 0, open = o.open ?? 1, brow = o.brow ?? 0, mo = o.mouth ?? 0;
  const old = o.who === 'piaomu', fem = o.who === 'yuji' || old, ruff = o.who === 'tuhu', hero = o.who === 'xiangyu';
  const nose = fem ? 0.82 : 1, jaw = hero || ruff ? 1.1 : fem ? 0.9 : 1;
  const breathe = Math.sin(g * 1.4) * 2;
  let out = '';
  // 衣领、肩
  const col = { hanxin: '#6E7378', xiangyu: '#3A3436', yuji: '#D8C3B0', piaomu: '#8A7B66', tuhu: '#4A3F36' }[o.who];
  out += `<path d="M-300,${f(420 + breathe)} Q-280,236 -60,${f(178 + breathe)} Q20,170 90,${f(182 + breathe)} Q290,226 320,${f(420 + breathe)} Z" fill="${col}" stroke="${INK}" stroke-opacity=".55" stroke-width="3"/>`;
  if (hero) out += `<path d="M-160,${f(320 + breathe)} Q-110,220 -20,200 M-140,300 Q-80,240 0,232 M100,300 Q120,250 170,320" stroke="#8A7E6A" stroke-width="5" fill="none"/>`;
  else out += `<path d="M20,182 L60,250 L95,186" stroke="${o.who === 'yuji' ? RED : '#E9DFCB'}" stroke-width="5" fill="none" opacity=".8"/>`;
  // 脖子、后脑的头发（长发）
  if (o.who === 'yuji') out += `<path d="M-60,-40 Q-140,80 -110,${f(260 + wav(g, 3) * 6)} L-60,250 Q-80,100 -40,0 Z" fill="#1E1A18"/>`;
  out += `<path d="M-62,70 Q-64,140 -78,196 L84,196 Q56,150 48,112 Z" fill="url(#${o.id}skin)" stroke="${INK}" stroke-opacity=".5" stroke-width="2.5"/>`;
  // 脸的轮廓（侧面）
  const face = `M40,-140 Q-40,-170 -92,-70 Q-112,10 -76,80 Q-50,124 0,${f(126 * jaw)} Q${f(60 * jaw)},${f(122 * jaw)} ${f(84 * jaw)},${f(100 * jaw)} Q${f(96)},${f(84)} 92,72 Q100,68 94,62 Q100,56 96,50 Q${f(90 + 4 * nose)},${f(44)} ${f(92 + 16 * nose)},${f(24)} Q${f(96 + 12 * nose)},${f(14)} 86,-14 Q84,-30 90,-46 Q86,-100 40,-140 Z`;
  out += `<path d="${face}" fill="url(#${o.id}skin)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  if (old) out += `<path d="M44,-6 q10,14 2,30 M58,-34 q12,-6 22,0 M60,44 q-10,16 2,34 M30,96 q20,6 40,-6" stroke="${INK}" stroke-opacity=".35" stroke-width="2" fill="none"/>`;
  if (o.who === 'hanxin') out += `<path d="M60,92 q-20,10 -44,4" stroke="${INK}" stroke-opacity=".18" stroke-width="2" fill="none"/>`; // 消瘦：面颊凹下去一点
  if (ruff || hero) out += `<path d="M10,110 Q60,116 86,96 Q60,104 20,100" fill="${INK}" opacity=".18"/>`; // 胡茬
  // 耳朵
  out += `<path d="M-30,-20 Q-50,-24 -48,4 Q-46,30 -26,28" fill="url(#${o.id}skin)" stroke="${INK}" stroke-width="2.5"/>`;
  // 眼睛：open 0—1（眯起来就小）
  const ey = -22, eh = 9 * open;
  out += `<path d="M38,${ey} Q56,${f(ey - eh - 2)} 74,${ey - 1} Q56,${f(ey + eh * 0.6 + 2)} 38,${ey} Z" fill="#F7F2E6" stroke="${INK}" stroke-width="2.5"/>`;
  if (open > 0.12) out += `<circle cx="${f(62 + (o.look ?? 0) * 4)}" cy="${f(ey - 1)}" r="${f(Math.min(6, 2 + 5 * open))}" fill="#1E1A18"/>`;
  out += `<path d="M36,${f(ey - eh - 4)} Q56,${f(ey - eh - 9)} 76,${f(ey - eh - 4)}" stroke="${INK}" stroke-width="2.4" fill="none" opacity=".7"/>`;
  // 眉：brow −1（怒、皱）到 1（愁）
  out += `<path d="M30,${f(-50 - 4 * brow)} Q52,${f(-60 + 2 * brow)} ${f(80)},${f(-50 + 10 * brow)}" stroke="#1E1A18" stroke-width="${hero || ruff ? 9 : fem ? 4 : 6}" stroke-linecap="round" fill="none"/>`;
  // 嘴：mouth −1（下撇）到 1（笑），0.5 张开唱
  const mY = 62;
  if (o.mouth !== undefined && o.mouth > 0.4 && o.mouth < 0.7) out += `<path d="M94,${mY - 4} Q80,${mY + 14} 70,${mY} Z" fill="#5A2A22"/>`;
  else out += `<path d="M94,${mY} Q82,${f(mY - 6 * mo)} 68,${f(mY + 4 * mo)}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  // 泪
  if ((o.tear ?? 0) > 0) { const ty = lerp(-10, 110, o.tear!); out += `<path d="M52,-8 Q48,${f(ty * 0.6)} 46,${f(ty)}" stroke="#BFD4E2" stroke-width="3" fill="none" opacity=".8"/><path d="M46,${f(ty - 8)} q-6,10 0,14 q6,-4 0,-14 z" fill="#CFE0EC" stroke="#8FAABC" stroke-width="1.2"/>`; }
  // 头发 / 头盔 / 头巾
  if (o.who === 'hanxin') out += `<path d="M44,-136 Q-30,-176 -96,-80 Q-110,-10 -84,40 Q-70,-20 -40,-40 Q-10,-70 30,-80 Q60,-96 70,-112 Z" fill="#1E1A18"/><ellipse cx="-30" cy="-160" rx="38" ry="28" fill="#1E1A18"/><rect x="-60" y="-150" width="50" height="10" fill="#D9CFBD" transform="rotate(-12 -35 -145)"/><path d="M60,-110 q14,30 4,60 M44,-112 q4,26 -6,46" stroke="#1E1A18" stroke-width="3" fill="none"/>`;
  if (hero) out += `<path d="M90,-60 Q96,-150 20,-176 Q-80,-190 -112,-80 Q-124,-10 -100,60 L-70,80 Q-84,0 -60,-50 Q-20,-80 50,-74 Z" fill="#3A3330" stroke="#8A7E6A" stroke-width="4"/><path d="M96,-62 L-112,-80" stroke="#8A7E6A" stroke-width="8"/><path d="M-10,-182 l0,-26" stroke="#8A7E6A" stroke-width="7"/><path d="M-10,-206 q${f(-40 + wav(g, 1.3) * 10)},-26 ${f(-90 + wav(g, 1.3) * 16)},${f(10)}" stroke="${RED}" stroke-width="18" stroke-linecap="round" fill="none"/>`;
  if (o.who === 'yuji') out += `<path d="M44,-136 Q-30,-176 -96,-80 Q-110,-10 -90,40 Q-74,-30 -40,-50 Q0,-74 40,-84 Q70,-92 76,-108 Z" fill="#1E1A18"/><ellipse cx="-50" cy="-150" rx="48" ry="34" fill="#1E1A18"/><path d="M-110,-170 L10,-150" stroke="${GOLD}" stroke-width="5"/><circle cx="12" cy="-150" r="8" fill="${RED}"/><path d="M-30,40 l0,${f(30 + wav(g, 2) * 4)}" stroke="${GOLD}" stroke-width="2"/><circle cx="-30" cy="${f(74 + wav(g, 2) * 4)}" r="6" fill="#7FB3A3"/>`;
  if (old) out += `<path d="M86,-50 Q90,-150 10,-170 Q-90,-180 -118,-70 Q-128,20 -100,90 Q-80,40 -70,-20 Q-40,-70 40,-80 Q76,-80 86,-50 Z" fill="#D9D2C4" stroke="${INK}" stroke-opacity=".5" stroke-width="2.5"/><path d="M-100,60 q-30,30 -30,70 q20,-20 40,-40" fill="#D9D2C4" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M60,-84 q20,10 26,30" stroke="#9A9288" stroke-width="3" fill="none"/>`;
  if (ruff) out += `<path d="M60,-110 Q-30,-180 -100,-80 Q-112,-10 -90,40 Q-80,-10 -60,-40 l20,4 l-6,-16 l24,6 l-4,-18 l26,10 l2,-16 l20,10 Z" fill="#1E1A18"/><path d="M-100,-60 L80,-84" stroke="#8A3A2A" stroke-width="10"/>`;
  const shake = (o.shake ?? 0) * Math.sin(g * 14) * 6, nod = (o.nod ?? 0) * 8;
  return `<g transform="translate(${f(o.x + shake)},${f(o.y + nod)}) scale(${f(s * fc)},${f(s)})">${out}</g>`;
};

/** 特写：握剑柄的手（grip 0 松 — 1 紧） */
export const swordHand = (x: number, y: number, s = 1, grip = 0, g = 0) => {
  const sh = grip > 0.6 ? Math.sin(g * 30) * 1.5 * (grip - 0.6) * 4 : 0;
  let o = `<g transform="translate(${f(x + sh)},${f(y)}) scale(${f(s)})">`;
  o += `<path d="M-420,40 L-60,10 L-60,-14 L-420,-40 Z" fill="#3A2A1E"/><path d="M-420,40 L-60,10 M-420,-40 L-60,-14" stroke="#1E1A18" stroke-width="3"/>`; // 剑鞘
  o += `<rect x="-70" y="-46" width="20" height="92" rx="5" fill="${GOLD}" stroke="#7A5A1E" stroke-width="3"/>`; // 护手
  o += `<rect x="-50" y="-18" width="250" height="36" rx="10" fill="#4A3A2C"/>`;
  for (let i = 0; i < 9; i++) o += `<path d="M${-40 + i * 26},-18 l14,36" stroke="#2E2420" stroke-width="5"/>`;
  o += `<circle cx="210" cy="0" r="22" fill="${GOLD}" stroke="#7A5A1E" stroke-width="3"/>`;
  // 袖子
  o += `<path d="M120,260 Q60,150 30,80 L170,60 Q200,150 260,240 Z" fill="#6E7378" stroke="${INK}" stroke-width="3"/>`;
  // 手：手背 + 四个指节（越握越紧，指节越白）
  const k = grip;
  o += `<path d="M20,70 Q0,${f(30 - 10 * k)} 10,${f(-30 + 6 * k)} Q40,${f(-50 + 8 * k)} 150,${f(-44 + 8 * k)} Q186,${f(-30 + 6 * k)} 180,20 Q170,70 120,90 Z" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>`;
  for (let i = 0; i < 4; i++) { const fx = 30 + i * 36; o += `<path d="M${fx},${f(-34 + 8 * k)} Q${fx + 4},${f(16 - 4 * k)} ${fx + 24},${f(26 - 2 * k)}" stroke="${INK}" stroke-width="2.5" fill="none" opacity=".7"/><ellipse cx="${fx + 14}" cy="${f(-36 + 8 * k)}" rx="12" ry="7" fill="#fff" opacity="${f(0.15 + 0.55 * k)}"/>`; }
  o += `<path d="M10,0 Q-14,30 6,70" stroke="${INK}" stroke-width="2.5" fill="none" opacity=".6"/>`;
  return o + '</g>';
};
