import assert from 'node:assert/strict';
import test from 'node:test';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';

async function loadVoiceModule(){
 const built=await build({stdin:{contents:"export * from './src/pages/voiceLoad';",resolveDir:process.cwd(),loader:'ts'},define:{'import.meta.env.VITE_MEDIA_BASE':'""'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'voice-transport',setup(builder){
  builder.onResolve({filter:/^\.\.\/game\/api$/},()=>({path:'voice-flow',namespace:'voice-test'}));
  builder.onResolve({filter:/^@\/src\/shared\//},a=>({path:resolve('sdk',a.path.slice(2)+'.mjs')}));
  builder.onResolve({filter:/^@\/src\/account\/auth\/client$/},()=>({path:'voice-http',namespace:'voice-test'}));
  builder.onLoad({filter:/.*/,namespace:'voice-test'},args=>({loader:'ts',resolveDir:process.cwd(),contents:args.path==='voice-flow'?"import {createGrainFlow} from './sdk/src/shared/grain-flow/runtime.mjs';export const flow=createGrainFlow('voice-regression');globalThis.__voiceFlow=flow;":"export async function apiFetch(url,init){await new Promise(resolve=>setTimeout(resolve,5));init?.signal?.throwIfAborted();return new Response(url.endsWith('index.json')?JSON.stringify({'sample.mp3':1.25}):new Uint8Array([73,68,51,0,128,255,42]));}"}));
 }}]});
 type Voice={beginVoiceSession:()=>()=>void;voiceIndex:()=>Promise<Record<string,number>>;loadVoice:(file:string)=>Promise<string>;unlockAudio:(audio:HTMLAudioElement,force?:boolean)=>Promise<boolean>};
 const loaded={exports:{} as Voice};new Function('require','module','exports',built.outputFiles[0].text)(createRequire(resolve('package.json')),loaded,loaded.exports);
 return loaded.exports;
}

test('voice index and typed MP3 bytes survive normalized reads and player replacement',async()=>{
 const voice=await loadVoiceModule();
 const state=globalThis as typeof globalThis&{__voiceFlow?:{dispose():Promise<void>}};
 try{
  const close=voice.beginVoiceSession();const abandoned=voice.voiceIndex().catch(()=>null);close();
  const finish=voice.beginVoiceSession();assert.deepEqual(await voice.voiceIndex(),{'sample.mp3':1.25});await abandoned;
  const url=await voice.loadVoice('sample.mp3');const response=await fetch(url);assert.equal(response.headers.get('content-type'),'audio/mpeg');assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[73,68,51,0,128,255,42]);URL.revokeObjectURL(url);finish();
 }finally{await state.__voiceFlow?.dispose();delete state.__voiceFlow;}
});


test('audio unlock waits for successful playback separately for every player and retries narration',async()=>{
 const voice=await loadVoiceModule();
 const state=globalThis as typeof globalThis&{__voiceFlow?:{dispose():Promise<void>}};
 class AudioProbe {
  src='';plays=0;pauses=0;finish!:()=>void;reject!:(error:Error)=>void;
  getAttribute(name:string){return name==='src'?(this.src||null):null;}
  play(){this.plays++;return new Promise<void>((resolve,reject)=>{this.finish=resolve;this.reject=reject;});}
  pause(){this.pauses++;}
  unlock(force=false){return voice.unlockAudio(this as unknown as HTMLAudioElement,force);}
 }
 try{
  const first=new AudioProbe(),second=new AudioProbe();
  const pending=first.unlock();assert.equal(first.plays,1);assert.equal(first.unlock(),pending);
  const wav=Buffer.from(first.src.split(',')[1],'base64');
  assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',36,40),'data');
  assert.ok(wav.readUInt32LE(40)>0,'gesture unlock must use real PCM samples');assert.equal(wav.length,44+wav.readUInt32LE(40));
  const other=second.unlock();assert.equal(second.plays,1,'a new chapter must unlock its own media element');
  first.finish();assert.equal(await pending,true);assert.equal(first.pauses,1);
  assert.equal(await first.unlock(),true);assert.equal(first.plays,1);
  second.reject(new DOMException('Gesture required','NotAllowedError'));assert.equal(await other,false);
  second.src='blob:narration';const retry=second.unlock();assert.equal(second.src,'blob:narration');assert.equal(second.plays,2);
  second.finish();assert.equal(await retry,true);assert.equal(second.pauses,0,'retry keeps the narration playing');
  const blockedAgain=second.unlock(true);assert.equal(second.plays,3,'explicit retry must play in the new gesture even after an earlier unlock');second.finish();assert.equal(await blockedAgain,true);
 }finally{await state.__voiceFlow?.dispose();delete state.__voiceFlow;}
});
