// 先把 check-gloss.ts 打包（它要读题库和故事），再跑
import { build } from 'esbuild';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const out = join(await mkdtemp(join(tmpdir(), 'gloss-')), 'check.mjs');
await build({ entryPoints: ['scripts/check-gloss.ts'], outfile: out, bundle: true, platform: 'node', format: 'esm', logLevel: 'warning' });
await import(out);
