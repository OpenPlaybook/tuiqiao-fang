// 分镜动画的播放器：一句话里可以有好几个镜头（按权重分时长）；每一帧按“这一镜的进度 u”和“一直在走的时间 g”重画会动的那一层。
// 镜头切换时，上一镜淡出（0.3 秒）；静的那一层每一镜只画一次。
// 帧率跟着机器走（见 PACE）：画得动就 30 帧/秒，画不动就一档档往下降（最低 6 帧/秒），把时间留给点按钮、做题这些操作。
import { useEffect, useRef } from 'react';
import { WH, WW, clamp, defs, ease, finish, lerp, paperTile } from './core';
import { SHOTS } from './shots';

export type ShotSpec = [string, number?]; // [镜头名, 权重]
export interface ShotDef {
  bg: (id: string) => string; // 静的：天、山、建筑
  fg: (u: number, g: number, id: string) => string; // 动的：人、水、雾、火
  cam: [number, number, number][]; // 镜头：[中心 x, 中心 y, 取景宽]，起点 → 终点（缓入缓出）；一个就是不动
}
/** 一句话里第几镜、这一镜的进度 */
export const shotAt = (shots: ShotSpec[], p: number) => {
  const tot = shots.reduce((a, s) => a + (s[1] ?? 1), 0);
  let acc = 0;
  for (let i = 0; i < shots.length; i++) {
    const w = (shots[i][1] ?? 1) / tot;
    if (p < acc + w || i === shots.length - 1) return { i, u: clamp((p - acc) / w) };
    acc += w;
  }
  return { i: 0, u: 0 };
};
const camAt = (d: ShotDef, u: number) => {
  const c = d.cam, a = c[0], b = c[c.length - 1], t = ease(u);
  const w = lerp(a[2], b[2], t), cx = lerp(a[0], b[0], t), cy = lerp(a[1], b[1], t), h = (w * 9) / 16;
  return `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
};
let uidN = 0;
/** 静态渲染一帧（封面、联系表用；只画一次，纸纹还用滤镜） */
export const frameSvg = (key: string, u: number, g = 3) => {
  const d = SHOTS[key]; if (!d) return '';
  const id = `s${++uidN}_`;
  return `<svg viewBox="${camAt(d, u)}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">${defs(id)}${d.bg(id)}${d.fg(u, g, id)}${finish(id)}</svg>`;
};

// ---------------- 帧率：跟着机器走 ----------------
// 画一帧花多少时间，取两种量法里大的那个：
//   · 浏览器自己的活：从开始拼画面到浏览器排版、上色做完（画完马上发一条消息，消息到的时候这一帧的活就干完了）；
//   · 显卡的活：下一帧比平时（屏幕刷新一次）晚到了多少（Safari 的滤镜就卡在这里，浏览器本身并不忙）。
// 动画最多占 40% 的时间（帧间隔 ≥ 花的时间 × 2.5），剩下的留给点按钮、做题。花的时间取最近 5 帧的中位数（偶尔卡一下不算）：
// 画不动就马上降到够用的那一档；连续 1 秒都画得轻松（留两成余量），再升到够用的那一档。
// 刚升上去不到 4 秒又得降：说明正好卡在两档中间，下次多等一倍再升（最多 16 秒），免得来回跳。
// 各个画面共用一份（换句子、换镜头不用重新摸索）。控制台里看 window.__FILM_PACE__。
const LV = [33, 50, 67, 83, 100, 125, 167]; // 帧间隔（毫秒）：30、20、15、12、10、8、6 帧/秒
export const PACE = { iv: LV[0], cost: 0, vs: 16.7, n: 0, upAt: 0, upWait: 1000, lastUp: -1e9, adapt: true, log: [] as string[] };
(window as unknown as { __FILM_PACE__?: typeof PACE }).__FILM_PACE__ = PACE;
const recent: number[] = [];
const fit = (want: number) => LV.find((x) => x >= want) ?? LV[LV.length - 1];
const setIv = (iv: number, now: number) => {
  if (iv > PACE.iv && now - PACE.lastUp < 4000) PACE.upWait = Math.min(16000, PACE.upWait * 2);
  if (iv < PACE.iv) PACE.lastUp = now;
  PACE.iv = iv; PACE.n = 0; PACE.upAt = 0;
  PACE.log.push(`${(now / 1000).toFixed(1)}s ${Math.round(1000 / iv)}fps cost ${PACE.cost.toFixed(1)}`); if (PACE.log.length > 30) PACE.log.shift();
};
const learn = (c: number, now: number) => {
  recent.push(c); if (recent.length > 5) recent.shift();
  PACE.cost = [...recent].sort((a, b) => a - b)[recent.length >> 1]; PACE.n++;
  if (now - PACE.lastUp > 30000) PACE.upWait = 1000; // 稳了半分钟：恢复正常
  if (!PACE.adapt || PACE.n < 3) return; // 刚换过档：先看 3 帧
  const down = fit(PACE.cost * 2.5), up = fit((PACE.cost * 2.5) / 0.8);
  if (down > PACE.iv) setIv(down, now);
  else if (up < PACE.iv) {
    if (!PACE.upAt) PACE.upAt = now;
    else if (now - PACE.upAt > PACE.upWait) setIv(up, now);
  } else PACE.upAt = 0;
};
/** 测速、比较帧率用（#/filmtest?bench=…、?lab=…）：paper = css（纸纹是盖在上面的图片，默认）| svg（纸纹是 SVG 滤镜，原来的做法）| none */
export const FILM_OPT: { paper: 'css' | 'svg' | 'none'; blur: boolean; stats?: { draw: number[]; js: number[] } } = { paper: 'css', blur: true };

/** running：false 时整个画面定住（暂停、停在题上）——剧情进度和一直在动的环境（水、火、人的晃动）都停、不重画，继续时从停下的地方接着动
 *  fps：最高帧率（做题时剧情已经停在结尾，只有环境在动，可以低一些）；fixed：固定帧率，不跟着机器变（比较帧率用） */
export function Film({ shots, prog, lid = '', className = '', running = true, fps = 30, fixed = false }: { shots: ShotSpec[]; prog: () => number; lid?: string; className?: string; running?: boolean; fps?: number; fixed?: boolean }) {
  const cur = useRef<HTMLDivElement>(null), prev = useRef<HTMLDivElement>(null), paper = useRef<HTMLDivElement>(null);
  const progRef = useRef(prog); progRef.current = prog;
  const shotsRef = useRef(shots); shotsRef.current = shots;
  const lidRef = useRef(lid); lidRef.current = lid;
  const runRef = useRef(running); runRef.current = running;
  const fpsRef = useRef(fps); fpsRef.current = fps;
  useEffect(() => {
    if (FILM_OPT.paper !== 'css') return;
    let alive = true;
    paperTile().then((u) => { if (alive && paper.current) paper.current.style.backgroundImage = `url("${u}")`; });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    let fades = 0, raf = 0, last = 0, prevNow = 0, pend = 0, busy = 0, skip = 0, key = '', id = '', svgEl: SVGSVGElement | null = null, fgEl: SVGGElement | null = null, seenLid = '', hold = false, g = 0, lastU = -1;
    const mc = new MessageChannel(); // 画完发一条消息：消息到的时候，这一帧浏览器的活（排版、上色）已经干完
    mc.port1.onmessage = (e) => { busy = performance.now() - (e.data as number); };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // 量一量：上一帧画过的话，这一帧晚到了多少就是画它花的时间；没画的话，帧间隔就是屏幕刷新一次的时间
      const gap = now - prevNow; prevNow = now;
      if (gap > 0 && gap < 1000) {
        if (pend) learn(Math.max(gap - PACE.vs, busy), now);
        else PACE.vs = clamp(Math.min(gap, PACE.vs + 0.05), 4, 34);
      }
      pend = 0;
      const iv = fixed ? 1000 / fpsRef.current : Math.max(PACE.iv, 1000 / fpsRef.current);
      if (now - last < iv - 3) return;
      if (runRef.current && last) g += Math.min(0.3, (now - last) / 1000); // 暂停时这个“环境时钟”不走；切走再回来，不要一下跳很远
      last = now;
      const sh = shotsRef.current; if (!sh.length) return;
      // 换了一句：如果这一句的第一镜和上一镜是同一个，就停在它的结尾，不要从头再推一遍
      if (lidRef.current !== seenLid) { hold = !!key && sh[0][0] === key; seenLid = lidRef.current; }
      const at = shotAt(sh, clamp(progRef.current())), i = at.i, u = hold && i === 0 ? 1 : at.u;
      const k = sh[i][0], d = SHOTS[k];
      if (!d || !cur.current) return;
      const fresh = k !== key;
      if (fresh) {
        // 换镜头：旧画面拷到上面一层，淡出
        if (key && prev.current && cur.current.firstElementChild) {
          prev.current.innerHTML = cur.current.innerHTML;
          prev.current.style.transition = 'none'; prev.current.style.opacity = '1';
          requestAnimationFrame(() => { if (prev.current) { prev.current.style.transition = 'opacity .35s ease'; prev.current.style.opacity = '0'; } });
          // 淡出完就清掉旧画面，不留一整张看不见的画在那一层里
          const n = ++fades; setTimeout(() => { if (n === fades && prev.current) prev.current.innerHTML = ''; }, 500);
        }
        key = k; id = `f${++uidN}_`;
        cur.current.innerHTML = `<svg viewBox="${camAt(d, u)}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">${defs(id)}<g>${d.bg(id)}</g><g data-fg></g>${finish(id, FILM_OPT.paper === 'svg')}</svg>`;
        svgEl = cur.current.querySelector('svg'); fgEl = cur.current.querySelector('[data-fg]');
      }
      if (svgEl && fgEl && (runRef.current || u !== lastU || fresh)) { // 暂停着、画面没变，就不重画
        const t1 = performance.now(), html = d.fg(u, g, id);
        svgEl.setAttribute('viewBox', camAt(d, u)); fgEl.innerHTML = FILM_OPT.blur ? html : html.replace(/ filter="url\(#[^)]*\)"/g, ''); lastU = u;
        if (fresh) skip = 2; else if (skip) skip--; else { pend = now; busy = 0; mc.port2.postMessage(t1); } // 换镜头要画整个背景，这一帧和后面两帧不算
        if (FILM_OPT.stats) { FILM_OPT.stats.draw.push(now); FILM_OPT.stats.js.push(performance.now() - t1); }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); mc.port1.close(); };
  }, []);
  // 画面、淡出层、纸纹各自一层（will-change）：上面的字幕、按钮变了不用重画画面，画面变了也不用重画纸纹
  return (
    <div className={`absolute inset-0 ${className}`}>
      <div ref={cur} className="absolute inset-0" style={{ willChange: 'transform' }} />
      <div ref={prev} className="pointer-events-none absolute inset-0" style={{ opacity: 0, willChange: 'opacity' }} />
      {FILM_OPT.paper === 'css' && <div ref={paper} className="pointer-events-none absolute inset-0" style={{ backgroundSize: '256px 256px', willChange: 'transform' }} />}
    </div>
  );
}
export const WORLD = { w: WW, h: WH };
