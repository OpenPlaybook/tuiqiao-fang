// 英文故事 The Case of the Golden Panda · Chapter 4 Case Closed（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）
// 真相：两点十分 Mia 问正在打电话的 Green 老师“能借熊猫拍张照吗”，Green 老师随口说了“Yes, yes”；Mia 写纸条时把 borrow 写成了 lent；灯灭时纸条掉到了桌子底下。
// 语法：英式说时间（ten past two）、too … to、最高级 + ever、道歉和回应。
import { C, S, Mt, Od, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, Item, Play, TeachSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string, string[]?][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why, alt]) => ({ t, a, why, ...(alt ? { alt } : {}) })) });
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
    'was talking on the phone': { d: '那时正在打电话：was + doing，说过去某一刻正在做的事——Mia 来问的时候，她正打着电话，所以没听清。' },
    'while Max was carrying his drum': { d: 'Max 正搬着鼓的时候：while + was doing 是一段正在进行的背景；灯灭是这段时间里一下子发生的事（第二章 Max 自己就是这么说的）。' },
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
    { side: ['e4-x-red'], shots: [['e4.miaRed', 1.2]], t: '**2:56 p.m.** Mia ⟦holds her camera tight⟧. Her face ⟦goes red⟧.', read: '2:56 p.m. Mia holds her camera tight. Her face goes red.', tr: '两点五十六。Mia {紧紧抱着她的相机}，{脸红了}。', trHard: 'words', voice: 'en', ask: 'go red 为什么用 go？' },
    { side: ['e4-x-rob'], shots: [['e4.miaCU']], id: 'steal', who: 'Mia', voice: 'mia', t: 'I… I didn’t ⟦steal⟧ it! I borrowed it ⟦for a photo⟧. Ms Green ⟦said yes⟧!', read: 'I… I didn’t steal it! I borrowed it for a photo. Ms Green said yes!', tr: '我……我没有{偷}！我是借来{拍照}的。Green 老师{答应了}！', trHard: 'words', task: ['e4-steal'], ask: 'steal 和 borrow 差在哪？' },
    { shots: [['e4.benAsk']], who: 'Ben', voice: 'ben', t: 'When did she say yes?', tr: '她什么时候答应的？', trHard: 'frame' },
    { shots: [['e4.flashAsk', 1.4]], id: 'ten', who: 'Mia', voice: 'mia', t: 'At ⟦ten past two⟧. She ⟦was on the phone⟧. I asked, “Can I borrow the panda for a photo?” and she said, “Yes, yes.”', read: 'At ten past two. She was on the phone. I asked, can I borrow the panda for a photo? And she said, yes, yes.', tr: '{两点十分}。她{正在打电话}。我问：“我能借熊猫拍张照吗？”她说：“好，好。”', trHard: 'words', task: ['e4-ten'], ask: '英式英语怎么说时间？' },
    { shots: [['e4.remember']], t: 'So that was the “yes, yes”! Ms Green ⟦was talking on the phone⟧, so she didn’t really listen.', read: 'So that was the yes, yes! Ms Green was talking on the phone, so she didn’t really listen.', tr: '原来那句“好，好”是这么回事！Green 老师{当时正在打电话}，{根本没认真听}。', trHard: 'words', voice: 'en' },
    { shots: [['e4.flashNote', 1.2]], who: 'Mia', voice: 'mia', t: 'Then I wrote a note and ⟦stuck it on the table⟧: “Lent the panda. Back at 3.”', read: 'Then I wrote a note and stuck it on the table. Lent the panda. Back at three.', tr: '然后我写了一张纸条，{贴在桌子上}：“熊猫借出去了。三点回来。”', trHard: 'words' },
    { shots: [['e4.benKind']], who: 'Ben', voice: 'ben', t: '(kindly) Mia, ⟦you lent nothing⟧. You borrowed it!', read: 'Mia, you lent nothing. You borrowed it!', tr: '（温和地）Mia，{你什么也没借出去}，你是借进来的！', trHard: 'frame' },
    { shots: [['e4.miaCU']], who: 'Mia', voice: 'mia', t: 'Oh no… borrow, lend… I always ⟦mix them up⟧!', read: 'Oh no… borrow, lend… I always mix them up!', tr: '哎呀……borrow，lend……我总是{把它们搞混}！', trHard: 'words' },
    { shots: [['e4.noteFall', 1.2]], t: 'At 2:15, ⟦while Max was carrying his drum⟧, the lights went out. The note ⟦fell off⟧ the table ⟦in the dark⟧. Nobody saw it — ⟦until you did⟧.', read: 'At 2:15, while Max was carrying his drum, the lights went out. The note fell off the table in the dark. Nobody saw it, until you did.', tr: '两点一刻，{Max 正搬着鼓的时候}，灯灭了。纸条{在黑暗中}从桌上{掉了下来}。谁也没看见——{直到你发现了它}。', trHard: 'words', voice: 'en' },
    { shots: [['e4.timeline']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '真相都齐了。把这件事从头到尾，按时间顺序排一排。', task: ['e4-order'] },
    { shots: [['e4.runHall', 1.2]], t: '**2:58 p.m.** You all run back to the hall. Ms Green sees the panda and ⟦drops the phone⟧.', read: '2:58 p.m. You all run back to the hall. Ms Green sees the panda and drops the phone.', tr: '两点五十八。你们一起跑回礼堂。Green 老师一看见熊猫，{手机都掉了}。', trHard: 'words', voice: 'en' },
    { shots: [['e4.greenJoy']], who: 'Ms Green', voice: 'green', t: 'The Golden Panda! ⟦Where was it⟧?', tr: '金熊猫！{它去哪儿了}？', trHard: 'frame' },
    { id: 'sorry', shots: [['e4.sorry', 1.2]], who: 'Mia', voice: 'mia', t: '⟦I’m so sorry⟧, Ms Green. I asked you, but I ⟦didn’t ask clearly⟧.', tr: '{真对不起}，Green 老师。我问过您，可我{没问清楚}。', trHard: 'words', ask: '英语里道歉有哪些说法？', task: ['e4-clearly'] },
    { shots: [['e4.greenSorry']], id: 'too', who: 'Ms Green', voice: 'green', t: 'No, Mia — it was ⟦my fault⟧ too. I was ⟦too busy to listen⟧.', read: 'No, Mia, it was my fault too. I was too busy to listen.', tr: '不，Mia——这也是{我的错}。我当时{太忙了，没顾上听}。', trHard: 'frame', task: ['e4-too'], ask: 'too … to 是什么意思？' },
    { id: 'closed', shots: [['e4.benClose']], who: 'Ben', voice: 'ben', t: 'And Max made the lights go out, and the note fell under the table. ⟦Case closed⟧!', read: 'And Max made the lights go out, and the note fell under the table. Case closed!', tr: 'Max 把灯弄灭了，纸条又掉到了桌子底下。{结案}！', trHard: 'words', task: ['e4-fault'] },
    { shots: [['e4.hall', 1.2]], t: '**3:00 p.m.** The lights in the hall are on. ⟦Everyone is sitting down⟧.', read: '3:00 p.m. The lights in the hall are on. Everyone is sitting down.', tr: '三点整。礼堂的灯亮着，{大家都坐好了}。', trHard: 'frame', voice: 'en' },
    { shots: [['e4.stage', 1.2]], id: 'best', who: 'Ms Green', voice: 'green', t: 'And the Golden Panda for ⟦the best story⟧ ⟦goes to⟧…', read: 'And the Golden Panda for the best story goes to…', tr: '金熊猫——{最佳故事奖}——{颁给}……', trHard: 'frame', task: ['e4-best'], ask: 'good、better、best 怎么变？' },
    { shots: [['e4.winner', 1.4]], t: '…your story! Everyone ⟦claps⟧. Ben jumps up and shouts, “⟦Well done⟧, ⟦detective⟧!”', read: 'Your story! Everyone claps. Ben jumps up and shouts, well done, detective!', tr: '……你的故事！全场{鼓掌}。Ben 跳起来大喊：“{干得好}，{大侦探}！”', trHard: 'words', voice: 'en' },
    { id: 'intime', shots: [['e4.greenThanks']], who: 'Ms Green', voice: 'green', t: 'And thank you, our two detectives. You found our panda ⟦just in time⟧!', tr: '还要谢谢我们的两位侦探。你们{正好赶在颁奖前}找回了熊猫！', trHard: 'words', task: ['e4-intime'] },
    { shots: [['e4.photo', 1.2]], id: 'ever', who: 'Mia', voice: 'mia', t: 'And here’s my photo for the ⟦front page⟧. It’s ⟦the most beautiful photo I’ve ever taken⟧!', read: 'And here’s my photo for the front page. It’s the most beautiful photo I’ve ever taken!', tr: '这是我给{头版}拍的照片。这是{我拍过的最美的一张}！', trHard: 'frame', task: ['e4-ever'], ask: 'the most … I’ve ever … 怎么用？' },
    { shots: [['e4.write']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '侦探笔记的最后一行：用一两句英语，写下金熊猫到底是怎么“不见”的。', task: ['e4-write'] },
    { shots: [['e4.mooncake', 1.2]], who: 'Ben', voice: 'ben', t: 'Now, can I have a mooncake? ⟦I’ve only eaten nine⟧!', read: 'Now, can I have a mooncake? I’ve only eaten nine!', tr: '好啦，我能吃块月饼了吗？{我才吃了九块}！', trHard: 'frame', ask: 'Ben 为什么说 I’ve only eaten nine？' },
    { side: ['e4-x-spot'], id: 'review', shots: [['e4.endBoard', 1.4]], who: 'AI 眼镜', voice: 'ai', t: '案子破了。回头看看：has taken、was eating、borrow 和 lend、must be……每一个词，都是一条线索。', read: '案子破了。回头看看，has taken，was eating，borrow 和 lend，must be，每一个词，都是一条线索。', ask: '这四章里，你觉得哪个词是最关键的线索？', task: ['e4-review'] },
  ],
};

// ---------------- 拓展 ----------------
const EXT_STEAL: Ext[] = [
  { id: 'x1', title: 'steal、borrow、take', need: 'always', steps: [
    T('t1', '', '**steal**：偷——没经过同意，拿走了不打算还；**borrow**：借——经过同意，用完还回来；**take**：拿走——只说动作，不管同不同意。', ['Someone has taken it!（Green 老师：不知道是偷还是借）', 'I didn’t steal it. I borrowed it.（Mia：我是借的）']),
    C('a', '从 Green 老师那边看，她能说 Someone borrowed it 吗？', [
      ['*不能：她根本没听清 Mia 在问什么，不知道有人借——她只能说 Someone has taken it.', '对：borrow 要对方知道、同意。Green 老师当时在打电话，随口说了“好”。'],
      ['能：她说过“好”', '她是没听清就说了“好”，并不知道借给了谁。'],
    ], { keep: true }),
    fill('b', '填 steal、borrow 或 take（注意形式），有的词用不上。', ['stole', 'borrowed', 'took', 'steal', 'lent'], [
      ['The thief ___ a phone from the shop and ran away.', 'stole', '线索：The thief，拿了就跑——没经过同意：stole。steal 是原形；ran away 说明是过去的事，要用过去式。'],
      ['I ___ a book from the library. I’ll give it back on Monday.', 'borrowed', '线索：I’ll give it back——经过同意、要还：borrowed。lent 是借出去；from the library 是从图书馆借进来。'],
      ['Mia ___ the panda to the garden.', 'took', '线索：只说她把熊猫拿到了哪儿，不管同不同意——took。'],
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
    fill('a', '用英式说法填，有的词用不上。', ['ten past two', 'quarter past two', 'twenty past two', 'twenty to three', 'ten to two', 'twenty to two'], [
      ['Mia asked Ms Green at ___.', 'ten past two', '线索：Mia 是 2:10 去问的——过了两点十分：ten past two。ten to two 是差十分两点，也就是 1:50。'],
      ['The lights went out at ___.', 'quarter past two', '线索：灯是 2:15 灭的——一刻钟就是 quarter：quarter past two。'],
      ['Mr Liu saw Max at ___.', 'twenty past two', '线索：刘师傅 2:20 看见了 Max——twenty past two。'],
      ['Ms Green found the panda was gone at ___.', 'twenty to three', '线索：2:40，离三点还差二十分——twenty to three。twenty to two 是差二十分两点，也就是 1:40。'],
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
    fill('b', '用 too … to 或 enough to 填，有的词用不上。', ['too', 'enough', 'to'], [
      ['Ben was ___ excited to sit still.', 'too', '线索：excited to sit still——激动得坐不住：too … to。to 不是“太”，不能放在 excited 前面。'],
      ['The drum case was big ___ to hold a panda.', 'enough', '线索：big ___ to hold a panda——够大，装得下：形容词 + enough。'],
      ['Mia was ___ shy to say sorry at first.', 'too', '线索：太害羞，一开始没好意思道歉——too … to：太……而没能……。'],
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
    fill('b', '填对的形式，有的词用不上。', ['better', 'best', 'worse', 'most', 'more'], [
      ['Your story is ___ than mine.', 'better', '线索：than——两个比：better than。more 后面还要跟一个长形容词（more exciting），不能单独放在这里。'],
      ['It’s the ___ story in the festival.', 'best', '线索：the ___ in the festival——一群里最好：the best。'],
      ['My cold is ___ today than yesterday.', 'worse', '线索：than yesterday，感冒加重了——bad 的比较级 worse。'],
      ['It’s the ___ exciting day of the year.', 'most', '线索：exciting 是长词——最……用 the most。more 是两个比的“更……”；一年里所有日子放在一起比，是“最”。'],
    ]),
  ] },
];

const EXT_EVER: Ext[] = [
  { id: 'x1', title: 'the most … I’ve ever …', need: 'always', steps: [
    T('t1', '', '“我（到现在为止）……过的最……”：**the + 最高级 + 名词 + I’ve ever + 过去分词**。ever 是“曾经、从来”，和 have done 搭配，说的是到现在为止。', ['It’s the best story I’ve ever read.', 'He is the funniest person I’ve ever met.']),
    T('t2', '', '这也是第一章的老朋友：Ben **has eaten** nine mooncakes，Someone **has taken** it!——have / has + 过去分词，说的都是“到现在为止”。Mia 这句加了 ever：到现在为止拍过的所有照片里。'),
    C('a', '“She is the kindest teacher I’ve ever had.” 是说——', [
      ['*到现在为止遇到的老师里，她最和善', '对：the + 最高级 + I’ve ever + 过去分词。'],
      ['她以后会成为最和善的老师', 'I’ve ever 说的是到现在为止，不是以后。'],
    ], { keep: true }),
    fill('b', '把句子补全，有的词用不上。', ['eaten', 'read', 'seen', 'met', 'ate', 'saw'], [
      ['This is the best mooncake I’ve ever ___! — Ben', 'eaten', '线索：mooncake，I’ve 后面用过去分词——eat → eaten。ate 是过去式，不能跟在 I’ve 后面。'],
      ['It’s the most exciting story I’ve ever ___.', 'read', '线索：story——读过：read 的过去分词还是 read，读 /red/。'],
      ['It’s the biggest drum I’ve ever ___.', 'seen', '线索：drum——见过：see → seen。saw 是过去式，不能跟在 I’ve 后面。'],
      ['Ben is the funniest person I’ve ever ___.', 'met', '线索：person——遇见过：meet → met。'],
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


// ---------------- 词汇：清楚地、谁的错、正好赶上，四章的词再见一次 ----------------
const EXT_CLEARLY: Ext[] = [
  { id: 'x1', title: '“怎么做”：-ly', need: 'always', steps: [
    T('t1', '', '“I asked you, but I didn’t ask clearly.”——clear（清楚的）+ -ly → **clearly**（清楚地）。说一个动作“怎么做”，常在形容词后面加 -ly。第一章也见过：nervous → nervously。'),
    C('a', '“I didn’t ask clearly.” 说的是 Mia——', [
      ['*问得不够清楚', '对：clearly 说的是“怎么问”。'],
      ['问得不够大声', '大声是 loudly。'],
    ], { keep: true }),
    Mt('b', '形容词和它的 -ly 连起来。', ['clear', 'quick', 'careful', 'happy'], ['happily', 'clearly', 'carefully', 'quickly'], [1, 3, 2, 0], '一般直接加 -ly；y 结尾的，把 y 变成 i 再加 -ly：happy → happily。', { lh: '形容词', rh: '-ly' }),
    T('t2', '', '有一个不守规矩的：good（好的）→ **well**（好地）。She speaks English **well**.（不说 goodly）'),
    fill('c', '放进句子，有的词用不上。', ['clearly', 'carefully', 'well', 'quickly', 'careful'], [
      ['Please speak ___. I can’t understand you.', 'clearly', '线索：I can’t understand you——要说得清楚：clearly。'],
      ['Mia heard a scream and ran ___ to the garden.', 'quickly', '线索：heard a scream——听见尖叫，赶紧跑过去：quickly。'],
      ['Read the question ___ before you answer.', 'carefully', '线索：before you answer——答题前要仔细读：carefully。careful 是形容词（Be careful!），说“怎么读”要用副词。'],
      ['You did really ___ today, detective!', 'well', '线索：夸人做得好——good 的副词是 well，不说 goodly。'],
    ]),
    C('d', '找出用错的一句：', [
      ['*Ben speaks Chinese very good.', '对，这句错了：说话说得好，用 well：speaks Chinese very well。'],
      ['Ben is a good speaker.', '这句没错：good 修饰 speaker（人）。'],
    ], { keep: true }),
  ] },
];

const EXT_FAULT: Ext[] = [
  { id: 'x1', title: '谁的错', need: 'always', steps: [
    T('t1', '', '“It was my fault too.”——**fault**：（某人的）过错、责任。It’s my fault. = 怪我。'),
    C('a', 'Green 老师为什么说 too（也）？', [
      ['*她觉得不全是 Mia 的错：自己当时只顾打电话，没听清就说了“好”', '对：主动把一部分责任揽到自己身上。'],
      ['她自己也弄丢了东西', 'fault 说的是该怪谁，不是丢东西。'],
    ], { keep: true }),
    T('t2', '', '“错”还有两个词：**mistake**（做错的事、错误：make a mistake）；**wrong**（不对的：the wrong word）。fault 说的是“该怪谁”，mistake 说的是“错在哪儿”。'),
    fill('b', '放进句子，有的词用不上。', ['fault', 'mistake', 'wrong', 'wrongly'], [
      ['Mia made a ___: she wrote “Lent” instead of “Borrowed”.', 'mistake', '线索：made a ___——犯错：make a mistake，说的是错在哪儿。wrong 是“错的”，wrongly 是“错误地”（spell a word wrongly），都不能跟在 a 后面当“一个错误”。'],
      ['“Lent” was the ___ word.', 'wrong', '线索：the ___ word——不对的：wrong，形容词放在名词前。'],
      ['Don’t be sad, Mia. It wasn’t only your ___.', 'fault', '线索：your ___——该怪谁：fault。'],
    ]),
    C('c', '你不小心把同学的水杯碰倒了，最好说——', [
      ['*Sorry, my fault! I’ll clean it up.', '对：先认错，再说怎么补救。'],
      ['It’s your fault. Why did you put it here?', '先怪别人，事情会更糟。'],
    ], { keep: true }),
    C('d', '哪一句对？', [
      ['*I made a mistake in my homework.', '对：犯错误是 make a mistake。'],
      ['I did a fault in my homework.', '作业里的错误用 mistake，动词用 make。'],
    ], { keep: true }),
  ] },
];

const EXT_INTIME: Ext[] = [
  { id: 'x1', title: 'in time 和 on time', need: 'always', steps: [
    T('t1', '', '“You found our panda just in time!”——**in time**：及时，赶得上（再晚一点就来不及了）；**just in time**：正好赶上。'),
    C('a', '要是三点零五分才找到熊猫，Green 老师会说——', [
      ['*Oh no, you’re too late!', '对：三点就开始颁奖，晚了五分钟，就来不及了——不是 in time。'],
      ['You found it just in time!', 'just in time 是正好赶上，三点零五分已经晚了。'],
    ], { keep: true }),
    T('t2', '', '**on time**：准时，按规定的时间（The bus came on time.）。in time 盯着“来不来得及”，on time 盯着“准不准”。'),
    fill('b', '填 in time 或 on time，有的词用不上。', ['in time', 'on time', 'in the time'], [
      ['The train always leaves ___. Don’t be late!', 'on time', '线索：always leaves，Don’t be late——按时刻表准点：on time。'],
      ['We got to the cinema just ___ to see the start.', 'in time', '线索：just ___ to see the start——正好赶上：in time。in the time 不行：“及时、赶上”的 in time 中间不加 the。'],
      ['The doctor came ___ to save him.', 'in time', '线索：to save him——再晚就来不及了：in time。'],
      ['Please hand in your homework ___.', 'on time', '线索：交作业有规定的时间——按时：on time。说 in time（赶在截止前）也对。', ['in time']],
    ]),
    C('c', '“We arrived just in time.” 是——', [
      ['*我们正好赶上了', '对。'],
      ['我们准时到了，一分不差', '准时是 on time。'],
    ], { keep: true }),
  ] },
];

const EXT_REVIEW: Ext[] = [
  { id: 'x2', title: '四章里的时态，再见一次', need: 'always', steps: [
    T('t1', '', '把整个案子按时间连起来说一遍。四章里的几种说法，全在这条时间线上：', [
      '2:00　The panda **was** on the table.',
      '2:10　Ms Green **was talking** on the phone. Mia **borrowed** the panda.',
      '2:15　While Max **was carrying** his drum, the lights **went out**.',
      '2:40　“Someone **has taken** it!”（现在不在了）',
      '2:55　“We’ve **found** it!”（现在找到了）',
    ]),
    C('a', 'Mia 来借熊猫的时候，Green 老师在做什么？哪一句对？', [
      ['*When Mia asked, Ms Green was talking on the phone.', '对：打电话是一段正在进行的背景，Mia 一问，正好落在这段时间中间。'],
      ['When Mia asked, Ms Green talked on the phone.', '这样说，像是 Mia 问了以后，她才拿起电话。'],
    ], { keep: true }),
    C('b', '两点四十，Green 老师冲进礼堂，看着空桌子喊——', [
      ['*Someone has taken it!', '对：她说的是眼前的样子：熊猫现在不在了。'],
      ['Someone was taking it!', 'was taking 是“那时正在拿”；她进来的时候，并没有人正在拿。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['was eating', 'tripped', 'has taken', 'must be', 'eating', 'trips'], [
      ['When the lights went out, Ben ___ a mooncake.', 'was eating', '线索：灯灭的那一刻，他正在吃——was eating。只填 eating 不行：前面少了 was。'],
      ['While Max was carrying his drum, he ___ over a cable.', 'tripped', '线索：搬鼓是背景，绊一下是一下子的事——一般过去时 tripped。trips 是现在时，可这件事发生在过去（was carrying）。'],
      ['The table is empty! Someone ___ the Golden Panda!', 'has taken', '线索：The table is empty!——眼前的样子：has taken。'],
      ['The same yellow paper, the same curly M… It ___ Mia!', 'must be', '线索：两条证据对上了——很有把握：must be。'],
    ]),
    C('d', '故事的最后，Ben 说：I’ve only eaten nine! 他的意思是——', [
      ['*到现在为止，我才吃了九块（还想再吃）', '对：have eaten 说的是到现在为止的数量；only 是“才”。'],
      ['我每天只吃九块', '说的是到现在为止，不是每天。'],
    ], { keep: true }),
  ] },
  { id: 'x1', title: '四章里的词，再见一次', need: 'always', steps: [
    T('t1', '', '这个案子里，每个词都是一条线索：borrow / lend（东西往哪边走）、look / see / notice（看、看见、注意到）、clue / evidence / proof（线索、证据、证明）、nervous / scared（紧张、害怕）、say / tell（说、告诉）。'),
    So('a', '这些词，哪个是“东西往自己这边来”，哪个是“从自己这边出去”？', ['往自己这边来', '从自己这边出去'], [
      ['borrow', 0, '借进来。'], ['bring', 0, '带到这边来。'], ['find', 0, '找到，到手了。'],
      ['lend', 1, '借出去。'], ['take（带走）', 1, '带到别处去。'], ['lose', 1, '丢了。'],
    ]),
    fill('b', '放进句子，有的词用不上。', ['noticed', 'evidence', 'nervous', 'told', 'lent', 'said', 'borrowed'], [
      ['Before the prize, my hands were cold. I was very ___.', 'nervous', '线索：等着颁奖，手心发凉——担心表现不好：nervous。'],
      ['Mr Liu didn’t see anyone, but later he ___ a boy with a drum case.', 'noticed', '线索：本来没特意看，后来察觉到了——noticed。'],
      ['The two yellow notes were our best ___.', 'evidence', '线索：两张纸条——支持推理的证据：evidence。'],
      ['Ms Green never ___ the panda to anyone.', 'lent', '线索：to anyone——借出去：lend 的过去式 lent。borrowed 是借进来，后面不能跟 to anyone。'],
      ['Mia ___ us the whole story at last.', 'told', '线索：后面先跟人 us——讲给我们听：told。said 后面不能直接跟人，不说 said us。'],
    ]),
    C('c', '最后一个问题：Mia 写的纸条，如果写对了，应该是——', [
      ['*Borrowed the panda. Back at 3. — M', '对：她是借进来的，borrowed。'],
      ['Lent the panda. Back at 3. — M', '这正是她写错的那张。'],
    ], { keep: true }),
    Wr('d', '用一两句英语，写一写：这个案子里，你最喜欢哪个词？为什么？', {
      lang: 'en', role: 'en',
      task: 'After finishing a detective story about borrow/lend, look/see/notice, clue/evidence and has taken/was eating, the student writes one or two English sentences: which word from the story they like best and why.',
      criteria: ['names one word or phrase from the story', 'gives a short reason (it solved the case / it is easy to mix up / it is useful …)', 'complete sentences, correct spelling'],
      examples: ['My favourite word is “borrow”, because Mia mixed it up with “lend” and that solved the case.', 'I like “notice”, because a good detective notices small things.'],
      words: ['My favourite word is', 'because'], frame: 'My favourite word is “______”, because ______.', ph: 'My favourite word is …',
    }),
  ] },
];

export const PLAY_EN4_ITEMS: Item[] = [
  item({
    id: 'e4-clearly', st: 'en4', lv: 1, type: 'word', topic: 'clearly', label: 'I didn’t ask clearly', intro: '', ask: '形容词怎么变成“……地”？',
    hints: ['点一点 didn’t ask clearly。'],
    explain: 'clear（清楚的）→ clearly（清楚地）：说“怎么问”。Mia 问了，可没问清楚。',
    back: [{ ch: 'en1', line: 'cold', label: '第一章：nervous → nervously' }],
    lock: { words: ['didn’t ask clearly'] },
    ext: EXT_CLEARLY,
  }, C('a', '“I asked you, but I didn’t ask clearly.” 是说 Mia——', [
    ['*问了，可是没问清楚', '对。'],
    ['没有问', '她问了：I asked you。'],
    ['问得很大声', 'clearly 是清楚地。'],
    ['问了一个很清楚的问题', '她说的是“没问清楚”。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e4-fault', st: 'en4', lv: 1, type: 'word', topic: 'fault / mistake', label: 'It was my fault too', intro: '', ask: 'fault、mistake、wrong 怎么分？',
    hints: ['点一点 my fault。'],
    explain: 'fault：（谁的）过错、责任。It was my fault too：我也有责任——Green 老师当时太忙，没好好听。',
    lock: { words: ['my fault'] },
    ext: EXT_FAULT,
  }, C('a', 'Green 老师说 It was my fault too，意思是——', [
    ['*这件事我也有责任', '对。'],
    ['这都是 Mia 的错', '她说的是自己也有错。'],
    ['我的东西也丢了', 'fault 是过错，不是东西。'],
    ['我也找到了熊猫', '说的是谁的错。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e4-intime', st: 'en4', lv: 1, type: 'word', topic: 'in time / on time', label: 'just in time', intro: '', ask: 'in time 和 on time 有什么不一样？',
    hints: ['三点就要颁奖了。'],
    explain: 'just in time：正好赶上——再晚一点就来不及了。准时是 on time。',
    lock: { words: ['just in time'] },
    ext: EXT_INTIME,
  }, C('a', '“You found our panda just in time!” 是说——', [
    ['*你们正好在颁奖前找到了熊猫，再晚就来不及了', '对。'],
    ['你们准时到了礼堂', '准时是 on time。'],
    ['你们花了很长时间才找到', 'just in time 说的是正好赶上。'],
    ['你们来得太早了', '是正好，不是太早。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e4-review', st: 'en4', lv: 2, type: 'match', topic: 'words review', label: '四章的词', intro: '', ask: '这四章里，你觉得哪个词是最关键的线索？',
    hints: ['四章里学过的词，一个一个想一想。'],
    explain: 'borrow 借进来、lend 借出去；notice 注意到；evidence 证据；nervous 紧张；mix up 弄混。',
    ext: EXT_REVIEW,
  }, Mt('a', '这些词在案子里都出现过。连一连它们的意思。', ['borrow', 'lend', 'notice', 'evidence', 'nervous', 'mix up'], ['借出去', '注意到', '借进来', '紧张的', '证据', '弄混'], [2, 0, 1, 4, 3, 5], '这几个词，第一章到第四章都见过。', { lh: '英语', rh: '中文' })),

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
  ], '2:00 → 2:10 → 2:12 → 2:15 → 2:56。两点一刻 Max 被绊倒、灯灭的时候，Mia 正在花园里拍照——同一时刻的两件事，谁先谁后都行。', ['2:00', '2:10', '2:12', '2:15', '2:15', '2:56'], [0, 1, 2, 3, 3, 4])),

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
  // ---------------- 支线任务：可做可不做（补词汇：词族、易混的词、挑错） ----------------
  item({
    id: 'e4-x-red', st: 'en4', lv: 2, type: 'word', topic: 'embarrassed / nervous / scared', label: 'Her face goes red', intro: '', ask: '脸红了，英语怎么说？',
    hints: ['被人当场撞见，又不好意思，是哪种心情？'],
    explain: 'Her face goes red：她脸红了。被当场撞见、不好意思，是 embarrassed；等着宣布结果、怕表现不好，是 nervous；怕黑、怕狗，是 scared / afraid。',
  },
    T('t1', '', '“Mia holds her camera tight. Her face **goes red**.”——go red：（脸）变红。go 在这里是“变得”：go red（脸红），go white（脸色发白）。'),
    C('a', '被人当场找到，脸一下子红了。Mia 这时最可能是——', [
      ['*embarrassed（尴尬、不好意思）', '对：被撞见，又怕被当成小偷。'],
      ['bored（无聊）', '她一点也不无聊。'],
    ], { keep: true }),
    T('t2', '', '第一章里也有说心情的词：等着宣布结果、手心发凉，是 **nervous**；怕黑、怕狗，是 **scared / afraid**。再加一个：**embarrassed**，尴尬、不好意思。'),
    C('b', '第一章开头，Green 老师冲进礼堂，“Her face is white.”她当时最可能是——', [
      ['*worried and scared（又急又怕）', '对：金熊猫不见了。'],
      ['embarrassed（不好意思）', '她是急坏了、吓坏了。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['embarrassed', 'nervous', 'scared', 'scare'], [
      ['I called my teacher “Mum” by mistake. Everyone laughed. I was so ___!', 'embarrassed', '线索：当众叫错、Everyone laughed——不好意思：embarrassed。'],
      ['I have a big test tomorrow. I’m a bit ___.', 'nervous', '线索：a big test tomorrow——担心考不好：nervous。'],
      ['My little sister is ___ of the dark.', 'scared', '线索：of the dark——怕黑：scared of。scare 是动词“吓唬”（Don’t scare me!），is 后面要用形容词。'],
    ]),
  ),
  item({
    id: 'e4-x-rob', st: 'en4', lv: 2, type: 'word', topic: 'steal / rob', label: 'steal 和 rob', intro: '', ask: 'steal 和 rob 有什么不一样？',
    hints: ['steal 后面跟东西；rob 后面跟人或地方。'],
    explain: 'steal 后面跟被偷的东西（steal a phone）；rob 后面跟被抢的人或地方（rob a bank），常常带着暴力。偷东西的人是 thief，抢劫的人是 robber。',
  },
    T('t1', '', '“I didn’t **steal** it!”——steal 后面跟**东西**：steal the panda, steal a phone。还有一个词 **rob**，后面跟**人或地方**：rob a bank（抢银行），rob a shop，rob someone（抢某人）。rob 常常带着暴力。'),
    C('a', '哪一句对？', [
      ['*Someone stole my bike.', '对：steal + 东西。'],
      ['Someone robbed my bike.', 'rob 后面跟人或地方，不跟东西。'],
    ], { keep: true }),
    C('b', '“两个人冲进银行，抢走了钱。”', [
      ['*Two men robbed a bank.', '对：rob + 地方。'],
      ['Two men stole a bank.', '银行不能被“偷走”：用 rob。'],
    ], { keep: true }),
    T('t2', '', '做这些事的人：**thief**（小偷，复数 thieves），**robber**（抢劫的人）。Mia 急着说自己不是 thief：她是借的，还打算还。'),
    fill('c', '放进句子，有的词用不上。', ['thief', 'robber', 'stole', 'robbed', 'rob'], [
      ['A ___ took my wallet on the bus, and I didn’t feel a thing.', 'thief', '线索：I didn’t feel a thing——悄悄偷的人：thief。'],
      ['The ___ ran into the shop and shouted, “Give me the money!”', 'robber', '线索：冲进去喊“Give me the money!”——明着抢的人：robber。'],
      ['Somebody ___ the money from the shop at night.', 'stole', '线索：后面是东西 the money——steal + 东西：stole。rob / robbed 后面跟被抢的人或地方，不跟东西。'],
      ['Somebody ___ the shop at night.', 'robbed', '线索：后面是地方 the shop——rob + 地方：robbed。'],
    ]),
  ),
  item({
    id: 'e4-x-spot', st: 'en4', lv: 3, type: 'spot', topic: 'spot the wrong word', label: '笔记里用错的词', intro: '', ask: 'look、see、watch 怎么分？',
    hints: ['每句只有一个词用错了：想想四章里那几对最容易混的词。'],
    explain: '四句里的错，正是四章里最容易混的几对：borrow / lend、look / watch、say / tell、make / take。',
  },
    T('t1', '', 'AI 眼镜帮你整理了一份侦探笔记。可每一句都有一个词用错了——点出来，再选怎么改。'),
    S('a', '点出用错的词', 'Mia |asked, |“Can |I |lend |the |panda |for |a |photo?”', [4], C('fix', '换成哪个词？', [
      ['*borrow', '对：Mia 是向老师借，用 borrow。'],
      ['give', 'give 是给，Mia 是想借。'],
      ['steal', '她问了，不是偷。'],
    ]), { 0: 'Mia 没问题，再找找。', 7: 'for a photo 是“为了拍照”，没问题。' }, { borrow: 'Mia asked, “Can I ~~lend~~ ++borrow++ the panda for a photo?”' }),
    S('b', '点出用错的词', 'Mr |Liu |was |looking |the |football |match |on |his |phone.', [3], C('fix', '换成哪个词？', [
      ['*watching', '对：看比赛、看电视，用 watch。'],
      ['seeing', 'see 是看见，不说 seeing the match。'],
      ['noticing', 'notice 是注意到。'],
    ]), {}, { watching: 'Mr Liu was ~~looking~~ ++watching++ the football match on his phone.' }),
    S('c', '点出用错的词', 'Ms |Green |just |told, |“Yes, |yes.”', [3], C('fix', '换成哪个词？', [
      ['*said', '对：后面直接跟说的话，用 said。'],
      ['spoke', 'speak 后面不直接跟说的话。'],
      ['talked', 'talk 是交谈。'],
    ]), {}, { said: 'Ms Green just ~~told~~ ++said++, “Yes, yes.”' }),
    S('d', '点出用错的词', 'It’s |the |most |beautiful |photo |I’ve |ever |made!', [7], C('fix', '换成哪个词？', [
      ['*taken', '对：拍照是 take a photo，过去分词是 taken。'],
      ['done', '拍照不用 do。'],
      ['took', 'I’ve ever 后面要用过去分词 taken。'],
    ]), {}, { taken: 'It’s the most beautiful photo I’ve ever ~~made~~ ++taken++!' }),
  ),
];
