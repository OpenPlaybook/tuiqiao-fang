// ★ 论三杰：洛阳南宫的酒宴、三杰、范增、定都关中
import { GOLD, INK, PAPER, RED, banner, bareTree, f, glow, lerp, mist, ridge, seg, sky, soundRings, sunDisc, vtext } from './core';
import { P, faceCU, horse, person } from './rig';
import { hallIn } from './shotsLB';
import { dais, tentIn } from './shots2';
import type { ShotDef } from './Film';

/** 南宫：堂上的坐榻（刘邦坐在上面），两边的席 */
const court = (id: string) => hallIn(id) + dais();
const seal = (x: number, y: number, s = 1, round = 0) => `<rect x="${f(x - 17 * s)}" y="${f(y - 17 * s)}" width="${f(34 * s)}" height="${f(34 * s)}" rx="${f(round * 14 * s)}" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>`;
/** 三杰：三个画框里的三张脸；active 是正在讲的那一个（亮、放大），其余暗下去 */
const trio = (id: string, active: number, u: number, g: number) => {
  const who = ['zhangliang', 'xiaohe', 'hanxinKing'] as const, name = ['张良', '萧何', '韩信'], tag = ['运筹帷幄', '镇国家', '战必胜'];
  let o = '';
  for (let i = 0; i < 3; i++) {
    const x = 330 + i * 470, on = i === active, k = on ? seg(u, 0, 0.35) : 0, s = 1 + k * 0.08;
    o += `<defs><clipPath id="${id}cf${i}"><rect x="${f(x - 190 * s)}" y="${f(170 - 30 * k)}" width="${f(380 * s)}" height="${f(460 * s)}"/></clipPath></defs>` +
      `<rect x="${f(x - 200 * s)}" y="${f(160 - 30 * k)}" width="${f(400 * s)}" height="${f(480 * s)}" fill="#3A2E24" stroke="${on ? GOLD : '#6A5A44'}" stroke-width="${on ? 8 : 5}"/>` +
      `<g clip-path="url(#${id}cf${i})">${faceCU({ x, y: 420 - 30 * k, s: 0.9 * s, who: who[i], g, id, brow: 0, mouth: 0, look: 0.2 })}</g>` +
      (on ? '' : `<rect x="${f(x - 200)}" y="160" width="400" height="480" fill="#1E1A16" opacity=".55"/>`) +
      `<text x="${x}" y="${f(700 - 10 * k)}" font-size="${on ? 46 : 38}" text-anchor="middle" fill="${on ? GOLD : '#B8AC94'}" style="font-family:'Kaiti SC','STKaiti',serif">${name[i]}</text>` +
      (on ? `<text x="${x}" y="770" font-size="40" text-anchor="middle" fill="#F1E8D6" opacity="${f(seg(u, 0.3, 0.6))}" style="font-family:'Kaiti SC','STKaiti',serif">${tag[i]}</text>` : '');
  }
  return o;
};

export const SHOTS_SJ: Record<string, ShotDef> = {
  'sj.request': {
    bg: (id) => hallIn(id),
    fg: (u, g, id) => {
      // 推让三次：两手往外一推、再一推
      const c = (u * 3) % 1, push = Math.sin(c * Math.PI);
      let o = glow(id, 800, 480, 380, g, 0, 0.4);
      for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) o += person({ x: (i < 3 ? 160 + i * 150 : 1000 + (i - 3) * 130) + r * 50, y: 880 + r * 60, s: 1.15, who: ['crowd1', 'crowd2', 'caocan', 'crowd4', 'fankuai', 'crowd1', 'tenggong'][i], pose: P.bow(0.7), g, face: i < 3 ? 1 : -1 });
      return o + person({ x: 800, y: 760, s: 1.55, who: 'liubangGen', pose: P.mix(P.stand(), { ...P.stand(), aF: 80, eF: 10, aB: 70, eB: 10, lean: -6 }, push), g, face: 1, detail: true }) +
        `<g opacity="${f(seg(u, 0.05, 0.15))}">${vtext(1440, 260, ['一让', '二让', '三让'][Math.min(2, Math.floor(u * 3))], 52, GOLD, 0.9)}</g>`;
    },
    cam: [[800, 600, 1600], [800, 620, 1450]],
  },
  'sj.feast': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 360, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: P.drink(0.5 + 0.5 * Math.sin(g * 1.1)), g, face: -1, detail: true, hold: 'cup' });
      for (let i = 0; i < 6; i++) o += `<rect x="${150 + i * 140}" y="${740 + (i % 2) * 40}" width="100" height="16" fill="#5A3A26"/>` + person({ x: 200 + i * 140, y: 760 + (i % 2) * 40, s: 1.1, who: ['crowd1', 'caocan', 'crowd2', 'fankuai', 'crowd4', 'zhangliang'][i], pose: P.drink(0.5 + 0.5 * Math.sin(g * 1.3 + i)), g, face: 1, hold: 'cup' });
      return o;
    },
    cam: [[800, 560, 1600], [860, 580, 1450]],
  },
  'sj.ask': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 360, g, 0, 0.5) + person({ x: 1200, y: 640, s: 1.5, who: 'liubang', pose: { ...P.sitCross(), aF: 100 + 10 * Math.sin(g * 4), eF: 20 }, g, face: -1, detail: true }) + soundRings(1080, 470, g, { dir: -1, n: 3, r0: 30 });
      for (let i = 0; i < 5; i++) o += person({ x: 220 + i * 150, y: 780 + (i % 2) * 30, s: 1.15, who: ['crowd1', 'caocan', 'crowd2', 'fankuai', 'crowd4'][i], pose: { ...P.sitCross(), head: -10 }, g, face: 1 });
      return o + `<g opacity="${f(seg(u, 0.3, 0.55))}">${vtext(320, 280, '吾所以有天下者何', 40, '#F1E8D6', 0.9)}</g><g opacity="${f(seg(u, 0.6, 0.85))}">${vtext(250, 280, '项氏之所以失天下者何', 40, GOLD, 0.9)}</g>`;
    },
    cam: [[800, 540, 1600], [800, 560, 1450]],
  },
  'sj.wanglin': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.3);
      return glow(id, 1200, 520, 320, g, 0, 0.4) + person({ x: 1200, y: 640, s: 1.4, who: 'liubang', pose: { ...P.sitCross(), head: 6 }, g, face: -1, detail: true }) +
        person({ x: 560, y: 790, s: 1.45, who: 'crowd2', pose: k < 0.5 ? P.sitCross() : P.mix(P.stand(), P.bow(0.4), 0.5 + 0.5 * Math.sin(g * 1.4)), g, face: 1, detail: true }) +
        person({ x: 720, y: 796, s: 1.45, who: 'caocan', pose: k < 0.5 ? P.sitCross() : { ...P.stand(), aF: 70, eF: 60 }, g, face: 1, detail: true }) +
        person({ x: 300, y: 800, s: 1.2, who: 'crowd1', pose: P.sitCross(), g, face: 1 });
    },
    cam: [[820, 560, 1500], [860, 580, 1300]],
  },
  'sj.give': {
    bg: (id) => sky(id, '#C9C0AC', PAPER) + ridge({ y: 440, amp: 50, seed: 901, a: 0.2 }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      // 刘邦把一枚枚印分给立功的将领，人越聚越多
      let o = person({ x: 400, y: 800, s: 1.55, who: 'liubangGen', pose: P.mix(P.stand(), P.give(1), 0.5 + 0.5 * Math.sin(g * 2)), g, face: 1, detail: true });
      for (let i = 0; i < 4; i++) {
        const t = seg(u, i * 0.2, i * 0.2 + 0.25), x = 640 + i * 230;
        o += person({ x, y: 810, s: 1.3, who: ['hanSoldier', 'fankuai', 'crowd1', 'hanxinLang'][i], pose: t > 0.9 ? P.cheer(g + i) : P.bow(0.4), g, face: -1, mood: t > 0.9 ? 'laugh' : 'calm' });
        if (t > 0 && t < 1) o += seal(lerp(480, x - 30, t), lerp(660, 700, t) - Math.sin(t * Math.PI) * 80, 1);
        if (t >= 1) o += seal(x - 30, 700, 0.9);
      }
      return o;
    },
    cam: [[800, 580, 1500], [820, 600, 1350]],
  },
  'sj.keep': {
    bg: (id) => tentIn(id) + dais(),
    fg: (u, g, id) => {
      // 项羽把官印攥在手里翻来覆去，棱角都磨圆了，还是不给
      const round = seg(u, 0.1, 0.9);
      let o = glow(id, 1200, 520, 280, g, 0, 0.45) + person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: { ...P.sitCross(), aF: 70, eF: 70, head: 14 }, g, face: -1, detail: true });
      o += `<g transform="rotate(${f(Math.sin(g * 2) * 30)} 1140 580)">${seal(1140, 580, 1.1, round)}</g>`;
      for (let i = 0; i < 3; i++) { const go = i === 2 ? seg(u, 0.6, 0.95) : 0; o += person({ x: 520 + i * 150 - go * 500, y: 800, s: 1.3, who: ['soldier', 'zhonglimo', 'crowd1'][i], pose: go > 0.02 ? P.walk(g, 0.6) : P.bow(0.3), g, face: go > 0.02 ? -1 : 1, mood: 'sad' }); }
      return o + `<g opacity="${f(seg(u, 0.4, 0.7))}">${vtext(520, 320, '印刓敝', 46, GOLD, 0.9)}${vtext(450, 320, '忍不能予', 46, '#F1E8D6', 0.85)}</g>`;
    },
    cam: [[880, 560, 1500], [920, 580, 1300]],
  },
  'sj.lbcu': {
    bg: (id) => sky(id, '#6A5440', '#9A8466') + glow(id, 1250, 500, 380, 0, 0, 0.4),
    fg: (u, g, id) => faceCU({ x: 720, y: 480, s: 1.7, who: 'liubang', g, id, brow: -0.1, mouth: Math.sin(g * 7) > 0.2 ? 0.5 : 0, look: 0.1 }) +
      `<g opacity="${f(seg(u, 0.1, 0.4))}">${vtext(1360, 160, '公知其一', 48, GOLD, 0.9)}${vtext(1280, 160, '未知其二', 48, '#F1E8D6', 0.9)}</g>`,
    cam: [[860, 470, 1450], [860, 460, 1350]],
  },
  'sj.zl': { bg: (id) => sky(id, '#2A221C', '#3E3226'), fg: (u, g, id) => trio(id, 0, u, g), cam: [[800, 450, 1500], [560, 450, 1250]] },
  'sj.xh': { bg: (id) => sky(id, '#2A221C', '#3E3226'), fg: (u, g, id) => trio(id, 1, u, g), cam: [[800, 450, 1500], [800, 450, 1250]] },
  'sj.hx': { bg: (id) => sky(id, '#2A221C', '#3E3226'), fg: (u, g, id) => trio(id, 2, u, g), cam: [[800, 450, 1500], [1040, 450, 1250]] },
  'sj.fz': {
    bg: (id) => sky(id, '#3A3036', '#5A4C50'),
    fg: (u, g, id) => faceCU({ x: 720, y: 480, s: 1.7, who: 'fanzeng', g, id, brow: 0.3, mouth: 0, look: 0.2 }) +
      `<g opacity="${f(seg(u, 0.15, 0.45))}">${vtext(1340, 140, '有一范增而不用', 46, '#E9DFCB', 0.9)}</g>`,
    cam: [[860, 470, 1450], [860, 460, 1350]],
  },
  'sj.nod': {
    bg: (id) => court(id),
    fg: (u, g, id) => {
      let o = glow(id, 1200, 520, 360, g, 0, 0.5) + person({ x: 1200, y: 640, s: 1.45, who: 'liubang', pose: P.mix(P.sitCross(), { ...P.sitCross(), aF: 110, eF: 20, head: -10 }, seg(u, 0.3, 0.6)), g, face: -1, detail: true, mood: 'laugh' });
      for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) o += person({ x: 200 + i * 150 + r * 50, y: 800 + r * 60, s: 1.15, who: ['crowd1', 'caocan', 'crowd2', 'fankuai', 'crowd4'][i], pose: P.bow(Math.min(1, seg(u, 0.1 + i * 0.05, 0.5) * 1.1)), g, face: 1 });
      return o;
    },
    cam: [[800, 560, 1600], [820, 580, 1450]],
  },
  // ---------- 范增 ----------
  'sj.doubt': {
    bg: (id) => tentIn(id) + dais(),
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.8);
      return glow(id, 1200, 520, 280, g, 0, 0.35) + person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: { ...P.sitCross(), head: 16 }, g, face: 1, detail: true }) +
        person({ x: 640, y: 800, s: 1.45, who: 'fanzeng', pose: P.mix(P.bow(0.3), { ...P.stand(), aF: 40, eF: 60, head: 10 }, k), g, face: 1, detail: true, mood: k > 0.5 ? 'sad' : 'calm' }) +
        person({ x: lerp(760, 1000, k), y: 806, s: 1.3, who: 'soldier', pose: k > 0.02 && k < 0.98 ? P.walk(g, 0.6) : P.stand(), g, face: 1 }) + seal(lerp(720, 960, k), 700, 1);
    },
    cam: [[900, 560, 1500], [900, 580, 1300]],
  },
  'sj.fzleave': {
    bg: (id) => tentIn(id) + dais(),
    fg: (u, g, id) => {
      const k = seg(u, 0.55, 0.95);
      return glow(id, 1200, 520, 280, g, 0, 0.35) + person({ x: 1200, y: 640, s: 1.5, who: 'xiangyu', pose: { ...P.sitCross(), head: 16 }, g, face: 1, detail: true }) +
        person({ x: lerp(760, 300, k), y: 800, s: 1.45, who: 'fanzeng', pose: k > 0.02 ? P.walk(g * 0.6, 0.4) : P.mix(P.stand(), P.bow(0.8), seg(u, 0.1, 0.4)), g, face: k > 0.02 ? -1 : 1, detail: true, mood: 'sad' });
    },
    cam: [[880, 560, 1500], [760, 580, 1300]],
  },
  'sj.fzroad': {
    bg: (id) => sky(id, '#B8885A', '#E2B888') + sunDisc(id, 1250, 360, 60, '#C8452F', 0.7) + ridge({ y: 470, amp: 50, seed: 911, a: 0.35, color: '#6A5040' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#8A6E50"/>` + bareTree(912, 1100, 660, 1.2, 0.8),
    fg: (u, g) => {
      const k = seg(u, 0.5, 0.85);
      return person({ x: lerp(300, 900, seg(u, 0, 0.5)), y: 820, s: 1.4, who: 'fanzeng', pose: k > 0 ? P.mix(P.walk(g * 0.4, 0.3), { ...P.sitRest(), lean: 20, head: 20 }, k) : P.walk(g * 0.4, 0.3), g, face: 1, detail: true, mood: 'sad' }) +
        (k > 0.9 ? `<path d="M${880},${830} q24,-4 48,0" stroke="${INK}" stroke-opacity=".3" stroke-width="6" fill="none"/>` : '');
    },
    cam: [[800, 560, 1500], [860, 600, 1300]],
  },
  // ---------- 定都 ----------
  'sj.capital': {
    bg: (id) => sky(id, '#4A3E30', '#6A5844') + `<rect x="160" y="170" width="1280" height="640" fill="#E6D8B4" stroke="#6A4A2E" stroke-width="8"/>`,
    fg: (u, g, id) => {
      // 右边：洛阳，一小块平地，四面都是来敌的箭头；左边：关中，四面是山
      const a = seg(u, 0.1, 0.5);
      let o = `<ellipse cx="1080" cy="500" rx="120" ry="70" fill="#C9B88E"/><text x="1080" y="514" font-size="44" text-anchor="middle" fill="${INK}" style="font-family:'Kaiti SC','STKaiti',serif">洛阳</text>`;
      [[1080, 330, 0, 1], [1080, 670, 0, -1], [870, 500, 1, 0], [1290, 500, -1, 0]].forEach(([x, y, dx, dy], i) => { const t = (g * 0.6 + i * 0.25) % 1; o += `<g opacity="${f(a)}" transform="translate(${f(x - dx * 40 * t)},${f(y - dy * 40 * t)})"><path d="M${-dx * 50},${-dy * 50} L0,0" stroke="#A8322A" stroke-width="8"/><path d="M${dy * 14 - dx * 4},${-dx * 14 - dy * 4} L${dx * 16},${dy * 16} L${-dy * 14 - dx * 4},${dx * 14 - dy * 4} Z" fill="#A8322A"/></g>`; });
      o += Array.from({ length: 18 }, (_, i) => { const t = (i / 18) * Math.PI * 2, px = 500 + Math.cos(t) * 200, py = 490 + Math.sin(t) * 130; return `<path d="M${f(px - 20)},${f(py + 16)} L${f(px)},${f(py - 22)} L${f(px + 20)},${f(py + 16)} Z" fill="#6A5A40"/>`; }).join('') +
        `<ellipse cx="500" cy="490" rx="150" ry="90" fill="#B9C98E" opacity=".8"/><text x="500" y="504" font-size="44" text-anchor="middle" fill="#3E4A2A" style="font-family:'Kaiti SC','STKaiti',serif">关中</text>`;
      return o + glow(id, 800, 490, 600, g, 0, 0.1);
    },
    cam: [[800, 490, 1400], [800, 490, 1350]],
  },
  'sj.guanzhong': {
    bg: (id) => sky(id, '#4A3E30', '#6A5844') + `<rect x="160" y="170" width="1280" height="640" fill="#E6D8B4" stroke="#6A4A2E" stroke-width="8"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0.05, 0.4), t = seg(u, 0.55, 0.85);
      const lab = (x: number, y: number, s: string, c: string, a: number, size = 40) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" fill="${c}" opacity="${f(a)}" style="font-family:'Kaiti SC','STKaiti',serif">${s}</text>`;
      let o = `<ellipse cx="800" cy="500" rx="330" ry="170" fill="#B9C98E" opacity="${f(0.4 + 0.5 * k)}"/>`;
      o += Array.from({ length: 6 }, (_, i) => `<path d="M${1180 + (i % 2) * 40},${300 + i * 70} l26,-44 l26,44 Z" fill="#6A5A40"/>`).join('') + Array.from({ length: 6 }, (_, i) => `<path d="M${330 + (i % 2) * 40},${300 + i * 70} l26,-44 l26,44 Z" fill="#6A5A40"/>`).join('');
      o += lab(1260, 250, '崤山 函谷关', '#5A3A1E', k, 34) + lab(360, 250, '陇山', '#5A3A1E', k, 34) + lab(320, 760, '蜀', '#5A3A1E', k, 40) + lab(800, 510, '沃野千里', '#3E4A2A', k, 46);
      o += `<g opacity="${f(t)}"><rect x="560" y="580" width="480" height="130" fill="#7A2A22" opacity=".85"/>${lab(800, 632, '金城千里', '#F1E8D6', 1, 46)}${lab(800, 690, '天府之国', GOLD, 1, 46)}</g>`;
      return o + glow(id, 800, 500, 500, g, 0, 0.12);
    },
    cam: [[800, 490, 1400], [800, 500, 1300]],
  },
  'sj.west': {
    bg: (id) => sky(id, '#D8BC90', '#EED8B8') + sunDisc(id, 300, 300, 56, '#D8804A', 0.8) + ridge({ y: 460, amp: 90, seed: 921, a: 0.35, color: '#7A6A50' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>`,
    fg: (u, g) => {
      let o = '';
      // 往西（左）走
      for (let i = 0; i < 6; i++) o += person({ x: lerp(1200, 600, u) + i * 120, y: 820 + (i % 2) * 20, s: 1.1, who: 'hanSoldier', pose: P.walk(g + i * 0.3, 0.7), g, face: -1 }) + (i % 2 ? '' : banner(lerp(1180, 580, u) + i * 120, 660, 0.8, g, RED, '汉', i * 0.2));
      return o + horse({ x: lerp(1000, 400, u), y: 830, s: 1.2, face: -1, g, gait: 'walk', c: '#E6DCC8', rider: 'liubang' });
    },
    cam: [[800, 580, 1600], [700, 600, 1450]],
  },
  'sj.roads': {
    bg: (id) => sky(id, '#C9BEA8', '#E6DCC6') + ridge({ y: 420, amp: 80, seed: 931, a: 0.3, color: '#8A8A7A' }) + `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#B8A57E"/>` +
      `<path d="M760,1100 Q560,820 260,640 L320,630 Q610,800 820,1100 Z" fill="#D2C29A"/><path d="M780,1100 L780,640 L830,640 L840,1100 Z" fill="#D2C29A"/><path d="M820,1100 Q1040,820 1340,640 L1400,650 Q1100,830 860,1100 Z" fill="#D2C29A"/>` +
      `<rect x="700" y="520" width="200" height="110" fill="#7C7266" opacity=".8"/><path d="M680,520 L920,520 L880,480 L720,480 Z" fill="${INK}" opacity=".6"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.9);
      return `<g transform="translate(-450,0)">${mist(id, 932, g, { y: 520, h: 140, n: 6, a: 0.5 })}</g>` +
        [0, 1, 2, 3].map((i) => `<ellipse cx="${1250 + i * 110}" cy="${470 + (i % 2) * 40}" rx="${180 - i * 10}" ry="70" fill="#4A4240" opacity="${f(0.22 * k)}"/>`).join('') +
        person({ x: lerp(700, 380, k), y: lerp(1000, 680, k), s: lerp(1.3, 0.7, k), who: 'zhangliang', pose: P.walk(g * 0.6, 0.5), g, face: -1, a: 1 - seg(u, 0.85, 1) * 0.5 }) +
        person({ x: 805, y: lerp(1000, 680, k), s: lerp(1.3, 0.7, k), who: 'xiaohe', pose: P.walk(g * 0.6 + 0.3, 0.5), g, face: 1 }) +
        person({ x: lerp(900, 1250, k), y: lerp(1000, 680, k), s: lerp(1.3, 0.7, k), who: 'king', pose: P.walk(g * 0.6 + 0.6, 0.5), g, face: 1 });
    },
    cam: [[800, 640, 1500], [800, 640, 1400]],
  },
};
