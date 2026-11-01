// 英文第二章 Where were you?：每一镜怎么画、怎么动（对照 第六堂课/分镜/英文第二章_Where_were_you.md）
// 回忆的镜头发黄、角上有时间牌。拿相机的女孩、来问 Green 老师的学生，回忆里都只画模糊的影子，不让人一眼认出是谁。
import { GOLD, INK, RED, f, glow, lerp, rng, seg, sky, wav } from './core';
import { P, faceCU, person } from './rig';
import { HAND, SANS, backstageBg, corridorBg, flashback, notebookPage, stickyNote, talk, timeTag } from './shotsE1';
import type { ShotDef } from './Film';

// ---------------- 场景 ----------------
/** 办公室：窗、文件柜、书桌、打印机，地上散着纸 */
export const officeBg = (id: string, papers = true) => {
  let o = sky(id, '#E6E2D6', '#D9D3C4') + `<rect x="120" y="110" width="420" height="300" fill="#CFE3EC" stroke="#8A8478" stroke-width="12"/><line x1="330" y1="110" x2="330" y2="410" stroke="#8A8478" stroke-width="8"/>` +
    `<rect x="1300" y="220" width="220" height="400" fill="#8A9AA6" stroke="${INK}" stroke-width="3"/>` + [0, 1, 2].map((i) => `<rect x="1320" y="${250 + i * 120}" width="180" height="96" fill="#9AAAB6" stroke="${INK}" stroke-opacity=".4"/><rect x="1385" y="${290 + i * 120}" width="50" height="10" fill="#5A6A76"/>`).join('') +
    `<rect x="-200" y="620" width="2000" height="500" fill="#B9A988"/>` +
    `<rect x="660" y="470" width="520" height="24" fill="#7A5236"/><rect x="680" y="494" width="20" height="130" fill="#5A3E28"/><rect x="1140" y="494" width="20" height="130" fill="#5A3E28"/>` +
    `<rect x="980" y="400" width="170" height="74" rx="8" fill="#DADCDE" stroke="${INK}" stroke-width="3"/><rect x="1000" y="392" width="130" height="10" fill="#9AA0A6"/><rect x="996" y="440" width="138" height="8" fill="#5A6066"/>`; // 打印机
  if (papers) { const r = rng(61); for (let i = 0; i < 14; i++) { const x = 300 + r() * 1100, y = 650 + r() * 160; o += `<g transform="translate(${f(x)},${f(y)}) rotate(${f(r() * 60 - 30)})"><rect x="-34" y="-22" width="68" height="44" fill="#F8F6EE" stroke="#BDB6A6"/><path d="M-24,-10 h48 M-24,0 h40" stroke="${GOLD}" stroke-width="3" opacity=".7"/></g>`; } }
  return o;
};
/** 音乐教室：五线谱海报、钢琴、谱架、一套鼓 */
const musicBg = (id: string) =>
  sky(id, '#E9E2D2', '#DCD2BE') + `<rect x="160" y="140" width="380" height="220" fill="#F8F4EA" stroke="#8A7A66" stroke-width="6"/>` +
  Array.from({ length: 5 }, (_, i) => `<line x1="190" y1="${190 + i * 22}" x2="510" y2="${190 + i * 22}" stroke="${INK}" stroke-width="2"/>`).join('') +
  [[240, 212], [300, 234], [360, 190], [420, 256], [470, 212]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="8" fill="${INK}"/><line x1="${x + 10}" y1="${y}" x2="${x + 10}" y2="${y - 50}" stroke="${INK}" stroke-width="3"/>`).join('') +
  `<rect x="-200" y="620" width="2000" height="500" fill="#A88E6A"/>` +
  `<rect x="1160" y="400" width="360" height="200" fill="#2A2220"/><rect x="1170" y="470" width="340" height="30" fill="#F4F1E8"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${1180 + i * 28}" y="470" width="14" height="18" fill="#1E1A18"/>`).join('') + `<rect x="1180" y="600" width="20" height="40" fill="#2A2220"/><rect x="1480" y="600" width="20" height="40" fill="#2A2220"/>` +
  `<line x1="700" y1="420" x2="700" y2="630" stroke="#3A3A44" stroke-width="6"/><path d="M640,410 L760,410 L750,450 L650,450 Z" fill="#3A3A44"/>`;
const drumKit = (x: number, y: number, s: number, g: number) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="-60" rx="80" ry="80" fill="#B23A2E" stroke="${INK}" stroke-width="5"/><ellipse cx="0" cy="-60" rx="56" ry="56" fill="#F4F1E8" stroke="${INK}" stroke-width="3"/><ellipse cx="-120" cy="-120" rx="44" ry="16" fill="#C9B07A" stroke="${INK}" stroke-width="3" transform="rotate(${f(wav(g, 2) * 3)} -120 -120)"/><line x1="-120" y1="-120" x2="-120" y2="20" stroke="#5A5A66" stroke-width="5"/><rect x="80" y="-110" width="70" height="60" rx="6" fill="#B23A2E" stroke="${INK}" stroke-width="4"/></g>`;
/** 大鼓箱：open 0—1 盖子打开 */
const drumCase = (x: number, y: number, s: number, open = 0, inside = true) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-140" y="-200" width="280" height="200" rx="20" fill="#2E2E36" stroke="${INK}" stroke-width="5"/>${inside && open > 0.1 ? `<ellipse cx="0" cy="-110" rx="100" ry="70" fill="#B23A2E" stroke="${INK}" stroke-width="4" opacity="${f(open)}"/><ellipse cx="0" cy="-110" rx="70" ry="48" fill="#F4F1E8" opacity="${f(open)}"/>` : ''}<g transform="translate(-140,-200) rotate(${f(-open * 100)})"><rect x="0" y="-40" width="280" height="40" rx="10" fill="#3A3A44" stroke="${INK}" stroke-width="5"/>${open > 0.4 ? `<rect x="14" y="-6" width="252" height="10" fill="#6E6E7A"/>` : ''}</g><circle cx="-90" cy="14" r="16" fill="#1E1E22"/><circle cx="90" cy="14" r="16" fill="#1E1E22"/><rect x="-30" y="-120" width="60" height="16" rx="6" fill="#5A5A66" opacity="${f(1 - open)}"/></g>`;
/** 花园：花坛、树、阳光 */
export const gardenBg = (id: string) =>
  sky(id, '#CFE3EA', '#EAF0E4') + `<circle cx="1320" cy="160" r="70" fill="#FFE9A8" opacity=".8"/>` +
  [140, 520, 1500].map((x, i) => `<rect x="${x - 12}" y="300" width="24" height="320" fill="#6E5A40"/><circle cx="${x}" cy="280" r="${110 - i * 8}" fill="#6E9A5E"/><circle cx="${x - 50}" cy="320" r="70" fill="#5E8A50"/><circle cx="${x + 56}" cy="316" r="66" fill="#7AA868"/>`).join('') +
  `<path d="M-200,600 L1800,600 L1800,1100 L-200,1100 Z" fill="#8AAA6A"/><path d="M200,700 Q800,640 1400,700 L1400,800 Q800,760 200,800 Z" fill="#7A5A3A"/>`;
export const flowers = (seed: number, g: number, x0 = 220, x1 = 1380, y = 720) => { const r = rng(seed); let o = ''; for (let i = 0; i < 26; i++) { const x = x0 + r() * (x1 - x0), yy = y + r() * 60, c = ['#E85A6A', '#F2C14E', '#F4F1E8', '#C86AD0'][Math.floor(r() * 4)], sw = wav(g, 2 + r(), r()) * 3; o += `<line x1="${f(x)}" y1="${f(yy)}" x2="${f(x + sw)}" y2="${f(yy - 50)}" stroke="#4A7A3A" stroke-width="4"/>` + [0, 1, 2, 3, 4].map((k) => `<circle cx="${f(x + sw + Math.cos(k * 1.26) * 12)}" cy="${f(yy - 50 + Math.sin(k * 1.26) * 12)}" r="9" fill="${c}"/>`).join('') + `<circle cx="${f(x + sw)}" cy="${f(yy - 50)}" r="7" fill="#F2C14E"/>`; } return o; };
/** 证书：上半截印好了，下半截空白（half 0—1 印到哪儿） */
export const certificate = (x: number, y: number, s: number, half: number, rot = 0) => {
  let o = `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="8" y="10" width="560" height="400" fill="#000" opacity=".18"/><rect width="560" height="400" fill="#FBF8EE"/><rect x="16" y="16" width="528" height="368" fill="none" stroke="${GOLD}" stroke-width="5"/>`;
  const ink = (t: number) => (half >= t ? 1 : 0);
  o += `<text x="280" y="86" font-size="40" font-weight="900" fill="#8E2A26" text-anchor="middle" opacity="${ink(0.15)}" ${SANS}>CERTIFICATE</text>`;
  o += `<text x="280" y="134" font-size="26" fill="${INK}" text-anchor="middle" opacity="${ink(0.3)}" ${SANS}>English Festival</text>`;
  o += `<line x1="140" y1="186" x2="420" y2="186" stroke="${GOLD}" stroke-width="3" opacity="${ink(0.45)}"/>`;
  o += `<text x="280" y="250" font-size="28" fill="${INK}" text-anchor="middle" opacity="${ink(0.65)}" ${SANS}>This is to certify that</text><line x1="120" y1="320" x2="440" y2="320" stroke="${INK}" stroke-width="2" opacity="${ink(0.85)}"/>`;
  return o + '</g>';
};
/** 三张不在场证明卡 */
const alibiCard = (x: number, y: number, who: string, name: string, k: number, g: number) => `<g transform="translate(${x},${f(y - (1 - k) * 30)})" opacity="${f(k)}"><rect x="6" y="8" width="300" height="380" fill="#000" opacity=".2"/><rect width="300" height="380" fill="#FBF7EA"/><rect width="300" height="230" fill="#E6E0D2"/>${person({ x: 150, y: 360, s: 2.6, who, pose: P.stand(), g })}<rect y="230" width="300" height="150" fill="#FBF7EA"/><text x="150" y="290" font-size="40" font-weight="900" fill="${INK}" text-anchor="middle" ${HAND}>${name}</text><text x="150" y="350" font-size="34" fill="#8E2A26" text-anchor="middle" ${HAND}>2:15 → ?</text></g>`;

export const SHOTS_E2: Record<string, ShotDef> = {
  'e2.notebook': {
    bg: (id) => sky(id, '#6E4C30', '#5E3E26'),
    fg: (u, g) => { const k = seg(u, 0.15, 0.85), px = 520 + k * 520 + Math.sin(g * 9) * 10; return notebookPage(500, 230, 1.1, 'Where were you at 2:15?', k) + `<path d="M${f(px)},${f(380 - 10 * Math.sin(g * 9))} l120,-260" stroke="#E4B83E" stroke-width="16" stroke-linecap="round"/>`; },
    cam: [[820, 440, 1000], [820, 430, 900]],
  },
  'e2.benPlan': {
    bg: (id) => corridorBg(id),
    fg: (u, g) => person({ x: 860, y: 900, s: 2.4, who: 'ben', pose: P.mix(P.stand(), P.point(1), 0.4 + 0.3 * Math.sin(g * 1.5)), g, face: -1, mood: 'calm' }) + person({ x: 520, y: 900, s: 2.3, who: 'you', pose: { ...P.stand(), head: 6 }, g, hold: 'notebook' }),
    cam: [[720, 520, 1300], [720, 500, 1150]],
  },
  'e2.office': {
    bg: (id) => officeBg(id),
    fg: (u, g) => person({ x: 1200, y: 760, s: 1.5, who: 'green', pose: { ...P.stand(), aF: 60, eF: 40 }, g, face: -1, hold: 'paper' }) + person({ x: lerp(-100, 380, seg(u, 0, 0.6)), y: 800, s: 1.5, who: 'ben', pose: P.walk(g, 1 - seg(u, 0.5, 0.6)), g, face: 1 }) + person({ x: lerp(-260, 220, seg(u, 0, 0.6)), y: 800, s: 1.45, who: 'you', pose: P.walk(g + 0.4, 1 - seg(u, 0.5, 0.6)), g, face: 1 }),
    cam: [[800, 500, 1600], [820, 520, 1400]],
  },
  'e2.benAsk': {
    bg: (id) => officeBg(id),
    fg: (u, g) => person({ x: 1100, y: 840, s: 2, who: 'green', pose: P.stand(), g, face: -1, hold: 'paper' }) + person({ x: 600, y: 860, s: 2.05, who: 'ben', pose: P.mix(P.stand(), P.point(0.7), 0.4), g, face: 1 }) + person({ x: 380, y: 860, s: 2, who: 'you', pose: P.stand(), g, face: 1, hold: 'notebook' }),
    cam: [[780, 520, 1350], [800, 520, 1250]],
  },
  'e2.greenTalk': {
    bg: (id) => officeBg(id, false) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#EDE8DE" opacity=".45"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'green', g, mouth: talk(g), brow: 0.2 }),
    cam: [[800, 460, 1250], [800, 450, 1100]],
  },
  'e2.printerStop': {
    bg: (id) => officeBg(id, false),
    fg: (u, g, id, v) => {
      const out = Math.min(seg(u, 0, 0.45), 0.5) * 2, dark = seg(u, 0.45, 0.5) - seg(u, 0.9, 1) * 0;
      let o = person({ x: 860, y: 760, s: 1.5, who: 'green', pose: { ...P.stand(), aF: 135, eF: 135, head: 8 }, g, face: 1, hold: 'phone' });
      o += `<g transform="translate(1065,440)"><rect x="-60" y="${f(-80 * out)}" width="120" height="${f(80 * out)}" fill="#FBF8EE" stroke="#BDB6A6"/><text x="0" y="${f(-80 * out + 26)}" font-size="16" font-weight="900" fill="#8E2A26" text-anchor="middle" ${SANS}>CERTIFICATE</text></g>`;
      o += `<rect x="-200" y="-200" width="2000" height="1400" fill="#0E0E14" opacity="${f(dark * 0.85)}"/>`;
      return o + flashback(id) + timeTag(220, 110, '2:15', v);
    },
    cam: [[900, 480, 1300], [980, 470, 1100]],
  },
  'e2.halfCert': {
    bg: (id) => sky(id, '#D9D3C4', '#C9C1B0'),
    fg: (u, g, id) => glow(id, 800, 440, 380, g, 0, 0.25) + certificate(520, 240, 1, 0.5) + `<rect x="520" y="460" width="560" height="${f(160 * (1 - seg(u, 0.2, 0.7)))}" fill="none"/>` + `<g opacity="${f(seg(u, 0.3, 0.6))}"><path d="M1100,440 l60,0 M1100,560 l60,0" stroke="${RED}" stroke-width="5"/><text x="1180" y="452" font-size="34" fill="${RED}" ${HAND}>printed</text><text x="1180" y="572" font-size="34" fill="${RED}" ${HAND}>empty!</text></g>`,
    cam: [[820, 440, 1150], [820, 440, 1050]],
  },
  'e2.whisper': {
    bg: (id) => officeBg(id),
    fg: (u, g, id) => `<g opacity=".55" filter="url(#${id}s)">${person({ x: 1250, y: 680, s: 1.1, who: 'green', pose: P.stand(), g, face: -1, hold: 'paper' })}</g>` +
      person({ x: 640, y: 900, s: 2.1, who: 'you', pose: { ...P.stand(), lean: 6, head: 10 }, g }) + person({ x: 920, y: 900, s: 2.15, who: 'ben', pose: { ...P.stand(), lean: 14, head: 12, aF: 100, eF: 120 }, g, face: -1 }),
    cam: [[820, 520, 1300], [800, 500, 1150]],
  },
  'e2.greenPhone': {
    bg: (id) => officeBg(id),
    fg: (u, g, id, v) => {
      let o = person({ x: 820, y: 760, s: 1.5, who: 'green', pose: { ...P.stand(), aF: 135, eF: 135, head: 8 + Math.sin(g * 5) * 6 }, g, face: -1, hold: 'phone' });
      const k = seg(u, 0.2, 0.8);
      o += `<g opacity=".5" filter="url(#${id}s)">${person({ x: lerp(1700, 1250, k), y: 780, s: 1.4, who: 'stuA', pose: P.walk(g, 1 - k), g, face: -1 })}${person({ x: lerp(1900, 1450, k), y: 780, s: 1.3, who: 'stuB', pose: P.walk(g + 0.4, 1 - k), g, face: -1 })}</g>`;
      const say = (Math.floor(g * 0.8) % 2) === 0;
      if (k > 0.5) o += `<g transform="translate(560,${say ? 330 : 360})"><rect x="-120" y="-50" width="240" height="80" rx="20" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><path d="M60,30 l40,40 l-10,-40 z" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><text x="0" y="6" font-size="38" text-anchor="middle" fill="${INK}" ${HAND}>Yes, yes…</text></g>`;
      return o + flashback(id) + timeTag(220, 110, '2:10', v);
    },
    cam: [[900, 500, 1500], [900, 520, 1350]],
  },
  'e2.musicRoom': {
    bg: (id) => musicBg(id),
    fg: (u, g) => drumKit(400, 640, 1.2, g) + drumCase(1000, 760, 1, 0.6, false) + person({ x: 800, y: 780, s: 1.6, who: 'drummer', pose: P.mix(P.bow(0.6), P.give(0.8), 0.5 + 0.3 * Math.sin(g * 1.5)), g, face: 1 }),
    cam: [[800, 500, 1600], [800, 540, 1350]],
  },
  'e2.maxOpen': {
    bg: (id) => musicBg(id),
    fg: (u, g) => drumCase(980, 780, 1.2, seg(u, 0.3, 0.8)) + person({ x: 700, y: 800, s: 1.8, who: 'drummer', pose: P.mix(P.stand(), P.point(0.8), seg(u, 0.2, 0.5)), g, face: 1, mood: 'laugh' }),
    cam: [[820, 520, 1300], [880, 560, 1150]],
  },
  'e2.caseInside': {
    bg: (id) => sky(id, '#3A3A44', '#2A2A32'),
    fg: (u, g, id) => drumCase(800, 760, 2.4, 1) + glow(id, 800, 500, 260, g, 0, 0.2) + `<text x="800" y="260" font-size="64" font-weight="900" fill="${RED}" text-anchor="middle" opacity="${f(seg(u, 0.4, 0.7))}" ${HAND}>no panda</text>`,
    cam: [[800, 460, 1300], [800, 440, 1150]],
  },
  'e2.benAskMax': {
    bg: (id) => musicBg(id),
    fg: (u, g) => person({ x: 1080, y: 860, s: 2.05, who: 'drummer', pose: P.stand(), g, face: -1 }) + person({ x: 620, y: 860, s: 2.05, who: 'ben', pose: P.mix(P.stand(), P.point(0.8), 0.4 + 0.3 * Math.sin(g * 1.6)), g, face: 1 }) + person({ x: 400, y: 860, s: 2, who: 'you', pose: P.stand(), g, face: 1, hold: 'notebook' }),
    cam: [[780, 520, 1350], [800, 520, 1250]],
  },
  'e2.tripFlash': {
    bg: (id) => backstageBg(id),
    fg: (u, g, id, v) => {
      const k = seg(u, 0, 0.5), trip = seg(u, 0.45, 0.6), dark = seg(u, 0.58, 0.62);
      const x = lerp(300, 820, k);
      let o = `<path d="M-200,740 Q600,700 900,760 Q1100,800 1300,700 L1310,640" stroke="#1E1E22" stroke-width="8" fill="none"/><rect x="1290" y="600" width="50" height="60" fill="#DADCDE" stroke="${INK}" stroke-width="3"/>`;
      o += `<rect x="${f(lerp(1296, 1240, trip))}" y="${f(lerp(624, 700, trip))}" width="18" height="14" fill="#2A2A2E"/>`; // 插头被扯出来
      o += `<g transform="rotate(${f(trip * 30)} ${f(x)} 780)">${person({ x, y: 780, s: 1.5, who: 'drummer', pose: { ...P.walk(g * 1.2, 1 - trip), aF: 70, eF: 30, aB: 70, eB: 30, lean: 10 + trip * 20 }, g, face: 1 })}<ellipse cx="${f(x + 70)}" cy="620" rx="70" ry="70" fill="#B23A2E" stroke="${INK}" stroke-width="4"/></g>`;
      o += `<rect x="-200" y="-200" width="2000" height="1400" fill="#06060A" opacity="${f(dark * 0.9)}"/>`;
      return o + flashback(id) + timeTag(1380, 110, '2:15', v);
    },
    cam: [[800, 520, 1600], [880, 580, 1300]],
  },
  'e2.plug': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A') + `<rect x="700" y="300" width="200" height="260" rx="14" fill="#DADCDE" stroke="${INK}" stroke-width="5"/><rect x="760" y="380" width="22" height="50" rx="6" fill="#2A2A2E"/><rect x="818" y="380" width="22" height="50" rx="6" fill="#2A2A2E"/>`,
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.5), lit = seg(u, 0.5, 0.6);
      return `<rect x="-200" y="-200" width="2000" height="1400" fill="#06060A" opacity="${f(0.75 * (1 - lit))}"/>` +
        `<g transform="translate(${f(lerp(1200, 800, k))},${f(lerp(700, 470, k))})"><rect x="-70" y="-50" width="140" height="80" rx="16" fill="#2A2A2E"/><rect x="-46" y="-90" width="18" height="44" fill="#B8B8B8"/><rect x="12" y="-90" width="18" height="44" fill="#B8B8B8"/><path d="M0,30 Q60,200 400,300" stroke="#1E1E22" stroke-width="16" fill="none"/></g>` +
        (lit > 0 ? glow(id, 800, 300, 400, g, 0, lit * 0.4) : '');
    },
    cam: [[820, 440, 1200], [820, 440, 1100]],
  },
  'e2.girlFlash': {
    bg: (id) => backstageBg(id),
    fg: (u, g, id, v) => {
      const x = lerp(1700, -200, seg(u, 0.1, 0.9));
      return `<g opacity=".7" filter="url(#${id}s)">${person({ x, y: 780, s: 1.4, who: 'mia', pose: P.walk(g * 1.6, 1.3), g, face: -1, hold: 'camera' })}</g>` +
        `<path d="M${f(x + 60)},620 h220 M${f(x + 60)},680 h300 M${f(x + 60)},740 h180" stroke="#F4F1E8" stroke-width="5" opacity=".35"/>` + flashback(id) + timeTag(1380, 110, '2:12', v);
    },
    cam: [[800, 520, 1600], [800, 540, 1500]],
  },
  'e2.corridor': {
    bg: (id) => corridorBg(id),
    fg: (u, g) => {
      const x = lerp(1700, -200, seg(u, 0.1, 0.9));
      return person({ x: 500, y: 820, s: 1.6, who: 'ben', pose: { ...P.stand(), head: -6 }, g, face: 1 }) + person({ x: 340, y: 820, s: 1.55, who: 'you', pose: P.stand(), g, face: 1, hold: 'notebook' }) +
        person({ x, y: 830, s: 1.45, who: 'mia', pose: P.walk(g * 1.6, 1.3), g, face: -1, hold: 'camera' }) + `<path d="M${f(x + 40)},680 h160 M${f(x + 40)},740 h220" stroke="#8A8478" stroke-width="4" opacity=".5"/>`;
    },
    cam: [[800, 520, 1600], [700, 560, 1450]],
  },
  'e2.miaCU': {
    bg: (id) => corridorBg(id) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#EDE8DE" opacity=".45"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'mia', g, mouth: talk(g), brow: 0.4, look: Math.sin(g * 3) * 0.5 }),
    cam: [[800, 460, 1250], [800, 450, 1100]],
  },
  'e2.benAskMia': {
    bg: (id) => corridorBg(id),
    fg: (u, g) => person({ x: 1050, y: 860, s: 1.85, who: 'mia', pose: { ...P.stand(), head: Math.sin(g * 4) * 4 }, g, face: -1, hold: 'camera' }) + person({ x: 660, y: 860, s: 2.05, who: 'ben', pose: P.mix(P.stand(), P.point(0.7), 0.4), g, face: 1 }) + person({ x: 440, y: 860, s: 2, who: 'you', pose: P.stand(), g, face: 1, hold: 'notebook' }),
    cam: [[780, 520, 1350], [800, 520, 1250]],
  },
  'e2.gardenFlash': {
    bg: (id) => gardenBg(id),
    fg: (u, g, id, v) => {
      const flash = ((g * 0.7) % 1) < 0.08 ? 1 : 0;
      return flowers(71, g) + person({ x: 980, y: 820, s: 1.5, who: 'mia', pose: { ...P.bow(0.3), aF: 90, eF: 60 }, g, face: -1, hold: 'camera' }) +
        `<rect x="-200" y="-200" width="2000" height="1400" fill="#fff" opacity="${f(flash * 0.5)}"/>` + flashback(id) + timeTag(220, 110, '2:15', v);
    },
    cam: [[800, 520, 1600], [860, 600, 1300]],
  },
  'e2.pen': {
    bg: (id) => sky(id, '#EDE6D6', '#DCD3C0'),
    fg: (u, g) => {
      const scr = Math.sin(g * 12) * 30 * (1 - seg(u, 0.5, 0.6)), give = seg(u, 0.6, 0.95);
      return `<rect x="420" y="300" width="560" height="380" fill="#FBF7EA" stroke="#C9B994" stroke-width="3"/>` + Array.from({ length: 6 }, (_, i) => `<line x1="420" y1="${340 + i * 56}" x2="980" y2="${340 + i * 56}" stroke="#A9C6E2" stroke-width="2"/>`).join('') +
        `<path d="M520,420 q20,-10 40,0" stroke="#B8C6E2" stroke-width="3" fill="none"/>` +
        `<g transform="translate(${f(560 + scr)},430) rotate(-30)"><rect x="-8" y="-140" width="16" height="140" rx="6" fill="#2F5DA8"/><path d="M-8,0 L0,22 L8,0 Z" fill="#C9C1B0"/></g>` +
        `<g transform="translate(${f(lerp(1500, 1080, give))},${f(lerp(700, 520, give))}) rotate(-60)"><rect x="-10" y="-160" width="20" height="160" rx="8" fill="#C23B2E"/><path d="M-10,0 L0,24 L10,0 Z" fill="#2B2722"/></g>`;
    },
    cam: [[760, 480, 1200], [800, 480, 1150]],
  },
  'e2.benPen': {
    bg: (id) => corridorBg(id),
    fg: (u, g) => person({ x: 1000, y: 860, s: 1.85, who: 'mia', pose: P.mix(P.stand(), P.give(1), seg(u, 0.4, 0.7)), g, face: -1, hold: 'camera' }) + person({ x: 700, y: 860, s: 2.05, who: 'ben', pose: P.give(seg(u, 0.2, 0.6)), g, face: 1, hold: 'pen', mood: 'laugh' }),
    cam: [[840, 520, 1250], [850, 520, 1150]],
  },
  'e2.miaRun': {
    bg: (id) => corridorBg(id),
    fg: (u, g) => {
      const run = seg(u, 0.5, 1), x = lerp(900, -300, run);
      return person({ x: 520, y: 840, s: 1.7, who: 'ben', pose: P.stand(), g, face: 1 }) + person({ x, y: 850, s: 1.6, who: 'mia', pose: run > 0 ? P.walk(g * 1.6, 1.3) : P.write(g), g, face: -1, hold: run > 0 ? 'camera' : 'paper' });
    },
    cam: [[760, 520, 1500], [700, 540, 1450]],
  },
  'e2.alibiBoard': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A') + `<rect x="160" y="140" width="1280" height="620" rx="10" fill="#7A5236"/><rect x="180" y="160" width="1240" height="580" fill="#C9A06A"/>`,
    fg: (u, g) => alibiCard(250, 260, 'green', 'Ms Green', 1, g) + alibiCard(650, 260, 'drummer', 'Max', 1, g) + alibiCard(1050, 260, 'mia', 'Mia', 1, g),
    cam: [[800, 450, 1400], [800, 450, 1380]],
  },
  'e2.mmm': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A') + `<rect x="160" y="140" width="1280" height="620" rx="10" fill="#7A5236"/><rect x="180" y="160" width="1240" height="580" fill="#C9A06A"/>`,
    fg: (u, g, id) => {
      const names: [number, string][] = [[300, 'Margaret Green'], [800, 'Max'], [1200, 'Mia']];
      return alibiCard(250, 260, 'green', 'Ms Green', 1, g) + alibiCard(650, 260, 'drummer', 'Max', 1, g) + alibiCard(1050, 260, 'mia', 'Mia', 1, g) +
        names.map(([x, n], i) => { const k = seg(u, 0.2 + i * 0.2, 0.35 + i * 0.2); return `<g opacity="${f(k)}">${glow(id, x + (i === 0 ? 100 : 0), 690, 80, g, i, 0.5)}<text x="${x + (i === 0 ? 100 : 0)}" y="700" font-size="44" font-weight="900" text-anchor="middle" ${HAND}><tspan fill="${RED}" font-size="64">M</tspan><tspan fill="${INK}">${n.slice(1)}</tspan></text></g>`; }).join('');
    },
    cam: [[800, 470, 1400], [800, 470, 1380]],
  },
  'e2.write': {
    bg: (id) => sky(id, '#6E4C30', '#5E3E26'),
    fg: (u, g) => { const k = seg(u, 0.1, 0.6), px = 520 + k * 300 + Math.sin(g * 9) * 10; return notebookPage(500, 230, 1.1, 'At 2:15, Max was ', k) + `<path d="M${f(px)},${f(380 - 10 * Math.sin(g * 9))} l120,-260" stroke="#E4B83E" stroke-width="16" stroke-linecap="round"/>`; },
    cam: [[820, 440, 1000], [820, 430, 900]],
  },
  'e2.noteAgain': {
    bg: (id) => sky(id, '#3A302A', '#2A2420'),
    fg: (u, g, id) => {
      const k = seg(u, 0.3, 0.7);
      return glow(id, 800, 450, 420, g, 0, 0.3) + stickyNote(640, 270, 1.15, 1) + glow(id, 760, 370, 90, g, 0, k * 0.7) +
        `<g transform="translate(${f(lerp(1200, 790, k))},${f(lerp(700, 380, k))})"><circle r="90" fill="#CFE6F2" fill-opacity=".25" stroke="#3A3A44" stroke-width="12"/><line x1="64" y1="64" x2="150" y2="150" stroke="#3A3A44" stroke-width="22" stroke-linecap="round"/></g>`;
    },
    cam: [[820, 440, 1000], [800, 420, 860]],
  },
};
