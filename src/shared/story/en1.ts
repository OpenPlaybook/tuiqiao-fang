// 英文主线 The Case of the Golden Panda，Chapter 1：Gone!
// 语法就是线索：has taken（东西现在还不在）、was watching（那时正在做）……讲解用中文，配时间线、箭头动画。
import { C, Wr, item } from '../bank/h';
import type { Chapter, Item, KNode } from '../types';

const en = (k: string) => ({ k: 'en', p: { k } });
const ben = (place: string, mood = 'happy') => ({ k: 'ben', p: { place, mood } });

export const EN1: Chapter = {
  id: 'en1', line: 'en', no: 1, title: 'Chapter 1　Gone!', sub: '金熊猫不见了', scene: en('hall'), color: '#2563EB', next: 'en2',
  flow: [
    { t: '**Friday, 2:40 p.m.** The school hall is full. In twenty minutes, the English Festival will give out its top prize: the **Golden Panda**.', art: en('hall') },
    { t: 'Your story is one of the three finalists. Your hands are cold.' },
    { who: 'Ben', t: 'Relax! You’ll be fine. Want a mooncake?', art: ben('hall') },
    { t: '(Ben is an exchange student from London. He has been in Beijing for two weeks, and he has already eaten nine mooncakes.)' },
    { t: 'Suddenly the door opens. Ms. Green, the teacher in charge, runs in. Her face is white.' },
    { who: 'Ms. Green', t: 'Has anyone seen the Golden Panda? **Someone has taken it!**' },
    { task: ['en1-1a', 'en1-1b'] },
    { who: 'Ms. Green', t: 'It was right here on this table at two o’clock. Then the lights went out for a minute, at 2:15. When they came back on, the panda was gone!' },
    { who: 'Ben', t: 'We need to write down every clue. Hmm… I haven’t got a notebook.' },
    { task: ['en1-2'] },
    { t: 'You run to the front door. The guard, Mr. Liu, is sitting at his desk with his phone.', art: en('guard') },
    { task: ['en1-3'] },
    { t: 'Mr. Liu looks up from his phone and shakes his head.' },
    { task: ['en1-4'] },
    { who: 'Mr. Liu', t: 'But wait… at about 2:20, I saw a boy with a big drum case. He went toward the music room.' },
    { who: 'Ben', t: 'A drum case! That’s big enough for a panda!' },
    { t: 'Back in the hall, you look at the empty table again. There is a small yellow note stuck under it.', art: en('note') },
    { t: 'It says: **“Lent the panda. Back at 3. — M”**' },
    { who: 'Ben', t: '(whispering) M… Ms. Green’s first name is Margaret. Did *she* lend it to someone?' },
    { task: ['en1-5'] },
  ],
  end: [
    { t: 'Ms. Green is talking on the phone. She doesn’t look at you.' },
    { t: 'Who is M? Who is the boy with the drum case? You have twenty minutes.' },
    { t: '(End of Chapter 1. Next: Where were you?)' },
  ],
};

export const EN1_TASKS: Item[] = [
  item({
    id: 'en1-1a', st: 'en1', lv: 1, type: 'tense', topic: 'has taken', node: 'perfect', label: 'Someone has taken it（现在还不在）',
    intro: 'Ms. Green: “Someone **has taken** it!”',
    pic: ben('hall', 'worried'),
    hints: ['has taken 说的是过去发生的事，还是那件事留到现在的结果？'],
    explain: 'has taken：东西被拿走了，到现在还不在。现在完成时说的是“过去的事 + 现在的结果”。',
  }, C('a', 'What does Ms. Green mean?', [
    ['*奖杯被人拿走了，现在还不在这儿', '对。has taken＝拿走了，到现在还没回来。'],
    ['有人拿过奖杯，后来又放回去了', '要是已经放回来了，她就不会着急了，会说 Someone took it, but it’s back now.'],
    ['有人马上要来拿奖杯', '那是将来：Someone is going to take it.'],
    ['很多年以前有人拿走过一个奖杯', '那是一般过去时说的一件旧事，和现在无关。'],
  ], { cols: 1 })),
  item({
    id: 'en1-1b', st: 'en1', lv: 3, type: 'tense', topic: 'has taken', node: 'perfect', label: 'has taken / took',
    intro: 'Ms. Green: “Someone ___ the panda! We must find it before three!”',
    pic: ben('hall', 'worried'),
    hints: ['奖杯现在还在不在？她为什么要在三点前找到？'],
    explain: 'has taken：拿走了，到现在还不在——所以要赶在三点前找到。took 只说过去发生了一件事，不管现在。',
  }, C('a', 'Choose the best words.', [
    ['*has taken', '对。拿走了，现在还不在：所以要赶快找。'],
    ['took', 'took 只说“过去拿了”，没有“到现在还不在”的意思。和后半句“必须在三点前找到”连不紧。'],
    ['takes', '一般现在时说习惯：Someone takes it every day.'],
    ['will take', '那是还没发生。'],
  ])),
  item({
    id: 'en1-2', st: 'en1', lv: 1, type: 'word', topic: 'borrow', node: 'borrow', label: 'borrow / lend',
    intro: 'Ben turns to you: “Can I ___ your notebook? I’ll give it back after the case.”',
    pic: ben('hall'), npc: { good: 'Ben: “Thanks! Detective notebook — ready.” 📒', bad: 'Ben: “Er… I mean, can *I* use *yours*?” 😅' },
    hints: ['本子从谁那里，到谁那里？Ben 是“借进来”还是“借出去”？'],
    explain: 'borrow：借进来（从别人那里借）；lend：借出去（把东西借给别人）。中文都说“借”，英语要看东西往哪边走。',
  }, C('a', 'Choose the best word.', [
    ['*borrow', '对。本子从你那里到 Ben 这里：Ben borrows it.'],
    ['lend', 'lend 是借出去。要说 lend，得换个说法：Can you lend me your notebook?'],
    ['take', 'take 像是拿走，不一定还。'],
    ['keep', 'keep 是留着不还，和 I’ll give it back 矛盾。'],
  ])),
  item({
    id: 'en1-3', st: 'en1', lv: 1, type: 'polite', topic: 'could you', node: 'polite', label: '礼貌地请人帮忙',
    intro: 'You want Mr. Liu to tell you who came into the hall after two o’clock. What do you say first?',
    pic: en('guard'), npc: { good: 'Mr. Liu: “Of course. Let me think…” 🙂', bad: 'Mr. Liu: “…Why should I?” 😒' },
    hints: ['Mr. Liu 不欠你什么。怎么开口，他才愿意帮你？'],
    explain: '请别人帮忙：Excuse me（引起注意）+ Could you … , please?（客气的请求）。命令句、“I want …”在英语里听起来很生硬。',
  }, C('a', 'Which is the best way to ask?', [
    ['*Excuse me, Mr. Liu. Could you tell me who came in after two?', '对。先 Excuse me，再 Could you…?——客气、清楚。'],
    ['Tell me who came in after two.', '命令的口气，对长辈很不礼貌。'],
    ['I want to know who came in.', '直接说“我想要”，在英语里很生硬。'],
    ['Hey! Who came in after two?', '太随便了，像在喊人。'],
    ['You must tell me who came in.', 'must 是命令，对方会不高兴。'],
  ], { cols: 1 })),
  item({
    id: 'en1-4', st: 'en1', lv: 2, type: 'word', topic: 'look see watch', node: 'look', label: 'look / see / watch',
    intro: 'Mr. Liu: “Sorry, I didn’t notice anyone. At 2:15 I was ___ the football match on my phone. China was playing!”',
    pic: en('guard'),
    hints: ['看比赛：眼睛一直盯着一段时间。'],
    explain: 'watch：盯着看一段时间（比赛、电视、视频）；look：把眼睛转过去看（look at）；see：看见（东西进了眼睛）。',
  }, C('a', 'Choose the best word.', [
    ['*watching', '对。看比赛是盯着看一段时间：watch the match。'],
    ['looking', 'look 后面要加 at，而且说的是“转过去看”这个动作，不说看完一场比赛。'],
    ['seeing', 'see 是“看见”，一般不用进行时 was seeing 来说看比赛。'],
    ['reading', 'read 是读字，比赛不能读。'],
  ])),
  item({
    id: 'en1-5', st: 'en1', lv: 2, type: 'write', topic: 'note perfect', node: 'perfect', label: '写一句：侦探笔记',
    intro: 'Ben hands you the notebook. “You write the first clue. What has happened? One sentence.”',
    pic: ben('hall'),
    hints: ['奖杯被拿走了，现在还不在——用 has + 过去分词。'],
    explain: '侦探笔记的第一句：Someone has taken the Golden Panda. 现在完成时：过去的事，现在的结果。',
  }, Wr('w', 'Write the first clue in English (one sentence).', {
    lang: 'en', role: 'en',
    task: 'In a detective story, the school trophy “the Golden Panda” has been taken and is still missing. The student writes the first clue in a notebook: one English sentence saying what has happened. The present perfect (has taken / has gone / is missing) is the most natural choice.',
    criteria: ['says that the Golden Panda has been taken / is missing', 'uses a correct tense — the present perfect (has taken / has disappeared) or “is missing / is gone” are best; “was taken” is acceptable', 'one clear sentence, correct spelling'],
    examples: ['Someone has taken the Golden Panda.', 'The Golden Panda has disappeared from the hall.', 'The Golden Panda is missing.'],
    words: ['Someone', 'has taken', 'the Golden Panda'], frame: 'Someone has ______ the Golden Panda.', ph: 'Someone …',
  })),
];

export const EN1_PRACTICE: Item[] = [
  item({ id: 'p-pf-1', st: 'p', lv: 1, type: 'tense', topic: 'p-pf-1', node: 'perfect', label: 'has broken', intro: 'Look! Someone ___ the window. There’s glass everywhere.', hints: ['窗户现在是什么样？'], explain: 'has broken：打破了，现在还是破的。' },
    C('a', 'Choose the best words.', [['*has broken', '对。打破了，现在还是破的（地上全是玻璃）。'], ['breaks', '一般现在时说习惯。'], ['will break', '还没发生。'], ['is breaking', '正在打破——可玻璃已经碎了一地。']])),
  item({ id: 'p-pf-2', st: 'p', lv: 2, type: 'tense', topic: 'p-pf-2', node: 'perfect', label: 'I’ve lost my key', intro: 'Ben (at the door): “Oh no! I’ve lost my key.”', hints: ['have lost：过去的事 + 现在的结果。'], explain: '钥匙丢了，现在还没找到，所以他进不去门。' },
    C('a', 'What does Ben mean?', [['*钥匙现在还没找到，他进不去门', '对。'], ['他上周丢过钥匙，早就找到了', '那要说 I lost my key last week, but I found it.'], ['他很多年前丢过一把钥匙', '不对。'], ['他马上要把钥匙弄丢', '不对。']], { cols: 1 })),
  item({ id: 'p-pf-3', st: 'p', lv: 3, type: 'tense', topic: 'p-pf-3', node: 'perfect', label: 'lost / have lost', intro: 'Ben: “I ___ my key yesterday, but my host mum found it in the sofa.”', hints: ['钥匙现在找到了吗？句子里有 yesterday。'], explain: '钥匙已经找到了，而且说了 yesterday：就是过去的一件事，用一般过去时 lost。' },
    C('a', 'Choose the best words.', [['*lost', '对。钥匙已经找到了，只是在说昨天发生的事。'], ['have lost', 'have lost 是“丢了、现在还没有”，可钥匙已经找到了；而且 have lost 不和 yesterday 连用。'], ['lose', '时态不对。'], ['am losing', '不对。']])),
  item({ id: 'p-bl-1', st: 'p', lv: 2, type: 'word', topic: 'p-bl-1', node: 'borrow', label: 'lent', intro: 'My sister ___ me her bike yesterday, so I rode it to school.', hints: ['自行车从姐姐那里到“我”这里。主语是姐姐。'], explain: '主语是姐姐，她把车借出去：lent（lend 的过去式）。' },
    C('a', 'Choose the best word.', [['*lent', '对。姐姐借出：lend → lent。'], ['borrowed', '主语是姐姐，她是借出的一方，不是借进的一方。'], ['borrow', '主语和时态都不对。'], ['gave', 'gave 是送给，不用还；骑去学校、还会还的，用 lent。']])),
  item({ id: 'p-bl-2', st: 'p', lv: 3, type: 'word', topic: 'p-bl-2', node: 'borrow', label: 'Could you lend me…', intro: '你想借同桌的尺子。下面哪句是对的？', hints: ['lend 后面跟“人”，再跟“东西”。'], explain: 'Can I borrow your ruler? ＝ Could you lend me your ruler? 两个都对，方向相反。' },
    C('a', 'Which one is correct?', [['*Could you lend me your ruler?', '对。lend + 人 + 东西。'], ['Could you borrow me your ruler?', 'borrow 后面不跟“借给谁”。'], ['Could I lend your ruler?', '方向反了：要借进来，用 borrow。'], ['Could you lend your ruler from me?', '不对。']], { cols: 1 })),
  item({ id: 'p-po-1', st: 'p', lv: 2, type: 'polite', topic: 'p-po-1', node: 'polite', label: 'Would you mind…', intro: 'The hall is too hot. You want the teacher to open the window. Which is the most polite?', hints: ['越客气，句子往往越长、越委婉。'], explain: 'Would you mind opening the window? 是很客气的请求（mind 后面跟 -ing）。' },
    C('a', 'Choose the most polite one.', [['*Would you mind opening the window, please?', '对。很客气。'], ['Open the window.', '命令。'], ['Can you open the window?', '可以，但对老师不如前一句客气。'], ['Would you mind to open the window?', 'mind 后面要用 opening。']], { cols: 1 })),
  item({ id: 'p-lw-1', st: 'p', lv: 2, type: 'word', topic: 'p-lw-1', node: 'look', label: 'saw / see', intro: 'I ___ a strange man near the hall, but I didn’t ___ his face clearly.', hints: ['“看见”一个人，没“看清”他的脸。'], explain: 'see＝看见（东西进了眼睛）：saw a man，didn’t see his face clearly。' },
    C('a', 'Choose the best words.', [['*saw; see', '对。看见了人，没看清脸。'], ['watched; look', 'watch 是盯着看一段时间；didn’t look his face 少了 at。'], ['looked; watch', 'looked 后面要加 at。'], ['saw; watch', '“看清脸”用 see。']], { cols: 1 })),
];

export const EN1_NODES: KNode[] = [
  {
    id: 'perfect', name: '现在完成时：过去的事，现在的结果', line: 'en',
    teach: { viz: { k: 'timeline', p: { mode: 'perfect' } }, lines: ['has taken＝过去某个时候被拿走 → 一直到现在，它还不在。', '重点不在“什么时候拿的”，而在“现在怎么样了”。'], ex: ['Someone has taken it. → 现在还不在。', 'Someone took it at 2:15. → 只说 2:15 发生了一件事。'] },
    chips: [
      { q: 'has taken 和 took 到底差在哪？', a: 'took：说过去发生了一件事（常带时间：at 2:15、yesterday）。has taken：说这件事留到现在的结果（东西现在还不在），一般不带具体的过去时间。', viz: { k: 'timeline', p: { mode: 'past' } } },
      { q: '怎么变出来？', a: 'have / has ＋ 过去分词：take → taken，break → broken，lose → lost，go → gone，eat → eaten。' },
      { q: '哪些时候常用它？', a: '东西丢了、坏了、做完了，说的是“现在的样子”：I’ve lost my key. I’ve finished my homework. She has gone out.' },
    ],
    web: { title: '现在完成时的一家人', groups: [
      { name: '现在的结果', items: [{ t: 'I’ve lost my key.', d: '钥匙丢了，现在进不去门' }, { t: 'Someone has broken the window.', d: '窗户现在是破的' }, { t: 'I’ve finished my homework.', d: '作业做完了，现在可以玩' }] },
      { name: '人在哪', items: [{ t: 'He has gone to the library.', d: '去了，现在人在那儿' }, { t: 'He has been to the library.', d: '去过，已经回来了（第 2 章的线索！）' }] },
      { name: '经历', items: [{ t: 'Have you ever eaten jiaozi?', d: '你吃过饺子吗？' }] },
    ] },
    practice: ['p-pf-1', 'p-pf-2', 'p-pf-3', 'en14'],
    ai: { target: 'present perfect (have/has + past participle) vs past simple', brief: '编两个初中生身边的小情境，一个用现在完成时（强调现在的结果），一个用一般过去时（说过去某时发生的事），用中文说明为什么。例句用英文。' },
  },
  {
    id: 'borrow', name: 'borrow / lend：东西往哪边走', line: 'en',
    teach: { viz: { k: 'give', p: { mode: 'both' } }, lines: ['中文都说“借”，英语要看东西往哪边走。', 'borrow：借进来（到我这儿）；lend：借出去（从我这儿走）。'], ex: ['Can I borrow your notebook?', 'Can you lend me your notebook?'] },
    chips: [
      { q: 'lend 后面怎么接？', a: 'lend ＋ 人 ＋ 东西：Can you lend me your pen? 也可以说 lend something to somebody。' },
      { q: '过去式是什么？', a: 'borrow → borrowed；lend → lent（不规则）。' },
      { q: '还回去怎么说？', a: 'give it back / return it：I’ll give it back after class.' },
    ],
    web: { title: '东西往哪边走', groups: [
      { name: '借', items: [{ t: 'borrow', d: '借进来' }, { t: 'lend', d: '借出去' }] },
      { name: '拿、带', items: [{ t: 'bring', d: '带过来（到说话人这边）' }, { t: 'take', d: '带走（到别处去）' }] },
      { name: '买卖', items: [{ t: 'buy', d: '买进' }, { t: 'sell', d: '卖出' }] },
    ] },
    practice: ['p-bl-1', 'p-bl-2', 'en01'],
    // 不接 AI 举例：测了 3 次，有 1 次把 lend 的方向说反了（见 AI设计与测试.md）
  },
  {
    id: 'polite', name: '礼貌地请人帮忙', line: 'en',
    teach: { viz: { k: 'meter', p: { items: [['Tell me …', 0.05], ['I want …', 0.2], ['Can you … ?', 0.5], ['Could you … , please?', 0.78], ['Would you mind …ing?', 0.95]] } }, lines: ['请别人帮忙，句子越委婉越客气：Could 比 Can 客气，加 please 更客气。', '开口先说 Excuse me，让对方注意到你。'] },
    chips: [
      { q: 'Excuse me 和 Sorry 有什么不同？', a: 'Excuse me：打扰一下（开口请人帮忙、借过）。Sorry：对不起（做错了事、或者没听清 Sorry?）。' },
      { q: '为什么 I want … 不礼貌？', a: '中文“我想要……”很自然，英语里 I want 听起来像在提要求。换成 I’d like … 或 Could I have … ? 就好了。' },
      { q: 'Would you mind 后面怎么接？', a: 'mind 后面接 -ing：Would you mind opening the window?' },
    ],
    practice: ['p-po-1', 'en04'],
    ai: { target: 'polite requests: Could you…? / Would you mind…? / Could I…?', brief: '编初中生对老师、店员、陌生人说的请求，各给一个不礼貌的说法和一个礼貌的说法，用中文说明差在哪。' },
  },
  {
    id: 'look', name: 'look / see / watch：英语里的“看”', line: 'en',
    teach: { viz: { k: 'lsw', p: {} }, lines: ['look：把眼睛转过去看（look at the clock）；see：看见（东西进了眼睛）；watch：盯着看一段时间（看比赛、电视）。', '中文都是“看”。还记得中文那条故事里“看”的一家人吗？英语也分得很细。'] },
    chips: [
      { q: '“看电视”为什么用 watch？', a: '电视、比赛、视频在动，要盯着看一段时间：watch TV, watch a match。' },
      { q: 'look 后面为什么要加 at？', a: 'look 只是“把眼睛转过去”，要说看什么，就加 at：look at the board。' },
      { q: '中文的瞥、盯、凝视英语怎么说？', a: '瞥：glance at；盯着看：stare at；凝视：gaze at。' },
    ],
    practice: ['p-lw-1', 'en02'],
    ai: { target: 'look at / see / watch', brief: '编三个初中生身边的小情境，分别用 look at、see、watch，用中文说明为什么。', words: ['look', 'see', 'watch', 'saw', 'watched', 'looked'] },
  },
];
