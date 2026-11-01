// 刘邦线：每一镜怎么画、怎么动（泗水亭长、沛公、约法三章……）
import { GOLD, INK, PAPER, RED, banner, campfire, cityWall, f, flame, glow, house, lerp, ridge, seg, sky, soundRings, tent, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import { deskBg, seatRock, slips } from './shots1';
import { dais, glassesShot, tentIn } from './shots2';
import type { ShotDef } from './Film';

// ---------------- 共用 ----------------
/** 乡下：远山、田、几间土房 */
const village = (id: string) => sky(id, '#DCD2BE', PAPER) + ridge({ y: 400, amp: 60, seed: 201, a: 0.18 }) + `<path d="M-200,520 Q800,500 1800,520 L1800,1100 L-200,1100 Z" fill="#C2B08A"/>` + house(1180, 540, 1.1) + house(1400, 548, 0.9);
/** 秦始皇的车驾：伞盖下的车、四匹马 */
export const chariot = (x: number, y: number, s: number, g: number, run = 0.4) => {
  let o = '';
  for (let i = 0; i < 2; i++) o += horse({ x: x + 210 + i * 30, y: y + i * 6, s: 0.9 * s, g, gait: 'walk', ph: g * 0.6 + i * 0.3, c: i ? '#3A3230' : '#4A403A' });
  o += `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><path d="M-120,-40 L120,-40 L120,0 L-120,0 Z" fill="#1E1C22" stroke="${GOLD}" stroke-width="4"/><circle cx="-60" cy="10" r="46" fill="none" stroke="#2A2620" stroke-width="10"/><circle cx="-60" cy="10" r="8" fill="#2A2620"/>` +
    `<path d="M0,-40 L0,-200" stroke="#2A2620" stroke-width="6"/><path d="M-150,-196 Q0,${f(-262 + wav(g, 2) * 4)} 150,-196 Z" fill="#1E1C22" stroke="${GOLD}" stroke-width="5"/><path d="M-150,-196 l0,24 M150,-196 l0,24" stroke="${GOLD}" stroke-width="4"/>` +
    `<path d="M120,-20 L230,-10" stroke="#2A2620" stroke-width="6"/></g>`;
  return o + person({ x: x - 10 * s, y: y - 40 * s, s: 1.1 * s, who: 'qinshihuang', pose: P.sitCross(), g, face: 1 }) + Array.from({ length: 2 }, (_, i) => banner(x - 160 * s - i * 60, y - 60 * s, 0.8 * s, g, '#1E1C22', '秦', i * 0.3)).join('');
};
/** 堂上：屋里的宴席（席子、案几） */
export const hallIn = (id: string) => sky(id, '#4A3A2C', '#6A5440') + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#5A4434"/><path d="M200,660 L1400,660 L1460,760 L140,760 Z" fill="#7A3A2C" opacity=".75"/>` +
  [180, 620, 1060, 1500].map((x) => `<rect x="${x - 18}" y="80" width="36" height="560" fill="#3A2A20"/>`).join('');
/** 一块木牍（名帖），上面写着字 */
const tablet = (x: number, y: number, s: number, text: string, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${rot}) scale(${s})"><rect x="-46" y="-160" width="92" height="320" rx="6" fill="#D9C08A" stroke="#8A6A3A" stroke-width="4"/>${vtext(0, -120, text, 46, INK, 0.9)}</g>`;

/** 广武：左边楚营的山头，右边汉营的山头，中间一道深涧 */
const gorge = (id: string) => sky(id, '#B2A690', '#D6CCB4') + `<path d="M-200,700 L640,700 L700,1100 L-200,1100 Z" fill="#9A8A6C"/><path d="M1800,700 L960,700 L900,1100 L1800,1100 Z" fill="#9A8A6C"/><path d="M640,700 L960,700 L900,1100 L700,1100 Z" fill="#5A4E3C"/><path d="M640,700 L700,1100 M960,700 L900,1100" stroke="${INK}" stroke-width="3" opacity=".5"/>`;
export const SHOTS_LB: Record<string, ShotDef> = {
  'lb.slips': {
    bg: (id) => deskBg(id) + slips(470, 330, 18, 1.2, '高祖沛丰邑中阳里人姓刘氏字季'),
    fg: (u, g, id) => glow(id, 800, 470, 300, g, 0, 0.3),
    cam: [[800, 480, 1300], [800, 470, 1100]],
  },
  // ================= 刘邦① 泗水亭长 =================
  'lb.farm': {
    bg: (id) => village(id) + Array.from({ length: 5 }, (_, i) => `<path d="M-200,${600 + i * 50} Q600,${590 + i * 50} 1000,${600 + i * 50}" stroke="#9C8662" stroke-width="6" fill="none" opacity=".6"/>`).join(''),
    fg: (u, g) => person({ x: 420, y: 700, s: 1.4, who: 'crowd2', pose: P.kneelWash(g * 0.5), g, face: 1 }) +
      seatRock(900, 700, 1.45) + person({ x: 900, y: 700, s: 1.45, who: 'liuji', pose: { ...P.sit(), lean: -10, head: -10, aF: 70, eF: 60 }, g, face: -1, detail: true, hold: 'cup' }) +
      person({ x: 1150, y: 720, s: 1.4, who: 'laofu', pose: P.mix(P.stand(), P.point(1), seg(u, 0.3, 0.7)), g, face: -1, detail: true }),
    cam: [[800, 560, 1500], [800, 580, 1200]],
  },
  'lb.ting': {
    bg: (id) => village(id) + `<g transform="translate(560,640)"><path d="M-160,0 L-160,-170 L160,-170 L160,0 Z" fill="#8A7458" stroke="${INK}" stroke-width="4"/><path d="M-210,-170 L0,-260 L210,-170 Z" fill="#5A4636" stroke="${INK}" stroke-width="4"/><rect x="-40" y="-110" width="80" height="110" fill="#3A2C22"/>${vtext(110, -150, '亭', 36, INK, 0.8)}</g>`,
    fg: (u, g) => person({ x: 860, y: 760, s: 1.45, who: 'liuji', pose: P.laugh(g * 0.8), g, face: 1, detail: true, mood: 'laugh' }) +
      person({ x: 1080, y: 770, s: 1.4, who: 'crowd1', pose: { ...P.stand(), head: 10 }, g, face: -1, detail: true }) + person({ x: 1220, y: 780, s: 1.35, who: 'caocan', pose: P.mix(P.stand(), P.laugh(g), 0.3), g, face: -1 }),
    cam: [[800, 560, 1500], [900, 600, 1200]],
  },
  'lb.procession': {
    bg: (id) => sky(id, '#D8CCB6', PAPER) + cityWall(-100, 420, 1800, 1, 0.5) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      const x = lerp(-300, 900, u);
      let o = '';
      for (let i = 0; i < 6; i++) o += person({ x: x - 420 - i * 110, y: 620, s: 1, who: 'qinguan', pose: P.walk(g * 0.6 + i * 0.2, 0.6), g, face: 1 }) + banner(x - 420 - i * 110, 560, 0.7, g, '#1E1C22', '', i * 0.2);
      o += chariot(x, 620, 1, g);
      for (let i = 0; i < 9; i++) o += person({ x: 120 + i * 170, y: 860 + (i % 2) * 20, s: 1.5, who: i === 4 ? 'liuji' : ['crowd1', 'crowd2', 'crowd3', 'crowd4'][i % 4], pose: P.stand(), g, face: 1, a: 0.95, detail: i === 4 });
      return o;
    },
    cam: [[800, 560, 1600], [760, 600, 1400]],
  },
  'lb.sigh': {
    bg: (id) => sky(id, '#CFC2AA', '#E6DCC8'),
    fg: (u, g) => chariot(lerp(1300, 1700, u), 520, 0.8, g) + person({ x: 620, y: 860, s: 2.6, who: 'liuji', pose: { ...P.stand(), head: -14, lean: -4 }, g, face: 1, detail: true }),
    cam: [[800, 520, 1400], [760, 560, 1200]],
  },
  'lb.liuCU': {
    bg: (id) => sky(id, '#BFB29A', '#E3D8C2'),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'liuji', g, id, brow: -0.1, mouth: Math.sin(g * 6) > 0.3 ? 0.4 : 0, look: 0.6 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'lb.feast': {
    bg: (id) => hallIn(id) + `<rect x="1320" y="300" width="200" height="340" fill="#2A1E16"/>`,
    fg: (u, g, id) => {
      let o = glow(id, 800, 460, 360, g, 0, 0.35);
      for (let i = 0; i < 5; i++) o += person({ x: 300 + i * 160, y: 700, s: 1.3, who: ['crowd1', 'caocan', 'crowd2', 'crowd4', 'crowd1'][i], pose: P.sitCross(), g, face: 1 });
      o += person({ x: 1260, y: 760, s: 1.45, who: 'xiaohe', pose: P.mix(P.stand(), P.point(1), seg(u, 0.4, 0.8)), g, face: -1, detail: true });
      return o;
    },
    cam: [[800, 520, 1500], [900, 540, 1250]],
  },
  'lb.card': {
    bg: (id) => deskBg(id),
    fg: (u, g, id) => { const k = seg(u, 0, 0.4); return glow(id, 800, 460, 260, g, 0, 0.4) + tablet(800, lerp(700, 470, k), 1.3, '贺钱万', lerp(-8, 0, k)) + (u > 0.6 ? `<text x="1020" y="520" font-size="40" fill="${RED}" style="font-family:KaiTi, STKaiti, serif" opacity="${f(seg(u, 0.6, 0.9))}">实不持一钱</text>` : ''); },
    cam: [[800, 470, 1200], [800, 470, 1050]],
  },
  'lb.glasses': glassesShot('素易诸吏乃绐为谒曰贺钱万实不持一钱'),
  'lb.lvgong': {
    bg: (id) => hallIn(id) + `<rect x="1320" y="300" width="200" height="340" fill="#C9B994"/>`,
    fg: (u, g) => { const k = seg(u, 0, 0.6); return person({ x: lerp(900, 1300, k), y: 760, s: 1.45, who: 'lvgong', pose: k < 1 ? P.walk(g, 0.8) : P.bow(0.5), g, face: 1, detail: true, mood: 'shock' }) + person({ x: 1440, y: 760, s: 1.5, who: 'liuji', pose: { ...P.akimbo(), head: -6 }, g, face: -1, detail: true, mood: 'laugh' }) + person({ x: 700, y: 770, s: 1.4, who: 'xiaohe', pose: P.stand(), g, face: 1, detail: true }); },
    cam: [[1050, 560, 1300], [1150, 580, 1050]],
  },
  'lb.xhcu': {
    bg: (id) => sky(id, '#3E3226', '#5A4836') + glow(id, 1250, 500, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'xiaohe', g, id, brow: 0.2, mouth: Math.sin(g * 7) > 0.2 ? 0.4 : 0, look: -0.3 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'lb.seat': {
    bg: (id) => hallIn(id) + dais(),
    fg: (u, g, id) => glow(id, 1200, 520, 300, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.45, who: 'liuji', pose: { ...P.sitCross(), lean: -8 }, g, face: -1, detail: true, mood: 'laugh', hold: 'cup' }) +
      person({ x: 860, y: 780, s: 1.4, who: 'lvgong', pose: P.bow(0.4 + 0.2 * seg(u, 0.5, 0.9)), g, face: 1, detail: true }) + person({ x: 600, y: 790, s: 1.3, who: 'lvhou', pose: { ...P.stand(), head: 14 }, g, face: 1, a: seg(u, 0.4, 0.8) }),
    cam: [[900, 560, 1400], [1000, 580, 1200]],
  },
  // ================= 刘邦② 沛公 =================
  'lb.convict': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + ridge({ y: 440, amp: 70, seed: 211, a: 0.25 }) + `<path d="M-200,600 Q800,580 1800,600 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 8; i++) { const run = i % 3 === 1 && u > 0.3 + i * 0.05; o += person({ x: run ? lerp(300 + i * 120, -200, seg(u, 0.3 + i * 0.05, 0.9)) : 300 + i * 120 + u * 120, y: 700 + (i % 2) * 20, s: 1.1, who: ['crowd2', 'crowd4', 'crowd1'][i % 3], pose: P.walk(g * 0.8 + i * 0.3, run ? 1 : 0.6), g, face: run ? -1 : 1 }); }
      return o + person({ x: 1300 + u * 100, y: 720, s: 1.3, who: 'liuji', pose: P.walk(g * 0.7, 0.6), g, face: 1, detail: true });
    },
    cam: [[800, 540, 1600], [850, 560, 1450]],
  },
  'lb.release': {
    bg: (id) => sky(id, '#1E2028', '#3A3A44') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#3A3E3A"/>` + Array.from({ length: 30 }, (_, i) => `<path d="M${i * 60 - 100},${700 + (i % 4) * 30} q6,-50 2,-80" stroke="#4A5A48" stroke-width="3" fill="none"/>`).join(''),
    fg: (u, g, id) => {
      const k = seg(u, 0.35, 0.95);
      let o = campfire(id, 760, 800, 1, g) + person({ x: 900, y: 800, s: 1.45, who: 'liuji', pose: P.mix({ ...P.sitCross(), aF: 70, eF: 60 }, { ...P.stand(), aF: 110, eF: 0 }, seg(u, 0.2, 0.4)), g, face: -1, detail: true, hold: 'cup' });
      for (let i = 0; i < 7; i++) { const go = i < 4; o += person({ x: go ? lerp(400 - i * 60, -200 - i * 80, k) : 500 - i * 40, y: 820 + (i % 2) * 20, s: 1.2, who: ['crowd2', 'crowd4', 'crowd1'][i % 3], pose: go && k > 0.02 ? P.walk(g + i * 0.3, 1) : P.stand(), g, face: go && k > 0.02 ? -1 : 1 }); }
      return o;
    },
    cam: [[800, 620, 1400], [760, 640, 1300]],
  },
  'lb.snake': {
    bg: (id) => sky(id, '#14161E', '#2A2C36') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#26282C"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.35, 0.6), cut = seg(u, 0.55, 0.75);
      // 蛇：砍下去以后断成两截，各自往两边歪开
      const pts = (i0: number, i1: number, dx: number, dy: number) => Array.from({ length: i1 - i0 }, (_, j) => { const i = i0 + j; return `${j ? 'L' : 'M'}${f(820 + i * 40 + dx)},${f(780 + Math.sin(i * 0.9 + g * 2) * 18 * (1 - k) + dy)}`; }).join(' ');
      const snake = (d: string) => `<path d="${d}" stroke="#E9E4D6" stroke-width="${f(26 - k * 4)}" fill="none" stroke-linecap="round" opacity="${f(1 - seg(u, 0.75, 1) * 0.4)}"/>`;
      return (cut > 0 ? snake(pts(0, 7, -cut * 30, cut * 6)) + snake(pts(7, 14, cut * 40, cut * 10)) : snake(pts(0, 14, 0, 0))) +
        person({ x: 640, y: 800, s: 1.5, who: 'liuji', pose: P.mix({ ...P.stand(), aF: 160, eF: 0, lean: -8 }, { ...P.stand(), aF: 60, eF: 0, lean: 20 }, k), g, face: 1, detail: true, hold: 'blade' });
    },
    cam: [[880, 640, 1300], [900, 680, 1150]],
  },
  'lb.city': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + cityWall(-100, 560, 1800, 1.2, 0.8) + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.4, 0.9);
      return person({ x: lerp(700, 400, k), y: lerp(560, 820, k), s: 1.3, who: 'xiaohe', pose: k > 0.02 && k < 0.98 ? P.walk(g, 1) : P.stand(), g, face: -1, detail: true }) +
        person({ x: lerp(800, 520, k), y: lerp(560, 830, k), s: 1.3, who: 'caocan', pose: k > 0.02 && k < 0.98 ? P.walk(g + 0.3, 1) : P.stand(), g, face: -1, detail: true }) +
        Array.from({ length: 3 }, (_, i) => person({ x: 1100 + i * 90, y: 560, s: 1.1, who: 'qinguan', pose: P.point(0.8), g, face: -1 })).join('');
    },
    cam: [[800, 560, 1600], [700, 620, 1400]],
  },
  'lb.arrow': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + cityWall(-100, 520, 1800, 1.2, 0.8) + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.3, 0.7), ax = lerp(560, 1200, k), ay = lerp(700, 420, k) - Math.sin(k * Math.PI) * 120;
      return person({ x: 460, y: 820, s: 1.6, who: 'liubangGen', pose: { ...P.stand(), aF: 120, eF: 0, aB: 100, eB: 60, lean: -10 }, g, face: 1, detail: true }) +
        `<g transform="translate(${f(ax)},${f(ay)}) rotate(${f(-30 + k * 50)})"><path d="M-40,0 L40,0" stroke="${INK}" stroke-width="4"/><path d="M40,0 l-12,-6 l0,12 z" fill="${INK}"/><rect x="-30" y="-12" width="40" height="24" fill="#E9DCBC" stroke="${RED}" stroke-width="2"/></g>` +
        Array.from({ length: 3 }, (_, i) => person({ x: 1120 + i * 110, y: 520, s: 1.1, who: 'crowd1', pose: P.mix(P.stand(), P.point(1), seg(u, 0.7, 1)), g, face: -1 })).join('');
    },
    cam: [[800, 560, 1600], [860, 580, 1450]],
  },
  'lb.liuCU2': {
    bg: (id) => sky(id, '#A89C84', '#D9CEB6'),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'liuji', g, id, brow: 0.3, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, look: 0.2 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'lb.gate': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + cityWall(-100, 560, 1800, 1.2, 0.85) + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + `<rect x="700" y="420" width="200" height="280" fill="#2A2018"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.1, 0.6);
      let o = `<rect x="${f(700 - 100 * k)}" y="420" width="100" height="280" fill="#5A4030" stroke="${INK}" stroke-width="3"/><rect x="${f(800 + 100 * k)}" y="420" width="100" height="280" fill="#5A4030" stroke="${INK}" stroke-width="3"/>`;
      for (let i = 0; i < 6; i++) o += person({ x: lerp(800, 560 + i * 60, k), y: 760 + (i % 2) * 20, s: 1.2, who: i % 2 ? 'laofu' : 'crowd2', pose: P.mix(P.walk(g + i * 0.2, 0.8), P.bow(0.4), seg(u, 0.6, 0.9)), g, face: 1 });
      return o + person({ x: 1300, y: 800, s: 1.5, who: 'liubangGen', pose: P.stand(), g, face: -1, detail: true });
    },
    cam: [[900, 560, 1500], [960, 600, 1300]],
  },
  'lb.refuse': {
    bg: (id) => hallIn(id),
    fg: (u, g) => person({ x: 800, y: 780, s: 1.5, who: 'liubangGen', pose: P.mix(P.bow(0.4), { ...P.stand(), aF: 40, eF: 60 }, Math.max(0, Math.sin(g))), g, face: 1, detail: true }) +
      person({ x: 1080, y: 790, s: 1.45, who: 'xiaohe', pose: P.bow(0.5), g, face: -1, detail: true }) + person({ x: 1250, y: 795, s: 1.45, who: 'caocan', pose: P.bow(0.5), g, face: -1, detail: true }) +
      Array.from({ length: 3 }, (_, i) => person({ x: 360 + i * 120, y: 800, s: 1.3, who: 'laofu', pose: P.bow(0.3), g, face: 1 })).join(''),
    cam: [[820, 560, 1400], [820, 580, 1250]],
  },
  'lb.peigong': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + cityWall(-100, 520, 1800, 1, 0.5) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      // 沛公站在城门前的土台上，众人在台下
      let o = `<path d="M670,700 L930,700 L960,840 L640,840 Z" fill="#9C8660" stroke="${INK}" stroke-width="3"/><path d="M660,760 h280" stroke="${INK}" stroke-opacity=".25" stroke-width="2"/>` + banner(800, 470, 1.4, g, RED, '沛', 0) + person({ x: 800, y: 700, s: 1.5, who: 'liubangGen', pose: P.mix(P.stand(), P.cheer(g * 0.5), 0.4), g, face: 1, detail: true });
      const n = Math.round(lerp(6, 22, seg(u, 0.1, 0.9)));
      // 众人分站土台两边，空出中间
      for (let i = 0; i < n; i++) { const c = i % 11; o += person({ x: c < 5 ? 150 + c * 92 : 1060 + (c - 5) * 82, y: 850 + Math.floor(i / 11) * 50, s: 1.2, who: i % 5 === 0 ? 'fankuai' : 'rebel', pose: P.cheer(g + i * 0.3), g, face: c < 5 ? 1 : -1 }); }
      return o;
    },
    cam: [[800, 600, 1600], [800, 620, 1500]],
  },
  // ================= 刘邦③ 约法三章 =================
  'lb.palace': {
    bg: (id) => hallIn(id) + `<path d="M-200,300 L1800,300" stroke="${GOLD}" stroke-width="6" opacity=".6"/>`,
    fg: (u, g, id) => {
      let o = glow(id, 800, 460, 380, g, 0, 0.45);
      for (let i = 0; i < 5; i++) o += `<rect x="${260 + i * 240}" y="560" width="90" height="70" fill="#8A6A3A" stroke="${GOLD}" stroke-width="3"/><circle cx="${305 + i * 240}" cy="550" r="14" fill="${GOLD}"/>`;
      return o + person({ x: lerp(300, 820, seg(u, 0, 0.5)), y: 780, s: 1.5, who: 'liubangGen', pose: u < 0.5 ? P.walk(g, 0.8) : { ...P.stand(), head: -10 }, g, face: 1, detail: true, mood: 'laugh' }) +
        Array.from({ length: 3 }, (_, i) => person({ x: 1100 + i * 120, y: 770, s: 1.3, who: 'yuji', pose: P.bow(0.3), g, face: -1 })).join('');
    },
    cam: [[800, 520, 1500], [820, 560, 1250]],
  },
  'lb.fankuai': {
    bg: (id) => hallIn(id),
    fg: (u, g) => person({ x: 700, y: 790, s: 1.55, who: 'liubangGen', pose: { ...P.stand(), head: -6 }, g, face: 1, detail: true }) +
      person({ x: 1000, y: 790, s: 1.6, who: 'fankuai', pose: P.mix(P.bow(0.3), P.point(1), 0.5 + 0.5 * Math.sin(g * 2)), g, face: -1, detail: true }),
    cam: [[850, 580, 1250], [850, 590, 1100]],
  },
  'lb.zhang': {
    bg: (id) => hallIn(id),
    fg: (u, g) => person({ x: 680, y: 790, s: 1.55, who: 'liubangGen', pose: { ...P.stand(), head: lerp(-6, 14, seg(u, 0.4, 0.9)) }, g, face: 1, detail: true }) +
      person({ x: 980, y: 790, s: 1.5, who: 'zhangliang', pose: P.mix(P.bow(0.4), { ...P.stand(), aF: 50, eF: 50 }, 0.5 + 0.5 * Math.sin(g)), g, face: -1, detail: true }),
    cam: [[830, 580, 1250], [830, 590, 1100]],
  },
  'lb.zlcu': {
    bg: (id) => sky(id, '#3E3226', '#5A4836') + glow(id, 1250, 500, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'zhangliang', g, id, brow: 0.1, mouth: Math.sin(g * 7) > 0.2 ? 0.4 : 0 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'lb.seal': {
    bg: (id) => hallIn(id),
    fg: (u, g) => { const k = seg(u, 0.2, 0.7); return `<rect x="560" y="420" width="480" height="240" fill="#2A1E16"/><g opacity="${f(k)}"><path d="M560,420 L1040,660 M1040,420 L560,660" stroke="#E9DCBC" stroke-width="18"/></g>` + person({ x: lerp(900, 1300, seg(u, 0.6, 1)), y: 790, s: 1.5, who: 'liubangGen', pose: u > 0.6 ? P.walk(g, 0.8) : P.point(0.8), g, face: 1, detail: true }); },
    cam: [[820, 560, 1300], [900, 580, 1250]],
  },
  'lb.elders': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + Array.from({ length: 5 }, (_, i) => `<path d="M${1200 + i * 80},620 l40,-90 l40,90 z" fill="#6A5E50" opacity=".8"/>`).join(''),
    fg: (u, g) => person({ x: 1000, y: 780, s: 1.55, who: 'liubangGen', pose: P.mix(P.stand(), { ...P.stand(), aF: 80, eF: 10 }, 0.5 + 0.5 * Math.sin(g * 1.2)), g, face: -1, detail: true }) +
      Array.from({ length: 7 }, (_, i) => person({ x: 220 + i * 100, y: 800 + (i % 2) * 24, s: 1.3, who: i % 2 ? 'laofu' : 'crowd1', pose: P.stand(), g, face: 1 })).join(''),
    cam: [[800, 580, 1500], [800, 600, 1300]],
  },
  'lb.liuCU3': {
    bg: (id) => sky(id, '#A89C84', '#D9CEB6'),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'liubang', g, id, brow: 0.2, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, look: 0.2 }) + `<g opacity="${f(seg(u, 0.1, 0.4))}">${vtext(1280, 160, '杀人者死', 44, INK, 0.85)}${vtext(1360, 160, '伤人及盗抵罪', 44, INK, 0.85)}</g>`,
    cam: [[880, 470, 1450], [880, 460, 1350]],
  },
  'lb.cheer': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = person({ x: 1250, y: 780, s: 1.5, who: 'liubangGen', pose: P.mix(P.stand(), { ...P.stand(), aF: 60, eF: 40, head: 6 }, seg(u, 0.5, 0.8)), g, face: -1, detail: true });
      for (let i = 0; i < 6; i++) o += person({ x: lerp(200, 600, seg(u, 0, 0.5)) + i * 90, y: 790 + (i % 2) * 20, s: 1.25, who: i % 2 ? 'laofu' : 'crowd2', pose: P.mix(P.walk(g + i * 0.2, 0.7), P.give(0.8), seg(u, 0.45, 0.6)), g, face: 1 }) + (i % 2 ? '' : `<ellipse cx="${f(lerp(240, 640, seg(u, 0, 0.5)) + i * 90)}" cy="740" rx="22" ry="16" fill="#8A6A44"/>`);
      return o;
    },
    cam: [[800, 580, 1500], [850, 600, 1300]],
  },
  'lb.army': {
    bg: (id) => sky(id, '#4A4248', '#7A6E6A') + ridge({ y: 470, amp: 80, seed: 221, a: 0.5, color: '#2A2628' }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#5A524E"/>`,
    fg: (u, g) => Array.from({ length: 30 }, (_, i) => person({ x: ((i % 15) * 120 + u * 300) - 200, y: 680 + Math.floor(i / 15) * 60, s: 0.9, who: 'soldier', pose: P.walk(g + i * 0.2, 0.7), g, face: 1 })).join('') + banner(lerp(400, 700, u), 600, 1.2, g, '#2A2428', '项', 0.2),
    cam: [[800, 560, 1600], [850, 580, 1500]],
  },
  // ================= 刘邦⑤ 分我一杯羹 =================
  'lb.guangwu': {
    bg: (id) => gorge(id),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 4; i++) o += tent(100 + i * 140, 704 + (i % 2) * 8, 0.75, '#5A4A40') + tent(1120 + i * 140, 704 + (i % 2) * 8, 0.75, '#4A5058');
      o += banner(480, 420, 1.1, g, RED, '楚', 0.1) + banner(1120, 420, 1.1, g, '#3A4A5A', '汉', 0.3);
      for (let i = 0; i < 5; i++) o += person({ x: 140 + i * 90, y: 800, s: 1, who: 'soldier', pose: P.stand(), g, face: 1, hold: 'spear' }) + person({ x: 1100 + i * 90, y: 800, s: 1, who: 'hanSoldier', pose: P.stand(), g, face: -1, hold: 'spear' });
      return o + `<g opacity="${f(seg(u, 0.3, 0.6))}">${vtext(800, 200, '广武', 44, INK, 0.75)}</g>`;
    },
    cam: [[800, 520, 1600], [800, 540, 1450]],
  },
  'lb.raid': {
    bg: (id) => sky(id, '#8A7E6A', '#B8AC94') + ridge({ y: 440, amp: 50, seed: 801, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/>`,
    fg: (u, g, id) => {
      let o = '';
      for (let i = 0; i < 3; i++) { const x = 400 + i * 300, hit = seg(u, 0.3 + i * 0.1, 0.6 + i * 0.1); o += `<g transform="translate(${x},800) rotate(${f(hit * (i % 2 ? 14 : -12))})"><rect x="-80" y="-60" width="160" height="50" fill="#8A6A3A" stroke="${INK}" stroke-width="3"/><path d="M-70,-60 q35,-30 70,0 q35,-30 70,0" fill="#D9C08A" stroke="${INK}" stroke-width="2"/><circle cx="-40" cy="0" r="26" fill="none" stroke="#2A2620" stroke-width="7"/><circle cx="40" cy="0" r="26" fill="none" stroke="#2A2620" stroke-width="7"/></g>` + (hit > 0.3 ? flame(x, 730, 1.4, g, i * 0.3) : '') + person({ x: x - 140 + hit * -120, y: 820, s: 1.1, who: 'soldier', pose: hit > 0.1 ? P.walk(g * 1.6, 1) : P.walk(g, 0.6), g, face: hit > 0.1 ? -1 : 1, mood: hit > 0.1 ? 'shock' : 'calm' }); }
      for (let i = 0; i < 3; i++) o += horse({ x: lerp(1800, 700, seg(u, 0.1, 0.6)) + i * 160, y: 820 + (i % 2) * 20, s: 0.9, face: -1, g, gait: 'run', ph: g * 1.8 + i * 0.3, c: '#3A3230', rider: 'rebel' });
      return o + glow(id, 700, 700, 300, g, 0, 0.2 * seg(u, 0.3, 0.6));
    },
    cam: [[800, 600, 1600], [800, 620, 1450]],
  },
  'lb.zu': {
    bg: (id) => gorge(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.5);
      // 楚营这边：高高的案板，太公在上面；下面一口大锅
      return glow(id, 420, 640, 220, g, 0, 0.4) + flame(400, 690, 1.4, g) + flame(440, 692, 1.2, g, 0.4) + `<path d="M330,640 L510,640 L490,700 L350,700 Z" fill="#4A4A4C" stroke="${INK}" stroke-width="3"/>` +
        `<rect x="250" y="${f(lerp(560, 430, k))}" width="300" height="24" fill="#6A4A30" stroke="${INK}" stroke-width="3"/><path d="M270,${f(lerp(584, 454, k))} L270,700 M530,${f(lerp(584, 454, k))} L530,700" stroke="#5A3E2A" stroke-width="10"/>` +
        person({ x: 400, y: lerp(560, 430, k), s: 1.05, who: 'laofu', pose: { ...P.sitCross(), head: 10 }, g, face: 1, mood: 'shock' }) +
        person({ x: 620, y: 700, s: 1.25, who: 'xiangyu', pose: P.point(1), g, face: 1, detail: true, mood: 'sneer' }) + soundRings(700, 520, g, { dir: 1, n: 3, r0: 30 }) +
        person({ x: 1180, y: 700, s: 1.2, who: 'liubangGen', pose: { ...P.stand(), head: -6 }, g, face: -1 });
    },
    cam: [[800, 520, 1500], [700, 540, 1250]],
  },
  'lb.cu5': {
    bg: (id) => sky(id, '#A89C84', '#D9CEB6'),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'liubang', g, id, brow: 0.1, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, look: 0.2 }) +
      `<g opacity="${f(seg(u, 0.4, 0.7))}">${vtext(1320, 160, '分我一杯羹', 46, '#7A2A22', 0.9)}</g>` + `<g opacity="${f(seg(u, 0.1, 0.35))}">${vtext(1400, 160, '吾翁即若翁', 46, INK, 0.8)}</g>`,
    cam: [[880, 470, 1450], [880, 460, 1350]],
  },
  'lb.xiangbo': {
    bg: (id) => gorge(id),
    fg: (u, g) => {
      const k = seg(u, 0.3, 0.7);
      return `<rect x="250" y="430" width="300" height="24" fill="#6A4A30" stroke="${INK}" stroke-width="3"/><path d="M270,454 L270,700 M530,454 L530,700" stroke="#5A3E2A" stroke-width="10"/>` +
        person({ x: 400, y: 430, s: 1.05, who: 'laofu', pose: { ...P.sitCross(), head: 10 }, g, face: 1 }) +
        person({ x: 640, y: 700, s: 1.3, who: 'xiangyu', pose: P.mix({ ...P.stand(), aF: 140, eF: 0 }, P.stand(), k), g, face: -1, detail: true, mood: k < 0.5 ? 'sneer' : 'calm' }) +
        person({ x: 780, y: 704, s: 1.25, who: 'xiangbo', pose: P.mix(P.bow(0.6), { ...P.stand(), aF: 60, eF: 70 }, 0.5 + 0.5 * Math.sin(g * 1.5)), g, face: -1, detail: true });
    },
    cam: [[600, 540, 1200], [620, 560, 1050]],
  },
  'lb.challenge': {
    bg: (id) => gorge(id),
    fg: (u, g) => person({ x: 520, y: 700, s: 1.35, who: 'xiangyu', pose: P.mix(P.stand(), { ...P.stand(), aF: 150, eF: 0 }, 0.5 + 0.5 * Math.sin(g * 1.3)), g, face: 1, detail: true }) + soundRings(620, 520, g, { dir: 1, n: 3, r0: 30 }) +
      person({ x: 1120, y: 700, s: 1.3, who: 'liubangGen', pose: P.stand(), g, face: -1, detail: true }) +
      Array.from({ length: 4 }, (_, i) => person({ x: 140 + i * 80, y: 704, s: 0.95, who: 'soldier', pose: P.slump(), g, face: 1 })).join(''),
    cam: [[820, 540, 1400], [820, 560, 1250]],
  },
  'lb.laugh': {
    bg: (id) => gorge(id),
    fg: (u, g) => person({ x: 1120, y: 700, s: 1.45, who: 'liubangGen', pose: P.mix(P.laugh(g * 2), P.bow(0.3), seg(u, 0.5, 0.8)), g, face: -1, detail: true, mood: 'laugh' }) +
      person({ x: 480, y: 700, s: 1.35, who: 'xiangyu', pose: { ...P.stand(), aF: 40, eF: 30 }, g, face: 1, detail: true }),
    cam: [[820, 540, 1300], [920, 560, 1100]],
  },
  'lb.shot': {
    bg: (id) => gorge(id),
    fg: (u, g) => {
      const k = seg(u, 0.4, 0.7);
      return person({ x: 1120, y: 700, s: 1.45, who: 'liubangGen', pose: k < 1 ? P.point(1) : { ...P.stand(), lean: -14, aF: 40, eF: 90 }, g, face: -1, detail: true, mood: k >= 1 ? 'shock' : 'calm' }) +
        person({ x: 520, y: 700, s: 1.35, who: 'xiangyu', pose: { ...P.stand(), aF: 140, eF: 0 }, g, face: 1, detail: true, mood: 'sneer' }) +
        person({ x: 380, y: 710, s: 1.2, who: 'soldier', pose: { ...P.stand(), aF: 90, eF: 0, aB: 80, eB: 60, lean: -6 }, g, face: 1 }) +
        (k > 0 && k < 1 ? `<g transform="translate(${f(lerp(440, 1080, k))},${f(lerp(580, 560, k) - Math.sin(k * Math.PI) * 70)})"><path d="M-90,0 L0,0" stroke="#3A2A1E" stroke-width="6"/><path d="M0,-9 L22,0 L0,9 Z" fill="#5A5A5C"/><path d="M-90,0 l-14,-10 M-90,0 l-14,10" stroke="#C9B88E" stroke-width="4"/></g>` : '');
    },
    cam: [[800, 540, 1400], [880, 560, 1250]],
  },
  'lb.toe': {
    bg: (id) => sky(id, '#A89C84', '#D2C8B2') + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.15, 0.4);
      return person({ x: 800, y: 820, s: 1.7, who: 'liubangGen', pose: P.mix({ ...P.stand(), lean: -10 }, { ...P.stand(), lean: 48, head: 20, aF: 20, eF: 10, aB: 30, eB: 20 }, k), g, face: -1, detail: true, mood: 'shock' }) +
        Array.from({ length: 3 }, (_, i) => person({ x: 1150 + i * 120, y: 830, s: 1.3, who: 'hanSoldier', pose: P.mix({ ...P.stand(), lean: 10, head: 10 }, P.stand(), seg(u, 0.5, 0.8)), g, face: -1, mood: u < 0.5 ? 'shock' : 'calm' })).join('') +
        `<g opacity="${f(seg(u, 0.4, 0.6))}">${vtext(1420, 300, '虏中吾指', 46, '#7A2A22', 0.85)}</g>`;
    },
    cam: [[880, 560, 1400], [880, 580, 1250]],
  },
  'lb.tour': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + [200, 420, 1300, 1500].map((x) => tent(x, 640, 0.9, '#4A5058')).join(''),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 7; i++) o += person({ x: 300 + i * 170, y: 860 + (i % 2) * 20, s: 1.1, who: 'hanSoldier', pose: P.mix(P.stand(), P.cheer(g + i * 0.5), seg(u, 0.2 + i * 0.05, 0.5 + i * 0.05)), g, face: i % 2 ? -1 : 1 });
      return o + person({ x: lerp(500, 1000, u), y: 780, s: 1.5, who: 'liubangGen', pose: P.walk(g * 0.6, 0.5), g, face: 1, detail: true }) + person({ x: lerp(380, 880, u), y: 786, s: 1.4, who: 'zhangliang', pose: P.walk(g * 0.6 + 0.3, 0.5), g, face: 1, detail: true });
    },
    cam: [[800, 600, 1500], [880, 620, 1350]],
  },
};
