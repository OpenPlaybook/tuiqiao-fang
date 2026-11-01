import type {Item,Rec,Player} from './types';
import {earnedStars,taskBudget,extensionStars} from './reward-budget';
/** 教学步骤仍完整呈现，但讲解本身不是得分判断。 */
export function questionScores(it:Item,scores:number[]):number[]{
 const display=it.steps.filter(s=>!(s.kind==='write'&&s.bonus));
 const questions=display.filter(s=>s.kind!=='teach');
 const values=scores.length===display.length?scores.filter((_,i)=>display[i].kind!=='teach'):scores;
 if(values.length!==questions.length||!values.length||values.some(x=>!Number.isFinite(x)||x<0||x>1))throw Error(`任务作答质量不完整：${it.id}`);
 return values;
}
export function assessReward(it:Item,scores:number[],unsure:number){
 const values=questionScores(it,scores),mean=values.reduce((a,b)=>a+b,0)/values.length;
 const perfStep=(x:number):number=>x>=0.99?1:x>=0.84?0.75:x>=0.66?0.5:x>=0.49?0.3:0;
 return {stars:earnedStars(taskBudget(it.id),mean),perf:values.map(perfStep).reduce((a,b)=>a+b,0)/values.length*(unsure>0?0.7:1)};
}
export function recordedReward(it:Item,rec:Rec){
 const scores=rec.data?.scores;
 if(!Array.isArray(scores)||scores.some(x=>typeof x!=='number'))throw Error(`缺少完整得分依据：${it.id}`);
 return assessReward(it,scores,rec.unsure).stars;
}

export function repricePlayer(p:Player,items:Record<string,Item>):Player {
 return {...p,recs:Object.fromEntries(Object.entries(p.recs).map(([id,r])=>[id,r.status==='done'&&items[id]?.steps.length?{...r,stars:recordedReward(items[id],r)}:r]))};
}
export function extensionTotal(r:Rec){return Object.entries((r.data?.ext as Record<string,number>)??{}).reduce((sum,[id,score])=>sum+extensionStars(r.id,id,score),0);}
export function recordTotal(r:Rec){return (r.status==='done'?r.stars:0)+extensionTotal(r);}
