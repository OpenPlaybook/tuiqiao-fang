// 播放式故事：每一回一份（画面 + 配音 + 字幕，播到题就停）。
import type { Item, Play, VoiceId } from '../types';
import { PLAY_ZH1, PLAY_ZH1_ITEMS } from './zh1';
import { PLAY_ZH2, PLAY_ZH2_ITEMS } from './zh2';
import { PLAY_ZH3, PLAY_ZH3_ITEMS } from './zh3';
import { PLAY_ZH4, PLAY_ZH4_ITEMS } from './zh4';
import { PLAY_ZH5, PLAY_ZH5_ITEMS } from './zh5';
import { PLAY_ZH6, PLAY_ZH6_ITEMS } from './zh6';
import { PLAY_ZH7, PLAY_ZH7_ITEMS } from './zh7';
import { PLAY_EN1, PLAY_EN1_ITEMS } from './en1';

export const PLAYS: Play[] = [PLAY_ZH1, PLAY_ZH2, PLAY_ZH3, PLAY_ZH4, PLAY_ZH5, PLAY_ZH6, PLAY_ZH7, PLAY_EN1];
export const PLAY_BY_ID: Record<string, Play> = Object.fromEntries(PLAYS.map((p) => [p.id, p]));
/** 还没写好的回：目录上显示“制作中” */
export const PLANNED: { id: string; lang: 'zh' | 'en'; title: string; sub: string }[] = [
  { id: 'en2', lang: 'en', title: 'Chapter 2　Where were you?', sub: '好几个人都说自己不在场' },
  { id: 'en3', lang: 'en', title: 'Chapter 3　The Note', sub: '一个用反了的词' },
  { id: 'en4', lang: 'en', title: 'Chapter 4　Case Closed', sub: '真相与颁奖' },
];
// 每一回一个“记录”条目：学生点了哪些字、问了 AI 什么，都记在这里（不是题，不计分）
const logItem = (id: string): Item => ({ id: `${id}-log`, st: 'log', lv: 1, type: 'log', topic: `${id}-log`, label: '（记录）', intro: '', steps: [], hints: [], explain: '' });
export const PLAY_ITEMS = [...PLAY_ZH1_ITEMS, ...PLAY_ZH2_ITEMS, ...PLAY_ZH3_ITEMS, ...PLAY_ZH4_ITEMS, ...PLAY_ZH5_ITEMS, ...PLAY_ZH6_ITEMS, ...PLAY_ZH7_ITEMS, ...PLAY_EN1_ITEMS, ...PLAYS.map((p) => logItem(p.id))];
import { plainText } from '../gloss';
export { plainText };
/** 配音念的文字：___ 不念（前后的标点并成一个）；念起来不顺的句子在 read 里另写 */
export const readText = (l: { t: string; read?: string }) => (l.read ?? plainText(l.t)).replace(/_{3,}/g, '').replace(/[：，、]([。；！？，])/g, '$1');
/** 配音文件名用的哈希（和 scripts/voice.py 一样：按字符的 FNV-1a） */
export const fnv = (t: string) => { let h = 2166136261; for (const ch of t) { h ^= ch.codePointAt(0)!; h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); };
export const VOICES: Record<VoiceId, string> = {
  n: 'zh-CN-XiaoxiaoNeural', m: 'zh-CN-YunxiNeural', ai: 'zh-CN-XiaoyiNeural',
  en: 'en-US-AvaNeural', ben: 'en-GB-RyanNeural', green: 'en-GB-SoniaNeural', liu: 'en-US-ChristopherNeural',
};
/** 语速：中文 1.14 倍；英文给初二学生听，比正常稍慢 */
export const VOICE_RATE: Record<VoiceId, string> = { n: '+14%', ai: '+14%', m: '+6%', en: '-6%', ben: '-4%', green: '-6%', liu: '-8%' };
export const voiceFile = (l: { t: string; read?: string; voice?: VoiceId }) => `${l.voice ?? 'n'}-${fnv(readText(l))}.mp3`;
/** 讲解模式。楚汉：白话（现代汉语）、文言（有原文的句子用《史记》原文）、对照（原文，下面是白话）。
 *  英文故事按听力水平分三档（en0—en2）：无字幕（只听）→ 部分字幕（长一点的词只露首字母）→ 英文字幕。
 *  中文只在右边“看过的内容”里：每一句从播放器的那一档开始，一级一级往下点开——整句英文 → 部分翻译 → 全部翻译，不会一下子全给。 */
export type Mode = 'bh' | 'wy' | 'dz' | 'en0' | 'en1' | 'en2';
export const MODES: Record<'zh' | 'en', { m: Mode; t: string }[]> = {
  zh: [{ m: 'bh', t: '白话' }, { m: 'wy', t: '文言' }, { m: 'dz', t: '对照' }],
  en: [{ m: 'en0', t: '无字幕' }, { m: 'en1', t: '部分字幕' }, { m: 'en2', t: '英文字幕' }],
};
export const MODE_TIP = { zh: '白话：现代汉语讲；文言：出自《史记》的句子用原文讲、配音念原文；对照：原文下面附白话', en: '无字幕：只听；部分字幕：只露一部分词；英文字幕：整句英文。中文在右边：每一句都可以一级一级点开（先部分翻译，再全部翻译）。' };
/** 英文的这一档是第几级（0 只听、1 部分字幕、2 英文字幕；右边还能点开到 3 部分翻译、4 全部翻译） */
export const enLevel = (m: Mode) => (/^en\d$/.test(m) ? Number(m[2]) : 2);
/** 这一回用哪个讲解模式（中文、英文各记各的） */
export const modeKey = (lang: 'zh' | 'en') => (lang === 'en' ? 'tq-mode-en' : 'tq-mode');
/** 点开的英文单词念一遍：用旁白的声音 */
export const wordVoice = (w: string) => ({ t: w, voice: 'en' as VoiceId });
export const voiceLine = (l: { t: string; read?: string; wy?: string; wyRead?: string; voice?: VoiceId }, mode: Mode) => ((mode === 'wy' || mode === 'dz') && l.wy ? { t: l.wy, read: l.wyRead, voice: l.voice } : l);
