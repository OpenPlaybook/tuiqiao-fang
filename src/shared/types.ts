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
export interface ChoiceSub extends SubBase { kind: 'choice'; opts: Opt[]; ok: number[]; multi?: boolean; keep?: boolean; fine?: number[]; cols?: number; master?: boolean; reveal?: 'all' | 'chosen' | 'ext'; py?: Record<string, string> }
/** 点出毛病：句子切成几段，点出有毛病的那段，再选改法 */
/** fixed：按选的改法（选项文字）显示改好的句子，~~删掉的~~、++加上的++ */
export interface SpotSub extends SubBase { kind: 'spot'; segs: string[]; bad: number[]; miss?: Record<number, string>; fix?: ChoiceSub; fixed?: Record<string, string> }
/** 分类：把卡片放进几个格子 */
/** scale：画成一条从贬到褒的色带，格子从左到右排（贬 → 中 → 褒），把词放到色带上的位置 */
export interface SortSub extends SubBase { kind: 'sort'; bins: string[]; cards: { t: string; bin: number; why: string }[]; scale?: boolean }
/** 连线：左边每一项配右边一项 */
export interface MatchSub extends SubBase { kind: 'match'; left: string[]; right: string[]; pairs: number[]; why: string; lh?: string; rh?: string }
/** 排序：items 按正确顺序写；tags 是排好以后显示的年份等 */
/** rank：每一项的名次（不写就是写的顺序）；名次一样的，谁先谁后都算对（同时发生、互不相干的几步） */
export interface OrderSub extends SubBase { kind: 'order'; items: string[]; tags?: string[]; why: string; rank?: number[] }
/** AI 误译：AI 的译文切成几段，有错的段写了正确意思 */
/** fixed：改好以后显示的样子，~~删掉的~~、++加上的++（不写就显示“划掉原文 + 正确意思”） */
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
/** 碎片拼接（概括、鉴赏），三层逐层检查：1 故事 / 内容（要讲对、讲全：ev 是它讲到的事，events 是必须讲到的事和缺了时的提醒）→ 2 人物 / 写法 → 3 更深的意思。
 *  ok=false 的是干扰（why 说错在哪）；need 是某一层一句都没有时的提醒。学生看不到“层”这个说法。 */
/** 拼句的顺序不卡死：第 1 层（事情）按 seq 排先后（不写就是写的顺序，seq 一样的可以互换）；第 2 层（评价）放在 after 那件事后面就行（不写就是放在第一件事后面）；第 3 层（总结）放在事情讲完以后 */
export interface Frag { t: string; layer: 1 | 2 | 3; ok: boolean; why?: string; ev?: string; seq?: number; after?: string }
export interface FragSub extends SubBase { kind: 'frag'; frags: Frag[]; events: Record<string, string>; need: Record<1 | 2 | 3, string>; model: string }
/** 长文本：文本里用 ⟨1|这几个字⟩ 把题针对的字、词、句标出来（下划线 + 编号），点哪个做哪个 */
export interface LongSub extends SubBase { kind: 'long'; text: string; qs: Record<string, ChoiceSub | TypeSub>; title?: string }
/** 讲：老师讲一小段（可以带例子、画面），和后面那一问一起出现 */
export interface TeachSub extends SubBase { kind: 'teach'; t: string; ex?: string[]; art?: Art }
export type Sub = ChoiceSub | SpotSub | SortSub | MatchSub | OrderSub | MisSub | WriteSub | FillSub | TypeSub | FragSub | LongSub | TeachSub;

export interface Item {
  id: string;
  st: StationId;
  lv: Lv;
  type: string; // 题型（同一题型连续做对两次就换）
  topic: string; // 知识点（同一知识点不重复出；竖屏视频按知识点）
  label: string; // 给老师看的短名
  intro: string; // 情境（**加粗**、___ 是空、\n 换行）
  art?: Art; // 情境图：点“不确定”或答完以后才出现
  steps: Sub[];
  hints: string[]; // “不确定”时依次给出
  explain: string; // 答完的总结
  know?: string; // 来历 / 涨知识
  ext?: Ext[]; // 拓展（居中弹窗里的小题）
  back?: Back[]; // 回扣：回到前面（可以是别的回）看一看
  ask?: string; // 停在这道题时，“问我”框里的示例问题
  /** 这道题做完之前先锁住的：words 是点开就等于给了答案的词条（在哪一句里点都只提示“做完题再看”）；lines 是中文翻译会泄露答案的那几句（按句号 id） */
  lock?: { words?: string[]; lines?: string[] };
}
/** 拓展：need 'always' 必做；'wrong' 答错过或点过“不确定”才必做；'opt' 选做。reveal：做完以后揭开这道题选项的解释 */
export interface Ext { id: string; title: string; need: 'always' | 'wrong' | 'opt'; steps: Sub[]; reveal?: boolean }
/** 回扣：跳到某一回的某一句（ch 回，line 句号），看完可以跳回来 */
export interface Back { ch: string; line: string; label: string }

// ---------------- 播放式故事（画面 + 配音 + 字幕，播到题就停） ----------------
/** 可点的字（AI 眼镜释义）：文本里写 ⟦词⟧；拼音直接注在字上写 ⟪字⟫。释义在一回的 gloss 表里 */
/** 可点的字。两层都记下来，老师能看出卡在字词还是卡在整句：
 *  d：这个字词本身的意思（点一下就看到，哪一句里点都一样）；py：读音。
 *  s：放在句子里怎么理解（再点“放在这句话里怎么理解”才展开）。按出处分条——键是这个字所在那句话里的一小段原文（原样照抄、把这个字包在里面），
 *     值是这一句里的理解；显示成“那段原文”：解释。点哪一处就找包住那一处的那一条，找不到就不显示第二层。见 src/shared/gloss.ts。
 *  more：这个字的别的用法（支线：讲一句 + 一个小问题，答对得 1 个探索分）；back：回扣到别的回的某一句 */
export interface Gloss { d: string; s?: Record<string, string>; py?: string; ex?: string; back?: Back; more?: { t: string; q: string; opts: [string, boolean][] } }
export interface Line {
  id?: string; // 回扣用的句号
  who?: string; // 说话人（旁白不写）
  t: string; // 字幕：⟦词⟧ 可点，⟪字⟫ 注拼音，**加粗**，___ 空
  read?: string; // 配音念的文字（默认是去掉标记的字幕；文言里的多音字在这里换成同音字）
  wy?: string; // 这句在《史记》里的原文：选“文言”“对照”时显示、配音念它（旁白、引导、题目不写，始终是白话）
  wyRead?: string; // 原文的配音文字（多音字换成同音字）
  tr?: string; // 英文故事：这句的中文意思。{……} 标出关键词（剩下的是句式），右边一块一块点开；{!……} 是题要考的那块，题做完才给
  trHard?: 'words' | 'frame'; // 这句难在词还是难在句式：部分翻译先给难的那部分（words 先给关键词，frame 先给句式）
  voice?: VoiceId; // 配音的声音，见 play/index.ts 的 VOICES
  shots?: [string, number?][]; // 分镜动画：这一句的几个镜头（镜头名，时长权重），见 src/film/shots*.ts 和 第六堂课/分镜/
  scene?: Art; // 换画面（旧的静态画，没有 shots 时才用）
  cam?: [number, number, number, number, number, number]; // 镜头推拉：起点 x%、y%、放大 → 终点 x%、y%、放大
  card?: { t: string; kind: 'yuan' | 'poem' | 'ai' | 'note'; by?: string }; // 画面上的卡片：原文、诗、AI 译文
  hide?: boolean; // 停在题上时，这句字幕藏起来（题里已经有这句话，不重复）
  task?: string[]; // 在这一句停下来做的题（几个难度版本）
  side?: string[]; // 支线任务：挂在这一句上、可做可不做的题（每个是一道题，不是难度版本）；不拦着故事往下走，做了也得星星。只为出支线题才有的句子（prompt）播放时跳过
  /** 出题句：只是为了出题才有的话（AI 眼镜的错译、错的小结、“___ 填什么”这类问句）。题做完以后再播就跳过，不念也不出字幕。
   *  true 是本句的题；写一个句号 id，就是跟着那一句的题（比如小结前面那句引子） */
  prompt?: true | string;
  pause?: number;
  ask?: string; // 播到这里以后，“问我”框里的示例问题（一直用到下一句有 ask 为止）
}
/** lang：zh 楚汉（讲解方式：白话 / 文言 / 对照）；en 英文故事（English / 中英对照，故事用英文配音，AI 眼镜的话用中文） */
/** endAsk：看完这一回，结束页上可以直接问 AI 眼镜的几个问题（看完了也能接着探索） */
export interface Play { id: string; lang?: 'zh' | 'en'; no: number; title: string; sub: string; color: string; lines: Line[]; gloss: Record<string, Gloss>; next?: string; nextNote?: string; endAsk?: string[] }
/** 中文：旁白（女）、男声、AI 眼镜；英文：旁白、Ben、Green 老师、刘师傅 */
export type VoiceId = 'n' | 'm' | 'ai' | 'en' | 'ben' | 'green' | 'liu' | 'max' | 'mia';


// ---------------- 竹简故事（旧版） ----------------
export interface Room { no: number; name: string; time: string; scene: Art }

// ---------------- 进度 ----------------
export interface LogEntry { id: string; q: string; v: string; ok: boolean | null; t: number }
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
export interface Player {
  roundId: string;
  revision: number;
  pid: string;
  token: string;
  name: string;
  sid: string; // 学校
  avatar: number;
  createdAt: number;
  recs: Record<string, Rec>;
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
/** 老师按两条大线开放：中文（楚汉五条线）、英文（Golden Panda）；all：任意看（不按进度，哪一站都能点开）。后面是旧的按回开放的键：已经存下的设置里还有它们，要能通过校验 */
export const STATION_IDS: StationId[] = ['zh', 'en', 'all', 'zh1', 'zh2', 'zh3', 'zh4', 'zh5', 'zh6', 'zh7', 'en1', 'en2', 'en3', 'en4'];
