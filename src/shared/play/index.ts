// 播放式故事：每一回一份（画面 + 配音 + 字幕，播到题就停）。
import type { Item, Play } from '../types';
import { PLAY_ZH1, PLAY_ZH1_ITEMS } from './zh1';
import { PLAY_ZH6, PLAY_ZH6_ITEMS } from './zh6';

export const PLAYS: Play[] = [PLAY_ZH1, PLAY_ZH6];
export const PLAY_BY_ID: Record<string, Play> = Object.fromEntries(PLAYS.map((p) => [p.id, p]));
// 每一回一个“记录”条目：学生点了哪些字、问了 AI 什么，都记在这里（不是题，不计分）
const logItem = (id: string): Item => ({ id: `${id}-log`, st: 'log', lv: 1, type: 'log', topic: `${id}-log`, label: '（记录）', intro: '', steps: [], hints: [], explain: '' });
export const PLAY_ITEMS = [...PLAY_ZH1_ITEMS, ...PLAY_ZH6_ITEMS, ...PLAYS.map((p) => logItem(p.id))];
/** 去掉字幕里的标记：⟦词⟧ → 词，⟪字⟫ → 字，**加粗** → 加粗，⟨1|几个字⟩ → 几个字 */
export const plainText = (t: string) => t.replace(/⟨\d+\|([^⟩]*)⟩/g, '$1').replace(/⟨[^⟩]*⟩/g, '').replace(/⟦([^⟧]*)⟧/g, '$1').replace(/⟪([^⟫]*)⟫/g, '$1').replace(/\*\*/g, '');
/** 配音念的文字：___ 不念（前后的标点并成一个）；念起来不顺的句子在 read 里另写 */
export const readText = (l: { t: string; read?: string }) => (l.read ?? plainText(l.t)).replace(/_{3,}/g, '').replace(/[：，、]([。；！？，])/g, '$1');
/** 配音文件名用的哈希（和 scripts/voice.py 一样：按字符的 FNV-1a） */
export const fnv = (t: string) => { let h = 2166136261; for (const ch of t) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); };
export const VOICES = { n: 'zh-CN-XiaoxiaoNeural', m: 'zh-CN-YunxiNeural', ai: 'zh-CN-XiaoyiNeural' } as const;
export const voiceFile = (l: { t: string; read?: string; voice?: 'n' | 'm' | 'ai' }) => `${l.voice ?? 'n'}-${fnv(readText(l))}.mp3`;
