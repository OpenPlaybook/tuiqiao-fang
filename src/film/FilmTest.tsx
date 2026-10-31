// 分镜联系表（自己检查画面用）：#/filmtest?k=a. 列出所有镜头，每镜看开头、中间、结尾三帧；点一镜放大循环播放
import { useEffect, useRef, useState } from 'react';
import { SHOTS } from './shots';
import { FILM_OPT, Film, PACE, frameSvg } from './Film';

export default function FilmTest() {
  const q = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  return q.get('bench') ? <FilmBench /> : q.get('lab') ? <FpsLab /> : <FilmSheet />;
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
