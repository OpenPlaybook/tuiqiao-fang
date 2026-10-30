// 把渲染好的竖屏小讲解复制进网站：专题/推敲短视频/成片/<题号>_*.mp4 → public/shorts/<知识点>.mp4（同时复制到 dist/shorts），并写 index.json。
// 用法：node scripts/sync-shorts.mjs（先 npm run build 过一次，或者已经有 dist/）
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const SRC = `${os.homedir()}/Desktop/高中物化/专题/推敲短视频/成片`;
const r = await build({ stdin: { contents: "export { ITEMS } from './src/shared/bank';", resolveDir: '.', loader: 'ts' }, bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'warning' });
const mod = { exports: {} }; new Function('module', 'exports', r.outputFiles[0].text)(mod, mod.exports);
const ITEMS = mod.exports.ITEMS;
const topics = new Set();
for (const d of ['public/shorts', 'dist/shorts']) fs.mkdirSync(d, { recursive: true });
for (const f of fs.existsSync(SRC) ? fs.readdirSync(SRC) : []) {
  const id = f.split('_')[0], it = ITEMS.find((x) => x.id === id);
  if (!it || !f.endsWith('.mp4')) continue;
  for (const d of ['public/shorts', 'dist/shorts']) fs.copyFileSync(path.join(SRC, f), path.join(d, `${it.topic}.mp4`));
  topics.add(it.topic);
}
const list = JSON.stringify([...topics]);
for (const d of ['public/shorts', 'dist/shorts']) fs.writeFileSync(path.join(d, 'index.json'), list);
console.log(`${topics.size} 条：${[...topics].join('、')}`);
