// 汉初的几段支线：刘邦⑥ 大风歌、萧何④ 功人功狗、张良⑦ 从赤松子游、萧何⑤ 萧规曹随
import { GOLD, INK, PAPER, RED, banner, bareTree, cityWall, f, glow, house, lerp, mist, ridge, seg, sky, soundRings, sunDisc, vtext } from './core';
import { P, faceCU, horse, person } from './rig';
import { hallIn } from './shotsLB';
import { office } from './shotsXH';
import { dais } from './shots2';
import { slips } from './shots1';
import type { ShotDef } from './Film';

const court = (id: string) => hallIn(id) + dais();
const seal = (x: number, y: number, s = 1, txt = '') => `<rect x="${f(x - 18 * s)}" y="${f(y - 18 * s)}" width="${f(36 * s)}" height="${f(36 * s)}" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>` + (txt ? `<text x="${f(x)}" y="${f(y + 9 * s)}" font-size="${f(24 * s)}" text-anchor="middle" fill="${INK}" style="font-family:'Kaiti SC','STKaiti',serif">${txt}</text>` : '');
/** 筑：长条的琴身、几根弦，用竹尺敲 */
const zhu = (x: number, y: number, s = 1, hit = 0) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-150,-14 L150,-24 L150,6 L-150,16 Z" fill="#7A5A3A" stroke="${INK}" stroke-width="3"/>` +
  [0, 1, 2, 3, 4].map((i) => `<path d="M-140,${-8 + i * 4} L140,${-18 + i * 4}" stroke="#E9DFCB" stroke-width="1.5" opacity="${f(0.6 + 0.4 * hit * (i % 2))}"/>`).join('') + `</g>`;
/** 一只猎狗、一只兔子 */
const hound = (x: number, y: number, s: number, g: number) => { const r = Math.sin(g * 10) * 10; return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><path d="M-60,-30 Q0,-50 50,-34 L76,-50 L84,-36 L64,-24 Q60,-10 40,-12 L-50,-10 Q-80,-20 -90,-44" fill="#8A6A44" stroke="${INK}" stroke-width="3"/><path d="M-40,-12 l${f(-14 - r)},30 M-20,-12 l${f(10 + r)},30 M30,-14 l${f(-10 + r)},32 M44,-14 l${f(14 - r)},30" stroke="#6A4A2E" stroke-width="7" stroke-linecap="round"/></g>`; };
const hare = (x: number, y: number, s: number, g: number) => { const b = Math.abs(Math.sin(g * 9)) * 16; return `<g transform="translate(${f(x)},${f(y - b)}) scale(${s})"><ellipse cx="0" cy="-20" rx="34" ry="20" fill="#B8A882" stroke="${INK}" stroke-width="2"/><circle cx="32" cy="-34" r="13" fill="#B8A882" stroke="${INK}" stroke-width="2"/><path d="M30,-46 l-6,-30 M38,-46 l4,-30" stroke="#B8A882" stroke-width="7" stroke-linecap="round"/><circle cx="-32" cy="-24" r="7" fill="#F1E8D6"/></g>`; };
/** 床榻（病人坐在上面，上沿 y） */
const bed = (x: number, y: number) => `<rect x="${x - 220}" y="${y}" width="440" height="34" fill="#6A3A2C" stroke="${INK}" stroke-width="3"/><path d="M${x - 210},${y + 34} v60 M${x + 210},${y + 34} v60" stroke="#4A2A22" stroke-width="14"/><rect x="${x - 220}" y="${y - 70}" width="18" height="70" fill="#6A3A2C"/>`;

export const SHOTS_LATE: Record<string, ShotDef> = {
  // ================= 刘邦⑥ 大风歌 =================
  'lb6.road': {
    bg: (id) => sky(id, '#D8B890', '#EBD8B4') + sunDisc(id, 1300, 300, 60, '#D8804A', 0.8) + ridge({ y: 460, amp: 60, seed: 951, a: 0.3 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + cityWall(1150, 640, 600, 1, 0.7) + vtext(1450, 400, '沛', 46, INK, 0.75),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 6; i++) o += person({ x: lerp(200, 700, u) - i * 120, y: 820 + (i % 2) * 20, s: 1.1, who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.7), g, face: 1 }) + (i % 2 ? '' : banner(lerp(220, 720, u) - i * 120, 660, 0.8, g, RED, '汉', i * 0.2));
      return o + horse({ x: lerp(500, 1000, u), y: 840, s: 1.2, face: 1, g, gait: 'walk', c: '#E6DCC8', rider: 'liubang' });
    },
    cam: [[800, 580, 1600], [900, 600, 1450]],
  },
  'lb6.feast': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 360, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: P.drink(0.5 + 0.5 * Math.sin(g * 1.2)), g, face: -1, detail: true, hold: 'cup', mood: 'laugh' });
      for (let i = 0; i < 6; i++) o += person({ x: 180 + i * 140, y: 770 + (i % 2) * 40, s: 1.1, who: ['laofu', 'crowd1', 'laofu', 'crowd2', 'crowd4', 'laofu'][i], pose: P.mix(P.sitCross(), P.drink(0.6), 0.5 + 0.5 * Math.sin(g * 1.3 + i)), g, face: 1, hold: 'cup', mood: 'laugh' });
      return o;
    },
    cam: [[800, 560, 1600], [860, 580, 1450]],
  },
  'lb6.zhu': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      const hit = Math.max(0, Math.sin(g * 5));
      return glow(id, 1200, 560, 320, g, 0, 0.5) + zhu(1180, 640, 1.1, hit) + person({ x: 1260, y: 640, s: 1.45, who: 'liubang', pose: { ...P.sitCross(), aF: lerp(60, 100, hit), eF: 50, head: 10 }, g, face: -1, detail: true }) +
        `<path d="M${f(1180 + 40 * hit)},${f(560 + 40 * (1 - hit))} l-60,40" stroke="#C9A46A" stroke-width="6"/>` + (hit > 0.7 ? soundRings(1100, 580, g, { dir: -1, n: 3, r0: 20 }) : '');
    },
    cam: [[1100, 540, 1100], [1150, 560, 950]],
  },
  'lb6.song': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      // 风吹过来的几道云纹
      let o = Array.from({ length: 5 }, (_, i) => { const t = (g * 0.15 + i / 5) % 1; return `<path d="M${f(-200 + t * 2000)},${120 + i * 60} q60,-30 120,0 q60,30 120,0" stroke="#E9DFCB" stroke-width="4" fill="none" opacity="${f(0.35 * Math.sin(t * Math.PI))}"/>`; }).join('');
      o += glow(id, 1200, 520, 360, g, 0, 0.5) + person({ x: 1200, y: 640, s: 1.5, who: 'liubang', pose: P.sing(g * 0.4), g, face: -1, detail: true });
      for (let i = 0; i < 3; i++) o += `<g opacity="${f(seg(u, 0.05 + i * 0.28, 0.25 + i * 0.28))}">${vtext(560 - i * 90, 180, ['大风起兮云飞扬', '威加海内兮归故乡', '安得猛士兮守四方'][i], 44, i === 2 ? GOLD : '#F1E8D6', 0.92)}</g>`;
      return o;
    },
    cam: [[800, 520, 1600], [820, 520, 1500]],
  },
  'lb6.kids': {
    bg: (id) => hallIn(id),
    fg: (u, g, id) => {
      let o = glow(id, 800, 520, 420, g, 0, 0.4);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 10; i++) o += person({ x: 180 + i * 135 + r * 30, y: 760 + r * 70, s: 0.75, who: ['crowd3', 'crowd1', 'crowd2', 'crowd4'][(i + r) % 4], pose: { ...P.stand(), head: Math.sin(g * 2 + i * 0.5) * 8 }, g, face: i < 5 ? 1 : -1 });
      return o + soundRings(800, 560, g, { dir: 1, n: 4, r0: 40 }) + soundRings(800, 560, g, { dir: -1, n: 4, r0: 40 });
    },
    cam: [[800, 600, 1600], [800, 620, 1450]],
  },
  'lb6.dance': {
    bg: (id) => hallIn(id),
    fg: (u, g, id) => {
      const x = 800 + Math.sin(g * 0.8) * 60;
      const tears = Array.from({ length: 3 }, (_, i) => { const t = (g * 0.7 + i / 3) % 1; return `<path d="M${f(x + 30)},${f(470 + t * 90)} q-4,8 0,12 q4,-4 0,-12" fill="#A8C8E0" opacity="${f(seg(u, 0.4, 0.6) * (1 - t))}"/>`; }).join('');
      return glow(id, 800, 520, 380, g, 0, 0.45) + person({ x, y: 800, s: 1.7, who: 'liubang', pose: P.mix(P.dance(g * 0.6), { ...P.stand(), head: 14, aF: 30, eF: 60 }, seg(u, 0.5, 0.8)), g, face: Math.sin(g * 0.8) > 0 ? 1 : -1, detail: true, mood: u > 0.5 ? 'sad' : 'laugh' }) + tears;
    },
    cam: [[800, 540, 1300], [800, 520, 1100]],
  },
  'lb6.speak': {
    bg: (id) => hallIn(id),
    fg: (u, g, id) => {
      let o = glow(id, 900, 520, 340, g, 0, 0.4) + person({ x: 1050, y: 800, s: 1.6, who: 'liubang', pose: P.mix(P.stand(), { ...P.stand(), aF: 70, eF: 50 }, 0.5 + 0.5 * Math.sin(g * 1.2)), g, face: -1, detail: true });
      for (let i = 0; i < 4; i++) o += person({ x: 380 + i * 130, y: 810 + (i % 2) * 20, s: 1.3, who: ['laofu', 'crowd1', 'laofu', 'crowd2'][i], pose: P.bow(0.3), g, face: 1, mood: 'sad' });
      return o;
    },
    cam: [[800, 560, 1400], [820, 580, 1250]],
  },
  'lb6.leave': {
    bg: (id) => sky(id, '#D8C8A8', PAPER) + ridge({ y: 460, amp: 60, seed: 952, a: 0.25 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + cityWall(900, 640, 900, 1, 0.7),
    fg: (u, g) => {
      let o = horse({ x: lerp(800, 300, u), y: 840, s: 1.2, face: -1, g, gait: 'walk', c: '#E6DCC8', rider: 'liubang' });
      for (let i = 0; i < 6; i++) o += person({ x: 1050 + i * 110, y: 820 + (i % 2) * 20, s: 1.2, who: ['laofu', 'crowd1', 'crowd3', 'laofu', 'crowd2', 'crowd4'][i], pose: P.mix(P.bow(0.4), { ...P.stand(), aF: 150 + 10 * Math.sin(g * 4 + i), eF: 10 }, seg(u, 0.3, 0.6)), g, face: -1 });
      return o;
    },
    cam: [[800, 580, 1600], [760, 600, 1450]],
  },
  'lb6.cu': {
    bg: (id) => sky(id, '#6A5440', '#9A8466') + glow(id, 1250, 500, 380, 0, 0, 0.35),
    fg: (u, g, id) => faceCU({ x: 720, y: 480, s: 1.7, who: 'liubang', g, id, brow: 0.3, mouth: 0, look: 0.3 }) + `<g opacity="${f(seg(u, 0.1, 0.4))}">${vtext(1360, 140, '安得猛士兮守四方', 44, '#F1E8D6', 0.9)}</g>`,
    cam: [[860, 470, 1450], [860, 460, 1350]],
  },
  // ================= 萧何④ 功人功狗 =================
  'xh4.court': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 320, g, 0, 0.4) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: { ...P.sitCross(), head: 10 }, g, face: -1, detail: true });
      const who = ['fankuai', 'hanSoldier', 'caocan', 'crowd1', 'zhonglimo', 'crowd2'];
      for (let i = 0; i < 6; i++) o += person({ x: 200 + i * 130, y: 800 + (i % 2) * 20, s: 1.2, who: who[i] as 'fankuai', pose: P.mix(P.point(0.8), P.akimbo(), 0.5 + 0.5 * Math.sin(g * 2 + i * 1.3)), g, face: i % 2 ? -1 : 1, mood: 'sneer' });
      return o + soundRings(560, 600, g, { dir: 1, n: 3, r0: 30 });
    },
    cam: [[800, 560, 1600], [800, 580, 1450]],
  },
  'xh4.fief': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.6);
      let o = glow(id, 1200, 520, 320, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: P.mix({ ...P.sitCross(), head: 6 }, { ...P.sitCross(), aF: 90, eF: 0 }, k), g, face: -1, detail: true });
      o += person({ x: 860, y: 800, s: 1.45, who: 'xiaohe', pose: P.bow(0.6), g, face: 1, detail: true }) + seal(lerp(1120, 930, k), lerp(600, 690, k), 1, '酂');
      for (let i = 0; i < 3; i++) o += person({ x: 300 + i * 130, y: 810, s: 1.2, who: ['fankuai', 'hanSoldier', 'caocan'][i], pose: { ...P.stand(), head: -6 }, g, face: 1, mood: seg(u, 0.6, 0.8) > 0.5 ? 'sneer' : 'calm' });
      return o;
    },
    cam: [[820, 560, 1500], [880, 580, 1300]],
  },
  'xh4.protest': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 320, g, 0, 0.4) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: { ...P.sitCross(), head: 6 }, g, face: -1, detail: true });
      o += person({ x: 960, y: 800, s: 1.4, who: 'xiaohe', pose: { ...P.stand(), aF: 60, eF: 80 }, g, face: -1, detail: true, hold: 'brush' });
      for (let i = 0; i < 4; i++) o += person({ x: lerp(300, 420, seg(u, 0, 0.3)) + i * 130, y: 800 + (i % 2) * 20, s: 1.3, who: ['fankuai', 'hanSoldier', 'caocan', 'soldier'][i], pose: i % 2 ? P.point(1) : { ...P.stand(), aF: 140, eF: 10 }, g, face: 1, mood: 'sneer', hold: i % 2 ? undefined : 'spear' });
      return o + `<g opacity="${f(seg(u, 0.4, 0.7))}">${vtext(560, 300, '汗马之劳', 46, GOLD, 0.9)}</g>`;
    },
    cam: [[800, 560, 1500], [780, 580, 1350]],
  },
  'xh4.ask': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 320, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.45, who: 'liubang', pose: { ...P.sitCross(), aF: 110 + 10 * Math.sin(g * 4), eF: 10 }, g, face: -1, detail: true, mood: 'laugh' }) + soundRings(1080, 470, g, { dir: -1, n: 3, r0: 30 });
      for (let i = 0; i < 4; i++) o += person({ x: 300 + i * 140, y: 800 + (i % 2) * 20, s: 1.25, who: ['fankuai', 'hanSoldier', 'caocan', 'soldier'][i], pose: { ...P.stand(), head: 10 * Math.max(0, Math.sin(g * 3 + i)) }, g, face: 1 });
      return o;
    },
    cam: [[820, 560, 1500], [860, 580, 1350]],
  },
  'xh4.hunt': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + ridge({ y: 440, amp: 60, seed: 961, a: 0.25 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + bareTree(962, 1450, 640, 1, 0.6),
    fg: (u, g) => {
      const hx = lerp(700, 1500, u);
      return hare(hx, 820, 1.1, g) + hound(hx - 300, 830, 1.1, g) + hound(hx - 480, 846, 1, g + 0.4) +
        person({ x: 300, y: 820, s: 1.55, who: 'xiaohe', pose: P.point(1), g, face: 1, detail: true }) +
        `<g opacity="${f(seg(u, 0.2, 0.4))}"><path d="M380,620 Q${f(hx / 2 + 200)},480 ${f(hx)},700" stroke="#7A2A22" stroke-width="4" stroke-dasharray="12 10" fill="none"/></g>` +
        `<g opacity="${f(seg(u, 0.4, 0.7))}">${vtext(240, 300, '功人', 48, '#7A2A22', 0.9)}${vtext(1500, 300, '功狗', 48, INK, 0.8)}</g>`;
    },
    cam: [[800, 580, 1600], [860, 600, 1500]],
  },
  'xh4.clan': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` + banner(1450, 460, 1, 0, RED, '汉'),
    fg: (u, g) => {
      let o = person({ x: 500, y: 790, s: 1.55, who: 'xiaohe', pose: P.walk(g * 0.6, 0.5), g, face: 1, detail: true });
      const n = Math.round(lerp(4, 16, seg(u, 0.1, 0.8)));
      for (let i = 0; i < n; i++) o += person({ x: 380 - (i % 8) * 70, y: 800 + Math.floor(i / 8) * 50, s: 1, who: ['crowd2', 'crowd4', 'crowd1', 'crowd3'][i % 4], pose: P.walk(g * 0.6 + i * 0.3, 0.5), g, face: 1, hold: i % 3 ? undefined : 'spear' });
      return o;
    },
    cam: [[700, 580, 1500], [600, 600, 1300]],
  },
  'xh4.silent': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 320, g, 0, 0.4) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: P.sitCross(), g, face: -1, detail: true });
      for (let i = 0; i < 5; i++) o += person({ x: 260 + i * 130, y: 810 + (i % 2) * 20, s: 1.2, who: ['fankuai', 'hanSoldier', 'caocan', 'soldier', 'crowd1'][i], pose: P.bow(seg(u, 0.1 + i * 0.05, 0.6) * 0.6), g, face: 1, mood: 'sad' });
      return o + person({ x: 960, y: 806, s: 1.35, who: 'xiaohe', pose: P.stand(), g, face: -1, detail: true });
    },
    cam: [[800, 560, 1500], [820, 580, 1350]],
  },
  // ================= 张良⑦ 从赤松子游 =================
  'zl7.court': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.7);
      let o = glow(id, 1200, 520, 320, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: P.mix(P.sitCross(), { ...P.sitCross(), aF: 100, eF: 0 }, k), g, face: -1, detail: true, mood: 'laugh' });
      for (let i = 0; i < 6; i++) o += seal(980 + (i % 3) * 44, 700 - Math.floor(i / 3) * 44, 1);
      return o + person({ x: 700, y: 800, s: 1.5, who: 'zhangliang', pose: P.bow(0.4), g, face: 1, detail: true }) + `<g opacity="${f(seg(u, 0.5, 0.8))}">${vtext(1440, 300, '齐三万户', 46, GOLD, 0.9)}</g>`;
    },
    cam: [[880, 560, 1500], [920, 580, 1300]],
  },
  'zl7.decline': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      const push = 0.5 + 0.5 * Math.sin(g * 1.4);
      let o = glow(id, 1200, 520, 320, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: { ...P.sitCross(), head: 6 }, g, face: -1, detail: true });
      for (let i = 0; i < 6; i++) o += seal(980 + (i % 3) * 44, 700 - Math.floor(i / 3) * 44, 1);
      return o + person({ x: 700, y: 800, s: 1.5, who: 'zhangliang', pose: P.mix(P.bow(0.6), { ...P.stand(), aF: 80, eF: 10, aB: 70, eB: 10, lean: -6 }, push), g, face: 1, detail: true }) + `<g opacity="${f(seg(u, 0.5, 0.8))}">${vtext(1440, 300, '愿封留足矣', 46, '#F1E8D6', 0.9)}</g>`;
    },
    cam: [[880, 560, 1500], [860, 580, 1300]],
  },
  'zl7.seal': {
    bg: (id) => sky(id, '#4A3A2C', '#6A5440') + glow(id, 800, 480, 400, 0, 0, 0.4),
    fg: (u, g) => {
      const k = seg(u, 0, 0.5);
      return `<g transform="translate(800,${f(lerp(380, 480, k))}) scale(${f(lerp(2, 4, k))})">${seal(0, 0, 1, '留')}</g>` + `<g opacity="${f(seg(u, 0.4, 0.7))}"><text x="800" y="760" font-size="64" text-anchor="middle" fill="${GOLD}" style="font-family:'Kaiti SC','STKaiti',serif">留侯</text></g>`;
    },
    cam: [[800, 520, 1300], [800, 520, 1100]],
  },
  'zl7.cu': {
    bg: (id) => sky(id, '#7A8478', '#B2B8A8') + glow(id, 1250, 500, 380, 0, 0, 0.3),
    fg: (u, g, id) => faceCU({ x: 720, y: 480, s: 1.7, who: 'zhangliang', g, id, brow: -0.2, mouth: Math.sin(g * 7) > 0.2 ? 0.4 : 0, look: 0.4 }) + `<g opacity="${f(seg(u, 0.4, 0.7))}">${vtext(1360, 160, '欲从赤松子游', 46, '#F1E8D6', 0.92)}</g>`,
    cam: [[860, 470, 1450], [860, 460, 1350]],
  },
  'zl7.bigu': {
    bg: (id) => sky(id, '#B8C2BA', '#E2E4D8') + ridge({ y: 360, amp: 140, seed: 971, a: 0.35, color: '#6A7A70' }) + ridge({ y: 500, amp: 80, seed: 972, a: 0.5, color: '#5A6A60' }) + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#8A9480"/>` +
      `<path d="M1180,700 L1180,420" stroke="#4A3A2C" stroke-width="20"/>` + [0, 1, 2].map((i) => `<path d="M${1060 + i * 30},${460 + i * 70} L${1300 - i * 20},${440 + i * 70} L${1180},${400 + i * 70} Z" fill="#3E5A44"/>`).join(''),
    fg: (u, g, id) => {
      const br = 0.5 + 0.5 * Math.sin(g * 1.2);
      return mist(id, 973, g, { y: 600, h: 100, n: 6, a: 0.5 }) + `<ellipse cx="800" cy="712" rx="120" ry="16" fill="#6A7A60"/>` +
        person({ x: 800, y: 700, s: 1.5, who: 'zhangliang', pose: { ...P.sitCross(), aF: 40, eF: 100, aB: 40, eB: 100, head: -4 + br * 4 }, g, face: 1, detail: true }) +
        `<circle cx="860" cy="520" r="${f(14 + br * 20)}" fill="none" stroke="#F1E8D6" stroke-width="3" opacity="${f(0.6 * (1 - br))}"/>`;
    },
    cam: [[880, 560, 1400], [860, 580, 1200]],
  },
  'zl7.cloud': {
    bg: (id) => sky(id, '#C8D0CC', '#ECEAE0') + ridge({ y: 300, amp: 160, seed: 981, a: 0.3, color: '#7A8A84' }) + ridge({ y: 480, amp: 100, seed: 982, a: 0.45, color: '#6A7A70' }) + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#9AA494"/><path d="M700,1100 Q760,820 1100,560 L1140,570 Q820,840 800,1100 Z" fill="#C8C4AC"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0, 1);
      return person({ x: lerp(760, 1110, k), y: lerp(1000, 570, k), s: lerp(1.3, 0.45, k), who: 'zhangliang', pose: P.walk(g * 0.5, 0.4), g, face: 1, a: 1 - seg(u, 0.8, 1) * 0.6 }) + mist(id, 983, g, { y: 560, h: 140, n: 7, a: 0.6 });
    },
    cam: [[880, 600, 1500], [940, 560, 1300]],
  },
  // ================= 萧何⑤ 萧规曹随 =================
  'xh5.sick': {
    bg: (id) => office(id) + bed(560, 700),
    fg: (u, g, id) => glow(id, 700, 560, 300, g, 0, 0.35) + person({ x: 520, y: 700, s: 1.4, who: 'xiaohe', pose: { ...P.sitRest(), lean: -10, head: 10 }, g, face: 1, detail: true, mood: 'sad' }) +
      `<path d="M380,690 Q560,650 760,690 L760,704 L380,704 Z" fill="#8A7A64"/>` + person({ x: 960, y: 800, s: 1.45, who: 'king', pose: P.mix(P.stand(), P.bow(0.3), seg(u, 0.4, 0.7)), g, face: -1, detail: true }),
    cam: [[760, 560, 1300], [760, 580, 1150]],
  },
  'xh5.kowtow': {
    bg: (id) => office(id) + bed(560, 700),
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.4);
      return glow(id, 700, 560, 300, g, 0, 0.35) + person({ x: 560, y: 700, s: 1.4, who: 'xiaohe', pose: P.mix({ ...P.sitRest(), lean: -10 }, { ...P.sitCross(), lean: 60, head: 30, aF: 40, eF: 30 }, k), g, face: 1, detail: true, mood: 'laugh' }) +
        person({ x: 960, y: 800, s: 1.45, who: 'king', pose: P.stand(), g, face: -1, detail: true }) + `<g opacity="${f(seg(u, 0.4, 0.7))}">${vtext(1300, 300, '臣死不恨矣', 46, GOLD, 0.9)}</g>`;
    },
    cam: [[800, 560, 1400], [800, 580, 1250]],
  },
  'xh5.cao': {
    bg: (id) => office(id),
    fg: (u, g, id) => glow(id, 800, 560, 260, g, 0, 0.4) + `<rect x="620" y="680" width="360" height="40" fill="#6A4A34"/>` + slips(660, 580, 10, 0.45, '萧何约束', 1) +
      person({ x: 820, y: 780, s: 1.5, who: 'caocan', pose: { ...P.sitCross(), aF: 60, eF: 40, head: 12 + 4 * Math.sin(g) }, g, face: -1, detail: true }),
    cam: [[800, 540, 1300], [800, 560, 1100]],
  },
  'xh5.drink': {
    bg: (id) => office(id),
    fg: (u, g, id) => {
      // 来客刚要开口，曹参就举杯；一轮一轮
      const c = (u * 3) % 1, talk = seg(c, 0, 0.3) * (1 - seg(c, 0.35, 0.5));
      return glow(id, 800, 560, 300, g, 0, 0.45) + `<rect x="620" y="700" width="360" height="30" fill="#6A3A2C"/>` +
        person({ x: 600, y: 790, s: 1.5, who: 'caocan', pose: P.mix(P.sitCross(), P.drink(1), seg(c, 0.25, 0.45)), g, face: 1, detail: true, hold: 'cup', mood: 'laugh' }) +
        person({ x: 1000, y: 790, s: 1.4, who: ['crowd1', 'crowd2', 'crowd4'][Math.min(2, Math.floor(u * 3))], pose: P.mix({ ...P.sitCross(), aF: 70, eF: 60 }, P.drink(0.8), seg(c, 0.4, 0.7)), g, face: -1, hold: 'cup', mood: c > 0.7 ? 'laugh' : 'calm' }) +
        (talk > 0.2 ? soundRings(940, 560, g, { dir: -1, n: 2, r0: 20 }) : '');
    },
    cam: [[800, 560, 1300], [800, 580, 1100]],
  },
  'xh5.emperor': {
    bg: (id) => court(id),
    fg: (u, g, id) => glow(id, 1200, 520, 320, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.4, who: 'king', pose: { ...P.sitCross(), head: 6 }, g, face: -1, detail: true }) +
      person({ x: 760, y: 800, s: 1.5, who: 'caocan', pose: P.mix(P.bow(0.8), { ...P.stand(), aF: 60, eF: 70 }, seg(u, 0.4, 0.7)), g, face: 1, detail: true }) + `<g opacity="${f(seg(u, 0.5, 0.8))}">${vtext(520, 340, '孰与高帝', 46, GOLD, 0.9)}</g>`,
    cam: [[880, 560, 1500], [900, 580, 1300]],
  },
  'xh5.point': {
    bg: (id) => court(id),
    fg: (u, g, id) => glow(id, 1200, 520, 320, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.4, who: 'king', pose: P.mix({ ...P.sitCross(), head: 6 }, { ...P.sitCross(), head: 16 }, 0.5 + 0.5 * Math.sin(g * 2)), g, face: -1, detail: true, mood: u > 0.6 ? 'laugh' : 'calm' }) +
      person({ x: 760, y: 800, s: 1.5, who: 'caocan', pose: { ...P.stand(), aF: 70 + 20 * Math.sin(g * 1.3), eF: 40 }, g, face: 1, detail: true }) + `<g opacity="${f(seg(u, 0.4, 0.7))}">${vtext(520, 340, '遵而勿失', 46, GOLD, 0.9)}</g>`,
    cam: [[880, 560, 1500], [900, 580, 1300]],
  },
  'xh5.song': {
    bg: (id) => sky(id, '#D8D0B0', '#EEE6CC') + sunDisc(id, 1300, 260, 50, '#E0A050', 0.7) + ridge({ y: 440, amp: 60, seed: 991, a: 0.25 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#A8B47E"/>` +
      Array.from({ length: 8 }, (_, i) => `<path d="M-200,${660 + i * 50} L1800,${650 + i * 50}" stroke="#8A9A5E" stroke-width="5" opacity=".7"/>`).join('') + house(1350, 640, 1, 0.9),
    fg: (u, g) => {
      let o = '';
      for (let i = 0; i < 6; i++) o += person({ x: 200 + i * 190, y: 820 + (i % 2) * 40, s: 1.15, who: ['laofu', 'crowd1', 'crowd3', 'crowd2', 'laofu', 'crowd4'][i], pose: P.mix(P.sing(g * 0.4 + i), { ...P.stand(), aF: 40, eF: 60, lean: 20 }, i % 2), g, face: i % 2 ? -1 : 1 });
      return o + `<g opacity="${f(seg(u, 0.2, 0.5))}">${vtext(1180, 320, '萧何为法', 44, INK, 0.85)}${vtext(1110, 320, '顜若画一', 44, '#7A2A22', 0.9)}</g>`;
    },
    cam: [[800, 560, 1600], [820, 560, 1500]],
  },
  'xh5.end': {
    bg: (id) => sky(id, '#E6DCC6', PAPER) + `<rect x="200" y="240" width="1200" height="520" fill="#F4EEDD" stroke="#B8A882" stroke-width="4"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.05, 0.5);
      return `<path d="M300,500 L${f(300 + 1000 * k)},500" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>` + `<g opacity="${f(seg(u, 0.5, 0.8))}"><text x="560" y="660" font-size="64" text-anchor="middle" fill="#7A2A22" style="font-family:'Kaiti SC','STKaiti',serif">萧规</text><text x="1040" y="660" font-size="64" text-anchor="middle" fill="${INK}" style="font-family:'Kaiti SC','STKaiti',serif">曹随</text></g>`;
    },
    cam: [[800, 500, 1300], [800, 500, 1200]],
  },
};
