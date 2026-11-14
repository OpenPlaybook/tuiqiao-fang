import assert from 'node:assert/strict';
import test from 'node:test';
import {randomUUID} from 'node:crypto';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {withStoreWriteLock} from '@openplaybook/json-store';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {handleApplicationApi} from './request';
import {mergeProgress} from '../src/shared/sync';
import {ITEMS} from '../src/shared/bank';
import {PLAY_BY_ID} from '../src/shared/play';
import type {Player} from '../src/shared/types';
import type {EnsembleApiRequest} from '../sdk/types/src/ensemble';
async function fixture(t:{after(f:()=>Promise<void>):void}){
 const root=await mkdtemp(join(tmpdir(),'tuiqiao-test-'));t.after(()=>rm(root,{recursive:true,force:true}));
 const request=(route:string,method='GET',data?:unknown,user:string|null=null,headers:Record<string,string>={},trusted=true,runtimeServices:unknown={})=>handleApplicationApi({context:{opusRootDir:root,opusId:'l_test',index:{authorId:'owner'},viewer:user?{userId:user}:null},request:new Request('http://localhost/api/'+route,{method,headers,...(data===undefined?{}:{body:JSON.stringify(data)})}),pathSegments:['api',...route.split('?')[0].split('/')],security:{isTrustedOrigin:trusted},runtimeServices} as EnsembleApiRequest);
 const enter=async(name='学生',sid='测试学校')=>{
  const input={name,sid,avatar:0};
  const found=await(await request('join','POST',input)).json();
  if(found.player)return found.player as Player;
  const match=found.matches.find((item:{sid:string})=>item.sid===sid);
  return (await(await request('join','POST',{...input,roundId:found.roundId,choice:match?.pid??'new'})).json()).player as Player;
 };
 return {root,request,enter};
}
function answer(p:Player):Player{const it=ITEMS[0],play=Object.keys(PLAY_BY_ID)[0];return {...p,recs:{[it.id]:{id:it.id,st:it.st,status:'done',data:{scores:[1]},stars:3,perf:1,unsure:0,tries:{first:1},bonus:1,log:[{id:randomUUID(),q:'first',v:'回答',ok:true,t:Date.now()}],t0:Date.now(),t1:Date.now()},[play+'-log']:{id:play+'-log',st:'p',prac:true,status:'doing',stars:0,perf:0,unsure:0,tries:{},bonus:0,log:[{id:randomUUID(),q:'gloss',v:'之',ok:null,t:Date.now()}],t0:Date.now()}}};}
test('teacher identity, Origin and exact methods are enforced',async t=>{const {request}=await fixture(t);for(const user of [null,'other','owner']){assert.equal((await(await request('context','GET',undefined,user)).json()).isTeacher,user==='owner');for(const route of ['teacher/state','teacher/export.csv','teacher/export.json'])assert.equal((await request(route,'GET',undefined,user)).status,user==='owner'?200:403);}assert.equal((await request('join','POST',{name:'a',sid:'b',avatar:0},null,{},false)).status,403);assert.equal((await request('teacher/reset','GET',undefined,'owner')).status,405);});
test('progress, story glossary, statistics and exports survive restore and remain lesson-isolated',async t=>{const a=await fixture(t),b=await fixture(t);const p=answer(await a.enter());const saved=await(await a.request('sync','POST',{player:p})).json();assert.equal(saved.player.revision,1);assert.deepEqual((await a.enter()).recs,saved.player.recs);assert.notEqual((await b.enter()).pid,p.pid);assert.notEqual((await a.enter('学生','另一学校')).pid,p.pid);const state=await(await a.request('teacher/state','GET',undefined,'owner')).json();assert.equal(state.players.find((x:{pid:string})=>x.pid===p.pid).done,1);assert.equal(state.glosses[0].n1,1);const exported=await(await a.request('teacher/export.json','GET',undefined,'owner')).json();assert.equal('token' in exported[p.pid],false);assert.ok((await(await a.request('teacher/export.csv','GET',undefined,'owner')).text()).includes('学生'));assert.equal((await a.request('sync','POST',{player:{...saved.player,token:'wrong-participant-token'}})).status,403);});
test('concurrent snapshots conflict, stable events merge once, clearing and deletion reject delayed writes',async t=>{const {request,enter}=await fixture(t);const p=answer(await enter());const results=await Promise.all([request('sync','POST',{player:p}),request('sync','POST',{player:p})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);const remote=await enter();const local=structuredClone(p);local.recs[ITEMS[0].id].log.push({id:randomUUID(),q:'second',v:'另一个回答',ok:true,t:Date.now()});const merged=mergeProgress(remote,local,p);assert.equal(merged.recs[ITEMS[0].id].log.length,2);assert.equal(mergeProgress(merged,local).recs[ITEMS[0].id].log.length,2);assert.equal((await request('sync','POST',{player:merged})).status,200);await request('teacher/delete','POST',{pid:p.pid},'owner');assert.equal((await request('sync','POST',{player:merged})).status,410);const fresh=await enter();await request('teacher/reset','POST',{confirm:'RESET'},'owner');assert.equal((await request('sync','POST',{player:fresh})).status,410);assert.notEqual((await enter()).roundId,fresh.roundId);});
test('AI validates classroom/participant, persists completed output, and does not charge failed calls',async t=>{const {request,enter}=await fixture(t);const original=process.env.RDFZ_MODEL_ACCESS;process.env.RDFZ_MODEL_ACCESS='1';t.after(async()=>{if(original===undefined)delete process.env.RDFZ_MODEL_ACCESS;else process.env.RDFZ_MODEL_ACCESS=original;});const p=await enter();const item=ITEMS.find(it=>it.steps.some(s=>s.kind==='write'))!;const step=item.steps.find(s=>s.kind==='write')!;const data={pid:p.pid,token:p.token,roundId:p.roundId,item:item.id,step:step.key,text:'夕阳把河面染成了金色。'};const runtimeServices={chatCompletion:async()=>({content:JSON.stringify({verdict:'perfect',errors:[],natural:'The trophy has disappeared.',comment:'表达清楚'})})};assert.equal((await request('ai/judge','POST',data,null,{},true,runtimeServices)).status,403);await request('teacher/config','POST',{open:{[item.st]:true}},'owner');const result=await request('ai/judge','POST',data,null,{},true,runtimeServices);assert.equal(result.status,200);assert.equal((await result.json()).left,59);const failed=await request('ai/judge','POST',data,null,{},true,{chatCompletion:async()=>({content:'incomplete'})});assert.equal(failed.status,502);const state=await(await request('teacher/state','GET',undefined,'owner')).json();assert.equal(state.ai.used,1);assert.equal(state.ai.active,0);assert.equal(state.good.length,1);assert.equal((await request('ai/judge','POST',{...data,token:'wrong-participant-token'},null,{},true,runtimeServices)).status,403);});
test('real sync rechecks reward from evidence and resists late completed snapshots',async t=>{
 const {request,enter}=await fixture(t);const p=await enter();const it=ITEMS.find(i=>i.id==='p1-yifan3')!;
 p.recs[it.id]={id:it.id,st:it.st,status:'done',stars:3,perf:1,unsure:0,tries:{},bonus:0,log:[],t0:1,t1:2,data:{scores:[1]}};
 let response=await request('sync','POST',{player:p});assert.equal(response.status,200);const saved=(await response.json()).player as Player;assert.equal(saved.recs[it.id].stars,5);
 const late=structuredClone(saved);late.recs[it.id].stars=3;late.recs[it.id].data!.scores=[.34];response=await request('sync','POST',{player:late});assert.equal(response.status,200);assert.equal((await response.json()).player.recs[it.id].stars,5);
 const st=await(await request('teacher/state','GET',undefined,'owner')).json();assert.equal(st.players[0].stars,5);assert.equal('weighted' in st.players[0],false);assert.equal(st.items.find((x:{id:string})=>x.id===it.id).maxStars,5);
 const csv=await(await request('teacher/export.csv','GET',undefined,'owner')).text();assert.equal(csv.includes('加权分'),false);
});

test('blocking one student file does not delay classmates or rewrite their records', async t => {
 const {root,request,enter}=await fixture(t);
 const [first,second,third]=await Promise.all([
  enter('同学甲'),enter('同学乙'),enter('同学丙'),
 ]);
 const base=join(root,'tools','tuiqiao-fang','progress');
 const studentDir=(p:Player)=>join(base,'rounds',p.roundId,p.pid);
 const studentFile=(p:Player)=>join(studentDir(p),'record.json');
 const firstBefore=await readFile(studentFile(first),'utf8');
 const classroomBefore=await readFile(join(base,'classroom.json'),'utf8');
 let delayed!:Promise<Response>;
 await withStoreWriteLock(studentDir(first),async()=>{
  delayed=request('sync','POST',{player:answer(first)});
  const results=await Promise.all([
   request('sync','POST',{player:answer(second)}),
   request('sync','POST',{player:answer(third)}),
   request('teacher/state','GET',undefined,'owner'),
  ]);
  assert.deepEqual(results.map(response=>response.status),[200,200,200]);
  assert.equal(await readFile(studentFile(first),'utf8'),firstBefore);
  assert.equal(await readFile(join(base,'classroom.json'),'utf8'),classroomBefore);
 });
 assert.equal((await delayed).status,200);
 for (const player of [first,second,third]) {
  const restored=await request(`player?roundId=${player.roundId}&pid=${player.pid}`,'GET',undefined,null,{'x-participant':player.token});
  assert.equal(restored.status,200);
  assert.equal((await restored.json()).player.revision,1);
 }
});

test('recovery requires confirmation and matches the full trimmed name across school spellings', async t => {
 const {request,enter}=await fixture(t);
 const original=answer(await enter('王小明','人大附中'));
 const saved=(await(await request('sync','POST',{player:original})).json()).player as Player;
 const other=await enter('王小明','另一所学校');
 const input={name:'  王小明  ',sid:'人大附',avatar:4};
 for(const school of [input.sid,original.sid]){
  const queried=await(await request('join','POST',{...input,sid:school})).json();
  assert.deepEqual(new Set(queried.matches.map((match:{pid:string})=>match.pid)),new Set([original.pid,other.pid]));
  assert.equal('player' in queried,false);
  assert.equal(JSON.stringify(queried).includes(original.token),false);
 }
 const picked=await(await request('join','POST',{...input,choice:original.pid,roundId:original.roundId})).json();
 assert.equal(picked.player.token,original.token);
 assert.equal(picked.player.sid,original.sid);
 assert.equal(picked.player.revision,saved.revision);
 assert.deepEqual(picked.player.recs,saved.recs);
 const misspelled=await request('join','POST',{...input,name:'王晓明',choice:original.pid,roundId:original.roundId});
 assert.equal(misspelled.status,410);
 const fresh=await(await request('join','POST',{...input,name:'王晓明'})).json();
 assert.notEqual(fresh.player.pid,original.pid);
 assert.deepEqual(fresh.player.recs,{});
});
