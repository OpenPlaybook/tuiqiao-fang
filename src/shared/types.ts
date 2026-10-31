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
/** reveal：答对以后其他选项的解释怎么显示——'all' 全部显示；'chosen' 只显示点过的（其余“问题不在这儿”）；'ext' 做完拓展才揭开 */
export interface ChoiceSub extends SubBase { kind: 'choice'; opts: Opt[]; ok: number[]; multi?: boolean; keep?: boolean; fine?: number[]; cols?: 1 | 2; master?: boolean; reveal?: 'all' | 'chosen' | 'ext'; py?: Record<string, string> }
/** 点出毛病：句子切成几段，点出有毛病的那段，再选改法 */
export interface SpotSub extends SubBase { kind: 'spot'; segs: string[]; bad: number[]; miss?: Record<number, string>; fix?: ChoiceSub }
/** 分类：把卡片放进几个格子 */
export interface SortSub extends SubBase { kind: 'sort'; bins: string[]; cards: { t: string; bin: number; why: string }[] }
/** 连线：左边每一项配右边一项 */
export interface MatchSub extends SubBase { kind: 'match'; left: string[]; right: string[]; pairs: number[]; why: string; lh?: string; rh?: string }
/** 排序：items 按正确顺序写；tags 是排好以后显示的年份等 */
export interface OrderSub extends SubBase { kind: 'order'; items: string[]; tags?: string[]; why: string }
/** AI 误译：AI 的译文切成几段，有错的段写了正确意思 */
export interface MisSeg { t: string; bad?: { word: string; opts: string[]; ok: number; why: string; fixed?: string } }
/** src 为空：不是翻译，是一段有毛病的文字（旁白稿），改对以后显示 fixed */
export interface MisSub extends SubBase { kind: 'mis'; src: string; segs: MisSeg[]; title?: string }
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
/** 选词填句：几句话、一组词 */
export interface FillSub extends SubBase { kind: 'fill'; bank: string[]; sents: { t: string; a: string; why: string }[] }
/** 打字短答：accept 里任意一个就算对；near：常见的“差一点”的答案和对应的提醒 */
export interface TypeSub extends SubBase { kind: 'type'; accept: string[]; near?: Record<string, string>; why: string; ph?: string }
/** 碎片拼接（概括、鉴赏）：碎片带层次标签 f 事实 / t 特点 / m 意义，x 是干扰；need 是缺了某层时的提醒（不点明“三步”） */
export interface FragSub extends SubBase { kind: 'frag'; frags: { t: string; tag: 'f' | 't' | 'm' | 'x'; why?: string }[]; need: Record<'f' | 't' | 'm', string>; model: string }
/** 长文本：文本里用 ⟨1⟩⟨2⟩ 标出题的位置，点哪个做哪个 */
export interface LongSub extends SubBase { kind: 'long'; text: string; qs: Record<string, ChoiceSub | TypeSub>; title?: string }
export type Sub = ChoiceSub | SpotSub | SortSub | MatchSub | OrderSub | MisSub | WriteSub | FillSub | TypeSub | FragSub | LongSub;

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
  ext?: Ext[]; // 拓展（居中弹窗里的小题）
  back?: Back[]; // 回扣：回到前面（可以是别的回）看一看
}
/** 拓展：need 'always' 必做；'wrong' 答错过或点过“不确定”才必做；'opt' 选做。reveal：做完以后揭开这道题选项的解释 */
export interface Ext { id: string; title: string; need: 'always' | 'wrong' | 'opt'; steps: Sub[]; reveal?: boolean }
/** 回扣：跳到某一回的某一句（ch 回，line 句号），看完可以跳回来 */
export interface Back { ch: string; line: string; label: string }

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
// ---------------- 播放式故事（画面 + 配音 + 字幕，播到题就停） ----------------
/** 可点的字（AI 眼镜释义）：文本里写 ⟦词⟧；拼音直接注在字上写 ⟪字⟫。释义在一回的 gloss 表里 */
export interface Gloss { d: string; py?: string; ex?: string; back?: Back }
export interface Line {
  id?: string; // 回扣用的句号
  who?: string; // 说话人（旁白不写）
  t: string; // 字幕：⟦词⟧ 可点，⟪字⟫ 注拼音，**加粗**，___ 空
  read?: string; // 配音念的文字（默认是去掉标记的字幕；文言里的多音字在这里换成同音字）
  voice?: 'n' | 'm' | 'ai'; // 旁白（女）、男声、AI 眼镜
  scene?: Art; // 换画面
  cam?: [number, number, number, number, number, number]; // 镜头推拉：起点 x%、y%、放大 → 终点 x%、y%、放大
  card?: { t: string; kind: 'yuan' | 'poem' | 'ai' | 'note'; by?: string }; // 画面上的卡片：原文、诗、AI 译文
  hide?: boolean; // 停在题上时，这句字幕藏起来（题里已经有这句话，不重复）
  task?: string[]; // 在这一句停下来做的题（几个难度版本）
  pause?: number;
}
export interface Play { id: string; no: number; title: string; sub: string; color: string; lines: Line[]; gloss: Record<string, Gloss>; next?: string; nextNote?: string }

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
  resetAt?: number; // 老师清空数据的时间：比它早建的、服务器上没有的学生，浏览器会自动退出
  aiReady?: boolean;
  aiLeft?: number;
}
export const STATION_IDS: StationId[] = ['zh1', 'zh2', 'zh3', 'zh4', 'zh5', 'zh6', 'zh7', 'en1', 'en2', 'en3', 'en4'];
