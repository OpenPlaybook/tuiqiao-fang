// 萧何线：每一镜怎么画、怎么动（沛县主吏、收图籍、镇守关中、功人功狗、萧规曹随）
import { GOLD, INK, PAPER, RED, banner, cityWall, f, flame, glow, house, lerp, ridge, seg, sky, sunDisc, vtext, wav } from './core';
import { P, faceCU, person } from './rig';
import { deskBg, slips } from './shots1';
import { glassesShot } from './shots2';
import type { ShotDef } from './Film';

// ---------------- 共用 ----------------
/** 县衙里面：木柱、架子上一卷卷的竹简 */
export const office = (id: string, warm = true) => sky(id, warm ? '#4A3E30' : '#2E2A26', warm ? '#6A5844' : '#45403A') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#5A4636"/>` +
  [120, 1480].map((x) => `<rect x="${x - 18}" y="80" width="36" height="560" fill="#3A2C22"/>`).join('') + shelf(300, 600) + shelf(1060, 600);
/** 书架：一格一格放着卷好的竹简 */
export const shelf = (x: number, y: number, s = 1) => {
  let o = `<g transform="translate(${x},${y}) scale(${s})"><rect x="0" y="-420" width="240" height="420" fill="#4A3628" stroke="${INK}" stroke-width="3"/>`;
  for (let r = 0; r < 4; r++) { o += `<path d="M0,${-105 * r} h240" stroke="${INK}" stroke-width="4"/>`; for (let c = 0; c < 4; c++) o += `<ellipse cx="${34 + c * 58}" cy="${-105 * r - 30}" rx="24" ry="20" fill="#C9AE74" stroke="#8A6A3A" stroke-width="2"/><ellipse cx="${34 + c * 58}" cy="${-105 * r - 30}" rx="10" ry="8" fill="none" stroke="#8A6A3A" stroke-width="2"/>`; }
  return o + '</g>';
};
/** 一串钱（秦半两：圆形方孔） */
const coins = (x: number, y: number, n: number, s = 1) => Array.from({ length: n }, (_, i) => `<g transform="translate(${f(x + i * 18 * s)},${f(y - (i % 2) * 6 * s)}) scale(${s})"><circle r="14" fill="#B08A3A" stroke="#6E5530" stroke-width="2"/><rect x="-4" y="-4" width="8" height="8" fill="#3A2C1E"/></g>`).join('');

export const SHOTS_XH: Record<string, ShotDef> = {
  // ================= 萧何① 沛县主吏 =================
  'xh.glassOpen': glassesShot('萧相国何者沛丰人也以文无害为沛主吏掾'),
  'xh.slips': {
    bg: (id) => deskBg(id) + slips(470, 330, 18, 1.2, '萧相国何者沛丰人也以文无害为沛主吏掾'),
    fg: (u, g, id) => glow(id, 800, 470, 300, g, 0, 0.3),
    cam: [[800, 480, 1300], [800, 470, 1100]],
  },
  'xh.work': {
    bg: (id) => office(id),
    fg: (u, g, id) => glow(id, 800, 560, 260, g, 0, 0.4) + `<rect x="640" y="660" width="320" height="40" fill="#6A4A34"/>` + slips(690, 560, 8, 0.4, '', 1) +
      person({ x: 820, y: 760, s: 1.5, who: 'xiaohe', pose: { ...P.sitCross(), aF: 64 + 4 * Math.sin(g * 12), eF: 30, lean: 10, head: 8 }, g, face: -1, detail: true }),
    cam: [[800, 520, 1400], [800, 560, 1150]],
  },
  'xh.protect': {
    bg: (id) => office(id),
    fg: (u, g) => {
      const k = seg(u, 0.25, 0.7);
      return person({ x: 1100, y: 780, s: 1.45, who: 'qinguan', pose: P.mix(P.point(1), P.stand(), k), g, face: -1, detail: true, mood: k > 0.5 ? 'calm' : 'sneer' }) +
        person({ x: 700, y: 790, s: 1.45, who: 'liuji', pose: { ...P.stand(), head: 10 }, g, face: 1, detail: true }) +
        person({ x: lerp(420, 900, k), y: 780, s: 1.45, who: 'xiaohe', pose: k > 0.02 && k < 0.98 ? P.walk(g, 0.7) : P.bow(0.3 * k), g, face: 1, detail: true });
    },
    cam: [[800, 560, 1400], [880, 580, 1200]],
  },
  'xh.send': {
    bg: (id) => sky(id, '#D9CFBC', PAPER) + cityWall(-100, 520, 1800, 1, 0.6) + `<path d="M-200,660 L1800,660 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = person({ x: 1200, y: 800, s: 1.5, who: 'liuji', pose: P.bow(0.3), g, face: -1, detail: true });
      for (let i = 0; i < 4; i++) o += person({ x: 380 + i * 140, y: 810, s: 1.35, who: ['crowd1', 'caocan', 'crowd2', 'crowd1'][i], pose: P.give(0.5), g, face: 1 }) + coins(410 + i * 140, 700, 3, 0.8);
      const k = seg(u, 0.4, 0.8);
      o += person({ x: lerp(900, 1020, k), y: 800, s: 1.45, who: 'xiaohe', pose: P.give(k), g, face: 1, detail: true }) + coins(lerp(940, 1060, k), 700, 5, 0.9);
      return o;
    },
    cam: [[800, 600, 1500], [900, 620, 1200]],
  },
  'xh.yushi': {
    bg: (id) => office(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.8);
      return glow(id, 800, 560, 260, g, 0, 0.35) + `<rect x="640" y="660" width="320" height="40" fill="#6A4A34"/>` + slips(690, 560, 8, 0.4, '', 1) +
        person({ x: 600, y: 780, s: 1.45, who: 'xiaohe', pose: P.bow(0.2), g, face: 1, detail: true }) +
        person({ x: 1020, y: 780, s: 1.5, who: 'kuaitong', pose: P.mix({ ...P.stand(), head: 14, lean: 8 }, P.point(0.8), k), g, face: -1, detail: true });
    },
    cam: [[800, 560, 1400], [820, 580, 1150]],
  },
  'xh.decline': {
    bg: (id) => office(id, false),
    fg: (u, g) => person({ x: 640, y: 790, s: 1.5, who: 'xiaohe', pose: P.bow(0.4 + 0.4 * seg(u, 0.1, 0.5)), g, face: 1, detail: true }) +
      person({ x: 1040, y: 790, s: 1.5, who: 'qinguan', pose: { ...P.stand(), head: 6 }, g, face: -1, detail: true }),
    cam: [[840, 580, 1300], [840, 600, 1100]],
  },
  'xh.dusk': {
    bg: (id) => sky(id, '#C9906A', '#E8C9A0') + sunDisc(id, 1250, 420, 60, '#C8452F', 0.85) + ridge({ y: 520, amp: 50, seed: 401, a: 0.35, color: '#4A3A30' }) + cityWall(-100, 640, 1800, 1.1, 0.75) + house(300, 660, 0.9) + house(1400, 660, 0.8),
    fg: (u, g) => person({ x: lerp(760, 820, u), y: 840, s: 1.8, who: 'xiaohe', pose: P.stand(), g, face: 1, detail: true }),
    cam: [[800, 560, 1500], [820, 600, 1300]],
  },
  'xh.cu': {
    bg: (id) => sky(id, '#3E3226', '#5A4836') + glow(id, 1250, 500, 380, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 480, s: 1.7, who: 'xiaohe', g, id, brow: 0, mouth: 0, look: 0.2 }),
    cam: [[800, 470, 1400], [790, 460, 1250]],
  },
  // ================= 萧何② 收图籍 =================
  'xh.loot': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#4A3A2C"/>` + Array.from({ length: 7 }, (_, i) => `<rect x="${20 + i * 240}" y="430" width="150" height="40" fill="#5A4230" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>`).join(''),
    fg: (u, g, id) => {
      let o = glow(id, 800, 600, 400, g, 0, 0.4);
      // 地上一排打开的箱子，金子往外蹦；将领们弯腰去抢
      for (let i = 0; i < 7; i++) {
        const cx = 95 + i * 240;
        o += `<path d="M${cx - 60},${f(708)} L${cx + 60},${f(708)} L${cx + 70},${f(668)} L${cx - 50},${f(668)} Z" fill="#8A6A3A" stroke="${INK}" stroke-width="2"/>` +
          [0, 1, 2].map((j) => { const h = Math.abs(Math.sin(g * 3 + i + j * 2.1)); return `<circle cx="${cx - 30 + j * 30}" cy="${f(712 - h * 50)}" r="11" fill="${GOLD}" stroke="#8A6A2A" stroke-width="1.5"/>`; }).join('') +
          `<rect x="${cx - 60}" y="712" width="120" height="78" fill="#7A5A30" stroke="${GOLD}" stroke-width="3"/><path d="M${cx - 60},740 h120" stroke="${GOLD}" stroke-width="2" opacity=".6"/>`;
      }
      for (let i = 0; i < 6; i++) o += person({ x: 215 + i * 240 + Math.sin(g * 2 + i) * 12, y: 800, s: 1.3, who: i % 2 ? 'soldier' : 'hanSoldier', pose: P.mix(P.bow(0.5), P.give(0.8), 0.5 + 0.5 * Math.sin(g * 2.5 + i)), g, face: i % 2 ? 1 : -1, hold: i % 3 === 1 ? 'bowl' : undefined });
      return o;
    },
    cam: [[800, 600, 1600], [800, 620, 1450]],
  },
  'xh.archive': {
    bg: (id) => office(id, false) + shelf(560, 600) + shelf(820, 600),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.9);
      return glow(id, 800, 520, 300, g, 0, 0.35) + person({ x: lerp(300, 700, k), y: 790, s: 1.5, who: 'xiaohe', pose: k < 0.98 ? P.walk(g, 0.7) : { ...P.stand(), aF: 120, eF: 20 }, g, face: 1, detail: true, hold: 'scroll' }) +
        person({ x: lerp(160, 520, k), y: 800, s: 1.3, who: 'crowd1', pose: P.walk(g + 0.4, 0.7), g, face: 1, hold: 'scroll' });
    },
    cam: [[800, 560, 1400], [760, 580, 1250]],
  },
  'xh.fire': {
    bg: (id) => sky(id, '#2A1A16', '#5A2A1E') + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#2A1E18"/>` + `<g opacity=".9"><path d="M200,640 L200,420 L1400,420 L1400,640 Z" fill="#1A1210"/><path d="M140,430 L800,300 L1460,430 Z" fill="#140E0C"/></g>`,
    fg: (u, g, id) => {
      let o = glow(id, 800, 460, 520, g, 0, 0.8);
      for (let i = 0; i < 9; i++) o += flame(240 + i * 140, 470 + (i % 2) * 40, 3 + Math.sin(g * 2 + i), g, i * 0.2);
      return o;
    },
    cam: [[800, 480, 1600], [800, 470, 1500]],
  },
  'xh.map': {
    bg: (id) => deskBg(id) + `<rect x="300" y="300" width="1000" height="420" rx="10" fill="#E9DCBC" stroke="#8A6A3A" stroke-width="5"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.8);
      let o = glow(id, 800, 500, 400, g, 0, 0.3);
      o += `<path d="M360,420 Q600,360 800,440 Q1000,520 1240,420" stroke="#8FA9B8" stroke-width="10" fill="none" opacity="${f(seg(k, 0, 0.3))}"/>`;
      o += `<g opacity="${f(seg(k, 0.2, 0.5))}">${[[480, 600], [700, 520], [980, 600], [1160, 520]].map(([x, y]) => `<rect x="${x - 14}" y="${y - 14}" width="28" height="28" fill="#8A6A44"/>`).join('')}</g>`;
      o += `<g opacity="${f(seg(k, 0.45, 0.8))}">${vtext(1280, 330, '户口', 34, RED, 0.85)}${vtext(380, 330, '厄塞', 34, RED, 0.85)}</g>`;
      return o + person({ x: 800, y: 880, s: 1.8, who: 'liubangGen', pose: { ...P.stand(), head: 20, lean: 10 }, g, face: 1, a: 0.95 });
    },
    cam: [[800, 520, 1300], [800, 520, 1200]],
  },
  // ================= 萧何③ 镇守关中 =================
  'xh.guard': {
    bg: (id) => office(id) + `<rect x="1180" y="300" width="220" height="340" fill="#2A1E16"/>` + vtext(1290, 340, '栎阳', 40, '#E9DFCB', 0.75),
    fg: (u, g, id) => glow(id, 800, 520, 300, g, 0, 0.4) + person({ x: 700, y: 780, s: 1.55, who: 'xiaohe', pose: P.mix(P.stand(), P.bow(0.4), 0.5 + 0.5 * Math.sin(g * 0.8)), g, face: 1, detail: true }) +
      person({ x: 960, y: 790, s: 0.95, who: 'crowd3', pose: P.stand(), g, face: -1 }) + person({ x: 1080, y: 780, s: 1.3, who: 'crowd1', pose: P.stand(), g, face: -1, hold: 'spear' }),
    cam: [[820, 560, 1400], [820, 580, 1200]],
  },
  'xh.laws': {
    bg: (id) => office(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.55, 0.9);
      return glow(id, 760, 560, 260, g, 0, 0.4) + `<rect x="580" y="660" width="320" height="40" fill="#6A4A34"/>` + slips(620, 560, 8, 0.4, '', 1) +
        person({ x: 760, y: 760, s: 1.5, who: 'xiaohe', pose: { ...P.sitCross(), aF: 64 + 4 * Math.sin(g * 12), eF: 30, lean: 10, head: 8 }, g, face: -1, detail: true }) +
        person({ x: lerp(1000, 1500, k), y: 790, s: 1.3, who: 'crowd2', pose: k > 0.02 ? P.walk(g, 0.9) : { ...P.kneelWash(0), lean: 20 }, g, face: 1, hold: 'scroll' });
    },
    cam: [[820, 540, 1400], [900, 560, 1250]],
  },
  'xh.supply': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + ridge({ y: 400, amp: 60, seed: 701, a: 0.25 }) + `<path d="M-200,480 L1800,480 L1800,620 L-200,620 Z" fill="#8EA2A4"/><path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = '';
      // 河上运粮的船（漕），岸上运粮的车（转），都往东（右）去
      for (let i = 0; i < 3; i++) { const x = lerp(-200, 600, u) + i * 420; o += `<g transform="translate(${f(x)},${f(560 + wav(g, 2, i * 0.3) * 4)})"><path d="M-110,0 L110,0 L86,30 L-86,30 Z" fill="#6A4A30" stroke="${INK}" stroke-width="3"/><path d="M-70,0 q35,-36 70,0 q35,-36 70,0" fill="#D9C08A" stroke="${INK}" stroke-width="2"/></g>`; }
      for (let i = 0; i < 4; i++) { const x = lerp(-100, 700, u) + i * 300; o += `<g transform="translate(${f(x)},800)"><rect x="-80" y="-60" width="160" height="50" fill="#8A6A3A" stroke="${INK}" stroke-width="3"/><path d="M-70,-60 q35,-30 70,0 q35,-30 70,0" fill="#D9C08A" stroke="${INK}" stroke-width="2"/><circle cx="-40" cy="0" r="26" fill="none" stroke="#2A2620" stroke-width="7"/><circle cx="40" cy="0" r="26" fill="none" stroke="#2A2620" stroke-width="7"/></g>` + person({ x: x + 120, y: 820, s: 1.1, who: 'crowd1', pose: P.walk(g + i * 0.3, 0.7), g, face: 1 }); }
      return o;
    },
    cam: [[800, 600, 1600], [900, 620, 1450]],
  },
  'xh.recruit': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + cityWall(-100, 600, 1800, 1.1, 0.6) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = person({ x: 300, y: 820, s: 1.5, who: 'xiaohe', pose: P.point(0.6), g, face: 1, detail: true });
      const n = Math.round(lerp(3, 12, seg(u, 0.1, 0.8)));
      for (let i = 0; i < n; i++) o += person({ x: 520 + (i % 6) * 150, y: 800 + Math.floor(i / 6) * 50, s: 1.1, who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.6), g, face: 1, hold: i % 3 ? 'spear' : undefined });
      return o + banner(1400, 560, 1, g, '#3A4A5A', '汉', 0.1);
    },
    cam: [[800, 600, 1600], [820, 620, 1450]],
  },
  'xh.messenger': {
    bg: (id) => office(id),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.4);
      return glow(id, 800, 520, 300, g, 0, 0.4) + person({ x: 600, y: 780, s: 1.55, who: 'xiaohe', pose: P.mix(P.stand(), P.bow(0.5), seg(u, 0.4, 0.7)), g, face: 1, detail: true }) +
        person({ x: lerp(1400, 960, k), y: 790, s: 1.4, who: 'hanSoldier', pose: k < 0.98 ? P.walk(g, 0.8) : P.bow(0.5), g, face: -1 });
    },
    cam: [[800, 560, 1400], [800, 580, 1200]],
  },
  'xh.bao': {
    bg: (id) => office(id, false),
    fg: (u, g, id) => glow(id, 760, 520, 260, g, 0, 0.35) + person({ x: 660, y: 780, s: 1.55, who: 'xiaohe', pose: P.mix(P.stand(), { ...P.stand(), head: 14, lean: 6 }, seg(u, 0.3, 0.6)), g, face: 1, detail: true, mood: seg(u, 0.3, 0.6) > 0.5 ? 'shock' : 'calm' }) +
      person({ x: 900, y: 784, s: 1.45, who: 'baosheng', pose: { ...P.stand(), aF: 70, eF: 110, lean: 10, head: 6 }, g, face: -1, detail: true }),
    cam: [[780, 560, 1200], [780, 580, 1050]],
  },
  'xh.sendSons': {
    bg: (id) => sky(id, '#D9B888', '#EBD8B4') + sunDisc(id, 1300, 300, 60, '#D8804A', 0.8) + ridge({ y: 460, amp: 60, seed: 711, a: 0.3 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = person({ x: 360, y: 820, s: 1.55, who: 'xiaohe', pose: P.stand(), g, face: 1, detail: true });
      for (let i = 0; i < 6; i++) o += person({ x: lerp(600, 1300, u) + i * 90, y: 800 + (i % 2) * 20, s: 1.15, who: i % 2 ? 'crowd2' : 'crowd4', pose: P.walk(g + i * 0.3, 0.7), g, face: 1, hold: i % 2 ? 'spear' : undefined });
      return o;
    },
    cam: [[800, 600, 1500], [880, 620, 1350]],
  },
};
