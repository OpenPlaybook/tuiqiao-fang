// 英文第三章 The Note：每一镜怎么画、怎么动（对照 第六堂课/分镜/英文第三章_The_Note.md）
import { GOLD, INK, RED, f, glow, lerp, seg, sky } from './core';
import { P, faceCU, person } from './rig';
import { HAND, SANS, clock, corridorBg, flashback, notebookPage, stickyNote, talk, trophy } from './shotsE1';
import { flowers, gardenBg, officeBg } from './shotsE2';
import type { ShotDef } from './Film';

/** 楼梯（侧面）：一级一级往右上走 */
const stairsBg = (id: string) => {
  let o = sky(id, '#E6DFD0', '#D9D0BE') + `<rect x="-200" y="680" width="2000" height="400" fill="#B9B2A4"/>`;
  for (let i = 0; i < 9; i++) o += `<rect x="${200 + i * 140}" y="${680 - i * 60}" width="${1400 - i * 140}" height="60" fill="${i % 2 ? '#CFC6B4' : '#C6BCA8'}" stroke="#9A9284" stroke-width="2"/>`;
  return o + `<path d="M180,620 L1500,80" stroke="#7A6A58" stroke-width="10"/><path d="M180,620 L180,700 M500,488 L500,560 M820,356 L820,430 M1140,224 L1140,300" stroke="#7A6A58" stroke-width="6"/>`;
};
/** 一张小便利贴：写“Thx for the pen! — M” */
const thanksNote = (x: number, y: number, s: number, rot = 5, reveal = 1) => {
  const lines = ['Thx for', 'the pen!', '— M'];
  let o = `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})"><rect x="6" y="8" width="220" height="200" fill="#000" opacity=".18"/><rect width="220" height="200" fill="#F6DC5A"/><rect width="220" height="28" fill="#EFD24C"/>`;
  let k = 0; const total = lines.join('').length;
  lines.forEach((l, i) => { const n = Math.max(0, Math.min(l.length, Math.round(reveal * total) - k)); k += l.length; o += `<text x="${i === 2 ? 110 : 20}" y="${74 + i * 50}" font-size="34" fill="#2B2A6E" ${HAND}>${l.slice(0, n)}</text>`; });
  return o + '</g>';
};
/** 报纸头版：空着的照片框 */
const newspaper = (x: number, y: number, s: number, g: number, photo = 0) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="6" y="8" width="420" height="520" fill="#000" opacity=".2"/><rect width="420" height="520" fill="#F4F1E8"/><text x="210" y="62" font-size="44" font-weight="900" fill="${INK}" text-anchor="middle" font-family="Georgia, serif">SCHOOL NEWS</text><line x1="20" y1="80" x2="400" y2="80" stroke="${INK}" stroke-width="3"/><rect x="30" y="100" width="360" height="230" fill="${photo > 0 ? '#CFE3EA' : '#E6E0D2'}" stroke="${INK}" stroke-dasharray="${photo > 0 ? '0' : '10 8'}" stroke-width="3"/>${photo > 0 ? '' : `<text x="210" y="226" font-size="40" fill="#9A9284" text-anchor="middle" ${SANS}>photo?</text>`}${Array.from({ length: 7 }, (_, i) => `<line x1="30" y1="${360 + i * 22}" x2="${i % 3 === 2 ? 260 : 390}" y2="${360 + i * 22}" stroke="#9A9284" stroke-width="5"/>`).join('')}</g>`;

export const SHOTS_E3: Record<string, ShotDef> = {
  'e3.stairs': {
    bg: (id) => stairsBg(id),
    fg: (u, g) => person({ x: 560, y: 560, s: 1.6, who: 'you', pose: P.sitRest(), g, face: 1, hold: 'notebook' }) + person({ x: 860, y: 560, s: 1.65, who: 'ben', pose: { ...P.sitRest(), head: 10 }, g, face: -1 }) + `<g transform="translate(680,520) rotate(-6) scale(.32)">${stickyNote(0, 0, 1, 1, 0)}</g>`,
    cam: [[760, 460, 1400], [720, 470, 1150]],
  },
  'e3.benThink': {
    bg: (id) => stairsBg(id) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#EDE8DE" opacity=".45"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'ben', g, mouth: talk(g), brow: -0.3, look: -0.6 }),
    cam: [[800, 460, 1250], [800, 450, 1100]],
  },
  'e3.office': {
    bg: (id) => officeBg(id),
    fg: (u, g) => {
      const k = seg(u, 0, 0.6);
      return person({ x: 1150, y: 780, s: 1.6, who: 'green', pose: P.mix(P.stand(), { ...P.stand(), head: -10 }, seg(u, 0.5, 0.8)), g, face: -1, hold: 'paper' }) +
        person({ x: lerp(-100, 640, k), y: 800, s: 1.6, who: 'ben', pose: k < 1 ? P.walk(g * 1.6, 1.3) : P.point(0.7), g, face: 1 }) + person({ x: lerp(-280, 440, k), y: 800, s: 1.55, who: 'you', pose: k < 1 ? P.walk(g * 1.6 + 0.4, 1.3) : P.stand(), g, face: 1, hold: 'notebook' });
    },
    cam: [[800, 520, 1600], [820, 540, 1350]],
  },
  'e3.greenNo': {
    bg: (id) => officeBg(id, false) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#EDE8DE" opacity=".45"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'green', g, mouth: talk(g), brow: -0.6, shake: seg(u, 0, 0.5) * 0.7 }),
    cam: [[800, 460, 1250], [800, 450, 1100]],
  },
  'e3.flashPen': {
    bg: (id) => corridorBg(id),
    fg: (u, g, id) => person({ x: 1000, y: 860, s: 1.85, who: 'mia', pose: P.mix(P.stand(), P.point(0.6), 0.4), g, face: -1, hold: 'camera' }) + person({ x: 700, y: 860, s: 2.05, who: 'ben', pose: P.stand(), g, face: 1 }) +
      `<g transform="translate(1040,300)"><rect x="-300" y="-70" width="600" height="110" rx="26" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><path d="M40,40 l20,50 l20,-50 z" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><text x="0" y="6" font-size="38" text-anchor="middle" fill="${INK}" ${HAND}>Can you borrow me your pen?</text>` +
      `<ellipse cx="-36" cy="-6" rx="${f(70 * seg(u, 0.4, 0.7))}" ry="${f(34 * seg(u, 0.4, 0.7))}" fill="none" stroke="${RED}" stroke-width="5"/></g>` + flashback(id),
    cam: [[860, 480, 1300], [880, 460, 1150]],
  },
  'e3.noteFlip': {
    bg: (id) => sky(id, '#3A302A', '#2A2420'),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.5), w = seg(u, 0.5, 0.9);
      return glow(id, 800, 450, 420, g, 0, 0.3) + stickyNote(640, 270, 1.15, 1) +
        (k > 0.02 ? `<path d="M672,370 L${f(672 + 110 * k)},350" stroke="${RED}" stroke-width="6" stroke-linecap="round"/>` : '') +
        `<text x="700" y="310" font-size="44" fill="${RED}" ${HAND}>${'Borrowed'.slice(0, Math.round(w * 8))}</text>`;
    },
    cam: [[820, 440, 1000], [800, 400, 880]],
  },
  'e3.cover': {
    bg: (id) => sky(id, '#6E4C30', '#5E3E26'),
    fg: (u, g) => `<rect x="420" y="180" width="760" height="560" rx="14" fill="#E4B83E" stroke="${INK}" stroke-width="5"/><rect x="420" y="180" width="60" height="560" fill="#C99A2A"/><text x="800" y="300" font-size="54" font-weight="900" fill="#7A4E1E" text-anchor="middle" ${HAND}>Case notes</text>` +
      thanksNote(860, lerp(380, 400, seg(u, 0, 0.3)), 1.1, 6),
    cam: [[800, 460, 1250], [960, 500, 900]],
  },
  'e3.twoNotes': {
    bg: (id) => sky(id, '#3A302A', '#2A2420'),
    fg: (u, g, id) => {
      const m = seg(u, 0.2, 0.9), lx = lerp(560, 1040, (Math.sin(m * Math.PI * 2 - Math.PI / 2) + 1) / 2);
      return glow(id, 800, 450, 460, g, 0, 0.25) + stickyNote(300, 240, 1, 1, -4) + thanksNote(920, 250, 1.2, 5) +
        `<g transform="translate(${f(lx + 120)},${f(lerp(520, 470, m))})"><circle r="80" fill="#CFE6F2" fill-opacity=".22" stroke="#3A3A44" stroke-width="11"/><line x1="56" y1="56" x2="130" y2="130" stroke="#3A3A44" stroke-width="20" stroke-linecap="round"/></g>`;
    },
    cam: [[800, 440, 1300], [800, 440, 1250]],
  },
  'e3.youAsk': {
    bg: (id) => stairsBg(id) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#EDE8DE" opacity=".45"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'you', g, brow: 0.6, look: -0.4, nod: Math.sin(g * 1.2) * 0.2 }),
    cam: [[800, 460, 1250], [800, 450, 1100]],
  },
  'e3.benIdea': {
    bg: (id) => corridorBg(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.2, 0.5);
      return person({ x: 560, y: 880, s: 2.2, who: 'ben', pose: P.mix(P.stand(), P.point(1), k), g, face: 1, mood: 'laugh' }) + `<g opacity="${f(k)}">${glow(id, 560, 300, 80, g, 0, 0.6)}<text x="560" y="330" font-size="90" text-anchor="middle">💡</text></g>` + newspaper(900, 260, 1, g);
    },
    cam: [[880, 520, 1350], [900, 500, 1250]],
  },
  'e3.benRun': {
    bg: (id) => corridorBg(id) + `<rect x="1440" y="300" width="160" height="320" fill="#9AC48A" stroke="#6E7A84" stroke-width="10"/><text x="1520" y="290" font-size="26" font-weight="900" fill="#3E6A3A" text-anchor="middle" ${SANS}>GARDEN →</text>`,
    fg: (u, g) => { const k = seg(u, 0.1, 1); return person({ x: lerp(200, 1300, k), y: 830, s: 1.6, who: 'ben', pose: P.walk(g * 1.8, 1.4), g, face: 1 }) + person({ x: lerp(20, 1120, k), y: 830, s: 1.55, who: 'you', pose: P.walk(g * 1.8 + 0.4, 1.4), g, face: 1, hold: 'notebook' }); },
    cam: [[800, 520, 1600], [900, 540, 1500]],
  },
  'e3.write': {
    bg: (id) => sky(id, '#6E4C30', '#5E3E26'),
    fg: (u, g) => { const k = seg(u, 0.1, 0.6), px = 520 + k * 300 + Math.sin(g * 9) * 10; return notebookPage(500, 230, 1.1, 'M must be ', k) + `<path d="M${f(px)},${f(380 - 10 * Math.sin(g * 9))} l120,-260" stroke="#E4B83E" stroke-width="16" stroke-linecap="round"/>`; },
    cam: [[820, 440, 1000], [820, 430, 900]],
  },
  'e3.clock255': {
    bg: (id) => sky(id, '#D9C8A6', '#CDB892') + `<rect x="-200" y="700" width="2000" height="400" fill="#B78C5C"/>`,
    fg: (u, g) => clock(800, 390, 190, 2, 55 + u, g * 3) + `<text x="800" y="672" font-size="50" font-weight="900" fill="#8E2A26" text-anchor="middle" ${SANS} opacity="${f(seg(u, 0.4, 0.7))}">5 minutes left</text>`,
    cam: [[800, 440, 1000], [800, 450, 900]],
  },
  'e3.found': {
    bg: (id) => gardenBg(id),
    fg: (u, g, id) => {
      const flash = ((g * 0.8) % 1) < 0.07 ? 1 : 0;
      return flowers(81, g) + glow(id, 760, 640, 160, g, 0, 0.6) + trophy(id, 760, 700, 0.55, g) + flowers(83, g, 600, 920, 760) +
        person({ x: 1100, y: 820, s: 1.5, who: 'mia', pose: { ...P.kneelWash(0), aF: 90, eF: 60, aB: 80, eB: 70, lean: 10, head: -4 }, g, face: -1, hold: 'camera' }) +
        `<rect x="-200" y="-200" width="2000" height="1400" fill="#fff" opacity="${f(flash * 0.45)}"/>`;
    },
    cam: [[800, 500, 1600], [860, 620, 1100]],
  },
  'e3.miaJump': {
    bg: (id) => gardenBg(id),
    fg: (u, g, id) => {
      const j = Math.max(0, Math.sin(seg(u, 0, 0.3) * Math.PI));
      return flowers(81, g) + glow(id, 760, 640, 160, g, 0, 0.6) + trophy(id, 760, 700, 0.55, g) +
        person({ x: 1100, y: 820 - j * 60, s: 1.5, who: 'mia', pose: P.mix({ ...P.kneelWash(0), aF: 90, eF: 60, aB: 80, eB: 70 }, { ...P.stand(), aF: 130, eF: 20, aB: 120, eB: 20 }, seg(u, 0, 0.2)), g, face: -1, hold: 'camera', mood: 'shock' }) +
        person({ x: 300, y: 830, s: 1.6, who: 'ben', pose: P.point(1), g, face: 1 }) + person({ x: 140, y: 830, s: 1.55, who: 'you', pose: P.stand(), g, face: 1, hold: 'notebook' });
    },
    cam: [[800, 520, 1600], [800, 560, 1400]],
  },
  'e3.endBoard': {
    bg: (id) => sky(id, '#4A3A34', '#3A2E2A') + `<rect x="160" y="140" width="1280" height="620" rx="10" fill="#7A5236"/><rect x="180" y="160" width="1240" height="580" fill="#C9A06A"/>`,
    fg: (u, g) => {
      const card = (x: number, y: number, t1: string, t2: string, k: number, c = '#FBF7EA') => `<g transform="translate(${x},${f(y - (1 - k) * 30)})" opacity="${f(k)}"><rect x="5" y="7" width="340" height="180" fill="#000" opacity=".2"/><rect width="340" height="180" fill="${c}"/><text x="170" y="74" font-size="42" font-weight="900" fill="${INK}" text-anchor="middle" ${HAND}>${t1}</text><text x="170" y="134" font-size="34" fill="#8E2A26" text-anchor="middle" ${HAND}>${t2}</text></g>`;
      return card(260, 240, 'M = Mia', '✓', seg(u, 0, 0.25), '#F6DC5A') + card(630, 240, 'Lent → Borrowed', '✓', seg(u, 0.2, 0.45)) + card(1000, 240, 'the panda', 'in the garden ✓', seg(u, 0.4, 0.65)) + card(630, 480, '“Yes, yes”', '?', seg(u, 0.6, 0.85)) +
        `<text x="1260" y="660" font-size="${f(100 + Math.sin(g * 3) * 4)}" font-weight="900" fill="#8E2A26" ${HAND} opacity="${f(seg(u, 0.85, 1))}">?</text>`;
    },
    cam: [[800, 450, 1400], [800, 450, 1380]],
  },
};
