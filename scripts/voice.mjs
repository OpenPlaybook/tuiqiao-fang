// 生成播放式故事的配音：node scripts/voice.mjs
// 1. 把每一句要念的文字导出来；2. 用高中物化工程里的 Python（edge-tts）生成缺的 mp3；3. 量出每个文件的时长，写进 public/voice/index.json。
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
const r = await build({ stdin: { contents: "export { PLAYS, readText, voiceFile, wordVoice, VOICES, VOICE_RATE } from './src/shared/play';", resolveDir: '.', loader: 'ts' }, bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'warning' });
const mod = { exports: {} }; new Function('module', 'exports', r.outputFiles[0].text)(mod, mod.exports);
const { PLAYS, readText, voiceFile, wordVoice, VOICES, VOICE_RATE: RATE } = mod.exports;
const list = [];
for (const p of PLAYS) for (const l of p.lines) {
  const v = l.voice ?? 'n';
  list.push({ file: voiceFile(l), text: readText(l), voice: VOICES[v], rate: RATE[v] });
  if (l.wy) { const w = { t: l.wy, read: l.wyRead, voice: l.voice }; list.push({ file: voiceFile(w), text: readText(w), voice: VOICES[v], rate: RATE[v] }); } // 文言 / 对照模式念原文
}
// 英文故事：点开的单词能听一遍发音
for (const p of PLAYS) if (p.lang === 'en') for (const w of Object.keys(p.gloss)) { const x = wordVoice(w); list.push({ file: voiceFile(x), text: readText(x), voice: VOICES[x.voice], rate: '-10%' }); }
fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/voice-lines.json', JSON.stringify(list, null, 1));
const PY = `${os.homedir()}/Desktop/高中物化/.venv/bin/python`;
execFileSync(PY, ['scripts/voice.py', 'build/voice-lines.json', 'public/voice', `${os.homedir()}/Desktop/高中物化/配音/多音字.js`], { stdio: 'inherit' });
