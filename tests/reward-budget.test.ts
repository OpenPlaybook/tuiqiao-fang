import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {ITEMS,ITEM_BY_ID} from '../src/shared/bank';
import {PLAYS} from '../src/shared/play';
import {REWARD_BUDGET,taskBudget,extensionBudget,extensionStars} from '../src/shared/reward-budget';
import {resultOf,maxStarsOf,newPlayer,normalizeRewards,starsOf} from '../src/shared/adapt';
import {mergeProgress} from '../src/shared/sync';
import type {Rec} from '../src/shared/types';

test('every task and extension has one explicit budget, with no orphan or guessed reward',()=>{
 assert.deepEqual(Object.keys(REWARD_BUDGET).sort(),ITEMS.filter(it=>it.steps.length).map(it=>it.id).sort());
 for(const it of ITEMS.filter(it=>it.steps.length))assert.deepEqual(Object.keys(REWARD_BUDGET[it.id].extensions).sort(),(it.ext??[]).map(e=>e.id).sort());
 assert.throws(()=>taskBudget('missing'));assert.throws(()=>extensionBudget('p1-fan','missing'));
});
test('difficulty and task size affect the ceiling; quality determines earned stars',()=>{
 assert.equal(taskBudget('p1-yifan'),2);assert.equal(taskBudget('p1-yifan3'),5);assert.equal(taskBudget('p6-wujiang'),12);
 assert.equal(resultOf(ITEM_BY_ID['p1-yifan'],[1],0).stars,2);
 assert.equal(resultOf(ITEM_BY_ID['p1-yifan3'],[0.67],0).stars,3);
 assert.throws(()=>resultOf(ITEM_BY_ID['p6-wujiang'],[],0));
 const it=ITEMS.find(i=>i.ext?.length)!;const e=it.ext![0];assert.equal(extensionStars(it.id,e.id,1),extensionBudget(it.id,e.id));assert.equal(extensionStars(it.id,e.id,.34),0);
});
test('one adaptive slot counts the actual selected version, never both alternatives',()=>{
 const p=newPlayer(randomUUID(),randomUUID(),'test','test',0,randomUUID());const play=PLAYS.find(p=>p.lines.some(l=>(l.task?.length??0)>1))!;const ids=play.lines.find(l=>(l.task?.length??0)>1)!.task!;
 const before=maxStarsOf(play.id);const it=ITEM_BY_ID[ids[0]];p.recs[it.id]={id:it.id,st:it.st,status:'doing',stars:0,perf:0,unsure:0,tries:{},bonus:0,log:[],t0:1};
 assert.ok(maxStarsOf(play.id,p)<=before);assert.equal(before-maxStarsOf(play.id,p),3);
});
test('late cache cannot restore old stars or overwrite completed score and extension evidence',()=>{
 const p=newPlayer(randomUUID(),randomUUID(),'test','test',0,randomUUID()),it=ITEM_BY_ID['p1-yifan3'];
 const r:Rec={id:it.id,st:it.st,status:'done',stars:3,perf:1,unsure:0,tries:{},bonus:0,log:[],t0:1,t1:2,data:{scores:[1],ext:{[it.ext![0].id]:1}}};p.recs[it.id]=r;
 const current=normalizeRewards(p);assert.equal(current.recs[it.id].stars,5);
 const late=structuredClone(p);late.recs[it.id].stars=1;late.recs[it.id].data!.scores=[.34];late.recs[it.id].data!.ext={[it.ext![0].id]:.34};
 const merged=mergeProgress(current,late);assert.equal(merged.recs[it.id].stars,5);assert.deepEqual(merged.recs[it.id].data!.scores,[1]);assert.deepEqual(merged.recs[it.id].data!.ext,{[it.ext![0].id]:1});assert.equal(starsOf(merged),starsOf(current));
});
