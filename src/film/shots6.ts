// 第六回　四面楚歌：每一镜怎么画、怎么动（对照 第六堂课/分镜/第六回_四面楚歌.md）
import { GOLD, INK, PAPER, RED, banner, pin, bareTree, campfire, cityWall, f, flame, glow, lerp, mist, moon, reeds, ridge, river, rng, seg, sky, snow, soundRings, sunDisc, tent, torch, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import type { ShotDef } from './Film';

// ---------------- 共用的背景 ----------------
const nightPlain = (id: string, o: { snowy?: boolean } = {}) =>
  sky(id, '#1C1F2A', '#3A3B44') + moon(id, 1260, 170, 46, 0.9) + ridge({ y: 420, amp: 90, seed: 71, a: 0.6, color: '#15171E' }) + ridge({ y: 500, amp: 50, seed: 73, a: 0.7, color: '#1E2028' }) +
  `<path d="M-200,560 Q800,540 1800,560 L1800,1100 L-200,1100 Z" fill="${o.snowy ? '#5C5E66' : '#2C2D33'}"/>`;
/** 俯瞰的包围圈：中间是楚营，外面一圈一圈汉军火把（stage 0—1 越围越紧） */
const siegeMap = (id: string, u: number, g: number, stage: number) => {
  let o = '';
  const cx = 800, cy = 470;
  // 楚营：中间一小片帐篷
  const r = rng(5);
  for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = 30 + r() * 90; o += tent(cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d * 0.8 + 20, 0.32, '#4A4642', 0.95); }
  o += `<ellipse cx="${cx}" cy="${cy + 10}" rx="190" ry="120" fill="none" stroke="#7A6A50" stroke-width="5" stroke-dasharray="10 8" opacity=".7"/>`;
  o += banner(cx + 10, cy + 10, 0.6, g, '#2B2722', '楚', 0, 0.9);
  // 汉军：几圈火把
  const rings = 4;
  for (let k = 0; k < rings; k++) {
    const show = seg(stage, k / rings, (k + 1) / rings), R = 300 + k * 110, n = 26 + k * 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + k * 0.2, x = cx + Math.cos(a) * R * 1.45, y = cy + Math.sin(a) * R * 0.62;
      if (show > i / n) o += torch(id, x, y, 0.65, g, i * 0.13 + k);
    }
  }
  return o;
};
const tentInside = (id: string) =>
  sky(id, '#2A211C', '#3E3028') + `<path d="M-200,-100 Q800,140 1800,-100 L1800,700 L-200,700 Z" fill="#4A3A2E"/>` +
  Array.from({ length: 9 }, (_, i) => `<path d="M${-100 + i * 220},-60 Q${-60 + i * 220},300 ${-110 + i * 220},700" stroke="#3A2C22" stroke-width="6" fill="none"/>`).join('') +
  `<rect x="790" y="-100" width="22" height="800" fill="#2E241C"/><path d="M-200,680 L1800,680 L1800,1100 L-200,1100 Z" fill="#3A2A20"/><path d="M200,720 L1400,720 L1460,800 L140,800 Z" fill="#6A2E26" opacity=".85"/><path d="M220,730 L1380,730" stroke="${GOLD}" stroke-width="3" opacity=".6"/>`;
const candle = (id: string, x: number, y: number, s: number, g: number) => glow(id, x, y - 40 * s, 260 * s, g, 0, 0.55) + `<rect x="${f(x - 10 * s)}" y="${f(y - 30 * s)}" width="${f(20 * s)}" height="${f(36 * s)}" fill="#E9DFCB"/><rect x="${f(x - 26 * s)}" y="${f(y + 6 * s)}" width="${f(52 * s)}" height="${f(10 * s)}" fill="#8A6A3A"/>` + flame(x, y - 30 * s, 0.9 * s, g);
const wujiangBg = (id: string, dawn = true) =>
  sky(id, dawn ? '#C9B7AE' : '#E6C9A6', dawn ? '#E8DCCB' : '#F0E0C6') + ridge({ y: 400, amp: 60, seed: 81, a: 0.25, color: '#5A5560' }) +
  `<path d="M-200,430 Q800,420 1800,432 L1800,700 L-200,700 Z" fill="#B7BDC2" opacity=".8"/>` + `<path d="M-200,690 Q800,672 1800,694 L1800,1100 L-200,1100 Z" fill="#B9A783"/>`;
const deskBg = (id: string) =>
  sky(id, '#2E2C33', '#4A4540') + `<rect x="900" y="80" width="460" height="420" fill="#1F2230"/>` + moon(id, 1130, 230, 56) +
  Array.from({ length: 7 }, (_, i) => `<line x1="${900 + i * 76}" y1="80" x2="${900 + i * 76}" y2="500" stroke="#5A4630" stroke-width="10"/>`).join('') + `<rect x="900" y="80" width="460" height="420" fill="none" stroke="#5A4630" stroke-width="16"/>` +
  `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#3B3028"/><path d="M120,640 L1480,640 L1540,720 L60,720 Z" fill="#6A4A30"/><path d="M60,720 L1540,720 L1540,760 L60,760 Z" fill="#4E3622"/>`;
const slipsRow = (x: number, y: number, n: number, s: number, chars: string) => `<g transform="translate(${x},${y}) scale(${s})">${Array.from({ length: n }, (_, i) => `<rect x="${i * 34}" y="0" width="28" height="260" rx="4" fill="#D8C08A" stroke="#9C8150" stroke-width="2"/>`).join('')}<path d="M-6,60 H${n * 34} M-6,200 H${n * 34}" stroke="#6E5530" stroke-width="3"/>${[...chars].map((ch, k) => n - 1 - Math.floor(k / 7) < 0 ? '' : `<text x="${(n - 1 - Math.floor(k / 7)) * 34 + 14}" y="${36 + (k % 7) * 31}" font-size="24" text-anchor="middle" fill="${INK}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">${ch}</text>`).join('')}</g>`;
const glassesGlow = (x: number, y: number, s: number, g: number) => `<defs><filter id="gl6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter></defs><g transform="translate(${f(x)},${f(y)}) scale(${s})"><circle r="150" fill="#9FD3F0" opacity="${f(0.25 + 0.1 * Math.sin(g * 2))}" filter="url(#gl6)"/><circle cx="-46" r="38" fill="#CFE6F2" fill-opacity=".55" stroke="#BFE3F7" stroke-width="7"/><circle cx="46" r="38" fill="#CFE6F2" fill-opacity=".55" stroke="#BFE3F7" stroke-width="7"/><path d="M-8,-4 q8,-10 16,0" stroke="#BFE3F7" stroke-width="6" fill="none"/><path d="M-84,-6 l-60,-14 M84,-6 l60,-14" stroke="#BFE3F7" stroke-width="6"/></g>`;

export const SHOTS6: Record<string, ShotDef> = {
  // ---------- 0 冬天，垓下 ----------
  'b.winter': {
    bg: (id) => nightPlain(id, { snowy: true }) + bareTree(3, 260, 600, 1.6, 0.85) + bareTree(4, 1440, 590, 1.2, 0.7),
    fg: (u, g, id, v) => {
      let o = pin(v, 1480 / 1600, 120 / 900, vtext(0, 0, '垓下', 56, '#E9DFCB', 0.8));
      for (let i = 0; i < 7; i++) o += tent(560 + i * 80, 590 + (i % 2) * 14, 0.6, '#4A4642', 0.95);
      o += glow(id, 800, 580, 120, g, 0, 0.4) + flame(800, 600, 1, g);
      return o + reeds(31, g, -100, 1700, 680, 60, 50, '#8C8A84', 0.6) + snow(41, g, 140, 0.8, 50);
    },
    cam: [[800, 470, 1600], [800, 500, 1300]],
  },
  // ---------- 1 团团围住；兵少粮尽 ----------
  'b.siege': {
    bg: (id) => sky(id, '#20232C', '#2E3038') + `<ellipse cx="800" cy="480" rx="1200" ry="560" fill="#3A3B42"/>` + `<ellipse cx="800" cy="480" rx="260" ry="160" fill="#4A4945"/>`,
    fg: (u, g, id) => siegeMap(id, u, g, u) + snow(42, g, 60, 0.5, 30),
    cam: [[800, 470, 1600], [800, 470, 1450]],
  },
  'b.siegeHold': {
    bg: (id) => sky(id, '#20232C', '#2E3038') + `<ellipse cx="800" cy="480" rx="1200" ry="560" fill="#3A3B42"/>` + `<ellipse cx="800" cy="480" rx="260" ry="160" fill="#4A4945"/>`,
    fg: (u, g, id) => siegeMap(id, u, g, 1) + snow(42, g, 60, 0.5, 30),
    cam: [[800, 470, 1450], [800, 470, 1350]],
  },
  'b.camp': {
    bg: (id) => nightPlain(id, { snowy: true }) + tent(300, 600, 1.4, '#3E3A36') + tent(1300, 610, 1.6, '#3E3A36'),
    fg: (u, g, id) => {
      const k = 1 - seg(u, 0, 1) * 0.45;
      let o = campfire(id, 800, 700, 1.4, g, k);
      [[450, 1, P.slump()], [630, 1, { ...P.sitCross(), head: 26, lean: 20 }], [980, -1, P.slump()], [1160, -1, { ...P.sitCross(), head: 30, lean: 24 }]].forEach(([x, fc, pose], i) => { o += person({ x: x as number, y: 720, s: 1.6, who: 'soldier', pose: pose as ReturnType<typeof P.stand>, g, face: fc as 1 | -1, mood: 'sad', detail: true }); void i; });
      o += `<path d="M1180,740 q30,-30 60,0 z" fill="#6E5A40"/><path d="M1190,742 q20,-14 40,0" stroke="${INK}" stroke-width="2" fill="none"/><path d="M420,720 q-10,-40 30,-50 q40,10 30,50 z" fill="#8C7A5A" opacity=".9"/>`; // 破锅、空粮袋
      return o + snow(43, g, 70, 0.6, 30);
    },
    cam: [[800, 560, 1250], [800, 580, 1100]],
  },
  // ---------- 3 夜深，四面楚歌 ----------
  'b.songs': {
    bg: (id) => nightPlain(id),
    fg: (u, g, id, v) => {
      let o = '';
      for (let i = 0; i < 18; i++) { const x = 60 + i * 88, y = 470 - Math.abs(Math.sin(i * 0.7)) * 50; o += torch(id, x, y, 0.8, g, i * 0.2); }
      for (let i = 0; i < 5; i++) o += tent(600 + i * 90, 640, 0.6, '#3A3632');
      const amp = seg(u, 0, 0.5);
      o += soundRings(800, 620, g, { dir: -Math.PI / 2, n: 5, r0: 520, r1: 60, a: 0.55 * amp, c: '#E9DFCB', spread: 1.2, period: 3 });
      o += soundRings(800, 620, g + 0.8, { dir: Math.PI, n: 4, r0: 700, r1: 80, a: 0.5 * amp, c: '#E9DFCB', spread: 0.5, period: 3 });
      o += soundRings(800, 620, g + 1.6, { dir: 0, n: 4, r0: 700, r1: 80, a: 0.5 * amp, c: '#E9DFCB', spread: 0.5, period: 3 });
      return o + pin(v, 1480 / 1600, 120 / 900, vtext(0, 0, '楚歌', 54, '#E9DFCB', 0.5 * amp));
    },
    cam: [[800, 470, 1600], [800, 520, 1400]],
  },
  'b.wake': {
    bg: (id) => nightPlain(id) + tent(400, 650, 2, '#3A3632'),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.5);
      let o = campfire(id, 760, 740, 1.2, g, 0.6);
      [[560, 1], [900, -1], [1120, -1]].forEach(([x, fc], i) => { o += person({ x, y: 740, s: 2, who: 'soldier', pose: P.mix(P.slump(), { ...P.sitCross(), head: -26, lean: -6 }, k), g, face: fc as 1 | -1, mood: k > 0.5 ? (i === 2 ? 'sad' : 'shock') : 'calm', detail: true }); });
      o += soundRings(800, 700, g, { dir: -Math.PI / 2, n: 4, r0: 600, r1: 200, a: 0.35 * k, c: '#E9DFCB', spread: 1.3, period: 3 });
      return o;
    },
    cam: [[820, 560, 1200], [820, 560, 1080]],
  },
  'b.xyface': {
    bg: (id) => nightPlain(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#000" opacity=".25"/>`,
    fg: (u, g, id) => glow(id, 1300, 760, 360, g, 0, 0.35) + faceCU({ id, x: 760, y: 450, s: 1.25, who: 'xiangyu', g, open: lerp(0.8, 1.15, seg(u, 0, 0.4)), brow: lerp(0, -0.8, seg(u, 0, 0.4)), mouth: -0.3, look: wav(g, 3) }) + soundRings(800, 450, g, { dir: 0, n: 3, r0: 900, r1: 400, a: 0.25, c: '#E9DFCB', spread: 0.6, period: 3 }),
    cam: [[800, 470, 1200], [800, 450, 1050]],
  },
  'b.siegeSong': {
    bg: (id) => sky(id, '#20232C', '#2E3038') + `<ellipse cx="800" cy="480" rx="1200" ry="560" fill="#3A3B42"/>` + `<ellipse cx="800" cy="480" rx="260" ry="160" fill="#4A4945"/>`,
    fg: (u, g, id) => siegeMap(id, u, g, 1) + [0, 1.57, 3.14, 4.71].map((d, i) => soundRings(800, 480, g + i * 0.7, { dir: d, n: 4, r0: 700, r1: 180, a: 0.45, c: '#E9DFCB', spread: 0.6, period: 3 })).join(''),
    cam: [[800, 470, 1500], [800, 470, 1350]],
  },
  // ---------- 7 帐中饮酒、虞姬、乌骓 ----------
  'b.tentDrink': {
    bg: (id) => tentInside(id),
    fg: (u, g, id) => candle(id, 1000, 690, 1.3, g) + person({ x: 700, y: 720, s: 2.3, who: 'xiangyu', pose: P.drink(Math.abs(Math.sin(u * Math.PI))), g, face: 1, hold: 'cup', detail: true, mood: 'sad' }),
    cam: [[820, 480, 1300], [800, 470, 1150]],
  },
  'b.yuji': {
    bg: (id) => tentInside(id),
    fg: (u, g, id) => candle(id, 560, 690, 1.3, g) + person({ x: 900, y: 720, s: 2.3, who: 'yuji', pose: { ...P.sitCross(), head: lerp(20, 4, seg(u, 0.3, 0.8)), aF: 40, eF: 70, aB: 30, eB: 80 }, g, face: -1, detail: true, mood: 'sad' }),
    cam: [[800, 470, 1200], [820, 460, 1080]],
  },
  'b.horse': {
    bg: (id) => nightPlain(id, { snowy: true }) + `<path d="M-200,180 L700,520 L700,1100 L-200,1100 Z" fill="#3E3028"/>` + `<rect x="1180" y="480" width="16" height="230" fill="#5A4630"/>`,
    fg: (u, g, id) => glow(id, 300, 600, 360, g, 0, 0.35) + horse({ x: 900, y: 730, s: 2.3, g, gait: 'paw', face: 1 }) + `<path d="M1188,560 Q1120,600 1090,640" stroke="#3A2A1E" stroke-width="3" fill="none"/>` + snow(44, g, 80, 0.7, 40),
    cam: [[880, 520, 1250], [900, 520, 1100]],
  },
  // ---------- 8 悲歌慷慨 ----------
  'b.rise': {
    bg: (id) => tentInside(id),
    fg: (u, g, id) => {
      const up = seg(u, 0, 0.5);
      const pose = up < 1 ? P.mix(P.drink(0.4), { ...P.stand(), aF: 110, eF: 30 }, up) : { ...P.stand(), aF: 110 + 6 * Math.sin(g), eF: 30, head: -10 };
      return candle(id, 1100, 690, 1.3, g) + person({ x: 720, y: 720, s: 2.6, who: 'xiangyu', pose, g, face: 1, hold: 'cup', detail: true, mood: 'sad' });
    },
    cam: [[800, 430, 1150], [780, 400, 1000]],
  },
  // ---------- 9 垓下歌 ----------
  'b.sing': {
    bg: (id) => tentInside(id),
    fg: (u, g, id) => candle(id, 1150, 690, 1.4, g) + glow(id, 700, 400, 360, g, 0.3, 0.3) + person({ x: 700, y: 720, s: 2.6, who: 'xiangyu', pose: P.sing(g * 0.3), g, face: 1, detail: true, mood: 'sad' }) + person({ x: 1300, y: 720, s: 2.1, who: 'yuji', pose: { ...P.sitCross(), head: 16 }, g, face: -1, detail: true, mood: 'sad' }),
    cam: [[880, 430, 1300], [860, 420, 1200]],
  },
  'b.hoof': {
    bg: (id) => nightPlain(id, { snowy: true }) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#000" opacity=".2"/>`,
    // 乌骓的头和眼睛：低着头，不肯往前走
    fg: (u, g) => horse({ x: 420, y: 1420, s: 5, g, gait: 'stand', head: lerp(-6, 16, seg(u, 0.1, 0.8)) + Math.sin(g * 0.8) * 2, face: 1 }) + snow(45, g, 60, 0.8, 30),
    cam: [[1060, 520, 1250], [1120, 560, 1050]],
  },
  'b.yjface': {
    bg: (id) => tentInside(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#000" opacity=".25"/>`,
    fg: (u, g, id) => glow(id, 300, 700, 400, g, 0, 0.4) + faceCU({ id, x: 820, y: 450, s: 1.2, face: -1, who: 'yuji', g, open: lerp(0.8, 0.5, seg(u, 0.2, 0.9)), brow: 0.7, mouth: -0.2, look: -0.4 }),
    cam: [[800, 470, 1150], [800, 460, 1000]],
  },
  // ---------- 10 虞姬和歌、泪、左右皆泣 ----------
  'b.dance': {
    bg: (id) => tentInside(id),
    fg: (u, g, id) => {
      const ph = u * 1.6, x = 900 + Math.sin(ph * 3.14) * 60;
      const sleeve = (k: number) => { const t = g * 1.2 + k; return `<path d="M${f(x - 20)},${f(470 + Math.sin(t) * 30)} Q${f(x - 160 - Math.cos(t) * 60)},${f(380 + Math.sin(t * 1.3) * 60)} ${f(x - 260)},${f(500 + Math.sin(t) * 80)}" stroke="#F1E6D8" stroke-width="18" fill="none" stroke-linecap="round" opacity=".85"/>`; };
      return candle(id, 380, 690, 1.3, g) + sleeve(0) + sleeve(2.4) + person({ x, y: 720, s: 2.4, who: 'yuji', pose: P.dance(ph), g, face: Math.sin(ph * 3.14) > 0 ? 1 : -1, detail: true, mood: 'sad' }) + person({ x: 1350, y: 720, s: 2.2, who: 'xiangyu', pose: { ...P.sitCross(), head: 10 }, g, face: -1, detail: true, mood: 'sad' });
    },
    cam: [[900, 440, 1300], [880, 440, 1200]],
  },
  'b.tear': {
    bg: (id) => tentInside(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#000" opacity=".3"/>`,
    fg: (u, g, id) => glow(id, 1200, 700, 380, g, 0, 0.45) + faceCU({ id, x: 760, y: 450, s: 1.3, who: 'xiangyu', g, open: 0.55, brow: 0.6, mouth: -0.5, tear: seg(u, 0.15, 0.95) }),
    cam: [[800, 470, 1100], [780, 470, 950]],
  },
  'b.mourn': {
    bg: (id) => tentInside(id),
    fg: (u, g, id) => {
      let o = candle(id, 800, 690, 1.2, g);
      [300, 520, 1080, 1300].forEach((x, i) => { const sob = Math.max(0, Math.sin(g * 3 + i)) * 4; o += person({ x, y: 720 + sob * 0.3, s: 1.9, who: 'soldier', pose: { ...P.weep(), lean: 14 + sob }, g, face: x < 800 ? 1 : -1, mood: 'sad', detail: true }); });
      return o;
    },
    cam: [[800, 470, 1500], [800, 480, 1350]],
  },
  'b.duo': {
    bg: (id) => tentInside(id),
    fg: (u, g, id) => candle(id, 800, 690, 1.3, g) + person({ x: 560, y: 720, s: 2.3, who: 'xiangyu', pose: { ...P.sitCross(), head: 18 }, g, face: 1, detail: true, mood: 'sad' }) + person({ x: 1040, y: 720, s: 2.2, who: 'yuji', pose: { ...P.sitCross(), head: 14 }, g, face: -1, detail: true, mood: 'sad' }),
    cam: [[800, 470, 1250], [800, 470, 1180]],
  },
  // ---------- 12 突围、乌江边 ----------
  'b.breakout': {
    bg: (id) => sky(id, '#1E2430', '#3E4452') + ridge({ y: 440, amp: 70, seed: 91, a: 0.6, color: '#161A22' }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#2E323A"/>`,
    fg: (u, g, id) => {
      let o = '';
      for (let i = 0; i < 16; i++) o += torch(id, 60 + i * 100, 560 + (i % 2) * 20, 1, g, i * 0.2);
      const off = lerp(-900, 1300, u);
      for (let i = 0; i < 7; i++) { const x = off + (i % 4) * 150 - Math.floor(i / 4) * 80, y = 760 + (i % 2) * 40; o += `<ellipse cx="${f(x - 120)}" cy="${f(y)}" rx="140" ry="18" fill="#8C8070" opacity=".25"/>` + horse({ x, y, s: 1.2, g, gait: 'run', ph: g * 1.8 + i * 0.27, rider: i === 0 ? 'xiangyu' : 'soldier', face: 1 }); }
      return o;
    },
    cam: [[800, 560, 1600], [800, 580, 1500]],
  },
  'b.riverbank': {
    bg: (id) => wujiangBg(id),
    fg: (u, g, id) => {
      let o = river(51, g, { y0: 440, y1: 690, n: 80, speed: 22, a: 0.3 }) + mist(id, 52, g, { y: 450, h: 60, a: 0.6 });
      for (let i = 0; i < 8; i++) o += horse({ x: 360 + i * 130 + (i % 2) * 20, y: 700 + (i % 3) * 18, s: 0.8, g, gait: 'stand', head: 10 + Math.sin(g + i) * 3, rider: i === 3 ? 'xiangyu' : 'soldier', riderPose: { ...P.sit(), lF: 80, kF: 70, aF: 40, eF: 20, head: 14 }, face: 1 });
      return o + reeds(53, g, -100, 1700, 780, 70, 160, '#5A5040', 0.75);
    },
    cam: [[800, 520, 1600], [820, 540, 1450]],
  },
  // ---------- 13、14 乌江亭长 ----------
  'b.boat': {
    bg: (id) => wujiangBg(id),
    fg: (u, g, id) => {
      const bx = lerp(1250, 1050, seg(u, 0, 0.6)), bob = Math.sin(g * 1.3) * 5;
      const boatS = `<g transform="translate(${f(bx)},${f(650 + bob)})"><path d="M-180,0 Q0,40 180,0 Q160,30 0,34 Q-160,30 -180,0 Z" fill="#4A3A2C" stroke="${INK}" stroke-width="3"/><path d="M-150,4 Q0,26 150,4" stroke="#6E5A40" stroke-width="4" fill="none"/></g>`;
      return river(54, g, { y0: 440, y1: 690, n: 80, speed: 20, a: 0.3 }) + mist(id, 55, g, { y: 460, h: 60, a: 0.5 }) + boatS + person({ x: bx + 60, y: 652 + bob, s: 1.9, who: 'tingzhang', pose: { ...P.stand(), aF: lerp(10, 140, seg(u, 0.5, 0.7)) + (u > 0.7 ? Math.sin(g * 6) * 14 : 0), eF: 10 }, g, face: -1, hold: 'punt', detail: true }) +
        person({ x: 420, y: 740, s: 2.1, who: 'xiangyu', pose: P.stand(), g, face: 1, detail: true, mood: 'sad' }) + reeds(56, g, -100, 600, 790, 30, 140, '#5A5040', 0.7);
    },
    cam: [[820, 500, 1450], [800, 520, 1300]],
  },
  'b.xylook': {
    bg: (id) => wujiangBg(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="${PAPER}" opacity=".25"/>`,
    fg: (u, g, id) => river(57, g, { y0: 440, y1: 690, n: 50, speed: 20, a: 0.25 }) + faceCU({ id, x: 560, y: 470, s: 1.2, who: 'xiangyu', g, open: 0.7, brow: 0.3, mouth: 0.2, look: 1 }) + mist(id, 58, g, { y: 420, h: 80, a: 0.4 }),
    cam: [[800, 470, 1250], [820, 460, 1100]],
  },
  // ---------- 16 赠马、转身、残阳 ----------
  'b.reins': {
    bg: (id) => wujiangBg(id, false),
    fg: (u, g, id) => {
      const give = seg(u, 0.1, 0.5), turn = seg(u, 0.5, 0.9);
      return river(59, g, { y0: 440, y1: 690, n: 60, speed: 18, a: 0.25 }) + horse({ x: 820, y: 740, s: 1.9, g, gait: 'stand', head: lerp(0, -30, turn), face: 1 }) +
        person({ x: 520, y: 740, s: 2.1, who: 'xiangyu', pose: P.mix(P.stand(), P.give(1), give), g, face: 1, hold: 'reins', detail: true, mood: 'sad' }) + person({ x: 1180, y: 740, s: 2, who: 'tingzhang', pose: P.mix(P.stand(), P.give(0.8), give), g, face: -1, detail: true, mood: 'sad' });
    },
    cam: [[820, 480, 1350], [840, 480, 1250]],
  },
  'b.alone': {
    bg: (id) => sky(id, '#D7B49A', '#EAD3B8') + ridge({ y: 420, amp: 60, seed: 93, a: 0.3, color: '#6A4A40' }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#B49A78"/>`,
    fg: (u, g) => {
      let o = '';
      const front = lerp(1700, 1250, u);
      for (let i = 0; i < 14; i++) { const x = front + (i % 7) * 60, y = 600 + Math.floor(i / 7) * 50; o += banner(x, y, 1, g, '#2F4A5A', i % 4 === 0 ? '汉' : '', i * 0.1) + person({ x: x + 10, y: y + 6, s: 1, who: 'hanSoldier', pose: P.walk(g + i * 0.2), g, face: -1, hold: 'spear' }); }
      return o + person({ x: lerp(500, 820, u), y: 700, s: 1.9, who: 'xiangyu', pose: P.walk(g * 0.7), g, face: 1, detail: true });
    },
    cam: [[800, 480, 1600], [880, 480, 1450]],
  },
  'b.sword': {
    bg: (id) => sky(id, '#C77A55', '#E8C29A'),
    fg: (u, g, id) => {
      const sy = lerp(330, 470, u);
      return sunDisc(id, 1100, sy, 80, '#B83A24', 1) + ridge({ y: 470, amp: 50, seed: 95, a: 0.5, color: '#5A3A30' }) + `<path d="M-200,480 L1800,480 L1800,700 L-200,700 Z" fill="#9C6A55" opacity=".8"/>` + river(61, g, { y0: 490, y1: 690, n: 70, speed: 14, a: 0.3, c: '#5A2A20' }) +
        `<path d="M-200,690 Q800,672 1800,694 L1800,1100 L-200,1100 Z" fill="#7A5A44"/>` + `<g transform="translate(560,760) rotate(8)"><path d="M0,0 L0,-260" stroke="#8C8C8C" stroke-width="10"/><rect x="-30" y="-270" width="60" height="12" fill="${GOLD}"/><rect x="-7" y="-330" width="14" height="60" fill="#3A2A1E"/></g>` + reeds(62, g, -100, 1700, 800, 50, 150, '#3E2E26', 0.7);
    },
    cam: [[800, 500, 1600], [800, 500, 1500]],
  },
  // ---------- 17、18 千年以后，三位诗人 ----------
  'b.pavilion': {
    bg: (id) => wujiangBg(id, false),
    fg: (u, g, id) => {
      const season = u * 3; // 0 秋 1 冬 2 春
      const leaf = Math.max(0, 1 - Math.abs(season - 0.3) * 1.5), snowy = Math.max(0, 1 - Math.abs(season - 1.4) * 1.4), spring = seg(u, 0.7, 1);
      let o = river(63, g, { y0: 440, y1: 690, n: 60, speed: 18, a: 0.25 });
      o += `<g transform="translate(980,700)"><path d="M-170,-170 Q0,-230 170,-170 L150,-160 Q0,-206 -150,-160 Z" fill="${INK}"/><rect x="-120" y="-160" width="14" height="160" fill="#5A4630"/><rect x="106" y="-160" width="14" height="160" fill="#5A4630"/><rect x="-140" y="-10" width="280" height="14" fill="#7A6A54"/></g>`;
      o += vtext(1180, 520, '乌江亭', 30, INK, 0.6);
      o += bareTree(7, 560, 700, 1.4, 0.85, g);
      const r = rng(8); for (let i = 0; i < 26; i++) o += `<circle cx="${f(500 + r() * 140)}" cy="${f(470 + r() * 90)}" r="${f(6 + r() * 6)}" fill="${spring > 0 ? '#E0A0A0' : '#C8742E'}" opacity="${f(Math.max(leaf, spring))}"/>`;
      for (let i = 0; i < 8; i++) { const k = (g * 0.3 + i / 8) % 1; o += `<circle cx="${f(520 + i * 30 + k * 200)}" cy="${f(520 + k * 200)}" r="6" fill="#C8742E" opacity="${f(leaf * (1 - k))}"/>`; }
      o += `<g opacity="${f(snowy)}">${snow(64, g, 120, 0.9, 40)}<path d="M-200,690 Q800,672 1800,694 L1800,720 Q800,700 -200,716 Z" fill="#fff" opacity=".7"/></g>`;
      return o;
    },
    cam: [[800, 500, 1600], [820, 520, 1450]],
  },
  'b.poets': {
    bg: (id) => wujiangBg(id, false) + `<g transform="translate(800,700)"><path d="M-480,-420 Q0,-500 480,-420 L450,-404 Q0,-470 -450,-404 Z" fill="${INK}"/><rect x="-440" y="-404" width="22" height="404" fill="#5A4630"/><rect x="418" y="-404" width="22" height="404" fill="#5A4630"/></g>`,
    fg: (u, g) => {
      // 三个人各写一幅挂轴：人站在左边，自己那幅挂轴在右手边，下面署名——哪句是谁写的，一眼看得出
      const who = ['poetTang', 'poetSong', 'poetLi'], xs = [470, 720, 970], names = ['杜牧', '王安石', '李清照'];
      const lines = ['卷土重来未可知', '肯与君王卷土来', '不肯过江东'];
      let o = '';
      xs.forEach((x, i) => {
        const a = seg(u, i * 0.25, i * 0.25 + 0.2), sx = x + 150, w = seg(u, i * 0.25 + 0.15, i * 0.25 + 0.3); // 挂轴离人远一点：写字的手只碰到纸边，不挡字
        o += `<g opacity="${f(a)}"><line x1="${sx}" y1="290" x2="${sx}" y2="336" stroke="${INK}" stroke-width="2"/><rect x="${sx - 42}" y="336" width="84" height="8" rx="3" fill="#6A4E30"/><rect x="${sx - 36}" y="344" width="72" height="300" fill="#F3E9D0" stroke="#B89A6A" stroke-width="2"/><rect x="${sx - 42}" y="644" width="84" height="8" rx="3" fill="#6A4E30"/>` +
          `<text x="${sx}" y="370" font-size="34" fill="${INK}" opacity="${f(w)}" writing-mode="tb" letter-spacing="2" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">${lines[i]}</text>` +
          `<text x="${sx}" y="692" font-size="30" font-weight="700" fill="#3A2E22" text-anchor="middle" opacity="${f(w)}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">${names[i]}</text></g>`;
        if (a > 0) o += person({ x, y: 712, s: 1.8, who: who[i], pose: P.write(g + i), g, face: 1, hold: 'brush', a, detail: true });
      });
      return o;
    },
    cam: [[800, 470, 1300], [800, 480, 1200]],
  },
  'b.poetsHold': {
    bg: (id) => wujiangBg(id, false),
    fg: (u, g) => [['poetTang', 520, '杜牧'], ['poetSong', 800, '王安石'], ['poetLi', 1080, '李清照']].map(([w, x, n], i) => person({ x: x as unknown as number, y: 712, s: 2, who: w as string, pose: { ...P.stand(), head: 6 * Math.sin(g + i), aF: 20, eF: 40 }, g, face: i === 2 ? -1 : 1, detail: true }) + `<text x="${x}" y="800" font-size="38" text-anchor="middle" fill="${INK}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">${n}</text>`).join(''),
    cam: [[800, 520, 1300], [800, 520, 1250]],
  },
  // ---------- 19、20 书案 ----------
  'b.desk': {
    bg: (id) => deskBg(id) + slipsRow(520, 470, 16, 0.62, '项羽被围在垓下夜里四面传来楚歌他在帐中悲歌慷慨'),
    fg: (u, g, id) => glow(id, 1280, 560, 140, g) + flame(1280, 600, 1.6, g) + `<rect x="1262" y="600" width="36" height="40" fill="#8A6A3A"/>` + glassesGlow(820, lerp(410, 390, (Math.sin(g * 1.4) + 1) / 2), 0.8, g),
    cam: [[800, 520, 1300], [820, 520, 1150]],
  },
  // ---------- 21 刘邦称帝；韩信在城头 ----------
  'b.palace': {
    bg: (id) => sky(id, '#E6D2B0', PAPER) + `<path d="M260,420 L1340,420 L1420,470 L180,470 Z" fill="#3E3934"/><rect x="300" y="470" width="1000" height="160" fill="#8A3A2E"/>` + Array.from({ length: 9 }, (_, i) => `<rect x="${330 + i * 118}" y="470" width="20" height="160" fill="#5A1E18"/>`).join('') + `<path d="M180,420 Q800,300 1420,420" stroke="#2B2722" stroke-width="16" fill="none"/><path d="M200,630 L1400,630 L1500,700 L100,700 Z" fill="#B9A783"/>` + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#CDBF9F"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 10; i++) o += banner(120 + i * 150, 700, 1.1, g, i % 2 ? RED : GOLD, '', i * 0.1);
      for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) o += person({ x: 260 + i * 130 + r * 40, y: 800 + r * 50, s: 1.1, who: i % 3 === 0 ? 'crowd2' : 'crowd1', pose: P.bow(Math.min(1, seg(u, 0.1, 0.5) * 1.2)), g, face: 1 });
      return o + person({ x: 800, y: 640, s: 1.1, who: 'liubang', pose: P.stand(), g, face: 1 });
    },
    cam: [[800, 520, 1600], [800, 540, 1450]],
  },
  'b.hxwall': {
    bg: (id) => sky(id, '#B9B4AA', '#E3DDD0') + ridge({ y: 520, amp: 90, seed: 97, a: 0.3 }) + mist('x', 1, 0, { y: 600, h: 100 }) + `<rect x="-200" y="640" width="2000" height="500" fill="#7C7266"/>` + Array.from({ length: 50 }, (_, i) => `<rect x="${-200 + i * 44}" y="606" width="28" height="34" fill="#7C7266"/>`).join(''),
    fg: (u, g, id) => mist(id, 98, g, { y: 560, h: 90, a: 0.6 }) + person({ x: 760, y: 640, s: 2.4, who: 'general', pose: { ...P.stand(), head: lerp(-4, 18, seg(u, 0.4, 0.8)), aF: 6, eF: 20 }, g, face: lerp(1, -1, seg(u, 0.5, 0.52)) > 0 ? 1 : -1, detail: true }) + banner(1100, 640, 1.6, g, RED, '汉'),
    cam: [[800, 470, 1300], [780, 460, 1150]],
  },
};
