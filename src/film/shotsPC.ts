// 彭城之战：刘邦线《彭城之败》和项羽线《彭城大捷》共用的镜头（同一场仗，两个人看）
import { GOLD, INK, PAPER, RED, banner, bareTree, cityWall, f, flame, glow, house, lerp, moon, ridge, river, seg, sky, sunDisc, tent, vtext, wav, pin } from './core';
import { P, faceCU, horse, person } from './rig';
import { hallIn } from './shotsLB';
import { tentIn } from './shots2';
import type { ShotDef } from './Film';

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** 五路诸侯的旗色 */
const HUES = [RED, '#3A5A7A', '#5A6A3A', '#6A4A6A', '#7A6A3A'];
/** 一辆兵车：一个轮子、车厢、两匹马；run 越大跑得越快 */
const warCart = (x: number, y: number, s: number, g: number, run = 1) =>
  [0, 1].map((i) => horse({ x: x + 200 * s + i * 34 * s, y: y + i * 6, s: 0.85 * s, g, gait: run > 0.5 ? 'run' : 'walk', ph: g * (0.6 + run) + i * 0.3, c: i ? '#3A3230' : '#5A4A3A' })).join('') +
  `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><path d="M-90,-56 L90,-56 L96,0 L-96,0 Z" fill="#5A3E2A" stroke="${INK}" stroke-width="4"/><path d="M-90,-56 L-90,-96 M90,-56 L90,-96 M-90,-96 L90,-96" stroke="#5A3E2A" stroke-width="6"/>` +
  `<circle cx="0" cy="14" r="48" fill="none" stroke="#2A2620" stroke-width="10"/><path d="M0,14 L${f(Math.cos(g * 9 * run) * 46)},${f(14 + Math.sin(g * 9 * run) * 46)} M0,14 L${f(-Math.cos(g * 9 * run) * 46)},${f(14 - Math.sin(g * 9 * run) * 46)}" stroke="#2A2620" stroke-width="4"/>` +
  `<path d="M96,-20 L210,-14" stroke="#2A2620" stroke-width="6"/></g>`;
/** 尘土：跑起来扬起的土 */
const dust = (x: number, y: number, g: number, n = 6, a = 0.35) => Array.from({ length: n }, (_, i) => { const t = (g * 0.6 + i / n) % 1; return `<circle cx="${f(x - t * 220 - i * 10)}" cy="${f(y - t * 40)}" r="${f(16 + t * 50)}" fill="#B8A882" opacity="${f(a * (1 - t))}"/>`; }).join('');
/** 彭城：一段城墙 */
const pcWall = (x: number, y: number, w: number) => cityWall(x, y, w, 1.3, 0.85);

export const SHOTS_PC: Record<string, ShotDef> = {
  // ---------- 五十六万人东进 ----------
  'pc.march': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + ridge({ y: 420, amp: 50, seed: 601, a: 0.2 }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = '';
      // 五路人马，一路一种旗色，一排排往东（右）走，越走越多
      for (let r = 0; r < 5; r++) {
        const y = 640 + r * 70, n = Math.round(lerp(4, 11, seg(u, r * 0.08, 0.6 + r * 0.08)));
        o += banner(lerp(300, 700, u) + (r * 2 + 1) * 60 - r * 30, y - 90, 0.75, g, HUES[r], r === 0 ? '汉' : '', r * 0.2);
        for (let i = 0; i < n; i++) o += person({ x: lerp(300, 700, u) + i * 60 - r * 30, y, s: 0.75 + r * 0.06, who: r === 0 ? 'hanSoldier' : 'soldier', pose: P.walk(g + i * 0.3 + r, 0.8), g, face: 1 });
      }
      return o;
    },
    cam: [[800, 640, 1600], [900, 660, 1500]],
  },
  'pc.enter': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + pcWall(-100, 600, 1800) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + vtext(1000, 320, '彭城', 44, INK, 0.8),
    fg: (u, g) => {
      let o = banner(800, 380, 1.1, g, RED, '汉', seg(u, 0.4, 0.7) > 0.5 ? 0 : 0.2, seg(u, 0.4, 0.7));
      for (let i = 0; i < 10; i++) { const x = lerp(-200, 900, u) - i * 90; if (x < 760) o += person({ x, y: 780 + (i % 2) * 24, s: 1.2, who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.8), g, face: 1 }); }
      return o;
    },
    cam: [[800, 560, 1500], [800, 580, 1350]],
  },
  'pc.feast': {
    bg: (id) => hallIn(id),
    fg: (u, g, id) => {
      let o = glow(id, 800, 460, 420, g, 0, 0.45) + `<rect x="560" y="690" width="480" height="30" fill="#6A3A2C"/>`;
      for (let i = 0; i < 4; i++) o += `<circle cx="${600 + i * 120}" cy="684" r="12" fill="${GOLD}"/>`;
      o += person({ x: 800, y: 700, s: 1.55, who: 'liubangGen', pose: P.drink(0.5 + 0.5 * Math.sin(g * 1.4)), g, face: 1, detail: true, hold: 'cup', mood: 'laugh' });
      for (let i = 0; i < 4; i++) o += person({ x: [330, 450, 1150, 1270][i], y: 730, s: 1.3, who: ['crowd1', 'crowd4', 'crowd2', 'zhaoSoldier'][i], pose: P.drink(0.5 + 0.5 * Math.sin(g * 1.2 + i)), g, face: i < 2 ? 1 : -1, hold: 'cup', mood: 'laugh' });
      for (let i = 0; i < 2; i++) o += person({ x: 560 + i * 480, y: 860, s: 1.3, who: 'yuji', pose: P.dance(g * 0.8 + i * 0.5), g, face: i ? -1 : 1 });
      return o;
    },
    cam: [[800, 560, 1500], [800, 600, 1250]],
  },
  // ---------- 项羽在齐 ----------
  'pc.qi': {
    bg: (id) => sky(id, '#A8A090', '#D2C8B2') + ridge({ y: 440, amp: 60, seed: 611, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/>` + tent(1250, 640, 1.6, '#5B5248') + tent(1450, 650, 1.2, '#5B5248'),
    fg: (u, g) => {
      const k = seg(u, 0.35, 0.7);
      return banner(1120, 470, 1.2, g, RED, '楚', 0.1) + person({ x: lerp(300, 620, seg(u, 0, 0.3)), y: 820, s: 1.35, who: 'soldier', pose: u < 0.3 ? P.walk(g * 1.4, 1) : { ...P.kneelWash(0), lean: 30, head: 14 }, g, face: 1 }) +
        person({ x: 900, y: 820, s: 1.65, who: 'xiangyu', pose: P.mix(P.stand(), { ...P.stand(), aF: 150, eF: 0, head: -10 }, k), g, face: -1, detail: true, mood: k > 0.5 ? 'sneer' : 'calm' });
    },
    cam: [[820, 560, 1500], [800, 600, 1300]],
  },
  'pc.ride': {
    bg: (id) => sky(id, '#14161E', '#2E3038') + moon(id, 300, 160, 30, 0.7) + ridge({ y: 440, amp: 60, seed: 621, a: 0.5, color: '#22242C' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#1E2026"/>`,
    fg: (u, g) => {
      let o = '';
      // 三万精兵连夜绕道：马队从右往左（往西）飞奔
      for (let i = 0; i < 7; i++) { const x = lerp(1500, 300, (u + i * 0.13) % 1.0) + (i % 2) * 40; o += horse({ x, y: 780 + (i % 3) * 30, s: 0.9, face: -1, g, gait: 'run', ph: g * 1.6 + i * 0.3, c: i % 2 ? '#2A2420' : '#3A3230', rider: i === 3 ? 'xiangyu' : 'soldier' }); }
      return o;
    },
    cam: [[800, 600, 1600], [800, 620, 1450]],
  },
  // ---------- 清晨，从西边杀来 ----------
  'pc.dawn': {
    bg: (id) => sky(id, '#D8A880', '#EED8B8') + sunDisc(id, 1350, 360, 50, '#E07A4A', 0.8) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#A8946C"/>` + [900, 1100, 1300, 1500].map((x, i) => tent(x, 630 + (i % 2) * 10, 1.1, '#5A5A5E')).join(''),
    fg: (u, g) => {
      const k = seg(u, 0, 0.7);
      let o = '';
      for (let i = 0; i < 6; i++) { const x = lerp(-300, 900, k) - i * 140; o += dust(x + 40, 840, g + i, 3, 0.25) + horse({ x, y: 820 + (i % 2) * 30, s: 0.95, face: 1, g, gait: 'run', ph: g * 1.8 + i * 0.3, c: i % 2 ? '#2A2420' : '#3A3230', rider: i === 0 ? 'xiangyu' : 'soldier' }); }
      o += banner(lerp(-200, 840, k), 600, 1.1, g, RED, '楚', 0.1);
      for (let i = 0; i < 6; i++) { const flee = seg(u, 0.3 + i * 0.05, 0.8); o += person({ x: 1000 + i * 110 + flee * 300, y: 800 + (i % 2) * 24, s: 1.1, who: 'hanSoldier', pose: flee > 0.05 ? P.walk(g * 1.8 + i, 1) : P.drink(0.4), g, face: flee > 0.05 ? 1 : -1, mood: flee > 0.05 ? 'shock' : 'calm' }); }
      return o;
    },
    cam: [[800, 600, 1600], [900, 620, 1450]],
  },
  // ---------- 睢水为之不流（不画血，只画挤满河的旗子、盾牌） ----------
  'pc.river': {
    bg: (id) => sky(id, '#8A8478', '#B8B0A0') + ridge({ y: 420, amp: 40, seed: 631, a: 0.2 }) + `<path d="M-200,520 L1800,520 L1800,780 L-200,780 Z" fill="#7E8C8A"/><path d="M-200,780 L1800,780 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/>`,
    fg: (u, g) => {
      const jam = seg(u, 0.2, 0.8);
      let o = river(632, g * (1 - jam * 0.9), { y0: 530, y1: 770, speed: 30, n: 40 });
      // 河面上越来越多漂着的旗子、盾牌：河水流不动了
      for (let i = 0; i < 40; i++) { if (i / 40 > jam) break; const x = -100 + ((i * 137) % 1800), y = 560 + ((i * 71) % 200); o += i % 3 ? `<ellipse cx="${x}" cy="${y}" rx="26" ry="10" fill="#5A4A3A" stroke="${INK}" stroke-width="2"/>` : `<path d="M${x - 30},${y} L${x + 30},${y - 8} L${x + 26},${y + 10} Z" fill="${HUES[i % 5]}" opacity=".85"/>`; }
      for (let i = 0; i < 5; i++) o += person({ x: 300 + i * 140, y: 900, s: 1.2, who: 'soldier', pose: P.point(0.8), g, face: 1 });
      return o + banner(220, 760, 1, g, RED, '楚', 0.1);
    },
    cam: [[800, 640, 1600], [800, 660, 1450]],
  },
  // ---------- 围汉王三匝（俯看） ----------
  'pc.circle': {
    bg: (id) => sky(id, '#B8A57E', '#C9B88E'),
    fg: (u, g) => {
      let o = '';
      for (let r = 0; r < 3; r++) {
        const k = seg(u, r * 0.22, r * 0.22 + 0.35), R = 170 + r * 90, n = 18 + r * 8;
        for (let i = 0; i < n; i++) { if (i / n > k) break; const a = (i / n) * Math.PI * 2 + r * 0.2; o += `<circle cx="${f(800 + Math.cos(a) * R)}" cy="${f(480 + Math.sin(a) * R * 0.62)}" r="13" fill="#2A2420"/><circle cx="${f(800 + Math.cos(a) * R)}" cy="${f(474 + Math.sin(a) * R * 0.62)}" r="5" fill="${RED}"/>`; }
      }
      return o + `<rect x="772" y="456" width="56" height="40" fill="#5A3E2A" stroke="${INK}" stroke-width="3"/>` + banner(800, 440, 0.8, g, RED, '汉', 0.1) + `<g opacity="${f(seg(u, 0.75, 0.95))}">${vtext(1250, 260, '三匝', 52, INK, 0.85)}</g>`;
    },
    cam: [[800, 480, 1400], [800, 480, 1200]],
  },
  // ---------- 大风从西北而起 ----------
  'pc.storm': {
    bg: (id) => sky(id, '#3A3632', '#6A6054') + `<path d="M-200,660 L1800,660 L1800,1100 L-200,1100 Z" fill="#5A5040"/>`,
    fg: (u, g) => {
      const k = seg(u, 0, 0.4);
      let o = `<rect x="-200" y="-100" width="2000" height="1200" fill="#2A2620" opacity="${f(0.45 * k)}"/>`;
      for (let i = 0; i < 3; i++) o += `<g transform="rotate(${f(k * (24 + i * 6) + Math.sin(g * 3 + i) * 4)} ${300 + i * 500} 660)">${bareTree(641 + i, 300 + i * 500, 660, 1.4, 0.9, g)}</g>`;
      // 斜着刮过的沙石
      for (let i = 0; i < 70; i++) { const t = (g * 0.9 + i / 70) % 1, x = -200 + t * 2000, y = 80 + ((i * 97) % 760) + t * 120; o += i % 4 ? `<path d="M${f(x)},${f(y)} l60,14" stroke="#C9B88E" stroke-width="3" opacity="${f(0.55 * k)}"/>` : `<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="#8A7A5A" opacity="${f(0.8 * k)}"/>`; }
      for (let i = 0; i < 6; i++) o += person({ x: 600 + i * 150, y: 840 + (i % 2) * 20, s: 1.2, who: 'soldier', pose: { ...P.stand(), lean: -20 * k, head: -10 * k, aF: lerp(10, 130, k), eF: lerp(10, 120, k) }, g, face: -1, mood: 'shock' });
      return o;
    },
    cam: [[800, 520, 1500], [800, 560, 1350]],
  },
  'pc.escape': {
    bg: (id) => sky(id, '#5A5248', '#8A7E6A') + ridge({ y: 440, amp: 50, seed: 651, a: 0.3, color: '#4A4238' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#6A5E48"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 5; i++) { const x = lerp(400, 1500, u) - i * 160; o += dust(x + 40, 840, g + i, 4, 0.3) + horse({ x, y: 820 + (i % 2) * 24, s: 0.95, face: 1, g, gait: 'run', ph: g * 1.8 + i * 0.3, c: i % 2 ? '#3A3230' : '#5A4A3A', rider: i === 0 ? 'liubangGen' : 'hanSoldier' }); }
      return o + Array.from({ length: 30 }, (_, i) => { const t = (g * 0.8 + i / 30) % 1; return `<path d="M${f(-200 + t * 2000)},${f(150 + (i * 53) % 600)} l50,10" stroke="#C9B88E" stroke-width="3" opacity=".35"/>`; }).join('');
    },
    cam: [[800, 600, 1600], [1000, 620, 1450]],
  },
  // ---------- 刘邦线：路上的两个孩子 ----------
  'pc.kids': {
    bg: (id) => sky(id, '#8A7E6A', '#B8AC94') + ridge({ y: 440, amp: 50, seed: 661, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#9A8A6C"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.3, 0.8);
      return warCart(700, 780, 1.1, g, 0) + person({ x: 680, y: 720, s: 1.3, who: 'liubangGen', pose: P.mix(P.stand(), { ...P.stand(), aF: 60, eF: 40, lean: 20 }, k), g, face: -1, detail: true }) +
        person({ x: 780, y: 716, s: 1.2, who: 'tenggong', pose: { ...P.stand(), aF: 60, eF: 50 }, g, face: 1, hold: 'reins' }) +
        person({ x: lerp(420, 640, k), y: lerp(840, 730, k), s: 0.8, who: 'crowd3', pose: k < 0.95 ? P.walk(g, 0.7) : P.stand(), g, face: 1 }) +
        person({ x: lerp(340, 600, k), y: lerp(850, 734, k), s: 0.72, who: 'yuji', pose: k < 0.95 ? P.walk(g + 0.4, 0.7) : P.stand(), g, face: 1 });
    },
    cam: [[800, 600, 1400], [760, 620, 1250]],
  },
  'pc.push': {
    bg: (id) => sky(id, '#7A7262', '#A89C84') + ridge({ y: 440, amp: 50, seed: 671, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#8A7A5E"/>`,
    fg: (u, g, _id, v) => {
      // 一连三次：孩子被推下车，滕公跳下去抱回来
      const c = (u * 3) % 1, fall = seg(c, 0.1, 0.35), back = seg(c, 0.55, 0.9);
      const down = fall > 0 && back < 1;
      let o = dust(560, 840, g, 6, 0.3) + warCart(700, 780, 1.1, g, 1);
      o += person({ x: 680, y: 720, s: 1.3, who: 'liubangGen', pose: P.mix({ ...P.stand(), lean: 14, head: -8 }, { ...P.stand(), aF: 80, eF: 0, lean: -10 }, fall * (1 - back)), g, face: -1, detail: true, mood: 'shock' });
      o += person({ x: down ? lerp(780, 500, back > 0 ? 1 - back : fall) : 780, y: down ? lerp(716, 840, Math.min(1, fall * 2) * (1 - back)) : 716, s: 1.2, who: 'tenggong', pose: down && back < 0.5 ? P.mix(P.stand(), P.bow(0.8), fall) : { ...P.stand(), aF: 60, eF: 50 }, g, face: down ? -1 : 1, hold: down ? undefined : 'reins' });
      const kx = lerp(640, 470, fall * (1 - back)), ky = lerp(730, 860, fall * (1 - back));
      o += person({ x: kx, y: ky, s: 0.8, who: 'crowd3', pose: fall * (1 - back) > 0.5 ? { ...P.sitCross(), lean: -20 } : P.stand(), g, face: 1 }) + person({ x: kx - 50, y: ky + 4, s: 0.72, who: 'yuji', pose: fall * (1 - back) > 0.5 ? { ...P.sitCross(), lean: -14 } : P.stand(), g, face: 1 });
      // 后面追来的楚骑
      o += horse({ x: lerp(-200, 120, (u * 3) % 1), y: 830, s: 0.85, face: 1, g, gait: 'run', ph: g * 1.8, c: '#2A2420', rider: 'soldier' });
      return o + `<g opacity="${f(seg(u, 0.1, 0.2))}">${pin(v, 0.86, 0.16, vtext(0, 0, ['一', '二', '三'][Math.min(2, Math.floor(u * 3))], 64, '#7A2A22', 0.85))}</g>`;
    },
    cam: [[760, 600, 1500], [760, 620, 1400]],
  },
  'pc.teng': {
    bg: (id) => sky(id, '#7A7262', '#A89C84') + ridge({ y: 440, amp: 50, seed: 672, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#8A7A5E"/>`,
    fg: (u, g) => dust(560, 840, g, 6, 0.3) + warCart(700, 780, 1.2, g, 1) + person({ x: 670, y: 714, s: 1.4, who: 'liubangGen', pose: { ...P.stand(), head: 10 }, g, face: 1, detail: true }) +
      person({ x: 790, y: 710, s: 1.3, who: 'tenggong', pose: { ...P.stand(), aF: 60, eF: 50, head: Math.sin(g * 2) > 0 ? -14 : 0 }, g, face: -1, hold: 'reins', detail: true }) +
      person({ x: 620, y: 730, s: 0.8, who: 'crowd3', pose: P.stand(), g, face: 1 }) + person({ x: 580, y: 734, s: 0.72, who: 'yuji', pose: P.stand(), g, face: 1 }),
    cam: [[820, 600, 1300], [800, 600, 1150]],
  },
  'pc.after': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + cityWall(900, 640, 800, 1.2, 0.8) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + vtext(1480, 330, '荥阳', 44, INK, 0.8),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 4; i++) { const x = lerp(-100, 700, u) - i * 260; o += `<g transform="translate(${f(x)},800)"><rect x="-80" y="-60" width="160" height="50" fill="#8A6A3A" stroke="${INK}" stroke-width="3"/><path d="M-70,-60 q35,-30 70,0 q35,-30 70,0" fill="#D9C08A" stroke="${INK}" stroke-width="2"/><circle cx="-40" cy="0" r="26" fill="none" stroke="#2A2620" stroke-width="7"/><circle cx="40" cy="0" r="26" fill="none" stroke="#2A2620" stroke-width="7"/></g>` + person({ x: x + 120, y: 820, s: 1.1, who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.7), g, face: 1 }); }
      return o + banner(1080, 500, 1.1, g, RED, '汉', 0.1) + person({ x: 1150, y: 820, s: 1.5, who: 'liubangGen', pose: P.mix(P.stand(), P.point(0.8), seg(u, 0.5, 0.8)), g, face: -1, detail: true });
    },
    cam: [[800, 580, 1600], [880, 600, 1400]],
  },
  // ---------- 项羽线：一张脸、对峙 ----------
  'pc.xyCU': {
    bg: (id) => sky(id, '#B88A60', '#E2C49A'),
    fg: (u, g, id) => faceCU({ x: 720, y: 480, s: 1.7, who: 'xiangyu', g, id, brow: -0.1, mouth: Math.sin(g * 7) > 0.2 ? 0.4 : 0, look: 0.2 }) +
      `<g opacity="${f(seg(u, 0.15, 0.45))}">${vtext(1320, 140, '三万', 50, '#7A2A22', 0.9)}${vtext(1400, 140, '五十六万', 50, INK, 0.75)}</g>`,
    cam: [[860, 470, 1450], [860, 460, 1350]],
  },
  'pc.standoff': {
    bg: (id) => sky(id, '#B2A690', '#D6CCB4') + `<path d="M-200,520 L620,520 L700,1100 L-200,1100 Z" fill="#9A8A6C"/><path d="M1800,520 L980,520 L900,1100 L1800,1100 Z" fill="#9A8A6C"/><path d="M620,520 L980,520 L900,1100 L700,1100 Z" fill="#6A5E48"/>`,
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 5; i++) o += tent(80 + i * 110, 560 + (i % 2) * 10, 0.8, '#5A4A40') + tent(1120 + i * 110, 560 + (i % 2) * 10, 0.8, '#4A5058');
      o += banner(480, 420, 1.1, g, RED, '楚', 0.1) + banner(1140, 420, 1.1, g, '#3A4A5A', '汉', 0.3);
      for (let i = 0; i < 5; i++) o += person({ x: 160 + i * 100, y: 760, s: 1, who: 'soldier', pose: P.stand(), g, face: 1 }) + person({ x: 1060 + i * 100, y: 760, s: 1, who: 'hanSoldier', pose: P.stand(), g, face: -1 });
      return o + `<g opacity="${f(seg(u, 0.3, 0.6))}">${vtext(800, 260, '荥阳', 44, INK, 0.75)}</g>`;
    },
    cam: [[800, 560, 1600], [800, 580, 1450]],
  },
};
void flame; void house; void lerp; void wav; void clamp01; void tentIn;
