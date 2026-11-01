// 讲时态用的小场景（拓展里的“小视频”）：同一个镜头里把事情演一遍，字幕跟着换时态。
// tq.perfect：两点钟奖杯在桌上 → 两点一刻灯灭、被拿走 → 现在桌上空着（is / took / has taken）
// tq.cont：Ben 一直在吃，灯灭的那一刻他还在嚼（was eating）；tq.ate：灯一灭，他才开始吃（ate）
// tq.every / tq.once / tq.sofar：一般现在时、一般过去时、现在完成时放在一起比
import { GOLD, INK, f, glow, seg } from './core';
import { P, person } from './rig';
import { backstageBg, clock, seated, table, trophy } from './shotsE1';
import type { ShotDef } from './Film';

const SANS = `style="font-family:'Helvetica Neue',Arial,sans-serif"`;
const dark = (k: number) => `<rect x="-200" y="-200" width="2000" height="1300" fill="#05060A" opacity="${f(k)}"/>`;
/** 停电那一段：u 在 a—b 之间是黑的，两头闪一下 */
const outage = (u: number, g: number, a: number, b: number) => (u < a ? 0 : u < a + 0.04 ? (Math.sin(g * 40) > 0 ? 0.9 : 0.2) : u < b ? 0.93 : u < b + 0.04 ? (Math.sin(g * 40) > 0 ? 0.2 : 0.9) : 0);
const mooncake = (x: number, y: number, s = 1, bite = 0) => `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><circle r="40" fill="#C98A3E" stroke="#7A4E1E" stroke-width="4"/><circle r="22" fill="none" stroke="#7A4E1E" stroke-width="2.5"/>${bite > 0 ? `<circle cx="34" cy="-20" r="${f(10 + bite * 14)}" fill="#F1E8D6"/>` : ''}</g>`;
const label = (x: number, y: number, t: string, c = INK, size = 46) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="900" fill="${c}" text-anchor="middle" ${SANS}>${t}</text>`;

export const SHOTS_TQ: Record<string, ShotDef> = {
  'tq.perfect': {
    bg: (id) => backstageBg(id) + table(820, 560, 420),
    fg: (u, g, id) => {
      const k = outage(u, g, 0.3, 0.56), gone = u > 0.46, mm = Math.round(seg(u, 0, 1) * 30);
      // 黑暗里伸过来一只手，把奖杯拿走
      const hand = u > 0.38 && u < 0.5 ? `<path d="M${f(1300 - (u - 0.38) * 3000)},470 l160,-10 l10,30 l-170,10 Z" fill="#3A3A44" opacity=".8"/>` : '';
      return (gone ? `<ellipse cx="820" cy="552" rx="70" ry="12" fill="none" stroke="#C9D6F0" stroke-width="3" stroke-dasharray="8 6" opacity="${f(seg(u, 0.6, 0.7))}"/>` : trophy(id, 820, 552, 1.1, g, 1)) +
        clock(1330, 230, 110, 2, mm, g) + hand + dark(k) +
        (u > 0.62 ? person({ x: 420, y: 870, s: 1.9, who: 'green', pose: P.point(seg(u, 0.62, 0.75)), g, mood: 'shock' }) : '');
    },
    cam: [[880, 470, 1300], [880, 470, 1300]],
  },
  'tq.cont': {
    bg: (id) => backstageBg(id),
    fg: (u, g, id) => {
      const k = outage(u, g, 0.45, 0.85);
      // 灯灭之前就在吃，灯灭的时候还在嚼：一段一直在做的事，那一刻落在中间
      return glow(id, 820, 520, 220, g, 0, 0.3) + seated('ben', 760, 800, 2.3, g, { pose: P.eat(g * 0.9), hold: 'mooncake', mood: 'laugh' }) + clock(1330, 230, 110, 2, Math.round(10 + seg(u, 0, 1) * 10), g) + dark(Math.min(k, 0.6)) +
        (u > 0.45 && u < 0.88 ? label(1080, 400, 'chomp…', '#E9C88A', 54) : '');
    },
    cam: [[880, 500, 1300], [880, 500, 1300]],
  },
  'tq.ate': {
    bg: (id) => backstageBg(id),
    fg: (u, g, id) => {
      const k = outage(u, g, 0.3, 0.85), eat = u > 0.45;
      // 灯亮着的时候手里拿着月饼不动；灯一灭，才开始吃
      return glow(id, 820, 520, 220, g, 0, 0.3) + seated('ben', 760, 800, 2.3, g, { pose: eat ? P.eat(g * 0.9) : { ...P.sitRest(), aF: 60, eF: 70 }, hold: 'mooncake', mood: eat ? 'laugh' : 'calm' }) + clock(1330, 230, 110, 2, Math.round(10 + seg(u, 0, 1) * 10), g) + dark(Math.min(k, 0.6)) +
        (eat && u < 0.88 ? label(1080, 400, 'chomp…', '#E9C88A', 54) : '');
    },
    cam: [[880, 500, 1300], [880, 500, 1300]],
  },
  // 每天都吃：日历一页页翻，每页都有月饼
  'tq.every': {
    bg: (id) => backstageBg(id),
    fg: (u, g) => {
      const day = Math.floor(u * 3.999), names = ['MON', 'TUE', 'WED', 'THU'];
      return `<rect x="1060" y="200" width="300" height="320" rx="16" fill="#FBF7EA" stroke="${INK}" stroke-width="4"/><rect x="1060" y="200" width="300" height="80" rx="16" fill="#B8352A"/>` + label(1210, 258, names[day], '#FFF6DD', 50) + mooncake(1210, 410, 1.4) +
        seated('ben', 640, 800, 2.2, g, { pose: P.eat(g * 0.9), hold: 'mooncake', mood: 'laugh' }) + label(1210, 640, 'every day', '#FBF7EA', 52);
    },
    cam: [[880, 500, 1300], [880, 500, 1300]],
  },
  // 只说那一刻：钟停在 2:15，一个画面
  'tq.once': {
    bg: (id) => backstageBg(id),
    fg: (u, g) => clock(1300, 300, 140, 2, 15, g) + `<rect x="1120" y="470" width="360" height="70" rx="12" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/>` + label(1300, 520, 'at 2:15', '#2F5DA8', 46) +
      seated('ben', 640, 800, 2.2, g, { pose: P.eat(0.3), hold: 'mooncake', mood: 'laugh' }) + `<rect x="400" y="300" width="480" height="580" fill="none" stroke="${GOLD}" stroke-width="10" opacity="${f(seg(u, 0.1, 0.3))}"/>`,
    cam: [[880, 500, 1300], [880, 500, 1300]],
  },
  // 到现在为止：一块一块加，一直数到“现在”
  'tq.sofar': {
    bg: (id) => backstageBg(id),
    fg: (u, g) => {
      const n = Math.min(9, Math.floor(seg(u, 0.05, 0.8) * 9.99));
      let o = '';
      for (let i = 0; i < 9; i++) o += `<g opacity="${i < n ? 1 : 0.15}">${mooncake(1060 + (i % 3) * 110, 300 + Math.floor(i / 3) * 110, 1.1)}</g>`;
      return o + label(1170, 700, `× ${n}`, GOLD, 80) + (u > 0.8 ? label(1170, 790, 'so far (up to now)', '#FBF7EA', 40) : '') + seated('ben', 560, 800, 2.2, g, { pose: P.eat(g * 0.9), hold: 'mooncake', mood: 'laugh' });
    },
    cam: [[860, 500, 1300], [860, 500, 1300]],
  },
  // 第二章：Green 老师一直在打印，两点一刻灯灭、打印机一下子停了（was printing / went out / stopped）
  'tq.print': {
    bg: (id) => backstageBg(id),
    fg: (u, g, id) => {
      const off = u > 0.45, k = outage(u, g, 0.45, 2), feed = off ? 0.5 : (g * 0.8) % 1;
      const printer = `<rect x="880" y="560" width="300" height="150" rx="14" fill="#D8DCE0" stroke="${INK}" stroke-width="4"/><rect x="900" y="590" width="260" height="20" rx="6" fill="#2B2722"/><circle cx="1150" cy="660" r="9" fill="${off ? '#6A6A6A' : '#5ACB6A'}"/>` +
        `<rect x="930" y="${f(610 - 0)}" width="200" height="${f(10 + feed * 120)}" fill="#FBF7EA" stroke="#B8A882" stroke-width="2"/>` + (off ? `<text x="1030" y="690" font-size="26" fill="#8E2A26" text-anchor="middle" font-weight="900" ${SANS}>half printed</text>` : '');
      return `<rect x="840" y="710" width="380" height="20" fill="#6E4C30"/>` + printer + person({ x: 700, y: 870, s: 1.95, who: 'green', pose: { ...P.stand(), aF: 60, eF: 70, head: 8 }, g, face: 1, mood: off ? 'shock' : 'calm' }) + clock(1330, 230, 110, 2, Math.round(10 + seg(u, 0, 1) * 10), g) + dark(Math.min(k, 0.65));
    },
    cam: [[900, 520, 1300], [900, 520, 1300]],
  },
  // 第二章：Max 一直在搬大鼓，半路被电线绊了一下（while … was carrying / tripped）
  'tq.drum': {
    bg: (id) => backstageBg(id) + `<path d="M200,860 Q600,820 900,870 Q1200,910 1500,850" stroke="#1E1E1E" stroke-width="8" fill="none"/>`,
    fg: (u, g) => {
      const trip = seg(u, 0.5, 0.6), x = 300 + Math.min(u, 0.55) * 1100;
      const drum = `<g transform="translate(${f(x + 50)},${f(720 + trip * 90)}) rotate(${f(trip * 40)})"><ellipse cx="0" cy="-60" rx="80" ry="24" fill="#E9DFCB" stroke="${INK}" stroke-width="4"/><path d="M-80,-60 L-80,40 Q0,70 80,40 L80,-60" fill="#B8352A" stroke="${INK}" stroke-width="4"/></g>`;
      return person({ x, y: 870, s: 1.9, who: 'drummer', pose: trip > 0.05 ? P.mix(P.walk(g, 1), { ...P.stand(), lean: 40, aF: 120, eF: 0 }, trip) : { ...P.walk(g * 1.2, 0.7), aF: 70, eF: 80, aB: 70, eB: 80 }, g, face: 1, mood: trip > 0.3 ? 'shock' : 'calm' }) + drum +
        (u > 0.5 && u < 0.8 ? `<text x="${f(x + 60)}" y="560" font-size="64" font-weight="900" fill="#E9C88A" text-anchor="middle" ${SANS}>Oops!</text>` : '');
    },
    cam: [[880, 560, 1400], [880, 560, 1400]],
  },
};
