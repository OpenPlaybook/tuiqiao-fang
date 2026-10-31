// 第四回　国士无双：每一镜怎么画、怎么动（对照 第六堂课/分镜/第四回_国士无双.md）
import { GOLD, INK, PAPER, RED, banner, f, flame, glow, lerp, mist, moon, ridge, rng, seg, sky, tent, torch, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import { dais, deskShot, glassesShot, tentIn } from './shots2';
import type { ShotDef } from './Film';

const KAI = `style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif"`;
/** 秦岭的悬崖：左边一面绝壁，壁上一条栈道 */
const cliffBg = (id: string, dusk = false) =>
  sky(id, dusk ? '#8C7A6A' : '#C9C4B6', dusk ? '#C9B79C' : '#E6E0D2') + ridge({ y: 300, amp: 200, seed: 101, a: 0.5, color: '#6A6458', peaks: 3 }) +
  `<path d="M-200,-100 L520,-100 Q600,300 560,520 Q520,760 640,1100 L-200,1100 Z" fill="#5A5248"/><path d="M520,-100 Q600,300 560,520 Q520,760 640,1100" stroke="${INK}" stroke-opacity=".4" stroke-width="4" fill="none"/>` +
  mist(id, 102, 0, { y: 760, h: 140, a: 0.55, n: 8 });
/** 栈道：一根根木桩插进崖壁，上面铺木板（broken 0—1 断掉的比例） */
const plankRoad = (y0: number, x0: number, x1: number, broken = 0) => {
  let o = '';
  const n = Math.floor((x1 - x0) / 46);
  for (let i = 0; i < n; i++) { const x = x0 + i * 46, y = y0 + (x - x0) * 0.18; if (i / n < broken) continue; o += `<line x1="${x + 10}" y1="${f(y + 8)}" x2="${x - 20}" y2="${f(y + 60)}" stroke="#4A3A2A" stroke-width="6"/><rect x="${x}" y="${f(y)}" width="42" height="10" fill="#8A6A44" stroke="${INK}" stroke-width="1.5"/>`; }
  return o;
};
/** 汉中的营地（白天） */
const hanCamp = (id: string) => sky(id, '#D3CDBE', PAPER) + ridge({ y: 330, amp: 160, seed: 103, a: 0.35, color: '#6A6458', peaks: 4 }) + ridge({ y: 420, amp: 80, seed: 104, a: 0.3 }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#B9A988"/>` + tent(220, 600, 0.9, '#7A3A30') + tent(1380, 600, 1, '#7A3A30');
/** 刘邦的大帐里 */
const hanTent = (id: string) => tentIn(id, true) + `<rect x="-200" y="-100" width="2000" height="1200" fill="#7A2A22" opacity=".08"/>`;
/** 拜将的高台：三层 */
const altar = (x: number, y: number, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-420,0 L420,0 L380,-90 L-380,-90 Z" fill="#9A8A6A" stroke="${INK}" stroke-width="4"/><path d="M-320,-90 L320,-90 L290,-170 L-290,-170 Z" fill="#AA9A78" stroke="${INK}" stroke-width="4"/><path d="M-220,-170 L220,-170 L200,-240 L-200,-240 Z" fill="#BAAA86" stroke="${INK}" stroke-width="4"/><path d="M-40,0 L40,0 L30,-240 L-30,-240 Z" fill="#8A7A5A" opacity=".8"/>${Array.from({ length: 9 }, (_, i) => `<line x1="-36" y1="${-i * 27}" x2="36" y2="${-i * 27}" stroke="${INK}" stroke-opacity=".4"/>`).join('')}</g>`;
/** 一方印（corner 0 方 — 1 磨圆） */
const seal = (x: number, y: number, s: number, corner: number, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><rect x="-60" y="-60" width="120" height="120" rx="${f(4 + corner * 40)}" fill="${GOLD}" stroke="#7A5A1E" stroke-width="5"/><rect x="-20" y="-110" width="40" height="54" rx="${f(4 + corner * 12)}" fill="${GOLD}" stroke="#7A5A1E" stroke-width="4"/><text x="0" y="22" font-size="56" text-anchor="middle" fill="#7A2A22" ${KAI}>印</text></g>`;

export const SHOTS4: Record<string, ShotDef> = {
  // ---------- 0 韩信翻山到汉中，当了连敖 ----------
  'g.mountain': {
    bg: (id) => cliffBg(id),
    fg: (u, g, id) => {
      const k = seg(u, 0, 1), x = lerp(100, 470, k), y = 400 + (x - 80) * 0.18;
      return plankRoad(400, 60, 530) + person({ x, y: y - 2, s: 0.7, who: 'hanxin', pose: P.walk(g * 0.9), g, face: 1 }) + mist(id, 105, g, { y: 520, h: 120, a: 0.5, n: 7, speed: 14 });
    },
    cam: [[600, 460, 1500], [500, 460, 1200]],
  },
  'g.post': {
    bg: (id) => hanTent(id),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.6);
      return glow(id, 800, 520, 240, g, 0, 0.35) +
        person({ x: lerp(1500, 1040, k), y: 770, s: 1.3, who: 'crowd2', pose: k < 1 ? P.walk(g) : P.bow(0.3), g, face: -1 }) + person({ x: lerp(1620, 1180, k), y: 770, s: 1.3, who: 'crowd1', pose: k < 1 ? P.walk(g + 0.4) : P.stand(), g, face: -1 }) +
        person({ x: 700, y: 770, s: 1.35, who: 'hanxinHan', pose: P.bow(seg(u, 0.55, 0.8) * 0.5), g, face: 1, detail: true });
    },
    cam: [[900, 560, 1400], [880, 580, 1200]],
  },
  // ---------- 1 坐法当斩，十三人已斩 ----------
  'g.exec': {
    bg: (id) => sky(id, '#9A9488', '#C9C2B2') + ridge({ y: 380, amp: 60, seed: 106, a: 0.3 }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#9C907A"/>`,
    fg: (u, g) => {
      let o = banner(1440, 460, 0.8, g, RED, '汉', 0, 0.9) + person({ x: 1320, y: 760, s: 1.3, who: 'qinguan', pose: P.mix(P.stand(), P.point(0.6), 0.3), g, face: -1, hold: 'scroll' });
      const gone = seg(u, 0, 0.9) * 13;
      for (let i = 0; i < 14; i++) { const a = i === 13 ? 1 : 1 - Math.min(1, Math.max(0, gone - i)); if (a <= 0.02) continue; o += person({ x: 160 + i * 74, y: 800, s: 0.95, who: i === 13 ? 'hanxin' : 'crowd' + ((i % 4) + 1), pose: { ...P.kneelWash(0), aF: 10, eF: 10, aB: 10, eB: 10, head: 22, lean: 30 }, g, face: 1, a }); }
      return o;
    },
    cam: [[800, 600, 1600], [1100, 660, 1100]],
  },
  'g.lookup': {
    bg: (id) => sky(id, '#9A9488', '#C9C2B2') + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#9C907A"/>`,
    fg: (u, g) => {
      const up = seg(u, 0.1, 0.5), k = seg(u, 0, 0.7);
      return horse({ x: lerp(1600, 1150, k), y: 760, s: 1.2, g, gait: k < 1 ? 'walk' : 'stand', ph: g, rider: 'tenggong', face: -1, riderPose: { ...P.rideRun(0), lean: 0, head: 10 } }) +
        person({ x: 520, y: 840, s: 1.6, who: 'hanxin', pose: { ...P.kneelWash(0), aF: 10, eF: 10, aB: 10, eB: 10, lean: lerp(30, 4, up), head: lerp(24, -26, up) }, g, face: 1, detail: true });
    },
    cam: [[900, 580, 1400], [900, 580, 1250]],
  },
  'g.hxshout': {
    bg: (id) => sky(id, '#7A7468', '#A69E8C') + glow(id, 1200, 400, 400, 0, 0, 0.4),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'hanxin', g, id, brow: -0.9, mouth: 0.55, open: 1.1, shake: 0.25 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'g.release': {
    bg: (id) => sky(id, '#9A9488', '#C9C2B2') + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#9C907A"/>`,
    fg: (u, g) => {
      const st = seg(u, 0.35, 0.8);
      return person({ x: 1120, y: 790, s: 1.45, who: 'tenggong', pose: P.mix(P.stand(), P.point(1), seg(u, 0, 0.3)), g, face: -1, detail: true }) +
        person({ x: 640, y: 800, s: 1.4, who: 'hanSoldier', pose: P.mix(P.bow(0.4), P.stand(), st), g, face: 1 }) +
        person({ x: 760, y: 800, s: 1.5, who: 'hanxin', pose: P.mix({ ...P.kneelWash(0), aF: 10, eF: 10, aB: 10, eB: 10, lean: 8, head: -10 }, P.stand(), st), g, face: 1, detail: true });
    },
    cam: [[880, 580, 1300], [880, 580, 1150]],
  },
  'g.talk': {
    bg: (id) => hanTent(id),
    fg: (u, g, id) => glow(id, 800, 520, 220, g, 0, 0.45) + flame(800, 600, 1.2, g) + `<rect x="786" y="600" width="28" height="40" fill="#8A6A3A"/>` +
      `<rect x="440" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/><rect x="990" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/>` +
      person({ x: 520, y: 700, s: 1.45, who: 'hanxinHan', pose: P.mix(P.sitRest(), P.point(0.6), 0.3 + 0.3 * Math.sin(g * 1.3)), g, face: 1, detail: true }) +
      person({ x: 1080, y: 700, s: 1.45, who: 'tenggong', pose: { ...P.sitRest(), head: Math.sin(g * 2.4) * 6 }, g, face: -1, detail: true, mood: seg(u, 0.4, 0.6) > 0.5 ? 'laugh' : 'calm' }),
    cam: [[800, 560, 1300], [800, 560, 1150]],
  },
  'g.xiaohe': {
    bg: (id) => hanTent(id) + `<rect x="1100" y="120" width="300" height="240" fill="#1F2230"/>` + moon(id, 1250, 220, 34),
    fg: (u, g, id) => glow(id, 800, 520, 220, g, 0, 0.45) + flame(800, 600, 1.2, g) + `<rect x="786" y="600" width="28" height="40" fill="#8A6A3A"/>` +
      `<rect x="440" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/><rect x="990" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/>` +
      person({ x: 520, y: 700, s: 1.45, who: 'hanxinHan', pose: P.mix(P.sitRest(), P.point(0.6), 0.3 + 0.3 * Math.sin(g * 1.3)), g, face: 1, detail: true }) +
      person({ x: 1080, y: 700, s: 1.45, who: 'xiaohe', pose: { ...P.sitRest(), head: Math.max(0, Math.sin(g * 2)) * 8 }, g, face: -1, detail: true }),
    cam: [[800, 520, 1300], [800, 540, 1150]],
  },
  // ---------- 6 诸将逃亡，韩信也走了 ----------
  'g.desert': {
    bg: (id) => sky(id, '#1E2230', '#3A3B48') + moon(id, 1300, 150, 36, 0.9) + ridge({ y: 400, amp: 140, seed: 107, a: 0.6, color: '#161922', peaks: 3 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#2A2B32"/>`,
    fg: (u, g, id) => {
      let o = torch(id, 1300, 600, 1, g) + torch(id, 1440, 610, 1, g, 0.3) + tent(1380, 620, 0.9, '#3A3A40');
      for (let i = 0; i < 5; i++) { const k = seg(u, i * 0.12, 0.5 + i * 0.12); o += person({ x: lerp(1200, 200, k) - i * 40, y: 720 + (i % 2) * 20, s: 0.8, who: 'hanSoldier', pose: P.walk(g * 1.2 + i * 0.3), g, face: -1, a: 1 - k * 0.6 }); }
      return o + mist(id, 108, g, { y: 650, h: 70, a: 0.4, n: 5 });
    },
    cam: [[800, 540, 1600], [760, 560, 1450]],
  },
  'g.hxthink': {
    bg: (id) => sky(id, '#1E2230', '#3A3B48') + moon(id, 1240, 200, 44) + ridge({ y: 440, amp: 120, seed: 109, a: 0.6, color: '#161922' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#2A2B32"/>`,
    fg: (u, g) => {
      const go = seg(u, 0.55, 1);
      return person({ x: lerp(800, 160, go), y: lerp(760, 690, go), s: lerp(1.6, 0.9, go), who: 'hanxinHan', pose: go > 0 ? P.walk(g * 0.8) : { ...P.stand(), head: -14 }, g, face: go > 0 ? -1 : 1, detail: true });
    },
    cam: [[800, 560, 1300], [600, 560, 1450]],
  },
  'g.chase': {
    bg: (id) => sky(id, '#1A2030', '#3A4050') + moon(id, 1200, 170, 54) + ridge({ y: 420, amp: 140, seed: 110, a: 0.6, color: '#141822', peaks: 3 }) + `<path d="M-200,620 Q800,600 1800,630 L1800,1100 L-200,1100 Z" fill="#283040"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0, 1);
      return `<path d="M-200,760 Q800,700 1800,760" stroke="#8FA9B8" stroke-width="40" fill="none" opacity=".25"/>` + horse({ x: lerp(1600, 0, k), y: 740, s: 1.2, g, gait: 'run', ph: g * 1.9, rider: 'xiaohe', face: -1 }) + mist(id, 111, g, { y: 650, h: 80, a: 0.45, n: 6, speed: 24 });
    },
    cam: [[800, 520, 1600], [700, 560, 1450]],
  },
  'g.report': {
    bg: (id) => hanTent(id) + dais(),
    fg: (u, g) => {
      const k = seg(u, 0, 0.45), up = seg(u, 0.45, 0.7);
      return person({ x: 1200, y: 640, s: 1.45, who: 'liubang', pose: P.mix(P.sitCross(), { ...P.stand(), lean: -8 }, up), g, face: -1, detail: true, mood: up > 0.5 ? 'shock' : 'calm' }) +
        person({ x: lerp(200, 820, k), y: 780, s: 1.35, who: 'hanSoldier', pose: k < 1 ? P.walk(g * 1.8, 1.3) : P.bow(0.5), g, face: 1 });
    },
    cam: [[900, 560, 1400], [980, 560, 1200]],
  },
  'g.glasses': glassesShot('人有言上曰丞相何亡'),
  'g.lbangry': {
    bg: (id) => hanTent(id),
    fg: (u, g) => {
      const walk = 1 - seg(u, 0.5, 0.6), x = 800 + Math.sin(g * 0.9) * 260 * walk, ent = seg(u, 0.55, 0.85);
      return person({ x, y: 780, s: 1.5, who: 'liubang', pose: walk > 0.1 ? P.walk(g * 0.9) : P.point(1), g, face: walk > 0.1 ? (Math.cos(g * 0.9) > 0 ? 1 : -1) : 1, detail: true, mood: 'sneer' }) +
        person({ x: lerp(1700, 1200, ent), y: 790, s: 1.45, who: 'xiaohe', pose: ent < 1 ? P.walk(g) : P.bow(0.3), g, face: -1, detail: true });
    },
    cam: [[900, 560, 1400], [960, 560, 1250]],
  },
  'g.argue': {
    bg: (id) => hanTent(id),
    fg: (u, g) => {
      const who = Math.floor(seg(u, 0, 1) * 4) % 2;
      return person({ x: 640, y: 780, s: 1.55, who: 'liubang', pose: who === 0 ? P.mix(P.stand(), P.point(1), 0.6 + 0.4 * Math.sin(g * 3)) : P.akimbo(), g, face: 1, detail: true, mood: 'sneer' }) +
        person({ x: 1000, y: 790, s: 1.5, who: 'xiaohe', pose: who === 1 ? P.mix(P.stand(), P.point(0.7), 0.5) : P.bow(0.2), g, face: -1, detail: true });
    },
    cam: [[820, 560, 1250], [820, 560, 1150]],
  },
  'g.xhcu': {
    bg: (id) => sky(id, '#2A221E', '#3E302A') + glow(id, 1200, 420, 420, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'xiaohe', g, id, brow: 0.2, mouth: Math.sin(g * 7) > 0.3 ? 0.5 : 0, nod: Math.sin(g * 1.5) * 0.3 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'g.xhexplain': {
    bg: (id) => hanTent(id) + `<rect x="560" y="200" width="480" height="300" rx="10" fill="#EFE6D0" stroke="#B9A57A" stroke-width="5"/>` + vtext(640, 260, '汉中', 30, RED, 0.85) + vtext(960, 250, '天下', 30, INK, 0.85),
    fg: (u, g, id) => {
      const a = seg(u, 0.1, 0.4), b = seg(u, 0.5, 0.85);
      return `<circle cx="660" cy="380" r="${f(30 + a * 20)}" fill="${RED}" opacity=".25"/>` + `<path d="M690,380 Q820,300 ${f(lerp(700, 980, b))},${f(lerp(370, 330, b))}" stroke="${RED}" stroke-width="6" fill="none" stroke-dasharray="12 8" opacity="${f(b)}"/>` + glow(id, 980, 340, 70, g, 0, b * 0.4) +
        person({ x: 440, y: 790, s: 1.45, who: 'xiaohe', pose: P.point(0.8 + 0.2 * Math.sin(g * 1.5)), g, face: 1, detail: true }) + person({ x: 1200, y: 790, s: 1.45, who: 'liubang', pose: P.stand(), g, face: -1, detail: true });
    },
    cam: [[800, 520, 1400], [800, 520, 1300]],
  },
  'g.decide': {
    bg: (id) => hanTent(id),
    fg: (u, g) => {
      const a = seg(u, 0.05, 0.25), b = seg(u, 0.55, 0.75);
      return person({ x: 560, y: 780, s: 1.5, who: 'liubang', pose: P.mix(P.stand(), P.point(1), Math.max(a, b)), g, face: 1, detail: true }) +
        person({ x: 1040, y: 790, s: 1.45, who: 'xiaohe', pose: P.mix(P.stand(), P.bow(0.4), seg(u, 0.8, 1)), g, face: -1, detail: true }) +
        `<text x="800" y="${f(360 - a * 20)}" font-size="${f(80 + b * 40)}" text-anchor="middle" fill="${GOLD}" opacity="${f(Math.max(a, b))}" ${KAI}>${b > 0.3 ? '大将' : '将'}</text>`;
    },
    cam: [[800, 540, 1300], [800, 540, 1200]],
  },
  'g.xhwarn': {
    bg: (id) => hanTent(id) + dais(),
    fg: (u, g) => person({ x: 1200, y: 640, s: 1.45, who: 'liubang', pose: { ...P.sitCross(), lean: -14, aF: 100, eF: 20, head: -10 }, g, face: -1, detail: true }) +
      person({ x: 780, y: 780, s: 1.45, who: 'xiaohe', pose: P.mix(P.bow(0.5), P.point(0.6), 0.5 + 0.4 * Math.sin(g * 1.4)), g, face: 1, detail: true }),
    cam: [[980, 560, 1300], [980, 560, 1200]],
  },
  // ---------- 16 登坛拜将 ----------
  'g.altar': {
    bg: (id) => sky(id, '#C9D3D6', '#E6E8E2') + ridge({ y: 360, amp: 120, seed: 112, a: 0.3, peaks: 4 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B9A988"/>` + altar(800, 660, 1.1),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 10; i++) o += banner(160 + i * 142, 560, 0.7, g, i % 2 ? RED : GOLD, '汉', i * 0.2, 0.9);
      const climb = seg(u, 0.1, 0.7), hx = 800, hy = lerp(660, 396, climb);
      o += person({ x: 800, y: 396, s: 0.9, who: 'liubang', pose: P.give(seg(u, 0.65, 0.85)), g, face: -1 });
      o += person({ x: hx - 50, y: hy, s: 0.9, who: 'hanxinHan', pose: climb < 1 ? P.walk(g * 0.8, 0.6) : P.bow(0.6), g, face: 1 });
      for (let r = 0; r < 2; r++) for (let i = 0; i < 16; i++) { const x = 60 + i * 100; if (x > 300 && x < 1300 && r === 0) continue; o += person({ x, y: 820 + r * 50, s: 1.1, who: 'hanSoldier', pose: P.stand(), g, face: x < 800 ? 1 : -1, hold: 'spear' }); }
      return o;
    },
    cam: [[800, 520, 1600], [800, 460, 1100]],
  },
  'g.surprise': {
    bg: (id) => sky(id, '#C9D3D6', '#E6E8E2') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B9A988"/>`,
    fg: (u, g) => {
      let o = '';
      const turn = seg(u, 0.2, 0.5);
      [[300, 'general'], [560, 'hanSoldier'], [820, 'general'], [1080, 'hanSoldier'], [1340, 'general']].forEach(([x, who], i) => { o += person({ x: x as number, y: 820, s: 1.5, who: who as string, pose: { ...P.mix(P.stand(), P.point(1), i % 2 ? turn * 0.6 : 0), head: -10 * turn }, g, face: i % 2 ? -1 : 1, detail: true, mood: turn > 0.3 ? 'shock' : 'calm' }); });
      return o + (turn > 0.3 ? `<text x="800" y="320" font-size="110" text-anchor="middle" fill="${RED}" opacity="${f(turn)}" ${KAI}>？！</text>` : '');
    },
    cam: [[800, 560, 1500], [800, 560, 1350]],
  },
  // ---------- 17 汉中对 ----------
  'g.audience': {
    bg: (id) => hanTent(id) + `<rect x="580" y="180" width="440" height="260" rx="10" fill="#EFE6D0" stroke="#B9A57A" stroke-width="5"/>` + vtext(640, 230, '汉', 34, RED, 0.85) + vtext(950, 230, '楚', 34, INK, 0.85),
    fg: (u, g) => {
      const a = seg(u, 0.1, 0.7);
      return `<path d="M670,320 L${f(lerp(670, 930, a))},320" stroke="${RED}" stroke-width="8" stroke-linecap="round"/>` + `<path d="M${f(lerp(670, 930, a) - 20)},305 l24,15 l-24,15" fill="none" stroke="${RED}" stroke-width="6" opacity="${f(a)}"/>` +
        `<rect x="440" y="740" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/><rect x="990" y="740" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/>` +
        person({ x: 520, y: 740, s: 1.45, who: 'liubang', pose: P.sitRest(), g, face: 1, detail: true }) + person({ x: 1080, y: 740, s: 1.45, who: 'hanxinHan', pose: P.mix(P.sitRest(), P.point(0.7), 0.4 + 0.3 * Math.sin(g * 1.4)), g, face: -1, detail: true });
    },
    cam: [[800, 500, 1400], [800, 520, 1300]],
  },
  'g.lbsilent': {
    bg: (id) => sky(id, '#2A221E', '#3E302A') + glow(id, 1200, 420, 420, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'liubang', g, id, brow: 0.6, mouth: -0.4, open: lerp(1, 0.6, seg(u, 0, 0.5)), nod: seg(u, 0.6, 0.9) * 0.6 }),
    cam: [[800, 460, 1400], [800, 450, 1300]],
  },
  'g.hxjudge': {
    bg: (id) => sky(id, '#2A221E', '#3E302A') + glow(id, 1200, 420, 420, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'hanxin', g, id, brow: -0.3, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, nod: Math.sin(g * 1.2) * 0.2 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'g.xyprint': {
    bg: (id) => sky(id, '#3A2C24', '#4A3A2E') + glow(id, 800, 460, 360, 0, 0, 0.4),
    fg: (u, g) => {
      const c = seg(u, 0, 1), turn = Math.sin(g * 1.8) * 30;
      return `<path d="M400,900 Q520,640 700,600 L760,640 Q600,700 560,900 Z" fill="#EAD9BF" stroke="${INK}" stroke-width="3"/><path d="M1200,900 Q1080,640 900,600 L840,640 Q1000,700 1040,900 Z" fill="#EAD9BF" stroke="${INK}" stroke-width="3"/>` +
        seal(800, 520, 1.6, c, turn);
    },
    cam: [[800, 520, 1300], [800, 500, 1100]],
  },
  'g.lbjoy': {
    bg: (id) => hanTent(id),
    fg: (u, g) => person({ x: 680, y: 790, s: 1.55, who: 'liubang', pose: P.laugh(g * 0.8), g, face: 1, detail: true, mood: 'laugh' }) +
      person({ x: 980, y: 790, s: 1.5, who: 'hanxinHan', pose: P.bow(0.2), g, face: -1, detail: true }),
    cam: [[820, 560, 1250], [820, 560, 1150]],
  },
  // ---------- 21 出陈仓，定三秦；明修栈道，暗度陈仓 ----------
  'g.march': {
    bg: (id) => sky(id, '#C9C4B6', '#E6E0D2') + ridge({ y: 300, amp: 220, seed: 113, a: 0.55, color: '#5A5248', peaks: 3 }) + ridge({ y: 420, amp: 120, seed: 114, a: 0.5, color: '#6A6458' }) + `<path d="M-200,700 Q800,640 1800,700 L1800,1100 L-200,1100 Z" fill="#8A7E68"/>`,
    fg: (u, g, id) => {
      let o = '';
      for (let i = 0; i < 26; i++) { const x = ((i * 70 + g * 40) % 1900) - 150; o += person({ x, y: 720 + (i % 3) * 18, s: 0.65, who: 'hanSoldier', pose: P.walk(g + i * 0.2), g, face: 1, hold: i % 4 === 0 ? 'spear' : undefined }); }
      return o + banner(((g * 40 + 600) % 1900) - 150, 560, 0.7, g, RED, '汉', 0, 0.95) + mist(id, 115, g, { y: 620, h: 80, a: 0.45, n: 6 });
    },
    cam: [[800, 520, 1600], [800, 560, 1450]],
  },
  'g.plank': {
    bg: (id) => cliffBg(id) + `<line x1="800" y1="0" x2="800" y2="900" stroke="${PAPER}" stroke-width="8" opacity=".8"/>` +
      `<rect x="270" y="60" width="100" height="80" rx="14" fill="${INK}" opacity=".55"/><text x="320" y="120" font-size="56" text-anchor="middle" fill="#F4F1E8" ${KAI}>明</text><rect x="1190" y="60" width="100" height="80" rx="14" fill="${INK}" opacity=".55"/><text x="1240" y="120" font-size="56" text-anchor="middle" fill="#F4F1E8" ${KAI}>暗</text>`,
    fg: (u, g) => {
      const fix = seg(u, 0, 0.9);
      let o = plankRoad(400, 80, 700, 1 - fix);
      for (let i = 0; i < 3; i++) o += person({ x: 140 + i * 120, y: 470 + i * 22, s: 0.7, who: 'hanSoldier', pose: P.mix(P.stand(), P.point(1), 0.5 + 0.5 * Math.sin(g * 3 + i)), g, face: 1 });
      o += `<rect x="806" y="0" width="900" height="900" fill="#3A3A2E" opacity=".55"/>`;
      for (let i = 0; i < 9; i++) { const x = 840 + ((i * 90 + u * 700) % 760); o += person({ x, y: 760 + (i % 2) * 20, s: 0.7, who: 'hanSoldier', pose: P.walk(g * 1.2 + i * 0.2), g, face: 1, a: 0.85 }); }
      return o + vtext(1500, 560, '陈仓', 34, GOLD, 0.9);
    },
    cam: [[800, 450, 1600], [800, 450, 1600]],
  },
  'g.desk': deskShot('这一回告诉我们谁也不能否认萧何不是韩信的伯乐'),
  'g.army': {
    bg: (id) => sky(id, '#B9876A', '#D8B892') + ridge({ y: 420, amp: 70, seed: 116, a: 0.35, color: '#4A3A30' }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#8A6E50"/><path d="M200,620 Q500,480 800,620 Z" fill="#7A6044"/>`,
    fg: (u, g) => {
      let o = '';
      for (let r = 0; r < 3; r++) for (let i = 0; i < 14; i++) o += person({ x: 760 + i * 70 + r * 24, y: 700 + r * 50, s: 0.75, who: 'hanSoldier', pose: P.stand(), g, face: -1, hold: 'spear' });
      o += banner(1500, 520, 0.9, g, RED, '汉', 0, 0.95) + person({ x: 520, y: 560, s: 1.2, who: 'hanxinHan', pose: P.mix(P.stand(), P.point(1), seg(u, 0.3, 0.6)), g, face: 1, detail: true });
      return o;
    },
    cam: [[800, 520, 1600], [700, 520, 1300]],
  },
};
