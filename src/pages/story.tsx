// 两条故事主线：地图、一章（故事一段一段往下走，题长在故事里）、老师讲（展开、一家人、AI 再举例、变式练习）。
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, ChevronDown, Loader2, Lock, Network, Sparkles } from 'lucide-react';
import type { Beat, Chapter, Item, KNode } from '../shared/types';
import { ITEM_BY_ID } from '../shared/bank';
import { CHAPTERS, CHAPTER_BY_ID, NODE_BY_ID, PLANNED, chapterSlots } from '../shared/story';
import { PLAYS, PLAY_BY_ID } from '../shared/play';
import { cleanFirst, pickPractice, slotItem, stationDone, stationStars } from '../shared/adapt';
import { Art, Btn, Rich, Stars } from '../components/ui';
import { Viz, isViz } from '../components/viz';
import { getState, isOpen, logOpen, setAiLeft, useGame } from '../game/store';
import { api } from '../game/api';
import { sfx } from '../game/sound';
import ItemView from '../items/ItemView';
import { Msg } from '../items/steps';
import { DEMO } from '../game/demo';
import { DEMO_EXAMPLES } from '../game/demoExamples';

export const go = (path: string) => { window.location.hash = path; };

// ---------------- 地图：两条主线 ----------------
export function StoryMap() {
  const p = useGame((s) => s.player)!;
  const st = useGame((s) => s);
  const lines = [
    { id: 'zh' as const, name: '楚汉', en: '中文主线', desc: '戴上 AI 读书眼镜，走进《史记》：故事一句一句播，播到题就停。看不懂的字，鼠标放上去点一点。', art: { k: 'ink', p: { k: 'gaixia' } } },
    { id: 'en' as const, name: 'The Case of the Golden Panda', en: 'English', desc: '英语节的奖杯不见了。和交换生 Ben 一起破案——语法就是线索。', art: { k: 'en', p: { k: 'hall' } } },
  ];
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="mb-5 flex items-end gap-4"><div className="kai text-4xl">两个故事</div><div className="pb-1 text-ink2">跟着故事往下走，题就在故事里。哪里不明白，就点开让“老师”多讲一点。</div></div>
      {DEMO && <div className="mb-5 rounded-2xl border-2 border-amber-200 bg-amber-50 px-5 py-3 text-amber-900">这是演示版：不用登录，也不保存记录（刷新页面就从头开始）。现在能玩的是中文第一回和英文第一章。课堂版里 AI 会现场举例、给学生写的句子评分；演示版里的 AI 例子是事先生成好的，写句子不评分。</div>}
      <div className="grid gap-6 lg:grid-cols-2">
        {lines.map((L) => (
          <div key={L.id} className="card overflow-hidden p-0">
            <div className="relative"><Art spec={L.art} className="aspect-[16/7]" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><div className="absolute bottom-4 left-5 text-white"><div className="text-sm font-bold opacity-80">{L.en}</div><div className={L.id === 'zh' ? 'kai text-5xl' : 'text-3xl font-black'}>{L.name}</div></div></div>
            <div className="p-5">
              <div className="text-ink2">{L.desc}</div>
              <div className="mt-4 space-y-2">
                {[...(L.id === 'zh' ? PLAYS.map((x) => ({ id: x.id, title: x.title, sub: x.sub, color: x.color, n: x.lines.filter((l) => l.task).length })) : CHAPTERS.filter((c) => c.line === L.id).map((c) => ({ id: c.id, title: c.title, sub: c.sub, color: c.color, n: chapterSlots(c).length })))].map((c) => {
                  const open = isOpen(st, c.id), n = c.n, dn = stationDone(p, c.id);
                  return (
                    <motion.button key={c.id} whileHover={open ? { y: -2 } : {}} disabled={!open} onClick={() => { sfx('click'); go(`/c/${c.id}`); }}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left ${open ? 'bg-white hover:shadow' : 'bg-[#F1EBDD] opacity-70'}`} style={{ borderColor: open ? c.color + '66' : '#E6DCC6' }}>
                      <div className="flex-1"><div className={`text-lg font-black ${L.id === 'zh' ? 'kai' : ''}`} style={{ color: c.color }}>{c.title}</div><div className="text-sm text-ink2">{c.sub}</div></div>
                      {open ? <div className="text-right"><div className="text-sm font-bold text-ink2">{dn} / {n}</div><div className="text-sm font-black text-amber-700">★ {stationStars(p, c.id)}</div></div> : <span className="flex items-center gap-1 text-sm font-bold text-ink2"><Lock size={16} />等老师开放</span>}
                    </motion.button>
                  );
                })}
                {PLANNED.filter((c) => c.line === L.id && !PLAY_BY_ID[c.id]).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-[#E6DCC6] px-4 py-2.5 text-ink2"><div className="flex-1"><div className={`font-black ${L.id === 'zh' ? 'kai text-lg' : ''}`}>{c.title}</div><div className="text-sm">{c.sub}</div></div><span className="text-sm">制作中</span></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- 故事里的一段话 ----------------
const BeatView = ({ b, line }: { b: Beat; line: 'zh' | 'en' }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
    {b.art && <div className="mb-3">{isViz(b.art) ? <Viz spec={b.art} /> : <Art spec={b.art} className={`rounded-2xl border-2 border-[#E6DCC6] ${typeof b.art !== 'string' && b.art.k === 'ben' ? 'aspect-[400/260] max-w-[360px]' : 'aspect-[16/8]'}`} />}</div>}
    {b.who ? (
      <div className="flex items-start gap-3">
        <span className={`mt-1 shrink-0 rounded-lg px-2.5 py-1 text-sm font-black text-white ${line === 'zh' ? 'kai text-base' : ''}`} style={{ background: line === 'zh' ? '#8A6A2F' : '#2563EB' }}>{b.who}</span>
        <div className={`rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-[19px] leading-relaxed shadow-sm ${line === 'zh' && /[吾乎矣兮]/.test(b.t) ? 'kai text-[22px]' : ''}`}><Rich text={b.t} /></div>
      </div>
    ) : <div className="px-1 text-[19px] leading-relaxed text-ink"><Rich text={b.t} /></div>}
  </motion.div>
);

// ---------------- 一章 ----------------
export function ChapterPage({ id }: { id: string }) {
  const p = useGame((s) => s.player)!;
  const c = CHAPTER_BY_ID[id];
  const open = useGame((s) => isOpen(s, id));
  const segs = useMemo(() => { const out: { beats: Beat[] }[] = [{ beats: [] }]; for (const f of c?.flow ?? []) { if ('task' in f) out.push({ beats: [] }); else out[out.length - 1].beats.push(f); } return out; }, [id]);
  const n = segs.length - 1;
  // pos：已经走过了几道题（做完、并且点了“继续故事”）
  const [pos, setPos] = useState(() => Math.min(n, stationDone(p, id)));
  const [shown, setShown] = useState(() => (slotItem(p, id, pos) && p.recs[slotItem(p, id, pos)!.id] ? 999 : 1));
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [pos, shown]);
  if (!c) return null;
  if (!open) return <div className="mx-auto max-w-[700px] px-4 py-16 text-center"><div className="kai text-4xl">{c.title}</div><div className="mt-3 text-ink2">这一章老师还没开放。</div><div className="mt-6"><Btn onClick={() => go('/')}>回地图</Btn></div></div>;
  const cur = segs[pos], beatsShown = pos < n ? Math.min(shown, cur.beats.length) : 0;
  const allBeats = beatsShown >= cur.beats.length;
  const it = pos < n ? slotItem(p, id, pos) : null;
  const next = () => { sfx('flip'); setShown((s) => s + 1); };
  const advance = () => { setPos((x) => x + 1); setShown(1); };
  const endShown = pos >= n;
  return (
    <div className="mx-auto max-w-[920px] px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => go('/')} className="text-sm font-bold text-ink2 underline">← 地图</button>
        <div className={`text-3xl font-black ${c.line === 'zh' ? 'kai' : ''}`} style={{ color: c.color }}>{c.title}</div>
        <div className="flex gap-1">{Array.from({ length: n }, (_, i) => <span key={i} className="h-2.5 w-6 rounded-full" style={{ background: i < pos ? c.color : i === pos ? c.color + '77' : '#E6DCC6' }} />)}</div>
        <span className="ml-auto text-sm font-black text-amber-700">★ {stationStars(p, id)}</span>
      </div>
      {segs.slice(0, Math.min(pos, n) + 1).map((sg, i) => (
        <div key={i}>
          {(i < pos ? sg.beats : sg.beats.slice(0, beatsShown)).map((b, j) => <BeatView key={j} b={b} line={c.line} />)}
          {i < pos && i < n && <DoneTask c={c} k={i} />}
        </div>
      ))}
      {!endShown && !allBeats && <div className="mb-6 flex justify-end"><Btn color={c.color} onClick={next}>继续 ▸</Btn></div>}
      {!endShown && allBeats && it && <TaskCard key={it.id} it={it} c={c} onContinue={advance} />}
      {endShown && (
        <div className="mt-2">
          {c.end.map((b, j) => <BeatView key={j} b={b} line={c.line} />)}
          <div className="mt-6 flex gap-3"><Btn color={c.color} onClick={() => go('/')}>回地图</Btn>{c.next && CHAPTER_BY_ID[c.next] && <Btn color={c.color} onClick={() => go(`/c/${c.next}`)}>下一章 →</Btn>}</div>
        </div>
      )}
      <div ref={endRef} className="h-4" />
    </div>
  );
}

// 已经走过的题：一行，可以再展开看讲解
const DoneTask = ({ c, k }: { c: Chapter; k: number }) => {
  const p = useGame((s) => s.player)!;
  const it = slotItem(p, c.id, k)!;
  const r = p.recs[it.id];
  const [openT, setOpenT] = useState(false);
  return (
    <div className="mb-4 rounded-2xl border-2 bg-white/70 px-4 py-2.5" style={{ borderColor: c.color + '33' }}>
      <button onClick={() => setOpenT(!openT)} className="flex w-full items-center gap-3 text-left"><Stars n={r?.stars ?? 0} size={18} /><span className="font-bold">{it.label}</span><span className="ml-auto flex items-center gap-1 text-sm text-ink2">{openT ? '收起' : '再看讲解'}<ChevronDown size={16} className={openT ? 'rotate-180' : ''} /></span></button>
      {openT && <div className="mt-3"><TeachPanel it={it} color={c.color} review /></div>}
    </div>
  );
};

// ---------------- 故事里的一道题 ----------------
function TaskCard({ it, c, onContinue }: { it: Item; c: Chapter; onContinue: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
      <div className="mb-2 flex items-center gap-2"><span className="rounded-full px-3 py-0.5 text-sm font-black text-white" style={{ background: c.color }}>{c.line === 'zh' ? '轮到你了' : 'Your turn'}</span><span className="text-sm font-bold text-ink2">{it.label}</span></div>
      <ItemView it={it} color={c.color} compact after={<TeachPanel it={it} color={c.color} onContinue={onContinue} />} />
    </motion.div>
  );
}

// ---------------- 老师讲 ----------------
export function TeachPanel({ it, color, onContinue, review }: { it: Item; color: string; onContinue?: () => void; review?: boolean }) {
  const p = useGame((s) => s.player)!;
  const node: KNode | undefined = it.node ? NODE_BY_ID[it.node] : undefined;
  const rec = p.recs[it.id];
  const [openChips, setOpenChips] = useState<number[]>([]);
  const [web, setWeb] = useState(false);
  const [aiEx, setAiEx] = useState<{ s: string; note: string }[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiErr, setAiErr] = useState('');
  // 变式练习：答错过的一定要做一道；还错，再来一道（并自动展开第一个“不明白”）
  const needPrac = !review && !cleanFirst(rec);
  const [pracIds, setPracIds] = useState<string[]>([]);
  const [pracRes, setPracRes] = useState<Record<string, number>>({});
  const [wantPrac, setWantPrac] = useState(false);
  useEffect(() => {
    if (review || pracIds.length) return;
    if (needPrac) { const x = pickPractice(getState().player!, node); if (x) setPracIds([x.id]); }
  }, [it.id]);
  const lastPrac = pracIds[pracIds.length - 1];
  const pracDone = pracIds.length > 0 && pracRes[lastPrac] !== undefined;
  const pracOk = pracIds.some((id) => (pracRes[id] ?? 0) >= 0.99);
  const canGo = review || !needPrac || pracIds.length === 0 || pracOk || (pracDone && pracIds.length >= 2);
  const onPrac = (id: string, perf: number) => {
    setPracRes((r) => ({ ...r, [id]: perf }));
    if (perf < 0.99 && pracIds.length < 2) {
      setOpenChips((o) => (o.includes(0) ? o : [...o, 0]));
      const x = pickPractice(getState().player!, node, [...pracIds]);
      if (x) setTimeout(() => setPracIds((ids) => [...ids, x.id]), 900);
    }
  };
  // 每个错误选项也可以点开：“X 为什么不对？”
  const ch = it.steps.find((s) => s.kind === 'choice') ?? (it.steps.find((s) => s.kind === 'spot') as { fix?: unknown } | undefined)?.fix;
  const optChips = ch && typeof ch === 'object' && 'opts' in (ch as object) ? (ch as { opts: { t: string; why: string; art?: unknown }[]; ok: number[] }).opts.map((o, i) => ({ o, ok: (ch as { ok: number[] }).ok.includes(i) })).filter((x) => !x.ok && x.o.t.length <= 14) : [];
  const chips = [...(node?.chips ?? []).map((cp) => ({ q: cp.q, a: cp.a, viz: cp.viz, ex: cp.ex })), ...optChips.map((x) => ({ q: `“${x.o.t}”为什么不对？`, a: x.o.why, viz: x.o.art as never, ex: undefined }))];
  const toggle = (i: number) => { sfx('click'); setOpenChips((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i])); if (!openChips.includes(i)) logOpen(it, `不明白：${chips[i].q}`); };
  const askAi = async () => {
    if (!node || aiBusy) return;
    setAiBusy(true); setAiErr(''); logOpen(it, 'AI 再举例');
    if (DEMO) { // 演示版：用事先生成好的例子，每次给两个
      await new Promise((r) => setTimeout(r, 700));
      const all = DEMO_EXAMPLES[node.id] ?? [], more = all.slice(aiEx.length, aiEx.length + 2);
      if (more.length) { setAiEx((x) => [...x, ...more]); sfx('hint'); } else setAiErr('演示版里事先准备的例子就这些了；课堂版里 AI 会现场再举。');
      setAiBusy(false); return;
    }
    try { const r = await api.examples({ pid: p.pid, token: p.token, node: node.id, item: it.id, seen: aiEx.map((e) => e.s) }); setAiEx((x) => [...x, ...r.examples]); setAiLeft(r.left); sfx('hint'); }
    catch (e) { setAiErr(String((e as Error).message || e)); } finally { setAiBusy(false); }
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
      <div className="card p-6" style={{ borderColor: color + '44' }}>
        <div className="mb-3 flex items-center gap-2"><BookOpen size={20} style={{ color }} /><span className="text-lg font-black" style={{ color }}>老师讲</span>{node && <span className="font-bold text-ink2">· {node.name}</span>}{rec && <span className="ml-auto"><Stars n={rec.stars} size={20} /></span>}</div>
        {node?.teach.viz && <div className="mb-4"><Viz spec={node.teach.viz} /></div>}
        <div className="space-y-1.5 text-[17px] leading-relaxed">{(node?.teach.lines ?? [it.explain]).map((l, i) => <div key={i}><Rich text={l} /></div>)}</div>
        {node?.teach.ex && <div className="mt-3 flex flex-wrap gap-2">{node.teach.ex.map((e) => <span key={e} className="rounded-xl bg-[#F7EFD9] px-3 py-1.5 font-bold">{e}</span>)}</div>}
        {node && it.explain && <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[15px] text-ink2">这道题：<Rich text={it.explain} /></div>}
        {it.know && <div className="mt-3 flex gap-2 rounded-xl border border-[#D8C08A] bg-[#F7EFD9] px-3 py-2 text-[15px]"><span>📜</span><Rich text={it.know} /></div>}

        {chips.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 font-black">哪里还不明白？点一点</div>
            <div className="flex flex-wrap gap-2">{chips.map((cp, i) => <button key={i} onClick={() => toggle(i)} className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold ${openChips.includes(i) ? 'text-white' : 'border-[#E6DCC6] bg-white'}`} style={openChips.includes(i) ? { background: color, borderColor: color } : {}}>{cp.q}</button>)}</div>
            <div className="mt-3 space-y-2">{openChips.map((i) => chips[i] && (
              <motion.div key={i} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-[#E6DCC6] bg-white px-4 py-3">
                <div className="text-sm font-black text-ink2">{chips[i].q}</div>
                {chips[i].viz && <div className="my-2 max-w-[520px]"><Viz spec={chips[i].viz as never} /></div>}
                <div className="mt-1 leading-relaxed"><Rich text={chips[i].a} /></div>
                {chips[i].ex && <div className="mt-1 text-sm text-ink2">{chips[i].ex!.join('　')}</div>}
              </motion.div>
            ))}</div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {node?.web && <button onClick={() => { setWeb(!web); if (!web) logOpen(it, '一家人'); }} className="flex items-center gap-1.5 rounded-full bg-[#2B2722] px-4 py-2 text-sm font-black text-white"><Network size={16} />{web ? '收起' : '看看这个点的一家人'}</button>}
          {node?.ai && <button disabled={aiBusy} onClick={askAi} className="flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60">{aiBusy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{aiEx.length ? 'AI 再举两个' : 'AI 再举两个例子'}</button>}
          {!needPrac && !review && !wantPrac && node && pickPractice(p, node) && <button onClick={() => { const x = pickPractice(getState().player!, node); if (x) { setPracIds([x.id]); setWantPrac(true); } }} className="rounded-full border-2 border-[#E6DCC6] bg-white px-4 py-2 text-sm font-black">考考我</button>}
        </div>
        {web && node?.web && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-2xl bg-[#FBF7EE] p-4">
            <div className="kai mb-3 text-2xl">{node.web.title}</div>
            <div className="grid gap-3 sm:grid-cols-2">{node.web.groups.map((g) => (
              <div key={g.name} className="rounded-xl bg-white p-3 shadow-sm"><div className="mb-2 text-sm font-black" style={{ color }}>{g.name}</div>
                <div className="space-y-1.5">{g.items.map((w) => <div key={w.t} className="flex items-center gap-2">{w.viz && <Art spec={w.viz} className="aspect-[56/22] w-[84px] shrink-0 rounded-md" />}<div><b>{w.t}</b>　<span className="text-ink2">{w.d}</span>{w.ex && <span className="ml-1 text-xs text-ink2">（{w.ex}）</span>}</div></div>)}</div>
              </div>
            ))}</div>
          </motion.div>
        )}
        {(aiEx.length > 0 || aiErr) && (
          <div className="mt-4 rounded-2xl border-2 border-sky-200 bg-sky-50/70 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5 text-sm font-black text-sky-800"><Sparkles size={15} />{DEMO ? 'AI 举的例子（演示版：事先用 AI 生成好的）' : 'AI 现场举的例子（AI 也会出错，觉得不对可以问老师）'}</div>
            {aiEx.map((e, i) => <div key={i} className="mt-2"><div className="text-[17px] font-bold">{i + 1}. {e.s}</div><div className="text-sm text-ink2">{e.note}</div></div>)}
            {aiErr && <div className="text-rose-700">{aiErr}</div>}
          </div>
        )}
      </div>

      {pracIds.map((id, i) => ITEM_BY_ID[id] && (
        <div key={id} className="card border-amber-200 p-5">
          <div className="mb-2 font-black text-amber-800">{needPrac ? (i === 0 ? '老师再出一道，看你懂了没有' : '再来一道，换个说法') : '考考你'}</div>
          <ItemView it={ITEM_BY_ID[id]} color={color} compact prac onFinish={(perf) => onPrac(id, perf)}
            after={<Msg ok={(pracRes[id] ?? (p.recs[id]?.perf ?? 0)) >= 0.99}>{(pracRes[id] ?? p.recs[id]?.perf ?? 0) >= 0.99 ? '一次就对了，懂了！' : '这道也不容易。'} <Rich text={ITEM_BY_ID[id].explain} /></Msg>} />
        </div>
      ))}

      {onContinue && (
        <div className="flex items-center justify-end gap-3">
          {!canGo && <span className="text-sm text-ink2">做完上面这道变式题，再继续故事</span>}
          <Btn size="lg" color={color} disabled={!canGo} onClick={() => { sfx('flip'); onContinue(); }}>继续故事 →</Btn>
        </div>
      )}
    </motion.div>
  );
}
