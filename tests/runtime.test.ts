import assert from 'node:assert/strict';
import test from 'node:test';
import {resolveRuntime} from '../src/game/runtime';

test('独立网页和本地文件自动进入无需课堂服务的演示模式', () => {
  for (const path of ['/', '/index.html', '/网站/index.html', '/Users/p/第六堂课/字里行间_演示版.html']) {
    assert.deepEqual(resolveRuntime(path), {lessonId: 'demo', demo: true});
  }
});

test('Lesson 各入口保持课堂身份与服务路径，显式演示构建仍可演示', () => {
  for (const prefix of ['/lesson/', '/lesson-app/', '/api/ensemble/lesson/']) {
    const path = prefix + 'lesson%20six/';
    assert.deepEqual(resolveRuntime(path), {lessonId: 'lesson six', demo: false});
    assert.equal(resolveRuntime(path, true).demo, true);
  }
  assert.equal(resolveRuntime('/lesson-app/').demo, true);
});
