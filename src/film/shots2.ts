// 第二回　执戟郎中：每一镜怎么画、怎么动（对照 第六堂课/分镜/第二回_执戟郎中.md）
import { GOLD, INK, PAPER, RED, banner, bareTree, campfire, cityWall, f, flame, glow, lerp, mist, rain, ridge, river, rng, seg, sky, soundRings, sunDisc, tent, torch, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import { deskBg, glasses, slips } from './shots1';
import type { ShotDef } from './Film';

// ---------------- 共用的背景 ----------------
/** 大泽乡的野地：低低的天、远处的土坡 */
export const plainBg = (id: string, o: { dark?: boolean; wet?: boolean } = {}) =>
  sky(id, o.dark ? '#2A2A30' : o.wet ? '#8C9096' : '#D9CFBC', o.dark ? '#45434A' : o.wet ? '#B4B2AA' : PAPER) +
  ridge({ y: 400, amp: 70, seed: 41, a: o.dark ? 0.5 : 0.18, color: o.dark ? '#1C1C22' : INK }) + ridge({ y: 460, amp: 40, seed: 43, a: o.dark ? 0.6 : 0.24, color: o.dark ? '#25242A' : INK }) +
  `<path d="M-200,560 Q800,540 1800,562 L1800,1100 L-200,1100 Z" fill="${o.dark ? '#2E2C30' : o.wet ? '#7E7A70' : '#C9B994'}"/>`;
/** 一队小人（远景），walk 0—1 走路的幅度 */
const column = (seed: number, x0: number, x1: number, y: number, n: number, s: number, g: number, walk: number, who = 'rebel', face: 1 | -1 = 1, dx = 0) => {
  const r = rng(seed); let o = '';
  for (let i = 0; i < n; i++) { const x = x0 + ((x1 - x0) * i) / n + r() * 20 + dx, yy = y + (i % 3) * 14 + r() * 6; o += person({ x, y: yy, s: s * (0.92 + r() * 0.16), who, pose: walk > 0.05 ? P.walk(g * 0.9 + r(), walk) : P.mix(P.stand(), P.slump(), 0.1), g, face }); }
  return o;
};
/** 竖起来的竹竿和布旗（rise 0 平放 — 1 竖直） */
const pole = (x: number, y: number, h: number, rise: number, g: number, c = RED, ph = 0) => {
  const a = lerp(-84, wav(g, 2.2, ph) * 3, rise);
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(a)})"><line x1="0" y1="0" x2="0" y2="${-h}" stroke="#7A6A3A" stroke-width="7" stroke-linecap="round"/><path d="M0,${-h} q${f(50 + wav(g, 1.2, ph) * 10)},${f(10 + wav(g, 1.4, ph) * 8)} ${f(96 + wav(g, 1.1, ph) * 8)},${f(4 + wav(g, 1.3, ph) * 12)} l0,64 q-46,${f(6 + wav(g, 1.2, ph) * 8)} -96,-6 z" fill="${c}" opacity=".9"/></g>`;
};
/** 项羽的大帐（外面） */
export const bigTent = (x: number, y: number, s: number, g: number, open = 0.5) =>
  `<g transform="translate(${x},${y}) scale(${s})"><path d="M-260,0 L-200,-170 L0,-250 L200,-170 L260,0 Z" fill="#5A3A30" stroke="${INK}" stroke-width="4"/><path d="M-200,-170 L200,-170" stroke="${GOLD}" stroke-width="4" opacity=".6"/>` +
  `<path d="M${f(-70 * open)},0 L0,-150 L${f(70 * open)},0 Z" fill="#2A1E18"/><path d="M0,-250 L0,-320" stroke="${INK}" stroke-width="6"/>${banner(0, -320, 0.7, g, RED, '项', 0, 0.95)}</g>`;
/** 帐子里面：毡壁、柱子、地上的席 */
export const tentIn = (id: string, warm = false) =>
  sky(id, warm ? '#3E2E24' : '#2A211C', warm ? '#5A4434' : '#3E3028') + `<path d="M-200,-100 Q800,120 1800,-100 L1800,700 L-200,700 Z" fill="#4A3A2E"/>` +
  Array.from({ length: 9 }, (_, i) => `<path d="M${-100 + i * 220},-60 Q${-60 + i * 220},300 ${-110 + i * 220},700" stroke="#3A2C22" stroke-width="6" fill="none"/>`).join('') +
  `<path d="M-200,680 L1800,680 L1800,1100 L-200,1100 Z" fill="#3A2A20"/><path d="M260,720 L1340,720 L1400,800 L200,800 Z" fill="#6A2E26" opacity=".8"/>`;
/** 帐里的坐榻：人坐在上面（上沿 y=640） */
export const dais = () => `<path d="M1010,640 L1390,640 L1410,664 L990,664 Z" fill="#6A3A2C" stroke="${INK}" stroke-width="3"/><path d="M990,664 L1410,664 L1410,740 L990,740 Z" fill="#4A2A22" stroke="${INK}" stroke-width="3"/><path d="M1010,680 h380" stroke="${GOLD}" stroke-width="3" opacity=".5"/>`;
/** 一卷竹简（卷起来的） */
export const roll = (x: number, y: number, s = 1, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><ellipse cx="0" cy="0" rx="34" ry="22" fill="#C9AE74" stroke="#8A6A3A" stroke-width="3"/><ellipse cx="0" cy="0" rx="16" ry="10" fill="none" stroke="#8A6A3A" stroke-width="2"/><path d="M-34,0 L-34,-8 M34,0 L34,-8" stroke="#6E5530" stroke-width="3"/><path d="M-30,-12 h60" stroke="#6E5530" stroke-width="3"/></g>`;
/** 戟：长柄、矛尖、侧面的月牙刃 */
export const halberd = (x: number, y: number, h: number, s = 1, rot = 0, g = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><line x1="0" y1="0" x2="0" y2="${-h}" stroke="#4A3A2A" stroke-width="8" stroke-linecap="round"/><path d="M0,${-h} l-12,-10 l12,-70 l12,70 z" fill="#9A9A96" stroke="${INK}" stroke-width="2"/><path d="M4,${-h + 20} q60,-10 70,-50 q-10,40 -70,70 z" fill="#8A8A86" stroke="${INK}" stroke-width="2"/><path d="M-4,${-h + 26} q${f(-16 + wav(g, 1.2) * 4)},30 ${f(-6 + wav(g, 1.4) * 6)},${f(70 + wav(g, 1.1) * 4)}" stroke="${RED}" stroke-width="10" stroke-linecap="round" fill="none"/></g>`;
/** 东边的简图：黄河、淮河、长江（大泽乡在淮河北边） */
export const eastMap = (id: string) =>
  sky(id, '#E9DFC8', '#E3D6BA') + `<rect x="60" y="60" width="1480" height="780" rx="20" fill="#EFE6D0" stroke="#B9A57A" stroke-width="6"/>` +
  `<path d="M100,200 Q400,120 700,220 Q1000,320 1200,200 Q1350,120 1500,170" stroke="#8FA9B8" stroke-width="18" fill="none" stroke-linecap="round"/>` +
  `<path d="M300,470 Q600,430 900,470 Q1150,500 1500,450" stroke="#8FA9B8" stroke-width="10" fill="none" stroke-linecap="round"/>` +
  `<path d="M100,700 Q500,640 900,690 Q1200,730 1500,660" stroke="#8FA9B8" stroke-width="22" fill="none" stroke-linecap="round"/>` +
  vtext(160, 230, '黄河', 30, '#4A6A80', 0.7) + vtext(360, 490, '淮河', 28, '#4A6A80', 0.7) + vtext(160, 720, '长江', 30, '#4A6A80', 0.7);
/** 关中里的近处：北边渭水，南边骊山，西边咸阳 */
export const localMap = (id: string) =>
  sky(id, '#E9DFC8', '#E3D6BA') + `<rect x="60" y="60" width="1480" height="780" rx="20" fill="#EFE6D0" stroke="#B9A57A" stroke-width="6"/>` +
  `<path d="M100,220 Q500,170 900,210 Q1200,240 1500,190" stroke="#8FA9B8" stroke-width="16" fill="none" stroke-linecap="round"/>` + vtext(1440, 230, '渭水', 28, '#4A6A80', 0.7) +
  `<path d="M760,840 Q900,700 1040,760 Q1180,690 1340,800 L1340,840 Z" fill="#A89C80" opacity=".55"/>` + vtext(1050, 770, '骊山', 28, INK, 0.6) +
  `<rect x="130" y="380" width="70" height="50" fill="#8A6A44"/>` + vtext(230, 380, '咸阳', 28, INK, 0.75);
/** 关中一带的简图：黄河、渭水、函谷关 */
export const mapBg = (id: string) =>
  sky(id, '#E9DFC8', '#E3D6BA') + `<rect x="60" y="60" width="1480" height="780" rx="20" fill="#EFE6D0" stroke="#B9A57A" stroke-width="6"/>` +
  `<path d="M120,260 Q420,180 620,300 Q760,380 980,300 Q1200,220 1480,300" stroke="#8FA9B8" stroke-width="18" fill="none" stroke-linecap="round"/>` +
  `<path d="M200,520 Q420,480 620,500 Q760,512 900,470" stroke="#8FA9B8" stroke-width="10" fill="none" stroke-linecap="round"/>` +
  `<g><rect x="880" y="430" width="40" height="70" fill="#8A6A44"/><path d="M870,430 h60 l-10,-20 h-40 z" fill="#6A4A2E"/></g>` + vtext(950, 400, '函谷关', 30, INK, 0.75) + vtext(130, 330, '黄河', 30, '#4A6A80', 0.7) + vtext(330, 560, '渭水', 28, '#4A6A80', 0.7);

/** 眼镜扫过竹简上的原文（AI 眼镜翻译的那一句） */
export const glassesShot = (text: string): ShotDef => ({
  bg: (id) => deskBg(id) + slips(520, 320, 16, 1.15, text),
  fg: (u, g, id) => { const x = lerp(1060, 560, (g * 0.25) % 1); return `<rect x="${f(x - 30)}" y="320" width="60" height="320" fill="#9FD3F0" opacity=".25"/>` + glasses(x, 250, 0.7, g, (g * 0.4) % 1, true) + glow(id, x, 470, 120, g, 0, 0.2); },
  cam: [[800, 470, 1200], [800, 470, 1150]],
});
/** 夜里书案：竹简上是 AI 眼镜写的小结 */
export const deskShot = (text: string): ShotDef => ({
  bg: (id) => deskBg(id) + slips(560, 470, 16, 0.62, text),
  fg: (u, g, id) => glow(id, 1280, 560, 140, g) + flame(1280, 600, 1.6, g) + `<rect x="1262" y="600" width="36" height="40" fill="#8A6A3A"/>` + `<defs><filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter></defs>` + glasses(820, lerp(410, 390, (Math.sin(g * 1.4) + 1) / 2), 0.8, g, (g * 0.3) % 1, true),
  cam: [[800, 520, 1300], [820, 520, 1150]],
});

/** 田垄：一行行的土垄（种地的地方） */
const furrows = (y0: number, n = 7) => Array.from({ length: n }, (_, i) => `<path d="M-200,${y0 + i * 46} Q800,${y0 - 14 + i * 46} 1800,${y0 + i * 46}" stroke="#8A7656" stroke-width="${6 + i}" fill="none" opacity=".55"/>`).join('');
/** 一只燕子（小、低）或天鹅（大、高）：翅膀随 g 扇动 */
const bird = (x: number, y: number, s: number, g: number, ph = 0, c = INK) => { const w = wav(g, 0.6, ph) * 14; return `<path d="M${f(x - 30 * s)},${f(y - w * s)} Q${f(x - 12 * s)},${f(y - 8 * s)} ${f(x)},${f(y)} Q${f(x + 12 * s)},${f(y - 8 * s)} ${f(x + 30 * s)},${f(y - w * s)}" stroke="${c}" stroke-width="${f(3 * s)}" fill="none" stroke-linecap="round"/>`; };
/** 鱼（侧面朝右）；cut 0—1 肚子剖开、露出红绸 */
const fish = (x: number, y: number, s: number, cut = 0, g = 0) => `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><path d="M-120,0 Q-40,-56 70,-10 L120,-40 L110,0 L120,40 L70,10 Q-40,56 -120,0 Z" fill="#9AA6A0" stroke="${INK}" stroke-width="3"/><circle cx="-80" cy="-8" r="6" fill="${INK}"/>` +
  (cut > 0 ? `<path d="M-60,10 Q0,${f(10 + 26 * cut)} 50,8" stroke="${INK}" stroke-width="3" fill="#6A2E26"/><path d="M-20,${f(14 + 10 * cut)} q${f(40 * cut)},${f(30 * cut + wav(g, 1.2) * 4)} ${f(110 * cut)},${f(40 * cut)} l0,22 q-60,-6 ${f(-110 * cut)},-36 z" fill="${RED}" opacity="${f(cut)}"/>` + (cut > 0.6 ? `<text x="${f(30 + 40 * cut)}" y="${f(48 + 26 * cut)}" font-size="22" fill="#F4E6C8" style="font-family:KaiTi, STKaiti, serif" opacity="${f((cut - 0.6) / 0.4)}">陈胜王</text>` : '') : '') + '</g>';
/** 树林里的小破庙（丛祠） */
const shrine = (x: number, y: number, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-110,0 L-110,-120 L110,-120 L110,0 Z" fill="#3A3430" stroke="#1A1716" stroke-width="4"/><path d="M-150,-120 L0,-200 L150,-120 Z" fill="#2A2522" stroke="#1A1716" stroke-width="4"/><rect x="-34" y="-80" width="68" height="80" fill="#141210"/></g>`;
/** 竹笼罩着的火（篝火：火外面罩一个竹笼） */
const cageFire = (id: string, x: number, y: number, s: number, g: number) => glow(id, x, y - 30 * s, 220 * s, g, 0, 0.6) + flame(x, y, 1.5 * s, g) + `<g transform="translate(${x},${y}) scale(${s})">${Array.from({ length: 7 }, (_, i) => `<path d="M${-46 + i * 15},4 Q${-30 + i * 10},-70 ${-6 + i * 2},-96" stroke="#8A6A3A" stroke-width="4" fill="none" opacity=".85"/>`).join('')}<ellipse cx="0" cy="4" rx="50" ry="10" fill="none" stroke="#8A6A3A" stroke-width="4"/></g>`;

export const SHOTS2: Record<string, ShotDef> = {
  // ---------- 0 翻开《史记》，大泽乡 ----------
  'c.slips': {
    bg: (id) => deskBg(id) + slips(470, 330, 18, 1.2, '发闾左適戍渔阳九百人屯大泽乡会天大雨道不通度已失期'),
    fg: (u, g) => { const k = seg(u, 0, 0.55), shine = seg(u, 0.55, 0.9); return glow('x', 800, 470, 300, g, 0, 0.3) + glasses(800, lerp(-120, 300, k), 1.25, g, shine); },
    cam: [[800, 480, 1300], [800, 470, 1100]],
  },
  'c.camp900': {
    bg: (id) => plainBg(id) + tent(1180, 560, 0.9, '#6A5E50') + tent(1320, 566, 0.8, '#6A5E50') + tent(1440, 560, 0.85, '#6A5E50'),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.75), walk = 1 - seg(u, 0.6, 0.9);
      let o = column(5, -420, 820, 610, 36, 0.42, g, walk, 'rebel', 1, lerp(0, 380, k)) + column(6, -520, 760, 650, 34, 0.48, g, walk, 'rebel', 1, lerp(0, 380, k));
      o += horse({ x: lerp(560, 1040, k), y: 600, s: 0.55, g, gait: walk > 0.1 ? 'walk' : 'stand', ph: g, rider: 'qinguan', face: 1 });
      o += banner(lerp(500, 980, k), 470, 0.55, g, '#2B2722', '秦', 0, 0.9);
      return o + mist(id, 44, g, { y: 540, h: 40, a: 0.35, n: 5 });
    },
    cam: [[800, 500, 1600], [860, 540, 1300]],
  },
  'c.rainroad': {
    bg: (id) => plainBg(id, { wet: true }),
    fg: (u, g, id) => {
      const rise = seg(u, 0, 1);
      let o = `<path d="M-200,${f(700 - rise * 70)} Q400,${f(690 - rise * 70)} 800,${f(706 - rise * 70)} T1800,${f(700 - rise * 70)} L1800,1100 L-200,1100 Z" fill="#8FA2AE" opacity=".75"/>`;
      o += river(46, g, { y0: 700 - rise * 70, y1: 900, speed: 40, n: 60, a: 0.5 });
      o += `<path d="M300,720 Q800,640 1300,720" stroke="#6E5A40" stroke-width="40" fill="none" opacity="${f(0.6 - rise * 0.45)}"/>`; // 被水淹掉的路
      for (let i = 0; i < 9; i++) o += person({ x: 380 + i * 110, y: 640 + (i % 2) * 18, s: 0.8, who: i === 4 ? 'chensheng' : 'rebel', pose: { ...P.stand(), head: 16 + (i % 3) * 4, lean: 6 }, g, face: i % 2 ? -1 : 1, mood: 'sad' });
      return o + rain(47, g, 220, 0.5) + mist(id, 48, g, { y: 520, h: 80, a: 0.4, n: 6 });
    },
    cam: [[800, 540, 1500], [800, 580, 1250]],
  },
  'c.calendar': {
    bg: (id) => sky(id, '#3A3632', '#4A443C') + `<rect x="260" y="160" width="1080" height="560" rx="10" fill="#D8C08A" stroke="#9C8150" stroke-width="5"/>` +
      Array.from({ length: 15 }, (_, i) => `<line x1="${f(300 + i * 70)}" y1="170" x2="${f(300 + i * 70)}" y2="710" stroke="#B49864" stroke-width="3"/>`).join(''),
    fg: (u, g) => {
      let o = '';
      const n = 14, k = seg(u, 0, 0.75) * n;
      for (let i = 0; i < n; i++) {
        const x = 1300 - i * 70, done = Math.min(1, Math.max(0, k - i));
        o += vtext(x, 214, ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二', '十三', '十四'][i], 28, INK, 0.85);
        if (done > 0) o += `<path d="M${x - 24},${f(310)} L${f(x - 24 + 48 * done)},${f(310 + 300 * done)}" stroke="${INK}" stroke-width="8" stroke-linecap="round" opacity=".8"/>`;
      }
      const st = seg(u, 0.78, 0.92);
      if (st > 0) o += `<g transform="translate(800,520) scale(${f(lerp(2, 1, st))}) rotate(-8)" opacity="${f(st)}"><rect x="-90" y="-90" width="180" height="180" rx="10" fill="none" stroke="${RED}" stroke-width="12"/><text x="0" y="40" font-size="130" text-anchor="middle" fill="${RED}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">斩</text></g>`;
      return o + rain(49, g, 60, 0.18);
    },
    cam: [[800, 440, 1300], [800, 460, 1150]],
  },
  // ---------- 2 陈胜召集大家 ----------
  // ---------- 大泽乡（扩写）：陈胜年轻时、鱼腹丹书、篝火狐鸣、激怒将尉、张楚 ----------
  'c.plow': {
    bg: (id) => sky(id, '#D9CFBC', PAPER) + ridge({ y: 380, amp: 60, seed: 61, a: 0.18 }) + `<path d="M-200,470 Q800,450 1800,470 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + furrows(500),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 4; i++) o += person({ x: 260 + i * 170, y: 640 + (i % 2) * 30, s: 1.2, who: i % 2 ? 'crowd4' : 'crowd2', pose: P.kneelWash(g * 0.5 + i * 0.3), g, face: 1 });
      const k = seg(u, 0.15, 0.55);
      // 田埂：一道隆起的土垄，陈胜停下活，站到上面望着远处
      o += `<path d="M960,612 Q1150,560 1360,612 Z" fill="#9C8662"/>`;
      o += person({ x: lerp(1100, 1160, k), y: lerp(640, 592, k), s: 1.4, who: 'chensheng', pose: P.mix(P.kneelWash(0), { ...P.stand(), head: 16, aF: 10, eF: 30 }, k), g, face: -1, detail: true, mood: k > 0.5 ? 'sad' : 'calm' });
      return o;
    },
    cam: [[800, 540, 1500], [1020, 540, 1100]],
  },
  'c.birds': {
    bg: (id) => sky(id, '#C9D4D8', '#EDE6D4') + ridge({ y: 640, amp: 50, seed: 62, a: 0.2 }) + `<path d="M-200,760 Q800,740 1800,760 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 5; i++) o += bird(((200 + i * 260 + g * 60) % 1800) - 100, 640 + Math.sin(g * 2 + i) * 20, 0.8, g, i * 0.3); // 燕雀：贴着地面飞
      for (let i = 0; i < 3; i++) o += bird(((300 + i * 380 + g * 30) % 1900) - 150, 160 + i * 40, 2.4, g * 0.5, i * 0.4, '#3A3A3A'); // 鸿鹄：高高在天上
      return o + person({ x: 1200, y: 820, s: 1.3, who: 'chensheng', pose: P.mix(P.stand(), P.point(1), seg(u, 0.3, 0.7)), g, face: -1, detail: true });
    },
    cam: [[800, 470, 1600], [800, 430, 1450]],
  },
  'c.plot': {
    bg: (id) => tentIn(id),
    fg: (u, g, id) => campfire(id, 800, 760, 0.9, g) +
      person({ x: 620, y: 720, s: 1.5, who: 'chensheng', pose: { ...P.sitCross(), head: 6, aF: 60, eF: 40 }, g, face: 1, detail: true, mood: 'calm' }) +
      person({ x: 980, y: 720, s: 1.5, who: 'wuguang', pose: { ...P.sitCross(), head: 10 }, g, face: -1, detail: true }),
    cam: [[800, 600, 1300], [800, 620, 1000]],
  },
  'c.diviner': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.7);
      // 占卜：龟甲、蓍草
      return glow(id, 800, 600, 220, g, 0, 0.5) + `<ellipse cx="800" cy="720" rx="70" ry="34" fill="#8A6A44" stroke="${INK}" stroke-width="3"/><path d="M750,712 l40,-10 l30,16 l-26,12 z" stroke="${INK}" stroke-width="2" fill="none" opacity="${f(k)}"/>` +
        person({ x: 600, y: 730, s: 1.4, who: 'chensheng', pose: P.sitCross(), g, face: 1, detail: true }) + person({ x: 690, y: 740, s: 1.3, who: 'wuguang', pose: P.sitCross(), g, face: 1 }) +
        person({ x: 1000, y: 730, s: 1.4, who: 'lvgong', pose: { ...P.sitCross(), aF: lerp(50, 80, k), eF: lerp(30, 0, k) }, g, face: -1, detail: true });
    },
    cam: [[800, 600, 1200], [800, 620, 1050]],
  },
  'c.fish': {
    bg: (id) => tentIn(id) + `<rect x="300" y="700" width="1000" height="40" fill="#5A4434"/>`,
    fg: (u, g, id) => { const k = seg(u, 0.3, 0.8); return glow(id, 800, 600, 260, g, 0, 0.5) + fish(800, 640, 2.4, k, g) + person({ x: 380, y: 860, s: 1.8, who: 'rebel', pose: P.mix(P.stand(), P.point(1), k), g, face: 1, detail: true, mood: k > 0.6 ? 'shock' : 'calm' }); },
    cam: [[800, 600, 1200], [820, 640, 950]],
  },
  'c.foxcry': {
    bg: (id) => sky(id, '#14161E', '#2A2C36') + ridge({ y: 520, amp: 60, seed: 63, a: 0.7, color: '#0E1016' }) + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#1E1E24"/>` + bareTree(64, 1180, 700, 1.6, 0.9) + bareTree(65, 1420, 700, 1.3, 0.9) + shrine(1300, 700, 1.3),
    fg: (u, g, id) => {
      let o = cageFire(id, 1080, 690, 1, g);
      o += person({ x: 1170, y: 700, s: 1.2, who: 'wuguang', pose: { ...P.sing(g), lean: 20, head: -30 }, g, face: -1 });
      o += soundRings(1120, 560, g, { dir: -1, n: 4, r0: 30 });
      for (let i = 0; i < 5; i++) o += tent(160 + i * 150, 760, 0.7, '#3A3630', 0.9);
      return o;
    },
    cam: [[800, 560, 1600], [1000, 600, 1100]],
  },
  'c.point': {
    bg: (id) => plainBg(id),
    fg: (u, g) => {
      let o = person({ x: 1180, y: 760, s: 1.4, who: 'chensheng', pose: P.stand(), g, face: -1, detail: true, mood: 'calm' });
      for (let i = 0; i < 9; i++) { const x = 180 + i * 90, r = (i * 37) % 5; o += person({ x, y: 780 + (i % 3) * 26, s: 1.25, who: 'rebel', pose: i % 2 ? P.point(0.7 + 0.3 * Math.sin(g + r)) : P.mix(P.stand(), P.laugh(g), 0.15), g, face: 1 }); }
      return o;
    },
    cam: [[800, 600, 1500], [880, 620, 1250]],
  },
  'c.drunk': {
    bg: (id) => plainBg(id, { dark: true }) + tent(400, 640, 1.1, '#3A3630'),
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.9);
      return campfire(id, 760, 780, 1.1, g) +
        person({ x: 1000, y: 780, s: 1.5, who: 'qinguan', pose: P.mix({ ...P.sitCross(), lean: 18 + 6 * Math.sin(g * 1.3), head: 20 }, { ...P.stand(), aF: 70, eF: 10, lean: -6 }, k), g, face: -1, detail: true, mood: k > 0.5 ? 'sneer' : 'calm', hold: 'cup' }) +
        person({ x: 600, y: 790, s: 1.45, who: 'wuguang', pose: P.mix(P.stand(), P.point(0.8), 0.6 + 0.4 * Math.sin(g * 2)), g, face: 1, detail: true });
    },
    cam: [[800, 620, 1300], [820, 640, 1050]],
  },
  'c.throneCS': {
    bg: (id) => tentIn(id, true) + dais(),
    fg: (u, g, id) => glow(id, 1200, 520, 300, g, 0, 0.5) + banner(1380, 420, 1.1, g, RED, '张', 0) + person({ x: 1200, y: 640, s: 1.45, who: 'chensheng', pose: P.sitCross(), g, face: -1, detail: true }) +
      Array.from({ length: 4 }, (_, i) => person({ x: 400 + i * 130, y: 820, s: 1.3, who: 'rebel', pose: P.bow(0.5), g, face: 1 })).join(''),
    cam: [[900, 560, 1400], [1000, 560, 1200]],
  },
  'c.gather': {
    bg: (id) => plainBg(id, { dark: true }),
    fg: (u, g, id) => {
      let o = torch(id, 420, 560, 1.2, g, 0.1) + torch(id, 1180, 560, 1.2, g, 0.5);
      // 地上：押送军官掉下的帽子和剑（人不画）
      o += `<path d="M1060,770 q30,-26 70,-6 q-10,16 -70,6 z" fill="#1E1B1C"/><path d="M980,790 L1150,800" stroke="#9A9A96" stroke-width="6"/>`;
      const up = seg(u, 0.1, 0.5);
      o += `<path d="M640,700 Q800,620 960,700 Z" fill="#3A3634"/>` + campfire(id, 560, 790, 1.3, g); // 土坡、坡前的篝火
      o += person({ x: 800, y: lerp(720, 660, up), s: 1.25, who: 'chensheng', pose: P.mix(P.stand(), P.point(1), up), g, face: 1, detail: true, mood: 'calm' });
      o += person({ x: 700, y: 690, s: 1.15, who: 'rebel', pose: P.stand(), g, face: 1, detail: true });
      for (let i = 0; i < 16; i++) { const x = 120 + i * 92, back = i % 2; if (x > 560 && x < 1040) continue; o += person({ x, y: 820 + back * 30, s: 1.4, who: 'rebel', pose: P.mix(P.stand(), P.cheer(g), seg(u, 0.6, 1) * 0.6), g, face: x < 800 ? 1 : -1 }); }
      return o + rain(50, g, 80, 0.2);
    },
    cam: [[800, 620, 1500], [800, 640, 1200]],
  },
  'c.speak': {
    bg: (id) => plainBg(id, { dark: true }),
    fg: (u, g, id) => {
      const arm = 0.5 + 0.5 * Math.sin(g * 1.6);
      let o = glow(id, 700, 600, 260, g, 0, 0.5) + torch(id, 560, 470, 1.6, g, 0.3);
      o += person({ x: 800, y: 860, s: 2.6, who: 'chensheng', pose: P.mix(P.point(1), P.cheer(g * 0.6), 0.55 + arm * 0.45), g, face: -1, detail: true });
      for (let i = 0; i < 5; i++) o += person({ x: 200 + i * 120, y: 980, s: 2.4, who: 'rebel', pose: P.stand(), g, face: 1, a: 0.85 });
      return o + rain(51, g, 70, 0.2);
    },
    cam: [[800, 560, 1400], [820, 520, 1200]],
  },
  'c.cscu': {
    bg: (id) => sky(id, '#2A2420', '#4A3A2E') + glow(id, 1200, 400, 400, 0, 0, 0.6),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'chensheng', g, id, brow: -0.8, mouth: 0.5 + 0.1 * Math.sin(g * 8), open: 1, nod: Math.sin(g * 2) * 0.3 }) + rain(52, g, 40, 0.18),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  // ---------- 4 斩木为兵，揭竿为旗 ----------
  'c.jiegan': {
    bg: (id) => plainBg(id) + `<path d="M1200,560 Q1300,420 1420,560 Z" fill="#6E8A5A" opacity=".6"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 10; i++) { const x = 140 + i * 140, rise = seg(u, 0.05 + i * 0.05, 0.4 + i * 0.05); o += pole(x + 30, 760, 300, rise, g, i % 3 === 0 ? RED : '#B89A5A', i * 0.3) + person({ x, y: 780, s: 1.15, who: i === 4 ? 'chensheng' : 'rebel', pose: P.mix(P.stand(), P.cheer(g + i * 0.2), rise), g, face: 1 }); }
      return o;
    },
    cam: [[800, 560, 1600], [800, 520, 1450]],
  },
  'c.join': {
    bg: (id) => eastMap(id) + vtext(1060, 420, '大泽乡', 30, RED, 0.85),
    fg: (u, g, id) => {
      const r = rng(17); let o = glow(id, 1030, 400, 80, g, 0, 0.6) + `<circle cx="1030" cy="400" r="14" fill="${RED}"/>`;
      for (let i = 0; i < 70; i++) { const x = 120 + r() * 1360, y = 120 + r() * 680, d = Math.hypot(x - 1030, y - 400) / 1100; if (seg(u, d * 0.8, d * 0.8 + 0.12) > 0) o += torch(id, x, y, 0.6, g, i * 0.2, seg(u, d * 0.8, d * 0.8 + 0.12)); }
      return o;
    },
    cam: [[800, 470, 1500], [800, 470, 1600]],
  },
  'c.poles': {
    bg: (id) => sky(id, '#C9B7A0', '#E9DCC4') + ridge({ y: 520, amp: 60, seed: 53, a: 0.3 }),
    fg: (u, g) => { let o = ''; for (let i = 0; i < 16; i++) o += pole(60 + i * 100, 960, 520 + (i % 3) * 60, 1, g, i % 4 === 0 ? RED : '#B89A5A', i * 0.37); return o; },
    cam: [[800, 450, 1500], [800, 420, 1400]],
  },
  // ---------- 6 项梁渡淮，韩信杖剑从之 ----------
  'c.ferry': {
    bg: (id) => sky(id, '#D6D2C4', PAPER) + ridge({ y: 330, amp: 60, seed: 55, a: 0.2 }) + `<path d="M-200,380 Q800,360 1800,382 L1800,1100 L-200,1100 Z" fill="#AEBAB8"/>`,
    fg: (u, g, id) => {
      let o = river(56, g, { y0: 380, y1: 900, speed: 22, n: 80 });
      for (let b = 0; b < 4; b++) {
        const x = lerp(260, 1500, u) - b * 330, y = 520 + b * 90, bob = Math.sin(g * 2 + b) * 4;
        o += `<g transform="translate(${f(x)},${f(y + bob)})"><path d="M-170,0 L170,0 L130,40 L-130,40 Z" fill="#5A4430" stroke="${INK}" stroke-width="3"/>`;
        for (let i = 0; i < 6; i++) o += person({ x: -130 + i * 52, y: 0, s: 0.55, who: i === 2 && b === 2 ? 'hanxin' : 'soldier', pose: P.stand(), g, face: 1 });
        o += `</g>` + banner(x + 120, y - 90 + bob, 0.55, g, RED, '项', b * 0.2, 0.9);
      }
      return o + mist(id, 57, g, { y: 360, h: 60, a: 0.5, n: 6 });
    },
    cam: [[800, 520, 1600], [800, 560, 1400]],
  },
  'c.hxranks': {
    bg: (id) => sky(id, '#D9CFBC', PAPER) + ridge({ y: 380, amp: 50, seed: 58, a: 0.2 }) + `<path d="M-200,520 L1800,520 L1800,1100 L-200,1100 Z" fill="#BFAE88"/>`,
    fg: (u, g, id) => {
      let o = '';
      for (let row = 0; row < 4; row++) for (let i = 0; i < 12; i++) {
        const x = 40 + i * 140 + row * 30 + ((g * 30) % 140) - 140, y = 600 + row * 70, me = row === 2 && i === 6;
        o += person({ x, y, s: 0.75 + row * 0.12, who: me ? 'hanxin' : 'soldier', pose: P.walk(g * 0.8 + i * 0.1 + row * 0.3), g, face: 1 });
      }
      const hx = 40 + 6 * 140 + 2 * 30 + ((g * 30) % 140) - 140;
      return glow(id, hx, 680, 90, g, 0, seg(u, 0.5, 1) * 0.5) + o + banner(1340, 380, 0.9, g, RED, '项', 0, 0.9);
    },
    cam: [[800, 560, 1600], [930, 690, 760]],
  },
  'c.fallflag': {
    bg: (id) => sky(id, '#B9876A', '#D8B892') + sunDisc(id, 1180, 330, 60, '#C8452F', 0.8) + ridge({ y: 470, amp: 60, seed: 59, a: 0.35, color: '#4A3A30' }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#6E5A44"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0.15, 0.85);
      let o = '';
      for (let i = 0; i < 7; i++) o += banner(980 + i * 90, 470 - (i % 2) * 20, 0.6, g, '#2B2722', '秦', i * 0.2, 0.85);
      o += `<g transform="rotate(${f(k * 78)} 520 760)">${banner(520, 420, 1.3, g, RED, '项', 0, 0.95)}<line x1="520" y1="420" x2="520" y2="760" stroke="${INK}" stroke-width="10"/></g>`;
      return o + mist(id, 60, g, { y: 560, h: 120, a: 0.55, n: 8, speed: 20 });
    },
    cam: [[800, 520, 1500], [700, 600, 1250]],
  },
  'c.slips2': {
    bg: (id) => deskBg(id),
    fg: (u, g) => slips(520, 320, 16, 1.15, '项梁败又属项羽羽以为郎中', seg(u, 0, 0.8)) + glasses(1180, 300, 0.7, g, 0, true),
    cam: [[800, 480, 1200], [760, 480, 1080]],
  },
  'c.glasses': {
    bg: (id) => deskBg(id) + slips(520, 320, 16, 1.15, '项梁败又属项羽羽以为郎中'),
    fg: (u, g, id) => { const x = lerp(1060, 560, (g * 0.25) % 1); return `<rect x="${f(x - 30)}" y="320" width="60" height="320" fill="#9FD3F0" opacity=".25"/>` + glasses(x, 250, 0.7, g, (g * 0.4) % 1, true) + glow(id, x, 470, 120, g, 0, 0.2); },
    cam: [[800, 470, 1200], [800, 470, 1150]],
  },
  // ---------- 11 执戟郎中 ----------
  'c.guard': {
    bg: (id) => sky(id, '#D3C6AE', PAPER) + ridge({ y: 380, amp: 50, seed: 61, a: 0.18 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#C2AE86"/>` + tent(200, 600, 1, '#6A5A4C') + tent(1420, 600, 1.1, '#6A5A4C'),
    fg: (u, g) => {
      let o = bigTent(800, 640, 1.4, g, 0.7);
      o += person({ x: 800, y: 590, s: 0.7, who: 'xiangyu', pose: P.mix(P.stand(), P.point(1), 0.5 + 0.5 * Math.sin(g)), g, face: -1, a: 0.85 });
      o += person({ x: 860, y: 590, s: 0.62, who: 'general', pose: P.bow(0.3), g, face: -1, a: 0.8 });
      [[460, 1], [600, 1], [1000, -1], [1140, -1]].forEach(([x, fc], i) => { o += person({ x, y: 760, s: 1.2, who: i === 1 ? 'hanxinLang' : 'soldier', pose: P.stand(), g, face: fc as 1 | -1, hold: 'spear', detail: true }); });
      return o;
    },
    cam: [[800, 520, 1500], [640, 600, 900]],
  },
  'c.halberd': {
    bg: (id) => sky(id, '#D9CBB0', '#EFE4CE') + bigTent(1100, 1100, 2.4, 0, 0.8),
    fg: (u, g) => halberd(640, 1180, 760, 1.2, -4 + Math.sin(g * 0.7) * 1.5, g) + `<rect x="${f(624 - 34)}" y="740" width="70" height="70" rx="24" fill="#EAD9BF" stroke="${INK}" stroke-width="3"/><path d="M590,760 h70 M590,780 h70" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/>`,
    cam: [[700, 520, 1300], [680, 460, 1150]],
  },
  'c.offer': {
    bg: (id) => tentIn(id, true),
    fg: (u, g) => {
      const k = seg(u, 0, 0.6);
      let o = dais();
      o += person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: P.sitCross(), g, face: -1, detail: true });
      o += person({ x: lerp(380, 640, k), y: 760, s: 1.45, who: 'hanxinLang', pose: k < 1 ? P.mix(P.walk(g * 0.8), P.give(1), k) : P.give(1), g, face: 1, hold: 'scroll', detail: true });
      return o;
    },
    cam: [[800, 520, 1400], [880, 560, 1200]],
  },
  'c.wave': {
    bg: (id) => tentIn(id, true),
    fg: (u, g) => {
      const w = Math.sin(seg(u, 0.1, 0.5) * Math.PI * 3), fly = seg(u, 0.25, 0.6);
      let o = dais();
      o += person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: { ...P.sitCross(), aF: 70 + w * 30, eF: 20, head: -6 }, g, face: -1, detail: true, mood: 'sneer' });
      o += person({ x: 640, y: 760, s: 1.45, who: 'hanxinLang', pose: P.bow(lerp(0.3, 0.8, seg(u, 0.5, 0.9))), g, face: 1, detail: true });
      o += roll(lerp(1000, 1500, fly), lerp(560, 760, fly) - Math.sin(fly * Math.PI) * 120, 1.2, fly * 300);
      return o;
    },
    cam: [[880, 560, 1300], [900, 560, 1250]],
  },
  'c.pile': {
    bg: (id) => tentIn(id) + `<path d="M900,700 L1500,700 L1500,860 L900,860 Z" fill="#2E241C"/>`,
    fg: (u, g, id) => {
      const n = Math.floor(lerp(2, 22, seg(u, 0, 0.9))), r = rng(23);
      let o = glow(id, 520, 560, 220, g, 0, lerp(0.5, 0.25, u)) + flame(520, 600, 1.4, g) + `<rect x="506" y="600" width="28" height="40" fill="#8A6A3A"/>`;
      for (let i = 0; i < n; i++) { const row = Math.floor(i / 6), col = i % 6; o += roll(1000 + col * 76 + (row % 2) * 36 + r() * 6, 840 - row * 40, 1.05, r() * 20 - 10); }
      return o;
    },
    cam: [[1000, 600, 1100], [1080, 640, 950]],
  },
  // ---------- 14 很多年以后，韩信说起这段日子 ----------
  'c.hxlater': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636') + `<rect x="-200" y="660" width="2000" height="400" fill="#3A2C22"/><path d="M500,640 L1100,640 L1140,700 L460,700 Z" fill="#6A4A30"/>`,
    fg: (u, g, id) => glow(id, 800, 560, 200, g, 0, 0.5) + flame(800, 600, 1.2, g) + `<rect x="440" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/><rect x="990" y="700" width="170" height="40" rx="6" fill="#5A3A26" stroke="${INK}" stroke-width="3"/>` + person({ x: 520, y: 700, s: 1.5, who: 'king', pose: P.mix(P.sitRest(), P.point(0.6), 0.3 + 0.2 * Math.sin(g)), g, face: 1, detail: true }) + person({ x: 1080, y: 700, s: 1.45, who: 'crowd2', pose: P.sitRest(), g, face: -1, detail: true }),
    cam: [[800, 560, 1300], [800, 560, 1150]],
  },
  'c.hxcu': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636') + glow(id, 1250, 520, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'hanxinKing', g, id, brow: 0.4, mouth: Math.sin(g * 7) > 0.3 ? 0.5 : -0.3, open: 0.75 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  // ---------- 15 刘邦起兵；怀王之约 ----------
  'c.liubang': {
    bg: (id) => sky(id, '#D6CDB8', PAPER) + cityWall(800, 560, 900, 1.1, 0.7),
    fg: (u, g) => {
      let o = `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#C9B994"/>`;
      o += person({ x: 800, y: 760, s: 1.4, who: 'liubang', pose: P.mix(P.stand(), P.point(1), seg(u, 0.2, 0.6)), g, face: 1, detail: true });
      for (let i = 0; i < 12; i++) { const x = 160 + i * 120; if (x > 700 && x < 900) continue; o += person({ x, y: 820 + (i % 2) * 24, s: 1.2, who: i % 3 ? 'rebel' : 'crowd2', pose: P.cheer(g + i * 0.3), g, face: x < 800 ? 1 : -1, hold: i % 4 === 0 ? 'pole' : undefined }); }
      return o + banner(940, 520, 1, g, RED, '刘', 0, 0.95);
    },
    cam: [[800, 560, 1600], [800, 600, 1300]],
  },
  'c.pact': {
    bg: (id) => mapBg(id) + `<path d="M140,330 Q300,420 520,420 Q760,420 870,470 L870,620 Q600,700 300,660 Q160,600 140,330 Z" fill="${GOLD}" opacity=".22"/>` + vtext(420, 470, '关中', 48, '#7A5A1E', 0.85),
    fg: (u, g, id) => {
      const a = seg(u, 0.1, 0.9), b = seg(u, 0.2, 1);
      let o = glow(id, 470, 520, 220, g, 0, 0.35);
      o += `<path d="M1300,780 Q1000,760 760,700 Q640,660 560,560" stroke="${RED}" stroke-width="8" fill="none" stroke-dasharray="${f(a * 1000)} 2000" stroke-linecap="round"/>` + banner(lerp(1300, 560, a), lerp(780, 560, a) - 60, 0.6, g, RED, '刘', 0, 0.95);
      o += `<path d="M1460,300 Q1200,360 960,460" stroke="#2B2722" stroke-width="8" fill="none" stroke-dasharray="${f(b * 420)} 2000" stroke-linecap="round"/>` + banner(lerp(1460, 1180, b), lerp(300, 380, b) - 60, 0.6, g, '#2B2722', '项', 0.3, 0.95);
      return o;
    },
    cam: [[800, 470, 1600], [760, 480, 1500]],
  },
  'c.surrender': {
    bg: (id) => sky(id, '#D9D5CC', '#EEE9DE') + ridge({ y: 400, amp: 50, seed: 63, a: 0.18 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#CFC6B2"/>` + `<path d="M-200,700 Q800,660 1800,700" stroke="#B8AE98" stroke-width="80" fill="none"/>`,
    fg: (u, g) => {
      const k = seg(u, 0, 0.6), bow = seg(u, 0.6, 0.95);
      let o = '';
      for (let i = 0; i < 8; i++) o += person({ x: 1180 + (i % 4) * 90, y: 700 + Math.floor(i / 4) * 50, s: 1, who: 'hanSoldier', pose: P.stand(), g, face: -1, hold: 'spear' }) + (i % 4 === 0 ? banner(1180 + i * 22, 520, 0.7, g, RED, '汉', i * 0.2, 0.9) : '');
      o += person({ x: 1110, y: 720, s: 1.15, who: 'liubang', pose: P.stand(), g, face: -1, detail: true });
      o += horse({ x: lerp(160, 420, k), y: 720, s: 1, g, gait: k < 1 ? 'walk' : 'stand', ph: g, c: '#EDE8DC', face: 1 });
      o += `<path d="M${f(lerp(10, 270, k))},650 h120 v60 h-120 z" fill="#EDE8DC" stroke="#B8AE98" stroke-width="3"/><circle cx="${f(lerp(40, 300, k))}" cy="720" r="30" fill="none" stroke="#B8AE98" stroke-width="6"/>`; // 白车
      o += person({ x: lerp(560, 820, k), y: 730, s: 1.1, who: 'ziying', pose: bow > 0 ? P.bow(bow) : P.walk(g * 0.6, 1 - k), g, face: 1, detail: true });
      const x = lerp(560, 820, k);
      o += `<path d="M${f(x + 8)},${f(640 + bow * 30)} q20,30 -6,70" stroke="${GOLD}" stroke-width="4" fill="none"/><rect x="${f(x + 22 + bow * 20)}" y="${f(668 + bow * 30)}" width="34" height="28" fill="${GOLD}" stroke="#7A5A1E" stroke-width="3"/>`; // 颈上的丝带、捧着的玺
      return o;
    },
    cam: [[800, 560, 1600], [900, 620, 1150]],
  },
  'c.twocamps': {
    bg: (id) => localMap(id) + vtext(1160, 300, '鸿门', 40, INK, 0.85) + vtext(400, 300, '霸上', 40, RED, 0.85),
    fg: (u, g, id) => {
      const r = rng(27); let o = '';
      const k = seg(u, 0, 0.7);
      for (let i = 0; i < 40; i++) { const show = seg(k, i / 40, i / 40 + 0.05); if (show <= 0) continue; o += tent(1020 + (i % 8) * 46 + r() * 10, 480 + Math.floor(i / 8) * 40 + r() * 6, 0.32, '#2B2722', 0.9 * show); }
      for (let i = 0; i < 10; i++) { const show = seg(k, i / 10, i / 10 + 0.1); if (show <= 0) continue; o += tent(320 + (i % 5) * 50, 520 + Math.floor(i / 5) * 44, 0.32, RED, 0.85 * show); }
      const d = seg(u, 0.65, 0.95);
      o += `<path d="M600,580 L${f(lerp(600, 990, d))},580" stroke="${INK}" stroke-width="5" stroke-dasharray="14 10"/>` + (d > 0.9 ? `<text x="795" y="560" font-size="40" text-anchor="middle" fill="${INK}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">四十里</text>` : '');
      o += `<text x="1180" y="740" font-size="46" text-anchor="middle" fill="${INK}" opacity="${f(seg(u, 0.4, 0.6))}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">四十万</text><text x="430" y="700" font-size="46" text-anchor="middle" fill="${RED}" opacity="${f(seg(u, 0.4, 0.6))}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">十万</text>`;
      return o + glow(id, 1180, 560, 120, g, 0, 0.15);
    },
    cam: [[800, 520, 1500], [800, 540, 1400]],
  },
  'c.desk': {
    bg: (id) => deskBg(id) + slips(560, 470, 16, 0.62, '在项羽手下韩信的意见和才能都没有被采纳'),
    fg: (u, g, id) => glow(id, 1280, 560, 140, g) + flame(1280, 600, 1.6, g) + `<rect x="1262" y="600" width="36" height="40" fill="#8A6A3A"/>` + `<defs><filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter></defs>` + glasses(820, lerp(410, 390, (Math.sin(g * 1.4) + 1) / 2), 0.8, g, (g * 0.3) % 1, true),
    cam: [[800, 520, 1300], [820, 520, 1150]],
  },
  'c.feast': {
    bg: (id) => sky(id, '#3A2A2A', '#7A4A3A') + sunDisc(id, 1300, 420, 50, '#C8452F', 0.6) + ridge({ y: 480, amp: 60, seed: 65, a: 0.5, color: '#2A1E1E' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#3A2C26"/>`,
    fg: (u, g, id) => {
      let o = bigTent(800, 700, 1.6, g, 0.6) + glow(id, 800, 640, 160, g, 0, 0.7);
      for (let i = 0; i < 6; i++) o += torch(id, 220 + i * 230, 620 - (i % 2) * 20, 1.2, g, i * 0.3);
      [[480, 1], [620, 1], [980, -1], [1120, -1]].forEach(([x, fc]) => { o += person({ x, y: 820, s: 1.3, who: 'soldier', pose: P.stand(), g, face: fc as 1 | -1, hold: 'spear' }); });
      o += `<path d="M300,560 q${f(10 + wav(g, 3) * 10)},-60 -10,-120 q${f(30 + wav(g, 2.4) * 10)},-40 10,-100" stroke="#8A7A6A" stroke-width="10" fill="none" opacity=".35"/>`; // 炊烟
      return o;
    },
    cam: [[800, 560, 1600], [800, 600, 1100]],
  },
};
