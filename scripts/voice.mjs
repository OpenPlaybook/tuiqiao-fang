// 生成播放式故事的配音：node scripts/voice.mjs
// 1. 把每一句要念的文字导出来；2. 用高中物化工程里的 Python（edge-tts）生成缺的 mp3；3. 量出每个文件的时长，写进 public/voice/index.json。
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
const r = await build({ stdin: { contents: "export { PLAYS, readText, voiceFile, VOICES } from './src/shared/play';", resolveDir: '.', loader: 'ts' }, bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'warning' });
const mod = { exports: {} }; new Function('module', 'exports', r.outputFiles[0].text)(mod, mod.exports);
const { PLAYS, readText, voiceFile, VOICES } = mod.exports;
const RATE = { n: '+14%', ai: '+14%', m: '+6%' };
const list = [];
for (const p of PLAYS) for (const l of p.lines) { const v = l.voice ?? 'n'; list.push({ file: voiceFile(l), text: readText(l), voice: VOICES[v], rate: RATE[v] }); }
fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/voice-lines.json', JSON.stringify(list, null, 1));
const PY = `${os.homedir()}/Desktop/高中物化/.venv/bin/python`;
execFileSync(PY, ['scripts/voice.py', 'build/voice-lines.json', 'public/voice', `${os.homedir()}/Desktop/高中物化/配音/多音字.js`], { stdio: 'inherit' });
