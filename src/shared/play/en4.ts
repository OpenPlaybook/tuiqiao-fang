// 英文故事 The Case of the Golden Panda · Chapter 4 Case Closed（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）
// 真相：两点十分 Mia 问正在打电话的 Green 老师“能借熊猫拍张照吗”，Green 老师随口说了“Yes, yes”；Mia 写纸条时把 borrow 写成了 lent；灯灭时纸条掉到了桌子底下。
// 语法：英式说时间（ten past two）、too … to、最高级 + ever、道歉和回应。
import { C, Mt, Od, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, Item, Play, TeachSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why]) => ({ t, a, why })) });
const T = (key: string, q: string, t: string, ex?: string[], art?: Art): TeachSub => ({ kind: 'teach', key, q, t, ...(ex ? { ex } : {}), ...(art ? { art } : {}) });

export const PLAY_EN4: Play = {
  id: 'en4', lang: 'en', no: 4, title: 'Chapter 4　Case Closed', sub: '真相与颁奖', color: '#A86A2E',
  endAsk: ['ten past two、quarter to three 怎么说？', 'too … to 是什么意思？', '道歉的时候英语怎么说？'],
  gloss: {
    'holds her camera tight': { d: '紧紧抱着她的相机（tight：紧紧地）' },
    'goes red': { d: '（脸）红了。go + 颜色：变成……' },
    steal: { d: 'v. 偷（过去式 stole）', py: '/stiːl/' },
    'for a photo': { d: '为了拍一张照片' },
    'said yes': { d: '答应了（说了“好”）' },
    'ten past two': { d: '两点十分。英式说时间：分钟 + past + 钟点（过了几点几分）。', more: { t: '过了半点，常说 to：quarter to three（差一刻三点，2:45）、ten to three（差十分三点，2:50）。', q: '“twenty to four” 是几点？', opts: [['3:40', true], ['4:20', false]] } },
    'was on the phone': { d: '在打电话' },
    'stuck it on the table': { d: '把它贴在桌子上（stick 的过去式 stuck）' },
    'you lent nothing': { d: '你什么也没借出去' },
    'mix them up': { d: '把它们搞混' },
    'fell off': { d: '掉下来（fall 的过去式 fell + off：从……上掉下）' },
    'in the dark': { d: '在黑暗中' },
    'until you did': { d: '直到你看见了它（did 代替 saw it）' },
    'drops the phone': { d: '手机掉了（drop：没拿住、掉下）' },
    'Where was it': { d: '它在哪儿？' },
    'I’m so sorry': { d: '真对不起（so 加强语气）' },
    'didn’t ask clearly': { d: '没问清楚' },
    'my fault': { d: '我的错', py: '/fɔːlt/' },
    'too busy to listen': { d: '太忙了，没顾上听：too + 形容词 + to do，太……而不能……' },
    'Case closed': { d: '结案了！（侦探故事的常用说法）' },
    'Everyone is sitting down': { d: '大家都坐好了' },
    'the best story': { d: '最好的故事（good — better — best）' },
    'goes to': { d: '（奖）颁给……' },
    claps: { d: 'v. 鼓掌', py: '/klæps/' },
    'Well done': { d: '干得好！' },
    detective: { d: 'n. 侦探', py: '/dɪˈtektɪv/' },
    'just in time': { d: '正好赶上、及时' },
    'front page': { d: '（报纸的）头版' },
    'the most beautiful photo I’ve ever taken': { d: '我拍过的最美的一张照片：the most + 形容词 + I’ve ever done，“我（到现在为止）……过的最……”' },
    'I’ve only eaten nine': { d: '我才吃了九块（到现在为止）：have eaten 说到现在为止的数量。' },
  },
  lines: [
    { shots: [['e4.miaRed', 1.2]], t: '**2:56 p.m.** Mia ⟦holds her camera tight⟧. Her face ⟦goes red⟧.', read: '2:56 p.m. Mia holds her camera tight. Her face goes red.', tr: '两点五十六。Mia {紧紧抱着她的相机}，{脸红了}。', trHard: 'words', voice: 'en', ask: 'go red 为什么用 go？' },
    { shots: [['e4.miaCU']], id: 'steal', who: 'Mia', voice: 'mia', t: 'I… I didn’t ⟦steal⟧ it! I borrowed it ⟦for a photo⟧. Ms Green ⟦said yes⟧!', read: 'I… I didn’t steal it! I borrowed it for a photo. Ms Green said yes!', tr: '我……我没有{偷}！我是借来{拍照}的。Green 老师{答应了}！', trHard: 'words', task: ['e4-steal'], ask: 'steal 和 borrow 差在哪？' },
    { shots: [['e4.benAsk']], who: 'Ben', voice: 'ben', t: 'When did she say yes?', tr: '她什么时候答应的？', trHard: 'frame' },
    { shots: [['e4.flashAsk', 1.4]], id: 'ten', who: 'Mia', voice: 'mia', t: 'At ⟦ten past two⟧. She ⟦was on the phone⟧. I asked, “Can I borrow the panda for a photo?” and she said, “Yes, yes.”', read: 'At ten past two. She was on the phone. I asked, can I borrow the panda for a photo? And she said, yes, yes.', tr: '{两点十分}。她{正在打电话}。我问：“我能借熊猫拍张照吗？”她说：“好，好。”', trHard: 'words', task: ['e4-ten'], ask: '英式英语怎么说时间？' },
    { shots: [['e4.remember']], t: 'So that was the “yes, yes”! You remember Ms Green on the phone.', read: 'So that was the yes, yes! You remember Ms Green on the phone.', tr: '原来那句“好，好”是这么回事！你想起了打电话的 Green 老师。', trHard: 'frame', voice: 'en' },
    { shots: [['e4.flashNote', 1.2]], who: 'Mia', voice: 'mia', t: 'Then I wrote a note and ⟦stuck it on the table⟧: “Lent the panda. Back at 3.”', read: 'Then I wrote a note and stuck it on the table. Lent the panda. Back at three.', tr: '然后我写了一张纸条，{贴在桌子上}：“熊猫借出去了。三点回来。”', trHard: 'words' },
    { shots: [['e4.benKind']], who: 'Ben', voice: 'ben', t: '(kindly) Mia, ⟦you lent nothing⟧. You borrowed it!', read: 'Mia, you lent nothing. You borrowed it!', tr: '（温和地）Mia，{你什么也没借出去}，你是借进来的！', trHard: 'frame' },
    { shots: [['e4.miaCU']], who: 'Mia', voice: 'mia', t: 'Oh no… borrow, lend… I always ⟦mix them up⟧!', read: 'Oh no… borrow, lend… I always mix them up!', tr: '哎呀……borrow，lend……我总是{把它们搞混}！', trHard: 'words' },
    { shots: [['e4.noteFall', 1.2]], t: 'At 2:15, when Max tripped, the note ⟦fell off⟧ the table ⟦in the dark⟧. Nobody saw it — ⟦until you did⟧.', read: 'At 2:15, when Max tripped, the note fell off the table in the dark. Nobody saw it, until you did.', tr: '两点一刻 Max 被绊倒的时候，纸条{在黑暗中}从桌上{掉了下来}。谁也没看见——{直到你发现了它}。', trHard: 'words', voice: 'en' },
    { shots: [['e4.timeline']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '真相都齐了。把这件事从头到尾，按时间顺序排一排。', task: ['e4-order'] },
    { shots: [['e4.runHall', 1.2]], t: '**2:58 p.m.** You all run back to the hall. Ms Green sees the panda and ⟦drops the phone⟧.', read: '2:58 p.m. You all run back to the hall. Ms Green sees the panda and drops the phone.', tr: '两点五十八。你们一起跑回礼堂。Green 老师一看见熊猫，{手机都掉了}。', trHard: 'words', voice: 'en' },
    { shots: [['e4.greenJoy']], who: 'Ms Green', voice: 'green', t: 'The Golden Panda! ⟦Where was it⟧?', tr: '金熊猫！{它去哪儿了}？', trHard: 'frame' },
    { shots: [['e4.sorry', 1.2]], who: 'Mia', voice: 'mia', t: '⟦I’m so sorry⟧, Ms Green. I asked you, but I ⟦didn’t ask clearly⟧.', tr: '{真对不起}，Green 老师。我问过您，可我{没问清楚}。', trHard: 'words', ask: '英语里道歉有哪些说法？' },
    { shots: [['e4.greenSorry']], id: 'too', who: 'Ms Green', voice: 'green', t: 'No, Mia — it was ⟦my fault⟧ too. I was ⟦too busy to listen⟧.', read: 'No, Mia, it was my fault too. I was too busy to listen.', tr: '不，Mia——这也是{我的错}。我当时{太忙了，没顾上听}。', trHard: 'frame', task: ['e4-too'], ask: 'too … to 是什么意思？' },
    { shots: [['e4.benClose']], who: 'Ben', voice: 'ben', t: 'And Max made the lights go out, and the note fell under the table. ⟦Case closed⟧!', read: 'And Max made the lights go out, and the note fell under the table. Case closed!', tr: 'Max 把灯弄灭了，纸条又掉到了桌子底下。{结案}！', trHard: 'words' },
    { shots: [['e4.hall', 1.2]], t: '**3:00 p.m.** The lights in the hall are on. ⟦Everyone is sitting down⟧.', read: '3:00 p.m. The lights in the hall are on. Everyone is sitting down.', tr: '三点整。礼堂的灯亮着，{大家都坐好了}。', trHard: 'frame', voice: 'en' },
    { shots: [['e4.stage', 1.2]], id: 'best', who: 'Ms Green', voice: 'green', t: 'And the Golden Panda for ⟦the best story⟧ ⟦goes to⟧…', read: 'And the Golden Panda for the best story goes to…', tr: '金熊猫——{最佳故事奖}——{颁给}……', trHard: 'frame', task: ['e4-best'], ask: 'good、better、best 怎么变？' },
    { shots: [['e4.winner', 1.4]], t: '…your story! Everyone ⟦claps⟧. Ben jumps up and shouts, “⟦Well done⟧, ⟦detective⟧!”', read: 'Your story! Everyone claps. Ben jumps up and shouts, well done, detective!', tr: '……你的故事！全场{鼓掌}。Ben 跳起来大喊：“{干得好}，{大侦探}！”', trHard: 'words', voice: 'en' },
    { shots: [['e4.greenThanks']], who: 'Ms Green', voice: 'green', t: 'And thank you, our two detectives. You found our panda ⟦just in time⟧!', tr: '还要谢谢我们的两位侦探。你们{正好赶在颁奖前}找回了熊猫！', trHard: 'words' },
    { shots: [['e4.photo', 1.2]], id: 'ever', who: 'Mia', voice: 'mia', t: 'And here’s my photo for the ⟦front page⟧. It’s ⟦the most beautiful photo I’ve ever taken⟧!', read: 'And here’s my photo for the front page. It’s the most beautiful photo I’ve ever taken!', tr: '这是我给{头版}拍的照片。这是{我拍过的最美的一张}！', trHard: 'frame', task: ['e4-ever'], ask: 'the most … I’ve ever … 怎么用？' },
    { shots: [['e4.write']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '侦探笔记的最后一行：用一两句英语，写下金熊猫到底是怎么“不见”的。', task: ['e4-write'] },
    { shots: [['e4.mooncake', 1.2]], who: 'Ben', voice: 'ben', t: 'Now, can I have a mooncake? ⟦I’ve only eaten nine⟧!', read: 'Now, can I have a mooncake? I’ve only eaten nine!', tr: '好啦，我能吃块月饼了吗？{我才吃了九块}！', trHard: 'frame', ask: 'Ben 为什么说 I’ve only eaten nine？' },
    { shots: [['e4.endBoard', 1.4]], who: 'AI 眼镜', voice: 'ai', t: '案子破了。回头看看：has taken、was eating、borrow 和 lend、must be……每一个词，都是一条线索。', read: '案子破了。回头看看，has taken，was eating，borrow 和 lend，must be，每一个词，都是一条线索。', ask: '这四章里，你觉得哪个词是最关键的线索？' },
  ],
};

// ---------------- 拓展 ----------------
const EXT_STEAL: Ext[] = [
  { id: 'x1', title: 'steal、borrow、take', need: 'always', steps: [
    T('t1', '', '**steal**：偷——没经过同意，拿走了不打算还；**borrow**：借——经过同意，用完还回来；**take**：拿走——只说动作，不管同不同意。', ['Someone has taken it!（Green 老师：不知道是偷还是借）', 'I didn’t steal it. I borrowed it.（Mia：我是借的）']),
    C('a', 'Mia 说 I didn’t steal it! I borrowed it. 她想说明——', [
      ['*她问过、得到了同意，还打算还回来', '对：borrow 是经过同意、要还的。'],
      ['她没有拿熊猫', '她拿了，只是说不是偷。'],
    ], { keep: true }),
    fill('b', '填 steal、borrow 或 take（注意形式）。', ['stole', 'borrowed', 'took'], [
      ['The thief ___ a phone from the shop and ran away.', 'stole', '没经过同意：偷。'],
      ['I ___ a book from the library. I’ll give it back on Monday.', 'borrowed', '经过同意、要还：借。'],
      ['Mia ___ the panda to the garden.', 'took', '只说拿到哪儿去了。'],
    ]),
  ] },
];

const EXT_TEN: Ext[] = [
  { id: 'x1', title: '英式说时间：past 和 to', need: 'always', steps: [
    T('t1', '', '英国人说时间，常用 **past**（过了）和 **to**（差）：前半小时用 past，后半小时用 to。也可以直接读数字：two ten、two forty-five。', ['2:10 → ten past two', '2:15 → quarter past two', '2:30 → half past two', '2:45 → quarter to three', '2:50 → ten to three']),
    C('a', '“quarter to three” 是——', [
      ['*2:45（差一刻三点）', '对：to 是“差”，quarter 是一刻（十五分钟）。'],
      ['3:15', '那是 quarter past three。'],
      ['3:45', 'to three 是差几分到三点。'],
    ], { keep: true }),
    Mt('b', '连一连。', ['2:15', '2:20', '2:30', '2:40'], ['quarter past two', 'twenty past two', 'half past two', 'twenty to three'], [0, 1, 2, 3], '前半小时 past，后半小时 to；15 分是 quarter，30 分是 half。', { lh: 'Time', rh: 'British way' }),
  ] },
  { id: 'x2', title: '这个故事的时间表', need: 'opt', steps: [
    fill('a', '用英式说法填。', ['ten past two', 'quarter past two', 'twenty past two', 'twenty to three'], [
      ['Mia asked Ms Green at ___.', 'ten past two', '2:10。'],
      ['The lights went out at ___.', 'quarter past two', '2:15。'],
      ['Mr Liu saw Max at ___.', 'twenty past two', '2:20。'],
      ['Ms Green found the panda was gone at ___.', 'twenty to three', '2:40。'],
    ]),
  ] },
];

const EXT_ORDER: Ext[] = [
  { id: 'x1', title: '用 first、then、after that 讲一遍', need: 'opt', steps: [
    T('t1', '', '讲一件事的经过，用 **First / Then / After that / Finally** 把步骤串起来，听的人就清楚了。'),
    C('a', '哪一段讲得最清楚？', [
      ['*First, Mia asked Ms Green. Then she took the panda and wrote a note. After that, the note fell off. Finally, we found the panda in the garden.', '对：顺序清楚，一步接一步。'],
      ['Mia took the panda, we found it, she asked, the note fell.', '顺序乱了。'],
    ]),
  ] },
];

const EXT_TOO: Ext[] = [
  { id: 'x1', title: 'too … to：太……而没能……', need: 'always', steps: [
    T('t1', '', '**too + 形容词 + to do**：太……，所以没能（做某事）。I was too busy to listen. = 我太忙了，没顾上听。句子里没有 not，意思却是否定的。', ['I was too tired to walk. 我太累了，走不动了。', 'The box is too heavy to carry. 箱子太重，搬不动。']),
    C('a', '“The panda was too heavy to carry with one hand.” 意思是——', [
      ['*熊猫太重了，一只手拿不动', '对：too … to，太……而不能……'],
      ['熊猫很重，可一只手也能拿', 'too … to 是“不能”。'],
    ], { keep: true }),
    fill('b', '用 too … to 或 enough to 填。', ['too', 'enough'], [
      ['Ben was ___ excited to sit still.', 'too', '太激动了，坐不住。'],
      ['The drum case was big ___ to hold a panda.', 'enough', '足够大，装得下。'],
      ['Mia was ___ shy to say sorry at first.', 'too', '太害羞，一开始没好意思道歉。'],
    ]),
  ] },
  { id: 'x2', title: '道歉和回应', need: 'opt', steps: [
    T('t1', '', '道歉：**I’m so sorry.** / **It was my fault.** / **I didn’t mean to …**（我不是故意的）。回应：**That’s all right.** / **Never mind.** / **It was my fault too.**'),
    Mt('a', '道歉和回应连一连。', ['I’m so sorry I’m late.', 'Sorry, I broke your pencil.', 'I didn’t mean to take your seat.'], ['That’s all right. The class hasn’t started.', 'Never mind. I have another one.', 'No problem. You can sit here.'], [0, 1, 2], '对方道歉时，常用 That’s all right / Never mind / No problem 回应。', { lh: 'Sorry', rh: 'Reply' }),
  ] },
];

const EXT_BEST: Ext[] = [
  { id: 'x1', title: 'good — better — best', need: 'always', steps: [
    T('t1', '', '比较：两个比用 **-er / more**（better、more beautiful），三个以上挑一个用 **the -est / the most**（the best、the most beautiful）。有几个词不规则：good — better — best；bad — worse — worst。'),
    C('a', '三篇决赛作品里挑一篇，所以是——', [
      ['*the best story', '对：三篇以上挑最好的，用最高级。'],
      ['the better story', '两个比较才用 better。'],
      ['the goodest story', 'good 不能加 -est，要用 best。'],
    ], { keep: true }),
    fill('b', '填对的形式。', ['better', 'best', 'worse', 'most'], [
      ['Your story is ___ than mine.', 'better', '两个比：better than。'],
      ['It’s the ___ story in the festival.', 'best', '最好：the best。'],
      ['My cold is ___ today than yesterday.', 'worse', 'bad — worse — worst。'],
      ['It’s the ___ exciting day of the year.', 'most', '长形容词用 the most。'],
    ]),
  ] },
];

const EXT_EVER: Ext[] = [
  { id: 'x1', title: 'the most … I’ve ever …', need: 'always', steps: [
    T('t1', '', '“我（到现在为止）……过的最……”：**the + 最高级 + 名词 + I’ve ever + 过去分词**。ever 是“曾经、从来”，和 have done 搭配，说的是到现在为止。', ['It’s the best story I’ve ever read.', 'He is the funniest person I’ve ever met.']),
    C('a', 'Mia 说 It’s the most beautiful photo I’ve ever taken! 意思是——', [
      ['*这是我拍过的最美的一张照片', '对：到现在为止拍过的所有照片里，这张最美。'],
      ['我永远拍不出这么美的照片', 'ever 在这里是“曾经”，说的是到现在为止。'],
      ['这张照片是我第一次拍', '没说是第一次。'],
    ], { keep: true }),
    fill('b', '把句子补全。', ['eaten', 'read', 'seen', 'met'], [
      ['This is the best mooncake I’ve ever ___! — Ben', 'eaten', 'eat — ate — eaten。'],
      ['It’s the most exciting story I’ve ever ___.', 'read', 'read 的过去分词还是 read，读 /red/。'],
      ['It’s the biggest drum I’ve ever ___.', 'seen', 'see — saw — seen。'],
      ['Ben is the funniest person I’ve ever ___.', 'met', 'meet — met — met。'],
    ]),
  ] },
];

const EXT_WRITE: Ext[] = [
  { id: 'x1', title: '四章回顾：每个词都是线索', need: 'opt', steps: [
    So('a', '这些词，在哪一章当了线索？', ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4'], [
      ['has taken：现在还不在', 0, '第一章：熊猫被拿走了，到现在还不在。'],
      ['was eating：那一刻正在吃', 0, '第一章：灯灭时 Ben 在吃月饼。'],
      ['while I was carrying：搬鼓时被绊倒', 1, '第二章：Max 让灯灭了。'],
      ['Can you borrow me your pen?', 1, '第二章：Mia 把 borrow 和 lend 用反了。'],
      ['must be：很有把握的推断', 2, '第三章：It must be Mia!'],
      ['ten past two：两点十分', 3, '第四章：Mia 问 Green 老师的时间。'],
    ]),
  ] },
];

export const PLAY_EN4_ITEMS: Item[] = [
  item({
    id: 'e4-steal', st: 'en4', lv: 1, type: 'word', topic: 'steal / borrow', label: 'I didn’t steal it! I borrowed it.', intro: '', ask: 'steal、borrow、take 怎么分？',
    hints: ['偷和借，差在哪里？'],
    explain: 'steal：没经过同意拿走、不打算还；borrow：经过同意、用完还。Mia 说她问过 Green 老师，还要三点还回来，所以是 borrow。',
    lock: { words: ['steal'] },
    ext: EXT_STEAL,
  }, C('a', 'Mia 为什么说“I didn’t steal it! I borrowed it.”？', [
    ['*她觉得自己问过、得到了同意，还打算还回来', '对：borrow 是经过同意、要还的；steal 是偷。'],
    ['她想说熊猫不在她那儿', '熊猫就在她面前。'],
    ['steal 和 borrow 意思一样，她换个说法', '意思完全不一样：一个偷、一个借。'],
    ['她想说熊猫是 Green 老师偷的', '她说的是自己。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e4-ten', st: 'en4', lv: 2, type: 'word', topic: 'ten past two', label: 'At ten past two', intro: '', ask: '英式英语怎么说时间？',
    hints: ['past：过了；ten past two：两点过十分。'],
    explain: 'ten past two：两点十分（2:10）。英式说法：分钟 + past + 钟点（前半小时），分钟 + to + 下一个钟点（后半小时）。',
    lock: { words: ['ten past two'] },
    ext: EXT_TEN,
  }, C('a', '“At ten past two” 是几点？', [
    ['*2:10', '对：两点过了十分钟。'],
    ['1:50', '那是 ten to two（差十分两点）。'],
    ['10:02', 'past 前面是分钟，后面是钟点。'],
    ['2:20', '那是 twenty past two。'],
  ], { reveal: 'chosen' })),

  item({
    id: 'e4-order', st: 'en4', lv: 1, type: 'order', topic: 'the true story', label: '真相：按时间顺序排', intro: '', ask: '为什么最后要把整件事再排一遍？',
    hints: ['2:00 熊猫还在桌上；2:10 Mia 去问；2:15 灯灭。'],
    explain: '2:00 熊猫在桌上 → 2:10 Mia 问打电话的 Green 老师，老师随口说了 Yes, yes → Mia 拿走熊猫、留下纸条 → 2:15 Max 被绊倒，灯灭，纸条掉到桌下 → Mia 在花园拍照 → 2:56 你们在花园找到熊猫。',
    ext: EXT_ORDER,
  }, Od('o', '按时间先后，把真相排一排。', [
    'The Golden Panda was on the table.',
    'Mia asked Ms Green, “Can I borrow the panda for a photo?” Ms Green was on the phone and said, “Yes, yes.”',
    'Mia took the panda and stuck a note on the table: “Lent the panda. Back at 3.”',
    'Max tripped over a cable. The lights went out, and the note fell off the table.',
    'Mia was taking photos of the panda in the garden.',
    'You and Ben found the panda between the flowers.',
  ], '2:00 → 2:10 → 2:12 → 2:15 → 2:15–2:56 → 2:56。', ['2:00', '2:10', '2:12', '2:15', 'after 2:15', '2:56'])),

  item({
    id: 'e4-too', st: 'en4', lv: 2, type: 'word', topic: 'too … to', label: 'too busy to listen', intro: '', ask: 'too … to 是什么意思？',
    hints: ['句子里没有 not，可意思是“没能……”。'],
    explain: 'I was too busy to listen. ＝ 我太忙了，没顾上听。too + 形容词 + to do：太……而没能……',
    lock: { words: ['too busy to listen'] },
    ext: EXT_TOO,
  }, C('a', 'Green 老师说 I was too busy to listen. 意思是——', [
    ['*我太忙了，没顾上听', '对：too … to，太……而没能……'],
    ['我很忙，也很认真地听了', 'too … to 表示“没能”。'],
    ['我太喜欢听了', 'busy 是忙。'],
    ['我忙着去听电话', '她说的是没顾上听 Mia 的话。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e4-best', st: 'en4', lv: 1, type: 'word', topic: 'the best', label: 'the best story', intro: '', ask: 'good、better、best 怎么变？',
    hints: ['三篇决赛作品里，挑一篇。'],
    explain: 'the best story：最好的故事。good — better — best；三个以上里挑一个，用最高级。',
    lock: { words: ['the best story'] },
    ext: EXT_BEST,
  }, C('a', '为什么是 the best story，不是 the better story？', [
    ['*三篇决赛作品里挑一篇，用最高级 best', '对。两个比较才用 better。'],
    ['better 是错的单词', 'better 也是对的词，只是用在两个比较的时候。'],
    ['the best 和 the better 意思一样', 'better 是“更好”，best 是“最好”。'],
    ['因为只有一篇作品', '有三篇决赛作品。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e4-ever', st: 'en4', lv: 2, type: 'word', topic: 'the most … I’ve ever', label: 'the most beautiful photo I’ve ever taken', intro: '', ask: 'ever 和 have done 为什么常在一起？',
    hints: ['ever：曾经、从来。说的是“到现在为止”。'],
    explain: 'the most beautiful photo I’ve ever taken：我（到现在为止）拍过的最美的照片。最高级 + I’ve ever + 过去分词。',
    lock: { words: ['the most beautiful photo I’ve ever taken'] },
    ext: EXT_EVER,
  }, C('a', 'Mia 说 It’s the most beautiful photo I’ve ever taken! 意思是——', [
    ['*这是我拍过的最美的照片', '对：到现在为止拍过的照片里，这张最美。'],
    ['这是我拍的第一张照片', '没说是第一张。'],
    ['我以后再也不拍照了', 'ever 在这里是“曾经”。'],
    ['这张照片很普通', 'the most beautiful：最美。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e4-write', st: 'en4', lv: 2, type: 'write', topic: 'case summary', label: '侦探笔记的最后一行', intro: '', ask: '总结一个案子要写哪几样？',
    hints: ['谁？做了什么？为什么大家以为熊猫被偷了？'],
    explain: 'Mia borrowed the Golden Panda for a photo. Ms Green said “Yes, yes” on the phone, and the note fell under the table, so everyone thought it was stolen.',
    ext: EXT_WRITE,
  }, Wr('w', 'Write the last line in your detective notebook: what really happened to the Golden Panda? (one or two sentences)', {
    lang: 'en', role: 'en',
    task: 'In a school detective story, the student writes one or two English sentences summing up what really happened: Mia (Year 7, school newspaper) borrowed the Golden Panda to take a photo for the front page; she asked Ms Green at ten past two, but Ms Green was on the phone and said “Yes, yes” without really listening; Mia wrote “Lent” instead of “Borrowed”; the note fell under the table when the lights went out; the panda was found in the garden and came back before the award at three.',
    criteria: ['says that Mia borrowed / took the panda for a photo (not stole it)', 'gives at least one more fact: Ms Green said yes on the phone / the note was wrong (lent vs borrowed) / the note fell under the table / it was found in the garden', 'past simple for the events; accept simple, clear sentences; British English is fine'],
    examples: ['Mia borrowed the Golden Panda for a photo, but Ms Green was on the phone and didn’t really listen.', 'Nobody stole the panda. Mia borrowed it for a photo, and her note fell under the table.'],
    words: ['Mia', 'borrowed', 'the Golden Panda', 'for a photo'], frame: 'Mia ______ the Golden Panda for a photo, but ______ .', ph: 'Mia …',
  })),
];
