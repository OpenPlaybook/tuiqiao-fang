// 第一回　淮阴少年：每一镜怎么画、怎么动（对照 第六堂课/分镜/第一回_淮阴少年.md）
import { GOLD, INK, PAPER, RED, WH, WW, banner, bareTree, cityWall, f, flame, glow, house, lerp, mist, moon, rain, reeds, ridge, river, rng, seg, sky, sunDisc, torch, vtext, wav, willow } from './core';
import { P, bowl, faceCU, horse, person, swordHand } from './rig';
import type { ShotDef } from './Film';

// ---------------- 共用的背景 ----------------
/** 淮阴城外的河岸：远山、城墙、河、岸 */
export const bankBg = (id: string, o: { wall?: boolean; far?: boolean; warm?: boolean } = {}) =>
  sky(id, o.warm ? '#EAD9BE' : '#E3E2DA', PAPER) +
  ridge({ y: 330, amp: 120, seed: 3, a: 0.13, peaks: 2 }) + ridge({ y: 400, amp: 70, seed: 5, a: 0.2, peaks: 3 }) +
  (o.wall !== false ? cityWall(980, 470, 520, 0.9, 0.55) : '') +
  `<path d="M-200,480 Q500,455 1800,470 L1800,1100 L-200,1100 Z" fill="#CFC8B6" opacity=".55"/>` +
  `<path d="M-200,520 Q700,500 1800,515 L1800,700 Q900,690 -200,712 Z" fill="#B9BDB2" opacity=".55"/>` +
  `<path d="M-200,700 Q800,680 1800,708 L1800,1100 L-200,1100 Z" fill="#C9B994"/>` + `<path d="M-200,700 Q800,680 1800,708" stroke="${INK}" stroke-opacity=".35" stroke-width="3" fill="none"/>`;
export const bankFg = (id: string, g: number, seed = 1) => river(seed, g, { y0: 525, y1: 700, speed: 26, n: 70 }) + mist(id, seed + 3, g, { y: 500, h: 50, a: 0.55, n: 6 });
/** 淮阴街市 */
const streetBg = (id: string) =>
  sky(id, '#E6DDCB', PAPER) + ridge({ y: 300, amp: 60, seed: 21, a: 0.1 }) +
  house(220, 600, 1.9, 0.92) + house(640, 590, 1.6, 0.85) + house(1380, 600, 1.9, 0.92) + house(1020, 585, 1.4, 0.8) +
  `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#CDBF9F"/>` + `<path d="M-200,640 Q800,620 1800,640" stroke="${INK}" stroke-opacity=".15" stroke-width="40" fill="none"/>` +
  // 肉铺：棚子、挂着的肉
  `<path d="M1180,470 L1560,470 L1590,500 L1150,500 Z" fill="#7A4A2E"/><rect x="1185" y="500" width="6" height="110" fill="${INK}"/><rect x="1545" y="500" width="6" height="110" fill="${INK}"/><rect x="1200" y="560" width="340" height="40" fill="#6E5A40"/>`;
const meat = (g: number) => [1240, 1300, 1360, 1420, 1480].map((x, i) => `<g transform="rotate(${f(wav(g, 2.4, i * 0.2) * 3)} ${x} 500)"><line x1="${x}" y1="500" x2="${x}" y2="520" stroke="${INK}"/><path d="M${x - 12},520 q12,-6 24,0 l-4,30 q-8,6 -16,0 z" fill="#A04A3A" stroke="${INK}" stroke-opacity=".5"/></g>`).join('') + `<g transform="rotate(${f(wav(g, 3) * 4)} 1290 470)"><path d="M1290,470 v10 h40 v90 l-20,-10 l-20,10 z" fill="#E9DFCB" stroke="${INK}" stroke-opacity=".5"/>${vtext(1310, 505, '肉', 26, RED, 0.9)}</g>`;
/** 夜里的书房：窗、月、书案、竹简、读书眼镜 */
export const deskBg = (id: string) =>
  sky(id, '#2E2C33', '#4A4540') + `<rect x="900" y="80" width="460" height="420" fill="#1F2230"/>` + moon(id, 1130, 230, 56) +
  Array.from({ length: 7 }, (_, i) => `<line x1="${900 + i * 76}" y1="80" x2="${900 + i * 76}" y2="500" stroke="#5A4630" stroke-width="10"/>`).join('') + `<rect x="900" y="80" width="460" height="420" fill="none" stroke="#5A4630" stroke-width="16"/>` +
  `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="#3B3028"/><path d="M120,640 L1480,640 L1540,720 L60,720 Z" fill="#6A4A30"/><path d="M60,720 L1540,720 L1540,760 L60,760 Z" fill="#4E3622"/>`;
export const slips = (x: number, y: number, n: number, s = 1, chars = '', reveal = 1) => {
  let o = `<g transform="translate(${x},${y}) scale(${s})">`;
  for (let i = 0; i < n; i++) o += `<rect x="${i * 34}" y="0" width="28" height="260" rx="4" fill="#D8C08A" stroke="#9C8150" stroke-width="2"/>`;
  o += `<path d="M-6,60 H${n * 34} M-6,200 H${n * 34}" stroke="#6E5530" stroke-width="3"/>`;
  // 竹简上的字：竖着写，一根简从上往下；先写最右边那根，再往左
  const per = 7;
  [...chars].forEach((ch, k) => { const i = n - 1 - Math.floor(k / per), j = k % per; if (i < 0) return; o += `<text x="${i * 34 + 14}" y="${f(36 + j * 31)}" font-size="24" text-anchor="middle" fill="${INK}" opacity="${f(Math.min(1, Math.max(0, reveal * 1.4 - k / chars.length)))}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">${ch}</text>`; });
  return o + '</g>';
};
export const glasses = (x: number, y: number, s = 1, g = 0, shine = 0, light = false) => `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${light ? `<circle cx="0" cy="0" r="150" fill="#9FD3F0" opacity="${f(0.25 + 0.1 * Math.sin(g * 2))}" filter="url(#gl)"/>` : ''}<circle cx="-46" cy="0" r="38" fill="#CFE6F2" fill-opacity="${light ? 0.55 : 0.25}" stroke="${light ? '#BFE3F7' : '#2B2722'}" stroke-width="7"/><circle cx="46" cy="0" r="38" fill="#CFE6F2" fill-opacity="${light ? 0.55 : 0.25}" stroke="${light ? '#BFE3F7' : '#2B2722'}" stroke-width="7"/><path d="M-8,-4 q8,-10 16,0" stroke="${light ? '#BFE3F7' : '#2B2722'}" stroke-width="6" fill="none"/><path d="M-84,-6 l-60,-14 M84,-6 l60,-14" stroke="${light ? '#BFE3F7' : '#2B2722'}" stroke-width="6"/>${shine > 0 ? `<path d="M${f(-70 + shine * 60)},-30 l20,40" stroke="#fff" stroke-width="10" opacity="${f(Math.sin(shine * Math.PI) * 0.9)}"/><path d="M${f(22 + shine * 60)},-30 l20,40" stroke="#fff" stroke-width="10" opacity="${f(Math.sin(shine * Math.PI) * 0.9)}"/>` : ''}<circle cx="0" cy="0" r="${f(110 + wav(g, 2) * 6)}" fill="#9FD3F0" opacity="${f(0.12 + 0.06 * Math.sin(g * 2))}"/></g>`;
/** 坐着的人身下的石头（x、y 是人落脚的点） */
export const seatRock = (x: number, y: number, s: number) => `<path d="M${f(x - 70 * s)},${f(y + 4)} Q${f(x - 66 * s)},${f(y - 46 * s)} ${f(x - 22 * s)},${f(y - 52 * s)} Q${f(x + 16 * s)},${f(y - 54 * s)} ${f(x + 24 * s)},${f(y - 30 * s)} Q${f(x + 30 * s)},${f(y - 8 * s)} ${f(x + 18 * s)},${f(y + 4)} Z" fill="#7A7064" stroke="${INK}" stroke-opacity=".45" stroke-width="2"/><path d="M${f(x - 50 * s)},${f(y - 30 * s)} q20,-8 36,-6" stroke="${INK}" stroke-opacity=".25" stroke-width="2" fill="none"/>`;
export const crowdRow = (seed: number, x0: number, x1: number, y: number, n: number, s: number, g: number, mode: 'idle' | 'laugh' | 'still' | 'gather', u = 1, face?: (x: number) => 1 | -1, gap?: [number, number]) => {
  const r = rng(seed); let o = '';
  const whos = ['crowd1', 'crowd2', 'crowd3', 'crowd4'];
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * (i + r() * 0.6)) / n, ph = r(), who = whos[Math.floor(r() * 4)], fc = face ? face(x) : (r() < 0.5 ? 1 : -1);
    if (gap && x > gap[0] && x < gap[1]) continue; // 前排中间留出空地，让主角露出来
    const pose = mode === 'laugh' ? P.laugh(g * 0.9 + ph) : mode === 'still' ? P.stand() : mode === 'gather' ? P.walk(g * 0.8 + ph, 1 - u) : P.mix(P.stand(), P.point(1), 0.15 + 0.15 * Math.sin(g + ph * 6));
    const dx = mode === 'gather' ? (1 - u) * (x < 800 ? -260 : 260) : 0;
    o += person({ x: x + dx, y: y + r() * 16, s: s * (0.9 + r() * 0.2), who, pose, g, face: fc, a: mode === 'gather' ? Math.min(1, 0.3 + u) : 1, detail: s > 1.4, mood: mode === 'laugh' ? 'laugh' : 'calm' });
  }
  return o;
};

export const SHOTS1: Record<string, ShotDef> = {
  // ---------- 0 读书眼镜翻开《史记》 ----------
  'a.slips': {
    bg: (id) => deskBg(id) + slips(470, 330, 18, 1.2, '淮阴侯韩信者淮阴人也始为布衣时贫无行不得推择为吏'),
    fg: (u, g) => { const k = seg(u, 0, 0.55), shine = seg(u, 0.55, 0.9); return glow('x', 800, 470, 300, g, 0, 0.3) + glasses(800, lerp(-120, 300, k), 1.25, g, shine); },
    cam: [[800, 480, 1300], [800, 470, 1100]],
  },
  'a.inkfly': {
    bg: (id) => sky(id, '#E3E2DA', PAPER),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.7), r = rng(9); let dots = '';
      for (let i = 0; i < 160; i++) { const x0 = 300 + r() * 1000, y0 = 520 + r() * 260, x1 = r() * 1600, y1 = 200 + r() * 300; dots += `<circle cx="${f(lerp(x0, x1, k))}" cy="${f(lerp(y0, y1, k) - Math.sin(k * Math.PI) * 120)}" r="${f(3 + r() * 6)}" fill="${INK}" opacity="${f(0.75 * (1 - k * 0.8))}"/>`; }
      const m = seg(u, 0.35, 1);
      return `<g opacity="${f(1 - seg(u, 0, 0.5))}">${slips(470, 400, 18, 1.2, '淮阴侯韩信者淮阴人也', 1)}</g>` + `<g opacity="${f(m)}">${ridge({ y: 380, amp: 140, seed: 3, a: 0.2 })}${ridge({ y: 460, amp: 80, seed: 5, a: 0.3 })}${river(4, g, { y0: 560, y1: 720, n: 50 })}${mist(id, 8, g, { y: 520, h: 70, a: 0.7 })}</g>` + dots;
    },
    cam: [[800, 520, 1500], [800, 470, 1600]],
  },
  // ---------- 1 淮阴城下，钓鱼的韩信 ----------
  'a.river': {
    bg: (id) => bankBg(id),
    fg: (u, g, id) => bankFg(id, g) + willow(11, g, 260, 720, 1.25) + willow(12, g, 1490, 715, 0.9, 0.6) + reeds(31, g, 520, 760, 712, 22, 60) + seatRock(680, 704, 0.5) + person({ x: 680, y: 704, s: 0.5, who: 'hanxin', pose: P.sit(), g, hold: 'rod' }),
    cam: [[800, 470, 1600], [760, 520, 1350]],
  },
  'a.fisher': {
    bg: (id) => bankBg(id, { wall: false }),
    fg: (u, g, id) => {
      const breathe = Math.sin(g * 1.3) * 1.5;
      return river(2, g, { y0: 520, y1: 700, speed: 20, n: 60 }) + mist(id, 5, g, { y: 480, h: 70, a: 0.5 }) + willow(13, g, 120, 760, 1.6) +
        seatRock(560, 716, 2.3) + person({ x: 560, y: 716 + breathe, s: 2.3, who: 'hanxin', pose: { ...P.sit(), aF: 64, eF: 26, head: 14 }, g, hold: 'rod', detail: true, mood: 'sad' });
    },
    cam: [[820, 520, 1300], [720, 540, 1050]],
  },
  'a.hxface': {
    bg: (id) => bankBg(id, { wall: false }) + `<rect x="-200" y="-200" width="2000" height="1300" fill="${PAPER}" opacity=".35"/>`,
    fg: (u, g, id) => mist(id, 7, g, { y: 300, h: 160, a: 0.35 }) + faceCU({ id, x: 760, y: 430, s: 1.25, who: 'hanxin', g, open: 0.55 + 0.05 * Math.sin(g * 0.8), brow: 0.5, mouth: -0.3, look: 0.3 }),
    cam: [[780, 470, 1200], [800, 450, 1000]],
  },
  // ---------- 2 漂母 ----------
  'a.wash': {
    bg: (id) => bankBg(id, { wall: true, warm: true }),
    fg: (u, g, id) => {
      let o = bankFg(id, g, 7);
      [[420, 0], [640, 0.3], [900, 0.6], [1140, 0.15]].forEach(([x, ph], i) => {
        const w = Math.sin((g * 0.8 + ph) * Math.PI * 2), hx = x + 80, hy = 668 + w * 6;
        // 丝絮在水里：从手里往外一摆一摆
        o += `<path d="M${hx},${f(hy)} q30,${f(-10 - w * 8)} 70,${f(-14 - w * 4)} q30,${f(4 + w * 8)} 70,${f(-8)}" stroke="#F7F4EC" stroke-width="10" fill="none" stroke-linecap="round" opacity=".95"/><path d="M${hx},${f(hy + 6)} q30,${f(-4 - w * 6)} 64,${f(-6)}" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`;
        o += [0, 1].map((j) => { const k = (g * 0.6 + j / 2 + ph) % 1; return `<ellipse cx="${hx + 60}" cy="${f(hy - 6)}" rx="${f(10 + k * 50)}" ry="${f(3 + k * 8)}" fill="none" stroke="${INK}" stroke-opacity="${f(0.35 * (1 - k))}" stroke-width="1.4"/>`; }).join('');
        o += person({ x, y: 704, s: 1.05, who: i === 2 ? 'piaomu' : 'crowd3', pose: P.kneelWash(g * 0.8 + ph), g, face: 1 });
      });
      return o + reeds(33, g, 1300, 1600, 712, 22, 80) + seatRock(180, 704, 0.55) + person({ x: 180, y: 704, s: 0.55, who: 'hanxin', pose: P.sit(), g, hold: 'rod', face: 1 });
    },
    cam: [[800, 560, 1500], [780, 590, 1250]],
  },
  'a.look': {
    bg: (id) => bankBg(id, { wall: false, warm: true }),
    fg: (u, g, id) => {
      const k = seg(u, 0.15, 0.7), pose = P.mix(P.kneelWash(g * 0.8), { ...P.kneelWash(0.25), lean: 18, head: -14, aF: 20, eF: 40, aB: 14, eB: 40 }, k);
      return bankFg(id, g, 9) + `<path d="M1030,716 q40,14 90,8 q30,-6 70,2" stroke="#F7F4EC" stroke-width="16" fill="none" stroke-linecap="round"/>` +
        person({ x: 1000, y: 712, s: 2.2, who: 'piaomu', pose, g, face: -1, detail: true, mood: 'sad' }) + seatRock(300, 704, 0.9) + person({ x: 300, y: 704, s: 0.9, who: 'hanxin', pose: P.sit(), g, hold: 'rod', a: 0.9 });
    },
    cam: [[880, 520, 1300], [920, 530, 1100]],
  },
  'a.bring': {
    bg: (id) => bankBg(id, { wall: false, warm: true }),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.65), x = lerp(1250, 720, k), give = seg(u, 0.65, 0.9);
      const pm = k < 1 ? P.walk(g * 0.9, 0.8) : P.give(give);
      const hx = P.mix(P.sit(), { ...P.sit(), head: -6, aF: 72, eF: 10, aB: 64, eB: 18 }, seg(u, 0.72, 0.95));
      return bankFg(id, g, 10) + seatRock(470, 712, 2) + person({ x: 470, y: 712, s: 2, who: 'hanxin', pose: hx, g, face: 1, detail: true, mood: 'sad' }) + person({ x, y: 712, s: 1.95, who: 'piaomu', pose: pm, g, face: -1, hold: 'bowl', detail: true });
    },
    cam: [[820, 520, 1300], [680, 520, 1150]],
  },
  // ---------- 3 饭信；竟漂数十日 ----------
  'a.bowlhands': {
    bg: (id) => sky(id, '#E9DCC4', '#D8C7A6') + river(3, 0, { y0: 600, y1: 900, n: 40, a: 0.15 }),
    fg: (u, g) => {
      const k = seg(u, 0, 0.55), take = seg(u, 0.5, 0.85), bx = lerp(620, 820, k) + lerp(0, 60, take), by = 430;
      // 一只手掌托着碗底：从左下伸过来（漂母，袖子是褐色的）
      const palm = (x: number, y: number, fc: number, sleeve: string) => `<g transform="translate(${f(x)},${f(y)}) scale(${fc},1)"><path d="M-760,520 Q-420,300 -150,150 L-60,250 Q-330,420 -620,640 Z" fill="${sleeve}" stroke="${INK}" stroke-width="3"/><path d="M-170,140 Q-120,96 -40,96 Q60,100 120,118 Q150,128 140,146 Q110,160 40,156 Q-20,200 -70,236 Q-130,250 -170,200 Z" fill="#EAD9BF" stroke="${INK}" stroke-width="3"/><path d="M-10,104 q30,8 60,6 M0,122 q40,6 80,2 M10,140 q30,4 60,0" stroke="${INK}" stroke-opacity=".45" stroke-width="2" fill="none"/></g>`;
      return palm(bx - 40, by + 30, 1, '#8A7B66') + bowl(bx + 40, by, 4.4, g) + `<g opacity="${f(take)}">${palm(bx + 110 + lerp(180, 0, take), by + 50, -1, '#6E7378')}</g>`;
    },
    cam: [[820, 500, 1300], [860, 490, 1150]],
  },
  'a.days': {
    bg: (id) => sky(id, '#E3E0D6', PAPER) + ridge({ y: 330, amp: 110, seed: 3, a: 0.15 }) + cityWall(1000, 470, 500, 0.9, 0.5) + `<path d="M-200,480 Q500,455 1800,470 L1800,1100 L-200,1100 Z" fill="#CFC8B6" opacity=".55"/><path d="M-200,700 Q800,680 1800,708 L1800,1100 L-200,1100 Z" fill="#C9B994"/>`,
    fg: (u, g, id) => {
      const cyc = u * 3.2, ph = cyc % 1, day = Math.sin(ph * Math.PI);
      const sx = lerp(100, 1500, ph), sy = 360 - Math.sin(ph * Math.PI) * 260;
      const dark = `<rect x="-200" y="-200" width="2000" height="1300" fill="#1F2230" opacity="${f(0.55 * (1 - day))}"/>`;
      const walk = lerp(1300, 700, (ph * 2) % 1);
      return river(6, g * 3, { y0: 525, y1: 700, n: 60 }) + sunDisc(id, sx, sy, 46, '#C8452F', day) + moon(id, lerp(1500, 100, ph), 200, 34, 1 - day) + dark +
        seatRock(640, 704, 0.75) + person({ x: 640, y: 704, s: 0.75, who: 'hanxin', pose: P.sit(), g, hold: 'rod' }) + person({ x: walk, y: 712, s: 0.72, who: 'piaomu', pose: P.walk(g * 1.4), g, face: -1, hold: 'bowl', a: f(0.4 + 0.6 * day) }) +
        `<text x="1440" y="140" font-size="44" text-anchor="end" fill="${INK}" opacity=".7" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">第 ${Math.min(30, Math.floor(u * 30) + 1)} 天</text>`;
    },
    cam: [[800, 470, 1600], [800, 480, 1500]],
  },
  // ---------- 4 韩信作揖 ----------
  'a.thank': {
    bg: (id) => bankBg(id, { wall: false, warm: true }),
    fg: (u, g, id) => {
      const up = seg(u, 0, 0.3), bow = seg(u, 0.35, 0.75);
      const hx = up < 1 ? P.mix(P.sit(), P.stand(), up) : P.bow(bow);
      return bankFg(id, g, 11) + seatRock(560, 712, 2.2) + person({ x: 620, y: 712, s: 2.2, who: 'hanxin', pose: hx, g, face: 1, detail: true }) + person({ x: 1050, y: 712, s: 2.05, who: 'piaomu', pose: P.stand(), g, face: -1, hold: 'basket', detail: true });
    },
    cam: [[830, 470, 1250], [830, 480, 1150]],
  },
  // ---------- 5 漂母：大丈夫不能自食 ----------
  'a.pmface': {
    bg: (id) => sky(id, '#E9DCC4', '#D8C7A6') + river(3, 0, { y0: 600, y1: 900, n: 30, a: 0.12 }),
    fg: (u, g, id) => faceCU({ id, x: 800, y: 440, s: 1.25, face: -1, who: 'piaomu', g, open: 0.75, brow: -0.6, mouth: -0.6, shake: seg(u, 0.3, 0.8) > 0 && seg(u, 0.3, 0.8) < 1 ? 1 : 0 }),
    cam: [[800, 470, 1150], [800, 460, 1050]],
  },
  'a.leave': {
    bg: (id) => bankBg(id, { wall: false, warm: true }),
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 1), x = lerp(1000, 1500, k);
      return bankFg(id, g, 12) + person({ x: 600, y: 712, s: 2.15, who: 'hanxin', pose: { ...P.stand(), head: 10, aF: 20, eF: 30 }, g, face: 1, detail: true, mood: 'sad' }) + person({ x, y: 712, s: 2, who: 'piaomu', pose: P.walk(g * 0.9, 0.9), g, face: 1, hold: 'basket' });
    },
    cam: [[820, 480, 1300], [880, 480, 1350]],
  },
  // ---------- 6 楚王韩信，千金报恩 ----------
  'a.parade': {
    bg: (id) => sky(id, '#EAD9BE', PAPER) + ridge({ y: 330, amp: 110, seed: 3, a: 0.15 }) + cityWall(700, 560, 700, 1.2, 0.7) + `<path d="M-200,560 L1800,560 L1800,1100 L-200,1100 Z" fill="#CDBF9F"/>`,
    fg: (u, g) => {
      let o = '';
      const off = lerp(-500, 150, seg(u, 0, 1));
      for (let i = 0; i < 9; i++) { const x = off + i * 110; o += banner(x + 20, 690, 1, g, i % 3 === 0 ? RED : '#2F4A5A', i % 3 === 0 ? '楚' : '', i * 0.13) + person({ x, y: 700, s: 1, who: 'soldier', pose: P.walk(g * 1.1 + i * 0.3), g, face: 1, hold: 'spear' }); }
      o += horse({ x: off + 1050, y: 720, s: 1.1, g, gait: 'walk', ph: g * 0.9, c: '#E9DFCB', spots: false, rider: 'king', riderPose: { ...P.sit(), lF: 80, kF: 70, aF: 60, eF: 20 } });
      return o;
    },
    cam: [[800, 520, 1600], [900, 540, 1450]],
  },
  'a.gift': {
    bg: (id) => sky(id, '#EAD9BE', PAPER) + cityWall(600, 520, 800, 1.1, 0.45) + `<path d="M-200,520 L1800,520 L1800,1100 L-200,1100 Z" fill="#CDBF9F"/>`,
    fg: (u, g) => {
      const k = seg(u, 0, 0.6), cx = lerp(1500, 980, k);
      const chest = `<g transform="translate(${f(cx)},700)"><rect x="-80" y="-60" width="160" height="70" fill="#7A3B26" stroke="${INK}" stroke-width="3"/><rect x="-86" y="-74" width="172" height="20" fill="#5E2A1A"/><circle cx="0" cy="-30" r="8" fill="${GOLD}"/></g>`;
      return person({ x: cx - 120, y: 712, s: 1.8, who: 'soldier', pose: P.walk(g * 0.9, 1 - k), g, face: -1 }) + chest + person({ x: cx + 120, y: 712, s: 1.8, who: 'soldier', pose: P.walk(g * 0.9 + 0.5, 1 - k), g, face: -1 }) +
        banner(300, 700, 1.4, g, RED, '楚') + person({ x: 520, y: 712, s: 2.15, who: 'king', pose: P.mix(P.stand(), P.give(1), seg(u, 0.6, 0.9)), g, face: 1, detail: true }) +
        person({ x: 800, y: 712, s: 1.9, who: 'piaomu', pose: { ...P.stand(), lean: 14, head: 10, aF: 20, eF: 50 }, g, face: -1, detail: true, mood: 'shock' });
    },
    cam: [[820, 500, 1300], [760, 500, 1150]],
  },
  'a.gold': {
    bg: (id) => sky(id, '#3A2E26', '#5A4636'),
    fg: (u, g, id) => {
      const open = seg(u, 0, 0.45);
      let o = `<rect x="460" y="460" width="680" height="300" fill="#7A3B26" stroke="${INK}" stroke-width="5"/><rect x="460" y="460" width="680" height="300" fill="#000" opacity=".15"/>`;
      o += glow(id, 800, 470, 520 * open, g, 0, open);
      const r = rng(4);
      for (let i = 0; i < 26; i++) { const x = 520 + r() * 560, y = 470 - r() * 90 * open; o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="46" ry="18" fill="url(#${id}gold)" stroke="#7A5A1E" stroke-width="2" opacity="${f(Math.min(1, open * 3))}"/>`; }
      for (let i = 0; i < 7; i++) { const x = 520 + ((i * 97) % 560), y = 420 - ((i * 53) % 90), tw = Math.max(0, Math.sin(g * 3 + i * 1.7)); o += `<path d="M${x},${f(y - 24 * tw)} L${x + 5},${y} L${x},${f(y + 24 * tw)} L${x - 5},${y} Z M${f(x - 24 * tw)},${y} L${x},${y + 5} L${f(x + 24 * tw)},${y} L${x},${y - 5} Z" fill="#FFF6D0" opacity="${f(tw * open)}"/>`; }
      o += `<g transform="rotate(${f(-100 * open)} 460 460)"><rect x="460" y="${f(400)}" width="680" height="60" fill="#5E2A1A" stroke="${INK}" stroke-width="5"/></g>`;
      return o;
    },
    cam: [[800, 520, 1100], [800, 500, 900]],
  },
  // ---------- 7 一饭千金：一杆秤 ----------
  'a.scale': {
    bg: (id) => sky(id, '#EFE6D3', '#E2D5BA'),
    fg: (u, g, id) => {
      const settle = seg(u, 0, 0.8), ang = Math.sin(u * 12) * 14 * (1 - settle);
      const L = [-360, 0], R = [360, 0], rotP = (p: number[]) => { const a = (ang * Math.PI) / 180; return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
      const l = rotP(L), r = rotP(R);
      const pan = (p: number[], inner: string) => `<g transform="translate(${f(800 + p[0])},${f(330 + p[1])})"><path d="M0,0 L-90,170 M0,0 L90,170" stroke="${INK}" stroke-width="3"/><path d="M-120,170 Q0,220 120,170 Z" fill="#8A7A5A" stroke="${INK}" stroke-width="3"/>${inner}</g>`;
      let goldPile = ''; const rr = rng(6); for (let i = 0; i < 14; i++) goldPile += `<ellipse cx="${f(-70 + rr() * 140)}" cy="${f(158 - rr() * 60)}" rx="34" ry="13" fill="url(#${id}gold)" stroke="#7A5A1E" stroke-width="2"/>`;
      return `<path d="M800,330 L800,860" stroke="#5A4630" stroke-width="16"/><path d="M700,860 h200" stroke="#5A4630" stroke-width="20"/>` +
        `<path d="M${f(800 + l[0])},${f(330 + l[1])} L${f(800 + r[0])},${f(330 + r[1])}" stroke="#5A4630" stroke-width="14" stroke-linecap="round"/><circle cx="800" cy="330" r="16" fill="${GOLD}"/>` +
        pan(l, `<g transform="translate(0,136)">${bowl(0, 0, 1.6, g)}</g>`) + pan(r, goldPile) +
        `<text x="${f(800 + l[0])}" y="${f(330 + l[1] + 300)}" font-size="56" text-anchor="middle" fill="${INK}" opacity="${f(settle)}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">一饭</text><text x="${f(800 + r[0])}" y="${f(330 + r[1] + 300)}" font-size="56" text-anchor="middle" fill="${RED}" opacity="${f(settle)}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">千金</text>`;
    },
    cam: [[800, 520, 1400], [800, 520, 1300]],
  },
  // ---------- 8 街市，屠户少年拦路 ----------
  'a.street': {
    bg: (id) => streetBg(id),
    fg: (u, g) => {
      const x = lerp(-80, 760, seg(u, 0, 1));
      return meat(g) + crowdRow(41, 120, 1500, 640, 9, 1.05, g, 'idle') + person({ x, y: 712, s: 1.35, who: 'hanxin', pose: P.walk(g * 0.9), g, face: 1 }) + person({ x: 1380, y: 640, s: 1.2, who: 'tuhu', pose: P.akimbo(), g, face: -1 });
    },
    cam: [[800, 470, 1600], [820, 500, 1350]],
  },
  'a.block': {
    bg: (id) => streetBg(id),
    fg: (u, g) => {
      const k = seg(u, 0, 0.55), tx = lerp(1360, 1040, k);
      const tp = k < 1 ? P.walk(g * 1.1, 1) : P.akimbo();
      const hx = P.mix(P.walk(g * 0.9), P.stand(), seg(u, 0.3, 0.6));
      return meat(g) + person({ x: 660, y: 712, s: 2.1, who: 'hanxin', pose: hx, g, face: 1, detail: true }) + person({ x: tx, y: 712, s: 2.3, who: 'tuhu', pose: tp, g, face: -1, detail: true, mood: 'sneer' });
    },
    cam: [[850, 470, 1300], [860, 470, 1150]],
  },
  'a.tuface': {
    bg: (id) => streetBg(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="${PAPER}" opacity=".4"/>`,
    fg: (u, g, id) => {
      const jab = Math.max(0, Math.sin(g * 5)) * 18 * seg(u, 0.2, 0.4);
      // 屠户在右边、脸朝左（对着韩信），手指头一下一下戳过来
      return faceCU({ id, x: 980, y: 440, s: 1.25, face: -1, who: 'tuhu', g, open: 0.5, brow: -0.9, mouth: -0.2, look: 0.6 }) +
        `<g transform="translate(${f(660 - jab)},560) scale(-1,1)"><path d="M-260,260 Q-150,90 0,10 L20,60 Q-110,150 -190,300 Z" fill="#4A3F36" stroke="${INK}" stroke-width="3"/><path d="M0,10 Q20,-14 56,-4 Q76,4 72,30 Q66,56 40,60 Q14,62 20,60 Z" fill="#EAD9BF" stroke="${INK}" stroke-width="3"/><path d="M60,2 L160,-6 Q174,0 160,10 L66,20 Z" fill="#EAD9BF" stroke="${INK}" stroke-width="3"/><path d="M40,22 q14,4 26,0 M38,40 q14,4 26,0" stroke="${INK}" stroke-opacity=".5" stroke-width="2" fill="none"/></g>`;
    },
    cam: [[800, 470, 1250], [780, 470, 1150]],
  },
  // ---------- 10 对峙（眼镜看译文） ----------
  'a.standoff': {
    bg: (id) => streetBg(id),
    fg: (u, g) => meat(g) + crowdRow(44, 100, 1500, 640, 8, 1.1, g, 'idle', 1, (x) => (x < 800 ? 1 : -1)) + person({ x: 620, y: 712, s: 2.1, who: 'hanxin', pose: P.stand(), g, face: 1, detail: true }) + person({ x: 1040, y: 712, s: 2.3, who: 'tuhu', pose: P.point(1), g, face: -1, detail: true, mood: 'sneer' }),
    cam: [[830, 470, 1300], [830, 470, 1250]],
  },
  // ---------- 11 胯下 ----------
  'a.dare': {
    bg: (id) => streetBg(id),
    fg: (u, g) => {
      const k = seg(u, 0, 0.5), slap = seg(u, 0.5, 0.65);
      const tp = k < 1 ? P.mix(P.akimbo(), { ...P.akimbo(), aF: 60, eF: 70 }, Math.sin(k * Math.PI)) : P.legsApart(slap);
      return meat(g) + person({ x: 1000, y: 712, s: 2.4, who: 'tuhu', pose: tp, g, face: -1, detail: true, mood: 'sneer' }) + person({ x: 560, y: 712, s: 2.1, who: 'hanxin', pose: P.stand(), g, face: 1, detail: true, mood: 'calm' });
    },
    cam: [[820, 470, 1250], [880, 480, 1100]],
  },
  'a.crowd': {
    bg: (id) => streetBg(id),
    fg: (u, g) => {
      const k = seg(u, 0, 0.9);
      return meat(g) + crowdRow(47, 80, 1520, 650, 12, 1.05, g, 'gather', k, (x) => (x < 800 ? 1 : -1)) + person({ x: 700, y: 712, s: 1.35, who: 'hanxin', pose: P.stand(), g, face: 1 }) + person({ x: 900, y: 712, s: 1.45, who: 'tuhu', pose: P.legsApart(1), g, face: -1 }) + crowdRow(48, 60, 1540, 770, 10, 1.25, g, 'gather', k, (x) => (x < 800 ? 1 : -1), [420, 1180]);
    },
    cam: [[800, 520, 1600], [800, 560, 1400]],
  },
  // ---------- 12 满街安静，孰视 ----------
  'a.hush': {
    bg: (id) => streetBg(id),
    fg: (u, g) => {
      const lx = lerp(1700, -100, u), ly = 380 + Math.sin(u * 9) * 40;
      return meat(0) + crowdRow(47, 80, 1520, 650, 12, 1.05, 0, 'still', 1, (x) => (x < 800 ? 1 : -1)) + person({ x: 700, y: 712, s: 1.35, who: 'hanxin', pose: P.stand(), g: 0, face: 1 }) + person({ x: 900, y: 712, s: 1.45, who: 'tuhu', pose: P.legsApart(1), g: 0, face: -1 }) + crowdRow(48, 60, 1540, 770, 10, 1.25, 0, 'still', 1, (x) => (x < 800 ? 1 : -1), [420, 1180]) +
        `<path d="M${f(lx)},${f(ly)} q14,-10 26,0 q-12,10 -26,0 z" fill="#8C6A3A" transform="rotate(${f(u * 600)} ${f(lx + 13)} ${f(ly)})"/>` + `<path d="M${f(lx + 40)},${f(ly + 10)} q120,-20 260,6" stroke="${INK}" stroke-opacity=".12" stroke-width="2" fill="none"/>`;
    },
    cam: [[800, 540, 1450], [800, 540, 1400]],
  },
  'a.eyes': {
    bg: (id) => sky(id, '#3A3632', '#5A524A'),
    fg: (u, g, id) => faceCU({ id, x: 600, y: 520, s: 2.4, who: 'hanxin', g, open: lerp(1, 0.35, seg(u, 0.1, 0.7)) * (Math.abs(Math.sin(g * 0.5)) > 0.995 ? 0.1 : 1), brow: lerp(0, -0.7, seg(u, 0.1, 0.7)), mouth: -0.4, look: 1 }),
    cam: [[920, 450, 900], [960, 440, 760]],
  },
  'a.grip': {
    bg: (id) => sky(id, '#3A3632', '#5A524A'),
    fg: (u, g) => swordHand(820, 470, 1.6, Math.sin(seg(u, 0, 1) * Math.PI) * 1.0 + 0.1 * seg(u, 0.8, 1), g),
    cam: [[800, 470, 1300], [820, 470, 1150]],
  },
  // ---------- 14 胯下之辱 ----------
  'a.crawl': {
    bg: (id) => streetBg(id),
    fg: (u, g) => {
      const down = seg(u, 0, 0.25), mv = seg(u, 0.25, 1);
      const hp = down < 1 ? P.mix(P.stand(), P.crawl(0), down) : P.crawl(mv * 3);
      return meat(g) + crowdRow(49, 60, 1540, 650, 10, 1.1, g, 'idle', 1, (x) => (x < 800 ? 1 : -1)) +
        person({ x: lerp(560, 1160, mv), y: 712, s: 2, who: 'hanxin', pose: hp, g, face: 1, detail: true, mood: 'sad' }) +
        person({ x: 900, y: 712, s: 2.4, who: 'tuhu', pose: P.legsApart(1), g, face: -1, detail: true, mood: 'laugh' });
    },
    cam: [[860, 520, 1300], [900, 540, 1150]],
  },
  'a.laugh': {
    bg: (id) => streetBg(id),
    fg: (u, g) => meat(g) + crowdRow(51, 60, 1540, 650, 12, 1.15, g, 'laugh', 1, (x) => (x < 800 ? 1 : -1)) + person({ x: 860, y: 712, s: 1.5, who: 'tuhu', pose: P.laugh(g), g, face: -1, mood: 'laugh' }) + person({ x: 1180, y: 712, s: 1.3, who: 'hanxin', pose: { ...P.stand(), head: 20 }, g, face: 1 }) + crowdRow(52, 40, 1560, 790, 10, 1.35, g, 'laugh', 1, (x) => (x < 800 ? 1 : -1), [520, 1300]),
    cam: [[800, 540, 1600], [820, 560, 1450]],
  },
  // ---------- 15 当时笑他，后来夸他 ----------
  'a.split': {
    bg: (id) => sky(id, '#EADCC8', '#E3D8C2') + `<rect x="800" y="-200" width="1000" height="1300" fill="#E1E6DA"/><path d="M800,-200 L800,1100" stroke="${INK}" stroke-width="4" stroke-dasharray="14 10" opacity=".5"/>` +
      `<text x="400" y="160" font-size="60" text-anchor="middle" fill="${RED}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">当时</text><text x="1200" y="160" font-size="60" text-anchor="middle" fill="#2E7A50" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">后来</text>`,
    fg: (u, g) => crowdRow(53, 60, 740, 700, 5, 1.6, g, 'laugh', 1, () => 1) +
      [940, 1180, 1420].map((x, i) => person({ x, y: 700, s: 1.6, who: i === 1 ? 'poetSong' : 'poetTang', pose: { ...P.stand(), aF: 70, eF: 30, head: 8 + 6 * Math.sin(g + i) }, g, face: i === 2 ? -1 : 1, hold: 'scroll' })).join(''),
    cam: [[800, 470, 1600], [800, 470, 1560]],
  },
  // ---------- 16、17 夜里，眼镜写小结 ----------
  'a.desk': {
    bg: (id) => deskBg(id) + slips(560, 470, 14, 0.62, '通过胯下之辱使韩信懂得了忍耐的重要'),
    fg: (u, g, id) => glow(id, 1280, 560, 140, g) + flame(1280, 600, 1.6, g) + `<rect x="1262" y="600" width="36" height="40" fill="#8A6A3A"/>` + `<defs><filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter></defs>` + glasses(820, lerp(410, 390, (Math.sin(g * 1.4) + 1) / 2), 0.8, g, (g * 0.3) % 1, true),
    cam: [[800, 520, 1300], [820, 520, 1150]],
  },
  // ---------- 18 大泽乡起兵；韩信离开淮阴 ----------
  'a.revolt': {
    bg: (id) => sky(id, '#2A2A30', '#45434A') + ridge({ y: 420, amp: 120, seed: 61, a: 0.5, color: '#1C1C22' }) + `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#2E2C30"/>` + vtext(120, 120, '揭竿而起', 48, '#E9DFCB', 0.75),
    fg: (u, g, id) => {
      let o = '';
      for (let i = 0; i < 14; i++) { const x = 160 + i * 100, up = seg(u, i * 0.03, 0.4 + i * 0.03); o += person({ x, y: 700 + (i % 2) * 30, s: 1.3, who: 'rebel', pose: P.cheer(g * 1.2 + i * 0.2), g, face: i < 7 ? 1 : -1, hold: i % 3 === 0 ? 'pole' : i % 3 === 1 ? 'torch' : undefined, a: up }); }
      for (let i = 0; i < 6; i++) o += torch(id, 220 + i * 230, 560 - (i % 2) * 30, 1.3, g, i * 0.2);
      return o + rain(71, g, 160, 0.35);
    },
    cam: [[800, 470, 1600], [800, 520, 1400]],
  },
  'a.depart': {
    bg: (id) => bankBg(id, { wall: true }),
    fg: (u, g, id) => {
      const k = seg(u, 0, 1), x = lerp(1200, 160, k), s = lerp(1.1, 0.45, k), y = lerp(712, 600, k);
      return bankFg(id, g, 14) + mist(id, 15, g, { y: 600, h: 120, a: 0.75, n: 9, speed: 12 }) + willow(16, g, 1480, 760, 1.4) + person({ x, y, s, who: 'hanxin', pose: P.walk(g * 0.8), g, face: -1 }) + mist(id, 17, g, { y: 700, h: 80, a: 0.6, n: 6, speed: 18 });
    },
    cam: [[800, 520, 1500], [700, 520, 1600]],
  },
};
export const W1 = { WW, WH };
