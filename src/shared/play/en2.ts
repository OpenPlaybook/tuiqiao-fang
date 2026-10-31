// 英文故事 The Case of the Golden Panda · Chapter 2 Where were you?（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）
// 语法就是线索：was / were doing（那一刻正在做）、when 和 while（背景 + 突然发生的事）、问不在场证明的问法。
// 暗线：Green 老师打电话时随口说了“yes, yes”；Max 绊到电线，灯才灭；Mia 把 borrow 和 lend 用反了（第三章的关键）。
import { C, Mt, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, Item, Play, TeachSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why]) => ({ t, a, why })) });
const T = (key: string, q: string, t: string, ex?: string[], art?: Art): TeachSub => ({ kind: 'teach', key, q, t, ...(ex ? { ex } : {}), ...(art ? { art } : {}) });
const viz = (k: string, p: Record<string, unknown> = {}) => ({ k, p });

export const PLAY_EN2: Play = {
  id: 'en2', lang: 'en', no: 2, title: 'Chapter 2　Where were you?', sub: '好几个人都说自己不在场', color: '#3A6A5A', next: 'en3',
  endAsk: ['alibi 是什么意思？', 'when 和 while 怎么分？', 'Mia 说 Can you borrow me your pen? 哪里不对？'],
  gloss: {
    suspect: { d: 'n. 嫌疑人（读 /ˈsʌspekt/）；动词“怀疑”读 /səˈspekt/', py: '/ˈsʌspekt/', s: { 'is a suspect': '都是嫌疑人：都有可能拿了熊猫' }, more: { t: '名词和动词同一个词，重音不一样：a SUSpect（嫌疑人）、to susPECT（怀疑）。present（礼物 / 展示）、record（记录 / 录下）也是这样。', q: '“I suspect him.” 这里的 suspect 是——', opts: [['动词：怀疑', true], ['名词：嫌疑人', false]] } },
    'one by one': { d: '一个一个地' },
    printer: { d: 'n. 打印机（print 打印 + -er）', py: '/ˈprɪntə/' },
    'all over the floor': { d: '满地都是' },
    certificates: { d: 'n. 证书、奖状（certificate 的复数）', py: '/səˈtɪfɪkəts/' },
    'Where were you': { d: '你（那时）在哪儿？问过去某个时候在哪里，用 were（主语是 you）。' },
    'I was right here': { d: '我就在这儿。right 加强语气：就、正好。' },
    'was printing': { d: '那时正在打印：was + doing，说过去某一刻正在做的事。' },
    'When the lights went out': { d: '灯灭的时候。when + 一件一下子发生的事（went out）。' },
    stopped: { d: '停了（stop 的过去式，双写 p 再加 -ed）' },
    'half printed': { d: '只打印了一半' },
    'top half': { d: '上半部分' },
    alibi: { d: 'n. 不在场证明：证明事发时自己在别处', py: '/ˈæləbaɪ/', more: { t: 'alibi 本来是拉丁文“在别处”。侦探故事里最常见的问题，就是 What’s your alibi?（你的不在场证明是什么？）', q: '“His alibi is that he was at home.” 意思是——', opts: [['他的不在场证明是：他当时在家', true], ['他说谎说自己在家', false]] } },
    'before the lights went out': { d: '灯灭之前' },
    'on the phone with': { d: '在和……打电话' },
    headmaster: { d: 'n. 校长（英式说法；美式常说 principal）', py: '/ˌhedˈmɑːstə/' },
    'most of the time': { d: '大部分时间' },
    'asked me things': { d: '问了我一些事' },
    'music room': { d: '音乐教室' },
    'putting a drum into': { d: '正把一面鼓放进……（put … into：把……放进去）' },
    'Do you want to look inside': { d: '你想看看里面吗？look inside：往里面看' },
    'What were you doing': { d: '你（那时）在做什么？were + 主语 + doing：问过去某一刻正在做的事。' },
    'was packing': { d: '那时正在收拾、装箱（pack：打包、装起来）' },
    'behind the stage': { d: '在舞台后面' },
    'tripped over': { d: '被……绊倒（trip over：脚下被东西绊了一下）' },
    cable: { d: 'n. 电线、电缆', py: '/ˈkeɪbl/' },
    'while I was carrying': { d: '在我正搬着……的时候。while + 一直在做的事（was carrying）。' },
    'made the lights go out': { d: '让灯灭了（make + 东西 + 动词原形：让……）' },
    'plugged it back in': { d: '把插头又插了回去（plug in：插上电源；back：回到原处）' },
    'straight away': { d: '马上、立刻（英式说法；美式常说 right away）' },
    backstage: { d: 'adv. 在后台', py: '/ˌbækˈsteɪdʒ/' },
    'in a hurry': { d: '急急忙忙的' },
    corridor: { d: 'n. 走廊', py: '/ˈkɒrɪdɔː/' },
    'camera bag': { d: '相机包' },
    'school newspaper': { d: '校报' },
    'Just one question': { d: '就问一个问题' },
    'was taking photos': { d: '那时正在拍照（take photos：拍照）' },
    'my pen is dead': { d: '我的笔没水了（口语：dead 说电池、笔用光了）' },
    borrow: { d: 'v. 借（进来）：从别人那里借。借出去是 lend。' },
    'You mean': { d: '你的意思是……（帮别人把话说对时常用）' },
    lend: { d: 'v. 借（出去）：把东西借给别人。lend + 人 + 东西' },
    'Here you are': { d: '给你（递东西时说）' },
    'runs off': { d: '跑开了' },
    'before three': { d: '三点以前' },
    'start with': { d: '以……开头' },
    strange: { d: 'adj. 奇怪的', py: '/streɪndʒ/' },
  },
  lines: [
    { shots: [['e2.notebook', 1]], t: '**2:42 p.m.** Ben opens your notebook and writes a question at the top: “Where were you at 2:15?”', read: '2:42 p.m. Ben opens your notebook and writes a question at the top. Where were you at 2:15?', tr: '两点四十二。Ben 翻开你的本子，在{最上面}写了一个问题：{两点一刻的时候，你在哪儿}？', trHard: 'frame', voice: 'en', ask: '英语里怎么问“那时候你在哪儿”？' },
    { shots: [['e2.benPlan']], who: 'Ben', voice: 'ben', t: 'Everyone who was near the stage at 2:15 is a ⟦suspect⟧. Let’s ask them ⟦one by one⟧.', tr: '两点一刻在舞台附近的{每个人}都有{嫌疑}。我们{一个一个地}问。', trHard: 'words' },
    { shots: [['e2.office', 1.2]], t: 'First, you go to the office. Ms Green is standing next to the ⟦printer⟧. There are papers ⟦all over the floor⟧.', tr: '你们先去了{办公室}。Green 老师正站在{打印机}旁边。{满地}都是纸。', trHard: 'words', voice: 'en' },
    { shots: [['e2.office']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '你想问 Green 老师：两点一刻的时候，她在哪儿？用英语怎么问最好？', task: ['e2-ask'], ask: '问过去的事，英语句子要怎么变？' },
    { shots: [['e2.benAsk']], id: 'ask', who: 'Ben', voice: 'ben', t: 'Excuse me, Ms Green. ⟦Where were you⟧ at 2:15?', tr: '{打扰一下}，Green 老师。两点一刻的时候，您{在哪儿}？', trHard: 'frame' },
    { shots: [['e2.greenTalk']], who: 'Ms Green', voice: 'green', t: '⟦I was right here⟧. I ⟦was printing⟧ the ⟦certificates⟧ for the winners.', tr: '我{就在这儿}。我{正在打印}给获奖者的{证书}。', trHard: 'words' },
    { shots: [['e2.printerStop', 1]], id: 'when', who: 'Ms Green', voice: 'green', t: '⟦When the lights went out⟧, the printer ⟦stopped⟧. Look — this one is only ⟦half printed⟧!', read: 'When the lights went out, the printer stopped. Look, this one is only half printed!', tr: '{灯一灭}，打印机就{停了}。你们看——这张{只打印了一半}！', trHard: 'frame', task: ['e2-when'], ask: '为什么是 the printer stopped，不是 was stopping？' },
    { shots: [['e2.halfCert']], t: 'She shows you a certificate. Only the ⟦top half⟧ is printed. The rest is empty.', tr: '她给你们看一张证书：只有{上半部分}印出来了，{下面}是空白。', trHard: 'words', voice: 'en' },
    { shots: [['e2.whisper']], who: 'Ben', voice: 'ben', t: '(quietly) A half-printed certificate. So she really was here at 2:15. That’s her ⟦alibi⟧.', read: 'A half-printed certificate. So she really was here at 2:15. That’s her alibi.', tr: '（小声）一张印了一半的证书。所以两点一刻她{真的}在这儿。这就是她的{不在场证明}。', trHard: 'words' },
    { shots: [['e2.benAsk']], who: 'Ben', voice: 'ben', t: 'Did anyone come in ⟦before the lights went out⟧?', tr: '{灯灭之前}，有人进来过吗？', trHard: 'frame' },
    { shots: [['e2.greenPhone', 1.2]], id: 'yesyes', who: 'Ms Green', voice: 'green', t: 'Hmm… I was ⟦on the phone with⟧ the ⟦headmaster⟧ ⟦most of the time⟧. A few students came in and ⟦asked me things⟧. I just said, “Yes, yes.”', read: 'Hmm… I was on the phone with the headmaster most of the time. A few students came in and asked me things. I just said, yes, yes.', tr: '嗯……那段时间我{大部分时候}都在和{校长}{打电话}。有几个学生进来{问我事情}，我就说了“好，好”。', trHard: 'words', ask: 'Green 老师说的 “Yes, yes” 可能是在答应什么？' },
    { shots: [['e2.musicRoom', 1.2]], t: 'Next, the ⟦music room⟧. A tall boy is ⟦putting a drum into⟧ a big black case.', tr: '接着去{音乐教室}。一个高个子男孩正{把一面鼓放进}一个黑色的大箱子。', trHard: 'words', voice: 'en' },
    { shots: [['e2.maxOpen', 1.2]], who: 'Max', voice: 'max', t: 'Hi, I’m Max. Yes, this case is mine. ⟦Do you want to look inside⟧?', tr: '嗨，我是 Max。对，这个箱子{是我的}。你们{想看看里面}吗？', trHard: 'frame' },
    { shots: [['e2.caseInside']], t: 'Inside the case there is only a drum. No panda.', tr: '箱子里{只有}一面鼓。{没有}熊猫。', trHard: 'frame', voice: 'en' },
    { shots: [['e2.benAskMax']], id: 'were', who: 'Ben', voice: 'ben', t: '⟦What were you doing⟧ at 2:15, Max?', tr: 'Max，两点一刻的时候你{在做什么}？', trHard: 'frame', task: ['e2-was'], ask: '什么时候用 was，什么时候用 were？' },
    { shots: [['e2.tripFlash', 1.4]], id: 'trip', who: 'Max', voice: 'max', t: 'I ⟦was packing⟧ my drums ⟦behind the stage⟧. I ⟦tripped over⟧ a ⟦cable⟧ ⟦while I was carrying⟧ the big drum — and all the lights went out!', read: 'I was packing my drums behind the stage. I tripped over a cable while I was carrying the big drum, and all the lights went out!', tr: '我{正在}舞台后面{收拾}鼓。我{搬着}大鼓的时候，{被一根电线绊了一下}——所有的灯就全灭了！', trHard: 'frame', task: ['e2-while'], ask: 'when 和 while 有什么不一样？' },
    { shots: [['e2.plug', 1]], who: 'Max', voice: 'max', t: 'I ⟦plugged it back in⟧ ⟦straight away⟧. It was only a minute. Sorry!', tr: '我{马上}{把插头插回去了}，只灭了一分钟。{对不起}！', trHard: 'words', ask: '“灯灭”的真正原因找到了吗？' },
    { shots: [['e2.benAskMax']], who: 'Ben', voice: 'ben', t: 'So you ⟦made the lights go out⟧! Did you see the panda?', tr: '原来是你{把灯弄灭的}！你看见熊猫了吗？', trHard: 'frame' },
    { shots: [['e2.girlFlash', 1.2]], id: 'girl', who: 'Max', voice: 'max', t: 'I didn’t look at the table. But I saw a girl with a big camera ⟦backstage⟧. She was ⟦in a hurry⟧.', tr: '我没{看}桌子。不过我在{后台}看见一个拿着大相机的女孩，她{急急忙忙的}。', trHard: 'words', ask: '拿相机的女孩可能是谁？' },
    { shots: [['e2.corridor', 1.2]], t: 'In the ⟦corridor⟧, a small girl runs past you with a ⟦camera bag⟧.', tr: '{走廊}里，一个小个子女孩背着{相机包}从你们身边跑过去。', trHard: 'words', voice: 'en' },
    { shots: [['e2.miaCU']], who: 'Mia', voice: 'mia', t: 'Sorry, I’m in a hurry! I’m Mia, from the ⟦school newspaper⟧.', tr: '对不起，我{赶时间}！我是 Mia，{校报}的。', trHard: 'words' },
    { shots: [['e2.benAskMia']], who: 'Ben', voice: 'ben', t: '⟦Just one question⟧, Mia. Where were you at 2:15?', tr: '{就问一个问题}，Mia。两点一刻的时候你在哪儿？', trHard: 'frame' },
    { shots: [['e2.gardenFlash', 1.2]], id: 'garden', who: 'Mia', voice: 'mia', t: 'At 2:15? I ⟦was taking photos⟧ in the garden. The light was so beautiful!', tr: '两点一刻？我{在}花园里{拍照}。那时候的光{特别好看}！', trHard: 'words' },
    { shots: [['e2.pen']], id: 'mia', who: 'Mia', voice: 'mia', t: 'Oh no, ⟦my pen is dead⟧. Ben, can you ⟦borrow⟧ me your pen?', tr: '哎呀，{我的笔没水了}。Ben，{!你能借我你的笔吗}？', trHard: 'frame', task: ['e2-mia'], ask: 'borrow 和 lend 怎么分？' },
    { shots: [['e2.benPen']], who: 'Ben', voice: 'ben', t: '(smiling) ⟦You mean⟧, “Can you ⟦lend⟧ me your pen?” ⟦Here you are⟧.', read: 'You mean, can you lend me your pen? Here you are.', tr: '（笑）{你是想说}“你能把笔{借给}我吗？”{给你}。', trHard: 'frame' },
    { shots: [['e2.miaRun', 1.2]], t: 'Mia writes something quickly and ⟦runs off⟧: “I have to send my photos to the newspaper ⟦before three⟧!”', read: 'Mia writes something quickly and runs off. I have to send my photos to the newspaper before three!', tr: 'Mia 飞快地写了点东西就{跑开了}：“我得{三点以前}把照片发给校报！”', trHard: 'words', voice: 'en' },
    { shots: [['e2.alibiBoard']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '把三个人的不在场证明连一连：两点一刻，谁在做什么？', task: ['e2-alibi'] },
    { shots: [['e2.mmm', 1.2]], who: 'Ben', voice: 'ben', t: 'Ms Green, Max, Mia… They all have an alibi. And look — all three names ⟦start with⟧ M!', read: 'Ms Green, Max, Mia. They all have an alibi. And look, all three names start with M!', tr: 'Green 老师、Max、Mia……{他们都有}不在场证明。你看——三个人的名字都{以} M {开头}！', trHard: 'frame' },
    { shots: [['e2.write']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '用一句英语，把 Max 的不在场证明记进侦探笔记：两点一刻，他在做什么？', task: ['e2-write'] },
    { shots: [['e2.noteAgain', 1.2]], t: '**2:49 p.m.** You look at the yellow note again. “Lent the panda.” Something about this word is ⟦strange⟧…', read: '2:49 p.m. You look at the yellow note again. Lent the panda. Something about this word is strange.', tr: '两点四十九。你又看了看那张黄纸条：Lent the panda。{这个词}，好像有点{不对劲}……', trHard: 'frame', voice: 'en', ask: '“Lent the panda” 哪里可能不对劲？' },
  ],
};

// ---------------- 拓展 ----------------
const EXT_ASK: Ext[] = [
  { id: 'x1', title: '问过去：be 动词搬到前面', need: 'always', steps: [
    T('t1', '', '问“那时候在哪儿”，用 **Where + was / were + 主语**：Where **were** you at 2:15? Where **was** Max?', ['You were in the office. → Where were you?', 'Max was backstage. → Where was Max?']),
    C('a', '想问 Mia 两点一刻在哪儿，哪一句对？', [
      ['*Where was Mia at 2:15?', '对：主语 Mia 是一个人，用 was。'],
      ['Where were Mia at 2:15?', 'Mia 是一个人，用 was。'],
      ['Where did Mia at 2:15?', 'did 后面要跟动作，“在哪儿”用 was。'],
    ], { keep: true }),
    fill('b', '把问句补全。', ['were', 'was', 'did'], [
      ['Where ___ you and Ben at 2:15?', 'were', '主语是 you and Ben，复数，用 were。'],
      ['Where ___ the panda at two o’clock?', 'was', '主语是 the panda，一个，用 was。'],
      ['What time ___ you see the drum case?', 'did', '后面有动作 see，用 did。'],
    ]),
  ] },
  { id: 'x2', title: '侦探的问话', need: 'opt', steps: [
    T('t1', '', '问不在场证明，侦探常问这几句：Where were you at …? / What were you doing at …? / Who was with you? / Can anyone prove it?（有人能证明吗？）'),
    Mt('a', '问题和回答连一连。', ['Where were you at 2:15?', 'What were you doing?', 'Who was with you?', 'Can anyone prove it?'], ['I was in the office.', 'I was printing certificates.', 'Nobody. I was alone.', 'Yes — look at this half-printed certificate.'], [0, 1, 2, 3], 'where 问地方，what … doing 问在做什么，who 问和谁在一起，prove 问证据。', { lh: 'Question', rh: 'Answer' }),
  ] },
];

const EXT_WHEN: Ext[] = [
  { id: 'x1', title: '一下子发生 vs 一直在做', need: 'always', steps: [
    T('t1', '', '灯“一下子”灭了，打印机“一下子”停了——这是突然发生的事，用一般过去时：went out、stopped。正在进行的背景，才用 was / were doing：I was printing.', undefined, viz('timeline', { mode: 'bg', bar: 'was printing（一直在打印）', dot: '⚡ 2:15 the lights went out / the printer stopped', note: '打印是背景；灯灭、打印机停，是一下子发生的事' })),
    C('a', '“灯灭的时候，我正在打印证书。”哪一句对？', [
      ['*When the lights went out, I was printing the certificates.', '对：灭灯是一下子（went out），打印是一直在做的背景（was printing）。'],
      ['When the lights were going out, I printed the certificates.', '反了：灭灯是一下子发生的，打印才是背景。'],
    ], { keep: true }),
    fill('b', '用对的形式填空。', ['stopped', 'was printing', 'went out', 'was eating'], [
      ['Ms Green ___ certificates at 2:15.', 'was printing', '那一刻正在做。'],
      ['Suddenly the lights ___.', 'went out', '一下子发生的事。'],
      ['When the lights went out, the printer ___.', 'stopped', '一下子停了。'],
      ['Ben ___ a mooncake when the lights went out.', 'was eating', '那一刻正在吃。'],
    ]),
  ] },
  { id: 'x2', title: 'at、on、in：说时间', need: 'opt', steps: [
    T('t1', '', '说时间，三个介词各管一块：**at** + 钟点（at 2:15）；**on** + 哪一天（on Friday）；**in** + 一段较长的时间（in the afternoon、in October）。'),
    So('a', '这些时间前面用哪个介词？', ['at', 'on', 'in'], [
      ['2:15', 0, '钟点用 at。'], ['two o’clock', 0, '钟点用 at。'],
      ['Friday', 1, '星期几用 on。'], ['Friday afternoon', 1, '“星期五下午”是具体某一天的下午，用 on。'],
      ['the afternoon', 2, '一段时间用 in。'], ['October', 2, '月份用 in。'],
    ]),
  ] },
];

const EXT_WAS: Ext[] = [
  { id: 'x1', title: 'was 还是 were', need: 'always', steps: [
    T('t1', '', 'I / he / she / it / 一个人 → **was**；you / we / they / 好几个人 → **were**。问句也一样：What **were** you doing? What **was** Max doing?'),
    C('a', '“What ___ Ms Green and the headmaster doing?”填——', [
      ['*were', '对：Ms Green and the headmaster 是两个人。'],
      ['was', '主语是两个人。'],
    ], { keep: true }),
    fill('b', '填 was 或 were。', ['was', 'were'], [
      ['At 2:15, I ___ eating a mooncake. — Ben', 'was', 'I 用 was。'],
      ['You ___ sitting in the front row.', 'were', 'you 用 were。'],
      ['Max and his friends ___ packing the drums.', 'were', '好几个人，用 were。'],
    ]),
  ] },
  { id: 'x2', title: '回答要配上问题', need: 'opt', steps: [
    C('a', 'Ben 问：What were you doing at 2:15? 哪个回答最好？', [
      ['*I was packing my drums.', '对：问“那一刻在做什么”，就用 was doing 回答。'],
      ['I pack my drums.', '这是平常的习惯，不是那一刻。'],
      ['I packed my drums.', '只说做了这件事，没说出“那一刻正在做”。'],
    ]),
  ] },
];

const EXT_WHILE: Ext[] = [
  { id: 'x1', title: 'when 和 while', need: 'always', steps: [
    T('t1', '', '一个长长的背景 + 一件突然的事。**while** 后面常跟长的那件（while I was carrying the drum）；**when** 后面常跟突然的那件（when the lights went out）。', undefined, viz('timeline', { mode: 'bg', bar: 'was carrying the drum（一直在搬）', dot: '💥 tripped over a cable', note: 'while + 一直在做的事；绊倒是一瞬间' })),
    C('a', '“I tripped over a cable while I was carrying the big drum.” 哪件是一直在做的背景？', [
      ['*搬大鼓（was carrying）', '对：搬鼓是一段时间；绊一下是一瞬间。'],
      ['被绊了一下（tripped）', '绊一下是一瞬间的事。'],
    ], { keep: true }),
    fill('b', '填 when 或 while。', ['when', 'while'], [
      ['___ I was carrying the drum, I tripped over a cable.', 'while', '后面是长的背景。'],
      ['I was printing certificates ___ the lights went out.', 'when', '后面是突然的事。'],
      ['Mia was taking photos ___ the bell rang.', 'when', '铃一响：突然的事。'],
    ]),
  ] },
  { id: 'x2', title: 'while 和 during', need: 'opt', steps: [
    T('t1', '', 'while 后面跟一句话（主语 + 动作）；**during** 后面只跟一个名词：during the festival、during the blackout（停电期间）。'),
    C('a', '哪一句对？', [
      ['*The panda disappeared during the festival.', '对：during + 名词。'],
      ['The panda disappeared during I was eating.', 'during 后面不能跟一句话，要用 while。'],
      ['The panda disappeared while the festival.', 'while 后面要跟一句话。'],
    ]),
  ] },
];

const EXT_MIA: Ext[] = [
  { id: 'x1', title: '东西往哪边走', need: 'always', steps: [
    T('t1', '', '还记得第一章吗？**borrow**：东西往自己这边来（借进来）；**lend**：东西从自己手里出去（借出去）。中文都说“借”，所以最容易用反。', ['Can I borrow your pen?（我借你的笔）', 'Can you lend me your pen?（你把笔借给我）']),
    C('a', 'Mia 想要 Ben 的笔。她可以说——', [
      ['*Can I borrow your pen? 或 Can you lend me your pen?', '对：两句都行，主语不一样，动词就不一样。'],
      ['Can you borrow me your pen?', '这是 Mia 说错的句子：borrow 后面不能跟“借给谁”。'],
      ['Can I lend your pen?', 'lend 是借出去，Mia 是要借进来。'],
    ], { keep: true }),
    fill('b', '填 borrow 或 lend（注意形式）。', ['borrow', 'lend', 'lent', 'borrowed'], [
      ['Could you ___ me your notebook? I’ll give it back.', 'lend', '你借给我：lend。'],
      ['Ben ___ your notebook in Chapter 1.', 'borrowed', '他借进来了：borrowed。'],
      ['I ___ Mia my pen yesterday.', 'lent', '我借出去了：lend 的过去式 lent。'],
      ['Can I ___ your camera for a minute?', 'borrow', '我借进来：borrow。'],
    ]),
  ] },
  { id: 'x2', title: '记住这一句', need: 'opt', steps: [
    T('t1', '', 'Mia 把 borrow 和 lend 用反了。你的侦探笔记里，值不值得记下这件小事？侦探常说：**小错误也是线索**。'),
    C('a', '侦探笔记里，这件事怎么记最好？', [
      ['*Mia said “Can you borrow me your pen?” — she mixes up borrow and lend.', '对：只写事实，先记下来，以后也许有用。'],
      ['Mia took the panda.', '这只是猜测，现在还没有证据。'],
    ]),
  ] },
];

const EXT_ALIBI: Ext[] = [
  { id: 'x1', title: '不在场证明，靠得住吗', need: 'always', steps: [
    T('t1', '', '侦探听完不在场证明，还要问：**有没有证据？** Green 老师有印了一半的证书；Max 承认绊倒电线，和灯灭的时间对得上；Mia 说在花园拍照——相机里的照片能证明吗？'),
    C('a', '三个人里，谁的不在场证明现在最缺证据？', [
      ['*Mia：只有她自己说，还没看到照片', '对。她说在花园拍照，可她跑得太快，我们没看到照片。'],
      ['Green 老师', '她有印了一半的证书。'],
      ['Max', '他的话和灯灭的时间对得上，箱子里也只有鼓。'],
    ], { keep: true }),
    C('b', '想看 Mia 的照片，用英语怎么请她最好？', [
      ['*Could you show us your photos, please?', '对：Could you … please? 客气地请别人做事。'],
      ['Show me your photos!', '像命令，不客气。'],
      ['Can I show your photos?', 'show 的人是 Mia，不是我们。'],
    ]),
  ] },
];

const EXT_WRITE: Ext[] = [
  { id: 'x1', title: '一句话写清楚', need: 'opt', steps: [
    T('t1', '', '好的不在场证明记录，要有三样：**谁、什么时候、那时在做什么（在哪儿）**。At 2:15, Max was carrying his drum behind the stage.'),
    C('a', '哪一句记得最清楚？', [
      ['*At 2:15, Mia was taking photos in the garden.', '对：时间、人、在做什么、在哪儿，都有。'],
      ['Mia took photos.', '什么时候？在哪儿？都没说。'],
      ['At 2:15, Mia takes photos in the garden.', '说的是那一刻，要用 was taking。'],
    ]),
  ] },
];

export const PLAY_EN2_ITEMS: Item[] = [
  item({
    id: 'e2-ask', st: 'en2', lv: 1, type: 'word', topic: 'where were you', label: 'Where were you at 2:15?', intro: '', ask: '问过去的事，问句怎么变？',
    hints: ['问的是过去那一刻在哪儿：be 动词用过去式，搬到主语前面。'],
    explain: 'Where were you at 2:15? —— 问过去某一刻在哪儿：Where + were + you。主语是 you，用 were。',
    ext: EXT_ASK,
  }, C('a', '哪一句问得对？', [
    ['*Excuse me, Ms Green. Where were you at 2:15?', '对：问过去某一刻在哪儿，Where were you …？前面加 Excuse me 更客气。'],
    ['Excuse me, Ms Green. Where are you at 2:15?', 'are 是现在，问的是已经过去的两点一刻。'],
    ['Excuse me, Ms Green. Where you were at 2:15?', '问句里 were 要放到 you 前面。'],
    ['Excuse me, Ms Green. Where did you at 2:15?', 'did 后面要跟动作；问“在哪儿”用 were。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e2-when', st: 'en2', lv: 2, type: 'word', topic: 'when + past simple', label: 'When the lights went out, the printer stopped', intro: '', ask: '什么时候用一般过去时，什么时候用 was doing？',
    hints: ['打印机是慢慢地停，还是一下子停了？'],
    explain: '灯一灭、打印机一停，都是一下子发生的事，用一般过去时（went out、stopped）。正在进行的背景（I was printing），才用 was doing。',
    lock: { words: ['When the lights went out', 'stopped'] },
    ext: EXT_WHEN,
  }, C('a', 'Green 老师为什么说 the printer stopped，不说 the printer was stopping？', [
    ['*打印机是一下子停的：一瞬间发生的事，用一般过去时', '对。was stopping 是“正在慢慢停下来”，不像停电。'],
    ['was stopping 是现在时', 'was stopping 也是过去，只是“正在进行”。'],
    ['两个都行，意思一样', 'was stopping 是“正在慢慢停”，和停电时一下子停住不一样。'],
    ['stopped 更短，好读', '选哪个时态看意思，不看长短。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e2-was', st: 'en2', lv: 1, type: 'word', topic: 'was / were', label: 'What were you doing?', intro: '', ask: '什么时候用 was，什么时候用 were？',
    hints: ['主语是谁？you 用 was 还是 were？'],
    explain: 'What were you doing at 2:15? 主语是 you，用 were。I / he / she / it 用 was；you / we / they 用 were。',
    lock: { words: ['What were you doing'] },
    ext: EXT_WAS,
  }, C('a', 'Ben 问 Max：What ___ you doing at 2:15? 填什么？为什么？', [
    ['*were：主语是 you', '对。you 后面用 were（哪怕只问一个人）。'],
    ['was：只问 Max 一个人', '问一个人，主语还是 you，you 用 were。'],
    ['did：问过去的事', 'did 后面跟动词原形，What did you do? 问的是“做了什么”，不是“那一刻在做什么”。'],
    ['are：Max 就在眼前', '问的是两点一刻，过去的事。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e2-while', st: 'en2', lv: 2, type: 'word', topic: 'while + past continuous', label: 'while I was carrying the big drum', intro: '', ask: 'when 和 while 有什么不一样？',
    hints: ['搬鼓花了一会儿；被电线绊一下，是一瞬间。'],
    explain: '搬大鼓是一段时间的背景（while I was carrying），绊倒是那一瞬间（tripped）。while 后面常跟“一直在做的事”。',
    lock: { words: ['while I was carrying', 'tripped over'] },
    ext: EXT_WHILE,
  }, C('a', 'Max 这句话里，哪件事是“一直在做”的，哪件事是“突然发生”的？', [
    ['*一直在做：搬大鼓；突然发生：被电线绊倒', '对。所以搬鼓用 was carrying，绊倒用 tripped。'],
    ['一直在做：被电线绊倒；突然发生：搬大鼓', '反了：绊一下只是一瞬间。'],
    ['两件都是一直在做', '绊倒是一瞬间的事。'],
    ['两件都是突然发生', '搬鼓搬了一会儿，所以用 was carrying。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e2-mia', st: 'en2', lv: 2, type: 'word', topic: 'borrow lend', label: 'Can you borrow me your pen?', intro: '', ask: 'borrow 和 lend 怎么分？',
    hints: ['笔要从 Ben 手里“出去”，到 Mia 这里。“出去”是 borrow 还是 lend？'],
    explain: '笔从 Ben 手里借出去，是 lend：Can you lend me your pen? 或者换个主语：Can I borrow your pen? Mia 把两个词用反了。',
    back: [{ ch: 'en1', line: 'borrow', label: '第一章：Can I borrow your notebook?' }],
    lock: { words: ['borrow'], lines: ['mia'] },
    ext: EXT_MIA,
  }, C('a', 'Mia 说 Can you borrow me your pen? 她应该怎么说？', [
    ['*Can you lend me your pen?', '对：笔从 Ben 手里借出去，用 lend。也可以说 Can I borrow your pen?'],
    ['Can you borrowed me your pen?', 'can 后面跟动词原形；而且 borrow 用错了。'],
    ['Can I lend your pen?', '“我借出去你的笔”说不通。'],
    ['Can you borrow your pen to me?', '还是 borrow：borrow 是借进来。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e2-alibi', st: 'en2', lv: 1, type: 'match', topic: 'alibis', label: '三个人的不在场证明', intro: '', ask: '侦探怎么检查不在场证明？',
    hints: ['Green 老师在办公室；Max 在舞台后面；Mia 说她在花园。'],
    explain: 'Ms Green was printing certificates in the office. Max was carrying his drum behind the stage. Mia was taking photos in the garden.',
    ext: EXT_ALIBI,
  }, Mt('m', '两点一刻，谁在做什么？连起来。', ['Ms Green', 'Max', 'Mia'], ['was printing certificates in the office.', 'was carrying his drum behind the stage.', 'was taking photos in the garden.'], [0, 1, 2], '三个人都说自己当时在别处：Green 老师在办公室打印，Max 在后台搬鼓，Mia 在花园拍照。', { lh: 'Who', rh: 'At 2:15 …' })),

  item({
    id: 'e2-write', st: 'en2', lv: 2, type: 'write', topic: 'Max’s alibi', label: '记下 Max 的不在场证明', intro: '', ask: '侦探笔记怎么写？',
    hints: ['At 2:15, Max was … 写出他那一刻在做什么、在哪儿。'],
    explain: 'At 2:15, Max was carrying his drum behind the stage. —— 时间、人、那一刻在做什么（was doing）、在哪儿。',
    ext: EXT_WRITE,
  }, Wr('w', 'Write Max’s alibi in English: what was he doing at 2:15? (one sentence)', {
    lang: 'en', role: 'en',
    task: 'In a detective story set in a school, the student writes one English sentence in a detective notebook: what Max (a drummer) was doing at 2:15, when the lights went out. Max said he was packing his drums / carrying the big drum behind the stage, and he tripped over a cable. The past continuous (was carrying / was packing) is the natural choice for “what he was doing at that moment”.',
    criteria: ['says what Max was doing at 2:15 (packing / carrying his drum(s), behind the stage / backstage), or that he tripped over a cable', 'uses the past continuous for the activity at that moment (was carrying / was packing); “Max carried his drum” loses the “at that moment” meaning — point this out kindly', '“his drum” (the big drum) and “his drums” are both correct — do not change one into the other', 'British English spelling is fine; minor punctuation is not an error'],
    examples: ['At 2:15, Max was carrying his drum behind the stage.', 'At 2:15, Max was packing his drums backstage, and he tripped over a cable.'],
    words: ['At 2:15', 'Max', 'was carrying', 'behind the stage'], frame: 'At 2:15, Max was ______ .', ph: 'At 2:15, Max …',
  })),
];
