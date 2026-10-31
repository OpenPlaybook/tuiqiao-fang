// 分镜联系表（自己检查画面用）：#/filmtest?k=a. 列出所有镜头，每镜看开头、中间、结尾三帧；点一镜放大循环播放
import { useEffect, useRef, useState } from 'react';
import { SHOTS } from './shots';
import { Film, frameSvg } from './Film';

export default function FilmTest() {
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
