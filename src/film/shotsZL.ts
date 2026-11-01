// 张良线：每一镜怎么画、怎么动（博浪沙、圯上纳履、沛公殆天授、烧栈道、借箸代筹……）
import { GOLD, INK, PAPER, RED, banner, cityWall, f, flame, glow, house, lerp, mist, moon, ridge, river, rng, seg, sky, sunDisc, tent, torch, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import { deskBg, seatRock, slips } from './shots1';
import { dais, tentIn } from './shots2';
import type { ShotDef } from './Film';

// ---------------- 共用 ----------------
/** 博浪沙：黄沙地、一道道沙丘 */
const sands = (id: string) => sky(id, '#E3D3B0', '#F0E4C8') + ridge({ y: 470, amp: 60, seed: 501, a: 0.25, color: '#B89A60' }) + `<path d="M-200,560 Q400,520 800,560 Q1200,600 1800,550 L1800,1100 L-200,1100 Z" fill="#D7BE8A"/><path d="M-200,700 Q500,660 900,700 Q1300,740 1800,690 L1800,1100 L-200,1100 Z" fill="#CDB07A"/>`;
/** 一辆车（伞盖）：副车和正车一样 */
const cart = (x: number, y: number, s: number, g: number, broken = 0) => `<g transform="translate(${f(x)},${f(y)}) scale(${s}) rotate(${f(broken * 18)})"><path d="M-110,-40 L110,-40 L110,0 L-110,0 Z" fill="#1E1C22" stroke="${GOLD}" stroke-width="4"/><circle cx="-50" cy="10" r="42" fill="none" stroke="#2A2620" stroke-width="9"/><path d="M0,-40 L0,-180" stroke="#2A2620" stroke-width="6"/><path d="M-130,-176 Q0,${f(-232 + wav(g, 2) * 4)} 130,-176 Z" fill="#1E1C22" stroke="${GOLD}" stroke-width="4"/></g>` + horse({ x: x + 200 * s, y, s: 0.85 * s, g, gait: broken ? 'paw' : 'walk', ph: g * 0.6, c: '#3A3230' });
/** 大铁锤（铁椎）：圆锤头、短柄、铁链 */
const hammer = (x: number, y: number, s: number, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><circle r="40" fill="#4A4A4C" stroke="${INK}" stroke-width="4"/><circle r="40" fill="none" stroke="#7A7A7C" stroke-width="3" stroke-dasharray="6 10"/><path d="M0,40 L0,120" stroke="#5A4A3A" stroke-width="12" stroke-linecap="round"/></g>`;
/** 圯：小河上的一座石桥 */
const bridge = (id: string, dawn = 0) => sky(id, dawn ? '#3A3E52' : '#C9D2CC', dawn ? '#8A7E7A' : '#ECE6D4') + ridge({ y: 420, amp: 50, seed: 511, a: 0.25 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#8FA2A0"/>` +
  `<path d="M200,600 Q800,480 1400,600 L1400,640 Q800,530 200,640 Z" fill="#9A8E7A" stroke="${INK}" stroke-width="4"/><path d="M200,600 Q800,480 1400,600" stroke="#6A604E" stroke-width="10" fill="none"/>` +
  `<path d="M-200,560 L240,600 L240,1100 L-200,1100 Z M1360,600 L1800,560 L1800,1100 L1360,1100 Z" fill="#B9A882"/>`;
/** 一只鞋（履） */
const shoe = (x: number, y: number, s: number, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${s})"><path d="M-30,0 Q-30,-22 0,-22 L24,-14 Q36,-6 30,4 Z" fill="#3A2E24" stroke="${INK}" stroke-width="2"/></g>`;

/** 栈道两边：上面是陡崖，下面是深谷 */
const cliff = (id: string) => sky(id, '#8A9294', '#B8BCB4') + `<path d="M-200,-100 L1800,-100 L1800,770 L-200,770 Z" fill="#6E6A60"/>` +
  Array.from({ length: 26 }, (_, i) => `<path d="M${-180 + i * 76},${-60 + (i * 53) % 90} L${-170 + i * 76 + (i % 3) * 10},${640 - (i * 37) % 120}" stroke="#5A564E" stroke-width="${3 + (i % 3)}" opacity=".6"/>`).join('') +
  `<defs><linearGradient id="${id}gz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E3C36"/><stop offset="1" stop-color="#1E1E1C"/></linearGradient></defs><path d="M-200,770 L1800,770 L1800,1100 L-200,1100 Z" fill="url(#${id}gz)"/><path d="M-200,1020 Q600,1000 1800,1030" stroke="#5A6E74" stroke-width="16" fill="none" opacity=".5"/>`;
/** 栈道：崖壁上凿孔插横木，上面铺木板，外侧有栏杆；gone(x) 是这一段烧掉了多少（0 完好，1 烧没了） */
const plank = (x0: number, x1: number, y: number, gone: (x: number) => number) => {
  let o = '';
  for (let x = x0; x < x1; x += 60) {
    const k = gone(x);
    o += `<rect x="${x + 20}" y="${y + 6}" width="16" height="${k >= 1 ? 14 : 36}" fill="#3A2A1E"/>`;
    if (k >= 1) continue;
    o += `<rect x="${x}" y="${y - 4}" width="60" height="14" fill="${k > 0 ? '#3A2A1E' : '#9A7A4E'}" stroke="#5A4630" stroke-width="2"/>`;
    if ((x - x0) % 120 === 0) o += `<path d="M${x + 4},${y - 4} L${x + 4},${y - 54}" stroke="${k > 0 ? '#3A2A1E' : '#7A5E3A'}" stroke-width="5"/>`;
    o += `<path d="M${x},${y - 48} L${x + 60},${y - 48}" stroke="${k > 0 ? '#3A2A1E' : '#7A5E3A'}" stroke-width="4"/>`;
  }
  return o;
};
/** 汉中一带的地图：中间一道秦岭，北边关中，南边汉中，再往南是巴、蜀 */
const hanMap = (x: number, y: number) => `<g transform="translate(${x},${y})"><rect x="-460" y="-330" width="920" height="660" fill="#E6D8B4" stroke="#6A4A2E" stroke-width="6"/>` +
  Array.from({ length: 16 }, (_, i) => `<path d="M${-420 + i * 56},-10 L${-392 + i * 56},${-70 - (i % 3) * 16} L${-364 + i * 56},-10 Z" fill="#6A5A40"/>`).join('') +
  Array.from({ length: 12 }, (_, i) => `<path d="M${-380 + i * 70},170 L${-358 + i * 70},${120 - (i % 2) * 14} L${-336 + i * 70},170 Z" fill="#7A6A50" opacity=".8"/>`).join('') +
  `<path d="M-430,40 Q-100,70 200,40 Q330,30 440,60" stroke="#6A8EA0" stroke-width="10" fill="none"/></g>`;
const hanMapText = () => [['关中', 800, 290], ['秦岭', 1130, 360], ['汉中', 900, 530], ['巴', 760, 740], ['蜀', 520, 720]].map(([t, x, y]) => `<text x="${x}" y="${y}" font-size="48" text-anchor="middle" fill="#3E2E1E" style="font-family:'Kaiti SC','STKaiti',serif">${t}</text>`).join('');
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** 老虎：从一只小虎崽长成大老虎（k 0→1），尾巴在甩 */
const tiger = (x: number, y: number, s: number, g: number, k: number) => {
  const tail = Math.sin(g * 2) * 12, open = k > 0.8 ? (k - 0.8) * 5 : 0;
  const stripes = Array.from({ length: 6 }, (_, i) => `<path d="M${-90 + i * 34},-96 q8,22 0,44" stroke="#2A1E14" stroke-width="7" fill="none"/>`).join('');
  return `<g transform="translate(${x},${y}) scale(${f(s)})"><path d="M110,-70 Q170,${f(-110 + tail)} 190,${f(-60 + tail)}" stroke="#D88A3A" stroke-width="14" fill="none" stroke-linecap="round"/>` +
    `<path d="M-90,0 L-84,-50 M-40,0 L-40,-50 M60,0 L56,-50 M100,0 L96,-50" stroke="#C87A2E" stroke-width="20" stroke-linecap="round"/><ellipse cx="0" cy="-80" rx="120" ry="48" fill="#E0963E" stroke="${INK}" stroke-width="3"/>${stripes}` +
    `<circle cx="-130" cy="-110" r="46" fill="#E0963E" stroke="${INK}" stroke-width="3"/><circle cx="-160" cy="-148" r="12" fill="#E0963E" stroke="${INK}" stroke-width="2"/><circle cx="-104" cy="-150" r="12" fill="#E0963E" stroke="${INK}" stroke-width="2"/>` +
    `<ellipse cx="-150" cy="-96" rx="26" ry="18" fill="#F4E4C8"/><circle cx="-146" cy="-120" r="5" fill="${INK}"/><circle cx="-116" cy="-120" r="5" fill="${INK}"/><path d="M-170,-90 q16,${f(8 + open * 14)} 34,0" stroke="${INK}" stroke-width="3" fill="${open > 0.2 ? '#8A2A22' : 'none'}"/><path d="M-130,-136 l-6,10 M-120,-138 l0,12" stroke="#2A1E14" stroke-width="4"/></g>`;
};

export const SHOTS_ZL: Record<string, ShotDef> = {
  // ================= 张良① 博浪沙 =================
  'zl.slips': {
    bg: (id) => deskBg(id) + slips(470, 330, 18, 1.2, '留侯张良者其先韩人也大父开地相韩昭侯'),
    fg: (u, g, id) => glow(id, 800, 470, 300, g, 0, 0.3),
    cam: [[800, 480, 1300], [800, 470, 1100]],
  },
  'zl.home': {
    bg: (id) => sky(id, '#3A3A44', '#6A6470') + house(800, 640, 2.2, 0.95) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#4A4648"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.8);
      // 家里的财物一箱箱搬出去
      let o = '';
      for (let i = 0; i < 4; i++) { const x = lerp(700 + i * 40, 1500 + i * 60, seg(u, 0.2 + i * 0.1, 0.8 + i * 0.05)); o += `<rect x="${f(x - 30)}" y="760" width="60" height="44" fill="#6A4A2E" stroke="${INK}" stroke-width="2"/>` + person({ x, y: 820, s: 1.2, who: 'crowd2', pose: P.walk(g + i * 0.3, 0.8), g, face: 1 }); }
      return o + person({ x: 520, y: 820, s: 1.55, who: 'zhangliangYoung', pose: P.mix(P.stand(), P.point(1), k), g, face: 1, detail: true });
    },
    cam: [[800, 560, 1500], [800, 600, 1300]],
  },
  'zl.forge': {
    bg: (id) => sky(id, '#2A2420', '#4A3A30') + `<path d="M-200,660 L1800,660 L1800,1100 L-200,1100 Z" fill="#3A2E26"/>`,
    fg: (u, g, id) => {
      const hit = Math.max(0, Math.sin(g * 4));
      return glow(id, 760, 640, 260, g, 0, 0.7) + flame(760, 680, 2.2, g) + `<rect x="900" y="700" width="160" height="60" fill="#2A2A2C"/>` + hammer(980, 680, 1.1, 90) +
        person({ x: 1160, y: 820, s: 1.6, who: 'lishi', pose: { ...P.stand(), aF: lerp(150, 70, hit), eF: 10, aB: lerp(150, 70, hit), eB: 10, lean: 10 * hit }, g, face: -1, detail: true }) +
        person({ x: 460, y: 820, s: 1.45, who: 'zhangliangYoung', pose: P.stand(), g, face: 1, detail: true });
    },
    cam: [[800, 600, 1400], [820, 620, 1200]],
  },
  'zl.ambush': {
    bg: (id) => sands(id),
    fg: (u, g) => {
      const x = lerp(-200, 900, u);
      let o = '';
      for (let i = 0; i < 3; i++) o += cart(x - i * 420, 620, 0.8, g) + banner(x - i * 420 - 140, 560, 0.6, g, '#1E1C22', '', i * 0.3);
      // 沙丘后面伏着的两个人
      o += person({ x: 1260, y: 720, s: 1.3, who: 'lishi', pose: { ...P.kneelWash(0), lean: 50, aF: 30, eF: 20 }, g, face: -1 }) + person({ x: 1380, y: 724, s: 1.2, who: 'zhangliangYoung', pose: { ...P.kneelWash(0), lean: 40, head: -10 }, g, face: -1 });
      return o + `<path d="M1180,730 Q1320,690 1480,730 Z" fill="#CDB07A"/>`;
    },
    cam: [[800, 560, 1600], [900, 600, 1500]],
  },
  'zl.throw': {
    bg: (id) => sands(id),
    fg: (u, g) => {
      const k = seg(u, 0.1, 0.55), hit = u > 0.55;
      const hx = lerp(1360, 560, k), hy = lerp(560, 600, k) - Math.sin(k * Math.PI) * 220;
      let o = cart(980, 640, 0.9, g) + cart(560, 640, 0.9, g, hit ? seg(u, 0.55, 0.8) : 0);
      o += person({ x: 1460, y: 760, s: 1.5, who: 'lishi', pose: P.mix({ ...P.stand(), aF: 160, eF: 10, lean: -10 }, { ...P.stand(), aF: 40, eF: 0, lean: 30 }, k), g, face: -1, detail: true });
      if (!hit) o += hammer(hx, hy, 0.8, k * 600);
      else o += hammer(560, 600, 0.8, 30) + `<g opacity="${f(1 - seg(u, 0.6, 0.95))}">${Array.from({ length: 10 }, (_, i) => `<path d="M560,560 l${f(Math.cos(i * 0.63) * 120)},${f(Math.sin(i * 0.63) * 80)}" stroke="#8A6A3A" stroke-width="5"/>`).join('')}</g>` + `<text x="430" y="420" font-size="46" fill="${RED}" style="font-family:KaiTi, STKaiti, serif" opacity="${f(seg(u, 0.7, 0.9))}">副车</text>`;
      return o;
    },
    cam: [[880, 560, 1400], [760, 580, 1200]],
  },
  'zl.search': {
    bg: (id) => sky(id, '#C9C0AE', '#E6DECC') + house(400, 640, 1.2) + house(1200, 640, 1.2) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B9AA8A"/>` +
      `<rect x="720" y="380" width="160" height="200" fill="#E9DCBC" stroke="#8A6A3A" stroke-width="4"/>` + vtext(800, 410, '捕贼', 40, RED, 0.85),
    fg: (u, g) => Array.from({ length: 6 }, (_, i) => person({ x: ((i * 280 + u * 600) % 1800) - 100, y: 800 + (i % 2) * 24, s: 1.35, who: 'qinguan', pose: P.walk(g + i * 0.4, 0.8), g, face: i % 2 ? 1 : -1 })).join(''),
    cam: [[800, 560, 1500], [800, 580, 1300]],
  },
  'zl.flee': {
    bg: (id) => sky(id, '#2A2E3A', '#4A4A54') + moon(id, 1300, 160, 34) + ridge({ y: 520, amp: 70, seed: 521, a: 0.6, color: '#1E2028' }) + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#2E2E34"/>`,
    fg: (u, g) => person({ x: lerp(300, 1300, u), y: 820, s: 1.5, who: 'zhangliangYoung', pose: P.walk(g * 1.2, 1), g, face: 1, detail: true }),
    cam: [[800, 600, 1500], [800, 620, 1400]],
  },
  'zl.portrait': {
    bg: (id) => sky(id, '#D9D2C2', '#EEE8DA'),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'zhangliangYoung', g, id, brow: 0, mouth: 0, look: 0.1 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  // ================= 张良② 圯上纳履 =================
  'zl.bridge': {
    bg: (id) => bridge(id),
    fg: (u, g) => river(531, g, { y0: 640, y1: 900, speed: 24, n: 40 }) + person({ x: lerp(400, 700, u), y: 540, s: 1.3, who: 'zhangliang', pose: P.walk(g * 0.6, 0.6), g, face: 1, detail: true }) +
      person({ x: lerp(1200, 940, u), y: 540, s: 1.25, who: 'laofu', pose: P.walk(g * 0.5, 0.5), g, face: -1, detail: true }),
    cam: [[800, 520, 1500], [800, 520, 1300]],
  },
  'zl.drop': {
    bg: (id) => bridge(id),
    fg: (u, g) => {
      const k = seg(u, 0.1, 0.5);
      return river(532, g, { y0: 640, y1: 900, speed: 24, n: 40 }) + person({ x: 860, y: 526, s: 1.5, who: 'laofu', pose: P.mix(P.stand(), { ...P.stand(), lF: 50, kF: 30 }, seg(u, 0, 0.2)), g, face: -1, detail: true }) +
        shoe(lerp(860, 900, k), lerp(520, 760, k), 1.4, k * 300) + person({ x: 640, y: 540, s: 1.5, who: 'zhangliang', pose: { ...P.stand(), head: lerp(0, 20, k) }, g, face: 1, detail: true, mood: k > 0.6 ? 'shock' : 'calm' });
    },
    cam: [[800, 520, 1300], [800, 540, 1150]],
  },
  'zl.anger': {
    bg: (id) => bridge(id),
    fg: (u, g) => {
      const k = seg(u, 0.2, 0.6);
      return person({ x: 900, y: 526, s: 1.5, who: 'laofu', pose: P.point(1), g, face: -1, detail: true }) +
        person({ x: 680, y: 540, s: 1.55, who: 'zhangliang', pose: P.mix({ ...P.stand(), aF: 90, eF: 60, lean: 10 }, { ...P.stand(), head: 14 }, k), g, face: 1, detail: true, mood: k < 0.5 ? 'sneer' : 'calm' });
    },
    cam: [[800, 520, 1200], [790, 520, 1000]],
  },
  'zl.kneel': {
    bg: (id) => bridge(id),
    fg: (u, g) => {
      const k = seg(u, 0.1, 0.7);
      return seatRock(940, 530, 1.4) + person({ x: 940, y: 530, s: 1.4, who: 'laofu', pose: { ...P.sit(), lF: lerp(82, 60, k), kF: lerp(84, 40, k) }, g, face: -1, detail: true, mood: k > 0.8 ? 'laugh' : 'calm' }) +
        person({ x: 760, y: 548, s: 1.45, who: 'zhangliang', pose: { ...P.kneelWash(0), lean: 30, aF: 70, eF: 10, aB: 60, eB: 20 }, g, face: 1, detail: true }) + shoe(lerp(780, 860, k), lerp(500, 520, k), 1.3, 0);
    },
    cam: [[850, 520, 1100], [860, 520, 950]],
  },
  'zl.dawn1': {
    bg: (id) => bridge(id, 1),
    fg: (u, g) => person({ x: 900, y: 526, s: 1.45, who: 'laofu', pose: P.mix(P.stand(), P.point(1), seg(u, 0.3, 0.6)), g, face: -1, detail: true }) +
      person({ x: lerp(300, 640, seg(u, 0, 0.3)), y: 560, s: 1.45, who: 'zhangliang', pose: u < 0.3 ? P.walk(g, 0.8) : P.bow(0.5), g, face: 1, detail: true }),
    cam: [[800, 540, 1300], [800, 540, 1150]],
  },
  'zl.night': {
    bg: (id) => bridge(id, 1) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#0E1018" opacity=".55"/>` + moon(id, 1250, 160, 36),
    fg: (u, g, id) => {
      const k = seg(u, 0.4, 0.8);
      return torch(id, 600, 470, 1, g) + person({ x: 640, y: 548, s: 1.45, who: 'zhangliang', pose: P.stand(), g, face: 1, detail: true }) +
        person({ x: lerp(1500, 920, k), y: 526, s: 1.45, who: 'laofu', pose: k < 0.98 ? P.walk(g, 0.6) : P.give(seg(u, 0.85, 1)), g, face: -1, detail: true, mood: 'laugh' });
    },
    cam: [[850, 520, 1300], [820, 520, 1100]],
  },
  'zl.book': {
    bg: (id) => deskBg(id),
    fg: (u, g, id) => { const k = seg(u, 0.1, 0.6); return glow(id, 800, 470, 300, g, 0, 0.4) + slips(560, 330, 14, 1.1, '太公兵法', k) + `<text x="800" y="760" font-size="44" text-anchor="middle" fill="${GOLD}" style="font-family:KaiTi, STKaiti, serif" opacity="${f(seg(u, 0.5, 0.8))}">读此则为王者师矣</text>`; },
    cam: [[800, 480, 1250], [800, 470, 1100]],
  },
  'zl.read': {
    bg: (id) => sky(id, '#2A2420', '#3E3228') + `<path d="M-200,660 L1800,660 L1800,1100 L-200,1100 Z" fill="#3A2C22"/>`,
    fg: (u, g, id) => glow(id, 1000, 600, 220, g, 0, 0.6) + flame(1000, 620, 1.4, g) + `<rect x="986" y="620" width="28" height="40" fill="#8A6A3A"/>` +
      person({ x: 760, y: 760, s: 1.5, who: 'zhangliang', pose: { ...P.sitCross(), aF: 70, eF: 50, head: 12 }, g, face: 1, detail: true, hold: 'scroll' }),
    cam: [[860, 640, 1150], [860, 650, 1000]],
  },
  // ================= 张良③ 沛公殆天授 =================
  'zl.gather': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + ridge({ y: 440, amp: 60, seed: 541, a: 0.22 }) + `<path d="M-200,620 Q800,600 1800,620 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => person({ x: lerp(300, 700, u), y: 760, s: 1.45, who: 'zhangliang', pose: P.walk(g * 0.8, 0.8), g, face: 1, detail: true }) +
      Array.from({ length: 8 }, (_, i) => person({ x: lerp(160, 560, u) - i * 50, y: 790 + (i % 2) * 20, s: 1.15, who: 'rebel', pose: P.walk(g * 0.8 + i * 0.3, 0.8), g, face: 1 })).join('') +
      person({ x: lerp(1500, 1100, u), y: 760, s: 1.5, who: 'liubangGen', pose: P.walk(g * 0.7, 0.6), g, face: -1, detail: true }) + banner(lerp(1600, 1220, u), 640, 0.9, g, RED, '沛', 0.3),
    cam: [[800, 580, 1600], [880, 600, 1400]],
  },
  'zl.stable': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8C70"/><path d="M200,640 L200,380 L900,380 L900,640" stroke="#5A4434" stroke-width="12" fill="none"/><path d="M160,390 L940,390 L880,320 L220,320 Z" fill="#6A5240"/>`,
    fg: (u, g) => horse({ x: 420, y: 640, s: 1, g, gait: 'stand', c: '#6A4A30' }) + horse({ x: 700, y: 640, s: 1, g, gait: 'paw', ph: g * 0.4, c: '#3A3230' }) + person({ x: 1100, y: 760, s: 1.5, who: 'zhangliang', pose: P.mix(P.stand(), P.point(0.8), 0.5 + 0.5 * Math.sin(g * 0.8)), g, face: -1, detail: true }),
    cam: [[800, 560, 1500], [820, 580, 1300]],
  },
  'zl.advise': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#4A3A2C"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0.5, 0.9);
      return glow(id, 800, 560, 260, g, 0, 0.5) + `<rect x="620" y="680" width="360" height="40" fill="#6A4A34"/>` + slips(660, 600, 10, 0.4, '太公兵法', 1) +
        person({ x: 560, y: 760, s: 1.45, who: 'zhangliang', pose: { ...P.sitCross(), aF: 80, eF: 10 }, g, face: 1, detail: true }) +
        person({ x: 1040, y: 760, s: 1.5, who: 'liubangGen', pose: P.mix({ ...P.sitCross(), head: 10 }, { ...P.sitCross(), aF: 120, eF: -10, head: -6 }, k), g, face: -1, detail: true, mood: k > 0.5 ? 'laugh' : 'calm' }) +
        person({ x: 1380, y: 780, s: 1.3, who: 'crowd1', pose: { ...P.stand(), head: 20, lean: 10 }, g, face: -1, a: seg(u, 0.6, 0.8) });
    },
    cam: [[820, 600, 1400], [850, 620, 1250]],
  },
  'zl.cu': {
    bg: (id) => sky(id, '#3E3226', '#5A4836') + glow(id, 1250, 500, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'zhangliang', g, id, brow: -0.1, mouth: Math.sin(g * 7) > 0.2 ? 0.4 : 0, look: 0.3 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  'zl.follow': {
    bg: (id) => sky(id, '#D9B888', '#EBD8B4') + sunDisc(id, 1300, 300, 60, '#D8804A', 0.8) + ridge({ y: 460, amp: 60, seed: 551, a: 0.3 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => person({ x: lerp(500, 1100, u), y: 760, s: 1.45, who: 'liubangGen', pose: P.walk(g * 0.7, 0.6), g, face: 1, detail: true }) + person({ x: lerp(380, 980, u), y: 770, s: 1.4, who: 'zhangliang', pose: P.walk(g * 0.7 + 0.3, 0.6), g, face: 1, detail: true }) +
      Array.from({ length: 8 }, (_, i) => person({ x: lerp(200, 800, u) - i * 60, y: 800 + (i % 2) * 20, s: 1.1, who: 'rebel', pose: P.walk(g + i * 0.3, 0.7), g, face: 1 })).join(''),
    cam: [[800, 580, 1600], [900, 600, 1400]],
  },
  // ================= 张良④ 烧栈道 =================
  'zl.fief': {
    bg: (id) => tentIn(id, true) + dais(),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.6);
      let o = glow(id, 1200, 520, 300, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: { ...P.sitCross(), aF: lerp(30, 90, k), eF: 20 }, g, face: -1, detail: true });
      for (let i = 0; i < 3; i++) o += person({ x: 260 + i * 120, y: 800, s: 1.25, who: ['crowd1', 'chenyu', 'crowd4'][i], pose: { ...P.kneelWash(0), lean: 30, head: 16 }, g, face: 1 });
      o += person({ x: 760, y: 800, s: 1.5, who: 'liubangGen', pose: P.bow(0.4 + 0.3 * k), g, face: 1, detail: true });
      return o + `<g opacity="${f(k)}"><rect x="${f(lerp(1080, 860, k))}" y="${f(lerp(600, 690, k))}" width="34" height="34" fill="${GOLD}" stroke="${INK}" stroke-width="2"/></g>` + `<g opacity="${f(seg(u, 0.6, 0.9))}">${vtext(520, 330, '汉王', 48, GOLD, 0.95)}</g>`;
    },
    cam: [[880, 560, 1500], [900, 580, 1300]],
  },
  'zl.mapHan': {
    bg: (id) => sky(id, '#3E3226', '#5A4836') + hanMap(800, 470),
    fg: (u, g, id) => {
      const a = seg(u, 0.05, 0.35), b = seg(u, 0.5, 0.85);
      return `<g opacity="${f(a)}"><ellipse cx="640" cy="720" rx="230" ry="90" fill="#D8804A" opacity=".35"/></g>` + `<g opacity="${f(b)}"><ellipse cx="900" cy="515" rx="150" ry="46" fill="#D9A441" opacity="${f(0.45 + 0.15 * Math.sin(g * 3))}"/></g>` +
        hanMapText() + glow(id, 800, 470, 500, g, 0, 0.15);
    },
    cam: [[800, 470, 1400], [820, 520, 1250]],
  },
  'zl.gift': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0.15, 0.55);
      const cx = lerp(700, 860, k);
      const chest = `<rect x="${f(cx - 60)}" y="700" width="120" height="70" fill="#7A5A30" stroke="${GOLD}" stroke-width="3"/>` +
        [0, 1, 2, 3].map((j) => `<circle cx="${f(cx - 36 + j * 24)}" cy="694" r="11" fill="${GOLD}" stroke="#8A6A2A" stroke-width="1.5"/>`).join('') +
        [0, 1, 2].map((j) => `<circle cx="${f(cx - 22 + j * 22)}" cy="680" r="7" fill="#F4F0E6" stroke="#B8B0A0" stroke-width="1"/>`).join('');
      return glow(id, 800, 520, 300, g, 0, 0.45) + person({ x: 560, y: 800, s: 1.5, who: 'zhangliang', pose: P.mix(P.stand(), P.give(1), k), g, face: 1, detail: true }) + chest +
        person({ x: 1080, y: 800, s: 1.55, who: 'xiangbo', pose: P.mix(P.stand(), P.bow(0.4), seg(u, 0.6, 0.9)), g, face: -1, detail: true, mood: seg(u, 0.6, 0.9) > 0.5 ? 'laugh' : 'calm' });
    },
    cam: [[820, 600, 1400], [840, 620, 1200]],
  },
  'zl.farewell': {
    bg: (id) => sky(id, '#A8B0A8', '#DCDAD0') + ridge({ y: 330, amp: 130, seed: 561, a: 0.35, color: '#5A6460' }) + ridge({ y: 470, amp: 80, seed: 562, a: 0.5, color: '#4A524E' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#8A8A74"/><path d="M1000,640 Q1200,560 1500,520 L1560,530 Q1260,580 1120,640 Z" fill="#B8AE8E"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 7; i++) { const t = (u * 0.6 + i / 7) % 1; o += person({ x: lerp(1060, 1520, t), y: lerp(640, 524, t), s: lerp(1, 0.55, t), who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.8), g, face: 1, a: t > 0.85 ? (1 - t) / 0.15 : 1 }); }
      const b = 0.3 + 0.3 * Math.max(0, Math.sin(g * 1.2));
      return o + person({ x: 620, y: 800, s: 1.55, who: 'zhangliang', pose: P.bow(b), g, face: 1, detail: true }) + person({ x: 900, y: 800, s: 1.6, who: 'liubangGen', pose: P.bow(b * 0.8), g, face: -1, detail: true });
    },
    cam: [[820, 560, 1500], [800, 600, 1300]],
  },
  'zl.plank': {
    bg: (id) => cliff(id),
    fg: (u, g) => {
      let o = plank(-200, 1800, 700, () => 0);
      for (let i = 0; i < 6; i++) o += person({ x: lerp(-100, 500, u) + i * 170, y: 700, s: 1.1, who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.6), g, face: 1 });
      return o;
    },
    cam: [[600, 560, 1300], [1000, 620, 1300]],
  },
  'zl.advise2': {
    bg: (id) => cliff(id),
    fg: (u, g) => plank(-200, 1800, 700, () => 0) + person({ x: 900, y: 700, s: 1.5, who: 'zhangliang', pose: P.mix(P.stand(), P.point(1), seg(u, 0.1, 0.35)), g, face: -1, detail: true }) +
      person({ x: 1150, y: 700, s: 1.55, who: 'liubangGen', pose: P.mix(P.stand(), { ...P.stand(), head: 10, aF: 40, eF: 90 }, seg(u, 0.5, 0.8)), g, face: -1, detail: true }) +
      `<g opacity="${f(seg(u, 0.35, 0.6))}"><path d="M820,560 Q600,520 380,600" stroke="#C8452F" stroke-width="4" stroke-dasharray="12 10" fill="none"/><path d="M380,600 l26,-4 l-12,20 z" fill="#C8452F"/></g>`,
    cam: [[900, 560, 1300], [960, 580, 1150]],
  },
  'zl.burnPlank': {
    bg: (id) => cliff(id),
    fg: (u, g, id) => {
      const front = lerp(-100, 1100, u);
      const gone = (x: number) => (x < front - 160 ? 1 : x < front ? 0.3 : 0);
      let o = plank(-200, 1800, 700, gone);
      for (let x = Math.max(-200, front - 180); x < front; x += 45) o += flame(x + 30, 700, 2.2, g, x * 0.01);
      o += glow(id, front, 640, 220, g, 0, 0.35);
      for (let i = 0; i < 5; i++) o += person({ x: front + 260 + i * 150, y: 700, s: 1.1, who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.6), g, face: 1 });
      return o;
    },
    cam: [[500, 560, 1300], [900, 600, 1300]],
  },
  'zl.tellXY': {
    bg: (id) => tentIn(id) + dais(),
    fg: (u, g, id) => {
      const k = seg(u, 0.55, 0.85);
      return glow(id, 1200, 520, 300, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: P.mix({ ...P.sitCross(), head: 10 }, { ...P.sitCross(), aF: 130, eF: 0, head: -10 }, k), g, face: -1, detail: true, mood: k > 0.5 ? 'laugh' : 'calm' }) +
        person({ x: 700, y: 800, s: 1.5, who: 'zhangliang', pose: P.mix(P.bow(0.5), { ...P.stand(), aF: 60, eF: 70 }, 0.5 + 0.5 * Math.sin(g * 1.5)), g, face: 1, detail: true }) +
        `<g opacity="${f(k)}">${vtext(1460, 290, '北击齐', 44, GOLD, 0.9)}</g>`;
    },
    cam: [[920, 560, 1500], [960, 580, 1300]],
  },
  'zl.chencang': {
    bg: (id) => sky(id, '#14161E', '#2A2C36') + moon(id, 1300, 150, 30, 0.6) + ridge({ y: 300, amp: 140, seed: 571, a: 0.6, color: '#22242C' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#1E2026"/><path d="M80,330 Q300,460 520,560 Q700,640 900,700 L960,700 Q720,620 560,540 Q340,420 140,320 Z" fill="#3A3A3E"/>` + cityWall(1150, 700, 520, 1.2, 0.7),
    fg: (u, g, id) => {
      const k = seg(u, 0.05, 0.6), ch = seg(u, 0.6, 0.95);
      let o = banner(1410, 520, 0.9, g, '#4A4A5A', '章', 0.2);
      for (let i = 0; i < 9; i++) { const t = clamp01(k * 1.5 - i * 0.08); if (t <= 0) continue; const x = lerp(140, 900, t) + ch * 160, y = lerp(330, 720, t); o += torch(id, x + 14, y - 70 * lerp(0.6, 1.1, t), lerp(0.5, 1, t), g, i * 0.3) + person({ x, y, s: lerp(0.55, 1.15, t), who: 'hanSoldier', pose: P.walk(g * (1 + ch) + i * 0.3, 0.9), g, face: 1 }); }
      return o + (k > 0.3 ? banner(lerp(300, 820, k) + ch * 160, lerp(330, 600, k), lerp(0.6, 1.1, k), g, RED, '汉', 0.1) : '');
    },
    cam: [[800, 520, 1600], [900, 580, 1450]],
  },
  // ================= 张良⑤ 借箸代筹 =================
  'zl.siege': {
    bg: (id) => sky(id, '#8A7E6A', '#B8AC94') + cityWall(500, 640, 600, 1.3, 0.85) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/>` + vtext(800, 380, '荥阳', 40, INK, 0.75),
    fg: (u, g) => {
      const k = seg(u, 0, 0.7);
      let o = banner(800, 420, 1, g, '#3A4A5A', '汉', 0.1);
      for (let i = 0; i < 14; i++) { if (i / 14 > k) break; const x = i < 7 ? 80 + i * 60 : 1180 + (i - 7) * 60; o += person({ x, y: 800 + (i % 2) * 30, s: 1, who: 'soldier', pose: P.stand(), g, face: i < 7 ? 1 : -1, hold: 'spear' }); if (i % 3 === 0) o += banner(x, 690, 0.7, g, RED, '楚', i * 0.2); }
      return o;
    },
    cam: [[800, 580, 1600], [800, 600, 1400]],
  },
  'zl.li': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.8);
      let o = glow(id, 800, 560, 300, g, 0, 0.45) + `<rect x="620" y="700" width="360" height="30" fill="#6A3A2C"/>`;
      ['韩', '魏', '燕', '赵', '齐', '楚'].forEach((t, i) => { if (i / 6 < k) o += `<rect x="${640 + i * 56}" y="664" width="40" height="36" fill="${GOLD}" stroke="${INK}" stroke-width="2"/><text x="${660 + i * 56}" y="692" font-size="24" text-anchor="middle" fill="${INK}" style="font-family:'Kaiti SC','STKaiti',serif">${t}</text>`; });
      return o + person({ x: 480, y: 800, s: 1.5, who: 'liyiji', pose: P.mix(P.stand(), { ...P.stand(), aF: 120, eF: 20 }, 0.5 + 0.5 * Math.sin(g * 1.3)), g, face: 1, detail: true, mood: 'laugh' }) +
        person({ x: 1120, y: 790, s: 1.5, who: 'liubangGen', pose: P.mix({ ...P.sitCross(), head: 6 }, { ...P.sitCross(), aF: 100, eF: 0 }, seg(u, 0.7, 0.9)), g, face: -1, detail: true, mood: seg(u, 0.7, 0.9) > 0.5 ? 'laugh' : 'calm' });
    },
    cam: [[800, 580, 1400], [800, 600, 1250]],
  },
  'zl.carve': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const hit = Math.max(0, Math.sin(g * 8));
      let o = glow(id, 800, 600, 240, g, 0, 0.5) + `<rect x="680" y="700" width="240" height="30" fill="#6A3A2C"/>`;
      for (let i = 0; i < Math.round(lerp(1, 6, u)); i++) o += `<rect x="${700 + i * 34}" y="672" width="28" height="28" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>`;
      return o + person({ x: 960, y: 790, s: 1.45, who: 'crowd1', pose: { ...P.sitCross(), aF: lerp(50, 80, hit), eF: 40, lean: 14, head: 14 }, g, face: -1, detail: true });
    },
    cam: [[820, 600, 1100], [820, 620, 950]],
  },
  'zl.meal': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.5);
      return glow(id, 800, 560, 300, g, 0, 0.45) + `<rect x="620" y="700" width="360" height="30" fill="#6A3A2C"/>` +
        person({ x: 760, y: 790, s: 1.5, who: 'liubangGen', pose: P.eat(g * 1.2), g, face: 1, detail: true, hold: 'bowl' }) +
        person({ x: lerp(1450, 1080, k), y: 800, s: 1.5, who: 'zhangliang', pose: k < 0.98 ? P.walk(g, 0.7) : P.bow(0.4), g, face: -1, detail: true });
    },
    cam: [[880, 580, 1400], [900, 600, 1200]],
  },
  'zl.chop': {
    bg: (id) => sky(id, '#4A3428', '#6A4A36') + `<path d="M-200,300 L1800,300 L1800,1100 L-200,1100 Z" fill="#7A4A30"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M-200,${340 + i * 70} Q800,${330 + i * 70} 1800,${345 + i * 70}" stroke="#6A3E28" stroke-width="3" opacity=".6"/>`).join(''),
    fg: (u, g) => {
      const n = Math.min(8, Math.floor(u * 8.6) + 1);
      let o = '';
      for (let i = 0; i < n; i++) { const x = 300 + i * 140; o += `<path d="M${x},360 L${x + 14},760" stroke="#C9A46A" stroke-width="12" stroke-linecap="round"/><path d="M${x},360 L${x + 4},470" stroke="#8A6A3A" stroke-width="13" stroke-linecap="round"/>` + `<text x="${x + 10}" y="830" font-size="52" text-anchor="middle" fill="#F1E8D6" style="font-family:'Kaiti SC','STKaiti',serif">${'一二三四五六七八'[i]}</text>`; }
      // 一只手正在摆下一根
      const hx = 300 + (n - 1) * 140 + 40, hy = 560 + Math.sin(g * 4) * 10;
      return o + `<ellipse cx="${f(hx + 40)}" cy="${f(hy)}" rx="70" ry="40" fill="#E2C9A6" stroke="${INK}" stroke-width="3"/><path d="M${f(hx + 100)},${f(hy - 20)} L${f(hx + 300)},${f(hy - 60)} L${f(hx + 300)},${f(hy + 40)} L${f(hx + 100)},${f(hy + 24)} Z" fill="#6B7A6A" stroke="${INK}" stroke-width="3"/>`;
    },
    cam: [[800, 580, 1500], [820, 580, 1450]],
  },
  'zl.eight': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const n = Math.min(8, Math.floor(u * 8.6) + 1);
      let o = glow(id, 800, 560, 300, g, 0, 0.45) + `<rect x="620" y="700" width="360" height="30" fill="#6A3A2C"/>`;
      for (let i = 0; i < n; i++) o += `<path d="M${650 + i * 40},690 L${660 + i * 40},640" stroke="#C9A46A" stroke-width="6" stroke-linecap="round"/>`;
      return o + person({ x: 520, y: 800, s: 1.5, who: 'zhangliang', pose: { ...P.stand(), aF: 70 + 10 * Math.sin(g * 3), eF: 40 }, g, face: 1, detail: true }) +
        person({ x: 1100, y: 790, s: 1.5, who: 'liubangGen', pose: P.mix({ ...P.sitCross(), head: 6 }, { ...P.sitCross(), head: 18, lean: 10 }, u), g, face: -1, detail: true, mood: u > 0.5 ? 'shock' : 'calm' });
    },
    cam: [[800, 580, 1400], [800, 600, 1250]],
  },
  'zl.spit': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.35);
      const bits = k > 0 && k < 1 ? Array.from({ length: 7 }, (_, i) => `<circle cx="${f(860 + k * (60 + i * 18))}" cy="${f(600 + k * (i * 12 - 30) + k * k * 80)}" r="5" fill="#F1E8D6"/>`).join('') : '';
      return glow(id, 800, 560, 300, g, 0, 0.45) + `<rect x="620" y="700" width="360" height="30" fill="#6A3A2C"/>` +
        person({ x: 820, y: 790, s: 1.55, who: 'liubangGen', pose: P.mix(P.eat(0), { ...P.sitCross(), aF: 130, eF: -10, head: -10, lean: -6 }, k), g, face: 1, detail: true, mood: k > 0.3 ? 'sneer' : 'calm' }) + bits +
        person({ x: 1200, y: 800, s: 1.45, who: 'liyiji', pose: P.mix(P.stand(), P.bow(0.6), seg(u, 0.35, 0.6)), g, face: -1, detail: true, mood: 'shock' });
    },
    cam: [[920, 580, 1300], [920, 600, 1150]],
  },
  'zl.melt': {
    bg: (id) => sky(id, '#2A2420', '#4A3A30') + `<path d="M-200,660 L1800,660 L1800,1100 L-200,1100 Z" fill="#3A2E26"/><path d="M640,700 L960,700 L920,820 L680,820 Z" fill="#4A4A4C" stroke="${INK}" stroke-width="4"/>`,
    fg: (u, g, id) => {
      let o = glow(id, 800, 640, 280, g, 0, 0.7) + flame(760, 700, 2.4, g) + flame(840, 704, 2, g, 0.4);
      for (let i = 0; i < 6; i++) { const t = seg(u, i * 0.12, i * 0.12 + 0.25); if (t <= 0 || t >= 1) continue; o += `<rect x="${f(lerp(1100, 790, t))}" y="${f(lerp(520, 690, t) - Math.sin(t * Math.PI) * 120)}" width="30" height="30" fill="${GOLD}" stroke="${INK}" stroke-width="2" transform="rotate(${f(t * 200)} ${f(lerp(1115, 805, t))} ${f(lerp(535, 705, t))})"/>`; }
      return o + person({ x: 1160, y: 820, s: 1.4, who: 'hanSoldier', pose: { ...P.stand(), aF: lerp(30, 120, Math.abs(Math.sin(g * 3))), eF: 20 }, g, face: -1 });
    },
    cam: [[880, 600, 1300], [860, 620, 1150]],
  },
  // ================= 张良⑥ 养虎遗患 =================
  'zl.camps': {
    bg: (id) => sky(id, '#B2A690', '#D6CCB4') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/><path d="M780,640 L820,640 L840,1100 L760,1100 Z" fill="#5A4E3C"/>`,
    fg: (u, g) => {
      let o = banner(300, 440, 1, g, RED, '楚', 0.1) + banner(1300, 440, 1, g, '#3A4A5A', '汉', 0.3);
      // 左边楚营：空粮袋、坐着发愣的兵；右边汉营：堆着粮袋、精神的兵
      for (let i = 0; i < 4; i++) o += person({ x: 120 + i * 140, y: 800 + (i % 2) * 20, s: 1.1, who: 'soldier', pose: P.slump(), g, face: 1, mood: 'sad' });
      o += `<path d="M560,780 q20,-10 40,0 l-4,20 h-32 z" fill="#B8A882" opacity=".7"/>`;
      for (let i = 0; i < 6; i++) o += `<path d="M${960 + (i % 3) * 70},${780 - Math.floor(i / 3) * 40} q35,-40 70,0 l-6,36 h-58 z" fill="#D9C08A" stroke="${INK}" stroke-width="2"/>`;
      for (let i = 0; i < 3; i++) o += person({ x: 1260 + i * 120, y: 810 + (i % 2) * 20, s: 1.15, who: 'hanSoldier', pose: P.stand(), g, face: -1, hold: 'spear' });
      return o;
    },
    cam: [[800, 580, 1600], [800, 600, 1450]],
  },
  'zl.envoy': {
    bg: (id) => tentIn(id) + dais(),
    fg: (u, g, id) => {
      const k = seg(u, 0.55, 0.9);
      return glow(id, 1200, 520, 280, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: P.mix({ ...P.sitCross(), head: -10 }, { ...P.sitCross(), aF: 70, eF: 30, head: 6 }, k), g, face: -1, detail: true }) +
        person({ x: 640, y: 800, s: 1.4, who: u < 0.5 ? 'crowd1' : 'hougong', pose: P.mix(P.bow(0.6), { ...P.stand(), aF: 70, eF: 60 }, 0.5 + 0.5 * Math.sin(g * 1.4)), g, face: 1, detail: true, a: u < 0.45 ? 1 - seg(u, 0.35, 0.45) : seg(u, 0.5, 0.6) });
    },
    cam: [[920, 560, 1500], [960, 580, 1300]],
  },
  'zl.honggou': {
    bg: (id) => sky(id, '#4A3E30', '#6A5844') + `<rect x="300" y="160" width="1000" height="720" fill="#E6C98A" stroke="#6A4A2E" stroke-width="8"/>`,
    fg: (u, g, id) => {
      // 一张象棋盘：中间就是“楚河汉界”
      const k = seg(u, 0.1, 0.6);
      let o = '';
      for (let i = 0; i < 10; i++) { const y = 200 + i * 72; if (i === 4 || i === 5) continue; o += `<path d="M360,${y} L1240,${y}" stroke="#6A4A2E" stroke-width="3" opacity="${f(k)}"/>`; }
      o += `<path d="M360,488 L1240,488 M360,560 L1240,560" stroke="#6A4A2E" stroke-width="3" opacity="${f(k)}"/>`;
      for (let j = 0; j < 9; j++) { const x = 360 + j * 110; o += `<path d="M${x},200 L${x},488 M${x},560 L${x},848" stroke="#6A4A2E" stroke-width="3" opacity="${f(k)}"/>`; }
      o += `<path d="M360,200 L360,848 M1240,200 L1240,848" stroke="#6A4A2E" stroke-width="3" opacity="${f(k)}"/>`;
      const t = seg(u, 0.5, 0.8);
      o += `<g opacity="${f(t)}"><text x="580" y="540" font-size="54" text-anchor="middle" fill="#7A2A22" style="font-family:'Kaiti SC','STKaiti',serif">楚 河</text><text x="1020" y="540" font-size="54" text-anchor="middle" fill="#2A3A5A" style="font-family:'Kaiti SC','STKaiti',serif">汉 界</text></g>`;
      const p = (x: number, y: number, c: string, ch: string) => `<circle cx="${x}" cy="${y}" r="38" fill="#F4E4C0" stroke="${c}" stroke-width="5"/><text x="${x}" y="${y + 16}" font-size="40" text-anchor="middle" fill="${c}" style="font-family:'Kaiti SC','STKaiti',serif">${ch}</text>`;
      o += `<g opacity="${f(seg(u, 0.75, 0.95))}">${p(800, 200, '#2A3A5A', '帅')}${p(800, 848, '#7A2A22', '将')}${p(580, 200, '#2A3A5A', '相')}${p(1020, 848, '#7A2A22', '象')}</g>`;
      return o + glow(id, 800, 520, 420, g, 0, 0.12);
    },
    cam: [[800, 520, 1300], [800, 520, 1200]],
  },
  'zl.return': {
    bg: (id) => sky(id, '#B2A690', '#D6CCB4') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/>` + tent(1450, 640, 1, '#4A5058'),
    fg: (u, g) => {
      const k = seg(u, 0, 0.6);
      let o = person({ x: lerp(300, 900, k), y: 800, s: 1.35, who: 'laofu', pose: k < 0.98 ? P.walk(g, 0.5) : P.stand(), g, face: 1 }) + person({ x: lerp(180, 780, k), y: 806, s: 1.3, who: 'lvhou', pose: k < 0.98 ? P.walk(g + 0.4, 0.5) : P.stand(), g, face: 1 });
      for (let i = 0; i < 5; i++) o += person({ x: 1080 + i * 110, y: 820 + (i % 2) * 20, s: 1.15, who: 'hanSoldier', pose: P.mix(P.stand(), P.cheer(g + i), seg(u, 0.5, 0.8)), g, face: -1 });
      return o + person({ x: 1000, y: 800, s: 1.45, who: 'liubangGen', pose: P.mix(P.stand(), P.bow(0.5), seg(u, 0.55, 0.8)), g, face: -1, detail: true });
    },
    cam: [[800, 580, 1500], [860, 600, 1300]],
  },
  'zl.eastward': {
    bg: (id) => sky(id, '#C9B89A', '#E6D8BC') + ridge({ y: 440, amp: 50, seed: 581, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 6; i++) o += person({ x: lerp(900, 1500, u) + i * 110, y: 780 + (i % 2) * 20, s: 1.05, who: 'soldier', pose: P.walk(g + i * 0.3, 0.8), g, face: 1 });
      o += banner(lerp(860, 1460, u), 600, 1, g, RED, '楚', 0.1);
      for (let i = 0; i < 5; i++) o += person({ x: lerp(700, 300, u) - i * 110, y: 800 + (i % 2) * 20, s: 1.05, who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.6), g, face: -1 });
      return o + banner(lerp(740, 340, u), 620, 1, g, '#3A4A5A', '汉', 0.3);
    },
    cam: [[800, 580, 1600], [800, 600, 1500]],
  },
  'zl.counsel': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => glow(id, 800, 560, 300, g, 0, 0.45) + person({ x: 1100, y: 800, s: 1.55, who: 'liubangGen', pose: P.mix(P.stand(), { ...P.stand(), head: 12, aF: 40, eF: 80 }, seg(u, 0.5, 0.9)), g, face: -1, detail: true }) +
      person({ x: 560, y: 800, s: 1.5, who: 'zhangliang', pose: { ...P.stand(), aF: 80 + 20 * Math.sin(g * 1.5), eF: 30 }, g, face: 1, detail: true }) +
      person({ x: 760, y: 806, s: 1.45, who: 'chenping', pose: P.mix(P.stand(), P.point(0.9), 0.5 + 0.5 * Math.sin(g * 1.2 + 1)), g, face: 1, detail: true }),
    cam: [[820, 580, 1400], [840, 600, 1250]],
  },
  'zl.tiger': {
    bg: (id) => sky(id, '#D8CDB4', PAPER) + `<path d="M-200,720 L1800,720 L1800,1100 L-200,1100 Z" fill="#C2B08A"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.05, 0.75);
      return tiger(800, 720, lerp(0.6, 1.8, k), g, k) + `<g opacity="${f(seg(u, 0.6, 0.85))}">${vtext(1300, 260, '养虎遗患', 52, INK, 0.85)}</g>`;
    },
    cam: [[800, 540, 1400], [800, 520, 1300]],
  },
  'zl.chase': {
    bg: (id) => sky(id, '#C9B89A', '#E6D8BC') + ridge({ y: 440, amp: 50, seed: 591, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 6; i++) { const x = lerp(-100, 1000, u) - i * 150; o += horse({ x, y: 800 + (i % 2) * 24, s: 0.95, face: 1, g, gait: 'run', ph: g * 1.8 + i * 0.3, c: i % 2 ? '#3A3230' : '#5A4A3A', rider: i === 0 ? 'liubangGen' : 'hanSoldier' }); }
      return o + banner(lerp(-200, 900, u), 600, 1.1, g, '#3A4A5A', '汉', 0.2);
    },
    cam: [[800, 600, 1600], [900, 620, 1450]],
  },
};
void INK; void PAPER; void mist; void rng; void sunDisc;
