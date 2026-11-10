// 英文故事二 The Time Capsule · Chapter 2：每一镜怎么画、怎么动（共用的人物、道具在 capsule.ts）
// 星期二：英语社活动室里看老合影（背面的名字、拍摄日期）→ 胡老师让去图书馆 → 高老师、顶层书架上的旧年鉴 → 1996 年的回忆（她们以前天天一起吃午饭；那年六月不说话了）
// → 电视上的林芳医生、搬去上海的卡车、周老师家 → 地址卡、给周老师的纸条 → 年鉴里的座右铭 → 照片上难过的林芳。
// 讲解用的小视频：tc2.clipWho（照片上用 who 指人）、tc2.clipOrder（词卡挪位置：间接问句）、tc2.clipTake / tc2.clipCost（take、spend、cost）、tc2.clipUsed（1996 → 2026 的空座位）、tc2.clipShelf（书架的三层）。
import { GOLD, INK, SKIN, clamp, f, glow, lerp, pin, rng, seg, sky, wav, type View } from './core';
import { P, faceCU, person } from './rig';
import { aiGlasses, clock, talk } from './shotsE1';
import { HAND, SANS, SERIF, TCC, brassKey, campusBg, ceilingFan, classPhoto, classroom96Bg, clubRoomBg, desk96, dustMotes, envelope, ginkgoFall, ginkgoLeaf, libraryBg, longTable, musicBox, notes, photoBack, photoSpot, seat, sitter, teaTable, tinBox, tinTop, tint96, yearbook, zhouHomeBg, type YearbookEntry } from './capsule';
import type { ShotDef } from './Film';

// ---------------- 小工具 ----------------
/** 木头桌面（拍照片、年鉴、纸条的特写都放在桌上） */
const woodBg = (id: string, dark = 0) => sky(id, dark ? '#4E3422' : '#7A5236', dark ? '#3A2618' : '#6A4428') + Array.from({ length: 9 }, (_, i) => `<path d="M-200,${i * 120 - 40} Q800,${i * 120 - 10} 1800,${i * 120 - 40}" stroke="#5E3E26" stroke-width="3" opacity=".4" fill="none"/>`).join('');
/** 只露出一块矩形里的东西（照片背面的字有时会写出纸边，剪掉） */
const clipRect = (key: string, x: number, y: number, w: number, h: number, inner: string, rot = 0) => `<clipPath id="${key}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" transform="rotate(${rot} ${f(x)} ${f(y)})"/></clipPath><g clip-path="url(#${key})">${inner}</g>`;
/** 指着照片的手指（指尖在 x、y，朝上；rot 歪一点） */
const finger = (x: number, y: number, s = 1, rot = 0) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><path d="M-46,150 L46,150 L64,520 L-64,520 Z" fill="${TCC.uni}" stroke="${INK}" stroke-width="4"/><path d="M-48,176 L48,176" stroke="#F4F4F0" stroke-width="12"/>` +
  `<path d="M-50,150 Q-62,96 -44,74 L40,74 Q60,100 50,150 Z" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>` + [[-30, 74], [-10, 74], [10, 74], [30, 76]].map(([fx, fy], i) => i === 0 ? '' : `<rect x="${fx - 10}" y="${fy - 6}" width="20" height="34" rx="10" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>`).join('') +
  `<rect x="-42" y="-4" width="22" height="90" rx="11" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/><path d="M-36,8 q5,-6 10,0" stroke="${INK}" stroke-opacity=".4" stroke-width="2" fill="none"/></g>`;
/** 金色的圈（亮一下、呼吸） */
const ring = (x: number, y: number, r: number, k: number, g: number, c = GOLD) => k <= 0.01 ? '' : `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * (1 + 0.05 * Math.sin(g * 4)))}" fill="none" stroke="${c}" stroke-width="7" opacity="${f(k)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r + 12)}" fill="none" stroke="${c}" stroke-width="2.5" opacity="${f(0.5 * k)}"/>`;
/** 年份牌（和 tint96 的一个样子；fx 留出边，小视频两边会裁掉一点） */
const yearTag = (v: View | undefined, t: string, k = 1, fx = 0.08) => k <= 0.01 ? '' : pin(v, fx, 0.09, `<g opacity="${f(k)}"><rect x="0" y="-46" width="${36 + t.length * 24}" height="64" rx="8" fill="#2A1E14" opacity=".72"/><text x="${f((36 + t.length * 24) / 2)}" y="2" font-size="42" font-weight="700" fill="#F2DDB0" text-anchor="middle" letter-spacing="2" ${SERIF}>${t}</text></g>`, 140, 90);
/** 图书馆的借书台（x 是台子中心，y 是地面）；人站在后面，先画人再画台子 */
const libDesk = (x: number, y: number, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-190" y="-196" width="380" height="20" rx="4" fill="#A8784A" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><rect x="-180" y="-178" width="360" height="178" fill="#7A5236" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><rect x="-160" y="-160" width="320" height="64" fill="#6A4428"/><rect x="66" y="-150" width="120" height="44" rx="4" fill="#E8DCC0"/><text x="126" y="-120" font-size="24" font-weight="900" fill="#5A3A2A" text-anchor="middle" ${SANS}>LIBRARY</text>` +
  `<rect x="-170" y="-236" width="90" height="40" fill="#2F4E7A"/><rect x="-166" y="-262" width="82" height="26" fill="#8E2A26"/><path d="M120,-196 L132,-270 M132,-270 l40,-8" stroke="#3A3A40" stroke-width="6" fill="none"/><path d="M150,-286 l44,-10 l6,26 z" fill="#3E5A44"/><circle cx="60" cy="-204" r="10" fill="#C23B2E"/><rect x="52" y="-226" width="16" height="16" fill="#5A3A2A"/></g>`;
/** 一摞年鉴（暗红书脊、两道金线） */
const ybPile = (x: number, y: number, n: number, s = 1, seed = 1) => { const r = rng(seed); let o = ''; for (let i = 0; i < n; i++) { const dx = (r() - 0.5) * 14; o += `<g transform="translate(${f(x + dx)},${f(y - i * 15 * s)}) scale(${f(s)})"><rect x="-46" y="-14" width="92" height="14" fill="${i % 3 === 1 ? '#5E2622' : '#6E2E2A'}" stroke="${INK}" stroke-opacity=".5" stroke-width="1.2"/><path d="M-30,-14 v14 M30,-14 v14" stroke="${GOLD}" stroke-width="2"/></g>`; } return o; };
/** 顶层书架上的一排年鉴（x0—x1，y 是这层的底） */
const ybRow = (x0: number, x1: number, y: number, seed = 2) => { const r = rng(seed); let o = '', x = x0; while (x < x1 - 20) { const w = 18 + r() * 6, h = 92 + r() * 10; o += `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${r() < 0.5 ? '#6E2E2A' : '#5E2622'}" stroke="#2A1612" stroke-opacity=".6"/><path d="M${f(x + 2)},${f(y - h + 16)} h${f(w - 4)} M${f(x + 2)},${f(y - 20)} h${f(w - 4)}" stroke="${GOLD}" stroke-width="2.4"/>`; x += w + 1; } return o + `<rect x="${f(x0 - 12)}" y="${f(y)}" width="${f(x1 - x0 + 24)}" height="12" fill="#4E3420"/>`; };
/** 灰尘一扑（k 0—1） */
const puff = (x: number, y: number, k: number, g: number, seed = 3, n = 26, s = 1) => { if (k <= 0.01) return ''; const r = rng(seed); let o = ''; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = (40 + r() * 140) * k * s; o += `<circle cx="${f(x + Math.cos(a) * d + wav(g, 3 + r() * 2, r()) * 6)}" cy="${f(y + Math.sin(a) * d * 0.6 - k * 30)}" r="${f((3 + r() * 9) * s)}" fill="#E8DFCC" opacity="${f(0.55 * (1 - k * 0.6) * (0.4 + r() * 0.6))}"/>`; } return o; };
/** 小卡片（白纸 + 横线），x、y 左上角 */
const indexCard = (x: number, y: number, w: number, h: number, rot = 0, c = '#FBF8EE') => `<g transform="translate(${f(x)},${f(y)}) rotate(${rot})"><rect x="8" y="10" width="${w}" height="${h}" fill="#000" opacity=".22"/><rect width="${w}" height="${h}" fill="${c}" stroke="#B8AE98" stroke-width="2"/><line x1="0" y1="54" x2="${w}" y2="54" stroke="#D9746A" stroke-width="2"/>${Array.from({ length: Math.floor((h - 60) / 64) }, (_, i) => `<line x1="20" y1="${118 + i * 64}" x2="${w - 20}" y2="${118 + i * 64}" stroke="#BCD0E4" stroke-width="2"/>`).join('')}</g>`;
/** 一支笔（笔尖在 x、y） */
const pen = (x: number, y: number, s = 1) => `<g transform="translate(${f(x)},${f(y)}) rotate(-38) scale(${f(s)})"><path d="M0,0 L-6,-20 L6,-20 Z" fill="#2B2722"/><rect x="-8" y="-200" width="16" height="182" rx="6" fill="#2F5DA8" stroke="${INK}" stroke-width="2"/><rect x="-9" y="-200" width="18" height="34" rx="6" fill="#D9A441"/></g>`;
/** 手写的字一个一个写出来：返回 [svg, 写到哪儿的 x]（按字宽估） */
const writeLine = (x: number, y: number, t: string, k: number, size: number, c = TCC.ink, extra = '') => { const n = Math.round(clamp(k) * t.length); return [`<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${c}" ${HAND} ${extra}>${t.slice(0, n).replace(/&/g, '&amp;')}</text>`, x + n * size * 0.46] as [string, number]; };
/** 黑板上的粉笔道道（不写字，免得和年份牌叠在一起） */
const chalk = (seed = 1) => { const r = rng(seed + 30); let o = ''; for (let i = 0; i < 5; i++) { const y = 200 + i * 52, x0 = 300 + r() * 40, w = 260 + r() * 420; o += `<path d="M${f(x0)},${f(y)} q${f(w / 4)},-8 ${f(w / 2)},0 t${f(w / 2)},0" stroke="#EDEDE4" stroke-width="5" fill="none" opacity=".55"/>`; } return o + `<path d="M820,380 l60,-40 l60,40 l-60,40 z" stroke="#EDEDE4" stroke-width="4" fill="none" opacity=".45"/>`; };
/** 1996 年的街：一排旧楼、行道树、柏油路 */
const street96 = (id: string) => {
  let s = sky(id, '#D6E0E2', '#EFE6CF');
  for (let i = 0; i < 4; i++) { const bx = -160 + i * 470; s += `<rect x="${bx}" y="200" width="420" height="440" fill="${['#B8A08A', '#A89888', '#BCA48C', '#A49480'][i]}" stroke="#7A6A5A" stroke-width="3"/>` + Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => `<rect x="${bx + 30 + c * 98}" y="${230 + r * 96}" width="58" height="58" fill="#8FA4AC" stroke="#E8DFCC" stroke-width="4"/>`).join('')).join('') + `<rect x="${bx + 20}" y="${270}" width="380" height="6" fill="#7A6A5A" opacity=".5"/>`; }
  s += `<path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#7E7A74"/><path d="M-200,640 L1800,640 L1800,676 L-200,676 Z" fill="#B8B0A2"/>` + Array.from({ length: 10 }, (_, i) => `<rect x="${-180 + i * 210}" y="840" width="110" height="10" fill="#E8E2D6" opacity=".8"/>`).join('');
  [60, 520, 980, 1440].forEach((tx, i) => { s += `<rect x="${tx - 9}" y="470" width="18" height="190" fill="#5E4A36"/><circle cx="${tx}" cy="440" r="${70 - i * 3}" fill="#6E8A5A"/><circle cx="${tx - 34}" cy="474" r="46" fill="#5E7A4C"/><circle cx="${tx + 38}" cy="470" r="44" fill="#7A9A66"/>`; });
  return s;
};
/** 搬家的卡车（车头朝右，x、y 是后轮落地处）：车斗里绑着柜子、箱子、一辆自行车 */
const truck = (x: number, y: number, s: number, g: number) => {
  const a = g * 300;
  const wheel = (cx: number) => `<g transform="translate(${cx},-34)"><circle r="34" fill="#1E1E22"/><circle r="16" fill="#8A8A90"/><path d="M0,0 L${f(Math.cos((a * Math.PI) / 180) * 14)},${f(Math.sin((a * Math.PI) / 180) * 14)}" stroke="#3A3A40" stroke-width="4"/></g>`;
  let o = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="160" cy="0" rx="300" ry="14" fill="#000" opacity=".18"/>`;
  o += `<rect x="-120" y="-120" width="380" height="60" fill="#4E6E5A" stroke="${INK}" stroke-width="3"/><rect x="-120" y="-180" width="16" height="60" fill="#4E6E5A" stroke="${INK}" stroke-width="2"/>`; // 车斗
  o += `<rect x="-96" y="-300" width="110" height="180" fill="#8A5A36" stroke="${INK}" stroke-width="3"/><path d="M-41,-300 V-120" stroke="${INK}" stroke-width="2"/><circle cx="-50" cy="-210" r="4" fill="${GOLD}"/><circle cx="-32" cy="-210" r="4" fill="${GOLD}"/>`; // 柜子
  o += `<rect x="30" y="-210" width="100" height="90" fill="#C8A878" stroke="${INK}" stroke-width="2.5"/><rect x="40" y="-280" width="80" height="70" fill="#B8986A" stroke="${INK}" stroke-width="2.5"/><rect x="140" y="-190" width="100" height="70" fill="#C8A878" stroke="${INK}" stroke-width="2.5"/><path d="M30,-165 h100 M140,-155 h100" stroke="#8A6A44" stroke-width="3"/>`; // 箱子
  o += `<g transform="translate(150,-232) scale(.8)"><circle cx="-30" cy="0" r="26" fill="none" stroke="#2A2A30" stroke-width="5"/><circle cx="40" cy="0" r="26" fill="none" stroke="#2A2A30" stroke-width="5"/><path d="M-30,0 L0,-36 L40,0 M0,-36 L-8,0 M-6,-46 h20" stroke="#3A3A44" stroke-width="5" fill="none"/></g>`; // 自行车
  o += `<path d="M-110,-300 L250,-120" stroke="#5A4630" stroke-width="3"/><path d="M-110,-180 L250,-300" stroke="#5A4630" stroke-width="2" opacity=".6"/>`; // 绳子
  o += `<path d="M260,-60 L260,-200 L360,-200 L410,-120 L420,-60 Z" fill="#3E5E8A" stroke="${INK}" stroke-width="3"/><path d="M276,-188 L346,-188 L384,-126 L276,-126 Z" fill="#BFD4DE" stroke="${INK}" stroke-width="2"/><rect x="396" y="-84" width="26" height="14" fill="#F2E6A0"/>`; // 车头
  o += `<rect x="-130" y="-66" width="560" height="16" fill="#2A2A30"/>` + wheel(0) + wheel(340);
  return o + `</g>`;
};
/** 北京 → 上海的小地图（钉在画面一角）：k 小红点走到哪儿 */
const miniMap = (k: number) => `<g><rect x="0" y="0" width="330" height="250" rx="12" fill="#F4ECD8" stroke="#8A7A5E" stroke-width="4"/><path d="M60,40 Q140,60 190,110 Q230,150 250,210" stroke="#B8322A" stroke-width="4" stroke-dasharray="12 8" fill="none"/>` +
  `<path d="M200,20 Q250,60 240,110 Q280,150 300,230" stroke="#8AA4B0" stroke-width="10" fill="none" opacity=".6"/>` + // 海岸线
  `<circle cx="60" cy="40" r="10" fill="#2F5DA8"/><text x="80" y="48" font-size="28" font-weight="700" fill="#2F5DA8" ${SANS}>Beijing</text><circle cx="250" cy="210" r="10" fill="#B8322A"/><text x="232" y="218" font-size="28" font-weight="700" fill="#B8322A" text-anchor="end" ${SANS}>Shanghai</text>` +
  (() => { const t = clamp(k), bx = (1 - t) * (1 - t) * 60 + 2 * (1 - t) * t * 190 + t * t * 250, by = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 110 + t * t * 210; return `<circle cx="${f(bx)}" cy="${f(by)}" r="9" fill="#E8833A" stroke="#fff" stroke-width="3"/>`; })() + `</g>`;
/** 电视里的林芳医生：白大褂盖在 faceCU 的肩膀上（坐标和 faceCU 一样） */
const whiteCoat = (x: number, y: number, s: number, g: number) => { const b = Math.sin(g * 1.4) * 2; return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-300,${f(420 + b)} Q-280,236 -60,${f(178 + b)} L-6,${f(250 + b)} L40,${f(420 + b)} Z M320,${f(420 + b)} Q290,226 90,${f(182 + b)} L118,${f(250 + b)} L72,${f(420 + b)} Z" fill="#F6F8F8" stroke="${INK}" stroke-opacity=".45" stroke-width="3"/><path d="M-6,${f(250 + b)} L-30,${f(300 + b)} L12,${f(330 + b)} M118,${f(250 + b)} L140,${f(300 + b)} L96,${f(330 + b)}" stroke="#C8D0D4" stroke-width="4" fill="none"/>` +
  `<path d="M-30,${f(196 + b)} Q-70,320 -10,${f(380 + b)} M140,${f(204 + b)} Q170,320 120,${f(370 + b)}" stroke="#3A4A5A" stroke-width="7" fill="none"/><circle cx="-10" cy="${f(392 + b)}" r="16" fill="#8A9AA6" stroke="#3A4A5A" stroke-width="4"/><rect x="-250" y="${f(330 + b)}" width="70" height="40" rx="4" fill="#E8F0F4" stroke="#7A8A96" stroke-width="2"/></g>`; };

// ---------------- 合影上的位置 ----------------
const PX = 160, PY = 110, PS = 2; // 大照片：tableTop 上放大两倍（640×430 → 1280×860）
const YU = photoSpot(PX, PY, PS, 'yu'), FANG = photoSpot(PX, PY, PS, 'fang');
/** 合影中排第 i 个人的脸（和 capsule.ts 的排法一样：中排 10 个，从 95 起，每隔 50） */
const midFace = (i: number) => [PX + (20 + 95 + i * 50) * PS, PY + (20 + 178) * PS];
/** 从放大的合影里剪一个圆：只露出某人的脸和肩（小头像用） */
const portrait = (id: string, key: string, who: 'fang' | 'yu', cx: number, cy: number, r: number, s: number, o: { look?: number } = {}) => {
  const p = photoSpot(0, 0, s, who), x = cx - p[0], y = cy - p[1] + r * 0.12;
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r + 10)}" fill="#F2EBDA" stroke="#C8BCA0" stroke-width="3"/><clipPath id="${id}${key}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/></clipPath><g clip-path="url(#${id}${key})">${classPhoto(id, x, y, s, { fangLook: o.look ?? 0 }).replace(/<text[^>]*>Class 3, Grade 9[^<]*<\/text>/, '')}</g>`;
};

const YB_PAGES: YearbookEntry[] = [
  { name: 'Lin Fang', motto: 'Never give up.', hair: 'crop' },
  { name: 'Chen Yu', motto: 'Music makes the world go round.', wish: 'My dream: to be a music teacher.', hair: 'braids' },
  { name: 'Liu Yang', motto: 'Work hard, play hard.', hair: 'boy' },
  { name: 'Zhao Min', motto: 'Every day is a new day.', hair: 'pony' },
];
/** 1996 年：两个人隔着课桌面对面坐着吃午饭（窗边） */
const lunch96 = (id: string, u: number, g: number, whisper: number) => {
  let o = `<path d="M1250,150 L1550,150 L1640,720 L1060,720 Z" fill="#FFF4D8" opacity=".18"/>`;
  o += seat('desk96', 860, 880, 1.6, 1) + person({ x: 860, y: 880, s: 1.6, who: 'yu', pose: { ...P.sitRest(), aF: 70, eF: 34, head: lerp(4, -4, whisper), lean: lerp(2, 8, whisper) }, g, face: 1, mood: 'laugh', detail: true });
  o += seat('desk96', 1300, 880, 1.66, -1) + person({ x: 1300, y: 880, s: 1.66, who: 'fang', pose: { ...P.sitRest(), aF: lerp(70, 40, whisper), eF: lerp(34, 80, whisper), head: lerp(6, 16, whisper), lean: lerp(4, 22, whisper) }, g, face: -1, mood: 'laugh', detail: true });
  o += desk96(1080, 880, 1.2);
  // 桌上：饭盒（两个人的筷子）、一本书
  o += `<g transform="translate(1080,716)"><rect x="-60" y="-26" width="120" height="26" rx="6" fill="#C8CCD0" stroke="${INK}" stroke-opacity=".6" stroke-width="2"/><rect x="-56" y="-34" width="112" height="10" rx="4" fill="#A8B0B6"/><path d="M-70,-30 L-20,-48 M-66,-26 L-16,-44 M70,-30 L20,-48 M66,-26 L16,-44" stroke="#8A5A36" stroke-width="4" stroke-linecap="round"/><g transform="translate(-130,-6) rotate(-6)"><rect x="-40" y="-14" width="80" height="14" fill="#2F4E7A"/><rect x="-40" y="-20" width="80" height="6" fill="#F4EEE0"/></g></g>`;
  if (whisper > 0.6) o += `<text x="1090" y="560" font-size="34" font-weight="900" fill="#8A5A36" text-anchor="middle" opacity="${f(0.5 + 0.5 * Math.sin(g * 3))}" ${HAND}>shh…</text>`;
  return o;
};

export const SHOTS_C2: Record<string, ShotDef> = {
  // ---------- 1 星期二上午：你和 Tao 在英语社活动室里，对着窗户看那张老合影 ----------
  'tc2.clubRoom': {
    bg: (id) => clubRoomBg(id, 4),
    fg: (u, g, id) => {
      const up = seg(u, 0.05, 0.4);
      return person({ x: 640, y: 760, s: 1.75, who: 'you', pose: { ...P.stand(), head: -10 * up }, g, face: 1, detail: true }) +
        person({ x: 900, y: 760, s: 1.8, who: 'tao', pose: { ...P.stand(), aF: lerp(30, 128, up), eF: lerp(40, 22, up), head: -12 * up, lean: -4 * up }, g, face: 1, hold: 'photo', detail: true, mood: 'laugh' }) +
        glow(id, 1000, 470, 90, g, 0, 0.5 * up) + longTable(800, 640, 980) + tinBox(id, 500, 640, 0.55, { lid: 1, g }) + envelope(660, 626, 0.28, 'pink', { rot: 10 });
    },
    cam: [[870, 490, 1000], [870, 500, 960]],
  },
  // ---------- 1 / 5 照片背面：一排一排的名字（中排的 Lin Fang、Chen Yu 被划出来） ----------
  'tc2.photoBack': {
    bg: (id) => woodBg(id),
    fg: (u, g, id) => clipRect(`${id}pbk`, 256, 84, 1088, 731, photoBack(256, 84, 1.7, { mark: 'both', markK: seg(u, 0.35, 0.85) })),
    cam: [[800, 450, 1500], [800, 450, 1380]],
  },
  // ---------- 2 Tao 的手指顺着中排找过去：捧着八音盒的那个女孩 ----------
  'tc2.photo': {
    bg: (id) => woodBg(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.05, 0.55), fx = lerp(midFace(0)[0], YU[0] + 6, k), fy = YU[1] + 104 + Math.sin(k * Math.PI * 4) * 8 * (1 - k);
      return classPhoto(id, PX, PY, PS, { mark: u > 0.55 ? 'yu' : undefined, markK: seg(u, 0.58, 0.85) }) + finger(fx, fy, 1, -8);
    },
    cam: [[800, 450, 1600], [890, 612, 820]],
  },
  // ---------- 3 她旁边高个子、短头发的是林芳——粉色的信是她写的 ----------
  'tc2.photoFang': {
    bg: (id) => woodBg(id),
    fg: (u, g, id) => {
      const e = seg(u, 0.4, 0.75);
      return classPhoto(id, PX, PY, PS, { mark: 'fang', markK: seg(u, 0.08, 0.4) }) +
        (e > 0 ? `<path d="M${f(FANG[0] - 70)},${f(FANG[1] + 20)} L${f(FANG[0] - 30)},${f(FANG[1] + 8)}" stroke="#C8322A" stroke-width="3" stroke-dasharray="8 6" opacity="${f(e)}"/><g opacity="${f(e)}">${envelope(FANG[0] - 150, FANG[1] + 60 - e * 20, 0.34, 'pink', { rot: -12 })}<text x="${f(FANG[0] - 120)}" y="${f(FANG[1] + 84 - e * 20)}" font-size="46" font-weight="700" fill="${TCC.ink}" text-anchor="middle" ${HAND}>F</text></g>` : '');
    },
    cam: [[830, 590, 700], [820, 560, 600]],
  },
  // ---------- 4 Tao：隔了三十年，怎么找？（1996 → 2026） ----------
  'tc2.taoThink': {
    bg: (id) => sky(id, '#E8DCC2', '#D9C8A6') + `<rect x="1000" y="80" width="420" height="520" fill="#E2E8E4" stroke="#F4EEE4" stroke-width="14" opacity=".7"/>`,
    fg: (u, g, id) => {
      const yr = Math.round(lerp(1996, 2026, seg(u, 0.15, 0.75)));
      return faceCU({ id, x: 600, y: 470, s: 1.15, who: 'tao', g, open: 1, brow: lerp(0, 0.7, seg(u, 0.1, 0.5)), mouth: talk(g, 0.5), look: 0.3 }) +
        `<g transform="translate(1180,360)"><rect x="-150" y="-80" width="300" height="140" rx="14" fill="#2B2722" opacity=".85"/><text x="0" y="30" font-size="96" font-weight="700" fill="#F2DDB0" text-anchor="middle" ${SERIF}>${yr}</text></g>` +
        `<text x="1180" y="540" font-size="46" font-weight="900" fill="#8E2A26" text-anchor="middle" opacity="${f(seg(u, 0.75, 0.9))}" ${SANS}>30 years</text>`;
    },
    cam: [[780, 460, 1250], [800, 450, 1150]],
  },
  // ---------- 5 名字下面还有一行：Taken on June 28, 1996——和盒子上的日子是同一天 ----------
  'tc2.photoDate': {
    bg: (id) => woodBg(id),
    fg: (u, g, id) => {
      const hl = seg(u, 0.1, 0.35), tin = seg(u, 0.4, 0.6), ln = seg(u, 0.62, 0.85);
      return clipRect(`${id}pdt`, 50, 120, 960, 645, `<g transform="translate(50,120) scale(1.5)">${photoBack(0, 0, 1)}<rect x="34" y="370" width="${f(330 * hl)}" height="40" fill="#F6DC5A" opacity=".55"/><text x="40" y="398" font-size="27" font-weight="700" fill="${TCC.ink}" ${HAND}>Taken on June 28, 1996.</text></g>`) +
        (tin > 0 ? `<g opacity="${f(tin)}" transform="translate(${f(30 * (1 - tin))},0)">${tinTop(1300, 380, 0.56, { dirt: 0.4, rot: 3 })}</g>` : '') +
        (ln > 0 ? `<path d="M560,${f(735)} Q980,${f(760 - 60 * ln)} ${f(lerp(560, 1150, ln))},${f(lerp(735, 410, ln))}" stroke="${GOLD}" stroke-width="6" stroke-dasharray="14 9" fill="none"/>${ln > 0.95 ? `<circle cx="1150" cy="410" r="12" fill="${GOLD}"/>` : ''}` : '');
    },
    cam: [[780, 450, 1580], [780, 450, 1560]],
  },
  // ---------- 6 胡老师：去图书馆问问高老师 ----------
  'tc2.huSays': {
    bg: (id) => clubRoomBg(id, 4),
    fg: (u, g) => {
      const k = seg(u, 0.1, 0.4);
      return person({ x: 540, y: 780, s: 1.95, who: 'you', pose: P.stand(), g, face: 1, detail: true }) + person({ x: 740, y: 780, s: 2.0, who: 'tao', pose: P.stand(), g, face: 1, hold: 'photo', detail: true }) +
        person({ x: 1190, y: 780, s: 1.98, who: 'hu', pose: { ...P.stand(), aF: lerp(10, 158, k), eF: lerp(14, -6, k), head: -10 * k }, g, face: -1, detail: true, mood: 'laugh' });
    },
    cam: [[870, 500, 1000], [870, 515, 960]],
  },
  // ---------- 7 AI 眼镜在翻译（误译那道题） ----------
  'tc2.glasses': {
    bg: (id) => woodBg(id) + `<g opacity=".5">${photoBack(320, 160, 1.4)}</g><rect x="-200" y="-200" width="2000" height="1300" fill="#1C2440" opacity=".72"/>`,
    fg: (u, g) => aiGlasses(800, 430, 1.5, g) + `<text x="800" y="760" font-size="44" font-weight="900" fill="#CFE6F2" text-anchor="middle" ${SANS} opacity="${f(0.6 + 0.3 * Math.sin(g * 2))}">EN → 中文</text>`,
    cam: [[800, 450, 1600], [800, 440, 1450]],
  },
  // ---------- 8 顶楼的图书馆：安静、旧纸的味道；高老师在整理旧书 ----------
  'tc2.library': {
    bg: (id) => libraryBg(id),
    fg: (u, g) => {
      const reach = (Math.sin(g * 1.3) + 1) / 2;
      return dustMotes(2, g) + `<g transform="translate(640,790)"><rect x="-90" y="-120" width="180" height="16" fill="#8A6440"/><rect x="-90" y="-60" width="180" height="16" fill="#8A6440"/><path d="M-84,-104 V-20 M84,-104 V-20" stroke="#5A3E26" stroke-width="8"/><circle cx="-60" cy="-12" r="12" fill="#2A2A30"/><circle cx="60" cy="-12" r="12" fill="#2A2A30"/>${ybPile(-40, -120, 4, 0.8, 5)}${ybPile(40, -120, 3, 0.8, 6)}${ybPile(0, -60, 5, 0.8, 7)}</g>` +
        person({ x: 820, y: 790, s: 1.62, who: 'gao', pose: { ...P.stand(), aF: lerp(40, 112, reach), eF: lerp(60, 20, reach), head: -6 * reach, lean: 4 }, g, face: 1, hold: 'yearbook', detail: true });
    },
    cam: [[800, 450, 1600], [790, 520, 1150]],
  },
  // ---------- 10 / 17 / 21 借书台前：Tao 问高老师 ----------
  'tc2.taoAsk': {
    bg: (id) => libraryBg(id),
    fg: (u, g) => {
      const gest = (Math.sin(g * 4) + 1) / 2;
      return dustMotes(3, g) + person({ x: 1240, y: 800, s: 1.66, who: 'gao', pose: { ...P.stand(), aF: 30, eF: 50, head: 4 }, g, face: -1, detail: true }) + libDesk(1250, 800, 1) +
        person({ x: 640, y: 800, s: 1.66, who: 'you', pose: P.stand(), g, face: 1, detail: true }) + person({ x: 840, y: 800, s: 1.72, who: 'tao', pose: { ...P.stand(), aF: 30 + 14 * gest, eF: 40 + 10 * gest, head: -2 }, g, face: 1, detail: true });
    },
    cam: [[960, 520, 1250], [980, 520, 1150]],
  },
  // ---------- 11 “在最上面那一层。当心灰尘！”镜头顺着手指往上摇 ----------
  'tc2.topShelf': {
    bg: (id) => libraryBg(id) + ybRow(1052, 1328, 12, 4),
    fg: (u, g, id) => {
      const k = seg(u, 0.05, 0.3);
      return dustMotes(4, g) + person({ x: 920, y: 800, s: 1.8, who: 'gao', pose: { ...P.stand(), aF: lerp(10, 162, k), eF: lerp(14, -8, k), head: -26 * k, lean: -6 * k }, g, face: 1, detail: true }) +
        glow(id, 1190, -40, 200, g, 0, 0.45 * seg(u, 0.5, 0.8)) + puff(1190, -20, seg(u, 0.55, 1), g, 8, 40, 1.5);
    },
    cam: [[920, 540, 1200], [1150, 160, 900]],
  },
  // ---------- 12 好几百本年鉴，封面都一样：找了将近一个小时 ----------
  'tc2.search': {
    bg: (id) => libraryBg(id),
    fg: (u, g) => {
      const n = Math.floor(seg(u, 0.05, 0.9) * 12.99), flip = Math.sin(g * 5);
      return clock(770, 70, 58, 3, 5 + 50 * seg(u, 0, 1), g * 3) + dustMotes(5, g) +
        person({ x: 1166, y: 502, s: 1.42, who: 'you', pose: { ...P.stand(), aF: 160 + 6 * Math.sin(g * 2), eF: 6, aB: 40, eB: 40, head: -20 }, g, face: 1, hold: 'yearbook' }) +
        ybPile(820, 790, Math.min(7, n), 1, 9) + ybPile(920, 790, Math.max(0, n - 7), 1, 10) +
        sitter('tao', 620, 790, 1.6, g, { kind: 'stool', pose: { ...P.sitRest(), aF: 62 + 6 * flip, eF: 66, head: 14 }, hold: 'yearbook' });
    },
    cam: [[900, 440, 1600], [900, 450, 1480]],
  },
  'tc2.found': {
    bg: (id) => woodBg(id),
    fg: (u, g, id) => {
      const w = seg(u, 0.12, 0.7), wx = lerp(560, 1040, w);
      return yearbook(570, 450, 1.15, { open: 0 }) + `<clipPath id="${id}dst"><rect x="${f(wx)}" y="140" width="${f(1060 - wx)}" height="620"/></clipPath><g clip-path="url(#${id}dst)"><rect x="560" y="140" width="500" height="620" fill="#B8AFA0" opacity=".88"/>${Array.from({ length: 60 }, (_, i) => { const r = rng(i + 7); return `<circle cx="${f(570 + r() * 470)}" cy="${f(160 + r() * 580)}" r="${f(2 + r() * 5)}" fill="#9A9284" opacity=".6"/>`; }).join('')}</g>` +
        puff(wx, 450, w > 0 && w < 1 ? 0.6 : 0, g, 11, 22) + (w > 0 && w < 1 ? `<g transform="translate(${f(wx + 20)},${f(470 + Math.sin(g * 8) * 30)}) rotate(-12)"><path d="M-30,-90 Q-46,0 -20,90 L40,90 Q56,0 40,-90 Z" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/><path d="M40,90 L60,300 L-40,300 L-20,90" fill="${TCC.uni}" stroke="${INK}" stroke-width="3"/></g>` : '') +
        glow(id, 815, 500, 160, g, 0, 0.4 * seg(u, 0.72, 0.9));
    },
    cam: [[800, 450, 1300], [800, 450, 1150]],
  },
  // ---------- 13 高老师戴上眼镜一看：啊，Fang 和 Yu！ ----------
  'tc2.gaoLook': {
    bg: (id) => sky(id, '#5A4632', '#3E3024') + `<g opacity=".35">${libraryBg(id)}</g>`,
    fg: (u, g, id) => {
      const a = seg(u, 0.25, 0.4);
      const sp = photoSpot(930, 250, 0.62, 'fang'), sy = photoSpot(930, 250, 0.62, 'yu');
      return classPhoto(id, 930, 250, 0.62, { rot: 5 }) + [sp, sy].map(([x, y], i) => `<path d="M${f(x + 6)},${f(y - 36)} l4,12 l12,4 l-12,4 l-4,12 l-4,-12 l-12,-4 l12,-4 z" fill="#FFF6D0" opacity="${f(a * (0.5 + 0.5 * Math.sin(g * 4 + i)))}"/>`).join('') +
        faceCU({ id, x: 600, y: 480, s: 1.15, who: 'gao', g, open: lerp(0.8, 1.3, a), brow: lerp(0.3, -0.3, a), mouth: u > 0.4 ? 0.3 + talk(g, 0.5) : 0, look: 0.4 });
    },
    cam: [[780, 470, 1250], [800, 460, 1120]],
  },
  // ---------- 14 回忆：她们以前天天面对面坐在窗边，一起吃午饭、说悄悄话 ----------
  'tc2.flash96': {
    bg: (id) => classroom96Bg(id, { board: ['', '', ''] }) + chalk(),
    fg: (u, g, id, v) => ceilingFan(800, -40, 1, g) + lunch96(id, u, g, seg(u, 0.55, 0.75)) + tint96(id, v, { g, year: '1996' }),
    cam: [[960, 520, 1350], [1060, 560, 1100]],
  },
  // ---------- 15 可是那年六月，她们不说话了（各坐一边，八音盒合着） ----------
  'tc2.flashJune': {
    bg: (id) => classroom96Bg(id, { board: ['', '', ''] }) + chalk(2),
    fg: (u, g, id, v) => {
      const turn = seg(u, 0.2, 0.6);
      let o = ceilingFan(800, -40, 1, g * 0.6) + Array.from({ length: 26 }, (_, i) => { const r = rng(i + 40), x = 1260 + r() * 280, y = 160 + ((g * 260 + r() * 250) % 250); return `<path d="M${f(x)},${f(y)} l-4,18" stroke="#8AA0AC" stroke-width="2" opacity=".7"/>`; }).join('');
      o += seat('desk96', 470, 880, 1.6, 1) + person({ x: 470, y: 880, s: 1.6, who: 'yu', pose: { ...P.sitRest(), aF: 64, eF: 40, head: 22, lean: 10 }, g, face: 1, mood: 'sad', detail: true }) + desk96(560, 880, 1.25) + musicBox(id, 640, 715, 0.34, { lid: 0 });
      o += seat('desk96', 1180, 880, 1.66, 1) + person({ x: 1180, y: 880, s: 1.66, who: 'fang', pose: { ...P.sitRest(), aF: 60, eF: 50, head: lerp(4, 20, turn), lean: 6 }, g, face: 1, mood: 'sad', detail: true }) + desk96(1270, 880, 1.25);
      return o + `<rect x="-200" y="-200" width="2000" height="1300" fill="#2A3440" opacity=".14"/>` + tint96(id, v, { g, year: 'June 1996' });
    },
    cam: [[880, 520, 1500], [880, 540, 1350]],
  },
  // ---------- 16 Tao：我们知道为什么。是那只八音盒。（桌上：粉信封、小铜钥匙；回忆里那只不响了的八音盒） ----------
  'tc2.taoKey': {
    bg: (id) => woodBg(id, 1),
    fg: (u, g, id) => {
      const m = seg(u, 0.2, 0.55);
      return envelope(560, 600, 0.78, 'pink', { rot: -8, open: 1, peek: 0.45 }) + brassKey(980, 700, 1.4, { rot: -64, g, glint: 1 }) + glow(id, 940, 610, 120, g, 0, 0.35) +
        (m > 0 ? `<g opacity="${f(m)}"><circle cx="1120" cy="290" r="196" fill="#E8D8B4"/><clipPath id="${id}mem"><circle cx="1120" cy="290" r="186"/></clipPath><g clip-path="url(#${id}mem)"><rect x="900" y="80" width="440" height="420" fill="#C9B79A"/>${musicBox(id, 1120, 390, 0.95, { lid: 0, g })}<rect x="900" y="80" width="440" height="420" fill="#9C7E52" opacity=".55" style="mix-blend-mode:color"/></g><circle cx="1120" cy="290" r="190" fill="none" stroke="#F2EBDA" stroke-width="10"/></g>` : '');
    },
    cam: [[820, 450, 1500], [840, 450, 1350]],
  },
  // ---------- 18 （问话填空）她们俩现在在哪儿？ ----------
  'tc2.twoQ': {
    bg: (id) => woodBg(id),
    fg: (u, g, id) => {
      const q = 0.7 + 0.3 * Math.sin(g * 3);
      return portrait(id, 'pf', 'fang', 520, 420, 170, 9) + portrait(id, 'py', 'yu', 1080, 420, 170, 9) +
        `<text x="520" y="690" font-size="46" font-weight="700" fill="#F2EBDA" text-anchor="middle" ${HAND}>Lin Fang</text><text x="1080" y="690" font-size="46" font-weight="700" fill="#F2EBDA" text-anchor="middle" ${HAND}>Chen Yu</text>` +
        `<text x="800" y="470" font-size="${f(150 + 8 * Math.sin(g * 3))}" font-weight="900" fill="#F6DC5A" text-anchor="middle" opacity="${f(q)}" ${SANS}>?</text>`;
    },
    cam: [[800, 450, 1500], [800, 460, 1400]],
  },
  // ---------- 19 林芳当了医生：去年在电视上看到过她（北京的儿童医院） ----------
  'tc2.tv': {
    bg: (id) => sky(id, '#D9CBB0', '#C9B48E') + `<rect x="-200" y="700" width="2000" height="400" fill="#8A6A48"/><rect x="250" y="660" width="1100" height="60" fill="#6E4C30"/>`,
    fg: (u, g, id) => {
      let scr = `<rect x="350" y="140" width="900" height="490" fill="#EAF2F4"/>` + [[420, 190, '#F2C14E'], [560, 230, '#7FB3E0'], [1080, 190, '#E8833A'], [1190, 190, '#8ACB8A']].map(([x, y, c]) => `<g transform="translate(${x},${y}) rotate(${(+x % 7) - 3})"><rect x="-44" y="-34" width="88" height="68" fill="#fff" stroke="#C8D0D4" stroke-width="2"/><circle cx="-10" cy="-4" r="16" fill="${c}"/><path d="M-36,26 Q0,6 36,26" stroke="${c}" stroke-width="5" fill="none"/></g>`).join('') +
        `<rect x="1000" y="330" width="250" height="230" fill="#D8E6EC"/><path d="M1000,330 V560" stroke="#B8C8D0" stroke-width="6"/>`;
      scr += faceCU({ id, x: 1000, y: 380, s: 0.56, who: 'fang2', g, open: 1, mouth: talk(g, 0.45), look: 0.1 }) + whiteCoat(1000, 380, 0.56, g);
      scr += `<rect x="370" y="452" width="430" height="150" rx="6" fill="#1E4E8A" opacity=".94"/><rect x="370" y="452" width="110" height="40" fill="#C23B2E"/><text x="425" y="481" font-size="24" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>NEWS</text><text x="392" y="538" font-size="40" font-weight="900" fill="#fff" ${SANS}>Dr Lin Fang</text><text x="392" y="580" font-size="25" font-weight="700" fill="#CFE0F2" ${SANS}>Children’s Hospital, Beijing</text>`;
      return `<rect x="320" y="110" width="960" height="550" rx="16" fill="#1A1A1E"/>` + clipRect(`${id}tv`, 350, 140, 900, 490, scr) + `<rect x="770" y="660" width="60" height="20" fill="#1A1A1E"/><circle cx="1262" cy="645" r="5" fill="#5ACB6A"/>`;
    },
    cam: [[800, 400, 1250], [800, 395, 1150]],
  },
  // ---------- 20 Yu？那年夏天，她家搬到上海去了 ----------
  'tc2.truck': {
    bg: (id) => street96(id),
    fg: (u, g, id, v) => {
      const k = seg(u, 0, 1), x = lerp(-80, 1200, k);
      return puff(x - 140, 850, 0.5, g, 14, 16, 0.8) + truck(x, 870, 0.95, g * (0.5 + k)) + pin(v, 0.7, 0.1, miniMap(seg(u, 0.1, 0.9)), 1120, 90) + tint96(id, v, { g, year: 'Summer 1996' });
    },
    cam: [[640, 500, 1500], [860, 500, 1500]],
  },
  // ---------- 21 周老师十年前就退休了，还住在学校附近（家里、扶手椅、一杯茶） ----------
  'tc2.zhouHome': {
    bg: (id) => zhouHomeBg(id),
    fg: (u, g) => {
      const sip = seg(u, 0.4, 0.6) * (1 - seg(u, 0.75, 0.95));
      return sitter('zhou', 440, 880, 1.9, g, { kind: 'arm', hold: 'teacup', pose: { ...P.sitRest(), aF: lerp(60, 112, sip), eF: lerp(70, 96, sip), head: -8 * sip }, mood: 'calm' }) + teaTable(840, 880, 1.25, g, { cups: 1 });
    },
    cam: [[760, 500, 1500], [440, 560, 840]],
  },
  // ---------- 22 高老师写下地址：3 号楼，老教师宿舍 ----------
  'tc2.address': {
    bg: (id) => woodBg(id),
    fg: (u, g) => {
      const L = ['Mr Zhou', 'Building 3,', 'the old teachers’ apartments'], k = seg(u, 0.05, 0.85) * 3;
      let o = indexCard(330, 170, 900, 470, -2) + `<g transform="translate(330,170) rotate(-2)">`, px = 70, py = 104;
      L.forEach((t, i) => { const [s, x] = writeLine(70, 104 + i * 128, t, k - i, i === 0 ? 52 : 46, TCC.ink, i === 0 ? 'font-weight="700"' : ''); o += s; if (k - i > 0 && k - i <= 1) { px = x; py = 104 + i * 128; } });
      o += `</g>`;
      if (k < 3) { const a = (-2 * Math.PI) / 180, wx = 330 + px * Math.cos(a) - py * Math.sin(a), wy = 170 + px * Math.sin(a) + py * Math.cos(a); o += pen(wx + 4, wy + Math.sin(g * 14) * 4, 1); }
      return o + `<g transform="translate(1340,640)"><ellipse cx="0" cy="0" rx="70" ry="16" fill="#F4F1EA" stroke="${INK}" stroke-opacity=".5"/><path d="M-46,-2 L-40,-80 L40,-80 L46,-2 Z" fill="#F4F1EA" stroke="${INK}" stroke-opacity=".5"/><path d="M-42,-62 h84" stroke="#4A7A9A" stroke-width="4"/></g>`;
    },
    cam: [[800, 420, 1250], [790, 420, 1150]],
  },
  // ---------- 24 （写一句）给周老师留的纸条：Dear Mr Zhou, … ----------
  'tc2.note': {
    bg: (id) => woodBg(id),
    fg: (u, g) => indexCard(400, 160, 800, 520, 1, '#FFF9E6') + `<g transform="translate(400,160) rotate(1)"><text x="60" y="104" font-size="48" fill="${TCC.ink}" ${HAND}>Dear Mr Zhou,</text><rect x="64" y="${f(150)}" width="4" height="44" fill="${TCC.ink}" opacity="${Math.sin(g * 6) > 0 ? 0.8 : 0}"/></g>` + pen(500 + Math.sin(g * 1.3) * 30, 340 + Math.cos(g * 1.7) * 14, 1),
    cam: [[800, 430, 1300], [800, 430, 1200]],
  },
  // ---------- 25 走之前，把年鉴翻到三班那一页：每张小照片下面都有一句座右铭 ----------
  'tc2.yearbook': {
    bg: (id) => woodBg(id),
    fg: (u) => yearbook(800, 450, 1.25, { open: seg(u, 0.05, 0.55), pages: YB_PAGES }),
    cam: [[800, 450, 1600], [800, 460, 1150]],
  },
  // ---------- 26 林芳：Never give up. 陈雨：Music makes the world go round. ——My dream: to be a music teacher. ----------
  'tc2.mottos': {
    bg: (id) => woodBg(id),
    fg: (u, g) => {
      const a = seg(u, 0.05, 0.3), b = seg(u, 0.4, 0.7), c = seg(u, 0.75, 0.95);
      return yearbook(800, 450, 1.25, { open: 1, pages: YB_PAGES }) + `<g style="mix-blend-mode:multiply"><rect x="505" y="240" width="${f(250 * a)}" height="44" fill="#F6DC5A" opacity=".55"/><rect x="505" y="538" width="${f(250 * b)}" height="86" fill="#F6DC5A" opacity=".55"/><rect x="332" y="664" width="${f(330 * c)}" height="78" fill="#F6DC5A" opacity=".55"/></g>` + notes(600, 470, 0.45, g, b);
    },
    cam: [[490, 460, 1040], [490, 460, 1040]],
  },
  // ---------- 27 照片上的林芳没有笑：她看着 Yu，眼神里满是难过 ----------
  'tc2.sad': {
    bg: (id) => woodBg(id),
    fg: (u, g, id) => classPhoto(id, PX, PY, PS, { fangLook: seg(u, 0.1, 0.6) }),
    cam: [[830, 590, 800], [812, 528, 440]],
  },
  // ---------- 28 （连线）今天认识的人：照片上的两个女孩、高老师、周老师、Tao ----------
  'tc2.board': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A') + `<rect x="130" y="110" width="1340" height="680" rx="10" fill="#7A5236"/><rect x="150" y="130" width="1300" height="640" fill="#C9A06A"/>` + Array.from({ length: 180 }, (_, i) => { const r = rng(i + 3); return `<circle cx="${f(150 + r() * 1300)}" cy="${f(130 + r() * 640)}" r="${f(1 + r() * 2)}" fill="#A8804E" opacity=".6"/>`; }).join(''),
    fg: (u, g, id) => {
      const cards: [number, number, string][] = [[300, 330, 'yu'], [560, 330, 'fang'], [820, 330, 'gao'], [1080, 330, 'zhou'], [1340, 330, 'tao']];
      return cards.map(([x, y, who], i) => {
        const k = seg(u, i * 0.12, i * 0.12 + 0.2); if (k <= 0) return '';
        const face = who === 'yu' || who === 'fang' ? portrait(id, `bd${i}_`, who, x, y, 96, 4) : `<circle cx="${x}" cy="${y}" r="106" fill="#F2EBDA" stroke="#C8BCA0" stroke-width="3"/><clipPath id="${id}bf${i}_"><circle cx="${x}" cy="${y}" r="96"/></clipPath><g clip-path="url(#${id}bf${i}_)"><rect x="${x - 100}" y="${y - 100}" width="200" height="200" fill="#D9CBB0"/>${faceCU({ id, x: x - 6, y: y + 10, s: 0.3, who: who as 'gao', g })}</g>`;
        return `<g opacity="${f(k)}" transform="translate(0,${f(-20 * (1 - k))})">${face}<circle cx="${x}" cy="${y - 112}" r="10" fill="#C23B2E"/><rect x="${x - 60}" y="${y + 160}" width="120" height="70" rx="8" fill="#FBF7EA" stroke="#8A7E6A" stroke-width="2"/><text x="${x}" y="${y + 212}" font-size="50" font-weight="900" fill="#8E2A26" text-anchor="middle" ${HAND}>?</text></g>`;
      }).join('');
    },
    cam: [[820, 450, 1600], [820, 450, 1550]],
  },
  // ---------- 29 傍晚，你们拿着地址走出校门 ----------
  'tc2.end': {
    bg: (id) => campusBg(id) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#E8833A" opacity=".18" style="mix-blend-mode:multiply"/><rect x="-200" y="-200" width="2000" height="1300" fill="#3A2A4A" opacity=".12"/>`,
    fg: (u, g) => {
      const x = lerp(300, 900, seg(u, 0, 1));
      return person({ x, y: 790, s: 1.55, who: 'you', pose: P.walk(g * 1.3, 1), g, face: 1, hold: 'yearbook' }) + person({ x: x + 190, y: 796, s: 1.6, who: 'tao', pose: { ...P.walk(g * 1.3 + 0.5, 1), aF: 70, eF: 50 }, g, face: 1, hold: 'paper' }) + ginkgoFall(9, g, { x0: 500, x1: 1600, n: 14 });
    },
    cam: [[640, 480, 1500], [880, 470, 1400]],
  },

  // ======================= 讲解用的小视频 =======================
  // who：二十来个女孩，光说 a girl 找不着；who is holding a music box → 圈住 Yu；who is standing next to her → 圈住 Fang
  'tc2.clipWho': {
    bg: (id) => woodBg(id),
    fg: (u, g, id) => {
      let o = classPhoto(id, PX, PY, PS);
      if (u < 0.3) { const i = Math.floor(u / 0.3 * 4) % 4, [x, y] = midFace([2, 7, 3, 6][i]); o += `<text x="${f(x)}" y="${f(y - 44)}" font-size="54" font-weight="900" fill="#C23B2E" text-anchor="middle" ${SANS}>?</text>`; }
      o += ring(YU[0], YU[1] + 18, 52, seg(u, 0.3, 0.38) * (1 - seg(u, 0.64, 0.68)), g) + ring(FANG[0], FANG[1] + 18, 52, seg(u, 0.66, 0.74), g, '#5ACB8A');
      return o;
    },
    cam: [[850, 500, 900], [850, 500, 900]],
  },
  // 间接问句：Where are the yearbooks? → 前面加 Could you tell me → are 挪到后面
  'tc2.clipOrder': {
    bg: (id) => sky(id, '#2E3A34', '#26302B') + `<rect x="60" y="60" width="1480" height="780" fill="none" stroke="#8A6A44" stroke-width="16"/>`,
    fg: (u) => {
      const sz = 46, wd = (t: string) => t.length * sz * 0.52 + 44, gap = 18;
      const add = seg(u, 0.36, 0.5), mv = seg(u, 0.62, 0.82);
      const W = { c: wd('Could you tell me'), w: wd('where'), a: wd('are'), t: wd('the yearbooks'), q: wd('?') };
      // 一开始：Where are the yearbooks ?   最后：Could you tell me where the yearbooks are ?
      const start = [W.w, W.a, W.t, W.q].reduce((s, x) => s + x + gap, -gap), end = [W.c, W.w, W.t, W.a, W.q].reduce((s, x) => s + x + gap, -gap);
      const x0a = 800 - start / 2, x0b = 800 - (W.c + gap + W.w + gap + W.a + gap + W.t + gap + W.q) / 2, x0c = 800 - end / 2;
      const x0 = mv > 0 ? lerp(x0b, x0c, mv) : lerp(x0a, x0b, add);
      const xc = x0, xw = mv > 0 ? x0 + W.c + gap : x0 + (W.c + gap) * add;
      const xaS = xw + W.w + gap, xtS = xaS + W.a + gap, xtE = xw + W.w + gap, xaE = xtE + W.t + gap;
      const xt = lerp(xtS, xtE, mv), xa = lerp(xaS, xaE, mv), ya = 450 - Math.sin(mv * Math.PI) * 150, xq = lerp(xtS + W.t + gap, xaE + W.a + gap, mv);
      const card = (x: number, y: number, w: number, t: string, c: string, tc = '#2B2722', o = 1) => `<g opacity="${f(o)}"><rect x="${f(x)}" y="${f(y - 44)}" width="${f(w)}" height="88" rx="14" fill="${c}" stroke="#1E1A16" stroke-opacity=".4" stroke-width="2"/><text x="${f(x + w / 2)}" y="${f(y + 16)}" font-size="${sz}" font-weight="700" fill="${tc}" text-anchor="middle" ${SANS}>${t}</text></g>`;
      let o = '';
      if (add > 0) o += card(xc - (1 - add) * 300, 450, W.c, 'Could you tell me', '#CFE0E6', '#2B2722', add);
      o += card(xw, 450, W.w, add > 0.5 ? 'where' : 'Where', '#F4EEE0') + card(xt, 450, W.t, 'the yearbooks', '#F4EEE0') + card(xa, ya, W.a, 'are', '#F6DC5A') + card(xq, 450, W.q, '?', '#F4EEE0');
      if (mv > 0.05 && mv < 0.98) o += `<path d="M${f(xaS + W.a / 2)},${f(390)} Q${f((xaS + xaE) / 2 + W.a / 2)},250 ${f(xaE + W.a / 2)},390" stroke="#F6DC5A" stroke-width="4" stroke-dasharray="10 8" fill="none" opacity=".6"/>`;
      return o;
    },
    cam: [[800, 450, 1600], [800, 450, 1600]],
  },
  // take：你在梯子上、Tao 在凳子上翻了一个小时（墙上的钟从 3:00 走到 4:00），最后 Tao 举起 1996 那本
  'tc2.clipTake': {
    bg: (id) => libraryBg(id),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.8), found = u > 0.82, n = Math.floor(k * 9.99);
      return clock(770, 80, 66, 3, 60 * k, g * 3) + `<text x="770" y="190" font-size="34" font-weight="900" fill="#F2DDB0" text-anchor="middle" ${SANS}>${3 + Math.floor(60 * k / 60 + 1e-6)}:${String(Math.floor(60 * k + 1e-6) % 60).padStart(2, '0')}</text>` +
        person({ x: 1166, y: 502, s: 1.42, who: 'you', pose: { ...P.stand(), aF: 160 + 6 * Math.sin(g * 2), eF: 6, head: -20 }, g, face: 1, hold: 'yearbook' }) + ybPile(860, 790, n, 1, 12) +
        sitter('tao', 620, 790, 1.6, g, { kind: 'stool', pose: found ? { ...P.sitRest(), aF: 150, eF: 10, head: -10 } : { ...P.sitRest(), aF: 62 + 6 * Math.sin(g * 5), eF: 66, head: 14 }, hold: 'yearbook', mood: found ? 'laugh' : 'calm' }) +
        (found ? glow(id, 700, 400, 90, g, 0, 0.6) : '');
    },
    cam: [[900, 450, 1600], [900, 450, 1600]],
  },
  // cost：给老合影买个新相框，30 块钱（三张十块）
  'tc2.clipCost': {
    bg: (id) => sky(id, '#E8D9BC', '#DCC9A6') + Array.from({ length: 3 }, (_, r) => `<rect x="200" y="${150 + r * 150}" width="1200" height="12" fill="#8A6440"/>` + Array.from({ length: 6 }, (_, i) => `<rect x="${240 + i * 190}" y="${70 + r * 150}" width="${90 + (i % 2) * 30}" height="80" fill="#F4ECD8" stroke="${['#8A5A36', '#C9A23A', '#3E3E44'][(i + r) % 3]}" stroke-width="10"/>`).join('')).join('') + `<rect x="-200" y="600" width="2000" height="500" fill="#8A6440"/><rect x="-200" y="600" width="2000" height="24" fill="#A8784A"/>`,
    fg: (u, g, id) => {
      const pay = seg(u, 0.25, 0.55), take = seg(u, 0.65, 0.95);
      const fx = lerp(800, 560, take);
      let o = `<g transform="translate(${f(fx)},0)"><rect x="-190" y="300" width="380" height="290" fill="#5A3A22" stroke="${INK}" stroke-width="3"/><rect x="-170" y="320" width="340" height="250" fill="#F2EBDA"/>${classPhoto(id, -160, 330, 0.5)}</g>`;
      if (take < 0.3) o += `<g transform="translate(${f(fx + 150)},300) rotate(12)"><rect x="-10" y="-30" width="170" height="70" rx="10" fill="#FBF7EA" stroke="#C23B2E" stroke-width="4"/><text x="75" y="18" font-size="38" font-weight="900" fill="#C23B2E" text-anchor="middle" ${SANS}>30 yuan</text></g>`;
      for (let i = 0; i < 3; i++) { const k = seg(pay, i * 0.25, i * 0.25 + 0.5); if (k <= 0) continue; o += `<g transform="translate(${f(lerp(1500, 1060 + i * 200, k))},${f(680 + i * 6)}) rotate(${-8 + i * 6})"><rect x="-90" y="-40" width="180" height="80" rx="6" fill="#8ACB9A" stroke="#3A6A4A" stroke-width="3"/><text x="0" y="16" font-size="44" font-weight="900" fill="#2A5A3A" text-anchor="middle" ${SANS}>10</text></g>`; }
      return o;
    },
    cam: [[880, 430, 1400], [860, 440, 1400]],
  },
  // used to：1996 年两个人天天在窗边一起吃午饭 → 2026 年同一扇窗户前，两个空座位
  'tc2.clipUsed': {
    bg: (id) => classroom96Bg(id, { board: ['', '', ''] }) + chalk(3),
    fg: (u, g, id, v) => {
      const t = seg(u, 0.44, 0.52);
      let o = ceilingFan(800, -40, 1, g);
      if (t < 1) o += `<g opacity="${f(1 - t)}">${lunch96(id, u, g, 0.3)}</g>`;
      if (t > 0) o += `<g opacity="${f(t)}"><path d="M1250,150 L1550,150 L1640,720 L1060,720 Z" fill="#FFF8E4" opacity=".3"/>${seat('desk96', 860, 880, 1.6, 1)}${seat('desk96', 1300, 880, 1.66, -1)}${desk96(1080, 880, 1.2)}${ginkgoLeaf(1060, 708, 30, 20)}<rect x="1234" y="294" width="124" height="94" fill="#CFE0E6"/><rect x="1126" y="296" width="108" height="88" fill="#F4F1E8" stroke="#8A7E6A" stroke-width="2"/><rect x="1126" y="296" width="108" height="24" fill="#B8322A"/><text x="1180" y="314" font-size="15" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>2026 · 10</text><text x="1180" y="366" font-size="38" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>13</text></g>`;
      return o + tint96(id, v, { g, year: false, k: 1 - t }) + yearTag(v, '1996', 1 - t) + yearTag(v, '2026', t);
    },
    cam: [[1020, 540, 1250], [1020, 540, 1250]],
  },
  // shelf：书架的三层，一层一层亮起来
  'tc2.clipShelf': {
    bg: (id) => sky(id, '#5A4632', '#3E3024') + `<path d="M-200,780 L1800,780 L1800,1100 L-200,1100 Z" fill="#6E4C30"/>`,
    fg: (u, g) => {
      const at = u < 0.33 ? 2 : u < 0.66 ? 1 : 0, names = ['bottom', 'middle', 'top'];
      let o = `<g>${(() => { const r = rng(7); let s = `<rect x="600" y="340" width="560" height="440" fill="#6E4A2E" stroke="${INK}" stroke-opacity=".5" stroke-width="3"/>`; for (let k = 0; k < 3; k++) { const by = 770 - k * 140; let bx = 614; while (bx < 1130) { const bw = 16 + r() * 16, bh = 90 + r() * 30, c = ['#8E2A26', '#2F4E7A', '#4E6A4A', '#B8863A', '#6E4A6A', '#C8B898'][Math.floor(r() * 6)]; s += `<rect x="${f(bx)}" y="${f(by - bh)}" width="${f(bw)}" height="${f(bh)}" fill="${c}" stroke="#1E1612" stroke-opacity=".4"/>`; bx += bw + 2; } s += `<rect x="600" y="${by}" width="560" height="12" fill="#4E3420"/>`; } return s; })()}</g>`;
      [0, 1, 2].forEach((k) => {
        const by = 770 - k * 140, on = k === at, a = on ? 1 : 0.35;
        o += `<rect x="604" y="${by - 128}" width="552" height="140" fill="${on ? '#F6DC5A' : 'none'}" opacity="${on ? 0.28 + 0.08 * Math.sin(g * 4) : 0}"/>`;
        o += `<text x="560" y="${by - 46}" font-size="${on ? 52 : 42}" font-weight="900" fill="${on ? '#F6DC5A' : '#E8DCC0'}" text-anchor="end" opacity="${a}" ${SANS}>${names[k]} shelf</text>`;
      });
      return o;
    },
    cam: [[760, 520, 1300], [760, 520, 1300]],
  },
};
