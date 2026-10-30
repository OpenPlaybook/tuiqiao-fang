// 题目、玩家进度的类型。学生端和服务器共用。

export type StationId = string; // 故事的一章（zh1、en1……）；旧题库的题号前缀（ci、cy……）只用作变式练习
export type Track = 'zh' | 'gu' | 'en'; // 中文、（旧：文言与历史）、英语
export type Lv = 1 | 2 | 3 | 4; // ★ ★★ ★★★ 👑

/** 画：键名 + 参数，由 art/ 里的画法生成 SVG（网站和竖屏视频共用） */
export type Art = string | { k: string; p?: Record<string, unknown>; cap?: string };

// ---------------- 小步骤 ----------------
export interface Opt { t: string; why: string; art?: Art }
interface SubBase { key: string; q: string }
/** 选择：单选或多选；每个选项都写了为什么对 / 为什么不对 */
export interface ChoiceSub extends SubBase { kind: 'choice'; opts: Opt[]; ok: number[]; multi?: boolean; keep?: boolean; fine?: number[]; cols?: 1 | 2; master?: boolean }
/** 点出毛病：句子切成几段，点出有毛病的那段，再选改法 */
export interface SpotSub extends SubBase { kind: 'spot'; segs: string[]; bad: number[]; miss?: Record<number, string>; fix?: ChoiceSub }
/** 分类：把卡片放进几个格子 */
export interface SortSub extends SubBase { kind: 'sort'; bins: string[]; cards: { t: string; bin: number; why: string }[] }
/** 连线：左边每一项配右边一项 */
export interface MatchSub extends SubBase { kind: 'match'; left: string[]; right: string[]; pairs: number[]; why: string; lh?: string; rh?: string }
/** 排序：items 按正确顺序写；tags 是排好以后显示的年份等 */
export interface OrderSub extends SubBase { kind: 'order'; items: string[]; tags?: string[]; why: string }
/** AI 误译：AI 的译文切成几段，有错的段写了正确意思 */
export interface MisSeg { t: string; bad?: { word: string; opts: string[]; ok: number; why: string } }
export interface MisSub extends SubBase { kind: 'mis'; src: string; segs: MisSeg[] }
/** 自己写：交给 AI 评 */
export interface WriteSub extends SubBase {
  kind: 'write';
  lang: 'zh' | 'en';
  role: 'rewrite' | 'why' | 'use' | 'en';
  task: string; // 给 AI 看的任务说明
  criteria: string[]; // 什么算好
  examples: string[]; // 好例子（不给学生看，给 AI 参考）
  words?: string[]; // 帮助一：关键词
  frame?: string; // 帮助二：句子框架
  model?: string; // 仿写的范句（学生能看到）
  ph?: string; // 输入框里的提示
  bonus?: boolean; // 只是加分（不写也能过关）
}
export type Sub = ChoiceSub | SpotSub | SortSub | MatchSub | OrderSub | MisSub | WriteSub;

export interface Item {
  id: string;
  st: StationId;
  lv: Lv;
  type: string; // 题型（同一题型连续做对两次就换）
  topic: string; // 知识点（同一知识点不重复出；竖屏视频按知识点）
  label: string; // 给老师看的短名
  intro: string; // 情境（**加粗**、___ 是空、\n 换行）
  art?: Art; // 情境图：点“不确定”或答完以后才出现
  pic?: Art; // 一开始就显示的图（成语故事、读诗、英语场景）
  steps: Sub[];
  hints: string[]; // “不确定”时依次给出
  explain: string; // 答完的总结
  know?: string; // 来历 / 涨知识
  slot?: number; // 竹简故事里的第几道谜
  slip?: string; // 竹简故事：解开以后拾回的竹简上写的字
  npc?: { good: string; bad: string }; // 英语：Ben 的反应
  node?: string; // 讲的是哪个知识点（KNode）
}

// ---------------- 知识点：老师怎么讲 ----------------
/** 学生点“哪里还不明白”：一个问题 → 简短的回答（可以带画面、例子） */
export interface Chip { q: string; a: string; viz?: Art; ex?: string[] }
/** 知识网里的一项：词、意思、例子 */
export interface WebItem { t: string; d: string; ex?: string; viz?: Art }
export interface KNode {
  id: string;
  name: string;
  line: 'zh' | 'en';
  teach: { viz?: Art; lines: string[]; ex?: string[] }; // 老师讲：画面 + 两三句话 + 例子
  chips: Chip[];
  web?: { title: string; groups: { name: string; items: WebItem[] }[] }; // 这个点的一家人
  practice: string[]; // 变式练习（题号），按能力挑
  ai?: { target: string; brief: string; words?: string[] }; // AI 再举例：讲什么、有什么要求、例句里必须出现的词
}
// ---------------- 故事 ----------------
export interface Beat { who?: string; t: string; art?: Art }
/** 一章：一段一段的故事，中间夹着题（同一道题的几个难度版本） */
export interface Chapter { id: string; line: 'zh' | 'en'; no: number; title: string; sub: string; scene: Art; color: string; flow: (Beat | { task: string[] })[]; end: Beat[]; next?: string }

// ---------------- 竹简故事（旧版） ----------------
export interface StoryBeat { who?: string; t: string } // 旁白或人物说的话
export interface StorySlot { no: number; room: number; before: StoryBeat[]; after: StoryBeat[]; slip: string; scene: Art }
export interface Room { no: number; name: string; time: string; scene: Art }

// ---------------- 进度 ----------------
export interface LogEntry { q: string; v: string; ok: boolean | null; t: number }
export interface Rec {
  id: string;
  st: StationId;
  status: 'doing' | 'done';
  stars: number;
  perf: number; // 0—1：用来估计能力
  unsure: number; // 点“不确定”的次数
  tries: Record<string, number>; // 每一步答了几次
  bonus: number; // 妙笔分
  prac?: boolean; // 变式练习
  log: LogEntry[];
  data?: Record<string, unknown>;
  t0: number;
  t1?: number;
}
export interface Vocab { known: string[]; fake: number; score: number; t: number }
export interface Player {
  pid: string;
  token: string;
  name: string;
  sid: string; // 学校
  avatar: number;
  createdAt: number;
  recs: Record<string, Rec>;
  vocab?: Vocab;
  updatedAt: number;
}
export interface GameConfig {
  open: Record<StationId, boolean>;
  attention: boolean;
  message: string;
  ai: boolean;
  aiReady?: boolean;
  aiLeft?: number;
}
export const STATION_IDS: StationId[] = ['zh1', 'zh2', 'zh3', 'zh4', 'zh5', 'zh6', 'zh7', 'en1', 'en2', 'en3', 'en4'];
