// 第五回　背水一战：每一镜怎么画、怎么动（对照 第六堂课/分镜/第五回_背水一战.md）
import { GOLD, INK, PAPER, RED, banner, f, flame, glow, lerp, mist, moon, ridge, river, rng, seg, sky, sunDisc, tent, torch, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import { deskShot, glassesShot, tentIn } from './shots2';
import type { ShotDef } from './Film';

const KAI = `style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif"`;
const ZHAO = '#2E4A6E';
/** 井陉口外：左边是河，中间是平地，右边远处是赵营 */
const fieldBg = (id: string, o: { dawn?: boolean; dusk?: boolean } = {}) =>
  sky(id, o.dawn ? '#C9B7AE' : o.dusk ? '#B9876A' : '#C9C4B6', o.dawn ? '#E8DCCB' : o.dusk ? '#D8B892' : '#E6E0D2') + (o.dawn ? sunDisc(id, 1380, 300, 44, '#D8704A', 0.6) : '') +
  ridge({ y: 380, amp: 150, seed: 121, a: 0.45, color: '#5A5248', peaks: 3 }) + `<path d="M-200,560 L1800,560 L1800,1100 L-200,1100 Z" fill="#A89A7C"/>`;
const zhaoWall = (x: number, y: number, s: number, g: number, flags: number, red = 0) => {
  let o = `<g transform="translate(${x},${y}) scale(${s})"><rect x="-260" y="-70" width="520" height="70" fill="#6E6250" stroke="${INK}" stroke-width="4"/>${Array.from({ length: 13 }, (_, i) => `<rect x="${-260 + i * 40}" y="-90" width="24" height="20" fill="#6E6250" stroke="${INK}" stroke-width="2"/>`).join('')}<rect x="-40" y="-60" width="80" height="60" fill="#2A221C"/></g>`;
  for (let i = 0; i < flags; i++) { const isRed = i < red; o += banner(x - 230 * s + i * (460 * s / Math.max(1, flags - 1)), y - 110 * s, 0.5 * s, g, isRed ? RED : ZHAO, isRed ? '汉' : '赵', i * 0.3, 0.95); }
  return o;
};
/** 河（左边竖着流过） */
const sideRiver = (g: number) => `<path d="M-200,560 L240,560 Q300,760 200,1100 L-200,1100 Z" fill="#8FA9B8" opacity=".85"/>` + river(122, g, { y0: 580, y1: 1000, x0: -200, x1: 230, speed: 20, n: 40, a: 0.5 });
/** 一排兵（侧面），face 朝向，pose 函数 */
const rank = (x0: number, y: number, n: number, gap: number, s: number, who: string, g: number, face: 1 | -1, pose: (i: number) => ReturnType<typeof P.stand>, hold?: 'spear' | 'pole') => {
  let o = '';
  for (let i = 0; i < n; i++) o += person({ x: x0 + i * gap, y: y + (i % 2) * 10, s, who, pose: pose(i), g, face, hold });
  return o;
};
/** 鼓 */
const drum = (x: number, y: number, s: number, hit = 0) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-50" y="-60" width="100" height="70" rx="10" fill="#8A3A2A" stroke="${INK}" stroke-width="4"/><ellipse cx="0" cy="-60" rx="50" ry="14" fill="#E9DFCB" stroke="${INK}" stroke-width="3"/><path d="M-60,10 L-40,60 M60,10 L40,60" stroke="#4A3A2A" stroke-width="6"/>${hit > 0 ? `<ellipse cx="0" cy="-60" rx="${f(60 + hit * 30)}" ry="${f(18 + hit * 8)}" fill="none" stroke="#E9DFCB" stroke-width="3" opacity="${f(1 - hit)}"/>` : ''}</g>`;

export const SHOTS5: Record<string, ShotDef> = {
  // ---------- 0 穿过太行山的井陉 ----------
  'h.taihang': {
    bg: (id) => sky(id, '#C9C4B6', '#E6E0D2') + `<path d="M-200,-100 L560,-100 Q520,400 640,1100 L-200,1100 Z" fill="#5A5248"/><path d="M1800,-100 L1040,-100 Q1080,400 960,1100 L1800,1100 Z" fill="#5A5248"/>` + `<path d="M640,1100 Q520,400 560,-100 L1040,-100 Q1080,400 960,1100 Z" fill="#8A7E68"/>`,
    fg: (u, g, id) => {
      let o = '';
      for (let i = 0; i < 18; i++) { const k = ((i / 18 + u * 0.4 + g * 0.01) % 1), y = lerp(1000, 120, k), x = 800 + Math.sin(k * 6) * 40; o += person({ x, y, s: lerp(1.1, 0.25, k), who: 'hanSoldier', pose: P.walk(g + i * 0.2), g, face: 1, hold: i % 4 === 0 ? 'spear' : undefined }); }
      return o + mist(id, 123, g, { y: 300, h: 120, a: 0.45, n: 6 });
    },
    cam: [[800, 480, 1500], [800, 460, 1400]],
  },
  'h.zhaocamp': {
    bg: (id) => fieldBg(id),
    fg: (u, g) => {
      const r = rng(41); let o = '';
      const k = seg(u, 0, 0.8);
      for (let i = 0; i < 40; i++) { if (seg(k, i / 40, i / 40 + 0.06) <= 0) continue; o += tent(500 + (i % 10) * 100 + r() * 20, 560 + Math.floor(i / 10) * 36 + r() * 8, 0.45, '#4A5468', 0.9); }
      o += zhaoWall(1000, 760, 1.2, g, 6);
      return o;
    },
    cam: [[800, 520, 1600], [1000, 600, 1300]],
  },
  'h.lizuoche': {
    bg: (id) => tentIn(id) + `<rect x="560" y="200" width="480" height="280" rx="10" fill="#EFE6D0" stroke="#B9A57A" stroke-width="5"/>`,
    fg: (u, g) => {
      const a = seg(u, 0.2, 0.7);
      return `<path d="M600,340 L1000,340" stroke="#8A7E68" stroke-width="16"/><path d="M${f(lerp(700, 900, a))},300 q-20,40 0,80" stroke="${RED}" stroke-width="6" fill="none" stroke-dasharray="10 8" opacity="${f(a)}"/>` + vtext(990, 230, '井陉', 28, INK, 0.75) +
        person({ x: 460, y: 790, s: 1.45, who: 'lizuoche', pose: P.point(0.7 + 0.3 * Math.sin(g * 1.5)), g, face: 1, detail: true }) + person({ x: 1160, y: 790, s: 1.45, who: 'chenyu', pose: P.stand(), g, face: -1, detail: true });
    },
    cam: [[800, 520, 1400], [800, 520, 1300]],
  },
  'h.narrow': {
    bg: (id) => sky(id, '#E9DFC8', '#E3D6BA') + `<rect x="60" y="60" width="1480" height="780" rx="20" fill="#EFE6D0" stroke="#B9A57A" stroke-width="6"/>` +
      `<path d="M100,380 Q600,300 1100,420 L1500,420 L1500,520 L1100,520 Q600,420 100,500 Z" fill="#8A7E68" opacity=".35"/><path d="M100,300 Q600,220 1100,340 L1500,340 M100,580 Q600,500 1100,600 L1500,600" stroke="#5A5248" stroke-width="40" fill="none" opacity=".5"/>`,
    fg: (u, g) => {
      const k = seg(u, 0, 0.6), c = seg(u, 0.5, 0.95);
      let o = '';
      for (let i = 0; i < 12; i++) o += `<rect x="${f(lerp(80, 980, k) - i * 70)}" y="${f(440 - i * 6)}" width="40" height="20" rx="4" fill="${RED}" opacity=".85"/>`;
      for (let i = 0; i < 3; i++) o += `<g transform="translate(${f(lerp(80, 980, k) - 900 - i * 70)},${f(500 - i * 4)})"><rect x="-26" y="-18" width="52" height="24" fill="#8A6A44"/><circle cx="-14" cy="10" r="8" fill="${INK}"/><circle cx="14" cy="10" r="8" fill="${INK}"/></g>`;
      o += `<path d="M1300,700 Q900,760 ${f(lerp(1300, 300, c))},${f(lerp(700, 560, c))}" stroke="${ZHAO}" stroke-width="7" fill="none" stroke-dasharray="14 10" opacity="${f(c)}"/>`;
      o += `<text x="1300" y="770" font-size="36" text-anchor="middle" fill="${ZHAO}" opacity="${f(c)}" ${KAI}>奇兵三万</text><text x="300" y="640" font-size="34" text-anchor="middle" fill="#7A5A3A" opacity="${f(k)}" ${KAI}>粮草</text>`;
      return o;
    },
    cam: [[800, 460, 1600], [800, 470, 1550]],
  },
  'h.chenyu': {
    bg: (id) => tentIn(id),
    fg: (u, g) => person({ x: 1080, y: 790, s: 1.5, who: 'chenyu', pose: P.mix(P.stand(), { ...P.point(1), aF: 60 + Math.sin(g * 4) * 20 }, seg(u, 0.2, 0.4)), g, face: -1, detail: true, hold: 'scroll' }) +
      person({ x: 560, y: 790, s: 1.4, who: 'lizuoche', pose: P.mix(P.stand(), P.bow(0.4), seg(u, 0.5, 0.8)), g, face: 1, detail: true, mood: 'sad' }),
    cam: [[820, 560, 1300], [860, 560, 1150]],
  },
  'h.scout': {
    bg: (id) => fieldBg(id, { dusk: true }),
    fg: (u, g) => zhaoWall(1180, 700, 0.9, g, 5) + `<path d="M120,900 Q300,700 560,760 Q700,800 760,900 Z" fill="#5A4A3A"/>` + person({ x: 520, y: 770, s: 1.3, who: 'hanSoldier', pose: { ...P.kneelWash(0), aF: 30, eF: 40, aB: 20, eB: 50, lean: 20, head: -8 }, g, face: 1 }),
    cam: [[800, 560, 1500], [700, 620, 1250]],
  },
  'h.hxglad': {
    bg: (id) => sky(id, '#2A2420', '#4A3A2E') + glow(id, 1200, 420, 400, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'hanxin', g, id, brow: 0.4, mouth: seg(u, 0.2, 0.4) > 0.5 ? 0.5 : 0, open: 0.8, nod: seg(u, 0.4, 0.8) * Math.sin(g * 4) * 0.4 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  // ---------- 5 两千骑兵，人持一面红旗 ----------
  'h.redflags': {
    bg: (id) => sky(id, '#1A2030', '#3A4050') + moon(id, 1300, 160, 40, 0.9) + ridge({ y: 320, amp: 220, seed: 124, a: 0.7, color: '#141822', peaks: 3 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#283040"/>`,
    fg: (u, g, id) => {
      let o = '';
      const k = seg(u, 0, 1);
      for (let i = 0; i < 14; i++) { const t = (k * 1.4 - i * 0.06), x = lerp(-100, 1100, Math.max(0, Math.min(1, t))), y = lerp(760, 420, Math.max(0, Math.min(1, t))); if (t < 0) continue; o += horse({ x, y, s: 0.5, g, gait: 'walk', ph: g + i * 0.3, rider: 'hanSoldier', face: 1, riderPose: { ...P.rideRun(0), aF: 150, eF: -10 } }) + banner(x + 10, y - 120, 0.35, g, RED, '', i * 0.2, 0.9); }
      return o + mist(id, 125, g, { y: 600, h: 80, a: 0.4, n: 5 });
    },
    cam: [[800, 500, 1600], [800, 480, 1500]],
  },
  'h.hxorder': {
    bg: (id) => sky(id, '#1A2030', '#3A4050') + moon(id, 1300, 160, 40, 0.9) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#283040"/>`,
    fg: (u, g, id) => torch(id, 800, 560, 1.4, g) + person({ x: 600, y: 800, s: 1.55, who: 'hanxinHan', pose: P.mix(P.stand(), P.point(1), 0.5 + 0.4 * Math.sin(g * 1.6)), g, face: 1, detail: true }) +
      person({ x: 1000, y: 800, s: 1.5, who: 'hanSoldier', pose: P.bow(0.3), g, face: -1, detail: true }) + banner(1120, 560, 0.7, g, RED, '', 0, 0.9),
    cam: [[800, 560, 1300], [800, 560, 1150]],
  },
  'h.snack': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 6; i++) o += person({ x: 300 + i * 200, y: 800, s: 1.3, who: i === 2 ? 'general' : 'hanSoldier', pose: i === 2 ? { ...P.stand(), head: Math.sin(g * 6) * 10 } : { ...P.stand(), aF: 62, eF: lerp(80, 118, (Math.sin(g * 3 + i) + 1) / 2), head: -4 }, g, face: i % 2 ? -1 : 1, hold: i === 2 ? undefined : 'bowl', mood: i === 2 ? 'sneer' : 'calm' });
      return o;
    },
    cam: [[800, 560, 1500], [800, 600, 1300]],
  },
  // ---------- 8 一万人背水列阵；赵军大笑 ----------
  'h.riverline': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g) => {
      let o = sideRiver(g);
      for (let r = 0; r < 4; r++) o += rank(260 + r * 30, 640 + r * 60, 12, 46, 0.6 + r * 0.08, 'hanSoldier', g, 1, () => P.stand(), 'spear');
      o += banner(300, 520, 0.7, g, RED, '汉', 0, 0.95) + zhaoWall(1350, 640, 0.6, g, 4);
      return o;
    },
    cam: [[800, 560, 1600], [700, 600, 1400]],
  },
  'h.laugh': {
    bg: (id) => fieldBg(id, { dawn: true }) + `<rect x="200" y="700" width="1200" height="40" fill="#6E6250" stroke="${INK}" stroke-width="4"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 8; i++) o += person({ x: 260 + i * 150, y: 700, s: 1.2, who: i === 3 ? 'chenyu' : 'zhaoSoldier', pose: P.laugh(g * 0.9 + i * 0.3), g, face: -1, detail: true, mood: 'laugh' });
      return o + `<rect x="200" y="700" width="1200" height="120" fill="#6E6250" stroke="${INK}" stroke-width="4"/>` + Array.from({ length: 30 }, (_, i) => `<rect x="${200 + i * 40}" y="684" width="24" height="18" fill="#6E6250" stroke="${INK}" stroke-width="2"/>`).join('');
    },
    cam: [[800, 560, 1400], [800, 580, 1250]],
  },
  'h.drums': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g) => {
      const k = seg(u, 0, 1), hit = (g * 1.5) % 1;
      let o = drum(lerp(300, 700, k), 790, 1.2, hit) + person({ x: lerp(220, 620, k), y: 800, s: 1.2, who: 'hanSoldier', pose: { ...P.stand(), aF: 90 + Math.sin(g * 9) * 30, eF: 20 }, g, face: 1 });
      o += person({ x: lerp(420, 820, k), y: 800, s: 1.35, who: 'hanxinHan', pose: P.walk(g * 0.8), g, face: 1, detail: true }) + banner(lerp(500, 900, k), 560, 1.1, g, RED, '大将', 0, 0.95);
      return o + rank(lerp(-400, 0, k), 820, 6, 60, 1, 'hanSoldier', g, 1, (i) => P.walk(g + i * 0.2), 'spear');
    },
    cam: [[800, 560, 1600], [900, 600, 1350]],
  },
  'h.clash': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g, id) => {
      let o = '';
      for (let i = 0; i < 7; i++) o += person({ x: 300 + i * 60, y: 780 + (i % 2) * 20, s: 1.1, who: 'hanSoldier', pose: P.mix(P.walk(g * 1.5 + i * 0.2), P.point(1), 0.5 + 0.5 * Math.sin(g * 3 + i)), g, face: 1, hold: 'spear' });
      for (let i = 0; i < 9; i++) o += person({ x: 760 + i * 60, y: 780 + (i % 2) * 20, s: 1.1, who: 'zhaoSoldier', pose: P.mix(P.walk(g * 1.5 + i * 0.2), P.point(1), 0.5 + 0.5 * Math.sin(g * 3 + i + 1)), g, face: -1, hold: 'spear' });
      return o + mist(id, 126, g, { y: 760, h: 100, a: 0.45, n: 7, speed: 30 });
    },
    cam: [[760, 600, 1300], [760, 620, 1200]],
  },
  'h.drop': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g) => {
      const k = seg(u, 0.2, 1), drop = seg(u, 0, 0.25);
      let o = drum(900, 810, 1.1) + `<g transform="rotate(${f(drop * 80)} 980 820)">${banner(980, 600, 1, g, RED, '大将', 0, 0.95)}<line x1="980" y1="600" x2="980" y2="820" stroke="${INK}" stroke-width="8"/></g>`;
      o += person({ x: lerp(1000, 300, k), y: 800, s: 1.35, who: 'hanxinHan', pose: P.walk(g * 1.8, 1.4), g, face: -1, detail: true }) + person({ x: lerp(1120, 420, k), y: 810, s: 1.3, who: 'zhanger', pose: P.walk(g * 1.8 + 0.3, 1.4), g, face: -1, detail: true });
      return o;
    },
    cam: [[760, 600, 1400], [640, 600, 1300]],
  },
  'h.glasses': glassesShot('于是信张耳详弃鼓旗走水上军'),
  // ---------- 13 赵军空壁追击；汉军殊死战 ----------
  'h.chase': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g) => {
      const k = seg(u, 0, 1); let o = zhaoWall(1350, 640, 0.6, g, 4);
      for (let i = 0; i < 18; i++) { const t = Math.max(0, k * 1.3 - i * 0.03); o += person({ x: lerp(1350, 300, Math.min(1, t)) + (i % 3) * 30, y: 720 + (i % 4) * 26, s: 0.8, who: 'zhaoSoldier', pose: P.walk(g * 1.8 + i * 0.2, 1.4), g, face: -1, hold: i % 3 === 0 ? 'spear' : undefined, a: t > 0 ? 1 : 0 }); }
      o += `<g opacity="${f(1 - seg(u, 0.3, 0.6))}">${banner(700, 700, 0.6, g, RED, '大将', 0, 0.95)}</g>`;
      return o;
    },
    cam: [[800, 560, 1600], [700, 600, 1500]],
  },
  'h.fight': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g, id) => {
      let o = sideRiver(g);
      for (let i = 0; i < 8; i++) o += person({ x: 300 + i * 50, y: 780 + (i % 2) * 24, s: 1.1, who: 'hanSoldier', pose: P.mix(P.stand(), P.point(1), 0.5 + 0.5 * Math.sin(g * 4 + i)), g, face: 1, hold: 'spear', mood: 'sneer' });
      for (let i = 0; i < 10; i++) o += person({ x: 760 + i * 70, y: 780 + (i % 2) * 24, s: 1.1, who: 'zhaoSoldier', pose: P.mix(P.walk(g * 1.5 + i * 0.3), P.point(1), 0.5 + 0.5 * Math.sin(g * 4 + i + 1)), g, face: -1, hold: 'spear' });
      return o + mist(id, 127, g, { y: 760, h: 100, a: 0.4, n: 6, speed: 30 });
    },
    cam: [[700, 600, 1400], [640, 620, 1250]],
  },
  'h.swap': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g) => {
      const n = 8, red = Math.round(seg(u, 0.2, 0.9) * n);
      let o = zhaoWall(800, 720, 1.4, g, n, red);
      const k = seg(u, 0, 0.3);
      for (let i = 0; i < 6; i++) o += horse({ x: lerp(-200, 300 + i * 160, k), y: 820, s: 0.8, g, gait: k < 1 ? 'run' : 'stand', ph: g * 1.6 + i * 0.3, rider: 'hanSoldier', face: 1 });
      return o;
    },
    cam: [[800, 520, 1600], [800, 520, 1450]],
  },
  'h.panic': {
    bg: (id) => fieldBg(id, { dawn: true }),
    fg: (u, g) => {
      const turn = seg(u, 0.1, 0.35);
      let o = zhaoWall(1320, 620, 0.7, g, 5, 5);
      for (let i = 0; i < 7; i++) o += person({ x: 200 + i * 130, y: 800, s: 1.3, who: 'zhaoSoldier', pose: turn > 0.5 ? P.mix(P.stand(), P.point(1), i % 2 ? 0.8 : 0) : P.walk(g * 1.5 + i * 0.3), g, face: turn > 0.5 ? 1 : -1, mood: turn > 0.5 ? 'shock' : 'calm', hold: 'spear' });
      return o + (turn > 0.5 ? `<text x="700" y="380" font-size="110" text-anchor="middle" fill="${RED}" opacity="${f(seg(u, 0.35, 0.5))}" ${KAI}>？！</text>` : '');
    },
    cam: [[800, 560, 1600], [800, 580, 1450]],
  },
  'h.rout': {
    bg: (id) => sky(id, '#E9DFC8', '#E3D6BA') + `<rect x="60" y="60" width="1480" height="780" rx="20" fill="#EFE6D0" stroke="#B9A57A" stroke-width="6"/><path d="M60,60 L360,60 Q420,450 320,840 L60,840 Z" fill="#8FA9B8" opacity=".6"/>` + vtext(150, 380, '河', 40, '#4A6A80', 0.8),
    fg: (u, g) => {
      const k = seg(u, 0, 0.8), r = rng(43);
      let o = `<rect x="1150" y="200" width="260" height="180" fill="none" stroke="${RED}" stroke-width="8"/>` + vtext(1400, 220, '赵营', 30, RED, 0.85);
      o += `<path d="M420,450 L${f(lerp(420, 720, k))},450" stroke="${RED}" stroke-width="14" stroke-linecap="round"/><path d="M1260,380 L${f(lerp(1260, 980, k))},${f(lerp(380, 440, k))}" stroke="${RED}" stroke-width="14" stroke-linecap="round"/>`;
      for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = 20 + r() * 70 + k * (80 + r() * 300); o += `<circle cx="${f(840 + Math.cos(a) * d)}" cy="${f(470 + Math.sin(a) * d * 0.6)}" r="10" fill="${ZHAO}" opacity="${f(1 - k * 0.5)}"/>`; }
      return o;
    },
    cam: [[800, 460, 1600], [800, 460, 1550]],
  },
  // ---------- 16 按顺序排（不摆出顺序，只给出地形和各方） ----------
  'h.map': {
    bg: (id) => sky(id, '#E9DFC8', '#E3D6BA') + `<rect x="60" y="60" width="1480" height="780" rx="20" fill="#EFE6D0" stroke="#B9A57A" stroke-width="6"/><path d="M60,60 L360,60 Q420,450 320,840 L60,840 Z" fill="#8FA9B8" opacity=".6"/>` + vtext(150, 380, '河', 40, '#4A6A80', 0.8) +
      `<path d="M500,60 Q760,200 1100,120 L1540,120 L1540,60 Z" fill="#8A7E68" opacity=".5"/>` + vtext(800, 90, '山', 36, INK, 0.7) + `<rect x="1150" y="400" width="260" height="180" fill="none" stroke="${ZHAO}" stroke-width="8"/>` + vtext(1430, 420, '赵营', 30, ZHAO, 0.85) + vtext(700, 640, '井陉口', 32, INK, 0.75),
    fg: (u, g, id) => glow(id, 800, 460, 400, g, 0, 0.1),
    cam: [[800, 450, 1600], [800, 450, 1580]],
  },
  'h.feast': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      let o = glow(id, 800, 500, 300, g, 0, 0.45);
      o += person({ x: 1200, y: 760, s: 1.45, who: 'hanxinHan', pose: P.sitCross(), g, face: -1, detail: true, mood: 'laugh' });
      for (let i = 0; i < 3; i++) o += person({ x: 400 + i * 200, y: 790, s: 1.35, who: i === 1 ? 'zhanger' : 'general', pose: P.mix(P.bow(0.4), P.point(0.8), i === 1 ? 0.5 + 0.4 * Math.sin(g * 1.6) : 0), g, face: 1, detail: true });
      return o;
    },
    cam: [[800, 560, 1400], [820, 560, 1250]],
  },
  'h.hxcu': {
    bg: (id) => sky(id, '#2A2420', '#4A3A2E') + glow(id, 1200, 420, 400, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'hanxin', g, id, brow: -0.2, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0.3, nod: Math.sin(g * 1.3) * 0.25 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'h.market': {
    bg: (id) => sky(id, '#E6DDCB', PAPER) + ridge({ y: 300, amp: 60, seed: 128, a: 0.1 }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#CDBF9F"/>` +
      `<path d="M200,470 L520,470 L540,500 L180,500 Z M1080,470 L1400,470 L1420,500 L1060,500 Z" fill="#7A4A2E"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.3, 0.8); let o = '';
      for (let i = 0; i < 10; i++) { const x = 140 + i * 140; o += person({ x, y: 780 + (i % 2) * 20, s: 1.15, who: k > 0.5 ? 'hanSoldier' : 'crowd' + ((i % 4) + 1), pose: P.walk(g * 0.6 + i * 0.3, 0.6), g, face: i % 2 ? -1 : 1, hold: k > 0.5 ? 'spear' : i % 3 === 0 ? 'basket' : undefined, a: 1 }); }
      return o;
    },
    cam: [[800, 560, 1600], [800, 580, 1400]],
  },
  // ---------- 21 解缚，师事之 ----------
  'h.untie': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.7);
      return glow(id, 800, 520, 260, g, 0, 0.45) + person({ x: 720, y: 790, s: 1.45, who: 'lizuoche', pose: P.mix({ ...P.stand(), aF: -10, eF: 20, aB: 10, eB: 20, head: 14 }, P.stand(), k), g, face: 1, detail: true }) +
        `<path d="M${f(690)},640 h60 M690,660 h60" stroke="#B89A5A" stroke-width="8" opacity="${f(1 - k)}"/><path d="M${f(740 + k * 160)},${f(650 + k * 140)} q30,20 60,10" stroke="#B89A5A" stroke-width="6" fill="none" opacity="${f(k)}"/>` +
        person({ x: 940, y: 790, s: 1.45, who: 'hanxinHan', pose: P.give(0.5 + 0.3 * Math.sin(g * 4) * (1 - k)), g, face: -1, detail: true });
    },
    cam: [[820, 560, 1250], [820, 560, 1150]],
  },
  'h.teacher': {
    bg: (id) => sky(id, '#3A2C24', '#4A3A2E') + `<rect x="420" y="160" width="760" height="600" rx="12" fill="#6A2E26" stroke="${GOLD}" stroke-width="4" opacity=".9"/>` +
      `<text x="800" y="146" font-size="36" text-anchor="middle" fill="#E9DFCB" ${KAI}>北</text><text x="800" y="820" font-size="36" text-anchor="middle" fill="#E9DFCB" ${KAI}>南</text><text x="370" y="472" font-size="36" text-anchor="middle" fill="#E9DFCB" ${KAI}>西</text><text x="1230" y="472" font-size="36" text-anchor="middle" fill="#E9DFCB" ${KAI}>东</text>`,
    fg: (u) => {
      const seat = (k: number, x: number, dx: number, name: string, c: string) => { const a = seg(u, k * 0.3, k * 0.3 + 0.25); if (a <= 0) return ''; return `<g opacity="${f(a)}"><circle cx="${x}" cy="460" r="56" fill="${c}" stroke="#E9DFCB" stroke-width="4"/><text x="${x}" y="472" font-size="30" text-anchor="middle" fill="#F4F1E8" ${KAI}>${name}</text><path d="M${f(x + dx * 66)},460 l${f(dx * 60)},0" stroke="#F4F1E8" stroke-width="6" marker-end="url(#ar5)"/></g>`; };
      return `<defs><marker id="ar5" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#F4F1E8"/></marker></defs>` + seat(0, 520, 1, '李左车', '#5A5A4A') + seat(1, 1080, -1, '韩信', '#3F4A52');
    },
    cam: [[800, 460, 1300], [800, 460, 1250]],
  },
  'h.lzccu': {
    bg: (id) => sky(id, '#2A221E', '#3E302A') + glow(id, 1200, 420, 420, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'lizuoche', g, id, brow: 0.4, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, nod: Math.sin(g * 1.4) * 0.3 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'h.desk': deskShot('这一仗韩信不仅活捉了赵王而且打败了赵军'),
  // ---------- 26 打下齐国；不肯背汉 ----------
  'h.qitent': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => glow(id, 800, 520, 240, g, 0, 0.45) + flame(800, 600, 1.2, g) + `<rect x="786" y="600" width="28" height="40" fill="#8A6A3A"/>` +
      `<rect x="440" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/><rect x="990" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/>` +
      person({ x: 520, y: 700, s: 1.45, who: 'kuaitong', pose: P.mix(P.sitRest(), P.point(0.8), 0.5 + 0.4 * Math.sin(g * 1.6)), g, face: 1, detail: true }) + person({ x: 1080, y: 700, s: 1.45, who: 'king', pose: P.sitRest(), g, face: -1, detail: true }),
    cam: [[800, 540, 1300], [800, 540, 1150]],
  },
  'h.hxrefuse': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636') + glow(id, 1250, 520, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'hanxinKing', g, id, brow: 0.3, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : -0.2, shake: seg(u, 0.1, 0.5) * 0.5 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
};
