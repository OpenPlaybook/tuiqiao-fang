import {z} from 'zod';
import {MAX_REWARD,REWARD_BUDGET} from '../src/shared/reward-budget';
import {ITEM_BY_ID} from '../src/shared/bank';
import {PLAY_BY_ID} from '../src/shared/play';
import {STATION_IDS,type GameConfig,type Player} from '../src/shared/types';
const uuid=z.string().uuid(), time=z.number().finite().nonnegative();
const log=z.object({id:uuid,q:z.string().max(80),v:z.string().max(2000),ok:z.boolean().nullable(),t:time}).strict();
const validRec=(id:string)=>Boolean(ITEM_BY_ID[id]||(id.endsWith('-log')&&PLAY_BY_ID[id.slice(0,-4)]));
const rec=z.object({id:z.string().refine(validRec),st:z.string().max(30),status:z.enum(['doing','done']),stars:z.number().int().min(0).max(MAX_REWARD),perf:z.number().min(0).max(1),unsure:z.number().int().min(0).max(10000),tries:z.record(z.string().max(80),z.number().int().min(0).max(10000)),bonus:z.number().int().min(0).max(9),prac:z.boolean().optional(),log:z.array(log).max(5000),data:z.record(z.string(),z.unknown()).optional(),t0:time,t1:time.optional()}).strict().refine(r=>JSON.stringify(r.data??{}).length<=100000&&new Set(r.log.map(e=>e.id)).size===r.log.length).refine(r=>{const ext=r.data?.ext;if(ext===undefined)return true;if(!ext||typeof ext!=='object'||Array.isArray(ext))return false;return Object.entries(ext).every(([key,value])=>REWARD_BUDGET[r.id]?.extensions[key]!==undefined&&typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1);});
export const playerSchema=z.object({pid:uuid,token:z.string().min(16).max(100),roundId:uuid,revision:z.number().int().nonnegative(),name:z.string().trim().min(1).max(20),sid:z.string().trim().min(1).max(80),avatar:z.number().int().min(0).max(30),createdAt:time,recs:z.record(z.string(),rec).refine(rs=>Object.entries(rs).every(([k,r])=>k===r.id)),updatedAt:time}).strict();
const open=z.record(z.string().refine(k=>STATION_IDS.includes(k)),z.boolean());
export const configSchema=z.object({open,attention:z.boolean(),message:z.string().max(1000),ai:z.boolean()}).strict();
export const configPatchSchema=configSchema.partial();
export const defaultConfig=():GameConfig=>({open:Object.fromEntries(STATION_IDS.map(k=>[k,false])),attention:false,message:'',ai:true});
export const defaultAi=()=>({quota:60,extra:{} as Record<string,number>,usage:{} as Record<string,number>,leases:{} as Record<string,{pid:string;expires:number}>,logs:[] as AiLog[],day:'',calls:0});
export type AiLog={t:number;pid:string;name:string;item:string;step:string;role:string;text:string;out:Record<string,unknown>|null;ms:number;ok:boolean};
const aiLog=z.object({t:time,pid:uuid,name:z.string(),item:z.string(),step:z.string(),role:z.string(),text:z.string(),out:z.record(z.string(),z.unknown()).nullable(),ms:z.number(),ok:z.boolean()});
export const aiSchema=z.object({quota:z.number().int().min(0).max(500),extra:z.record(z.string(),z.number()),usage:z.record(z.string(),z.number()),leases:z.record(z.string(),z.object({pid:uuid,expires:time})),logs:z.array(aiLog),day:z.string(),calls:z.number()});
export const classroomSchema=z.object({
 roundId:uuid,
 config:configSchema,
 roster:z.record(uuid,playerSchema.pick({name:true,sid:true})),
});
export const studentSchema=z.object({player:playerSchema,lastSeen:time});
export const joinSchema=z.object({
 name:z.string().trim().min(1).max(20),
 sid:z.string().trim().min(1).max(80),
 avatar:z.number().int().min(0).max(30),
 roundId:uuid.optional(),
 choice:z.union([uuid,z.literal('new')]).optional(),
}).strict();
export type JoinInput=z.infer<typeof joinSchema>;
export type RecoveryChoice={pid:string;sid:string};
export type JoinResult={player:Player}|{roundId:string;matches:RecoveryChoice[]};
export type Classroom=z.infer<typeof classroomSchema>;
export type Student=z.infer<typeof studentSchema>;
export type AiState=z.infer<typeof aiSchema>;
export type ClassroomView=Pick<Classroom,'roundId'|'config'>&{
 players:Record<string,Player>;
 lastSeen:Record<string,number>;
 ai:AiState;
};
