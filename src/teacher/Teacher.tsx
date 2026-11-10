// 教师后台：学生（星星、探索点、能力估计）、题目（错得最多的选项）、好句子、AI、设置。
import { useState } from 'react';
import { api,base, type TeacherState } from '../game/api';
import { STATIONS, TRACKS, LV_NAME, openMode, openPatch } from '../shared/adapt';
import { STATION_IDS, type Lv } from '../shared/types';
import { Avatar, Btn, Modal } from '../components/ui';

import {useData} from '@/src/shared/grain-flow/react';
import {DataReadStateRenderer} from '@/src/shared/grain-flow/data-read-state-renderer';
import {ToolDownloadButton} from '../../common/download-button';
const ago = (t: number, now: number) => { const s = Math.round((now - t) / 1000); return s < 60 ? '刚刚' : s < 3600 ? `${Math.round(s / 60)} 分钟前` : `${Math.round(s / 3600)} 小时前`; };
const lvText = (x: number) => (x ? `${x.toFixed(1)}` : '—');

export default function Teacher(){const result=useData<TeacherState>('tuiqiao.teacher');return <DataReadStateRenderer result={result} renderData={st=><TeacherBody st={st}/>}/>;}
function TeacherBody({st}:{st:TeacherState}){
 const [tab,setTab]=useState<'players'|'items'|'gloss'|'asks'|'good'|'ai'|'set'>('players');
 const [big,setBig]=useState<string|null>(null);
  const c = st.config;
  const setCfg = async (b: Partial<typeof c>) => { await api.teacher.setConfig(b); };
  const online = st.players.filter((p) => st.now - p.lastSeen < 20000).length;
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="kai text-3xl">字里行间 · 教师后台</div>
        <span className="text-ink2">{st.players.length} 人，在线 {online} 人</span>
        <div className="ml-auto flex flex-wrap gap-2"><a href="#/student">查看课程</a>
          <button onClick={() => setCfg({ attention: !c.attention })} className={`rounded-full px-4 py-2 font-black ${c.attention ? 'bg-rose-600 text-white' : 'bg-white chunky'}`}>{c.attention ? '取消“请看大屏幕”' : '请看大屏幕'}</button>
          {(['players', 'items', 'gloss', 'asks', 'good', 'ai', 'set'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 font-black ${tab === t ? 'bg-[#2B2722] text-white' : 'bg-white chunky'}`}>{{ players: '学生', items: '题目', gloss: '点开的字', asks: '学生的提问', good: '好句子', ai: 'AI', set: '开放与设置' }[t]}</button>)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-white/70 px-4 py-2">
        <span className="font-black">开放关卡：</span>
        {([['zh', '📜 逐鹿天下（《史记》）', '#9A3B2E'], ['en', '🔎 The Golden Panda（英文）', '#2F5DA8'], ['ec', '🕰 The Time Capsule（英文）', '#2E7D6B']] as const).map(([k, t, col]) => { const m = openMode(c.open, k); return (
          <div key={k} className="flex items-center gap-1.5">
            <span className="text-sm font-black" style={{ color: col }}>{t}</span>
            <div className="flex overflow-hidden rounded-full border-2" style={{ borderColor: col }}>
              {([['closed', '不开放'], ['progress', '按进度'], ['all', '全部开放']] as const).map(([v, lab]) => <button key={v} onClick={() => setCfg({ open: { ...c.open, ...openPatch(k, v) } })} className={`px-3 py-1 text-sm font-black ${m === v ? 'text-white' : 'bg-white text-ink2 hover:bg-[#F6EFDF]'}`} style={m === v ? { background: col } : {}}>{lab}</button>)}
            </div>
          </div>
        ); })}
        <span className="text-[13px] text-ink2">按进度：读完一站，下一站才打开；全部开放：哪一站都能点开</span>
      </div>

      {tab === 'players' && (
        <div className="card mt-4 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#F3ECDC] text-left"><tr>{['', '姓名', '学校', '星星',  '妙笔', '完成', '探索点', '点字（意思 / 句中）', '提问', '平均难度', ...TRACKS.map((t) => `能力·${t.name}`), '不确定', ...STATIONS.map((s) => s.name), '现在在', '最近'].map((h, i) => <th key={i} className="whitespace-nowrap px-2.5 py-2 font-black">{h}</th>)}</tr></thead>
            <tbody>
              {st.players.map((p, i) => (
                <tr key={p.pid} className="border-t border-[#EFE6D2]">
                  <td className="px-2.5 py-1.5 text-ink2">{i + 1}</td>
                  <td className="whitespace-nowrap px-2.5 py-1.5 font-black"><Avatar i={p.avatar} size={26} /> {p.name}</td>
                  <td className="px-2.5 py-1.5">{p.sid}</td>
                  <td className="px-2.5 py-1.5 font-black text-amber-700">{p.stars}</td>

                  <td className="px-2.5 py-1.5">{p.bonus || ''}</td>
                  <td className="px-2.5 py-1.5">{p.done}</td>
                  <td className="px-2.5 py-1.5 font-bold text-sky-700">{p.side || ''}</td>
                  <td className="px-2.5 py-1.5">{p.gloss ? `${p.gloss} / ${p.gloss2 ?? 0}` : ''}</td>
                  <td className="px-2.5 py-1.5">{p.asks || ''}</td>
                  <td className="px-2.5 py-1.5">{lvText(p.avgLv)}</td>
                  {TRACKS.map((t) => <td key={t.id} className="px-2.5 py-1.5"><span className="inline-block h-2 rounded-full bg-amber-400 align-middle" style={{ width: (p.theta[t.id] - 1) * 18 + 4 }} /> {p.theta[t.id].toFixed(1)}</td>)}
                  <td className="px-2.5 py-1.5">{p.unsure || ''}</td>
                  {STATIONS.map((s) => <td key={s.id} className="px-2.5 py-1.5 text-center">{p.stations[s.id].done ? `${p.stations[s.id].done}/${s.n}·★${p.stations[s.id].stars}` : ''}</td>)}
                  <td className="whitespace-nowrap px-2.5 py-1.5">{p.current}</td>
                  <td className="whitespace-nowrap px-2.5 py-1.5 text-ink2">{ago(p.lastSeen, st.now)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs text-ink2">星星已综合任务难度、题量、知识与剧情价值。能力值 1—4 对应基础、进阶、挑战、高阶，由做题表现估计（第一次就对、用没用“不确定”、第几次答对）。</div>
        </div>
      )}

      {tab === 'items' && (
        <div className="mt-4 space-y-4">
          {STATIONS.map((s) => (
            <div key={s.id} className="card p-0">
              <div className="px-4 py-2 text-lg font-black" style={{ color: s.color }}>{s.emoji} {s.name}</div>
              <table className="w-full text-sm"><thead className="bg-[#F3ECDC] text-left"><tr>{['题', '难度', '做过', '完成', '平均星', '第一次就对', '不确定', '错选（次数）', '学生点开的字 / 不明白'].map((h) => <th key={h} className="px-3 py-1.5 font-black">{h}</th>)}</tr></thead>
                <tbody>{st.items.filter((x) => x.st === s.id).map((x) => (
                  <tr key={x.id} className="border-t border-[#EFE6D2]"><td className="px-3 py-1.5 font-bold">{x.label}</td><td className="px-3 py-1.5">{LV_NAME[x.lv as Lv]}</td><td className="px-3 py-1.5">{x.n || ''}</td><td className="px-3 py-1.5">{x.done || ''}</td><td className="px-3 py-1.5">{x.done ? `${x.avgStars.toFixed(1)}/${x.maxStars}` : ''}</td>
                    <td className="px-3 py-1.5">{x.firstN ? `${Math.round((100 * x.firstOk) / x.firstN)}%` : ''}</td><td className="px-3 py-1.5">{x.unsure || ''}</td>
                    <td className="px-3 py-1.5 text-rose-800">{x.wrong.map((w) => `${w.v.slice(0, 26)}（${w.n}）`).join('；')}</td>
                    <td className="px-3 py-1.5 text-sky-800">{(x.opens ?? []).map((w) => `${w.v.slice(0, 20)}（${w.n}）`).join('；')}</td></tr>
                ))}</tbody></table>
            </div>
          ))}
        </div>
      )}

      {tab === 'gloss' && (
        <div className="card mt-4 overflow-x-auto p-0">
          <div className="px-4 py-2 text-sm text-ink2">“看意思”：点开看了这个字词的意思；“看句中”：又展开看了它在这句话里怎么理解。只看意思的多，说明卡在字词；看句中的多，说明字认得、整句没读通。（人数）</div>
          <table className="w-full text-sm"><thead className="bg-[#F3ECDC] text-left"><tr>{['哪一回', '字词', '看意思', '看句中', '展开的比例'].map((h) => <th key={h} className="px-3 py-2 font-black">{h}</th>)}</tr></thead>
            <tbody>{(st.glosses ?? []).map((g, i) => <tr key={i} className="border-t border-[#EFE6D2]"><td className="px-3 py-1.5">{g.play}</td><td className="kai px-3 py-1.5 text-lg">{g.w}</td><td className="px-3 py-1.5 font-bold">{g.n1}</td><td className="px-3 py-1.5 font-bold text-sky-800">{g.n2}</td><td className="px-3 py-1.5">{g.n1 ? `${Math.round((g.n2 / g.n1) * 100)}%` : ''}</td></tr>)}</tbody></table>
          {!(st.glosses ?? []).length && <div className="px-4 py-3 text-ink2">还没有学生点字。</div>}
        </div>
      )}

      {tab === 'asks' && (
        <div className="card mt-4 overflow-x-auto p-0">
          <table className="w-full text-sm"><thead className="bg-[#F3ECDC] text-left"><tr>{['学生', '哪一回', '问题', 'AI 的回答', '学生觉得', '时间'].map((h) => <th key={h} className="px-3 py-2 font-black">{h}</th>)}</tr></thead>
            <tbody>{(st.asks ?? []).map((a, i) => <tr key={i} className="border-t border-[#EFE6D2] align-top"><td className="whitespace-nowrap px-3 py-1.5 font-bold">{a.name}</td><td className="px-3 py-1.5">{a.play}</td><td className="px-3 py-1.5 font-bold">{a.q}</td><td className="px-3 py-1.5 text-ink2">{a.a}</td><td className={`whitespace-nowrap px-3 py-1.5 font-bold ${a.fb === '清楚了' ? 'text-emerald-700' : a.fb ? 'text-rose-700' : ''}`}>{a.fb}</td><td className="whitespace-nowrap px-3 py-1.5 text-ink2">{ago(a.t, st.now)}</td></tr>)}</tbody></table>
          {!(st.asks ?? []).length && <div className="px-4 py-3 text-ink2">还没有学生提问。</div>}
        </div>
      )}

      {tab === 'good' && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {st.good.length === 0 && <div className="text-ink2">还没有 AI 评为满分的句子。</div>}
          {st.good.map((g, i) => (
            <button key={i} onClick={() => setBig(g.text)} className="card p-4 text-left hover:shadow-lg">
              <div className="text-xs text-ink2">{g.name} · {g.item} · {ago(g.t, st.now)}</div>
              <div className="mt-1 text-lg font-bold">{g.text}</div>
              {g.out && 'praise' in g.out && !!g.out.praise && <div className="mt-1 text-sm text-emerald-800">👍 {g.out.praise}</div>}
              {g.out && 'comment' in g.out && <div className="mt-1 text-sm text-emerald-800">{g.out.comment}</div>}
            </button>
          ))}
        </div>
      )}

      {tab === 'ai' && (
        <div className="card mt-4 space-y-3 p-6">
          <div>状态：{st.ai.ready ? st.ai.model : '平台 AI 暂不可用'}；正在处理 {st.ai.active}；已调用 {st.ai.used} 次；每人每节课 {st.ai.quota} 次</div>
          <div className="flex items-center gap-3"><span>AI 评分：</span><button onClick={() => setCfg({ ai: !c.ai })} className={`rounded-full px-4 py-1.5 font-black ${c.ai ? 'bg-emerald-600 text-white' : 'bg-white chunky'}`}>{c.ai ? '开着' : '关着'}</button></div>
        </div>
      )}

      {tab === 'set' && (
        <div className="card mt-4 space-y-4 p-6">
          <div className="flex items-center gap-2"><span className="font-black">“请看大屏幕”时显示的话：</span><input defaultValue={c.message} onBlur={(e) => setCfg({ message: e.target.value })} className="w-[460px] rounded-xl border-2 border-[#E6DCC6] px-3 py-2" /></div>
          <div className="flex gap-3"><ToolDownloadButton url={base+'teacher/export.csv'} fileName={'tuiqiao.csv'}>导出成绩（CSV）</ToolDownloadButton><ToolDownloadButton url={base+'teacher/export.json'} fileName={'tuiqiao.json'}>导出全部记录（JSON）</ToolDownloadButton></div>
          <div><button className="rounded-full bg-rose-50 px-4 py-2 font-black text-rose-700" onClick={async () => { if (prompt('清空所有学生记录。输入 RESET 确认：') === 'RESET') { await api.teacher.reset(); } }}>清空所有学生记录</button></div>
        </div>
      )}
      <Modal open={!!big} onClose={() => setBig(null)} width={1100}><div className="px-6 py-10 text-center text-5xl font-bold leading-snug">{big}</div></Modal>
    </div>
  );
}
