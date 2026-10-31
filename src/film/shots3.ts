// 第三回　鸿门宴：每一镜怎么画、怎么动（对照 第六堂课/分镜/第三回_鸿门宴.md）
import { GOLD, INK, PAPER, RED, banner, f, flame, glow, lerp, mist, moon, ridge, rng, seg, sky, sunDisc, tent, torch, vtext, wav } from './core';
import { P, faceCU, horse, person } from './rig';
import { bigTent, dais, deskShot, glassesShot, localMap, tentIn } from './shots2';
import type { ShotDef } from './Film';

// ---------------- 共用 ----------------
const KAI = `style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif"`;
/** 夜里的营地：远山、月亮、一片帐篷和火把 */
const nightCamp = (id: string, c = '#2B2722', ch = '项') =>
  sky(id, '#1E2230', '#3A3B48') + moon(id, 1280, 160, 40, 0.9) + ridge({ y: 430, amp: 70, seed: 81, a: 0.6, color: '#161922' }) +
  `<path d="M-200,560 L1800,560 L1800,1100 L-200,1100 Z" fill="#2A2B32"/>` + tent(240, 560, 0.8, '#3A3A40') + tent(420, 570, 0.7, '#3A3A40') + tent(1300, 566, 0.8, '#3A3A40') + banner(1460, 420, 0.7, 0, c, ch, 0, 0.8);
/** 宴席：帐里的矮桌、酒器 */
const table = (x: number, y: number, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-90" y="-26" width="180" height="16" rx="4" fill="#6A3A2C" stroke="${INK}" stroke-width="2"/><path d="M-80,-10 v22 M80,-10 v22" stroke="#4A2A22" stroke-width="8"/><path d="M-40,-26 q10,-26 20,0 z M10,-26 q14,-30 28,0 z" fill="${GOLD}" opacity=".85"/></g>`;
/** 宴席上的人：sit 坐着（盘腿），stand 站着 */
const guest = (x: number, y: number, who: string, g: number, face: 1 | -1, pose = P.sitCross(), s = 1.25, mood?: 'calm' | 'sneer' | 'sad' | 'shock' | 'laugh') => person({ x, y, s, who, pose, g, face, detail: true, mood });
/** 剑：从 (x, y) 起，角度 a（度），长 len；trail 画一道剑光 */
const sword = (x: number, y: number, a: number, len = 150, trail = 0) => {
  const r = (a * Math.PI) / 180, ex = x + Math.cos(r) * len, ey = y + Math.sin(r) * len;
  let o = trail > 0 ? `<path d="M${f(x)},${f(y)} A${len},${len} 0 0,1 ${f(ex)},${f(ey)}" stroke="#F4F1E8" stroke-width="${f(10 * trail)}" fill="none" opacity="${f(0.45 * trail)}"/>` : '';
  o += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(ex)}" y2="${f(ey)}" stroke="#C9CDD2" stroke-width="6" stroke-linecap="round"/><line x1="${f(x)}" y1="${f(y)}" x2="${f(x + Math.cos(r) * 26)}" y2="${f(y + Math.sin(r) * 26)}" stroke="#4A3A2A" stroke-width="9"/>`;
  return o;
};
/** 玉玦：有缺口的玉环 */
const jue = (x: number, y: number, r: number, g = 0, shine = 0) => `<g transform="translate(${f(x)},${f(y)})"><path d="M${f(r * Math.cos(0.35))},${f(-r * Math.sin(0.35))} A${r},${r} 0 1,0 ${f(r * Math.cos(0.35))},${f(r * Math.sin(0.35))} L${f(r * 0.55 * Math.cos(0.35))},${f(r * 0.55 * Math.sin(0.35))} A${f(r * 0.55)},${f(r * 0.55)} 0 1,1 ${f(r * 0.55 * Math.cos(0.35))},${f(-r * 0.55 * Math.sin(0.35))} Z" fill="#B9D3B8" stroke="#6E8A6C" stroke-width="${f(r * 0.04)}"/>${shine > 0 ? `<path d="M${f(-r * 0.7)},${f(-r * 0.2)} q${f(r * 0.3)},${f(-r * 0.5)} ${f(r * 0.8)},${f(-r * 0.6)}" stroke="#fff" stroke-width="${f(r * 0.08)}" fill="none" opacity="${f(shine * (0.5 + 0.5 * Math.sin(g * 3)))}"/>` : ''}</g>`;
/** 白璧（中间有孔的圆玉）、玉斗（有柄的酒器） */
const bi = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#EEF0EA" stroke="#A8B0A4" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${f(r * 0.35)}" fill="#6A3A2C"/>`;
const dou = (x: number, y: number, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-30,-20 L30,-20 L22,20 L-22,20 Z" fill="#B9D3B8" stroke="#6E8A6C" stroke-width="3"/><path d="M30,-10 q30,0 30,16" stroke="#6E8A6C" stroke-width="6" fill="none"/></g>`;
/** 帐里宴席的全景：四个人按座次坐（侧面看），中间一块空地 */
const feastHall = (id: string) => tentIn(id, true) + glow(id, 800, 420, 360, 0, 0, 0.35);

export const SHOTS3: Record<string, ShotDef> = {
  // ---------- 0 鸿门的大营 ----------
  'd.camp': {
    bg: (id) => sky(id, '#C9B79C', '#E6D8BE') + sunDisc(id, 1320, 260, 46, '#C8452F', 0.55) + ridge({ y: 400, amp: 60, seed: 83, a: 0.3 }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#BCA680"/>`,
    fg: (u, g, id) => {
      const r = rng(31); let o = '';
      for (let i = 0; i < 22; i++) o += tent(80 + (i % 11) * 150 + r() * 40, 560 + Math.floor(i / 11) * 40, 0.6 + r() * 0.2, '#6A5A4C', 0.9);
      o += bigTent(800, 700, 1.3, g, 0.6);
      for (let i = 0; i < 8; i++) o += banner(140 + i * 190, 470 + (i % 2) * 20, 0.6, g, '#2B2722', '项', i * 0.3, 0.85);
      return o + mist(id, 84, g, { y: 560, h: 50, a: 0.35, n: 5 });
    },
    cam: [[800, 500, 1600], [800, 560, 1250]],
  },
  // ---------- 1 曹无伤派人告密 ----------
  'd.spy': {
    bg: (id) => nightCamp(id, RED, '刘'),
    fg: (u, g, id) => {
      const k = seg(u, 0, 1);
      return torch(id, 300, 600, 1, g) + horse({ x: lerp(-100, 1500, k), y: 700, s: 1.1, g, gait: 'run', ph: g * 1.8, rider: 'crowd4', face: 1 }) + mist(id, 85, g, { y: 600, h: 60, a: 0.35, n: 5 });
    },
    cam: [[800, 520, 1600], [900, 560, 1400]],
  },
  'd.whisper': {
    bg: (id) => tentIn(id, true) + dais(),
    fg: (u, g, id) => {
      const lean = seg(u, 0.2, 0.5);
      return glow(id, 1100, 500, 260, g, 0, 0.4) + person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: { ...P.sitCross(), head: -6 * lean }, g, face: -1, detail: true, mood: lean > 0.5 ? 'sneer' : 'calm' }) +
        person({ x: lerp(760, 960, lean), y: 760, s: 1.35, who: 'crowd4', pose: P.bow(0.5 + 0.3 * lean), g, face: 1, detail: true });
    },
    cam: [[1000, 560, 1300], [1100, 540, 1050]],
  },
  'd.xyangry': {
    bg: (id) => sky(id, '#2A1E1A', '#4A2E26') + glow(id, 1200, 420, 420, 0, 0, 0.55),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'xiangyu', g, id, brow: -1, mouth: 0.5 + 0.1 * Math.sin(g * 8), shake: seg(u, 0.1, 0.4) }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'd.fanzeng': {
    bg: (id) => tentIn(id, true) + dais(),
    fg: (u, g, id) => glow(id, 640, 520, 240, g, 0, 0.4) + flame(640, 560, 1.2, g) +
      person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: P.sitCross(), g, face: -1, detail: true }) +
      person({ x: 860, y: 760, s: 1.4, who: 'fanzeng', pose: P.mix(P.stand(), P.point(0.8), 0.4 + 0.3 * Math.sin(g * 1.2)), g, face: 1, detail: true }),
    cam: [[1000, 560, 1300], [1020, 560, 1150]],
  },
  // ---------- 4 项伯夜驰，见张良 ----------
  'd.ride': {
    bg: (id) => nightCamp(id),
    fg: (u, g, id) => horse({ x: lerp(1500, 100, seg(u, 0, 1)), y: 700, s: 1.1, g, gait: 'run', ph: g * 1.8, rider: 'xiangbo', face: -1 }) + mist(id, 86, g, { y: 620, h: 60, a: 0.4, n: 5 }),
    cam: [[800, 520, 1600], [700, 560, 1450]],
  },
  'd.liangtent': {
    bg: (id) => tentIn(id) + `<rect x="0" y="0" width="1600" height="900" fill="#0E1018" opacity=".35"/>`,
    fg: (u, g, id) => {
      const pull = Math.max(0, Math.sin(seg(u, 0.1, 0.6) * Math.PI * 2)), shake = seg(u, 0.55, 0.9);
      return glow(id, 800, 520, 220, g, 0, 0.5) + flame(800, 560, 1.1, g) + `<rect x="786" y="560" width="28" height="40" fill="#8A6A3A"/>` +
        person({ x: 560, y: 760, s: 1.45, who: 'xiangbo', pose: P.mix(P.stand(), P.point(1), 0.3 + pull * 0.6), g, face: 1, detail: true }) +
        person({ x: 1040, y: 760, s: 1.4, who: 'zhangliang', pose: { ...P.stand(), head: Math.sin(g * 8) * 10 * shake }, g, face: -1, detail: true });
    },
    cam: [[800, 560, 1300], [800, 560, 1150]],
  },
  'd.lbshock': {
    bg: (id) => sky(id, '#22242C', '#3A3440') + glow(id, 1200, 420, 400, 0, 0, 0.45),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'liubang', g, id, brow: 0.8, mouth: 0.5, open: 1.2, shake: seg(u, 0, 0.3) * 0.6 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'd.toast': {
    bg: (id) => tentIn(id, true),
    fg: (u, g, id) => {
      const up = seg(u, 0.1, 0.4);
      return glow(id, 800, 500, 260, g, 0, 0.45) + flame(800, 560, 1.1, g) + `<rect x="786" y="560" width="28" height="40" fill="#8A6A3A"/>` +
        person({ x: 600, y: 760, s: 1.45, who: 'liubang', pose: P.give(up), g, face: 1, hold: 'cup', detail: true, mood: 'laugh' }) +
        person({ x: 1000, y: 760, s: 1.45, who: 'xiangbo', pose: P.mix(P.stand(), P.bow(0.3), seg(u, 0.4, 0.7)), g, face: -1, detail: true }) +
        person({ x: 1200, y: 770, s: 1.3, who: 'zhangliang', pose: P.stand(), g, face: -1, detail: true, a: 0.9 });
    },
    cam: [[800, 560, 1300], [800, 560, 1150]],
  },
  // ---------- 7 第二天，刘邦来鸿门谢罪 ----------
  'd.arrive': {
    bg: (id) => sky(id, '#D6CFC0', PAPER) + ridge({ y: 400, amp: 60, seed: 87, a: 0.2 }) + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#C2AE86"/>` + bigTent(1300, 640, 1, 0, 0.5) + tent(1060, 610, 0.7, '#6A5A4C') + tent(1520, 615, 0.7, '#6A5A4C'),
    fg: (u, g) => {
      const k = seg(u, 0, 0.9); let o = '';
      for (let i = 0; i < 12; i++) { const row = i % 3, col = Math.floor(i / 3); o += horse({ x: lerp(-200, 520, k) - col * 120 - row * 30, y: 680 + row * 40, s: 0.6, g, gait: k < 1 ? 'walk' : 'stand', ph: g + i * 0.2, rider: i === 0 ? 'liubang' : 'hanSoldier', face: 1 }); }
      return o + banner(lerp(-80, 640, k), 560, 0.6, g, RED, '刘', 0, 0.9);
    },
    cam: [[800, 540, 1600], [820, 560, 1400]],
  },
  'd.lbbow': {
    bg: (id) => tentIn(id, true) + dais(),
    fg: (u, g, id) => glow(id, 1000, 500, 300, g, 0, 0.4) +
      person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: P.sitCross(), g, face: -1, detail: true }) +
      person({ x: 760, y: 770, s: 1.45, who: 'liubang', pose: P.bow(seg(u, 0, 0.35) * 0.9), g, face: 1, detail: true }),
    cam: [[980, 560, 1300], [980, 560, 1150]],
  },
  'd.xyreveal': {
    bg: (id) => tentIn(id, true) + dais(),
    fg: (u, g, id) => glow(id, 1000, 500, 300, g, 0, 0.4) +
      person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: P.mix(P.sitCross(), { ...P.sitCross(), aF: 90, eF: 10, head: -10 }, 0.5 + 0.5 * Math.sin(g * 2)), g, face: -1, detail: true, mood: 'laugh' }) +
      person({ x: 760, y: 770, s: 1.45, who: 'liubang', pose: P.bow(lerp(0.9, 0.4, seg(u, 0.3, 0.7))), g, face: 1, detail: true }),
    cam: [[980, 560, 1300], [1060, 540, 1150]],
  },
  // ---------- 10 座次（俯视图） ----------
  'd.seats': {
    bg: (id) => sky(id, '#3A2C24', '#4A3A2E') + `<rect x="420" y="160" width="760" height="600" rx="12" fill="#6A2E26" stroke="${GOLD}" stroke-width="4" opacity=".9"/>` +
      `<text x="800" y="146" font-size="36" text-anchor="middle" fill="#E9DFCB" ${KAI}>北</text><text x="800" y="820" font-size="36" text-anchor="middle" fill="#E9DFCB" ${KAI}>南</text><text x="370" y="462" font-size="36" text-anchor="middle" fill="#E9DFCB" ${KAI}>西</text><text x="1230" y="462" font-size="36" text-anchor="middle" fill="#E9DFCB" ${KAI}>东</text>`,
    fg: (u, g) => {
      // 坐在哪一边、脸朝哪边（箭头）
      const seat = (k: number, x: number, y: number, dx: number, dy: number, name: string, c: string) => {
        const a = seg(u, k * 0.18, k * 0.18 + 0.15); if (a <= 0) return '';
        return `<g opacity="${f(a)}"><circle cx="${x}" cy="${y}" r="46" fill="${c}" stroke="#E9DFCB" stroke-width="4"/><text x="${x}" y="${y + 12}" font-size="32" text-anchor="middle" fill="#F4F1E8" ${KAI}>${name}</text><path d="M${f(x + dx * 56)},${f(y + dy * 56)} l${f(dx * 50)},${f(dy * 50)}" stroke="#F4F1E8" stroke-width="6" marker-end="url(#ar)"/></g>`;
      };
      return `<defs><marker id="ar" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#F4F1E8"/></marker></defs>` +
        seat(0, 500, 380, 1, 0, '项王', '#3A3436') + seat(0.4, 500, 540, 1, 0, '项伯', '#4E4038') + seat(1, 800, 210, 0, 1, '范增', '#5A4A6A') + seat(2, 800, 690, 0, -1, '沛公', '#7A2A22') + seat(3, 1100, 460, -1, 0, '张良', '#5A6859') +
        `<g opacity="${f(seg(u, 0.75, 0.9))}">${table(800, 470, 1.4)}</g>`;
    },
    cam: [[800, 460, 1300], [800, 460, 1250]],
  },
  // ---------- 11 范增举玦 ----------
  'd.signal': {
    bg: (id) => feastHall(id) + dais(),
    fg: (u, g) => {
      const n = Math.floor(seg(u, 0, 0.95) * 3 * 2), up = n % 2 === 1 ? 1 : 0, ph = (seg(u, 0, 0.95) * 6) % 1, lift = Math.sin(ph * Math.PI) * (up ? 1 : 0.2);
      let o = person({ x: 1200, y: 640, s: 1.4, who: 'xiangyu', pose: { ...P.sitCross(), head: 4 }, g, face: -1, detail: true });
      o += person({ x: 500, y: 760, s: 1.3, who: 'fanzeng', pose: { ...P.sitCross(), aF: 70 + lift * 70, eF: 30 - lift * 20 }, g, face: 1, detail: true });
      o += jue(560 + lift * 20, 640 - lift * 120, 24, g, 1) + table(820, 780, 1);
      for (let i = 0; i < 3; i++) o += `<circle cx="${560 + i * 40}" cy="440" r="12" fill="${i < Math.ceil(n / 2) ? '#B9D3B8' : 'none'}" stroke="#B9D3B8" stroke-width="3"/>`;
      return o;
    },
    cam: [[850, 560, 1300], [850, 560, 1200]],
  },
  'd.jue': {
    bg: (id) => sky(id, '#2A221E', '#3E302A') + glow(id, 800, 450, 360, 0, 0, 0.5),
    fg: (u, g) => jue(800, 450, 220, g, 1) + `<text x="1180" y="470" font-size="120" text-anchor="middle" fill="#E9DFCB" opacity="${f(seg(u, 0.4, 0.7) * 0.9)}" ${KAI}>玦</text><text x="1180" y="620" font-size="60" text-anchor="middle" fill="#E9DFCB" opacity="${f(seg(u, 0.6, 0.9) * 0.8)}" ${KAI}>决？</text>`,
    cam: [[880, 460, 1400], [860, 460, 1250]],
  },
  'd.glasses': glassesShot('范增数目项王举所佩玉玦以示之者三项王默然不应'),
  // ---------- 13 范增召项庄 ----------
  'd.zhuang': {
    bg: (id) => nightCamp(id) + bigTent(700, 720, 1.1, 0, 0.6),
    fg: (u, g, id) => torch(id, 1080, 560, 1.2, g) + person({ x: 1000, y: 780, s: 1.4, who: 'fanzeng', pose: P.mix(P.stand(), P.point(0.8), 0.5 + 0.3 * Math.sin(g * 1.4)), g, face: 1, detail: true }) +
      person({ x: 1240, y: 780, s: 1.45, who: 'xiangzhuang', pose: { ...P.stand(), head: Math.max(0, Math.sin(g * 3)) * 8 * seg(u, 0.5, 0.9) }, g, face: -1, detail: true }),
    cam: [[1050, 600, 1200], [1100, 600, 1050]],
  },
  // ---------- 14 项庄舞剑，项伯翼蔽沛公 ----------
  'd.dance': {
    bg: (id) => feastHall(id) + dais(),
    fg: (u, g) => {
      const ph = g * 0.9, sx = 760 + Math.sin(ph * 1.3) * 160, bx = lerp(sx + 90, 980, 0.5) + Math.sin(ph * 1.3 + 0.6) * 40;
      let o = person({ x: 1260, y: 640, s: 1.3, who: 'xiangyu', pose: P.sitCross(), g, face: -1, detail: true }) + table(1060, 780, 1);
      o += person({ x: 1120, y: 800, s: 1.3, who: 'liubang', pose: { ...P.sitCross(), lean: 6 + Math.max(0, Math.sin(ph * 1.3)) * 8 }, g, face: -1, detail: true, mood: 'shock' });
      o += person({ x: sx, y: 800, s: 1.35, who: 'xiangzhuang', pose: P.dance(ph), g, face: 1, detail: true });
      o += sword(sx + 30, 600 + Math.sin(ph * 2.6) * 60, -20 + Math.sin(ph * 2.6) * 50, 170, 0.8);
      o += person({ x: bx, y: 800, s: 1.35, who: 'xiangbo', pose: P.dance(ph + 0.5), g, face: -1, detail: true });
      o += sword(bx - 30, 610 + Math.cos(ph * 2.6) * 50, 200 + Math.cos(ph * 2.6) * 40, 160, 0.5);
      return o;
    },
    cam: [[920, 600, 1400], [960, 620, 1250]],
  },
  'd.shield': {
    bg: (id) => feastHall(id),
    fg: (u, g) => {
      const ph = g * 0.9, k = Math.max(0, Math.sin(ph * 1.3));
      let o = person({ x: 1120, y: 800, s: 1.6, who: 'liubang', pose: { ...P.sitCross(), lean: -10 }, g, face: -1, detail: true, mood: 'shock' });
      o += sword(700 + k * 140, 540, -10 + k * 20, 220, k);
      o += person({ x: 960, y: 820, s: 1.7, who: 'xiangbo', pose: P.mix(P.stand(), P.dance(ph + 0.5), 0.6), g, face: -1, detail: true });
      return o;
    },
    cam: [[960, 560, 1100], [1000, 560, 950]],
  },
  // ---------- 15 张良出见樊哙 ----------
  'd.liangout': {
    bg: (id) => sky(id, '#C9B79C', '#E6D8BE') + ridge({ y: 400, amp: 60, seed: 88, a: 0.3 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#BCA680"/>` + bigTent(400, 660, 0.9, 0, 0.5),
    fg: (u, g) => person({ x: 860, y: 780, s: 1.45, who: 'zhangliang', pose: P.mix(P.stand(), P.point(1), 0.5 + 0.4 * Math.sin(g * 1.6)), g, face: 1, detail: true }) +
      person({ x: 1160, y: 780, s: 1.6, who: 'fankuai', pose: P.mix(P.stand(), P.akimbo(), seg(u, 0.5, 0.9)), g, face: -1, detail: true }),
    cam: [[1000, 560, 1300], [1000, 580, 1150]],
  },
  // ---------- 17 樊哙闯帐 ----------
  'd.burst': {
    bg: (id) => sky(id, '#C9B79C', '#E6D8BE') + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#BCA680"/>` + bigTent(1200, 700, 1.3, 0, 0.7),
    fg: (u, g) => {
      const run = seg(u, 0, 0.45), hit = seg(u, 0.4, 0.6), fall = seg(u, 0.45, 0.8);
      let o = '';
      [[880, 1], [1000, -1]].forEach(([x, fc], i) => { o += `<g transform="rotate(${f(fall * (i ? 70 : -70))} ${x} 800)">${person({ x: x as number, y: 800, s: 1.3, who: 'soldier', pose: P.stand(), g, face: fc as 1 | -1, hold: 'spear' })}</g>`; });
      o += person({ x: lerp(160, 820, run) + hit * 30, y: 800, s: 1.5, who: 'fankuai', pose: run < 1 ? P.walk(g * 1.6, 1.2) : P.mix(P.stand(), P.point(1), 0.6), g, face: 1, detail: true });
      const x = lerp(160, 820, run) + hit * 30;
      o += `<ellipse cx="${f(x + 70)}" cy="650" rx="30" ry="80" fill="#6A4A2E" stroke="${INK}" stroke-width="4"/><path d="M${f(x + 70)},580 v140" stroke="${GOLD}" stroke-width="4"/>`; // 盾
      return o;
    },
    cam: [[800, 560, 1600], [900, 600, 1300]],
  },
  'd.fkglare': {
    bg: (id) => sky(id, '#2A1E1A', '#4A2E26') + glow(id, 1200, 420, 420, 0, 0, 0.55),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'fankuai', g, id, brow: -1, open: 1.3, mouth: -0.6, shake: 0.4 }),
    cam: [[800, 460, 1400], [790, 450, 1200]],
  },
  'd.xyknee': {
    bg: (id) => feastHall(id) + dais(),
    fg: (u, g) => {
      const k = seg(u, 0, 0.4);
      return person({ x: 1200, y: lerp(640, 620, k), s: 1.45, who: 'xiangyu', pose: P.mix(P.sitCross(), { ...P.sitCross(), lean: -10, lF: 60, kF: 120, lB: 50, kB: 120, aF: 30, eF: 60 }, k), g, face: -1, detail: true, mood: 'shock' }) +
        person({ x: 700, y: 800, s: 1.55, who: 'fankuai', pose: P.stand(), g, face: 1, detail: true });
    },
    cam: [[960, 580, 1300], [980, 580, 1150]],
  },
  'd.wine': {
    bg: (id) => feastHall(id),
    fg: (u, g) => {
      const d = seg(u, 0.2, 0.7);
      return person({ x: 800, y: 800, s: 1.7, who: 'fankuai', pose: { ...P.stand(), aF: lerp(40, 118, d), eF: lerp(60, 92, d), head: -10 * d }, g, face: 1, hold: 'cup', detail: true }) + table(1100, 800, 1.2);
    },
    cam: [[860, 560, 1200], [860, 540, 1050]],
  },
  'd.fkdrink': {
    bg: (id) => feastHall(id),
    fg: (u, g) => person({ x: 800, y: 820, s: 1.9, who: 'fankuai', pose: P.mix(P.stand(), P.point(1), 0.5 + 0.4 * Math.sin(g * 1.8)), g, face: 1, hold: 'cup', detail: true }),
    cam: [[820, 520, 1150], [820, 500, 1000]],
  },
  // ---------- 21 刘邦如厕，招樊哙 ----------
  'd.toilet': {
    bg: (id) => sky(id, '#C9B79C', '#E6D8BE') + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#BCA680"/>` + bigTent(400, 700, 1.2, 0, 0.6),
    fg: (u, g) => {
      const k = seg(u, 0, 0.6);
      return person({ x: lerp(420, 900, k), y: 790, s: 1.45, who: 'liubang', pose: k < 1 ? P.walk(g * 1.2) : P.mix(P.stand(), P.point(0.6), 0.5), g, face: 1, detail: true }) +
        person({ x: lerp(380, 760, seg(u, 0.3, 0.9)), y: 800, s: 1.55, who: 'fankuai', pose: P.walk(g * 1.2, 1 - seg(u, 0.8, 1)), g, face: 1, detail: true });
    },
    cam: [[800, 560, 1500], [820, 580, 1250]],
  },
  'd.fish': {
    bg: (id) => sky(id, '#3A2C24', '#4A3A2E') + `<rect x="300" y="520" width="1000" height="140" rx="20" fill="#8A6A44" stroke="${INK}" stroke-width="5"/><path d="M320,560 h960" stroke="#6E5530" stroke-width="3" opacity=".6"/>`,
    fg: (u, g) => {
      const flap = Math.sin(g * 9) * 6, knife = lerp(-160, 0, seg(u, 0.2, 0.7));
      return `<g transform="translate(760,520) rotate(${f(flap * 0.3)})"><path d="M-220,0 Q-60,-90 160,-10 L240,-60 L230,0 L240,60 L160,10 Q-60,90 -220,0 Z" fill="#9AA6A8" stroke="${INK}" stroke-width="4"/><circle cx="-150" cy="-10" r="10" fill="${INK}"/><path d="M-40,-50 q30,50 0,100" stroke="${INK}" stroke-opacity=".4" stroke-width="3" fill="none"/></g>` +
        `<g transform="translate(1040,${f(380 + knife)}) rotate(-10)"><path d="M0,0 L220,0 L220,60 Q60,90 0,60 Z" fill="#C9CDD2" stroke="${INK}" stroke-width="4"/><rect x="220" y="14" width="120" height="32" rx="8" fill="#4A3A2A"/></g>` +
        `<text x="1160" y="780" font-size="54" text-anchor="middle" fill="#E9DFCB" opacity="${f(seg(u, 0.5, 0.8) * 0.85)}" ${KAI}>刀俎</text><text x="700" y="780" font-size="54" text-anchor="middle" fill="#E9DFCB" opacity="${f(seg(u, 0.6, 0.9) * 0.85)}" ${KAI}>鱼肉</text>`;
    },
    cam: [[800, 520, 1300], [800, 520, 1200]],
  },
  // ---------- 23 刘邦抄小路逃回；张良献礼；范增碎玉斗 ----------
  'd.escape': {
    bg: (id) => sky(id, '#8C7A6A', '#C9B79C') + ridge({ y: 360, amp: 160, seed: 89, a: 0.55, color: '#4A4040', peaks: 3 }) + ridge({ y: 470, amp: 90, seed: 90, a: 0.6, color: '#5A5048' }) + `<path d="M-200,700 Q500,640 900,700 T1800,690 L1800,1100 L-200,1100 Z" fill="#6E6052"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0, 1); let o = '';
      o += horse({ x: lerp(1500, 500, k), y: 740, s: 0.9, g, gait: 'run', ph: g * 1.8, rider: 'liubang', face: -1 });
      for (let i = 0; i < 4; i++) o += person({ x: lerp(1500, 500, k) + 160 + i * 90, y: 760 + (i % 2) * 14, s: 0.9, who: i === 0 ? 'fankuai' : 'hanSoldier', pose: P.walk(g * 1.8 + i * 0.25, 1.3), g, face: -1 });
      return o + mist(id, 91, g, { y: 640, h: 80, a: 0.45, n: 6, speed: 20 });
    },
    cam: [[800, 520, 1600], [800, 560, 1450]],
  },
  'd.gifts': {
    bg: (id) => feastHall(id) + dais(),
    fg: (u, g) => {
      const k = seg(u, 0, 0.5);
      let o = person({ x: 1200, y: 640, s: 1.45, who: 'xiangyu', pose: P.sitCross(), g, face: -1, detail: true }) + person({ x: 520, y: 770, s: 1.35, who: 'fanzeng', pose: P.sitCross(), g, face: 1, detail: true });
      o += person({ x: 860, y: 790, s: 1.4, who: 'zhangliang', pose: P.give(k), g, face: 1, detail: true });
      o += `<rect x="${f(920 + k * 40)}" y="${f(640 - k * 10)}" width="140" height="18" rx="4" fill="#6A3A2C"/>` + bi(950 + k * 40, 620 - k * 10, 22) + bi(1000 + k * 40, 620 - k * 10, 22) + dou(1040 + k * 40, 616 - k * 10, 0.5);
      return o;
    },
    cam: [[880, 560, 1300], [900, 560, 1200]],
  },
  'd.smash': {
    bg: (id) => sky(id, '#2E241E', '#4A3A2E') + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#3A2A20"/>`,
    fg: (u, g) => {
      const down = seg(u, 0.2, 0.45), br = seg(u, 0.45, 0.9), r = rng(41);
      let o = br <= 0 ? dou(800, 640, 2) : '';
      for (let i = 0; i < 14 && br > 0; i++) { const a = r() * 6.28, d = br * (80 + r() * 200); o += `<path d="M${f(800 + Math.cos(a) * d)},${f(640 + Math.sin(a) * d * 0.4 - Math.sin(br * Math.PI) * 60 * r())} l${f(10 + r() * 16)},${f(-6 - r() * 10)} l${f(-4 + r() * 8)},${f(14 + r() * 8)} z" fill="#B9D3B8" stroke="#6E8A6C" stroke-width="2"/>`; }
      return o + sword(lerp(1100, 860, down), lerp(220, 560, down), lerp(150, 120, down), 260, Math.sin(down * Math.PI) * 0.6);
    },
    cam: [[800, 520, 1300], [800, 560, 1150]],
  },
  'd.fzcu': {
    bg: (id) => sky(id, '#2A221E', '#3E302A') + glow(id, 1200, 420, 420, 0, 0, 0.5),
    fg: (u, g, id) => faceCU({ x: 760, y: 470, s: 1.7, who: 'fanzeng', g, id, brow: -1, mouth: 0.5 + 0.1 * Math.sin(g * 7), shake: 0.3 }),
    cam: [[800, 460, 1400], [800, 450, 1250]],
  },
  'd.punish': {
    bg: (id) => sky(id, '#B9A88C', '#D9CBB0') + ridge({ y: 420, amp: 50, seed: 92, a: 0.25 }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#AE9A76"/>` + tent(300, 620, 1, '#7A3A30') + tent(1350, 620, 1, '#7A3A30'),
    fg: (u, g) => {
      const k = seg(u, 0.3, 1);
      let o = banner(1100, 470, 0.9, g, RED, '刘', 0, 0.9) + person({ x: 520, y: 780, s: 1.5, who: 'liubang', pose: P.point(1), g, face: 1, detail: true });
      o += person({ x: lerp(900, 1500, k), y: 790, s: 1.35, who: 'crowd4', pose: { ...P.walk(g * 1.2, k > 0 ? 1 : 0), head: 20 }, g, face: 1, mood: 'sad' });
      [[-90, 1], [90, 1]].forEach(([dx]) => { o += person({ x: lerp(900, 1500, k) + (dx as number), y: 800, s: 1.35, who: 'hanSoldier', pose: P.walk(g * 1.2 + 0.3, k > 0 ? 1 : 0), g, face: 1, hold: 'spear' }); });
      return o;
    },
    cam: [[800, 560, 1600], [800, 580, 1400]],
  },
  'd.desk': deskShot('鸿门宴上项羽之所以没有杀刘邦是因为项伯一直护着刘邦的原因'),
  // ---------- 28 分封；韩信离开项羽 ----------
  'd.fief': {
    bg: (id) => sky(id, '#E9DFC8', '#E3D6BA') + `<rect x="60" y="60" width="1480" height="780" rx="20" fill="#EFE6D0" stroke="#B9A57A" stroke-width="6"/>` +
      `<path d="M500,300 Q800,250 1100,320 Q1300,370 1480,330" stroke="#8FA9B8" stroke-width="14" fill="none"/>` + vtext(560, 200, '关中', 34, INK, 0.7) + vtext(1360, 380, '彭城', 34, INK, 0.7),
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.6); let o = '';
      // 汉中、巴蜀：四面是山
      for (let i = 0; i < 9; i++) { const a = (i / 9) * 6.28, x = 400 + Math.cos(a) * 240, y = 600 + Math.sin(a) * 150; o += `<path d="M${f(x - 50)},${f(y + 30)} L${f(x)},${f(y - 40)} L${f(x + 50)},${f(y + 30)} Z" fill="#7A6E5A" opacity="${f(0.4 + 0.5 * k)}"/>`; }
      o += `<ellipse cx="400" cy="600" rx="170" ry="100" fill="${RED}" opacity="${f(0.18 * k)}"/>` + vtext(340, 540, '汉中', 34, RED, 0.85 * k) + vtext(450, 560, '巴蜀', 34, RED, 0.85 * k);
      o += banner(400, 520, 0.7, g, RED, '汉', 0, k) + banner(1300, 420, 0.8, g, '#2B2722', '楚', 0.3, 0.95) + glow(id, 1300, 440, 100, g, 0, 0.3);
      return o;
    },
    cam: [[800, 470, 1600], [700, 500, 1450]],
  },
  'd.leave': {
    bg: (id) => nightCamp(id) + ridge({ y: 520, amp: 140, seed: 93, a: 0.5, color: '#14161E', x0: -200, x1: 700, peaks: 2 }),
    fg: (u, g, id) => {
      const k = seg(u, 0, 1), look = seg(u, 0.3, 0.45) - seg(u, 0.55, 0.7);
      return torch(id, 1300, 600, 1.1, g) + torch(id, 1460, 610, 1.1, g, 0.4) +
        person({ x: lerp(1150, 320, k), y: lerp(760, 640, k), s: lerp(1.2, 0.6, k), who: 'hanxin', pose: look > 0.5 ? P.stand() : P.walk(g * 0.8), g, face: look > 0.5 ? 1 : -1 }) +
        mist(id, 94, g, { y: 640, h: 80, a: 0.4, n: 6, speed: 14 });
    },
    cam: [[900, 520, 1500], [700, 540, 1450]],
  },
};
