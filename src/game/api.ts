import {runtime} from './demo';
import {localErrorMessage} from '@/src/shared/server-error';
import type {AskOut,ZhJudge,EnJudge} from '../shared/ai';
import type {Player,GameConfig} from '../shared/types';
import {createGrainFlow} from '@/src/shared/grain-flow/runtime';
import {defineData,defineSource} from '@/src/shared/grain-flow/schema';
import {defineMutation} from '@/src/shared/grain-flow/mutation';
import {RequestError} from '@/src/shared/http';
import {AuthRequiredError} from '@/src/account/auth/auth-required';
import {apiFetch} from '@/src/account/auth/client';
import {z} from 'zod';
import {playerSchema,configSchema,type JoinInput,type JoinResult} from '../../server/schema';
export const lessonId=runtime.lessonId,base='/lesson-app/'+encodeURIComponent(lessonId)+'/api/';
export class ApiError extends RequestError{constructor(public statusCode:number,public payload:{error?:string;player?:Player}){super('http',payload.error||`请求失败（${statusCode}）`,statusCode);}}
let participant:Player|null=null;
export function setParticipant(player:Player|null){const changed=participant?.pid!==player?.pid||participant?.roundId!==player?.roundId;participant=player;if(changed)flow.store.invalidate(['tuiqiao.classroom']);}
async function requestRaw<T>(route:string,body?:unknown,signal?:AbortSignal,onText?:(s:string)=>void):Promise<T>{
 const headers:Record<string,string>={'Content-Type':'application/json'};if(participant)headers['x-participant']=participant.token;
 const response=await apiFetch(base+route,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers,body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.any([AbortSignal.timeout(onText||route.startsWith('ai/')?100000:10000),...(signal?[signal]:[])])},true);
 if(!response.ok){const data=await response.json().catch(()=>({}));throw new ApiError(response.status,data);}
 return response.json();
}

async function request<T>(route:string,body?:unknown,signal?:AbortSignal,onText?:(s:string)=>void):Promise<T>{
 try{return await requestRaw<T>(route,body,signal,onText);}
 catch(error){
  if(signal?.aborted)throw signal.reason;
  if(error instanceof RequestError)throw error;
  if(error instanceof AuthRequiredError)throw new RequestError('http',error.message,error.status,error.code);
  if(error instanceof SyntaxError)throw new RequestError('parse','返回的数据格式不正确');
  throw new RequestError('network','网络请求失败或超时');
 }
}
export const flow=createGrainFlow('tuiqiao-fang:'+lessonId);
export type ToolContext={tool:'tuiqiao-fang';isTeacher:boolean};
export type ClassroomConfig={config:GameConfig;roundId:string;player?:Player};
const reads=[['context','context'],['teacher','teacher/state']] as const;
flow.register({
 data:[defineData('tuiqiao.classroom',z.unknown()),...reads.map(([k])=>defineData('tuiqiao.'+k,z.unknown()))],
 sources:[defineSource('tuiqiao.classroom',{load:async({signal})=>{const p=participant;const value=await request<ClassroomConfig>('config'+(p?'?pid='+encodeURIComponent(p.pid):''),undefined,signal);configSchema.passthrough().parse(value.config);z.string().uuid().parse(value.roundId);if(p&&p.roundId===value.roundId){const r=await request<{player:Player}>('player?'+new URLSearchParams({pid:p.pid,roundId:p.roundId}),undefined,signal);value.player=playerSchema.parse(r.player);}return {value,state:undefined};},provides:{'tuiqiao.classroom':c=>c.value},observation:()=>3000}),...reads.map(([k,route])=>defineSource('tuiqiao.'+k,{load:async({signal})=>({value:await request(route,undefined,signal),state:undefined}),provides:{['tuiqiao.'+k]:c=>c.value},...(k==='context'?{}:{observation:()=>4000})}))],
 mutations:['join','sync','teacher/config','teacher/delete','teacher/reset','teacher/ai/settings','ai/ask','ai/judge'].map(route=>defineMutation('tuiqiao.'+route,{path:'tuiqiao.'+route.replaceAll('/','.'),targets:()=>[],execute:({input,signal})=>request(route,input,signal),receipt:()=>route.startsWith('teacher/')?[{kind:'invalidate' as const,path:'tuiqiao.teacher'},{kind:'invalidate' as const,path:'tuiqiao.classroom'}]:[]})),
});
function write<T>(route:string,body:unknown){return flow.operation<unknown,T>('tuiqiao.'+route.replaceAll('/','.')).run(body);}
export const visibleError=(e:unknown)=>localErrorMessage(e,'操作失败，请重试');
export const api={
 join:(input:JoinInput)=>write<JoinResult>('join',input),
 sync:(player:Player)=>write<{player:Player}>('sync',{player}),
 ask:(b:{pid:string;token:string;play:string;item:string;line:string;before:string[];q:string})=>write<AskOut&{left:number}>('ai/ask',{...b,roundId:participant?.roundId}),
 judge:(b:{pid:string;token:string;item:string;step:string;text:string})=>write<{out:ZhJudge|EnJudge;left:number}>('ai/judge',{...b,roundId:participant?.roundId}),
 teacher:{setConfig:(c:Partial<GameConfig>)=>write('teacher/config',c),del:(pid:string)=>write('teacher/delete',{pid}),reset:()=>write('teacher/reset',{confirm:'RESET'}),aiSettings:(b:unknown)=>write('teacher/ai/settings',b)},
};
export interface AiStatus { ready: boolean; mock: boolean; model: string; quota: number; active: number; used: number }
export interface AiLog { t: number; pid: string; name: string; item: string; step: string; role: string; text: string; out: ZhJudge | EnJudge | { a: string } | null; ms: number; ok: boolean; err?: string }
export interface PlayerSummary {
  pid: string; name: string; sid: string; avatar: number; stars: number; bonus: number; unsure: number; done: number; avgLv: number; side?: number; gloss?: number; gloss2?: number; asks?: number;
  theta: Record<string, number>; stations: Record<string, { stars: number; done: number }>; lastSeen: number; current: string; createdAt: number; aiLeft: number;
}
export interface ItemStat { maxStars:number; id: string; st: string; lv: number; label: string; n: number; done: number; avgStars: number; unsure: number; firstN: number; firstOk: number; wrong: { v: string; n: number }[]; opens?: { v: string; n: number }[] }
export interface AskRow { name: string; play: string; q: string; a: string; fb: string; t: number }
export interface GlossRow { play: string; w: string; n1: number; n2: number }
export interface TeacherState { config: GameConfig; players: PlayerSummary[]; items: ItemStat[]; good: AiLog[]; asks?: AskRow[]; glosses?: GlossRow[]; now: number; ai: AiStatus }
