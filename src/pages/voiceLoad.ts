// 配音按需加载。画面、字幕、题目都在网页代码里（一次载入，压缩后约 300KB）；真正要“等”的只有配音。
// 每句配音是一个几十 KB 的 mp3，文件名是“音色 + 文字”的哈希（内容不变，名字就不变，可以长期缓存）。
//   · 播到哪一句，先把这一句和后面几句取下来（fetch 成 Blob 放在内存里）；取到了才开始播，播的时候不会卡在半句。
//   · 这一句还没取到：画面停在这一句开头，显示“配音加载中”，取到了接着播。
//   · 一回里剩下的句子，空闲时一句一句在后台取（同一时间只取一个，不和眼前要用的抢网速）。
//   · 配音读取与恢复归共享来源；仍可主动重试或先看字幕。
import { MEDIA } from '../media';

const NEAR = 4; // 眼前要用的：当前这句 + 后面几句
const MAX = 2; // 同时取几个（后台慢慢取的只占一个）

import {flow} from '../game/api';
import {ReadSession} from '@/src/shared/grain-flow/read-session';
let lifetime=new AbortController(),owners=0;
export function beginVoiceSession(){
 if(lifetime.signal.aborted){lifetime=new AbortController();idxP=null;}
 owners++;const current=lifetime;
 // StrictMode replaces effect owners synchronously; release only after that handoff.
 return()=>{owners--;queueMicrotask(()=>{if(!owners&&current===lifetime)current.abort();});};
}
import {defineData,defineSource} from '@/src/shared/grain-flow/schema';
import {RequestError} from '@/src/shared/http';
import {apiFetch} from '@/src/account/auth/client';
import {z} from 'zod';
const registered=new Map<string,string>();
const fetchRetry=async(url:string):Promise<Response>=>{
 let key=registered.get(url);
 if(!key){
  key='tuiqiao.voice.file'+registered.size;registered.set(url,key);
  flow.register({data:[defineData(key,z.string())],sources:[defineSource(key,{load:async({signal})=>{
   let response:Response;
   try{response=await apiFetch(url,{signal:AbortSignal.any([signal,AbortSignal.timeout(15000)])},true);}catch{if(signal.aborted)throw signal.reason;throw new RequestError('network','配音连接中断');}
   if(!response.ok)throw new RequestError('http','配音读取失败',response.status);
   const bytes=new Uint8Array(await response.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
   // Shared facts are JSON values; keep bytes encoded instead of merging an ArrayBuffer as an object.
   return {value:btoa(binary),state:undefined};
  },provides:{[key]:c=>c.value}})]});
 }
 const session=new ReadSession(flow,{signal:lifetime.signal,timeoutMs:15000,timeoutError:new Error('配音读取超时')});
 try{const value=await session.read<string>(key);return new Response(Uint8Array.from(atob(value),c=>c.charCodeAt(0)),{headers:{'Content-Type':url.endsWith('.json')?'application/json':'audio/mpeg'}});}finally{session.dispose();}
};

// ---------------- 时长表：voice/index.json（文件名 → 秒） ----------------
let idxP: Promise<Record<string, number>> | null = null;
/** 时长表取不到时 reject（下次再调用会重新取） */
export const voiceIndex = () => (idxP ??= fetchRetry(`${MEDIA}voice/index.json`).then((r) => r.json() as Promise<Record<string, number>>).catch((e) => { idxP = null; throw e; }));

// ---------------- 配音文件 ----------------
type Job = { file: string; prio: number; ok: (u: string) => void; bad: (e: unknown) => void };
const ready = new Map<string, string>(); // 取到的：文件名 → 播放地址（Blob URL）
const wanted = new Map<string, { p: Promise<string>; job: Job | null }>(); // 正在排队或正在取的
const queue: Job[] = [];
let active = 0, activeBg = 0;

const pump = () => {
  queue.sort((a, b) => a.prio - b.prio);
  while (queue.length && active < MAX) {
    const bg = queue[0].prio >= NEAR;
    if (bg && activeBg >= 1) break; // 后台的同时只取一个
    const job = queue.shift()!;
    active++; if (bg) activeBg++;
    const w = wanted.get(job.file); if (w) w.job = null;
    fetchRetry(`${MEDIA}voice/${job.file}`)
      .then((r) => r.blob())
      .then((b) => { const u = URL.createObjectURL(b); ready.set(job.file, u); wanted.delete(job.file); job.ok(u); })
      .catch((e) => { wanted.delete(job.file); job.bad(e); })
      .finally(() => { active--; if (bg) activeBg--; pump(); });
  }
};

/** 已经取到了吗（取到了就能马上播） */
export const voiceReady = (file: string) => ready.has(file);
/** 播放地址：取到了才有 */
export const voiceSrc = (file: string) => ready.get(file);

/** 要这个文件：prio 越小越急（0 = 正要播）。已经在排队的会按新的急迫程度往前挪 */
export const loadVoice = (file: string, prio = 0): Promise<string> => {
  const have = voiceSrc(file);
  if (have) return Promise.resolve(have);
  const w = wanted.get(file);
  if (w) { if (w.job && prio < w.job.prio) { w.job.prio = prio; pump(); } return w.p; }
  let job!: Job;
  const p = new Promise<string>((ok, bad) => { job = { file, prio, ok, bad }; });
  p.catch(() => {}); // 没人等的后台任务失败了也不报错
  wanted.set(file, { p, job });
  queue.push(job); pump();
  return p;
};

/** 播放计划：files 是从当前这句往后的配音（按顺序）。前 NEAR 个马上取，其余后台慢慢取；不在计划里的排队任务往后放 */
export const planVoices = (files: string[]) => {
  const plan = new Set(files);
  for (const j of queue) if (!plan.has(j.file)) j.prio = 1000 + j.prio;
  files.forEach((f, k) => { if (!voiceReady(f)) loadVoice(f, k < NEAR ? k : NEAR + k); });
};

// ---------------- Safari：在点击手势中解锁当前播放器 ----------------
// 后面的配音在异步读取后播放；先在点击时成功播放同一个元素，再切换 src。
// A real 20ms PCM payload is required; an empty WAV cannot unlock audio playback.
const SILENT = 'data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YaAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';
const unlocked = new WeakSet<HTMLAudioElement>();
const unlocking = new WeakMap<HTMLAudioElement, Promise<boolean>>();
/** force：点“重试”时再解锁一次（已经载入了配音就直接在点击里放它，不换成无声的） */
export const unlockAudio = (a: HTMLAudioElement, force = false): Promise<boolean> => {
  if (!force && unlocked.has(a)) return Promise.resolve(true);
  const pending = unlocking.get(a); if (pending) return pending;
  if (!a.getAttribute('src')) a.src = SILENT;
  const r = a.play().then(() => { unlocked.add(a); if (a.src === SILENT) a.pause(); return true; }, () => false).finally(() => unlocking.delete(a)); // 这时可能已经换成真的配音在放了，别把它停掉
  unlocking.set(a, r);
  return r;
};
