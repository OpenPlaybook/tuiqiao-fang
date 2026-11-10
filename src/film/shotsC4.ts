// 英文故事二 The Time Capsule · Chapter 4 Thirty Years Later：每一镜怎么画、怎么动（共用的人物、道具在 capsule.ts）
// 星期五：胡老师办公室打电话 → 医院里的 Fang → 学校发帖子 → 深夜上海，Yu 的邮件；
// 星期六：校庆礼堂（横幅 60）→ 后门开了 → 重逢 → 钥匙、上发条、小舞者转起来 → 掌声 → 新胶囊 → 银杏树下并肩走 → 第二天的报纸。
// 拓展里的小视频：tc4.clipIf（两条路）、tc4.clipHope（hope / wish）、tc4.clipSoon（一看见就站起来）、tc4.clipTouched（事让人感动 / 人被感动）、tc4.clipSaid（原话 → 报纸上的转述）。
import { GOLD, INK, f, glow, lerp, seg, sky, wav } from './core';
import { P, faceCU, person, type Pose } from './rig';
import { HAND, SANS, audience, clock, timeTag, talk } from './shotsE1';
import { SERIF, TCC, envelope, ginkgoFall, ginkgoTree, hall60Bg, leafCarpet, longTable, musicBox, seat, sitter, tint96 } from './capsule';
import type { ShotDef } from './Film';

const W = TCC.paper; // 纸

// ---------------- 姿势 ----------------
const ear = (g = 0): Pose => ({ ...P.stand(), aF: 135, eF: 135, head: 6 + wav(g, 3) * 2 }); // 手机贴在耳边
const sitDesk = (g = 0): Pose => ({ ...P.sit(), lean: 10, head: 8, aF: 72, eF: 34 + wav(g, 0.5) * 6, aB: 62, eB: 44 }); // 坐着、两手伸到桌上
const lean = (): Pose => ({ ...P.stand(), lean: 14, head: 16, aF: 24, eF: 30, aB: 12, eB: 30 }); // 探着身子听
const clap = (g: number, k: number, ph = 0): Pose => { const s = Math.sin((g * 3.2 + ph) * Math.PI * 2) * k; return { ...P.sitRest(), aF: 64 + 6 * s, eF: 70 - 16 * s, aB: 58 - 6 * s, eB: 76 - 16 * s }; };
const rise = (k: number): Pose => P.mix(P.sitRest(), P.stand(), k);
const hold = (): Pose => ({ ...P.stand(), aF: 50, eF: 70 }); // 两手捧着八音盒

// ---------------- 小道具 ----------------
/** 桌上的手机（侧面看，平放）+ 免提的声波 */
const deskPhone = (x: number, y: number, g: number) => `<rect x="${x - 40}" y="${y - 10}" width="80" height="12" rx="5" fill="#1E2028"/><rect x="${x - 34}" y="${y - 8}" width="68" height="6" rx="3" fill="#8FD0A6"/>` +
  [0, 1, 2].map((i) => { const k = (g * 0.9 + i / 3) % 1; return `<path d="M${f(x + 30 + k * 50)},${f(y - 16 - k * 14)} q${f(12 + k * 16)},${f(-14 - k * 8)} 0,${f(-30 - k * 18)}" stroke="#4E7A5A" stroke-width="5" fill="none" opacity="${f(1 - k)}"/>`; }).join('');
/** 手机（大的特写） */
const bigPhone = (x: number, y: number, s: number, inner: string) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-130" y="-250" width="260" height="500" rx="34" fill="#1E2028"/><rect x="-116" y="-226" width="232" height="452" rx="20" fill="#2A3344"/>${inner}</g>`;
/** 笔记本电脑的屏幕（大的）：inner 画在 0—960 × 0—560 的屏幕里 */
const laptop = (x: number, y: number, s: number, inner: string, clip: string) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-30" y="-30" width="1020" height="620" rx="26" fill="#2A2C32"/><clipPath id="${clip}"><rect width="960" height="560"/></clipPath><g clip-path="url(#${clip})"><rect width="960" height="560" fill="#F7F5F0"/>${inner}</g><path d="M-120,590 L1080,590 L1130,640 L-170,640 Z" fill="#BFC2C8"/></g>`;
/** 桌上打开的笔记本电脑（侧面看）：x 是转轴，屏幕朝左 */
const laptopSide = (id: string, x: number, y: number, s: number, g: number) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-90" y="-8" width="100" height="8" rx="2" fill="#9AA0A8"/><path d="M8,-6 L-14,-80 L-4,-82 L18,-6 Z" fill="#2A2C32"/><path d="M5,-10 L-14,-76" stroke="#CFE0F4" stroke-width="4" opacity=".9"/></g>` + glow(id, x - 30 * s, y - 50 * s, 90 * s, g, 0, 0.35);
/** 一行行灰线（报纸、信上的字） */
const lines = (x: number, y: number, w: number, n: number, gap = 22, c = '#9A9284', sw = 6) => Array.from({ length: n }, (_, i) => `<line x1="${x}" y1="${y + i * gap}" x2="${x + (i % 4 === 3 ? w * 0.6 : w)}" y2="${y + i * gap}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`).join('');
/** 说话的气泡（tail：尾巴朝左下 / 右下） */
const bubble = (x: number, y: number, w: number, h: number, txt: string[], size = 34, tail: 'l' | 'r' = 'l', a = 1) => {
  const tx = tail === 'l' ? -w / 4 : w / 4, d = tail === 'l' ? -1 : 1;
  return `<g transform="translate(${f(x)},${f(y)})" opacity="${f(a)}"><path d="M${f(tx - 20)},${h / 2 - 4} L${f(tx + d * 34)},${h / 2 + 44} L${f(tx + 20)},${h / 2 - 4} Z" fill="${W}" stroke="${INK}" stroke-width="3"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="26" fill="${W}" stroke="${INK}" stroke-width="3"/><rect x="${f(tx - 18)}" y="${h / 2 - 8}" width="36" height="8" fill="${W}"/>` +
    txt.map((t, i) => `<text x="0" y="${f((i - (txt.length - 1) / 2) * size * 1.25 + size * 0.35)}" font-size="${size}" text-anchor="middle" fill="${INK}" ${HAND}>${t}</text>`).join('') + `</g>`;
};
/** 新的时间胶囊：亮的金属盒，标签 OPEN IN 2056；lid 0—1 盖子掀开 */
const newCapsule = (x: number, y: number, s: number, lid = 0) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><g transform="translate(-150,-120) rotate(${f(-100 * lid)})"><rect x="0" y="-16" width="300" height="16" rx="4" fill="#9AA4AC" stroke="${INK}" stroke-width="3"/></g><rect x="-150" y="-120" width="300" height="120" rx="8" fill="#AEB8C0" stroke="${INK}" stroke-width="4"/><rect x="-150" y="-120" width="300" height="20" fill="#C9D2D8"/><rect x="-90" y="-90" width="180" height="70" fill="${W}" stroke="#7A8088" stroke-width="2"/><text x="0" y="-62" font-size="26" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>OPEN IN</text><text x="0" y="-30" font-size="30" font-weight="900" fill="#A8455A" text-anchor="middle" ${SANS}>2056</text></g>`;
/** 礼堂里的一张空座位（放在第一排）+ 写着 RESERVED 的小牌子 */
const reserved = (x: number, y: number, s: number) => seat('hall', x, y, s) + `<g transform="translate(${f(x - 6 * s)},${f(y - 70 * s)})"><rect x="-58" y="-34" width="116" height="40" rx="4" fill="${W}" stroke="#9A8A6A" stroke-width="2"/><text x="0" y="-6" font-size="22" font-weight="900" fill="#A8455A" text-anchor="middle" ${SANS}>RESERVED</text></g>`;
/** 礼堂的后门（在后墙上，左边）：开了，外面的光照进来 */
const sideDoor = (open: number) => `<rect x="40" y="300" width="230" height="320" fill="#4A3424"/><rect x="52" y="312" width="206" height="308" fill="#FFF3D0" opacity="${f(open)}"/><path d="M52,312 L${f(258 - 170 * open)},${f(322)} L${f(258 - 170 * open)},620 L52,620 Z" fill="#7A5236" stroke="${INK}" stroke-width="3"/>` +
  (open > 0.2 ? `<path d="M52,620 L258,620 L520,900 L-120,900 Z" fill="#FFF3D0" opacity="${f(0.32 * open)}"/>` : '');

// ---------------- 场景 ----------------
/** 胡老师的办公室：书架、窗外的银杏、墙上的校庆日历。地面 y 860 */
const huOffice = (id: string, cal = true) => sky(id, '#ECE1CC', '#E2D4BA') +
  `<rect x="980" y="140" width="440" height="340" fill="#CFE2EA"/>` + `${[[1080, 320, 90], [1200, 280, 110], [1330, 340, 90], [1150, 400, 80]].map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#EDBE45"/>`).join('')}<rect x="980" y="140" width="440" height="340" fill="none" stroke="#B7A27C" stroke-width="16"/><path d="M1200,140 v340 M980,310 h440" stroke="#B7A27C" stroke-width="10"/>` +
  `<rect x="40" y="160" width="380" height="540" fill="#8C6440"/>` + [0, 1, 2, 3].map((k) => `<rect x="52" y="${178 + k * 128}" width="356" height="10" fill="#6E4C30"/>` + Array.from({ length: 11 }, (_, i) => `<rect x="${60 + i * 31}" y="${188 + k * 128}" width="26" height="${92 + ((i * 7 + k * 3) % 4) * 6}" fill="${['#A8455A', '#3B6EA8', '#2E7D6B', '#C8963A', '#8A5A2E'][(i + k) % 5]}" opacity=".9"/>`).join('')).join('') +
  `<rect x="-200" y="700" width="2000" height="500" fill="#B89A72"/>` +
  (cal ? `<g transform="translate(640,300)"><rect x="-70" y="-60" width="140" height="160" fill="${W}" stroke="#9A8A6A" stroke-width="3"/><rect x="-70" y="-60" width="140" height="34" fill="#A8455A"/><text x="0" y="50" font-size="64" font-weight="900" fill="#A8455A" text-anchor="middle" ${SANS}>60</text><path d="M-50,76 h100" stroke="#C9BFA8" stroke-width="6"/></g>` : '');
/** 医院的办公室：浅绿的墙、窗外的城市、墙上孩子画的画。地面 y 860 */
const hospital = (id: string) => sky(id, '#DDEBE5', '#CFE0D9') +
  `<rect x="760" y="130" width="560" height="380" fill="#D7E6F0"/>` + Array.from({ length: 9 }, (_, i) => `<rect x="${780 + i * 60}" y="${320 - ((i * 37) % 5) * 30}" width="44" height="${190 + ((i * 37) % 5) * 30}" fill="#AFC2D2"/>`).join('') + `<rect x="760" y="130" width="560" height="380" fill="none" stroke="#F2F4F2" stroke-width="18"/><path d="M1040,130 v380" stroke="#F2F4F2" stroke-width="10"/>` +
  `<g transform="translate(400,300) rotate(-3)"><rect x="-120" y="-90" width="240" height="180" fill="#FFFDF6" stroke="#C9C2B4" stroke-width="3"/><circle cx="-60" cy="-40" r="26" fill="#F2C230"/><path d="M-20,60 L20,10 L60,60 Z" fill="#E86A5A"/><rect x="-10" y="60" width="60" height="-0" fill="#E86A5A"/><path d="M-90,70 q60,-20 180,0" stroke="#5AAA5A" stroke-width="8" fill="none"/><rect x="-14" y="-104" width="28" height="18" fill="#F0E6A8" opacity=".8"/></g>` +
  `<rect x="-200" y="660" width="2000" height="500" fill="#C9D3CF"/><rect x="160" y="520" width="300" height="140" fill="#F2F4F2" stroke="#B9C4C0" stroke-width="4"/>`;
/** 夜里，上海的家：窗外的灯和东方明珠，墙上挂着一把小提琴。地面 y 860 */
const nightRoom = (id: string) => sky(id, '#1C2236', '#252C44') +
  `<rect x="860" y="100" width="600" height="420" fill="#0E1426"/>` + `<path d="M860,520 L860,400 L920,400 L920,350 L990,350 L990,420 L1050,420 L1050,320 L1100,320 L1100,440 L1180,440 L1180,370 L1250,370 L1250,270 L1300,270 L1300,430 L1360,430 L1360,380 L1460,380 L1460,520 Z" fill="#1A2238"/>` +
  `<path d="M1150,520 L1150,270 M1150,252 l0,-110" stroke="#2A3452" stroke-width="10"/><circle cx="1150" cy="320" r="22" fill="#2A3452"/><circle cx="1150" cy="240" r="14" fill="#2A3452"/>` +
  Array.from({ length: 40 }, (_, i) => `<rect x="${870 + ((i * 53) % 580)}" y="${320 + ((i * 29) % 190)}" width="6" height="8" fill="#F2D27A" opacity="${0.4 + (i % 3) * 0.2}"/>`).join('') +
  `<rect x="860" y="100" width="600" height="420" fill="none" stroke="#3A3E52" stroke-width="16"/><rect x="-200" y="700" width="2000" height="500" fill="#2A2230"/>`;
/** 礼堂侧面（同 capsule 的 hall60Side，但条幅上不写字：镜头推拉时“60”常被切掉一半） */
const hallSide = (id: string) => sky(id, '#DCCAA8', '#CDB892') + Array.from({ length: 3 }, (_, i) => `<rect x="${-60 + i * 400}" y="100" width="240" height="220" fill="#C9DCE2" stroke="#B7A27C" stroke-width="10"/>`).join('') +
  `<rect x="1240" y="-200" width="600" height="760" fill="#8E2A26"/><path d="M1240,-200 Q1210,200 1250,620 L1300,620 Q1270,200 1300,-200 Z" fill="#9E2E2A"/><rect x="1330" y="140" width="400" height="200" fill="#A8322A" stroke="${GOLD}" stroke-width="5"/><circle cx="1440" cy="240" r="60" fill="none" stroke="${GOLD}" stroke-width="10"/><path d="M1380,320 q60,-30 120,0" stroke="${GOLD}" stroke-width="6" fill="none"/>` +
  `<rect x="1220" y="560" width="600" height="70" fill="#8C6440"/><rect x="-200" y="620" width="2000" height="480" fill="#B78C5C"/>`;
/** 特写的背景：礼堂的墙和窗（没有字），浅一点 */
const cuBg = (id: string) => sky(id, '#E6D8BA', '#DCCAA8') + Array.from({ length: 4 }, (_, i) => `<rect x="${-60 + i * 440}" y="100" width="260" height="230" fill="#D6E2E6" stroke="#C9B48E" stroke-width="10"/>`).join('') + `<rect x="-200" y="640" width="2000" height="500" fill="#C8A47A"/>`;
/** 报纸头版：标题、照片、两段引语 */
const newspaper = () => {
  let o = `<g transform="translate(260,40)"><rect x="10" y="14" width="1080" height="840" fill="#000" opacity=".2"/><rect width="1080" height="840" fill="#F4F1E8"/>`;
  o += `<text x="540" y="86" font-size="70" font-weight="900" fill="${INK}" text-anchor="middle" ${SERIF}>THE CITY NEWS</text><line x1="40" y1="112" x2="1040" y2="112" stroke="${INK}" stroke-width="4"/><text x="40" y="142" font-size="22" fill="#6A6458" ${SANS}>SUNDAY</text><text x="1040" y="142" font-size="22" fill="#6A6458" text-anchor="end" ${SANS}>PAGE 1</text>`;
  o += `<text x="540" y="218" font-size="56" font-weight="900" fill="${INK}" text-anchor="middle" ${SERIF}>After 30 Years,</text><text x="540" y="282" font-size="56" font-weight="900" fill="${INK}" text-anchor="middle" ${SERIF}>the Music Plays Again</text>`;
  // 照片：两个人和八音盒
  o += `<g transform="translate(40,320)"><rect width="480" height="330" fill="#CFC6B2"/>` + person({ x: 190, y: 318, s: 1.3, who: 'fang2', pose: { ...P.stand(), aF: 40, eF: 60 }, g: 0, face: 1 }) + person({ x: 300, y: 318, s: 1.25, who: 'yu2', pose: hold(), g: 0, face: -1, hold: 'musicbox' }) + `<rect width="480" height="330" fill="#B8A88A" opacity=".18"/><rect width="480" height="330" fill="none" stroke="#9A9284" stroke-width="3"/></g>`;
  o += `<text x="280" y="684" font-size="20" fill="#6A6458" text-anchor="middle" ${SANS}>Dr Lin Fang and Chen Yu</text>`;
  // 两段引语
  const q = (y: number, t: string) => `<text x="560" y="${y}" font-size="31" font-weight="700" fill="${INK}" ${SERIF}>${t}</text>`;
  o += q(352, '“Chen Yu told our reporter') + q(394, 'that she had kept the music') + q(436, 'box for thirty years.”');
  o += lines(560, 478, 460, 3, 26, '#B4AC9C', 7);
  o += q(586, '“Dr Lin said that they would') + q(628, 'never lose touch again.”');
  o += lines(40, 726, 1000, 4, 28, '#B4AC9C', 7);
  return o + `</g>`;
};
/** 打乱的事件卡片（不摆出顺序）：1996 和 2026 混在一起 */
const mixedCards = (g: number) => {
  const cards: [number, number, string, boolean][] = [[290, 200, 'rusty box found', false], [690, 170, 'an argument', true], [1090, 210, 'music plays again', false], [1360, 400, 'key under a cupboard', true], [300, 480, 'box buried', true], [700, 500, 'email at 11:04 p.m.', false], [1080, 640, 'Yu’s family moves', true], [420, 720, 'music box falls', true]];
  return cards.map(([x, y, t, old], i) => `<g transform="translate(${x - 150},${y - 65}) rotate(${f((i % 2 ? 3 : -3) + wav(g, 3, i) * 0.6)})"><rect x="4" y="6" width="300" height="130" fill="#000" opacity=".2"/><rect width="300" height="130" fill="${old ? '#E9DCB8' : W}"/><text x="150" y="54" font-size="40" font-weight="900" fill="#8E2A26" text-anchor="middle" ${HAND}>?</text><text x="150" y="104" font-size="30" fill="${INK}" text-anchor="middle" ${HAND}>${t}</text></g>`).join('');
};
const board = (id: string) => sky(id, '#4A3A34', '#3A2E2A') + `<rect x="60" y="60" width="1480" height="780" rx="10" fill="#7A5236"/><rect x="80" y="80" width="1440" height="740" fill="#C9A06A"/>`;
/** 掀开一点的盒盖下面的钥匙：转的时候画几道弧线 */
const turnArcs = (x: number, y: number, k: number) => k <= 0 ? '' : [0, 1].map((i) => `<path d="M${x - 70},${y + i * 6} A70,70 0 0 1 ${x + 70},${y + i * 6}" stroke="#FFE9A8" stroke-width="5" fill="none" stroke-dasharray="14 12" stroke-dashoffset="${f(-k * 200 - i * 13)}" opacity="${f(0.7 - i * 0.3)}"/>`).join('') + `<path d="M${x + 70},${y} l-14,-10 l18,-4 z" fill="#FFE9A8" opacity=".8"/>`;

// ---------------- 镜头 ----------------
export const SHOTS_C4: Record<string, ShotDef> = {
  // 星期五下午：胡老师坐在桌前，手机开着免提放在桌上；你和 Tao 站在桌子另一边，探着身子一动不动
  'tc4.office': {
    bg: (id) => huOffice(id),
    fg: (u, g, id, v) => sitter('hu', 540, 860, 2.1, g, { kind: 'chair', pose: sitDesk(g) }) + longTable(800, 690, 520, 0.77) + deskPhone(800, 688, g) +
      person({ x: 1080, y: 860, s: 2.1, who: 'tao', pose: lean(), g, face: -1 }) + person({ x: 1290, y: 860, s: 2.05, who: 'you', pose: lean(), g, face: -1 }) +
      timeTag(1420, 110, 'Friday', v),
    cam: [[860, 520, 1400], [880, 540, 1250]],
  },
  // 医院办公室：Fang 站在窗边接电话，愣住了
  'tc4.fangPhone': {
    bg: (id) => hospital(id),
    fg: (u, g) => person({ x: 900, y: 860, s: 2.4, who: 'fang2', pose: ear(g), g, face: -1, mood: 'shock' }),
    cam: [[820, 500, 1350], [880, 470, 1150]],
  },
  // 胡老师（特写）对着手机说话；桌上一粉一蓝两只信封
  'tc4.huPhone': {
    bg: (id) => huOffice(id, false) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#F4ECDC" opacity=".4"/>`,
    fg: (u, g, id) => faceCU({ id, x: 640, y: 440, s: 1.1, who: 'hu', g, mouth: talk(g), look: 0.2 }) +
      envelope(1080, 710, 0.95, 'pink', { rot: -8 }) + `<g opacity="${f(seg(u, 0.35, 0.65))}">${envelope(1250, 770, 0.95, 'blue', { rot: 7 })}</g>`,
    cam: [[840, 500, 1300], [900, 510, 1200]],
  },
  // 很长的沉默：桌上的手机，通话时间一秒一秒地走，声音的波形是平的
  'tc4.silence': {
    bg: (id) => sky(id, '#8C6440', '#7A5638') + `<rect x="-200" y="-200" width="2000" height="1400" fill="#000" opacity=".12"/>`,
    fg: (u, g, id) => {
      const sec = 41 + Math.floor(u * 11);
      return glow(id, 800, 450, 420, g, 0, 0.15) + bigPhone(800, 450, 1.25, `<circle cx="0" cy="-120" r="56" fill="#4A5A6E"/><text x="0" y="-100" font-size="54" fill="#E9EEF4" text-anchor="middle" ${SANS}>L</text><text x="0" y="-20" font-size="38" font-weight="700" fill="#F4F6F8" text-anchor="middle" ${SANS}>Dr Lin Fang</text><text x="0" y="36" font-size="34" fill="#9FD3B0" text-anchor="middle" ${SANS}>00:${sec}</text><line x1="-90" y1="120" x2="90" y2="120" stroke="#9FD3B0" stroke-width="4"/><circle cx="0" cy="190" r="34" fill="#C8453A"/>`);
    },
    cam: [[800, 450, 1300], [800, 440, 1050]],
  },
  // Fang（特写）：我明天就来
  'tc4.fangCU': {
    bg: (id) => hospital(id) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#EEF4F1" opacity=".45"/>`,
    fg: (u, g, id) => faceCU({ id, x: 900, y: 440, s: 1.15, who: 'fang2', face: -1, g, mouth: talk(g, 0.8), brow: 0.3, look: 0.1 }),
    cam: [[880, 450, 1300], [880, 440, 1150]],
  },
  // 学校发帖：网页上的帖子，点“POST”；一张邀请卡升起来
  'tc4.post': {
    bg: (id) => sky(id, '#2E3440', '#252A34'),
    fg: (u, g, id) => {
      const click = seg(u, 0.25, 0.32), card = seg(u, 0.45, 0.75);
      const page = `<rect width="960" height="70" fill="#A8455A"/><text x="30" y="46" font-size="30" font-weight="900" fill="#fff" ${SANS}>OUR SCHOOL · 1966–2026</text>` +
        (card < 0.2 ? `<text x="40" y="140" font-size="42" font-weight="900" fill="${INK}" ${SERIF}>Two Letters, One Box</text><text x="40" y="182" font-size="24" fill="#6A6458" ${SANS}>Do you know Chen Yu? She was in Class 3, Grade 9, in 1996.</text>` : lines(40, 128, 420, 1, 0, '#3A3A3A', 18) + lines(40, 176, 700, 1, 0, '#9A9284', 8)) +
        `<g transform="translate(40,212)"><rect width="300" height="200" fill="#C9B894"/>${person({ x: 120, y: 194, s: 0.85, who: 'fang', pose: P.stand(), g: 0 })}${person({ x: 190, y: 194, s: 0.82, who: 'yu', pose: hold(), g: 0, face: -1, hold: 'musicbox' })}<rect width="300" height="200" fill="#B8A88A" opacity=".2"/></g>` + lines(370, 230, 540, 6, 30, '#C4BCAC', 8) +
        `<rect x="760" y="470" width="160" height="60" rx="12" fill="${click > 0.5 ? '#2E7D4A' : '#3B6EA8'}"/>` + (card < 0.2 ? `<text x="840" y="511" font-size="30" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>${click > 0.5 ? 'POSTED' : 'POST'}</text>` : '') +
        `<path d="M${f(lerp(600, 830, seg(u, 0.05, 0.25)))},${f(lerp(380, 505, seg(u, 0.05, 0.25)))} l0,40 l12,-10 l10,22 l8,-4 l-10,-22 l16,0 z" fill="#fff" stroke="${INK}" stroke-width="2"/>`;
      return laptop(320, 140, 1, page, `${id}lp`) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#000" opacity="${f(0.35 * card)}"/>` +
        `<g transform="translate(800,${f(lerp(1150, 450, card))}) rotate(${f(-3 * card)})"><rect x="-290" y="-188" width="600" height="400" fill="#000" opacity=".25"/><rect x="-300" y="-200" width="600" height="400" fill="#FFF8E8"/><rect x="-280" y="-180" width="560" height="360" fill="none" stroke="${GOLD}" stroke-width="5"/><text x="0" y="-90" font-size="64" font-weight="900" fill="#A8455A" text-anchor="middle" ${SERIF}>INVITATION</text><text x="0" y="-10" font-size="38" fill="${INK}" text-anchor="middle" ${SERIF}>60th Birthday Ceremony</text><text x="0" y="50" font-size="32" fill="${INK}" text-anchor="middle" ${SANS}>Saturday · 10:00 a.m.</text><text x="0" y="100" font-size="32" fill="${INK}" text-anchor="middle" ${SANS}>School Hall</text></g>`;
    },
    cam: [[800, 450, 1600], [800, 450, 1500]],
  },
  // 夜里，上海：Yu 坐在桌前打字，桌上是那只旧八音盒
  'tc4.yuNight': {
    bg: (id) => nightRoom(id),
    fg: (u, g, id, v) => glow(id, 1000, 600, 240, g, 0, 0.5) + `<path d="M1070,690 L1100,600 L1150,600 L1170,690 Z" fill="#E9C46A" opacity=".9"/>` +
      sitter('yu2', 560, 860, 2.1, g, { kind: 'chair', pose: { ...sitDesk(g * 3), eF: 26 + Math.abs(wav(g, 0.3)) * 14 } }) + longTable(860, 690, 560, 0.77) +
      laptopSide(id, 840, 688, 1.8, g) + musicBox(id, 1010, 688, 0.42, { lid: 0 }) + timeTag(1380, 110, '11:04 p.m.', v),
    cam: [[820, 500, 1400], [840, 520, 1250]],
  },
  // 邮件：一行一行打出来
  'tc4.email': {
    bg: (id) => sky(id, '#1C2236', '#252C44'),
    fg: (u, g, id) => {
      const L = ['My name is Chen Yu.', 'I’m a music teacher in Shanghai.', 'If I can get a train ticket,', 'I will come tomorrow.'];
      const page = `<rect width="960" height="60" fill="#E4E8EE"/><text x="24" y="40" font-size="26" fill="#4A5260" ${SANS}>New Message · 11:04 p.m.</text>` +
        `<text x="40" y="110" font-size="28" fill="#4A5260" ${SANS}>From: Chen Yu</text><text x="40" y="150" font-size="28" fill="#4A5260" ${SANS}>Subject: The letter in the box</text><line x1="40" y1="172" x2="920" y2="172" stroke="#D0D4DA" stroke-width="3"/>` +
        L.map((t, i) => { const k = seg(u, 0.1 + i * 0.18, 0.24 + i * 0.18), n = Math.round(t.length * k); return `<text x="40" y="${240 + i * 70}" font-size="44" fill="${INK}" ${SERIF}>${t.slice(0, n)}${k > 0 && k < 1 && Math.sin(g * 12) > 0 ? '|' : ''}</text>`; }).join('');
      return laptop(320, 150, 1, page, `${id}lp`) + glow(id, 800, 430, 600, g, 0, 0.12);
    },
    cam: [[800, 450, 1550], [800, 440, 1400]],
  },
  // Tao 半夜看到消息（特写，手机的光照在脸上）
  'tc4.taoWorry': {
    bg: (id) => sky(id, '#1A1E2C', '#232838'),
    fg: (u, g, id) => glow(id, 900, 560, 380, g, 0, 0.5) + faceCU({ id, x: 760, y: 430, s: 1.15, who: 'tao', g, mouth: talk(g, 1.2), brow: 0.8, open: 1.15 }) +
      `<g transform="translate(1160,700) rotate(-12)"><rect x="-80" y="-150" width="160" height="300" rx="22" fill="#1E2028"/><rect x="-68" y="-134" width="136" height="268" rx="12" fill="#CFE6F4"/>${lines(-50, -90, 100, 6, 30, '#7A8AA0', 8)}</g>`,
    cam: [[880, 470, 1350], [880, 460, 1200]],
  },
  // 星期六上午十点，礼堂坐满了人：横幅“60”；胡老师在台上
  'tc4.hall': {
    bg: (id) => hall60Bg(id),
    fg: (u, g, id, v) => `<rect x="410" y="452" width="80" height="80" fill="#6E4C30"/>` + person({ x: 380, y: 535, s: 1.0, who: 'hu', pose: { ...P.point(0.4), head: -4 }, g, face: 1 }) + audience(13, g, { rows: 4, y0: 640 }) + timeTag(250, 110, 'Saturday', v),
    cam: [[800, 460, 1600], [800, 430, 1420]],
  },
  // 第一排（侧面）：Fang 坐着，旁边空着一个位子，上面放着 RESERVED 的牌子
  'tc4.frontRow': {
    bg: (id) => hallSide(id),
    fg: (u, g) => sitter('zhou', 300, 860, 2.0, g, { kind: 'hall' }) + sitter('fang2', 600, 860, 2.0, g, { kind: 'hall', pose: { ...P.sitRest(), head: 6 } }) + reserved(890, 860, 2.0) + sitter('gao', 1140, 860, 2.0, g, { kind: 'hall' }),
    cam: [[720, 560, 1350], [680, 580, 1200]],
  },
  // 后排：Tao 转过头、手挡着嘴小声说话；墙上的钟 10:20
  'tc4.taoWhisper': {
    bg: (id) => hallSide(id),
    fg: (u, g) => clock(1110, 400, 70, 10, 20, g) + sitter('you', 520, 860, 2.15, g, { kind: 'hall', pose: { ...P.sitRest(), head: 8 } }) +
      sitter('tao', 800, 860, 2.15, g, { kind: 'hall', face: -1, pose: { ...P.sitRest(), lean: 16, head: 10, aF: 58, eF: 124 } }) +
      `<path d="M655,560 q-20,-14 -40,-6 M655,580 q-26,-6 -44,6" stroke="${INK}" stroke-width="3" fill="none" opacity="${f(0.4 + 0.4 * Math.abs(wav(g, 0.7)))}"/>`,
    cam: [[780, 560, 1250], [740, 580, 1100]],
  },
  // 你看着前排的 Fang：要不要告诉她？（想的泡泡里是一列火车和一个问号）
  'tc4.youLook': {
    bg: (id) => hallSide(id),
    fg: (u, g) => sitter('fang2', 1080, 760, 1.55, g, { kind: 'hall' }) + sitter('you', 460, 880, 2.25, g, { kind: 'hall', pose: { ...P.sitRest(), head: -6 } }) +
      `<g transform="translate(520,260)" opacity="${f(seg(u, 0.15, 0.4))}"><ellipse rx="190" ry="110" fill="${W}" stroke="${INK}" stroke-width="3"/><circle cx="-60" cy="140" r="16" fill="${W}" stroke="${INK}" stroke-width="3"/><circle cx="-90" cy="180" r="9" fill="${W}" stroke="${INK}" stroke-width="3"/>` +
      `<g transform="translate(${f(-110 + seg(u, 0.3, 0.9) * 120)},10)"><rect x="-60" y="-34" width="120" height="56" rx="12" fill="#3B6EA8"/><rect x="-46" y="-24" width="30" height="22" fill="#CFE2EA"/><rect x="-6" y="-24" width="30" height="22" fill="#CFE2EA"/><circle cx="-36" cy="26" r="10" fill="${INK}"/><circle cx="36" cy="26" r="10" fill="${INK}"/></g><text x="120" y="34" font-size="96" font-weight="900" fill="#A8455A" text-anchor="middle" ${SANS}>?</text></g>`,
    cam: [[760, 500, 1450], [740, 520, 1300]],
  },
  // 十点四十，后门开了：Yu 捧着八音盒走进来，前面坐着的人回过头
  'tc4.door': {
    bg: (id) => hallSide(id) + sideDoor(1),
    fg: (u, g, id, v) => {
      const k = seg(u, 0.05, 0.85), turn = u > 0.3;
      return person({ x: lerp(150, 520, k), y: lerp(640, 860, k), s: lerp(1.3, 2.1, k), who: 'yu2', pose: k < 1 ? P.walk(g * 0.8, 0.7) : hold(), g, face: 1, hold: 'musicbox' }) +
        sitter('stuB', 880, 860, 2.0, g, { kind: 'hall', face: turn ? -1 : 1 }) + sitter('hu', 1140, 860, 2.0, g, { kind: 'hall', face: u > 0.4 ? -1 : 1 }) + timeTag(1380, 110, '10:40', v);
    },
    cam: [[720, 520, 1450], [700, 540, 1350]],
  },
  // Fang 坐在第一排；一回头看见她，马上站了起来，转过身去
  'tc4.standUp': {
    bg: (id) => hallSide(id),
    fg: (u, g) => {
      const look = seg(u, 0.15, 0.3), k = seg(u, 0.35, 0.55), up = k > 0.5;
      return sitter('zhou', 300, 860, 2.0, g, { kind: 'hall', pose: { ...P.sitRest(), head: 10 * seg(u, 0.4, 0.7) } }) + seat('hall', 700, 860, 2.05) +
        person({ x: lerp(700, 650, k), y: 860, s: 2.05, who: 'fang2', pose: { ...rise(k), head: up ? -6 : lerp(0, -14, look) }, g, face: up ? -1 : 1, mood: up ? 'shock' : 'calm', detail: true }) +
        (u > 0.3 ? `<text x="610" y="${f(420 - 20 * seg(u, 0.3, 0.4))}" font-size="90" font-weight="900" fill="#A8455A" opacity="${f(seg(u, 0.3, 0.4) * (1 - seg(u, 0.75, 0.9)))}" ${SANS}>!</text>` : '');
    },
    cam: [[620, 560, 1200], [640, 540, 1050]],
  },
  // 过道上：两个人隔着几步站着，慢慢走近
  'tc4.meet': {
    bg: (id) => hallSide(id) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#F4ECDC" opacity=".2"/>`,
    fg: (u, g) => {
      const k = seg(u, 0.1, 0.9);
      return person({ x: lerp(500, 630, k), y: 860, s: 2.3, who: 'fang2', pose: k > 0 && k < 1 ? P.walk(g * 0.5, 0.4) : P.stand(), g, face: 1, mood: 'shock', detail: true }) +
        person({ x: lerp(1080, 960, k), y: 860, s: 2.22, who: 'yu2', pose: hold(), g, face: -1, hold: 'musicbox', detail: true });
    },
    cam: [[800, 540, 1250], [800, 520, 1100]],
  },
  // Yu（特写）：我等了三十年
  'tc4.yuCU': {
    bg: (id) => cuBg(id),
    fg: (u, g, id) => faceCU({ id, x: 860, y: 430, s: 1.15, who: 'yu2', face: -1, g, mouth: talk(g, 0.7), brow: 0.4, tear: seg(u, 0.5, 0.9) * 0.6, look: -0.1 }),
    cam: [[840, 450, 1300], [840, 440, 1150]],
  },
  // Fang（特写）：轻轻摇头——该说对不起的是我
  'tc4.fangSorry': {
    bg: (id) => cuBg(id),
    fg: (u, g, id) => faceCU({ id, x: 740, y: 430, s: 1.15, who: 'fang2', g, mouth: talk(g, 0.7), brow: 0.6, shake: u < 0.3 ? 0.5 : 0, look: 0.1 }),
    cam: [[760, 450, 1300], [760, 440, 1150]],
  },
  // 你走上前，把小钥匙递给 Fang
  'tc4.giveKey': {
    bg: (id) => hallSide(id),
    fg: (u, g) => {
      const k = seg(u, 0, 0.5), give = seg(u, 0.45, 0.75);
      return person({ x: 1000, y: 860, s: 2.15, who: 'yu2', pose: hold(), g, face: -1, hold: 'musicbox' }) +
        person({ x: 800, y: 860, s: 2.2, who: 'fang2', pose: P.mix(P.stand(), P.give(0.5), give), g, face: -1, mood: 'sad', hold: give > 0.9 ? 'key' : undefined }) +
        person({ x: lerp(260, 560, k), y: 860, s: 2.0, who: 'you', pose: k < 1 ? P.walk(g * 0.8, 0.6) : P.give(0.4 + 0.6 * give), g, face: 1, hold: give < 0.9 ? 'key' : undefined });
    },
    cam: [[700, 540, 1300], [740, 530, 1150]],
  },
  // 特写：钥匙插进八音盒，拧一圈、两圈、三圈
  'tc4.wind': {
    bg: (id) => sky(id, '#4A3428', '#3A2A22') + `<rect x="-200" y="700" width="2000" height="600" fill="#7A5236"/>`,
    fg: (u, g, id) => {
      const t = seg(u, 0.18, 0.95) * 3, n = Math.min(2, Math.floor(t)), lab = ['once', 'twice', 'three times'][n];
      return glow(id, 780, 470, 360, g, 0, 0.2) + musicBox(id, 760, 720, 2.2, { lid: 0, keyIn: seg(u, 0, 0.15), turn: t, g }) + turnArcs(1080, 480, t) +
        (u > 0.18 ? `<text x="800" y="210" font-size="64" font-weight="900" fill="#FFE9A8" text-anchor="middle" opacity="${f(Math.min(1, (t - n) * 4))}" ${SANS}>${lab}</text>` : '');
    },
    cam: [[820, 460, 1400], [840, 470, 1250]],
  },
  // 盖子掀开，小舞者转起来，音符飘出来
  'tc4.dancer': {
    bg: (id) => sky(id, '#3A2E2A', '#2A2220') + `<rect x="-200" y="720" width="2000" height="600" fill="#5A3E2C"/>`,
    fg: (u, g, id) => glow(id, 800, 420, 380, g, 0, 0.3 * seg(u, 0.05, 0.4)) + musicBox(id, 800, 720, 2.2, { lid: seg(u, 0.05, 0.35), keyIn: 1, turn: g * 0.15, spin: u > 0.3 ? (u - 0.3) * 4 + g * 0.35 : 0, notes: seg(u, 0.3, 0.5), g }),
    cam: [[800, 450, 1450], [800, 390, 1450]],
  },
  // 礼堂里先是一片安静，接着大家鼓起掌来
  'tc4.claps': {
    bg: (id) => hallSide(id),
    fg: (u, g) => {
      const k = seg(u, 0.35, 0.5);
      const ppl: [string, number][] = [['stuA', 220], ['hu', 480], ['zhou', 740], ['gao', 1000]];
      return ppl.map(([who, x], i) => sitter(who, x, 860, 2.0, g, { kind: 'hall', pose: k > 0 ? clap(g, k, i * 0.37) : { ...P.sitRest(), head: 6 } })).join('') +
        (k > 0 ? ppl.map(([, x], i) => `<path d="M${x + 130},${f(500 - 10 * Math.abs(wav(g, 0.3, i * 0.2)))} l16,-16 M${x + 146},${f(518 - 10 * Math.abs(wav(g, 0.3, i * 0.2)))} l22,-6" stroke="#8E2A26" stroke-width="5" stroke-linecap="round" opacity="${f(k * 0.7)}"/>`).join('') : '');
    },
    cam: [[680, 560, 1300], [680, 560, 1250]],
  },
  // Tao（特写）：一向爱开玩笑的他，这时一句话也没说
  'tc4.touched': {
    bg: (id) => cuBg(id),
    fg: (u, g, id) => faceCU({ id, x: 760, y: 440, s: 1.15, who: 'tao', g, mouth: 0, brow: 0.5, tear: seg(u, 0.4, 0.8) * 0.5, look: 0.2 }),
    cam: [[780, 450, 1300], [780, 440, 1150]],
  },
  // 胡老师在台上：我们也做一个新的胶囊吧（桌上放着新的盒子）
  'tc4.huStage': {
    bg: (id) => hall60Bg(id),
    fg: (u, g) => person({ x: 470, y: 540, s: 1.55, who: 'hu', pose: P.mix(P.stand(), { ...P.point(1), aF: 120, eF: 10 }, seg(u, 0.2, 0.45)), g, face: 1, detail: true }) +
      longTable(1070, 452, 300, 0.4) + newCapsule(1070, 452, 0.55) + audience(13, g, { rows: 2, y0: 760 }),
    cam: [[800, 420, 1250], [800, 420, 1100]],
  },
  // 银杏树下：一封封信放进新胶囊
  'tc4.newBox': {
    bg: (id) => sky(id, '#C6DCE6', '#F1E6CC') + `<rect x="-200" y="700" width="2000" height="500" fill="#C8BCA6"/>` + ginkgoTree(380, 760, 0.95, { seed: 12 }) + leafCarpet(85, 0, 1100, 712, 880, 70) + `<ellipse cx="820" cy="790" rx="250" ry="48" fill="#6A4E36"/><ellipse cx="820" cy="790" rx="226" ry="38" fill="#3A2A1E"/>`,
    fg: (u, g) => {
      let o = newCapsule(820, 800, 1, 1);
      for (let i = 0; i < 5; i++) { const k = seg(u, 0.1 + i * 0.16, 0.24 + i * 0.16); if (k <= 0 || k >= 1) continue; o += envelope(820 + (i - 2) * 30, lerp(380, 720, k), 0.3, (['pink', 'white', 'blue', 'white', 'white'] as const)[i], { rot: i * 9 - 18, front: true }); }
      return o + person({ x: 1110, y: 860, s: 2.05, who: 'tao', pose: P.give(0.6), g, face: -1, hold: 'letter' }) + person({ x: 1320, y: 860, s: 2.0, who: 'you', pose: P.stand(), g, face: -1, hold: 'letter' }) + ginkgoFall(9, g, { x0: 100, x1: 900, n: 12 });
    },
    cam: [[820, 500, 1550], [840, 520, 1400]],
  },
  // Tao 写信：信纸上画着一辆会飞的汽车
  'tc4.taoLetter': {
    bg: (id) => sky(id, '#E6DCC4', '#DCCDB0') + `<rect x="-200" y="700" width="2000" height="500" fill="#B89A72"/>`,
    fg: (u, g) => sitter('tao', 300, 860, 2.0, g, { kind: 'chair', pose: { ...P.sit(), lean: 18, head: 20, aF: 66 + 4 * Math.sin(g * 12), eF: 30 } }) + longTable(540, 690, 400, 0.77) +
      `<g transform="translate(1080,440) rotate(3)"><rect x="-300" y="-330" width="600" height="660" fill="${W}" stroke="#C9BFA8" stroke-width="3"/>${Array.from({ length: 14 }, (_, i) => `<line x1="-270" y1="${-240 + i * 40}" x2="270" y2="${-240 + i * 40}" stroke="#D6E2EE" stroke-width="2"/>`).join('')}` +
      `<text x="-260" y="-262" font-size="40" fill="${TCC.ink}" ${HAND}>Dear students of 2056,</text>${lines(-260, -190, 500, 5, 40, '#5A6A9A', 4)}` +
      `<g transform="translate(60,170)"><path d="M-120,20 Q-100,-30 -30,-36 L60,-36 Q120,-30 140,20 Z" fill="#E86A5A" stroke="${TCC.ink}" stroke-width="4"/><circle cx="-70" cy="26" r="20" fill="none" stroke="${TCC.ink}" stroke-width="4"/><circle cx="90" cy="26" r="20" fill="none" stroke="${TCC.ink}" stroke-width="4"/><path d="M-150,-10 q-40,-30 -10,-50 M150,-10 q40,-30 10,-50" stroke="${TCC.ink}" stroke-width="4" fill="none"/><path d="M-40,-36 L-20,-70 L40,-70 L60,-36" stroke="${TCC.ink}" stroke-width="4" fill="#CFE2EA"/></g></g>`,
    cam: [[780, 470, 1500], [820, 460, 1400]],
  },
  // 轮到你：信纸、一支笔
  'tc4.write': {
    bg: (id) => sky(id, '#8C6440', '#7A5638'),
    fg: (u, g) => `<g transform="translate(760,450) rotate(-2)"><rect x="-430" y="-400" width="860" height="800" fill="${W}"/>${Array.from({ length: 14 }, (_, i) => `<line x1="-390" y1="${-250 + i * 46}" x2="390" y2="${-250 + i * 46}" stroke="#D6E2EE" stroke-width="2"/>`).join('')}<line x1="-340" y1="-380" x2="-340" y2="380" stroke="#E8B4B4" stroke-width="2"/>` +
      `<text x="-320" y="-290" font-size="46" fill="${TCC.ink}" ${HAND}>Dear students of 2056,</text><text x="-320" y="-200" font-size="44" fill="${TCC.ink}" opacity="${f(0.35 + 0.35 * Math.abs(wav(g, 1.2)))}" ${HAND}>In 2056, …</text>` +
      `<g transform="translate(${f(120 + wav(g, 2) * 10)},-150) rotate(35)"><rect x="-10" y="-150" width="20" height="160" rx="6" fill="#2F5DA8"/><path d="M-10,10 L0,36 L10,10 Z" fill="${INK}"/></g></g>` + newCapsule(1380, 800, 0.6),
    cam: [[800, 450, 1600], [800, 450, 1500]],
  },
  // 下午，银杏树下：Fang 和 Yu 肩并着肩走；淡淡的旧照片里，两个十五岁的女孩也这样走着
  'tc4.walk': {
    bg: (id) => sky(id, '#C6DCE6', '#F1E6CC') + `<rect x="-200" y="700" width="2000" height="500" fill="#C8BCA6"/>` + ginkgoTree(250, 760, 1.0, { seed: 13 }) + ginkgoTree(1450, 760, 0.9, { seed: 14 }) + leafCarpet(86, -100, 1700, 712, 900, 120),
    fg: (u, g, id) => {
      const x = lerp(420, 880, u), ghost = seg(u, 0.2, 0.5) * (1 - seg(u, 0.85, 1));
      return `<g opacity="${f(0.34 * ghost)}">${person({ x: x + 10, y: 820, s: 1.75, who: 'fang', pose: P.walk(g * 0.6, 0.6), g, face: 1 })}${person({ x: x + 170, y: 820, s: 1.65, who: 'yu', pose: P.walk(g * 0.6 + 0.5, 0.6), g, face: 1 })}</g>` +
        person({ x, y: 870, s: 2.3, who: 'fang2', pose: P.walk(g * 0.6, 0.6), g, face: 1 }) + person({ x: x + 170, y: 870, s: 2.22, who: 'yu2', pose: P.walk(g * 0.6 + 0.5, 0.6), g, face: 1, hold: 'musicbox' }) + ginkgoFall(10, g, { x0: 0, x1: 1600, n: 16 }) +
        (ghost > 0.02 ? tint96(id, undefined, { year: false, k: 0.25 * ghost, g }) : '');
    },
    cam: [[720, 500, 1450], [920, 500, 1350]],
  },
  // 第二天的报纸
  'tc4.paper': {
    bg: (id) => sky(id, '#7A6A58', '#5E5244'),
    fg: () => newspaper(),
    cam: [[800, 450, 1600], [820, 450, 1500]],
  },
  // 报纸：第二段引语亮出来
  'tc4.paper2': {
    bg: (id) => sky(id, '#7A6A58', '#5E5244'),
    fg: (u) => {
      const k = seg(u, 0.05, 0.35), hl = seg(u, 0.25, 0.7);
      // 别处压暗（中间挖一个洞，留出第二段引语），黄色记号笔从左往右划过那两行
      return newspaper() + `<path d="M-200,-200 H1800 V1100 H-200 Z M806,592 V684 H1320 V592 Z" fill="#000" fill-rule="evenodd" opacity="${f(0.5 * k)}"/>` +
        `<rect x="812" y="600" width="${f(470 * hl)}" height="32" fill="#F6DC5A" opacity=".45"/><rect x="812" y="642" width="${f(360 * hl)}" height="32" fill="#F6DC5A" opacity=".45"/>`;
    },
    cam: [[800, 450, 1600], [830, 470, 1500]],
  },
  // 线索板：1996 和 2026 的事混在一起，等你排顺序
  'tc4.timeline': {
    bg: (id) => board(id),
    fg: (u, g) => mixedCards(g),
    cam: [[800, 450, 1580], [800, 450, 1570]],
  },
  // 结尾：傍晚的银杏树，树下新埋的胶囊上插着小牌子；叶子落，一个音符飘过
  'tc4.end': {
    bg: (id) => sky(id, '#E9B98A', '#F2D9A8') + `<rect x="-200" y="700" width="2000" height="500" fill="#C9A86E"/>` + ginkgoTree(640, 760, 1.15, { seed: 11 }) + leafCarpet(87, 100, 1500, 712, 900, 110) +
      `<ellipse cx="1080" cy="790" rx="140" ry="28" fill="#8A6A3A"/><g transform="translate(1080,790)"><line x1="0" y1="0" x2="0" y2="-120" stroke="#6A4E36" stroke-width="8"/><rect x="-90" y="-190" width="180" height="80" fill="${W}" stroke="#6A4E36" stroke-width="4"/><text x="0" y="-136" font-size="40" font-weight="900" fill="#A8455A" text-anchor="middle" ${SANS}>2056</text></g>`,
    fg: (u, g, id) => ginkgoFall(11, g, { x0: 200, x1: 1500, n: 18 }) +
      `<text x="${f(lerp(1180, 1380, (g * 0.08) % 1))}" y="${f(lerp(600, 300, (g * 0.08) % 1))}" font-size="64" fill="#A8455A" opacity="${f(Math.sin(((g * 0.08) % 1) * Math.PI) * 0.8)}" ${SERIF}>♪</text>` + glow(id, 1300, 160, 200, g, 0, 0.35),
    cam: [[800, 450, 1600], [820, 480, 1400]],
  },

  // ---------------- 拓展里的小视频 ----------------
  // if：岔路口。买到票 → 上面的路亮起，火车开往礼堂；没买到 → 下面的路亮起，她留在上海
  'tc4.clipIf': {
    bg: (id) => sky(id, '#EEE6D4', '#E4D8C0'),
    fg: (u, g) => {
      const a = seg(u, 0.3, 0.38) * (1 - seg(u, 0.62, 0.66)), b = seg(u, 0.65, 0.72);
      const tx = lerp(700, 1220, seg(u, 0.38, 0.62));
      return `<path d="M420,470 L640,470 Q700,470 740,400 L800,300 L1400,300" stroke="${a > 0.5 ? '#2E7D4A' : '#C9BFA8'}" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M640,470 Q700,470 740,540 L800,640 L1400,640" stroke="${b > 0.5 ? '#A8455A' : '#C9BFA8'}" stroke-width="22" fill="none" stroke-linecap="round"/>` +
        sitter('yu2', 260, 640, 1.5, g, { kind: 'chair', pose: { ...P.sitRest(), aF: 100, eF: 120 }, hold: 'phone' }) +
        `<g transform="translate(560,390)"><rect x="-74" y="-46" width="148" height="86" rx="10" fill="${W}" stroke="${INK}" stroke-width="3"/><text x="0" y="-8" font-size="28" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>TICKET</text><text x="0" y="30" font-size="36" font-weight="900" fill="${a > 0.5 ? '#2E7D4A' : b > 0.5 ? '#A8455A' : '#9A9284'}" text-anchor="middle" ${SANS}>${a > 0.5 ? '✓' : b > 0.5 ? '✗' : '?'}</text></g>` +
        `<g transform="translate(1420,300)" opacity="${f(0.4 + 0.6 * a)}"><rect x="-120" y="-120" width="240" height="120" fill="#A8455A"/><text x="0" y="-36" font-size="70" font-weight="900" fill="#FFE29A" text-anchor="middle" ${SERIF}>60</text>${person({ x: 0, y: 170, s: 0.95, who: 'fang2', pose: P.stand(), g, face: -1 })}</g>` +
        (a > 0 ? `<g transform="translate(${f(tx)},286)" opacity="${f(a)}"><rect x="-80" y="-44" width="160" height="56" rx="14" fill="#3B6EA8"/><rect x="-64" y="-34" width="34" height="22" fill="#CFE2EA"/><rect x="-18" y="-34" width="34" height="22" fill="#CFE2EA"/><rect x="28" y="-34" width="34" height="22" fill="#CFE2EA"/></g>` : '') +
        `<g transform="translate(1420,640)" opacity="${f(0.4 + 0.6 * b)}"><rect x="-120" y="-150" width="240" height="190" fill="#1C2236"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${-100 + (i * 41) % 200}" y="${-120 + (i * 29) % 140}" width="10" height="12" fill="#F2D27A"/>`).join('')}<text x="0" y="90" font-size="32" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>Shanghai</text></g>`;
    },
    cam: [[860, 470, 1500], [860, 470, 1500]],
  },
  // hope / wish：前一半，火车正往这边开（有可能准点）；后一半，你想告诉 Fang，可是现在说不出口（打了叉）
  'tc4.clipHope': {
    bg: (id) => hallSide(id),
    fg: (u, g) => {
      const L = u < 0.5, k = L ? seg(u, 0, 0.5) : seg(u, 0.5, 1);
      if (L) return sitter('tao', 420, 860, 2.0, g, { kind: 'hall', pose: { ...P.sitRest(), head: -10 } }) + clock(1080, 420, 70, 10, 20 + Math.round(k * 8), g) +
        `<line x1="660" y1="600" x2="1240" y2="600" stroke="#6E4C30" stroke-width="8"/><g transform="translate(${f(lerp(1180, 760, k))},580)"><rect x="-90" y="-50" width="180" height="60" rx="16" fill="#3B6EA8"/><rect x="-74" y="-40" width="40" height="24" fill="#CFE2EA"/><rect x="-24" y="-40" width="40" height="24" fill="#CFE2EA"/><rect x="26" y="-40" width="40" height="24" fill="#CFE2EA"/></g>` +
        bubble(560, 300, 420, 120, ['I hope it isn’t late.'], 36, 'l');
      return sitter('fang2', 1060, 760, 1.5, g, { kind: 'hall' }) + sitter('you', 420, 880, 2.2, g, { kind: 'hall', pose: { ...P.sitRest(), head: -8 } }) +
        `<g transform="translate(700,300)">${bubble(0, 0, 440, 120, ['Fang, Yu is coming!'], 34, 'l', 0.92)}<path d="M-170,-64 L170,64 M170,-64 L-170,64" stroke="#C8453A" stroke-width="12" stroke-linecap="round" opacity="${f(seg(k, 0.3, 0.5))}"/></g>`;
    },
    cam: [[760, 500, 1450], [760, 500, 1450]],
  },
  // as soon as：后门一开，Fang 一回头看见她，马上站了起来
  'tc4.clipSoon': {
    bg: (id) => hallSide(id),
    fg: (u, g) => {
      const door = seg(u, 0.12, 0.28), look = seg(u, 0.36, 0.42), k = seg(u, 0.44, 0.56), up = k > 0.5;
      return sideDoor(door) + (door > 0.5 ? person({ x: 160, y: 640, s: 1.3, who: 'yu2', pose: hold(), g, face: 1, hold: 'musicbox' }) : '') +
        seat('hall', 820, 860, 2.05) + person({ x: lerp(820, 770, k), y: 860, s: 2.05, who: 'fang2', pose: { ...rise(k), head: up ? -6 : lerp(0, -14, look) }, g, face: up ? -1 : 1, mood: up ? 'shock' : 'calm', detail: true }) +
        (look > 0 ? `<text x="720" y="430" font-size="90" font-weight="900" fill="#A8455A" opacity="${f(look * (1 - seg(u, 0.8, 0.9)))}" ${SANS}>!</text>` : '');
    },
    cam: [[640, 520, 1350], [640, 520, 1350]],
  },
  // touching / touched：镜头从响着的八音盒（事），移到听着的人（人）
  'tc4.clipTouched': {
    bg: (id) => hallSide(id),
    fg: (u, g, id) => longTable(380, 680, 380, 0.82) + musicBox(id, 380, 680, 1.0, { lid: 1, keyIn: 1, spin: g * 0.35, notes: 1, g }) + glow(id, 380, 520, 240, g, 0, 0.2) +
      sitter('stuB', 820, 860, 1.9, g, { kind: 'hall', pose: { ...P.sitRest(), head: 14 } }) + sitter('zhou', 1060, 860, 1.9, g, { kind: 'hall', pose: { ...P.sitRest(), head: 18 } }) + sitter('tao', 1300, 860, 1.9, g, { kind: 'hall', pose: { ...P.sitRest(), head: 12 } }),
    cam: [[480, 500, 1000], [1060, 540, 1000]],
  },
  // 原话 → 转述：左边 Yu 对记者说话（气泡里是原话），右边第二天的报纸
  'tc4.clipSaid': {
    bg: (id) => sky(id, '#E9DCC2', '#DCCAA8') + `<rect x="-200" y="720" width="2000" height="500" fill="#B78C5C"/>`,
    fg: (u, g) => u < 0.5
      ? person({ x: 520, y: 830, s: 2.0, who: 'yu2', pose: hold(), g, face: 1, hold: 'musicbox' }) + person({ x: 960, y: 830, s: 1.95, who: 'drummer', pose: P.write(g), g, face: -1, hold: 'notebook' }) +
        bubble(640, 250, 640, 160, ['I have kept this box', 'for thirty years.'], 44, 'l')
      : `<rect x="-200" y="-200" width="2000" height="1400" fill="#6E5E4C"/><g transform="translate(800,450) rotate(-2)"><rect x="-430" y="-330" width="860" height="660" fill="#F4F1E8" stroke="#9A9284" stroke-width="3"/><text x="0" y="-246" font-size="56" font-weight="900" fill="${INK}" text-anchor="middle" ${SERIF}>THE CITY NEWS</text><line x1="-390" y1="-214" x2="390" y2="-214" stroke="${INK}" stroke-width="3"/>` +
        `<text x="-380" y="-120" font-size="46" fill="${INK}" ${SERIF}>She told our reporter that</text><text x="-380" y="-56" font-size="46" fill="${INK}" ${SERIF}>she <tspan fill="#B8352A" font-weight="900">had kept</tspan> the box for</text><text x="-380" y="8" font-size="46" fill="${INK}" ${SERIF}>thirty years.</text>${lines(-380, 90, 760, 5, 44, '#B4AC9C', 8)}</g>`,
    cam: [[800, 470, 1400], [800, 470, 1400]],
  },
};
