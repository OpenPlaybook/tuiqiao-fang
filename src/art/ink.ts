// 水墨淡彩：用代码画的诗意小景、历史场景、成语连环画。只输出 SVG 字符串——网站和竖屏视频共用。
// 画法：宣纸底 + 远山淡墨层层退远 + 留白和雾 + 只在一处点颜色（夕阳、灯火、朱印）。

const rng = (seed: number) => { let a = seed | 0 || 1; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const hash = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const f = (n: number) => Math.round(n * 10) / 10;
let uid = 0;
const nid = (p: string) => `${p}${++uid}_`;

export const INK = '#2B2722', INK2 = '#5B544B', PAPER = '#F3ECDC', RED = '#B8352A', GOLD = '#D9A441';

/** 公共滤镜：毛边、柔化、纸纹 */
const defs = (id: string) => `<defs>
<filter id="${id}r" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="9"/><feGaussianBlur stdDeviation="0.8"/></filter>
<filter id="${id}b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="${id}s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="${id}p"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0.09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<radialGradient id="${id}v" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="${PAPER}" stop-opacity="0"/><stop offset="100%" stop-color="#C9B996" stop-opacity=".55"/></radialGradient>
</defs>`;
const paper = (id: string, w: number, h: number, tint = PAPER) => `<rect width="${w}" height="${h}" fill="${tint}"/><rect width="${w}" height="${h}" fill="#000" filter="url(#${id}p)"/>`;
const vignette = (id: string, w: number, h: number) => `<rect width="${w}" height="${h}" fill="url(#${id}v)"/>`;
export const svg = (w: number, h: number, body: (id: string) => string, bg = PAPER) => {
  const id = nid('k');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">${defs(id)}${paper(id, w, h, bg)}${body(id)}${vignette(id, w, h)}</svg>`;
};

// ---------------- 山、水、雾 ----------------
/** 一层山：sum of sines 的起伏，从山脊往下渐淡 */
export const ridge = (id: string, o: { y: number; amp: number; w?: number; seed: number; tone?: number; color?: string; peaks?: number; fade?: number; x0?: number; x1?: number }) => {
  const W = o.w ?? 800, r = rng(o.seed), x0 = o.x0 ?? -20, x1 = o.x1 ?? W + 20;
  const k = o.peaks ?? 3, ph = [r() * 6, r() * 6, r() * 6], step = 8;
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += step) {
    const t = (x - x0) / (x1 - x0);
    const env = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) ** 0.35;
    const yy = o.y - o.amp * env * (0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * k + ph[0])) + 0.3 * (0.5 + 0.5 * Math.sin(t * Math.PI * k * 2.3 + ph[1])) + 0.15 * (0.5 + 0.5 * Math.sin(t * Math.PI * k * 5.1 + ph[2])) + 0.08 * r());
    pts.push(`${f(x)},${f(yy)}`);
  }
  const gid = nid('g'), c = o.color ?? INK, a = o.tone ?? 0.5, fade = o.fade ?? 160;
  return `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="0" y1="${f(o.y - o.amp)}" x2="0" y2="${f(o.y + fade)}"><stop offset="0" stop-color="${c}" stop-opacity="${a}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient>`
    + `<path d="M${pts.join(' L')} L${x1},${o.y + fade} L${x0},${o.y + fade} Z" fill="url(#${gid})" filter="url(#${id}r)"/>`;
};
export const mist = (id: string, y: number, h = 50, w = 800, a = 0.85) => `<rect x="-40" y="${y - h / 2}" width="${w + 80}" height="${h}" fill="${PAPER}" opacity="${a}" filter="url(#${id}b)"/>`;
export const water = (seed: number, y0: number, y1: number, w = 800, n = 26, a = 0.35) => {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const y = y0 + (y1 - y0) * (i / n) + r() * 6, x = r() * w, len = 20 + r() * 70 * (0.4 + (y - y0) / (y1 - y0));
    s += `<path d="M${f(x)},${f(y)} q${f(len / 2)},${f(-2 - r() * 2)} ${f(len)},0" stroke="${INK}" stroke-opacity="${f(a * (0.4 + r() * 0.6))}" stroke-width="${f(1 + r())}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
};
export const moon = (x: number, y: number, r = 34, id?: string) => `${id ? `<circle cx="${x}" cy="${y}" r="${r * 2.2}" fill="#FFF8E6" opacity=".55" filter="url(#${id}b)"/>` : ''}<circle cx="${x}" cy="${y}" r="${r}" fill="#FBF4DF" stroke="${INK}" stroke-opacity=".12"/>`;
export const sun = (x: number, y: number, r = 30, c = RED, id?: string) => `${id ? `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="${c}" opacity=".18" filter="url(#${id}b)"/>` : ''}<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".85"/>`;
export const geese = (x: number, y: number, n = 5, s = 1) => { let o = ''; for (let i = 0; i < n; i++) { const dx = x + i * 16 * s, dy = y + Math.abs(i - (n - 1) / 2) * 8 * s; o += `<path d="M${dx - 6 * s},${dy} q${3 * s},${-4 * s} ${6 * s},0 q${3 * s},${-4 * s} ${6 * s},0" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`; } return o; };
export const rain = (seed: number, w = 800, h = 500, n = 90, a = 0.28) => { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const x = r() * (w + 100) - 50, y = r() * h, l = 18 + r() * 26; s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - l * 0.25)}" y2="${f(y + l)}" stroke="${INK2}" stroke-opacity="${f(a * (0.5 + r() * 0.5))}" stroke-width="1.2"/>`; } return s; };
export const frost = (seed: number, x0: number, x1: number, y0: number, y1: number, n = 60) => { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f(x0 + r() * (x1 - x0))}" cy="${f(y0 + r() * (y1 - y0))}" r="${f(0.8 + r() * 1.6)}" fill="#fff" opacity="${f(0.5 + r() * 0.5)}"/>`; return s; };

// ---------------- 草木 ----------------
export const reeds = (seed: number, x0: number, x1: number, y: number, n = 40, h = 120, lean = 0.25) => {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * r(), hh = h * (0.55 + r() * 0.6), l = (lean + (r() - 0.5) * 0.2) * hh, tx = x + l, ty = y - hh;
    s += `<path d="M${f(x)},${y} Q${f(x + l * 0.2)},${f(y - hh * 0.6)} ${f(tx)},${f(ty)}" stroke="${INK}" stroke-opacity="${f(0.45 + r() * 0.4)}" stroke-width="${f(1 + r() * 1.2)}" fill="none"/>`;
    if (r() < 0.75) s += `<path d="M${f(tx)},${f(ty)} q${f(6 + r() * 6)},${f(4 + r() * 5)} ${f(4 + r() * 6)},${f(18 + r() * 12)}" stroke="#8C7F6A" stroke-opacity=".7" stroke-width="${f(3 + r() * 3)}" fill="none" stroke-linecap="round"/>`;
    if (r() < 0.5) { const ly = y - hh * (0.3 + r() * 0.3), lx = x + l * 0.3; s += `<path d="M${f(lx)},${f(ly)} q${f(-14 - r() * 10)},${f(4)} ${f(-26 - r() * 10)},${f(16 + r() * 8)}" stroke="${INK}" stroke-opacity=".5" stroke-width="1.2" fill="none"/>`; }
  }
  return s;
};
export const willow = (seed: number, x: number, y: number, s = 1, a = 0.7) => {
  const r = rng(seed); let o = `<path d="M${x},${y} q${-6 * s},${-50 * s} ${4 * s},${-110 * s}" stroke="${INK}" stroke-width="${7 * s}" fill="none" stroke-linecap="round" opacity="${a}"/>`;
  for (let i = 0; i < 22; i++) {
    const bx = x + 4 * s + (r() - 0.5) * 60 * s, by = y - 110 * s + r() * 30 * s, len = (60 + r() * 70) * s;
    o += `<path d="M${f(x + 4 * s)},${f(y - 105 * s)} Q${f(bx)},${f(by - 20 * s)} ${f(bx + (r() - 0.5) * 10)},${f(by + len)}" stroke="#4E6B45" stroke-opacity="${f(a * (0.35 + r() * 0.5))}" stroke-width="1.3" fill="none"/>`;
  }
  return o;
};
export const pine = (seed: number, x: number, y: number, s = 1, a = 0.8) => {
  const r = rng(seed); let o = `<path d="M${x},${y} q${8 * s},${-60 * s} ${-4 * s},${-130 * s}" stroke="${INK}" stroke-width="${8 * s}" fill="none" stroke-linecap="round" opacity="${a}"/>`;
  for (let i = 0; i < 5; i++) {
    const cy = y - (40 + i * 22) * s, cx = x + (i % 2 ? 1 : -1) * (10 + r() * 14) * s, w = (70 - i * 10) * s;
    o += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(w / 2)}" ry="${f(9 * s)}" fill="#2F3A2C" opacity="${f(a * 0.75)}"/>`;
  }
  return o;
};
export const bareTree = (seed: number, x: number, y: number, s = 1, a = 0.75) => {
  const r = rng(seed);
  const br = (x0: number, y0: number, ang: number, len: number, w: number, d: number): string => {
    if (d === 0 || len < 6) return '';
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    return `<path d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}" stroke="${INK}" stroke-width="${f(w)}" stroke-linecap="round" opacity="${a}"/>` + br(x1, y1, ang - 0.4 - r() * 0.3, len * 0.72, w * 0.65, d - 1) + br(x1, y1, ang + 0.35 + r() * 0.3, len * 0.68, w * 0.65, d - 1);
  };
  return br(x, y, -Math.PI / 2, 60 * s, 7 * s, 5);
};
export const blossoms = (seed: number, cx: number, cy: number, rad: number, n = 30, c = '#D8564B') => { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const a = r() * 6.28, d = r() * rad; s += `<circle cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d * 0.7)}" r="${f(3 + r() * 4)}" fill="${c}" opacity="${f(0.55 + r() * 0.4)}"/>`; } return s; };
export const grass = (seed: number, x0: number, x1: number, y: number, n = 50, h = 26, c = INK) => { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), hh = h * (0.4 + r()); s += `<path d="M${f(x)},${y} q${f((r() - 0.5) * 8)},${f(-hh / 2)} ${f((r() - 0.3) * 10)},${f(-hh)}" stroke="${c}" stroke-opacity="${f(0.3 + r() * 0.4)}" stroke-width="1.2" fill="none"/>`; } return s; };

// ---------------- 人和物 ----------------
/** 水墨小人：kind = robe 长袍 / hat 斗笠 / soldier 兵 / scholar 戴冠 / crawl 趴着 / sit 坐 */
export const figure = (x: number, y: number, s = 1, kind = 'robe', a = 0.85, face: 1 | -1 = 1) => {
  const c = INK;
  if (kind === 'crawl') return `<g opacity="${a}" transform="translate(${x},${y}) scale(${s * face},${s})"><ellipse cx="0" cy="-10" rx="20" ry="8" fill="${c}"/><circle cx="20" cy="-14" r="6" fill="${c}"/><path d="M-14,-6 l-6,8 M10,-4 l4,8" stroke="${c}" stroke-width="3"/></g>`;
  if (kind === 'sit') return `<g opacity="${a}" transform="translate(${x},${y}) scale(${s * face},${s})"><path d="M-14,0 Q-16,-30 -4,-34 L6,-34 Q14,-26 16,0 Z" fill="${c}"/><circle cx="1" cy="-42" r="7" fill="${c}"/><path d="M-4,-50 h10 v-5 h-10z" fill="${c}"/></g>`;
  const head = kind === 'hat' ? `<path d="M-15,-52 L0,-62 L15,-52 Z" fill="${c}"/><circle cx="0" cy="-48" r="5.5" fill="${c}"/>`
    : kind === 'scholar' ? `<circle cx="0" cy="-50" r="6.5" fill="${c}"/><rect x="-3" y="-62" width="6" height="7" fill="${c}"/>`
    : kind === 'soldier' ? `<circle cx="0" cy="-50" r="6.5" fill="${c}"/><path d="M-7,-55 Q0,-64 7,-55 Z" fill="${c}"/><line x1="12" y1="-70" x2="12" y2="0" stroke="${c}" stroke-width="2"/><path d="M12,-70 l-4,8 h8z" fill="${c}"/>`
    : `<circle cx="0" cy="-50" r="6.5" fill="${c}"/>`;
  return `<g opacity="${a}" transform="translate(${x},${y}) scale(${s * face},${s})"><path d="M-6,-43 Q-14,-20 -13,0 L13,0 Q12,-22 6,-43 Z" fill="${c}"/><path d="M-6,-38 Q-16,-28 -18,-16" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>${head}</g>`;
};
export const boat = (x: number, y: number, s = 1, who = true, a = 0.85) => `<g opacity="${a}" transform="translate(${x},${y}) scale(${s})"><path d="M-48,0 Q0,16 48,0 Q40,9 0,11 Q-40,9 -48,0 Z" fill="${INK}"/>${who ? figure(8, 2, 0.45, 'hat', 1) : ''}<line x1="-30" y1="2" x2="-52" y2="22" stroke="${INK}" stroke-width="1.5"/></g>`;
export const house = (x: number, y: number, s = 1, a = 0.9) => `<g opacity="${a}" transform="translate(${x},${y}) scale(${s})"><rect x="-40" y="-40" width="80" height="40" fill="#FBF8F0" stroke="${INK}" stroke-opacity=".35"/><path d="M-50,-40 Q0,-62 50,-40 L44,-36 Q0,-54 -44,-36 Z" fill="${INK}"/><rect x="-10" y="-24" width="20" height="24" fill="${INK}" opacity=".55"/><rect x="-32" y="-30" width="12" height="10" fill="${INK}" opacity=".35"/><rect x="20" y="-30" width="12" height="10" fill="${INK}" opacity=".35"/></g>`;
export const wallGate = (x: number, y: number, w = 420, s = 1, a = 0.8) => {
  let crenel = ''; for (let i = -w / 2; i < w / 2; i += 22) crenel += `<rect x="${i}" y="-96" width="12" height="10" fill="${INK}"/>`;
  return `<g opacity="${a}" transform="translate(${x},${y}) scale(${s})"><rect x="${-w / 2}" y="-86" width="${w}" height="86" fill="#8E8576"/>${crenel}<path d="M-28,0 v-50 q28,-26 56,0 v50 z" fill="${INK}"/><path d="M-70,-86 v-40 h140 v40 z" fill="#6F6658"/><path d="M-84,-126 Q0,-150 84,-126 L76,-120 Q0,-140 -76,-120 Z" fill="${INK}"/></g>`;
};
export const tent = (x: number, y: number, s = 1, a = 0.75) => `<path d="M${x - 26 * s},${y} L${x},${y - 30 * s} L${x + 26 * s},${y} Z" fill="${INK}" opacity="${a}"/><path d="M${x},${y - 30 * s} v-8" stroke="${INK}" opacity="${a}"/>`;
export const fire = (x: number, y: number, s = 1, id?: string) => `${id ? `<circle cx="${x}" cy="${y - 6 * s}" r="${22 * s}" fill="${GOLD}" opacity=".35" filter="url(#${id}s)"/>` : ''}<path d="M${x - 6 * s},${y} Q${x - 8 * s},${y - 12 * s} ${x},${y - 20 * s} Q${x + 8 * s},${y - 12 * s} ${x + 6 * s},${y} Z" fill="#D9682B"/><path d="M${x - 3 * s},${y} Q${x - 3 * s},${y - 7 * s} ${x},${y - 11 * s} Q${x + 3 * s},${y - 7 * s} ${x + 3 * s},${y} Z" fill="${GOLD}"/>`;
export const flag = (x: number, y: number, s = 1, c = RED, a = 0.9) => `<g opacity="${a}"><line x1="${x}" y1="${y}" x2="${x}" y2="${y - 90 * s}" stroke="${INK}" stroke-width="${2.5 * s}"/><path d="M${x},${y - 90 * s} q${20 * s},${6 * s} ${40 * s},0 q${-4 * s},${12 * s} 0,${24 * s} q${-20 * s},${6 * s} ${-40 * s},0 z" fill="${c}"/></g>`;
export const slipsBundle = (x: number, y: number, n = 9, s = 1, a = 1, chars = '') => {
  let o = `<g transform="translate(${x},${y}) scale(${s})" opacity="${a}">`;
  for (let i = 0; i < n; i++) {
    o += `<rect x="${i * 22}" y="0" width="18" height="180" rx="3" fill="#D8C08A" stroke="#9C8150" stroke-width="1"/>`;
    const ch = chars[n - 1 - i]; if (ch) o += `<text x="${i * 22 + 9}" y="40" font-size="14" text-anchor="middle" fill="${INK}" style="font-family:KaiTi, STKaiti, serif">${ch}</text>`;
    else for (let k = 0; k < 6; k++) o += `<rect x="${i * 22 + 6}" y="${22 + k * 24}" width="6" height="${8 + ((i * 7 + k * 3) % 8)}" fill="${INK}" opacity=".55"/>`;
  }
  return o + `<line x1="-6" y1="40" x2="${n * 22 + 2}" y2="40" stroke="#6E5530" stroke-width="2"/><line x1="-6" y1="140" x2="${n * 22 + 2}" y2="140" stroke="#6E5530" stroke-width="2"/></g>`;
};
export const seal = (x: number, y: number, text: string, s = 1) => {
  const n = text.length, cols = n > 2 ? 2 : 1, rows = Math.ceil(n / cols), sz = 40 * s, cell = sz / Math.max(cols, rows);
  let t = '';
  [...text].forEach((ch, i) => { const c = cols - 1 - Math.floor(i / rows), r = i % rows; t += `<text x="${f(x + cell * (c + 0.5))}" y="${f(y + cell * (r + 0.82))}" font-size="${f(cell * 0.86)}" text-anchor="middle" fill="#FBEFE6" style="font-family:KaiTi, STKaiti, serif" font-weight="700">${ch}</text>`; });
  return `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" rx="${3 * s}" fill="${RED}" opacity=".9"/>${t}`;
};
export const vtext = (x: number, y: number, text: string, size = 26, c = INK, a = 0.85) => { let t = ''; [...text].forEach((ch, i) => { t += `<text x="${x}" y="${f(y + i * size * 1.12)}" font-size="${size}" text-anchor="middle" fill="${c}" opacity="${a}" style="font-family:KaiTi, STKaiti, &apos;Kaiti SC&apos;, serif">${ch}</text>`; }); return t; };
const deer = (x: number, y: number, s = 1) => `<g transform="translate(${x},${y}) scale(${s})" fill="#8A5A34"><ellipse cx="0" cy="-30" rx="26" ry="11"/><path d="M-18,-24 l-4,24 h4 l4,-22 M14,-24 l4,24 h4 l-2,-24" stroke="#8A5A34" stroke-width="4"/><path d="M22,-36 q8,-8 10,-22 l6,2 q-2,14 -10,24 z"/><path d="M33,-58 l-6,-16 M33,-58 l6,-14 M30,-66 l-8,-4" stroke="#5B3B22" stroke-width="2" fill="none"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${-14 + i * 7}" cy="${-32 + (i % 2) * 4}" r="2" fill="#F4E4C6"/>`).join('')}</g>`;
const horse = (x: number, y: number, s = 1, c = INK) => `<g transform="translate(${x},${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="-30" rx="28" ry="12"/><path d="M-20,-24 l-4,24 h4 l4,-22 M16,-24 l4,24 h4 l-2,-24" stroke="${c}" stroke-width="4"/><path d="M22,-38 q10,-10 18,-12 l4,8 q-8,4 -14,14 z"/><path d="M-28,-34 q-12,4 -14,18" stroke="${c}" stroke-width="4" fill="none"/></g>`;
const drum = (x: number, y: number, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-22" y="-30" width="44" height="30" rx="6" fill="#7A3B26"/><ellipse cx="0" cy="-30" rx="22" ry="7" fill="#C9A46A"/><path d="M-30,-58 l22,22 M30,-58 l-22,22" stroke="${INK}" stroke-width="3"/></g>`;
const pot = (x: number, y: number, s = 1, broken = false) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-22,-24 Q-26,0 0,4 Q26,0 22,-24 Z" fill="#4A4038"/><ellipse cx="0" cy="-24" rx="22" ry="6" fill="#6B5D50"/>${broken ? `<path d="M-6,-24 l6,12 l-4,10 l8,6" stroke="${PAPER}" stroke-width="3" fill="none"/>` : ''}</g>`;

// ---------------- 场景 ----------------
type Scene = (id: string) => string;
const SCENES: Record<string, Scene> = {
  jianjia: (id) => ridge(id, { y: 210, amp: 70, seed: 11, tone: 0.18, peaks: 2 }) + mist(id, 230, 70)
    + water(5, 250, 420, 800, 30, 0.3) + figure(560, 300, 0.75, 'robe', 0.55) + mist(id, 305, 30, 800, 0.5)
    + reeds(21, -20, 330, 470, 70, 230, 0.18) + reeds(22, 620, 820, 480, 40, 200, 0.12) + frost(3, 0, 800, 220, 480, 140)
    + vtext(708, 60, '蒹葭苍苍', 26) + seal(692, 180, '秦风'),
  canghai: (id) => SCENES.jieshi(id),
  jieshi: (id) => sun(560, 250, 34, RED, id) + `<rect x="0" y="258" width="800" height="250" fill="#E8DFC8" opacity=".6"/>`
    + water(9, 262, 480, 800, 50, 0.45) + `<path d="M-10,500 L-10,210 Q60,150 140,190 Q200,160 250,230 L300,500 Z" fill="${INK}" opacity=".8" filter="url(#${id}r)"/>`
    + pine(4, 120, 196, 0.6) + figure(205, 236, 0.6, 'scholar', 0.9) + `<path d="M300,330 q40,-20 80,0 q40,20 80,0 q40,-20 80,0" stroke="${INK}" stroke-opacity=".4" stroke-width="2" fill="none"/>`
    + vtext(712, 60, '东临碣石', 26) + seal(696, 180, '观沧'),
  changge: (id) => sun(140, 120, 28, '#D97E2B', id) + ridge(id, { y: 260, amp: 60, seed: 31, tone: 0.16 })
    + `<path d="M0,330 Q300,300 800,380 L800,500 L0,500 Z" fill="#DCE3D0" opacity=".5"/>` + water(12, 340, 470, 800, 26, 0.3)
    + Array.from({ length: 7 }, (_, i) => `<g transform="translate(${80 + i * 34},${300 - (i % 2) * 6})"><line x1="0" y1="0" x2="0" y2="-60" stroke="#4E6B45" stroke-width="3"/><ellipse cx="-10" cy="-38" rx="12" ry="6" fill="#5E7F52" opacity=".8"/><ellipse cx="10" cy="-48" rx="12" ry="6" fill="#5E7F52" opacity=".8"/><circle cx="0" cy="-64" r="7" fill="#C9B04A"/><circle cx="4" cy="-46" r="2" fill="#fff" opacity=".9"/></g>`).join('')
    + `<path d="M520,330 q60,30 140,40 q80,10 160,50" stroke="${INK}" stroke-opacity=".35" stroke-width="3" fill="none"/><path d="M700,395 l24,10 -22,10" stroke="${INK}" stroke-opacity=".5" stroke-width="2.5" fill="none"/>`
    + vtext(712, 60, '百川东到海', 24) + seal(696, 205, '长歌'),
  dafeng: (id) => ridge(id, { y: 360, amp: 80, seed: 41, tone: 0.3 }) + Array.from({ length: 6 }, (_, i) => `<path d="M${-40 + i * 150},${100 + (i % 3) * 40} q60,-40 140,-10 q40,-30 90,0" stroke="${INK}" stroke-opacity=".35" stroke-width="${6 - (i % 3)}" fill="none" stroke-linecap="round" filter="url(#${id}s)"/>`).join('')
    + Array.from({ length: 10 }, (_, i) => `<path d="M${30 + i * 75},${60 + (i * 37) % 120} q30,-6 60,4" stroke="${INK2}" stroke-opacity=".5" stroke-width="1.5" fill="none"/>`).join('')
    + `<rect x="300" y="360" width="200" height="16" fill="${INK}" opacity=".7"/><rect x="320" y="376" width="160" height="60" fill="#8E8576" opacity=".7"/>` + figure(400, 360, 0.9, 'scholar', 0.95) + flag(470, 360, 0.8)
    + vtext(712, 60, '大风起兮', 26) + seal(696, 180, '汉高'),
  gaixia: (id) => `<rect width="800" height="500" fill="#2E2A33" opacity=".78"/>` + moon(640, 90, 26, id)
    + ridge(id, { y: 300, amp: 70, seed: 51, tone: 0.5, color: '#14121A' })
    + Array.from({ length: 14 }, (_, i) => { const x = 40 + i * 56, y = 380 + (i % 3) * 22; return tent(x, y, 0.9, 0.85) + fire(x + 24, y + 4, 0.6, id); }).join('')
    + `<rect x="360" y="420" width="90" height="40" fill="#14121A"/>` + tent(405, 420, 1.6, 0.95) + fire(405, 438, 0.7, id)
    + `<text x="120" y="250" font-size="22" fill="#E8D9B0" opacity=".55" style="font-family:KaiTi, STKaiti, serif">♪ 楚 歌 ♪</text><text x="560" y="240" font-size="22" fill="#E8D9B0" opacity=".55" style="font-family:KaiTi, STKaiti, serif">♪ 楚 歌 ♪</text>`
    + vtext(60, 60, '四面楚歌', 26, '#EFE3C2', 0.85),
  changshao: (id) => ridge(id, { y: 250, amp: 60, seed: 61, tone: 0.2 }) + mist(id, 270, 50)
    + `<path d="M0,330 L800,330 L800,500 L0,500 Z" fill="#E4D9BF" opacity=".5"/>`
    + Array.from({ length: 9 }, (_, i) => figure(80 + i * 30, 380 + (i % 2) * 8, 0.7, 'soldier', 0.7)).join('') + flag(70, 380, 0.9, '#6B4E9C') + drum(140, 420, 1.1)
    + Array.from({ length: 9 }, (_, i) => figure(480 + i * 32, 380 + (i % 2) * 8, 0.7, 'soldier', 0.55, -1)).join('') + flag(760, 380, 0.9) + drum(690, 420, 1.1)
    + `<text x="652" y="300" font-size="20" fill="${INK}" opacity=".6" style="font-family:KaiTi, STKaiti, serif">咚！咚！咚！</text>`
    + vtext(400, 60, '一鼓作气', 24) + seal(384, 180, '长勺'),
  xumu: (id) => ridge(id, { y: 200, amp: 40, seed: 71, tone: 0.12 }) + wallGate(400, 330, 640, 1, 0.75)
    + `<rect x="0" y="330" width="800" height="170" fill="#E4D9BF" opacity=".55"/>`
    + `<rect x="566" y="120" width="12" height="240" fill="#7A5A36"/>` + Array.from({ length: 8 }, (_, i) => figure(380 + i * 26 - (i > 3 ? 0 : 0), 430 + (i % 2) * 10, 0.62, 'robe', 0.65)).join('')
    + figure(610, 410, 0.8, 'scholar', 0.9) + `<text x="600" y="330" font-size="18" fill="${RED}" style="font-family:KaiTi, STKaiti, serif">徙之者，予五十金</text>`
    + vtext(60, 60, '徙木立信', 24) + seal(44, 180, '商君'),
  changping: (id) => `<rect width="800" height="500" fill="#E9C9A4" opacity=".35"/>` + sun(620, 170, 40, RED, id) + ridge(id, { y: 260, amp: 120, seed: 81, tone: 0.45 })
    + ridge(id, { y: 340, amp: 80, seed: 82, tone: 0.6 }) + Array.from({ length: 6 }, (_, i) => flag(120 + i * 110, 420 + (i % 2) * 20, 0.7, i % 2 ? RED : '#3F3A6B', 0.75)).join('')
    + vtext(712, 60, '纸上谈兵', 24) + seal(696, 180, '长平'),
  jingke: () => `<rect x="120" y="160" width="560" height="190" fill="#E7D7B0" stroke="#9C8150"/><path d="M140,190 q80,40 160,10 q60,-20 120,40 q60,40 140,0 q40,-20 80,10" stroke="${INK}" stroke-opacity=".4" stroke-width="2" fill="none"/>`
    + `<circle cx="260" cy="250" r="5" fill="${INK}" opacity=".5"/><circle cx="430" cy="230" r="5" fill="${INK}" opacity=".5"/><text x="270" y="244" font-size="16" fill="${INK}" opacity=".7" style="font-family:KaiTi, STKaiti, serif">督亢</text>`
    + `<rect x="680" y="150" width="34" height="210" rx="16" fill="#B9A06C" stroke="#7E6638"/>`
    + `<g transform="translate(560,300) rotate(-18)"><path d="M0,0 L130,-8 L150,0 L130,8 Z" fill="#C8CDD3" stroke="#555" /><rect x="-36" y="-7" width="38" height="14" rx="3" fill="#5A3A22"/></g>`
    + vtext(60, 60, '图穷匕见', 24) + seal(44, 180, '荆轲'),
  qin: (id) => ridge(id, { y: 300, amp: 110, seed: 91, tone: 0.35 }) + `<path d="M40,300 L140,250 L220,280 L320,220 L420,260 L520,210 L640,250 L760,220" stroke="#6F6658" stroke-width="9" fill="none" stroke-linejoin="round" opacity=".85"/>`
    + [140, 320, 520, 640].map((x, i) => `<rect x="${x - 9}" y="${[250, 220, 210, 250][i] - 24}" width="18" height="24" fill="#6F6658"/>`).join('')
    + `<g transform="translate(280,330)"><rect width="250" height="120" fill="#FBF8F0" stroke="${INK}" stroke-opacity=".3"/><text x="18" y="48" font-size="34" fill="${INK}" style="font-family:KaiTi, STKaiti, serif">书同文</text><text x="18" y="96" font-size="34" fill="${INK}" style="font-family:KaiTi, STKaiti, serif">车同轨</text><circle cx="205" cy="60" r="30" fill="#A0763C"/><rect x="194" y="49" width="22" height="22" fill="#FBF8F0"/></g>`
    + seal(700, 60, '始皇', 1.2),
  zhilu: () => `<rect x="0" y="0" width="800" height="500" fill="#EDE3CC"/><rect x="60" y="60" width="680" height="30" fill="#7A3B26" opacity=".8"/>`
    + [100, 260, 540, 700].map((x) => `<rect x="${x - 10}" y="90" width="20" height="330" fill="#8E3B2A" opacity=".75"/>`).join('')
    + `<rect x="330" y="150" width="140" height="70" fill="${INK}" opacity=".15"/>` + figure(400, 220, 0.9, 'scholar', 0.9)
    + deer(330, 420, 1.2) + figure(250, 420, 1, 'scholar', 0.9) + Array.from({ length: 5 }, (_, i) => figure(520 + i * 40, 430, 0.8, 'scholar', 0.55, -1)).join('')
    + `<text x="190" y="330" font-size="22" fill="${RED}" style="font-family:KaiTi, STKaiti, serif">“马也。”</text>` + vtext(718, 120, '指鹿为马', 22),
  dazexiang: (id) => `<rect width="800" height="500" fill="#C9C3B6" opacity=".45"/>` + ridge(id, { y: 260, amp: 60, seed: 101, tone: 0.3 }) + mist(id, 280, 60)
    + `<path d="M0,380 L800,360 L800,500 L0,500 Z" fill="#B7AE9A" opacity=".5"/>` + Array.from({ length: 12 }, (_, i) => figure(180 + i * 38, 420 + (i % 3) * 8, 0.7, 'robe', 0.75)).join('')
    + `<line x1="420" y1="410" x2="440" y2="230" stroke="#6A5A3C" stroke-width="5"/><path d="M440,232 q30,4 56,-6 q-4,20 2,40 q-30,8 -58,2 z" fill="${RED}" opacity=".85"/>` + rain(17, 800, 500, 160, 0.4)
    + vtext(60, 60, '斩木为兵', 24) + vtext(100, 60, '揭竿为旗', 24),
  julu: (id) => ridge(id, { y: 220, amp: 50, seed: 111, tone: 0.2 }) + `<rect x="0" y="260" width="800" height="120" fill="#D9D2BE" opacity=".6"/>` + water(31, 270, 370, 800, 26, 0.4)
    + `<g opacity=".7"><path d="M120,330 q50,14 100,0 q-10,10 -50,12 q-40,-2 -50,-12z" fill="${INK}" transform="rotate(18 170 330)"/><path d="M420,320 q50,14 100,0 q-10,10 -50,12 q-40,-2 -50,-12z" fill="${INK}" transform="rotate(-22 470 320)"/></g>`
    + `<circle cx="180" cy="345" r="14" fill="none" stroke="${INK}" stroke-opacity=".3"/><circle cx="470" cy="335" r="18" fill="none" stroke="${INK}" stroke-opacity=".3"/>`
    + `<rect x="0" y="380" width="800" height="120" fill="#E4D9BF" opacity=".7"/>` + pot(560, 450, 1, true) + pot(640, 460, 0.9, true) + fire(720, 460, 1.2, id)
    + Array.from({ length: 7 }, (_, i) => figure(80 + i * 46, 470, 0.7, 'soldier', 0.75)).join('') + vtext(712, 60, '破釜沉舟', 24) + seal(696, 180, '巨鹿'),
  hanxin: (id) => ridge(id, { y: 180, amp: 30, seed: 121, tone: 0.12 }) + house(110, 300, 1.2) + house(690, 300, 1.2)
    + `<rect x="0" y="300" width="800" height="200" fill="#E4D9BF" opacity=".6"/>` + figure(400, 420, 1.15, 'robe', 0.9) + figure(400, 440, 0.9, 'crawl', 0.85, -1)
    + Array.from({ length: 7 }, (_, i) => figure(190 + i * 70 + (i > 3 ? 60 : 0), 470, 0.7, 'robe', 0.45)).join('') + vtext(60, 60, '胯下之辱', 24),
  zhangqian: (id) => `<rect width="800" height="500" fill="#EBD7AE" opacity=".5"/>` + sun(640, 120, 34, '#D97E2B', id)
    + `<path d="M0,330 Q160,270 320,320 Q480,370 640,300 Q720,270 800,300 L800,500 L0,500 Z" fill="#D8B983" opacity=".75"/><path d="M0,400 Q200,350 420,400 Q600,440 800,390 L800,500 L0,500 Z" fill="#C9A66B" opacity=".8"/>`
    + [0, 1, 2, 3, 4].map((i) => `<g transform="translate(${180 + i * 90},${350 + (i % 2) * 6}) scale(.9)"><ellipse cx="0" cy="-30" rx="30" ry="12" fill="${INK}" opacity=".75"/><path d="M-8,-42 q6,-14 14,0 M8,-42 q6,-14 14,0" fill="${INK}" opacity=".75"/><path d="M26,-36 q14,-14 18,-30" stroke="${INK}" stroke-width="6" opacity=".75" fill="none"/><path d="M-20,-22 v22 M-8,-22 v22 M10,-22 v22 M20,-22 v22" stroke="${INK}" stroke-width="3" opacity=".75"/>${i === 0 ? figure(0, -40, 0.5, 'hat', 0.9) : ''}</g>`).join('')
    + vtext(60, 60, '凿空西域', 24) + seal(44, 180, '博望'),
  taishi: (id) => `<rect width="800" height="500" fill="#3A322A" opacity=".72"/><circle cx="560" cy="300" r="120" fill="${GOLD}" opacity=".25" filter="url(#${id}b)"/>`
    + `<rect x="160" y="360" width="480" height="20" fill="#5A3A22"/>` + slipsBundle(200, 180, 8, 0.9, 0.95) + figure(470, 360, 1.3, 'sit', 0.95)
    + `<rect x="548" y="300" width="22" height="60" fill="#8E6A3A"/>` + fire(559, 300, 0.9, id)
    + vtext(80, 60, '史家之绝唱', 24, '#EFE3C2', 0.8),
  changan: (id) => `<rect width="800" height="500" fill="#E6D6B5" opacity=".6"/>` + Array.from({ length: 6 }, (_, i) => `<line x1="${520 + i * 40}" y1="40" x2="${520 + i * 40}" y2="220" stroke="#7A5A36" stroke-width="4"/>`).join('') + `<rect x="520" y="40" width="200" height="180" fill="none" stroke="#7A5A36" stroke-width="6"/>` + moon(620, 120, 22, id)
    + slipsBundle(60, 260, 10, 0.9) + Array.from({ length: 9 }, (_, i) => `<rect x="${300 + i * 34}" y="${400 + (i % 3) * 14}" width="16" height="70" rx="2" fill="#D8C08A" stroke="#9C8150" transform="rotate(${(i * 37) % 70 - 35} ${308 + i * 34} ${430})"/>`).join('')
    + figure(560, 380, 1.4, 'scholar', 0.85, -1),
  museum: (id) => `<rect width="800" height="500" fill="#2D2B2E"/><circle cx="400" cy="100" r="220" fill="#FFF3D6" opacity=".18" filter="url(#${id}b)"/>`
    + `<rect x="170" y="200" width="460" height="220" fill="#8FA3A8" opacity=".18" stroke="#C9D6DA" stroke-opacity=".5"/>` + slipsBundle(250, 230, 14, 0.85)
    + `<rect x="300" y="440" width="200" height="30" fill="#5A5048"/><text x="400" y="461" font-size="16" text-anchor="middle" fill="#E8DCC0" style="font-family:KaiTi, STKaiti, serif">汉代竹简</text>`,
  slips: () => slipsBundle(140, 120, 12, 1.1, 1) + `<g transform="translate(560,380) rotate(-30)"><path d="M0,0 L110,-6 L124,0 L110,6 Z" fill="#B9BEC4" stroke="#555"/><rect x="-44" y="-7" width="46" height="14" rx="3" fill="#5A3A22"/></g>`
    + `<path d="M520,420 q10,-6 20,0 q10,6 20,0" stroke="#C9A46A" stroke-width="3" fill="none"/>`,
  jiangnan: (id) => ridge(id, { y: 200, amp: 50, seed: 131, tone: 0.18, color: '#3E5A3A' }) + mist(id, 220, 40)
    + `<path d="M0,250 Q200,230 420,250 Q620,270 800,240 L800,300 L0,300 Z" fill="#7FA66B" opacity=".55" filter="url(#${id}r)"/>` + grass(5, 0, 800, 268, 120, 22, '#4E7B3E')
    + willow(3, 120, 268, 0.9) + willow(4, 640, 262, 0.8) + water(7, 300, 470, 800, 30, 0.3) + boat(380, 400, 1.1) + moon(560, 90, 24, id)
    + vtext(712, 60, '春风又绿', 26) + seal(696, 180, '荆公'),
  xinghua: (id) => mist(id, 260, 200) + willow(9, 650, 480, 1.2, 0.5) + `<path d="M-10,140 Q180,170 300,230 Q380,270 460,250" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M200,180 q40,-50 90,-60 M300,230 q30,40 80,50" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`
    + blossoms(3, 260, 180, 90, 60) + blossoms(4, 400, 250, 70, 40) + blossoms(5, 120, 150, 60, 30)
    + Array.from({ length: 4 }, (_, i) => `<g transform="translate(${330 + i * 40},${140 + (i % 2) * 40})"><ellipse cx="0" cy="0" rx="5" ry="3" fill="${GOLD}"/><path d="M-2,-2 q-6,-8 -10,0 M2,-2 q6,-8 10,0" stroke="${INK}" stroke-width="1" fill="#fff" fill-opacity=".6"/></g>`).join('')
    + vtext(712, 60, '春意闹', 28) + seal(696, 160, '宋祁'),
  chunye: (id) => `<rect width="800" height="500" fill="#3B4048" opacity=".55"/>` + ridge(id, { y: 260, amp: 60, seed: 141, tone: 0.4, color: '#1E2228' })
    + house(260, 400, 1.3) + `<rect x="246" y="356" width="20" height="18" fill="${GOLD}" opacity=".85"/>` + `<circle cx="256" cy="365" r="30" fill="${GOLD}" opacity=".25" filter="url(#${id}s)"/>` + willow(7, 480, 430, 1.05, 0.75)
    + grass(9, 0, 800, 440, 90, 18, '#3E5A3A') + rain(31, 800, 500, 120, 0.22) + vtext(712, 60, '润物细无声', 24, '#EFE3C2', 0.8),
  yueye: (id) => `<rect width="800" height="500" fill="#33363F" opacity=".6"/>` + `<ellipse cx="470" cy="110" rx="230" ry="40" fill="#5A5E6A" opacity=".6" filter="url(#${id}b)"/>` + moon(520, 110, 30, id)
    + `<path d="M120,460 Q160,360 220,320 M220,320 q30,-30 70,-30 M220,320 q-20,-40 -10,-80" stroke="#1E2026" stroke-width="5" fill="none"/>` + blossoms(11, 260, 280, 60, 35, '#E8B9C4') + blossoms(12, 200, 240, 50, 25, '#E8B9C4')
    + `<g opacity=".35" transform="translate(140,40) skewX(-30)"><path d="M120,420 Q160,360 220,330" stroke="#000" stroke-width="5" fill="none"/>${blossoms(11, 260, 400, 60, 35, '#000')}</g>` + water(41, 420, 490, 800, 14, 0.25)
    + vtext(712, 60, '花弄影', 28, '#EFE3C2', 0.85),
  beiying: () => `<rect x="0" y="0" width="800" height="500" fill="#E6DDC8"/><rect x="0" y="300" width="800" height="200" fill="#B8AE98"/><rect x="380" y="220" width="420" height="80" fill="#8E8576"/>`
    + [0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${i * 120}" y="400" width="80" height="10" fill="#6F6658"/>`).join('') + `<line x1="0" y1="380" x2="800" y2="380" stroke="#5A5048" stroke-width="4"/><line x1="0" y1="430" x2="800" y2="430" stroke="#5A5048" stroke-width="4"/>`
    + `<g transform="translate(410,300)"><path d="M-26,0 Q-34,-60 -18,-86 L18,-86 Q30,-60 22,0 Z" fill="#1F1C24"/><circle cx="0" cy="-98" r="14" fill="#1F1C24"/><path d="M-16,-108 h32 v-6 h-32z" fill="#1F1C24"/><path d="M-18,-80 l-10,-60 M18,-80 l10,-60" stroke="#1F1C24" stroke-width="8" stroke-linecap="round"/></g>`
    + `<circle cx="640" cy="200" r="12" fill="#E08A2E"/><circle cx="660" cy="206" r="12" fill="#E08A2E"/><circle cx="650" cy="190" r="12" fill="#E08A2E"/>` + vtext(80, 50, '背影', 30),
  luoque: (id) => `<rect x="250" y="80" width="300" height="320" fill="#7A3B26" opacity=".85"/><rect x="262" y="92" width="134" height="300" fill="#8E4A30"/><rect x="404" y="92" width="134" height="300" fill="#8E4A30"/><circle cx="390" cy="250" r="6" fill="${GOLD}"/><circle cx="410" cy="250" r="6" fill="${GOLD}"/>`
    + `<path d="M210,80 L590,80 L560,50 L240,50 Z" fill="${INK}"/><rect x="0" y="400" width="800" height="100" fill="#E4D9BF"/>` + grass(3, 0, 800, 410, 60, 20)
    + Array.from({ length: 9 }, (_, i) => `<g transform="translate(${180 + i * 52},${430 + (i % 3) * 14})"><ellipse cx="0" cy="0" rx="10" ry="7" fill="#7B5A3A"/><circle cx="8" cy="-5" r="5" fill="#7B5A3A"/><path d="M-10,0 l-8,-3" stroke="#7B5A3A" stroke-width="3"/></g>`).join('')
    + `<path d="M120,470 Q300,330 520,470" stroke="${INK}" stroke-width="2" fill="none"/>` + Array.from({ length: 9 }, (_, i) => `<line x1="${150 + i * 42}" y1="${470 - Math.sin((i + 1) / 10 * Math.PI) * 120}" x2="${150 + i * 42}" y2="470" stroke="${INK}" stroke-width="1" opacity=".6"/>`).join('') + mist(id, 30, 40),
  chong: (id) => `<rect width="800" height="500" fill="#9AA4AE" opacity=".45"/>` + Array.from({ length: 5 }, (_, i) => `<path d="M${-60 + i * 30},${80 + i * 50} q120,-40 260,0 q120,30 240,-10" stroke="#5A6470" stroke-opacity=".5" stroke-width="${10 - i}" fill="none" filter="url(#${id}s)"/>`).join('')
    + `<path d="M0,360 Q200,330 400,370 L400,500 L0,500 Z" fill="#6F7C88" opacity=".6"/>` + water(51, 340, 480, 800, 40, 0.5)
    + house(560, 360, 0.9) + house(660, 370, 0.8) + house(740, 360, 0.7) + `<path d="M480,380 L800,380 L800,500 L480,500 Z" fill="#B5AD9A" opacity=".6"/>` + rain(5, 800, 500, 140, 0.35)
    + `<path d="M120,140 l120,50" stroke="${RED}" stroke-width="5" marker-end=""/><path d="M240,190 l-24,-2 l12,-18 z" fill="${RED}"/><text x="80" y="120" font-size="20" fill="${RED}" style="font-family:KaiTi, STKaiti, serif">台风</text>`,
  kongxiang: (id) => `<rect width="800" height="500" fill="#EDE3CC"/>` + [0, 1, 2].map((i) => `<rect x="${40 + i * 130}" y="120" width="110" height="200" fill="#E7DCC4" stroke="${INK}" stroke-opacity=".25"/><path d="M${30 + i * 130},120 h130 l-12,-16 h-106 z" fill="${INK}" opacity=".7"/>`).join('')
    + `<path d="M0,320 L800,320 L800,500 L0,500 Z" fill="#D9CCAC"/>` + Array.from({ length: 34 }, (_, i) => figure(430 + (i % 12) * 30, 360 + Math.floor(i / 12) * 44, 0.62, 'robe', 0.75)).join('')
    + Array.from({ length: 6 }, (_, i) => `<g transform="translate(${450 + i * 60},90)"><line x1="0" y1="0" x2="0" y2="20" stroke="${INK}"/><ellipse cx="0" cy="34" rx="12" ry="15" fill="${RED}" opacity=".85"/></g>`).join('') + mist(id, 400, 10, 400, 0)
    + `<text x="110" y="420" font-size="20" fill="${INK}" opacity=".6" style="font-family:KaiTi, STKaiti, serif">巷子空了</text><text x="560" y="300" font-size="20" fill="${INK}" opacity=".6" style="font-family:KaiTi, STKaiti, serif">大街上满了</text>`,
  bieji: (id) => `<rect width="800" height="500" fill="#2A2420"/><circle cx="400" cy="270" r="230" fill="${GOLD}" opacity=".16" filter="url(#${id}b)"/>`
    + `<path d="M40,500 L400,40 L760,500 Z" fill="#3A302A" opacity=".85"/><path d="M400,40 L400,500" stroke="#1E1915" stroke-width="3" opacity=".6"/><path d="M220,500 L400,40 L580,500" stroke="#1E1915" stroke-width="2" fill="none" opacity=".4"/>`
    + `<rect x="180" y="400" width="440" height="16" fill="#5A3A22"/><rect x="380" y="352" width="18" height="48" fill="#8E6A3A"/>` + fire(389, 352, 0.9, id)
    + figure(300, 400, 1.15, 'sit', 0.95) + `<path d="M296,334 l-10,-14 l14,4 l6,-12 l6,12 l14,-4 l-10,14 z" fill="${INK}"/>` + figure(500, 400, 1.05, 'robe', 0.92, -1) + `<path d="M488,340 q12,-16 26,0" stroke="${INK}" stroke-width="5" fill="none"/>`
    + `<g opacity=".8">${horse(690, 470, 1.1, '#15110E')}</g>` + `<path d="M330,330 l30,-10" stroke="#C9A46A" stroke-width="3"/>` + vtext(80, 70, '虞兮奈何', 26, '#EFE3C2', 0.85),
  wujiang: (id) => `<rect width="800" height="500" fill="#E9C9A4" opacity=".4"/>` + sun(640, 150, 34, RED, id) + ridge(id, { y: 230, amp: 60, seed: 171, tone: 0.35 }) + mist(id, 250, 50)
    + `<rect x="0" y="260" width="800" height="240" fill="#D8CFBC" opacity=".55"/>` + water(81, 270, 480, 800, 44, 0.42)
    + `<path d="M-10,500 L-10,330 Q120,300 260,340 Q330,360 360,500 Z" fill="#B7AA8E"/>` + reeds(91, 0, 300, 420, 30, 110, 0.15)
    + figure(190, 340, 1.0, 'soldier', 0.95) + `<g opacity=".9">${horse(110, 372, 0.85)}</g>` + boat(470, 360, 1.3, true)
    + geese(560, 90, 5, 1) + vtext(712, 60, '乌江', 26) + seal(696, 140, '项王'),
  shiren: (id) => ridge(id, { y: 210, amp: 70, seed: 181, tone: 0.2 }) + mist(id, 230, 50) + water(91, 260, 480, 800, 30, 0.32)
    + `<rect x="0" y="300" width="330" height="200" fill="#E4D9BF" opacity=".7"/>` + `<g transform="translate(200,300)"><rect x="-6" y="-70" width="8" height="70" fill="${INK}" opacity=".8"/><rect x="62" y="-70" width="8" height="70" fill="${INK}" opacity=".8"/><path d="M-30,-70 Q32,-108 100,-70 L92,-62 Q32,-96 -22,-62 Z" fill="${INK}"/></g>`
    + figure(120, 330, 0.9, 'scholar', 0.9) + figure(232, 312, 0.8, 'scholar', 0.75) + figure(300, 340, 0.85, 'robe', 0.8, -1)
    + `<text x="120" y="252" font-size="18" text-anchor="middle" fill="${INK2}" style="font-family:KaiTi, STKaiti, &apos;Kaiti SC&apos;, serif">杜牧</text><text x="232" y="214" font-size="18" text-anchor="middle" fill="${INK2}" style="font-family:KaiTi, STKaiti, &apos;Kaiti SC&apos;, serif">王安石</text><text x="300" y="262" font-size="18" text-anchor="middle" fill="${INK2}" style="font-family:KaiTi, STKaiti, &apos;Kaiti SC&apos;, serif">李清照</text>`
    + boat(560, 400, 0.9, false) + geese(500, 110, 6, 1) + vtext(712, 60, '题乌江亭', 24) + seal(696, 180, '诗'),
  piaomu: (id) => ridge(id, { y: 190, amp: 50, seed: 161, tone: 0.16 }) + wallGate(620, 250, 380, 0.7, 0.55) + mist(id, 255, 40)
    + `<rect x="0" y="270" width="800" height="230" fill="#E4DCC6" opacity=".55"/>` + water(61, 285, 470, 800, 34, 0.32)
    + willow(11, 90, 300, 0.85, 0.6) + figure(160, 300, 0.85, 'robe', 0.9) + `<path d="M172,262 Q240,250 300,330" stroke="${INK}" stroke-width="2" fill="none"/><line x1="300" y1="330" x2="300" y2="345" stroke="${INK}" stroke-width="1"/>`
    + [0, 1, 2].map((i) => `<g transform="translate(${430 + i * 90},${360 + (i % 2) * 14})">${figure(0, 0, 0.6, 'sit', 0.8)}<path d="M8,4 q24,6 44,0" stroke="#F7F2E6" stroke-width="5" fill="none"/></g>`).join('')
    + `<g transform="translate(250,300)"><ellipse cx="0" cy="0" rx="14" ry="6" fill="#6B4A2E"/><path d="M-10,-4 q10,-12 20,0" fill="#F7F2E6"/></g>` + vtext(712, 60, '一饭千金', 24) + seal(696, 180, '淮阴'),
  tuiqiao: (id) => `<rect width="800" height="500" fill="#3A3F4A" opacity=".5"/>` + moon(600, 100, 34, id) + ridge(id, { y: 300, amp: 90, seed: 151, tone: 0.45, color: '#1E2228' })
    + `<rect x="230" y="250" width="200" height="170" fill="#5A5048" opacity=".8"/><path d="M200,250 Q330,220 460,250 L450,262 Q330,236 210,262 Z" fill="#1E2228"/><rect x="290" y="300" width="80" height="120" fill="#2B2722"/><line x1="330" y1="300" x2="330" y2="420" stroke="#5A5048" stroke-width="2"/>`
    + figure(400, 430, 1.05, 'robe', 0.95, -1) + bareTree(5, 120, 440, 1.3, 0.7) + `<g transform="translate(130,330)">${geese(0, 0, 1, 1.2)}</g>` + water(21, 450, 495, 800, 10, 0.25)
    + vtext(712, 60, '僧敲月下门', 24, '#EFE3C2', 0.85),
};

// ---------------- 成语连环画（四格） ----------------
const panel = (id: string, i: number, body: string, cap: string) => {
  const x = (i % 2) * 400, y = Math.floor(i / 2) * 300;
  return `<g transform="translate(${x + 8},${y + 8})"><rect width="384" height="284" fill="${PAPER}" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/><g clip-path="url(#${id}c)">${body}</g><text x="14" y="270" font-size="20" fill="${INK}" style="font-family:KaiTi, STKaiti, serif">${i + 1}. ${cap}</text></g>`;
};
const rabbit = (x: number, y: number, s = 1, dead = false) => `<g transform="translate(${x},${y}) scale(${s})" fill="#8C7F6A">${dead ? `<ellipse cx="0" cy="-8" rx="18" ry="8"/><circle cx="18" cy="-8" r="6"/><path d="M22,-12 l12,-4 M22,-6 l12,2" stroke="#8C7F6A" stroke-width="4"/>` : `<ellipse cx="0" cy="-14" rx="18" ry="10"/><circle cx="16" cy="-22" r="7"/><path d="M16,-28 l-2,-16 M20,-28 l4,-15" stroke="#8C7F6A" stroke-width="4" stroke-linecap="round"/><path d="M-30,-16 h-20 M-28,-8 h-26 M-32,-24 h-14" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>`}</g>`;
const stump = (x: number, y: number) => `<g transform="translate(${x},${y})"><path d="M-18,0 L-14,-40 L14,-40 L18,0 Z" fill="#6E5530"/><ellipse cx="0" cy="-40" rx="14" ry="5" fill="#C9A46A"/><path d="M-26,0 q8,-6 14,0 M12,0 q8,-6 14,0" stroke="#6E5530" stroke-width="4" fill="none"/></g>`;
const IDIOMS: Record<string, (id: string) => string> = {
  shouzhu: (id) => `<defs><clipPath id="${id}c"><rect width="384" height="250"/></clipPath></defs>`
    + panel(id, 0, grass(1, 0, 384, 220, 40) + `<rect x="0" y="220" width="384" height="40" fill="#D9CCAC"/>` + figure(120, 220, 1.1, 'hat') + `<path d="M140,190 l50,40" stroke="${INK}" stroke-width="3"/>` + stump(280, 222), '农夫在田里锄地')
    + panel(id, 1, `<rect x="0" y="220" width="384" height="40" fill="#D9CCAC"/>` + stump(260, 222) + rabbit(160, 210, 1.2) + figure(60, 220, 0.9, 'hat', 0.6), '一只兔子飞奔过来')
    + panel(id, 2, `<rect x="0" y="220" width="384" height="40" fill="#D9CCAC"/>` + stump(200, 222) + rabbit(250, 222, 1.2, true) + `<text x="196" y="160" font-size="28" fill="${RED}">!</text>`, '撞在树桩上，折颈而死')
    + panel(id, 3, `<rect x="0" y="220" width="384" height="40" fill="#D9CCAC"/>` + grass(9, 0, 384, 225, 120, 60, '#5E7F52') + stump(200, 222) + figure(140, 222, 0.9, 'sit') + `<path d="M50,90 l300,0" stroke="${INK}" stroke-opacity=".0"/><text x="250" y="100" font-size="20" fill="${INK}" opacity=".6" style="font-family:KaiTi, STKaiti, serif">日复一日……</text>`, '他天天守着，田都荒了'),
  kezhou: (id) => `<defs><clipPath id="${id}c"><rect width="384" height="250"/></clipPath></defs>`
    + panel(id, 0, water(3, 150, 250, 384, 18, 0.4) + boat(190, 170, 1.6, false) + figure(180, 170, 0.8, 'scholar') + `<path d="M230,175 l20,40" stroke="#888" stroke-width="3"/><path d="M246,212 l8,14" stroke="#555" stroke-width="5"/>`, '剑从船上掉进了江里')
    + panel(id, 1, water(4, 150, 250, 384, 18, 0.4) + boat(190, 170, 1.6, false) + figure(180, 170, 0.8, 'scholar') + `<path d="M222,168 l10,-6" stroke="${RED}" stroke-width="4"/><text x="236" y="150" font-size="18" fill="${RED}" style="font-family:KaiTi, STKaiti, serif">刻！</text>`, '他在船边刻下记号')
    + panel(id, 2, water(5, 150, 250, 384, 18, 0.4) + boat(290, 170, 1.4, false) + figure(280, 170, 0.7, 'scholar') + `<path d="M120,226 l8,14" stroke="#555" stroke-width="5"/><path d="M200,170 h-60" stroke="${INK}" stroke-opacity=".4" stroke-dasharray="6 6"/><text x="60" y="210" font-size="16" fill="${INK}" opacity=".6" style="font-family:KaiTi, STKaiti, serif">剑还在这里</text>`, '船往前走，剑留在原地')
    + panel(id, 3, water(6, 150, 250, 384, 18, 0.4) + `<path d="M0,170 h384" stroke="${INK}" stroke-opacity=".1"/>` + boat(300, 170, 1.4, false) + `<circle cx="270" cy="200" r="10" fill="${INK}" opacity=".8"/><path d="M262,210 l-10,24 M278,210 l10,24" stroke="${INK}" stroke-width="4"/><circle cx="270" cy="196" r="22" fill="none" stroke="${INK}" stroke-opacity=".3"/>`, '船停了，他从记号处下水找剑'),
};

// ---------------- 换个词，画面就变（现代汉语） ----------------
const eyesArt = (k: string) => {
  const eye = (cx: number, mood: string) => {
    const ry = mood === '瞪' ? 22 : mood === '凝视' ? 15 : mood === '瞟' || mood === '瞥' ? 9 : 13;
    const px = mood === '瞟' ? 16 : mood === '扫视' ? -10 : mood === '瞥' ? 12 : 0, pr = mood === '瞪' ? 8 : 10;
    const brow = mood === '瞪' ? `<path d="M${cx - 28},-52 L${cx + 26},${cx < 0 ? -36 : -52}" stroke="${INK}" stroke-width="7" stroke-linecap="round" transform="${cx > 0 ? `scale(-1,1) translate(${-2 * cx},0)` : ''}"/>` : `<path d="M${cx - 26},-44 q26,-12 52,0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    return `${brow}<ellipse cx="${cx}" cy="0" rx="34" ry="${ry}" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${cx + px}" cy="0" r="${pr}" fill="${INK}"/><circle cx="${cx + px + 3}" cy="-3" r="2.5" fill="#fff"/>`;
  };
  const extra = k === '凝视' ? `<path d="M120,0 L330,0" stroke="${GOLD}" stroke-width="3" stroke-dasharray="2 8"/><circle cx="345" cy="0" r="8" fill="${GOLD}"/><text x="230" y="44" font-size="22" text-anchor="middle" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">很久、很专注</text>`
    : k === '瞥' ? `<path d="M120,-10 l60,0 M120,10 l40,0" stroke="${INK2}" stroke-width="3" stroke-linecap="round"/><text x="230" y="44" font-size="22" text-anchor="middle" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">一下子</text>`
    : k === '瞪' ? `<path d="M120,-30 l20,10 M126,0 l24,0 M120,30 l20,-10" stroke="${RED}" stroke-width="4" stroke-linecap="round"/><text x="230" y="44" font-size="22" text-anchor="middle" fill="${RED}" style="font-family:KaiTi, STKaiti, serif">生气、吃惊</text>`
    : k === '瞟' ? `<text x="230" y="44" font-size="22" text-anchor="middle" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">斜着、偷偷的</text>`
    : `<path d="M-120,40 Q0,90 120,40" stroke="${INK2}" stroke-width="3" fill="none" stroke-dasharray="6 6"/><path d="M120,40 l-14,-2 l6,12 z" fill="${INK2}"/><text x="230" y="44" font-size="22" text-anchor="middle" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">很快地扫一片</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -110 560 220" width="100%" height="100%"><rect x="-200" y="-110" width="560" height="220" fill="${PAPER}"/>${eye(-60, k)}${eye(60, k)}${extra}<text x="-180" y="-80" font-size="30" fill="${INK}" style="font-family:KaiTi, STKaiti, serif" font-weight="700">${k}</text></svg>`;
};
const faceArt = (k: string) => {
  const m: Record<string, string> = {
    苦笑: `<path d="M-40,-30 q14,-10 26,-2 M14,-32 q12,-8 26,2" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round" transform="rotate(0)"/><path d="M-36,-46 l24,8 M36,-46 l-24,8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M-26,34 q26,12 52,0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60,-20 q6,12 0,18" stroke="#7FB2D9" stroke-width="4" fill="none"/>`,
    冷笑: `<path d="M-40,-24 h28 M14,-24 h28" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M-40,-44 l26,6 M40,-48 l-26,10" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M-20,36 q30,0 46,-16" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    傻笑: `<path d="M-42,-26 q14,-14 28,0 M14,-26 q14,-14 28,0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-36,16 q36,48 72,0 z" fill="#C24A3C"/><path d="M-30,18 h60" stroke="#fff" stroke-width="5"/><circle cx="-56" cy="10" r="10" fill="#F2A3A0" opacity=".7"/><circle cx="56" cy="10" r="10" fill="#F2A3A0" opacity=".7"/>`,
    狂笑: `<path d="M-42,-30 l24,8 l-24,8 M42,-30 l-24,8 l24,8" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="26" rx="34" ry="28" fill="#C24A3C"/><path d="M-26,12 h52" stroke="#fff" stroke-width="6"/><path d="M-70,-10 q-6,10 0,18 M70,-10 q6,10 0,18" stroke="#7FB2D9" stroke-width="4" fill="none"/><text x="74" y="-50" font-size="22" fill="${INK2}">哈哈哈</text>`,
    窃笑: `<path d="M-40,-24 q14,6 28,0 M14,-24 q14,6 28,0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="-18" cy="-26" r="5" fill="${INK}" transform="translate(10,0)"/><circle cx="30" cy="-26" r="5" fill="${INK}" transform="translate(10,0)"/><path d="M-50,26 q50,-30 100,0 q-50,30 -100,0 z" fill="#F0D2B4" stroke="${INK}" stroke-width="3"/><path d="M-40,26 h80 M-30,16 v20 M-10,12 v26 M10,12 v26 M30,16 v20" stroke="${INK}" stroke-width="2" opacity=".6"/>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-160 -110 320 220" width="100%" height="100%"><rect x="-160" y="-110" width="320" height="220" fill="${PAPER}"/><circle cx="0" cy="0" r="88" fill="#F6DEC4" stroke="${INK}" stroke-width="4"/>${m[k] ?? ''}<text x="-150" y="-80" font-size="30" fill="${INK}" style="font-family:KaiTi, STKaiti, serif" font-weight="700">${k}</text></svg>`;
};
const walkArt = (k: string) => {
  const body = (o: { lean: number; leg: number; arm: number; y?: number; cane?: boolean; old?: boolean; tip?: boolean }) => {
    const y = o.y ?? 0, c = o.old ? '#6B6258' : INK;
    return `<g transform="translate(0,${y}) rotate(${o.lean} 0 60)"><circle cx="0" cy="-78" r="16" fill="${c}"/>${o.old ? `<path d="M-14,-90 q14,-12 28,0" stroke="#ddd" stroke-width="5" fill="none"/>` : ''}<path d="M0,-60 L0,10" stroke="${c}" stroke-width="12" stroke-linecap="round"/>
<path d="M0,-48 L${-o.arm},-10 M0,-48 L${o.arm},-12" stroke="${c}" stroke-width="8" stroke-linecap="round"/><path d="M0,10 L${-o.leg},${o.tip ? 52 : 60} M0,10 L${o.leg},60" stroke="${c}" stroke-width="9" stroke-linecap="round"/>${o.cane ? `<path d="M${o.arm},-12 L${o.arm + 8},62" stroke="#7A5A36" stroke-width="5"/>` : ''}</g>`;
  };
  const m: Record<string, string> = {
    蹒跚: body({ lean: 12, leg: 10, arm: 26, cane: true, old: true }) + `<path d="M-60,-40 q-10,10 0,20 M60,-30 q10,10 0,20" stroke="${INK2}" stroke-width="3" fill="none"/><text x="-110" y="100" font-size="20" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">一摇一摆，慢</text>`,
    轻盈: body({ lean: -4, leg: 22, arm: 34, tip: true, y: -10 }) + `<circle cx="-50" cy="64" r="3" fill="${GOLD}"/><circle cx="50" cy="60" r="3" fill="${GOLD}"/><path d="M-40,-90 l6,6 M40,-96 l-4,8" stroke="${GOLD}" stroke-width="3"/><text x="-110" y="100" font-size="20" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">轻快，脚尖点地</text>`,
    匆匆: body({ lean: 18, leg: 34, arm: 36 }) + `<path d="M-90,-50 h-40 M-90,-20 h-56 M-90,10 h-40" stroke="${INK2}" stroke-width="4" stroke-linecap="round"/><text x="-110" y="100" font-size="20" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">急急忙忙</text>`,
    稳健: body({ lean: 0, leg: 24, arm: 20 }) + `<path d="M-40,70 h-30 M40,70 h30" stroke="${INK2}" stroke-width="4"/><text x="-110" y="100" font-size="20" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">又稳又有力</text>`,
    矫健: body({ lean: 14, leg: 40, arm: 44, y: -6 }) + `<path d="M-90,-40 h-30 M-96,-10 h-40" stroke="${INK2}" stroke-width="4" stroke-linecap="round"/><text x="-110" y="100" font-size="20" fill="${INK2}" style="font-family:KaiTi, STKaiti, serif">强壮、灵活</text>`,
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-160 -120 320 240" width="100%" height="100%"><rect x="-160" y="-120" width="320" height="240" fill="${PAPER}"/><line x1="-160" y1="72" x2="160" y2="72" stroke="${INK}" stroke-opacity=".3" stroke-width="3"/>${m[k] ?? ''}<text x="-150" y="-90" font-size="30" fill="${INK}" style="font-family:KaiTi, STKaiti, serif" font-weight="700">${k}</text></svg>`;
};
const scapeArt = (k: string) => svg(800, 500, (id) => {
  if (k === '壮丽') return `<rect width="800" height="500" fill="#F4D9B0" opacity=".55"/>` + sun(640, 160, 40, '#E07B39', id) + ridge(id, { y: 200, amp: 170, seed: 7, tone: 0.55, peaks: 4, color: '#2F3B45' })
    + `<path d="M0,300 Q100,270 200,300 Q300,330 400,290 Q500,260 600,300 Q700,330 800,290 L800,380 L0,380 Z" fill="#fff" opacity=".9" filter="url(#${id}s)"/>`
    + ridge(id, { y: 330, amp: 140, seed: 8, tone: 0.75, peaks: 5, color: '#1E2830' }) + `<path d="M0,420 Q200,390 400,430 Q600,460 800,420 L800,500 L0,500 Z" fill="#fff" opacity=".85" filter="url(#${id}s)"/>` + pine(3, 120, 470, 1.1) + seal(30, 30, '壮丽', 1.3);
  if (k === '秀丽') return ridge(id, { y: 200, amp: 60, seed: 9, tone: 0.2, color: '#3E5A3A' }) + mist(id, 220, 40) + house(200, 300, 1.1) + house(310, 296, 0.9) + house(600, 300, 1)
    + `<path d="M380,330 Q450,270 520,330" stroke="#8E8576" stroke-width="10" fill="none"/><path d="M380,330 Q450,290 520,330" stroke="#8E8576" stroke-width="4" fill="none"/>` + water(3, 330, 480, 800, 30, 0.3) + willow(5, 700, 330, 0.9) + boat(250, 420, 0.9) + seal(30, 30, '秀丽', 1.3);
  if (k === '绚丽') return `<linearGradient id="${id}sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B4B9A"/><stop offset=".45" stop-color="#E26D6D"/><stop offset=".7" stop-color="#F2A65A"/><stop offset="1" stop-color="#F7D774"/></linearGradient><rect width="800" height="500" fill="url(#${id}sk)"/>`
    + [[160, 120, '#FFD166'], [380, 90, '#EF476F'], [600, 140, '#06D6A0'], [270, 200, '#7BDFF2']].map(([x, y, c]) => Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * 6.28; return `<line x1="${x}" y1="${y}" x2="${(x as number) + Math.cos(a) * 60}" y2="${(y as number) + Math.sin(a) * 60}" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".9"/>`; }).join('')).join('')
    + `<path d="M0,420 L80,380 L140,400 L220,360 L320,410 L420,370 L540,400 L640,360 L800,400 L800,500 L0,500 Z" fill="#1E1A2E"/>` + seal(30, 30, '绚丽', 1.3);
  return `<rect width="800" height="500" fill="#F7EEDF"/>` + [[200, 250], [400, 220], [600, 260], [300, 360], [520, 380]].map(([x, y], j) => Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * 6.28; return `<ellipse cx="${x + Math.cos(a) * 34}" cy="${y + Math.sin(a) * 34}" rx="34" ry="22" fill="${['#E63946', '#FF4D8D', '#F77F00', '#E63946', '#D62F7F'][j]}" transform="rotate(${(a * 180) / Math.PI} ${x + Math.cos(a) * 34} ${y + Math.sin(a) * 34})"/>`; }).join('') + `<circle cx="${x}" cy="${y}" r="16" fill="#FFD166"/>`).join('') + seal(30, 30, '艳丽', 1.3);
});

// ---------------- 英语：Ben 的扁平插画 ----------------
const BG: Record<string, [string, string]> = { hall: ['#E0E7FF', '🏆'], class: ['#DCEBFF', '🏫'], cafe: ['#FCE8D5', '☕'], park: ['#DDF3E4', '🌳'], home: ['#F3E8FF', '🏠'], phone: ['#E0F2FE', '📱'], cinema: ['#2B2D42', '🎬'], shop: ['#FFF4D6', '📚'], canteen: ['#FFE8E0', '🍜'] };
const benArt = (place: string, mood: string) => {
  const [bg, icon] = BG[place] ?? BG.class;
  const mouth = mood === 'happy' ? `<path d="M-16,22 q16,16 32,0" stroke="#3B2A20" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : mood === 'sad' ? `<path d="M-14,30 q14,-12 28,0" stroke="#3B2A20" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : mood === 'worried' ? `<path d="M-14,28 q7,-6 14,0 q7,6 14,0" stroke="#3B2A20" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : mood === 'sleepy' ? `<ellipse cx="0" cy="28" rx="8" ry="6" fill="#3B2A20"/>`
    : mood === 'cold' ? `<path d="M-14,26 h28" stroke="#3B2A20" stroke-width="4" stroke-dasharray="4 3"/>`
    : `<path d="M-12,28 h24" stroke="#3B2A20" stroke-width="4" stroke-linecap="round"/>`;
  const eyes = mood === 'sleepy' ? `<path d="M-26,-2 h16 M10,-2 h16" stroke="#3B2A20" stroke-width="4" stroke-linecap="round"/>` : `<circle cx="-18" cy="-2" r="5" fill="#3B2A20"/><circle cx="18" cy="-2" r="5" fill="#3B2A20"/>`;
  const brow = mood === 'worried' || mood === 'sad' ? `<path d="M-28,-18 l14,-6 M28,-18 l-14,-6" stroke="#B7791F" stroke-width="4" stroke-linecap="round"/>` : mood === 'confused' ? `<path d="M-28,-20 l14,0 M14,-26 l14,4" stroke="#B7791F" stroke-width="4" stroke-linecap="round"/>` : `<path d="M-28,-18 q7,-6 14,0 M14,-18 q7,-6 14,0" stroke="#B7791F" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const extra = mood === 'confused' ? `<text x="54" y="-50" font-size="40" fill="#2563EB" font-weight="900">?</text>` : mood === 'sleepy' ? `<text x="54" y="-50" font-size="26" fill="#6B7280" font-weight="900">z z</text>` : mood === 'cold' ? `<text x="54" y="-50" font-size="30">❄️</text>` : mood === 'worried' ? `<path d="M56,-30 q6,12 0,18" stroke="#7FB2D9" stroke-width="4" fill="none"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-200 -130 400 260" width="100%" height="100%"><rect x="-200" y="-130" width="400" height="260" fill="${place === 'cinema' ? '#3D405B' : bg}"/>
<text x="120" y="-70" font-size="64" opacity=".85">${icon}</text>
<path d="M-70,130 q0,-70 70,-70 q70,0 70,70 z" fill="#2563EB"/><path d="M-20,60 l20,22 l20,-22" fill="#fff"/>
<circle cx="0" cy="0" r="56" fill="#F8D7B9"/><path d="M-58,-12 q-2,-58 58,-60 q60,2 58,60 q-12,-30 -40,-38 q-30,16 -76,38 z" fill="#E8B04B"/>
${brow}${eyes}<circle cx="-30" cy="14" r="7" fill="#F2A3A0" opacity=".6"/><circle cx="30" cy="14" r="7" fill="#F2A3A0" opacity=".6"/>${mouth}${extra}
<text x="-185" y="115" font-size="22" fill="${place === 'cinema' ? '#fff' : '#1F2937'}" font-weight="800" style="font-family:system-ui, sans-serif">Ben</text></svg>`;
};

// ---------------- 英语故事的场景（扁平插画） ----------------
const enScene = (k: string) => {
  const W = 800, H = 500;
  if (k === 'hall') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="800" height="500" fill="#2B2D52"/><path d="M0,0 h800 v60 h-800z" fill="#8B1E2D"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 80},60 q40,30 80,0" fill="#A12838"/>`).join('')}<rect x="0" y="60" width="90" height="300" fill="#8B1E2D"/><rect x="710" y="60" width="90" height="300" fill="#8B1E2D"/><rect x="0" y="360" width="800" height="140" fill="#6B4A2E"/><rect x="0" y="352" width="800" height="12" fill="#4A321F"/><ellipse cx="400" cy="250" rx="230" ry="140" fill="#FFF1C1" opacity=".18"/><rect x="300" y="270" width="200" height="90" rx="6" fill="#F3F0E8"/><rect x="300" y="262" width="200" height="14" rx="4" fill="#D8D2C4"/><ellipse cx="400" cy="262" rx="44" ry="8" fill="none" stroke="#B8A47A" stroke-width="3" stroke-dasharray="6 5"/><text x="400" y="240" font-size="40" text-anchor="middle">❓</text><text x="400" y="110" font-size="30" font-weight="800" text-anchor="middle" fill="#FFE7A0" font-family="system-ui, sans-serif">ENGLISH FESTIVAL</text><text x="400" y="146" font-size="20" text-anchor="middle" fill="#F3F0E8" font-family="system-ui, sans-serif">Best Story Award · The Golden Panda</text>${Array.from({ length: 14 }, (_, i) => `<circle cx="${40 + i * 56}" cy="470" r="18" fill="#1E1F3A"/><rect x="${22 + i * 56}" y="482" width="36" height="30" rx="8" fill="#1E1F3A"/>`).join('')}</svg>`;
  if (k === 'guard') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="800" height="500" fill="#DDE6EE"/><rect x="0" y="330" width="800" height="170" fill="#B9C4CF"/><rect x="520" y="60" width="220" height="270" fill="#9FB0C0"/><rect x="540" y="80" width="180" height="230" fill="#E8F0F7"/><line x1="630" y1="80" x2="630" y2="310" stroke="#9FB0C0" stroke-width="6"/><rect x="120" y="250" width="360" height="40" rx="6" fill="#6B4A2E"/><rect x="140" y="290" width="20" height="120" fill="#4A321F"/><rect x="440" y="290" width="20" height="120" fill="#4A321F"/><circle cx="300" cy="150" r="46" fill="#F2C9A0"/><path d="M252,140 q48,-62 96,0 v-16 q-48,-46 -96,0z" fill="#1F2A44"/><rect x="246" y="118" width="108" height="16" rx="6" fill="#1F2A44"/><rect x="236" y="196" width="128" height="60" rx="20" fill="#2F4A6B"/><circle cx="284" cy="150" r="4" fill="#2B2722"/><circle cx="316" cy="150" r="4" fill="#2B2722"/><path d="M288,172 q12,6 24,0" stroke="#2B2722" stroke-width="3" fill="none"/><rect x="330" y="214" width="46" height="74" rx="8" fill="#111827" transform="rotate(-14 353 250)"/><rect x="335" y="221" width="36" height="58" rx="4" fill="#22C55E" transform="rotate(-14 353 250)"/><text x="350" y="258" font-size="18" text-anchor="middle" transform="rotate(-14 353 250)">⚽</text><text x="120" y="80" font-size="26" font-weight="800" fill="#2F4A6B" font-family="system-ui, sans-serif">SECURITY</text></svg>`;
  if (k === 'note') return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"><rect width="800" height="500" fill="#8A6A4A"/>${Array.from({ length: 8 }, (_, i) => `<path d="M0,${i * 64 + 20} q400,${(i % 2) * 18 - 9} 800,0" stroke="#7A5C3E" stroke-width="3" fill="none"/>`).join('')}<g transform="rotate(-6 400 250)"><rect x="240" y="120" width="320" height="270" fill="#FFE66D"/><rect x="240" y="120" width="320" height="34" fill="#F5D84E"/><text x="268" y="220" font-size="38" fill="#1F2937" font-family="'Comic Sans MS', 'Marker Felt', cursive">Lent the panda.</text><text x="268" y="282" font-size="38" fill="#1F2937" font-family="'Comic Sans MS', 'Marker Felt', cursive">Back at 3.</text><text x="430" y="350" font-size="40" fill="#1F2937" font-family="'Comic Sans MS', 'Marker Felt', cursive">— M</text></g></svg>`;
  return '';
};

// ---------------- 统一入口 ----------------
export const renderArt = (spec: string | { k: string; p?: Record<string, unknown> }): string => {
  const k = typeof spec === 'string' ? spec : spec.k, p = (typeof spec === 'string' ? {} : spec.p ?? {}) as Record<string, string>;
  uid = hash(JSON.stringify(spec)) % 100000;
  if (k === 'ink') { const s = SCENES[p.k]; return s ? svg(800, 500, s) : ''; }
  if (k === 'idiom') { const s = IDIOMS[p.k]; return s ? svg(800, 600, s) : ''; }
  if (k === 'eyes') return eyesArt(p.k);
  if (k === 'face') return faceArt(p.k);
  if (k === 'walk') return walkArt(p.k);
  if (k === 'scape') return scapeArt(p.k);
  if (k === 'ben') return benArt(p.place ?? 'class', p.mood ?? 'happy');
  if (k === 'en') return enScene(p.k);
  return '';
};
export const ART_KEYS = { ink: Object.keys(SCENES), idiom: Object.keys(IDIOMS) };
