// 英文故事二 The Time Capsule · Chapter 1 Open in 2026：每一镜怎么画、怎么动（共用的人物、道具在 capsule.ts）
// 星期一早上：老银杏树下挖出生锈的铁盒 → 标签 → 英语社活动室开盒 → 1996 年的预测（机器人、会飞的汽车、没人写信）→ 粉色信封、小铜钥匙、
// 一封道歉信（回忆用 1996 年的旧照片色调）→ 最后一行被水洇了，只剩一个字母 F。
// 讲语法的小视频（拓展里的框是 16:10，左右各裁掉一点，所以小视频里不钉“1996”的牌子，年份写在下面的字幕里）：tc1.clipBury*（被动：埋盒子）、tc1.clipYears（现在完成时：三十年）、tc1.clipTree / clipTable（has been 和 was）、tc1.clipWill*（will：1996 年猜 2026 年）。
// 这一章还不知道写信的是谁：信的署名只画一个 F，画面上不写 Lin Fang。
import { GOLD, INK, SKIN, clamp, f, glow, lerp, pin, rng, seg, sky, wav, type View } from './core';
import { P, faceCU, person } from './rig';
import { aiGlasses, talk, timeTag } from './shotsE1';
import {
  HAND, SANS, SERIF, TCC, brassKey, ginkgoLeaf, campusBg, classPhoto, classroom96Bg, clubRoomBg, desk96, digPit, envelope, ginkgoFall, ginkgoTree, leafCarpet,
  letter, letterH, longTable, musicBox, notes, seat, shovel, tinBox, tinTop, tint96, cassette,
} from './capsule';
import type { ShotDef } from './Film';

// ---------------- 这一章自己的小东西 ----------------
/** 粉色信里的话（和 ec1.ts 的台词一致；“两个星期前”对上第三章 For two weeks, they didn’t speak）。第 6 段被水洇了 */
const C1_LETTER = [
  'Dear friend in 2026,',
  'This letter is not for the future. It is for my best friend, Chen Yu.',
  'Two weeks ago, her music box fell off the desk, and the music stopped. I did it — but it was an accident.',
  'She thinks I did it on purpose. Now she won’t talk to me, and I walk home alone.',
  'Her family is moving to Shanghai next month. I don’t know how to say sorry.',
  'This is the key to her music box. If you find her, please give it to her and tell her —',
  'that I am so sorry, and she is still my best friend.',
  'F        ',
];
const LET = { lines: C1_LETTER, smudge: 6, w: 800, size: 30 };
/** 信写到第 k 段末尾时，reveal 该是多少（和 capsule.ts 的 letter 一样按词换行、去掉行尾空格来数字数） */
const revealTo = (k: number) => {
  const n = Math.floor((LET.w - 90) / (LET.size * 0.5));
  const len = (t: string) => { let rows = 0, cur = ''; for (const w of t.split(' ')) { if (cur && (cur + ' ' + w).length > n) { rows += cur.length; cur = w; } else cur = cur ? cur + ' ' + w : w; } return rows + cur.length; };
  const all = C1_LETTER.map(len), done = all.slice(0, k + 1).reduce((a, b) => a + b, 0);
  return done / all.reduce((a, b) => a + b, 0);
};
/** 署名：只看得清一个 F，后面的字洇成一片（x、y、s 同 letter） */
const signBlur = (x: number, y: number, s: number, k = 1) => {
  const h = letterH(LET), yy = y + (h - 40 - 30 * 1.45) * s, x1 = x + (800 - 60) * s;
  return `<g opacity="${f(k)}"><ellipse cx="${f(x1 - 50 * s)}" cy="${f(yy - 10 * s)}" rx="${f(70 * s)}" ry="${f(20 * s)}" fill="#7E98B0" opacity=".35"/><ellipse cx="${f(x1 - 30 * s)}" cy="${f(yy - 8 * s)}" rx="${f(40 * s)}" ry="${f(12 * s)}" fill="${TCC.ink}" opacity=".22"/><ellipse cx="${f(x1 - 70 * s)}" cy="${f(yy - 14 * s)}" rx="${f(26 * s)}" ry="${f(9 * s)}" fill="${TCC.ink}" opacity=".18"/></g>`;
};
/** 署名那个 F 在哪儿（画圈用） */
const signF = (x: number, y: number, s: number) => { const h = letterH(LET); return [x + (800 - 60 - 118) * s, y + (h - 40 - 30 * 1.45 - 10) * s]; };
/** 木桌面（从上往下看） */
const woodTop = (id: string, c1 = '#8A5E3A', c2 = '#6E4A2C') => sky(id, c1, c2, 'wd') + Array.from({ length: 10 }, (_, i) => `<path d="M-200,${i * 110 - 60} Q400,${i * 110 - 30} 800,${i * 110 - 50} T1800,${i * 110 - 40}" stroke="#4E321E" stroke-width="3" opacity=".35" fill="none"/>`).join('');
/** 一句手写的英文（钉在取景框上，镜头推拉也看得清） */
const handNote = (v: View | undefined, fx: number, fy: number, t: string, size = 46, c = '#2B3A6E', bg = '#FBF7EC') => {
  const w = t.length * size * 0.5 + 60;
  return pin(v, fx, fy, `<g><rect x="${f(-w / 2)}" y="${f(-size * 1.1)}" width="${f(w)}" height="${f(size * 1.6)}" rx="10" fill="${bg}" opacity=".92" stroke="#B8AE98" stroke-width="2"/><text x="0" y="${f(size * 0.1)}" font-size="${size}" fill="${c}" text-anchor="middle" ${HAND}>${t}</text></g>`);
};
/** 站在后面围观的同学（一排，轻轻晃） */
const onlookers = (g: number, xs: number[], y: number, s: number, face: 1 | -1 = 1) => xs.map((x, i) => person({ x, y: y + (i % 2) * 6, s, who: i % 3 === 1 ? 'stuB' : i % 3 === 2 ? 'mia' : 'stuA', pose: { ...P.stand(), head: -6 + wav(g, 2.4, i * 0.3) * 4, lean: 6 }, g, face: (i % 4 === 3 ? -face : face) as 1 | -1 })).join('');
/** 侧面的小汽车：x 是车头前的地面，color 车身颜色 */
const car = (x: number, y: number, s: number, c: string) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-260,-34 L-250,-80 Q-240,-96 -210,-98 L-170,-150 Q-160,-160 -140,-160 L-70,-160 Q-50,-160 -36,-140 L-4,-98 Q16,-96 18,-80 L20,-34 Z" fill="${c}" stroke="${INK}" stroke-opacity=".55" stroke-width="3"/><path d="M-160,-146 L-120,-146 L-120,-102 L-196,-102 Z M-108,-146 L-62,-146 L-30,-102 L-108,-102 Z" fill="#CFE3EC" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><circle cx="-200" cy="-34" r="30" fill="#2A2A30"/><circle cx="-200" cy="-34" r="12" fill="#9A9AA0"/><circle cx="-40" cy="-34" r="30" fill="#2A2A30"/><circle cx="-40" cy="-34" r="12" fill="#9A9AA0"/><rect x="6" y="-78" width="14" height="12" rx="3" fill="#FFE9A8"/></g>`;
/** 会飞的汽车（1996 年小孩画的：蓝墨水线条、虚线、带小翅膀） */
const flyCarDoodle = (x: number, y: number, s: number, g: number, a = 1) => `<g transform="translate(${f(x)},${f(y + wav(g, 1.6) * 10)}) scale(${f(s)})" opacity="${f(a)}" fill="none" stroke="#3B5E9A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M-120,0 L-110,-40 L-60,-44 L-36,-80 L40,-80 L70,-44 L120,-36 L124,0 Z"/><path d="M-30,-74 L-14,-48 M20,-74 L40,-48"/><circle cx="-70" cy="6" r="18"/><circle cx="76" cy="6" r="18"/><path d="M-20,-40 L-90,-110 L-40,-44 M30,-40 L100,-110 L60,-44" stroke-dasharray="10 8"/><path d="M-170,-20 h-50 M-160,6 h-70 M-170,30 h-40" stroke-width="4" opacity=".6"/></g>`;
/** 机器人（1996 年小孩画在信纸上的）：一只手在锅里搅，一只手拿笔写作业 */
const robotDoodle = (x: number, y: number, s: number, g: number, a = 1) => {
  const st = Math.sin(g * 5) * 14, wr = Math.sin(g * 9) * 6;
  return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})" opacity="${f(a)}" fill="none" stroke="#3B5E9A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">` +
    `<rect x="-50" y="-250" width="100" height="80" rx="12"/><path d="M0,-250 v-30"/><circle cx="0" cy="-286" r="8" fill="#C23B2E" stroke="#C23B2E"/><circle cx="-20" cy="-214" r="10"/><circle cx="20" cy="-214" r="10"/><path d="M-20,-188 q20,12 40,0"/>` +
    `<rect x="-70" y="-160" width="140" height="150" rx="14"/><path d="M-40,-120 h80 M-40,-90 h80" stroke-width="3" opacity=".7"/><path d="M-40,-10 v60 M40,-10 v60 M-60,50 h40 M20,50 h40"/>` +
    `<path d="M-70,-130 L-150,${f(-90 + st * 0.3)} L${f(-190 + st)},-60"/><path d="M-260,-50 h150 v10 a60,40 0 0 1 -150,0 Z" stroke="#7A3A2A"/><path d="M-250,-70 q20,-20 10,-40 M-210,-70 q20,-20 10,-40" stroke="#9A9AA0" stroke-width="3" opacity=".8"/>` +
    `<path d="M70,-130 L150,-100 L${f(190 + wr)},${f(-60 + wr * 0.5)}"/><path d="M${f(190 + wr)},${f(-60 + wr * 0.5)} l12,-24" stroke="#C23B2E" stroke-width="7"/><rect x="150" y="-50" width="120" height="80" stroke="#7A7068" stroke-width="3"/><path d="M164,-30 h80 M164,-10 h60 M164,10 h70" stroke="#7A7068" stroke-width="2.5"/></g>`;
};
/** 一张钉在板上的小卡片（icon 是画在卡片上半部分的东西，label 是下面的字） */
const card = (x: number, y: number, icon: string, label: string, rot = 0, o: { w?: number; h?: number; fs?: number; is?: number; color?: string } = {}) => {
  const w = o.w ?? 280, h = o.h ?? 236, fs = o.fs ?? 34, is = o.is ?? 1.25;
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)})"><rect x="5" y="7" width="${w}" height="${h}" fill="#000" opacity=".2"/><rect width="${w}" height="${h}" fill="${o.color ?? '#FBF7EA'}"/><g transform="translate(${w / 2},${f(h * 0.42)}) scale(${is})">${icon}</g><text x="${w / 2}" y="${h - 22}" font-size="${fs}" fill="#2B2A6E" text-anchor="middle" ${HAND}>${label}</text><circle cx="${w / 2}" cy="14" r="10" fill="#C23B2E"/></g>`;
};
const IC = {
  phone: `<rect x="-26" y="-50" width="52" height="92" rx="9" fill="#2A2A30"/><rect x="-20" y="-40" width="40" height="66" fill="#8FD0E6"/><circle cx="0" cy="34" r="4" fill="#9A9AA0"/>`,
  mail: `<rect x="-52" y="-34" width="104" height="66" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M-52,-34 L0,6 L52,-34" stroke="${INK}" stroke-width="3" fill="none"/><path d="M60,-30 l18,0 M60,-14 l26,0 M60,2 l14,0" stroke="#3B5E9A" stroke-width="4"/>`,
  robot: `<rect x="-26" y="-56" width="52" height="40" rx="6" fill="#B8C4CC" stroke="${INK}" stroke-width="3"/><circle cx="-10" cy="-38" r="5" fill="${INK}"/><circle cx="10" cy="-38" r="5" fill="${INK}"/><rect x="-34" y="-12" width="68" height="56" rx="8" fill="#9AA8B4" stroke="${INK}" stroke-width="3"/><path d="M0,-56 v-12" stroke="${INK}" stroke-width="3"/>`,
  letter: `<rect x="-40" y="-50" width="80" height="96" fill="#FBF7EC" stroke="${INK}" stroke-width="3"/><path d="M-28,-30 h56 M-28,-14 h56 M-28,2 h40 M-28,18 h50" stroke="#3B5E9A" stroke-width="3"/>`,
  laptop: `<rect x="-50" y="-48" width="100" height="66" rx="5" fill="#2A2A30"/><rect x="-42" y="-40" width="84" height="50" fill="#BFE0C8"/><circle cx="0" cy="-20" r="9" fill="#C98A3E"/><path d="M-62,20 h124 l-10,14 h-104 z" fill="#6E6E78"/>`,
  car: `<g transform="scale(.36) translate(120,60)">${'<path d="M-260,-34 L-250,-80 Q-240,-96 -210,-98 L-170,-150 L-70,-160 L-4,-98 Q16,-96 18,-80 L20,-34 Z" fill="#C23B2E"/><circle cx="-200" cy="-34" r="30" fill="#2A2A30"/><circle cx="-40" cy="-34" r="30" fill="#2A2A30"/>'}</g><path d="M-58,-46 q20,-24 40,0 M18,-46 q20,-24 40,0" stroke="#3B5E9A" stroke-width="4" fill="none"/>`,
  moon: `<path d="M10,-56 a50,50 0 1 0 0,100 a38,38 0 1 1 0,-100 z" fill="#E8D27A" stroke="#8A7A3A" stroke-width="3"/><path d="M34,-30 l4,10 l10,4 l-10,4 l-4,10 l-4,-10 l-10,-4 l10,-4 z" fill="#C98A1E"/>`,
  nohw: `<rect x="-36" y="-50" width="72" height="92" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M-24,-30 h48 M-24,-14 h48 M-24,2 h36" stroke="#7A7068" stroke-width="3"/><circle cx="0" cy="-4" r="48" fill="none" stroke="#C23B2E" stroke-width="7"/><path d="M-34,-38 L34,30" stroke="#C23B2E" stroke-width="7"/>`,
  school: `<rect x="-60" y="-40" width="120" height="80" fill="#E2CDB4" stroke="${INK}" stroke-width="3"/><path d="M-70,-40 L0,-74 L70,-40 Z" fill="#B8645A" stroke="${INK}" stroke-width="3"/>${[0, 1, 2].map((i) => `<rect x="${-46 + i * 36}" y="-24" width="20" height="20" fill="#A9C6D6"/>`).join('')}<rect x="-12" y="10" width="24" height="30" fill="#7A6A58"/>`,
  mbox: `<rect x="-46" y="-26" width="92" height="58" rx="4" fill="#7A3E26" stroke="${INK}" stroke-width="3"/><path d="M-46,-26 L-30,-62 L62,-62 L46,-26" fill="#8E4A2E" stroke="${INK}" stroke-width="3"/><path d="M56,20 l24,-34" stroke="#3B5E9A" stroke-width="3"/><path d="M60,-60 l0,-26 l14,-4" stroke="#3B5E9A" stroke-width="4" fill="none"/><circle cx="56" cy="-58" r="6" fill="#3B5E9A"/><path d="M-60,40 l-16,16 M-50,48 l-8,20" stroke="#C23B2E" stroke-width="4"/>`,
  bury: `<path d="M-70,20 Q0,-20 70,20 Z" fill="#7E5C3A"/><rect x="-34" y="10" width="68" height="34" fill="#56645A" stroke="${INK}" stroke-width="3"/><path d="M-80,44 h160" stroke="#5A4030" stroke-width="6"/><path d="M40,-60 L20,10" stroke="#8A6A44" stroke-width="6"/>`,
  dig: `<path d="M-80,30 h160" stroke="#5A4030" stroke-width="6"/><ellipse cx="0" cy="30" rx="54" ry="14" fill="#3A2A1E"/><rect x="-26" y="-10" width="52" height="30" fill="#56645A" stroke="${INK}" stroke-width="3"/><path d="M-30,-24 l10,-10 M0,-30 v-14 M30,-24 l-10,-10" stroke="#C98A1E" stroke-width="4"/>`,
  cake: `<rect x="-50" y="-6" width="100" height="46" rx="4" fill="#F2C2C8" stroke="${INK}" stroke-width="3"/><rect x="-40" y="-40" width="80" height="34" rx="4" fill="#FBEFE0" stroke="${INK}" stroke-width="3"/><text x="0" y="-12" font-size="26" font-weight="900" fill="#B8322A" text-anchor="middle" ${SANS}>60</text><path d="M-20,-40 v-16 M0,-40 v-16 M20,-40 v-16" stroke="#C98A1E" stroke-width="4"/>`,
};
/** 软木板（x、y 是左上角，w×h） */
const corkBoard = (x: number, y: number, w: number, h: number) => {
  const r = rng(7); let o = `<rect x="${x - 20}" y="${y - 20}" width="${w + 40}" height="${h + 40}" rx="10" fill="#7A5236"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#C9A06A"/>`;
  for (let i = 0; i < 200; i++) o += `<circle cx="${f(x + r() * w)}" cy="${f(y + r() * h)}" r="${f(1 + r() * 2)}" fill="#A8804E" opacity=".6"/>`;
  return o;
};
/** 一只手（从下往上伸过来，手心朝上，托着东西）：x、y 是手心中间 */
const palm = (x: number, y: number, s: number) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-70,60 L-90,320 L90,320 L70,60 Z" fill="${TCC.uni}" stroke="${INK}" stroke-width="3"/><path d="M-80,90 L80,90" stroke="#F4F4F0" stroke-width="10"/>` +
  `<path d="M-96,-6 Q-110,60 -70,76 L70,76 Q112,58 96,-10 Q90,-40 60,-36 L-60,-36 Q-92,-36 -96,-6 Z" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>` +
  [[-74, -40, -8], [-34, -52, -3], [8, -54, 2], [48, -46, 8]].map(([fx, fy, r]) => `<path d="M${fx - 15},${fy + 20} Q${fx - 16},${fy - 70} ${fx},${fy - 74} Q${fx + 16},${fy - 70} ${fx + 15},${fy + 20}" fill="${SKIN}" stroke="${INK}" stroke-width="2.6" transform="rotate(${r} ${fx} ${fy})"/>`).join('') +
  `<path d="M90,-4 Q140,-30 150,-70 Q154,-86 140,-88 Q120,-80 100,-44" fill="${SKIN}" stroke="${INK}" stroke-width="2.6"/><path d="M-60,10 Q0,30 60,8" stroke="#C8A888" stroke-width="2.5" fill="none"/></g>`;
/** 窗外几片银杏叶（静的） */
const ginkgoLeaf2 = () => { const r = rng(27); let o = ''; for (let i = 0; i < 9; i++) o += ginkgoLeaf(900 + r() * 260, 60 + r() * 380, 22 + r() * 10, r() * 360); return o; };
/** 放大镜 */
const loupe = (x: number, y: number, r: number) => `<g><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="#FFFDF0" fill-opacity=".14" stroke="#2A2A30" stroke-width="12"/><circle cx="${f(x)}" cy="${f(y)}" r="${r - 8}" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".5"/><path d="M${f(x + r * 0.72)},${f(y + r * 0.72)} L${f(x + r * 1.5)},${f(y + r * 1.5)}" stroke="#4A3424" stroke-width="26" stroke-linecap="round"/></g>`;
/** 英语社活动室：这一章是星期一，墙上的校庆倒计时是“还有 5 天”（星期六校庆） */
const clubBg = (id: string) => clubRoomBg(id, 5);
/** 街道（2026，堵车）：楼、人行道、马路 */
const streetBg = (id: string) => {
  let s = sky(id, '#BFD6E6', '#EDE6D2');
  const r = rng(31);
  for (let i = 0; i < 9; i++) { const x = -150 + i * 220, h = 260 + r() * 220, c = ['#D8C8B4', '#C9D2D8', '#E2D0C0', '#BFC8C0'][i % 4]; s += `<rect x="${x}" y="${620 - h}" width="200" height="${f(h)}" fill="${c}" stroke="#A8A094" stroke-width="3"/>`; for (let rr = 0; rr < Math.floor(h / 70); rr++) for (let c2 = 0; c2 < 3; c2++) s += `<rect x="${x + 22 + c2 * 58}" y="${f(640 - h + rr * 70)}" width="36" height="40" fill="#A9C6D6"/>`; }
  s += `<rect x="-200" y="600" width="2000" height="60" fill="#C8C2B4"/><rect x="-200" y="656" width="2000" height="10" fill="#9A948A"/><rect x="-200" y="666" width="2000" height="440" fill="#5E6066"/>`;
  for (let i = 0; i < 12; i++) s += `<rect x="${-180 + i * 170}" y="800" width="90" height="10" fill="#EDEDE4" opacity=".8"/>`;
  return s;
};
/** 一排堵着的车（慢慢往前蹭一点又停） */
const jam = (g: number, y: number, s: number) => { const cs = ['#C23B2E', '#2F5DA8', '#E8B534', '#4E7A5A', '#EDEDE4', '#6E4A7A', '#2A2A30']; return cs.map((c, i) => car(-120 + i * 330 + Math.max(0, Math.sin(g * 0.6 + i)) * 10, y, s, c)).join('') + (Math.sin(g * 2.2) > 0.6 ? `<text x="1180" y="${y - 200}" font-size="48" font-weight="900" fill="#C23B2E" ${SANS}>BEEP!</text>` : ''); };
/** 扫地机器人（侧面）+ 一只袜子：k 0—1 袜子被吸进去 */
const vacuumBot = (x: number, y: number, s: number, g: number) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="0" rx="120" ry="26" fill="#000" opacity=".2"/><path d="M-110,-6 L-110,-40 A110,26 0 0 1 110,-40 L110,-6 A110,26 0 0 1 -110,-6 Z" fill="#2E2E36"/><ellipse cx="0" cy="-40" rx="110" ry="26" fill="#45454E"/><ellipse cx="0" cy="-42" rx="34" ry="9" fill="#2A2A30"/><circle cx="60" cy="-42" r="6" fill="${Math.sin(g * 4) > 0 ? '#5ACB6A' : '#2E7A3A'}"/><path d="M-110,-24 A110,26 0 0 0 110,-24" stroke="#6E6E78" stroke-width="3" fill="none"/></g>`;
const sock = (x: number, y: number, s: number, k: number) => k >= 1 ? '' : `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * (1 - k * 0.7))},${f(s * (1 - k))})"><path d="M-80,-10 L20,-10 L24,-40 L70,-40 L84,-6 Q90,14 60,16 L-80,16 Z" fill="#C23B2E" stroke="${INK}" stroke-width="3"/><path d="M-60,-10 v26 M-36,-10 v26 M-12,-10 v26" stroke="#F4F1E8" stroke-width="8"/></g>`;
/** 1996 年的街（傍晚的校门外）：围墙、路灯、路 */
const street96 = (id: string) => {
  let s = sky(id, '#E8C49A', '#F2DFC0');
  s += `<rect x="-200" y="380" width="2000" height="260" fill="#B86A52"/>`;
  for (let r = 0; r < 12; r++) for (let c = 0; c < 30; c++) s += `<rect x="${-200 + c * 70 + (r % 2) * 35}" y="${380 + r * 22}" width="66" height="18" fill="#B86A52" stroke="#9A5A44" stroke-width="2"/>`;
  s += `<rect x="-200" y="370" width="2000" height="16" fill="#8E4E3A"/>` + `<g opacity=".7">${ginkgoTree(300, 400, 0.5, { gold: 0, seed: 21 })}${ginkgoTree(1300, 400, 0.45, { gold: 0, seed: 22 })}</g>`;
  s += `<rect x="-200" y="640" width="2000" height="460" fill="#9A9488"/><rect x="-200" y="636" width="2000" height="10" fill="#7A746A"/>`;
  s += `<rect x="1000" y="220" width="12" height="420" fill="#4A4A4E"/><path d="M1006,224 q40,-20 70,0" stroke="#4A4A4E" stroke-width="8" fill="none"/><ellipse cx="1076" cy="232" rx="20" ry="10" fill="#FFE9A8"/>`;
  return s;
};
/** 中国东部的简图：北边一个点（我们的学校），南边上海；truck 0—1 搬家的车沿着虚线走 */
const mapEast = (id: string, k: number, g: number) => {
  let o = sky(id, '#C9DCE4', '#BFD4DE', 'sea');
  o += `<path d="M-200,-200 L1010,-200 L1010,140 Q1060,210 1080,250 Q1040,300 1120,330 Q1240,300 1300,340 Q1260,400 1140,420 Q1080,450 1070,500 Q1130,520 1180,560 Q1160,620 1110,660 Q1080,760 1010,860 L-200,1100 Z" fill="#E8DFC6" stroke="#B8AE96" stroke-width="4"/>`;
  o += `<path d="M300,200 Q500,320 700,300 Q860,290 1000,240" stroke="#A9C6D6" stroke-width="6" fill="none" opacity=".7"/><path d="M200,620 Q500,560 800,600 Q1000,620 1170,560" stroke="#A9C6D6" stroke-width="8" fill="none"/>`;
  const A = [880, 200], B = [1150, 560], C = [960, 400];
  o += `<path d="M${A[0]},${A[1]} Q${C[0]},${C[1]} ${B[0]},${B[1]}" stroke="#B8322A" stroke-width="6" stroke-dasharray="16 12" fill="none"/>`;
  const t = clamp(k), px = (1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * C[0] + t * t * B[0], py = (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * C[1] + t * t * B[1];
  o += `<circle cx="${A[0]}" cy="${A[1]}" r="16" fill="#2F5DA8"/><g transform="translate(${A[0] - 100},${A[1] - 10}) scale(.7)">${IC.school}</g>`;
  o += `<circle cx="${B[0]}" cy="${B[1]}" r="16" fill="#B8322A"/><text x="${B[0] + 30}" y="${B[1] + 12}" font-size="44" font-weight="700" fill="#8E2A26" ${SERIF}>Shanghai</text>`;
  o += `<g transform="translate(${f(px)},${f(py + wav(g, 0.3) * 2)})"><rect x="-40" y="-44" width="56" height="40" fill="#F4F1E8" stroke="${INK}" stroke-width="3"/><path d="M16,-34 h18 l12,16 v14 h-30 z" fill="#2F5DA8" stroke="${INK}" stroke-width="3"/><circle cx="-24" cy="-2" r="8" fill="#2A2A30"/><circle cx="30" cy="-2" r="8" fill="#2A2A30"/></g>`;
  return o + glow(id, B[0], B[1], 60, g, 0, 0.4 * seg(k, 0.8, 1));
};
/** 1996 年的教室里：陈雨坐在桌前，八音盒在桌上（tc1.fall1996 和 tc1.clipWill96 用） */
const deskScene = (id: string, g: number, o: { who?: string; pose?: ReturnType<typeof P.sitRest>; mood?: 'calm' | 'shock' | 'sad' | 'laugh' } = {}) =>
  desk96(560, 880, 1.25) + seat('desk96', 490, 880, 1.6, 1) + person({ x: 490, y: 880, s: 1.6, who: o.who ?? 'yu', pose: o.pose ?? P.sitRest(), g, mood: o.mood });

export const SHOTS_C1: Record<string, ShotDef> = {
  // ---------- 1 星期一早上七点五十，校园；再过五天校庆 ----------
  'tc1.campus': {
    bg: (id) => campusBg(id),
    fg: (u, g, id, v) => {
      const k = seg(u, 0, 1), x = lerp(60, 560, k), walking = u < 0.92;
      return digPit(id, 1000, 790, 260, { k: 0.3, g }) + person({ x: 1250, y: 790, s: 1.4, who: 'worker', pose: { ...P.stand(), lean: 22 + 10 * Math.sin(g * 2.4), aF: 50, eF: 30, aB: 40, eB: 50 }, g, face: -1, hold: 'shovel' }) +
        person({ x, y: 815, s: 1.55, who: 'you', pose: walking ? P.walk(g * 1.5, 1) : P.stand(), g }) + person({ x: x - 170, y: 822, s: 1.58, who: 'tao', pose: walking ? P.walk(g * 1.5 + 0.4, 1) : P.stand(), g }) +
        ginkgoFall(11, g, { x0: 700, x1: 1600, n: 14 }) + timeTag(1440, 110, '7:50', v);
    },
    cam: [[800, 450, 1600], [820, 470, 1450]],
  },
  // ---------- 2 银杏树下，工人在挖地；当！铁锹碰到硬东西 ----------
  'tc1.ginkgo': {
    bg: (id) => campusBg(id, { treeX: 900, treeS: 1.05 }),
    fg: (u, g, id) => {
      const dig = (ph: number): ReturnType<typeof P.stand> => ({ ...P.stand(), lean: 22 + 12 * Math.sin(g * 2.6 + ph), aF: 50, eF: 30, aB: 40, eB: 50 });
      return digPit(id, 680, 805, 300, { k: lerp(0.45, 0.85, u), g }) + person({ x: 470, y: 810, s: 1.6, who: 'worker', pose: dig(0), g, hold: 'shovel' }) + person({ x: 900, y: 818, s: 1.62, who: 'worker', pose: dig(1.6), g, face: -1, hold: 'shovel' }) + ginkgoFall(12, g, { x0: 300, x1: 1400, n: 12 });
    },
    cam: [[760, 540, 1500], [740, 560, 1400]],
  },
  'tc1.spade': {
    bg: (id) => sky(id, '#9A7A52', '#7E5C3A') + `<path d="M-200,560 L1800,560 L1800,1100 L-200,1100 Z" fill="#8A6844"/>` + leafCarpet(13, -100, 1700, 560, 900, 70),
    fg: (u, g, id) => {
      const hit = seg(u, 0.1, 0.32), after = u > 0.32 ? Math.exp(-(u - 0.32) * 10) : 0, sh = Math.sin(g * 50) * 10 * after;
      let o = `<g transform="translate(${f(sh)},0)">` + digPit(id, 800, 640, 560, { k: 1, mound: false, box: 0.3, g }) + shovel(830, lerp(560, 676, hit), 1.25, 10) + `</g>`;
      if (u > 0.32) {
        const p = seg(u, 0.32, 0.45);
        o += `<g transform="translate(860,470) scale(${f(0.6 + 0.5 * p)})" opacity="${f(Math.min(1, (1 - u) * 4))}">` + Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return `<path d="M${f(Math.cos(a) * 120)},${f(Math.sin(a) * 70)} L${f(Math.cos(a) * 200)},${f(Math.sin(a) * 120)}" stroke="#F2C14E" stroke-width="10" stroke-linecap="round"/>`; }).join('') +
          `<text x="0" y="24" font-size="96" font-weight="900" fill="#FFE9A8" stroke="#7A3A0A" stroke-width="5" text-anchor="middle" ${SANS}>CLANG!</text></g>`;
      }
      return o;
    },
    cam: [[800, 520, 1100], [800, 540, 1000]],
  },
  // ---------- 3 工人拂去泥土：生锈的铁盒 ----------
  'tc1.boxUp': {
    bg: (id) => campusBg(id, { treeX: 1260 }),
    fg: (u, g, id) => {
      const clean = seg(u, 0.05, 0.85), r = rng(4);
      let o = tinBox(id, 740, 850, 0.95, { dirt: 1 - 0.85 * clean, g }) + person({ x: 1000, y: 860, s: 1.7, who: 'worker', pose: P.kneelWash(g * 1.1), g, face: -1 });
      for (let i = 0; i < 8; i++) { const t = (g * 0.8 + r()) % 1; o += `<circle cx="${f(820 + t * 160 + r() * 40)}" cy="${f(700 + t * t * 160)}" r="${f(4 + r() * 5)}" fill="#6A4A2E" opacity="${f((1 - t) * (1 - clean * 0.6))}"/>`; }
      return o + glow(id, 760, 700, 160, g, 0, 0.2 * clean);
    },
    cam: [[880, 610, 1150], [840, 640, 940]],
  },
  // ---------- 4 你和 Tao 挤到前面；胡老师在看盒盖上的标签 ----------
  'tc1.crowd': {
    bg: (id) => campusBg(id, { treeX: 1260, banner: false }),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.7), walk = u < 0.7;
      return onlookers(g, [360, 520, 1010, 1170], 790, 1.35) + tinBox(id, 820, 860, 0.62, { dirt: 0.3, g }) +
        person({ x: 640, y: 870, s: 1.72, who: 'hu', pose: { ...P.stand(), lean: 34, head: 22, aF: 64, eF: 26, aB: 40, eB: 40, lF: 18, kF: 26, lB: -8, kB: 14 }, g, mood: 'shock' }) +
        person({ x: lerp(1500, 1090, k), y: 880, s: 1.75, who: 'you', pose: walk ? P.walk(g * 1.6, 1.2) : P.stand(), g, face: -1 }) + person({ x: lerp(1680, 1270, k), y: 886, s: 1.8, who: 'tao', pose: walk ? P.walk(g * 1.6 + 0.4, 1.2) : { ...P.stand(), lean: 10 }, g, face: -1, mood: 'shock' });
    },
    cam: [[920, 580, 1500], [900, 600, 1300]],
  },
  // ---------- 5 胡老师念标签（手指一行行移过去） ----------
  'tc1.label': {
    bg: (id) => sky(id, '#8A6844', '#6A4E32'),
    fg: (u, g) => {
      const row = Math.min(2, Math.floor(u * 3)), p = (u * 3) % 1, ys = [398, 484, 570], xs: [number, number][] = [[600, 1000], [520, 1080], [610, 990]];
      const fx = lerp(xs[row][0], xs[row][1], seg(p, 0.05, 0.9)), fy = ys[row] + 28;
      return tinTop(800, 450, 1.3, { dirt: 0.45 - 0.3 * seg(u, 0, 0.4) }) +
        `<g transform="translate(${f(fx)},${f(fy)})"><path d="M-14,0 Q-16,-30 0,-34 Q16,-30 14,0 L18,220 L-18,220 Z" fill="${SKIN}" stroke="${INK}" stroke-width="3"/><ellipse cx="0" cy="-22" rx="8" ry="6" fill="#F4E6D8"/></g>`;
    },
    cam: [[800, 470, 1250], [800, 470, 1100]],
  },
  // ---------- 6 AI 眼镜在翻译（不把要找的那几处摆出来） ----------
  'tc1.glasses': {
    bg: (id) => sky(id, '#8A6844', '#6A4E32') + `<g opacity=".35">${tinTop(800, 450, 1.3, { dirt: 0.2 })}</g>` + `<rect x="-200" y="-200" width="2000" height="1300" fill="#1C2440" opacity=".6"/>`,
    fg: (u, g) => aiGlasses(800, 430, 1.5, g) + `<text x="800" y="760" font-size="44" font-weight="900" fill="#CFE6F2" text-anchor="middle" ${SANS} opacity="${f(0.6 + 0.3 * Math.sin(g * 2))}">EN → 中文</text>`,
    cam: [[800, 450, 1600], [800, 440, 1450]],
  },
  // ---------- 7 Tao：是谁埋的？为什么？ ----------
  'tc1.taoAsk': {
    bg: (id) => campusBg(id, { treeX: 1100, banner: false }) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#F1E6CC" opacity=".55"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'tao', g, open: 1.05, brow: 0.55, mouth: talk(g) * 0.5, look: 0.35 }) +
      [[1230, 300, 90], [1280, 420, 64], [1170, 220, 54]].map(([x, y, sz], i) => `<text x="${x}" y="${f(y + Math.sin(g * 2 + i) * 8)}" font-size="${sz}" font-weight="900" fill="#C98A1E" opacity="${f(seg(u, 0.1 + i * 0.12, 0.3 + i * 0.12))}" ${SANS}>?</text>`).join(''),
    cam: [[780, 470, 1200], [790, 450, 1050]],
  },
  // ---------- 8 胡老师：它在这棵树下待了三十年（镜头从盒子摇到树冠） ----------
  'tc1.huThirty': {
    bg: (id) => campusBg(id, { treeX: 1060, banner: false }),
    fg: (u, g, id) => digPit(id, 980, 800, 280, { k: 0.85, g }) + person({ x: 620, y: 830, s: 1.75, who: 'hu', pose: { ...P.give(0.55), head: -14 - 10 * seg(u, 0.3, 0.8) }, g, hold: 'tin' }) +
      person({ x: 420, y: 836, s: 1.68, who: 'tao', pose: { ...P.stand(), head: -18 * seg(u, 0.35, 0.8) }, g }) + person({ x: 270, y: 840, s: 1.62, who: 'you', pose: { ...P.stand(), head: -18 * seg(u, 0.4, 0.85) }, g }) +
      ginkgoFall(14, g, { x0: 600, x1: 1600, y0: 40, y1: 860, n: 20, wind: -60 }),
    cam: [[700, 600, 1250], [960, 330, 1350]],
  },
  // ---------- 9 Tao：三十年？比我大一倍！ ----------
  'tc1.taoJoke': {
    bg: (id) => campusBg(id, { treeX: 1250, banner: false }),
    fg: (u, g, id, v) => person({ x: 680, y: 840, s: 1.85, who: 'tao', pose: P.laugh(g * 0.4), g, mood: 'laugh' }) + person({ x: 470, y: 846, s: 1.7, who: 'you', pose: P.stand(), g, mood: 'laugh' }) +
      pin(v, 0.7, 0.24, `<g opacity="${f(seg(u, 0.25, 0.5))}"><rect x="-210" y="-70" width="420" height="104" rx="14" fill="#FBF7EC" stroke="#B8AE98" stroke-width="3"/><text x="0" y="8" font-size="62" fill="#2B3A6E" text-anchor="middle" ${HAND}>15 × 2 = 30</text></g>`),
    cam: [[840, 560, 1250], [840, 560, 1150]],
  },
  // ---------- 10 胡老师：这是一个时间胶囊！ ----------
  'tc1.huCapsule': {
    bg: (id) => campusBg(id, { treeX: 1180, banner: false }),
    fg: (u, g, id) => {
      const up = seg(u, 0.05, 0.45);
      return glow(id, 800, 560, 260, g, 0, 0.45 * up) + person({ x: 780, y: 850, s: 1.95, who: 'hu', pose: { ...P.give(lerp(0.5, 1, up)), head: -8 }, g, hold: 'tin', mood: 'laugh' }) +
        person({ x: 470, y: 856, s: 1.75, who: 'you', pose: P.stand(), g, mood: 'shock' }) + person({ x: 1120, y: 856, s: 1.8, who: 'tao', pose: P.stand(), g, face: -1, mood: 'shock' }) +
        Array.from({ length: 8 }, (_, i) => { const a = i * 0.8 + g * 0.6, rr = 150 + 30 * Math.sin(g * 2 + i); return `<path d="M${f(860 + Math.cos(a) * rr)},${f(500 + Math.sin(a) * rr * 0.6)} l5,14 l14,5 l-14,5 l-5,14 l-5,-14 l-14,-5 l14,-5 z" fill="${GOLD}" opacity="${f(up * (0.4 + 0.5 * Math.sin(g * 3 + i)))}"/>`; }).join('') + ginkgoFall(15, g, { x0: 400, x1: 1500, n: 12 });
    },
    cam: [[800, 540, 1300], [800, 520, 1120]],
  },
  // ---------- 11 英语社活动室：大家屏住呼吸，胡老师掀开盒盖 ----------
  'tc1.clubroom': {
    bg: (id) => clubBg(id),
    fg: (u, g, id) => {
      const lid = seg(u, 0.3, 0.9);
      return onlookers(g, [360, 1300], 760, 1.62) + person({ x: 540, y: 760, s: 1.7, who: 'you', pose: { ...P.stand(), lean: 8, head: 12 }, g, mood: 'shock' }) + person({ x: 1150, y: 760, s: 1.75, who: 'tao', pose: { ...P.stand(), lean: 10, head: 12 }, g, face: -1, mood: 'shock' }) +
        person({ x: 960, y: 760, s: 1.7, who: 'hu', pose: { ...P.give(lerp(0.5, 0.9, lid)), lean: 18, head: 16 }, g, face: -1 }) + longTable(800, 640, 1000) + tinBox(id, 730, 640, 0.75, { lid, glow: 0.6 * lid, g, inside: 'letters' }) +
        (u < 0.35 ? `<text x="1140" y="330" font-size="60" fill="#5A4A3A" ${SANS} opacity=".7">…</text>` : '');
    },
    cam: [[860, 540, 1040], [860, 600, 1000]],
  },
  // ---------- 12 盒子里：四十封信、一张合影、一盘磁带 ----------
  'tc1.inside': {
    bg: (id) => woodTop(id),
    fg: (u, g, id, v) => {
      const a = 0.35 + 0.65 * seg(u, 0, 0.3), b = seg(u, 0.25, 0.55), c = seg(u, 0.5, 0.8);
      let o = '';
      for (let i = 0; i < 9; i++) o += `<g opacity="${f(a)}">${envelope(800 + (i % 2 ? 4 : -4) + i * 3, 470 - i * 9 - (1 - a) * 40, 1.15, i === 3 ? 'pink' : 'white', { rot: (i % 3 - 1) * 3, front: true, text: i === 8 ? 'To the students of 2026' : '' })}</g>`;
      o += `<g opacity="${f(b)}">${classPhoto(id, 150, 230 - (1 - b) * 40, 0.62, { rot: -6, g })}</g>`;
      o += `<g opacity="${f(c)}">${cassette(1310, 470 - (1 - c) * 40, 0.95, { rot: 8, g })}</g>`;
      return o + pin(v, 0.5, 0.86, `<g opacity="${f(a)}"><text x="0" y="0" font-size="56" font-weight="700" fill="#FFE9A8" text-anchor="middle" ${HAND}>× 40</text></g>`);
    },
    cam: [[800, 450, 1600], [800, 450, 1450]],
  },
  // ---------- 13 Tao：都是用英语写的！“To the students of 2026” ----------
  'tc1.letters': {
    bg: (id) => woodTop(id),
    fg: (u, g) => {
      const k = seg(u, 0.05, 0.5);
      return envelope(330, 540, 1.1, 'white', { rot: -3, front: true, text: 'For 2026 — from Class 3' }) + envelope(1270, 540, 1.1, 'white', { rot: 3, front: true, text: 'Hello, future students!' }) +
        envelope(800, lerp(560, 430, k), lerp(1.2, 1.75, k), 'white', { rot: lerp(-6, 0, k), front: true, text: 'To the students of 2026' });
    },
    cam: [[800, 470, 1500], [800, 450, 1400]],
  },
  // ---------- 14 1996 年的预测：每家都会有机器人 ----------
  'tc1.robot': {
    bg: (id) => woodTop(id),
    fg: (u, g, id) => letter(id, 80, 150, 1, { lines: ['In 2026, every family will have a robot. It will cook, clean and help me with my homework!', 'Zhao Min'], reveal: seg(u, 0, 0.6), w: 680, size: 36 }) +
      `<rect x="830" y="130" width="640" height="620" fill="#FBF7EC" stroke="#B8AE98" stroke-width="2" transform="rotate(3 1150 440)"/>` + robotDoodle(1150, 660, 1.05, g, seg(u, 0.3, 0.7)),
    cam: [[780, 450, 1600], [790, 450, 1500]],
  },
  // ---------- 15 “汽车会飞，再也不堵车”——Tao：我的那辆还没来呢 ----------
  'tc1.flyCar': {
    bg: (id) => streetBg(id),
    fg: (u, g) => {
      const dream = u < 0.55 ? seg(u, 0.02, 0.2) : 1 - seg(u, 0.55, 0.75);
      return `<g opacity="${f(dream)}"><ellipse cx="1050" cy="230" rx="330" ry="150" fill="#FBF7EC" opacity=".85" stroke="#B8AE98" stroke-width="3"/>${flyCarDoodle(lerp(860, 1190, seg(u, 0, 0.55)), 260, 1, g)}</g>` +
        `<rect x="190" y="420" width="10" height="200" fill="#4A4A4E"/><rect x="140" y="400" width="110" height="56" rx="6" fill="#2F5DA8"/><text x="195" y="440" font-size="30" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>BUS</text>` +
        person({ x: 330, y: 640, s: 1.45, who: 'tao', pose: u < 0.55 ? { ...P.stand(), head: -24 } : { ...P.akimbo(), head: -10 }, g, mood: u < 0.55 ? 'calm' : 'sad' }) + jam(g, 790, 0.8);
    },
    cam: [[820, 460, 1600], [800, 470, 1450]],
  },
  // ---------- 16 “以后没人写信了”——写在一封信里！四十封信一封封冒出来 ----------
  'tc1.nobody': {
    bg: (id) => woodTop(id),
    fg: (u, g, id, v) => {
      const n = Math.min(40, Math.floor(seg(u, 0.35, 0.9) * 40.99)), r = rng(16);
      let o = '';
      for (let i = 0; i < 40; i++) { const x = r() * 1500 + 50, y = r() * 800 + 50, rot = (r() - 0.5) * 40; if (x > 460 && x < 1140 && y > 220 && y < 680) continue; if (i < n) o += envelope(x, y, 0.42, i % 7 === 3 ? 'blue' : 'white', { rot, front: true }); }
      o += letter(id, 500, 260, 1, { lines: ['In 2026, nobody will write letters anymore.', 'Liu Yang'], w: 600, size: 38, hl: u > 0.15 ? 0 : undefined });
      return o + pin(v, 0.5, 0.9, `<g opacity="${f(seg(u, 0.4, 0.5))}"><rect x="-90" y="-50" width="180" height="70" rx="12" fill="#2A1E14" opacity=".75"/><text x="0" y="6" font-size="46" font-weight="900" fill="#FFE9A8" text-anchor="middle" ${SANS}>${n}</text></g>`);
    },
    cam: [[800, 450, 1600], [800, 450, 1500]],
  },
  // ---------- 17 Tao：我妈还真有个机器人——扫地机器人，还吃我的袜子 ----------
  'tc1.vacuum': {
    bg: (id) => sky(id, '#EDE4D0', '#E2D6BC') + `<rect x="-200" y="520" width="2000" height="580" fill="#B99A72"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M-200,${560 + i * 50} H1800" stroke="#A4865E" stroke-width="2" opacity=".5"/>`).join('') +
      `<g transform="translate(330,560) scale(2.4,2.4)">${seat('sofa', 0, 0, 1)}</g><rect x="1100" y="200" width="300" height="220" fill="#CFE3EC" stroke="#F4EEE4" stroke-width="14"/>`,
    fg: (u, g) => {
      const x = lerp(-120, 1500, seg(u, 0, 1)), sx = 860, k = clamp((x - (sx - 60)) / 90);
      return sock(sx, 760, 1, k) + vacuumBot(x, 790, 1, g) +
        (x > sx - 40 && x < sx + 360 ? `<text x="${f(x + 40)}" y="640" font-size="56" font-weight="900" fill="#C23B2E" ${HAND}>slurp!</text>` : '') +
        (k >= 1 ? `<path d="M${f(x - 120)},780 q-30,-4 -50,10" stroke="#C23B2E" stroke-width="14" fill="none" stroke-linecap="round"/>` : '');
    },
    cam: [[800, 600, 1400], [820, 620, 1250]],
  },
  // ---------- 18 预测板：成真了没有？ ----------
  'tc1.predBoard': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A') + corkBoard(130, 90, 1340, 720),
    fg: (u, g) => {
      const cs: [number, number, string, string][] = [[165, 130, IC.phone, 'phones'], [490, 115, IC.mail, 'email'], [815, 140, IC.robot, 'robots'], [1140, 120, IC.letter, 'no letters'],
        [175, 450, IC.laptop, 'home lessons'], [500, 470, IC.car, 'flying cars'], [825, 445, IC.moon, 'the Moon'], [1150, 465, IC.nohw, 'no homework']];
      return cs.map(([x, y, ic, t], i) => card(x, y, ic, t, (i % 2 ? 3 : -3) + wav(g, 3, i) * 0.6)).join('');
    },
    cam: [[800, 460, 1600], [800, 460, 1520]],
  },
  // ---------- 19 轮到你：给 2056 年写一句预测 ----------
  'tc1.write2056': {
    bg: (id) => woodTop(id, '#6E4C30', '#5E3E26'),
    fg: (u, g) => {
      const px = 1010 + Math.sin(g * 9) * 14;
      let o = `<g transform="translate(470,170)"><rect x="8" y="10" width="660" height="520" fill="#000" opacity=".2"/><rect width="660" height="520" fill="#FBF7EA" stroke="#C9B994" stroke-width="3"/>`;
      for (let i = 1; i < 10; i++) o += `<line x1="0" y1="${i * 52}" x2="660" y2="${i * 52}" stroke="#A9C6E2" stroke-width="2"/>`;
      o += `<line x1="70" y1="0" x2="70" y2="520" stroke="#E2A2A2" stroke-width="2"/><text x="90" y="42" font-size="36" font-weight="700" fill="#8E2A26" ${HAND}>Dear students of 2056,</text><text x="90" y="146" font-size="38" fill="#2B2A6E" ${HAND}>In 2056, ______ will ______ .</text></g>`;
      return o + `<path d="M${f(px)},${f(380 - 10 * Math.sin(g * 9))} l120,-260" stroke="#E4B83E" stroke-width="16" stroke-linecap="round"/><path d="M${f(px)},${f(380 - 10 * Math.sin(g * 9))} l10,-22" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>`;
    },
    cam: [[800, 450, 1150], [800, 440, 1000]],
  },
  // ---------- 20 盒底的粉色信封：拆开，一把小铜钥匙滑出来 ----------
  'tc1.pink': {
    bg: (id) => woodTop(id),
    fg: (u, g, id) => {
      const op = seg(u, 0.05, 0.3), out = seg(u, 0.32, 0.62), land = u > 0.62;
      const kx = lerp(800, 1180, out), ky = lerp(330, 640, out) - Math.sin(out * Math.PI) * 120, rot = lerp(0, -105, out);
      return envelope(760, 470, 1.6, 'pink', { open: op, peek: seg(u, 0.25, 0.45) * 0.4 }) + (u > 0.3 ? brassKey(kx, ky, 1.05, { rot, g, glint: land ? 1 : 0 }) : '') + (land ? glow(id, 1100, 620, 120, g, 0, 0.35) : '');
    },
    cam: [[800, 470, 1300], [860, 480, 1150]],
  },
  // ---------- 21 粉色信：这封信不是写给未来的 ----------
  'tc1.letterA': {
    bg: (id) => woodTop(id),
    fg: (u, g, id) => letter(id, 400, 40, 1, { ...LET, reveal: lerp(0.05, revealTo(1), seg(u, 0, 0.85)), hl: 1, paper: 'pink' }),
    cam: [[800, 330, 1100], [800, 300, 980]],
  },
  // ---------- 22 两个星期前：八音盒从桌上掉下去，音乐停了（回忆） ----------
  'tc1.fall1996': {
    bg: (id) => classroom96Bg(id, { board: ['June 13, 1996', 'Graduation Show', 'Class 3, Grade 9'] }) + `<rect x="1240" y="300" width="110" height="80" fill="#F4F1E8" stroke="#8A7E6A" stroke-width="2"/><rect x="1240" y="300" width="110" height="22" fill="#B8322A"/><text x="1295" y="317" font-size="15" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>1996 · 6</text><text x="1295" y="366" font-size="38" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>13</text>`,
    fg: (u, g, id, v) => {
      const bump = 0.4, fall = seg(u, bump, bump + 0.12), down = u > bump + 0.12, playing = u < bump;
      const bx = lerp(640, 760, fall), by = lerp(715, 870, fall * fall), rot = lerp(0, 76, fall);
      const fx = lerp(1500, 830, seg(u, 0, bump)), kOut = seg(u, bump + 0.04, bump + 0.3);
      const keyX = lerp(780, 1340, kOut), keyY = lerp(690, 870, kOut) - Math.sin(kOut * Math.PI) * 140;
      return deskScene(id, g, { mood: down ? 'shock' : 'calm', pose: down ? { ...P.sitRest(), aF: 70, eF: 20, head: 18 } : P.sitRest() }) +
        musicBox(id, bx, by, 0.34, { lid: 1, spin: playing ? g * 0.4 : 0, g, rot }) + notes(660, 640, 0.6, g, playing ? 1 : 1 - seg(u, bump, bump + 0.1)) +
        (u > bump ? brassKey(keyX, keyY, 0.32, { rot: kOut * 540 }) : '') +
        person({ x: fx, y: 880, s: 1.75, who: 'fang', pose: u < bump ? { ...P.walk(g * 1.3), aF: 70, eF: 70 } : { ...P.stand(), aF: 70, eF: 70, lean: -6, head: 14 }, g, face: -1, hold: 'yearbook', mood: down ? 'shock' : 'calm' }) +
        tint96(id, v, { g, year: 'June 1996' });
    },
    cam: [[880, 540, 1500], [860, 540, 1350]],
  },
  // ---------- 23 她以为我是故意的；她不理我，我一个人走回家（回忆） ----------
  'tc1.alone': {
    bg: (id) => street96(id),
    fg: (u, g, id, v) => {
      const k = seg(u, 0, 1);
      return onlookersBack(g, lerp(1080, 1460, k)) + person({ x: lerp(160, 620, k), y: 820, s: 1.7, who: 'fang', pose: { ...P.walk(g * 0.9, 0.6), head: 20, lean: 6 }, g, mood: 'sad' }) + tint96(id, v, { g, year: 'June 1996' });
    },
    cam: [[720, 520, 1500], [860, 540, 1400]],
  },
  // ---------- 24 她家下个月要搬到上海；我不知道怎么说对不起（回忆） ----------
  'tc1.moving': {
    bg: () => '',
    fg: (u, g, id, v) => mapEast(id, seg(u, 0.1, 0.85), g) +
      `<g transform="translate(260,250) rotate(-4)"><rect x="6" y="8" width="300" height="320" fill="#000" opacity=".2"/><rect width="300" height="320" fill="#FBF7EC" stroke="${INK}" stroke-width="3"/><rect width="300" height="80" fill="#B8322A"/><text x="150" y="56" font-size="44" font-weight="900" fill="#FFF6DD" text-anchor="middle" ${SANS}>JULY</text><text x="150" y="230" font-size="96" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>1996</text></g>` +
      tint96(id, v, { g, year: 'June 1996' }),
    cam: [[800, 450, 1600], [820, 440, 1500]],
  },
  // ---------- 25 这是她八音盒的钥匙；如果你找到她…… ----------
  'tc1.keyHand': {
    bg: (id) => woodTop(id) + `<g opacity=".19">${letter(id, 300, 40, 1, { ...LET, hl: 5, paper: 'pink' })}</g>` + `<rect x="-200" y="-200" width="2000" height="1300" fill="#2A1E14" opacity=".35"/>`,
    fg: (u, g, id) => palm(820, 620 - seg(u, 0, 0.4) * 60, 1.5) + brassKey(800, 610 - seg(u, 0, 0.4) * 60, 1.3, { rot: -96, g, glint: 1 }) + glow(id, 780, 560, 180, g, 0, 0.3),
    cam: [[800, 520, 1150], [800, 500, 1000]],
  },
  // ---------- 26 最后一行被水洇了；下面只认得出一个字母：F ----------
  'tc1.smudge': {
    bg: (id) => woodTop(id),
    fg: (u, g, id) => {
      const [fx, fy] = signF(400, 40, 1), ring = seg(u, 0.6, 0.8);
      return letter(id, 400, 40, 1, { ...LET, paper: 'pink' }) + signBlur(400, 40, 1) +
        `<ellipse cx="${f(fx + 6)}" cy="${f(fy - 10)}" rx="${f(40 + 6 * Math.sin(g * 3))}" ry="${f(34 + 6 * Math.sin(g * 3))}" fill="none" stroke="#C23B2E" stroke-width="5" opacity="${f(ring)}"/>`;
    },
    cam: [[800, 631, 880], [800, 631, 880]],
  },
  // ---------- 27 Tao：告诉她什么？我们得找到 Chen Yu！ ----------
  'tc1.taoWhat': {
    bg: (id) => sky(id, '#EDE4D0', '#E2D6BC') + `<rect x="880" y="40" width="300" height="420" fill="#CFE3EC" stroke="#F4EEE4" stroke-width="16"/><path d="M1030,40 V460 M880,250 H1180" stroke="#F4EEE4" stroke-width="10"/>` + ginkgoLeaf2(),
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'tao', g, open: 1.2, brow: 0.8, mouth: 0.25 + talk(g) * 0.45, look: 0.2, nod: Math.max(0, Math.sin(g * 6)) * seg(u, 0.5, 0.8) }),
    cam: [[780, 470, 1200], [790, 450, 1050]],
  },
  // ---------- 28 胡老师望着窗外的银杏：三十年过去了。F 是谁？Chen Yu 是谁？在哪儿？ ----------
  'tc1.huWindow': {
    bg: (id) => clubBg(id),
    fg: (u, g, id, v) => {
      let o = ginkgoFall(28, g, { x0: 890, x1: 1340, y0: 130, y1: 430, n: 9, s: 0.8, wind: 30 });
      o += person({ x: 1150, y: 760, s: 1.75, who: 'hu', pose: { ...P.stand(), aF: 60, eF: 70, head: -6 }, g, hold: 'letter', mood: 'sad' });
      const qs: [number, number, string][] = [[0.3, 0.42, '“F” = ?'], [0.3, 0.56, 'Chen Yu = ?'], [0.3, 0.7, 'Where are they now?']];
      return o + qs.map(([fx, fy, t], i) => pin(v, fx, fy, `<g opacity="${f(seg(u, 0.25 + i * 0.18, 0.4 + i * 0.18))}"><rect x="${f(-t.length * 13 - 20)}" y="-46" width="${f(t.length * 26 + 40)}" height="66" rx="12" fill="#FBF7EC" stroke="#B8AE98" stroke-width="2"/><text x="0" y="2" font-size="40" fill="#8E2A26" text-anchor="middle" ${HAND}>${t}</text></g>`)).join('');
    },
    cam: [[960, 480, 1160], [970, 480, 1140]],
  },
  // ---------- 29 把这只盒子的故事排一排（卡片打乱，不给年份） ----------
  'tc1.timeline': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A') + corkBoard(130, 110, 1340, 680),
    fg: (u, g) => {
      const cs: [number, number, string][] = [[1080, 470, IC.dig], [200, 150, IC.cake], [600, 480, IC.school], [1010, 140, IC.mbox], [180, 470, IC.bury]];
      return cs.map(([x, y, ic], i) => card(x, y, ic, '?', (i % 2 ? 4 : -4) + wav(g, 3, i) * 0.6, { w: 300, h: 260, fs: 64, is: 1.5 })).join('');
    },
    cam: [[800, 460, 1600], [800, 460, 1520]],
  },
  // ---------- 30 下一章：那张老合影，四十张笑脸里，谁是 Chen Yu？ ----------
  'tc1.end': {
    bg: (id) => woodTop(id),
    fg: (u, g, id) => {
      const lx = lerp(330, 1250, (Math.sin(g * 0.5) + 1) / 2), ly = 420 + Math.sin(g * 0.9) * 50;
      return classPhoto(id, 160, 110, 2, { g }) + loupe(lx, ly, 110) + `<text x="${f(lx)}" y="${f(ly - 140)}" font-size="70" font-weight="900" fill="#FFE9A8" stroke="#5A3A10" stroke-width="3" text-anchor="middle" ${SANS} opacity="${f(0.5 + 0.5 * Math.sin(g * 2))}">?</text>`;
    },
    cam: [[800, 450, 1600], [800, 430, 1400]],
  },

  // ================ 讲语法的小视频（拓展里的 viz('clip', …)） ================
  // 被动：1996 年，学生挖坑、放进盒子、填土（The students buried the box. → The box was buried.）
  'tc1.clipBuryDig': {
    bg: (id) => campusBg(id, { treeX: 1150, banner: false }),
    fg: (u, g, id, v) => {
      const digK = seg(u, 0, 0.18), lower = seg(u, 0.18, 0.32), cover = seg(u, 0.32, 0.5), buried = u > 0.5;
      const pit = buried ? '' : digPit(id, 820, 800, 300, { k: lerp(0.3, 1, digK) * (1 - 0.7 * cover), box: lower >= 1 ? 1 - cover : 0, g });
      const stand = (ph: number) => ({ ...P.stand(), lean: u < 0.18 || (u > 0.32 && u < 0.5) ? 22 + 12 * Math.sin(g * 2.8 + ph) : 0, aF: 50, eF: 30, aB: 40, eB: 50 });
      let o = pit + (buried ? `<ellipse cx="820" cy="800" rx="150" ry="40" fill="#7E5C3A" opacity=".8"/><path d="M700,800 q60,-24 120,-20 q60,4 110,22" stroke="#6A4A2E" stroke-width="6" fill="none"/>` + `<g opacity="${f(seg(u, 0.55, 0.7))}"><rect x="740" y="830" width="160" height="80" fill="none" stroke="#FFE9A8" stroke-width="4" stroke-dasharray="12 8"/><path d="M820,700 v110" stroke="#FFE9A8" stroke-width="5"/><path d="M806,790 l14,22 l14,-22" fill="#FFE9A8"/></g>` : '');
      o += person({ x: 600, y: 810, s: 1.55, who: 'stuA', pose: stand(0), g, hold: 'shovel' }) + person({ x: 1050, y: 816, s: 1.55, who: 'stuB', pose: stand(1.5), g, face: -1, hold: 'shovel' });
      o += person({ x: lerp(380, 700, seg(u, 0.12, 0.24)), y: 820, s: 1.6, who: 'mia', pose: lower > 0 && lower < 1 ? { ...P.give(1), lean: 34, head: 20 } : u > 0.32 ? P.stand() : P.give(0.6), g, hold: lower < 1 ? 'tin' : undefined });
      return o + tint96(id, v, { g, year: false });
    },
    cam: [[820, 560, 1350], [820, 580, 1300]],
  },
  'tc1.clipBuryLabel': {
    bg: (id) => sky(id, '#8A6844', '#6A4E32'),
    fg: (u, g, id, v) => tinTop(800, 450, 1.3, { dirt: 0.2 }) + tint96(id, v, { g, year: false, k: 0.6 }),
    cam: [[800, 450, 1250], [800, 450, 1150]],
  },
  // 现在完成时：地下的剖面，盒子一直在土里；年份 1996 → 2026，叶子绿了黄、黄了绿，最后工人挖下来
  'tc1.clipYears': {
    bg: (id) => sky(id, '#C9DCE4', '#F2E6CC') + `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#7E5C3A"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M-200,${640 + i * 50} Q400,${630 + i * 50} 800,${650 + i * 50} T1800,${640 + i * 50}" stroke="#6A4A2E" stroke-width="4" opacity=".5" fill="none"/>`).join('') + `<rect x="-200" y="596" width="2000" height="10" fill="#5E7A44"/>`,
    fg: (u, g, id, v) => {
      const yk = seg(u, 0.04, 0.74), year = Math.min(2026, 1996 + Math.floor(yk * 30.99)), gold = 0.5 + 0.5 * Math.sin(yk * 30 * Math.PI * 2), dug = seg(u, 0.78, 0.95);
      let o = ginkgoTree(600, 600, 0.72, { gold, g }) + (gold > 0.6 ? ginkgoFall(30, g, { x0: 340, x1: 940, y0: 160, y1: 600, n: 8, s: 0.7 }) : '');
      if (u > 0.76) o += `<path d="M630,600 L890,600 L870,${f(600 + dug * 150)} L650,${f(600 + dug * 150)} Z" fill="#3A2A1E"/>` + person({ x: 980, y: 600, s: 1.25, who: 'worker', pose: { ...P.stand(), lean: 24 + 10 * Math.sin(g * 2.6), aF: 50, eF: 30, aB: 40, eB: 50 }, g, face: -1, hold: 'shovel' });
      o += tinBox(id, 740, 840 - dug * 60, 0.5, { dirt: 1, g });
      if (u < 0.76) for (let i = 0; i < 3; i++) { const t = (g * 0.9 + i / 3) % 1; o += person({ x: lerp(-100, 1700, t), y: 600, s: 0.75, who: i % 2 ? 'stuB' : 'stuA', pose: P.walk(g * 3 + i, 1), g, a: 0.6 }); }
      return o + pin(v, 0.08, 0.13, `<g><rect x="0" y="-62" width="250" height="86" rx="12" fill="#2A1E14" opacity=".75"/><text x="125" y="6" font-size="64" font-weight="900" fill="#FFE9A8" text-anchor="middle" ${SERIF}>${year}</text></g>`);
    },
    cam: [[820, 470, 1600], [820, 470, 1600]],
  },
  // has been（还在树下） 和 was（已经搬进活动室）
  'tc1.clipTree': {
    bg: (id) => campusBg(id, { treeX: 1100, banner: false }),
    fg: (u, g, id, v) => digPit(id, 900, 800, 300, { k: 1, box: 1, g }) + person({ x: 620, y: 820, s: 1.7, who: 'hu', pose: P.point(seg(u, 0.1, 0.4)), g }) + handNote(v, 0.5, 0.12, 'under the tree', 44),
    cam: [[820, 560, 1300], [820, 560, 1250]],
  },
  'tc1.clipTable': {
    bg: (id) => clubBg(id),
    fg: (u, g, id, v) => person({ x: 1060, y: 760, s: 1.75, who: 'tao', pose: P.point(seg(u, 0.1, 0.4)), g, face: -1 }) + longTable(700, 640, 820) + tinBox(id, 680, 640, 0.75, { g }) + handNote(v, 0.5, 0.12, 'in the clubroom', 44),
    cam: [[860, 480, 1040], [860, 480, 1040]],
  },
  // will：1996 年一个女生写“Cars will fly.”，想着会飞的汽车 → 2026 年，街上照样堵车，Tao 还在等
  'tc1.clipWill96': {
    bg: (id) => classroom96Bg(id, { board: ['June 1996', 'My Life in 2026', 'Class 3, Grade 9'] }),
    fg: (u, g, id, v) => deskScene(id, g, { who: 'mia', pose: { ...P.sitRest(), aF: 66, eF: 40 + 6 * Math.sin(g * 9), head: 16 } }) +
      `<g opacity="${f(seg(u, 0.2, 0.45))}"><ellipse cx="1050" cy="330" rx="330" ry="160" fill="#FBF7EC" stroke="#B8AE98" stroke-width="3"/><circle cx="780" cy="520" r="22" fill="#FBF7EC" stroke="#B8AE98" stroke-width="3"/><circle cx="730" cy="580" r="13" fill="#FBF7EC" stroke="#B8AE98" stroke-width="3"/>${flyCarDoodle(1050, 360, 1.1, g)}</g>` +
      tint96(id, v, { g, year: false }),
    cam: [[820, 480, 1500], [820, 480, 1480]],
  },
  'tc1.clipWill26': {
    bg: (id) => streetBg(id),
    fg: (u, g, id, v) => person({ x: 330, y: 640, s: 1.45, who: 'tao', pose: { ...P.akimbo(), head: -16 }, g, mood: 'sad' }) + jam(g, 790, 0.8) +
      `<g opacity=".5">${flyCarDoodle(1050, 260, 0.9, g, 0.6)}</g><path d="M880,140 L1220,380 M1220,140 L880,380" stroke="#C23B2E" stroke-width="12" stroke-linecap="round" opacity="${f(seg(u, 0.2, 0.4))}"/>` + timeTag(1420, 110, '2026', v),
    cam: [[800, 460, 1600], [800, 460, 1550]],
  },
};

/** 走在前面的几个女生（背影，结伴走远；其中一个梳两条辫子） */
function onlookersBack(g: number, x0: number) {
  return [0, 1, 2].map((i) => person({ x: x0 + i * 120, y: 800 - i * 4, s: 1.35, who: i === 1 ? 'yu' : i === 2 ? 'mia' : 'stuB', pose: P.walk(g * 1.2 + i * 0.3, 0.8), g })).join('');
}
