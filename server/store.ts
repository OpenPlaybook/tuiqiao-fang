import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { readStore,maintainStore,appendStoreOperation,withStoreWriteLock } from '@openplaybook/json-store';
import { classroomSchema,defaultConfig,defaultAi,type Classroom } from './schema';

/** One atomic classroom snapshot coordinates reset/join/sync across server processes. */
export async function withClassroom<T>(root:string,work:(state:Classroom)=>{value:T;changed:boolean}|Promise<{value:T;changed:boolean}>):Promise<T>{
 const directory=path.join(root,'tools','tuiqiao-fang','classroom');
 return withStoreWriteLock(directory,async()=>{
  await maintainStore(directory);
  const stored=await readStore(directory);
  const state:Classroom=stored.current===undefined?{roundId:randomUUID(),config:defaultConfig(),players:{},lastSeen:{},ai:defaultAi()}:classroomSchema.parse(stored.current);
  const result=await work(state);
  if(result.changed||stored.current===undefined)await appendStoreOperation(directory,{current:{__insert:true,...state}});
  return result.value;
 });
}
