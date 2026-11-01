import type {Player} from './types';
import {normalizeRewards} from './adapt';
export function mergeProgress(remote:Player,local:Player,base?:Player):Player{
 const recs={...remote.recs};
 for(const [id,b] of Object.entries(local.recs)){
  const a=recs[id];if(!a){recs[id]=b;continue;}
  const log=[...new Map([...a.log,...b.log].map(e=>[e.id,e])).values()].sort((x,y)=>x.t-y.t||x.id.localeCompare(y.id));
  const first=a.status==='done'&&b.status==='done'?((a.t1??Infinity)<=(b.t1??Infinity)?a:b):a.status==='done'?a:b;
  const data={...a.data};for(const [k,v] of Object.entries(b.data??{}))if(JSON.stringify(v)!==JSON.stringify(base?.recs[id]?.data?.[k]))data[k]=k==='ext'?{...(a.data?.ext as object),...(v as object)}:v;
  if(a.data?.ans||b.data?.ans)data.ans={...(b.data?.ans as object),...(a.data?.ans as object)};
  if(a.data?.ext||b.data?.ext)data.ext={...(b.data?.ext as object),...(a.data?.ext as object)};
  if(first.status==='done'&&first.data?.scores)data.scores=first.data.scores;
  recs[id]={...first,log,unsure:Math.max(a.unsure,b.unsure),bonus:Math.max(a.bonus,b.bonus),tries:Object.fromEntries([...new Set([...Object.keys(a.tries),...Object.keys(b.tries)])].map(k=>[k,Math.max(a.tries[k]??0,b.tries[k]??0)])),data,t0:Math.min(a.t0,b.t0)};
 }
 return normalizeRewards({...remote,recs,updatedAt:Math.max(remote.updatedAt,local.updatedAt)});
}
