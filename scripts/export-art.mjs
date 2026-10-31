// 把网站的画法（src/art/ink.ts）导出成视频引擎能直接用的脚本：专题/AI推敲/图/art.js → window.INKART.renderArt(spec)
// （旧的竖屏小讲解用过的题库 bank.js 已经不再导出：那一版题库随网站第三版拿掉了，已经导出的文件还在 专题/AI推敲/图/。）
import { build } from 'esbuild';
import os from 'node:os';
const OUT = `${os.homedir()}/Desktop/高中物化/专题`;
await build({ entryPoints: ['src/art/ink.ts'], bundle: true, format: 'iife', globalName: 'INKART', outfile: `${OUT}/AI推敲/图/art.js`, logLevel: 'warning' });
console.log('exported');
