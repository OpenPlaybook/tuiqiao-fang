// 英文故事 The Case of the Golden Panda · Chapter 2 Where were you?（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）
// 语法就是线索：was / were doing（那一刻正在做）、when 和 while（背景 + 突然发生的事）、问不在场证明的问法。
// 暗线：Green 老师打电话时随口说了“yes, yes”；Max 绊到电线，灯才灭；Mia 把 borrow 和 lend 用反了（第三章的关键）。
import { C, Mt, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, Item, Play, TeachSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string, string[]?][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why, alt]) => ({ t, a, why, ...(alt ? { alt } : {}) })) });
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
    'We’ve talked to': { d: '我们（已经）和……谈过了：have + 过去分词，说到现在为止做完的事——三个人现在都问过了。' },
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
    { shots: [['e2.benPlan']], id: 'suspect', who: 'Ben', voice: 'ben', task: ['e2-suspect'], t: 'Everyone who was near the stage at 2:15 is a ⟦suspect⟧. Let’s ask them ⟦one by one⟧.', tr: '两点一刻在舞台附近的{每个人}都有{嫌疑}。我们{一个一个地}问。', trHard: 'words' },
    { shots: [['e2.office', 1.2]], t: 'First, you go to the office. Ms Green is standing next to the ⟦printer⟧. There are papers ⟦all over the floor⟧.', tr: '你们先去了{办公室}。Green 老师正站在{打印机}旁边。{满地}都是纸。', trHard: 'words', voice: 'en' },
    { shots: [['e2.office']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '你想问 Green 老师：两点一刻的时候，她在哪儿？用英语怎么问最好？', task: ['e2-ask'], ask: '问过去的事，英语句子要怎么变？' },
    { shots: [['e2.benAsk']], id: 'ask', who: 'Ben', voice: 'ben', t: 'Excuse me, Ms Green. ⟦Where were you⟧ at 2:15?', tr: '{打扰一下}，Green 老师。两点一刻的时候，您{在哪儿}？', trHard: 'frame' },
    { shots: [['e2.greenTalk']], who: 'Ms Green', voice: 'green', t: '⟦I was right here⟧. I ⟦was printing⟧ the ⟦certificates⟧ for the winners.', tr: '我{就在这儿}。我{正在打印}给获奖者的{证书}。', trHard: 'words' },
    { shots: [['e2.printerStop', 1]], id: 'when', who: 'Ms Green', voice: 'green', t: '⟦When the lights went out⟧, the printer ⟦stopped⟧. Look — this one is only ⟦half printed⟧!', read: 'When the lights went out, the printer stopped. Look, this one is only half printed!', tr: '{灯一灭}，打印机就{停了}。你们看——这张{只打印了一半}！', trHard: 'frame', task: ['e2-when'], ask: '为什么是 the printer stopped，不是 was stopping？' },
    { shots: [['e2.halfCert']], t: 'She shows you a certificate. Only the ⟦top half⟧ is printed. The rest is empty.', tr: '她给你们看一张证书：只有{上半部分}印出来了，{下面}是空白。', trHard: 'words', voice: 'en' },
    { shots: [['e2.whisper']], who: 'Ben', voice: 'ben', t: '(quietly) A half-printed certificate. So she really was here at 2:15. That’s her ⟦alibi⟧.', read: 'A half-printed certificate. So she really was here at 2:15. That’s her alibi.', tr: '（小声）一张印了一半的证书。所以两点一刻她{真的}在这儿。这就是她的{不在场证明}。', trHard: 'words' },
    { shots: [['e2.benAsk']], who: 'Ben', voice: 'ben', t: 'Did anyone come in ⟦before the lights went out⟧?', tr: '{灯灭之前}，有人进来过吗？', trHard: 'frame' },
    { shots: [['e2.greenPhone', 1.2]], id: 'yesyes', who: 'Ms Green', voice: 'green', t: 'Hmm… I was ⟦on the phone with⟧ the ⟦headmaster⟧ ⟦most of the time⟧. A few students came in and ⟦asked me things⟧. I just said, “Yes, yes.”', read: 'Hmm… I was on the phone with the headmaster most of the time. A few students came in and asked me things. I just said, yes, yes.', tr: '嗯……那段时间我{大部分时候}都在和{校长}{打电话}。有几个学生进来{问我事情}，我就说了“好，好”。', trHard: 'words', ask: 'Green 老师说的 “Yes, yes” 可能是在答应什么？', task: ['e2-say'] },
    { shots: [['e2.musicRoom', 1.2]], t: 'Next, the ⟦music room⟧. A tall boy is ⟦putting a drum into⟧ a big black case.', tr: '接着去{音乐教室}。一个高个子男孩正{把一面鼓放进}一个黑色的大箱子。', trHard: 'words', voice: 'en' },
    { shots: [['e2.maxOpen', 1.2]], who: 'Max', voice: 'max', t: 'Hi, I’m Max. Yes, this case is mine. ⟦Do you want to look inside⟧?', tr: '嗨，我是 Max。对，这个箱子{是我的}。你们{想看看里面}吗？', trHard: 'frame' },
    { shots: [['e2.caseInside']], t: 'Inside the case there is only a drum. No panda.', tr: '箱子里{只有}一面鼓。{没有}熊猫。', trHard: 'frame', voice: 'en' },
    { shots: [['e2.benAskMax']], id: 'were', who: 'Ben', voice: 'ben', t: '⟦What were you doing⟧ at 2:15, Max?', tr: 'Max，两点一刻的时候你{在做什么}？', trHard: 'frame', task: ['e2-was'], ask: '什么时候用 was，什么时候用 were？' },
    { shots: [['e2.tripFlash', 1.4]], id: 'trip', who: 'Max', voice: 'max', t: 'I ⟦was packing⟧ my drums ⟦behind the stage⟧. I ⟦tripped over⟧ a ⟦cable⟧ ⟦while I was carrying⟧ the big drum — and all the lights went out!', read: 'I was packing my drums behind the stage. I tripped over a cable while I was carrying the big drum, and all the lights went out!', tr: '我{正在}舞台后面{收拾}鼓。我{搬着}大鼓的时候，{被一根电线绊了一下}——所有的灯就全灭了！', trHard: 'frame', task: ['e2-while'], ask: 'when 和 while 有什么不一样？' },
    { shots: [['e2.plug', 1]], who: 'Max', voice: 'max', t: 'I ⟦plugged it back in⟧ ⟦straight away⟧. It was only a minute. Sorry!', tr: '我{马上}{把插头插回去了}，只灭了一分钟。{对不起}！', trHard: 'words', ask: '“灯灭”的真正原因找到了吗？' },
    { side: ['e2-x-make'], shots: [['e2.benAskMax']], who: 'Ben', voice: 'ben', t: 'So you ⟦made the lights go out⟧! Did you see the panda?', tr: '原来是你{把灯弄灭的}！你看见熊猫了吗？', trHard: 'frame' },
    { shots: [['e2.girlFlash', 1.2]], id: 'girl', who: 'Max', voice: 'max', t: 'I didn’t look at the table. But I saw a girl with a big camera ⟦backstage⟧. She was ⟦in a hurry⟧.', tr: '我没{看}桌子。不过我在{后台}看见一个拿着大相机的女孩，她{急急忙忙的}。', trHard: 'words', ask: '拿相机的女孩可能是谁？', task: ['e2-look'] },
    { shots: [['e2.corridor', 1.2]], t: 'In the ⟦corridor⟧, a small girl runs past you with a ⟦camera bag⟧.', tr: '{走廊}里，一个小个子女孩背着{相机包}从你们身边跑过去。', trHard: 'words', voice: 'en' },
    { shots: [['e2.miaCU']], who: 'Mia', voice: 'mia', t: 'Sorry, I’m in a hurry! I’m Mia, from the ⟦school newspaper⟧.', tr: '对不起，我{赶时间}！我是 Mia，{校报}的。', trHard: 'words' },
    { shots: [['e2.benAskMia']], who: 'Ben', voice: 'ben', t: '⟦Just one question⟧, Mia. Where were you at 2:15?', tr: '{就问一个问题}，Mia。两点一刻的时候你在哪儿？', trHard: 'frame' },
    { shots: [['e2.gardenFlash', 1.2]], id: 'garden', who: 'Mia', voice: 'mia', t: 'At 2:15? I ⟦was taking photos⟧ in the garden. The light was so beautiful!', tr: '两点一刻？我{在}花园里{拍照}。那时候的光{特别好看}！', trHard: 'words' },
    { shots: [['e2.pen']], id: 'mia', who: 'Mia', voice: 'mia', t: 'Oh no, ⟦my pen is dead⟧. Ben, can you ⟦borrow⟧ me your pen?', tr: '哎呀，{我的笔没水了}。Ben，{!你能借我你的笔吗}？', trHard: 'frame', task: ['e2-mia'], ask: 'borrow 和 lend 怎么分？' },
    { shots: [['e2.benPen']], id: 'mean', who: 'Ben', voice: 'ben', task: ['e2-mean'], t: '(smiling) ⟦You mean⟧, “Can you ⟦lend⟧ me your pen?” ⟦Here you are⟧.', read: 'You mean, can you lend me your pen? Here you are.', tr: '（笑）{你是想说}“你能把笔{借给}我吗？”{给你}。', trHard: 'frame' },
    { shots: [['e2.miaRun', 1.2]], t: 'Mia writes something quickly and ⟦runs off⟧: “I have to send my photos to the newspaper ⟦before three⟧!”', read: 'Mia writes something quickly and runs off. I have to send my photos to the newspaper before three!', tr: 'Mia 飞快地写了点东西就{跑开了}：“我得{三点以前}把照片发给校报！”', trHard: 'words', voice: 'en' },
    { shots: [['e2.benPlan']], who: 'Ben', voice: 'ben', t: 'Ms Green, Max, Mia… ⟦We’ve talked to⟧ all three, and they all have an alibi.', read: 'Ms Green, Max, Mia. We’ve talked to all three, and they all have an alibi.', tr: 'Green 老师、Max、Mia……三个人{我们都问过了}，{他们都有}不在场证明。', trHard: 'words' },
    { shots: [['e2.alibiBoard']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '把三个人的不在场证明连一连：两点一刻，谁在做什么？', task: ['e2-alibi'] },
    { shots: [['e2.mmm', 1.2]], who: 'Ben', voice: 'ben', t: 'But look — all three names ⟦start with⟧ M!', read: 'But look, all three names start with M!', tr: '可是你看——三个人的名字都{以} M {开头}！', trHard: 'frame' },
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
    fill('b', '把问句补全，有的词用不上。', ['were', 'was', 'did', 'does'], [
      ['Where ___ you and Ben at 2:15?', 'were', '线索：主语是 you and Ben（两个人），后面没有别的动作——用 were。'],
      ['Where ___ the panda at two o’clock?', 'was', '线索：主语是 the panda（一个），后面没有别的动作——用 was。'],
      ['What time ___ you see the drum case?', 'did', '线索：后面还有动作 see——问过去的动作，用 did，动作用原形。does 是现在时；这里问的是过去，而且主语 you 也不配 does。'],
    ]),
  ] },
  { id: 'x2', title: '侦探的问话', need: 'opt', steps: [
    T('t1', '', '问不在场证明，侦探常问这几句：Where were you at …? / What were you doing at …? / Who was with you? / Can anyone prove it?（有人能证明吗？）'),
    Mt('a', '问题和回答连一连。', ['Where were you at 2:15?', 'What were you doing?', 'Who was with you?', 'Can anyone prove it?'], ['I was in the office.', 'I was printing certificates.', 'Nobody. I was alone.', 'Yes — look at this half-printed certificate.'], [0, 1, 2, 3], 'where 问地方，what … doing 问在做什么，who 问和谁在一起，prove 问证据。', { lh: 'Question', rh: 'Answer' }),
  ] },
];

const EXT_WHEN: Ext[] = [
  { id: 'x1', title: '一下子发生 vs 一直在做', need: 'always', steps: [
    T('t0', '', '先看一遍两点一刻办公室里发生了什么：', undefined, viz('clip', { shots: [['tq.print', 1]], dur: 9, cap: [[0, '2:10　Ms Green **is printing** certificates.'], [0.45, '2:15　The lights **went out**. The printer **stopped**.'], [0.72, 'At 2:15, Ms Green **was printing** certificates.']], marks: [[0.05, '2:10'], [0.47, '2:15']] })),
    C('t0a', '这段里，哪件事是“一直在做”的，哪件是“一下子发生”的？', [
      ['*打印是一直在做的；灯灭、打印机停是一下子发生的', '对：所以打印用 was printing，灯灭用 went out。'],
      ['灯灭是一直在做的；打印是一下子发生的', '打印早就开始了，灯是“啪”一下灭的。'],
    ], { keep: true }),
    T('t1', '', '灯“一下子”灭了，打印机“一下子”停了——这是突然发生的事，用一般过去时：went out、stopped。正在进行的背景，才用 was / were doing：I was printing.', undefined, viz('timeline', { mode: 'bg', bar: 'was printing（一直在打印）', dot: '⚡ 2:15 the lights went out / the printer stopped', note: '打印是背景；灯灭、打印机停，是一下子发生的事' })),
    C('a', '“灯灭的时候，我正在打印证书。”哪一句对？', [
      ['*When the lights went out, I was printing the certificates.', '对：灭灯是一下子（went out），打印是一直在做的背景（was printing）。'],
      ['When the lights were going out, I printed the certificates.', '反了：灭灯是一下子发生的，打印才是背景。'],
    ], { keep: true }),
    fill('b', '用对的形式填空，有的词用不上。', ['stopped', 'was printing', 'went out', 'was eating', 'printing', 'were eating'], [
      ['Ms Green ___ certificates at 2:15.', 'was printing', '线索：at 2:15 这一刻——正在做的事：was printing。只填 printing 不行：前面少了 was。'],
      ['Suddenly the lights ___.', 'went out', '线索：Suddenly——一下子发生的事，一般过去时：went out。'],
      ['When the lights went out, the printer ___.', 'stopped', '线索：灯一灭，打印机就停——一下子的事：stopped。不是 was printing（那是她一直在做的）。'],
      ['Ben ___ a mooncake when the lights went out.', 'was eating', '线索：when the lights went out——灯灭的那一刻他正在吃：was eating。were eating 不行：Ben 是一个人，不用 were。'],
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
    fill('b', '填 was 或 were，有的词用不上。', ['was', 'were', 'did'], [
      ['At 2:15, I ___ eating a mooncake. — Ben', 'was', '线索：主语 I——was。did 后面要跟动词原形（did eat），这里是 eating，不能用 did。'],
      ['You ___ sitting in the front row.', 'were', '线索：主语 you——不管一个人还是几个人，都用 were。'],
      ['Max and his friends ___ packing the drums.', 'were', '线索：Max and his friends——好几个人，用 were。'],
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
    T('t0', '', '先看 Max 搬鼓：', undefined, viz('clip', { shots: [['tq.drum', 1]], dur: 8, cap: [[0, 'Max **is carrying** the big drum.'], [0.5, 'Oops! He **tripped** over a cable.'], [0.75, '**While** he **was carrying** the drum, he **tripped** over a cable.']], marks: [[0.05, '搬起来'], [0.52, '绊一下']] })),
    T('t1', '', '一个长长的背景 + 一件突然的事。**while** 后面常跟长的那件（while I was carrying the drum）；**when** 后面常跟突然的那件（when the lights went out）。', undefined, viz('timeline', { mode: 'bg', bar: 'was carrying the drum（一直在搬）', dot: '💥 tripped over a cable', note: 'while + 一直在做的事；绊倒是一瞬间' })),
    C('a', '“I tripped over a cable while I was carrying the big drum.” 哪件是一直在做的背景？', [
      ['*搬大鼓（was carrying）', '对：搬鼓是一段时间；绊一下是一瞬间。'],
      ['被绊了一下（tripped）', '绊一下是一瞬间的事。'],
    ], { keep: true }),
    fill('b', '填 when 或 while，有的词用不上。', ['when', 'while', 'during'], [
      ['___ I was carrying the drum, I tripped over a cable.', 'while', '线索：后面是 was carrying（一直在做的背景）——while。填 when 也不算错，只是 while 更突出“正在搬的那一段时间里”。during 后面只跟名词（during the festival），不跟一句话。', ['when']],
      ['I was printing certificates ___ the lights went out.', 'when', '线索：后面是 went out（一下子发生的事）——when。'],
      ['Mia was taking photos ___ the bell rang.', 'when', '线索：后面是 the bell rang（铃一响，一下子的事）——when。'],
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
    fill('b', '填 borrow 或 lend（注意形式），有的词用不上。', ['borrow', 'lend', 'lent', 'borrowed', 'lends'], [
      ['Could you ___ me your notebook? I’ll give it back.', 'lend', '线索：Could you ___ me——你借给我：lend。'],
      ['Ben ___ your notebook in Chapter 1.', 'borrowed', '线索：第一章 Ben 从你那儿借了本子，过去的事——借进来：borrowed。'],
      ['I ___ Mia my pen yesterday.', 'lent', '线索：我把笔借给 Mia（借出去），yesterday——lent。lend、lends 都是现在的说法，有 yesterday 要用过去式。'],
      ['Can I ___ your camera for a minute?', 'borrow', '线索：Can I——我借进来：borrow。'],
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
    T('t2', '', 'Ben 刚才说：“We’ve **talked** to all three.”——问的事发生在过去，结果留到现在：三个人现在都问过了。第一章 Green 老师喊的 Someone **has taken** it! 也是这样：拿走发生在过去，现在桌上空着。'),
    C('c', '要说清楚“两点四十五分，我们和 Max 谈过”，哪一句对？', [
      ['*We talked to Max at 2:45.', '对：说出了具体的时间点（at 2:45），用一般过去时。'],
      ['We’ve talked to Max at 2:45.', '现在完成时说的是到现在的结果，不和 at 2:45 这样具体的过去时间连用。'],
    ], { keep: true }),
    C('d', '“三个人我们都问过了。下一步，看纸条。”Ben 会说——', [
      ['*We’ve talked to all three. Now let’s look at the note.', '对：问完了，结果留到现在，接着做下一步。'],
      ['We were talking to all three. Now let’s look at the note.', 'were talking 是“那时正在谈”，说的不是“已经问完了”。'],
    ], { keep: true }),
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


// ---------------- 词汇：嫌疑人、看、说、意思（前后几章都会再见） ----------------
const EXT_SUSPECT: Ext[] = [
  { id: 'x1', title: '侦探故事里的人', need: 'always', steps: [
    T('t1', '', '“Everyone who was near the stage at 2:15 is a suspect.”——**suspect**（名词）：嫌疑人，有可能做了这件事的人。还没查清楚，不等于就是坏人。'),
    C('a', 'Ben 说大家都是 suspect，意思是——', [
      ['*他们都有可能拿了熊猫，要一个一个问清楚', '对：只是有可能。'],
      ['他们都是小偷', 'suspect 还没定案，只是“有嫌疑”。'],
    ], { keep: true }),
    T('t2', '', 'suspect 还能当动词：“怀疑”。名词重音在前：**SUS**pect；动词重音在后：sus**PECT**。I suspect Max.（我怀疑是 Max。）'),
    C('b', '“I suspect that the drum case is too small.” 是——', [
      ['*我怀疑那个鼓箱太小了（装不下）', '对：这里是动词，“怀疑、猜想”。'],
      ['我是那个鼓箱的嫌疑人', 'suspect 后面跟着一句话，是动词。'],
    ], { keep: true }),
    Mt('c', '侦探故事里的人和词，连一连。', ['suspect', 'witness', 'detective', 'alibi'], ['嫌疑人', '目击者、证人', '侦探', '不在场证明'], [0, 1, 2, 3], '刘师傅看见了拿鼓箱的男孩：他是 witness；你和 Ben 是 detectives；Max 说自己在搬鼓，是他的 alibi。', { lh: '英语', rh: '中文' }),
    fill('d', '放进句子，有的词用不上。', ['suspect', 'witness', 'alibi', 'detectives', 'thief'], [
      ['Mr Liu saw a boy with a drum case. He is a ___.', 'witness', '线索：他“看见了”事情——目击者：witness，不是嫌疑人。'],
      ['Max was near the stage at 2:15, so he is a ___.', 'suspect', '线索：当时在现场附近——有嫌疑的人：suspect。thief 是确定偷了东西的人；只是在现场附近，还不能叫他 thief。'],
      ['Ms Green was printing certificates. That’s her ___.', 'alibi', '线索：她当时在做别的事，能说明不是她——不在场证明：alibi。'],
      ['You and Ben are the two ___ in this story.', 'detectives', '线索：你和 Ben 在查案——侦探：detectives（两个人，复数）。'],
    ]),
  ] },
];

const EXT_LOOK: Ext[] = [
  { id: 'x1', title: '再说 look 和 see', need: 'always', steps: [
    T('t1', '', 'Max 说：“I didn’t look at the table. But I saw a girl …”——第一章刘师傅那里学过：**look** 是自己把眼睛转过去看；**see** 是东西进了眼睛，看见了。'),
    C('a', 'Max 为什么前一句用 look at，后一句用 saw？', [
      ['*桌子他没特意去看；那个女孩是自己闯进了他的眼睛', '对：一个是“没去看”，一个是“看见了”。'],
      ['look 和 see 意思一样，换着用', '不一样：look 是动作，see 是结果。'],
    ], { keep: true }),
    T('t2', '', 'look 后面加不同的小词，意思就变了：**look at**（看着）、**look for**（找）、**look inside**（往里看）、**look after**（照顾）、**look like**（看起来像）。'),
    Mt('b', '连一连。', ['look for', 'look inside', 'look after', 'look like'], ['照顾', '看起来像', '找', '往里面看'], [2, 3, 0, 1], 'look 是“看”，后面的小词定方向：for 找、inside 往里、after 照顾、like 像。', { lh: '英语', rh: '中文' }),
    fill('c', '放进句子，有的词用不上。', ['look for', 'look inside', 'look after', 'looks like', 'looking for', 'look like'], [
      ['We must ___ the Golden Panda before three!', 'look for', '线索：熊猫还没找到，三点前要——去找：look for。looking for 不行：must 后面要用动词原形。'],
      ['“Do you want to ___?” Max opened the drum case.', 'look inside', '线索：Max 打开了鼓箱——往里面看：look inside。'],
      ['Can you ___ my little sister this afternoon?', 'look after', '线索：my little sister——照看：look after。'],
      ['Look at those dark clouds. It ___ rain.', 'looks like', '线索：看见乌云——看起来像要下雨：looks like。look like 不行：主语 It 是单数，动词要加 s。'],
    ]),
    C('d', '找出用错的一句：', [
      ['*I’m looking my key. Have you seen it?', '对，这句错了：找东西要说 looking for my key。'],
      ['I looked everywhere, but I didn’t see it.', '这句没错：到处找了，可没看见。'],
    ], { keep: true }),
  ] },
];

const EXT_SAY: Ext[] = [
  { id: 'x1', title: '英语里的“说”', need: 'always', steps: [
    T('t1', '', '中文都说“说”，英语分四个：**say**（说出一句话：said “Yes, yes”）；**tell**（告诉某人：tell me the truth）；**speak**（讲、说某种语言：speak English）；**talk**（交谈：talk to Ben）。'),
    C('a', 'Green 老师说：I just said, “Yes, yes.” 为什么用 said，不用 told？', [
      ['*say 后面直接跟说的话；tell 后面要先跟人', '对：said “Yes, yes”；told them “yes”。'],
      ['said 和 told 完全一样', '后面跟的东西不一样。'],
    ], { keep: true }),
    C('b', '哪一句对？', [
      ['*Mia told Ms Green about the photo.', '对：tell + 人 + about 事。'],
      ['Mia said Ms Green about the photo.', 'say 后面不能直接跟人；要说 said to Ms Green。'],
    ], { keep: true }),
    T('t2', '', 'speak 常跟语言、正式的讲话：Ben speaks English and a little Chinese. talk 是两个人你一句我一句：Ms Green was talking to the headmaster on the phone.'),
    fill('c', '放进句子，有的词用不上。', ['said', 'told', 'speak', 'talking', 'say', 'telling'], [
      ['Ms Green just ___, “Yes, yes.”', 'said', '线索：后面直接是说的话“Yes, yes.”——said。tell 后面要先跟人。'],
      ['Ben ___ us a funny story about London.', 'told', '线索：后面先跟人 us，再跟 a story——讲给我们听：told。'],
      ['Can you ___ Chinese, Ben?', 'speak', '线索：后面是一种语言 Chinese——会说：speak。say 后面跟要说的话，不跟一种语言。'],
      ['Ms Green was ___ to the headmaster on the phone.', 'talking', '线索：to the headmaster，在电话上你一句我一句——talking to。telling 不行：tell 后面直接跟人（tell him），不加 to。'],
    ]),
    C('d', '找出用错的一句：', [
      ['*Please say me the answer.', '对，这句错了：要说 Please tell me the answer.'],
      ['What did you say?', '这句没错：你刚才说什么？'],
    ], { keep: true }),
  ] },
];

const EXT_MEAN: Ext[] = [
  { id: 'x1', title: 'mean：意思是', need: 'always', steps: [
    T('t1', '', 'Ben 笑着说：“You mean, ‘Can you lend me your pen?’”——**You mean …**：你的意思是……。帮别人把话说对，又不让人难堪，常这么说。'),
    C('a', 'You mean … 还能用来确认自己没听错。同学说：“See you at the gate at three!”学校有两个门，你可以问——', [
      ['*You mean the front gate?', '对：把你理解的说一遍，请对方确认。'],
      ['You are wrong.', '对方没说错，你只是想确认是哪个门。'],
    ], { keep: true }),
    T('t2', '', 'mean 还有几种常见用法：**What does “lend” mean?**（lend 是什么意思？）；**I didn’t mean it.**（我不是故意的。）mean 的过去式是 **meant**（读 /ment/）。'),
    C('b', '问“这个词是什么意思”，哪一句对？', [
      ['*What does this word mean?', '对：does … mean。'],
      ['What is this word mean?', 'is 和 mean 不能放在一起；要用 does。'],
    ], { keep: true }),
    C('c', '你不小心碰掉了同学的书，赶紧说：“Sorry, I ___ to do that!”', [
      ['*didn’t mean', '对：I didn’t mean to …：我不是故意的。'],
      ['don’t mean', '事情刚发生过，用过去式：didn’t mean。'],
    ], { keep: true }),
    T('t3', '', '小心：mean 当形容词，是“刻薄、小气”：Don’t be mean to your little brother.（别对弟弟那么凶。）'),
    fill('d', '放进句子，有的词用不上。', ['mean', 'meant', 'means', 'meaning'], [
      ['What does “alibi” ___?', 'mean', '线索：does 后面用动词原形——mean。'],
      ['Sorry, I ___ to say “lend”, not “borrow”.', 'meant', '线索：Sorry，刚才说错了——“我本来想说的是”：meant，过去式。'],
      ['A green light ___ you can go.', 'means', '线索：主语是 A green light（一个），一般现在时——means。meaning 是名词“意思”，不能当动词；mean 少了 s，也不行。'],
    ]),
  ] },
];

export const PLAY_EN2_ITEMS: Item[] = [
  item({
    id: 'e2-suspect', st: 'en2', lv: 1, type: 'word', topic: 'suspect', label: 'is a suspect', intro: '', ask: 'suspect 和 witness 有什么不一样？',
    hints: ['点一点 suspect。他们是确定拿了熊猫，还是有可能？'],
    explain: 'suspect：嫌疑人——有可能做了这件事，还没查清楚。',
    lock: { words: ['suspect'] },
    ext: EXT_SUSPECT,
  }, C('a', '“Everyone who was near the stage at 2:15 is a suspect.” 是说——', [
    ['*两点一刻在舞台附近的人，都有可能拿了熊猫', '对。'],
    ['两点一刻在舞台附近的人，都是小偷', 'suspect 只是有嫌疑。'],
    ['两点一刻在舞台附近的人，都是证人', '证人是 witness。'],
    ['两点一刻在舞台附近的人，都要表演节目', '说的是查案。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e2-look', st: 'en2', lv: 2, type: 'word', topic: 'look at / see', label: 'I didn’t look at the table', intro: '', ask: 'look at、look for 有什么不一样？',
    hints: ['桌子，他特意去看了吗？那个女孩呢？'],
    explain: 'Max 没特意去看桌子（didn’t look at），可是一个拿相机的女孩进了他的眼睛（saw）。look 是动作，see 是结果。',
    back: [{ ch: 'en1', line: 'watch', label: '第一章：look / see / watch' }],
    ext: EXT_LOOK,
  }, C('a', 'Max 说 I didn’t look at the table. But I saw a girl…… 意思是——', [
    ['*我没特意去看桌子，可是看见了一个女孩', '对。'],
    ['我看不见桌子，可是我在找一个女孩', '“找”是 look for。'],
    ['我没看见桌子，也没看见女孩', '他看见了女孩。'],
    ['我不喜欢那张桌子', 'look at 说的是看。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e2-say', st: 'en2', lv: 2, type: 'word', topic: 'say / tell', label: 'I just said, “Yes, yes.”', intro: '', ask: 'say、tell、speak、talk 怎么分？',
    hints: ['said 后面直接跟着说的话。'],
    explain: 'say 后面直接跟说的话（said “Yes, yes”）；tell 后面先跟人（told them）。',
    ext: EXT_SAY,
  }, C('a', '要说“Max 告诉我们，他当时在搬鼓”，哪一句对？', [
    ['*Max told us he was carrying a drum.', '对：tell + 人 + 事。'],
    ['Max said us he was carrying a drum.', 'say 后面不能直接跟人；要说 Max said (that) he was …'],
    ['Max spoke us he was carrying a drum.', 'speak 是讲话、说某种语言。'],
    ['Max talked us he was carrying a drum.', 'talk 是交谈：talk to someone。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e2-mean', st: 'en2', lv: 2, type: 'word', topic: 'You mean', label: 'You mean, “Can you lend …”', intro: '', ask: 'mean 有哪几种意思？',
    hints: ['Ben 是在批评 Mia，还是在帮她？'],
    explain: 'You mean …：你的意思是……。Ben 客气地帮 Mia 把 borrow 改成了 lend。',
    lock: { words: ['You mean'] },
    ext: EXT_MEAN,
  }, C('a', 'Ben 说“You mean, ‘Can you lend me your pen?’”，是——', [
    ['*客气地帮 Mia 改正：你想说的是 lend', '对。'],
    ['问 Mia：你是什么意思？', '他已经知道 Mia 的意思了。'],
    ['说 Mia 很刻薄', 'mean 当形容词才是刻薄；这里是“意思是”。'],
    ['拒绝借笔给 Mia', '他接着说 Here you are：给你。'],
  ], { cols: 1, reveal: 'chosen' })),

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
  // ---------------- 支线任务：可做可不做（补词汇：词族、易混的词、挑错） ----------------
  item({
    id: 'e2-x-make', st: 'en2', lv: 2, type: 'word', topic: 'make / do / take', label: 'make、do，还有 take a photo', intro: '', ask: 'make 和 do 有什么不一样？',
    hints: ['make 常常是“做出、弄出”一样东西；do 常常是“做”一件事。'],
    explain: 'made the lights go out：弄得灯灭了（make + 东西 + 动词原形）。make 多是做出东西、弄出结果（make a mistake, make a noise）；do 多是做一件事（do homework, do your best）；拍照说 take a photo。',
  },
    T('t1', '', '“So you **made** the lights **go out**!”——**make + 人 / 东西 + 动词原形**：让……、弄得……。Max 搬鼓时被电线绊了一下，灯就灭了。'),
    C('a', 'So you made the lights go out! 意思是——', [
      ['*原来是你把灯弄灭的！', '对：make … go out，弄得……灭了。'],
      ['原来是你做了一盏灯！', '这里的 make 是“使、让”。'],
    ], { keep: true }),
    C('b', '“这个笑话让大家都笑了。”', [
      ['*The joke made everyone laugh.', '对：make + 人 + 动词原形，不加 to。'],
      ['The joke made everyone to laugh.', 'make 后面的动词不加 to。'],
    ], { keep: true }),
    T('t2', '', '中文都说“做”，英语分 **make** 和 **do**：make 常常是做出、弄出一样东西或结果（make a cake, make a mistake, make a noise, make friends）；do 常常是做一件事、一项活儿（do homework, do the dishes, do sports, do your best）。'),
    So('c', '这些搭配，用 make 还是 do？', ['make', 'do'], [
      ['___ a mistake', 0, '犯错：弄出一个错误。'], ['___ a noise', 0, '弄出声音。'], ['___ friends', 0, '交朋友。'],
      ['___ homework', 1, '做作业：一件事。'], ['___ your best', 1, '尽力。'], ['___ the dishes', 1, '洗碗：一项家务。'],
    ]),
    T('t3', '', '还有一个最容易说错的：拍照，英语说 **take a photo**，不说 make a photo。'),
    C('d', '“Mia 在花园里给熊猫拍照。”', [
      ['*Mia is taking photos of the panda in the garden.', '对：拍照是 take photos。'],
      ['Mia is making photos of the panda in the garden.', '拍照不用 make。'],
    ], { keep: true }),
  ),
];
