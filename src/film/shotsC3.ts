// 英文故事二 The Time Capsule · Chapter 3：每一镜怎么画、怎么动（共用的人物外形在 rig.ts 的 LOOKS，共用的道具、环境、旧照片色调在 capsule.ts）
// 现在：周老师家（zhouHomeBg、扶手椅、茶几），铁盒、衬布、粉 / 蓝两个信封。
// 1996 年的回忆（capsule 的 tint96：发黄、颗粒、四角压暗、左上角年份）：教室排练、吵架、八音盒被碰掉、钥匙滚到柜子底下、
// 直到 6 月 27 日才找到钥匙、6 月 28 日埋胶囊、七月 Fang 赶到 Yu 家——已经搬走了。和第一章 Fang 的信对得上：两周前、音乐停了、钥匙飞了。
// 拓展小视频：tc3.clipUntil（直到 27 号才找到）、tc3.clipHad / whenMoved / whenMoving（过去完成时和一般过去时、过去进行时比）、
// tc3.accidentDemo / purposeDemo（不小心 / 故意）。
import { INK, SKIN, f, glow, lerp, pin, seg, sky, snow, type View } from './core';
import { LOOKS, P, faceCU, person, type Pose } from './rig';
import { HAND, SANS, brassKey, ceilingFan, classPhoto, classroom96Bg, desk96, envelope as capEnv, ginkgoLeaf, ginkgoTree, letter, movingTruck, musicBox as capBox, notes, seat, sitter, teaTable, tinBox, tint96, zhouHomeBg } from './capsule';
import { aiGlasses } from './shotsE1';
import type { ShotDef } from './Film';

const talk = (g: number, k = 1) => (Math.sin(g * 11) * 0.5 + 0.5) * 0.6 * k;
const R = (x: number, y: number, w: number, h: number, fill: string, extra = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${extra}/>`;

// ---------------- 1996 年的路人（同学、年轻的周老师、搬家工人），只在这一章用 ----------------
Object.assign(LOOKS, {
  c3zhou96: { robe: '#6E6250', robe2: '#5C5242', pants: '#46423C', hair: 'short', hairC: '#231C18', inner: '#E6DFCF', modern: true, sleeve: 'tight', shoe: '#3A2E26', belt: '#6E6250', tall: 1.02 },
  c3boy96: { robe: '#29457E', robe2: '#22396A', pants: '#29457E', hair: 'short', hairC: '#1E1814', retro: '#F2EFE4', modern: true, sleeve: 'tight', shoe: '#E8E4D8', belt: '#29457E' },
  c3boy96b: { robe: '#29457E', robe2: '#22396A', pants: '#29457E', hair: 'tousled', hairC: '#231C18', retro: '#F2EFE4', modern: true, sleeve: 'tight', shoe: '#E8E4D8', belt: '#29457E', tall: 1.03 },
  c3girl96: { robe: '#29457E', robe2: '#22396A', pants: '#29457E', hair: 'pony', hairC: '#1E1814', retro: '#F2EFE4', modern: true, sleeve: 'tight', shoe: '#E8E4D8', belt: '#29457E', tall: 0.96 },
  c3mover: { robe: '#7E7A66', robe2: '#6A6654', pants: '#4A4A42', hair: 'short', hairC: '#2A221C', modern: true, sleeve: 'bare', shoe: '#3A3028', belt: '#4A4A42', wide: 1.1 },
});

// ---------------- 手在哪儿（和 rig.ts 的算法一样，给道具找位置） ----------------
const rad = (d: number) => (d * Math.PI) / 180;
const shoulder = (who: string, p: Pose) => {
  const L = LOOKS[who] ?? LOOKS.crowd1, tall = L.tall ?? 1, T = 46 * tall, S = 46 * tall, TOR = 60 * tall;
  const leg = (l: number, k: number) => { const kn = [Math.sin(rad(l)) * T, Math.cos(rad(l)) * T]; return [kn, [kn[0] + Math.sin(rad(l - k)) * S, kn[1] + Math.cos(rad(l - k)) * S]]; };
  const [a, b] = leg(p.lF, p.kF), [c, d] = leg(p.lB, p.kB);
  const hipY = -Math.max(a[1], b[1], c[1], d[1]) + (p.dy ?? 0) - 4, lean = p.lean + (L.stoop ?? 0);
  return [Math.sin(rad(lean)) * TOR, hipY - Math.cos(rad(lean)) * TOR];
};
/** 手腕的位置（世界坐标） */
const wrist = (who: string, p: Pose, x: number, y: number, s = 1, fc: 1 | -1 = 1) => {
  const sh = shoulder(who, p), el = [sh[0] + Math.sin(rad(p.aF)) * 33, sh[1] + Math.cos(rad(p.aF)) * 33], wr = [el[0] + Math.sin(rad(p.aF + p.eF)) * 31, el[1] + Math.cos(rad(p.aF + p.eF)) * 31];
  return [x + wr[0] * s * fc, y + wr[1] * s];
};

// ---------------- 姿势 ----------------
const carry = (ph: number, k = 0.8): Pose => ({ ...P.walk(ph, k), aF: 62, eF: 72, aB: 56, eB: 78, head: -2 }); // 抱着一摞书走
const sitReach = (k: number): Pose => ({ ...P.sitRest(), aF: lerp(22, 74, k), eF: lerp(62, 8, k) }); // 坐着，伸手递过去
const sitWrite = (g: number): Pose => ({ ...P.sit(), lean: 14, head: 16, aF: 52 + 3 * Math.sin(g * 12), eF: 50, aB: 48, eB: 50 });
const sitHug = (head = 20): Pose => ({ ...P.sitRest(), lean: 10, head, aF: 50, eF: 60, aB: 46, eB: 64 }); // 坐着，把八音盒抱在胸前
const knock = (g: number, k = 1): Pose => ({ ...P.stand(), aF: 78, eF: 58 + 22 * Math.max(0, Math.sin(g * 9)) * k, head: -2 });
const kneelUp = (k: number): Pose => ({ lean: 10, head: -10, aF: lerp(60, 120, k), eF: lerp(30, 20, k), aB: 20, eB: 40, lF: 64, kF: 154, lB: 56, kB: 146 }); // 跪着，把找到的东西举起来

// ---------------- 色调、标签 ----------------
/** 1996 年的回忆：统一用 capsule 的旧照片色调（左上角钉年份） */
const old96 = (id: string, v: View | undefined, g: number, t: string | false = '1996') => tint96(id, v, { year: t, g });
const tagSvg = (t: string) => { const w = 34 + t.length * 21; return `<g><rect x="${-w / 2}" y="-44" width="${w}" height="60" rx="10" fill="#7A1E1E" opacity=".8"/><text x="0" y="0" font-size="36" font-weight="900" fill="#FFE9A8" text-anchor="middle" ${SANS}>${t}</text></g>`; };
/** 钉在画面上的标签（地方、春节） */
const tag = (v: View | undefined, t: string, fx = 0.14, fy = 0.1) => pin(v, fx, fy, tagSvg(t), fx * 1600, fy * 900);

// ---------------- 道具（共用的从 capsule 来，这里包一层，参数和这一章的用法对上） ----------------
/** 八音盒：x、y 是正面底边中点；s 按盒宽 240 算；play 小人转、音符飘；hasKey 上弦钥匙插在侧面 */
const mbox = (id: string, x: number, y: number, s: number, g: number, o: { open?: number; play?: boolean; hasKey?: boolean; rot?: number } = {}) =>
  capBox(id, x, y, s, { lid: o.open ?? 1, spin: o.play ? g * 0.4 : undefined, notes: o.play ? 1 : 0, g, keyIn: o.hasKey === false ? 0 : 1, rot: o.rot });
/** 信封（背面）；text 写在上面的大字（一个字母一个字母写出来） */
const env = (x: number, y: number, s: number, kind: 'pink' | 'blue', o: { rot?: number; text?: string; reveal?: number } = {}) =>
  capEnv(x, y, s, kind, { rot: o.rot }) + (o.text ? `<g transform="translate(${f(x)},${f(y)}) rotate(${f(o.rot ?? 0)}) scale(${f(s)})"><text x="0" y="62" font-size="56" fill="#2B3A6E" text-anchor="middle" ${HAND}>${o.text.slice(0, Math.round((o.reveal ?? 1) * o.text.length))}</text></g>` : '');
/** 1996 年教室：capsule 的教室；黑板上写什么由 board 给（[] 是擦干净的黑板） */
/** capsule 教室窗前原有一本写着 27 号的日历：用窗框、玻璃的颜色盖掉（各镜的日子不一样，日历另画在黑板右边） */
const class96 = (id: string, board?: string[]) => classroom96Bg(id, board ? { board } : {}) + R(1232, 292, 14, 96, '#E6DFCB') + R(1244, 292, 12, 96, '#8A6A44') + R(1256, 292, 102, 96, '#CFE0E6');
/** 没有字的教室（近景脸的背景） */
const classPlain = (id: string) => sky(id, '#EAE4D2', '#E0D8C2') + R(-200, 430, 2000, 290, '#6E9A84') + R(250, 130, 860, 330, '#2E3A34', 'stroke="#8A6A44" stroke-width="14"') + R(-200, 720, 2000, 500, '#9A9488');
/** 教室墙上的日历（黑板右边）：日子由这一镜定，s 放大 */
const cal96 = (day: number, s = 0.9, x = 1178, y = 330) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-62" y="-48" width="124" height="96" fill="#F4F1E8" stroke="#8A7E6A" stroke-width="2.5"/><rect x="-62" y="-48" width="124" height="26" fill="#B8322A"/><text x="0" y="-29" font-size="17" font-weight="900" fill="#fff" text-anchor="middle" ${SANS}>JUNE 1996</text><text x="0" y="38" font-size="56" font-weight="900" fill="#2B2722" text-anchor="middle" ${SANS}>${day}</text></g>`;
/** 柜子（底下一条黑缝） */
const cupboard = (x: number, y: number, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="0" y="-400" width="320" height="372" fill="#8A6A44" stroke="#5A4228" stroke-width="4"/><path d="M160,-400 V-28" stroke="#5A4228" stroke-width="4"/><circle cx="146" cy="-220" r="7" fill="#D9A441"/><circle cx="174" cy="-220" r="7" fill="#D9A441"/><rect x="0" y="-28" width="320" height="28" fill="#1E1812"/><rect x="6" y="-28" width="14" height="28" fill="#5A4228"/><rect x="300" y="-28" width="14" height="28" fill="#5A4228"/></g>`;
/** 一摞书（中心 x，底 y） */
const books = (x: number, y: number, s = 1, n = 6, rot = 0) => { const c = ['#8A3A2E', '#3E5A7A', '#B89A5A', '#5A6A3A', '#6A4A6A', '#A8603A']; let t = `<g transform="translate(${f(x)},${f(y)}) rotate(${f(rot)}) scale(${f(s)})">`; for (let i = 0; i < n; i++) t += R(-46 + (i % 2) * 6, -(i + 1) * 20, 86, 20, c[i % 6], `stroke="#2B2722" stroke-opacity=".4" stroke-width="1.5"`) + `<path d="M${-38 + (i % 2) * 6},${-(i + 1) * 20 + 10} h70" stroke="#F2EAD8" stroke-width="2" opacity=".5"/>`; return t + '</g>'; };
const scattered = (x: number, y: number) => books(x - 80, y, 0.9, 2, -14) + books(x + 60, y, 0.9, 1, 22) + books(x + 150, y + 6, 0.9, 1, -6);
/** 纸箱 */
const box = (x: number, y: number, s = 1) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="-40" y="-60" width="80" height="60" fill="#C9A878" stroke="#8A6A48" stroke-width="3"/><path d="M-40,-32 h80 M0,-60 v28" stroke="#8A6A48" stroke-width="2"/></g>`;
/** 木书桌 */
const homeDesk = (x: number, y: number, s = 1, w = 220) => `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><rect x="${-w / 2}" y="-150" width="${w}" height="16" rx="3" fill="#B88E5A"/><rect x="${-w / 2 + 8}" y="-134" width="${w - 16}" height="44" fill="#9A7448"/><rect x="${-w / 2 + 10}" y="-90" width="12" height="90" fill="#7A5A38"/><rect x="${w / 2 - 22}" y="-90" width="12" height="90" fill="#7A5A38"/></g>`;
/** 桌面（俯拍用的木纹） */
const woodTop = (id: string, a = '#9C7651', b = '#8A6644') => sky(id, a, b) + Array.from({ length: 9 }, (_, i) => `<path d="M-200,${i * 120 - 40} Q800,${i * 120 - 10} 1800,${i * 120 - 40}" stroke="#6E4E30" stroke-width="3" fill="none" opacity=".5"/>`).join('');
/** 说话的气泡（字在泡泡里） */
const bubble = (x: number, y: number, t: string, a = 1, tail: 1 | -1 = 1) => { const w = 60 + t.length * 23; return `<g opacity="${f(a)}"><path d="M${f(x - 30 * tail)},${y + 30} l${-26 * tail},40 l${46 * tail},-40 z" fill="#FBF7EA" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="${f(x - w / 2)}" y="${y - 40}" width="${w}" height="72" rx="20" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><path d="M${f(x - 30 * tail - 1)},${y + 29} h${f(46 * tail + 2)}" stroke="#FBF7EA" stroke-width="5"/><text x="${x}" y="${y + 13}" font-size="40" font-weight="900" fill="#8E2A26" text-anchor="middle" ${SANS}>${t}</text></g>`; };
/** 盖暗一层 */
const darken = (c = '#3A2E24', a = 0.45) => `<rect x="-200" y="-200" width="2000" height="1300" fill="${c}" opacity="${a}"/>`;

// ---------------- 地方（capsule 里没有的） ----------------
/** 1996 年的居民楼（红砖），一楼是 Yu 家的门 */
const buildingBg = (id: string) => {
  let t = sky(id, '#CFE0E6', '#EAE6D8') + R(200, 30, 1200, 620, '#A5583E');
  for (let i = 0; i < 40; i++) t += `<path d="M200,${50 + i * 15} H1400" stroke="#8E4A34" stroke-width="2" opacity=".35"/>`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const wx = 260 + c * 190, wy = 60 + r * 110; if (r === 3 && (c === 3 || c === 2)) continue; t += R(wx, wy, 100, 74, '#D6E0E0') + `<rect x="${wx}" y="${wy}" width="100" height="74" fill="none" stroke="#E8E2D2" stroke-width="6"/><path d="M${wx + 50},${wy} V${wy + 74}" stroke="#E8E2D2" stroke-width="4"/>` + (r < 3 ? R(wx - 14, wy + 74, 128, 10, '#7A7A70') + `<path d="M${wx - 10},${wy + 74} v-30 M${wx + 110},${wy + 74} v-30 M${wx - 10},${wy + 48} h120" stroke="#5A5A52" stroke-width="3"/>` : ''); }
  t += R(740, 440, 220, 210, '#7E4632') + R(780, 470, 140, 180, '#4E6E52') + `<rect x="780" y="470" width="140" height="180" fill="none" stroke="#2E4A34" stroke-width="5"/><circle cx="900" cy="560" r="6" fill="#D9A441"/>` + R(1000, 470, 150, 100, '#BCC8C8') + `<path d="M1000,470 h150 v100 h-150 z M1075,470 v100" stroke="#E8E2D2" stroke-width="6" fill="none"/>`;
  t += R(760, 646, 180, 14, '#9A9488') + R(-200, 660, 2000, 500, '#C4B08A') + `<path d="M-200,700 H1800" stroke="#B09A74" stroke-width="3"/>`;
  t += `<rect x="70" y="300" width="30" height="370" fill="#7A6A52"/><circle cx="80" cy="260" r="140" fill="#7A9A5E"/><circle cx="0" cy="320" r="90" fill="#6E8E52"/><circle cx="170" cy="330" r="96" fill="#86A66A"/>`;
  return t;
};
/** 七月的街：梧桐、灰砖平房、自行车、电线 */
const streetBg = (id: string) => {
  let t = sky(id, '#D8E6EC', '#F0E8D0') + R(-200, 360, 2000, 300, '#A8A49A');
  for (let i = 0; i < 8; i++) t += R(-200 + i * 280, 300, 250, 360, i % 2 ? '#9A968C' : '#B0AA9C') + R(-160 + i * 280, 420, 70, 90, '#6A7A82') + R(-60 + i * 280, 400, 60, 130, '#5A4A3A');
  t += `<path d="M-200,180 Q600,240 1800,170 M-200,200 Q600,260 1800,190" stroke="#3A3A38" stroke-width="2" fill="none"/>` + R(-200, 660, 2000, 60, '#C9C0AC') + R(-200, 720, 2000, 400, '#8A857A');
  for (let i = 0; i < 6; i++) { const x = -100 + i * 360; t += `<rect x="${x - 14}" y="260" width="28" height="430" fill="#7A6A52"/><circle cx="${x}" cy="220" r="150" fill="#6E8E52" opacity=".95"/><circle cx="${x - 90}" cy="290" r="90" fill="#7A9A5E"/><circle cx="${x + 100}" cy="280" r="100" fill="#86A66A"/>`; }
  t += `<g transform="translate(1180,690)" stroke="#2B2722" stroke-width="5" fill="none"><circle cx="-60" cy="-40" r="40"/><circle cx="60" cy="-40" r="40"/><path d="M-60,-40 L-10,-100 L50,-100 L60,-40 M-10,-100 L0,-40 L-60,-40 M50,-100 L42,-124 M-20,-110 h24"/></g>`;
  return t;
};
/** 夏天的热气 */
const heat = (g: number) => Array.from({ length: 5 }, (_, i) => { const k = (g * 0.4 + i / 5) % 1; return `<path d="M${200 + i * 300},${f(700 - k * 160)} q20,-14 40,0 q20,14 40,0" stroke="#FFF6DD" stroke-width="3" fill="none" opacity="${f(0.4 * Math.sin(k * Math.PI))}"/>`; }).join('');
/** 现代的教室（演示“故意”用） */
const modernClassBg = (id: string) => sky(id, '#EEF0EC', '#E2E4DE') + R(-200, 520, 2000, 120, '#C8D4DC') + R(-200, 640, 2000, 500, '#C9C2B2') + R(380, 110, 840, 300, '#2E3A36') + R(366, 96, 868, 14, '#9AA4A8') + `<text x="800" y="290" font-size="64" fill="#E6EAE4" text-anchor="middle" ${HAND}>by accident / on purpose</text>`;
/** 夜里的小屋（1996 年 Yu 的房间）：窗外有月亮 */
const nightRoom = (id: string) => sky(id, '#4A4050', '#5E5258') + R(1080, 120, 300, 280, '#2A3048') + `<circle cx="1300" cy="190" r="34" fill="#F4E8C8"/><rect x="1080" y="120" width="300" height="280" fill="none" stroke="#6A5A4A" stroke-width="14"/>` + R(-200, 760, 2000, 500, '#6A5A48');

// ---------------- 搬家（拓展小视频里比时态） ----------------
const fangWalk = (u: number, g: number, t0: number, t1: number, a = -100, b = 640, s = 1.75) => { const k = seg(u, t0, t1), walking = u > t0 && u < t1; return { x: lerp(a, b, k), pose: walking ? P.walk(g * 1.3, 1) : P.stand(), s }; };

export const SHOTS_C3: Record<string, ShotDef> = {
  // ---------- 1 星期四下午：你和 Tao 把照片、粉色的信拿给周老师看 ----------
  'tc3.show': {
    bg: (id) => zhouHomeBg(id),
    fg: (u, g) => {
      const k = seg(u, 0.15, 0.5), k2 = seg(u, 0.35, 0.65), give = sitReach(k * (1 - seg(u, 0.75, 1)));
      const zp: Pose = { ...sitReach(k2 * 0.85), head: 6 + 6 * seg(u, 0.6, 1) };
      return sitter('zhou', 470, 860, 1.95, g, { kind: 'arm', pose: zp, hold: u > 0.62 ? 'envPink' : undefined, mood: 'calm' }) + teaTable(780, 860, 1.25, g) +
        sitter('you', 1060, 860, 1.9, g, { kind: 'sofa', face: -1, pose: give, hold: u <= 0.62 ? 'envPink' : undefined }) +
        sitter('tao', 1300, 860, 1.9, g, { kind: 'sofa', face: -1, pose: { ...P.sitRest(), lean: 8, head: 6 } });
    },
    cam: [[840, 520, 1500], [820, 530, 1340]],
  },
  // ---------- 2 照片让他想起那个夏天；手在抖 ----------
  'tc3.photo': {
    bg: (id) => sky(id, '#5A4632', '#3E3024') + R(-200, 700, 2000, 500, '#4A3826'),
    fg: (u, g, id) => {
      const sh = Math.sin(g * 31) * 2.4 + Math.sin(g * 17) * 1.2, warm = seg(u, 0.2, 0.9);
      const hand = (x: number, m: 1 | -1) => `<g transform="translate(${x},700) scale(${m},1)"><path d="M-170,260 L-40,40 L60,90 L-40,300 Z" fill="#8C6F4E" stroke="${INK}" stroke-width="3"/><path d="M-60,60 Q-70,-10 -30,-40 L40,-30 Q70,10 50,80 Z" fill="${SKIN}" stroke="${INK}" stroke-width="3"/><path d="M-40,-10 q20,6 40,0 M-36,14 q22,6 44,0" stroke="${INK}" stroke-opacity=".3" stroke-width="2" fill="none"/><rect x="-10" y="-80" width="22" height="70" rx="11" fill="${SKIN}" stroke="${INK}" stroke-width="3" transform="rotate(-10 0 -40)"/></g>`;
      return `<g transform="translate(${f(sh)},${f(sh * 0.6)})">` + classPhoto(id, 480, 210, 1, { rot: -2, g }) + hand(470, 1) + hand(1130, -1) + '</g>' +
        `<rect x="-200" y="-200" width="2000" height="1300" fill="#E8C48A" opacity="${f(0.18 * warm)}" style="mix-blend-mode:multiply"/>`;
    },
    cam: [[800, 470, 1150], [800, 450, 980]],
  },
  // ---------- 3 “F”……那是 Fang；好久没听到这两个名字放在一起了 ----------
  'tc3.zhouCU': {
    bg: (id) => zhouHomeBg(id) + darken(),
    fg: (u, g, id) => glow(id, 1200, 260, 300, g, 0, 0.35) + faceCU({ id, x: 700, y: 470, s: 1.25, who: 'zhou', g, open: 0.62, brow: 0.7, mouth: talk(g, 0.5) - 0.1, look: -0.4 }) + classPhoto(id, 1080, 640, 0.5, { rot: 8 }),
    cam: [[800, 470, 1250], [790, 460, 1080]],
  },
  // ---------- 4 1996 年 6 月：全班在准备毕业演出（年轻的周老师在指挥） ----------
  'tc3.fbClass': {
    bg: (id) => class96(id, ['June 1996', 'Graduation Show', 'Class 3, Grade 9']),
    fg: (u, g, id, v) => {
      let t = cal96(10) + ceilingFan(800, -40, 1.3, g);
      const row: [string, number][] = [['c3boy96', 420], ['c3girl96', 545], ['fang', 680], ['yu', 805], ['c3boy96b', 935], ['c3girl96', 1055]];
      row.forEach(([who, x], i) => { const pose: Pose = { ...P.stand(), aF: 38, eF: 84, aB: 34, eB: 88, head: -8 + 4 * Math.sin(g * 2 + i), lean: -2 }; const [hx, hy] = wrist(who, pose, x, 790, 1.5); t += person({ x, y: 790, s: 1.5, who, pose, g, mood: 'laugh' }) + `<rect x="${f(hx - 8)}" y="${f(hy - 30)}" width="34" height="44" fill="#F4EEDC" stroke="#8A7A5A" stroke-width="2" transform="rotate(-10 ${f(hx)} ${f(hy)})"/>`; });
      t += person({ x: 1240, y: 800, s: 1.6, who: 'c3zhou96', pose: { ...P.stand(), aF: 120 + 22 * Math.sin(g * 4), eF: -10, head: -6 }, g, face: -1, mood: 'laugh' });
      t += desk96(560, 1000, 1.35) + desk96(1040, 1000, 1.35);
      return t + old96(id, v, g, 'June 1996');
    },
    cam: [[740, 500, 1350], [840, 500, 1250]],
  },
  // ---------- 5 以前每天一起回家；为谁先唱吵了起来 ----------
  'tc3.fbArgue': {
    bg: (id) => class96(id, []),
    fg: (u, g, id, v) => {
      const turn = Math.floor(u * 6) % 2; // 你一句我一句
      let t = cal96(12) + ceilingFan(800, -40, 1.3, g) + desk96(1290, 850, 1.1) + mbox(id, 1290, 705, 0.42, g, { open: 1 });
      t += person({ x: 330, y: 790, s: 1.3, who: 'c3boy96', pose: P.stand(), g, face: 1, mood: 'shock', a: 0.9 }) + person({ x: 1470, y: 790, s: 1.3, who: 'c3girl96', pose: P.stand(), g, face: -1, mood: 'shock', a: 0.9 });
      t += person({ x: 660, y: 860, s: 1.95, who: 'fang', pose: turn === 0 ? P.point(0.8 + 0.2 * Math.sin(g * 6)) : { ...P.stand(), aF: -20, eF: 100 }, g, face: 1, mood: turn === 0 ? 'shock' : 'sneer', detail: true });
      t += person({ x: 960, y: 860, s: 1.9, who: 'yu', pose: turn === 1 ? P.point(0.8 + 0.2 * Math.sin(g * 6)) : { ...P.stand(), aF: -20, eF: 100 }, g, face: -1, mood: turn === 1 ? 'shock' : 'sneer', detail: true });
      t += bubble(600, 330, 'Me first!', turn === 0 ? 1 : 0.3, 1) + bubble(990, 330, 'No — me!', turn === 1 ? 1 : 0.3, -1);
      return t + old96(id, v, g);
    },
    cam: [[820, 520, 1400], [810, 530, 1260]],
  },
  // ---------- 6 第二天：Fang 抱着一摞书走过，胳膊把八音盒碰了下去 ----------
  'tc3.fbCarry': {
    bg: (id) => class96(id, []),
    fg: (u, g, id, v) => {
      const x = lerp(220, 880, seg(u, 0, 0.72)), pose = u < 0.72 ? carry(g * 1.1) : { ...carry(0), lean: -4 };
      const tip = seg(u, 0.6, 0.86), [wx, wy] = wrist('fang', pose, x, 830, 1.85);
      let t = cal96(13) + ceilingFan(800, -40, 1.3, g);
      t += seat('desk96', 1240, 830, 1.8, -1) + person({ x: 1240, y: 830, s: 1.8, who: 'yu', pose: { ...P.sitRest(), head: tip > 0.3 ? -4 : 10, aF: tip > 0.3 ? 60 : 22, eF: tip > 0.3 ? 20 : 62 }, g, face: -1, mood: tip > 0.3 ? 'shock' : 'calm' });
      t += desk96(1070, 830, 1.15) + (tip < 0.99 ? mbox(id, 1000 + tip * 90, 678 + tip * tip * 80, 0.45, g, { open: 1, play: tip < 0.2, rot: tip * 70 }) : '');
      t += person({ x, y: 830, s: 1.85, who: 'fang', pose, g, mood: tip > 0.3 ? 'shock' : 'calm', detail: true }) + books(wx - 10, wy + 40, 1.05, 6);
      return t + old96(id, v, g);
    },
    cam: [[700, 520, 1300], [920, 530, 1250]],
  },
  // ---------- 7 摔在地上，钥匙飞出去、滚到柜子底下，音乐停了 ----------
  'tc3.fbFall': {
    bg: (id) => sky(id, '#E6DFCB', '#DCD3BC') + R(-200, 380, 2000, 150, '#6E9A84') + R(-200, 374, 2000, 8, '#4E7A64') + R(-200, 530, 2000, 700, '#9A9488') + Array.from({ length: 6 }, (_, i) => `<path d="M-200,${560 + i * 60} L1800,${560 + i * 60}" stroke="#86807A" stroke-width="2" opacity=".6"/>`).join('') + cupboard(1180, 790, 1.15) + desk96(330, 790, 1.5),
    fg: (u, g, id, v) => {
      const fall = seg(u, 0, 0.22), hit = u > 0.22, bump = hit ? Math.max(0, 1 - (u - 0.22) * 10) : 0;
      const bx = lerp(470, 610, fall), by = lerp(592, 790, fall * fall);
      let t = mbox(id, bx, by - bump * 24, 0.6, g, { open: hit ? 0.3 : 1, play: !hit, rot: hit ? 4 : lerp(10, 80, fall), hasKey: !hit });
      if (hit) {
        const kk = seg(u, 0.22, 0.48), roll = seg(u, 0.48, 0.78), kx = kk < 1 ? lerp(700, 960, kk) : lerp(960, 1330, roll), ky = kk < 1 ? 770 - Math.sin(kk * Math.PI) * 240 : 778;
        if (roll < 0.98) t += brassKey(kx, ky, 0.5, { rot: 90 + (kk + roll) * 900 });
        t += [0, 1, 2].map((i) => `<path d="M${560 + i * 60},790 q${-20 + i * 20},-30 ${-30 + i * 30},-56" stroke="#F2E6CC" stroke-width="6" fill="none" opacity="${f(bump)}"/>`).join('');
        t += notes(720, lerp(600, 460, seg(u, 0.22, 0.62)), 1, g, 1 - seg(u, 0.25, 0.62));
        if (u > 0.8) t += `<circle cx="1300" cy="776" r="${f(16 + 8 * Math.sin(g * 6))}" fill="#FFF0B8" opacity="${f(0.4 * seg(u, 0.8, 0.9))}"/>`;
      }
      return t + old96(id, v, g);
    },
    cam: [[800, 560, 1300], [960, 600, 1150]],
  },
  // ---------- 8 Yu：你是故意的！ ----------
  'tc3.fbYu': {
    bg: (id) => classPlain(id) + darken('#2E2418', 0.45),
    fg: (u, g, id, v) => faceCU({ id, x: 760, y: 480, s: 1.3, who: 'yu', g, open: 1.25, brow: -0.9, mouth: 0.5 + talk(g) * 0.2, tear: seg(u, 0.3, 1) * 0.8, shake: 0.4 }) + old96(id, v, g),
    cam: [[800, 470, 1200], [790, 450, 1000]],
  },
  // ---------- 9 Fang 难过得一句话也说不出来；从此两人不说话（日历一天天翻过去） ----------
  'tc3.fbHurt': {
    bg: (id) => class96(id, []),
    fg: (u, g, id, v) => {
      const a = 1 - seg(u, 0.46, 0.56), b = seg(u, 0.5, 0.6), away = seg(u, 0.12, 0.4), day = u < 0.55 ? 13 : 13 + Math.floor(seg(u, 0.55, 1) * 7.99);
      let t = cal96(day);
      t += `<g opacity="${f(a)}">` + scattered(760, 846) + person({ x: 680, y: 840, s: 1.9, who: 'fang', pose: { ...P.stand(), head: 14, aF: 4, eF: 6, aB: -4, eB: 8 }, g, mood: 'sad', detail: true }) +
        person({ x: lerp(980, 1320, away), y: 840, s: 1.85, who: 'yu', pose: away > 0.02 && away < 0.98 ? P.walk(g * 1.3, 0.9) : P.stand(), g, face: away > 0.02 ? 1 : -1, mood: 'sad' }) + `</g>`;
      t += `<g opacity="${f(b)}">` + seat('desk96', 580, 840, 1.85, -1) + person({ x: 580, y: 840, s: 1.85, who: 'fang', pose: { ...P.sitRest(), head: 18, aF: 50, eF: 60 }, g, face: -1, mood: 'sad' }) + desk96(410, 840, 1.1) +
        seat('desk96', 1020, 840, 1.8, 1) + person({ x: 1020, y: 840, s: 1.8, who: 'yu', pose: { ...P.sitRest(), head: 14, aF: 50, eF: 60 }, g, face: 1, mood: 'sad' }) + desk96(1190, 840, 1.1) +
        `<path d="M800,${f(lerp(860, 500, b))} V860" stroke="#6A5A44" stroke-width="4" stroke-dasharray="14 12" opacity=".6"/></g>`;
      return t + old96(id, v, g);
    },
    cam: [[820, 520, 1400], [810, 540, 1300]],
  },
  // ---------- 10 Fang 到处找钥匙，直到 6 月 27 日才在柜子底下找到 ----------
  'tc3.fbSearch': {
    bg: (id) => class96(id, []) + cupboard(1080, 840, 1.15),
    fg: (u, g, id, v) => {
      const day = 15 + Math.min(12, Math.floor(seg(u, 0, 0.6) * 12.99)), found = u > 0.68;
      const x = lerp(380, 920, seg(u, 0, 0.6)), pose = found ? kneelUp(seg(u, 0.72, 0.86)) : P.crawl(g * 0.7);
      let t = cal96(day, 1.3, 1180, 290) + person({ x, y: 840, s: 1.85, who: 'fang', pose, g, face: 1, mood: found ? 'shock' : 'sad', detail: true });
      if (found) { const [wx, wy] = wrist('fang', pose, x, 840, 1.85); t += brassKey(wx + 4, wy + 6, 0.5, { rot: 20, glint: 1, g }); }
      else if (u > 0.55) t += `<circle cx="1180" cy="825" r="${f(10 + 5 * Math.sin(g * 6))}" fill="#FFF0B8" opacity=".5"/>`;
      return t + old96(id, v, g, 'June 1996');
    },
    cam: [[780, 540, 1350], [880, 540, 1250]],
  },
  // ---------- 11a 她不敢还：把钥匙包进信里，装进粉色信封 ----------
  'tc3.fbWrap': {
    bg: (id) => woodTop(id, '#B88E5A', '#A07A4A'),
    fg: (u, g, id, v) => {
      const drop = seg(u, 0.05, 0.25), fold = seg(u, 0.38, 0.62), into = seg(u, 0.62, 0.9);
      const lines = ['This letter is not for the future. It is for my best friend, Chen Yu.', 'Two weeks ago, her music box fell off the desk, and the music stopped.'];
      let t = env(lerp(1700, 1100, seg(u, 0.5, 0.66)), 470, 1.25, 'pink', { rot: 4 });
      t += `<g transform="translate(${f(lerp(800, 1090, into))},${f(lerp(450, 470, into))}) scale(${f(lerp(1, 0.4, into))},${f(lerp(1, 0.3, fold) * lerp(1, 0.4, into))})" opacity="${f(1 - seg(u, 0.86, 0.92))}">` + letter(id, -380, -200, 1, { lines, w: 760, size: 34, sign: false }) + (drop >= 1 ? brassKey(-60, 90, 0.5, { rot: 70 }) : '') + '</g>';
      if (drop < 1) t += brassKey(740, lerp(-80, 540, drop), 0.5, { rot: 70 + (1 - drop) * 120 });
      return t + old96(id, v, g, 'June 27, 1996');
    },
    cam: [[880, 460, 1350], [960, 470, 1250]],
  },
  // ---------- 11b 第二天：全班把时间胶囊埋在老银杏树下 ----------
  'tc3.fbBury': {
    bg: (id) => sky(id, '#CFE0E6', '#E8E2CE') + R(-200, 360, 1000, 280, '#D8C8A8') + `<rect x="-200" y="420" width="2000" height="230" fill="#C9C0A8"/>` + R(-200, 640, 2000, 500, '#B9A27E') + ginkgoTree(1200, 700, 0.85, { gold: 0 }),
    fg: (u, g, id, v) => {
      const down = seg(u, 0.1, 0.7);
      let t = `<ellipse cx="800" cy="790" rx="200" ry="52" fill="#5A4430"/><path d="M1000,780 q70,-66 160,0 z" fill="#8A6A48"/>`;
      t += tinBox(id, 800, lerp(660, 810, down), 0.55, { lid: 0 }) + R(-200, 795, 2000, 400, '#B9A27E');
      const kids: [string, number, 1 | -1][] = [['c3boy96', 500, 1], ['c3girl96', 610, 1], ['c3boy96b', 1000, -1], ['c3girl96', 1110, -1]];
      kids.forEach(([who, x, fc]) => { t += person({ x, y: 840, s: 1.4, who, pose: { ...P.stand(), head: 18, lean: 6 }, g, face: fc }); });
      t += person({ x: 670, y: 820, s: 1.45, who: 'c3boy96b', pose: { ...P.stand(), lean: 30, head: 10, aF: 50, eF: 30, aB: 40, eB: 40 }, g, face: 1 });
      t += person({ x: 290, y: 870, s: 1.6, who: 'fang', pose: { ...P.stand(), head: 16 }, g, face: 1, mood: 'sad' }) + person({ x: 1330, y: 870, s: 1.55, who: 'yu', pose: { ...P.stand(), head: 12 }, g, face: -1, mood: 'sad' });
      return t + old96(id, v, g, 'June 28, 1996');
    },
    cam: [[800, 490, 1450], [800, 540, 1300]],
  },
  // ---------- 12 七月，Fang 终于去 Yu 家道歉 ----------
  'tc3.fbWalk': {
    bg: (id) => streetBg(id),
    fg: (u, g, id, v) => person({ x: lerp(200, 1300, u), y: 760, s: 1.8, who: 'fang', pose: P.walk(g * 1.4, 1.1), g, mood: 'calm', detail: true }) + heat(g) + old96(id, v, g, 'July 1996'),
    cam: [[560, 480, 1300], [1080, 480, 1300]],
  },
  // ---------- 13 等她赶到，Yu 家已经搬走了 ----------
  'tc3.fbEmpty': {
    bg: (id) => buildingBg(id) + `<path d="M-200,780 Q600,760 1800,800 M-200,810 Q600,790 1800,830" stroke="#9A8462" stroke-width="6" fill="none" opacity=".6"/>` + box(1180, 700, 0.9) + `<path d="M1240,700 l60,-6 l-10,10 z" fill="#C9A878"/>`,
    fg: (u, g, id, v) => {
      const k = seg(u, 0, 0.3), x = lerp(200, 700, k), kn = u > 0.32 && u < 0.62, sag = seg(u, 0.66, 0.85);
      const pose = k < 1 ? P.walk(g * 1.3, 1) : kn ? knock(g) : { ...P.stand(), head: 20 * sag, lean: 8 * sag };
      return person({ x, y: 690, s: 1.7, who: 'fang', pose, g, mood: sag > 0.3 ? 'sad' : 'calm', detail: true }) +
        (kn ? [0, 1].map((i) => `<path d="M${770 + i * 14},${470 - i * 8} q14,-10 0,-24" stroke="#5A4A3A" stroke-width="4" fill="none" opacity="${f(0.5 + 0.5 * Math.sin(g * 9))}"/>`).join('') : '') + old96(id, v, g, 'July 1996');
    },
    cam: [[640, 420, 1300], [780, 440, 1150]],
  },
  // ---------- 14 Tao：那她始终没能道歉？ ----------
  'tc3.taoAsk': {
    bg: (id) => zhouHomeBg(id),
    fg: (u, g) => sitter('zhou', 520, 860, 2.0, g, { kind: 'arm', pose: { ...P.sitRest(), head: 12 }, mood: 'sad' }) + teaTable(810, 860, 1.25, g) +
      sitter('tao', 1110, 860, 2.0, g, { kind: 'sofa', face: -1, pose: { ...P.sitRest(), lean: 18 + 4 * seg(u, 0, 0.4), head: -4, aF: 40, eF: 40 }, mood: 'shock' }),
    cam: [[820, 520, 1350], [840, 520, 1250]],
  },
  // ---------- 15 周老师：后悔了一辈子 ----------
  'tc3.zhouTea': {
    bg: (id) => zhouHomeBg(id),
    fg: (u, g) => sitter('zhou', 720, 880, 2.6, g, { kind: 'arm', pose: { ...P.sitRest(), aF: 50, eF: 78, aB: 44, eB: 84, head: 16 + 4 * seg(u, 0, 0.6) }, hold: 'teacup', mood: 'sad' }),
    cam: [[840, 470, 1150], [820, 450, 1000]],
  },
  // ---------- 16 每年春节 Fang 都来看我；去年她问我知不知道 Yu 在哪儿 ----------
  'tc3.spring': {
    bg: (id) => sky(id, '#3A3044', '#5A4A54'),
    fg: (u, g, id, v) => {
      const a = 1 - seg(u, 0.42, 0.52), b = seg(u, 0.46, 0.56);
      // 门口：春联（只画金色的纹样）、福、红灯笼、雪
      let t = `<g opacity="${f(a)}">${R(-200, 80, 2000, 600, '#C9BCA8')}${R(-200, 680, 2000, 500, '#8A7E70')}${R(840, 180, 300, 500, '#7A4A2E')}${R(800, 150, 380, 30, '#B8352A')}${R(780, 180, 50, 460, '#B8352A')}${R(1150, 180, 50, 460, '#B8352A')}`;
      for (let i = 0; i < 6; i++) t += `<circle cx="805" cy="${220 + i * 72}" r="12" fill="#E8C060" opacity=".85"/><circle cx="1175" cy="${220 + i * 72}" r="12" fill="#E8C060" opacity=".85"/>`;
      t += `<g transform="translate(990,330) rotate(45)">${R(-60, -60, 120, 120, '#C23B2E')}</g><text x="990" y="356" font-size="74" font-weight="900" fill="#E8C060" text-anchor="middle" style="font-family:KaiTi,STKaiti,serif">福</text>`;
      t += `<line x1="560" y1="80" x2="560" y2="150" stroke="#2B2722" stroke-width="3"/><ellipse cx="560" cy="200" rx="54" ry="48" fill="#C23B2E"/><rect x="540" y="244" width="40" height="12" fill="#E8C060"/><path d="M552,256 v40 M560,256 v46 M568,256 v40" stroke="#E8C060" stroke-width="3"/>`;
      const fp: Pose = { ...P.stand(), aF: 60, eF: 50, aB: 50, eB: 60 }, [hx, hy] = wrist('fang2', fp, 640, 700, 1.9);
      t += person({ x: 1010, y: 690, s: 1.85, who: 'zhou', pose: { ...P.stand(), aF: 46, eF: 30 }, g, face: -1, mood: 'laugh' }) + person({ x: 640, y: 700, s: 1.9, who: 'fang2', pose: fp, g, face: 1, mood: 'laugh' });
      t += `<g transform="translate(${f(hx + 10)},${f(hy + 10)})">${R(-40, -40, 80, 70, '#C23B2E')}<path d="M0,-40 v70 M-40,-5 h80" stroke="#E8C060" stroke-width="6"/></g>` + snow(4, g, 50, 0.7, 30) + '</g>';
      // 屋里：Fang 问——Yu 在哪儿？
      t += `<g opacity="${f(b)}">${zhouHomeBg(id + 'r')}${R(852, 252, 126, 156, '#E2D1B2')}${R(891, 252, 18, 156, '#D4C09A', 'opacity=".35"')}` + sitter('fang2', 470, 860, 1.9, g, { kind: 'sofa', pose: { ...P.sitRest(), lean: 10, aF: 40, eF: 40 }, mood: 'sad' }) + teaTable(780, 860, 1.25, g) +
        sitter('zhou', 1100, 860, 1.9, g, { kind: 'arm', face: -1, pose: { ...P.sitRest(), head: 14 }, mood: 'sad' });
      t += `<g transform="translate(560,250)"><path d="M-150,-90 h300 a30,30 0 0 1 30,30 v120 a30,30 0 0 1 -30,30 h-170 l-40,50 l0,-50 h-90 a30,30 0 0 1 -30,-30 v-120 a30,30 0 0 1 30,-30 z" fill="#FBF7EA" stroke="${INK}" stroke-width="4"/>${classPhoto(id + 'p', -160, -70, 0.25, { mark: 'yu' })}<text x="110" y="34" font-size="96" font-weight="900" fill="#8E2A26" text-anchor="middle" ${SANS}>?</text></g></g>`;
      return t + tag(v, 'Spring Festival');
    },
    cam: [[820, 450, 1450], [800, 500, 1400]],
  },
  // ---------- 17 我们早就和 Yu 断了联系 ----------
  'tc3.map': {
    bg: (id) => sky(id, '#EFE4CC', '#E2D4B6'),
    fg: (u, g, id, v) => {
      const B = [470, 340], S = [1150, 620], yr = Math.round(lerp(1996, 2026, seg(u, 0.05, 0.9)));
      let t = '';
      for (let i = 0; i < 24; i++) { const k = i / 24, gone = seg(u, 0.1 + k * 0.6, 0.2 + k * 0.6); t += `<circle cx="${f(lerp(B[0], S[0], k))}" cy="${f(lerp(B[1], S[1], k) - Math.sin(k * Math.PI) * 120)}" r="7" fill="#8A5A2E" opacity="${f(0.8 * (1 - gone))}"/>`; }
      const city = (x: number, y: number, name: string, who: string) => `<g transform="translate(${x},${y})">${[[-60, 90], [-20, 140], [24, 110], [64, 70]].map(([dx, h]) => R(dx - 18, -h, 36, h, '#9A8A70')).join('')}<circle cx="0" cy="24" r="12" fill="#B8352A"/><text x="0" y="86" font-size="44" font-weight="900" fill="#5A3E28" text-anchor="middle" ${SANS}>${name}</text>${person({ x: who === 'fang2' ? -150 : 150, y: 20, s: 1.2, who, pose: { ...P.stand(), head: 10 }, g, face: who === 'fang2' ? 1 : -1, mood: 'sad' })}</g>`;
      t += city(B[0], B[1], 'Beijing', 'fang2') + city(S[0], S[1], 'Shanghai', 'yu2');
      return t + pin(v, 0.5, 0.12, `<g><rect x="-110" y="-46" width="220" height="64" rx="12" fill="#5A3E28" opacity=".85"/><text x="0" y="2" font-size="42" font-weight="900" fill="#F4E2B8" text-anchor="middle" ${SANS}>${yr}</text></g>`, 800, 108);
    },
    cam: [[810, 470, 1500], [810, 480, 1400]],
  },
  // ---------- 18 Tao 把照片放回去，衬布动了一下：下面藏着一个蓝信封 ----------
  'tc3.lining': {
    bg: (id) => woodTop(id),
    fg: (u, g, id) => {
      const put = seg(u, 0, 0.28), lift = seg(u, 0.36, 0.78);
      const photo = (x: number, y: number, s: number, hand: boolean) => `<g transform="translate(${f(x)},${f(y)}) rotate(-6) scale(${f(s)})">${R(-150, -95, 300, 200, '#F2E8D2')}${R(-136, -82, 272, 160, '#B89A6E')}${hand ? `<path d="M70,-130 Q100,-50 50,-10 L130,20 Q180,-70 160,-210 Z" fill="${SKIN}" stroke="${INK}" stroke-width="3"/><path d="M150,-210 L230,-260 L260,-180 L170,-120 Z" fill="#2F5DA8" stroke="${INK}" stroke-width="3"/>` : ''}</g>`;
      return tinBox(id, 760, 700, 1.7, { lid: 1, inside: 'empty', lining: lift, ky: 0.95, g }) +
        (u <= 0.28 ? photo(lerp(660, 650, put), lerp(40, 330, put), lerp(0.75, 0.6, put), true) : photo(650, 330, 0.6, false));
    },
    cam: [[800, 450, 1400], [820, 430, 1150]],
  },
  // ---------- 19 背面有个名字……Chen Yu！ ----------
  'tc3.blueBack': {
    bg: (id) => zhouHomeBg(id) + darken(),
    fg: (u, g, id) => faceCU({ id, x: 420, y: 500, s: 1.15, who: 'tao', g, open: 1.3, brow: 0.9, mouth: 0.5 + talk(g, 0.4), look: 0.6 }) +
      env(1120, 470, 1.55, 'blue', { rot: -4, text: 'Chen Yu', reveal: seg(u, 0.1, 0.5) }),
    cam: [[820, 470, 1500], [860, 470, 1380]],
  },
  // ---------- 20 1996 年：Yu 在灯下写信（To whoever finds this） ----------
  'tc3.yuWrite': {
    bg: (id) => nightRoom(id),
    fg: (u, g, id, v) => {
      const pose = sitWrite(g), [wx, wy] = wrist('yu', pose, 720, 860, 2.2);
      return glow(id, 980, 520, 330, g, 0, 0.7) + seat('chair', 720, 860, 2.2, 1) + person({ x: 720, y: 860, s: 2.2, who: 'yu', pose, g, mood: 'sad', detail: true }) +
        homeDesk(1000, 860, 1.25, 400) + `<path d="M1110,673 l40,-120 l30,10 l-30,110 z" fill="#3A3A3A"/><path d="M1150,553 l60,-10 l20,40 l-80,10 z" fill="#5A5A50"/>` + mbox(id, 1215, 673, 0.42, g, { open: 1, hasKey: false }) +
        `<path d="M${f(wx - 70)},671 l170,-6 l4,6 l-170,6 z" fill="#F7F0DE"/><path d="M${f(wx - 4)},${f(wy - 6)} L${f(wx + 22)},${f(wy + 26)}" stroke="#2F2A5E" stroke-width="5" stroke-linecap="round"/>` + env(1010, 662, 0.25, 'blue', { rot: -6 }) + old96(id, v, g);
    },
    cam: [[900, 500, 1250], [920, 510, 1120]],
  },
  // ---------- 21 信：I know it was an accident … ----------
  'tc3.letter': {
    bg: (id) => woodTop(id, '#8A6A48', '#7A5A3A'),
    fg: (u, g, id, v) => letter(id, 420, 170, 1, { lines: ['To whoever finds this:', 'Please tell Lin Fang I’m sorry.', 'I know it was an accident. I said terrible things because I was angry.'], reveal: lerp(0.4, 1, seg(u, 0.05, 0.85)), w: 760, size: 40, sign: false, rot: -1.5 }) + old96(id, v, g),
    cam: [[800, 460, 1150], [800, 465, 1080]],
  },
  // ---------- 22 八音盒不响了，可我会永远留着它；也许有一天我们会和好 ----------
  'tc3.yuBox': {
    bg: (id) => nightRoom(id),
    fg: (u, g, id, v) => {
      const dream = seg(u, 0.45, 0.8);
      return glow(id, 760, 480, 360, g, 0, 0.5) + seat('chair', 700, 880, 2.3, 1) + person({ x: 700, y: 880, s: 2.3, who: 'yu', pose: sitHug(), g, hold: 'musicbox', mood: 'sad', detail: true }) +
        `<g opacity="${f(dream * 0.9)}"><circle cx="1180" cy="330" r="${f(210 + 6 * Math.sin(g))}" fill="#F4E8C8" opacity=".38"/>${person({ x: 1120, y: 500, s: 1.35, who: 'fang', pose: { ...P.stand(), aB: 30, eB: 20 }, g, mood: 'laugh' })}${person({ x: 1250, y: 500, s: 1.3, who: 'yu', pose: { ...P.stand(), aF: 30, eF: 20 }, g, face: -1, mood: 'laugh' })}</g>` + old96(id, v, g);
    },
    cam: [[880, 490, 1350], [920, 480, 1250]],
  },
  // ---------- 23 AI 眼镜：这封信也可能译错 ----------
  'tc3.glasses': {
    bg: (id) => zhouHomeBg(id) + darken('#1C2440', 0.74),
    fg: (u, g) => aiGlasses(800, 430, 1.5, g) + `<text x="800" y="760" font-size="44" font-weight="900" fill="#CFE6F2" text-anchor="middle" ${SANS} opacity="${f(0.6 + 0.3 * Math.sin(g * 2))}">EN → 中文</text>`,
    cam: [[800, 450, 1600], [800, 440, 1450]],
  },
  // ---------- 24 周老师摘下眼镜：同一天、同一个盒子，两个人都说了对不起 ----------
  'tc3.twoLetters': {
    bg: (id) => zhouHomeBg(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.05, 0.4), pose: Pose = { ...P.sitRest(), aF: lerp(70, 40, k), eF: lerp(100, 50, k), head: 10 + 8 * k };
      const [gx, gy] = wrist('zhou', pose, 420, 880, 2.3), slide = seg(u, 0.35, 0.85);
      return sitter('zhou', 420, 880, 2.3, g, { kind: 'arm', pose, mood: 'sad' }) +
        `<g transform="translate(${f(gx + 4)},${f(gy - 4)})"><circle cx="-14" cy="0" r="12" fill="#CFE6F2" fill-opacity=".4" stroke="#3A3A3A" stroke-width="3"/><circle cx="14" cy="0" r="12" fill="#CFE6F2" fill-opacity=".4" stroke="#3A3A3A" stroke-width="3"/><path d="M-2,0 h4" stroke="#3A3A3A" stroke-width="3"/></g>` +
        R(650, 700, 1100, 26, '#7A5232') + R(650, 726, 1100, 60, '#6A4428') + `<rect x="680" y="786" width="20" height="200" fill="#5A3A22"/><rect x="1660" y="786" width="20" height="200" fill="#5A3A22"/>` + glow(id, 1080, 640, 260, g, 0, 0.5 * slide) +
        env(lerp(880, 980, slide), 650, 0.62, 'pink', { rot: lerp(-8, -3, slide) }) + env(lerp(1320, 1180, slide), 650, 0.62, 'blue', { rot: lerp(8, 3, slide) });
    },
    cam: [[860, 520, 1350], [900, 530, 1200]],
  },
  // ---------- 25 三十年来，两个人都以为对方还在生气（北京、上海） ----------
  'tc3.apart': {
    bg: (id) => sky(id, '#E6EEF2', '#D6E0E6', 'a') + R(-200, 640, 1000, 500, '#C8CED2') + R(820, -200, 1000, 1400, '#E8DCC8') + R(820, 640, 1000, 500, '#A07A56') +
      R(120, 120, 460, 330, '#BFD8E8') + `<path d="M120,120 h460 v330 h-460 z M350,120 v330" stroke="#F4F6F8" stroke-width="14" fill="none"/>` + [0, 1, 2, 3].map((i) => R(150 + i * 110, 320 - i * 30, 80, 130 + i * 30, '#9AB0C2')).join('') +
      `<g transform="translate(1180,640)"><rect x="-200" y="-260" width="400" height="200" fill="#2B2722"/><rect x="-190" y="-120" width="380" height="40" fill="#F4F0E6"/>${Array.from({ length: 14 }, (_, i) => R(-186 + i * 27, -120, 4, 40, '#2B2722')).join('')}<rect x="-180" y="-80" width="16" height="80" fill="#2B2722"/><rect x="164" y="-80" width="16" height="80" fill="#2B2722"/></g>`,
    fg: (u, g, id, v) => {
      const turn = seg(u, 0.4, 0.9), yr = Math.round(lerp(1997, 2026, seg(u, 0, 0.7)));
      return person({ x: 480, y: 860, s: 1.95, who: 'fang2', pose: { ...P.stand(), head: -6 + 14 * turn }, g, face: 1, mood: 'sad', detail: true }) +
        seat('chair', 1260, 860, 1.9, -1) + person({ x: 1260, y: 860, s: 1.9, who: 'yu2', pose: sitHug(20 - 18 * turn), g, face: -1, hold: 'musicbox', mood: 'sad', detail: true }) +
        R(796, -200, 10, 1400, '#F8F4EC') +
        pin(v, 0.18, 0.1, tagSvg('Beijing'), 288, 90) + pin(v, 0.82, 0.1, tagSvg('Shanghai'), 1312, 90) +
        pin(v, 0.5, 0.1, `<g><rect x="-200" y="-46" width="400" height="64" rx="12" fill="#3A2E24" opacity=".8"/><text x="0" y="2" font-size="40" font-weight="900" fill="#F4E2B8" text-anchor="middle" ${SANS}>1996 → ${yr}</text></g>`, 800, 90);
    },
    cam: [[800, 450, 1600], [800, 460, 1520]],
  },
  // ---------- 26 Tao：那我们一定得告诉她们，两个人都要告诉！ ----------
  'tc3.taoUp': {
    bg: (id) => zhouHomeBg(id),
    fg: (u, g) => {
      const k = seg(u, 0.05, 0.4), pose = P.mix(P.sitRest(), { ...P.stand(), aF: 100, eF: 60, aB: -10, eB: 20, head: -6 }, k);
      const [hx, hy] = wrist('tao', pose, 1200, 860, 1.95, -1);
      return sitter('zhou', 460, 860, 1.95, g, { kind: 'arm', pose: { ...P.sitRest(), head: 4 }, mood: 'laugh' }) + teaTable(750, 860, 1.25, g) +
        sitter('you', 980, 860, 1.9, g, { kind: 'sofa', face: -1, pose: { ...P.sitRest(), head: 6 + 6 * Math.max(0, Math.sin(g * 4)) * seg(u, 0.4, 0.6) } }) +
        sitter('tao', 1200, 860, 1.95, g, { kind: 'sofa', face: -1, pose, mood: 'laugh' }) +
        env(hx - 4, hy - 30, 0.2, 'pink', { rot: -14 }) + env(hx + 10, hy - 18, 0.2, 'blue', { rot: 8 });
    },
    cam: [[840, 500, 1400], [860, 500, 1300]],
  },
  // ---------- 27 排时间顺序（东西散在桌上，不按顺序） ----------
  'tc3.timeline': {
    bg: (id) => woodTop(id),
    fg: (u, g, id) => mbox(id, 420, 430, 0.75, g, { open: 1, hasKey: false }) + env(1180, 300, 0.8, 'blue', { rot: 10 }) + env(760, 640, 0.8, 'pink', { rot: -12 }) + brassKey(1040, 700, 0.8, { rot: 60, glint: 0.6, g }) +
      `<g transform="rotate(-8 330 600)">${cal96(27, 1.4, 330, 600)}</g>` + movingTruck(1340, 800, 0.5) +
      `<rect x="-200" y="${f(-100 + ((g * 0.3) % 1) * 1100)}" width="2000" height="8" fill="#9FD3F0" opacity=".35"/>`,
    cam: [[800, 470, 1500], [800, 470, 1400]],
  },
  // ---------- 28 写一句：By the time … had … ----------
  'tc3.write': {
    bg: (id) => woodTop(id),
    fg: (u) => {
      const n = seg(u, 0.05, 0.75);
      return `<g transform="translate(330,150)"><rect x="10" y="12" width="940" height="560" fill="#000" opacity=".2"/><rect width="940" height="560" fill="#FBF7EA"/>${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${70 + i * 56}" x2="940" y2="${70 + i * 56}" stroke="#A9C6E2" stroke-width="2"/>`).join('')}<line x1="80" y1="0" x2="80" y2="560" stroke="#E2A2A2" stroke-width="2"/>` +
        `<text x="110" y="168" font-size="46" fill="#2B2A6E" ${HAND}>${'By the time ______,'.slice(0, Math.round(n * 19))}</text><text x="110" y="280" font-size="46" fill="#2B2A6E" ${HAND}>${'______ had already ______.'.slice(0, Math.max(0, Math.round(n * 45) - 19))}</text></g>` +
        `<g transform="translate(${f(lerp(520, 1180, n))},${f(n < 0.45 ? 300 : 410)}) rotate(30)"><rect x="-8" y="-140" width="16" height="140" fill="#2F5DA8"/><path d="M-8,0 L0,22 L8,0 Z" fill="#E9DFCB"/></g>`;
    },
    cam: [[800, 460, 1300], [800, 450, 1200]],
  },
  // ---------- 29 两封信在同一个盒子里躺了三十年 ----------
  'tc3.end': {
    bg: (id) => woodTop(id),
    fg: (u, g, id) => {
      const dusk = seg(u, 0.2, 1), leaf = seg(u, 0.1, 0.9), lx = lerp(1300, 1000, leaf) + Math.sin(g * 2) * 20, ly = lerp(-40, 360, leaf);
      return tinBox(id, 760, 720, 1.6, { lid: 1, inside: 'empty', ky: 0.95, g }) + env(720, 410, 0.55, 'pink', { rot: -6 }) + env(900, 390, 0.55, 'blue', { rot: 5 }) + glow(id, 820, 400, 320, g, 0, 0.35 + 0.15 * Math.sin(g * 1.4)) +
        ginkgoLeaf(lx, ly, 44, leaf * 220) + `<rect x="-200" y="-200" width="2000" height="1300" fill="#C8783A" opacity="${f(0.18 * dusk)}" style="mix-blend-mode:multiply"/>`;
    },
    cam: [[800, 470, 1400], [810, 450, 1150]],
  },

  // ================= 拓展小视频 =================
  // 不小心：Fang 抱着书走过，胳膊碰掉了八音盒（她自己也吓了一跳）
  'tc3.accidentDemo': {
    bg: (id) => class96(id, ['June 1996', 'Graduation Show', 'Class 3, Grade 9']),
    fg: (u, g, id, v) => {
      const x = lerp(260, 820, seg(u, 0, 0.6)), pose = u < 0.6 ? carry(g * 1.1) : { ...carry(0), lean: -6, head: 14 };
      const tip = seg(u, 0.5, 0.8), [wx, wy] = wrist('fang', pose, x, 830, 1.85);
      return cal96(13) + desk96(1000, 830, 1.15) + (tip < 0.99 ? mbox(id, 950 + tip * 130, 678 + tip * tip * 152, 0.45, g, { open: 1, play: tip < 0.2, rot: tip * 100 }) : mbox(id, 1090, 830, 0.45, g, { open: 0.3, rot: 4, hasKey: false })) +
        person({ x, y: 830, s: 1.85, who: 'fang', pose, g, mood: tip > 0.2 ? 'shock' : 'calm', detail: true }) + books(wx - 10, wy + 40, 1.05, 6) + old96(id, v, g, false);
    },
    cam: [[720, 520, 1300], [820, 530, 1300]],
  },
  // 故意：一个男生看看左右，伸手把桌上别人的笔袋拨到地上，还笑了
  'tc3.purposeDemo': {
    bg: (id) => modernClassBg(id),
    fg: (u, g) => {
      const look = u < 0.42 ? (Math.floor(u * 8) % 2 ? -1 : 1) : 1, reach = seg(u, 0.45, 0.58), pull = seg(u, 0.58, 0.7), fall = seg(u, 0.7, 0.86);
      const pose: Pose = { ...P.stand(), aF: lerp(6, 74, reach) - 14 * pull, eF: lerp(12, 6, reach), head: u < 0.42 ? 0 : 10 };
      const cx = 900 - pull * 70 - fall * 30, cy = 686 + fall * fall * 150;
      return person({ x: 700, y: 840, s: 1.95, who: 'stuA', pose, g, face: look as 1 | -1, mood: u > 0.6 ? 'sneer' : 'calm', detail: true }) + homeDesk(990, 840, 1.0, 260) +
        `<g transform="translate(${f(cx)},${f(cy)}) rotate(${f(-fall * 150)})">${R(-60, -30, 120, 34, '#C23B6A')}<path d="M-50,-14 h100" stroke="#F4D2DC" stroke-width="4"/></g>` + seat('chair', 1150, 840, 1.9, -1);
    },
    cam: [[820, 520, 1300], [820, 530, 1250]],
  },
  // 直到 27 号才找到：日历一天天翻，Fang 在不同的地方找
  'tc3.clipUntil': {
    bg: (id) => class96(id, ['', 'Graduation Show', 'Class 3, Grade 9']) + cupboard(1140, 840, 1.1) + R(220, 690, 70, 110, '#6A6A60'),
    fg: (u, g, id, v) => {
      const ph = u < 0.34 ? 0 : u < 0.66 ? 1 : 2, day = [15, 21, 27][ph], found = u > 0.78;
      const x = [480, 330, 960][ph], pose = found ? kneelUp(seg(u, 0.78, 0.9)) : ph === 1 ? { ...P.stand(), lean: 40, head: 20, aF: 60, eF: 20 } : P.crawl(g * 0.7);
      let t = cal96(day, 1.3, 1180, 240) + person({ x, y: 840, s: 1.8, who: 'fang', pose, g, face: ph === 1 ? -1 : 1, mood: found ? 'shock' : 'sad', detail: true });
      if (found) { const [wx, wy] = wrist('fang', pose, x, 840, 1.8); t += brassKey(wx + 4, wy + 6, 0.5, { rot: 20, glint: 1, g }); }
      return t + old96(id, v, g, false);
    },
    cam: [[780, 500, 1400], [780, 500, 1400]],
  },
  // 过去完成时：先搬走（卡车开走），后来 Fang 才到——门敲不开
  'tc3.clipHad': {
    bg: (id) => buildingBg(id),
    fg: (u, g, id, v) => {
      const drive = seg(u, 0.2, 0.44), inn = seg(u, 0.1, 0.18);
      let t = '';
      if (u <= 0.44) t += movingTruck(lerp(1200, 2100, drive), 720, 0.95, drive > 0.01 ? { g } : {}) + (inn < 1 ? `<g opacity="${f(1 - inn)}">${person({ x: lerp(900, 1240, inn), y: 700, s: 1.6, who: 'yu', pose: inn > 0 ? P.walk(g * 1.3, 0.8) : { ...P.stand(), aF: 120 + 20 * Math.sin(g * 6), eF: -10 }, g, face: 1, mood: 'sad' })}</g>` : '');
      const w = fangWalk(u, g, 0.5, 0.7), kn = u > 0.72;
      if (u > 0.48) t += person({ x: w.x, y: 690, s: w.s, who: 'fang', pose: kn ? knock(g, 1 - seg(u, 0.88, 0.95)) : w.pose, g, mood: u > 0.88 ? 'sad' : 'calm', detail: true });
      return t + old96(id, v, g, false);
    },
    cam: [[800, 440, 1500], [800, 440, 1500]],
  },
  // 一般过去时：Fang 先到，Yu 开了门；后来他们才搬（卡车这才开走，Fang 挥手）
  'tc3.whenMoved': {
    bg: (id) => buildingBg(id),
    fg: (u, g, id, v) => {
      const w = fangWalk(u, g, 0, 0.25, -100, 600), open = seg(u, 0.28, 0.38), board = seg(u, 0.55, 0.66), drive = seg(u, 0.68, 0.95), wave = u > 0.68;
      let t = movingTruck(lerp(1250, 2100, drive), 720, 0.95, drive > 0.01 ? { g } : {});
      t += person({ x: w.x, y: 690, s: w.s, who: 'fang', pose: u > 0.25 && u < 0.3 ? knock(g) : wave ? { ...P.stand(), aF: 140 + 20 * Math.sin(g * 7), eF: -10 } : w.pose, g, mood: wave ? 'sad' : open > 0.5 ? 'laugh' : 'calm', detail: true });
      if (open > 0 && board < 1) t += `<g opacity="${f(1 - board)}">${person({ x: lerp(lerp(860, 760, open), 1240, board), y: 690, s: 1.6, who: 'yu', pose: board > 0 ? P.walk(g * 1.3, 0.8) : P.stand(), g, face: board > 0 ? 1 : -1, mood: 'laugh' })}</g>`;
      return t + old96(id, v, g, false);
    },
    cam: [[800, 440, 1500], [800, 440, 1500]],
  },
  // 过去进行时：Fang 到的时候，工人正把箱子往车上搬
  'tc3.whenMoving': {
    bg: (id) => buildingBg(id),
    fg: (u, g, id, v) => {
      const w = fangWalk(u, g, 0.15, 0.45, -100, 470), ph = (g * 0.35) % 1;
      const mx = lerp(900, 1050, ph < 0.5 ? ph * 2 : 2 - ph * 2), carryOn = ph < 0.5;
      let t = movingTruck(1290, 720, 0.95) + box(840, 700, 0.8) + box(800, 700, 0.8) + person({ x: 680, y: 700, s: 1.55, who: 'yu', pose: P.stand(), g, face: u > 0.4 ? -1 : 1, mood: u > 0.45 ? 'shock' : 'sad' });
      t += person({ x: mx, y: 700, s: 1.7, who: 'c3mover', pose: carryOn ? carry(g, 0.9) : P.walk(g, 0.9), g, face: carryOn ? 1 : -1 });
      if (carryOn) { const [bx, by] = wrist('c3mover', carry(g, 0.9), mx, 700, 1.7); t += box(bx, by + 40, 1); }
      if (u > 0.15) t += person({ x: w.x, y: 690, s: w.s, who: 'fang', pose: w.pose, g, mood: u > 0.45 ? 'shock' : 'calm', detail: true });
      return t + old96(id, v, g, false);
    },
    cam: [[800, 440, 1500], [800, 440, 1500]],
  },
};
