// 学生端页面：登录、我的成绩。
import { useState } from 'react';
import { motion } from 'motion/react';
import { STATIONS, stationDone, stationStars, starsOf, maxStars } from '../shared/adapt';
import { Art, Avatar, AVATARS, Btn, Rich, isEnter } from '../components/ui';
import { confirmPendingJoin, join, useGame, type Recovery } from '../game/store';
import { frameSvg } from '../film/Film';

export const go = (path: string) => { window.location.hash = path; };

// ---------------- 登录 ----------------
export function JoinPage() {
  const [name, setName] = useState('');
  const [sid, setSid] = useState('');
  const [av, setAv] = useState(() => Math.floor(Math.random() * AVATARS.length));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [recovery, setRecovery] = useState<Recovery>();
  const ok = name.trim().length > 0 && sid.trim().length > 0;
  const submit = async (choice?: string) => {
    if (!ok || busy) return;
    setBusy(true); setErr('');
    try {
      const input = recovery ? {...recovery.input, roundId:recovery.roundId, choice} : {name,sid,avatar:av};
      setRecovery(await join(input));
    } catch (e) { setErr(String((e as Error).message || e)); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card grid w-full max-w-[1000px] grid-cols-[400px_1fr] overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 h-full [&_svg]:h-full" dangerouslySetInnerHTML={{ __html: frameSvg('c.slips', 0.5, 2) }} />
          <div className="relative flex h-full flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-8 text-white">
            <div className="kai text-5xl tracking-widest">字里行间</div>
            <div className="mt-2 text-lg opacity-90">一个字、一个词，都是线索。</div>
            <div className="mt-3 text-sm opacity-75">《史记》· 逐鹿天下 · The Golden Panda</div>
          </div>
        </div>
        <div className="p-10">
          <div className="text-3xl font-black">欢迎来到字里行间</div>
          {recovery ? <RecoveryChoices recovery={recovery} busy={busy} onChoose={submit} onBack={() => {setRecovery(undefined);setErr('');}} /> : <>
          <label htmlFor="join-name" className="mt-7 block text-lg font-black">你的姓名</label>
          <input value={name} onChange={(e) => setName(e.target.value)} disabled={busy} id="join-name" maxLength={20} placeholder="例如：王小明" className="mt-2 w-full rounded-2xl border-2 border-[#E6DCC6] bg-white px-5 py-3 text-xl font-bold outline-none focus:border-amber-400" />
          <label htmlFor="join-school" className="mt-5 block text-lg font-black">你的学校</label>
          <input value={sid} onChange={(e) => setSid(e.target.value)} disabled={busy} id="join-school" maxLength={80} placeholder="例如：人大附中" onKeyDown={(e) => isEnter(e) && submit()} className="mt-2 w-full rounded-2xl border-2 border-[#E6DCC6] bg-white px-5 py-3 text-xl font-bold outline-none focus:border-amber-400" />
          <div className="mt-5 text-lg font-black">选一个头像</div>
          <div className="mt-3 flex flex-wrap gap-2.5">{AVATARS.map((_, i) => <button key={i} onClick={() => setAv(i)} className={`rounded-full ${i === av ? 'ring-4 ring-amber-400' : 'opacity-75'}`}><Avatar i={i} size={52} /></button>)}</div>
          <div className="mt-8"><Btn size="lg" color="#B8352A" shadow="#7E2219" disabled={!ok || busy} onClick={() => submit()}>{busy ? '正在查找……' : '继续 →'}</Btn></div>
          </>}
          {err && <div role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-2 font-bold text-rose-700">{err}</div>}
        </div>
      </motion.div>
    </div>
  );
}

function RecoveryChoices({recovery,busy,onChoose,onBack}:{
  recovery:Recovery;busy:boolean;onChoose:(choice:string)=>void;onBack?:()=>void;
}) {
  const canCreate = !recovery.matches.some(match => match.sid === recovery.input.sid);
  return <div className="mt-5 space-y-3">
    <h2 className="text-lg font-black">请选择你的记录</h2>
    {recovery.matches.map(match => (
      <div key={match.pid} className="flex flex-wrap items-center justify-between gap-3">
        <span>{recovery.input.name} · {match.sid}</span>
        <Btn disabled={busy} onClick={() => onChoose(match.pid)}>恢复进度</Btn>
      </div>
    ))}
    <div className="flex flex-wrap gap-3 pt-2">
      {onBack && <Btn disabled={busy} onClick={onBack}>返回修改</Btn>}
      {canCreate && <Btn disabled={busy} onClick={() => onChoose('new')}>创建新记录</Btn>}
    </div>
    {busy && <div role="status">正在进入……</div>}
  </div>;
}

export function PendingJoin({recovery}:{recovery:Recovery}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function choose(choice:string) {
    setBusy(true);setError('');
    try {await confirmPendingJoin(recovery,choice);}
    catch (error) {setError((error as Error).message);}
    finally {setBusy(false);}
  }
  return <div className="mx-auto max-w-xl p-8">
    <RecoveryChoices recovery={recovery} busy={busy} onChoose={choose}/>
    {error && <div role="alert" className="mt-4 text-rose-700">{error}</div>}
  </div>;
}

// ---------------- 我的成绩 ----------------
export function MePage() {
  const p = useGame((s) => s.player)!;
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <div className="card p-8">
        <div className="flex items-center gap-4"><Avatar i={p.avatar} size={64} /><div><div className="text-3xl font-black">{p.name}</div><div className="text-ink2">{p.sid}</div></div><div className="ml-auto text-right"><div className="text-4xl font-black text-amber-700">{starsOf(p)>0?'★':'☆'} {starsOf(p)}</div><div className="text-sm text-ink2">共 {maxStars(p)} 颗</div></div></div>
        <div className="mt-6 space-y-2">{STATIONS.map((x) => <div key={x.id} className="flex items-center gap-3 rounded-xl bg-[#FBF7EE] px-4 py-2.5"><span className="text-2xl">{x.emoji}</span><span className="font-black" style={{ color: x.color }}>{x.name}</span><span className="ml-auto text-sm text-ink2">{stationDone(p, x.id)} / {x.n} 题</span><span className="w-16 text-right font-black text-amber-700">★ {stationStars(p, x.id)}</span></div>)}</div>
        <div className="mt-6"><Btn onClick={() => go('/')}>回地图</Btn></div>
      </div>
    </div>
  );
}
export { Rich };
