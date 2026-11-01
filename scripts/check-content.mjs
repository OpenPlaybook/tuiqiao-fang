// 先把 check-content.ts 打包（它要读题库和故事），再跑
import { build } from 'esbuild';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const out = join(await mkdtemp(join(tmpdir(), 'content-')), 'check.mjs');
await build({ entryPoints: ['scripts/check-content.ts'], outfile: out, bundle: true, platform: 'node', format: 'esm', logLevel: 'warning' });
await import(out);
