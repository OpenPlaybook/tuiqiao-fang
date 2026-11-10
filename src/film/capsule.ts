// 英文故事二 The Time Capsule：各章共用的道具、环境、1996 年回忆的旧照片色调，以及两个共用镜头 tc.title、tc.cover。
// 人物外形（tao、hu、gao、zhou、fang、yu、fang2、yu2、worker）写在 rig.ts 的 LOOKS，person({ who: 'tao', … }) 直接用；
// 近景脸 faceCU({ who: 'zhou', … }) 也认这九个名字。person 的 hold 新增：letter、envPink、envBlue、key、musicbox、photo、shovel、teacup、yearbook、tin。
//
// 坐标都是世界坐标（1600×900），s 是缩放。会动的东西要传 g（一直在走的秒数）或进度（0—1，由 u 算出来）。
// 带 id 参数的函数里用到了剪裁或模糊：把镜头 fg / bg 收到的 id 原样传进来。
//
// ---------- 导出一览 ----------
// 字体、颜色：HAND（手写）、SANS、SERIF；TCC（这一套的颜色）
// 1996 年回忆：tint96(id, v?, { year?, k? }) 盖在一镜最上面（暖黄褐、降饱和、四角压暗、一点颗粒，左上角“1996”）；
//             old96(镜头) 把整个 ShotDef 包一下，效果一样
// 银杏：ginkgoTree(x, y, s, { seed, gold, g })  老银杏树（y 是树根落地处）；ginkgoLeaf(x, y, size, rot, color)  一片叶子；
//       ginkgoFall(seed, g, { x0, x1, y0, y1, n, s, wind, a })  落叶（放在 fg）；leafCarpet(seed, x0, x1, y0, y1, n)  地上的落叶
// 挖土：digPit(id, x, y, w, { k, mound, box, g })  地上挖开的坑（box 0—1 露出铁盒）；shovel(x, y, s, ang)  一把铁锹（x、y 是锹尖）
// 铁盒：tinBox(id, x, y, s, { lid, label, inside, lining, glow, dirt, g, kx, ky })  生锈的铁盒（x、y 是盒子正面底边中点）；
//       tinTop(x, y, s, { dirt })  俯拍盒盖（标签看得清）；TIN_LABEL  标签上的三行字
// 信：envelope(x, y, s, 'pink'|'blue'|'white', { rot, open, front, text, peek })  信封（x、y 是中心）；
//     letter(id, x, y, s, { lines, reveal, smudge, wet, paper, rot, w, size, wrap, hl })  信纸（x、y 是左上角）；letterH(o)  信纸多高；
//     FANG_LETTER、YU_LETTER  两封信的草稿
// 钥匙：brassKey(x, y, s, { rot, g, glint, turn })  上弦的小铜钥匙（x、y 是插进去的那一头）
// 八音盒：musicBox(id, x, y, s, { lid, spin, notes, g, keyIn, turn, rot, kx, ky })  （x、y 是正面底边中点）；notes(x, y, s, g, k)  飘出来的音符
// 老照片：classPhoto(id, x, y, s, { fangLook, mark, markK, tone, rot, g })  班级合影（x、y 是左上角，640×430）；photoSpot(x, y, s, who)  照片上某人脸的位置；
//         photoBack(x, y, s, { mark, markK, rot })  照片背面写着名字
//         photoKid(x, y, s, { hair, look, sad, tilt, hold })  照片里正面的小人（年鉴、连线题配图也能用）
// 年鉴：yearbook(x, y, s, { open, pages, rot })  （x、y 是书脊中点）；磁带：cassette(x, y, s, { rot, g, spin, label })
// 搬家的卡车：movingTruck(x, y, s, { g, face, cargo })
// 坐着的人：seat(kind, x, y, s, face)  椅子（chair 木椅 / arm 扶手椅 / sofa 旧沙发 / stool 方凳 / hall 礼堂座椅 / desk96 旧课桌连凳）；
//           sitter(who, x, y, s, g, { kind, pose, face, hold, mood })  人和椅子一起画（y 是地面）
// 环境（都是静的背景，放在 bg；人、会动的东西各章自己加）：
//   campusBg(id, { treeX, treeS, banner })  校园一角；clubRoomBg(id)  英语社活动室 + longTable(x, y, w, s)  长桌；
//   libraryBg(id) + dustMotes(seed, g, beam?)  图书馆和光里的灰尘（LIB_BEAM 那道光；bookshelf(x, y, w, h, seed, dark) 一架书）；zhouHomeBg(id) + teaTable(x, y, s, g, { cups, steam })  周老师家；
//   classroom96Bg(id) + desk96(x, y, s) + ceilingFan(x, y, s, g)  1996 年的教室；hall60Bg(id)  校庆礼堂正面；hall60Side(id)  礼堂侧面（第一排）
// 检查用镜头（也可以直接拿来用）：tc.cast（九个人）、tc.cu.<名字>（每人的近景脸）、tc.faces1、tc.faces2、tc.holds（手里拿东西）、tc.sit（坐着）、
//   tc.props（全部道具）、tc.box（开盒）、tc.lining（掀衬布）、tc.lid（标签特写）、tc.letter（信被水洇）、tc.mbox（八音盒响）、tc.photo、tc.photoBack、tc.yearbook、
//   tc.campus、tc.club、tc.library、tc.home、tc.class96、tc.hall60、tc.hallSide；共用镜头 tc.title、tc.cover
import { GOLD, INK, SKIN, clamp, f, glow, lerp, pin, rng, seg, sky, wav, type View } from './core';
import { P, faceCU, person, type Pose, type PersonOpts } from './rig';
import { HAND, SANS, audience, chairRow } from './shotsE1';
import type { ShotDef } from './Film';

/** 画面基础做好以后改成 true（各章的镜头要用这里的道具） */
export const CAPSULE_READY = true;

export { HAND, SANS };
export const SERIF = `style="font-family:Georgia,'Times New Roman',serif"`;
export const TCC = { gold: '#E8B534', gold2: '#C98A1E', gold3: '#F4D46A', green: '#7E9A46', rust: '#A0552A', tin: '#8A4A2E', pink: '#EFB6C0', blue: '#A6C2E4', white: '#F4F0E6', paper: '#FBF7EC', ink: '#2B3A6E', brass: '#C99A3A', wood: '#7A4A2A', uni96: '#29457E', uni: '#2F5DA8' };

// ---------------- 小工具 ----------------
const mixC = (a: string, b: string, t: number) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const c = [16, 8, 0].map((sh) => Math.round(lerp((A >> sh) & 255, (B >> sh) & 255, clamp(t)))); return `#${((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1)}`; };
const pts = (a: number[][]) => a.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');
type V3 = [number, number, number];
/** 从前上方斜着看一个盒子：q = [横（右为正）, 进深（0 是正面，往后为正）, 高（往上为正）] → 画面坐标 */
const proj = (x: number, y: number, s: number, kx: number, ky: number) => (q: V3) => [x + (q[0] + q[1] * kx) * s, y - (q[2] + q[1] * ky) * s];
/** 把一块平面（原点 o，两个方向 e1、e2）上的局部坐标映射到画面：用在 transform 上 */
const plane = (Pj: (q: V3) => number[], o: V3, e1: V3, e2: V3) => {
  const O = Pj(o), A = Pj([o[0] + e1[0], o[1] + e1[1], o[2] + e1[2]]), B = Pj([o[0] + e2[0], o[1] + e2[1], o[2] + e2[2]]);
  return `matrix(${(A[0] - O[0]).toFixed(4)} ${(A[1] - O[1]).toFixed(4)} ${(B[0] - O[0]).toFixed(4)} ${(B[1] - O[1]).toFixed(4)} ${f(O[0])} ${f(O[1])})`;
};
const wrapText = (t: string, n: number) => { const out: string[] = []; let cur = ''; for (const w of t.split(' ')) { if (cur && (cur + ' ' + w).length > n) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w; } if (cur) out.push(cur); return out; };
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** 锈：一簇簇不规则的小锈斑（多在边角）、细碎的锈点、往下淌的锈痕（局部坐标 0—w、0—h 里）；n 是簇数，k 是大小 */
const rust = (seed: number, w: number, h: number, n: number, k = 1) => {
  const r = rng(seed), C = ['#9A4E26', '#B8692E', '#7E3E1E', '#C8843E'];
  const blob = (cx: number, cy: number, rad: number, c: string, a: number) => { const m = 7; let d = ''; for (let i = 0; i < m; i++) { const t = (i / m) * Math.PI * 2, rr = rad * (0.55 + r() * 0.6); d += `${i ? 'L' : 'M'}${f(cx + Math.cos(t) * rr)},${f(cy + Math.sin(t) * rr * 0.8)} `; } return `<path d="${d}Z" fill="${c}" opacity="${f(a)}"/>`; };
  let o = '';
  for (let i = 0; i < n; i++) {
    const edge = r(), cx = edge < 0.3 ? r() * w : edge < 0.45 ? r() * w * 0.15 : edge < 0.6 ? w - r() * w * 0.15 : r() * w, cy = edge < 0.3 ? h - r() * h * 0.2 : r() * h;
    const m = 3 + Math.floor(r() * 5), sz = (4 + r() * 9) * k;
    for (let j = 0; j < m; j++) o += blob(cx + (r() - 0.5) * sz * 3, cy + (r() - 0.5) * sz * 2, sz * (0.5 + r() * 0.8), C[Math.floor(r() * 4)], 0.45 + r() * 0.4);
    if (r() < 0.35) o += `<path d="M${f(cx)},${f(cy)} q${f(r() * 4 - 2)},${f(8 + r() * 14)} ${f(r() * 4 - 2)},${f(14 + r() * 20)}" stroke="#8A4422" stroke-width="${f(1.5 + r() * 2)}" opacity=".4" fill="none" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < n * 4; i++) o += `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f((0.6 + r() * 1.6) * k)}" fill="${C[Math.floor(r() * 4)]}" opacity="${f(0.4 + r() * 0.4)}"/>`;
  return o;
};

// ---------------- 1996 年回忆的色调 ----------------
/** 盖在一镜最上面：暖黄褐、降饱和（color 混合，不用滤镜）、四角压暗、一点颗粒（小图案平铺），左上角钉一个“1996”。
 *  v 是取景框（fg 的第四个参数），给了才钉年份；year: false 不要年份，或者给别的字（比如 'June 1996'）；k 0—1 是浓淡（淡入回忆时可以从 0 走到 1） */
export const tint96 = (id: string, v?: View, o: { year?: string | false; k?: number; g?: number } = {}) => {
  const k = o.k ?? 1, g = o.g ?? 0, r = rng(96);
  if (k <= 0.01) return '';
  let dots = '';
  for (let i = 0; i < 46; i++) dots += `<circle cx="${f(r() * 97)}" cy="${f(r() * 89)}" r="${f(0.5 + r() * 1.1)}" fill="${r() < 0.6 ? '#3A2A1A' : '#FFF4DC'}" opacity="${f(0.25 + r() * 0.35)}"/>`;
  const jx = Math.floor(g * 8) % 7 * 13, jy = Math.floor(g * 8) % 5 * 17; // 颗粒一跳一跳的，像老胶片
  let s = `<defs><pattern id="${id}g96" width="97" height="89" patternUnits="userSpaceOnUse" patternTransform="translate(${jx},${jy})">${dots}</pattern>` +
    `<radialGradient id="${id}v96" cx="50%" cy="50%" r="72%"><stop offset="55%" stop-color="#3A2614" stop-opacity="0"/><stop offset="100%" stop-color="#2A1A0C" stop-opacity=".62"/></radialGradient></defs>`;
  s += `<g pointer-events="none" opacity="${f(k)}"><rect x="-400" y="-400" width="2400" height="1700" fill="#A88A5C" opacity=".62" style="mix-blend-mode:color"/>` +
    `<rect x="-400" y="-400" width="2400" height="1700" fill="#E2C48C" opacity=".3" style="mix-blend-mode:multiply"/>` +
    `<rect x="-400" y="-400" width="2400" height="1700" fill="url(#${id}g96)" opacity=".55"/>` +
    `<rect x="-400" y="-400" width="2400" height="1700" fill="url(#${id}v96)"/></g>`;
  if (o.year !== false && v) { const t = o.year ?? '1996', w = 36 + t.length * 24; s += pin(v, 0.035, 0.1, `<g opacity="${f(k)}"><rect x="0" y="-46" width="${w}" height="64" rx="8" fill="#2A1E14" opacity=".72"/><text x="${f(w / 2)}" y="2" font-size="42" font-weight="700" fill="#F2DDB0" text-anchor="middle" letter-spacing="2" ${SERIF}>${esc(t)}</text></g>`); }
  return s;
};
/** 把一个镜头整个调成 1996 年的回忆色调（year 同 tint96） */
export const old96 = (d: ShotDef, year?: string | false): ShotDef => ({ ...d, fg: (u, g, id, v) => d.fg(u, g, id, v) + tint96(id, v, { year, g }) });

// ---------------- 银杏 ----------------
/** 一片银杏叶（扇形，叶柄朝下）：size 是叶子的高 */
export const ginkgoLeaf = (x: number, y: number, size = 20, rot = 0, c: string = TCC.gold) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(size / 20)})"><path d="M0,3 C-10,0 -14,-10 -12,-15 Q-6,-19 -1,-15 L0,-12 L1,-15 Q6,-19 12,-15 C14,-10 10,0 0,3 Z" fill="${c}" stroke="${mixC(c, '#5A3A10', 0.45)}" stroke-width=".9"/><path d="M0,3 L0,9" stroke="${mixC(c, '#5A3A10', 0.5)}" stroke-width="1.4"/></g>`;
/** 老银杏树：粗壮、树皮有竖纹，一大团金黄的树冠。x、y 是树根落地处；整树高约 720×s，宽约 700×s。
 *  gold 0—1（0 是六月的绿，1 是秋天的金黄）；给 g 的话树冠轻轻晃（放在 fg 才会动） */
export const ginkgoTree = (x: number, y: number, s = 1, o: { seed?: number; gold?: number; g?: number; a?: number } = {}) => {
  const r = rng(o.seed ?? 11), gold = o.gold ?? 1, g = o.g ?? 0;
  const C = (t: number) => mixC(mixC('#5E7A34', '#C98A1E', gold), mixC('#A8C060', '#F6D868', gold), t);
  const trunk = '#5E5044', bark = '#3E342C';
  let out = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})" opacity="${o.a ?? 1}">`;
  out += `<ellipse cx="0" cy="4" rx="190" ry="26" fill="#000" opacity=".16"/>`;
  // 树干：根部张开
  out += `<path d="M-92,6 Q-70,-6 -58,-40 Q-48,-150 -50,-300 L-34,-330 L34,-330 Q52,-180 54,-60 Q66,-8 96,6 Z" fill="${trunk}" stroke="${INK}" stroke-opacity=".5" stroke-width="2.5"/>`;
  for (let i = 0; i < 9; i++) { const bx = -40 + i * 10 + r() * 4; out += `<path d="M${f(bx)},-6 Q${f(bx + (r() - 0.5) * 16)},-150 ${f(bx * 0.7 + (r() - 0.5) * 10)},-320" stroke="${bark}" stroke-width="${f(2 + r() * 2.5)}" fill="none" opacity=".55"/>`; }
  out += `<path d="M-30,-120 q10,-12 20,0 q-10,10 -20,0 z" fill="${bark}" opacity=".6"/>`; // 树疤
  // 大枝
  const sway = wav(g, 6) * 1.2;
  out += `<g transform="rotate(${f(sway)} 0 -320)">`;
  const branches: [number, number, number, number, number][] = [[-30, -320, -250, -560, 26], [-10, -330, -110, -660, 22], [12, -330, 90, -680, 22], [30, -320, 240, -580, 26], [-40, -300, -330, -470, 16], [40, -300, 330, -470, 16]];
  branches.forEach(([x0, y0, x1, y1, w]) => { out += `<path d="M${x0},${y0} Q${f((x0 + x1) / 2 + (r() - 0.5) * 60)},${f((y0 + y1) / 2 + 30)} ${x1},${y1}" stroke="${trunk}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`; });
  // 树冠：先暗后亮，一团团
  const blobs = (n: number, t0: number, t1: number, rr: number, dy: number) => { let b = ''; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()), bx = Math.cos(a) * d * 300, by = -540 + Math.sin(a) * d * 190 + dy, rad = rr * (0.7 + r() * 0.5); b += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(rad)}" fill="${C(lerp(t0, t1, r()))}"/>`; } return b; };
  out += blobs(26, 0, 0.25, 96, 30) + blobs(30, 0.3, 0.6, 72, 0) + blobs(26, 0.62, 0.95, 44, -40);
  // 树冠下沿透出的枝（先画一小块空隙，再画枝）
  for (let i = 0; i < 4; i++) { const bx = (i - 1.5) * 120 + (r() - 0.5) * 30, by = -400 - r() * 30; out += `<ellipse cx="${f(bx)}" cy="${f(by)}" rx="${f(26 + r() * 16)}" ry="${f(14 + r() * 8)}" fill="${C(0)}" opacity=".85"/><path d="M${f(bx - 20)},${f(by + 14)} q${f(14)},${f(-16)} ${f(30 + r() * 10)},${f(-26)}" stroke="${trunk}" stroke-width="${f(4 + r() * 3)}" stroke-linecap="round" fill="none"/>`; }
  // 树冠里的一片片叶子（纹理）
  for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.92, bx = Math.cos(a) * d * 300, by = -540 + Math.sin(a) * d * 190; out += ginkgoLeaf(bx, by, 12 + r() * 8, r() * 360, C(0.15 + r() * 0.85)); }
  // 树冠边上的一片片叶子
  for (let i = 0; i < 90; i++) { const a = r() * Math.PI * 2, bx = Math.cos(a) * (280 + r() * 60), by = -540 + Math.sin(a) * (170 + r() * 50); if (by > -300) continue; out += ginkgoLeaf(bx, by, 16 + r() * 10, r() * 360, C(0.3 + r() * 0.7)); }
  for (let i = 0; i < 40; i++) { const bx = (r() - 0.5) * 520, by = -460 - r() * 240; out += ginkgoLeaf(bx, by, 14 + r() * 8, r() * 360, C(0.6 + r() * 0.4)); }
  out += `</g></g>`;
  return out;
};
/** 落叶（放在 fg）：x0—x1、y0—y1 是飘的范围；n 片；s 叶子大小（倍）；wind 往右飘多远（负数往左）；a 透明度 */
export const ginkgoFall = (seed: number, g: number, o: { x0?: number; x1?: number; y0?: number; y1?: number; n?: number; s?: number; wind?: number; a?: number } = {}) => {
  const r = rng(seed), x0 = o.x0 ?? 0, x1 = o.x1 ?? 1600, y0 = o.y0 ?? -40, y1 = o.y1 ?? 900, sz = 22 * (o.s ?? 1), wind = o.wind ?? 120;
  let out = '';
  for (let i = 0; i < (o.n ?? 16); i++) {
    const bx = x0 + r() * (x1 - x0), T = 7 + r() * 6, ph = r(), k = (g / T + ph) % 1, yy = lerp(y0, y1, k), xx = bx + wind * k + Math.sin(g * (0.9 + r() * 0.6) + ph * 6) * 34;
    const flip = Math.cos(g * (1.6 + r()) + ph * 6), c = mixC(TCC.gold2, TCC.gold3, r()), fade = Math.min(1, k * 8, (1 - k) * 8);
    out += `<g transform="translate(${f(xx)},${f(yy)}) rotate(${f(g * (40 + r() * 60) * (r() < 0.5 ? -1 : 1) + ph * 360)}) scale(${f(Math.max(0.15, Math.abs(flip)) * Math.sign(flip || 1))},1)" opacity="${f((o.a ?? 0.95) * fade)}">${ginkgoLeaf(0, 0, sz * (0.8 + r() * 0.4), 0, c)}</g>`;
  }
  return out;
};
/** 地上铺的落叶（静的）：在 x0—x1、y0—y1 这块地上撒 n 片 */
export const leafCarpet = (seed: number, x0: number, x1: number, y0: number, y1: number, n = 60) => { const r = rng(seed); let o = ''; for (let i = 0; i < n; i++) { const yy = lerp(y0, y1, r()), k = (yy - y0) / Math.max(1, y1 - y0); o += `<g transform="translate(${f(lerp(x0, x1, r()))},${f(yy)}) scale(1,.55)">${ginkgoLeaf(0, 0, 14 + k * 12, r() * 360, mixC(TCC.gold2, TCC.gold3, r()))}</g>`; } return o; };

// ---------------- 挖土 ----------------
/** 一把铁锹：x、y 是锹尖，ang 是锹杆偏离竖直的角度（正数往右倒），整把高约 330×s */
export const shovel = (x: number, y: number, s = 1, ang = 12) => `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)}) scale(${f(s)})"><path d="M0,-70 L0,-300" stroke="#8A6A44" stroke-width="10" stroke-linecap="round"/><path d="M-16,-300 L16,-300 M-16,-300 Q0,-332 16,-300" stroke="#5A4630" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-26,-74 L26,-74 L24,-24 Q14,4 0,8 Q-14,4 -24,-24 Z" fill="#8E9498" stroke="${INK}" stroke-width="2.5"/><path d="M-10,-74 L-10,-92 L10,-92 L10,-74" fill="#7A8084" stroke="${INK}" stroke-width="2"/><path d="M-22,-20 Q0,-6 22,-20 L20,-10 Q0,4 -20,-10 Z" fill="#6A4E32" opacity=".85"/></g>`;
/** 地上挖开的坑：x、y 是坑的中心（地面上），w 是坑的宽；k 0—1 挖了多大；mound 旁边堆的土；
 *  box 0—1：坑里的铁盒露出来多少（0 埋着看不见，1 盒盖整个露出来） */
export const digPit = (id: string, x: number, y: number, w = 320, o: { k?: number; mound?: boolean; box?: number; g?: number } = {}) => {
  const k = clamp(o.k ?? 1), rx = (w / 2) * (0.25 + 0.75 * k), ry = rx * 0.32, r = rng(Math.round(x) + 7);
  let out = '';
  if (o.mound ?? true) { const mx = x + rx + 90 * (0.4 + 0.6 * k), mh = 30 + 70 * k; out += `<path d="M${f(mx - 120)},${f(y + 20)} Q${f(mx - 70)},${f(y - mh)} ${f(mx)},${f(y - mh * 1.05)} Q${f(mx + 80)},${f(y - mh * 0.8)} ${f(mx + 130)},${f(y + 24)} Z" fill="#7E5C3A" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/><path d="M${f(mx - 60)},${f(y - mh * 0.6)} q30,-14 70,-6" stroke="#9A7A52" stroke-width="5" fill="none" opacity=".6"/>`; for (let i = 0; i < 12; i++) out += `<ellipse cx="${f(mx - 100 + r() * 220)}" cy="${f(y + 10 - r() * mh * 0.7)}" rx="${f(5 + r() * 9)}" ry="${f(4 + r() * 5)}" fill="${r() < 0.5 ? '#6A4A2E' : '#8E6C46'}"/>`; }
  out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx + 22)}" ry="${f(ry + 10)}" fill="#8A6844"/>`;
  out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="#3A2A1E"/><path d="M${f(x - rx)},${f(y)} A${f(rx)},${f(ry)} 0 0 1 ${f(x + rx)},${f(y)} L${f(x + rx * 0.86)},${f(y + ry * 0.3)} A${f(rx * 0.86)},${f(ry * 0.7)} 0 0 0 ${f(x - rx * 0.86)},${f(y + ry * 0.3)} Z" fill="#5A4030"/>`;
  const b = clamp(o.box ?? 0);
  if (b > 0) {
    const cid = `${id}pit${Math.round(x)}_`;
    out += `<clipPath id="${cid}"><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx * 0.92)}" ry="${f(ry * 0.92)}"/></clipPath><g clip-path="url(#${cid})">${tinBox(id, x - 30 * (rx / 160), y + ry * 0.9 + (1 - b) * 120, (rx / 160) * 0.62, { dirt: 1, g: o.g, ky: 0.55 })}</g>`;
    out += `<path d="M${f(x - rx)},${f(y)} A${f(rx)},${f(ry)} 0 0 0 ${f(x + rx)},${f(y)}" stroke="#8A6844" stroke-width="10" fill="none"/>`;
  }
  for (let i = 0; i < 10; i++) { const a = r() * Math.PI * 2; out += `<ellipse cx="${f(x + Math.cos(a) * (rx + 26))}" cy="${f(y + Math.sin(a) * (ry + 12))}" rx="${f(5 + r() * 7)}" ry="${f(3 + r() * 4)}" fill="#6A4A2E"/>`; }
  return out;
};

// ---------------- 生锈的铁盒 ----------------
/** 盒盖上的标签（三行） */
export const TIN_LABEL = ['Class 3, Grade 9', 'Buried on June 28, 1996', 'Open in 2026'];
export interface TinOpts {
  /** 盖子开合 0—1（1 是开到往后仰） */ lid?: number;
  /** 盖子上贴不贴标签（默认贴） */ label?: boolean;
  /** 打开后里面有什么：full 四十封信 + 合影 + 磁带 + 钥匙在粉信封上（默认）；letters 只有信；empty 只剩衬布 */ inside?: 'full' | 'letters' | 'empty';
  /** 盒底的衬布掀起来多少 0—1：下面露出蓝信封（配 inside: 'empty'、ky: 0.9 左右，从上往下看才看得到盒底） */ lining?: number;
  /** 盒子里透出的光 0—1 */ glow?: number;
  /** 身上沾的土 0—1 */ dirt?: number;
  g?: number;
  /** 视角：kx 往后的斜度，ky 往后缩多少（越大越像从上往下看，默认 0.45） */ kx?: number; ky?: number;
}
/** 生锈的铁盒（宽 300、深 180、高 120，乘 s）：x、y 是盒子正面底边的中点。 */
export const tinBox = (id: string, x: number, y: number, s = 1, o: TinOpts = {}) => {
  const W = 300, D = 180, H = 120, kx = o.kx ?? 0.32, ky = o.ky ?? 0.45, Pj = proj(x, y, s, kx, ky), g = o.g ?? 0;
  const th = (clamp(o.lid ?? 0) * 112 * Math.PI) / 180, key = `${id}tin${Math.round(x)}_${Math.round(y)}_`;
  const paint = '#8A4A2E', paint2 = '#6E3A24', paint3 = '#9A5A36'; // 红褐色、生锈的铁皮（第 1 章写的是 red-brown and rusty）
  let out = `<ellipse cx="${f(x + (D * kx * s) / 2)}" cy="${f(y + 4 * s)}" rx="${f((W / 2 + 40) * s)}" ry="${f(24 * s)}" fill="#000" opacity=".22"/>`;
  // 盖子：铰链在后上沿；盖子前沿离铰链 D+4
  const hz = D + 2, hy = H + 2, Ld = D + 4, lip = 18;
  const lidPt = (px: number, d: number, n = 0): number[] => Pj([px, hz - d * Math.cos(th) - n * Math.sin(th), hy + d * Math.sin(th) - n * Math.cos(th)]);
  const hL = lidPt(-W / 2 - 3, 0), hR = lidPt(W / 2 + 3, 0), fL = lidPt(-W / 2 - 3, Ld), fR = lidPt(W / 2 + 3, Ld);
  const topVisible = th < Math.atan(ky); // 盖子转过侧对着我们的角度以后，看到的是盖子里面
  const drawLid = () => {
    let l = '';
    const lipF = [fL, fR, lidPt(W / 2 + 3, Ld, lip), lidPt(-W / 2 - 3, Ld, lip)], lipR = [hR, fR, lidPt(W / 2 + 3, Ld, lip), lidPt(W / 2 + 3, 0, lip)];
    if (topVisible) {
      l += `<polygon points="${pts(lipR)}" fill="${paint2}" stroke="${INK}" stroke-opacity=".6" stroke-width="2"/>`;
      l += `<polygon points="${pts([hL, hR, fR, fL])}" fill="${paint3}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.4"/>`;
      // 盖子面上：锈、压出来的一圈边、标签
      const T = plane(Pj, [-W / 2 - 3, hz - Ld * Math.cos(th), hy + Ld * Math.sin(th)], [1, 0, 0], [0, Math.cos(th), -Math.sin(th)]); // 局部 (a, b)：a 往右，b 从前沿往后
      l += `<g transform="${T}"><clipPath id="${key}lt"><rect x="0" y="0" width="${W + 6}" height="${Ld}"/></clipPath><g clip-path="url(#${key}lt)">${rust(31, W + 6, Ld, 26, 1.1)}</g><rect x="16" y="14" width="${W - 26}" height="${Ld - 28}" rx="10" fill="none" stroke="${paint2}" stroke-width="5" opacity=".8"/>`;
      if (o.label ?? true) {
        // 标签在盖子正中，字从后往前读（画面上是从上往下）
        l += `<g transform="translate(${(W + 6) / 2},${Ld / 2}) scale(1,-1)"><rect x="-118" y="-58" width="236" height="116" fill="#E6D8B8" stroke="#9A8A6A" stroke-width="1.5"/><rect x="-118" y="-58" width="236" height="116" fill="#8A6A3A" opacity=".1"/><path d="M-100,-58 l22,0 l-4,10 l-22,0 z M78,-58 l22,0 l-2,10 l-22,0 z" fill="#E9E0C8" opacity=".85"/>` +
          TIN_LABEL.map((t, i) => `<text x="0" y="${-22 + i * 32}" font-size="${i === 0 ? 24 : 21}" font-weight="700" fill="#2B2A4E" text-anchor="middle" ${HAND}>${esc(t)}</text>`).join('') + `</g>`;
      }
      l += `</g>`;
      l += `<polygon points="${pts(lipF)}" fill="${paint}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.4"/>`;
      const T2 = plane(Pj, [-W / 2 - 3, hz - Ld * Math.cos(th), hy + Ld * Math.sin(th)], [1, 0, 0], [0, -Math.sin(th), -Math.cos(th)]);
      l += `<g transform="${T2}"><clipPath id="${key}lf"><rect x="0" y="0" width="${W + 6}" height="${lip}"/></clipPath><g clip-path="url(#${key}lf)">${rust(32, W + 6, lip, 8, 0.5)}</g></g>`;
    } else {
      // 盖子里面（光秃秃的铁皮，锈得更厉害）
      l += `<polygon points="${pts([hL, hR, fR, fL])}" fill="#8A8478" stroke="${INK}" stroke-opacity=".6" stroke-width="2.4"/>`;
      const T = plane(Pj, [-W / 2 - 3, hz, hy], [1, 0, 0], [0, -Math.cos(th), Math.sin(th)]);
      l += `<g transform="${T}"><clipPath id="${key}li"><rect x="0" y="0" width="${W + 6}" height="${Ld}"/></clipPath><g clip-path="url(#${key}li)">${rust(33, W + 6, Ld, 30, 1.2)}</g></g>`;
      l += `<polygon points="${pts(lipF)}" fill="${paint2}" stroke="${INK}" stroke-opacity=".6" stroke-width="2"/>`;
    }
    return l;
  };
  if (!topVisible) out += drawLid();
  // 右侧面、正面
  const side = [Pj([W / 2, 0, 0]), Pj([W / 2, D, 0]), Pj([W / 2, D, H]), Pj([W / 2, 0, H])], front = [Pj([-W / 2, 0, 0]), Pj([W / 2, 0, 0]), Pj([W / 2, 0, H]), Pj([-W / 2, 0, H])];
  out += `<polygon points="${pts(side)}" fill="${paint2}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.4"/>`;
  out += `<g transform="${plane(Pj, [W / 2, 0, H], [0, 1, 0], [0, 0, -1])}"><clipPath id="${key}s"><rect width="${D}" height="${H}"/></clipPath><g clip-path="url(#${key}s)">${rust(34, D, H, 12, 0.8)}</g></g>`;
  out += `<polygon points="${pts(front)}" fill="${paint}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.4"/>`;
  out += `<g transform="${plane(Pj, [-W / 2, 0, H], [1, 0, 0], [0, 0, -1])}"><clipPath id="${key}f"><rect width="${W}" height="${H}"/></clipPath><g clip-path="url(#${key}f)">${rust(35, W, H, 22, 1)}<rect x="10" y="${H - 34}" width="${W - 20}" height="5" fill="${paint3}" opacity=".7"/><rect x="${W / 2 - 22}" y="14" width="44" height="22" rx="4" fill="#7A6A58" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><circle cx="${W / 2}" cy="25" r="4" fill="#3A2E24"/></g>`;
  if ((o.dirt ?? 0) > 0) { const r = rng(36); for (let i = 0; i < 20; i++) out += `<ellipse cx="${f(r() * W)}" cy="${f(H - r() * 50)}" rx="${f(6 + r() * 18)}" ry="${f(4 + r() * 8)}" fill="#6A4A2E" opacity="${f((o.dirt ?? 0) * (0.5 + r() * 0.4))}"/>`; }
  out += `</g>`;
  // 打开了：里面
  if (th > 0.05) {
    const t = 7, hole = [Pj([-W / 2 + t, t, H]), Pj([W / 2 - t, t, H]), Pj([W / 2 - t, D - t, H]), Pj([-W / 2 + t, D - t, H])];
    out += `<clipPath id="${key}h"><polygon points="${pts(hole)}"/></clipPath><polygon points="${pts(hole)}" fill="#241C16"/><g clip-path="url(#${key}h)">`;
    // 里面的后壁、左壁（亮一点）
    out += `<polygon points="${pts([Pj([-W / 2 + t, D - t, H]), Pj([W / 2 - t, D - t, H]), Pj([W / 2 - t, D - t, 0]), Pj([-W / 2 + t, D - t, 0])])}" fill="#6E6A60"/><polygon points="${pts([Pj([-W / 2 + t, t, H]), Pj([-W / 2 + t, D - t, H]), Pj([-W / 2 + t, D - t, 0]), Pj([-W / 2 + t, t, 0])])}" fill="#5A564E"/>`;
    const ins = o.inside ?? 'full', fl = ins === 'empty' ? 16 : H - 30; // 信堆得快到盒口了；空了才看得到盒底（要从上往下看：ky 大一些）
    const B = plane(Pj, [-W / 2 + t, D - t, fl], [1, 0, 0], [0, -1, 0]); // 局部 (a, b)：a 往右，b 从后往前
    const iw = W - 2 * t, id2 = D - 2 * t;
    let c = `<rect width="${iw}" height="${id2}" fill="#6E2A2E"/><path d="M0,${id2 * 0.3} h${iw} M0,${id2 * 0.62} h${iw}" stroke="#5A2024" stroke-width="3" opacity=".6"/>`; // 暗红绒布衬底
    const lin = clamp(o.lining ?? 0);
    if (lin > 0) { // 右后角的衬布掀起来（折过去），下面露出蓝信封的一角
      const Lq = lin * 170, A = [iw - Lq, 0], Bq = [iw, 0], Cq = [iw, Lq * 0.8], dx = Cq[0] - A[0], dy = Cq[1] - A[1], tq = ((Bq[0] - A[0]) * dx + (Bq[1] - A[1]) * dy) / (dx * dx + dy * dy), F = [2 * (A[0] + tq * dx) - Bq[0], 2 * (A[1] + tq * dy) - Bq[1]];
      c += `<clipPath id="${key}ln"><polygon points="${pts([A, Bq, Cq])}"/></clipPath><polygon points="${pts([A, Bq, Cq])}" fill="#2A201A"/><g clip-path="url(#${key}ln)"><g transform="translate(${f(iw - 120)},10) rotate(-6)"><rect width="150" height="96" fill="${TCC.blue}" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><path d="M0,0 L75,48 L150,0" stroke="${INK}" stroke-opacity=".4" stroke-width="2" fill="none"/></g></g>`;
      c += `<polygon points="${pts([A, Cq, F])}" fill="#9A4A4E" stroke="#4A1A1E" stroke-width="2"/><path d="M${pts([A])} L${pts([Cq])}" stroke="#5A2024" stroke-width="3"/>`;
    }
    if (ins !== 'empty') {
      const r = rng(37);
      for (let i = 0; i < 14; i++) c += `<rect x="${f(14 + r() * 40)}" y="${f(12 + i * 2.2)}" width="150" height="96" fill="${i % 5 === 3 ? '#EDE6D4' : TCC.white}" stroke="#9A9284" stroke-width="1.4" transform="rotate(${f((r() - 0.5) * 8)} 90 60)"/>`; // 一摞信
      c += `<g transform="translate(36,34) rotate(-6)"><rect width="150" height="96" fill="${TCC.pink}" stroke="#A86A76" stroke-width="2"/><path d="M0,0 L75,48 L150,0" stroke="#A86A76" stroke-width="2" fill="none"/></g>`; // 粉信封在最上面
      if (ins === 'full') {
        c += `<g transform="translate(176,22) rotate(4)"><rect width="110" height="78" fill="#F4EFE2" stroke="#8A8274" stroke-width="2"/><rect x="7" y="7" width="96" height="58" fill="#A99B82"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="${18 + i * 15}" cy="40" r="5" fill="#5E5446"/>`).join('')}</g>`; // 合影
        c += `<g transform="translate(196,108) rotate(-10)"><rect width="78" height="48" rx="4" fill="#2A2A30" stroke="#111" stroke-width="2"/><rect x="8" y="6" width="62" height="18" fill="#E8DFC6"/><circle cx="24" cy="34" r="7" fill="#ddd"/><circle cx="54" cy="34" r="7" fill="#ddd"/></g>`; // 磁带
        c += `<g transform="translate(110,86) rotate(-30) scale(.42)">${brassKey(0, 0, 1, { g, glint: 1 })}</g>`; // 钥匙
      }
    }
    out += `<g transform="${B}">${c}</g>`;
    if ((o.glow ?? 0) > 0) { const m = Pj([0, D / 2, H]); out += glow(id, m[0], m[1], 170 * s, g, 0, o.glow); }
    out += `</g>`;
    // 盒口的一圈边
    out += `<polygon points="${pts([Pj([-W / 2, 0, H]), Pj([W / 2, 0, H]), Pj([W / 2, D, H]), Pj([-W / 2, D, H])])}" fill="none" stroke="${paint3}" stroke-width="${f(7 * s)}"/><polygon points="${pts(hole)}" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>`;
  }
  if (topVisible) out += drawLid();
  else if ((o.glow ?? 0) > 0) { const m = Pj([0, D / 2, H + 40]); out += glow(id, m[0], m[1], 110 * s, g, 0.3, (o.glow ?? 0) * 0.6); }
  return out;
};
/** 从正上方拍盒盖：标签看得清。x、y 是盖子中心；盖子 640×400（乘 s） */
export const tinTop = (x: number, y: number, s = 1, o: { dirt?: number; rot?: number } = {}) => {
  const W = 640, H = 400, r = rng(41);
  let out = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})"><rect x="${-W / 2 + 10}" y="${-H / 2 + 14}" width="${W}" height="${H}" rx="22" fill="#000" opacity=".3"/>`;
  out += `<rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="22" fill="#9A5A36" stroke="${INK}" stroke-width="4"/><clipPath id="tintop${Math.round(x)}"><rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="22"/></clipPath><g clip-path="url(#tintop${Math.round(x)})" transform="translate(${-W / 2},${-H / 2})">${rust(42, W, H, 60, 2)}</g>`;
  out += `<rect x="${-W / 2 + 26}" y="${-H / 2 + 26}" width="${W - 52}" height="${H - 52}" rx="16" fill="none" stroke="#6E3A24" stroke-width="8" opacity=".8"/>`;
  out += `<g transform="rotate(-1.5)"><rect x="-236" y="-118" width="472" height="236" fill="#E6D8B8" stroke="#9A8A6A" stroke-width="2"/><rect x="-236" y="-118" width="472" height="236" fill="#8A6A3A" opacity=".1"/><path d="M-210,-128 l60,0 l-6,22 l-60,0 z M150,-128 l60,0 l-4,22 l-60,0 z" fill="#EFE7D2" opacity=".9"/>`;
  out += TIN_LABEL.map((t, i) => `<text x="0" y="${-40 + i * 66}" font-size="${i === 0 ? 50 : 44}" font-weight="700" fill="#2B2A4E" text-anchor="middle" ${HAND}>${esc(t)}</text>`).join('') + `</g>`;
  if ((o.dirt ?? 0) > 0) for (let i = 0; i < 26; i++) out += `<ellipse cx="${f((r() - 0.5) * W * 0.95)}" cy="${f((r() - 0.5) * H * 0.95)}" rx="${f(8 + r() * 26)}" ry="${f(5 + r() * 12)}" fill="#6A4A2E" opacity="${f((o.dirt ?? 0) * (0.4 + r() * 0.4))}"/>`;
  return out + `</g>`;
};

// ---------------- 信封、信纸 ----------------
/** 信封（300×190，乘 s）：x、y 是中心。默认看背面（封口那一面）；open 0—1 封口掀起来；peek 0—1 信纸抽出来多少；
 *  front: true 看正面，text 是正面写的字（手写）；rot 斜放的角度 */
export const envelope = (x: number, y: number, s = 1, color: 'pink' | 'blue' | 'white' = 'white', o: { rot?: number; open?: number; front?: boolean; text?: string; peek?: number } = {}) => {
  const c = color === 'pink' ? TCC.pink : color === 'blue' ? TCC.blue : TCC.white, c2 = mixC(c, '#5A4A3A', 0.18), c3 = mixC(c, '#FFFFFF', 0.3), W = 300, H = 190;
  let out = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})"><rect x="${-W / 2 + 6}" y="${-H / 2 + 8}" width="${W}" height="${H}" fill="#000" opacity=".2"/>`;
  if (o.front) {
    out += `<rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" fill="${c}" stroke="${INK}" stroke-opacity=".55" stroke-width="2.5"/>`;
    if (o.text) out += wrapText(o.text, 18).map((t, i) => `<text x="-110" y="${-20 + i * 38}" font-size="30" fill="${TCC.ink}" ${HAND}>${esc(t)}</text>`).join('');
    return out + `</g>`;
  }
  const op = clamp(o.open ?? 0), pk = clamp(o.peek ?? 0);
  // 封口掀开时，后面先画掀起来的那片（朝上），再画信纸，再画信封身子
  if (op > 0.5) out += `<path d="M${-W / 2},${-H / 2} L0,${f(-H / 2 - (op - 0.5) * 2 * 110)} L${W / 2},${-H / 2} Z" fill="${c3}" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>`;
  if (pk > 0) out += `<g transform="translate(0,${f(-pk * 120)})"><rect x="${-W / 2 + 18}" y="${-H / 2 + 6}" width="${W - 36}" height="${H - 16}" fill="${TCC.paper}" stroke="#9A9284" stroke-width="1.5"/>${[0, 1, 2].map((i) => `<path d="M${-W / 2 + 40},${-H / 2 + 34 + i * 22} q20,-6 40,0 t40,0 t40,0 t40,0" stroke="${TCC.ink}" stroke-width="2" fill="none" opacity=".6"/>`).join('')}</g>`;
  out += `<rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" fill="${c}" stroke="${INK}" stroke-opacity=".55" stroke-width="2.5"/>`;
  out += `<path d="M${-W / 2},${H / 2} L-18,4 M${W / 2},${H / 2} L18,4" stroke="${c2}" stroke-width="2.5" fill="none"/><path d="M${-W / 2},${H / 2} L0,-6 L${W / 2},${H / 2} Z" fill="${c2}" opacity=".35"/>`;
  if (op <= 0.5) out += `<path d="M${-W / 2},${-H / 2} L0,${f(lerp(14, -H / 2, op * 2))} L${W / 2},${-H / 2} Z" fill="${mixC(c, '#000000', 0.05)}" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>`;
  return out + `</g>`;
};
/** 林芳的信（粉信封里那封）：最后一行（下标 6）被水洇了 */
export const FANG_LETTER = ['Dear friend in 2026,', 'This letter is not for the future. It is for my best friend, Chen Yu.', 'Two weeks ago, her music box fell off the desk, and the music stopped. I did it — but it was an accident.', 'She thinks I did it on purpose. She won’t talk to me.', 'Her family is moving to Shanghai next month. I don’t know how to say sorry.', 'This is the key to her music box. If you find her, please give it to her and tell her —', 'that I am so sorry, and she is still my best friend.', 'Lin Fang'];
/** 陈雨的信（蓝信封，压在衬布下面） */
export const YU_LETTER = ['To whoever finds this:', 'Please tell Lin Fang I’m sorry.', 'I know it was an accident. I said terrible things because I was angry.', 'The box doesn’t play anymore, but I will keep it forever.', 'Maybe one day we will make up.', 'Chen Yu'];
export interface LetterOpts {
  /** 一段一段的字（太长自动换行）；最后一段如果是名字，靠右写 */ lines: string[];
  /** 写到哪儿 0—1（一个字一个字出来） */ reveal?: number;
  /** 被水洇掉的段（下标，可以给几个） */ smudge?: number | number[];
  /** 洇开的程度 0—1（0 还看得清，1 完全化开） */ wet?: number;
  paper?: 'white' | 'pink' | 'blue'; rot?: number;
  /** 纸宽（默认 600）、字号（默认 30）、每行最多几个字母（默认按纸宽算） */ w?: number; size?: number; wrap?: number;
  /** 把某一段画上淡黄底（读到哪段亮哪段） */ hl?: number;
  /** 最后一段是署名（靠右），默认 true */ sign?: boolean;
}
const letterLayout = (o: LetterOpts) => {
  const w = o.w ?? 600, size = o.size ?? 30, n = o.wrap ?? Math.floor((w - 90) / (size * 0.5)), lh = size * 1.45;
  const rows: { t: string; p: number }[] = [];
  o.lines.forEach((l, p) => wrapText(l, n).forEach((t) => rows.push({ t, p })));
  return { w, size, lh, rows, h: 70 + rows.length * lh + 40 };
};
/** 信纸多高（排版用） */
export const letterH = (o: LetterOpts) => letterLayout(o).h;
/** 一页手写的英文信（x、y 是左上角）。被水洇的那段：一片水渍，字化开、看不清（用小块模糊，不是全画幅滤镜） */
export const letter = (id: string, x: number, y: number, s = 1, o: LetterOpts) => {
  const L = letterLayout(o), { w, size, lh, rows, h } = L, paper = o.paper === 'pink' ? '#FBE7EA' : o.paper === 'blue' ? '#E8F0FA' : TCC.paper, line = o.paper === 'pink' ? '#E8B8C2' : '#BCD0E4';
  const sm = new Set(o.smudge === undefined ? [] : Array.isArray(o.smudge) ? o.smudge : [o.smudge]), wet = clamp(o.wet ?? 1), last = o.lines.length - 1, sign = o.sign ?? true;
  let out = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})"><rect x="8" y="10" width="${w}" height="${f(h)}" fill="#000" opacity=".2"/><rect width="${w}" height="${f(h)}" fill="${paper}" stroke="#B8AE98" stroke-width="2"/>`;
  for (let i = 0; i < rows.length + 1; i++) out += `<line x1="30" y1="${f(70 + i * lh + 8)}" x2="${w - 30}" y2="${f(70 + i * lh + 8)}" stroke="${line}" stroke-width="1.6"/>`;
  out += `<path d="M0,${f(h * 0.5)} h${w}" stroke="#D8CEB8" stroke-width="2" opacity=".6"/>`; // 折痕
  let total = 0; rows.forEach((r) => (total += r.t.length));
  let shown = Math.round(clamp(o.reveal ?? 1) * total);
  rows.forEach((r, i) => {
    const yy = 70 + i * lh, xx = sign && r.p === last && last > 0 ? w - 60 : 46, anchor = sign && r.p === last && last > 0 ? 'end' : 'start';
    const n = Math.min(r.t.length, shown); shown -= n;
    if (o.hl === r.p) out += `<rect x="36" y="${f(yy - size * 0.95)}" width="${w - 72}" height="${f(size * 1.3)}" fill="#F6E27A" opacity=".45"/>`;
    if (!n) return;
    const txt = esc(r.t.slice(0, n));
    if (sm.has(r.p)) {
      const rr = rng(50 + i);
      out += `<path d="M30,${f(yy - size)} ${Array.from({ length: 8 }, (_, k) => `Q${f(30 + (k + 0.5) * (w - 60) / 8)},${f(yy - size - 8 - rr() * 14)} ${f(30 + (k + 1) * (w - 60) / 8)},${f(yy - size - rr() * 6)}`).join(' ')} L${w - 30},${f(yy + 16)} ${Array.from({ length: 8 }, (_, k) => `Q${f(w - 30 - (k + 0.5) * (w - 60) / 8)},${f(yy + 22 + rr() * 16)} ${f(w - 30 - (k + 1) * (w - 60) / 8)},${f(yy + 16 + rr() * 6)}`).join(' ')} Z" fill="#9FB6CC" opacity="${f(0.28 * wet)}" stroke="#7E98B0" stroke-opacity="${f(0.45 * wet)}" stroke-width="2"/>`;
      out += `<text x="${xx}" y="${f(yy)}" font-size="${size}" fill="${TCC.ink}" text-anchor="${anchor}" opacity="${f(1 - wet)}" ${HAND}>${txt}</text>`;
      out += `<text x="${xx}" y="${f(yy + 3)}" font-size="${size}" fill="${TCC.ink}" text-anchor="${anchor}" opacity="${f(0.75 * wet)}" filter="url(#${id}s)" ${HAND}>${txt}</text>`;
      for (let k = 0; k < 7; k++) out += `<ellipse cx="${f(60 + rr() * (w - 140))}" cy="${f(yy - size * 0.35 + (rr() - 0.5) * 10)}" rx="${f(10 + rr() * 26)}" ry="${f(5 + rr() * 8)}" fill="${TCC.ink}" opacity="${f(wet * (0.12 + rr() * 0.14))}"/>`;
    } else out += `<text x="${xx}" y="${f(yy)}" font-size="${size}" fill="${TCC.ink}" text-anchor="${anchor}" ${HAND}>${txt}</text>`;
  });
  return out + `</g>`;
};

// ---------------- 小铜钥匙 ----------------
/** 上弦的小铜钥匙（蝴蝶形的把手 + 一根杆）：x、y 是插进去的那一头，钥匙往上长，长约 140×s。
 *  rot 转多少度；turn 拧了几圈（把手转起来）；glint 闪光的强度（0—1，配 g 才会一闪一闪） */
export const brassKey = (x: number, y: number, s = 1, o: { rot?: number; g?: number; glint?: number; turn?: number } = {}) => {
  const g = o.g ?? 0, tw = Math.cos((o.turn ?? 0) * Math.PI * 2), sx = Math.max(0.12, Math.abs(tw));
  let out = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})">`;
  out += `<rect x="-6" y="-78" width="12" height="78" rx="3" fill="#C99A3A" stroke="#7A5418" stroke-width="2"/><rect x="-6" y="-10" width="12" height="10" fill="#A87A24"/><path d="M-2,-74 v66" stroke="#F2D27A" stroke-width="2.4" opacity=".8"/>`;
  out += `<rect x="-12" y="-88" width="24" height="12" rx="4" fill="#B88A30" stroke="#7A5418" stroke-width="2"/>`;
  out += `<g transform="translate(0,-122) scale(${f(sx)},1)"><path d="M0,30 C-10,24 -46,24 -50,-2 C-52,-26 -24,-34 -8,-18 Q0,-10 0,-24 Q0,-10 8,-18 C24,-34 52,-26 50,-2 C46,24 10,24 0,30 Z" fill="${tw >= 0 ? '#D9A441' : '#B8862A'}" stroke="#7A5418" stroke-width="2.4"/><ellipse cx="-26" cy="0" rx="10" ry="8" fill="#5A3E10" opacity=".55"/><ellipse cx="26" cy="0" rx="10" ry="8" fill="#5A3E10" opacity=".55"/><path d="M-40,-12 q10,-10 22,-4" stroke="#FFF1B8" stroke-width="3" fill="none" opacity=".8"/></g>`;
  const gl = (o.glint ?? 0) * Math.max(0, Math.sin(g * 2.4));
  if (gl > 0.02) out += `<path d="M22,-150 l5,14 l14,5 l-14,5 l-5,14 l-5,-14 l-14,-5 l14,-5 z" fill="#FFFDF0" opacity="${f(gl)}" transform="translate(22,-150) scale(${f(0.6 + gl * 0.6)}) translate(-22,150)"/>`;
  return out + `</g>`;
};

// ---------------- 八音盒 ----------------
/** 飘出来的音符：从 x、y 往上飘、左右摆；k 0—1 是多少（0 没有） */
export const notes = (x: number, y: number, s: number, g: number, k = 1) => {
  if (k <= 0.01) return '';
  let out = '';
  for (let i = 0; i < 7; i++) {
    const T = 3.2, ph = i / 7, t = (g / T + ph) % 1, xx = x + (Math.sin(t * 5 + i * 2.1) * 40 + (i % 2 ? 1 : -1) * t * 90) * s, yy = y - t * 260 * s, a = Math.sin(t * Math.PI) * k, c = i % 3 === 0 ? '#C98A1E' : i % 3 === 1 ? '#8E3A4A' : '#3B5E8A';
    const dbl = i % 2 === 0;
    out += `<g transform="translate(${f(xx)},${f(yy)}) scale(${f(s * (0.8 + 0.3 * Math.sin(i)))}) rotate(${f(Math.sin(g * 2 + i) * 12)})" opacity="${f(a)}">${dbl ? `<ellipse cx="-12" cy="8" rx="9" ry="7" fill="${c}" transform="rotate(-20 -12 8)"/><ellipse cx="14" cy="2" rx="9" ry="7" fill="${c}" transform="rotate(-20 14 2)"/><path d="M-4,7 V-34 L22,-40 V1" stroke="${c}" stroke-width="4" fill="none"/><path d="M-4,-34 L22,-40 L22,-32 L-4,-26 Z" fill="${c}"/>` : `<ellipse cx="0" cy="6" rx="10" ry="7.5" fill="${c}" transform="rotate(-20 0 6)"/><path d="M8,4 V-36 q12,8 14,22" stroke="${c}" stroke-width="4" fill="none"/>`}</g>`;
  }
  return out;
};
/** 小芭蕾舞者（正面，站在小圆台上）：x、y 是脚尖；spin 是转了几圈（转的时候一只胳膊、抬起的腿跟着转） */
const dancer = (x: number, y: number, s: number, spin: number) => {
  const c = Math.cos(spin * Math.PI * 2), sn = Math.sin(spin * Math.PI * 2), front = sn > -0.2;
  let o = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
  o += `<path d="M-2,0 L-2,-36 M2,0 L2,-36" stroke="#F4E6E0" stroke-width="3.4"/>`;
  o += `<path d="M2,-30 L${f(2 + 16 * c)},-22" stroke="#F4E6E0" stroke-width="3" opacity="${front ? 1 : 0.6}"/>`; // 抬起来的腿（转起来时一会儿朝左一会儿朝右）
  o += `<ellipse cx="0" cy="-38" rx="22" ry="7" fill="#F2B8C8" stroke="#C88496" stroke-width="1.2"/><ellipse cx="${f(6 * c)}" cy="-40" rx="10" ry="3" fill="#FFE0EA" opacity=".8"/>`; // 纱裙
  o += `<path d="M-5,-40 L-6,-58 Q0,-62 6,-58 L5,-40 Z" fill="#F2B8C8" stroke="#C88496" stroke-width="1"/>`;
  o += `<path d="M-5,-56 Q-14,-74 -2,-82" stroke="#F1DCCB" stroke-width="2.6" fill="none"/><path d="M5,-56 Q${f(5 + 20 * c)},-62 ${f(5 + 24 * c)},-66" stroke="#F1DCCB" stroke-width="2.6" fill="none"/>`; // 一只手举过头，一只手伸出去
  o += `<circle cx="0" cy="-66" r="5.5" fill="#F1DCCB"/><circle cx="${f(-2 * sn)}" cy="-71" r="3.4" fill="#3A2A22"/>`;
  return o + `</g>`;
};
export interface MusicBoxOpts {
  /** 盖子开合 0—1 */ lid?: number;
  /** 舞者转了几圈（让它一直转：spin: g * 0.4）；不给就不转（坏了、不响的时候） */ spin?: number;
  /** 飘出来的音符 0—1 */ notes?: number;
  g?: number;
  /** 钥匙插在右侧 0—1（0 没有钥匙，1 插好了）；turn 钥匙拧了几圈 */ keyIn?: number; turn?: number;
  /** 整个盒子转多少度（摔下去的时候用） */ rot?: number;
  kx?: number; ky?: number;
}
/** 八音盒（宽 240、深 160、高 110，乘 s）：x、y 是正面底边中点。红木漆面、金边、盖子里有镜子、盒里是红绒布，小舞者站在中间 */
export const musicBox = (id: string, x: number, y: number, s = 1, o: MusicBoxOpts = {}) => {
  const W = 240, D = 160, H = 110, kx = o.kx ?? 0.3, ky = o.ky ?? 0.45, Pj = proj(0, 0, 1, kx, ky), g = o.g ?? 0;
  const th = (clamp(o.lid ?? 0) * 105 * Math.PI) / 180, key = `${id}mb${Math.round(x)}_${Math.round(y)}_`;
  const wood = '#7A3E26', wood2 = '#5E2E1C', wood3 = '#8E4A2E';
  let out = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})"><ellipse cx="${f((D * kx) / 2)}" cy="4" rx="${W / 2 + 30}" ry="18" fill="#000" opacity=".22"/>`;
  const hz = D, hy = H, Ld = D + 2;
  const lidPt = (px: number, d: number, n = 0): number[] => Pj([px, hz - d * Math.cos(th) - n * Math.sin(th), hy + d * Math.sin(th) - n * Math.cos(th)]);
  const hL = lidPt(-W / 2 - 2, 0), hR = lidPt(W / 2 + 2, 0), fL = lidPt(-W / 2 - 2, Ld), fR = lidPt(W / 2 + 2, Ld);
  const topVisible = th < Math.atan(ky), lip = 26;
  const drawLid = () => {
    let l = '';
    const lipF = [fL, fR, lidPt(W / 2 + 2, Ld, lip), lidPt(-W / 2 - 2, Ld, lip)], lipR = [hR, fR, lidPt(W / 2 + 2, Ld, lip), lidPt(W / 2 + 2, 0, lip)];
    if (topVisible) {
      l += `<polygon points="${pts(lipR)}" fill="${wood2}" stroke="${INK}" stroke-opacity=".6" stroke-width="2"/><polygon points="${pts([hL, hR, fR, fL])}" fill="${wood3}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.2"/>`;
      const T = plane(Pj, [-W / 2 - 2, hz - Ld * Math.cos(th), hy + Ld * Math.sin(th)], [1, 0, 0], [0, Math.cos(th), -Math.sin(th)]);
      l += `<g transform="${T}"><rect x="12" y="12" width="${W - 20}" height="${Ld - 24}" rx="8" fill="none" stroke="${GOLD}" stroke-width="3"/><ellipse cx="${(W + 4) / 2}" cy="${Ld / 2}" rx="46" ry="34" fill="none" stroke="${GOLD}" stroke-width="2.4"/>${[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2; return `<ellipse cx="${f((W + 4) / 2 + Math.cos(a) * 18)}" cy="${f(Ld / 2 + Math.sin(a) * 14)}" rx="10" ry="6" fill="#E8C060" opacity=".85" transform="rotate(${f((a * 180) / Math.PI)} ${f((W + 4) / 2 + Math.cos(a) * 18)} ${f(Ld / 2 + Math.sin(a) * 14)})"/>`; }).join('')}<circle cx="${(W + 4) / 2}" cy="${Ld / 2}" r="6" fill="#C23B2E"/></g>`;
      l += `<polygon points="${pts(lipF)}" fill="${wood}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.2"/>`;
    } else {
      l += `<polygon points="${pts([hL, hR, fR, fL])}" fill="${wood2}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.2"/>`;
      const T = plane(Pj, [-W / 2 - 2, hz, hy], [1, 0, 0], [0, -Math.cos(th), Math.sin(th)]);
      l += `<g transform="${T}"><rect x="14" y="14" width="${W - 24}" height="${Ld - 28}" rx="6" fill="#B8CCD6" stroke="${GOLD}" stroke-width="4"/><path d="M40,${Ld - 30} L90,20 M70,${Ld - 26} L120,24" stroke="#FFFFFF" stroke-width="8" opacity=".5"/></g>`; // 盖子里的镜子
      l += `<polygon points="${pts(lipF)}" fill="${wood}" stroke="${INK}" stroke-opacity=".6" stroke-width="2"/>`;
    }
    return l;
  };
  if (!topVisible) out += drawLid();
  const side = [Pj([W / 2, 0, 0]), Pj([W / 2, D, 0]), Pj([W / 2, D, H]), Pj([W / 2, 0, H])], front = [Pj([-W / 2, 0, 0]), Pj([W / 2, 0, 0]), Pj([W / 2, 0, H]), Pj([-W / 2, 0, H])];
  out += `<polygon points="${pts(side)}" fill="${wood2}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.2"/>`;
  // 钥匙孔、钥匙（右侧面）
  const kc = Pj([W / 2, D * 0.5, H * 0.45]);
  out += `<ellipse cx="${f(kc[0])}" cy="${f(kc[1])}" rx="4" ry="6" fill="#2A1A10"/>`;
  out += `<polygon points="${pts(front)}" fill="${wood}" stroke="${INK}" stroke-opacity=".6" stroke-width="2.2"/>`;
  out += `<g transform="${plane(Pj, [-W / 2, 0, H], [1, 0, 0], [0, 0, -1])}"><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="6" fill="none" stroke="${GOLD}" stroke-width="3"/><path d="M${W / 2 - 50},${H / 2} q25,-26 50,0 q25,26 50,0" stroke="#E8C060" stroke-width="3" fill="none"/>${[-1, 1].map((d) => `<circle cx="${W / 2 + d * 70}" cy="${H / 2}" r="7" fill="#E8C060"/><path d="M${W / 2 + d * 70},${H / 2 - 7} q${d * 10},-10 ${d * 20},-4 M${W / 2 + d * 70},${H / 2 + 7} q${d * 10},10 ${d * 20},4" stroke="#E8C060" stroke-width="2.4" fill="none"/>`).join('')}<rect x="${W / 2 - 8}" y="4" width="16" height="12" rx="2" fill="${GOLD}"/></g>`;
  if (th > 0.05) {
    const t = 8, hole = [Pj([-W / 2 + t, t, H]), Pj([W / 2 - t, t, H]), Pj([W / 2 - t, D - t, H]), Pj([-W / 2 + t, D - t, H])];
    out += `<polygon points="${pts(hole)}" fill="#7A1E2A"/><clipPath id="${key}h"><polygon points="${pts(hole)}"/></clipPath><g clip-path="url(#${key}h)"><polygon points="${pts([Pj([-W / 2 + t, D - t, H]), Pj([W / 2 - t, D - t, H]), Pj([W / 2 - t, D - t, 40]), Pj([-W / 2 + t, D - t, 40])])}" fill="#5E1620"/>${[0.3, 0.55, 0.8].map((k) => `<path d="M${pts([Pj([-W / 2 + t, D * k, 60])])} L${pts([Pj([W / 2 - t, D * k, 60])])}" stroke="#661A24" stroke-width="3" opacity=".6"/>`).join('')}</g>`;
    out += `<polygon points="${pts([Pj([-W / 2, 0, H]), Pj([W / 2, 0, H]), Pj([W / 2, D, H]), Pj([-W / 2, D, H])])}" fill="none" stroke="${GOLD}" stroke-width="3.4"/>`;
    // 小圆台和舞者：盖子开到一半以后升起来
    const up = seg(clamp(o.lid ?? 0), 0.45, 0.9), base = Pj([0, D * 0.5, H - 30 + up * 34]);
    out += `<ellipse cx="${f(base[0])}" cy="${f(base[1])}" rx="26" ry="8" fill="${GOLD}" stroke="#8A6218" stroke-width="1.6"/><rect x="${f(base[0] - 3)}" y="${f(base[1])}" width="6" height="${f(up * 30)}" fill="#B8862A"/>`;
    // 舞者只在盒口以上露出来（还没升起来时被盒子正面挡住）
    const FL = Pj([-W / 2, 0, H]), FR = Pj([W / 2, 0, H]), BR = Pj([W / 2, D, H]);
    out += `<clipPath id="${key}d"><polygon points="${pts([FL, FR, BR, [BR[0] + 300, BR[1]], [BR[0] + 300, -2000], [FL[0] - 300, -2000], [FL[0] - 300, FL[1]]])}"/></clipPath><g clip-path="url(#${key}d)">${dancer(base[0], base[1] - 2, 1, o.spin ?? 0.1)}</g>`;
  }
  if (topVisible) out += drawLid();
  const kin = clamp(o.keyIn ?? 0);
  if (kin > 0) out += `<g transform="translate(${f(kc[0] + (1 - kin) * 60)},${f(kc[1])}) rotate(90) scale(.42)" opacity="${f(Math.min(1, kin * 3))}">${brassKey(0, 0, 1, { turn: o.turn ?? 0, g, glint: 0.4 })}</g>`;
  out += `</g>`;
  // 音符（从盒子上方飘出）
  if ((o.notes ?? 0) > 0) { const c = (q: V3) => [x + Pj(q)[0] * s, y + Pj(q)[1] * s]; const m = c([0, D * 0.5, H + 60]); out += notes(m[0], m[1], s, g, o.notes ?? 0); }
  return out;
};

// ---------------- 老照片 ----------------
export type MiniHair = 'boy' | 'boy2' | 'crop' | 'braids' | 'pony' | 'bob' | 'teacher';
/** 照片里正面的小人（只到腰，1996 年的校服）：x、y 是脸的中心，s 缩放（脸高约 26×s）。
 *  hair：boy / boy2 男生，crop 短发女生（林芳），braids 两条辫子（陈雨），pony、bob 别的女生，teacher 年轻时的周老师（西装）；
 *  look -1—1 眼睛往左右看；sad 0—1 难过；tilt 歪头的角度；hold 捧着八音盒 */
export const photoKid = (x: number, y: number, s: number, o: { hair: MiniHair; look?: number; sad?: number; tilt?: number; hold?: boolean; seed?: number }) => mini(x, y, s, o);
const mini = (x: number, y: number, s: number, o: { hair: MiniHair; look?: number; sad?: number; tilt?: number; hold?: boolean; seed?: number }) => {
  const r = rng(o.seed ?? Math.round(x * 3 + y)), hc = '#1E1814', teach = o.hair === 'teacher', cloth = teach ? '#4E4A44' : TCC.uni96;
  let out = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
  out += `<path d="M-30,${120} L-28,30 Q-26,18 -10,16 L10,16 Q26,18 28,30 L30,120 Z" fill="${cloth}" stroke="${INK}" stroke-opacity=".4" stroke-width="1.2"/>`;
  if (teach) out += `<path d="M-8,16 L0,40 L8,16 Z" fill="#EDE8DC"/><path d="M-1,22 L1,22 L2,46 L0,50 L-2,46 Z" fill="#6A2E28"/>`;
  else out += `<rect x="-28" y="34" width="56" height="9" fill="#F2EFE4"/><path d="M-9,16 L0,28 L9,16" stroke="#F2EFE4" stroke-width="4" fill="none"/>`;
  const sk = mixC(SKIN, '#C8A47E', r() * 0.6), fw = 10 + r() * 2, fh = 12.5 + r() * 1.5;
  out += `<g transform="rotate(${f(o.tilt ?? 0)} 0 10)"><rect x="-4" y="6" width="8" height="12" fill="${sk}"/><ellipse cx="0" cy="0" rx="${f(fw)}" ry="${f(fh)}" fill="${sk}" stroke="${INK}" stroke-opacity=".35" stroke-width="1"/>`;
  const H = o.hair;
  if (H === 'braids') out += `<path d="M-11,-2 Q-14,16 -12,30 M11,-2 Q14,16 12,30" stroke="${hc}" stroke-width="5.5" stroke-dasharray="4 1.5" fill="none"/><path d="M-14,30 h5 M9,30 h5" stroke="#C23B2E" stroke-width="2.4"/>`;
  if (H === 'crop' || H === 'bob') out += `<path d="M-12,${H === 'bob' ? 10 : 6} Q-15,-16 0,-15 Q15,-16 12,${H === 'bob' ? 10 : 6} L9,${H === 'bob' ? 8 : 4} Q10,-6 4,-8 Q-6,-4 -9,-6 Q-10,0 -9,${H === 'bob' ? 8 : 4} Z" fill="${hc}"/>`;
  else if (H === 'braids' || H === 'pony') out += `<path d="M-12,2 Q-14,-16 0,-15 Q14,-16 12,2 Q8,-8 0,-9 Q-8,-8 -12,2 Z" fill="${hc}"/><path d="M0,-15 L0,-8" stroke="#3A2E28" stroke-width="1"/>`;
  else out += `<path d="M-12,-1 Q-13,-16 0,-15 Q13,-16 12,-1 Q${f(6 + r() * 4)},-9 0,-9 Q-6,-10 -12,-1 Z" fill="${H === 'teacher' ? '#2A221C' : hc}"/>${H === 'boy2' ? `<path d="M-4,-14 l-2,6" stroke="#3A2E28" stroke-width="1"/>` : ''}`;
  const lk = (o.look ?? 0) * 2.2, sad = o.sad ?? 0;
  out += `<circle cx="${f(-4 + lk)}" cy="-1" r="1.4" fill="${INK}"/><circle cx="${f(4 + lk)}" cy="-1" r="1.4" fill="${INK}"/>`;
  out += sad > 0.3 ? `<path d="M-3,7 Q0,5 3,7" stroke="${INK}" stroke-width="1.1" fill="none"/><path d="M-7,-6 l4,1 M7,-6 l-4,1" stroke="${INK}" stroke-width="1" opacity=".7"/>` : `<path d="M-3,6 Q0,8.5 3,6" stroke="${INK}" stroke-width="1.1" fill="none"/>`;
  out += `</g>`;
  if (o.hold) out += `<g transform="translate(0,46)"><rect x="-14" y="-6" width="28" height="18" rx="2" fill="#7A3E26" stroke="${INK}" stroke-width="1"/><path d="M-14,0 h28" stroke="${GOLD}" stroke-width="1.4"/><circle cx="-14" cy="8" r="3.4" fill="${SKIN}"/><circle cx="14" cy="8" r="3.4" fill="${SKIN}"/></g>`;
  return out + `</g>`;
};
// 合影的排法：后排 11 个、中排 10 个（林芳第 5 个、陈雨第 6 个）、前排坐 9 个（周老师在中间）
const ROWS: { y: number; n: number; x0: number; dx: number; s: number }[] = [{ y: 118, n: 11, x0: 70, dx: 50, s: 0.95 }, { y: 178, n: 10, x0: 95, dx: 50, s: 1 }, { y: 240, n: 9, x0: 112, dx: 52, s: 1.04 }];
const PH_FANG: [number, number] = [1, 4], PH_YU: [number, number] = [1, 5], PH_ZHOU: [number, number] = [2, 4];
const rowXY = (row: number, i: number) => { const R = ROWS[row]; return [R.x0 + i * R.dx, R.y - (row === 1 && i === PH_FANG[1] ? 14 : 0)]; };
/** 照片上某人脸的位置（世界坐标）：x、y、s 和 classPhoto 一样；who 是 fang、yu、zhou */
export const photoSpot = (x: number, y: number, s: number, who: 'fang' | 'yu' | 'zhou') => { const [r, i] = who === 'fang' ? PH_FANG : who === 'yu' ? PH_YU : PH_ZHOU, p = rowXY(r, i); return [x + (20 + p[0]) * s, y + (20 + p[1]) * s]; };
/** 班级合影（640×430，乘 s；x、y 是左上角）。1996 年 6 月，老银杏树前：后排、中排站着，前排坐着，周老师在前排正中。
 *  林芳（高个、短发）和陈雨（两条辫子、手里捧着八音盒）在中排挨着站。
 *  fangLook 0—1：林芳侧过头看陈雨、样子难过；mark 'fang' | 'yu' | 'both'，markK 0—1 红笔圈出来的进度；tone 'sepia'（默认，旧照片）| 'color' */
export const classPhoto = (id: string, x: number, y: number, s = 1, o: { fangLook?: number; mark?: 'fang' | 'yu' | 'both'; markK?: number; tone?: 'sepia' | 'color'; rot?: number; g?: number } = {}) => {
  const W = 640, H = 430, iw = 600, ih = 360, cid = `${id}cp${Math.round(x)}_${Math.round(y)}_`, fl = clamp(o.fangLook ?? 0);
  let out = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})"><rect x="8" y="10" width="${W}" height="${H}" fill="#000" opacity=".25"/><rect width="${W}" height="${H}" fill="#F2EBDA" stroke="#C8BCA0" stroke-width="2"/>`;
  out += `<clipPath id="${cid}"><rect x="20" y="20" width="${iw}" height="${ih}"/></clipPath><g clip-path="url(#${cid})"><g transform="translate(20,20)">`;
  // 背景：教学楼的墙、六月的银杏
  out += `<rect width="${iw}" height="${ih}" fill="#C9B79A"/><rect y="0" width="${iw}" height="150" fill="#D9C9A8"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${20 + i * 100}" y="20" width="60" height="50" fill="#A8B4B0" stroke="#8A7E6A" stroke-width="3"/>`).join('')}`;
  out += `<g transform="translate(540,180) scale(.36)">${ginkgoTree(0, 0, 1, { gold: 0, seed: 5 })}</g>`;
  out += `<rect x="150" y="62" width="300" height="32" fill="#A8322A"/><text x="300" y="85" font-size="20" font-weight="700" fill="#F6E7C8" text-anchor="middle" ${SERIF}>Class 3, Grade 9 · June 1996</text>`;
  // 三排人
  const hairs: MiniHair[] = ['boy', 'pony', 'boy2', 'bob', 'boy', 'crop', 'boy2', 'pony', 'boy', 'bob', 'boy2'];
  ROWS.forEach((R, row) => {
    if (row === 2) out += `<rect x="40" y="${R.y + 52}" width="${iw - 80}" height="20" fill="#6E5A44"/>`; // 前排的长凳
    for (let i = 0; i < R.n; i++) {
      const [px, py] = rowXY(row, i), isF = row === PH_FANG[0] && i === PH_FANG[1], isY = row === PH_YU[0] && i === PH_YU[1], isZ = row === PH_ZHOU[0] && i === PH_ZHOU[1];
      const hair: MiniHair = isF ? 'crop' : isY ? 'braids' : isZ ? 'teacher' : hairs[(i * 3 + row * 5) % hairs.length];
      out += mini(px, py, R.s * (isF ? 1.03 : 1), { hair, hold: isY, look: isF ? fl : 0, sad: isF ? fl : 0, tilt: isF ? fl * 10 : 0, seed: row * 20 + i });
    }
  });
  if ((o.tone ?? 'sepia') === 'sepia') out += `<rect width="${iw}" height="${ih}" fill="#9C7E52" opacity=".6" style="mix-blend-mode:color"/><rect width="${iw}" height="${ih}" fill="#E8D2A6" opacity=".25" style="mix-blend-mode:multiply"/>`;
  const rr = rng(61);
  for (let i = 0; i < 6; i++) out += `<path d="M${f(rr() * iw)},${f(rr() * ih)} l${f((rr() - 0.5) * 60)},${f(rr() * 40)}" stroke="#FFF8E8" stroke-width="1.2" opacity=".5"/>`; // 划痕
  out += `<rect width="${iw}" height="${ih}" fill="none" stroke="#3A2A1A" stroke-width="18" opacity=".18"/></g></g>`;
  out += `<path d="M${W - 40},${H} L${W},${H - 40} L${W},${H} Z" fill="#E2D6BC"/>`; // 卷了的一角
  // 红笔圈
  const mk = clamp(o.markK ?? 1);
  const ring = (who: 'fang' | 'yu') => { const [r2, i] = who === 'fang' ? PH_FANG : PH_YU, p = rowXY(r2, i), cx = 20 + p[0], cy = 20 + p[1] + 4, L = 2 * Math.PI * 28; return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="26" ry="30" fill="none" stroke="#C8322A" stroke-width="3.4" stroke-dasharray="${f(L)}" stroke-dashoffset="${f(L * (1 - mk))}" transform="rotate(-8 ${f(cx)} ${f(cy)})"/>`; };
  if (o.mark === 'fang' || o.mark === 'both') out += ring('fang');
  if (o.mark === 'yu' || o.mark === 'both') out += ring('yu');
  return out + `</g>`;
};
/** 照片背面：手写的全班名单（640×430，x、y 是左上角）。mark 'fang' | 'yu' | 'both'：在名字下面划线；markK 0—1 划到哪儿 */
export const photoBack = (x: number, y: number, s = 1, o: { mark?: 'fang' | 'yu' | 'both'; markK?: number; rot?: number } = {}) => {
  const W = 640, H = 430, mk = clamp(o.markK ?? 1);
  let out = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})"><rect x="8" y="10" width="${W}" height="${H}" fill="#000" opacity=".25"/><rect width="${W}" height="${H}" fill="#EDE3CC" stroke="#C8BCA0" stroke-width="2"/>`;
  const rr = rng(62); for (let i = 0; i < 8; i++) out += `<circle cx="${f(rr() * W)}" cy="${f(rr() * H)}" r="${f(10 + rr() * 30)}" fill="#C8A870" opacity=".12"/>`;
  out += `<text x="34" y="52" font-size="28" font-weight="700" fill="${TCC.ink}" ${HAND}>Class 3, Grade 9 — June 1996</text>`;
  // 名字排成格子：一行四个，免得手写体量不准宽度时挤在一起
  const rows: [string, string[]][] = [
    ['Back:', ['Wang Lei', 'Li Na', 'Zhang Wei', 'Liu Yang', 'Zhao Min', 'Sun Hao', 'Zhou Jie', 'Wu Qiang', 'Xu Li', 'Ma Tao', 'Hu Bin']],
    ['Middle:', ['Gao Yan', 'Deng Hui', 'Song Kai', 'Cao Lin', 'Lin Fang', 'Chen Yu', 'Feng Bo', 'Jiang Hong', 'He Rui', 'Pan Yi']],
    ['Front:', ['Tang Jun', 'Lu Mei', 'Yang Fan', 'Qian Ning', 'Mr Zhou', 'Shen Yue', 'Ding Hao', 'Wei Lan', 'Kong Liang']],
  ];
  let yy = 100;
  rows.forEach(([h, ns]) => {
    out += `<text x="34" y="${yy}" font-size="20" font-weight="700" fill="#5A3A2A" ${HAND}>${h}</text>`;
    ns.forEach((nm, k) => {
      const cx = 132 + (k % 4) * 122, cy = yy + Math.floor(k / 4) * 30;
      out += `<text x="${cx}" y="${cy}" font-size="20" fill="${TCC.ink}" ${HAND}>${esc(nm)}</text>`;
      const who = nm === 'Lin Fang' ? 'fang' : nm === 'Chen Yu' ? 'yu' : '';
      if (who && (o.mark === who || o.mark === 'both')) out += `<path d="M${cx - 2},${cy + 7} q${f(nm.length * 5.5 * mk)},4 ${f(nm.length * 11 * mk)},0" stroke="#C8322A" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    });
    yy += Math.ceil(ns.length / 4) * 30 + 16;
  });
  return out + `</g>`;
};

// ---------------- 年鉴、磁带 ----------------
export interface YearbookEntry { name: string; motto: string; wish?: string; hair: MiniHair }
const YB_DEFAULT: YearbookEntry[] = [
  { name: 'Lin Fang', motto: 'Never give up.', hair: 'crop' },
  { name: 'Chen Yu', motto: 'Music makes the world go round.', wish: 'I want to be a music teacher.', hair: 'braids' },
  { name: 'Liu Yang', motto: 'Work hard, play hard.', hair: 'boy' },
  { name: 'Zhao Min', motto: 'Every day is a new day.', hair: 'pony' },
];
/** 年鉴（旧书）：x、y 是书脊中点。open 0 合着（暗红封面、烫金 1996），1 摊开；中间是封面翻过去。
 *  摊开时一页两个人：小照片 + 名字 + 座右铭（pages 可以换人，最多 4 个；默认林芳、陈雨在左页） */
export const yearbook = (x: number, y: number, s = 1, o: { open?: number; pages?: YearbookEntry[]; rot?: number } = {}) => {
  const op = clamp(o.open ?? 0), PW = 400, PH = 520, E = o.pages ?? YB_DEFAULT;
  let out = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})">`;
  const cover = (sx: number) => `<g transform="scale(${f(sx)},1)"><rect x="0" y="${-PH / 2}" width="${PW}" height="${PH}" rx="6" fill="${sx > 0 ? '#6E2E2A' : '#E8DCC0'}" stroke="${INK}" stroke-width="3"/>${sx > 0 ? `<rect x="0" y="${-PH / 2}" width="26" height="${PH}" fill="#4E1E1A"/><rect x="60" y="${-PH / 2 + 50}" width="${PW - 100}" height="${PH - 100}" fill="none" stroke="${GOLD}" stroke-width="3"/><text x="${PW / 2 + 12}" y="-30" font-size="44" font-weight="700" fill="${GOLD}" text-anchor="middle" letter-spacing="3" ${SERIF}>YEARBOOK</text><text x="${PW / 2 + 12}" y="60" font-size="80" font-weight="700" fill="${GOLD}" text-anchor="middle" ${SERIF}>1996</text>${Array.from({ length: 12 }, (_, i) => { const r = rng(70 + i); return `<circle cx="${f(30 + r() * (PW - 40))}" cy="${f(-PH / 2 + r() * PH)}" r="${f(6 + r() * 16)}" fill="#C8B8A0" opacity=".14"/>`; }).join('')}` : ''}</g>`;
  const page = (side: -1 | 1, items: YearbookEntry[]) => {
    let p = `<rect x="${side < 0 ? -PW : 0}" y="${-PH / 2}" width="${PW}" height="${PH}" fill="#F4ECD8" stroke="#B8A888" stroke-width="2"/>`;
    items.forEach((e, i) => {
      const x0 = side < 0 ? -PW + 30 : 30, y0 = -PH / 2 + 34 + i * 240;
      const cp = `yb${side < 0 ? 'l' : 'r'}${i}_${Math.round(x)}_${Math.round(y)}`;
      p += `<clipPath id="${cp}"><rect x="${x0}" y="${y0}" width="120" height="150"/></clipPath><rect x="${x0}" y="${y0}" width="120" height="150" fill="#C9B79A"/><g clip-path="url(#${cp})"><g transform="translate(${x0 + 60},${y0 + 62})">${mini(0, 0, 1.9, { hair: e.hair, seed: i })}</g></g><rect x="${x0}" y="${y0}" width="120" height="150" fill="#9C7E52" opacity=".45" style="mix-blend-mode:color"/><rect x="${x0}" y="${y0}" width="120" height="150" fill="none" stroke="#8A7E6A" stroke-width="2"/>`;
      p += `<text x="${x0 + 140}" y="${y0 + 40}" font-size="30" font-weight="700" fill="${INK}" ${SERIF}>${esc(e.name)}</text>`;
      p += wrapText(`“${e.motto}”`, 16).map((t, k) => `<text x="${x0 + 140}" y="${y0 + 84 + k * 32}" font-size="24" fill="${TCC.ink}" ${HAND}>${esc(t)}</text>`).join('');
      if (e.wish) p += wrapText(e.wish, 26).map((t, k) => `<text x="${x0}" y="${y0 + 182 + k * 28}" font-size="21" fill="#5A4A3A" ${HAND}>${esc(t)}</text>`).join('');
    });
    return p;
  };
  if (op <= 0.02) out += `<rect x="10" y="${-PH / 2 + 12}" width="${PW}" height="${PH}" fill="#000" opacity=".25"/>` + cover(1);
  else {
    out += `<rect x="${-PW + 12}" y="${-PH / 2 + 14}" width="${PW * 2}" height="${PH}" fill="#000" opacity=".22"/>`;
    out += page(1, op > 0.5 ? E.slice(2, 4) : []) + (op > 0.5 ? page(-1, E.slice(0, 2)) : ''); // 封面翻过一半以前，底下那页先不写字（免得和封面上的字叠在一起）
    out += `<path d="M0,${-PH / 2} V${PH / 2}" stroke="#B8A888" stroke-width="3"/>`;
    if (op < 1) out += cover(Math.cos(op * Math.PI));
  }
  return out + `</g>`;
};
/** 磁带（300×190，乘 s；x、y 是中心）：spin 时两个轮子转；label 贴纸上的手写字 */
export const cassette = (x: number, y: number, s = 1, o: { rot?: number; g?: number; spin?: boolean; label?: string } = {}) => {
  const a = o.spin ? (o.g ?? 0) * 140 : 0;
  const reel = (cx: number) => `<g transform="translate(${cx},12) rotate(${f(a)})"><circle r="26" fill="#EDE8DC" stroke="#3A3A40" stroke-width="3"/><circle r="10" fill="#2A2A30"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="-2.5" y="-14" width="5" height="7" fill="#EDE8DC" transform="rotate(${i * 60})"/>`).join('')}</g>`;
  return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})"><rect x="-144" y="-86" width="300" height="190" rx="14" fill="#000" opacity=".22"/><rect x="-150" y="-95" width="300" height="190" rx="14" fill="#2E2E36" stroke="#111" stroke-width="3"/><rect x="-128" y="-78" width="256" height="70" rx="6" fill="#EFE6CC"/><rect x="-128" y="-78" width="256" height="16" fill="#C23B2E"/><text x="0" y="-26" font-size="28" fill="${TCC.ink}" text-anchor="middle" ${HAND}>${esc(o.label ?? 'Class 3 · 1996')}</text><rect x="-90" y="-10" width="180" height="46" rx="20" fill="#1E1E24"/>${reel(-50)}${reel(50)}<path d="M-60,95 L-44,58 L44,58 L60,95" fill="#3A3A44" stroke="#111" stroke-width="2"/>${[-24, 24].map((cx) => `<circle cx="${cx}" cy="76" r="5" fill="#111"/>`).join('')}</g>`;
};

/** 搬家的小卡车（侧面，车头朝右）：x 是车身中点，y 是地面；g 让轮子转（车在走时传 g，停着不传）；
 *  face -1 车头朝左；cargo 车厢里露出的家具、纸箱（默认 true）；长约 520×s */
export const movingTruck = (x: number, y: number, s = 1, o: { g?: number; face?: 1 | -1; cargo?: boolean } = {}) => {
  const a = (o.g ?? 0) * 360, wheel = (cx: number) => `<g transform="translate(${cx},-34)"><circle r="34" fill="#2A2A2E"/><circle r="16" fill="#9A9A9E"/><g transform="rotate(${f(a)})"><path d="M-14,0 H14 M0,-14 V14" stroke="#5A5A5E" stroke-width="4"/></g></g>`;
  let t = `<ellipse cx="0" cy="0" rx="270" ry="14" fill="#000" opacity=".2"/>`;
  t += `<rect x="-250" y="-250" width="330" height="200" rx="6" fill="#E8E2D4" stroke="${INK}" stroke-opacity=".6" stroke-width="3"/>`;
  if (o.cargo ?? true) t += `<rect x="-236" y="-236" width="300" height="172" fill="#3A3430"/><rect x="-226" y="-150" width="90" height="86" fill="#B8864E" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M-226,-108 h90" stroke="#8A5A30" stroke-width="3"/><rect x="-126" y="-200" width="70" height="136" fill="#7A5232" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><rect x="-46" y="-130" width="100" height="66" fill="#C8A26A" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M-46,-98 h100" stroke="#8A6A3A" stroke-width="3"/>`;
  t += `<path d="M88,-180 L190,-180 Q226,-176 240,-120 L250,-60 L88,-60 Z" fill="#2F6DA8" stroke="${INK}" stroke-opacity=".6" stroke-width="3"/><path d="M110,-168 L180,-168 Q206,-162 218,-120 L110,-120 Z" fill="#CFE3EC"/><rect x="236" y="-90" width="18" height="12" fill="#F2D27A"/>`;
  t += `<rect x="-256" y="-62" width="512" height="26" rx="6" fill="#4A4A50"/>` + wheel(-170) + wheel(-90) + wheel(170);
  return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * (o.face ?? 1))},${f(s)})">${t}</g>`;
};

// ---------------- 坐着的人 ----------------
export type SeatKind = 'chair' | 'arm' | 'sofa' | 'stool' | 'hall' | 'desk96';
/** 椅子：x 是坐的人髋部的位置，y 是地面，s 跟人的大小一样；face 人朝哪边（椅背在后面）。座面高 56×s，正好接住 person 的坐姿 */
export const seat = (kind: SeatKind, x: number, y: number, s = 1, face: 1 | -1 = 1) => {
  let o = '';
  if (kind === 'hall') return `<g transform="translate(${x},0) scale(${face},1) translate(${-x},0)">${chairRow(x, 1, y, s * 0.74)}</g>`;
  if (kind === 'chair') o = `<rect x="-30" y="-60" width="64" height="9" rx="2" fill="#8A5A36" stroke="${INK}" stroke-opacity=".5"/><rect x="-34" y="-142" width="9" height="142" rx="3" fill="#7A4E2E" stroke="${INK}" stroke-opacity=".5"/><rect x="-34" y="-134" width="9" height="34" fill="#8A5A36"/><rect x="24" y="-52" width="7" height="52" fill="#7A4E2E"/><rect x="-22" y="-52" width="6" height="52" fill="#6A4226"/>`;
  if (kind === 'stool') o = `<rect x="-26" y="-60" width="56" height="10" rx="2" fill="#9A6A40" stroke="${INK}" stroke-opacity=".5"/><path d="M-20,-50 L-24,0 M24,-50 L28,0 M-14,-50 L-12,0" stroke="#7A4E2E" stroke-width="6"/>`;
  if (kind === 'arm') o = `<path d="M-52,-56 L46,-56 L46,-30 L-52,-30 Z" fill="#7A5A3E" stroke="${INK}" stroke-opacity=".55" stroke-width="2"/><path d="M-62,-170 Q-66,-120 -58,-40 L-30,-40 L-30,-160 Q-46,-178 -62,-170 Z" fill="#8E6A48" stroke="${INK}" stroke-opacity=".55" stroke-width="2"/><path d="M-44,-60 L40,-62 Q48,-60 46,-52 L-44,-50 Z" fill="#B08A5E"/><path d="M-6,-82 Q30,-90 44,-80 L44,-60 L-6,-60 Z" fill="#8E6A48" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><path d="M-48,-30 L-50,0 M42,-30 L44,0" stroke="#4A3424" stroke-width="7"/><path d="M-56,-150 q10,40 4,90" stroke="#6E5038" stroke-width="2" fill="none" opacity=".6"/>`;
  if (kind === 'sofa') o = `<path d="M-70,-60 L90,-60 L90,-24 L-70,-24 Z" fill="#6E7E6A" stroke="${INK}" stroke-opacity=".55" stroke-width="2"/><path d="M-82,-150 Q-86,-100 -78,-30 L-40,-30 L-40,-140 Q-60,-158 -82,-150 Z" fill="#7E8E78" stroke="${INK}" stroke-opacity=".55" stroke-width="2"/><path d="M-60,-62 L86,-64 Q94,-60 90,-54 L-60,-52 Z" fill="#94A48C"/><path d="M-66,-24 L-68,0 M84,-24 L86,0" stroke="#3A3428" stroke-width="7"/><rect x="-36" y="-116" width="40" height="40" rx="8" fill="#C8A26A" stroke="${INK}" stroke-opacity=".4" stroke-width="2" transform="rotate(-10 -16 -96)"/>`;
  if (kind === 'desk96') o = `<rect x="-30" y="-60" width="62" height="9" fill="#A8784A" stroke="${INK}" stroke-opacity=".5"/><rect x="-34" y="-128" width="8" height="128" fill="#3E4448"/><rect x="-34" y="-128" width="8" height="30" fill="#A8784A"/><path d="M26,-52 L26,0" stroke="#3E4448" stroke-width="5"/><path d="M-30,-14 L26,-14" stroke="#3E4448" stroke-width="3"/>`;
  return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * face)},${f(s)})">${o}</g>`;
};
/** 坐着的人（连椅子一起画）：y 是地面；kind 椅子的样子（默认木椅）；其余同 person */
export const sitter = (who: string, x: number, y: number, s: number, g: number, o: { kind?: SeatKind; pose?: Pose; face?: 1 | -1; hold?: PersonOpts['hold']; mood?: PersonOpts['mood'] } = {}) => {
  const kind = o.kind ?? 'chair', face = o.face ?? 1, front = kind === 'arm' || kind === 'sofa';
  const ppl = person({ x, y, s, who, pose: o.pose ?? P.sitRest(), g, face, hold: o.hold, detail: s >= 1.6, mood: o.mood });
  // 扶手椅、沙发：扶手在人前面（挡住一点腰）
  const armFront = front ? `<g transform="translate(${f(x)},${f(y)}) scale(${f(s * face)},${f(s)})"><path d="M${kind === 'arm' ? '-52,-90 Q-60,-92 -60,-80 L-58,-54 L16,-54 L16,-78 Q16,-90 2,-90' : '-72,-80 Q-82,-82 -82,-70 L-80,-50 L10,-50 L10,-70 Q10,-80 -4,-80'} Z" fill="${kind === 'arm' ? '#7A5A3E' : '#6E7E6A'}" stroke="${INK}" stroke-opacity=".55" stroke-width="2"/></g>` : '';
  return seat(kind, x, y, s, face) + ppl + armFront;
};

// ---------------- 环境 ----------------
/** 校园一角（校庆前的秋天）：远处教学楼（挂着“60”的红条幅）、花坛、红砖路，右边是老银杏树。地面 y≈700。
 *  treeX、treeS：银杏树的位置和大小（树根在 y 720）；banner: false 不挂条幅 */
export const campusBg = (id: string, o: { treeX?: number; treeS?: number; banner?: boolean } = {}) => {
  const tx = o.treeX ?? 1120, ts = o.treeS ?? 1;
  let s = sky(id, '#B9D4E6', '#F1E6CC');
  s += `<rect x="-60" y="170" width="900" height="520" fill="#E2CDB4" stroke="#B8A08A" stroke-width="4"/><rect x="-70" y="156" width="920" height="22" fill="#C9B097"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) s += `<rect x="${-30 + c * 108}" y="${200 + r * 116}" width="66" height="70" fill="#A9C6D6" stroke="#F4EEE4" stroke-width="5"/>`;
  s += `<rect x="330" y="560" width="120" height="130" fill="#7A6A58"/><rect x="300" y="540" width="180" height="22" fill="#B8A08A"/>`;
  if (o.banner ?? true) s += `<rect x="90" y="186" width="660" height="56" fill="#B8322A"/><text x="420" y="226" font-size="34" font-weight="900" fill="#FFE9A8" text-anchor="middle" letter-spacing="2" ${SANS}>60 YEARS · 1966 – 2026</text>`;
  s += `<path d="M-200,690 L1800,690 L1800,1100 L-200,1100 Z" fill="#C8BCA6"/>`;
  for (let i = 0; i < 14; i++) s += `<path d="M-200,${700 + i * 30} L1800,${700 + i * 30}" stroke="#B4A890" stroke-width="2" opacity=".5"/>`;
  s += `<path d="M560,690 L760,690 L900,1100 L380,1100 Z" fill="#B8645A" opacity=".55"/>`; // 红砖路
  // 花坛
  s += `<rect x="-120" y="640" width="520" height="56" fill="#9A5A44" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M-120,640 Q140,600 400,640" fill="#5E7A44"/>`;
  const r = rng(81); for (let i = 0; i < 26; i++) { const fx = -100 + r() * 480, fy = 612 + r() * 26; s += `<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(7 + r() * 5)}" fill="${['#F2C14E', '#E8833A', '#F4F1E8', '#D8584A'][Math.floor(r() * 4)]}"/>`; }
  s += ginkgoTree(tx, 720, ts) + leafCarpet(82, tx - 380 * ts, tx + 420 * ts, 700, 860, 80);
  return s;
};
/** 英语社活动室：后墙两扇窗（午后的光）、海报（ENGLISH CLUB、世界地图、校庆倒计时）、书柜。地面 y≈640。前面的长桌另画 longTable */
/** days：海报上“还有几天”到校庆（周一 5、周二 4……） */
export const clubRoomBg = (id: string, days = 5) => {
  let s = sky(id, '#EDE4D0', '#E2D6BC');
  s += `<rect x="-200" y="560" width="2000" height="80" fill="#C9BDA4"/><path d="M-200,640 L1800,640 L1800,1100 L-200,1100 Z" fill="#B99A72"/>`;
  for (let i = 0; i < 12; i++) s += `<path d="M${-200 + i * 180},640 L${-400 + i * 230},1100" stroke="#A4865E" stroke-width="2" opacity=".5"/>`;
  [[880, 120], [1200, 120]].forEach(([wx, wy]) => { s += `<rect x="${wx}" y="${wy}" width="260" height="320" fill="#CFE3EC" stroke="#F4EEE4" stroke-width="14"/><path d="M${wx + 130},${wy} V${wy + 320} M${wx},${wy + 150} H${wx + 260}" stroke="#F4EEE4" stroke-width="8"/><path d="M${wx + 20},640 L${wx + 260},640 L${wx + 400},900 L${wx - 60},900 Z" fill="#FFF4D8" opacity=".3"/>`; });
  s += `<rect x="60" y="120" width="300" height="200" fill="#2F5DA8" stroke="#F4F1E8" stroke-width="8"/><text x="210" y="200" font-size="44" font-weight="900" fill="#FFF6DD" text-anchor="middle" ${SANS}>ENGLISH</text><text x="210" y="256" font-size="44" font-weight="900" fill="#F2C14E" text-anchor="middle" ${SANS}>CLUB</text>`;
  s += `<rect x="420" y="140" width="380" height="230" fill="#E8DFC6" stroke="#8A7E6A" stroke-width="5"/><path d="M450,200 Q500,170 560,190 Q600,230 560,280 Q520,320 480,300 Q440,250 450,200 Z M600,180 Q680,160 760,190 Q780,250 720,290 Q660,300 640,260 Q610,230 600,180 Z" fill="#A8C49A"/><text x="610" y="350" font-size="22" fill="#5A4A3A" text-anchor="middle" ${SANS}>THE WORLD</text>`;
  s += `<rect x="1380" y="160" width="140" height="190" fill="#F4F1E8" stroke="#B8322A" stroke-width="6"/><text x="1450" y="250" font-size="70" font-weight="900" fill="#B8322A" text-anchor="middle" ${SANS}>${days}</text><text x="1450" y="300" font-size="20" font-weight="700" fill="#5A4A3A" text-anchor="middle" ${SANS}>${days === 1 ? 'DAY' : 'DAYS'} TO GO</text>`;
  // 书柜
  s += `<rect x="-120" y="360" width="200" height="280" fill="#8A6440" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>` + [0, 1, 2].map((r) => Array.from({ length: 7 }, (_, i) => `<rect x="${-110 + i * 26}" y="${380 + r * 88}" width="20" height="70" fill="${['#B8322A', '#2F5DA8', '#4E7A5A', '#D9A441', '#6E4A7A'][(i + r) % 5]}"/>`).join('') + `<rect x="-120" y="${452 + r * 88}" width="200" height="8" fill="#6E4C30"/>`).join('');
  return s;
};
/** 长桌（英语社活动室、图书馆用）：x 是桌子中心，y 是桌面的高度，w 桌宽；桌面上放东西就在 y 上面画 */
export const longTable = (x: number, y: number, w = 900, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="${-w / 2}" y="0" width="${w}" height="26" rx="4" fill="#A8784A" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><rect x="${-w / 2}" y="22" width="${w}" height="10" fill="#7A5236"/><rect x="${-w / 2 + 30}" y="30" width="18" height="190" fill="#7A5236"/><rect x="${w / 2 - 48}" y="30" width="18" height="190" fill="#7A5236"/><path d="M${-w / 2 + 10},4 L${w / 2 - 10},4" stroke="#C8986A" stroke-width="3" opacity=".7"/></g>`;
/** 一排书架（x、y 是左下角，w、h 宽高；seed 换书的排法） */
export const bookshelf = (x: number, y: number, w: number, h: number, seed = 1, dark = 0) => {
  const r = rng(seed), rowsN = Math.max(2, Math.round(h / 130)), rh = h / rowsN;
  let s = `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${mixC('#6E4A2E', '#2A1E16', dark)}" stroke="${INK}" stroke-opacity=".5" stroke-width="3"/>`;
  for (let k = 0; k < rowsN; k++) {
    const by = y - k * rh - 10; let bx = x + 12;
    while (bx < x + w - 30) { const bw = 14 + r() * 16, bh = rh * (0.6 + r() * 0.3), c = ['#8E2A26', '#2F4E7A', '#4E6A4A', '#B8863A', '#6E4A6A', '#C8B898', '#5A3A2A'][Math.floor(r() * 7)]; if (r() < 0.08) { s += `<rect x="${f(bx)}" y="${f(by - bw)}" width="${f(bh)}" height="${f(bw)}" fill="${mixC(c, '#1E1612', dark)}"/>`; bx += bh + 4; continue; } s += `<rect x="${f(bx)}" y="${f(by - bh)}" width="${f(bw)}" height="${f(bh)}" fill="${mixC(c, '#1E1612', dark)}" stroke="#1E1612" stroke-opacity=".4"/><rect x="${f(bx + 2)}" y="${f(by - bh + 10)}" width="${f(bw - 4)}" height="4" fill="#E8D8A8" opacity=".5"/>`; bx += bw + 1; }
    s += `<rect x="${f(x)}" y="${f(by)}" width="${f(w)}" height="12" fill="${mixC('#4E3420', '#1E1612', dark)}"/>`;
  }
  return s;
};
/** 图书馆的那道光：[x0, y0, x1, y1, 宽] 从左上的高窗斜射下来 */
export const LIB_BEAM: [number, number, number, number, number] = [260, 40, 900, 860, 230];
/** 图书馆：高高的书架（一直顶到上面）、左上的高窗、斜射下来的一道光、木地板。地面 y≈760。灰尘用 dustMotes 放在 fg */
export const libraryBg = (id: string) => {
  let s = sky(id, '#5A4632', '#3E3024');
  s += bookshelf(-140, 760, 420, 900, 3, 0.25) + bookshelf(1040, 760, 300, 860, 4, 0.2) + bookshelf(1360, 760, 400, 900, 5, 0.3) + bookshelf(560, 700, 420, 560, 6, 0.45);
  s += `<rect x="300" y="-40" width="200" height="220" fill="#F6E8C4" stroke="#4A3424" stroke-width="12"/><path d="M400,-40 V180 M300,70 H500" stroke="#4A3424" stroke-width="8"/>`;
  s += `<path d="M-200,760 L1800,760 L1800,1100 L-200,1100 Z" fill="#6E4C30"/>` + Array.from({ length: 10 }, (_, i) => `<path d="M-200,${780 + i * 32} L1800,${780 + i * 32}" stroke="#5A3E26" stroke-width="2" opacity=".6"/>`).join('');
  const [x0, y0, x1, y1, bw] = LIB_BEAM;
  s += `<path d="M${x0},${y0} L${x0 + bw},${y0} L${x1 + bw * 1.6},${y1} L${x1 - bw * 0.4},${y1} Z" fill="#FFE9B0" opacity=".2"/><path d="M${x0 + bw * 0.2},${y0} L${x0 + bw * 0.8},${y0} L${x1 + bw},${y1} L${x1},${y1} Z" fill="#FFF2CC" opacity=".14"/>`;
  s += `<ellipse cx="${x1 + bw * 0.6}" cy="${y1 - 70}" rx="${bw * 1.2}" ry="40" fill="#FFE9B0" opacity=".22"/>`;
  // 梯子
  s += `<path d="M1100,760 L1180,160 M1170,760 L1250,160" stroke="#8A6440" stroke-width="10"/>` + Array.from({ length: 9 }, (_, i) => `<path d="M${1105 + i * 9},${700 - i * 66} L${1175 + i * 9},${700 - i * 66}" stroke="#8A6440" stroke-width="7"/>`).join('');
  return s;
};
/** 光里飘的灰尘（放在 fg）：beam 默认是 LIB_BEAM */
export const dustMotes = (seed: number, g: number, beam: [number, number, number, number, number] = LIB_BEAM, n = 46) => {
  const [x0, y0, x1, y1, bw] = beam, r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const t = r(), across = r(), cx = lerp(x0, x1, t) + across * lerp(bw, bw * 2, t) - bw * 0.2 * t + wav(g, 7 + r() * 6, r()) * 24, cy = lerp(y0, y1, t) + wav(g, 9 + r() * 5, r()) * 30 - ((g * (3 + r() * 4)) % 40); s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(1.2 + r() * 2.4)}" fill="#FFF6DA" opacity="${f(0.35 + 0.45 * Math.max(0, Math.sin(g * (0.8 + r()) + r() * 6)))}"/>`; }
  return s;
};
/** 周老师家：老式书架、墙上挂的旧照片（有一张班级合影）、蕾丝窗帘的窗、窗台上的花、台历。地面 y≈700。茶几用 teaTable，沙发、扶手椅用 seat / sitter */
export const zhouHomeBg = (id: string) => {
  let s = sky(id, '#E8D9BC', '#DCC9A6');
  for (let i = 0; i < 18; i++) s += `<path d="M${-200 + i * 110},-200 V700" stroke="#D4C09A" stroke-width="18" opacity=".35"/>`; // 竖条的旧墙纸
  s += `<rect x="-200" y="600" width="2000" height="100" fill="#B89A6E"/><path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#8A6A48"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M-200,${720 + i * 40} L1800,${720 + i * 40}" stroke="#7A5A3A" stroke-width="3" opacity=".5"/>`).join('');
  s += `<rect x="-180" y="160" width="360" height="540" fill="#5E4026" stroke="${INK}" stroke-opacity=".5" stroke-width="3"/>` + bookshelf(-166, 690, 332, 520, 9, 0.1) + `<rect x="-120" y="120" width="70" height="44" rx="6" fill="#4A4038"/><circle cx="-100" cy="142" r="12" fill="#8A8070"/><rect x="-74" y="132" width="16" height="20" fill="#2A2420"/>`; // 书架和旧收音机
  // 墙上的照片
  const fr = (fx: number, fy: number, w: number, h: number, inner: string) => `<rect x="${fx - 8}" y="${fy - 8}" width="${w + 16}" height="${h + 16}" fill="#5A3E26"/><rect x="${fx}" y="${fy}" width="${w}" height="${h}" fill="#C9B79A"/>${inner}`;
  s += fr(300, 140, 180, 120, `<g transform="translate(300,140) scale(.28)"><rect width="640" height="430" fill="#C9B79A"/>${[0, 1, 2].map((r) => Array.from({ length: 10 }, (_, i) => `<circle cx="${70 + i * 52}" cy="${140 + r * 70}" r="16" fill="#5E5446"/><rect x="${52 + i * 52}" y="${158 + r * 70}" width="36" height="50" fill="#4A5068"/>`).join('')).join('')}</g><rect x="300" y="140" width="180" height="120" fill="#9C7E52" opacity=".5" style="mix-blend-mode:color"/>`);
  s += fr(520, 110, 90, 120, `<circle cx="565" cy="160" r="22" fill="#7A6A58"/><rect x="540" y="182" width="50" height="48" fill="#5A5048"/>`) + fr(650, 150, 110, 80, `<path d="M650,230 L690,180 L720,210 L760,170 L760,230 Z" fill="#7A8A6A"/>`);
  // 窗
  s += `<rect x="1060" y="120" width="420" height="380" fill="#D8E6EC" stroke="#F2EAD8" stroke-width="16"/><path d="M1270,120 V500 M1060,310 H1480" stroke="#F2EAD8" stroke-width="10"/><path d="M1060,120 Q1110,300 1080,500 L1040,500 L1040,110 Z M1480,120 Q1430,300 1460,500 L1500,500 L1500,110 Z" fill="#F4EEE0" opacity=".92"/>` + Array.from({ length: 6 }, (_, i) => `<circle cx="${1070 + (i % 2) * 10}" cy="${160 + i * 60}" r="6" fill="none" stroke="#D8CDB4" stroke-width="2"/>`).join('');
  s += `<rect x="1040" y="500" width="460" height="20" fill="#B89A6E"/><path d="M1380,500 l-10,-50 h60 l-10,50 z" fill="#B8645A"/><circle cx="1400" cy="430" r="34" fill="#5E7A44"/><circle cx="1380" cy="410" r="12" fill="#E85A6A"/><circle cx="1418" cy="420" r="10" fill="#F2C14E"/>`;
  s += `<rect x="860" y="260" width="110" height="140" fill="#F4F1E8" stroke="#8A7E6A" stroke-width="3"/><rect x="860" y="260" width="110" height="34" fill="#B8322A"/><text x="915" y="286" font-size="20" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>2026</text><text x="915" y="360" font-size="56" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>15</text>`;
  return s;
};
/** 茶几：x、y 是茶几脚落地的中点；茶壶、cups 个茶杯（默认 3），steam 冒热气（要 g 才会动） */
export const teaTable = (x: number, y: number, s = 1, g = 0, o: { cups?: number; steam?: boolean } = {}) => {
  const n = o.cups ?? 3; let c = '';
  for (let i = 0; i < n; i++) { const cx = -40 + i * 70; c += `<ellipse cx="${cx + 60}" cy="-98" rx="20" ry="5" fill="#F4F1EA" stroke="${INK}" stroke-opacity=".5"/><path d="M${cx + 48},-100 L${cx + 50},-120 L${cx + 70},-120 L${cx + 72},-100 Z" fill="#F4F1EA" stroke="${INK}" stroke-opacity=".5"/><path d="M${cx + 50},-114 h20" stroke="#4A7A9A" stroke-width="2.4"/>`; if (o.steam ?? true) for (let k = 0; k < 2; k++) { const t = (g * 0.35 + k / 2 + i * 0.3) % 1; c += `<path d="M${cx + 56 + k * 8},${f(-126 - t * 40)} q6,-8 0,-16" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="${f(0.6 * Math.sin(t * Math.PI))}" stroke-linecap="round"/>`; } }
  return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><ellipse cx="0" cy="4" rx="190" ry="16" fill="#000" opacity=".18"/><rect x="-170" y="-96" width="340" height="18" rx="4" fill="#6E4428" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><rect x="-150" y="-80" width="14" height="80" fill="#5A3820"/><rect x="136" y="-80" width="14" height="80" fill="#5A3820"/><rect x="-150" y="-40" width="300" height="8" fill="#5A3820"/>` +
    `<g transform="translate(-110,-96)"><ellipse cx="0" cy="-30" rx="34" ry="30" fill="#7A3A2A" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><path d="M30,-38 q24,-8 30,-26" stroke="#7A3A2A" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M-32,-40 q-20,0 -18,20 q2,10 14,8" stroke="#7A3A2A" stroke-width="6" fill="none"/><ellipse cx="0" cy="-58" rx="16" ry="5" fill="#6A3022"/><circle cx="0" cy="-64" r="5" fill="#6A3022"/></g>${c}</g>`;
};
/** 1996 年的旧课桌（双人桌，木桌面、铁架子）：x、y 是桌腿落地的中点，桌面高 130×s。坐在后面的人用 seat('desk96', …) */
export const desk96 = (x: number, y: number, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-130" y="-132" width="260" height="16" fill="#B8864E" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/><rect x="-124" y="-116" width="248" height="40" fill="#9A6E40" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M-118,-116 L-118,0 M118,-116 L118,0 M-118,-30 L118,-30" stroke="#3E4448" stroke-width="7"/><path d="M-60,-128 l40,2" stroke="#7A5232" stroke-width="2" opacity=".6"/></g>`;
/** 吊扇（1996 年的教室顶上）：x、y 是吊杆顶端；一直在转 */
export const ceilingFan = (x: number, y: number, s = 1, g = 0) => { const a = g * 5; return `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M0,0 V60" stroke="#5A5A5A" stroke-width="5"/><ellipse cx="0" cy="66" rx="18" ry="8" fill="#6E6E6E"/>${[0, 1, 2].map((i) => { const c = Math.cos(a + (i * Math.PI * 2) / 3); return `<path d="M0,66 L${f(c * 150)},${f(70 + Math.sin(a + (i * Math.PI * 2) / 3) * 10)}" stroke="#7E7E78" stroke-width="${f(10 + Math.abs(Math.sin(a + (i * Math.PI * 2) / 3)) * 8)}" stroke-linecap="round"/>`; }).join('')}</g>`; };
/** 1996 年的教室：黑板（粉笔字）、上面的红标语、墙裙刷成绿色、木框窗、日光灯、远处一排旧课桌。地面 y≈720。
 *  board 黑板上的粉笔字（默认 'June 27, 1996' 和 'Graduation Show'）。回忆镜头记得再盖 tint96 */
export const classroom96Bg = (id: string, o: { board?: string[] } = {}) => {
  let s = sky(id, '#EAE4D2', '#E0D8C2');
  s += `<rect x="-200" y="430" width="2000" height="290" fill="#6E9A84"/><rect x="-200" y="424" width="2000" height="10" fill="#4E7A64"/>`; // 绿色墙裙
  s += `<path d="M-200,720 L1800,720 L1800,1100 L-200,1100 Z" fill="#9A9488"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M-200,${740 + i * 50} L1800,${740 + i * 50}" stroke="#86807A" stroke-width="2" opacity=".6"/>`).join('');
  s += `<rect x="300" y="60" width="760" height="44" fill="#B8322A"/><text x="680" y="92" font-size="26" font-weight="900" fill="#FFE9A8" text-anchor="middle" letter-spacing="8" ${SANS}>好好学习 · 天天向上</text>`;
  s += `<rect x="250" y="130" width="860" height="330" fill="#2E3A34" stroke="#8A6A44" stroke-width="14"/><rect x="250" y="456" width="860" height="14" fill="#8A6A44"/>`;
  const lines = o.board ?? ['June 27, 1996', 'Graduation Show', 'Class 3, Grade 9'];
  s += lines.map((t, i) => `<text x="${i === 0 ? 1070 : 300}" y="${200 + i * 80}" font-size="${i === 1 ? 54 : 38}" fill="#EDEDE4" text-anchor="${i === 0 ? 'end' : 'start'}" opacity=".9" ${HAND}>${esc(t)}</text>`).join('');
  s += `<rect x="260" y="448" width="40" height="8" fill="#F4F4EE"/><rect x="320" y="448" width="26" height="8" fill="#E8C0C0"/>`;
  [[-150, 150], [1250, 150]].forEach(([wx, wy]) => { s += `<rect x="${wx}" y="${wy}" width="300" height="260" fill="#CFE0E6" stroke="#8A6A44" stroke-width="12"/><path d="M${wx + 150},${wy} V${wy + 260} M${wx},${wy + 130} H${wx + 300}" stroke="#8A6A44" stroke-width="7"/>`; });
  s += [460, 900].map((lx) => `<rect x="${lx}" y="10" width="200" height="12" rx="6" fill="#F4F4EE" stroke="#9A9A94" stroke-width="2"/><path d="M${lx + 20},0 V10 M${lx + 180},0 V10" stroke="#7A7A74" stroke-width="2"/>`).join('');
  s += `<g opacity=".8">${desk96(200, 720, 0.8)}${desk96(560, 720, 0.8)}${desk96(920, 720, 0.8)}${desk96(1280, 720, 0.8)}</g>`;
  s += `<rect x="1240" y="300" width="110" height="80" fill="#F4F1E8" stroke="#8A7E6A" stroke-width="2"/><rect x="1240" y="300" width="110" height="22" fill="#B8322A"/><text x="1295" y="317" font-size="15" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>1996 · 6</text><text x="1295" y="366" font-size="38" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>27</text>`;
  return s;
};
/** 校庆礼堂（正面）：舞台背景板上大大的“60”和 1966—2026、红幕、台前的花、两边的灯。舞台台口 y≈520，地面从 560 开始。
 *  观众（后脑勺）用 shotsE1 的 audience；第一排侧面看用 hall60Side */
export const hall60Bg = (id: string) => {
  let s = sky(id, '#E6D6B8', '#D6C29C');
  s += `<path d="M-200,-200 L240,40 L240,560 L-200,760 Z" fill="#CDB68E"/><path d="M1800,-200 L1360,40 L1360,560 L1800,760 Z" fill="#CDB68E"/>`;
  s += `<rect x="240" y="40" width="1120" height="480" fill="#8E2A26"/>`;
  s += `<rect x="380" y="110" width="840" height="330" fill="#A8322A" stroke="${GOLD}" stroke-width="6"/>`;
  s += `<text x="800" y="345" font-size="185" font-weight="900" fill="${GOLD}" text-anchor="middle" ${SERIF}>60</text><text x="800" y="428" font-size="38" font-weight="700" fill="#FFE9A8" text-anchor="middle" letter-spacing="6" ${SERIF}>1966 — 2026</text><text x="800" y="150" font-size="32" font-weight="700" fill="#FFE9A8" text-anchor="middle" letter-spacing="3" ${SANS}>HAPPY 60TH ANNIVERSARY</text>`;
  s += `<path d="M240,40 Q300,260 280,530 L400,530 Q370,260 420,40 Z" fill="#9E2E2A"/><path d="M1360,40 Q1300,260 1320,530 L1200,530 Q1230,260 1180,40 Z" fill="#9E2E2A"/><path d="M240,40 L1360,40 L1360,90 Q800,124 240,90 Z" fill="#7A221F"/>`;
  s += `<path d="M220,520 L1380,520 L1420,560 L180,560 Z" fill="#8C6440"/>`;
  const r = rng(91); for (let i = 0; i < 30; i++) s += `<circle cx="${f(300 + r() * 1000)}" cy="${f(506 + r() * 18)}" r="${f(9 + r() * 6)}" fill="${['#E85A6A', '#F2C14E', '#F4F1E8', '#E8833A'][Math.floor(r() * 4)]}"/>`;
  s += `<path d="M-200,560 L1800,560 L1800,1100 L-200,1100 Z" fill="#B78C5C"/>` + Array.from({ length: 14 }, (_, i) => `<path d="M${f(800 + (i - 6.5) * 70)},560 L${f(800 + (i - 6.5) * 280)},1100" stroke="#9C7448" stroke-width="2" opacity=".5"/>`).join('');
  return s;
};
/** 礼堂里侧面看第一排：左边是窗和墙，右边是舞台（红幕、条幅一角写着 60）。地面 y≈720；第一排的人用 sitter(…, { kind: 'hall' }) */
export const hall60Side = (id: string) =>
  sky(id, '#DCCAA8', '#CDB892') + Array.from({ length: 3 }, (_, i) => `<rect x="${-60 + i * 400}" y="100" width="240" height="220" fill="#C9DCE2" stroke="#B7A27C" stroke-width="10"/>`).join('') +
  `<rect x="1240" y="-200" width="600" height="760" fill="#8E2A26"/><path d="M1240,-200 Q1210,200 1250,620 L1300,620 Q1270,200 1300,-200 Z" fill="#9E2E2A"/><rect x="1330" y="140" width="400" height="200" fill="#A8322A" stroke="${GOLD}" stroke-width="5"/><text x="1440" y="290" font-size="140" font-weight="900" fill="${GOLD}" text-anchor="middle" ${SERIF}>60</text>` +
  `<rect x="1220" y="560" width="600" height="70" fill="#8C6440"/><rect x="-200" y="620" width="2000" height="480" fill="#B78C5C"/>`;

// ---------------- 检查用的底子 ----------------
const floorBg = (id: string) => sky(id, '#EDE4D0', '#DCD0B4') + `<path d="M-200,760 L1800,760 L1800,1100 L-200,1100 Z" fill="#B99A72"/><path d="M-200,760 L1800,760" stroke="#9A7E5A" stroke-width="3"/>`;
const tableTop = (id: string) => sky(id, '#7A5236', '#6A4428') + Array.from({ length: 9 }, (_, i) => `<path d="M-200,${i * 120 - 40} Q800,${i * 120 - 10} 1800,${i * 120 - 40}" stroke="#5E3E26" stroke-width="3" opacity=".4" fill="none"/>`).join('');
const lbl = (x: number, y: number, t: string) => `<text x="${x}" y="${y}" font-size="30" font-weight="900" fill="${INK}" text-anchor="middle" ${SANS}>${t}</text>`;
const CAST: [string, number][] = [['tao', 1], ['hu', 1], ['gao', -1], ['zhou', 1], ['fang', 1], ['yu', -1], ['fang2', 1], ['yu2', -1], ['worker', 1]];

export const SHOTS_CAP: Record<string, ShotDef> = {
  // ---------- 共用镜头 ----------
  // 章节标题页的底图：老银杏树下，叶子一片片落（标题字盖在正中，画面中间不放东西）
  'tc.title': {
    bg: (id) => sky(id, '#D7E3E6', '#F2E2BE') + `<path d="M-200,700 L1800,700 L1800,1100 L-200,1100 Z" fill="#CDBFA0"/>` + `<g opacity=".5">${campusBuildingsFar()}</g>` + ginkgoTree(1200, 760, 0.86, { seed: 11 }) + leafCarpet(83, 300, 1700, 712, 900, 120),
    fg: (u, g) => ginkgoFall(5, g, { x0: 200, x1: 1600, n: 22, wind: -160 }) + ginkgoFall(6, g, { x0: 900, x1: 1500, n: 8, s: 1.5, a: 0.9 }),
    cam: [[820, 450, 1600], [840, 440, 1480]],
  },
  // 目录封面（按 16:5 横条裁切，主体在中间一条 y 260—640）：银杏树下挖开的土里露出半开的铁盒，盒里透出一点光
  'tc.cover': {
    bg: (id) => sky(id, '#D6E2E2', '#F0DDB2') + `<g opacity=".45">${campusBuildingsFar()}</g>` + `<path d="M-200,380 Q800,360 1800,390 L1800,1100 L-200,1100 Z" fill="#B9A882"/>` + leafCarpet(84, -100, 1700, 390, 900, 220) + ginkgoTree(250, 640, 1.35, { seed: 12 }),
    fg: (u, g, id) => {
      let o = `<ellipse cx="830" cy="560" rx="300" ry="96" fill="#8A6844"/><ellipse cx="830" cy="560" rx="272" ry="84" fill="#3A2A1E"/><path d="M558,560 A272,84 0 0 1 1102,560 L1080,580 A250,70 0 0 0 580,580 Z" fill="#5A4030"/>`;
      o += `<clipPath id="${id}cv"><path d="M540,200 L1120,200 L1120,560 A290,90 0 0 1 540,560 Z"/></clipPath><g clip-path="url(#${id}cv)">${tinBox(id, 790, 700, 1.12, { lid: 0.3, label: false, glow: 1, g, dirt: 0.8, ky: 0.5 })}</g>`;
      o += `<path d="M540,560 A290,90 0 0 0 1120,560" stroke="#7A5838" stroke-width="18" fill="none"/>` + leafCarpet(85, 520, 1150, 610, 690, 40);
      o += `<path d="M1150,600 Q1240,470 1330,476 Q1420,490 1470,610 Z" fill="#7E5C3A"/>` + shovel(1300, 560, 0.95, 20) + glow(id, 830, 470, 230, g, 0, 0.32 + 0.08 * Math.sin(g * 1.5)) + ginkgoFall(7, g, { x0: 300, x1: 1500, y0: 140, y1: 700, n: 16, wind: 80 });
      return o;
    },
    cam: [[820, 450, 1600], [830, 460, 1500]],
  },
  // ---------- 检查：人物 ----------
  'tc.cast': {
    bg: (id) => floorBg(id),
    fg: (u, g) => CAST.map(([who, fc], i) => { const x = 100 + i * 175; return person({ x, y: 760, s: 2.05, who, pose: who === 'worker' ? { ...P.stand(), aF: 40, eF: 30, aB: 30, eB: 40 } : P.stand(), g, face: fc as 1 | -1, detail: true, mood: who === 'zhou' ? 'laugh' : 'calm', hold: who === 'worker' ? 'shovel' : who === 'yu' ? 'musicbox' : who === 'hu' ? 'letter' : undefined }) + lbl(x, 830, who); }).join(''),
    cam: [[800, 470, 1600], [800, 470, 1600]],
  },
  'tc.faces1': {
    bg: (id) => sky(id, '#E8DCC2', '#D9C8A6'),
    fg: (u, g, id) => (['tao', 'hu', 'gao', 'zhou', 'worker'] as const).map((who, i) => `<g>${faceCU({ id, x: 170 + i * 315, y: 420, s: 0.46, who, g, mouth: who === 'zhou' ? 0.7 : 0.2, brow: who === 'gao' ? 0.2 : 0 })}</g>` + lbl(170 + i * 315, 650, who)).join(''),
    cam: [[800, 450, 1600], [800, 450, 1600]],
  },
  'tc.faces2': {
    bg: (id) => sky(id, '#E8DCC2', '#D9C8A6'),
    fg: (u, g, id) => (['fang', 'yu', 'fang2', 'yu2'] as const).map((who, i) => faceCU({ id, x: 230 + i * 380, y: 420, s: 0.5, who, g, mouth: 0.3, brow: who === 'fang' ? 0.6 : 0 }) + lbl(230 + i * 380, 660, who)).join(''),
    cam: [[800, 450, 1600], [800, 450, 1600]],
  },
  // 手里拿的东西（hold）
  'tc.holds': {
    bg: (id) => floorBg(id),
    fg: (u, g) => person({ x: 170, y: 780, s: 2.4, who: 'worker', pose: { ...P.stand(), lean: 14 + 8 * Math.sin(g * 2), aF: 50, eF: 30, aB: 40, eB: 50 }, g, hold: 'shovel', detail: true }) +
      person({ x: 520, y: 780, s: 2.6, who: 'yu', pose: P.give(0.5), g, hold: 'musicbox', detail: true }) + person({ x: 780, y: 780, s: 2.6, who: 'fang', pose: P.give(0.7), g, hold: 'key', detail: true }) +
      person({ x: 1020, y: 780, s: 2.6, who: 'tao', pose: P.give(0.6), g, hold: 'envPink', detail: true, mood: 'laugh' }) + person({ x: 1260, y: 780, s: 2.6, who: 'zhou', pose: { ...P.stand(), aF: 60, eF: 70 }, g, hold: 'teacup', detail: true, mood: 'laugh' }) + person({ x: 1480, y: 780, s: 2.6, who: 'hu', pose: P.give(0.5), g, hold: 'tin', face: -1, detail: true }),
    cam: [[800, 470, 1600], [800, 470, 1600]],
  },
  'tc.sit': {
    bg: (id) => zhouHomeBg(id),
    fg: (u, g) => sitter('zhou', 330, 860, 2.0, g, { kind: 'arm', hold: 'teacup', pose: { ...P.sitRest(), aF: 60, eF: 70 }, mood: 'laugh' }) + teaTable(720, 860, 1.3, g) + sitter('tao', 1060, 860, 1.9, g, { kind: 'sofa', face: -1 }) + sitter('hu', 1360, 860, 1.9, g, { kind: 'chair', face: -1, hold: 'photo', pose: { ...P.sitRest(), aF: 60, eF: 60 } }),
    cam: [[800, 520, 1600], [800, 520, 1500]],
  },
  // 近景脸（各人一镜，和 Golden Panda 的 e.greenCU 一样大）
  ...Object.fromEntries((['tao', 'hu', 'gao', 'zhou', 'fang', 'yu', 'fang2', 'yu2', 'worker'] as const).map((who) => [`tc.cu.${who}`, {
    bg: (id: string) => sky(id, '#D9CBB0', '#C9B48E'),
    fg: (u: number, g: number, id: string) => faceCU({ id, x: 760, y: 470, s: 1.2, who, g, mouth: lerp(0, 0.8, seg(u, 0.3, 0.7)), brow: lerp(0, 0.6, seg(u, 0.6, 1)), look: 0.2 }),
    cam: [[780, 470, 1200], [790, 450, 1050]],
  } as ShotDef])),
  // ---------- 检查：道具 ----------
  'tc.props': {
    bg: (id) => tableTop(id),
    fg: (u, g, id) => tinBox(id, 230, 380, 0.8, { g }) + envelope(560, 170, 0.62, 'pink', { rot: -8 }) + envelope(560, 300, 0.62, 'blue', { rot: 5 }) + envelope(560, 430, 0.62, 'white', { front: true, text: 'To the students of 2026' }) +
      letter(id, 780, 60, 0.5, { lines: FANG_LETTER, smudge: 6 }) + brassKey(760, 640, 0.9, { rot: -60, g, glint: 1 }) + musicBox(id, 1330, 420, 0.95, { lid: 1, spin: g * 0.4, notes: 1, g }) +
      classPhoto(id, 40, 520, 0.5) + yearbook(1080, 720, 0.42) + cassette(1400, 720, 0.6, { g, spin: true }) + shovel(1560, 860, 0.8, -20),
    cam: [[800, 450, 1600], [800, 450, 1600]],
  },
  'tc.truck': {
    bg: (id) => floorBg(id) + `<rect x="-200" y="300" width="2000" height="460" fill="#D8C8B0"/>` + Array.from({ length: 8 }, (_, i) => `<rect x="${-100 + i * 230}" y="360" width="120" height="140" fill="#B8C8D0" stroke="#F4EEE4" stroke-width="6"/>`).join(''),
    fg: (u, g) => movingTruck(lerp(700, 1900, seg(u, 0.2, 1)), 800, 1, { g: u > 0.2 ? g : 0 }) + person({ x: lerp(-100, 520, seg(u, 0.3, 0.9)), y: 800, s: 1.8, who: 'fang', pose: u < 0.9 ? P.walk(g * 2, 1.4) : P.point(1), g, hold: u < 0.9 ? 'envPink' : undefined }),
    cam: [[800, 450, 1600], [800, 450, 1600]],
  },
  'tc.box': {
    bg: (id) => tableTop(id),
    fg: (u, g, id) => tinBox(id, 760, 640, 1.6, { lid: seg(u, 0.05, 0.55), lining: seg(u, 0.7, 1), glow: 0.4 * seg(u, 0.2, 0.6), g }),
    cam: [[820, 450, 1400], [820, 430, 1200]],
  },
  'tc.lining': {
    bg: (id) => tableTop(id),
    fg: (u, g, id) => tinBox(id, 760, 700, 1.7, { lid: 1, inside: 'empty', lining: seg(u, 0.2, 0.9), ky: 0.95, g }),
    cam: [[800, 450, 1400], [800, 420, 1150]],
  },
  'tc.lid': {
    bg: (id) => sky(id, '#8A6844', '#6A4E32'),
    fg: (u, g) => tinTop(800, 450, 1.3, { dirt: 1 - seg(u, 0.2, 0.9) }),
    cam: [[800, 450, 1200], [800, 450, 1080]],
  },
  'tc.letter': {
    bg: (id) => tableTop(id),
    fg: (u, g, id) => letter(id, 520, 30, 0.95, { lines: FANG_LETTER, smudge: 6, wet: seg(u, 0.3, 0.9), w: 760, size: 30, hl: u < 0.3 ? 1 : undefined }),
    cam: [[880, 450, 1600], [880, 450, 1600]],
  },
  'tc.mbox': {
    bg: (id) => sky(id, '#3A2E2A', '#2A2220'),
    fg: (u, g, id) => { const spinT = Math.max(0, u - 0.55); return glow(id, 800, 420, 360, g, 0, 0.35) + musicBox(id, 800, 700, 2.2, { lid: seg(u, 0.05, 0.4), keyIn: seg(u, 0.35, 0.5), turn: seg(u, 0.5, 0.6) * 2, spin: spinT * 6 + (u > 0.6 ? g * 0.35 : 0), notes: seg(u, 0.6, 0.8), g }); },
    cam: [[800, 450, 1400], [800, 420, 1200]],
  },
  'tc.photo': {
    bg: (id) => tableTop(id),
    fg: (u, g, id) => classPhoto(id, 160, 110, 2, { fangLook: seg(u, 0.5, 0.8), mark: u > 0.2 ? 'both' : undefined, markK: seg(u, 0.2, 0.45) }),
    cam: [[800, 450, 1600], [870, 380, 900]],
  },
  'tc.photoBack': {
    bg: (id) => tableTop(id),
    fg: (u) => photoBack(160, 110, 2, { mark: 'both', markK: seg(u, 0.3, 0.8) }),
    cam: [[800, 450, 1600], [800, 450, 1500]],
  },
  'tc.yearbook': {
    bg: (id) => tableTop(id),
    fg: (u) => yearbook(800, 450, 1.3, { open: seg(u, 0.1, 0.6) }),
    cam: [[800, 450, 1600], [620, 450, 1250]],
  },
  // ---------- 检查：环境 ----------
  'tc.campus': {
    bg: (id) => campusBg(id),
    fg: (u, g, id) => digPit(id, 980, 790, 340, { k: seg(u, 0, 0.5), box: seg(u, 0.55, 1), g }) + person({ x: 1260, y: 800, s: 1.6, who: 'worker', pose: { ...P.stand(), lean: 18 + 10 * Math.sin(g * 2), aF: 50, eF: 30, aB: 40, eB: 50 }, g, face: -1, hold: 'shovel' }) +
      person({ x: 560, y: 790, s: 1.5, who: 'hu', pose: P.point(seg(u, 0.6, 0.8)), g }) + person({ x: 420, y: 800, s: 1.5, who: 'tao', pose: P.stand(), g }) + person({ x: 300, y: 800, s: 1.48, who: 'you', pose: P.stand(), g }) + ginkgoFall(8, g, { x0: 600, x1: 1600, n: 14 }),
    cam: [[800, 450, 1600], [840, 500, 1460]],
  },
  'tc.club': {
    bg: (id) => clubRoomBg(id),
    fg: (u, g, id) => person({ x: 520, y: 760, s: 1.7, who: 'hu', pose: P.stand(), g, face: 1 }) + person({ x: 1080, y: 760, s: 1.7, who: 'tao', pose: P.stand(), g, face: -1 }) + longTable(800, 640, 980) + tinBox(id, 760, 640, 0.75, { lid: 1, g }) + envelope(1060, 628, 0.32, 'pink', { rot: 10 }),
    cam: [[800, 450, 1600], [780, 460, 1500]],
  },
  'tc.library': {
    bg: (id) => libraryBg(id),
    fg: (u, g) => dustMotes(1, g) + person({ x: 1000, y: 790, s: 1.6, who: 'gao', pose: { ...P.stand(), aF: 150, eF: 10 }, g, face: 1, hold: 'yearbook' }) + person({ x: 700, y: 780, s: 1.6, who: 'tao', pose: P.stand(), g }),
    cam: [[800, 450, 1600], [760, 440, 1400]],
  },
  'tc.home': {
    bg: (id) => zhouHomeBg(id),
    fg: (u, g) => sitter('zhou', 420, 880, 1.9, g, { kind: 'arm', hold: 'teacup', mood: 'calm', pose: { ...P.sitRest(), aF: 60, eF: 70 } }) + teaTable(820, 880, 1.25, g) + person({ x: 1180, y: 880, s: 1.9, who: 'you', pose: P.stand(), g, face: -1 }),
    cam: [[800, 470, 1600], [700, 500, 1400]],
  },
  'tc.class96': {
    bg: (id) => classroom96Bg(id),
    fg: (u, g, id, v) => ceilingFan(800, -40, 1, g) + desk96(560, 880, 1.25) + seat('desk96', 560 - 70, 880, 1.6, 1) + person({ x: 490, y: 880, s: 1.6, who: 'yu', pose: P.sitRest(), g }) + musicBox(id, 640, 715, 0.34, { lid: 1, spin: g * 0.4, g }) +
      person({ x: lerp(1500, 980, seg(u, 0, 0.7)), y: 880, s: 1.75, who: 'fang', pose: u < 0.7 ? { ...P.walk(g * 1.4), aF: 70, eF: 70 } : { ...P.stand(), aF: 70, eF: 70 }, g, face: -1, hold: 'yearbook' }) + tint96(id, v, { g }),
    cam: [[800, 450, 1600], [800, 470, 1500]],
  },
  'tc.hall60': {
    bg: (id) => hall60Bg(id),
    fg: (u, g) => audience(13, g, { rows: 4, y0: 640 }),
    cam: [[800, 460, 1600], [800, 400, 1300]],
  },
  'tc.hallSide': {
    bg: (id) => hall60Side(id),
    fg: (u, g) => sitter('fang2', 520, 860, 1.9, g, { kind: 'hall' }) + sitter('hu', 860, 860, 1.9, g, { kind: 'hall' }) + person({ x: lerp(1500, 1180, seg(u, 0.2, 0.8)), y: 860, s: 1.9, who: 'yu2', pose: u < 0.8 ? P.walk(g * 1.2, 0.8) : P.stand(), g, face: -1, hold: 'musicbox' }),
    cam: [[800, 470, 1600], [900, 500, 1400]],
  },
};
/** 远处一排楼（标题页用） */
function campusBuildingsFar() { let s = `<rect x="-100" y="420" width="900" height="290" fill="#D8C8B0"/>`; for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) s += `<rect x="${-70 + c * 96}" y="${450 + r * 80}" width="54" height="48" fill="#B8C8D0"/>`; return s; }
