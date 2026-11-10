// 英文故事二 The Time Capsule · Chapter 3 What Happened in 1996（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）。规划见 第六堂课/英文故事二_时间胶囊.md
// 周老师讲 1996 年的那个夏天：吵架（argue）→ 八音盒被碰掉（by accident / on purpose）→ 难过得说不出话（so … that）→ 直到 6 月 27 日才找到钥匙（not … until）
// → 七月去道歉，Yu 家已经搬走了（第一次讲过去完成时：by the time … had done）。回到现在：后悔了一辈子（现在完成时）、问我知不知道（if = 是否）、
// 盒底衬布下面藏着第二封信（被动 was hidden）——Yu 也写了道歉信，两个人谁也不知道。
// 故事用英文讲、英文配音；1996 年的回忆由周老师讲（周老师的声音），画面是旧照片色调。AI 眼镜的话、题目的引导、拓展的讲解用中文。
import { C, M, Mt, Od, S, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, FragSub, Item, Play, TeachSub, TypeSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string, string[]?][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why, alt]) => ({ t, a, why, ...(alt ? { alt } : {}) })) });
const type = (key: string, q: string, accept: string[], why: string, near: Record<string, string> = {}, ph = ''): TypeSub => ({ kind: 'type', key, q, accept, near, why, ph });
const T = (key: string, q: string, t: string, ex?: string[], art?: Art): TeachSub => ({ kind: 'teach', key, q, t, ...(ex ? { ex } : {}), ...(art ? { art } : {}) });
const frag = (q: string, rows: [string, 1 | 2 | 3, string?, { seq?: number; after?: string }?][], events: Record<string, string>, need: FragSub['need'], model: string): FragSub => ({
  kind: 'frag', key: 'a', q, events, need, model,
  frags: rows.map(([t, layer, x, o]) => t.startsWith('*') ? { t: t.slice(1), layer, ok: true, ...(x ? { ev: x } : {}), ...(o ?? {}) } : { t, layer, ok: false, why: x }),
});
const viz = (k: string, p: Record<string, unknown> = {}) => ({ k, p });

export const PLAY_EC3: Play = {
  id: 'ec3', lang: 'en', no: 3, title: 'Chapter 3　What Happened in 1996', sub: '1996 年的那个夏天', color: '#8A5A2E', next: 'ec4',
  endAsk: ['By the time she got there, they had already moved. 为什么用 had moved？', 'so … that 和 too … to 怎么换着说？', '“直到……才……”英语为什么要用否定句？'],
  gloss: {
    reminds: { d: 'v. 使想起、提醒（remind 的三单形式）。remind sb of sth：让某人想起……', py: '/rɪˈmaɪndz/', more: { t: 'remind sb to do：提醒某人去做……——Please remind me to call Mrs Hu.（请提醒我给胡老师打电话。）', q: '“Remind me to buy some tea.” 是——', opts: [['提醒我买点茶', true], ['我记得买过茶了', false]] } },
    shake: { d: 'v. 发抖、摇动（shake – shook – shaken）', py: '/ʃeɪk/', more: { t: 'shake 还能说“握手”“摇头”：shake hands（握手）、shake your head（摇头）。', q: '“He shook his head.” 是——', opts: [['他摇了摇头', true], ['他握了握手', false]] } },
    'haven’t heard': { d: '一直没听到（到现在为止）：haven’t + 过去分词，说从那时一直到现在都没有发生的事。' },
    'for a long time': { d: '很长时间（for + 一段时间）' },
    together: { d: 'adv. 在一起。two names together：两个名字放在一起说——她们以前总是形影不离。', py: '/təˈɡeðə/' },
    'Let me tell you what happened': { d: '让我告诉你们发生了什么。“What happened?” 放进句子里，what 本身就是主语，语序不变：tell you what happened。' },
    'graduation show': { d: '毕业演出（graduation：毕业）', py: '/ˌɡrædʒuˈeɪʃn/', more: { t: '动词是 graduate：毕业。graduate from … ：从……毕业——She graduated from this school in 1996.', q: '“He graduated from a school in Beijing.” 是——', opts: [['他毕业于北京的一所学校', true], ['他在北京的一所学校当老师', false]] } },
    'was preparing for': { d: '那时正在为……做准备（was + doing：那段时间一直在做的事）' },
    argued: { d: 'v. 争吵、争论（argue 的过去式）。argue with 某人 about 某事', py: '/ˈɑːɡjuːd/' },
    'used to': { d: '以前常常（现在不这样了）：used to + 动词原形' },
    'who would sing first': { d: '谁先唱。would：从过去那时候看“将要”（will 的过去式）——故事是在过去讲的。' },
    pile: { d: 'n. 一摞、一堆', py: '/paɪl/', s: { 'a pile of books': '一摞书（抱在怀里，挡住了视线）' }, more: { t: 'pile 也能当动词：pile up（堆起来）——The letters piled up on his desk.', q: '“a pile of homework” 是——', opts: [['一大堆作业', true], ['一页作业', false]] } },
    knocked: { d: 'v. 碰、撞（knock 的过去式）。knock … off：把……从上面碰下去', py: '/nɒkt/', more: { t: 'knock 最常见的意思是“敲”：knock on the door（敲门）。', q: '“Someone is knocking on the door.” 是——', opts: [['有人在敲门', true], ['有人把门撞倒了', false]] } },
    'flew out': { d: '飞了出去（fly – flew – flown）' },
    rolled: { d: 'v. 滚（roll 的过去式）。rolled away：滚走了', py: '/rəʊld/' },
    'on purpose': { d: '故意地（反义：by accident 不小心、意外地）', py: '/ˈpɜːpəs/' },
    'so hurt that': { d: 'so + 形容词 + that + 一句话：……得（以至于）……。hurt 在这里是形容词：心里受了伤、很难过。' },
    'couldn’t say a word': { d: '一个字也说不出来' },
    'stopped talking': { d: '不再说话（stop doing：停下正在做的事）', more: { t: 'stop to do 是“停下来，去做另一件事”：She stopped to talk to me.（她停下脚步，跟我说话。）', q: '“He stopped smoking.” 是——', opts: [['他戒烟了（不再抽了）', true], ['他停下来去抽烟', false]] } },
    'looked everywhere for': { d: '到处找（look for：找）' },
    'didn’t find it until June 27': { d: '直到 6 月 27 日才找到：not … until，直到……才……' },
    cupboard: { d: 'n. 柜子、橱柜（p 不发音）', py: '/ˈkʌbəd/' },
    dare: { d: 'v. 敢。didn’t dare to do：不敢做……', py: '/deə/', more: { t: '生气时说 How dare you!——你竟敢……！（你怎么敢……！）', q: '“I didn’t dare to look at her.” 是——', opts: [['我不敢看她', true], ['我没时间看她', false]] } },
    'give it back': { d: '还回去（把东西还给原来的人）' },
    'time capsule': { d: '时间胶囊：把信和物件封进盒子埋起来，约好多年以后再打开', py: '/ˈkæpsjuːl/' },
    finally: { d: 'adv. 终于（等了很久、犹豫了很久以后）', py: '/ˈfaɪnəli/' },
    'to say sorry': { d: '去道歉（to do：为了做某事）' },
    'by the time': { d: '等到……的时候（常常是说：已经晚了）' },
    'had already moved': { d: '已经搬走了：had + 过去分词（过去完成时），说比另一件过去的事更早发生的事。' },
    'never said sorry': { d: '始终没能道歉（never：从来没有）' },
    regretted: { d: 'v. 后悔（regret 的过去分词）。has regretted：一直后悔到现在', py: '/rɪˈɡretɪd/' },
    'all her life': { d: '一辈子、她这一生' },
    'Spring Festival': { d: '春节' },
    'asked me if I knew where Yu was': { d: '问我知不知道 Yu 在哪儿：if = 是否；where Yu was 是陈述的语序。' },
    'lost touch': { d: '失去联系（lose touch with 某人）', more: { t: '反过来，“保持联系”是 keep in touch / stay in touch：Let’s keep in touch!', q: '毕业时同学说“Keep in touch!”，意思是——', opts: [['常联系啊！', true], ['别碰我！', false]] } },
    'long ago': { d: '很久以前' },
    lining: { d: 'n. （盒子、衣服里的）衬里、衬布', py: '/ˈlaɪnɪŋ/', s: { 'the cloth lining at the bottom': '盒底铺的那层旧衬布' } },
    envelope: { d: 'n. 信封', py: '/ˈenvələʊp/' },
    'was hidden': { d: '被藏着（hide – hid – hidden；被动：be + 过去分词）' },
    whoever: { d: 'pron. 不管是谁、无论谁。To whoever finds this：致发现这封信的人（不管你是谁）', py: '/huːˈevə/' },
    accident: { d: 'n. 意外（不是有意的事）；也指车祸那样的事故', py: '/ˈæksɪdənt/' },
    terrible: { d: 'adj. 糟糕的、很坏的。terrible things：（说的）很难听、很伤人的话', py: '/ˈterəbl/' },
    'doesn’t play anymore': { d: '再也不响了：play 在这里是“（音乐）响起、演奏”；not … anymore：不再' },
    forever: { d: 'adv. 永远', py: '/fərˈevə/' },
    'make up': { d: '和好（吵架以后重新做朋友）。make up with 某人' },
    'taking off his glasses': { d: '摘下眼镜（take off：脱下、摘下）' },
    'on the same day': { d: '在同一天' },
    neither: { d: 'pron. （两个里）哪一个都不。neither of them knew：她们俩谁也不知道', py: '/ˈnaɪðə/', more: { t: '两个都是，用 both；两个都不是，用 neither：Both of them said sorry, but neither of them knew.', q: '“Neither of the boys came.” 是——', opts: [['两个男孩都没来', true], ['两个男孩来了一个', false]] } },
    'the other': { d: '（两个里的）另一个' },
    'didn’t know until today': { d: '直到今天才知道（not … until）' },
    'have to': { d: '不得不、必须（have to + 动词原形）' },
    'Both of them': { d: '她们两个都（both：两个都）' },
  },
  lines: [
    { shots: [['tc.title']], t: 'Chapter 3: What Happened in 1996', tr: '第三章：1996 年的那个夏天', voice: 'en' },
    { shots: [['tc3.show']], id: 'visit', t: '**Thursday afternoon.** You and Tao visit Mr Zhou. You show him the old photo and the pink letter.', tr: '星期四下午。你和 Tao 去{看望}周老师，把那张老照片和粉色信封里的信{拿给他看}。', trHard: 'frame', voice: 'en', ask: '周老师为什么会记得三十年前的学生？' },
    { side: ['c3-x-remind'], shots: [['tc3.photo']], id: 'remind', t: 'The photo ⟦reminds⟧ him of a summer long ago. His hands ⟦shake⟧ a little.', tr: '照片让他{想起}了很久以前的一个夏天。他的手{微微发抖}。', trHard: 'words', voice: 'en' },
    { shots: [['tc3.zhouCU']], id: 'names', who: 'Mr Zhou', voice: 'zhou', t: '“F”… That’s Fang. And Yu… I haven’t heard those two names ⟦together⟧ for a long time.', read: 'F… That’s Fang. And Yu… I haven’t heard those two names together for a long time.', tr: '“F”……那是 Fang。还有 Yu……{好久没听到}有人把这两个名字{放在一起}说了。', trHard: 'frame', ask: 'haven’t heard … for a long time 为什么用现在完成时？' },
    { shots: [['tc3.fbClass']], id: 'show', who: 'Mr Zhou', voice: 'zhou', t: 'Let me tell you what happened. It was June 1996, and the class was preparing for the ⟦graduation show⟧.', tr: '我来{告诉你们发生了什么}。那是 1996 年 6 月，全班{正在准备}{毕业演出}。', trHard: 'words' },
    { shots: [['tc3.fbArgue']], id: 'argue', who: 'Mr Zhou', voice: 'zhou', t: 'Fang and Yu ⟦used to⟧ walk home together every day. But one day, they ⟦argued⟧ about who would sing first.', tr: 'Fang 和 Yu {以前}每天都一起走回家。可是有一天，她们为了{谁先唱}{!吵了一架}。', trHard: 'words', task: ['c3-argue'], ask: 'argue 和 discuss 有什么不一样？' },
    { shots: [['tc3.fbCarry']], id: 'knock', who: 'Mr Zhou', voice: 'zhou', t: 'The next day, Fang was carrying a ⟦pile⟧ of books. Her arm ⟦knocked⟧ the music box off Yu’s desk.', tr: '第二天，Fang {抱着}{一摞}书，胳膊{把}八音盒从 Yu 的桌上{碰了下去}。', trHard: 'words' },
    { shots: [['tc3.fbFall']], id: 'fall', who: 'Mr Zhou', voice: 'zhou', t: 'It hit the floor. The little key ⟦flew out⟧ and ⟦rolled⟧ away. The music stopped.', tr: '它{摔在}地上。上弦的小钥匙{飞了出去}，{滚}得不见了。音乐{停了}。', trHard: 'words' },
    { shots: [['tc3.fbYu']], id: 'purpose', who: 'Chen Yu (1996)', voice: 'yu', t: 'You did it ⟦on purpose⟧!', tr: '你{!是故意的}！', trHard: 'words', task: ['c3-purpose'], ask: 'on purpose 和 by accident 怎么分？' },
    { shots: [['tc3.fbHurt']], id: 'so', who: 'Mr Zhou', voice: 'zhou', t: 'Fang was ⟦so hurt that⟧ she ⟦couldn’t say a word⟧. After that, the two friends ⟦stopped talking⟧.', tr: 'Fang {!难过得一句话也说不出来}。从那以后，两个好朋友{不再说话了}。', trHard: 'frame', task: ['c3-so'], ask: 'so … that 和 too … to 有什么不一样？' },
    { shots: [['tc3.fbSearch']], id: 'until', who: 'Mr Zhou', voice: 'zhou', t: 'Fang ⟦looked everywhere for⟧ the key. She ⟦didn’t find it until June 27⟧ — under a ⟦cupboard⟧.', tr: 'Fang {到处找}那把钥匙。{!直到 6 月 27 日，她才找到}——在一个{柜子}底下。', trHard: 'frame', task: ['c3-until'], ask: '“直到……才”英语怎么说？' },
    { shots: [['tc3.fbWrap'], ['tc3.fbBury']], id: 'dare', who: 'Mr Zhou', voice: 'zhou', t: 'But she didn’t ⟦dare⟧ to ⟦give it back⟧. The next day, we buried the ⟦time capsule⟧.', tr: '可她{不敢}把钥匙{还回去}。第二天，我们把{时间胶囊}埋了。', trHard: 'words' },
    { shots: [['tc3.fbWalk']], id: 'july', who: 'Mr Zhou', voice: 'zhou', t: 'In July, Fang ⟦finally⟧ went to Yu’s home ⟦to say sorry⟧.', tr: '七月，Fang {终于}去了 Yu 家，{想道个歉}。', trHard: 'words' },
    { shots: [['tc3.fbEmpty']], id: 'had', who: 'Mr Zhou', voice: 'zhou', t: 'But ⟦by the time⟧ she got there, Yu’s family ⟦had already moved⟧ to Shanghai.', tr: '可是{等她赶到的时候}，Yu 一家{!已经搬去上海了}。', trHard: 'frame', task: ['c3-had'], ask: 'had moved 和 moved 有什么不一样？' },
    { shots: [['tc3.taoAsk']], id: 'never', who: 'Tao', voice: 'tao', t: 'So she ⟦never said sorry⟧?', tr: '那她{始终没能}说出那句对不起？', trHard: 'frame' },
    { shots: [['tc3.zhouTea']], id: 'regret', who: 'Mr Zhou', voice: 'zhou', t: 'Never. She has ⟦regretted⟧ it ⟦all her life⟧.', tr: '没有。这件事，她{!后悔了一辈子}。', trHard: 'words', task: ['c3-regret'], ask: 'regret 后面能跟什么？' },
    { shots: [['tc3.spring']], id: 'ask', who: 'Mr Zhou', voice: 'zhou', t: 'Every ⟦Spring Festival⟧, she visits me. Last year, she ⟦asked me if I knew where Yu was⟧.', tr: '每年{春节}，她都来看我。去年，她{!问我知不知道 Yu 在哪儿}。', trHard: 'frame', task: ['c3-if'], ask: 'if 什么时候是“如果”，什么时候是“是否”？' },
    { shots: [['tc3.map']], id: 'touch', who: 'Mr Zhou', voice: 'zhou', t: 'But I didn’t. We ⟦lost touch⟧ with Yu ⟦long ago⟧.', tr: '可我也不知道。我们{早就}和 Yu {断了联系}。', trHard: 'words', ask: 'keep in touch 是什么意思？' },
    { shots: [['tc3.lining']], id: 'hidden', t: 'When Tao puts the photo back, the cloth ⟦lining⟧ at the bottom moves. A thin blue ⟦envelope⟧ ⟦was hidden⟧ under it.', tr: 'Tao 把照片放回盒子，盒底的{衬布}动了一下。下面{!藏着}一个薄薄的蓝{信封}。', trHard: 'words', voice: 'en', task: ['c3-hidden'] },
    { shots: [['tc3.blueBack']], id: 'name', who: 'Tao', voice: 'tao', t: 'There’s a name on the back… Chen Yu! She wrote a letter, too!', tr: '背面{有个名字}……Chen Yu！{她也写了一封信}！', trHard: 'frame' },
    { shots: [['tc3.yuWrite']], id: 'l1', who: 'Yu’s letter', voice: 'yu', t: 'To ⟦whoever⟧ finds this: please tell Lin Fang I’m sorry.', tr: '{致发现这封信的人}：请告诉 Lin Fang，{我很抱歉}。', trHard: 'words' },
    { shots: [['tc3.letter']], id: 'l2', who: 'Yu’s letter', voice: 'yu', t: 'I know it was an ⟦accident⟧. I said ⟦terrible⟧ things because I was angry.', tr: '我知道那是个{意外}。我{说了很难听的话}，因为我当时在气头上。', trHard: 'words' },
    { shots: [['tc3.yuBox']], id: 'l3', who: 'Yu’s letter', voice: 'yu', t: 'The box ⟦doesn’t play anymore⟧, but I will keep it ⟦forever⟧. Maybe one day we will ⟦make up⟧.', tr: '八音盒{再也不响了}，可我会{永远}留着它。也许有一天，我们会{和好}。', trHard: 'words' },
    { shots: [['tc3.glasses']], id: 'mis', prompt: true, who: 'AI 眼镜', voice: 'ai', hide: true, t: 'AI 眼镜把这封信翻成了中文。信越要紧，越要多留个心眼——它照样可能看走眼。对着原文，找出译错的地方。', task: ['c3-makeup'], ask: 'make up 有哪几种意思？' },
    { shots: [['tc3.twoLetters']], id: 'both', who: 'Mr Zhou', voice: 'zhou', t: '(⟦taking off his glasses⟧) They both said sorry — ⟦on the same day⟧, in the same box. And ⟦neither⟧ of them knew.', read: 'They both said sorry — on the same day, in the same box. And neither of them knew.', tr: '（{摘下眼镜}）她们俩都说了对不起——{在同一天}，放进{同一个盒子}。可{谁也不知道}对方也写了。', trHard: 'frame', ask: 'both 和 neither 怎么用？' },
    { shots: [['tc3.apart']], id: 'years', who: 'Mr Zhou', voice: 'zhou', t: 'For thirty years, each of them thought ⟦the other⟧ was still angry. Even I ⟦didn’t know until today⟧.', tr: '三十年来，{两个人都以为}对方还在生自己的气。连我也{直到今天才知道}。', trHard: 'frame' },
    { side: ['c3-x-spot'], shots: [['tc3.taoUp']], id: 'tell', who: 'Tao', voice: 'tao', t: 'Then we ⟦have to⟧ tell them. ⟦Both of them⟧!', tr: '那我们{一定得}告诉她们。{两个人都要告诉}！', trHard: 'frame' },
    { shots: [['tc3.timeline']], id: 'order', prompt: true, who: 'AI 眼镜', voice: 'ai', t: '周老师讲的时候，有的事是倒回去说的。把 1996 年那个夏天发生的事，按真实的先后排一排。', task: ['c3-order'], ask: '为什么讲故事的顺序和发生的顺序会不一样？' },
    { shots: [['tc3.write']], id: 'write', prompt: true, who: 'AI 眼镜', voice: 'ai', t: '轮到你了：用 By the time …, … had … 写一句话——可以写故事里的事，也可以写你自己“晚了一步”的一次经历。', read: '轮到你了：用 by the time 和 had，写一句话。可以写故事里的事，也可以写你自己晚了一步的一次经历。', task: ['c3-write'], ask: '过去完成时还能用在哪些句子里？' },
    { shots: [['tc3.end']], id: 'end', who: 'AI 眼镜', voice: 'ai', t: '第三章到这里。两封道歉信，在同一个盒子里躺了三十年。下一章——三十年后，她们还能见面吗？', read: '第三章到这里。两封道歉信，在同一个盒子里躺了三十年。下一章，三十年后，她们还能见面吗？', ask: '如果你是 Tao，你会先告诉谁？' },
  ],
};

// ---------------- 拓展：讲一小段、问一句，一步一步往下走 ----------------
const EXT_ARGUE: Ext[] = [
  { id: 'x1', title: '吵架、商量、争论', need: 'always', steps: [
    T('t1', '', '**argue**：两个人意见不合，越说越激动——争吵、争论。后面跟的小词要记住：argue **with** 某人，argue **about** 某事。', ['They argued about who would sing first.（为谁先唱吵了起来）', 'Fang argued with Yu.（Fang 和 Yu 吵架）']),
    C('a', '“我和同桌为一道数学题争了起来。”哪一句对？', [
      ['*I argued **with** my deskmate **about** a maths problem.', '对：和谁吵用 with，为什么事吵用 about。'],
      ['I argued **about** my deskmate **with** a maths problem.', '两个小词放反了：成了“为了同桌、跟一道数学题吵架”。'],
      ['I argued my deskmate about a maths problem.', 'argue 后面不能直接跟人，要加 with。'],
    ], { keep: true }),
    T('t2', '', '**discuss**：讨论、商量——大家心平气和地交换想法。注意 discuss 后面直接跟事情，不加 about：discuss the plan（不说 discuss about the plan）。', ['The class discussed the songs for the graduation show.（全班商量毕业演出唱什么）']),
    C('b', '班长说：“Let’s ___ the songs for the show. Everyone can give an idea.” 填哪个？', [
      ['*discuss', '对：Everyone can give an idea——大家一起出主意，是商量。'],
      ['argue about', '大家一起出主意，并没有吵起来；argue about 是为某事争吵。'],
      ['discuss about', 'discuss 后面直接跟事情，不加 about。'],
    ], { keep: true }),
    T('t3', '', 'argue 的名词是 **argument**（一次争吵）：have an argument with 某人（和某人吵了一架）。**quarrel** 也是吵架，口气更冲，可以当名词（a quarrel），也可以当动词。'),
    fill('c', '放进句子，有的词用不上。', ['argued', 'discussed', 'argument', 'quarrel', 'argue'], [
      ['We ___ the problem in groups and found three ways to solve it.', 'discussed', '线索：in groups，又 found three ways——大家一起想办法，是讨论：discussed。argued 是吵起来，吵架很难吵出三种解法。'],
      ['My little brothers ___ about the TV last night. Now they aren’t talking to each other.', 'argued', '线索：Now they aren’t talking——吵完了谁也不理谁，是吵架；有 last night，要用过去式 argued。argue 是原形，不能和 last night 放在一起。'],
      ['I had an ___ with my best friend, but we said sorry the next day.', 'argument', '线索：had an ___——前面是 an，后面要一个以元音开头的名词：argument。quarrel 也是名词，可它前面要用 a（a quarrel）。'],
    ]),
  ] },
  { id: 'x2', title: '以前常常：used to', need: 'opt', steps: [
    T('t1', '', '回扣一下 **used to + 动词原形**：以前常常这样，现在不这样了。Fang and Yu used to walk home together every day.——可 Fang 的信里写的是：Now she won’t talk to me, and I walk home alone.'),
    C('a', '“I used to play the piano.” 这句话说明——', [
      ['*以前常弹，现在不弹了', '对：used to 说的是过去的习惯，现在已经变了。'],
      ['现在还每天都弹', '每天都弹，用一般现在时：I play the piano every day.'],
      ['以前只弹过一次', '只弹过一次，说 I played the piano once.；used to 是“常常”。'],
    ], { keep: true }),
  ] },
];

const EXT_PURPOSE: Ext[] = [
  { id: 'x1', title: '故意的，还是不小心', need: 'always', steps: [
    T('t0', '', '先看两段：同样是把桌上的东西弄到了地上——一个不小心，一个故意。', undefined, viz('clip', { shots: [['tc3.accidentDemo', 1], ['tc3.purposeDemo', 1]], dur: 11, cap: [[0, 'Her arm hit the music box. She didn’t mean to. → **by accident**'], [0.5, 'He looked around, then pushed the pencil case off. → **on purpose**']], marks: [[0.05, 'by accident'], [0.55, 'on purpose']] })),
    C('a', '道歉的时候，要说“我不是故意的”，英语是——', [
      ['*I didn’t do it **on purpose**.', '对：didn’t … on purpose，不是故意的——道歉时最常说的一句。'],
      ['I didn’t do it **by accident**.', '这成了“我不是不小心弄的”——等于承认是故意的。'],
      ['I did it **by accident on purpose**.', '两个短语意思正好相反，不能放在一起。'],
    ], { keep: true }),
    T('t1', '', '**by accident** 还有一个意思：碰巧、偶然——不一定是坏事。I met my old teacher by accident at the station.（在车站偶然遇见了老师）还有一个近义的 **by mistake**：弄错了——把 A 当成了 B。', ['I took your umbrella by mistake.（我拿错了伞）']),
    fill('b', '放进句子，有的用不上。', ['on purpose', 'by accident', 'by mistake', 'in purpose'], [
      ['Sorry! I didn’t step on your foot ___. The bus stopped so suddenly!', 'on purpose', '线索：先说 Sorry，又解释车停得太急——是在说“我不是故意的”：didn’t … on purpose。in purpose 不是英语的说法，介词只能用 on。'],
      ['I met my primary school teacher ___ in a bookshop last Sunday.', 'by accident', '线索：在书店里遇见——没约好，碰巧：by accident。by mistake 是“弄错了”，可遇见老师并没有弄错什么。'],
      ['Tao took my pen ___. His pen looks just like mine.', 'by mistake', '线索：His pen looks just like mine——两支笔一模一样，他拿错了：by mistake。by accident 也说得通（他不是有意的），只是 by mistake 更准确：说的是“认错了、弄混了”。', ['by accident']],
    ]),
    Wr('c', '写一句道歉：你不小心弄坏、弄脏或弄丢了别人的东西。用上 by accident 或 didn’t … on purpose。', {
      lang: 'en', role: 'en',
      task: 'The student writes a short apology (one or two English sentences) for breaking, dirtying or losing something that belongs to someone else by accident, using “by accident” or “didn’t … on purpose” correctly.',
      criteria: ['says sorry and says what happened (broke / dropped / lost … )', 'uses “by accident” or “didn’t … on purpose” correctly (not mixed up, not “in purpose”)', 'correct past tense and spelling'],
      examples: ['I’m sorry I broke your ruler. I didn’t do it on purpose.', 'Sorry, I dropped your book in the rain by accident.', 'I’m so sorry — I knocked your cup off the desk by accident.'],
      words: ['I’m sorry', 'by accident', 'I didn’t do it on purpose'], frame: 'I’m sorry I ______. I didn’t do it on purpose.', ph: 'I’m sorry …',
    }),
  ] },
];

const EXT_SO: Ext[] = [
  { id: 'x1', title: 'so … that：……得……', need: 'always', steps: [
    T('t1', '', '**so + 形容词 + that + 一句话**：因为太……，结果……。前半句说“有多……”，后半句说“结果怎样”。', ['Fang was so hurt that she couldn’t say a word.（难过 → 说不出话）', 'The box was so old that the lid wouldn’t open.（太旧 → 盖子打不开）']),
    C('a', '“The music was so beautiful that ___.” 后半句接哪个最合适？', [
      ['*everyone in the classroom stopped talking', '对：音乐太美（有多美）→ 教室里的人都不说话了（结果）。'],
      ['it was a music box', '这不是结果，只是又说了一遍它是什么。'],
      ['Yu was angry', '音乐美和 Yu 生气，扯不上因果。'],
    ], { keep: true }),
    T('t2', '', '“太……而不能……”也可以用 **too … to**：Fang was too hurt to say a word. 两句意思一样，区别在后面：too … to 后面只跟动词原形，它本身就带着“不能”；so … that 后面是一整句话，“不能”要自己写出来（couldn’t）。', ['Fang was **so** hurt **that** she **couldn’t** say a word.', 'Fang was **too** hurt **to** say a word.']),
    C('b', '哪一句是错的？', [
      ['*Fang was **too** hurt **that** she couldn’t say a word.', '对，这句错了：too 不和 that 搭配。要么 so … that，要么 too … to。'],
      ['Fang was **too** hurt **to** say a word.', '这句对：too … to，太难过了，说不出话。'],
      ['Fang was **so** hurt **that** she couldn’t say a word.', '这句对，就是故事里的原句。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['so', 'too', 'that', 'to', 'such'], [
      ['The old letter was ___ thin that we could see the words on the back.', 'so', '线索：后面有 that，前面是形容词 thin——so + 形容词 + that。such 后面要跟名词（such a thin letter），这里只有形容词，不能用 such。'],
      ['Grandpa is ___ tired to walk up the hill today.', 'too', '线索：后面是 to walk——too + 形容词 + to do：累得走不上山。'],
      ['The story was so sad ___ Tao didn’t make a joke for once.', 'that', '线索：前面有 so sad，后面是一整句话——so … that。连最爱开玩笑的 Tao 都没开口说笑。'],
      ['Fang was too afraid ___ give the key back.', 'to', '线索：前面是 too afraid，后面是动词原形 give——too … to。'],
    ]),
    Wr('d', '用 so … that 写一句你自己的经历：……得……。', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence about a real experience using “so + adjective + that + clause” (a degree and its result).',
      criteria: ['uses “so + adjective/adverb + that + a full clause” correctly (not “too … that”)', 'the that-clause is a real result of the first half', 'correct past tense and spelling'],
      examples: ['I was so tired that I fell asleep on the bus.', 'The film was so funny that we laughed all the way home.', 'The test was so hard that nobody finished it.'],
      words: ['I was so', 'that', 'I couldn’t …'], frame: 'I was so ______ that I ______.', ph: 'I was so …',
    }),
  ] },
  { id: 'x2', title: 'hurt：伤在身上，还是伤在心里', need: 'opt', steps: [
    T('t1', '', '**hurt** 可以说身上：I hurt my leg.（我把腿弄伤了）My leg hurts.（我腿疼）也可以说心里：Her words hurt me.（她的话伤了我）I felt hurt.（我很伤心）hurt 的过去式、过去分词还是 hurt。'),
    Mt('a', '这几个 hurt，各是什么意思？', ['I fell off my bike and **hurt** my knee.', 'My head **hurts**. I need to lie down.', 'Her words really **hurt** me.'], ['（话）伤了（心）', '弄伤了', '疼'], [1, 2, 0], '', { lh: '句子', rh: '意思', whys: [
      '从车上摔下来，膝盖——弄伤了（身上）。',
      'My head hurts：主语是头，头在疼。',
      'words 伤人，伤的不是身体，是心——Yu 那句 You did it on purpose! 就是这样伤了 Fang。',
    ] }),
  ] },
];

const EXT_UNTIL: Ext[] = [
  { id: 'x1', title: 'not … until：直到……才……', need: 'always', steps: [
    T('t0', '', '先看 Fang 找钥匙的那几天。', undefined, viz('clip', { shots: [['tc3.clipUntil', 1]], dur: 12, cap: [[0, 'June 15　Fang looked for the key. She **didn’t find** it.'], [0.34, 'June 21　She looked again. She still **didn’t find** it.'], [0.66, 'June 27　At last she **found** it — under a cupboard.'], [0.86, 'She **didn’t find** it **until** June 27.']], marks: [[0.05, 'June 15'], [0.37, 'June 21'], [0.69, 'June 27']] })),
    T('t1', '', '中文说“直到……才……”，英语用**否定句 + until**。为什么要否定？因为在那个时间以前，事情一直**没有**发生——didn’t find, didn’t find……到了 June 27，才终于找到。'),
    C('a', '“Tao didn’t get up until ten on Sunday.” Tao 星期天是几点起床的？', [
      ['*十点（十点以前一直没起）', '对：not … until ten——十点以前没起来，十点才起。'],
      ['十点以前就起来了', 'didn’t get up 说的是一直没起来，到十点才起。'],
      ['十点才开始睡', 'get up 是起床，不是睡觉。'],
    ], { keep: true }),
    T('t2', '', '肯定句 + until 是另一个意思：**一直……到……**——动作一直在做，到那时才停。', ['She **looked for** the key **until** June 27.（一直找到 27 号，那天不用再找了）', 'She **didn’t find** the key **until** June 27.（直到 27 号才找到）']),
    So('b', '这些句子，说的是“一直做到那时”，还是“到那时才发生”？', ['一直……到……（到那时停了）', '直到……才……（之前一直没发生）'], [
      ['We **waited** for Yu **until** six.', 0, '一直等到六点。'],
      ['Mr Zhou **taught** at this school **until** 2016.', 0, '一直教到 2016 年。'],
      ['The music box **played** **until** the key fell out.', 0, '一直响着，钥匙掉出来才停。'],
      ['Yu **didn’t come until** six.', 1, '六点以前没来，六点才来。'],
      ['I **didn’t know** the truth **until** today.', 1, '今天以前不知道，今天才知道。'],
      ['The shop **doesn’t open until** ten.', 1, '十点以前不开门，十点才开。'],
    ]),
    C('c', '“直到昨天我才收到她的信。”哪一句对？', [
      ['*I **didn’t get** her letter **until** yesterday.', '对：昨天以前一直没收到——否定 + until。'],
      ['I **got** her letter **until** yesterday.', '把中文的“直到……才”直接搬过来就错了：got … until 成了“一直收信，收到昨天为止”。'],
      ['I **didn’t get** her letter **since** yesterday.', 'since 是“自从”，要和现在完成时一起用，意思也不对。'],
    ], { keep: true }),
    Wr('d', '用 didn’t … until 写一句你自己的事：你直到什么时候才……（学会一件事、知道一件事、明白一个道理）。', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence about their own life using “didn’t … until …” to mean “not until then did something happen”.',
      criteria: ['uses a negative verb + until correctly (didn’t learn / know / understand … until …)', 'the meaning is “only then did it happen”, and it makes sense', 'correct past tense and spelling'],
      examples: ['I didn’t learn to ride a bike until I was ten.', 'I didn’t know my grandma could sing until last Spring Festival.', 'I didn’t understand the joke until Tao explained it.'],
      words: ['I didn’t', 'until', 'I was … / last …'], frame: 'I didn’t ______ until ______.', ph: 'I didn’t …',
    }),
  ] },
];

const EXT_HAD: Ext[] = [
  { id: 'x1', title: '谁先，谁后', need: 'always', steps: [
    T('t0', '', '先看那年七月，Yu 家门口发生了什么。', undefined, viz('clip', { shots: [['tc3.clipHad', 1]], dur: 12, cap: [[0, 'First　Yu’s family **moved** to Shanghai. The truck drove away.'], [0.5, 'Later　Fang **got** to Yu’s home. Nobody opened the door.'], [0.78, 'By the time Fang got there, they **had** already **moved**.']], marks: [[0.05, '① moved'], [0.52, '② got there']] })),
    C('a', '要是周老师说的是 “When she got there, Yu’s family **moved** to Shanghai.”，意思就变了。变成了——', [
      ['*Fang 先到，Yu 家后搬——她到的时候还见得着 Yu', '对：两个一般过去时放在一起，一般就按说的先后发生：她到了，他们才搬。'],
      ['和原句一样：Yu 家先搬走了', '原句是靠 had moved 才说清“搬家更早”的；去掉 had，先后就反过来了。'],
    ], { keep: true }),
    T('t1', '', '再把三种说法放在一起比：同样是“她到的时候”，搬家这件事换一种时态，Fang 看到的就完全不一样。', undefined, viz('clip', { shots: [['tc3.whenMoved', 1], ['tc3.whenMoving', 1], ['tc3.clipHad', 1]], dur: 15, cap: [[0, 'When Fang got there, they **moved**.'], [0.333, 'When Fang got there, they **were moving**.'], [0.666, 'When Fang got there, they **had moved**.']], marks: [[0.04, 'moved'], [0.37, 'were moving'], [0.7, 'had moved']] })),
    Mt('b', '三句话，Fang 各自看到了什么？', ['When Fang got there, they **moved**.', 'When Fang got there, they **were moving**.', 'When Fang got there, they **had moved**.'], ['门锁着，屋里空了', '她来了以后，他们才动身——她还能和 Yu 说上话', '工人正把箱子往卡车上搬'], [1, 2, 0], '', { lh: '句子', rh: 'Fang 看到的', whys: [
      'moved 和 got 都是一般过去时，按先后排：她先到，他们后搬。',
      'were moving：那一刻正在搬——箱子还在往车上抬。',
      'had moved：比“她到”更早就搬完了——人走了，屋子空了。',
    ] }),
    T('t2', '', '规律：两件过去的事，**先发生**、又是倒回去补说的那件，用 **had + 过去分词**（过去完成时）；后发生的那件用一般过去时。by the time（等到……的时候）后面用一般过去时，另一半常常用 had done：等你赶到，事情早就发生了。', ['① Yu’s family moved. → ② Fang got there.', 'By the time ②, ① had happened: By the time Fang got there, Yu’s family **had** already **moved**.']),
    fill('c', '放进句子，有的用不上。', ['had left', 'left', 'has left', 'had started', 'started'], [
      ['By the time we got to the station, the train ___. We had to wait for the next one.', 'had left', '线索：By the time we got…，还得等下一班——火车在我们到之前就开走了：had left。has left 是现在完成时，连着“现在”，不放在过去的故事里；left 会让人以为我们到了，火车才开。'],
      ['The film ___ at seven, and we got there at five past seven.', 'started', '线索：按时间顺序一件一件说（七点开始，七点零五到）——顺着讲，一般过去时就够了：started。'],
      ['When I turned on the TV, the match ___. I only saw the second half.', 'had started', '线索：I only saw the second half——比赛在开电视之前就开始了：had started。要是填 started，就成了“我一开电视，比赛才开始”，那就能看到开头了。'],
    ]),
  ] },
  { id: 'x2', title: '不是每个“以前”都要用 had', need: 'opt', steps: [
    T('t1', '', '讲过去的事，按发生的顺序一件一件说，一般过去时就够了，不用 had。只有**倒回去**说更早的事，才需要 had 提醒“这件更早”。', ['顺着说：Fang found the key. She put it in her letter. The class buried the box.', '倒着说：When the class buried the box, Fang **had** already **put** the key in her letter.']),
    C('a', '哪一句里的 had 用得**多余**？', [
      ['*Yesterday I **had gone** to the park and **had played** football with Tao.', '对，这句的 had 多余：只是按顺序讲昨天的事，没有倒回去，用 went、played 就行。'],
      ['When I got home, Mum **had** already **cooked** dinner.', '这里要用：做饭在“我到家”之前就做好了。'],
      ['I couldn’t open the door because I **had lost** my key.', '这里要用：丢钥匙比“开不了门”更早。'],
    ], { keep: true }),
    C('b', '“I realized I **had met** her before.” 意思是——', [
      ['*我这才意识到，我以前见过她', '对：had met 比 realized 更早。'],
      ['我意识到，我以后会见到她', 'had met 是“已经见过”，不是“将会见到”。'],
    ], { keep: true }),
  ] },
];

const EXT_REGRET: Ext[] = [
  { id: 'x1', title: '后悔一辈子', need: 'always', steps: [
    T('t1', '', '**regret**：后悔——做了（或没做）一件事，事后希望当初不是那样。后面可以跟名词、it，也可以跟 doing：regret saying it（后悔说了那句话），regret not saying sorry（后悔没道歉）。'),
    C('a', 'Fang 后悔的到底是什么？用英语说最准确的是——', [
      ['*She regrets **not saying** sorry before Yu left.', '对：她后悔的是没能在 Yu 走之前道歉：regret not doing。'],
      ['She regrets **saying** sorry.', '那成了“后悔道了歉”——正好反了。'],
      ['She regrets **to say** sorry.', 'regret to say 是正式场合的“很遗憾地告诉你……”，不是这个意思。'],
    ], { keep: true }),
    T('t2', '', '回扣一下时态：has regretted it all her life——从 1996 年一直后悔到现在，现在还在后悔，用现在完成时（have / has + 过去分词）。周老师开头那句 I haven’t heard those two names together for a long time 也一样：很久以来，一直到现在都没听到。'),
    C('b', '“She **has regretted** it all her life.” 和 “She **regretted** it.” 有什么不一样？', [
      ['*前一句是一直后悔到现在；后一句只说过去后悔过，现在怎样没说', '对：现在完成时连着“现在”。'],
      ['没有区别', 'has regretted 把时间一直拉到现在：她现在还在后悔。'],
      ['后一句说的时间更长', 'regretted 只说过去某个时候，反而说不出“一辈子到现在”。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['for', 'since', 'ago', 'until', 'before'], [
      ['My grandparents have lived in this old flat ___ 1985.', 'since', '线索：1985 是一个时间点（从那年起）——since + 起点。for 后面跟一段时间，不跟年份。'],
      ['I haven’t seen my cousin ___ three years.', 'for', '线索：three years 是一段时间——for + 一段时间。until 是“直到”，haven’t seen my cousin until three years 说不通。'],
      ['Yu’s family moved to Shanghai thirty years ___.', 'ago', '线索：moved 是一般过去时，说“三十年前”——一段时间 + ago。before 放在这里，是“在（另一件事）之前三十年”，不是从现在往回数。'],
    ]),
    Wr('d', '用现在完成时 + for / since 写一句：你坚持了很久的一件事，或者很久没做的一件事。', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence about themselves using the present perfect with “for” + a length of time or “since” + a starting point.',
      criteria: ['uses the present perfect correctly (have/has + past participle, or haven’t …)', 'for + a length of time, or since + a point in time — not mixed up', 'a real, sensible statement; correct spelling'],
      examples: ['I have played the piano for six years.', 'I haven’t seen my best friend from primary school since 2023.', 'My family has lived in Beijing since I was born.'],
      words: ['I have', 'for … years', 'since …'], frame: 'I have ______ for / since ______.', ph: 'I have …',
    }),
  ] },
];

const EXT_IF: Ext[] = [
  { id: 'x1', title: 'if：是否', need: 'always', steps: [
    T('t1', '', '回扣一下间接问句：问句放进另一句话里，要换成陈述的语序——Where is Yu? → … where Yu **is**。故事是在过去讲的，所以是 where Yu **was**。', ['Where is Yu? → She asked me where Yu was.']),
    C('a', '你想问周老师 Fang 现在住在哪里。哪一句对？', [
      ['*Could you tell me where Fang **lives** now?', '对：问句放进 Could you tell me 后面，用陈述语序：where Fang lives。'],
      ['Could you tell me where **does Fang live** now?', '前面的 Could you 已经是问句了，后半句不再倒装，也不要 does。'],
    ], { keep: true }),
    T('t2', '', '能用 Yes / No 回答的问句，放进句子里，前面加 **if** 或 **whether**，意思是“**是否**”。', ['Do you know where Yu is? → She asked me **if** I knew where Yu was.（问我知不知道）']),
    C('b', '你想问周老师：Fang 是不是还在北京工作。最好的问法是——', [
      ['*Do you know **if** Fang still works in Beijing?', '对：if = 是否；后面是陈述语序 Fang still works。'],
      ['Do you know **does** Fang still work in Beijing?', '放进 Do you know 后面，就不再用 does 提问了；要加 if。'],
      ['Do you know **that** Fang still works in Beijing?', 'that 是在说一件你已经认定的事（你知道她还在北京工作吧？），不是在问“是不是”。'],
    ], { keep: true }),
    T('t3', '', 'if 还有一个更常见的意思：**如果**。看它在哪儿：ask、know、wonder、not sure 后面的 if，多半是“是否”；后面跟着“就会怎样”的，是“如果”。'),
    So('c', '这些 if，是“是否”，还是“如果”？', ['是否', '如果'], [
      ['She asked me **if** I knew where Yu was.', 0, 'asked me if…：问我是否……'],
      ['I’m not sure **if** Mr Zhou is at home.', 0, 'not sure if…：不确定是否……'],
      ['Could you tell me **if** the library is open today?', 0, 'tell me if…：告诉我是否……'],
      ['**If** you find her, please give her the key.', 1, '如果你找到她，就……（Fang 信里的话）'],
      ['**If** it rains tomorrow, the ceremony will be in the hall.', 1, '如果明天下雨，就……'],
      ['We’ll miss the bus **if** we don’t hurry.', 1, '如果不快点，就……'],
    ]),
    Wr('d', '用 Do you know if … 或 Could you tell me if … 写一句，问周老师一件你想知道的事（是不是、有没有、还在不在）。', {
      lang: 'en', role: 'en',
      task: 'The student writes one polite English question to Mr Zhou, a 75-year-old retired teacher, about Fang (now a doctor in Beijing) or Yu (lost contact long ago), using “Do you know if …” or “Could you tell me if/whether …” with statement word order.',
      criteria: ['uses “Do you know if/whether …” or “Could you tell me if/whether …”', 'statement word order after if (if Fang still lives…, not if does Fang live…)', 'a sensible yes/no question about the story; polite; correct spelling'],
      examples: ['Do you know if Fang still lives in Beijing?', 'Could you tell me if Fang will visit you again this Spring Festival?', 'Do you know whether Yu still has the music box?'],
      words: ['Do you know if', 'Fang / Yu', 'still …'], frame: 'Do you know if ______?', ph: 'Do you know if …',
    }),
  ] },
];

const EXT_HIDDEN: Ext[] = [
  { id: 'x1', title: '被藏起来的信', need: 'always', steps: [
    T('t1', '', '回扣被动：**be + 过去分词**，“……被……”。信封自己不会藏，是**被**人藏的；谁藏的，这时候还不知道，就不说 by …。', ['A thin blue envelope **was hidden** under the lining.']),
    C('a', '翻过信封，看见了名字——现在知道是谁藏的了。下面哪几句对？（可以选不止一个）', [
      ['*Chen Yu **hid** the envelope under the lining.', '对：主动，主语是做事的人 Chen Yu。'],
      ['*The envelope **was hidden** under the lining **by** Chen Yu.', '对：被动，加上 by Chen Yu 说出是谁做的。'],
      ['The envelope **hid** under the lining.', '信封自己“藏”了起来？主语是东西，要用被动 was hidden。'],
      ['Chen Yu **was hidden** the envelope.', '成了“Chen Yu 被藏了”？主语是做事的人，要用主动 hid。'],
    ], { multi: true, keep: true }),
    T('t2', '', 'hide 是不规则动词：hide – hid – hidden。被动用第三个（过去分词）。这个故事里还有好几个：write – wrote – written，bury – buried – buried，find – found – found。'),
    Mt('b', '原形和过去分词连起来。', ['hide', 'write', 'bury', 'break', 'give'], ['given', 'buried', 'hidden', 'broken', 'written'], [2, 4, 1, 3, 0], '', { lh: '原形', rh: '过去分词', whys: [
      'hide → hid → hidden：双写 d 再加 en。',
      'write → wrote → written：双写 t 再加 en。',
      'bury → buried → buried：y 变 i 加 ed，过去式、过去分词一样。',
      'break → broke → broken：摔坏的八音盒，是 a broken music box。',
      'give → gave → given。',
    ] }),
    fill('c', '主动还是被动？放进句子，有的用不上。', ['buried', 'was buried', 'wrote', 'was written', 'hid', 'was hidden'], [
      ['The class ___ the time capsule under the old ginkgo tree.', 'buried', '线索：主语 The class 是做这件事的人——主动：buried。was buried 是“被埋”，全班同学可没被埋。'],
      ['The time capsule ___ on June 28, 1996.', 'was buried', '线索：主语是盒子，它是被埋的，谁埋的没说——被动：was buried。'],
      ['Every letter in the box ___ in English.', 'was written', '线索：信是被写的，这里只说用什么语言写——被动：was written。wrote 是主动，信自己不会写字。'],
      ['Yu ___ her letter under the lining, so nobody saw it.', 'hid', '线索：主语 Yu 是做这件事的人，so nobody saw it——主动：hid。was hidden 会成了“Yu 被藏了起来”。'],
    ]),
  ] },
];

const EXT_MIS: Ext[] = [
  { id: 'x1', title: 'make up 不只是“化妆”', need: 'always', steps: [
    T('t1', '', 'AI 眼镜把 make up 翻成了“化妆”。make-up 当名词，确实是“化妆品、妆容”；可 make up 当动词词组，常见的意思有好几个，要看前后文。'),
    Mt('a', '这几个 make up，各是什么意思？', ['They argued, but they **made up** the next day.', 'He was late again, so he **made up** an excuse.', 'Before the show, the actors put on **make-up**.', 'Girls **make up** half of our class.'], ['组成、占', '化妆（品）', '编造', '和好'], [3, 2, 1, 0], '', { lh: '句子', rh: '意思', whys: [
      '前面是 argued，后面是 the next day——吵完第二天：和好了。',
      'made up an excuse：编了一个借口。make up a story 也是“编故事”。',
      '演出前演员要 put on make-up：化妆。这里 make-up 是名词，中间常有一道连字符。',
      'Girls make up half：女生占了一半——组成、构成。',
    ] }),
    C('b', '“我想和她和好。”哪一句对？', [
      ['*I want to **make up with** her.', '对：和某人和好：make up with 某人。'],
      ['I want to **make her up**.', 'make her up 成了“给她化妆”。'],
      ['I want to **make up her**.', 'make up 后面直接跟人说不通；和谁和好，要加 with。'],
    ], { keep: true }),
    T('t2', '', '吵架到和好，是一串词：argue（吵架）→ say sorry / apologize（道歉）→ forgive（原谅）→ make up（和好）。apologize 后面跟 to 某人、for 某事：apologize to Yu for the music box。'),
    fill('c', '放进句子，有的词用不上。', ['apologize', 'forgive', 'made up', 'make up', 'argue'], [
      ['You read your sister’s diary? You should ___ to her!', 'apologize', '线索：后面是 to her——向她道歉：apologize to 某人。forgive 是原谅，是对方做的事，后面也不跟 to。'],
      ['I’m really sorry. Please ___ me.', 'forgive', '线索：I’m really sorry 之后，请对方原谅：forgive me。'],
      ['The two brothers didn’t talk for a week, but they ___ at last.', 'made up', '线索：一个星期不说话，最后——和好了；didn’t talk 说的是过去，要用过去式 made up。make up 是原形，这里不能用；argue 是吵架，正好反了。'],
    ]),
  ] },
  { id: 'x2', title: 'play 不只是“玩”', need: 'opt', steps: [
    T('t1', '', 'AI 把 doesn’t play anymore 翻成“再也不玩了”。play 除了“玩”，还有好几个意思：**弹奏**（play the piano）、**（音乐）响起、播放**（The music box plays a song.）、**扮演**（play Juliet）、**打（球）**（play football）。'),
    Mt('a', '这几个 play，各是什么意思？', ['Yu can **play** the piano.', 'The music box **plays** a song when you open it.', 'In the show, Fang will **play** the princess.', 'Tao **plays** basketball every Friday.'], ['打（球）', '扮演（角色）', '（乐曲）响起', '弹奏（乐器）'], [3, 2, 1, 0], '', { lh: '句子', rh: '意思', whys: [
      'play + 乐器：弹奏。英国人说乐器常加 the：play the piano。',
      '主语是八音盒，它自己“演奏”——打开盒子，曲子就响起来。',
      'play + 角色：扮演。演出里 Fang 要演公主。',
      'play + 球类：打球、踢球，球类前面不加 the。',
    ] }),
  ] },
];

const EXT_ORDER: Ext[] = [
  { id: 'x1', title: '讲的顺序，不等于发生的顺序', need: 'always', steps: [
    T('t1', '', '周老师讲到七月时，先说 Fang 去了 Yu 家，再说 Yu 家已经搬走了——后说的那件，其实先发生。听英语故事，靠的就是 had moved 这样的时态，还有 by the time、until、the next day 这些时间词。'),
    C('a', '“When I got home, Mum **had cooked** dinner.” 哪件事先发生？', [
      ['*妈妈做好了饭', '对：had cooked 比 got home 更早——我到家时，饭已经在桌上了。'],
      ['我到家', 'got home 是一般过去时，是后发生的那件。'],
    ], { keep: true }),
    fill('b', '用时间词把 Fang 的故事连起来，有的用不上。', ['the next day', 'until', 'by the time', 'after', 'since'], [
      ['Fang and Yu argued, and ___ the music box fell off the desk.', 'the next day', '线索：先吵架，后摔盒子，中间隔了一天——the next day。'],
      ['Fang didn’t find the key ___ June 27.', 'until', '线索：didn’t find … June 27——直到 27 号才找到：not … until。since 是“自从”，要和现在完成时一起用。'],
      ['Yu’s family had already left ___ Fang got to their home.', 'by the time', '线索：had already left 更早，后面是 Fang 赶到——等她到的时候：by the time。'],
      ['Fang put the key in her letter ___ she found it.', 'after', '线索：先找到，再放进信里——在……之后：after。'],
    ]),
  ] },
  { id: 'x2', title: '用英语讲讲那个夏天', need: 'opt', steps: [
    frag('用英语讲讲 1996 年的那个夏天：挑句子，拼成一段话。', [
      ['*In June 1996, Fang and Yu argued about who would sing first.', 1, 'argue', { seq: 0 }],
      ['*The next day, Fang knocked Yu’s music box off the desk by accident, and the key rolled away.', 1, 'box', { seq: 1 }],
      ['*Fang didn’t find the key until June 27, and she didn’t dare to give it back.', 1, 'key', { seq: 2 }],
      ['*Both girls put a letter into the time capsule to say sorry.', 1, 'letters', { seq: 3 }],
      ['*By the time Fang went to Yu’s home in July, Yu’s family had already moved to Shanghai.', 1, 'move', { seq: 4 }],
      ['Fang broke the music box on purpose.', 1, '是不小心碰掉的（by accident），不是故意的。'],
      ['Fang gave the key back to Yu on June 27.', 1, '她不敢还：didn’t dare to give it back。'],
      ['Fang got to Yu’s home before the family moved.', 1, '她到的时候，Yu 家已经搬走了。'],
      ['*Yu said terrible things because she was angry.', 2, undefined, { after: 'box' }],
      ['*But neither of them knew about the other’s letter.', 2, undefined, { after: 'letters' }],
      ['So Fang never wanted to see Yu again.', 2, '正好相反：她后悔了一辈子，一直想找到 Yu。'],
      ['*Now the two letters have been found, and we have to tell them both.', 3],
      ['Now the story is over.', 3, '还没完——两个人都还不知道对方也写了信。'],
    ], { argue: '还没说她们为什么吵架。', box: '还没说八音盒是怎么摔的。', key: '还没说钥匙的事。', letters: '还没说两封道歉信。', move: '还没说 Fang 七月去道歉时发生了什么。' },
    { 1: '先按先后说说那个夏天发生了什么。', 2: '事情都说对了。再说说：她们心里是怎么想的？', 3: '最后说说：现在该做什么？' },
    'In June 1996, Fang and Yu argued about who would sing first. The next day, Fang knocked Yu’s music box off the desk by accident, and the key rolled away. Yu said terrible things because she was angry. Fang didn’t find the key until June 27, and she didn’t dare to give it back. Both girls put a letter into the time capsule to say sorry. But neither of them knew about the other’s letter. By the time Fang went to Yu’s home in July, Yu’s family had already moved to Shanghai. Now the two letters have been found, and we have to tell them both.'),
  ] },
];

const EXT_WRITE: Ext[] = [
  { id: 'x1', title: '晚了一步：had 最常用的两种句子', need: 'always', steps: [
    T('t1', '', '过去完成时最常用在两种句子里：① **By the time** + 一般过去时，… **had** done（等……的时候，……已经……）；② **When** I …, I **found / realized** (that) I **had** done（到那时才发现，之前已经……）。', ['By the time we got to the cinema, the film had already started.', 'When I got to school, I realized I had left my homework at home.']),
    C('a', '“When I got to school, I realized I ___ my homework at home.”', [
      ['*had left', '对：作业落在家里，比“到学校、发现”更早：had left。'],
      ['have left', 'have left 连着“现在”；这件事整个发生在过去，用 had left。'],
      ['leave', '说的是过去的事，不能用原形。'],
    ], { keep: true }),
    C('b', '“Mr Zhou opened the box and found that someone **had hidden** a letter there.” 先发生的是——', [
      ['*有人把信藏在里面', '对：had hidden 更早——藏信在 1996 年，打开盒子是很多年以后。'],
      ['周老师打开盒子', 'opened 是一般过去时，后发生；had hidden 在它之前。'],
    ], { keep: true }),
    type('c', '“我们赶到电影院时，电影已经开始了。” By the time we got to the cinema, the film ___. （填两个词）', ['had started', 'had begun'], '比“我们到”更早：had + 过去分词，had started（had begun 也对）。', { started: '这样就成了“我们到了，电影才开始”。要说“已经开始了”，用 had started。', 'has started': '说的是过去的事，用 had，不用 has。', 'was started': '电影“开始”不用被动。' }, 'had …'),
  ] },
];

// ---------------- 题 ----------------
export const PLAY_EC3_ITEMS: Item[] = [
  item({
    id: 'c3-argue', st: 'ec3', lv: 1, type: 'word', topic: 'argue / discuss', label: 'they argued', intro: '', ask: 'argue 和 discuss 有什么不一样？',
    hints: ['为“谁先唱”争起来——两个人的想法一样吗？'],
    explain: 'argue：两个人意见不合，越说越激动——争吵、争论（argue with 某人 about 某事）。心平气和地商量，是 discuss。',
    lock: { words: ['argued'] },
    ext: EXT_ARGUE,
  }, C('a', 'Fang and Yu **argued** about who would sing first. **argued** 是——', [
    ['*吵了起来（为谁先唱争执不下）', '对：argue about 某事——为某事争吵。'],
    ['商量了一下', '心平气和地商量是 discuss；argue 是意见不合、争了起来。'],
    ['一起唱了起来', '唱是 sing；argue 和唱歌无关。'],
    ['同意了', '同意是 agree；argue 正好是意见不合。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c3-purpose', st: 'ec3', lv: 1, type: 'word', topic: 'on purpose / by accident', label: 'You did it on purpose!', intro: '', ask: 'on purpose 和 by accident 怎么分？',
    hints: ['Fang 抱着一摞书走过——她是想去碰那个八音盒吗？'],
    explain: 'on purpose：故意地；by accident：不小心、意外地。Yu 以为 Fang 是故意的，其实那是个意外——两个短语意思正好相反，用错一个，误会就来了。',
    lock: { words: ['on purpose'] },
    back: [{ ch: 'ec1', line: 'purpose', label: '第一章：Fang 的信 “She thinks I did it on purpose.”' }],
    ext: EXT_PURPOSE,
  },
    C('a', 'Yu 喊：“You did it **on purpose**!” 她的意思是——', [
      ['*你是故意的！', '对：on purpose，故意地。'],
      ['你是不小心的！', '不小心是 by accident，正好反了。'],
      ['你是为了练习才这么做的！', 'purpose 单独用有“目的”的意思，可 on purpose 是一个固定说法：故意地。'],
      ['你做得真好！', '她正在气头上呢。'],
    ], { cols: 1, reveal: 'chosen' }),
    C('b', '可事实是怎样的？Fang 是——', [
      ['*by accident（不小心碰掉的）', '对：她抱着一摞书，胳膊碰到了八音盒——不是有意的。'],
      ['on purpose（故意碰掉的）', '这是 Yu 当时以为的；Fang 并不想把它摔坏。'],
      ['for fun（为了好玩）', 'for fun 是“为了好玩”；她根本没想去碰它。'],
    ], { reveal: 'chosen' }),
  ),

  item({
    id: 'c3-so', st: 'ec3', lv: 2, type: 'read', topic: 'so … that', label: 'so hurt that…', intro: '', ask: 'so … that 和 too … to 有什么不一样？',
    hints: ['先难过，还是先说不出话？hurt 在这里伤的是身体，还是心？'],
    explain: 'so + 形容词 + that + 一句话：太……，以至于……。Fang 难过极了（有多难过），结果一句话也说不出来（结果）。这里的 hurt 是心里受了伤、很难过。',
    lock: { words: ['so hurt that'] },
    ext: EXT_SO,
  }, C('a', '“Fang was **so hurt that** she couldn’t say a word.” 意思是——', [
    ['*Fang 太难过了，难过得一句话也说不出来', '对：so hurt（有多难过）→ couldn’t say a word（结果）。'],
    ['Fang 受了伤，疼得说不出话', 'hurt 可以说身上受伤；可这里没人受伤，是 Yu 那句话伤了她的心。'],
    ['Fang 很难过，所以她故意一句话也不说', 'couldn’t 是“说不出来”，不是“故意不说”。'],
    ['Fang 说不出话来，所以很难过', '因果反了：先是难过，结果才说不出话。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c3-until', st: 'ec3', lv: 2, type: 'read', topic: 'not … until', label: 'didn’t find it until June 27', intro: '', ask: '“直到……才”英语怎么说？',
    hints: ['didn’t find：没找到。6 月 27 日以前，钥匙在她手里吗？'],
    explain: 'not … until：直到……才……。6 月 27 日以前，钥匙一直没找到；那天才在柜子底下找到。中文的“直到……才”，英语要用否定句 + until。',
    lock: { words: ['didn’t find it until June 27'] },
    ext: EXT_UNTIL,
  }, C('a', '“She **didn’t find** it **until** June 27.” 意思是——', [
    ['*直到 6 月 27 日，她才找到钥匙', '对：27 号以前一直没找到，那天才找到。'],
    ['6 月 27 日以后，她就再也找不到了', 'until 说的是“到那时为止”，不是“从那以后”。'],
    ['她 6 月 27 日把钥匙弄丢了', '钥匙在八音盒摔下来那天就丢了；27 号是找到的日子。'],
    ['到 6 月 27 日，她还没开始找', 'didn’t find 是“没找到”，不是“没去找”——她到处都找过了。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c3-had', st: 'ec3', lv: 2, type: 'tense', topic: 'past perfect', label: 'had already moved', intro: '', ask: 'had moved 和 moved 有什么不一样？',
    hints: ['Fang 到的时候，门口还有搬家的卡车吗？already 说的是“已经”。'],
    explain: '两件过去的事：Yu 家搬走在先，Fang 赶到在后。先发生、又是倒回去补说的那件，用 had + 过去分词（过去完成时）：By the time she got there, Yu’s family had already moved.——等她赶到，已经晚了一步。',
    lock: { words: ['by the time', 'had already moved'] },
    ext: EXT_HAD,
  }, C('a', '“By the time she got there, Yu’s family **had already moved** to Shanghai.” 哪件事先发生？', [
    ['*Yu 家先搬走了，Fang 后来才赶到', '对：had moved 比 got there 更早——她来晚了一步。'],
    ['Fang 先到了 Yu 家，Yu 家后来才搬', '那要说 When she got there, Yu’s family moved.——她到了，他们才搬。'],
    ['两件事同时发生：她到的时候，他们正在搬', '那要说 they were moving。'],
    ['Fang 跟着 Yu 一家一起搬去了上海', 'Fang 没有搬家，她是去道歉的。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c3-regret', st: 'ec3', lv: 2, type: 'word', topic: 'regret', label: 'She has regretted it all her life', intro: '', ask: 'regret 后面能跟什么？',
    hints: ['all her life：一辈子。一个人一辈子放不下一件事，是什么心情？'],
    explain: 'regret：后悔。has regretted it all her life：从那年夏天一直后悔到现在——现在完成时把时间拉到“现在”。',
    lock: { words: ['regretted'] },
    back: [{ ch: 'ec1', line: 'thirty', label: '第一章：it has been under this tree for thirty years' }],
    ext: EXT_REGRET,
  }, C('a', '“She has **regretted** it all her life.” 意思是——', [
    ['*这件事，她后悔了一辈子（到现在还在后悔）', '对：regret 是后悔；has regretted，一直到现在。'],
    ['这件事，她一辈子都记得', '记得是 remember；regret 是后悔，不只是记得。'],
    ['这件事，她一辈子都在道歉', '道歉是 apologize / say sorry；她恰恰没能道成歉。'],
    ['她刚刚才开始后悔', 'all her life：一辈子，不是刚刚。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c3-if', st: 'ec3', lv: 2, type: 'grammar', topic: 'if = whether', label: 'she asked me if I knew…', intro: '', ask: 'if 什么时候是“如果”，什么时候是“是否”？',
    hints: ['Fang 问周老师的，是能用“知道 / 不知道”来回答的问题。'],
    explain: 'ask、know、not sure 后面的 if 是“是否”（= whether）。she asked me if I knew where Yu was：她问我知不知道 Yu 在哪儿。问句放进句子里，用陈述的语序：where Yu was。',
    lock: { words: ['asked me if I knew where Yu was'] },
    back: [{ ch: 'ec2', line: 'contact', label: '第二章：Could you tell me how we can contact him?' }],
    ext: EXT_IF,
  }, C('a', '“Last year, she asked me **if** I knew where Yu was.” 这里的 **if** 是——', [
    ['*是否：她问我“知不知道 Yu 在哪儿”', '对：asked me if… = 问我是否……'],
    ['如果：如果我知道 Yu 在哪儿，就……', '句子里没有“就怎样”的后半句；asked me 后面的 if 是“是否”。'],
    ['因为：因为我知道 Yu 在哪儿', '因为是 because。'],
    ['虽然：虽然我知道 Yu 在哪儿', '虽然是 although。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c3-hidden', st: 'ec3', lv: 2, type: 'grammar', topic: 'passive', label: 'was hidden under it', intro: '', ask: '被动句什么时候不说 by …？',
    hints: ['信封还没翻过来——这时候你知道是谁藏的吗？'],
    explain: 'was hidden：被藏着（被动：be + 过去分词）。用被动，是因为要说的是信封；谁藏的，这时候还不知道，所以不说 by …。',
    lock: { words: ['was hidden'] },
    back: [{ ch: 'ec1', line: 'label', label: '第一章：“Buried on June 28, 1996.”' }],
    ext: EXT_HIDDEN,
  }, C('a', '“A thin blue envelope **was hidden** under it.” 这句话告诉我们是谁藏的了吗？', [
    ['*没有：只说信封被藏在下面，谁藏的这时候还不知道', '对：被动句不说 by …，常常就是因为不知道、或者不重要。'],
    ['说了：是信封自己藏起来的', 'was hidden 是“被藏”，信封自己不会藏。'],
    ['说了：是 Tao 刚刚藏的', 'Tao 是发现它的人。'],
    ['说了：是周老师藏的', '句子里没有 by Mr Zhou。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c3-makeup', st: 'ec3', lv: 2, type: 'mis', topic: 'AI 误译 / make up', label: 'AI 眼镜把 Yu 的信译错了', intro: '', ask: 'make up 有哪几种意思？',
    hints: ['点一点信里的词（accident、terrible、play、make up），看看它们在这封信里的意思。', '写信的是一个跟好朋友吵了架的女孩——她最想说的是什么？'],
    explain: 'AI 眼镜又按每个词最常见的意思去翻了：accident 不只是“事故”，是意外；terrible things 是很难听的话；play 是（音乐）响；make up 是和好。',
    lock: { words: ['accident', 'terrible', 'doesn’t play anymore', 'make up'], lines: ['l2', 'l3'] },
    back: [{ ch: 'ec1', line: 'accident', label: '第一章：Fang 的信 “… but it was an accident.”' }],
    ext: EXT_MIS,
  }, M('a', 'AI 眼镜的译文有几处不对。点出来，改对。', 'To whoever finds this: please tell Lin Fang I’m sorry.\nI know it was an accident. I said terrible things because I was angry.\nThe box doesn’t play anymore, but I will keep it forever. Maybe one day we will make up.', [
    '致发现这封信的人：请告诉 Lin Fang，我很抱歉。',
    ['我知道那是一场事故。', 'it was an accident', ['*我知道那是个意外（她不是故意的）。', '我知道那是一场事故。', '我知道那是一场考试。'], 'accident 不只是车祸那样的“事故”：不是有意的、意外发生的事，都是 accident。这里说的是八音盒被碰掉——一个意外。'],
    ['我讲了可怕的东西，', 'said terrible things', ['*我说了很难听的话，', '我讲了可怕的东西，', '我说了好几遍，'], 'terrible 是“糟糕的、很坏的”；said terrible things 是说了很伤人、很难听的话——就是那句 You did it on purpose!'],
    '因为我当时在气头上。',
    ['八音盒再也不玩了，', 'doesn’t play anymore', ['*八音盒再也不响了，', '八音盒再也不玩了，', '我再也不玩八音盒了，'], 'play 除了“玩”，还有“（音乐）响起、演奏”：The music box plays a song. not … anymore：不再。'],
    '可我会永远留着它。',
    ['也许有一天，我们会化妆。', 'make up', ['*也许有一天，我们会和好。', '也许有一天，我们会化妆。', '也许有一天，我们会编个故事。'], 'make-up 当名词是“化妆品、妆容”；可写信的是吵了架的两个好朋友中的一个——make up 在这里是“和好”。'],
  ], 'AI 眼镜的译文')),

  item({
    id: 'c3-order', st: 'ec3', lv: 1, type: 'order', topic: 'timeline', label: '1996 年夏天的时间线', intro: '', ask: '为什么讲故事的顺序和发生的顺序会不一样？',
    hints: ['先找吵架那天，再找八音盒摔下来的那天。七月那两件：搬家和 Fang 赶到，哪个在前？'],
    explain: '讲的顺序和发生的顺序不一样：周老师先说 Fang 去了 Yu 家，再说 Yu 家已经搬走了——其实搬家在前。had moved 就是在提醒你“这件更早”。',
    ext: EXT_ORDER,
  }, Od('o', '按真实发生的先后，排一排。', [
    'Fang and Yu argued about who would sing first.',
    'Fang knocked the music box off Yu’s desk.',
    'Fang found the key under a cupboard.',
    'The class buried the time capsule.',
    'Yu’s family moved to Shanghai.',
    'Fang got to Yu’s home to say sorry.',
    'Tao found the blue letter under the lining.',
  ], '吵架 → 第二天摔了八音盒 → 6 月 27 日找到钥匙 → 6 月 28 日埋下胶囊 → 七月 Yu 家搬走 → Fang 赶到时已经晚了 → 三十年后，蓝信封被找到。', ['June 1996', 'the next day', 'June 27', 'June 28', 'July', 'July (too late)', '2026'])),

  item({
    id: 'c3-write', st: 'ec3', lv: 2, type: 'write', topic: 'By the time … had …', label: '写一句“晚了一步”', intro: '', ask: '过去完成时还能用在哪些句子里？',
    hints: ['先想好两件事：哪件先发生（用 had + 过去分词），哪件后发生（用一般过去时）。'],
    explain: 'By the time + 一般过去时（后发生的那件），… had + 过去分词（先发生的那件）：By the time I got to the bus stop, the bus had already left.——等我赶到，已经晚了一步。',
    ext: EXT_WRITE,
  }, Wr('w', 'Write one sentence with “By the time …, … had …”.', {
    lang: 'en', role: 'en',
    task: 'The student writes one English sentence using the past perfect in the pattern “By the time + past simple, … had (already) + past participle”. It may be about the story (Fang, Yu, the music box, the time capsule; e.g. By the time Fang found the key, Yu had stopped talking to her), or about the student’s own experience of being too late. It should not simply copy the story sentence “By the time she got there, Yu’s family had already moved to Shanghai.”',
    criteria: ['uses “By the time + past simple” and “had + past participle” correctly', 'the had-part really happened first, and the sentence makes sense', 'not a copy of the story sentence (changing only a name is not enough)', 'correct past participle and spelling'],
    examples: ['By the time I got to the bus stop, the bus had already left.', 'By the time Fang found the key, Yu had stopped talking to her.', 'By the time Mr Zhou finished the story, his tea had gone cold.'],
    words: ['By the time', 'had already', 'left / started / gone'], frame: 'By the time ______, ______ had already ______.', ph: 'By the time …',
  })),

  // ---------------- 支线任务：可做可不做 ----------------
  item({
    id: 'c3-x-remind', st: 'ec3', lv: 2, type: 'word', topic: 'remember / remind', label: 'remember 和 remind', intro: '', ask: 'remember 和 remind 有什么不一样？',
    hints: ['照片自己会“记得”吗？还是照片让人想起？'],
    explain: 'remember：记得（事情在自己脑子里）；remind：让人想起、提醒（是别人、别的东西让你想起来）。remind sb of sth：让某人想起……；remind sb to do：提醒某人去做……',
    lock: { words: ['reminds'] },
  },
    T('t1', '', '**remember**：记得（事情在自己脑子里）；**remind**：让人想起、提醒（是别人、别的东西让你想起来）。remind sb **of** sth：让某人想起……；remind sb **to** do：提醒某人去做……'),
    C('a', '“The photo ___ him of a summer long ago.” 为什么用 reminds，不用 remembers？', [
      ['*是照片让他想起了那个夏天——照片在“提醒”他', '对：remind sb of sth，让某人想起……'],
      ['remembers 也可以，意思一样', 'The photo remembers him 成了“照片记得他”——照片不会记事。'],
    ], { keep: true }),
    fill('b', '放进句子，有的词用不上。', ['remember', 'remind', 'reminds', 'remembered', 'forget'], [
      ['Mr Zhou, do you ___ Fang and Yu?', 'remember', '线索：问周老师自己脑子里还记不记得——remember。remind 后面要先跟人：remind sb of sth。'],
      ['This song always ___ me of my grandma.', 'reminds', '线索：主语是 This song，后面是 me of——歌让我想起奶奶：reminds（三单加 s）。remembered 是过去式，可 always 说的是常常这样。'],
      ['Can you ___ me to call Mrs Hu at six? I always forget.', 'remind', '线索：me to call——提醒我去做：remind sb to do。forget 正好反了，而且 forget 后面不先跟人。'],
    ]),
    C('c', '“Don’t forget to bring the letter!” 换一种说法是——', [
      ['*Remember to bring the letter!', '对：remember to do，记着去做（事情还没做）。'],
      ['Remind to bring the letter!', 'remind 后面要先跟人：Remind me to bring the letter.'],
    ], { keep: true }),
  ),
  item({
    id: 'c3-x-spot', st: 'ec3', lv: 3, type: 'spot', topic: 'spot the mistake', label: 'Tao 的笔记写错了', intro: '', ask: '“直到……才”为什么要用否定？',
    hints: ['每句只错一个地方：想想这一章里那几个容易用错的说法。'],
    explain: '四句里的错，正是这一章最容易用错的四处：argue about、so … that、not … until、had + 过去分词。',
  },
    T('t1', '', 'Tao 把周老师讲的故事记在了本子上。可他写得太急，每句都有一个地方写错了——点出来，再选怎么改。'),
    S('a', '点出写错的地方', 'Fang |and |Yu |argued |for |who |would |sing |first.', [4], C('fix', '换成哪个？', [
      ['*about', '对：为某件事吵，用 argue about。'],
      ['with', 'argue with 后面跟人：argue with Yu。'],
      ['to', 'argue 后面不跟 to。'],
    ]), { 3: 'argued 没问题，看看后面那个小词。' }, { about: 'Fang and Yu argued ~~for~~ ++about++ who would sing first.' }),
    S('b', '点出写错的地方', 'Fang |was |too |hurt |that |she |couldn’t |say |a |word.', [2], C('fix', '换成哪个？', [
      ['*so', '对：so … that，难过得说不出话。'],
      ['very', 'very 后面不能用 that 接结果。'],
      ['such', 'such 后面要跟名词，hurt 是形容词。'],
    ]), { 4: 'that 没错；只换一个词的话，要改的是前面那个 too——too 不和 that 搭配。' }, { so: 'Fang was ~~too~~ ++so++ hurt that she couldn’t say a word.' }),
    S('c', '点出写错的地方', 'Fang |found |the |key |until |June |27.', [1], C('fix', '换成哪个？', [
      ['*didn’t find', '对：直到 27 号才找到——否定 + until。'],
      ['finds', '时态不对，意思也还是错的。'],
      ['was finding', 'find 是一下子的事，不说“一直在找到”；要说一直在找，是 looked for … until。'],
    ]), { 4: 'until 没错；问题在前面的动词：“直到……才”，要用否定。' }, { 'didn’t find': 'Fang ~~found~~ ++didn’t find++ the key until June 27.' }),
    S('d', '点出写错的地方', 'By |the |time |Fang |got |there, |Yu’s |family |has |already |moved.', [8], C('fix', '换成哪个？', [
      ['*had', '对：搬家比“Fang 到”更早，用 had moved。'],
      ['have', 'family 后面不用 have；而且这里要的是过去完成时 had。'],
      ['was', 'was moved 是被动“被搬走”，家不是被别人搬走的。'],
    ]), { 4: 'got 没问题：Fang 赶到是后发生的那件，用一般过去时。' }, { had: 'By the time Fang got there, Yu’s family ~~has~~ ++had++ already moved.' }),
  ),
];
