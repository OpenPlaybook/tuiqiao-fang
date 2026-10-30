// 教师后台：学生（星星、加权分、三条线的能力）、题目（错得最多的选项）、好句子、AI、设置。
import { useEffect, useState } from 'react';
import { api, type TeacherState } from '../game/api';
import { STATIONS, TRACKS, LV_NAME } from '../shared/adapt';
import { STATION_IDS, type Lv } from '../shared/types';
import { Avatar, Btn, Modal } from '../components/ui';

const PIN_KEY = 'tq-teacher-pin';
const ago = (t: number, now: number) => { const s = Math.round((now - t) / 1000); return s < 60 ? '刚刚' : s < 3600 ? `${Math.round(s / 60)} 分钟前` : `${Math.round(s / 3600)} 小时前`; };
const lvText = (x: number) => (x ? `${x.toFixed(1)}` : '—');

export default function Teacher() {
  const [pin, setPin] = useState(() => { try { return localStorage.getItem(PIN_KEY) ?? ''; } catch { return ''; } });
  const [input, setInput] = useState('');
  const [st, setSt] = useState<TeacherState | null>(null);
  const [err, setErr] = useState('');
  const [tab, setTab] = useState<'players' | 'items' | 'good' | 'ai' | 'set'>('players');
  const [big, setBig] = useState<string | null>(null);
  const [keyIn, setKeyIn] = useState('');
  const load = async (p = pin) => { try { const s = await api.teacher.state(p); setSt(s); setErr(''); try { localStorage.setItem(PIN_KEY, p); } catch { /* */ } } catch (e) { setErr(String((e as Error).message)); if (String((e as Error).message).includes('口令')) setPin(''); } };
  useEffect(() => { if (!pin) return; load(); const t = setInterval(() => load(), 4000); return () => clearInterval(t); }, [pin]);
  if (!pin || !st) return (
    <div className="flex min-h-full items-center justify-center p-6"><div className="card w-[420px] p-8">
      <div className="kai text-3xl">推敲坊 · 教师后台</div>
      <input type="password" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setPin(input.trim())} placeholder="教师口令（data/teacher-pin.txt）" className="mt-5 w-full rounded-xl border-2 border-[#E6DCC6] px-4 py-2.5 text-lg outline-none" />
      {err && <div className="mt-2 text-rose-700">{err}</div>}
      <div className="mt-5"><Btn onClick={() => setPin(input.trim())}>进入</Btn></div>
    </div></div>
  );
  const c = st.config;
  const setCfg = async (b: Partial<typeof c>) => { await api.teacher.setConfig(pin, b); load(); };
  const online = st.players.filter((p) => st.now - p.lastSeen < 20000).length;
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="kai text-3xl">推敲坊 · 教师后台</div>
        <span className="text-ink2">{st.players.length} 人，在线 {online} 人</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => setCfg({ attention: !c.attention })} className={`rounded-full px-4 py-2 font-black ${c.attention ? 'bg-rose-600 text-white' : 'bg-white chunky'}`}>{c.attention ? '取消“请看大屏幕”' : '请看大屏幕'}</button>
          {(['players', 'items', 'good', 'ai', 'set'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 font-black ${tab === t ? 'bg-[#2B2722] text-white' : 'bg-white chunky'}`}>{{ players: '学生', items: '题目', good: '好句子', ai: 'AI', set: '开放与设置' }[t]}</button>)}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-white/70 px-4 py-2">
        <span className="font-black">开放关卡：</span>
        {STATIONS.map((s) => <button key={s.id} onClick={() => setCfg({ open: { ...c.open, [s.id]: !c.open[s.id] } })} className={`rounded-full border-2 px-3 py-1 text-sm font-black ${c.open[s.id] ? 'text-white' : 'bg-white text-ink2'}`} style={c.open[s.id] ? { background: s.color, borderColor: s.color } : { borderColor: '#E6DCC6' }}>{s.emoji} {s.name}</button>)}
        <button onClick={() => setCfg({ open: Object.fromEntries(STATION_IDS.map((s) => [s, true])) as typeof c.open })} className="text-sm underline">全部开放</button>
      </div>

      {tab === 'players' && (
        <div className="card mt-4 overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-[#F3ECDC] text-left"><tr>{['', '姓名', '学校', '星星', '加权分', '妙笔', '完成', '变式练习（对/做）', '平均难度', ...TRACKS.map((t) => `能力·${t.name}`), '不确定', '词汇', ...STATIONS.map((s) => s.name), '现在在', '最近'].map((h, i) => <th key={i} className="whitespace-nowrap px-2.5 py-2 font-black">{h}</th>)}</tr></thead>
            <tbody>
              {st.players.map((p, i) => (
                <tr key={p.pid} className="border-t border-[#EFE6D2]">
                  <td className="px-2.5 py-1.5 text-ink2">{i + 1}</td>
                  <td className="whitespace-nowrap px-2.5 py-1.5 font-black"><Avatar i={p.avatar} size={26} /> {p.name}</td>
                  <td className="px-2.5 py-1.5">{p.sid}</td>
                  <td className="px-2.5 py-1.5 font-black text-amber-700">{p.stars}</td>
                  <td className="px-2.5 py-1.5 text-base font-black">{p.weighted}</td>
                  <td className="px-2.5 py-1.5">{p.bonus || ''}</td>
                  <td className="px-2.5 py-1.5">{p.done}</td>
                  <td className="px-2.5 py-1.5">{p.prac?.n ? `${p.prac.ok}/${p.prac.n}` : ''}</td>
                  <td className="px-2.5 py-1.5">{lvText(p.avgLv)}</td>
                  {TRACKS.map((t) => <td key={t.id} className="px-2.5 py-1.5"><span className="inline-block h-2 rounded-full bg-amber-400 align-middle" style={{ width: (p.theta[t.id] - 1) * 18 + 4 }} /> {p.theta[t.id].toFixed(1)}</td>)}
                  <td className="px-2.5 py-1.5">{p.unsure || ''}</td>
                  <td className="px-2.5 py-1.5">{p.vocab ?? ''}</td>
                  {STATIONS.map((s) => <td key={s.id} className="px-2.5 py-1.5 text-center">{p.stations[s.id].done ? `${p.stations[s.id].done}/${s.n}·★${p.stations[s.id].stars}` : ''}</td>)}
                  <td className="whitespace-nowrap px-2.5 py-1.5">{p.current}</td>
                  <td className="whitespace-nowrap px-2.5 py-1.5 text-ink2">{ago(p.lastSeen, st.now)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 text-xs text-ink2">加权分 = 每题星星 × 难度系数（★1、★★1.5、★★★2、👑2.6）+ 妙笔分。能力值 1—4 对应 ★—👑，由做题表现估计（第一次就对、用没用“不确定”、第几次答对）。</div>
        </div>
      )}

      {tab === 'items' && (
        <div className="mt-4 space-y-4">
          {STATIONS.map((s) => (
            <div key={s.id} className="card p-0">
              <div className="px-4 py-2 text-lg font-black" style={{ color: s.color }}>{s.emoji} {s.name}</div>
              <table className="w-full text-sm"><thead className="bg-[#F3ECDC] text-left"><tr>{['题', '难度', '做过', '完成', '平均星', '第一次就对', '不确定', '选得最多的错答', '学生点开的“不明白”'].map((h) => <th key={h} className="px-3 py-1.5 font-black">{h}</th>)}</tr></thead>
                <tbody>{st.items.filter((x) => x.st === s.id).map((x) => (
                  <tr key={x.id} className="border-t border-[#EFE6D2]"><td className="px-3 py-1.5 font-bold">{x.label}</td><td className="px-3 py-1.5">{LV_NAME[x.lv as Lv]}</td><td className="px-3 py-1.5">{x.n || ''}</td><td className="px-3 py-1.5">{x.done || ''}</td><td className="px-3 py-1.5">{x.done ? x.avgStars.toFixed(1) : ''}</td>
                    <td className="px-3 py-1.5">{x.firstN ? `${Math.round((100 * x.firstOk) / x.firstN)}%` : ''}</td><td className="px-3 py-1.5">{x.unsure || ''}</td>
                    <td className="px-3 py-1.5 text-rose-800">{x.wrong.map((w) => `${w.v.slice(0, 26)}（${w.n}）`).join('；')}</td>
                    <td className="px-3 py-1.5 text-sky-800">{(x.opens ?? []).map((w) => `${w.v.slice(0, 20)}（${w.n}）`).join('；')}</td></tr>
                ))}</tbody></table>
            </div>
          ))}
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
          <div>状态：{st.ai.mock ? '模拟模式' : st.ai.ready ? `已接好（${st.ai.model}，Key 尾号 ${st.ai.keyTail}）` : '还没有 Key'}；同时在评 {st.ai.active}；已评 {st.ai.used} 次；每人每节课 {st.ai.quota} 次</div>
          <div className="flex gap-2"><input type="password" value={keyIn} onChange={(e) => setKeyIn(e.target.value)} placeholder="粘贴 DeepSeek API Key" className="w-[420px] rounded-xl border-2 border-[#E6DCC6] px-3 py-2" /><Btn size="sm" onClick={async () => { await api.teacher.aiSettings(pin, { key: keyIn }); setKeyIn(''); load(); }}>保存</Btn><Btn size="sm" color="#2F6E5B" onClick={async () => { await api.teacher.aiTest(pin); load(); }}>测试连接</Btn></div>
          {st.ai.lastTest && <div className={st.ai.lastTest.ok ? 'text-emerald-700' : 'text-rose-700'}>{st.ai.lastTest.msg}</div>}
          <div className="flex items-center gap-3"><span>AI 评分：</span><button onClick={() => setCfg({ ai: !c.ai })} className={`rounded-full px-4 py-1.5 font-black ${c.ai ? 'bg-emerald-600 text-white' : 'bg-white chunky'}`}>{c.ai ? '开着' : '关着'}</button></div>
        </div>
      )}

      {tab === 'set' && (
        <div className="card mt-4 space-y-4 p-6">
          <div className="flex items-center gap-2"><span className="font-black">“请看大屏幕”时显示的话：</span><input defaultValue={c.message} onBlur={(e) => setCfg({ message: e.target.value })} className="w-[460px] rounded-xl border-2 border-[#E6DCC6] px-3 py-2" /></div>
          <div className="flex gap-3"><a className="rounded-full bg-white px-4 py-2 font-black chunky" href={`api/teacher/export.csv?pin=${encodeURIComponent(pin)}`}>导出成绩（CSV）</a><a className="rounded-full bg-white px-4 py-2 font-black chunky" href={`api/teacher/export.json?pin=${encodeURIComponent(pin)}`}>导出全部记录（JSON）</a></div>
          <div><button className="rounded-full bg-rose-50 px-4 py-2 font-black text-rose-700" onClick={async () => { if (prompt('清空所有学生记录（会先备份）。输入 RESET 确认：') === 'RESET') { await api.teacher.reset(pin); load(); } }}>清空所有学生记录</button></div>
          <button className="text-sm underline" onClick={() => { try { localStorage.removeItem(PIN_KEY); } catch { /* */ } setPin(''); }}>退出后台</button>
        </div>
      )}
      <Modal open={!!big} onClose={() => setBig(null)} width={1100}><div className="px-6 py-10 text-center text-5xl font-bold leading-snug">{big}</div></Modal>
    </div>
  );
}
