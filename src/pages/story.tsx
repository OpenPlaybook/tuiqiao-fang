// 目录：两条故事线（楚汉、The Golden Panda），每一回都是播放式的（画面 + 配音 + 字幕，播到题就停）。
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { PLANNED, PLAYS, PLAY_BY_ID } from '../shared/play';
import { stationDone, stationStars } from '../shared/adapt';
import { frameSvg } from '../film/Film';
import { isOpen, useGame } from '../game/store';
import { sfx } from '../game/sound';
import { DEMO } from '../game/demo';

export const go = (path: string) => { window.location.hash = path; };

const LINES = [
  { lang: 'zh' as const, name: '楚汉', en: '中文主线', desc: '戴上 AI 读书眼镜，走进《史记》：故事一句一句播，播到题就停。看不懂的字，点一点画虚线的地方。', cover: 'b.songs' },
  { lang: 'en' as const, name: 'The Case of the Golden Panda', en: 'English', desc: '英语节的奖杯不见了。和伦敦来的交换生 Ben 一起破案——用词和时态就是线索。故事里的人说英式英语，题目也按英式答。', cover: 'e.panda' },
];

export function StoryMap() {
  const p = useGame((s) => s.player)!;
  const st = useGame((s) => s);
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="mb-5 flex items-end gap-4"><div className="kai text-4xl">两个故事</div><div className="pb-1 text-ink2">跟着故事往下走，题就在故事里。哪里不明白，点一点字，或者问问 AI 眼镜。</div></div>
      {DEMO && <div className="mb-5 rounded-2xl border-2 border-amber-200 bg-amber-50 px-5 py-3 text-amber-900">这是演示版：不用登录，也不保存记录（刷新页面就从头开始）。课堂版里，AI 会回答学生的提问、给写的句子评分；演示版里这些不连 AI。</div>}
      <div className="grid gap-6 lg:grid-cols-2">
        {LINES.map((L) => (
          <div key={L.lang} className="card overflow-hidden p-0">
            <div className="relative aspect-[16/7] overflow-hidden bg-[#1C1916]">
              <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: frameSvg(L.cover, 0.6, 2) }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <div className="absolute bottom-4 left-5 text-white"><div className="text-sm font-bold opacity-80">{L.en}</div><div className={L.lang === 'zh' ? 'kai text-5xl' : 'font-serif text-3xl font-black'}>{L.name}</div></div>
            </div>
            <div className="p-5">
              <div className="text-ink2">{L.desc}</div>
              <div className="mt-4 space-y-2">
                {PLAYS.filter((x) => (x.lang ?? 'zh') === L.lang).map((c) => {
                  const open = isOpen(st, c.id), n = c.lines.filter((l) => l.task).length, dn = stationDone(p, c.id);
                  return (
                    <motion.button key={c.id} whileHover={open ? { y: -2 } : {}} disabled={!open} onClick={() => { sfx('click'); go(`/c/${c.id}`); }}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${open ? 'bg-white hover:shadow' : 'bg-[#F1EBDD] opacity-70'}`} style={{ borderColor: open ? c.color + '66' : '#E6DCC6' }}>
                      <div className="flex-1"><div className={`text-lg font-black ${L.lang === 'zh' ? 'kai' : 'font-serif'}`} style={{ color: c.color }}>{c.title}</div><div className="text-sm text-ink2">{c.sub}</div></div>
                      {open ? <div className="text-right"><div className="text-sm font-bold text-ink2">{dn} / {n}</div><div className="text-sm font-black text-amber-700">★ {stationStars(p, c.id)}</div></div> : <span className="flex items-center gap-1 text-sm font-bold text-ink2"><Lock size={16} />等老师开放</span>}
                    </motion.button>
                  );
                })}
                {PLANNED.filter((c) => c.lang === L.lang && !PLAY_BY_ID[c.id]).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#E6DCC6] px-4 py-2.5 text-ink2"><div className="flex-1"><div className={`font-black ${L.lang === 'zh' ? 'kai text-lg' : 'font-serif'}`}>{c.title}</div><div className="text-sm">{c.sub}</div></div><span className="text-sm">制作中</span></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
