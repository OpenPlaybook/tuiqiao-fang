// 分镜联系表（自己检查画面用）：#/filmtest?k=a. 列出所有镜头，每镜看开头、中间、结尾三帧；点一镜放大循环播放
import { PLAY_ITEMS } from '../shared/play';
import { Viz } from '../components/viz';
import { PlayStep, SaveCtx } from '../items/steps2';
import { ITEM_BY_ID } from '../shared/bank';
import { useEffect, useRef, useState } from 'react';
import { SHOTS } from './shots';
import { FILM_OPT, Film, PACE, frameSvg } from './Film';

export default function FilmTest() {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  return q.get('check') !== null ? <ShotCheck /> : q.get('bench') ? <FilmBench /> : q.get('lab') ? <FpsLab /> : q.get('ext') ? <ExtTest /> : q.get('step') ? <StepTest /> : <FilmSheet />;
}

// ---------------- 查画面里的字：#/filmtest?check（可加 =前缀）----------------
// 每个镜头画开头、1/4、中间、3/4、结尾五帧，量出每个字和人物、马、特写脸（rig.ts 里带 data-p 的组）的位置，列出：
//   盖人：字画在人物上面、压住了人（人在字前面挡住招牌这种不算）；叠字：两列字互相压；切字：字只露出一部分（整个在画面外不算）。
// 背景旗子上的“楚”“汉”、墙上的招牌在镜头移动时被边缘带过，是正常取景；要看的是标题、诗句、时间、人名这类该完整出现的字。
function ShotCheck() {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const pre = q.get('check') ?? '';
  const [rows, setRows] = useState<{ k: string; u: number; on: string; over: string; cut: string }[] | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const out: { k: string; u: number; on: string; over: string; cut: string }[] = [];
      const op = (el: Element, root: Element) => { let o = 1; for (let e: Element | null = el; e && e !== root.parentElement; e = e.parentElement) { const a = e.getAttribute('opacity'); if (a !== null) o *= +a; } return o; };
      const inter = (a: DOMRect, b: DOMRect) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const keys = Object.keys(SHOTS).filter((k) => k.startsWith(pre));
      for (const [n, k] of keys.entries()) {
        for (const u of [0, 0.25, 0.5, 0.75, 1]) {
          if (!alive || !box.current) return;
          box.current.innerHTML = frameSvg(k, u, 3);
          const svg = box.current.querySelector('svg'); if (!svg) continue;
          const R = svg.getBoundingClientRect();
          const chars = [...svg.querySelectorAll('text')].map((t) => ({ t, r: t.getBoundingClientRect(), o: op(t, svg), s: t.textContent ?? '' })).filter((c) => c.o > 0.2 && c.s.trim() && c.r.width > 0);
          const figs = [...svg.querySelectorAll('[data-p]')].map((p) => ({ el: p, r: p.getBoundingClientRect(), o: op(p, svg) })).filter((x) => x.o > 0.3);
          const on: string[] = [], over: string[] = [], cut: string[] = [];
          chars.forEach((c, i) => {
            const A = c.r.width * c.r.height;
            if (figs.some((x) => inter(c.r, x.r) / A > 0.35 && x.el.compareDocumentPosition(c.t) & Node.DOCUMENT_POSITION_FOLLOWING && !x.el.contains(c.t))) on.push(c.s);
            if (chars.some((d, j) => j !== i && Math.abs(d.r.left - c.r.left) > 2 && inter(c.r, d.r) / A > 0.25)) over.push(c.s);
            const vis = inter(c.r, R) / A; if (vis > 0.05 && vis < 0.9) cut.push(c.s);
          });
          if (on.length || over.length || cut.length) out.push({ k, u, on: on.join(''), over: over.join(''), cut: cut.join('') });
        }
        if (n % 20 === 0) await new Promise((r) => setTimeout(r, 0));
      }
      if (alive) setRows(out);
    })();
    return () => { alive = false; };
  }, []);
  return (
    <div className="p-4 text-[14px]">
      <div ref={box} style={{ position: 'fixed', left: 0, top: 0, width: 960, height: 540, opacity: 0.01, pointerEvents: 'none', zIndex: -1 }} />
      {!rows ? <div>正在查……</div> : <>
        <div className="mb-2 font-black">有 {new Set(rows.map((r) => r.k)).size} 个镜头要看一眼（点镜头名看联系表）</div>
        <table className="w-full"><tbody>{rows.map((r, i) => (
          <tr key={i} className="border-b"><td className="pr-3"><a className="text-sky-700 underline" href={`#/filmtest?k=${r.k},`}>{r.k}</a></td><td className="pr-3">u={r.u}</td>
            <td>{r.on && <span className="mr-3 text-rose-700">盖人：{r.on}</span>}{r.over && <span className="mr-3 text-amber-700">叠字：{r.over}</span>}{r.cut && <span className="text-ink2">切字：{r.cut}</span>}</td></tr>
        ))}</tbody></table>
      </>}
    </div>
  );
}
function FilmSheet() {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const pre = q.get('k') ?? '';
  const keys = pre.includes(',') ? pre.split(',').filter((k) => SHOTS[k]) : Object.keys(SHOTS).filter((k) => k.startsWith(pre));
  const [big, setBig] = useState<string | null>(q.get('play'));
  const t0 = useRef(performance.now());
  useEffect(() => { t0.current = performance.now(); }, [big]);
  return (
    <div className="p-3">
      {big && <div className="fixed inset-0 z-50 bg-black" onClick={() => setBig(null)}><div className="relative mx-auto aspect-video w-[min(100vw,177vh)]"><Film shots={[[big]]} prog={() => ((performance.now() - t0.current) / 5000) % 1.15} /></div><div className="absolute left-2 top-2 text-white">{big}</div></div>}
      <div className={`grid gap-2 ${q.get('cols') === '2' ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {keys.map((k) => (q.get('cols') === '2' ? [0, 0.35, 0.7, 1] : [0, 0.5, 1]).map((u) => (
          <div key={k + u} onClick={() => setBig(k)} className="relative aspect-video cursor-pointer overflow-hidden rounded bg-black" data-shot={k}>
            <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: frameSvg(k, u, 2.3) }} />
            <div className="absolute left-1 top-1 rounded bg-black/60 px-1 text-xs text-white">{k} · {u}</div>
          </div>
        )))}
      </div>
    </div>
  );
}

// ---------------- 测速：#/filmtest?bench=镜头1,镜头2&paper=css|svg|none&blur=0&fps=10&sec=4&report=http://localhost:8199/r ----------------
// 每一镜连续播 sec 秒，记下实际画了多少帧（帧间隔）、每帧拼字符串 + 换 DOM 的时间、事件循环的延迟（点按钮会卡多久）、自动选的帧率。
// fps=N：固定帧率（不跟着机器变）；不给就是自动。
export function FilmBench() {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const keys = (q.get('bench') ?? '').split(',').filter((k) => SHOTS[k]);
  const sec = Number(q.get('sec') ?? 4), fix = Number(q.get('fps') ?? 0);
  const [i, setI] = useState(0);
  const [rows, setRows] = useState<string[]>([]);
  const t0 = useRef(performance.now());
  FILM_OPT.paper = (q.get('paper') as 'css' | 'svg' | 'none') ?? 'css';
  FILM_OPT.blur = q.get('blur') !== '0';
  useEffect(() => {
    if (i >= keys.length) {
      const rep = q.get('report');
      const body = JSON.stringify({ ua: navigator.userAgent, dpr: devicePixelRatio, w: innerWidth, h: innerHeight, paper: FILM_OPT.paper, blur: FILM_OPT.blur, fps: fix || 'auto', rows, log: PACE.log });
      if (rep) fetch(rep, { method: 'POST', body, mode: 'no-cors' }).catch(() => {});
      return;
    }
    FILM_OPT.stats = { draw: [], js: [] };
    t0.current = performance.now();
    const lags: number[] = [];
    let probe = 0, alive = true;
    const tick = () => { const at = performance.now(); probe = window.setTimeout(() => { lags.push(performance.now() - at - 50); if (alive) tick(); }, 50); };
    tick();
    const tm = window.setTimeout(() => {
      alive = false; clearTimeout(probe);
      const st = FILM_OPT.stats!; const d = st.draw.slice(5), gaps = d.slice(1).map((t, k) => t - d[k]).sort((a, b) => a - b), js = st.js.slice(5).sort((a, b) => a - b), lg = lags.slice(2).sort((a, b) => a - b);
      const pct = (a: number[], p: number) => (a.length ? a[Math.min(a.length - 1, Math.floor(a.length * p))] : NaN).toFixed(1);
      const fps = d.length > 1 ? ((d.length - 1) / ((d[d.length - 1] - d[0]) / 1000)).toFixed(1) : '0';
      setRows((r) => [...r, `${keys[i]}\tfps ${fps}\tgap p50 ${pct(gaps, 0.5)} p95 ${pct(gaps, 0.95)}\tjs p50 ${pct(js, 0.5)} p95 ${pct(js, 0.95)}\tlag p50 ${pct(lg, 0.5)} p95 ${pct(lg, 0.95)}\tcost ${PACE.cost.toFixed(1)} vs ${PACE.vs.toFixed(1)} → ${Math.round(1000 / PACE.iv)}fps`]);
      setI((x) => x + 1);
    }, sec * 1000);
    return () => { alive = false; clearTimeout(tm); clearTimeout(probe); };
  }, [i]);
  const k = keys[Math.min(i, keys.length - 1)];
  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative mx-auto aspect-video w-[min(100vw,177vh)] overflow-hidden">
        {i < keys.length && <Film key={k} shots={[[k]]} fps={fix || 30} fixed={!!fix} prog={() => ((performance.now() - t0.current) / (sec * 1000)) % 1} />}
      </div>
      <pre className="absolute bottom-0 left-0 max-h-[40vh] overflow-auto bg-black/70 p-2 text-[11px] text-white">{`paper=${FILM_OPT.paper} blur=${FILM_OPT.blur} fps=${fix || 'auto'} ${i < keys.length ? `测第 ${i + 1}/${keys.length} 镜：${k}` : '测完了'}\n` + rows.join('\n') + (i >= keys.length ? '\n换档：' + PACE.log.join(' | ') : '')}</pre>
    </div>
  );
}

// ---------------- 比较帧率：#/filmtest?lab=镜头&rates=30,15,10,8,6,4&sec=6 ----------------
// 同一镜按几种固定帧率同时播（一样的进度），看低到多少还能接受。
function FpsLab() {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const keys = (q.get('lab') ?? '').split(',').filter((k) => SHOTS[k]);
  const rates = (q.get('rates') ?? '30,15,10,8,6,4').split(',').map(Number).filter((x) => x > 0);
  const sec = Number(q.get('sec') ?? 6);
  const [ki, setKi] = useState(0);
  const t0 = useRef(performance.now());
  useEffect(() => { t0.current = performance.now(); }, [ki]);
  const k = keys[ki];
  if (!k) return <div className="p-4">没有这个镜头</div>;
  return (
    <div className="min-h-screen bg-black p-2 text-white">
      <div className="mb-2 flex items-center gap-3 text-sm">
        <b>{k}</b>（{ki + 1}/{keys.length}，每 {sec} 秒循环）
        {keys.length > 1 && <button className="rounded bg-white/20 px-2" onClick={() => setKi((x) => (x + 1) % keys.length)}>下一镜</button>}
      </div>
      <div className={`grid gap-2 ${rates.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {rates.map((r) => (
          <div key={k + r} className="relative aspect-video overflow-hidden rounded">
            <Film shots={[[k]]} fps={r} fixed prog={() => ((performance.now() - t0.current) / (sec * 1000)) % 1} />
            <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-sm font-bold">{r} 帧/秒</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 看某道题的拓展里的讲解画面（#/filmtest?ext=题号）：把拓展里所有带画面的“讲一段”依次排出来 */
function ExtTest() {
  const q = new URLSearchParams(location.hash.split('?')[1] ?? '');
  const it = PLAY_ITEMS.find((x) => x.id === q.get('ext'));
  const steps = (it?.ext ?? []).flatMap((x) => x.steps).filter((s) => s.kind === 'teach' && s.art);
  return (
    <div className="mx-auto max-w-xl space-y-6 p-4">
      {steps.map((s, i) => s.kind === 'teach' && <div key={i} className="rounded-2xl bg-white p-3 shadow"><p className="mb-2 text-sm">{s.t}</p>{s.art && <Viz spec={s.art} />}</div>)}
    </div>
  );
}

/** 把一道题（正题和拓展）的每一步都排出来，自己点一点检查反馈（#/filmtest?step=题号） */
function StepTest() {
  const q = new URLSearchParams(location.hash.split('?')[1] ?? '');
  const it = ITEM_BY_ID[q.get('step') ?? ''];
  if (!it) return <div className="p-4">没有这道题</div>;
  const box = (k: string, el: React.ReactNode) => <div key={k} data-step={k} className="rounded-2xl bg-white p-3 shadow">{el}</div>;
  return (
    <div className="mx-auto max-w-2xl space-y-4 bg-[#F4EFE4] p-4">
      {it.steps.map((s) => box(s.key, <PlayStep it={it} s={s} color="#B4532A" onDone={() => {}} />))}
      {(it.ext ?? []).map((e) => <SaveCtx.Provider key={e.id} value={e.id + ':'}>{e.steps.map((s) => box(e.id + ':' + s.key, <PlayStep it={it} s={s} color="#B4532A" onDone={() => {}} />))}</SaveCtx.Provider>)}
    </div>
  );
}
