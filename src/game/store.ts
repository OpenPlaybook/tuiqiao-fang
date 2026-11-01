import {DEMO} from './demo';
import { useSyncExternalStore } from 'react';
import { RequestError } from '@/src/shared/http';
import {STATION_IDS,type Player,type GameConfig,type Item,type LogEntry,type Rec,type StationId} from '../shared/types';
import {newPlayer} from '../shared/adapt';
import { api,ApiError,lessonId,flow,setParticipant } from './api';
import { mergeProgress } from '../shared/sync';
import { playerSchema,configSchema } from '../../server/schema';


// ---------------- 小型全局状态 ----------------
interface State {
  player: Player | null;
  config: GameConfig;
}
const DEFAULT_CONFIG:GameConfig={open:{zh:false,en:false},attention:false,message:'',ai:true};
const LS_KEY = 'rdfz_tuiqiao_'  + lessonId;
type Cache = {player:Player;confirmed?:Player;config:GameConfig;roundId?:string;pendingJoin:boolean;dirty:boolean};
function load():Cache|null {
 try {const raw=localStorage.getItem(LS_KEY);if(!raw)return null;const c=JSON.parse(raw);
  const player=playerSchema.parse(c.player),confirmed=c.confirmed?playerSchema.parse(c.confirmed):undefined;
  return {player,confirmed,config:configSchema.passthrough().parse(c.config),roundId:typeof c.roundId==='string'?c.roundId:undefined,pendingJoin:c.pendingJoin===true,dirty:c.dirty===true};
 }catch{return null;}
}
const cached=DEMO?null:load();
let confirmed=cached?.confirmed,roundId=cached?.roundId,pendingJoin=cached?.pendingJoin??false;
let state:State=DEMO?{player:newPlayer('00000000-0000-4000-8000-000000000001','demo-local-preview-token','访客','演示版',3,'00000000-0000-4000-8000-000000000002'),config:{...DEFAULT_CONFIG,open:Object.fromEntries(STATION_IDS.map(k=>[k,true]))}}:{player:cached?.player??null,config:cached?.config??DEFAULT_CONFIG};
if(cached?.roundId)flow.confirmChanges({values:[{path:'tuiqiao.classroom',data:{config:cached.config,roundId:cached.roundId},complete:true}],removed:[],revived:[],invalidated:[]});
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const set = (patch: Partial<State>) => { state = { ...state, ...patch }; emit(); };
export const useGame = <T,>(sel: (s: State) => T): T => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => sel(state));
export const getState = () => state;

// 离线 30 秒以上：所有关卡自动开放，进度先存在本机，连上后再同步
export const OFFLINE_MS = 30000;
export const isOfflineTeaching=()=>{const read=flow.view('tuiqiao.classroom').getSnapshot();return !!read.networkRecoveringSince&&Date.now()-read.networkRecoveringSince>OFFLINE_MS;};
// 按两条大线开放（zh、en）；旧的设置里没有这两个键时，中文哪一回开着就算整个中文开着，英文同理
const trackOpen=(o:Record<string,boolean>,t:'zh'|'en')=>o[t]??Object.entries(o).some(([k,v])=>v&&new RegExp('^'+t+'\\d').test(k));
export const isOpen=(s:State,lv:StationId)=>trackOpen(s.config.open,/^en\d/.test(lv)?'en':'zh')||!!s.config.open[lv]||isOfflineTeaching();

// ---------------- 飞星星、提示条 ----------------
type Fly = { x: number; y: number; n: number; id: number };
type Toast = { id: number; emoji: string; title: string; text?: string };
const flySubs = new Set<(f: Fly) => void>();
const toastSubs = new Set<(t: Toast) => void>();
let seq = 0;
export const onFly = (f: (f: Fly) => void) => { flySubs.add(f); return () => { flySubs.delete(f); }; };
export const onToast = (f: (t: Toast) => void) => { toastSubs.add(f); return () => { toastSubs.delete(f); }; };
export const fly = (x: number, y: number, n: number) => flySubs.forEach((f) => f({ x, y, n, id: ++seq }));
export const toast = (t: Omit<Toast, 'id'>) => toastSubs.forEach((f) => f({ ...t, id: ++seq }));

// ---------------- 持久化与同步 ----------------
setParticipant(pendingJoin?null:state.player);
let dirty=cached?.dirty??false;

let synchronizing:Promise<void>|null=null;
const same=(p:Player)=>state.player?.pid===p.pid&&state.player?.roundId===p.roundId;
const save=()=>{if(DEMO)return;setParticipant(pendingJoin?null:state.player);try{if(state.player)localStorage.setItem(LS_KEY,JSON.stringify({player:state.player,confirmed,config:state.config,roundId,pendingJoin,dirty}));else localStorage.removeItem(LS_KEY);}catch{}};
const schedule=()=>{if(DEMO)return;queueMicrotask(()=>void syncNow());};
const commit=(p:Player)=>{p.updatedAt=Date.now();dirty=true;set({player:{...p}});save();schedule();};
function invalidated(message:string){dirty=false;pendingJoin=false;confirmed=undefined;set({player:null});save();toast({emoji:'ℹ️',title:message});}
function accept(remote:Player,base?:Player){
 const local=state.player;if(!local||!same(remote))return;
 if(confirmed&&remote.revision<confirmed.revision)return;
 confirmed=remote;set({player:dirty?mergeProgress(remote,local,base):remote});save();
}
export const syncNow=():Promise<void>=>{if(DEMO)return Promise.resolve();
 if(synchronizing)return synchronizing;
 synchronizing=(async()=>{
  let p=state.player;if(!p||!dirty)return;
  try{
   if(pendingJoin){
    const joined=await api.join(p.name,p.sid,p.avatar,roundId);if(!same(p))return;
    const local=state.player!;roundId=joined.player.roundId;pendingJoin=false;confirmed=joined.player;
    set({player:mergeProgress(joined.player,{...local,pid:joined.player.pid,token:joined.player.token,roundId:joined.player.roundId})});save();p=state.player!;
   }
   const sent=p;
   const result=await api.sync(sent);if(!same(sent))return;
   const changed=state.player!==sent;
   dirty=changed;
   confirmed=result.player;
   set({player:changed?mergeProgress(result.player,state.player!,sent):result.player});save();
   if(dirty)schedule();
  }catch(e){
   if(!p||!same(p))return;
   if(e instanceof ApiError&&e.statusCode===410){invalidated(e.message);return;}
   if(e instanceof ApiError&&e.statusCode===409&&e.payload.player){accept(e.payload.player,confirmed);schedule();return;}
   dirty=true;save();
  }
 })().finally(()=>{synchronizing=null;});return synchronizing;
};
const mutate=(f:(p:Player)=>void)=>{
 const p=state.player;if(!p)return;
 const next:Player=structuredClone(p);f(next);commit(next);
};
export function applyClassroom(value:{config:GameConfig;roundId:string;player?:Player}){
 if(roundId&&roundId!==value.roundId&&state.player)invalidated('老师已清空课堂，请重新加入');
 roundId=value.roundId;set({config:value.config});save();
 if(value.player)accept(value.player,confirmed);
 if(dirty)void syncNow();
}
export function observeClassroom(){if(DEMO)return ()=>{};
 const view=flow.view<{config:GameConfig;roundId:string;player?:Player}>('tuiqiao.classroom');
 let previous:unknown;
 const update=()=>{const snapshot=view.getSnapshot();if(snapshot.data&&snapshot.data!==previous){previous=snapshot.data;applyClassroom(snapshot.data);}if(snapshot.issues.some(i=>i.status===410)&&state.player)invalidated('学生记录已删除，请重新加入');};
 const stop=view.subscribe(update);update();return stop;
}
export const setAiLeft=(n:number)=>set({config:{...state.config,aiLeft:n}});
// 姓名与学校恢复服务端进度；断网时保持原版的本地入社方式。
export const join=async(name:string,sid:string,avatar:number)=>{
 let player:Player;
 try{
  const result=await api.join(name,sid,avatar,roundId);player=result.player;roundId=player.roundId;confirmed=player;pendingJoin=false;dirty=false;
 }catch(e){
  if(!(e instanceof RequestError)||e.kind!=='network')throw e;
  player=newPlayer(crypto.randomUUID(),crypto.randomUUID(),name,sid,avatar,roundId??crypto.randomUUID());pendingJoin=true;dirty=true;confirmed=undefined;
 }
 set({player});save();if(dirty)void syncNow();
};
export const logout=()=>{dirty=false;pendingJoin=false;confirmed=undefined;set({player:null});save();};
window.addEventListener('storage',event=>{
 if(event.key!==LS_KEY||!state.player)return;
 const cache=load();if(!cache||cache.player.pid!==state.player.pid||cache.player.roundId!==state.player.roundId)return;
 if(cache.confirmed&&(!confirmed||cache.confirmed.revision>confirmed.revision))confirmed=cache.confirmed;
 const merged=mergeProgress(cache.player,state.player,confirmed);
 if(JSON.stringify(merged)!==JSON.stringify(state.player)){dirty=dirty||cache.dirty;set({player:merged});if(dirty)schedule();}
});

// ---------------- 题目进度 ----------------
// 变式练习的记录 st 记成 'p'，不算进章节的题数
const ensure = (p: Player, it: Item): Rec => (p.recs[it.id] ??= { id: it.id, st: it.st, status: 'doing', stars: 0, perf: 0, unsure: 0, tries: {}, bonus: 0, log: [], t0: Date.now() });
export const startItem = (it: Item) => { if (!state.player?.recs[it.id]) mutate((p) => { ensure(p, it); }); };
/** 记一笔“点开了什么”（哪里不明白、一家人、AI 举例）：老师在后台看全班卡在哪 */
export const logOpen = (it: Item, what: string) => mutate((p) => { ensure(p, it).log.push({ id:crypto.randomUUID(), q: 'open', v: what.slice(0, 80), ok: null, t: Date.now() }); });
export const logAnswer = (it: Item, e: Omit<LogEntry, 'id' | 't'>, tries?: [string, number]) => mutate((p) => {
  const r = ensure(p, it);
  r.log.push({ ...e, id:crypto.randomUUID(), v: e.v.slice(0, 600), t: Date.now() });
  if (tries) r.tries[tries[0]] = tries[1];
});
export const markUnsure = (it: Item) => mutate((p) => { ensure(p, it).unsure++; });
export const setData = (it: Item, data: Record<string, unknown>) => mutate((p) => { const r = ensure(p, it); r.data = { ...(r.data ?? {}), ...data }; });
export const finishItem = (it: Item, stars: number, perf: number) => mutate((p) => { const r = ensure(p, it); if (r.status === 'done') return; r.status = 'done'; r.stars = stars; r.perf = perf; r.t1 = Date.now(); });
export const addBonus = (it: Item, n: number) => mutate((p) => { const r = ensure(p, it); r.bonus = Math.max(r.bonus, n); });
/** 播放式故事里的记录（点字、提问）：记在这一回的“记录”条目上 */
export const logPlay = (playId: string, q: 'gloss' | 'gloss2' | 'more' | 'ask' | 'askok' | 'askfb', v: string) => mutate((p) => {
  const r = (p.recs[`${playId}-log`] ??= { id: `${playId}-log`, st: 'p', prac: true, status: 'doing', stars: 0, perf: 0, unsure: 0, tries: {}, bonus: 0, log: [], t0: Date.now() });
  r.log.push({ id:crypto.randomUUID(), q, v: v.slice(0, 300), ok: null, t: Date.now() });
});
/** 拓展做完了：记在这道题的 data.ext 里 */
export const setExtDone = (it: Item, extId: string, score: number) => mutate((p) => { const r = ensure(p, it); r.data = { ...(r.data ?? {}), ext: { ...((r.data?.ext as Record<string, number>) ?? {}), [extId]: score } }; });
