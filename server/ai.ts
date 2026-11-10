import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import type {EnsembleApiRequest} from '@/src/ensemble';
import {runOpusTask} from '@/src/ensemble/opus-lifecycle';
import {ToolError} from '../common/store';
import {readToolBody} from '../common/request';
import {withClassroom} from './store';
import {authenticate} from './server';
import type {Classroom} from './schema';
import type {WriteSub} from '../src/shared/types';
import {ITEM_BY_ID} from '../src/shared/bank';
import {PLAY_BY_ID,plainText} from '../src/shared/play';
import {openMode,gateOf} from '../src/shared/adapt';
import {askSystem,askUser,cleanAsk,EN_SYSTEM,ZH_SYSTEM,judgeUser,cleanZh,cleanEn,type AskOut} from '../src/shared/ai';
export const aiReady=()=>process.env.RDFZ_MODEL_ACCESS==='1';
export const aiLeft=(s:Classroom,pid:string)=>Math.max(0,s.ai.quota+(s.ai.extra[pid]??0)-(s.ai.usage[pid]??0));
export const aiStatus=(s:Classroom)=>({ready:aiReady(),mock:false,model:'平台 DeepSeek',quota:s.ai.quota,active:Object.values(s.ai.leases).filter(l=>l.expires>Date.now()).length,used:Object.values(s.ai.usage).reduce((a,b)=>a+b,0)});
export function participantAiLeft(s:Classroom,r:Request){const q=new URL(r.url).searchParams;return q.has('pid')?aiLeft(s,authenticate(s,q.get('pid'),r.headers.get('x-participant')).pid):undefined;}
const json=(v:unknown)=>Response.json(v,{headers:{'Cache-Control':'private, no-store'}});
const body=z.object({pid:z.string().uuid(),token:z.string().min(16).max(100),roundId:z.string().uuid(),item:z.string().max(100),step:z.string().max(100).optional(),text:z.string().trim().max(400).optional(),play:z.string().max(100).optional(),line:z.string().max(1000).optional(),before:z.array(z.string().max(1000)).max(20).optional(),q:z.string().trim().max(120).optional()}).strict();
export async function handleAi(input:EnsembleApiRequest,route:string,payload:unknown){
 if(input.request.method!=='POST')throw new ToolError(405,'请求方式不支持');
 if(!['ai/judge','ai/ask'].includes(route))throw new ToolError(404,'接口不存在');
 const b=body.parse(payload),it=ITEM_BY_ID[b.item],play=PLAY_BY_ID[b.play??''];
 const [xid,xkey]=(b.step??'').includes(':')?(b.step??'').split(':'):['',b.step];
 const steps=xid?it?.ext?.find(e=>e.id===xid)?.steps:it?.steps;
 const write=steps?.find(s=>s.kind==='write'&&s.key===xkey) as WriteSub|undefined;
 if(route==='ai/judge'&&(!it||!write||!b.text))throw new ToolError(400,'找不到写作题或作答为空');
 if(route==='ai/ask'&&(!play||!b.q||(b.item&&!play.lines.some(l=>l.task?.includes(b.item)))))throw new ToolError(400,'问题或当前故事无效');
 if(!aiReady())throw new ToolError(503,'平台 DeepSeek 暂不可用');
 const lease=randomUUID(),start=Date.now();
 const p=await withClassroom(input.context.opusRootDir,s=>{
  if(s.roundId!==b.roundId)throw new ToolError(410,'课堂已清空，请重新加入');
  const p=authenticate(s,b.pid,b.token);
  if(!s.config.ai)throw new ToolError(403,'老师暂时关闭了 AI');
  // 按关卡开放（中文 / 英文）：关卡关着、也没有单独开这一回（旧设置）才拦
  if(it&&openMode(s.config.open,gateOf(it.st))==='closed'&&!s.config.open[it.st])throw new ToolError(403,'老师尚未开放这一关');
  if(play&&openMode(s.config.open,gateOf(play.id))==='closed'&&!s.config.open[play.id])throw new ToolError(403,'老师尚未开放这一关');
  s.ai.leases=Object.fromEntries(Object.entries(s.ai.leases).filter(([,l])=>l.expires>Date.now()));
  if(Object.values(s.ai.leases).some(l=>l.pid===b.pid))throw new ToolError(429,'上一个问题还在回答中');
  if(Object.keys(s.ai.leases).length>=30)throw new ToolError(429,'同时提问人数较多，请稍后再试');
  if(aiLeft(s,b.pid)<=0)throw new ToolError(429,'这节课的 AI 次数已用完');
  const day=new Date().toISOString().slice(0,10);if(s.ai.day!==day){s.ai.day=day;s.ai.calls=0;}
  if(s.ai.calls>=3000)throw new ToolError(429,'本课堂今日 AI 调用已达上限');
  s.ai.calls++;s.ai.leases[lease]={pid:b.pid,expires:Date.now()+120000};return {value:p,changed:true};
 });
 const finish=async(out:Record<string,unknown>|null,ok:boolean)=>withClassroom(input.context.opusRootDir,s=>{
  if(s.roundId!==b.roundId||!s.players[b.pid]||!s.ai.leases[lease]){if(ok)throw new ToolError(410,'课堂或学生记录已删除');return {value:0,changed:false};}
  delete s.ai.leases[lease];if(ok)s.ai.usage[b.pid]=(s.ai.usage[b.pid]??0)+1;
  s.ai.logs.push({t:Date.now(),pid:b.pid,name:p.name,item:b.item,step:route==='ai/ask'?b.play!:b.step!,role:route==='ai/ask'?'ask':write!.role,text:b.text??b.q??'',out,ms:Date.now()-start,ok});s.ai.logs=s.ai.logs.slice(-3000);
  return {value:aiLeft(s,b.pid),changed:true};
 });
 try{return json(await runOpusTask(input.context.opusRootDir,async lifecycle=>{
  const signal=AbortSignal.any([lifecycle,input.request.signal,AbortSignal.timeout(90000)]);
  const complete=async(system:string,user:string)=>{
   const result=await input.runtimeServices.chatCompletion({provider:'deepseek',messages:[{role:'system',content:system},{role:'user',content:user}],thinking:'disabled',jsonObject:true,temperature:0.2,maxTokens:1500,timeoutMs:90000,signal});
   signal.throwIfAborted();try{return JSON.parse(result.content.replace(/^```(?:json)?\s*|\s*```$/g,'')) as Record<string,unknown>;}catch{throw new ToolError(502,'AI 返回内容不完整，请主动重试');}
  };
  if(route==='ai/judge'){
   const raw=await complete(write!.role==='en'?EN_SYSTEM:ZH_SYSTEM[write!.role],judgeUser(it,write!,b.text!));
   if(write!.role==='en'?!['perfect','minor','major','off'].includes(String(raw.verdict)):!Number.isInteger(raw.grade)||Number(raw.grade)<0||Number(raw.grade)>3)throw new ToolError(502,'AI 评分格式不完整');
   const out=write!.role==='en'?cleanEn(raw,b.text!):cleanZh(raw,write!.role);const left=await finish({...out},true);return {out,left};
  }
  const step=it?.steps.find(s=>'q' in s),done=it?p.recs[it.id]?.status==='done':undefined;
  const s0=it?.steps[0];const answer=s0?.kind==='choice'?s0.opts[s0.ok[0]].t.replace(/[⟦⟧*]/g,''):s0?.kind==='spot'&&s0.fix?s0.fix.opts[s0.fix.ok[0]].t:'';
  const before=(b.before??[]).map(s=>plainText(s).slice(0,120)).slice(-2);
  const prompt=askUser({title:play.title,before,line:plainText(b.line??''),task:it?`${it.label}：${step?.q??''}`:undefined,taskDone:done,answer,q:b.q!});
  let out=cleanAsk(await complete(askSystem(play.lang,play.id),prompt));
  const normalize=(s:string)=>s.replace(/[\s，。、“”‘’！？…（）()：:；;——-]/g,'');
  const leaks=async(o:AskOut)=>{
   if(!it||done||!answer)return false;
   if(normalize(answer).length>=2&&normalize(JSON.stringify(o)).includes(normalize(answer)))return true;
   const verdict=await complete('检查回答是否直接或换个说法泄露题目答案。只输出 {"leak":true} 或 {"leak":false}。',`题目：${step?.q??it.label}\n答案：${answer}\n回答：${JSON.stringify(o)}`);
   if(typeof verdict.leak!=='boolean')throw new ToolError(502,'AI 回答检查未完成');return verdict.leak;
  };
  if(await leaks(out)){
   out=cleanAsk(await complete(askSystem(play.lang,play.id),prompt+`\n上次回答泄露答案，不能说出或暗示“${answer}”。只给思路。`));
   if(await leaks(out))out={a1:`给你一个方向：${it.hints[0]??'回到原文，一个字一个字地看。'}`,q:'',opts:[],a2:''};
  }
  if(!out.a1)throw new ToolError(502,'AI 未返回有效回答');
  signal.throwIfAborted();const left=await finish({...out,a:[out.a1,out.q,out.a2].filter(Boolean).join(' / ')},true);return {...out,left};
 }));}catch(e){await finish(null,false).catch(()=>undefined);throw e instanceof ToolError?e:new ToolError(502,'AI 回复未完成，请主动重试');}
}
export async function handleTeacherAi(input:EnsembleApiRequest,route:string){
 if(route==='teacher/ai/logs'&&input.request.method==='GET')return withClassroom(input.context.opusRootDir,s=>({value:json(s.ai.logs),changed:false}));
 if(route==='teacher/ai/settings'&&input.request.method==='POST'){
  const b=z.object({quota:z.number().int().min(0).max(500).optional(),addFor:z.string().uuid().optional(),add:z.number().int().min(0).max(500).optional()}).strict().parse(await readToolBody(input.request));
  return withClassroom(input.context.opusRootDir,s=>{if(b.quota!==undefined)s.ai.quota=b.quota;if(b.addFor){if(!s.players[b.addFor])throw new ToolError(404,'学生不存在');s.ai.extra[b.addFor]=Math.min(500,(s.ai.extra[b.addFor]??0)+(b.add??10));}return {value:json(aiStatus(s)),changed:true};});
 }
 throw new ToolError(404,'接口不存在');
}
