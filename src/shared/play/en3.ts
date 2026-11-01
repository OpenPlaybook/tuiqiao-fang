// 英文故事 The Case of the Golden Panda · Chapter 3 The Note（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）
// 一个用反了的词：纸条上写 Lent，可写纸条的人其实是“借进来”——她把 borrow 和 lend 用反了（第二章 Mia 就说过 Can you borrow me your pen?）。
// 语法：推理用 must / might / can’t；便条里省掉的词（Back at 3 = I’ll be back at three）。
import { C, Mt, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, Item, Play, TeachSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why]) => ({ t, a, why })) });
const viz = (k: string, p: Record<string, unknown> = {}) => ({ k, p });
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
    'a little curl': { d: '一个小卷：写字母时绕出来的小圈。两张纸条上的 M 都带着这个小卷——同一个人写的。' },
    'was taking photos': { d: '那时正在拍照：was + doing，说过去某一刻正在做的事。这是第二章 Mia 自己说的不在场证明。' },
    'We’ve found it': { d: '我们找到它了！have found：找到发生在刚才，结果就在眼前——熊猫现在就在这儿。和第一章的 has taken 一样，说的是现在的样子。' },
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
    { shots: [['e2.whisper']], who: 'Ben', voice: 'ben', t: '(quietly) So she didn’t lend it. Then the word on the note is wrong!', read: 'So she didn’t lend it. Then the word on the note is wrong!', tr: '（小声）所以她没有借出去。那纸条上那个词，{写错了}！', trHard: 'frame' },
    { shots: [['e3.flashPen', 1.2]], id: 'remember', who: 'Ben', voice: 'ben', t: '⟦Remember⟧ Mia? “Can you borrow me your pen?” She ⟦mixes up⟧ borrow and lend!', read: 'Remember Mia? Can you borrow me your pen? She mixes up borrow and lend!', tr: '{还记得} Mia 吗？“Can you borrow me your pen?”她{把} borrow 和 lend {搞混了}！', trHard: 'frame', ask: 'borrow 和 lend 为什么容易用反？', task: ['e3-mix'] },
    { shots: [['e2.noteAgain']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '如果写纸条的人把 borrow 和 lend 用反了，那她本来想写的是什么？___ the panda.', read: '如果写纸条的人把 borrow 和 lend 用反了，那她本来想写的是什么？', task: ['e3-meant'] },
    { shots: [['e3.noteFlip']], who: 'Ben', voice: 'ben', t: 'She wrote “Lent”, but she ⟦meant⟧ “Borrowed”! M didn’t lend the panda. M borrowed it!', read: 'She wrote Lent, but she meant Borrowed! M didn’t lend the panda. M borrowed it!', tr: '她写的是“Lent”，可她{本来想说}的是“Borrowed”！M 不是把熊猫借出去，是借走了它！', trHard: 'frame' },
    { shots: [['e3.cover', 1.2]], t: 'Ben looks down at your notebook. There is a small yellow note ⟦on the cover⟧: “⟦Thx for the pen⟧! — M”', read: 'Ben looks down at your notebook. There is a small yellow note on the cover. Thanks for the pen! M.', tr: 'Ben 低头看了看你的本子。{封面上}贴着一张黄色的小纸条：“{谢谢你的笔}！——M”', trHard: 'words', voice: 'en', ask: '这张纸条是谁什么时候贴的？' },
    { shots: [['e3.twoNotes']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '把两张纸条放在一起比一比：哪些地方一样？', task: ['e3-compare'] },
    { shots: [['e3.twoNotes']], id: 'must', who: 'Ben', voice: 'ben', t: '⟦The same⟧ yellow paper. The same M with a little curl. ⟦It must be Mia⟧!', tr: '{一样的}黄纸，一样的、带个小卷的 M。{一定是 Mia}！', trHard: 'frame', task: ['e3-must'], ask: 'must、might、can’t 有什么不一样？' },
    { side: ['e3-x-bring'], id: 'why', shots: [['e3.youAsk']], t: 'But ⟦why did she take⟧ the panda? You think about it.', tr: '可她{为什么要拿走}熊猫呢？你想了想。', trHard: 'frame', voice: 'en', task: ['e3-proof'] },
    { shots: [['e3.benIdea']], who: 'Ben', voice: 'ben', t: 'She’s from the school newspaper. She ⟦might want⟧ a photo of it for the front page!', tr: '她是校报的。她{也许想}给熊猫拍张照片，登在头版上！', trHard: 'words' },
    { shots: [['e3.benRun']], id: 'bet', who: 'Ben', voice: 'ben', t: 'At 2:15 she ⟦was taking photos⟧ in the garden. ⟦I bet⟧ she’s there!', tr: '两点一刻的时候，她{正在}花园里{拍照}。{我敢说}她就在那儿！', trHard: 'words', task: ['e3-guess'] },
    { shots: [['e3.write']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '把你的推理写进侦探笔记：M 是谁？为什么？用一句英语写下来。', task: ['e3-write'] },
    { shots: [['e3.clock255']], t: '**2:55 p.m.** You and Ben run out into the garden.', read: '2:55 p.m. You and Ben run out into the garden.', tr: '两点五十五。你和 Ben 冲进了花园。', trHard: 'frame', voice: 'en' },
    { shots: [['e3.found', 1.4]], id: 'found', t: 'And there, ⟦between the flowers⟧, sits the Golden Panda, ⟦shining⟧ in the sun. Mia is taking photos of it.', read: 'And there, between the flowers, sits the Golden Panda, shining in the sun. Mia is taking photos of it.', tr: '就在那儿，{花丛中间}，金熊猫在阳光下{闪闪发光}。Mia 正在给它拍照。', trHard: 'words', voice: 'en', ask: 'Mia 为什么要在花园里拍熊猫？', task: ['e3-find'] },
    { shots: [['e3.miaJump']], who: 'Ben', voice: 'ben', t: '⟦We’ve found it⟧! … Mia!', read: 'We’ve found it! Mia!', tr: '{我们找到它了}！……Mia！', trHard: 'words' },
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


// ---------------- 词汇：弄混、证据、有多大把握、找到（前面几章的词在这里再见） ----------------
const EXT_MIX: Ext[] = [
  { id: 'x1', title: '最容易弄混的几对词', need: 'always', steps: [
    T('t1', '', '“She mixes up borrow and lend!”——**mix up**：把两样东西弄混。mix up A and B，或者 mix A up with B。'),
    C('a', '“I always mix up their names.” 是——', [
      ['*我总把他们的名字弄混', '对：比如双胞胎的名字。'],
      ['我总把他们的名字写在一起', 'mix up 是弄混，不是写在一起。'],
    ], { keep: true }),
    T('t2', '', '中文里一个词、英语里两个方向的，最容易弄混。borrow / lend 是一对（东西往哪边走）。还有一对也看方向：**bring**（带来：往说话人这边）、**take**（带走：往别处去）。'),
    C('b', '你在家，妈妈说：“___ your umbrella when you go to school.”', [
      ['*Take', '对：伞要从家带到学校去，离开说话的妈妈：take。'],
      ['Bring', 'bring 是带到说话人这边来。'],
    ], { keep: true }),
    T('t3', '', '再一对：**lose**（丢了、输了）/ **miss**（错过、想念）。I lost my key.（钥匙丢了）I missed the bus.（没赶上车）'),
    fill('c', '放进句子。', ['lost', 'missed', 'brought', 'took'], [
      ['Hurry up, or we’ll be late! — Too late. We ___ the bus.', 'missed', '没赶上车：missed。'],
      ['Oh no, I ___ my phone. Have you seen it?', 'lost', '东西丢了：lost。'],
      ['Ben ___ some mooncakes to our class party.', 'brought', '带到我们这边来：brought。'],
      ['Dad ___ us to the zoo last Sunday.', 'took', '带我们去别处：took。'],
    ]),
    C('d', '找出用错的一句：', [
      ['*I lost the bus this morning.', '对，这句错了：没赶上车是 missed the bus。'],
      ['We lost the football match.', '这句没错：比赛输了，用 lost。'],
    ], { keep: true }),
  ] },
];

const EXT_PROOF: Ext[] = [
  { id: 'x1', title: '线索 → 证据 → 证明', need: 'always', steps: [
    T('t1', '', '第一章 Ben 说过：We need to write down every clue. 现在，线索一条条对上了：同样的黄纸、同样带小卷的 M。线索对上了，就成了 **evidence**（证据）。'),
    C('a', '两张纸条一样，对“M 是 Mia”来说，是——', [
      ['*evidence：支持这个说法的证据', '对。'],
      ['proof：已经百分之百证明了', '很有把握，可还没听 Mia 自己说，算不上 proof。'],
    ], { keep: true }),
    C('b', 'Ben 说 It must be Mia! 用 must，是因为——', [
      ['*证据很多，他非常有把握', '对：must be 是推出来的、很有把握的结论。'],
      ['他亲眼看见 Mia 拿走了熊猫', '他没看见，是推出来的。'],
    ], { keep: true }),
    T('t2', '', 'proof 的动词是 **prove**（证明）。第二章问不在场证明时，侦探常问：Can anyone prove it?（有人能证明吗？）'),
    fill('c', '放进句子。', ['clue', 'evidence', 'proof', 'prove'], [
      ['A yellow note under the table is our first ___.', 'clue', '一条提示：clue。'],
      ['The two notes look the same. That’s good ___.', 'evidence', '支持说法的证据：evidence（不可数）。'],
      ['Can you ___ that you were in the garden?', 'prove', '证明：动词 prove。'],
      ['A photo with the time on it is ___ that she was there.', 'proof', '足以让人相信的证明：proof。'],
    ]),
    C('d', '哪一句对？', [
      ['*There is not enough evidence.', '对：evidence 不可数，不加 s，也不说 an evidence。'],
      ['There are not enough evidences.', 'evidence 一般不加 s。'],
    ], { keep: true }),
  ] },
];

const EXT_GUESS: Ext[] = [
  { id: 'x1', title: '有多大把握', need: 'always', steps: [
    T('t1', '', '“I bet she’s there!”——**I bet …**：我敢说……，很有把握。说话人有几分把握，英语用不同的说法：', undefined, viz('meter', { items: [['Maybe …', 0.15], ['I guess …', 0.3], ['I think …', 0.5], ['I bet …', 0.75], ['It must be …', 0.88], ['I’m sure …', 0.96]] })),
    C('a', 'Ben 说 I bet she’s there! 他是——', [
      ['*很有把握：她一定在那儿', '对：I bet 不是真的打赌，是“我敢说”。'],
      ['要和你打赌，赢点钱', '口语里的 I bet 只是表示有把握。'],
    ], { keep: true }),
    C('b', '你只有一点点把握，最合适的是——', [
      ['*I guess she’s in the garden.', '对：I guess：我猜（不太确定）。'],
      ['I’m sure she’s in the garden.', 'I’m sure 是十拿九稳。'],
    ], { keep: true }),
    T('t2', '', '别人问你，你拿不准，也可以答：**I suppose so.**（大概是吧）/ **I’m not sure.**（我不确定）。'),
    { ...So('c', '把这些话放到色带上：没把握的在左边，很有把握的在右边。', ['没什么把握', '有点把握', '很有把握'], [
      ['Maybe she’s in the library.', 0, 'maybe：也许。'],
      ['I guess she’s busy.', 0, 'I guess：我猜。'],
      ['I think it’s Mia.', 1, 'I think：我认为。'],
      ['I bet she’s in the garden!', 2, 'I bet：我敢说。'],
      ['It must be Mia.', 2, 'must be：一定是。'],
    ]), scale: true },
    C('d', '“Will Ben eat another mooncake?” “___ He loves them!”', [
      ['*I bet he will!', '对：他那么爱吃，你很有把握。'],
      ['I guess not.', '他吃了九块还要吃，可不是“我猜不会”。'],
    ], { keep: true }),
  ] },
];

const EXT_FIND: Ext[] = [
  { id: 'x1', title: '找、找到、查明', need: 'always', steps: [
    T('t1', '', '中文说“找”，英语分得清清楚楚：**look for**（在找：过程）；**find**（找到了：结果）；**find out**（查明、弄清楚：一件事的真相）。'),
    C('a', '“We looked for the panda everywhere, and at last we found it.” 是——', [
      ['*我们到处找熊猫，最后终于找到了', '对：looked for 是找的过程，found 是结果。'],
      ['我们到处都找到了熊猫', 'looked for 只是在找。'],
    ], { keep: true }),
    C('b', '要说“我们查明了是谁写的纸条”，用——', [
      ['*We found out who wrote the note.', '对：弄清楚一件事，用 find out。'],
      ['We found who wrote the note.', '找到一个人用 find；弄清楚“是谁”这件事，用 find out。'],
    ], { keep: true }),
    T('t2', '', '刚找到、东西就在眼前，英国人会喊：**We’ve found it!**——第一章的 has taken 又来了：过去的事，现在的结果（东西现在就在这儿）。'),
    fill('c', '放进句子。', ['looking for', 'found', 'find out', 'have found'], [
      ['What are you ___? — My notebook.', 'looking for', '正在找：looking for。'],
      ['I ___ my notebook under the bed yesterday.', 'found', '昨天找到了：found。'],
      ['Let’s ___ what really happened at 2:15.', 'find out', '查明真相：find out。'],
      ['Look! We ___ the Golden Panda!', 'have found', '刚找到，就在眼前：have found。'],
    ]),
    C('d', '找出用错的一句：', [
      ['*I’m finding my keys. Can you help me?', '对，这句错了：正在找要说 I’m looking for my keys.'],
      ['Did you find your keys?', '这句没错：找到钥匙了吗？'],
    ], { keep: true }),
  ] },
];

export const PLAY_EN3_ITEMS: Item[] = [
  item({
    id: 'e3-mix', st: 'en3', lv: 2, type: 'word', topic: 'mix up', label: 'She mixes up borrow and lend', intro: '', ask: '还有哪些词容易弄混？',
    hints: ['点一点 mixes up。'],
    explain: 'mix up：把两样东西弄混。Mia 总把 borrow 和 lend 弄反。',
    back: [{ ch: 'en2', line: 'mean', label: '第二章：Ben 帮 Mia 把 borrow 改成 lend' }],
    lock: { words: ['mixes up'] },
    ext: EXT_MIX,
  }, C('a', '“She mixes up borrow and lend!” 是说 Mia——', [
    ['*总把 borrow 和 lend 弄混、用反', '对。'],
    ['把 borrow 和 lend 写在一起', 'mix up 是弄混。'],
    ['不会写 borrow 和 lend', '她会写，只是用反了。'],
    ['喜欢借东西', '说的是她用词。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e3-proof', st: 'en3', lv: 2, type: 'word', topic: 'evidence / proof', label: 'The same yellow paper', intro: '', ask: 'evidence 和 proof 有什么不一样？',
    hints: ['Ben 是亲眼看见了，还是推出来的？'],
    explain: '两张纸条一样，是支持“M 是 Mia”的 evidence（证据）；Ben 很有把握（must be），可还没听 Mia 自己说，算不上 proof（证明）。',
    back: [{ ch: 'en1', line: 'clue', label: '第一章：write down every clue' }],
    ext: EXT_PROOF,
  }, C('a', '两张纸条：同样的黄纸、同样带小卷的 M。对“M 是 Mia”来说，这是——', [
    ['*evidence：支持这个说法的证据', '对。'],
    ['proof：已经百分之百证明了', '还没听 Mia 自己说，算不上 proof。'],
    ['和案子没关系', '正好对上了纸条。'],
    ['一条错误的线索', '线索对上了。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e3-guess', st: 'en3', lv: 1, type: 'word', topic: 'I bet / I guess', label: 'I bet she’s there!', intro: '', ask: 'I bet、I guess、must be 有什么不一样？',
    hints: ['点一点 I bet。Ben 有几分把握？'],
    explain: 'I bet …：我敢说……，很有把握。不是真的打赌。',
    lock: { words: ['I bet'] },
    ext: EXT_GUESS,
  }, C('a', '“I bet she’s there!” 是说 Ben——', [
    ['*很有把握：她一定在那儿', '对。'],
    ['要和你打赌，赢点钱', 'I bet 只是表示有把握。'],
    ['猜不出她在哪儿', '他很有把握。'],
    ['很担心她', '说的是有几分把握。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e3-find', st: 'en3', lv: 1, type: 'word', topic: 'look for / find / find out', label: 'We’ve found it!', intro: '', ask: 'find 和 find out 有什么不一样？',
    hints: ['熊猫就在眼前：是“在找”，还是“找到了”？'],
    explain: '熊猫就在眼前：We’ve found it!（找到了，现在就在这儿）。look for 是在找，find out 是查明一件事。',
    ext: EXT_FIND,
  }, C('a', '你们终于看见了熊猫。你想喊“我们找到它了！”，英语最自然的是——', [
    ['*We’ve found it!', '对：刚找到，东西就在眼前。'],
    ['We’ve looked for it!', 'look for 只是在找。'],
    ['We found out it!', 'find out 是查明一件事，不说 found out it。'],
    ['We’re finding it!', '找到是一下子的事，不说 finding。'],
  ], { cols: 1, reveal: 'chosen' })),

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
  // ---------------- 支线任务：可做可不做（补词汇：词族、易混的词、挑错） ----------------
  item({
    id: 'e3-x-bring', st: 'en3', lv: 2, type: 'word', topic: 'bring / take', label: 'bring 还是 take', intro: '', ask: 'bring 和 take 怎么分？',
    hints: ['看东西是往说话的人这边来，还是从这里带到别处去。'],
    explain: 'take：把东西从这里带走、带到别处去；bring：把东西带到说话的人这里来。Mia took the panda to the garden；Green 老师在礼堂里会说：Please bring it back!',
  },
    T('t1', '', '“Why did she **take** the panda?”——**take**：拿走、带走，从这里带到别处去。**bring**：带来，带到说话的人这里来。', ['Mia took the panda to the garden.（从礼堂带到花园去）', 'Please bring it back to the hall!（Green 老师在礼堂：带回我这儿来）']),
    C('a', 'Green 老师站在礼堂里，着急地说——', [
      ['*Please bring it back here!', '对：带回她这里来，用 bring。'],
      ['Please take it back here!', '往说话的人这边来，用 bring。'],
    ], { keep: true }),
    C('b', '你出门上学，妈妈在门口说：“别忘了带伞！”', [
      ['*Don’t forget to take your umbrella!', '对：从家里带走，用 take。'],
      ['Don’t forget to bring your umbrella!', '妈妈在家，伞是从她这儿带走的，用 take。'],
    ], { keep: true }),
    fill('c', '放进句子。', ['took', 'brought', 'take'], [
      ['Mia ___ the panda to the garden to take photos.', 'took', '从礼堂带到花园去：took。'],
      ['Grandma opened the door and smiled: “You ___ me flowers! Thank you!”', 'brought', '带到说话的人这里来：brought。'],
      ['Please ___ this note to Ms Green in the office.', 'take', '从这里送到别处去：take。'],
    ]),
    T('t2', '', 'take 的用处特别多：**take** photos（拍照）、**take** a bus（坐公交车）、**take** a break（休息一下），还有第一章的 Someone has **taken** it!（拿走了）。'),
  ),
];
