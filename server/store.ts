import path from 'node:path';
import { mkdir, open, readFile, rename, rm, rmdir } from 'node:fs/promises';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { withStoreWriteLock } from '@openplaybook/json-store';
import { z } from 'zod';
import { ToolError } from '../common/store';
import { newPlayer } from '../src/shared/adapt';
import {
 aiSchema, classroomSchema, defaultAi, defaultConfig, studentSchema,
 type AiState, type Classroom, type ClassroomView, type JoinInput, type JoinResult, type Student,
} from './schema';

const classroomFile = 'classroom.json';
const studentFile = 'record.json';
const pidSchema = z.string().uuid();

async function readJson(file: string): Promise<unknown> {
 try { return JSON.parse(await readFile(file, 'utf8')); }
 catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  return undefined;
 }
}

async function writeJson(file: string, value: unknown) {
 const tmp = file + '.' + randomUUID() + '.tmp';
 try {
  const handle = await open(tmp, 'wx', 0o660);
  try {
   await handle.writeFile(JSON.stringify(value) + '\n');
   await handle.sync();
  } finally { await handle.close(); }
  await rename(tmp, file);
 } finally { await rm(tmp, { force: true }).catch(() => undefined); }
}

export function checkRound(state: Classroom, round: string) {
 if (state.roundId !== round) throw new ToolError(410, '课堂记录已清空，请重新加入');
}

export function authenticate(student: Student | undefined, credential: string | null) {
 if (!student) throw new ToolError(410, '学生记录已删除，请重新加入');
 const expected = Buffer.from(student.player.token);
 const supplied = Buffer.from(credential ?? '');
 if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
  throw new ToolError(403, '学生身份不匹配，请重新加入');
 }
 return student;
}

export class ClassroomStore {
 private readonly directory: string;

 constructor(root: string) {
  this.directory = path.join(root, 'tools', 'tuiqiao-fang', 'progress');
 }

 private roundDirectory(roundId: string) {
  return path.join(this.directory, 'rounds', roundId);
 }

 private studentDirectory(roundId: string, pid: string) {
  return path.join(this.roundDirectory(roundId), pid);
 }

 private async readClassroom() {
  const stored = await readJson(path.join(this.directory, classroomFile));
  return stored === undefined ? undefined : classroomSchema.parse(stored);
 }

 private async writeClassroom(state: Classroom) {
  await writeJson(path.join(this.directory, classroomFile), state);
 }

 private async withClassroomLock<T>(work: (state: Classroom) => Promise<T>) {
  return withStoreWriteLock(this.directory, async () => {
   let state = await this.readClassroom();
   if (!state) {
    state = { roundId: randomUUID(), config: defaultConfig(), roster: {} };
    await this.writeClassroom(state);
   }
   return work(state);
  });
 }

 async classroom() {
  return await this.readClassroom() ?? this.withClassroomLock(async state => state);
 }

 async student(state: Classroom, pid: string | null) {
  if (!pid || !pidSchema.safeParse(pid).success || !Object.hasOwn(state.roster, pid)) return undefined;
  const saved = await readJson(path.join(this.studentDirectory(state.roundId, pid), studentFile));
  return saved === undefined ? undefined : studentSchema.parse(saved);
 }

 async editStudent<T>(roundId: string, pid: string | null, work: (student: Student) => {
  value: T;
  next?: Student;
 }) {
  const state = await this.classroom();
  checkRound(state, roundId);
  if (!pid || !pidSchema.safeParse(pid).success || !Object.hasOwn(state.roster, pid)) {
   throw new ToolError(410, '学生记录已删除，请重新加入');
  }
  const directory = this.studentDirectory(roundId, pid);
  return withStoreWriteLock(directory, async () => {
   const current = await this.classroom();
   checkRound(current, roundId);
   const student = await this.student(current, pid);
   if (!student) throw new ToolError(410, '学生记录已删除，请重新加入');
   const { value, next } = work(student);
   if (next) await writeJson(path.join(directory, studentFile), next);
   return value;
  });
 }

 async ai(roundId: string): Promise<AiState> {
  const saved = await readJson(path.join(this.roundDirectory(roundId), 'ai.json'));
  return saved === undefined ? defaultAi() : aiSchema.parse(saved);
 }

 private async writeAi(roundId: string, state: AiState) {
  const directory = this.roundDirectory(roundId);
  await mkdir(directory, { recursive: true });
  await writeJson(path.join(directory, 'ai.json'), state);
 }

 async editAi<T>(work: (state: Classroom, ai: AiState) => Promise<{value:T;changed:boolean}>) {
  return this.withClassroomLock(async state => {
   const ai = await this.ai(state.roundId);
   const { value, changed } = await work(state, ai);
   if (changed) await this.writeAi(state.roundId, ai);
   return value;
  });
 }

 async join(input: JoinInput): Promise<JoinResult> {
  const current = await this.classroom();
  if (input.roundId) checkRound(current, input.roundId);
  const choice = input.choice;
  if (choice && choice !== 'new') {
   if (current.roster[choice]?.name.trim() !== input.name) {
    throw new ToolError(410, '这条记录已不可用，请重新查找');
   }
   return this.editStudent(current.roundId, choice, student => {
    const player = { ...student.player, avatar: input.avatar };
    return { value: {player}, next: { player, lastSeen: Date.now() } };
   });
  }
  return this.withClassroomLock(async state => {
   if (input.roundId) checkRound(state, input.roundId);
   const matches = Object.entries(state.roster)
    .filter(([, identity]) => identity.name.trim() === input.name)
    .map(([pid, identity]) => ({pid, sid:identity.sid}))
    .sort((a, b) => Number(b.sid === input.sid) - Number(a.sid === input.sid) || a.sid.localeCompare(b.sid, 'zh'));
   if (matches.length && (choice !== 'new' || matches.some(match => match.sid === input.sid))) {
    return {roundId:state.roundId, matches};
   }
   if (Object.keys(state.roster).length >= 1000) throw new ToolError(429, '当前课件学生人数已达上限');
   const pid = randomUUID();
   const player = newPlayer(pid, randomBytes(24).toString('hex'), input.name, input.sid, input.avatar, state.roundId);
   const directory = this.studentDirectory(state.roundId, pid);
   await withStoreWriteLock(directory, () => writeJson(path.join(directory, studentFile), {player, lastSeen: Date.now()}));
   state.roster[pid] = { name: input.name, sid: input.sid };
   await this.writeClassroom(state);
   return {player};
  });
 }

 async updateConfig(patch: Partial<Classroom['config']>) {
  return this.withClassroomLock(async state => {
   state.config = { ...state.config, ...patch, open: { ...state.config.open, ...patch.open } };
   await this.writeClassroom(state);
   return state.config;
  });
 }

 private async removeStudentFile(roundId: string, pid: string) {
  const directory = this.studentDirectory(roundId, pid);
  await withStoreWriteLock(directory, () => rm(path.join(directory, studentFile), { force: true }));
  await rmdir(directory).catch(error => {
   if (!['ENOENT', 'ENOTEMPTY'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
  });
 }

 async deleteStudent(pid: string) {
  await this.withClassroomLock(async state => {
   const ai = await this.ai(state.roundId);
   delete ai.usage[pid];
   delete ai.extra[pid];
   ai.logs = ai.logs.filter(log => log.pid !== pid);
   ai.leases = Object.fromEntries(Object.entries(ai.leases).filter(([, lease]) => lease.pid !== pid));
   await this.writeAi(state.roundId, ai);
   delete state.roster[pid];
   await this.writeClassroom(state);
   await this.removeStudentFile(state.roundId, pid);
  });
 }

 async reset() {
  await this.withClassroomLock(async state => {
   await this.writeClassroom({ ...state, roundId: randomUUID(), roster: {} });
   for (const pid of Object.keys(state.roster)) await this.removeStudentFile(state.roundId, pid);
   const oldRound = this.roundDirectory(state.roundId);
   await rm(path.join(oldRound, 'ai.json'), { force: true });
   await rmdir(oldRound).catch(error => {
    if (!['ENOENT', 'ENOTEMPTY'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error;
   });
  });
 }

 async view(): Promise<ClassroomView> {
  const state = await this.classroom();
  const players: ClassroomView['players'] = {};
  const lastSeen: ClassroomView['lastSeen'] = {};
  const ids = Object.keys(state.roster);
  // Bound filesystem fan-out even when the course has reached the roster limit.
  for (let i = 0; i < ids.length; i += 32) {
   await Promise.all(ids.slice(i, i + 32).map(async pid => {
    const student = await this.student(state, pid);
    if (student) {
     players[pid] = student.player;
     lastSeen[pid] = student.lastSeen;
    }
   }));
  }
  return { roundId: state.roundId, config: state.config, players, lastSeen, ai: await this.ai(state.roundId) };
 }
}
