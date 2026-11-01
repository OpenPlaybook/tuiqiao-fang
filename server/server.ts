import {handleAi,handleTeacherAi,aiReady,aiStatus,participantAiLeft} from './ai';
import {classroomStats} from './stats';
import { randomUUID,randomBytes,timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { EnsembleApiRequest } from '@/src/ensemble';
import { ToolError } from '../common/store';
import { readToolBody } from '../common/request';
import { withClassroom } from './store';
import { playerSchema,configPatchSchema,defaultAi,type Classroom } from './schema';
import { newPlayer } from '../src/shared/adapt';

import type { Player } from '../src/shared/types';
const joinSchema=z.object({name:z.string().trim().min(1).max(20),sid:z.string().trim().min(1).max(80),avatar:z.number().int().min(0).max(30),roundId:z.string().uuid().optional()}).strict();
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
function checkRound(state:Classroom,round:string){if(state.roundId!==round)throw new ToolError(410,'课堂记录已清空，请重新加入');}
export function authenticate(state:Classroom,pid:string|null,credential:string|null){
 const player=pid?state.players[pid]:undefined;
 if(!player)throw new ToolError(410,'学生记录已删除，请重新加入');
 const left=Buffer.from(player.token),right=Buffer.from(credential??'');
 if(left.length!==right.length||!timingSafeEqual(left,right))throw new ToolError(403,'学生身份不匹配，请重新加入');
 return player;
}
function requireMethod(request:Request,method:string){if(request.method!==method)throw new ToolError(405,'请求方式不支持');}
export async function handleTuiqiaoApi(input:EnsembleApiRequest):Promise<Response>{
 const request=input.request,parts=input.pathSegments.slice(1),route=parts.join('/');
 const isTeacher=!!input.context.viewer?.userId&&input.context.viewer.userId===input.context.index.authorId;
 if(parts[0]==='ai')return handleAi(input,route,await readToolBody(request));
 if(route==='context'){
  requireMethod(request,'GET');return json({tool:'tuiqiao-fang',isTeacher});
 }
 if(parts[0]==='teacher'&&!isTeacher)throw new ToolError(403,'请使用本课件所属老师的账号登录');
 if(route==='config'){
  requireMethod(request,'GET');return withClassroom(input.context.opusRootDir,state=>({value:json({config:{...state.config,aiReady:aiReady(),aiLeft:participantAiLeft(state,request)},roundId:state.roundId}),changed:false}));
 }
 if(route==='join'){
  requireMethod(request,'POST');const body=joinSchema.parse(await readToolBody(request));
  return withClassroom(input.context.opusRootDir,state=>{
   if(body.roundId)checkRound(state,body.roundId);
   let player=Object.values(state.players).find(p=>p.name===body.name&&p.sid===body.sid);
   if(!player){if(Object.keys(state.players).length>=1000)throw new ToolError(429,'当前课件学生人数已达上限');player=newPlayer(randomUUID(),randomBytes(24).toString('hex'),body.name,body.sid,body.avatar,state.roundId);state.players[player.pid]=player;}
   player.avatar=body.avatar;state.lastSeen[player.pid]=Date.now();return {value:json({player}),changed:true};
  });
 }
 if(route==='player'){
  requireMethod(request,'GET');const query=new URL(request.url).searchParams;
  return withClassroom(input.context.opusRootDir,state=>{
   checkRound(state,query.get('roundId')??'');const player=authenticate(state,query.get('pid'),request.headers.get('x-participant'));
   const changed=Date.now()-(state.lastSeen[player.pid]??0)>15000;if(changed)state.lastSeen[player.pid]=Date.now();
   return {value:json({player}),changed};
  });
 }
 if(route==='sync'){
  requireMethod(request,'POST');const {player}=z.object({player:playerSchema}).strict().parse(await readToolBody(request));
  return withClassroom(input.context.opusRootDir,state=>{
   checkRound(state,player.roundId);const old=authenticate(state,player.pid,player.token);
   if(old.name!==player.name||old.sid!==player.sid)throw new ToolError(400,'学生信息不匹配');
   if(old.revision!==player.revision)return {value:json({error:'进度已更新，正在合并',player:old},409),changed:false};
   // Current revision is a full replacement of this student's current facts, never a second award.
   const next:Player={...player,createdAt:old.createdAt,revision:old.revision+1,updatedAt:Date.now()};
   state.players[next.pid]=next;state.lastSeen[next.pid]=Date.now();return {value:json({player:next}),changed:true};
  });
 }
 if(route.startsWith('teacher/ai/'))return handleTeacherAi(input,route);
 if(route==='teacher/player'){requireMethod(request,'GET');const pid=new URL(request.url).searchParams.get('pid')??'';return withClassroom(input.context.opusRootDir,state=>{const p=state.players[pid];if(!p)throw new ToolError(404,'学生不存在');const {token,...data}=p;void token;return {value:json(data),changed:false};});}
 if(route==='teacher/state'){
  requireMethod(request,'GET');return withClassroom(input.context.opusRootDir,state=>({value:json({...classroomStats(state).teacherState()}),changed:false}));
 }
 if(route==='teacher/config'){
  requireMethod(request,'POST');const patch=configPatchSchema.parse(await readToolBody(request));
  return withClassroom(input.context.opusRootDir,state=>{state.config={...state.config,...patch,open:{...state.config.open,...patch.open}};return {value:json(state.config),changed:true};});
 }
 if(route==='teacher/delete'){
  requireMethod(request,'POST');const {pid}=z.object({pid:z.string().uuid()}).strict().parse(await readToolBody(request));
  return withClassroom(input.context.opusRootDir,state=>{delete state.players[pid];delete state.lastSeen[pid];delete state.ai.usage[pid];delete state.ai.extra[pid];state.ai.logs=state.ai.logs.filter(log=>log.pid!==pid);state.ai.leases=Object.fromEntries(Object.entries(state.ai.leases).filter(([,lease])=>lease.pid!==pid));return {value:json({ok:true}),changed:true};});
 }
 if(route==='teacher/reset'){
  requireMethod(request,'POST');z.object({confirm:z.literal('RESET')}).strict().parse(await readToolBody(request));
  return withClassroom(input.context.opusRootDir,state=>{state.roundId=randomUUID();state.players={};state.lastSeen={};state.ai=defaultAi();return {value:json({ok:true}),changed:true};});
 }
 if(route==='teacher/export.csv'||route==='teacher/export.json'){
  requireMethod(request,'GET');const csv=route.endsWith('.csv');
  return withClassroom(input.context.opusRootDir,state=>({changed:false,value:new Response(csv?classroomStats(state).exportCsv():JSON.stringify(Object.fromEntries(Object.entries(state.players).map(([id,p])=>{const {token,...record}=p;void token;return [id,record];})),null,2),{headers:{'Cache-Control':'private, no-store','Content-Type':csv?'text/csv; charset=utf-8':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="tuiqiao-${csv?'scores.csv':'records.json'}"`}})}));
 }
 throw new ToolError(404,'接口不存在');
}
