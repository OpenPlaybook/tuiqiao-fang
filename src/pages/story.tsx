// 目录：中文是一张故事线图（刘邦、项羽、萧何、张良、韩信五条线，★ 是汇合的节点），英文是一个侦探故事的四章。
// 故事线图不按顺序锁：哪个节点都能点，只走一个人的线也行。每个节点标出大约几分钟。
import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Star } from 'lucide-react';
import { PLAYS, PLAY_BY_ID } from '../shared/play';
import { LANES, NODES, ROWS, laneHas, type Lane, type MapNode } from '../shared/play/storymap';
import { stationDone, stationStars } from '../shared/adapt';
import { frameSvg } from '../film/Film';
import { isOpen, useGame } from '../game/store';
import { sfx } from '../game/sound';
import { DEMO } from '../game/demo';

export const go = (path: string) => { window.location.hash = path; };
const tabKey = 'tq-map-tab';
const readTab = () => { try { return localStorage.getItem(tabKey) === 'en' ? 'en' : 'zh'; } catch { return 'zh'; } };

export function StoryMap() {
  const [tab, setTab] = useState<'zh' | 'en'>(readTab);
  const pick = (t: 'zh' | 'en') => { sfx('click'); setTab(t); try { localStorage.setItem(tabKey, t); } catch { /* 无痕模式 */ } };
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-5">
      {DEMO && <div className="mb-4 rounded-2xl border-2 border-amber-200 bg-amber-50 px-5 py-3 text-amber-900">这是演示版：不用登录，也不保存记录（刷新页面就从头开始）。课堂版里，AI 会回答学生的提问、给写的句子评分；演示版里这些不连 AI。</div>}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        {([['zh', '楚汉', '五个人的故事'], ['en', 'The Golden Panda', 'English']] as const).map(([t, a, b]) => (
          <button key={t} onClick={() => pick(t)} className={`rounded-2xl border-2 px-5 py-2 text-left ${tab === t ? 'border-[#2B2722] bg-white shadow' : 'border-[#E6DCC6] bg-white/60 text-ink2'}`}>
            <div className={t === 'zh' ? 'kai text-3xl' : 'font-serif text-2xl font-black'}>{a}</div><div className="text-sm font-bold">{b}</div>
          </button>
        ))}
        <div className="pb-1 text-ink2">{tab === 'zh' ? '戴上 AI 读书眼镜走进《史记》。选一个人，顺着他的线往下读；★ 处几个人的故事碰到了一起。不必按顺序，哪里感兴趣就点哪里。' : '英语节的奖杯不见了。和伦敦来的交换生 Ben 一起破案——用词和时态就是线索。'}</div>
      </div>
      {tab === 'zh' ? <ZhMap /> : <EnList />}
    </div>
  );
}

// ---------------- 楚汉：五条线 ----------------
const RH = 76, SH = 58, GAP = 10; // 普通一行、★ 一行的高度
function ZhMap() {
  const p = useGame((s) => s.player)!;
  const st = useGame((s) => s);
  const [focus, setFocus] = useState<Lane | null>(null);
  const rowH = ROWS.map((_, r) => (NODES.some((n) => n.row === r && n.star) ? SH : RH));
  const top = rowH.map((_, r) => rowH.slice(0, r).reduce((a, h) => a + h + GAP, 0));
  const H = top[top.length - 1] + rowH[rowH.length - 1];
  const dim = (n: MapNode) => !!focus && !laneHas(n, focus);
  const total = NODES.filter((n) => !focus || laneHas(n, focus)).reduce((a, n) => a + n.mins, 0);
  return (
    <div className="card p-4">
      <div className="grid grid-cols-[72px_repeat(5,minmax(0,1fr))] gap-x-2.5">
        <div />
        {LANES.map((l) => (
          <button key={l.id} onClick={() => { sfx('click'); setFocus((f) => (f === l.id ? null : l.id)); }} title={l.who}
            className={`mb-2 rounded-xl border-2 px-2 py-1.5 text-center ${focus === l.id ? 'text-white' : 'bg-white'}`} style={focus === l.id ? { background: l.color, borderColor: l.color } : { borderColor: l.color + '55' }}>
            <div className="kai text-2xl" style={focus === l.id ? {} : { color: l.color }}>{l.name}</div>
            <div className={`truncate text-[12px] ${focus === l.id ? 'opacity-90' : 'text-ink2'}`}>{l.who}</div>
          </button>
        ))}
      </div>
      <div className="mb-2 text-right text-[13px] text-ink2">{focus ? `只看${LANES.find((l) => l.id === focus)!.name}的线：约 ${total} 分钟。再点一下名字，看全部。` : `点一个人的名字，只看他的线。全部读完约 ${Math.round(total / 6) / 10} 小时，挑感兴趣的读就好。`}</div>
      <div className="relative grid grid-cols-[72px_repeat(5,minmax(0,1fr))] gap-x-2.5" style={{ height: H }}>
        {/* 每条线一根竖线：从这条线的第一个节点到最后一个 */}
        {LANES.map((l, i) => {
          const rs = NODES.filter((n) => laneHas(n, l.id)).map((n) => n.row);
          const a = Math.min(...rs), b = Math.max(...rs);
          return <div key={l.id} className="pointer-events-none absolute w-[3px] rounded-full transition-opacity" style={{ left: `calc(72px + 10px + (100% - 72px - 50px) / 5 * ${i + 0.5} + ${i * 10}px - 1.5px)`, top: top[a] + rowH[a] / 2, height: top[b] - top[a], background: l.color, opacity: focus && focus !== l.id ? 0.12 : 0.45 }} />;
        })}
        {ROWS.map((y, r) => <div key={r} className="absolute left-0 w-[72px] pr-1 text-right text-[12px] font-bold leading-tight text-ink2" style={{ top: top[r] + rowH[r] / 2 - 8 }}>{y}</div>)}
        {NODES.map((n) => {
          const col = n.star ? 0 : LANES.findIndex((l) => l.id === n.lanes[0]);
          const left = n.star ? '82px' : `calc(72px + 10px + ((100% - 72px - 50px) / 5 + 10px) * ${col})`;
          const width = n.star ? 'calc(100% - 82px)' : 'calc((100% - 72px - 50px) / 5)';
          return <NodeCard key={n.id} n={n} style={{ position: 'absolute', top: top[n.row], height: rowH[n.row], left, width }} dim={dim(n)} open={isOpen(st, n.id)} done={PLAY_BY_ID[n.id] ? stationDone(p, n.id) : 0} stars={PLAY_BY_ID[n.id] ? stationStars(p, n.id) : 0} />;
        })}
      </div>
    </div>
  );
}

function NodeCard({ n, style, dim, open, done, stars }: { n: MapNode; style: React.CSSProperties; dim: boolean; open: boolean; done: number; stars: number }) {
  const play = PLAY_BY_ID[n.id];
  const lane = LANES.find((l) => l.id === n.lanes[0])!;
  const tasks = play ? play.lines.filter((l) => l.task).length : 0;
  const ok = !!play && open;
  const color = n.star ? '#7A5A1E' : lane.color;
  return (
    <motion.button style={{ ...style, opacity: dim ? 0.3 : 1, borderColor: play ? color + '77' : '#E6DCC6' }} whileHover={ok ? { y: -2 } : {}} disabled={!ok} onClick={() => { sfx('click'); go(`/c/${n.id}`); }}
      className={`flex items-center gap-2 overflow-hidden rounded-xl border-2 px-3 text-left transition-opacity ${!play ? 'border-dashed bg-[#F6F1E6]' : n.star ? 'bg-[#FFF8E6]' : 'bg-white'} ${ok ? 'hover:shadow' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {n.star && <Star size={16} className="shrink-0 fill-amber-400 text-amber-500" />}
          <span className="kai truncate text-[19px]" style={{ color: play ? color : '#9A8F80' }}>{n.title}</span>
          {n.star && <span className="ml-1 flex gap-1">{n.lanes.map((l) => { const L = LANES.find((x) => x.id === l)!; return <span key={l} className="rounded-full px-1.5 text-[11px] font-bold text-white" style={{ background: L.color }}>{L.name}</span>; })}</span>}
        </div>
        <div className="truncate text-[12px] text-ink2">{n.sub}</div>
      </div>
      <div className="shrink-0 text-right text-[12px] leading-tight text-ink2">
        {!play ? '制作中' : !open ? <span className="flex items-center gap-0.5"><Lock size={12} />未开放</span> : <><div>约 {n.mins} 分</div>{tasks > 0 && <div className="font-bold">{done}/{tasks}{stars > 0 && <span className="text-amber-700"> ★{stars}</span>}</div>}</>}
      </div>
    </motion.button>
  );
}

// ---------------- 英文：四章 ----------------
function EnList() {
  const p = useGame((s) => s.player)!;
  const st = useGame((s) => s);
  return (
    <div className="card overflow-hidden p-0">
      <div className="relative aspect-[16/5] overflow-hidden bg-[#1C1916]">
        <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: frameSvg('e.panda', 0.6, 2) }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white"><div className="text-sm font-bold opacity-80">English</div><div className="font-serif text-3xl font-black">The Case of the Golden Panda</div></div>
      </div>
      <div className="grid gap-2 p-5 md:grid-cols-2">
        {PLAYS.filter((x) => x.lang === 'en').map((c) => {
          const open = isOpen(st, c.id), n = c.lines.filter((l) => l.task).length, dn = stationDone(p, c.id);
          return (
            <motion.button key={c.id} whileHover={open ? { y: -2 } : {}} disabled={!open} onClick={() => { sfx('click'); go(`/c/${c.id}`); }}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${open ? 'bg-white hover:shadow' : 'bg-[#F1EBDD] opacity-70'}`} style={{ borderColor: open ? c.color + '66' : '#E6DCC6' }}>
              <div className="flex-1"><div className="font-serif text-lg font-black" style={{ color: c.color }}>{c.title}</div><div className="text-sm text-ink2">{c.sub}</div></div>
              {open ? <div className="text-right"><div className="text-sm font-bold text-ink2">{dn} / {n}</div><div className="text-sm font-black text-amber-700">★ {stationStars(p, c.id)}</div></div> : <span className="flex items-center gap-1 text-sm font-bold text-ink2"><Lock size={16} />等老师开放</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
