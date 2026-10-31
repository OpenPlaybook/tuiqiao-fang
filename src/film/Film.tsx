// 分镜动画的播放器：一句话里可以有好几个镜头（按权重分时长）；每一帧按“这一镜的进度 u”和“一直在走的时间 g”重画会动的那一层。
// 镜头切换时，上一镜淡出（0.3 秒）；静的那一层每一镜只画一次。
import { useEffect, useRef } from 'react';
import { WH, WW, clamp, defs, ease, finish, lerp } from './core';
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
/** 静态渲染一帧（联系表、截图用） */
export const frameSvg = (key: string, u: number, g = 3) => {
  const d = SHOTS[key]; if (!d) return '';
  const id = `s${++uidN}_`;
  return `<svg viewBox="${camAt(d, u)}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">${defs(id)}${d.bg(id)}${d.fg(u, g, id)}${finish(id)}</svg>`;
};

export function Film({ shots, prog, lid = '', className = '' }: { shots: ShotSpec[]; prog: () => number; lid?: string; className?: string }) {
  const cur = useRef<HTMLDivElement>(null), prev = useRef<HTMLDivElement>(null);
  const progRef = useRef(prog); progRef.current = prog;
  const shotsRef = useRef(shots); shotsRef.current = shots;
  const lidRef = useRef(lid); lidRef.current = lid;
  useEffect(() => {
    let raf = 0, last = 0, key = '', id = '', svgEl: SVGSVGElement | null = null, fgEl: SVGGElement | null = null, seenLid = '', hold = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 33) return; // 30 帧够了
      last = now;
      const sh = shotsRef.current; if (!sh.length) return;
      // 换了一句：如果这一句的第一镜和上一镜是同一个，就停在它的结尾，不要从头再推一遍
      if (lidRef.current !== seenLid) { hold = !!key && sh[0][0] === key; seenLid = lidRef.current; }
      const at = shotAt(sh, clamp(progRef.current())), i = at.i, u = hold && i === 0 ? 1 : at.u;
      const k = sh[i][0], d = SHOTS[k];
      if (!d || !cur.current) return;
      if (k !== key) {
        // 换镜头：旧画面拷到上面一层，淡出
        if (key && prev.current && cur.current.firstElementChild) {
          prev.current.innerHTML = cur.current.innerHTML;
          prev.current.style.transition = 'none'; prev.current.style.opacity = '1';
          requestAnimationFrame(() => { if (prev.current) { prev.current.style.transition = 'opacity .35s ease'; prev.current.style.opacity = '0'; } });
        }
        key = k; id = `f${++uidN}_`;
        cur.current.innerHTML = `<svg viewBox="${camAt(d, u)}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">${defs(id)}<g>${d.bg(id)}</g><g data-fg></g>${finish(id)}</svg>`;
        svgEl = cur.current.querySelector('svg'); fgEl = cur.current.querySelector('[data-fg]');
      }
      if (svgEl && fgEl) { svgEl.setAttribute('viewBox', camAt(d, u)); fgEl.innerHTML = d.fg(u, now / 1000, id); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className={`absolute inset-0 ${className}`}>
      <div ref={cur} className="absolute inset-0" />
      <div ref={prev} className="pointer-events-none absolute inset-0" style={{ opacity: 0 }} />
    </div>
  );
}
export const WORLD = { w: WW, h: WH };
