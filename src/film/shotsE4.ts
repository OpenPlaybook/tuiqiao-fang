// 英文第四章 Case Closed：每一镜怎么画、怎么动（对照 第六堂课/分镜/英文第四章_Case_Closed.md）
import { GOLD, INK, RED, f, glow, lerp, rng, seg, sky, wav } from './core';
import { P, faceCU, person } from './rig';
import { HAND, SANS, audience, backstageBg, flashback, hallBg, hallLights, notebookPage, seated, sideHall, stickyNote, talk, timeTag, trophy } from './shotsE1';
import { flowers, gardenBg, officeBg } from './shotsE2';
import type { ShotDef } from './Film';

/** 花园里：熊猫在花丛中 */
const gardenPanda = (id: string, g: number) => flowers(81, g) + glow(id, 760, 640, 160, g, 0, 0.6) + trophy(id, 760, 700, 0.55, g);
/** 报纸头版：照片是花丛里的金熊猫 */
const frontPage = (id: string, x: number, y: number, s: number, g: number) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="6" y="8" width="420" height="520" fill="#000" opacity=".2"/><rect width="420" height="520" fill="#F4F1E8"/><text x="210" y="62" font-size="44" font-weight="900" fill="${INK}" text-anchor="middle" font-family="Georgia, serif">SCHOOL NEWS</text><line x1="20" y1="80" x2="400" y2="80" stroke="${INK}" stroke-width="3"/><svg x="30" y="100" width="360" height="230" viewBox="300 420 900 560"><rect x="300" y="420" width="900" height="560" fill="#CFE3EA"/><path d="M300,640 L1200,640 L1200,980 L300,980 Z" fill="#8AAA6A"/>${flowers(81, g, 320, 1180, 720)}${trophy(id, 760, 700, 0.55, g)}</svg><text x="210" y="372" font-size="26" font-weight="900" fill="${INK}" text-anchor="middle" font-family="Georgia, serif">The Panda Is Back!</text>${Array.from({ length: 5 }, (_, i) => `<line x1="30" y1="${400 + i * 22}" x2="${i % 3 === 2 ? 260 : 390}" y2="${400 + i * 22}" stroke="#9A9284" stroke-width="5"/>`).join('')}<text x="390" y="508" font-size="18" fill="#6A6458" text-anchor="end" ${SANS}>Photo: Mia</text></g>`;
/** 打乱的事件卡片（不摆出顺序） */
const mixedCards = (g: number) => {
  const cards: [number, number, string][] = [[220, 180, 'Max tripped'], [760, 160, 'panda on the table'], [1180, 220, 'found in the garden'], [300, 470, '“Yes, yes.”'], [760, 480, 'a note: “Lent …”'], [1160, 500, 'photos in the garden']];
  return cards.map(([x, y, t], i) => `<g transform="translate(${x},${y}) rotate(${f((i % 2 ? 3 : -3) + wav(g, 3, i) * 0.6)})"><rect x="4" y="6" width="300" height="130" fill="#000" opacity=".2"/><rect width="300" height="130" fill="${i === 4 ? '#F6DC5A' : '#FBF7EA'}"/><text x="150" y="58" font-size="40" font-weight="900" fill="#8E2A26" text-anchor="middle" ${HAND}>?</text><text x="150" y="108" font-size="30" fill="${INK}" text-anchor="middle" ${HAND}>${t}</text></g>`).join('');
};
const board = (id: string) => sky(id, '#4A3A34', '#3A2E2A') + `<rect x="140" y="110" width="1320" height="680" rx="10" fill="#7A5236"/><rect x="160" y="130" width="1280" height="640" fill="#C9A06A"/>`;

export const SHOTS_E4: Record<string, ShotDef> = {
  'e4.miaRed': {
    bg: (id) => gardenBg(id),
    fg: (u, g, id) => gardenPanda(id, g) + person({ x: 1050, y: 830, s: 1.7, who: 'mia', pose: { ...P.stand(), aF: 80, eF: 100, aB: 70, eB: 100, head: 14 }, g, face: -1, hold: 'camera', mood: 'shock' }) + person({ x: 420, y: 840, s: 1.7, who: 'ben', pose: P.stand(), g, face: 1 }) + person({ x: 240, y: 840, s: 1.65, who: 'you', pose: P.stand(), g, face: 1, hold: 'notebook' }),
    cam: [[800, 520, 1500], [900, 560, 1250]],
  },
  'e4.miaCU': {
    bg: (id) => gardenBg(id) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#EAF0E4" opacity=".45"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'mia', g, mouth: talk(g), brow: 0.7, look: -0.3 }) + `<ellipse cx="800" cy="500" rx="30" ry="14" fill="#E85A6A" opacity=".25"/>`,
    cam: [[800, 460, 1250], [800, 450, 1100]],
  },
  'e4.benAsk': {
    bg: (id) => gardenBg(id),
    fg: (u, g) => person({ x: 1050, y: 860, s: 1.85, who: 'mia', pose: { ...P.stand(), head: 10 }, g, face: -1, hold: 'camera' }) + person({ x: 660, y: 860, s: 2.05, who: 'ben', pose: P.mix(P.stand(), P.point(0.6), 0.4), g, face: 1 }) + person({ x: 440, y: 860, s: 2, who: 'you', pose: P.stand(), g, face: 1, hold: 'notebook' }),
    cam: [[780, 520, 1350], [800, 520, 1250]],
  },
  'e4.flashAsk': {
    bg: (id) => officeBg(id),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.4), yes = seg(u, 0.55, 0.7);
      let o = person({ x: 820, y: 760, s: 1.6, who: 'green', pose: { ...P.stand(), aF: 135, eF: 135, head: 8 + Math.sin(g * 5) * 6 * yes }, g, face: -1, hold: 'phone' });
      o += person({ x: lerp(1700, 1150, k), y: 780, s: 1.4, who: 'mia', pose: k < 1 ? P.walk(g) : P.mix(P.stand(), P.point(0.6), 0.4), g, face: -1, hold: 'camera' });
      if (k >= 1) o += `<g transform="translate(1180,300)"><rect x="-250" y="-60" width="500" height="96" rx="24" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><path d="M-20,36 l10,44 l26,-44 z" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><text x="0" y="0" font-size="30" text-anchor="middle" fill="${INK}" ${HAND}>Can I borrow the panda</text><text x="0" y="28" font-size="30" text-anchor="middle" fill="${INK}" ${HAND}>for a photo?</text></g>`;
      if (yes > 0) o += `<g transform="translate(560,340)" opacity="${f(yes)}"><rect x="-120" y="-50" width="240" height="80" rx="20" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><path d="M60,30 l40,40 l-10,-40 z" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><text x="0" y="6" font-size="38" text-anchor="middle" fill="${INK}" ${HAND}>Yes, yes…</text></g>`;
      return o + flashback(id) + timeTag(220, 110, '2:10');
    },
    cam: [[900, 500, 1500], [900, 480, 1400]],
  },
  'e4.remember': {
    bg: (id) => officeBg(id),
    fg: (u, g, id) => person({ x: 820, y: 760, s: 1.6, who: 'green', pose: { ...P.stand(), aF: 135, eF: 135, head: 8 + Math.sin(g * 5) * 6 }, g, face: -1, hold: 'phone' }) + `<g transform="translate(560,340)"><rect x="-120" y="-50" width="240" height="80" rx="20" fill="#FBF7EA" stroke="${INK}" stroke-width="3"/><text x="0" y="6" font-size="38" text-anchor="middle" fill="${INK}" ${HAND}>Yes, yes…</text></g>` + glow(id, 560, 330, 160, g, 0, 0.5 * seg(u, 0.2, 0.6)) + flashback(id),
    cam: [[800, 460, 1400], [700, 420, 1100]],
  },
  'e4.flashNote': {
    bg: (id) => backstageBg(id),
    fg: (u, g, id) => {
      const k = seg(u, 0.1, 0.8);
      return `<rect x="560" y="560" width="480" height="24" fill="#7A5236"/><rect x="580" y="584" width="18" height="120" fill="#5A3E28"/><rect x="1000" y="584" width="18" height="120" fill="#5A3E28"/>` +
        `<g transform="translate(700,520) scale(.3)">${stickyNote(0, 0, 1, k, -3)}</g>` + person({ x: 960, y: 760, s: 1.6, who: 'mia', pose: P.write(g), g, face: -1, hold: 'pen' }) + `<g transform="translate(900,560)" opacity="${f(1 - seg(u, 0.6, 0.85))}">${trophy(id, 0, 0, 0.35, g)}</g>` + flashback(id) + timeTag(220, 110, '2:12');
    },
    cam: [[820, 520, 1300], [800, 540, 1150]],
  },
  'e4.benKind': {
    bg: (id) => gardenBg(id),
    fg: (u, g) => person({ x: 1000, y: 860, s: 1.85, who: 'mia', pose: { ...P.stand(), head: 14 }, g, face: -1, hold: 'camera', mood: 'sad' }) + person({ x: 700, y: 860, s: 2.05, who: 'ben', pose: P.mix(P.stand(), P.give(0.6), 0.5), g, face: 1, mood: 'laugh' }),
    cam: [[840, 520, 1250], [850, 520, 1150]],
  },
  'e4.noteFall': {
    bg: (id) => backstageBg(id),
    fg: (u, g, id) => {
      const dark = seg(u, 0.1, 0.15) - seg(u, 0.75, 0.8), fall = seg(u, 0.2, 0.6);
      return `<rect x="560" y="560" width="480" height="24" fill="#7A5236"/><rect x="580" y="584" width="18" height="120" fill="#5A3E28"/><rect x="1000" y="584" width="18" height="120" fill="#5A3E28"/>` +
        `<g transform="translate(${f(lerp(720, 820, fall))},${f(lerp(520, 700, fall))}) rotate(${f(lerp(-3, 175, fall))}) scale(.3)">${stickyNote(0, 0, 1, 1, 0)}</g>` +
        `<rect x="-200" y="-200" width="2000" height="1400" fill="#06060A" opacity="${f(dark * 0.75)}"/>` + timeTag(220, 110, '2:15') + flashback(id);
    },
    cam: [[820, 560, 1200], [800, 600, 900]],
  },
  'e4.timeline': {
    bg: (id) => board(id),
    fg: (u, g) => mixedCards(g),
    cam: [[800, 450, 1450], [800, 450, 1440]],
  },
  'e4.runHall': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => {
      const k = seg(u, 0, 0.6), drop = seg(u, 0.6, 0.8);
      return hallLights(id, g, 1) + person({ x: 1200, y: 800, s: 1.6, who: 'green', pose: drop > 0 ? { ...P.stand(), aF: 130, eF: 20, aB: 130, eB: 20 } : { ...P.stand(), aF: 135, eF: 135 }, g, face: -1, hold: drop > 0 ? undefined : 'phone', mood: drop > 0 ? 'shock' : 'calm' }) +
        `<rect x="${f(1240)}" y="${f(lerp(640, 790, drop))}" width="22" height="40" rx="4" fill="#1E2028" opacity="${drop > 0 ? 1 : 0}"/>` +
        person({ x: lerp(-200, 600, k), y: 820, s: 1.5, who: 'mia', pose: P.walk(g * 1.6, 1.3 * (1 - seg(u, 0.55, 0.6))), g, face: 1 }) + `<g transform="translate(${f(lerp(-150, 650, k))},700)">${trophy(id, 0, 0, 0.3, g)}</g>` +
        person({ x: lerp(-380, 420, k), y: 820, s: 1.55, who: 'ben', pose: P.walk(g * 1.6 + 0.3, 1.3 * (1 - seg(u, 0.55, 0.6))), g, face: 1 }) + person({ x: lerp(-540, 260, k), y: 820, s: 1.5, who: 'you', pose: P.walk(g * 1.6 + 0.6, 1.3 * (1 - seg(u, 0.55, 0.6))), g, face: 1 });
    },
    cam: [[800, 520, 1600], [820, 560, 1400]],
  },
  'e4.greenJoy': {
    bg: (id) => hallBg(id) + `<rect x="-200" y="-200" width="2000" height="1400" fill="#EDE8DE" opacity=".35"/>`,
    fg: (u, g, id) => faceCU({ id, x: 760, y: 470, s: 1.2, who: 'green', g, mouth: 0.55, open: 1.3, brow: 0.6 }),
    cam: [[800, 460, 1250], [800, 450, 1100]],
  },
  'e4.sorry': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => hallLights(id, g, 1) + person({ x: 1050, y: 820, s: 1.75, who: 'green', pose: P.stand(), g, face: -1 }) + person({ x: 700, y: 820, s: 1.6, who: 'mia', pose: P.bow(0.5 + 0.1 * Math.sin(g)), g, face: 1, mood: 'sad' }) + `<g transform="translate(860,700)">${trophy(id, 0, 0, 0.3, g)}</g>`,
    cam: [[880, 560, 1250], [880, 560, 1150]],
  },
  'e4.greenSorry': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => hallLights(id, g, 1) + person({ x: 1050, y: 820, s: 1.75, who: 'green', pose: P.mix(P.stand(), P.give(0.7), seg(u, 0.2, 0.6)), g, face: -1, mood: 'sad' }) + person({ x: 720, y: 820, s: 1.6, who: 'mia', pose: P.mix(P.bow(0.5), P.stand(), seg(u, 0.5, 0.9)), g, face: 1 }),
    cam: [[880, 560, 1250], [880, 560, 1150]],
  },
  'e4.benClose': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => hallLights(id, g, 1) + person({ x: 800, y: 880, s: 2.3, who: 'ben', pose: P.mix(P.stand(), P.cheer(g), seg(u, 0.4, 0.7)), g, face: 1, mood: 'laugh' }) + `<g opacity="${f(seg(u, 0.5, 0.8))}" transform="translate(1100,330) rotate(-8)"><rect x="-190" y="-55" width="380" height="110" fill="none" stroke="${RED}" stroke-width="10"/><text x="0" y="20" font-size="58" font-weight="900" fill="${RED}" text-anchor="middle" ${SANS}>CASE CLOSED</text></g>`,
    cam: [[880, 500, 1300], [880, 480, 1200]],
  },
  'e4.hall': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => hallLights(id, g, 1) + `<g transform="translate(800,520)">${trophy(id, 0, 0, 0.5, g)}</g>` + audience(3, g, { rows: 5 }),
    cam: [[800, 470, 1600], [800, 440, 1360]],
  },
  'e4.stage': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => hallLights(id, g, 1) + `<path d="M800,-20 L640,560 L960,560 Z" fill="#FFF6D8" opacity=".2"/>` + `<g transform="translate(1000,520)">${trophy(id, 0, 0, 0.45, g)}</g>` + `<line x1="720" y1="420" x2="720" y2="560" stroke="#3A3A44" stroke-width="6"/><circle cx="720" cy="414" r="10" fill="#3A3A44"/>` + person({ x: 640, y: 560, s: 1.2, who: 'green', pose: P.mix(P.stand(), P.point(0.6), 0.3), g, face: 1 }) + audience(5, g, { rows: 3, y0: 760 }),
    cam: [[800, 400, 1300], [800, 380, 1000]],
  },
  'e4.winner': {
    bg: () => '',
    fg: (u, g, id) => {
      const up = seg(u, 0.1, 0.4);
      let o = sideHall(id, g);
      o += seated('stuB', 420, 800, 1.9, g, { pose: P.mix(P.sitRest(), P.cheer(g), up * 0.5) });
      o += up < 0.5 ? seated('you', 800, 800, 1.9, g, { mood: 'shock' }) : person({ x: 800, y: 800, s: 1.9, who: 'you', pose: P.mix(P.stand(), P.cheer(g * 0.5), 0.3), g, mood: 'laugh' });
      o += seated('stuA', 1180, 800, 1.9, g, { pose: P.mix(P.sitRest(), P.cheer(g + 0.3), up * 0.5) });
      o += person({ x: 1420, y: 800 - Math.max(0, Math.sin(g * 4)) * 30 * up, s: 1.95, who: 'ben', pose: P.cheer(g * 1.2), g, face: -1, mood: 'laugh' });
      o += `<path d="M800,-40 L640,800 L960,800 Z" fill="#FFF6D8" opacity="${f(0.3 * up)}"/>`;
      const r = rng(5); for (let i = 0; i < 30; i++) { const k = (g * 0.3 + r()) % 1; o += `<rect x="${f(200 + r() * 1200)}" y="${f(-40 + k * 900)}" width="12" height="20" fill="${['#E85A6A', GOLD, '#4A8ACA', '#7AA868'][i % 4]}" opacity="${f(up)}" transform="rotate(${f(k * 360)} ${f(200 + r() * 1200)} ${f(k * 900)})"/>`; }
      return o;
    },
    cam: [[800, 560, 1450], [800, 560, 1250]],
  },
  'e4.greenThanks': {
    bg: (id) => hallBg(id),
    fg: (u, g, id) => hallLights(id, g, 1) + `<g transform="translate(1000,520)">${trophy(id, 0, 0, 0.45, g)}</g>` + person({ x: 640, y: 560, s: 1.2, who: 'green', pose: P.mix(P.stand(), P.point(0.8), 0.5 + 0.3 * Math.sin(g * 1.4)), g, face: 1, mood: 'laugh' }) + person({ x: 860, y: 900, s: 1.8, who: 'ben', pose: P.cheer(g), g, face: -1, mood: 'laugh' }) + person({ x: 1060, y: 900, s: 1.75, who: 'you', pose: P.stand(), g, face: -1, mood: 'laugh' }),
    cam: [[800, 520, 1400], [820, 520, 1300]],
  },
  'e4.photo': {
    bg: (id) => sky(id, '#3A302A', '#2A2420'),
    fg: (u, g, id) => glow(id, 800, 430, 400, g, 0, 0.3) + frontPage(id, 590, 160, 1.05 + 0.05 * seg(u, 0, 1), g),
    cam: [[800, 440, 1200], [800, 430, 1050]],
  },
  'e4.write': {
    bg: (id) => sky(id, '#6E4C30', '#5E3E26'),
    fg: (u, g) => { const k = seg(u, 0.1, 0.6), px = 520 + k * 300 + Math.sin(g * 9) * 10; return notebookPage(500, 230, 1.1, 'Mia borrowed ', k) + `<path d="M${f(px)},${f(380 - 10 * Math.sin(g * 9))} l120,-260" stroke="#E4B83E" stroke-width="16" stroke-linecap="round"/>`; },
    cam: [[820, 440, 1000], [820, 430, 900]],
  },
  'e4.mooncake': {
    bg: () => '',
    fg: (u, g, id) => {
      const n = 9 + (seg(u, 0.5, 0.6) > 0.5 ? 1 : 0);
      let o = '';
      for (let i = 0; i < 10; i++) { const on = i < n, x = 1000 + (i % 4) * 110, y = 340 + Math.floor(i / 4) * 110; o += `<g opacity="${on ? 1 : 0.18}"><circle cx="${x}" cy="${y}" r="42" fill="#C98A3E" stroke="#7A4E1E" stroke-width="4"/><circle cx="${x}" cy="${y}" r="26" fill="none" stroke="#7A4E1E" stroke-width="3"/></g>`; }
      o += `<text x="1160" y="740" font-size="80" font-weight="900" fill="#8E2A26" text-anchor="middle" ${SANS}>× ${n}</text>`;
      return sideHall(id, g, false) + o + seated('ben', 560, 800, 2.2, g, { pose: P.eat(g * 0.9), hold: 'mooncake', mood: 'laugh' });
    },
    cam: [[820, 480, 1400], [840, 470, 1250]],
  },
  'e4.endBoard': {
    bg: (id) => board(id),
    fg: (u, g) => {
      const words: [number, number, string, string][] = [[240, 200, 'has taken', 'Chapter 1'], [820, 200, 'was eating', 'Chapter 1'], [240, 480, 'borrow / lend', 'Chapters 2–4'], [820, 480, 'must be', 'Chapter 3']];
      return words.map(([x, y, w, c], i) => { const k = seg(u, i * 0.18, i * 0.18 + 0.2); return `<g transform="translate(${x},${f(y - (1 - k) * 30)}) rotate(${i % 2 ? 2 : -2})" opacity="${f(k)}"><rect x="5" y="7" width="520" height="220" fill="#000" opacity=".2"/><rect width="520" height="220" fill="${i === 2 ? '#F6DC5A' : '#FBF7EA'}"/><text x="260" y="110" font-size="62" font-weight="900" fill="${INK}" text-anchor="middle" ${HAND}>${w}</text><text x="260" y="180" font-size="32" fill="#8E2A26" text-anchor="middle" ${HAND}>${c}</text></g>`; }).join('');
    },
    cam: [[800, 460, 1450], [800, 460, 1440]],
  },
};
