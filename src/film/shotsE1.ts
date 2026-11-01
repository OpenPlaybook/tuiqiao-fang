// 英文第一章 Gone!：每一镜怎么画、怎么动（对照 第六堂课/分镜/英文第一章_Gone.md）
// 现代的学校：礼堂（舞台、红幕、横幅、一排排学生的后脑勺）、后台的桌子和金熊猫、钟、走廊、门卫室、手机里的球赛、纸条、线索板。
import { GOLD, INK, RED, SKIN, clamp, f, glow, lerp, pin, rng, seg, sky, wav, type View } from './core';
import { P, faceCU, person } from './rig';
import type { ShotDef } from './Film';

const HAND = `style="font-family:'Bradley Hand','Segoe Print','Comic Sans MS',cursive"`;
const SANS = `style="font-family:'Helvetica Neue',Arial,sans-serif"`;

// ---------------- 礼堂 ----------------
/** 礼堂正面：后墙、舞台、红幕、横幅、顶灯；dark 0—1 是停电时暗下来 */
const hallBg = (id: string) =>
  sky(id, '#E9DCC2', '#D9C6A4') +
  // 两边的墙、窗
  `<path d="M-200,-200 L260,40 L260,560 L-200,760 Z" fill="#D2BE98"/><path d="M1800,-200 L1340,40 L1340,560 L1800,760 Z" fill="#D2BE98"/>` +
  [0, 1].map((i) => `<path d="M${-60 + i * 150},${f(60 + i * 40)} L${30 + i * 150},${f(100 + i * 36)} L${30 + i * 150},${f(420 - i * 10)} L${-60 + i * 150},${f(450 - i * 16)} Z" fill="#BFD6DE" opacity=".8"/><path d="M${1660 - i * 150},${f(60 + i * 40)} L${1570 - i * 150},${f(100 + i * 36)} L${1570 - i * 150},${f(420 - i * 10)} L${1660 - i * 150},${f(450 - i * 16)} Z" fill="#BFD6DE" opacity=".8"/>`).join('') +
  // 舞台
  `<rect x="260" y="40" width="1080" height="420" fill="#CDB892"/>` +
  `<path d="M300,40 L1300,40 L1300,96 Q800,130 300,96 Z" fill="#8E2A26"/>` +
  `<path d="M260,40 Q310,250 290,470 L410,470 Q380,250 420,40 Z" fill="#9E2E2A"/><path d="M1340,40 Q1290,250 1310,470 L1190,470 Q1220,250 1180,40 Z" fill="#9E2E2A"/>` +
  Array.from({ length: 5 }, (_, i) => `<path d="M${280 + i * 28},50 Q${300 + i * 26},260 ${290 + i * 24},466" stroke="#7A221F" stroke-width="3" fill="none" opacity=".6"/><path d="M${1320 - i * 28},50 Q${1300 - i * 26},260 ${1310 - i * 24},466" stroke="#7A221F" stroke-width="3" fill="none" opacity=".6"/>`).join('') +
  `<rect x="540" y="140" width="520" height="70" rx="8" fill="#2F5DA8"/><text x="800" y="187" font-size="40" font-weight="900" fill="#FFF6DD" text-anchor="middle" letter-spacing="4" ${SANS}>ENGLISH FESTIVAL</text>` +
  `<path d="M240,460 L1360,460 L1400,500 L200,500 Z" fill="#8C6440"/><rect x="200" y="500" width="1200" height="34" fill="#6E4C30"/>` +
  // 地板
  `<path d="M-200,534 L1800,534 L1800,1100 L-200,1100 Z" fill="#B78C5C"/>` + Array.from({ length: 16 }, (_, i) => `<path d="M${f(800 + (i - 7.5) * 60)},534 L${f(800 + (i - 7.5) * 260)},1100" stroke="#9C7448" stroke-width="2" opacity=".5"/>`).join('');
/** 顶灯：一排灯（停电时灭） */
const hallLights = (id: string, g: number, on: number) =>
  [380, 620, 980, 1220].map((x, i) => `<rect x="${x - 40}" y="-10" width="80" height="18" rx="6" fill="${on > 0.5 ? '#FFF4D2' : '#6A6458'}"/>` + (on > 0.5 ? glow(id, x, 10, 120, g, i, 0.5 * on) : '')).join('');
/** 坐着的学生，从后面看：一排排后脑勺和肩膀（越往前越大）；turn 往右边扭头的程度 */
const audience = (seed: number, g: number, o: { rows?: number; turn?: number; y0?: number; gap?: [number, number] } = {}) => {
  const r = rng(seed); let s = '';
  const rows = o.rows ?? 5, y0 = o.y0 ?? 560;
  for (let k = 0; k < rows; k++) {
    const t = k / Math.max(1, rows - 1), y = lerp(y0, 960, t), sc = lerp(0.55, 1.25, t), n = Math.round(lerp(18, 9, t));
    for (let i = 0; i < n; i++) {
      const x = lerp(-60, 1660, (i + 0.5 + (r() - 0.5) * 0.3) / n);
      if (o.gap && x > o.gap[0] && x < o.gap[1] && k >= rows - 2) continue;
      const girl = r() < 0.45, bob = wav(g, 2.6 + r(), r()) * 2 * sc, tw = (o.turn ?? 0) * (14 + r() * 8) * sc;
      s += `<g transform="translate(${f(x)},${f(y + bob)}) scale(${f(sc)})">`;
      s += `<path d="M-44,90 Q-46,30 -18,22 L18,22 Q46,30 44,90 Z" fill="#2F5DA8"/><path d="M-18,22 L0,40 L18,22" stroke="#F4F4F0" stroke-width="4" fill="none"/>`;
      s += `<ellipse cx="${f(tw * 0.3)}" cy="0" rx="22" ry="25" fill="${SKIN}"/><path d="M${f(-22 + tw * 0.2)},4 Q${f(-24 + tw * 0.3)},-28 ${f(tw * 0.3)},-27 Q${f(24 + tw * 0.3)},-28 ${f(22 + tw * 0.4)},4 Q${f(tw * 0.3)},${f(18 - tw * 0.3)} ${f(-22 + tw * 0.2)},4 Z" fill="#1E1A18"/>`;
      if (girl) s += `<path d="M${f(-6 + tw * 0.2)},14 q-4,26 4,40 q8,-12 4,-40 z" fill="#1E1A18"/>`;
      s += `</g>`;
    }
  }
  return s;
};
/** 金熊猫奖杯：木座 + 金色熊猫；shine 一道光扫过 */
const trophy = (id: string, x: number, y: number, s: number, g: number, shine = 1) => {
  let o = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
  o += `<rect x="-60" y="-34" width="120" height="34" rx="4" fill="#4A2E1E"/><rect x="-46" y="-50" width="92" height="18" rx="3" fill="#5E3C26"/><rect x="-30" y="-26" width="60" height="12" fill="${GOLD}" opacity=".9"/>`;
  o += `<ellipse cx="0" cy="-104" rx="44" ry="52" fill="url(#${id}gold)"/><circle cx="0" cy="-172" r="32" fill="url(#${id}gold)"/>`;
  o += `<circle cx="-25" cy="-199" r="12" fill="#7A5214"/><circle cx="25" cy="-199" r="12" fill="#7A5214"/><ellipse cx="-13" cy="-172" rx="10" ry="13" fill="#7A5214" transform="rotate(-28 -13 -172)"/><ellipse cx="13" cy="-172" rx="10" ry="13" fill="#7A5214" transform="rotate(28 13 -172)"/><circle cx="-11" cy="-173" r="3.6" fill="#FFF1B8"/><circle cx="11" cy="-173" r="3.6" fill="#FFF1B8"/><ellipse cx="0" cy="-157" rx="6" ry="4" fill="#5E3E10"/><path d="M-5,-150 q5,4 10,0" stroke="#5E3E10" stroke-width="2" fill="none"/>`;
  o += `<ellipse cx="0" cy="-96" rx="26" ry="32" fill="#F4D27A" opacity=".55"/><ellipse cx="-36" cy="-114" rx="13" ry="26" fill="#8A5E18" transform="rotate(22 -36 -114)"/><ellipse cx="36" cy="-114" rx="13" ry="26" fill="#8A5E18" transform="rotate(-22 36 -114)"/><ellipse cx="-22" cy="-56" rx="17" ry="11" fill="#8A5E18"/><ellipse cx="22" cy="-56" rx="17" ry="11" fill="#8A5E18"/>`;
  // 一道光扫过、星星一闪
  const k = (g * 0.35) % 1;
  o += `<clipPath id="${id}tc"><ellipse cx="0" cy="-104" rx="44" ry="52"/><circle cx="0" cy="-172" r="32"/></clipPath><rect x="${f(-120 + k * 240)}" y="-220" width="22" height="240" fill="#FFFDF0" opacity="${f(0.5 * shine)}" transform="rotate(20 0 -110)" clip-path="url(#${id}tc)"/>`;
  const tw = Math.max(0, Math.sin(g * 2.3)) * shine;
  o += `<path d="M30,-190 l4,12 l12,4 l-12,4 l-4,12 l-4,-12 l-12,-4 l12,-4 z" fill="#FFFDF0" opacity="${f(tw)}" transform="scale(${f(0.6 + tw * 0.6)})"/>`;
  return o + '</g>';
};
/** 铺着蓝丝绒的桌子（x 是中心，y 是桌面） */
const table = (x: number, y: number, w = 420, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M${-w / 2},0 L${w / 2},0 L${w / 2 + 10},120 L${-w / 2 - 10},120 Z" fill="#23386A"/><path d="M${-w / 2 - 10},120 L${w / 2 + 10},120" stroke="${GOLD}" stroke-width="8" stroke-dasharray="6 5"/><rect x="${-w / 2 - 6}" y="-12" width="${w + 12}" height="14" rx="4" fill="#2E4680"/><rect x="${-w / 2 + 30}" y="120" width="16" height="70" fill="#4A2E1E"/><rect x="${w / 2 - 46}" y="120" width="16" height="70" fill="#4A2E1E"/></g>`;
/** 挂钟：hh、mm 是时间（秒针一直在走） */
const clock = (x: number, y: number, r: number, hh: number, mm: number, g: number) => {
  const ma = (mm / 60) * 360, ha = ((hh % 12) / 12) * 360 + mm * 0.5, sa = (g % 60) * 6;
  const hand = (a: number, l: number, w: number, c: string) => `<line x1="0" y1="0" x2="${f(Math.sin((a * Math.PI) / 180) * l)}" y2="${f(-Math.cos((a * Math.PI) / 180) * l)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  let o = `<g transform="translate(${x},${y})"><circle r="${r + 10}" fill="#3A3A40"/><circle r="${r}" fill="#FBF8F0"/>`;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; o += `<line x1="${f(Math.sin(a) * r * 0.82)}" y1="${f(-Math.cos(a) * r * 0.82)}" x2="${f(Math.sin(a) * r * 0.94)}" y2="${f(-Math.cos(a) * r * 0.94)}" stroke="${INK}" stroke-width="${i % 3 ? 3 : 6}"/>`; }
  o += hand(ha, r * 0.5, r * 0.07, INK) + hand(ma, r * 0.76, r * 0.05, INK) + hand(sa, r * 0.82, 2, RED) + `<circle r="${f(r * 0.06)}" fill="${INK}"/></g>`;
  return o;
};
/** 双开门：open 0—1；门开时射进一道光 */
const door = (x: number, y: number, open: number, s = 1) => {
  const w = 90 * s, h = 230 * s;
  let o = `<rect x="${f(x - w)}" y="${f(y - h)}" width="${f(2 * w)}" height="${f(h)}" fill="${open > 0.05 ? '#FFF4D8' : '#5A3E28'}"/>`;
  if (open > 0.05) o += `<path d="M${f(x - w)},${y} L${f(x + w)},${y} L${f(x + w * 3)},${f(y + 260 * s)} L${f(x - w * 3)},${f(y + 260 * s)} Z" fill="#FFF4D8" opacity="${f(0.35 * open)}"/>`;
  const leaf = (sgn: number) => { const k = 1 - 0.8 * open, x0 = x + sgn * w, x1 = x0 - sgn * w * k; return `<path d="M${f(x0)},${f(y - h)} L${f(x1)},${f(y - h + 14 * open * s)} L${f(x1)},${f(y - 14 * open * s)} L${f(x0)},${y} Z" fill="#7A5236" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><rect x="${f(lerp(x0, x1, 0.4) - 8 * s)}" y="${f(y - h * 0.8)}" width="${f(16 * s)}" height="${f(50 * s)}" fill="#BFD6DE" opacity="${f(0.8 - 0.4 * open)}"/>`; };
  return o + leaf(-1) + leaf(1) + `<rect x="${f(x - w - 8 * s)}" y="${f(y - h - 10 * s)}" width="${f(2 * w + 16 * s)}" height="${f(10 * s)}" fill="#4A3020"/>`;
};
/** 后台：幕布后面的墙、灯 */
const backstageBg = (id: string) =>
  sky(id, '#4A3A34', '#5E4A40') + `<path d="M-200,-200 Q100,300 60,900 L-200,900 Z" fill="#7A221F"/><path d="M1800,-200 Q1500,300 1540,900 L1800,900 Z" fill="#7A221F"/>` +
  Array.from({ length: 6 }, (_, i) => `<path d="M${-120 + i * 30},-100 Q${-40 + i * 28},380 ${-80 + i * 26},900" stroke="#5E1A18" stroke-width="4" fill="none" opacity=".6"/>`).join('') +
  `<rect x="200" y="120" width="300" height="200" fill="#3A2E2A"/><rect x="220" y="140" width="260" height="160" fill="#2C2420"/><text x="350" y="232" font-size="28" fill="#8A7A6A" text-anchor="middle" ${SANS}>BACKSTAGE</text>` +
  `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#6E4C30"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M-200,${660 + i * 26} L1800,${660 + i * 26}" stroke="#5E3E26" stroke-width="2" opacity=".5"/>`).join('');

// ---------------- 校园 ----------------
/** 走廊：左边窗户（阳光一格格落在地上），右边墙上的海报、教室门 */
const corridorBg = (id: string, sepia = false) =>
  sky(id, sepia ? '#D9C7A6' : '#EDE6D6', sepia ? '#C9B48E' : '#DCD3C0') +
  `<path d="M-200,620 L1800,620 L1800,1100 L-200,1100 Z" fill="${sepia ? '#A89070' : '#B9B2A4'}"/>` +
  Array.from({ length: 5 }, (_, i) => `<rect x="${-100 + i * 380}" y="120" width="230" height="300" fill="${sepia ? '#E6D6B4' : '#CFE3EC'}" stroke="#8A8478" stroke-width="10"/><line x1="${15 + i * 380}" y1="120" x2="${15 + i * 380}" y2="420" stroke="#8A8478" stroke-width="6"/><path d="M${-80 + i * 380},640 L${150 + i * 380},640 L${260 + i * 380},900 L${-10 + i * 380},900 Z" fill="#FFF6DA" opacity=".35"/>`).join('') +
  `<rect x="-200" y="560" width="2000" height="60" fill="${sepia ? '#B8A07A' : '#C9C1B0'}"/>`;
const gateBg = (id: string) =>
  sky(id, '#BFD9EA', '#E8EEE8') +
  // 远处的教学楼
  `<rect x="120" y="180" width="760" height="300" fill="#E6D2C0"/>` + Array.from({ length: 4 }, (_, r) => Array.from({ length: 9 }, (_, c) => `<rect x="${150 + c * 80}" y="${200 + r * 66}" width="50" height="40" fill="#A9C6D6"/>`).join('')).join('') +
  `<rect x="120" y="170" width="760" height="16" fill="#C9B4A0"/>` +
  // 树
  [60, 940, 1520].map((x, i) => `<rect x="${x - 10}" y="320" width="20" height="200" fill="#6E5A40"/><circle cx="${x}" cy="300" r="${90 - i * 6}" fill="#6E9A5E"/><circle cx="${x - 40}" cy="340" r="60" fill="#5E8A50"/><circle cx="${x + 46}" cy="336" r="56" fill="#7AA868"/>`).join('') +
  `<path d="M-200,520 L1800,520 L1800,1100 L-200,1100 Z" fill="#B9B4AA"/><path d="M-200,520 L1800,520" stroke="#9A958C" stroke-width="4"/>` +
  // 门卫室
  `<rect x="980" y="250" width="520" height="360" fill="#EDE8DE" stroke="#8A8478" stroke-width="4"/><rect x="960" y="226" width="560" height="34" fill="#3E5A80"/><text x="1240" y="252" font-size="24" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>门卫室  GUARD ROOM</text>` +
  `<rect x="1030" y="320" width="330" height="190" fill="#CFE3EC" stroke="#6E7A84" stroke-width="8"/><rect x="1400" y="330" width="80" height="280" fill="#7A6A58"/>` +
  `<rect x="1010" y="500" width="370" height="20" fill="#8A7A66"/>`;
/** 坐在桌后面的人：只画到桌子（人坐着，桌子挡住腿） */
const deskPerson = (who: string, x: number, y: number, s: number, g: number, pose = P.sit(), hold?: 'phone', face: 1 | -1 = 1, mood: 'calm' | 'shock' | 'laugh' | 'sad' = 'calm') =>
  person({ x, y, s, who, pose, g, hold, face, detail: s >= 1.6, mood });

// ---------------- 小物件 ----------------
/** 手机屏幕里的足球赛：goal 0—1 进球（球飞进网、比分变） */
const phoneScreen = (x: number, y: number, w: number, h: number, g: number, goal: number) => {
  let o = `<g transform="translate(${x},${y})"><rect x="-14" y="-14" width="${w + 28}" height="${h + 28}" rx="26" fill="#15171C"/><rect width="${w}" height="${h}" rx="8" fill="#3E8A4A"/>`;
  for (let i = 0; i < 6; i++) o += `<rect x="${f((i * w) / 6)}" y="0" width="${f(w / 12)}" height="${h}" fill="#4A9656" opacity=".6"/>`;
  o += `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" fill="none" stroke="#EAF2E6" stroke-width="3"/><line x1="${w / 2}" y1="6" x2="${w / 2}" y2="${h - 6}" stroke="#EAF2E6" stroke-width="3"/><circle cx="${w / 2}" cy="${h / 2}" r="${h * 0.18}" fill="none" stroke="#EAF2E6" stroke-width="3"/>`;
  o += `<rect x="${w - 30}" y="${h * 0.32}" width="24" height="${h * 0.36}" fill="none" stroke="#fff" stroke-width="4"/>`;
  const r = rng(9);
  for (let i = 0; i < 10; i++) { const red = i < 5, px = lerp(w * 0.2, w * 0.85, r()) + wav(g, 1.4 + r(), r()) * 18 + (red ? goal * 40 : 0), py = lerp(h * 0.15, h * 0.85, r()) + wav(g, 1.8 + r(), r()) * 12; o += `<circle cx="${f(px)}" cy="${f(py)}" r="9" fill="${red ? '#D23A2E' : '#F4F4F0'}" stroke="${INK}" stroke-width="1.5"/>`; }
  const bx = lerp(w * 0.55, w - 18, goal), by = h / 2 + Math.sin(goal * Math.PI) * -40;
  o += `<circle cx="${f(bx)}" cy="${f(by)}" r="7" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
  o += `<rect x="12" y="12" width="150" height="40" rx="6" fill="#15171C" opacity=".85"/><text x="87" y="41" font-size="24" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>CHN ${goal > 0.9 ? 1 : 0} - 0</text>`;
  if (goal > 0.9) o += `<text x="${w / 2}" y="${h / 2 + 22}" font-size="${f(64 + Math.sin(g * 8) * 4)}" font-weight="900" fill="#FFE14A" stroke="#7A3A0A" stroke-width="3" text-anchor="middle" ${SANS}>GOAL!</text>`;
  return o + '</g>';
};
/** 黄色便利贴：字一笔一笔写出来（reveal 0—1） */
const stickyNote = (x: number, y: number, s: number, reveal: number, rot = -4) => {
  const lines = ['Lent the panda.', 'Back at 3.', '— M'];
  let o = `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="6" y="8" width="300" height="270" fill="#000" opacity=".18"/><rect width="300" height="270" fill="#F6DC5A"/><rect width="300" height="34" fill="#EFD24C"/>`;
  let k = 0; const total = lines.join('').length;
  lines.forEach((l, i) => { const n = clamp(Math.round(reveal * total) - k, 0, l.length); k += l.length; o += `<text x="${i === 2 ? 170 : 26}" y="${92 + i * 70}" font-size="${i === 2 ? 40 : 38}" fill="#2B2A6E" ${HAND}>${l.slice(0, n)}</text>`; });
  return o + '</g>';
};
/** 侦探本子的一页：横线 + 写了一半的线索 */
const notebookPage = (x: number, y: number, s: number, text: string, reveal: number) => {
  let o = `<g transform="translate(${x},${y}) scale(${s})"><rect x="8" y="10" width="560" height="380" fill="#000" opacity=".2"/><rect width="560" height="380" fill="#FBF7EA"/><rect width="560" height="380" fill="none" stroke="#C9B994" stroke-width="3"/>`;
  for (let i = 1; i < 8; i++) o += `<line x1="0" y1="${i * 46}" x2="560" y2="${i * 46}" stroke="#A9C6E2" stroke-width="2"/>`;
  o += `<line x1="64" y1="0" x2="64" y2="380" stroke="#E2A2A2" stroke-width="2"/><text x="80" y="36" font-size="30" font-weight="900" fill="#8E2A26" ${HAND}>Case notes</text>`;
  const n = Math.round(reveal * text.length);
  o += `<text x="80" y="128" font-size="30" fill="#2B2A6E" ${HAND}>${text.slice(0, n)}</text>`;
  return o + '</g>';
};
/** 线索板：软木板、图钉、卡片、红线（show 0—1 一张张钉上去） */
const clueBoard = (x: number, y: number, s: number, show: number, g: number, mixed = false) => {
  const cards: [number, number, string, string][] = mixed
    ? [[600, 240, '?', 'panda on the table'], [40, 250, '?', 'lights out'], [330, 30, '?', 'boy + drum case'], [620, 40, 'NOTE', '“Lent the panda.”'], [330, 260, '?', 'panda gone!']]
    : [[40, 40, '2:00', 'panda on the table'], [330, 30, '2:15', 'lights out'], [620, 50, '2:20', 'boy + drum case'], [140, 250, 'NOTE', '“Lent the panda.”'], [470, 260, '2:40', 'panda gone!']];
  let o = `<g transform="translate(${x},${y}) scale(${s})"><rect x="-20" y="-20" width="940" height="520" rx="10" fill="#7A5236"/><rect width="900" height="480" fill="#C9A06A"/>`;
  const r = rng(4); for (let i = 0; i < 160; i++) o += `<circle cx="${f(r() * 900)}" cy="${f(r() * 480)}" r="${f(1 + r() * 2)}" fill="#A8804E" opacity=".6"/>`;
  const vis = cards.map((_, i) => seg(show, i * 0.16, i * 0.16 + 0.2));
  // 红线：卡片钉上了才连
  const pin = (i: number) => [cards[i][0] + 120, cards[i][1] + 12];
  (mixed ? [] : [[0, 1], [1, 2], [2, 4], [3, 4], [1, 3]]).forEach(([a, b]) => { const k = Math.min(vis[a], vis[b]); if (k > 0) { const A = pin(a), B = pin(b); o += `<path d="M${A[0]},${A[1]} Q${(A[0] + B[0]) / 2},${(A[1] + B[1]) / 2 + 40} ${f(lerp(A[0], B[0], k))},${f(lerp(A[1], B[1], k))}" stroke="#C23B2E" stroke-width="4" fill="none"/>`; } });
  cards.forEach(([cx, cy, t, d], i) => {
    const k = vis[i]; if (k <= 0) return;
    o += `<g transform="translate(${cx},${f(cy - (1 - k) * 30)}) rotate(${f((i % 2 ? 2 : -2) + wav(g, 3, i) * 0.6)})" opacity="${f(k)}"><rect x="4" y="6" width="240" height="140" fill="#000" opacity=".2"/><rect width="240" height="140" fill="${t === 'NOTE' ? '#F6DC5A' : '#FBF7EA'}"/><text x="120" y="58" font-size="36" font-weight="900" fill="#8E2A26" text-anchor="middle" ${HAND}>${t}</text><text x="120" y="106" font-size="25" fill="#2B2A6E" text-anchor="middle" ${HAND}>${d}</text><circle cx="120" cy="12" r="9" fill="#C23B2E"/></g>`;
  });
  if (show > 0.85 && !mixed) o += `<text x="760" y="440" font-size="${f(90 + Math.sin(g * 3) * 4)}" font-weight="900" fill="#8E2A26" ${HAND} opacity="${f(seg(show, 0.85, 1))}">?</text><text x="840" y="380" font-size="70" font-weight="900" fill="#8E2A26" ${HAND} opacity="${f(seg(show, 0.9, 1))}">?</text>`;
  return o + '</g>';
};
/** 世界地图（只画大概的轮廓）：伦敦 → 北京，一架小飞机沿虚线飞过去 */
const worldMap = (id: string, k: number, g: number) => {
  let o = sky(id, '#D8E6EC', '#C9DCE4');
  o += `<path d="M120,260 Q180,160 330,170 Q420,200 400,300 Q370,380 300,430 Q250,520 200,600 Q150,520 160,420 Q100,340 120,260 Z" fill="#E8DFC6" stroke="#B8AE96" stroke-width="3"/>`; // 美洲
  o += `<path d="M640,180 Q700,120 820,130 Q980,110 1180,140 Q1360,170 1420,260 Q1400,330 1300,360 Q1220,420 1120,400 Q1000,380 920,420 Q880,520 820,600 Q760,640 720,560 Q700,460 660,400 Q620,330 650,280 Q610,230 640,180 Z" fill="#E8DFC6" stroke="#B8AE96" stroke-width="3"/>`; // 亚欧非
  o += `<path d="M1240,560 Q1320,540 1380,580 Q1360,640 1280,640 Q1230,610 1240,560 Z" fill="#E8DFC6" stroke="#B8AE96" stroke-width="3"/>`;
  const L = [720, 200], B = [1190, 270];
  o += `<path d="M${L[0]},${L[1]} Q${(L[0] + B[0]) / 2},${100} ${B[0]},${B[1]}" stroke="#C23B2E" stroke-width="5" stroke-dasharray="14 10" fill="none"/>`;
  const t = k, px = (1 - t) * (1 - t) * L[0] + 2 * (1 - t) * t * ((L[0] + B[0]) / 2) + t * t * B[0], py = (1 - t) * (1 - t) * L[1] + 2 * (1 - t) * t * 100 + t * t * B[1];
  const ang = (Math.atan2((B[1] - 100) * t + (100 - L[1]) * (1 - t), (B[0] - L[0]) / 2) * 180) / Math.PI;
  o += `<g transform="translate(${f(px)},${f(py)}) rotate(${f(ang)})"><path d="M-26,0 L24,0 M0,0 L-10,-22 M0,0 L-10,22 M-22,0 L-30,-10 M-22,0 L-30,10" stroke="#2B2722" stroke-width="7" stroke-linecap="round"/></g>`;
  o += `<circle cx="${L[0]}" cy="${L[1]}" r="12" fill="#2F5DA8"/><text x="${L[0] - 20}" y="${L[1] + 50}" font-size="36" font-weight="900" fill="#2F5DA8" text-anchor="middle" ${SANS}>London</text>`;
  o += `<circle cx="${B[0]}" cy="${B[1]}" r="12" fill="#C23B2E"/><text x="${B[0] + 10}" y="${B[1] + 50}" font-size="36" font-weight="900" fill="#C23B2E" text-anchor="middle" ${SANS}>Beijing</text>`;
  return o + `<text x="980" y="560" font-size="40" font-weight="900" fill="#4A5A64" text-anchor="middle" ${SANS} opacity="${f(seg(k, 0.6, 1))}">2 weeks in Beijing</text>` + glow(id, B[0], B[1], 60, g, 0, 0.4 * seg(k, 0.8, 1));
};
/** 一排椅子（礼堂前排，侧面看） */
const chairRow = (x0: number, n: number, y: number, s: number, dx = 190) => Array.from({ length: n }, (_, i) => { const x = x0 + i * dx; return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-40" y="-76" width="84" height="12" rx="3" fill="#8E2A26"/><rect x="-46" y="-170" width="12" height="104" rx="4" fill="#8E2A26"/><rect x="-36" y="-64" width="6" height="64" fill="#3A3A40"/><rect x="30" y="-64" width="6" height="64" fill="#3A3A40"/></g>`; }).join('');
/** AI 眼镜（发着光，在扫字） */
const aiGlasses = (x: number, y: number, s: number, g: number) => `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><circle r="210" fill="#9FD3F0" opacity="${f(0.22 + 0.08 * Math.sin(g * 2))}"/><circle cx="-80" r="62" fill="#CFE6F2" fill-opacity=".55" stroke="#2B2722" stroke-width="10"/><circle cx="80" r="62" fill="#CFE6F2" fill-opacity=".55" stroke="#2B2722" stroke-width="10"/><path d="M-18,-6 q18,-16 36,0" stroke="#2B2722" stroke-width="9" fill="none"/><path d="M-142,-8 l-80,-20 M142,-8 l80,-20" stroke="#2B2722" stroke-width="9"/>${[-1, 1].map((sg) => Array.from({ length: 4 }, (_, i) => `<line x1="${sg * 80 - 34}" y1="${-30 + i * 18}" x2="${f(sg * 80 - 34 + 68 * clamp(((g * 0.8 + i * 0.25) % 1) * 1.4))}" y2="${-30 + i * 18}" stroke="#2F5DA8" stroke-width="5" stroke-linecap="round" opacity=".8"/>`).join('')).join('')}</g>`;

export { aiGlasses, audience, chairRow, clock, clueBoard, corridorBg, deskPerson, door, gateBg, hallBg, hallLights, notebookPage, phoneScreen, stickyNote, table, trophy, worldMap, backstageBg, HAND, SANS };

/** 坐在椅子上的人（椅子按人的大小画） */
export const seated = (who: string, x: number, y: number, s: number, g: number, o: { pose?: ReturnType<typeof P.sit>; face?: 1 | -1; hold?: 'phone' | 'mooncake' | 'notebook'; mood?: 'calm' | 'shock' | 'laugh' | 'sad' } = {}) =>
  `<g transform="translate(${x},0) scale(${o.face ?? 1},1) translate(${-x},0)">${chairRow(x, 1, y, s * 0.74)}</g>` + person({ x, y, s, who, pose: o.pose ?? P.sitRest(), g, face: o.face ?? 1, hold: o.hold, detail: s >= 1.6, mood: o.mood });
/** 礼堂里侧面看：墙、窗、舞台那边的红幕、后排坐着的同学（虚） */
export const sideHall = (id: string, g: number, stageRight = true) =>
  sky(id, '#DCCAA8', '#CDB892') + Array.from({ length: 4 }, (_, i) => `<rect x="${-80 + i * 420}" y="90" width="250" height="200" fill="#C9DCE2" stroke="#B7A27C" stroke-width="10"/>`).join('') +
  (stageRight ? `<path d="M1500,-200 Q1460,300 1490,620 L1800,620 L1800,-200 Z" fill="#9E2E2A"/>` : '') + `<rect x="-200" y="600" width="2000" height="500" fill="#B78C5C"/>` +
  `<g opacity=".4" filter="url(#${id}s)">${[0, 1, 2, 3, 4, 5].map((i) => person({ x: 60 + i * 260, y: 600, s: 0.9, who: i % 2 ? 'stuB' : 'stuA', pose: P.sitRest(), g })).join('')}</g>`;
/** 伸过去的手（从右下角伸向左上，手指张开）：x、y 是手腕 */
const reachHand = (x: number, y: number) => `<g transform="translate(${f(x)},${f(y)}) rotate(-38)"><path d="M-40,40 L40,40 L60,700 L-60,700 Z" fill="#2F5DA8" stroke="${INK}" stroke-width="4"/><path d="M-44,60 L44,60" stroke="#F4F4F0" stroke-width="12"/>` +
  `<path d="M-40,40 Q-48,-40 -30,-70 L34,-70 Q50,-30 40,40 Z" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>` +
  [[-26, -70, -4], [-8, -76, 0], [10, -76, 2], [28, -68, 6]].map(([fx, fy, r]) => `<rect x="${fx - 9}" y="${fy - 70}" width="18" height="74" rx="9" fill="${SKIN}" stroke="${INK}" stroke-width="3.5" transform="rotate(${r} ${fx} ${fy})"/>`).join('') +
  `<rect x="-62" y="-40" width="18" height="62" rx="9" fill="${SKIN}" stroke="${INK}" stroke-width="3.5" transform="rotate(-40 -44 10)"/></g>`;
/** 回忆的画面：发黄、四周压暗 */
export const flashback = (id: string) => `<rect x="-200" y="-200" width="2000" height="1300" fill="#C9A86A" opacity=".22" style="mix-blend-mode:multiply"/><rect x="-200" y="-200" width="2000" height="1300" fill="url(#${id}v)" opacity=".9"/>`;
/** 时间标签：给了取景框 v，就按原来在整幅画（1600×900）里的位置钉在画面上，镜头推拉也不会被切掉 */
export const timeTag = (x: number, y: number, t: string, v?: View) => pin(v, x / 1600, y / 900, timeTagSvg(t), x, y);
const timeTagSvg = (t: string) => `<g><rect x="-90" y="-44" width="180" height="62" rx="12" fill="#1E1A18" opacity=".75"/><text x="0" y="2" font-size="40" font-weight="900" fill="#FFE9A8" text-anchor="middle" ${SANS}>${t}</text></g>`;
export const talk = (g: number, k = 1) => (Math.sin(g * 11) * 0.5 + 0.5) * 0.6 * k; // 说话时嘴一张一合
export const screenPanda = (id: string, x: number, y: number, s: number, g: number) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-210" y="-150" width="420" height="300" fill="#1C2440"/><rect x="-200" y="-140" width="400" height="280" fill="#2E3E6E"/>${glow(id, 0, -20, 160, g, 0, 0.5)}${trophy(id, 0, 70, 0.75, g)}<text x="0" y="124" font-size="22" font-weight="900" fill="#FFE9A8" text-anchor="middle" ${SANS}>TOP PRIZE · THE GOLDEN PANDA</text></g>`;

export const SHOTS_E1: Record<string, ShotDef> = {
  // ---------- 0 星期五下午，礼堂坐满了人 ----------
  'e.hall': {
    bg: (id) => hallBg(id) + screenPanda(id, 800, 330, 0.62, 0),
    fg: (u, g, id) => hallLights(id, g, 1) + audience(3, g, { rows: 5 }),
    cam: [[800, 470, 1600], [800, 440, 1360]],
  },
  'e.clock240': {
    bg: (id) => sky(id, '#D9C8A6', '#CDB892') + `<rect x="-200" y="700" width="2000" height="400" fill="#B78C5C"/>`,
    fg: (u, g) => clock(800, 430, 230, 2, 40 + u * 0.4, g * 3),
    cam: [[800, 440, 1000], [800, 430, 860]],
  },
  // ---------- 1 二十分钟后颁最高奖：金熊猫 ----------
  'e.stage': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => hallLights(id, g, 1) + `<path d="M520,-20 L420,540 L640,540 Z" fill="#FFF6D8" opacity=".18"/><path d="M1080,-20 L1180,540 L960,540 Z" fill="#FFF6D8" opacity=".18"/>` + screenPanda(id, 800, 330, 0.62 + 0.04 * seg(u, 0, 1), g) + audience(5, g, { rows: 3, y0: 760 }),
    cam: [[800, 360, 1150], [800, 330, 900]],
  },
  'e.panda': {
    bg: (id) => sky(id, '#1C2440', '#2E3E6E'),
    fg: (u, g, id) => glow(id, 800, 380, 420, g, 0, 0.55) + trophy(id, 800, 760, 2.2, g, 1) + Array.from({ length: 14 }, (_, i) => { const r = rng(i + 3), k = (g * 0.2 + r()) % 1; return `<circle cx="${f(400 + r() * 800)}" cy="${f(800 - k * 700)}" r="${f(2 + r() * 3)}" fill="#FFE9A8" opacity="${f(Math.sin(k * Math.PI))}"/>`; }).join(''),
    cam: [[800, 480, 1150], [800, 470, 960]],
  },
  // ---------- 2 你是三个决赛选手之一；手冰凉 ----------
  'e.finalists': {
    bg: () => '',
    fg: (u, g, id) => {
      let o = sideHall(id, g);
      [[420, 'stuB'], [800, 'you'], [1180, 'stuA']].forEach(([x, who], i) => {
        const fid = i === 1 ? seg(u, 0.3, 1) : 0, pose = i === 1 ? { ...P.sitRest(), aF: 34 + Math.sin(g * 9) * 5 * fid, eF: 84, aB: 30, eB: 88, head: 8 + 8 * fid, lean: 6 } : P.sitRest();
        o += seated(who as string, x as number, 800, 1.9, g, { pose, mood: i === 1 ? 'sad' : 'calm' });
        o += `<g transform="translate(${(x as number) + 70},862)"><rect x="-72" y="-28" width="144" height="40" rx="6" fill="#FBF7EA" stroke="${GOLD}" stroke-width="3"/><text x="0" y="2" font-size="24" font-weight="900" fill="#8E2A26" text-anchor="middle" ${SANS}>FINALIST</text></g>`;
      });
      return o;
    },
    cam: [[800, 560, 1450], [800, 600, 1100]],
  },
  'e.hands': {
    bg: (id) => sky(id, '#2F5DA8', '#26508F') + `<path d="M-200,520 Q800,460 1800,520 L1800,1100 L-200,1100 Z" fill="#244B8A"/>`,
    fg: (u, g) => {
      const sh = Math.sin(g * 26) * 2.5 * (0.3 + 0.7 * seg(u, 0, 0.5)), tw = Math.sin(g * 5) * 18;
      let o = `<g transform="translate(${f(sh)},0)">`;
      // 两只袖子（校服：蓝色，白条）
      o += `<path d="M-100,1000 L300,640 L470,760 L120,1100 Z" fill="#2F5DA8" stroke="${INK}" stroke-width="4"/><path d="M300,640 L470,760" stroke="#F4F4F0" stroke-width="14"/>`;
      o += `<path d="M1700,1000 L1300,640 L1130,760 L1480,1100 Z" fill="#2F5DA8" stroke="${INK}" stroke-width="4"/><path d="M1300,640 L1130,760" stroke="#F4F4F0" stroke-width="14"/>`;
      // 手掌
      o += `<path d="M380,690 Q470,560 640,560 L760,600 L740,760 Q600,800 470,770 Z" fill="${SKIN}" stroke="${INK}" stroke-width="4"/><path d="M1220,690 Q1130,560 960,560 L840,600 L860,760 Q1000,800 1130,770 Z" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>`;
      // 手指交叉：左手的四根手指搭在右手背上，右手的从下面穿过来
      for (let i = 0; i < 8; i++) { const L = i % 2 === 0, y = 588 + i * 24; o += `<rect x="${L ? 620 : 720}" y="${y}" width="260" height="40" rx="20" fill="${L ? SKIN : '#E2CDAE'}" stroke="${INK}" stroke-width="3" transform="rotate(${L ? 4 : -4} 800 ${y + 20})"/>`; }
      // 两个大拇指搭在上面，绕来绕去（紧张）
      o += `<g transform="rotate(${f(-30 + tw)} 700 590)"><rect x="680" y="470" width="44" height="130" rx="22" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/></g><g transform="rotate(${f(30 - tw)} 900 590)"><rect x="876" y="470" width="44" height="130" rx="22" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/></g>`;
      o += '</g>';
      return o + `<text x="1280" y="300" font-size="70" ${SANS} opacity="${f(0.75 * seg(u, 0.2, 0.6))}">❄️</text><text x="260" y="360" font-size="54" ${SANS} opacity="${f(0.6 * seg(u, 0.4, 0.8))}">❄️</text>`;
    },
    cam: [[800, 640, 1300], [800, 640, 1080]],
  },
  // ---------- 3 Ben：别紧张！来块月饼？ ----------
  'e.benOffer': {
    bg: () => '',
    fg: (u, g, id) => {
      const k = seg(u, 0.15, 0.55);
      return sideHall(id, g) + seated('you', 620, 820, 2.2, g, { mood: 'sad', pose: { ...P.sitRest(), head: 6 + 6 * k } }) + seated('ben', 1020, 820, 2.2, g, { face: -1, pose: { ...P.sitRest(), aF: lerp(22, 74, k), eF: lerp(62, 8, k), head: -4 }, hold: 'mooncake', mood: 'laugh' });
    },
    cam: [[820, 520, 1300], [820, 500, 1100]],
  },
  // ---------- 4 Ben 是伦敦来的交换生，来了两个星期，吃了九块月饼 ----------
  'e.map': {
    bg: () => '',
    fg: (u, g, id) => worldMap(id, seg(u, 0.05, 0.8), g),
    cam: [[800, 420, 1600], [950, 330, 1300]],
  },
  'e.benEats': {
    bg: () => '',
    fg: (u, g, id) => {
      const n = Math.min(9, Math.floor(seg(u, 0.05, 0.85) * 9.99));
      let o = '';
      for (let i = 0; i < 9; i++) { const on = i < n, x = 1060 + (i % 3) * 120, y = 360 + Math.floor(i / 3) * 120; o += `<g opacity="${on ? 1 : 0.18}"><circle cx="${x}" cy="${y}" r="46" fill="#C98A3E" stroke="#7A4E1E" stroke-width="4"/><circle cx="${x}" cy="${y}" r="28" fill="none" stroke="#7A4E1E" stroke-width="3"/><path d="M${x - 14},${y} h28 M${x},${y - 14} v28" stroke="#7A4E1E" stroke-width="3"/></g>`; }
      o += `<text x="1180" y="790" font-size="80" font-weight="900" fill="#8E2A26" text-anchor="middle" ${SANS}>× ${n}</text>`;
      return sideHall(id, g, false) + o + seated('ben', 560, 800, 2.2, g, { pose: P.eat(g * 0.9), hold: 'mooncake', mood: 'laugh' });
    },
    cam: [[820, 480, 1400], [840, 470, 1250]],
  },
  // ---------- 5 门猛地被推开，Green 老师跑进来，脸色发白 ----------
  'e.door': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => {
      // 左边侧墙上的门（透视）：门一下子被推开，外面的光照进来，Green 老师站在门口
      const op = seg(u, 0.06, 0.22), k = 1 - 0.85 * op;
      let o = hallLights(id, g, 1);
      o += `<path d="M30,662 L30,404 L210,368 L210,580 Z" fill="${op > 0.02 ? '#FFF4D8' : '#6A4A30'}" stroke="#4A3020" stroke-width="8"/>`;
      if (op > 0.02) {
        o += `<path d="M30,662 L210,580 L620,760 L120,980 Z" fill="#FFF4D8" opacity="${f(0.4 * op)}"/>`;
        o += `<g opacity="${f(seg(u, 0.2, 0.4))}">${person({ x: 140, y: 610, s: 1.15, who: 'green', pose: P.stand(), g, mood: 'shock' })}</g>`;
      }
      o += `<path d="M30,662 L30,404 L${f(lerp(210, 30, 1 - k) + (1 - k) * 60)},${f(lerp(368, 404, 1 - k) - (1 - k) * 20)} L${f(lerp(210, 30, 1 - k) + (1 - k) * 60)},${f(lerp(580, 662, 1 - k) + (1 - k) * 30)} Z" fill="#7A5236" stroke="${INK}" stroke-opacity=".5" stroke-width="3"/>`;
      return o + audience(3, g, { rows: 5, turn: -seg(u, 0.2, 0.5) });
    },
    cam: [[700, 470, 1600], [520, 520, 1250]],
  },
  'e.greenRun': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => { const x = lerp(-60, 1280, seg(u, 0, 1)); return hallLights(id, g, 1) + person({ x, y: 690, s: 1.9, who: 'green', pose: P.walk(g * 1.7, 1.5), g, mood: 'shock', detail: true }) + audience(3, g, { rows: 2, y0: 880, turn: -0.4 }); },
    cam: [[560, 470, 1150], [1040, 470, 1150]],
  },
  // ---------- 读书眼镜在翻译（AI 误译那道题） ----------
  'e.glasses': {
    bg: (id) => hallBg(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#1C2440" opacity=".72"/>`,
    // 只画眼镜在扫字（不把要找的那几处词摆出来）
    fg: (u, g) => aiGlasses(800, 430, 1.5, g) + `<text x="800" y="760" font-size="44" font-weight="900" fill="#CFE6F2" text-anchor="middle" ${SANS} opacity="${f(0.6 + 0.3 * Math.sin(g * 2))}">EN → 中文</text>`,
    cam: [[800, 450, 1600], [800, 440, 1450]],
  },
  // ---------- 6 Green 老师：Someone has taken it! ----------
  'e.greenCU': {
    bg: (id) => backstageBg(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#5E4A40" opacity=".5"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.25, who: 'green', g, open: 1.25, brow: 0.9, mouth: 0.5 + talk(g) * 0.15, look: 0.2 }),
    cam: [[780, 470, 1200], [790, 450, 1000]],
  },
  // ---------- 7 两点钟它还在这张桌子上 ----------
  'e.emptyTable': {
    bg: (id) => backstageBg(id) + table(820, 560, 420),
    fg: (u, g) => `<ellipse cx="820" cy="552" rx="70" ry="12" fill="#3E5A9A" stroke="#C9D6F0" stroke-width="3" stroke-dasharray="8 6" opacity="${f(0.5 + 0.4 * Math.sin(g * 3))}"/>` +
      person({ x: 440, y: 860, s: 2.0, who: 'green', pose: P.point(seg(u, 0.1, 0.4)), g, mood: 'shock' }) + person({ x: 1170, y: 870, s: 1.95, who: 'ben', pose: P.stand(), g, face: -1 }) + person({ x: 1340, y: 880, s: 1.9, who: 'you', pose: P.stand(), g, face: -1 }),
    cam: [[840, 560, 1350], [840, 560, 1180]],
  },
  // ---------- 8 两点一刻，灯灭了一分钟；灯再亮，熊猫不见了（回忆） ----------
  'e.lightsOut': {
    bg: (id) => backstageBg(id) + table(820, 560, 420),
    fg: (u, g, id, v) => {
      const dark = u < 0.18 ? 0 : u < 0.24 ? (Math.sin(g * 40) > 0 ? 0.9 : 0.2) : u < 0.68 ? 0.94 : u < 0.72 ? (Math.sin(g * 40) > 0 ? 0.2 : 0.9) : 0;
      const gone = u > 0.6;
      return (gone ? '' : trophy(id, 820, 552, 1.1, g, 1)) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#05060A" opacity="${f(dark)}"/>` + flashback(id) + timeTag(1300, 200, '2:15', v) + (u > 0.75 ? `<text x="820" y="420" font-size="90" font-weight="900" fill="#C23B2E" text-anchor="middle" ${SANS} opacity="${f(seg(u, 0.75, 0.85))}">?!</text>` : '');
    },
    cam: [[820, 460, 1200], [820, 470, 1050]],
  },
  'e.greenAsk': {
    bg: (id) => backstageBg(id),
    fg: (u, g) => person({ x: 440, y: 870, s: 2.1, who: 'green', pose: P.mix(P.stand(), P.point(1), 0.45 + 0.1 * Math.sin(g * 2)), g, mood: 'sad' }) +
      person({ x: 900, y: 880, s: 2.0, who: 'ben', pose: P.stand(), g, face: -1 }) + person({ x: 1090, y: 886, s: 1.95, who: 'you', pose: P.stand(), g, face: -1 }) + person({ x: 1280, y: 890, s: 1.9, who: 'stuB', pose: P.stand(), g, face: -1 }),
    cam: [[840, 560, 1350], [780, 560, 1200]],
  },
  'e.benDark': {
    bg: (id) => sky(id, '#14161C', '#1E2028'),
    fg: (u, g, id, v) => {
      const bite = Math.sin(g * 5.6);
      return glow(id, 820, 520, 220, g, 0, 0.35) + seated('ben', 760, 800, 2.3, g, { pose: P.eat(g * 0.9), hold: 'mooncake', mood: 'laugh' }) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#05060A" opacity=".45"/>` + flashback(id) + timeTag(220, 110, '2:15', v) +
        Array.from({ length: 5 }, (_, i) => { const k = (g * 0.7 + i / 5) % 1; return `<circle cx="${f(900 + i * 8)}" cy="${f(470 + k * 300)}" r="4" fill="#C98A3E" opacity="${f(1 - k)}"/>`; }).join('') + `<text x="1080" y="380" font-size="54" font-weight="900" fill="#FFE9A8" ${SANS} opacity="${f(0.5 + 0.5 * Math.max(0, bite))}">munch</text>`;
    },
    cam: [[820, 520, 1300], [820, 500, 1100]],
  },
  // ---------- 9 我们得把线索都记下来；我没带本子 ----------
  'e.benPockets': {
    bg: (id) => backstageBg(id),
    fg: (u, g) => {
      const pat = Math.sin(g * 7);
      const fall = seg(u, 0.45, 0.75);
      return person({ x: 760, y: 880, s: 2.5, who: 'ben', pose: { ...P.stand(), aF: -18 + 14 * pat, eF: 70, aB: -16 - 14 * pat, eB: 74, head: 14 }, g, mood: 'sad' }) +
        `<g transform="translate(${f(810 + fall * 50)},${f(660 + fall * 210)}) rotate(${f(fall * 300)})" opacity="${f(fall > 0 ? 1 : 0)}"><circle r="22" fill="#C98A3E" stroke="#7A4E1E" stroke-width="3"/><circle r="13" fill="none" stroke="#7A4E1E" stroke-width="2"/></g>`;
    },
    cam: [[780, 580, 1100], [780, 580, 980]],
  },
  // ---------- 10 我能借你的本子吗？ ----------
  'e.notebook': {
    bg: (id) => backstageBg(id),
    fg: (u, g) => {
      // 你把本子递过去（伸手），Ben 伸手接；接到以后本子在 Ben 手里，你收回手
      const reach = seg(u, 0.1, 0.45), took = u > 0.55, back = seg(u, 0.6, 0.9);
      return person({ x: 660, y: 860, s: 2.1, who: 'you', pose: P.give(reach * (1 - back)), g, hold: took ? undefined : 'notebook' }) +
        person({ x: 1010, y: 870, s: 2.15, who: 'ben', pose: P.give(seg(u, 0.25, 0.5) * (1 - 0.5 * back)), g, face: -1, mood: 'laugh', hold: took ? 'notebook' : undefined });
    },
    cam: [[840, 560, 1150], [840, 560, 1000]],
  },
  // ---------- 11 你们跑到校门口；门卫刘师傅在看手机 ----------
  'e.corridor': {
    bg: (id) => corridorBg(id),
    fg: (u, g) => { const x = lerp(200, 1400, u); return person({ x, y: 820, s: 1.6, who: 'you', pose: P.walk(g * 2.2, 1.7), g }) + person({ x: x - 230, y: 830, s: 1.65, who: 'ben', pose: P.walk(g * 2.2 + 0.4, 1.7), g }); },
    cam: [[600, 480, 1400], [1100, 480, 1400]],
  },
  'e.gate': {
    bg: (id) => gateBg(id),
    fg: (u, g) => deskPerson('liu', 1200, 610, 1.15, g, { ...P.sit(), aF: 70, eF: 60, head: 16 }, 'phone') + `<rect x="1020" y="500" width="350" height="110" fill="#8A7A66"/>` +
      person({ x: lerp(-100, 640, seg(u, 0, 0.8)), y: 760, s: 1.35, who: 'you', pose: P.walk(g * 1.8, 1.4 * (1 - seg(u, 0.75, 0.9))), g }) + person({ x: lerp(-280, 470, seg(u, 0, 0.8)), y: 770, s: 1.4, who: 'ben', pose: P.walk(g * 1.8 + 0.4, 1.4 * (1 - seg(u, 0.75, 0.9))), g }),
    cam: [[800, 450, 1600], [900, 460, 1400]],
  },
  'e.booth': {
    bg: (id) => gateBg(id),
    fg: (u, g) => deskPerson('liu', 1200, 610, 1.15, g, { ...P.sit(), aF: 70, eF: 60, head: 16 }, 'phone') + `<rect x="1020" y="500" width="350" height="110" fill="#8A7A66"/>` + person({ x: 840, y: 780, s: 1.5, who: 'you', pose: P.stand(), g }) + person({ x: 660, y: 790, s: 1.5, who: 'ben', pose: P.stand(), g }),
    cam: [[1000, 480, 1150], [1050, 470, 1000]],
  },
  // ---------- 13 嗯？不好意思，我没注意到有人 ----------
  'e.liuCU': {
    bg: (id) => gateBg(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#EDE8DE" opacity=".55"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'liu', g, open: 0.9, brow: 0.2, mouth: talk(g) * 0.4, shake: seg(u, 0.35, 0.5) * (1 - seg(u, 0.75, 0.9)), look: 0.3 }),
    cam: [[780, 460, 1200], [790, 450, 1050]],
  },
  // ---------- 14 两点一刻我在看球赛，中国队进球了 ----------
  'e.phone': {
    bg: (id) => sky(id, '#2E3B55', '#26324A'),
    fg: (u, g) => `<g transform="rotate(-3 800 450)">${phoneScreen(470, 190, 660, 400, g, seg(u, 0.5, 0.78))}</g>` + `<path d="M1180,760 Q1150,620 1100,600 Q1040,600 1060,700 L1100,900 Z" fill="${SKIN}" stroke="${INK}" stroke-width="4"/>`,
    cam: [[800, 430, 1200], [800, 420, 1000]],
  },
  // ---------- 15 两点二十，一个男生拖着大鼓箱去了音乐教室（回忆） ----------
  'e.drumBoy': {
    bg: (id) => corridorBg(id, true) + `<rect x="1300" y="300" width="200" height="320" fill="#7A5236"/><rect x="1290" y="250" width="220" height="44" rx="6" fill="#2F5DA8"/><text x="1400" y="282" font-size="24" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>MUSIC ROOM</text>`,
    fg: (u, g, id, v) => {
      const x = lerp(200, 1180, seg(u, 0, 0.9)), roll = g * 4;
      const caseX = x - 190;
      return `<g transform="translate(${f(caseX)},${720})"><ellipse cx="0" cy="-110" rx="110" ry="120" fill="#3A3A44" stroke="${INK}" stroke-width="5"/><ellipse cx="0" cy="-110" rx="80" ry="88" fill="none" stroke="#5A5A66" stroke-width="5"/><rect x="-10" y="-236" width="20" height="30" rx="4" fill="#5A5A66"/><circle cx="-50" cy="10" r="18" fill="#1E1E22"/><circle cx="50" cy="10" r="18" fill="#1E1E22"/><line x1="-50" y1="10" x2="${f(-50 + Math.cos(roll) * 14)}" y2="${f(10 + Math.sin(roll) * 14)}" stroke="#8A8A90" stroke-width="3"/></g>` +
        person({ x, y: 740, s: 1.5, who: 'drummer', pose: { ...P.walk(g * 1.4, 1), aB: 70, eB: 10 }, g }) + flashback(id) + timeTag(200, 120, '2:20', v);
    },
    cam: [[800, 470, 1600], [950, 470, 1450]],
  },
  'e.benWow': {
    bg: (id) => gateBg(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#EDE8DE" opacity=".5"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'ben', g, open: 1.3, brow: -0.4, mouth: 0.55, look: 0.4, nod: Math.max(0, Math.sin(g * 9)) * seg(u, 0.1, 0.5) }) + Array.from({ length: 6 }, (_, i) => { const a = i * 1.05 + g; return `<path d="M${f(1140 + Math.cos(a) * 80)},${f(260 + Math.sin(a) * 80)} l6,16 l16,6 l-16,6 l-6,16 l-6,-16 l-16,-6 l16,-6 z" fill="${GOLD}" opacity="${f(0.5 + 0.5 * Math.sin(g * 4 + i))}"/>`; }).join(''),
    cam: [[800, 460, 1250], [800, 450, 1100]],
  },
  // ---------- 17 回到礼堂，桌子底下贴着一张黄纸条 ----------
  'e.underTable': {
    bg: (id) => sky(id, '#2A2420', '#3A302A') + `<path d="M-200,-200 L1800,-200 L1800,260 L-200,260 Z" fill="#23386A"/><path d="M-200,260 L1800,260" stroke="${GOLD}" stroke-width="12" stroke-dasharray="10 8"/><rect x="200" y="260" width="40" height="900" fill="#4A2E1E"/><rect x="1360" y="260" width="40" height="900" fill="#4A2E1E"/><path d="M-200,820 L1800,820 L1800,1100 L-200,1100 Z" fill="#6E4C30"/>`,
    fg: (u, g, id) => glow(id, 820, 300, 220, g, 0, 0.35 + 0.25 * Math.sin(g * 3)) + `<g transform="translate(760,262) rotate(3)"><rect width="130" height="120" fill="#F6DC5A"/><rect width="130" height="16" fill="#EFD24C"/><path d="M14,46 h90 M14,72 h70 M60,98 h40" stroke="#2B2A6E" stroke-width="5" stroke-linecap="round" opacity=".7"/></g>` +
      reachHand(lerp(1560, 1000, seg(u, 0.1, 0.7)), lerp(1060, 540, seg(u, 0.1, 0.7))),
    cam: [[800, 450, 1600], [820, 380, 1100]],
  },
  'e.note': {
    bg: (id) => sky(id, '#3A302A', '#2A2420'),
    fg: (u, g, id) => glow(id, 800, 450, 420, g, 0, 0.3) + stickyNote(640, 270, 1.15, seg(u, 0.05, 0.85)),
    cam: [[820, 440, 1000], [820, 430, 880]],
  },
  'e.noteHold': {
    bg: (id) => sky(id, '#3A302A', '#2A2420'),
    fg: (u, g, id) => glow(id, 800, 450, 420, g, 0, 0.3) + stickyNote(640, 270, 1.15, 1),
    cam: [[820, 430, 880], [820, 430, 860]],
  },
  // ---------- 19 M…… Green 老师的名字是 Margaret（悄悄话；Green 老师在后面打电话） ----------
  'e.whisper': {
    bg: (id) => backstageBg(id),
    fg: (u, g, id) => `<g opacity=".55" filter="url(#${id}s)">${person({ x: 1260, y: 640, s: 1.0, who: 'green', pose: { ...P.stand(), aF: 135, eF: 135, head: 6 }, g, face: -1, hold: 'phone' })}</g>` +
      person({ x: 640, y: 880, s: 2.1, who: 'you', pose: { ...P.stand(), lean: 6, head: 10 }, g, mood: 'shock' }) + person({ x: 930, y: 880, s: 2.15, who: 'ben', pose: { ...P.stand(), lean: 14, head: 12, aF: 100, eF: 120 }, g, face: -1 }),
    cam: [[820, 520, 1300], [800, 500, 1150]],
  },
  // ---------- 20 侦探笔记的第一行 ----------
  'e.write': {
    bg: (id) => sky(id, '#6E4C30', '#5E3E26'),
    fg: (u, g) => { const k = seg(u, 0.1, 0.9); const px = 1010 + Math.sin(g * 9) * 14; return notebookPage(500, 230, 1.1, 'Clue 1: ', 1) + `<path d="M${f(px)},${f(380 - 10 * Math.sin(g * 9))} l120,-260" stroke="#E4B83E" stroke-width="16" stroke-linecap="round" opacity="${f(0.4 + 0.6 * k)}"/><path d="M${f(px)},${f(380 - 10 * Math.sin(g * 9))} l10,-22" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>`; },
    cam: [[820, 450, 1000], [820, 440, 900]],
  },
  // ---------- 21 Green 老师还在打电话，不看你们 ----------
  'e.greenPhone': {
    bg: (id) => backstageBg(id),
    fg: (u, g) => person({ x: lerp(900, 1040, (Math.sin(g * 0.8) + 1) / 2), y: 840, s: 2.0, who: 'green', pose: { ...P.walk(g * 0.8, 0.4), aF: 135, eF: 135, head: 8 }, g, face: Math.sin(g * 0.8) > 0 ? 1 : -1, hold: 'phone', mood: 'sad' }),
    cam: [[900, 520, 1200], [920, 520, 1100]],
  },
  // ---------- 22 M 是谁？鼓箱男孩是谁？还剩二十分钟 ----------
  'e.clockEnd': {
    bg: (id) => sky(id, '#D9C8A6', '#CDB892') + `<rect x="-200" y="700" width="2000" height="400" fill="#B78C5C"/>`,
    fg: (u, g) => clock(800, 390, 190, 2, 40 + u, g * 3) + `<text x="800" y="672" font-size="50" font-weight="900" fill="#8E2A26" text-anchor="middle" ${SANS} opacity="${f(seg(u, 0.4, 0.7))}">20 minutes left</text>`,
    cam: [[800, 440, 1000], [800, 450, 900]],
  },
  'e.board': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A'),
    fg: (u, g) => clueBoard(350, 210, 1.0, seg(u, 0, 0.95), g),
    cam: [[800, 450, 1250], [800, 440, 1120]],
  },
  'e.boardHold': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A'),
    fg: (u, g) => clueBoard(350, 210, 1.0, 1, g, true),
    cam: [[800, 440, 1120], [800, 440, 1100]],
  },
};
