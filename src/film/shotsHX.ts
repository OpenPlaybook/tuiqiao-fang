// 韩信线（新写的支线）：假王真王
import { GOLD, INK, PAPER, RED, banner, cityWall, f, glow, lerp, seg, sky, soundRings, vtext } from './core';
import { P, faceCU, person } from './rig';
import { tentIn } from './shots2';
import type { ShotDef } from './Film';

/** 一卷帛书（信） */
const letter = (x: number, y: number, s = 1, open = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><rect x="${f(-60 * open)}" y="-40" width="${f(120 * open)}" height="80" fill="#F1E8D6" stroke="#8A6A3A" stroke-width="3"/>` +
  (open > 0.6 ? [0, 1, 2, 3].map((i) => `<path d="M${-40 + i * 24},-26 v52" stroke="${INK}" stroke-width="3" opacity=".5"/>`).join('') : '') + `<rect x="${f(-60 * open - 8)}" y="-44" width="12" height="88" fill="#8A6A3A"/></g>`;

export const SHOTS_HX: Record<string, ShotDef> = {
  'hx.qi': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + cityWall(-100, 600, 1800, 1.2, 0.7) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + vtext(1180, 340, '齐', 52, INK, 0.75),
    fg: (u, g) => {
      let o = banner(800, 380, 1.1, g, '#3A4A5A', '汉', seg(u, 0.1, 0.4) > 0.5 ? 0 : 0.2, seg(u, 0.1, 0.4));
      for (let i = 0; i < 8; i++) o += person({ x: 200 + i * 150, y: 820 + (i % 2) * 24, s: 1.1, who: 'hanSoldier', pose: P.mix(P.stand(), P.cheer(g + i), seg(u, 0.3, 0.6)), g, face: i < 4 ? 1 : -1 });
      return o + person({ x: 800, y: 790, s: 1.6, who: 'hanxinLang', pose: P.mix(P.stand(), P.point(1), seg(u, 0.5, 0.8)), g, face: 1, detail: true });
    },
    cam: [[800, 560, 1600], [800, 600, 1400]],
  },
  'hx.letter': {
    bg: (id) => tentIn(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.4, 0.8);
      return glow(id, 800, 560, 300, g, 0, 0.4) + person({ x: 560, y: 800, s: 1.55, who: 'hanxinLang', pose: { ...P.stand(), aF: 40, eF: 70 }, g, face: 1, detail: true }) +
        person({ x: lerp(800, 1300, k), y: 806, s: 1.35, who: 'crowd1', pose: k > 0.02 && k < 0.98 ? P.walk(g, 0.8) : P.bow(0.5), g, face: k > 0.02 ? 1 : -1, hold: 'scroll' }) +
        `<g opacity="${f(1 - k)}">${letter(700, 640, 0.9, 1)}</g>` + `<g opacity="${f(seg(u, 0.1, 0.3) * (1 - k))}">${vtext(1240, 200, '愿为假王便', 44, GOLD, 0.9)}</g>`;
    },
    cam: [[840, 560, 1400], [900, 580, 1250]],
  },
  'hx.angry': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0.25, 0.5);
      return glow(id, 800, 560, 300, g, 0, 0.45) + `<rect x="640" y="700" width="320" height="30" fill="#6A3A2C"/>` + letter(820, 640, 0.8, seg(u, 0, 0.2)) +
        person({ x: 780, y: 790, s: 1.55, who: 'liubangGen', pose: P.mix({ ...P.sitCross(), aF: 60, eF: 60, head: 14 }, { ...P.sitCross(), aF: 140, eF: -10, head: -10, lean: -8 }, k), g, face: 1, detail: true, mood: k > 0.4 ? 'sneer' : 'calm' }) +
        (k > 0.5 ? soundRings(880, 520, g, { dir: 1, n: 3, r0: 30 }) : '') +
        person({ x: 1180, y: 806, s: 1.35, who: 'crowd1', pose: P.mix(P.bow(0.4), { ...P.stand(), lean: -14, head: -10 }, k), g, face: -1, mood: k > 0.4 ? 'shock' : 'calm' }) +
        person({ x: 500, y: 800, s: 1.4, who: 'zhangliang', pose: P.stand(), g, face: 1, detail: true }) + person({ x: 380, y: 806, s: 1.35, who: 'chenping', pose: P.stand(), g, face: 1, detail: true });
    },
    cam: [[800, 580, 1400], [800, 600, 1250]],
  },
  'hx.kick': {
    // 特写：案下几只脚，一只靴子踩上了另一只
    bg: (id) => sky(id, '#3A2A20', '#4A3628') + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#6A2E26"/><rect x="-200" y="200" width="2000" height="80" fill="#5A3A28" stroke="${INK}" stroke-width="4"/><path d="M200,280 L200,620 M1400,280 L1400,620" stroke="#4A3022" stroke-width="30"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.25, 0.5), back = seg(u, 0.7, 0.9);
      const boot = (x: number, y: number, c: string, flip = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${flip},1)"><path d="M-40,-200 L40,-200 L40,-40 Q40,0 100,0 L110,30 L-40,30 Z" fill="${c}" stroke="${INK}" stroke-width="4"/></g>`;
      return `<rect x="560" y="300" width="130" height="320" fill="#5E201A"/>` + boot(620, 600, '#2A2420', 1) + `<g opacity=".95">${boot(lerp(1000, 760, k * (1 - back)), lerp(600, 560, k * (1 - back)), '#3A4038', -1)}</g><rect x="${f(lerp(990, 750, k * (1 - back)))}" y="300" width="110" height="${f(lerp(120, 80, k * (1 - back)))}" fill="#6B7A6A"/>` +
        (k > 0.9 && back < 0.1 ? `<path d="M700,520 l-30,-30 M720,510 l0,-40 M740,520 l30,-30" stroke="#E9DFCB" stroke-width="5"/>` : '');
    },
    cam: [[800, 460, 1300], [800, 460, 1200]],
  },
  'hx.whisper': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => glow(id, 800, 560, 300, g, 0, 0.45) + `<rect x="640" y="700" width="320" height="30" fill="#6A3A2C"/>` +
      person({ x: 820, y: 790, s: 1.6, who: 'liubangGen', pose: { ...P.sitCross(), head: -14, lean: -6 }, g, face: 1, detail: true, mood: 'shock' }) +
      person({ x: 650, y: 790, s: 1.5, who: 'zhangliang', pose: { ...P.stand(), lean: 30, head: 10, aF: 60, eF: 90 }, g, face: 1, detail: true }) +
      person({ x: 540, y: 796, s: 1.45, who: 'chenping', pose: { ...P.stand(), lean: 18, head: 8 }, g, face: 1, detail: true }) +
      person({ x: 1260, y: 806, s: 1.35, who: 'crowd1', pose: { ...P.stand(), head: 10 }, g, face: -1, a: 0.7 }),
    cam: [[800, 580, 1300], [740, 580, 1050]],
  },
  'hx.turn': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.6);
      return glow(id, 800, 560, 300, g, 0, 0.45) + `<rect x="640" y="700" width="320" height="30" fill="#6A3A2C"/>` +
        person({ x: 820, y: 790, s: 1.55, who: 'liubangGen', pose: P.mix({ ...P.sitCross(), aF: 140, eF: -10, head: -10 }, { ...P.sitCross(), aF: 110 + 10 * Math.sin(g * 6), eF: 30, head: -16, lean: -6 }, k), g, face: 1, detail: true, mood: k > 0.5 ? 'laugh' : 'sneer' }) +
        person({ x: 1180, y: 806, s: 1.35, who: 'crowd1', pose: P.mix({ ...P.stand(), lean: -14 }, P.bow(0.7), k), g, face: -1, mood: k > 0.5 ? 'laugh' : 'shock' }) +
        person({ x: 520, y: 800, s: 1.4, who: 'zhangliang', pose: P.stand(), g, face: 1, detail: true }) + person({ x: 400, y: 806, s: 1.35, who: 'chenping', pose: P.stand(), g, face: 1, detail: true, mood: k > 0.5 ? 'laugh' : 'calm' }) +
        `<g opacity="${f(seg(u, 0.5, 0.8))}">${vtext(1280, 330, '何以假为', 46, GOLD, 0.9)}</g>`;
    },
    cam: [[800, 580, 1400], [820, 600, 1250]],
  },
  'hx.crown': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + cityWall(-100, 600, 1800, 1.2, 0.6) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.2, 0.6), crowned = u > 0.6;
      let o = banner(1000, 420, 1.2, g, RED, '齐', 0.1);
      for (let i = 0; i < 6; i++) o += person({ x: 200 + i * 120, y: 850 + (i % 2) * 20, s: 1.05, who: 'hanSoldier', pose: P.mix(P.stand(), P.cheer(g + i), seg(u, 0.6, 0.9)), g, face: 1 });
      return o + person({ x: 1050, y: 790, s: 1.6, who: crowned ? 'king' : 'hanxinLang', pose: P.mix(P.stand(), P.bow(0.5), k * (1 - seg(u, 0.6, 0.8))), g, face: -1, detail: true }) +
        person({ x: 800, y: 790, s: 1.5, who: 'zhangliang', pose: P.mix(P.stand(), P.give(1), k), g, face: 1, detail: true }) +
        `<rect x="${f(lerp(860, 950, k))}" y="${f(lerp(680, 660, k))}" width="34" height="34" fill="${GOLD}" stroke="${INK}" stroke-width="2" opacity="${f(1 - seg(u, 0.6, 0.7))}"/>`;
    },
    cam: [[800, 580, 1500], [900, 600, 1300]],
  },
  'hx.cu4': {
    bg: (id) => sky(id, '#3E3226', '#5A4836') + glow(id, 1250, 500, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'hanxinKing', g, id, brow: -0.1, mouth: 0, look: 0.3 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
};
