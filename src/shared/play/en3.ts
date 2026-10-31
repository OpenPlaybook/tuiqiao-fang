// 英文故事 The Case of the Golden Panda · Chapter 3 The Note（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）
// 一个用反了的词：纸条上写 Lent，可写纸条的人其实是“借进来”——她把 borrow 和 lend 用反了（第二章 Mia 就说过 Can you borrow me your pen?）。
// 语法：推理用 must / might / can’t；便条里省掉的词（Back at 3 = I’ll be back at three）。
import { C, Mt, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, Item, Play, TeachSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why]) => ({ t, a, why })) });
const T = (key: string, q: string, t: string, ex?: string[], art?: Art): TeachSub => ({ kind: 'teach', key, q, t, ...(ex ? { ex } : {}), ...(art ? { art } : {}) });

export const PLAY_EN3: Play = {
  id: 'en3', lang: 'en', no: 3, title: 'Chapter 3　The Note', sub: '一个用反了的词', color: '#6A4A7A', next: 'en4',
  endAsk: ['must、might、can’t 推理时怎么用？', '便条里为什么常常省掉词？', 'I bet 是什么意思？'],
  gloss: {
    stairs: { d: 'n. 楼梯', py: '/steəz/' },
    'between you': { d: '在你们俩中间' },
    'Let’s think': { d: '我们想一想' },
    owner: { d: 'n. 主人、物主（own 拥有 + -er）', py: '/ˈəʊnə/' },
    'Only Ms Green could lend it': { d: '只有 Green 老师能把它借出去：could 表示“有能力、有资格”。' },
    'Of course not': { d: '当然没有！（强烈否定）' },
    'I’d never lend': { d: '我绝不会借出去。I’d = I would；would never：绝不会。' },
    'top prize': { d: '最高奖' },
    'must be wrong': { d: '一定是错的：must be 表示很有把握的推断。' },
    Remember: { d: 'v. 记得；这里是“还记得……吗？”', py: '/rɪˈmembə/' },
    'mixes up': { d: '把……弄混（mix up：混在一起、搞混）' },
    meant: { d: 'mean 的过去式：本来想说……', py: '/ment/' },
    'on the cover': { d: '在封面上' },
    'Thx for the pen': { d: '谢谢你的笔（Thx 是 Thanks 的缩写，便条、短信里常用）' },
    'The same': { d: '同样的、一样的' },
    'It must be Mia': { d: '一定是 Mia：很有把握的推断用 must be。' },
    'why did she take': { d: '她为什么要拿……' },
    'might want': { d: '也许想要（might：可能，没多大把握）' },
    'I bet': { d: '我敢说、我打赌（很有把握）' },
    'between the flowers': { d: '在花丛中间' },
    shining: { d: '闪闪发光（shine 的 -ing 形式）', py: '/ˈʃaɪnɪŋ/' },
    jumps: { d: '吓了一跳（jump：跳；也说受惊时身子一跳）' },
    'Back at 3': { d: '三点回来：便条里省掉了 I’ll be（I’ll be back at three）。' },
    Lent: { d: 'lend 的过去式：借出去了。' },
  },
  lines: [
    { shots: [['e3.stairs', 1.2]], t: '**2:50 p.m.** You and Ben sit on the ⟦stairs⟧ with the yellow note ⟦between you⟧.', read: '2:50 p.m. You and Ben sit on the stairs with the yellow note between you.', tr: '两点五十。你和 Ben 坐在{楼梯}上，那张黄纸条放在{你们俩中间}。', trHard: 'words', voice: 'en', ask: '便条（note）一般怎么写？' },
    { shots: [['e3.benThink']], id: 'owner', who: 'Ben', voice: 'ben', t: '⟦Let’s think⟧. If M “lent” the panda, M was the ⟦owner⟧. ⟦Only Ms Green could lend it⟧.', read: 'Let’s think. If M lent the panda, M was the owner. Only Ms Green could lend it.', tr: '{我们想想}。如果是 M 把熊猫“借出去”的，那 M 就是{熊猫的主人}。{只有 Green 老师能把它借出去}。', trHard: 'frame', ask: '为什么“借出去”的人只能是 Green 老师？' },
    { shots: [['e3.office', 1.2]], t: 'You run back to the office. “Did you lend the Golden Panda to anyone, Ms Green?”', read: 'You run back to the office. Did you lend the Golden Panda to anyone, Ms Green?', tr: '你们跑回办公室：“Green 老师，您把金熊猫{借给}过谁吗？”', trHard: 'frame', voice: 'en' },
    { shots: [['e3.greenNo']], id: 'never', who: 'Ms Green', voice: 'green', t: 'Lend it? ⟦Of course not⟧! ⟦I’d never lend⟧ the ⟦top prize⟧ to anyone!', tr: '借出去？{当然没有}！{我绝不会把}{最高奖}借给任何人！', trHard: 'frame', task: ['e3-green'], ask: 'I’d 是哪两个词的缩写？' },
    { shots: [['e2.whisper']], who: 'Ben', voice: 'ben', t: '(quietly) So she didn’t lend it. Then the word on the note ⟦must be wrong⟧.', read: 'So she didn’t lend it. Then the word on the note must be wrong.', tr: '（小声）所以她没有借出去。那纸条上那个词，{一定是错的}。', trHard: 'frame' },
    { shots: [['e3.flashPen', 1.2]], id: 'remember', who: 'Ben', voice: 'ben', t: '⟦Remember⟧ Mia? “Can you borrow me your pen?” She ⟦mixes up⟧ borrow and lend!', read: 'Remember Mia? Can you borrow me your pen? She mixes up borrow and lend!', tr: '{还记得} Mia 吗？“Can you borrow me your pen?”她{把} borrow 和 lend {搞混了}！', trHard: 'frame', ask: 'borrow 和 lend 为什么容易用反？' },
    { shots: [['e2.noteAgain']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '如果写纸条的人把 borrow 和 lend 用反了，那她本来想写的是什么？___ the panda.', read: '如果写纸条的人把 borrow 和 lend 用反了，那她本来想写的是什么？', task: ['e3-meant'] },
    { shots: [['e3.noteFlip']], who: 'Ben', voice: 'ben', t: 'She wrote “Lent”, but she ⟦meant⟧ “Borrowed”! M didn’t lend the panda. M borrowed it!', read: 'She wrote Lent, but she meant Borrowed! M didn’t lend the panda. M borrowed it!', tr: '她写的是“Lent”，可她{本来想说}的是“Borrowed”！M 不是把熊猫借出去，是借走了它！', trHard: 'frame' },
    { shots: [['e3.cover', 1.2]], t: 'Ben looks down at your notebook. There is a small yellow note ⟦on the cover⟧: “⟦Thx for the pen⟧! — M”', read: 'Ben looks down at your notebook. There is a small yellow note on the cover. Thanks for the pen! M.', tr: 'Ben 低头看了看你的本子。{封面上}贴着一张黄色的小纸条：“{谢谢你的笔}！——M”', trHard: 'words', voice: 'en', ask: '这张纸条是谁什么时候贴的？' },
    { shots: [['e3.twoNotes']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '把两张纸条放在一起比一比：哪些地方一样？', task: ['e3-compare'] },
    { shots: [['e3.twoNotes']], id: 'must', who: 'Ben', voice: 'ben', t: '⟦The same⟧ yellow paper. The same M with a little curl. ⟦It must be Mia⟧!', tr: '{一样的}黄纸，一样的、带个小卷的 M。{一定是 Mia}！', trHard: 'frame', task: ['e3-must'], ask: 'must、might、can’t 有什么不一样？' },
    { shots: [['e3.youAsk']], t: 'But ⟦why did she take⟧ the panda? You think about it.', tr: '可她{为什么要拿走}熊猫呢？你想了想。', trHard: 'frame', voice: 'en' },
    { shots: [['e3.benIdea']], who: 'Ben', voice: 'ben', t: 'She’s from the school newspaper. She ⟦might want⟧ a photo of it for the front page!', tr: '她是校报的。她{也许想}给熊猫拍张照片，登在头版上！', trHard: 'words' },
    { shots: [['e3.benRun']], id: 'bet', who: 'Ben', voice: 'ben', t: 'She said the light in the garden was beautiful. ⟦I bet⟧ she’s there!', tr: '她说花园里的光特别好看。{我敢说}她就在那儿！', trHard: 'words' },
    { shots: [['e3.write']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '把你的推理写进侦探笔记：M 是谁？为什么？用一句英语写下来。', task: ['e3-write'] },
    { shots: [['e3.clock255']], t: '**2:55 p.m.** You and Ben run out into the garden.', read: '2:55 p.m. You and Ben run out into the garden.', tr: '两点五十五。你和 Ben 冲进了花园。', trHard: 'frame', voice: 'en' },
    { shots: [['e3.found', 1.4]], id: 'found', t: 'And there, ⟦between the flowers⟧, sits the Golden Panda, ⟦shining⟧ in the sun. Mia is taking photos of it.', read: 'And there, between the flowers, sits the Golden Panda, shining in the sun. Mia is taking photos of it.', tr: '就在那儿，{花丛中间}，金熊猫在阳光下{闪闪发光}。Mia 正在给它拍照。', trHard: 'words', voice: 'en', ask: 'Mia 为什么要在花园里拍熊猫？' },
    { shots: [['e3.miaJump']], who: 'Ben', voice: 'ben', t: 'Mia!', tr: 'Mia！', trHard: 'frame' },
    { shots: [['e3.miaJump']], t: 'Mia ⟦jumps⟧. Her camera almost falls into the flowers. The clock on the wall says 2:56.', read: 'Mia jumps. Her camera almost falls into the flowers. The clock on the wall says 2:56.', tr: 'Mia {吓了一跳}，相机差点掉进花丛。墙上的钟：两点五十六。', trHard: 'words', voice: 'en' },
    { shots: [['e3.endBoard']], who: 'AI 眼镜', voice: 'ai', t: '第三章到这里。熊猫找到了——可 Mia 为什么写“Lent”？Green 老师的“Yes, yes”又是怎么回事？下一章：Case Closed。', read: '第三章到这里。熊猫找到了，可 Mia 为什么写 Lent？Green 老师的 Yes, yes，又是怎么回事？下一章，Case Closed。', ask: 'Green 老师的 “Yes, yes” 和这件事有什么关系？' },
  ],
};

// ---------------- 拓展 ----------------
const EXT_GREEN: Ext[] = [
  { id: 'x1', title: '缩写：’d、’ll、’ve', need: 'always', steps: [
    T('t1', '', '说话时常把两个词缩成一个：**I’d** = I would（或 I had）；**I’ll** = I will；**I’ve** = I have；**she’s** = she is（或 she has）。', ['I’d never lend it. = I would never lend it.', 'I’ll be back at three. = I will be back at three.']),
    C('a', '“I’d never lend the top prize to anyone.” 里的 I’d 是——', [
      ['*I would', '对：would never，绝不会。'],
      ['I did', 'did 不缩写成 ’d。'],
      ['I had', 'I’d 有时是 I had，可后面跟的是动词原形 lend，所以是 I would。'],
    ], { keep: true }),
    Mt('b', '把缩写还原。', ['I’ll', 'I’ve', 'She’s taking photos.', 'She’s taken it.'], ['I will', 'I have', 'She is', 'She has'], [0, 1, 2, 3], 'she’s 看后面：taking（-ing）是 she is，taken（过去分词）是 she has。', { lh: '缩写', rh: '还原' }),
  ] },
];

const EXT_MEANT: Ext[] = [
  { id: 'x1', title: '一个词，翻转整个案子', need: 'always', steps: [
    T('t1', '', '纸条上写的是 **Lent**（借出去）。如果是真的，写纸条的人是熊猫的主人。可 Green 老师说她没借——那这个词就是写错了：写纸条的人其实是**借进来**的人。'),
    C('a', '写纸条的人本来想写——', [
      ['*Borrowed the panda.（我借走了熊猫）', '对。M 借走了熊猫，三点还回来。'],
      ['Lend the panda.', '还是“借出去”，只是时态变了。'],
      ['Stole the panda.', '偷，不会留条子说三点回来。'],
    ], { keep: true }),
    T('t2', '', '中文“借”一个字管两个方向，英语分成两个词。所以学英语的人最容易把它们用反：“Can you borrow me your pen?” 就是这样来的。'),
    fill('b', '同样分方向的词，填一填。', ['borrow', 'lend', 'learn', 'teach'], [
      ['Mr Liu, can I ___ your umbrella? It’s raining.', 'borrow', '东西往我这边来。'],
      ['Sure, I can ___ you my umbrella.', 'lend', '东西从我这边出去。'],
      ['Ben wants to ___ Chinese from you.', 'learn', '知识往他那边来：学。'],
      ['Can you ___ me how to use chopsticks?', 'teach', '知识从你那边出去：教。'],
    ]),
  ] },
  { id: 'x2', title: '别人用错的时候', need: 'opt', steps: [
    T('t1', '', '别人说错了，怎么帮他改又不让人难堪？Ben 用的办法：**You mean, “…”?** 把对的说法说一遍，不说“你错了”。'),
    C('a', '同学说 “I very like English.” 你想帮他改，哪一句最好？', [
      ['*Oh, you mean “I really like English”? Me too!', '对：把对的说法自然地说出来。'],
      ['That’s wrong! You can’t say that!', '太生硬，让人难堪。'],
      ['Ha ha, your English is bad.', '取笑别人，不是帮忙。'],
    ]),
  ] },
];

const EXT_COMPARE: Ext[] = [
  { id: 'x1', title: '比笔迹', need: 'always', steps: [
    T('t1', '', '侦探比两样东西，只看**一样的地方**还不够——还要问：这些一样，**别人也可能一样吗？** 黄色便利贴很多人都有，可“带个小卷的 M”就少见了。'),
    C('a', '哪一条线索最能说明两张纸条是同一个人写的？', [
      ['*一样的、带个小卷的 M', '对：笔迹是每个人自己的习惯，别人很难一样。'],
      ['都是黄色的便利贴', '很多人都用黄色便利贴。'],
      ['都写了英语', '大家都在写英语。'],
    ], { keep: true }),
    So('b', '这些线索，是很有力，还是只能参考？', ['很有力', '只能参考'], [
      ['the same handwriting', 0, '笔迹很难一样。'], ['Mia mixes up borrow and lend', 0, '和 Lent 用错正好对上。'],
      ['the same yellow paper', 1, '很多人都有。'], ['both notes are short', 1, '便条都短。'],
    ]),
  ] },
];

const EXT_MUST: Ext[] = [
  { id: 'x1', title: '推理的三档：must、might、can’t', need: 'always', steps: [
    T('t1', '', '侦探说话要分清有几成把握：**must be**（一定是，九成把握）；**might be / may be**（也许是，没多大把握）；**can’t be**（不可能是）。', ['It must be Mia.（证据很多）', 'It might be Max.（只是有可能）', 'It can’t be Ms Green.（她没借，也没写纸条）']),
    C('a', 'Green 老师说她绝不会把熊猫借出去，她的签名也不是带卷的 M。所以——', [
      ['*M can’t be Ms Green.', '对：有证据说明不是她，用 can’t be。'],
      ['M must be Ms Green.', '证据恰恰说明不是她。'],
      ['M might be Ms Green.', '证据已经排除了她。'],
    ], { keep: true }),
    fill('b', '填 must、might 或 can’t。', ['must', 'might', 'can’t'], [
      ['Max’s drum case had only a drum in it. The panda ___ be in his case.', 'can’t', '亲眼看过，不可能在里面。'],
      ['The same yellow paper, the same M… The note ___ be from Mia.', 'must', '证据很多，很有把握。'],
      ['Mia likes the garden. She ___ be there now — let’s go and see.', 'might', '只是有可能，要去看看。'],
    ]),
  ] },
  { id: 'x2', title: '中文里的“一定”“也许”“不可能”', need: 'opt', steps: [
    So('a', '把这些说法按把握大小分一分。', ['一定是（must）', '也许是（might）', '不可能是（can’t）'], [
      ['肯定是她', 0, '很有把握。'], ['十有八九是她', 0, '很有把握。'],
      ['说不定是她', 1, '没多大把握。'], ['可能是她', 1, '没多大把握。'],
      ['绝对不是她', 2, '排除了。'],
    ]),
  ] },
];

const EXT_WRITE: Ext[] = [
  { id: 'x1', title: '推理要有 because', need: 'opt', steps: [
    T('t1', '', '写推理，结论后面跟上理由：**M must be Mia because** the notes are on the same yellow paper and she mixes up borrow and lend.'),
    C('a', '哪一句推理写得最好？', [
      ['*M must be Mia because her notes have the same curly M.', '对：结论 + 理由。'],
      ['M is Mia.', '没有理由，也没说出把握。'],
      ['Mia must be M because I think so.', '“我觉得”不是证据。'],
    ]),
  ] },
];

export const PLAY_EN3_ITEMS: Item[] = [
  item({
    id: 'e3-green', st: 'en3', lv: 1, type: 'word', topic: 'I’d', label: 'I’d never lend …', intro: '', ask: 'I’d 是哪两个词？',
    hints: ['后面跟的是 lend（动词原形）。'],
    explain: 'I’d never lend = I would never lend：我绝不会借出去。I’d 后面跟动词原形时是 I would。',
    lock: { words: ['I’d never lend'] },
    ext: EXT_GREEN,
  }, C('a', 'Green 老师说 I’d never lend the top prize to anyone. 意思是——', [
    ['*我绝不会把最高奖借给任何人', '对：I’d = I would；would never：绝不会。'],
    ['我从来没借过最高奖', '这是 I’ve never lent，说过去的经历。'],
    ['我昨天没有借', '没有说昨天。'],
    ['我不知道借给谁了', '她是在否认借过。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e3-meant', st: 'en3', lv: 2, type: 'read', topic: 'lent / borrowed', label: '她本来想写的是什么', intro: '', ask: '为什么 Lent 是关键？',
    hints: ['Green 老师没借出去。那写纸条的人是借出去的，还是借进来的？'],
    explain: '写纸条的人其实是借走熊猫的人：她想写 Borrowed the panda，却写成了 Lent。M 不是主人，是借东西的人。',
    back: [{ ch: 'en2', line: 'mia', label: '第二章：Can you borrow me your pen?' }],
    lock: { words: ['Lent'] },
    ext: EXT_MEANT,
  }, C('a', '___ the panda. 写纸条的人本来想写——', [
    ['*Borrowed', '对：她借走了熊猫，三点还回来。'],
    ['Lent', '这正是纸条上写错的那个词。'],
    ['Stole', '偷东西的人不会留条子说三点回来。'],
    ['Lend', '还是“借出去”。'],
  ], { reveal: 'chosen' })),

  item({
    id: 'e3-compare', st: 'en3', lv: 2, type: 'read', topic: 'two notes', label: '两张纸条比一比', intro: '', ask: '笔迹为什么能当证据？',
    hints: ['看纸、看字母 M、看颜色。'],
    explain: '两张纸条都是黄色便利贴，签名都是带个小卷的 M。最有力的是笔迹：别人很难写得一模一样。',
    ext: EXT_COMPARE,
  }, C('a', '两张纸条，哪些地方一样？都选出来。', [
    ['*都是黄色的便利贴', '对。'],
    ['*签名都是一个带小卷的 M', '对：笔迹最有力。'],
    ['写的是同样的话', '一张写 Lent the panda，一张写 Thx for the pen。'],
    ['都写着时间', '只有第一张写了 Back at 3。'],
  ], { multi: true, cols: 1 })),

  item({
    id: 'e3-must', st: 'en3', lv: 2, type: 'word', topic: 'must be', label: 'It must be Mia!', intro: '', ask: 'must、might、can’t 怎么分？',
    hints: ['Ben 有几成把握？证据多不多？'],
    explain: 'must be：很有把握的推断。证据很多（同样的纸、同样的 M、Mia 又会把 borrow 和 lend 用反），所以 Ben 说 It must be Mia.',
    lock: { words: ['It must be Mia'] },
    ext: EXT_MUST,
  }, C('a', 'Ben 说 It must be Mia! 这里的 must 是——', [
    ['*很有把握的推断：一定是 Mia', '对。推理时 must be ＝ 一定是。'],
    ['必须是 Mia：规定要这样', 'must 有“必须”的意思，可这里是推理，不是规定。'],
    ['也许是 Mia', '“也许”是 might。'],
    ['不可能是 Mia', '“不可能”是 can’t。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e3-write', st: 'en3', lv: 2, type: 'write', topic: 'deduction', label: '写下推理', intro: '', ask: '推理怎么写才有说服力？',
    hints: ['M must be … because …'],
    explain: 'M must be Mia because the two notes have the same curly M (and she mixes up borrow and lend).',
    ext: EXT_WRITE,
  }, Wr('w', 'Write your deduction in English: who is M, and why? (one sentence)', {
    lang: 'en', role: 'en',
    task: 'In a school detective story, the student writes one English sentence of deduction: who wrote the note signed “M” (it was Mia, a Year 7 student who mixes up “borrow” and “lend”; her thank-you note has the same yellow paper and the same curly M). A good answer uses “must be” for a confident deduction and gives a reason with “because”.',
    criteria: ['names Mia as M', 'gives at least one reason (same handwriting / same curly M / same yellow paper / she mixes up borrow and lend / she wanted a photo)', 'uses must (be) for a confident deduction, or another clear way to show certainty; “M is Mia” without a reason is acceptable but should be encouraged to add “because …”'],
    examples: ['M must be Mia because the two notes have the same curly M.', 'M must be Mia, because she mixes up borrow and lend and the notes look the same.'],
    words: ['M must be', 'Mia', 'because'], frame: 'M must be ______ because ______ .', ph: 'M must be …',
  })),
];
