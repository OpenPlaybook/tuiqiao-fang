// 把网站的画法（src/art/ink.ts）和题库导出成视频引擎能直接用的脚本：
//   专题/AI推敲/图/art.js      → window.INKART.renderArt(spec)
//   专题/推敲短视频/图/bank.js  → window.BANK（题目、知识点）
import { build } from 'esbuild';
import os from 'node:os';
const OUT = `${os.homedir()}/Desktop/高中物化/专题`;
await build({ entryPoints: ['src/art/ink.ts'], bundle: true, format: 'iife', globalName: 'INKART', outfile: `${OUT}/AI推敲/图/art.js`, logLevel: 'warning' });
await build({ stdin: { contents: "export { ITEMS, SLOTS, ROOMS } from './src/shared/bank'; export { STATIONS } from './src/shared/adapt';", resolveDir: '.', loader: 'ts' }, bundle: true, format: 'iife', globalName: 'BANK', outfile: `${OUT}/AI推敲/图/bank.js`, logLevel: 'warning' });
console.log('exported');
