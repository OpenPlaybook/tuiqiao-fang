// 分镜动画的底子：世界坐标 1600×900（16:9），每一镜画在这块“世界”里，镜头用 viewBox 取景（远景取得大、特写取得小）。
// 画分两层：静的（天、山、城墙、纸纹，一镜只画一次）和动的（人、水、雾、火、旗，每一帧按时间重画）。
// 时间：u 是这一镜的进度（0—1，剧情动作跟着它走）；g 是一直在走的秒数（水流、火苗、柳条这些环境一直动）。
export const WW = 1600, WH = 900;
export const INK = '#2B2722', INK2 = '#5B544B', PAPER = '#F1E8D6', RED = '#A8322A', GOLD = '#D9A441', SKIN = '#EAD9BF';
export const f = (n: number) => Math.round(n * 10) / 10;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
/** u 落在 [a, b] 里的进度（0—1，缓入缓出） */
export const seg = (u: number, a: number, b: number) => ease(clamp((u - a) / (b - a)));
export const rng = (seed: number) => { let a = seed | 0 || 1; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
export const wav = (g: number, period: number, ph = 0) => Math.sin(((g / period) + ph) * Math.PI * 2);

// ---------------- 滤镜和渐变（每一镜一份，id 带前缀） ----------------
export const defs = (id: string) => `<defs>
  <filter id="${id}p" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 0.17  0 0 0 0 0.15  0 0 0 0 0.13  0 0 0 .07 0"/></filter>
  <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter>
  <filter id="${id}s" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="${id}w" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence baseFrequency=".035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="9"/></filter>
  <radialGradient id="${id}v" cx="50%" cy="50%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#2B2722" stop-opacity=".35"/></radialGradient>
  <radialGradient id="${id}m" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#F7F1E4" stop-opacity=".9"/><stop offset="1" stop-color="#F7F1E4" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}fg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFD27A" stop-opacity=".75"/><stop offset="1" stop-color="#FFB547" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}gold" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF1B8"/><stop offset=".5" stop-color="#E7B647"/><stop offset="1" stop-color="#9C6A1C"/></radialGradient>
  <linearGradient id="${id}skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1E2CB"/><stop offset="1" stop-color="#D9C3A2"/></linearGradient>
</defs>`;
/** 天：上下两色的渐变 */
export const sky = (id: string, top: string, bottom: string, k = 'sky') => `<defs><linearGradient id="${id}${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect x="-200" y="-200" width="${WW + 400}" height="${WH + 400}" fill="url(#${id}${k})"/>`;
/** 纸纹 + 四角压暗：盖在最上面 */
export const finish = (id: string) => `<rect x="-200" y="-200" width="${WW + 400}" height="${WH + 400}" fill="#000" filter="url(#${id}p)" pointer-events="none"/><rect x="-200" y="-200" width="${WW + 400}" height="${WH + 400}" fill="url(#${id}v)" pointer-events="none"/>`;

// ---------------- 山、地、水 ----------------
export const ridge = (o: { y: number; amp: number; seed: number; color?: string; a?: number; peaks?: number; x0?: number; x1?: number; id?: string; soft?: boolean }) => {
  const r = rng(o.seed), x0 = o.x0 ?? -200, x1 = o.x1 ?? WW + 200, n = 40, pk = o.peaks ?? 3;
  const ph = r() * 6, ph2 = r() * 6;
  let d = `M${x0},${WH + 200} L${x0},${o.y}`;
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n, t = i / n;
    const y = o.y - o.amp * (0.55 * Math.abs(Math.sin(t * Math.PI * pk + ph)) + 0.3 * Math.sin(t * Math.PI * pk * 2.3 + ph2) + 0.15 * r());
    d += ` L${f(x)},${f(y)}`;
  }
  d += ` L${x1},${WH + 200} Z`;
  return `<path d="${d}" fill="${o.color ?? INK}" opacity="${o.a ?? 0.25}" ${o.soft && o.id ? `filter="url(#${o.id}s)"` : ''}/>`;
};
/** 流动的水：一道道短横纹往一边漂 */
export const river = (seed: number, g: number, o: { y0: number; y1: number; x0?: number; x1?: number; speed?: number; n?: number; a?: number; c?: string }) => {
  const r = rng(seed), x0 = o.x0 ?? -100, x1 = o.x1 ?? WW + 100, span = x1 - x0, sp = o.speed ?? 30;
  let s = '';
  for (let i = 0; i < (o.n ?? 60); i++) {
    const y = o.y0 + r() * (o.y1 - o.y0), k = (y - o.y0) / Math.max(1, o.y1 - o.y0), l = 20 + 50 * k * r() + 14;
    const x = x0 + ((r() * span + g * sp * (0.6 + 0.8 * k)) % span);
    s += `<path d="M${f(x)},${f(y)} q${f(l / 2)},${f(-3 - 3 * k)} ${f(l)},0" stroke="${o.c ?? INK}" stroke-opacity="${f((o.a ?? 0.32) * (0.4 + 0.6 * k))}" stroke-width="${f(1 + 1.6 * k)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
};
/** 一团团飘着的雾（不用滤镜，用径向渐变，动起来不卡） */
export const mist = (id: string, seed: number, g: number, o: { y: number; h?: number; n?: number; speed?: number; a?: number }) => {
  const r = rng(seed); let s = '';
  for (let i = 0; i < (o.n ?? 7); i++) {
    const w = 260 + r() * 360, h = (o.h ?? 60) * (0.6 + r() * 0.8), x = -300 + ((r() * (WW + 600) + g * (o.speed ?? 8) * (0.5 + r())) % (WW + 600));
    s += `<ellipse cx="${f(x)}" cy="${f(o.y + (r() - 0.5) * (o.h ?? 60))}" rx="${f(w / 2)}" ry="${f(h / 2)}" fill="url(#${id}m)" opacity="${f(o.a ?? 0.8)}"/>`;
  }
  return s;
};
/** 柳树：树干静，柳条随风摆 */
export const willow = (seed: number, g: number, x: number, y: number, s = 1, a = 0.75) => {
  const r = rng(seed);
  let o = `<path d="M${x},${y} q${-10 * s},${-90 * s} ${8 * s},${-190 * s} q${10 * s},${-30 * s} ${-6 * s},${-60 * s}" stroke="${INK}" stroke-width="${12 * s}" fill="none" stroke-linecap="round" opacity="${a}"/>`;
  for (let i = 0; i < 26; i++) {
    const bx = x + (r() - 0.5) * 170 * s, by = y - 180 * s - r() * 90 * s, l = (120 + r() * 160) * s, sw = wav(g, 3.2 + r() * 1.5, r()) * 14 * s;
    o += `<path d="M${f(x + (bx - x) * 0.3)},${f(by - 20 * s)} Q${f(bx)},${f(by)} ${f(bx + sw * 0.5)},${f(by + l * 0.5)} T${f(bx + sw)},${f(by + l)}" stroke="#4E5D3E" stroke-width="${f(1.6 * s)}" fill="none" opacity="${f(a * (0.5 + r() * 0.5))}"/>`;
  }
  return o;
};
/** 芦苇 / 草：随风摆 */
export const reeds = (seed: number, g: number, x0: number, x1: number, y: number, n = 40, h = 120, c = INK, a = 0.55) => {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), hh = h * (0.5 + r() * 0.7), sw = wav(g, 2.6 + r(), r()) * hh * 0.08 + hh * 0.12;
    s += `<path d="M${f(x)},${y} q${f(sw * 0.3)},${f(-hh * 0.5)} ${f(sw)},${f(-hh)}" stroke="${c}" stroke-width="${f(1.4 + r() * 1.4)}" fill="none" opacity="${f(a * (0.6 + r() * 0.4))}" stroke-linecap="round"/>`;
    if (r() < 0.35) s += `<ellipse cx="${f(x + sw)}" cy="${f(y - hh - 8)}" rx="3" ry="11" transform="rotate(${f(sw * 0.8)} ${f(x + sw)} ${f(y - hh - 8)})" fill="#8C7A5A" opacity="${f(a)}"/>`;
  }
  return s;
};
export const bareTree = (seed: number, x: number, y: number, s = 1, a = 0.8, g = 0) => {
  const r = rng(seed);
  const br = (x0: number, y0: number, ang: number, len: number, w: number, d: number): string => {
    if (d > 4 || len < 8) return '';
    const sw = d > 2 ? wav(g, 4, r()) * 1.5 * d : 0;
    const x1 = x0 + Math.sin(ang) * len + sw, y1 = y0 - Math.cos(ang) * len;
    return `<path d="M${f(x0)},${f(y0)} L${f(x1)},${f(y1)}" stroke="${INK}" stroke-width="${f(w)}" stroke-linecap="round" opacity="${a}"/>` + br(x1, y1, ang - 0.45 - r() * 0.3, len * 0.72, w * 0.62, d + 1) + br(x1, y1, ang + 0.4 + r() * 0.3, len * 0.68, w * 0.6, d + 1);
  };
  return br(x, y, (r() - 0.5) * 0.2, 90 * s, 11 * s, 0);
};
/** 雪花 / 雨 */
export const snow = (seed: number, g: number, n = 80, a = 0.8, fall = 40) => {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = (r() * (WW + 200) - 100 + wav(g, 5 + r() * 4, r()) * 20), y = ((r() * WH + g * fall * (0.6 + r() * 0.8)) % (WH + 40)) - 20;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.2 + r() * 2.6)}" fill="#fff" opacity="${f(a * (0.5 + r() * 0.5))}"/>`;
  }
  return s;
};
export const rain = (seed: number, g: number, n = 120, a = 0.3) => {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const l = 24 + r() * 30, x = r() * (WW + 300) - 150, y = ((r() * WH + g * 600 * (0.8 + r() * 0.4)) % (WH + 60)) - 60;
    s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - l * 0.25)}" y2="${f(y + l)}" stroke="#4A5058" stroke-opacity="${f(a * (0.5 + r() * 0.5))}" stroke-width="1.4"/>`;
  }
  return s;
};

// ---------------- 光、火 ----------------
export const moon = (id: string, x: number, y: number, r = 40, a = 1) => `<circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="#FFF6DD" opacity="${f(0.35 * a)}" filter="url(#${id}b)"/><circle cx="${x}" cy="${y}" r="${r}" fill="#FBF3DA" opacity="${a}"/>`;
export const sunDisc = (id: string, x: number, y: number, r = 50, c = '#C8452F', a = 1) => `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="${c}" opacity="${f(0.22 * a)}" filter="url(#${id}b)"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${f(0.85 * a)}"/>`;
/** 火苗：一直在跳 */
export const flame = (x: number, y: number, s = 1, g = 0, ph = 0) => {
  const k = 1 + wav(g, 0.37, ph) * 0.12 + wav(g, 0.23, ph + 0.3) * 0.08, sw = wav(g, 0.5, ph) * 3 * s;
  return `<path d="M${f(x - 7 * s)},${y} Q${f(x - 9 * s)},${f(y - 14 * s * k)} ${f(x + sw)},${f(y - 26 * s * k)} Q${f(x + 9 * s)},${f(y - 14 * s * k)} ${f(x + 7 * s)},${y} Z" fill="#D9682B"/><path d="M${f(x - 3.5 * s)},${y} Q${f(x - 4 * s)},${f(y - 8 * s * k)} ${f(x + sw * 0.6)},${f(y - 15 * s * k)} Q${f(x + 4 * s)},${f(y - 8 * s * k)} ${f(x + 3.5 * s)},${y} Z" fill="#F4C25A"/>`;
};
export const glow = (id: string, x: number, y: number, r: number, g = 0, ph = 0, a = 1) => `<circle cx="${x}" cy="${y}" r="${f(r * (1 + wav(g, 0.6, ph) * 0.05))}" fill="url(#${id}fg)" opacity="${f(a)}"/>`;
/** 火把（远处的一点火） */
export const torch = (id: string, x: number, y: number, s = 1, g = 0, ph = 0, a = 1) => `<g opacity="${f(a)}"><line x1="${x}" y1="${y}" x2="${x}" y2="${f(y + 22 * s)}" stroke="${INK}" stroke-width="${f(2 * s)}"/>${glow(id, x, y - 4 * s, 22 * s, g, ph, 0.8)}${flame(x, y, 0.5 * s, g, ph)}</g>`;
export const campfire = (id: string, x: number, y: number, s = 1, g = 0, k = 1) => `${glow(id, x, y - 10 * s, 120 * s * k, g)}<path d="M${x - 26 * s},${y} l${52 * s},${-8 * s} M${x - 24 * s},${y - 8 * s} l${48 * s},${8 * s}" stroke="#4A3524" stroke-width="${6 * s}" stroke-linecap="round"/>${flame(x - 6 * s, y - 4 * s, 1.4 * s * k, g)}${flame(x + 8 * s, y - 4 * s, 1.1 * s * k, g, 0.4)}`;
/** 旗：旗面在风里飘 */
export const banner = (x: number, y: number, s = 1, g = 0, c = RED, ch = '', ph = 0, a = 0.92) => {
  const w1 = wav(g, 1.4, ph) * 6 * s, w2 = wav(g, 1.4, ph + 0.35) * 8 * s;
  return `<g opacity="${a}"><line x1="${x}" y1="${y}" x2="${x}" y2="${f(y - 150 * s)}" stroke="${INK}" stroke-width="${f(3 * s)}"/><path d="M${x},${f(y - 150 * s)} Q${f(x + 25 * s)},${f(y - 150 * s + w1)} ${f(x + 55 * s)},${f(y - 146 * s + w2)} L${f(x + 55 * s)},${f(y - 104 * s + w2)} Q${f(x + 25 * s)},${f(y - 108 * s + w1)} ${x},${f(y - 108 * s)} Z" fill="${c}"/>${ch ? `<text x="${f(x + 26 * s)}" y="${f(y - 118 * s + w1 * 0.6)}" font-size="${f(26 * s)}" text-anchor="middle" fill="#F6E7C8" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">${ch}</text>` : ''}</g>`;
};
/** 声波：从一点往外（或往里）扩的弧线 */
export const soundRings = (cx: number, cy: number, g: number, o: { dir: number; n?: number; r0?: number; r1?: number; a?: number; c?: string; spread?: number; period?: number }) => {
  let s = '';
  const n = o.n ?? 4, r0 = o.r0 ?? 20, r1 = o.r1 ?? 260, P = o.period ?? 2.4, sp = o.spread ?? 0.55;
  for (let i = 0; i < n; i++) {
    const k = ((g / P + i / n) % 1), r = lerp(r0, r1, k), a1 = o.dir - sp, a2 = o.dir + sp;
    s += `<path d="M${f(cx + Math.cos(a1) * r)},${f(cy + Math.sin(a1) * r)} A${f(r)},${f(r)} 0 0 1 ${f(cx + Math.cos(a2) * r)},${f(cy + Math.sin(a2) * r)}" stroke="${o.c ?? INK}" stroke-width="3" fill="none" opacity="${f((o.a ?? 0.5) * Math.sin(k * Math.PI))}" stroke-linecap="round"/>`;
  }
  return s;
};

// ---------------- 建筑、器物 ----------------
export const cityWall = (x: number, y: number, w = 600, s = 1, a = 0.75) => {
  const h = 90 * s; let o = `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#7C7266" opacity="${a}"/>`;
  for (let i = 0; i < w / (24 * s); i++) o += `<rect x="${f(x + i * 24 * s)}" y="${f(y - h - 12 * s)}" width="${f(14 * s)}" height="${f(12 * s)}" fill="#7C7266" opacity="${a}"/>`;
  const gx = x + w / 2;
  o += `<path d="M${f(gx - 34 * s)},${y} v${f(-50 * s)} q${f(34 * s)},${f(-30 * s)} ${f(68 * s)},0 v${f(50 * s)} z" fill="${INK}" opacity="${f(a * 0.8)}"/>`;
  o += `<path d="M${f(gx - 90 * s)},${f(y - h - 12 * s)} l${f(16 * s)},${f(-40 * s)} h${f(148 * s)} l${f(16 * s)},${f(40 * s)} z" fill="${INK}" opacity="${f(a * 0.9)}"/><rect x="${f(gx - 70 * s)}" y="${f(y - h - 52 * s)}" width="${f(140 * s)}" height="${f(14 * s)}" fill="#5B4E40" opacity="${a}"/><path d="M${f(gx - 104 * s)},${f(y - h - 52 * s)} q${f(104 * s)},${f(-34 * s)} ${f(208 * s)},0 l${f(-10 * s)},${f(8 * s)} q${f(-94 * s)},${f(-24 * s)} ${f(-188 * s)},0 z" fill="${INK}" opacity="${a}"/>`;
  return o;
};
export const house = (x: number, y: number, s = 1, a = 0.9, door = true) => {
  const W = 80 * s, H = 72 * s;
  let o = `<g opacity="${a}"><rect x="${f(x - W)}" y="${f(y - H)}" width="${f(2 * W)}" height="${f(H)}" fill="#E4D9C3" stroke="${INK}" stroke-opacity=".35"/>`;
  o += `<rect x="${f(x - W)}" y="${f(y - H)}" width="${f(8 * s)}" height="${f(H)}" fill="#6E5A40"/><rect x="${f(x + W - 8 * s)}" y="${f(y - H)}" width="${f(8 * s)}" height="${f(H)}" fill="#6E5A40"/>`;
  // 屋顶：两头翘起的瓦檐
  o += `<path d="M${f(x - W - 30 * s)},${f(y - H + 4 * s)} Q${f(x - W - 6 * s)},${f(y - H - 6 * s)} ${f(x - W + 8 * s)},${f(y - H - 44 * s)} L${f(x + W - 8 * s)},${f(y - H - 44 * s)} Q${f(x + W + 6 * s)},${f(y - H - 6 * s)} ${f(x + W + 30 * s)},${f(y - H + 4 * s)} Z" fill="#3E3934"/>`;
  for (let i = 1; i < 9; i++) { const tx = x - W + (2 * W * i) / 9; o += `<path d="M${f(tx)},${f(y - H - 42 * s)} L${f(tx + (tx - x) * 0.25)},${f(y - H - 2 * s)}" stroke="#5B544B" stroke-width="${f(2 * s)}"/>`; }
  o += `<rect x="${f(x - W + 6 * s)}" y="${f(y - H - 52 * s)}" width="${f(2 * W - 12 * s)}" height="${f(9 * s)}" fill="#2B2722"/>`;
  if (door) o += `<rect x="${f(x - 18 * s)}" y="${f(y - 50 * s)}" width="${f(36 * s)}" height="${f(50 * s)}" fill="#5A4630"/><line x1="${x}" y1="${f(y - 50 * s)}" x2="${x}" y2="${y}" stroke="${INK}" stroke-opacity=".5"/>`;
  o += `<rect x="${f(x - W + 18 * s)}" y="${f(y - 54 * s)}" width="${f(26 * s)}" height="${f(20 * s)}" fill="#3E3934" opacity=".6"/><rect x="${f(x + W - 44 * s)}" y="${f(y - 54 * s)}" width="${f(26 * s)}" height="${f(20 * s)}" fill="#3E3934" opacity=".6"/>`;
  return o + '</g>';
};
/** 竖排的字（场景题字） */
export const vtext = (x: number, y: number, text: string, size = 40, c = INK, a = 0.85) => [...text].map((ch, i) => `<text x="${x}" y="${f(y + i * size * 1.12)}" font-size="${size}" text-anchor="middle" fill="${c}" opacity="${a}" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">${ch}</text>`).join('');
export const seal = (x: number, y: number, text: string, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-26" y="0" width="52" height="${f(text.length * 26 + 10)}" rx="4" fill="${RED}" opacity=".9"/>${[...text].map((ch, i) => `<text x="0" y="${f(26 + i * 26)}" font-size="24" text-anchor="middle" fill="#F6E7C8" style="font-family:KaiTi, STKaiti, 'Kaiti SC', serif">${ch}</text>`).join('')}</g>`;
export const tent = (x: number, y: number, s = 1, c = '#5B5248', a = 0.9) => `<g opacity="${a}"><path d="M${f(x - 70 * s)},${y} L${x},${f(y - 80 * s)} L${f(x + 70 * s)},${y} Z" fill="${c}"/><path d="M${x},${f(y - 80 * s)} L${f(x - 14 * s)},${y} L${f(x + 14 * s)},${y} Z" fill="${INK}" opacity=".55"/><line x1="${x}" y1="${f(y - 80 * s)}" x2="${x}" y2="${f(y - 100 * s)}" stroke="${INK}" stroke-width="${f(2 * s)}"/></g>`;
