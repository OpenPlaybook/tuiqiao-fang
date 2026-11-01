// 项羽线：每一镜怎么画、怎么动（学万人敌、破釜沉舟、沐猴而冠、彭城……）
import { GOLD, INK, PAPER, RED, banner, campfire, f, flame, glow, house, lerp, mist, moon, ridge, river, seg, sky, soundRings, tent, torch, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import { deskBg, slips } from './shots1';
import { dais, glassesShot, tentIn } from './shots2';
import type { ShotDef } from './Film';

// ---------------- 共用 ----------------
/** 帐外的冷雨 */
const rainOutside = (g: number) => Array.from({ length: 60 }, (_, i) => { const x = (i * 97 + g * 300) % 1800 - 100, y = (i * 53 + g * 900) % 1000 - 100; return `<path d="M${f(x)},${f(y)} l-8,30" stroke="#C9CED4" stroke-width="2" opacity=".35"/>`; }).join('');
/** 吴中：江南的院子（白墙、竹子） */
const yard = (id: string) => sky(id, '#D6DCD2', '#EEE8D8') + `<path d="M-200,300 L1800,300 L1800,640 L-200,640 Z" fill="#E9E4D6"/><path d="M-200,300 L1800,300" stroke="#4A4A48" stroke-width="18"/>` +
  Array.from({ length: 9 }, (_, i) => `<path d="M${1300 + i * 30},640 Q${1290 + i * 30},440 ${1310 + i * 32},260" stroke="#5E7A5A" stroke-width="6" fill="none" opacity=".8"/>`).join('') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B9AE96"/>`;
/** 江边：宽阔的浙江，江上一条大船（秦始皇的楼船） */
const riverSide = (id: string) => sky(id, '#C8D2D4', '#EAE4D2') + ridge({ y: 330, amp: 50, seed: 301, a: 0.2 }) + `<path d="M-200,380 L1800,380 L1800,620 L-200,620 Z" fill="#A9BCC0"/><path d="M-200,620 Q800,600 1800,620 L1800,1100 L-200,1100 Z" fill="#C2B08A"/>`;
const tower = (x: number, y: number, s: number, g: number) => `<g transform="translate(${f(x)},${f(y + wav(g, 3) * 4)}) scale(${s})"><path d="M-240,0 L240,0 L200,50 L-200,50 Z" fill="#2A2420" stroke="${GOLD}" stroke-width="4"/><rect x="-160" y="-110" width="320" height="110" fill="#1E1C22" stroke="${GOLD}" stroke-width="4"/><path d="M-200,-110 L0,-170 L200,-110 Z" fill="#1E1C22" stroke="${GOLD}" stroke-width="4"/><rect x="-60" y="-220" width="120" height="60" fill="#1E1C22" stroke="${GOLD}" stroke-width="3"/>${banner(170, -110, 0.8, g, '#1E1C22', '秦', 0.2)}</g>`;
/** 一只鼎（三足、两耳） */
const ding = (x: number, y: number, s: number, lift = 0) => `<g transform="translate(${f(x)},${f(y - lift)}) scale(${s})"><path d="M-90,-120 L90,-120 L76,-20 Q0,10 -76,-20 Z" fill="#6A5A40" stroke="${INK}" stroke-width="4"/><path d="M-70,-120 q0,-40 20,-40 l0,40 M70,-120 q0,-40 -20,-40 l0,40" stroke="#6A5A40" stroke-width="10" fill="none"/><path d="M-60,-10 l-14,${f(60 + lift * 0)} M60,-10 l14,60 M0,0 l0,58" stroke="#5A4A34" stroke-width="12" stroke-linecap="round"/><path d="M-70,-80 h140" stroke="${GOLD}" stroke-width="3" opacity=".6"/></g>`;

/** 秦朝的宫殿：高台、两重屋顶 */
const palace = (x: number, y: number, s: number, c: string) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-420,0 L420,0 L380,-60 L-380,-60 Z" fill="${c}"/><rect x="-300" y="-200" width="600" height="140" fill="${c}"/><path d="M-360,-200 L0,-270 L360,-200 Z" fill="${c}"/><rect x="-170" y="-330" width="340" height="80" fill="${c}"/><path d="M-220,-330 L0,-390 L220,-330 Z" fill="${c}"/></g>`;
/** 烧剩的宫殿：断柱、塌了的屋架 */
const ruins = (x: number, y: number, s: number) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-420,0 L420,0 L380,-60 L-380,-60 Z" fill="#3A322C"/>` + [-260, -150, -40, 80, 200, 290].map((cx, i) => `<rect x="${cx}" y="${-60 - (60 + (i * 37) % 120)}" width="22" height="${60 + (i * 37) % 120}" fill="#2A2420"/>`).join('') + `<path d="M-300,-180 L-60,-230 L-20,-200" stroke="#2A2420" stroke-width="14" fill="none"/><path d="M120,-170 L320,-120" stroke="#2A2420" stroke-width="12"/></g>`;
/** 关中形势图：四面是山（三角），东边一条黄河，中间一片沃土 */
const guanzhongMap = (x: number, y: number, s: number) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-340" y="-200" width="680" height="400" fill="#E6D8B4" stroke="#6A4A2E" stroke-width="6"/><ellipse cx="0" cy="10" rx="180" ry="100" fill="#B9C98E" opacity=".8"/>` +
  Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * Math.PI * 2, r = 250 + (i % 3) * 14, px = Math.cos(a) * r, py = Math.sin(a) * r * 0.55; return `<path d="M${f(px - 18)},${f(py + 14)} L${f(px)},${f(py - 20)} L${f(px + 18)},${f(py + 14)} Z" fill="#6A5A40"/>`; }).join('') +
  `<path d="M300,-190 Q240,-60 290,40 Q330,120 260,190" stroke="#6A8EA0" stroke-width="12" fill="none"/><text x="0" y="22" font-size="44" text-anchor="middle" fill="#3E4A2A" style="font-family:'Kaiti SC','STKaiti',serif">关中</text></g>`;
/** 戴上官帽的猕猴：学着人的样子站着、拱手 */
const monkey = (x: number, y: number, s: number, g: number, cap: number) => {
  const sw = Math.sin(g * 2) * 4;
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M40,-30 Q110,-40 100,-110 Q96,-140 70,-130" stroke="#7A5A3A" stroke-width="10" fill="none" stroke-linecap="round"/>` +
    `<path d="M-26,0 L-30,-60 M26,0 L30,-60" stroke="#6A4A2E" stroke-width="16" stroke-linecap="round"/><ellipse cx="0" cy="-100" rx="48" ry="64" fill="#8A6A44" stroke="${INK}" stroke-width="3"/><ellipse cx="0" cy="-92" rx="28" ry="40" fill="#C9A884"/>` +
    `<path d="M-40,-130 Q-60,-${f(100 + sw)} -14,-96 M40,-130 Q60,-${f(100 - sw)} 14,-96" stroke="#7A5A3A" stroke-width="13" fill="none" stroke-linecap="round"/>` +
    `<circle cx="0" cy="-190" r="44" fill="#8A6A44" stroke="${INK}" stroke-width="3"/><circle cx="-44" cy="-192" r="12" fill="#C9A884" stroke="${INK}" stroke-width="2"/><circle cx="44" cy="-192" r="12" fill="#C9A884" stroke="${INK}" stroke-width="2"/>` +
    `<ellipse cx="0" cy="-180" rx="30" ry="28" fill="#E0B49A"/><circle cx="-11" cy="-190" r="4.5" fill="${INK}"/><circle cx="11" cy="-190" r="4.5" fill="${INK}"/><path d="M-10,-166 Q0,-160 10,-166" stroke="${INK}" stroke-width="2.5" fill="none"/>` +
    `<g transform="translate(0,${f(-232 - (1 - cap) * 140)})" opacity="${f(Math.min(1, cap * 2))}"><rect x="-30" y="-56" width="60" height="58" fill="#1E1A18"/><rect x="-34" y="-6" width="68" height="10" fill="${GOLD}"/><path d="M-30,-56 L30,-56" stroke="${GOLD}" stroke-width="3"/></g></g>`;
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const SHOTS_XY: Record<string, ShotDef> = {
  // ================= 项羽① 学万人敌 =================
  'xy.slips': {
    bg: (id) => deskBg(id) + slips(470, 330, 18, 1.2, '项籍者下相人也字羽其季父项梁梁父即楚将项燕'),
    fg: (u, g, id) => glow(id, 800, 470, 300, g, 0, 0.3),
    cam: [[800, 480, 1300], [800, 470, 1100]],
  },
  'xy.study': {
    bg: (id) => yard(id),
    fg: (u, g) => {
      const k = seg(u, 0.1, 0.5), k2 = seg(u, 0.55, 0.95);
      // 先学书：坐着写，扔下笔；再学剑：挥两下，扔下剑
      const sitting = k2 < 0.01;
      let o = sitting
        ? `<rect x="560" y="640" width="200" height="40" fill="#6A4A34"/>` + slips(600, 600, 6, 0.35, '', 1) + person({ x: 660, y: 700, s: 1.45, who: 'xiangyuYoung', pose: P.mix({ ...P.sitCross(), aF: 64 + 4 * Math.sin(g * 12), eF: 30, head: 8, lean: 8 }, { ...P.sitCross(), aF: 120, eF: -10, head: -14 }, k), g, face: 1, detail: true, mood: k > 0.6 ? 'sneer' : 'calm' })
        : person({ x: 760, y: 760, s: 1.5, who: 'xiangyuYoung', pose: P.mix(P.dance(g * 1.4), { ...P.stand(), aF: 40, eF: 10, head: -10 }, k2), g, face: 1, detail: true, mood: k2 > 0.6 ? 'sneer' : 'calm' });
      o += person({ x: 1140, y: 770, s: 1.5, who: 'xiangliang', pose: P.mix(P.stand(), P.point(1), seg(u, 0.75, 1)), g, face: -1, detail: true, mood: u > 0.8 ? 'shock' : 'calm' });
      return o;
    },
    cam: [[850, 560, 1400], [900, 580, 1200]],
  },
  'xy.cu': {
    bg: (id) => sky(id, '#C9C4B4', '#E6E0D0'),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'xiangyuYoung', g, id, brow: 0.3, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, look: 0.2 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'xy.bingfa': {
    bg: (id) => yard(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.5, 0.9);
      // 兵法：地上画的阵图；项羽先凑过来看，后来起身走开
      const map = `<g opacity="${f(1 - k * 0.6)}"><rect x="560" y="700" width="420" height="120" fill="#A89878" opacity=".5"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${600 + i * 70}" y="730" width="36" height="24" fill="${i % 2 ? RED : INK}" opacity=".7"/>`).join('')}<path d="M600,790 L940,780" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/></g>`;
      return map + person({ x: 520, y: 780, s: 1.45, who: 'xiangliang', pose: P.mix(P.point(0.6), P.stand(), k), g, face: 1, detail: true }) +
        person({ x: lerp(900, 1240, k), y: 780, s: 1.5, who: 'xiangyuYoung', pose: k > 0.05 && k < 0.98 ? P.walk(g, 0.8) : { ...P.stand(), lean: 14 * (1 - k), head: 20 * (1 - k) }, g, face: k > 0.05 ? 1 : -1, detail: true });
    },
    cam: [[850, 600, 1400], [900, 620, 1250]],
  },
  'xy.ding': {
    bg: (id) => yard(id),
    fg: (u, g) => {
      const up = seg(u, 0.15, 0.5);
      // 先弯腰抱住地上的鼎，再一口气举过头顶
      let o = person({ x: 800, y: 790, s: 1.6, who: 'xiangyuYoung', pose: P.mix({ ...P.stand(), lean: 34, head: 10, aF: 60, eF: 20, aB: 60, eB: 20, lF: 26, lB: -26 }, { ...P.stand(), aF: 168, eF: 6, aB: 168, eB: 6, lF: 18, lB: -18, head: -10 }, up), g, face: 1, detail: true }) + ding(812, 800, 1.1, up * 385);
      for (let i = 0; i < 4; i++) o += person({ x: 300 + i * 110 + (i > 1 ? 900 : 0), y: 820, s: 1.3, who: ['crowd2', 'crowd4', 'crowd1', 'crowd2'][i], pose: P.mix(P.stand(), { ...P.stand(), lean: -10, head: -14 }, seg(u, 0.4, 0.7)), g, face: i > 1 ? -1 : 1, mood: 'shock' });
      return o;
    },
    cam: [[800, 520, 1500], [800, 520, 1300]],
  },
  'xy.river': {
    bg: (id) => riverSide(id),
    fg: (u, g, id) => river(302, g, { y0: 400, y1: 610, speed: 22, n: 60 }) + tower(lerp(300, 1100, u), 470, 0.9, g) + mist(id, 303, g, { y: 380, h: 60, n: 6, a: 0.25 }) +
      person({ x: 1250, y: 860, s: 1.7, who: 'xiangliang', pose: P.stand(), g, face: -1, detail: true }) + person({ x: 1420, y: 870, s: 1.8, who: 'xiangyuYoung', pose: { ...P.stand(), head: -6 }, g, face: -1, detail: true }) +
      Array.from({ length: 6 }, (_, i) => person({ x: 140 + i * 150, y: 850 + (i % 2) * 20, s: 1.5, who: ['crowd1', 'crowd3', 'crowd2', 'crowd4'][i % 4], pose: P.stand(), g, face: 1, a: 0.9 })).join(''),
    cam: [[800, 560, 1600], [900, 580, 1400]],
  },
  'xy.cover': {
    bg: (id) => riverSide(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.15, 0.4);
      return river(304, g, { y0: 400, y1: 610, speed: 22, n: 40 }) + person({ x: 900, y: 900, s: 2.6, who: 'xiangyuYoung', pose: { ...P.stand(), head: lerp(-6, 6, k) }, g, face: -1, detail: true, mood: 'sneer' }) +
        person({ x: lerp(560, 760, k), y: 900, s: 2.5, who: 'xiangliang', pose: P.mix(P.stand(), { ...P.stand(), aF: 120, eF: 50, lean: 14 }, k), g, face: 1, detail: true, mood: k > 0.5 ? 'shock' : 'calm' });
    },
    cam: [[800, 520, 1400], [800, 540, 1150]],
  },
  'xy.night': {
    bg: (id) => sky(id, '#1C1E26', '#34343E') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#2A2A30"/>`,
    fg: (u, g, id) => torch(id, 600, 540, 1.2, g) + person({ x: 800, y: 780, s: 1.5, who: 'xiangyuYoung', pose: P.mix(P.dance(g * 1.2), P.stand(), 0.3), g, face: 1, detail: true }) +
      Array.from({ length: 5 }, (_, i) => person({ x: 1050 + i * 100, y: 800 + (i % 2) * 20, s: 1.3, who: 'crowd4', pose: P.mix(P.stand(), P.cheer(g + i), 0.4), g, face: -1 })).join(''),
    cam: [[900, 600, 1400], [900, 620, 1250]],
  },
  // ================= 项羽② 破釜沉舟 =================
  'xy.kuaiji': {
    bg: (id) => tentIn(id) + dais(),
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.5);
      return glow(id, 1200, 520, 260, g, 0, 0.4) + person({ x: 1200, y: 640, s: 1.4, who: 'crowd1', pose: P.mix(P.sitCross(), { ...P.sitCross(), lean: -30, head: -20 }, k), g, face: -1, detail: true, mood: k > 0.3 ? 'shock' : 'calm' }) +
        person({ x: lerp(700, 1000, k), y: 780, s: 1.55, who: 'xiangyuYoung', pose: k > 0.5 ? { ...P.stand(), aF: 120, eF: -10 } : P.walk(g, 0.8), g, face: 1, detail: true }) + person({ x: 520, y: 780, s: 1.5, who: 'xiangliang', pose: P.point(seg(u, 0.1, 0.3)), g, face: 1, detail: true });
    },
    cam: [[900, 560, 1400], [950, 580, 1250]],
  },
  'xy.songyi': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      let o = glow(id, 800, 520, 300, g, 0, 0.5) + `<rect x="620" y="680" width="360" height="40" fill="#6A3A2C"/>` + person({ x: 800, y: 700, s: 1.45, who: 'songyi', pose: P.drink(0.5 + 0.5 * Math.sin(g * 1.2)), g, face: 1, detail: true, hold: 'cup' });
      for (let i = 0; i < 3; i++) o += person({ x: 420 + i * 100, y: 720, s: 1.3, who: 'crowd1', pose: P.drink(0.5 + 0.5 * Math.sin(g + i)), g, face: 1, hold: 'cup' });
      return o + rainOutside(g);
    },
    cam: [[800, 560, 1400], [800, 580, 1200]],
  },
  'xy.cold': {
    bg: (id) => sky(id, '#4A4E56', '#6A6E74') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#4A4A4C"/>`,
    fg: (u, g) => Array.from({ length: 10 }, (_, i) => person({ x: 200 + i * 130, y: 780 + (i % 2) * 24, s: 1.25, who: 'soldier', pose: P.slump(), g, face: i % 2 ? 1 : -1 })).join('') + rainOutside(g),
    cam: [[800, 600, 1500], [800, 620, 1350]],
  },
  'xy.slay': {
    bg: (id) => tentIn(id) + dais(),
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.55);
      return glow(id, 1200, 520, 260, g, 0, 0.4) + person({ x: 1200, y: 640, s: 1.4, who: 'songyi', pose: P.mix(P.sitCross(), { ...P.sitCross(), lean: -30, head: -20, aF: 120 }, k), g, face: -1, detail: true, mood: k > 0.3 ? 'shock' : 'calm' }) +
        person({ x: lerp(600, 1000, k), y: 780, s: 1.6, who: 'xiangyu', pose: k > 0.6 ? { ...P.stand(), aF: 150, eF: 0 } : P.walk(g * 1.3, 1), g, face: 1, detail: true });
    },
    cam: [[900, 560, 1400], [980, 580, 1200]],
  },
  'xy.cross': {
    bg: (id) => sky(id, '#B9B4A4', '#DDD6C2') + ridge({ y: 400, amp: 50, seed: 311, a: 0.2 }) + `<path d="M-200,440 L1800,440 L1800,640 L-200,640 Z" fill="#8E9C9C"/><path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8C70"/>`,
    fg: (u, g) => {
      const sink = seg(u, 0.15, 0.55), smash = seg(u, 0.45, 0.75);
      let o = river(312, g, { y0: 450, y1: 630, speed: 20, n: 50 });
      for (let i = 0; i < 4; i++) o += `<g transform="translate(${260 + i * 300},${f(560 + sink * 60)}) rotate(${f(sink * (i % 2 ? 14 : -12))})" opacity="${f(1 - sink * 0.75)}"><path d="M-120,0 L120,0 L90,40 L-90,40 Z" fill="#6A4A30" stroke="${INK}" stroke-width="3"/></g>`;
      for (let i = 0; i < 5; i++) { const x = 300 + i * 260; o += smash < 0.5 ? `<path d="M${x - 40},760 Q${x},820 ${x + 40},760 Z" fill="#3A3A3A" stroke="${INK}" stroke-width="3"/>` : `<path d="M${x - 40},790 l20,-20 l12,22 z M${x + 6},796 l24,-26 l14,24 z" fill="#3A3A3A" stroke="${INK}" stroke-width="2"/>`; }
      o += person({ x: 1380, y: 840, s: 1.6, who: 'xiangyu', pose: P.mix(P.stand(), P.point(1), seg(u, 0.1, 0.3)), g, face: -1, detail: true });
      for (let i = 0; i < 4; i++) o += person({ x: 260 + i * 260, y: 860, s: 1.3, who: 'soldier', pose: P.mix(P.stand(), { ...P.stand(), aF: 150, eF: 0 }, Math.max(0, Math.sin(g * 3 + i))), g, face: 1 });
      return o;
    },
    cam: [[800, 600, 1600], [820, 640, 1450]],
  },
  'xy.battle': {
    bg: (id) => sky(id, '#6A5A50', '#9A8A78') + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#7A6A58"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 9; i++) o += person({ x: 260 + i * 70 + Math.sin(g * 2 + i) * 10, y: 760 + (i % 3) * 30, s: 1.1, who: 'soldier', pose: P.dance(g * 1.6 + i * 0.3), g, face: 1 });
      for (let i = 0; i < 9; i++) o += person({ x: 900 + i * 70 + u * 100, y: 760 + (i % 3) * 30, s: 1.05, who: 'qinguan', pose: P.mix(P.walk(g + i, 1), P.slump(), seg(u, 0.5 + i * 0.03, 0.9)), g, face: i % 3 ? 1 : -1 });
      return o + banner(500, 600, 1.2, g, RED, '楚', 0.1);
    },
    cam: [[800, 600, 1600], [880, 620, 1450]],
  },
  'xy.walls': {
    bg: (id) => sky(id, '#7A6E64', '#B2A690') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#8A7A64"/>` + Array.from({ length: 4 }, (_, i) => `<rect x="${80 + i * 400}" y="480" width="260" height="120" fill="#6A5A48" stroke="${INK}" stroke-width="3"/>`).join(''),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) o += person({ x: 130 + i * 400 + j * 80, y: 480, s: 0.95, who: 'crowd1', pose: { ...P.stand(), lean: 10, head: 14, aF: 30 + 10 * Math.sin(g * 6 + j), eF: 60 }, g, face: 1 });
      for (let i = 0; i < 10; i++) o += person({ x: 200 + i * 130, y: 820, s: 1.1, who: i % 3 ? 'soldier' : 'xiangyu', pose: P.dance(g * 1.8 + i * 0.4), g, face: i % 2 ? 1 : -1 });
      return o + soundRings(800, 700, g, { dir: 1, n: 4, r0: 40 });
    },
    cam: [[800, 600, 1600], [800, 620, 1500]],
  },
  'xy.kneel': {
    bg: (id) => tentIn(id, true) + dais(),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 300, g, 0, 0.5) + person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: P.sitCross(), g, face: -1, detail: true });
      for (let i = 0; i < 4; i++) o += person({ x: lerp(200, 520, seg(u, 0, 0.8)) + i * 120, y: 800, s: 1.3, who: 'crowd1', pose: { ...P.kneelWash(g * 0.3 + i * 0.2), lean: 40, head: 20 }, g, face: 1 });
      return o;
    },
    cam: [[880, 580, 1500], [900, 600, 1300]],
  },
  'xy.chief': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => banner(800, 470, 1.6, g, RED, '项', 0) + person({ x: 800, y: 700, s: 1.6, who: 'xiangyu', pose: P.stand(), g, face: 1, detail: true }) +
      Array.from({ length: 14 }, (_, i) => banner(120 + i * 110, 760 + (i % 2) * 30, 0.6, g, ['#4A5A3A', '#5A4A6A', '#6A5A3A', '#3A4A6A'][i % 4], '', i * 0.2)).join(''),
    cam: [[800, 560, 1600], [800, 600, 1400]],
  },
  // ================= 项羽③ 沐猴而冠 =================
  'xy.burn': {
    bg: (id) => sky(id, '#2A1A16', '#5A2E22') + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#2A1E1A"/>` + palace(820, 700, 1.3, '#1E1614'),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.6);
      let o = glow(id, 820, 520, 520, g, 0, 0.35 + 0.35 * k);
      // 火从屋檐烧到屋顶
      for (let i = 0; i < 9; i++) if (k > i / 10) o += flame(400 + i * 105, 450 + (i % 2) * 20, 2.6 + (i % 3) * 0.5, g, i * 0.37);
      for (let i = 0; i < 5; i++) if (k > 0.4 + i / 10) o += flame(640 + i * 90, 300 + (i % 2) * 14, 2.2 + (i % 2) * 0.6, g, i * 0.51);
      o += Array.from({ length: 6 }, (_, i) => { const t = (g * 0.12 + i / 6) % 1; return `<circle cx="${f(600 + i * 90 + Math.sin(g + i) * 30)}" cy="${f(420 - t * 360)}" r="${f(30 + t * 70)}" fill="#3A2A26" opacity="${f(0.35 * (1 - t) * k)}"/>`; }).join('');
      for (let i = 0; i < 3; i++) o += person({ x: 1330 + i * 90, y: 880, s: 1.2, who: 'soldier', pose: P.stand(), g, face: -1, hold: 'torch' });
      return o + person({ x: 300, y: 880, s: 1.7, who: 'xiangyu', pose: { ...P.stand(), head: -6 }, g, face: 1, detail: true });
    },
    cam: [[800, 560, 1500], [760, 600, 1350]],
  },
  'xy.carts': {
    bg: (id) => sky(id, '#8A7A6A', '#C9B49A') + ridge({ y: 420, amp: 60, seed: 331, a: 0.3 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/>` + `<path d="M-200,520 Q100,500 200,520" stroke="#3A2A26" stroke-width="60" opacity=".25" fill="none"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 4; i++) {
        const x = lerp(100, 700, u) + i * 330;
        o += `<g transform="translate(${f(x)},${f(760 + wav(g, 0.6, i * 0.3) * 3)})"><rect x="-110" y="-70" width="220" height="60" fill="#6A4A2E" stroke="${INK}" stroke-width="3"/>` +
          `<rect x="-90" y="-120" width="80" height="50" fill="#8A6A3A" stroke="${GOLD}" stroke-width="3"/><rect x="10" y="-112" width="70" height="42" fill="#7A5A30" stroke="${GOLD}" stroke-width="3"/>` +
          `<circle cx="-50" cy="-128" r="10" fill="${GOLD}"/><circle cx="-30" cy="-126" r="9" fill="${GOLD}"/><circle cx="-60" cy="0" r="34" fill="none" stroke="#2A2620" stroke-width="8"/><circle cx="60" cy="0" r="34" fill="none" stroke="#2A2620" stroke-width="8"/></g>` +
          person({ x: x + 150, y: 800, s: 1.2, who: 'soldier', pose: P.walk(g + i * 0.4, 0.8), g, face: 1 });
      }
      return o + banner(lerp(1500, 1700, u), 560, 1, g, RED, '楚', 0.1);
    },
    cam: [[820, 580, 1600], [900, 600, 1450]],
  },
  'xy.advisor': {
    bg: (id) => tentIn(id, true) + guanzhongMap(820, 400, 0.85),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.6);
      const lab = (x: number, y: number, t: string, c: string) => `<text x="${x}" y="${y}" font-size="38" text-anchor="middle" fill="${c}" style="font-family:'Kaiti SC','STKaiti',serif">${t}</text>`;
      return glow(id, 820, 400, 380, g, 0, 0.25) + `<g opacity="${f(k)}">${lab(820, 216, '四面关塞', '#E9C9A0')}${lab(820, 470, '土地肥沃', '#3E5A2A')}</g>` +
        person({ x: 560, y: 820, s: 1.5, who: 'kuaitong', pose: P.mix(P.stand(), { ...P.stand(), aF: 140, eF: 10 }, seg(u, 0.05, 0.3)), g, face: 1, detail: true, mood: 'calm' }) +
        person({ x: 1150, y: 820, s: 1.65, who: 'xiangyu', pose: P.akimbo(), g, face: -1, detail: true });
    },
    cam: [[800, 520, 1500], [820, 540, 1300]],
  },
  'xy.ruins': {
    bg: (id) => sky(id, '#6A625A', '#A89E90') + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#5A524A"/>` + ruins(620, 700, 1.3),
    fg: (u, g) => {
      const turn = seg(u, 0.5, 0.8);
      const smoke = Array.from({ length: 5 }, (_, i) => { const t = (g * 0.08 + i / 5) % 1; return `<circle cx="${f(420 + i * 110 + Math.sin(g * 0.7 + i) * 40)}" cy="${f(560 - t * 400)}" r="${f(20 + t * 80)}" fill="#4A4440" opacity="${f(0.3 * (1 - t))}"/>`; }).join('');
      // 先朝着废墟看，再转身朝东（右边）走
      return smoke + person({ x: lerp(1080, 1240, turn), y: 880, s: 1.75, who: 'xiangyu', pose: turn > 0.05 && turn < 0.95 ? P.walk(g, 0.6) : { ...P.stand(), head: turn > 0.5 ? -8 : 6 }, g, face: turn > 0.5 ? 1 : -1, detail: true });
    },
    cam: [[820, 560, 1500], [900, 600, 1300]],
  },
  'xy.cu3': {
    bg: (id) => sky(id, '#3A3036', '#6A5A5A'),
    fg: (u, g, id) => faceCU({ x: 720, y: 480, s: 1.7, who: 'xiangyu', g, id, brow: 0.3, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, look: 0.1 }) +
      `<g opacity="${f(seg(u, 0.1, 0.4))}">${vtext(1340, 140, '富贵不归故乡', 44, '#E9DFCB', 0.9)}${vtext(1260, 200, '如衣绣夜行', 44, GOLD, 0.95)}</g>`,
    cam: [[860, 470, 1450], [860, 460, 1350]],
  },
  'xy.nightwalk': {
    bg: (id) => sky(id, '#0E1018', '#1E2230') + moon(id, 1300, 160, 26, 0.35) + Array.from({ length: 6 }, (_, i) => house(120 + i * 280, 640, 1.2, 0.55, true)).join('') + `<rect x="-200" y="300" width="2000" height="360" fill="#0E1018" opacity=".72"/><path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#161820"/>`,
    fg: (u, g) => {
      const x = lerp(200, 1300, u);
      // 一身锦绣，金线一闪一闪，可黑夜里没人看见：门窗都关着
      const glint = Array.from({ length: 10 }, (_, i) => `<circle cx="${f(x - 14 + (i % 4) * 9)}" cy="${f(700 + Math.floor(i / 4) * 34 + (i % 3) * 6)}" r="2.6" fill="${GOLD}" opacity="${f(0.4 + 0.6 * Math.abs(Math.sin(g * 3 + i)))}"/>`).join('');
      return person({ x, y: 820, s: 1.5, who: 'king', pose: P.walk(g, 0.7), g, face: 1, detail: true, a: 0.85 }) + glint;
    },
    cam: [[800, 560, 1500], [800, 580, 1350]],
  },
  'xy.whisper': {
    bg: (id) => sky(id, '#B2A690', '#D6CCB4') + palace(1250, 640, 0.9, '#4A3E36') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#A8977A"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.1, 0.45);
      return person({ x: lerp(1000, 760, k), y: 820, s: 1.5, who: 'kuaitong', pose: k < 0.95 ? P.walk(g, 0.6) : { ...P.stand(), aF: 70, eF: 110, head: -6 }, g, face: -1, detail: true, mood: 'sneer' }) +
        person({ x: 520, y: 830, s: 1.4, who: 'crowd1', pose: { ...P.stand(), head: 8, lean: 6 }, g, face: 1 }) + person({ x: 400, y: 836, s: 1.35, who: 'crowd2', pose: { ...P.stand(), head: 10, lean: 8 }, g, face: 1 }) +
        (k > 0.9 ? soundRings(700, 600, g, { dir: -1, n: 3, r0: 20 }) : '');
    },
    cam: [[800, 560, 1500], [700, 600, 1250]],
  },
  'xy.monkey': {
    bg: (id) => sky(id, '#D8CDB4', PAPER) + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#C2B08A"/>`,
    fg: (u, g) => {
      const on = seg(u, 0.15, 0.45);
      return monkey(800, 700, 1.7, g, on) + `<g opacity="${f(seg(u, 0.55, 0.8))}">${vtext(1220, 300, '沐猴而冠', 52, INK, 0.85)}</g>`;
    },
    cam: [[800, 520, 1300], [820, 520, 1150]],
  },
  'xy.boil': {
    bg: (id) => tentIn(id) ,
    fg: (u, g, id) => {
      const k = seg(u, 0.25, 0.7);
      const steam = Array.from({ length: 6 }, (_, i) => { const t = (g * 0.25 + i / 6) % 1; return `<circle cx="${f(700 + Math.sin(g + i * 1.7) * 60)}" cy="${f(560 - t * 300)}" r="${f(24 + t * 50)}" fill="#D8D4CC" opacity="${f(0.4 * (1 - t))}"/>`; }).join('');
      return glow(id, 700, 700, 300, g, 0, 0.55) + flame(660, 780, 1.6, g) + flame(740, 784, 1.4, g, 0.4) + ding(700, 760, 1.5) + steam +
        person({ x: 1200, y: 840, s: 1.7, who: 'xiangyu', pose: P.point(1), g, face: -1, detail: true, mood: 'sneer' }) +
        person({ x: lerp(380, 500, k), y: 840, s: 1.4, who: 'soldier', pose: P.walk(g, 0.5), g, face: 1 }) + person({ x: lerp(280, 400, k), y: 846, s: 1.4, who: 'kuaitong', pose: { ...P.stand(), lean: -18, head: -14, aF: 120, eF: 20 }, g, face: -1, mood: 'shock' });
    },
    cam: [[800, 560, 1500], [800, 600, 1350]],
  },
  'xy.east': {
    bg: (id) => sky(id, '#C9B89A', '#E6D8BC') + ridge({ y: 440, amp: 50, seed: 341, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + ruins(160, 640, 0.6),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 8; i++) o += person({ x: lerp(300, 700, u) + i * 110, y: 780 + (i % 2) * 20, s: 1.1, who: 'soldier', pose: P.walk(g + i * 0.3, 0.9), g, face: 1 });
      return o + banner(lerp(1100, 1400, u), 560, 1.3, g, RED, '楚', 0.2) + horse({ x: lerp(1000, 1350, u), y: 840, s: 1.5, face: 1, g, gait: 'walk', c: '#2A2420', rider: 'xiangyu' });
    },
    cam: [[800, 580, 1600], [880, 600, 1450]],
  },
  'xy.pass': {
    bg: (id) => sky(id, '#9AA2A0', '#D2D2C6') + ridge({ y: 300, amp: 120, seed: 351, a: 0.35, color: '#5A6460' }) + ridge({ y: 460, amp: 90, seed: 352, a: 0.5, color: '#4A524E' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#8A8A74"/><path d="M700,480 Q760,560 640,640 L760,640 Q880,560 780,480 Z" fill="#B8AE8E"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.35, 0.9);
      let o = '';
      for (let i = 0; i < 6; i++) { const t = clamp01(k * 1.4 - i * 0.12); if (t > 0) o += person({ x: lerp(730, 900 + i * 90, t), y: lerp(500, 760 + (i % 2) * 20, t), s: lerp(0.5, 1.1, t), who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.9), g, face: 1, a: Math.min(1, t * 3) }); }
      return o + (k > 0.1 ? banner(lerp(740, 860, k), lerp(480, 600, k), lerp(0.5, 1.1, k), g, RED, '汉', 0.1, Math.min(1, k * 3)) : '');
    },
    cam: [[800, 500, 1500], [820, 540, 1300]],
  },
};
void campfire; void flame; void tent; void glassesShot; void horse; void vtext;
