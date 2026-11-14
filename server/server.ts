import { handleAi, handleTeacherAi, aiReady, aiLeft } from './ai';
import { classroomStats } from './stats';
import { z } from 'zod';
import type { EnsembleApiRequest } from '@/src/ensemble';
import { ToolError } from '../common/store';
import { readToolBody } from '../common/request';
import { ClassroomStore, authenticate } from './store';
import { playerSchema, configPatchSchema, joinSchema } from './schema';
import { mergeProgress } from '../src/shared/sync';
import type { Player } from '../src/shared/types';

const json = (data: unknown, status = 200) => Response.json(data, {status, headers:{'Cache-Control':'private, no-store'}});
function requireMethod(request: Request, method: string) {
 if (request.method !== method) throw new ToolError(405, '请求方式不支持');
}
function publicRecord(player: Player) {
 const { token, ...record } = player;
 return record;
}

export async function handleTuiqiaoApi(input: EnsembleApiRequest): Promise<Response> {
 const request = input.request, parts = input.pathSegments.slice(1), route = parts.join('/');
 const isTeacher = !!input.context.viewer?.userId && input.context.viewer.userId === input.context.index.authorId;
 const store = new ClassroomStore(input.context.opusRootDir);
 if (parts[0] === 'ai') return handleAi(input, route, await readToolBody(request), store);
 if (route === 'context') {
  requireMethod(request, 'GET');
  return json({tool:'tuiqiao-fang', isTeacher});
 }
 if (parts[0] === 'teacher' && !isTeacher) throw new ToolError(403, '请使用本课件所属老师的账号登录');
 if (route === 'config') {
  requireMethod(request, 'GET');
  const state = await store.classroom();
  const query = new URL(request.url).searchParams;
  let left: number | undefined;
  if (query.has('pid')) {
   const student = authenticate(await store.student(state, query.get('pid')), request.headers.get('x-participant'));
   left = aiLeft(await store.ai(state.roundId), student.player.pid);
  }
  return json({config:{...state.config, aiReady:aiReady(), aiLeft:left}, roundId:state.roundId});
 }
 if (route === 'join') {
  requireMethod(request, 'POST');
  const body = joinSchema.parse(await readToolBody(request));
  return json(await store.join(body));
 }
 if (route === 'player') {
  requireMethod(request, 'GET');
  const query = new URL(request.url).searchParams;
  return store.editStudent(query.get('roundId') ?? '', query.get('pid'), record => {
   const student = authenticate(record, request.headers.get('x-participant'));
   const now = Date.now();
   return {
    value: json({player:student.player}),
    next: now - student.lastSeen > 15000 ? {...student, lastSeen:now} : undefined,
   };
  });
 }
 if (route === 'sync') {
  requireMethod(request, 'POST');
  const { player } = z.object({player:playerSchema}).strict().parse(await readToolBody(request));
  return store.editStudent(player.roundId, player.pid, record => {
   const old = authenticate(record, player.token).player;
   if (old.name !== player.name || old.sid !== player.sid) throw new ToolError(400, '学生信息不匹配');
   if (old.revision !== player.revision) return {value:json({error:'进度已更新，正在合并', player:old}, 409)};
   // Merge immutable completed answers and recalculate rewards.
   let merged: Player;
   try { merged = mergeProgress(old, player); }
   catch { throw new ToolError(400, '作答得分依据不完整，请刷新后重试'); }
   const updatedAt = Date.now();
   const next = {...merged, createdAt:old.createdAt, revision:old.revision + 1, updatedAt};
   return {value:json({player:next}), next:{player:next, lastSeen:updatedAt}};
  });
 }
 if (route.startsWith('teacher/ai/')) return handleTeacherAi(input, route, store);
 if (route === 'teacher/player') {
  requireMethod(request, 'GET');
  const student = await store.student(await store.classroom(), new URL(request.url).searchParams.get('pid'));
  if (!student) throw new ToolError(404, '学生不存在');
  return json(publicRecord(student.player));
 }
 if (route === 'teacher/state') {
  requireMethod(request, 'GET');
  return json(classroomStats(await store.view()).teacherState());
 }
 if (route === 'teacher/config') {
  requireMethod(request, 'POST');
  return json(await store.updateConfig(configPatchSchema.parse(await readToolBody(request))));
 }
 if (route === 'teacher/delete') {
  requireMethod(request, 'POST');
  const { pid } = z.object({pid:z.string().uuid()}).strict().parse(await readToolBody(request));
  await store.deleteStudent(pid);
  return json({ok:true});
 }
 if (route === 'teacher/reset') {
  requireMethod(request, 'POST');
  z.object({confirm:z.literal('RESET')}).strict().parse(await readToolBody(request));
  await store.reset();
  return json({ok:true});
 }
 if (route === 'teacher/export.csv' || route === 'teacher/export.json') {
  requireMethod(request, 'GET');
  const csv = route.endsWith('.csv'), state = await store.view();
  const data = csv ? classroomStats(state).exportCsv() : JSON.stringify(Object.fromEntries(Object.entries(state.players).map(([id, p]) => [id, publicRecord(p)])), null, 2);
  return new Response(data, {headers:{
   'Cache-Control':'private, no-store',
   'Content-Type':csv ? 'text/csv; charset=utf-8' : 'application/json; charset=utf-8',
   'Content-Disposition':`attachment; filename="tuiqiao-${csv ? 'scores.csv' : 'records.json'}"`,
  }});
 }
 throw new ToolError(404, '接口不存在');
}
