// 尾声　鸟尽弓藏：每一镜怎么画、怎么动（对照 第六堂课/分镜/尾声_鸟尽弓藏.md）。不画杀人的场面，用灯灭、钟摇、人影走开来交代。
import { GOLD, INK, PAPER, RED, banner, f, flame, glow, lerp, mist, moon, ridge, rng, seg, sky, sunDisc, torch, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import { dais, deskShot, roll, tentIn } from './shots2';
import { deskBg, glasses, slips } from './shots1';
import type { ShotDef } from './Film';

const KAI = `style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif"`;
/** 宫殿里：红柱、台阶、帷幕 */
const hall = (id: string, dark = false) =>
  sky(id, dark ? '#1E1A1E' : '#5A3A30', dark ? '#3A2E2E' : '#7A5240') +
  Array.from({ length: 6 }, (_, i) => `<rect x="${60 + i * 300}" y="-100" width="56" height="900" fill="${dark ? '#4A1E1E' : '#8A2E26'}" stroke="${INK}" stroke-width="3"/>`).join('') +
  `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="${dark ? '#2A2020' : '#4A3428'}"/>`;
/** 皇帝的宝座 */
const throne = (x: number, y: number) => `<path d="M${x - 140},${y} L${x + 140},${y} L${x + 120},${y - 30} L${x - 120},${y - 30} Z" fill="#6A2E26" stroke="${INK}" stroke-width="3"/><path d="M${x - 110},${y - 30} L${x - 110},${y - 200} Q${x},${y - 250} ${x + 110},${y - 200} L${x + 110},${y - 30}" fill="#7A3A2C" stroke="${GOLD}" stroke-width="4"/>`;
/** 囚车：木笼子 + 轮子 */
const cage = (x: number, y: number, s: number, g: number) => {
  let o = `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><rect x="-120" y="-200" width="240" height="190" fill="none" stroke="#5A3A20" stroke-width="10"/>`;
  for (let i = 0; i < 7; i++) o += `<line x1="${-100 + i * 33}" y1="-200" x2="${-100 + i * 33}" y2="-10" stroke="#5A3A20" stroke-width="8"/>`;
  o += `<rect x="-140" y="-14" width="280" height="20" fill="#6A4A2E"/>`;
  for (const wx of [-90, 90]) o += `<g transform="translate(${wx},20) rotate(${f(g * 80)})"><circle r="40" fill="none" stroke="#4A3A2A" stroke-width="8"/><path d="M-40,0 H40 M0,-40 V40" stroke="#4A3A2A" stroke-width="5"/></g>`;
  return o + '</g>';
};
/** 大钟 */
const bell = (x: number, y: number, s: number, swing: number) => `<g transform="translate(${x},${y}) rotate(${f(swing)}) scale(${s})"><line x1="0" y1="-200" x2="0" y2="-120" stroke="${INK}" stroke-width="10"/><path d="M-90,-120 Q-100,40 -130,80 L130,80 Q100,40 90,-120 Z" fill="#6E5A3A" stroke="${INK}" stroke-width="5"/><path d="M-110,30 H110 M-100,-40 H100" stroke="#4A3A24" stroke-width="5"/><ellipse cx="0" cy="80" rx="130" ry="18" fill="#4A3A24"/></g>`;

export const SHOTS7: Record<string, ShotDef> = {
  // ---------- 0 刘邦称帝，徙齐王信为楚王 ----------
  'k.palace': {
    bg: (id) => hall(id) + throne(800, 640),
    fg: (u, g, id) => {
      let o = glow(id, 800, 420, 300, g, 0, 0.35) + person({ x: 800, y: 610, s: 1.3, who: 'liubang', pose: P.sitCross(), g, face: 1, detail: true });
      for (let i = 0; i < 4; i++) o += person({ x: 220 + i * 120, y: 800, s: 1.2, who: i === 3 ? 'king' : 'crowd2', pose: P.bow(0.4 + (i === 3 ? seg(u, 0.4, 0.8) * 0.4 : 0)), g, face: 1 }) + person({ x: 1380 - i * 120, y: 800, s: 1.2, who: 'crowd1', pose: P.bow(0.4), g, face: -1 });
      return o;
    },
    cam: [[800, 520, 1600], [700, 560, 1300]],
  },
  'k.tuhu': {
    bg: (id) => tentIn(id, true) + dais(),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.6);
      return glow(id, 1000, 500, 280, g, 0, 0.4) + person({ x: 1200, y: 640, s: 1.45, who: 'king', pose: P.mix(P.sitCross(), { ...P.sitCross(), aF: 70, eF: 20 }, k), g, face: -1, detail: true }) +
        person({ x: 760, y: 790, s: 1.5, who: 'tuhu', pose: P.mix({ ...P.kneelWash(0), aF: 20, eF: 30, aB: 20, eB: 30, lean: 30, head: 20 }, P.bow(0.5), seg(u, 0.5, 0.9)), g, face: 1, detail: true, mood: k > 0.5 ? 'shock' : 'sad' });
    },
    cam: [[980, 560, 1300], [980, 560, 1200]],
  },
  'k.hxspeak': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636') + glow(id, 1250, 520, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'hanxinKing', g, id, brow: 0.2, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, nod: Math.sin(g * 1.2) * 0.25 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  // ---------- 3 钟离眛来投 ----------
  'k.zlm': {
    bg: (id) => sky(id, '#1E2230', '#3A3B48') + moon(id, 1300, 160, 40) + ridge({ y: 440, amp: 80, seed: 141, a: 0.6, color: '#161922' }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#2A2B32"/><rect x="1000" y="380" width="500" height="260" fill="#3A2E2A" stroke="${INK}" stroke-width="4"/><rect x="1180" y="480" width="140" height="160" fill="#1A1412"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.6);
      return torch(id, 1150, 460, 1, g) + torch(id, 1350, 460, 1, g, 0.4) + person({ x: lerp(300, 980, k), y: 790, s: 1.4, who: 'zhonglimo', pose: k < 1 ? P.walk(g) : P.bow(0.4), g, face: 1, detail: true }) + person({ x: 1250, y: 790, s: 1.4, who: 'king', pose: P.mix(P.stand(), P.give(1), seg(u, 0.55, 0.85)), g, face: -1, detail: true });
    },
    cam: [[800, 560, 1600], [1080, 600, 1200]],
  },
  'k.yunmeng': {
    bg: (id) => sky(id, '#C9D3D6', '#E6E8E2') + ridge({ y: 380, amp: 60, seed: 142, a: 0.25 }) + `<path d="M-200,520 Q800,480 1800,520 L1800,640 Q800,620 -200,650 Z" fill="#8FA9B8" opacity=".8"/><path d="M-200,650 Q800,620 1800,640 L1800,1100 L-200,1100 Z" fill="#B9A988"/>` + vtext(1450, 440, '云梦', 36, '#4A6A80', 0.8),
    fg: (u, g) => {
      const k = seg(u, 0, 1); let o = '';
      for (let i = 0; i < 8; i++) o += horse({ x: lerp(-200, 900, k) - i * 140, y: 760 + (i % 2) * 30, s: 0.75, g, gait: 'walk', ph: g + i * 0.3, rider: i === 2 ? 'liubang' : 'hanSoldier', face: 1 }) + (i % 3 === 0 ? banner(lerp(-200, 900, k) - i * 140, 560, 0.6, g, RED, '汉', i * 0.2, 0.9) : '');
      return o;
    },
    cam: [[800, 560, 1600], [800, 580, 1500]],
  },
  'k.dilemma': {
    bg: (id) => hall(id, true),
    fg: (u, g, id) => {
      const x = 800 + Math.sin(g * 0.8) * 220;
      return glow(id, 800, 500, 260, g, 0, 0.35) + flame(800, 560, 1.2, g) + person({ x, y: 790, s: 1.5, who: 'king', pose: P.walk(g * 0.8), g, face: Math.cos(g * 0.8) > 0 ? 1 : -1, detail: true }) +
        person({ x: 1300, y: 800, s: 1.35, who: 'crowd2', pose: P.mix(P.bow(0.3), P.point(0.6), seg(u, 0.5, 0.8)), g, face: -1, detail: true });
    },
    cam: [[880, 560, 1400], [900, 560, 1300]],
  },
  'k.zlmcu': {
    bg: (id) => sky(id, '#22202A', '#3A2E34') + glow(id, 1200, 420, 420, 0, 0, 0.45),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'zhonglimo', g, id, brow: -1, mouth: 0.5 + 0.1 * Math.sin(g * 8), shake: 0.3 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'k.zlmleave': {
    bg: (id) => hall(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.5), dark = seg(u, 0.55, 0.95);
      return glow(id, 800, 500, 260, g, 0, 0.35 * (1 - dark)) + person({ x: lerp(800, 1200, k), y: 790, s: 1.5, who: 'zhonglimo', pose: P.walk(g, 1 - seg(u, 0.45, 0.55)), g, face: 1, detail: true }) +
        person({ x: 500, y: 790, s: 1.5, who: 'king', pose: { ...P.stand(), head: 18 }, g, face: 1, detail: true, mood: 'sad' }) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#000" opacity="${f(dark * 0.85)}"/>`;
    },
    cam: [[800, 560, 1400], [800, 560, 1300]],
  },
  // ---------- 8 被缚，载后车 ----------
  'k.bound': {
    bg: (id) => sky(id, '#B9B2A4', '#D9D2C4') + ridge({ y: 420, amp: 60, seed: 143, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#A89A7C"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.2, 0.6);
      let o = person({ x: 1200, y: 780, s: 1.45, who: 'liubang', pose: P.point(seg(u, 0, 0.2)), g, face: -1, detail: true });
      o += person({ x: 760, y: 800, s: 1.45, who: 'king', pose: P.mix(P.bow(0.6), { ...P.kneelWash(0), aF: -20, eF: 20, aB: -20, eB: 20, lean: 20, head: 16 }, k), g, face: 1, detail: true });
      o += person({ x: lerp(560, 640, k), y: 800, s: 1.4, who: 'hanSoldier', pose: P.give(k), g, face: 1 }) + person({ x: lerp(980, 880, k), y: 800, s: 1.4, who: 'hanSoldier', pose: P.give(k), g, face: -1 });
      if (k > 0.6) o += `<path d="M720,650 q40,20 80,0 M720,670 q40,20 80,0" stroke="#B89A5A" stroke-width="7" fill="none"/>`;
      return o;
    },
    cam: [[880, 580, 1400], [860, 600, 1250]],
  },
  'k.cart': {
    bg: (id) => sky(id, '#9A8E80', '#C9BEAC') + ridge({ y: 400, amp: 80, seed: 144, a: 0.3 }) + `<path d="M-200,680 L1800,680 L1800,1100 L-200,1100 Z" fill="#8A7E68"/>`,
    fg: (u, g, id) => {
      const x = lerp(1100, 700, seg(u, 0, 1));
      let o = person({ x, y: 720, s: 1.1, who: 'hanxin', pose: { ...P.sitCross(), head: -20 }, g, face: 1, detail: true, mood: 'sad' }) + cage(x, 740, 1, g * 0.3);
      const b = seg(u, 0.3, 0.9);
      for (let i = 0; i < 3; i++) { const bx = 1300 + b * 300 + i * 60, by = 220 - b * 120 - i * 20; o += `<path d="M${f(bx - 20)},${f(by)} q20,${f(-14 + wav(g, 0.4, i * 0.3) * 8)} 40,0" stroke="${INK}" stroke-width="4" fill="none" opacity="${f(1 - b)}"/>`; }
      o += `<g opacity="${f(seg(u, 0.5, 0.9))}" transform="translate(300,300)"><path d="M0,-120 Q60,0 0,120" stroke="#6A4A2E" stroke-width="10" fill="none"/><line x1="0" y1="-120" x2="0" y2="120" stroke="#C9BEAC" stroke-width="2"/></g>`;
      return o + mist(id, 145, g, { y: 640, h: 60, a: 0.3, n: 4 });
    },
    cam: [[800, 520, 1500], [780, 560, 1300]],
  },
  'k.demote': {
    bg: (id) => hall(id) + throne(1250, 640),
    fg: (u, g) => {
      const sw = seg(u, 0.4, 0.8);
      return person({ x: 1250, y: 610, s: 1.25, who: 'liubang', pose: P.sitCross(), g, face: -1, detail: true }) + person({ x: 640, y: 800, s: 1.45, who: 'hanxin', pose: { ...P.kneelWash(0), aF: 50, eF: 60, aB: 40, eB: 60, lean: 30, head: 20 }, g, face: 1, detail: true }) +
        `<g transform="translate(640,320)"><rect x="-160" y="-50" width="320" height="100" rx="8" fill="#6A2E26" stroke="${GOLD}" stroke-width="4"/><text x="0" y="22" font-size="60" text-anchor="middle" fill="${GOLD}" opacity="${f(1 - sw)}" ${KAI}>楚王</text><text x="0" y="22" font-size="56" text-anchor="middle" fill="${GOLD}" opacity="${f(sw)}" ${KAI}>淮阴侯</text></g>`;
    },
    cam: [[900, 520, 1500], [880, 540, 1350]],
  },
  // ---------- 11 多多益善 ----------
  'k.chat': {
    bg: (id) => hall(id),
    fg: (u, g, id) => {
      const a = seg(u, 0.3, 0.5), b = seg(u, 0.7, 0.9);
      return glow(id, 800, 520, 260, g, 0, 0.4) + `<rect x="440" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/><rect x="990" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/>` +
        person({ x: 520, y: 700, s: 1.45, who: 'liubang', pose: P.mix(P.sitRest(), P.point(0.6), 0.3), g, face: 1, detail: true, mood: 'laugh' }) + person({ x: 1080, y: 700, s: 1.45, who: 'hanxin', pose: P.mix(P.sitRest(), P.point(0.6), 0.3 + 0.3 * Math.sin(g * 1.4)), g, face: -1, detail: true }) +
        `<text x="560" y="360" font-size="64" text-anchor="middle" fill="${GOLD}" opacity="${f(a)}" ${KAI}>十万</text><text x="1040" y="360" font-size="58" text-anchor="middle" fill="${GOLD}" opacity="${f(b)}" ${KAI}>多多益善</text>`;
    },
    cam: [[800, 520, 1400], [800, 520, 1300]],
  },
  'k.lbsmile': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636') + glow(id, 1250, 520, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'liubang', g, id, brow: 0.3, mouth: 0.5, open: 0.7, nod: Math.sin(g * 5) * 0.4 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'k.hxanswer': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636') + glow(id, 1250, 520, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'hanxin', g, id, brow: 0.3, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, nod: Math.sin(g * 1.2) * 0.2 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'k.fankuai': {
    bg: (id) => sky(id, '#C9C4B6', '#E6E0D2') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B9A988"/><rect x="900" y="300" width="560" height="340" fill="#6A4A3A" stroke="${INK}" stroke-width="4"/><rect x="1110" y="460" width="140" height="180" fill="#2A1E18"/>`,
    fg: (u, g) => {
      const out = seg(u, 0.55, 1);
      return person({ x: 1000, y: 800, s: 1.5, who: 'fankuai', pose: { ...P.kneelWash(0), aF: 60, eF: 90, aB: 60, eB: 90, lean: 30, head: 10 }, g, face: -1, detail: true }) +
        person({ x: lerp(1180, 500, out), y: 800, s: 1.45, who: 'hanxin', pose: out > 0 ? P.walk(g) : P.stand(), g, face: -1, detail: true, mood: out > 0.5 ? 'laugh' : 'calm' });
    },
    cam: [[900, 560, 1500], [760, 580, 1300]],
  },
  // ---------- 15 吕后与萧何；长乐钟室 ----------
  'k.night': {
    bg: (id) => hall(id, true),
    fg: (u, g, id) => glow(id, 800, 520, 220, g, 0, 0.5) + flame(800, 580, 1.2, g) + `<rect x="786" y="580" width="28" height="40" fill="#8A6A3A"/>` +
      person({ x: 600, y: 790, s: 1.45, who: 'lvhou', pose: P.mix(P.stand(), P.point(0.7), 0.4 + 0.3 * Math.sin(g * 1.3)), g, face: 1, detail: true }) + person({ x: 1000, y: 790, s: 1.45, who: 'xiaohe', pose: { ...P.bow(0.3), head: 14 }, g, face: -1, detail: true }),
    cam: [[800, 560, 1300], [800, 560, 1150]],
  },
  'k.bell': {
    bg: (id) => hall(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.5), dark = seg(u, 0.6, 1), sw = Math.sin(g * 2) * 6 * seg(u, 0.5, 0.7);
      let o = bell(800, 420, 1.4, sw) + glow(id, 800, 400, 300, g, 0, 0.3 * (1 - dark));
      o += person({ x: lerp(200, 640, k), y: 800, s: 1.4, who: 'hanxin', pose: k < 1 ? P.walk(g * 0.8) : P.stand(), g, face: 1, detail: true });
      o += person({ x: lerp(1600, 960, seg(u, 0.35, 0.6)), y: 800, s: 1.4, who: 'hanSoldier', pose: P.walk(g), g, face: -1, hold: 'spear' }) + person({ x: lerp(-200, 360, seg(u, 0.4, 0.65)), y: 800, s: 1.4, who: 'hanSoldier', pose: P.walk(g), g, face: 1, hold: 'spear' });
      return o + `<rect x="-200" y="-200" width="2000" height="1400" fill="#000" opacity="${f(dark * 0.8)}"/>`;
    },
    cam: [[800, 520, 1500], [760, 540, 1300]],
  },
  'k.hxlast': {
    bg: (id) => sky(id, '#141218', '#2A2228') + glow(id, 1250, 420, 360, 0, 0, 0.35),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'hanxin', g, id, brow: 0.9, mouth: Math.sin(g * 6) > 0.4 ? 0.5 : -0.6, open: 0.7, tear: seg(u, 0.4, 0.95) }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'k.xiaohe': {
    bg: (id) => hall(id, true),
    fg: (u, g, id) => {
      // 左：月夜追人；右：宫门前引人进去（两半各一张画）
      const left = `<g><rect x="-200" y="-200" width="1000" height="1400" fill="#1A2030"/>${moon(id, 380, 160, 40)}<path d="M-200,620 L800,620 L800,1100 L-200,1100 Z" fill="#283040"/>${horse({ x: 300 + Math.sin(g) * 30, y: 760, s: 0.9, g, gait: 'run', ph: g * 1.8, rider: 'xiaohe', face: 1 })}</g>`;
      const right = `<g>${person({ x: 1100, y: 790, s: 1.3, who: 'xiaohe', pose: P.mix(P.stand(), P.point(1), 0.7), g, face: 1 })}${person({ x: 1300, y: 790, s: 1.3, who: 'hanxin', pose: P.walk(g * 0.6), g, face: 1 })}</g>`;
      return left + `<line x1="800" y1="-100" x2="800" y2="1000" stroke="${PAPER}" stroke-width="8"/>` + right + `<text x="300" y="120" font-size="54" text-anchor="middle" fill="#F4F1E8" opacity="${f(seg(u, 0.1, 0.3))}" ${KAI}>成</text><text x="1300" y="120" font-size="54" text-anchor="middle" fill="#F4F1E8" opacity="${f(seg(u, 0.4, 0.6))}" ${KAI}>败</text>`;
    },
    cam: [[800, 450, 1600], [800, 450, 1600]],
  },
  'k.lbreturn': {
    bg: (id) => hall(id) + throne(1250, 640),
    fg: (u, g) => person({ x: 900, y: 790, s: 1.5, who: 'liubang', pose: { ...P.stand(), head: Math.sin(g * 2) * 8 }, g, face: 1, detail: true, mood: seg(u, 0.3, 0.5) > 0.5 ? 'sad' : 'laugh' }) + person({ x: 1250, y: 800, s: 1.35, who: 'lvhou', pose: P.bow(0.2), g, face: -1, detail: true }),
    cam: [[1000, 560, 1300], [980, 560, 1150]],
  },
  'k.simaqian': {
    bg: (id) => deskBg(id),
    fg: (u, g, id) => glow(id, 1280, 560, 140, g) + flame(1280, 600, 1.6, g) + `<rect x="1262" y="600" width="36" height="40" fill="#8A6A3A"/>` + slips(420, 470, 18, 0.62, '假令韩信学道谦让不伐己功不矜其能', seg(u, 0, 0.9)) + person({ x: 900, y: 700, s: 1.35, who: 'simaqian', pose: P.write(g), g, face: -1, hold: 'brush', detail: true }),
    cam: [[800, 520, 1300], [760, 540, 1150]],
  },
  'k.desk': deskShot('韩信的一生留给后人许多值得深思的发人深省的教训'),
  'k.close': {
    bg: (id) => deskBg(id),
    fg: (u, g, id) => {
      const roll2 = seg(u, 0.1, 0.6), lift = seg(u, 0.5, 0.9);
      return glow(id, 1280, 560, 140, g) + flame(1280, 600, 1.6, g) + `<rect x="1262" y="600" width="36" height="40" fill="#8A6A3A"/>` +
        (roll2 < 1 ? `<g opacity="${f(1 - roll2)}">${slips(lerp(420, 600, roll2), 470, Math.max(2, Math.round(18 - roll2 * 16)), 0.62, '淮阴侯韩信者淮阴人也')}</g>` : '') + `<g opacity="${f(roll2)}">${roll(760, 600, 2.2)}</g>` +
        glasses(820, lerp(400, 160, lift), 0.8, g, 0, true) + `<rect x="-200" y="-200" width="2000" height="1400" fill="${PAPER}" opacity="${f(seg(u, 0.8, 1) * 0.8)}"/>`;
    },
    cam: [[800, 520, 1300], [800, 500, 1200]],
  },
};
