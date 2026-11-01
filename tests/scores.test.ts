import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { newPlayer, sideItemsOf, sideOf, stationSide, stationStars, starsOf } from '../src/shared/adapt';
import type { Rec } from '../src/shared/types';

const record = (id: string, st: Rec['st']): Rec => ({ id, st, status: 'done', stars: 0, perf: 1, unsure: 0, tries: {}, bonus: 0, log: [], t0: Date.now(), t1: Date.now() });
const player = () => newPlayer(randomUUID(), randomUUID(), '计分验收', '测试', 0, randomUUID());

test('optional side tasks award stars, not exploration points', () => {
  const p = player(), item = sideItemsOf('lb1')[0];
  assert.ok(item, 'use an actual optional task from the course');
  p.recs[item.id] = { ...record(item.id, item.st), stars: 3 };
  assert.equal(starsOf(p), 3);
  assert.equal(stationStars(p, item.st), 3);
  assert.equal(sideOf(p), 0);
  assert.equal(stationSide(p, 'lb1'), 0);
});

test('AI follow-up and dictionary exercises award exploration separately from task stars', () => {
  const p = player(), item = sideItemsOf('lb1')[0];
  p.recs[item.id] = { ...record(item.id, item.st), stars: 2 };
  p.recs['lb1-log'] = { ...record('lb1-log', 'p'), log: [
    { id: randomUUID(), q: 'askok', v: 'AI 追问', ok: null, t: Date.now() },
    { id: randomUUID(), q: 'more', v: '日', ok: null, t: Date.now() },
  ] };
  assert.equal(starsOf(p), 2);
  assert.equal(sideOf(p), 2);
  assert.equal(stationSide(p, 'lb1'), 2);
});
