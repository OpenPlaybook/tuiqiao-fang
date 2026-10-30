// 把服务器（TypeScript）打包成一个不依赖 node_modules 的 JS 文件。
import { build } from 'esbuild';
import { rm } from 'node:fs/promises';
await rm('dist-server', { recursive: true, force: true });
const common = { bundle: true, platform: 'node', format: 'esm', target: 'node22', logLevel: 'warning' };
await build({ ...common, entryPoints: ['server/server.ts'], outfile: 'dist-server/server.js' });
await build({ ...common, entryPoints: ['scripts/answers.ts'], outfile: 'dist-server/answers.js' });
