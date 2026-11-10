// 英文故事二 The Time Capsule · Chapter 4 Thirty Years Later（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）。规划见 第六堂课/英文故事二_时间胶囊.md
// 星期五找到 Fang，深夜等来 Yu 的邮件；星期六校庆上两人重逢，三十年没响的八音盒又响了；最后埋下给 2056 年的新胶囊。
// 这一章第一次讲：if + 一般现在时, will …（真实条件）、as soon as、hope / wish、转述别人的话（said / told … that，时态往前推一步）、-ed / -ing 形容词。
// 回扣：现在完成时（I’ve waited thirty years）、过去完成时（had kept）、定语从句（the one who…）、被动（will be buried）、used to。
import { C, Mt, Od, S, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, FragSub, Item, Play, TeachSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string, string[]?][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why, alt]) => ({ t, a, why, ...(alt ? { alt } : {}) })) });
const T = (key: string, q: string, t: string, ex?: string[], art?: Art): TeachSub => ({ kind: 'teach', key, q, t, ...(ex ? { ex } : {}), ...(art ? { art } : {}) });
/** 拼句：[句子（* 是对的）, 第几层, 对的写事件 ev / 错的写为什么, { seq（事情的先后，一样的可以互换）, after（评价放在哪件事后面）}] */
const frag = (q: string, rows: [string, 1 | 2 | 3, string?, { seq?: number; after?: string }?][], events: Record<string, string>, need: FragSub['need'], model: string): FragSub => ({
  kind: 'frag', key: 'a', q, events, need, model,
  frags: rows.map(([t, layer, x, o]) => t.startsWith('*') ? { t: t.slice(1), layer, ok: true, ...(x ? { ev: x } : {}), ...(o ?? {}) } : { t, layer, ok: false, why: x }),
});
const viz = (k: string, p: Record<string, unknown> = {}) => ({ k, p });

export const PLAY_EC4: Play = {
  id: 'ec4', lang: 'en', no: 4, title: 'Chapter 4　Thirty Years Later', sub: '三十年后', color: '#A8455A',
  endAsk: ['If I can get a ticket, I will come. 为什么 if 后面不用 will？', 'hope 和 wish 怎么分？', '转述别人的话，时态为什么要往前推一步？'],
  gloss: {
    'hold your breath': { d: '屏住呼吸（紧张、盼着结果的时候）', more: { t: 'breath /breθ/ 是名词“呼吸、一口气”；动词“呼吸”是 breathe /briːð/，多一个 e，读音也变了。', q: '“Take a deep breath.” 是——', opts: [['深深吸一口气', true], ['屏住呼吸', false]] } },
    Dr: { d: 'Doctor 的缩写：医生、博士的称呼，后面跟姓——Dr Lin（林医生）。英式写法不加点，美式写 Dr.' },
    'can’t believe': { d: '简直不敢相信（又惊又喜，或者又惊又难过）' },
    silence: { d: 'n. 沉默、寂静', py: '/ˈsaɪləns/', more: { t: 'silence 是名词；形容词是 silent（安静的、不出声的）。图书馆的牌子常写 Silence, please.（请保持安静）', q: '“The hall was silent.” 是——', opts: [['礼堂里一点声音也没有', true], ['礼堂里坐满了人', false]] } },
    'with my own eyes': { d: '亲眼（看）。own 加强语气：自己的' },
    'nobody knows where Chen Yu is': { d: '没人知道 Chen Yu 在哪儿。where 引出的这半句用陈述句的语序：主语 Chen Yu 在 is 前面，不说 where is Chen Yu。' },
    posts: { d: 'v. （在网上）发布、贴出（post 加 s）', py: '/pəʊsts/', more: { t: 'post 也是名词“帖子”：a post on the school website（学校网站上的一条帖子）。英国人还说 post a letter（寄一封信）。', q: '“I’ll post the photo tonight.” 是——', opts: [['我今晚把照片发到网上', true], ['我今晚把照片洗出来', false]] } },
    online: { d: 'adv. 在网上' },
    invitation: { d: 'n. 邀请；请柬、邀请函', py: '/ˌɪnvɪˈteɪʃn/' },
    ceremony: { d: 'n. 典礼、仪式', py: '/ˈserəməni/', more: { t: 'opening ceremony（开幕式）、graduation ceremony（毕业典礼）、wedding ceremony（婚礼）。', q: '“the opening ceremony of the Olympic Games” 是——', opts: [['奥运会开幕式', true], ['奥运会闭幕式', false]] } },
    '60th birthday': { d: '六十岁生日。60th 读 sixtieth（第六十）。学校 1966 年建校，今年是六十周年校庆。' },
    'If I can get a train ticket': { d: '要是我能买到火车票。if 引出“条件”；这半句说的是将来的事，却用一般现在时（can get），不用 will。' },
    'misses the train': { d: '没赶上火车（miss：错过）' },
    'front row': { d: '第一排' },
    'I hope': { d: '我希望、但愿——觉得这件事有可能实现' },
    wish: { d: 'v. 希望、但愿——多半实现不了的事。后面的动词往过去推一步：I wish I could…（can → could）' },
    'what if': { d: '万一……怎么办？要是……呢？（担心一种不好的可能）' },
    'with a little grey in her hair': { d: '头发里夹着几丝白发（grey：灰白；英式拼法，美式写 gray）' },
    'As soon as': { d: '一……就……：前一件事刚发生，后一件事马上跟着发生' },
    'Is it really you': { d: '真的是你吗？（不敢相信眼前的人）' },
    'I’ve waited thirty years': { d: '我等了三十年（从那时一直等到现在）：have + 过去分词，说从过去持续到现在的事。' },
    'the one who should say sorry': { d: '该说对不起的那个人。the one：那个人；who 引出一句话，说明是哪个人。' },
    hand: { d: 'v. 递给、交给（hand + 人 + 东西）', py: '/hænd/', more: { t: 'hand 作名词是“手”，作动词是“递”。hand in 是“交上去”：Please hand in your homework.', q: '“Could you hand me that book?” 是——', opts: [['能把那本书递给我吗？', true], ['能用手指一下那本书吗？', false]] } },
    brass: { d: 'n. 黄铜', py: '/brɑːs/' },
    'winds it up': { d: '给它上发条（拧几圈，让八音盒、钟表能走）', py: '/waɪndz/', more: { t: 'wind 读 /waɪnd/ 时是动词“拧、绕”：wind up a clock（给钟上弦）；读 /wɪnd/ 时是名词“风”：a cold wind。拼法一样，读音、意思都不一样。', q: '“The wind is very strong today.” 里的 wind 读——', opts: [['/wɪnd/，是“风”', true], ['/waɪnd/，是“上发条”', false]] } },
    'For the first time in thirty years': { d: '三十年来第一次' },
    'goes quiet': { d: '安静下来。go + 形容词：变得……（go quiet、go red、go white）' },
    claps: { d: 'v. 鼓掌、拍手', py: '/klæps/' },
    'tears in their eyes': { d: '眼里含着泪（tear 读 /tɪə/：眼泪）', more: { t: 'tear 读 /teə/ 时是动词“撕”：Don’t tear the letter!（别把信撕了！）', q: '“She had tears in her eyes.” 里的 tears 是——', opts: [['眼泪', true], ['撕开的口子', false]] } },
    'who always has a joke': { d: '总有笑话可讲的（who 引出一句话，说明是一个什么样的 Tao）' },
    deeply: { d: 'adv. 深深地（deep + -ly）' },
    touched: { d: 'adj. 被感动的、心里被触动的（说人的感受）', py: '/tʌtʃt/' },
    'kept two secrets': { d: '藏住了两个秘密（keep a secret：保守秘密）' },
    'will be buried': { d: '将被埋下：will be + 过去分词，说将来会被（人）做的事。' },
    ginkgo: { d: 'n. 银杏（树）', py: '/ˈɡɪŋkəʊ/' },
    'laugh at': { d: '笑话、嘲笑（某人、某事）', more: { t: 'laugh 是笑出声；smile 是微笑。laugh at sb 常常是“笑话某人”，不是“对着某人笑”——对着人笑是 smile at sb。', q: '“Don’t laugh at him!” 是——', opts: [['别笑话他！', true], ['别对他笑！', false]] } },
    predictions: { d: 'n. 预测（predict 预测 + -ion → 名词）', py: '/prɪˈdɪkʃnz/' },
    'side by side': { d: '肩并肩、并排' },
    'just as they used to': { d: '就像她们从前常常那样。used to + 动词原形：以前常常……（后来不这样了）；这里后面省掉了 walk。' },
    reporter: { d: 'n. 记者（report 报道 + -er）', py: '/rɪˈpɔːtə/' },
    'that she had kept the music box': { d: '她（那时）已经保存这只八音盒……了。报纸转述 Yu 说过的话，时态往前推一步：have kept → had kept。' },
    'that they would never lose touch again': { d: '她们再也不会断了联系。转述 Fang 说过的话：will → would。lose touch：失去联系。' },
    'music box': { d: '八音盒：上了发条就会响的小盒子' },
  },
  lines: [
    { shots: [['tc4.office']], t: '**Friday afternoon.** In Mrs Hu’s office, you and Tao ⟦hold your breath⟧. She is calling Dr Lin Fang.', read: 'Friday afternoon. In Mrs Hu’s office, you and Tao hold your breath. She is calling Doctor Lin Fang.', tr: '星期五下午。胡老师的办公室里，你和 Tao {屏住了呼吸}。她正在给{Lin Fang 医生}打电话。', trHard: 'words', voice: 'en', ask: '英语里怎么称呼医生？' },
    { shots: [['tc4.fangPhone']], who: 'Fang', voice: 'fang2', t: 'My letter? And the key? I ⟦can’t believe⟧ they’re still there.', tr: '我的信？还有那把钥匙？我{真不敢相信}，它们还在那儿。', trHard: 'words' },
    { shots: [['tc4.huPhone']], who: 'Mrs Hu', voice: 'hu', t: 'There’s something else, Dr Lin. In the same box, there’s another letter — from Chen Yu.', read: 'There’s something else, Doctor Lin. In the same box, there’s another letter, from Chen Yu.', tr: '{还有一件事}，林医生。在同一个盒子里，还有一封信——是 Chen Yu 写的。', trHard: 'frame' },
    { shots: [['tc4.silence']], t: 'There is a long ⟦silence⟧ on the phone.', tr: '电话那头，{好长一阵没有声音}。', trHard: 'words', voice: 'en' },
    { shots: [['tc4.fangCU']], who: 'Fang', voice: 'fang2', t: 'I’ll come tomorrow. I want to read her letter ⟦with my own eyes⟧.', tr: '我明天就来。我想{亲眼}读一读她的信。', trHard: 'words' },
    { shots: [['tc4.post']], id: 'invite', t: 'But nobody knows where Chen Yu is. That evening, the school ⟦posts⟧ the story ⟦online⟧, with an ⟦invitation⟧ to its 60th birthday ⟦ceremony⟧.', read: 'But nobody knows where Chen Yu is. That evening, the school posts the story online, with an invitation to its sixtieth birthday ceremony.', tr: '可是{谁也不知道 Chen Yu 在哪儿}。那天晚上，学校把这个故事{发到了网上}，还附上一份{!邀请}，请她来参加六十周年{校庆典礼}。', trHard: 'words', voice: 'en', task: ['c4-invite'], ask: 'invite 和 invitation 有什么不一样？' },
    { shots: [['tc4.yuNight', 1], ['tc4.email', 1]], id: 'if', who: 'Yu', voice: 'yu2', t: '**An email, 11:04 p.m.:** My name is Chen Yu. I’m a music teacher in Shanghai. If I can get a train ticket, I will come tomorrow.', read: 'My name is Chen Yu. I’m a music teacher in Shanghai. If I can get a train ticket, I will come tomorrow.', tr: '（晚上十一点零四分，一封邮件）我叫 Chen Yu，是上海的一名音乐老师。{!要是能买到火车票，我明天就来}。', trHard: 'frame', task: ['c4-if'], ask: 'if 后面为什么不用 will？' },
    { shots: [['tc4.taoWorry']], id: 'wont', who: 'Tao', voice: 'tao', t: 'Tomorrow? The ceremony starts at ten! If she ⟦misses the train⟧, she won’t see Fang!', tr: '明天？典礼十点就开始了！要是她{没赶上}火车，就{见不到} Fang 了！', trHard: 'frame', task: ['c4-wont'] },
    { shots: [['tc4.hall', 1.2], ['tc4.frontRow', 0.8]], t: '**Saturday, 10 a.m.** The ⟦60th birthday⟧ ⟦ceremony⟧ begins. Fang sits in the ⟦front row⟧. She doesn’t know that Yu is coming.', read: 'Saturday, 10 a.m. The sixtieth birthday ceremony begins. Fang sits in the front row. She doesn’t know that Yu is coming.', tr: '星期六上午十点。{六十周年校庆典礼}开始了。Fang 坐在{第一排}。她不知道 Yu 要来。', trHard: 'words', voice: 'en' },
    { shots: [['tc4.taoWhisper']], who: 'Tao', voice: 'tao', t: '(whispering) It’s 10:20 already. ⟦I hope⟧ Yu’s train isn’t late.', read: 'It’s ten twenty already. I hope Yu’s train isn’t late.', tr: '（小声）已经十点二十了。{但愿} Yu 的火车{别晚点}。', trHard: 'words' },
    { shots: [['tc4.youLook']], id: 'wish', t: 'You look at Fang. You ⟦wish⟧ you could tell her now. But ⟦what if⟧ Yu doesn’t come?', tr: '你看着 Fang，{!真想现在就告诉她}。可是，{万一} Yu 来不了呢？', trHard: 'frame', voice: 'en', task: ['c4-hope'], ask: 'hope 和 wish 有什么不一样？' },
    { shots: [['tc4.door', 1.2]], t: '**10:40 a.m.** The back door opens. A woman ⟦with a little grey in her hair⟧ walks in. She is holding an old ⟦music box⟧.', read: 'Ten forty. The back door opens. A woman with a little grey in her hair walks in. She is holding an old music box.', tr: '十点四十。后门开了。一位{头发里有几丝白发}的女士走了进来，手里捧着一只旧{八音盒}。', trHard: 'words', voice: 'en' },
    { shots: [['tc4.standUp']], id: 'soon', t: '⟦As soon as⟧ Fang sees her, she stands up.', tr: '{!Fang 一看见她，马上就站了起来}。', trHard: 'frame', voice: 'en', task: ['c4-soon'], ask: 'as soon as 和 when 有什么不一样？' },
    { shots: [['tc4.meet']], who: 'Fang', voice: 'fang2', t: 'Yu? … ⟦Is it really you⟧?', read: 'Yu? Is it really you?', tr: 'Yu？……{真的是你吗}？', trHard: 'frame' },
    { shots: [['tc4.yuCU']], id: 'waited', who: 'Yu', voice: 'yu2', t: 'Fang. I’ve waited thirty years to say this: I’m sorry.', read: 'Fang. I’ve waited thirty years to say this. I’m sorry.', tr: 'Fang。这句话，{!我等了三十年}：对不起。', trHard: 'frame', task: ['c4-waited'] },
    { shots: [['tc4.fangSorry']], id: 'one', who: 'Fang', voice: 'fang2', t: 'No, Yu. I’m the one who should say sorry.', tr: '不，Yu。{!该说对不起的，是我}。', trHard: 'frame', task: ['c4-one'], ask: 'the one who 是什么意思？' },
    { shots: [['tc4.giveKey']], t: 'You walk up to them and ⟦hand⟧ Fang the little ⟦brass⟧ key.', tr: '你走上前，把那把小小的{黄铜}钥匙{递给} Fang。', trHard: 'words', voice: 'en' },
    { shots: [['tc4.wind', 1.2]], t: 'Fang puts the key into the music box and ⟦winds it up⟧ — once, twice, three times.', read: 'Fang puts the key into the music box and winds it up. Once, twice, three times.', tr: 'Fang 把钥匙插进八音盒，{拧紧发条}——一圈，两圈，三圈。', trHard: 'words', voice: 'en', ask: 'wind 有几种读法？' },
    { shots: [['tc4.dancer', 1.4]], t: '⟦For the first time in thirty years⟧, the music plays, and the little dancer begins to turn.', tr: '{三十年来第一次}，音乐响了，盒子上的小舞者{转了起来}。', trHard: 'words', voice: 'en' },
    { shots: [['tc4.claps', 1.2]], t: 'The hall ⟦goes quiet⟧. Then everyone ⟦claps⟧. Many people have ⟦tears in their eyes⟧.', tr: '礼堂里{一下子安静了}。接着，大家都{鼓起掌来}。很多人{眼里含着泪}。', trHard: 'words', voice: 'en' },
    { side: ['c4-x-ed'], shots: [['tc4.touched']], id: 'touched', t: 'Even Tao, ⟦who always has a joke⟧, says nothing. Everyone is ⟦deeply⟧ ⟦touched⟧.', tr: '连{平时总有笑话讲}的 Tao 也没说话。大家都{!被深深地打动了}。', trHard: 'words', voice: 'en', task: ['c4-touched'], ask: 'touched 和 touching 怎么分？' },
    { shots: [['tc4.huStage']], who: 'Mrs Hu', voice: 'hu', t: 'Thirty years ago, a time capsule ⟦kept two secrets⟧. Let’s make a new one — for the students of 2056!', read: 'Thirty years ago, a time capsule kept two secrets. Let’s make a new one, for the students of twenty fifty-six!', tr: '三十年前，一个时间胶囊{藏住了两个秘密}。我们也做一个新的吧——{给 2056 年的同学}！', trHard: 'words' },
    { shots: [['tc4.newBox', 1.2]], t: 'Everyone writes a letter to the future. The new capsule ⟦will be buried⟧ under the old ⟦ginkgo⟧ tree.', tr: '每个人都给未来写了一封信。新的胶囊{将被埋}在老{银杏}树下。', trHard: 'words', voice: 'en' },
    { side: ['c4-x-spot'], shots: [['tc4.taoLetter']], who: 'Tao', voice: 'tao', t: 'If people read my letter in 2056, they’ll ⟦laugh at⟧ my ⟦predictions⟧!', read: 'If people read my letter in twenty fifty-six, they’ll laugh at my predictions!', tr: '要是 2056 年的人读到我的信，{准会笑话}我的{预测}！', trHard: 'words', ask: 'laugh at 和 smile at 有什么不一样？' },
    { shots: [['tc4.write']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '轮到你了：给 2056 年的同学写一句话。可以用 will 预测那时候的世界，也可以用 have done 说说你到现在做过的一件事。', read: '轮到你了，给二零五六年的同学写一句话。可以用 will 预测那时候的世界，也可以用 have done 说说你到现在做过的一件事。', task: ['c4-write'] },
    { shots: [['tc4.walk', 1.4]], t: 'That afternoon, Fang and Yu walk under the old ginkgo tree, ⟦side by side⟧, ⟦just as they used to⟧.', tr: '那天下午，Fang 和 Yu 在老银杏树下走着，{肩并着肩}，{就像从前那样}。', trHard: 'words', voice: 'en', ask: 'used to 是什么意思？' },
    { shots: [['tc4.paper', 1.2]], id: 'paper', t: 'The next day, the story is in the newspaper: “Chen Yu told our ⟦reporter⟧ that she had kept the music box for thirty years.”', read: 'The next day, the story is in the newspaper. Chen Yu told our reporter that she had kept the music box for thirty years.', tr: '第二天，这个故事上了报纸：“Chen Yu 告诉本报{记者}，{!这只八音盒她保存了三十年}。”', trHard: 'frame', voice: 'en' },
    { shots: [['tc4.paper2']], id: 'said', t: '“Dr Lin said that they would never lose touch again.”', read: 'Doctor Lin said that they would never lose touch again.', tr: '“林医生说，{!她们再也不会断了联系}。”', trHard: 'frame', voice: 'en', task: ['c4-said'], ask: '转述别人的话，时态为什么要往前推？' },
    { shots: [['tc4.timeline']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '这个故事是从 2026 年挖出盒子讲起的，1996 年的事是一点一点倒着讲出来的。现在把整件事按真正发生的先后，从 1996 年排到今天。', read: '这个故事是从二零二六年挖出盒子讲起的，一九九六年的事是一点一点倒着讲出来的。现在把整件事按真正发生的先后，从一九九六年排到今天。', task: ['c4-order'] },
    { shots: [['tc4.end', 1.6]], id: 'end', who: 'AI 眼镜', voice: 'ai', t: '故事讲完了。两封道歉信隔着一层衬布，在同一个盒子里放了三十年。这个故事里，有过去、现在和将来；可最难说出口的，常常只是一句 I’m sorry。想说的时候，就早一点说吧。', read: '故事讲完了。两封道歉信隔着一层衬布，在同一个盒子里放了三十年。这个故事里，有过去、现在和将来；可最难说出口的，常常只是一句 I’m sorry。想说的时候，就早一点说吧。', ask: '这个故事里，你最喜欢哪一句英语？为什么？', task: ['c4-review'] },
  ],
};

// ---------------- 拓展：讲一小段、问一句，一步一步往下走 ----------------
const EXT_INVITE: Ext[] = [
  { id: 'x1', title: 'invite → invitation：动词变名词', need: 'always', steps: [
    T('t1', '', '**invite** 是动词“邀请”，**invitation** 是名词“邀请；请柬”。英语里好些动词加上 **-ion / -tion / -ation**，就成了名词：', ['predict（预测）→ prediction', 'invite（邀请）→ invitation', 'celebrate（庆祝）→ celebration', 'decide（决定）→ decision（d 变成 s）']),
    C('a', '“The school sent Chen Yu an ___.” 空里填——', [
      ['*invitation', '对：an 后面要一个名词，“一份邀请”。'],
      ['invite', 'invite 是动词“邀请”，不能跟在 an 后面当“一份……”。'],
    ], { keep: true }),
    fill('b', '放进句子，有的词用不上。', ['invited', 'invitation', 'predictions', 'decision', 'invite', 'predict'], [
      ['The school ___ Chen Yu to the ceremony last night.', 'invited', '线索：the school 后面缺一个动作，又是 last night——过去的动作：invited。invitation 是名词，不能当动作用。'],
      ['Did you get an ___ to Tao’s party?', 'invitation', '线索：get an ___——前面有 an，要名词：invitation。invite 是动词，不说 get an invite（口语里偶尔有人这么说，考试按 invitation）。'],
      ['Tao made three funny ___ about 2056.', 'predictions', '线索：three funny ___——三个，要复数名词：predictions。predict 是动词，前面不能加 three funny。'],
      ['Coming back after thirty years was a big ___ for Yu.', 'decision', '线索：a big ___——要名词“决定”：decide → decision。'],
    ]),
    T('t2', '', '收到邀请，怎么回答？答应：**I’d love to.**（我很乐意。）推辞：**I’d love to, but I’m afraid I can’t.**（我很想去，可恐怕去不了。）先表示感谢、再说去不了，听起来就不生硬。'),
    C('c', '胡老师在电话里问 Fang：“Would you like to come to our 60th birthday ceremony?” Fang 想来，最得体的回答是——', [
      ['*I’d love to. Thank you for inviting me.', '对：先答应，再谢谢对方的邀请。'],
      ['Yes, I like.', 'like 后面要跟东西；回答邀请说 I’d love to。'],
      ['No, I wouldn’t.', '这是拒绝，而且很生硬。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '请人来：invite sb to …', need: 'opt', steps: [
    T('t1', '', 'invite 后面怎么接：**invite + 人 + to + 活动、地方**（invite Yu to the ceremony）；**invite + 人 + to do**（invite Yu to sing a song）。'),
    C('a', '“学校请 Yu 在典礼上弹一首曲子。”', [
      ['*The school invited Yu **to play** a piece of music at the ceremony.', '对：invite sb to do。'],
      ['The school invited Yu **playing** a piece of music.', 'invite 后面接 to do，不接 -ing。'],
    ], { keep: true }),
    C('b', '“他们请周老师来参加典礼。”', [
      ['*They invited Mr Zhou **to** the ceremony.', '对：invite sb to + 活动。'],
      ['They invited Mr Zhou **for** the ceremony.', '请人来参加活动，用 to。'],
    ], { keep: true }),
  ] },
];

const EXT_IF: Ext[] = [
  { id: 'x1', title: '要是……就……：if 半句用现在时', need: 'always', steps: [
    T('t0', '', '先看 Yu 那天晚上面前的两条路：', undefined, viz('clip', { shots: [['tc4.clipIf', 1]], dur: 11, cap: [[0, 'Friday night. Will Yu come? It depends on the ticket…'], [0.3, 'If Yu **gets** a ticket, she **will come** tomorrow.'], [0.65, 'If she **doesn’t get** one, she **won’t come**.']], marks: [[0.05, '今晚'], [0.32, '买到票'], [0.67, '没买到']] })),
    C('t0a', '这两句说的都是还没发生的事。可 if 后面那半句，用的是——', [
      ['*一般现在时（gets / doesn’t get），后面那半句才用 will', '对：if 半句说条件，用一般现在时；另外半句说结果，用 will。'],
      ['两半句都用 will', '不说 If Yu will get a ticket。'],
      ['两半句都用过去时', '说的是明天的事，不是过去的事。'],
    ], { keep: true }),
    T('t1', '', '规则：**If + 一般现在时, … will + 动词原形**。if 半句是“条件”，另一半是“结果”。“如果”本身已经带着“将来”的意思，条件那半句就不再说 will——中文也一样：“要是明天下雨，我们就不去了”，“下雨”前面不说“将要”。', ['If it **rains** tomorrow, we **will stay** at home.', 'If you **hurry**, you **will catch** the train.', 'If I **can get** a ticket, I **will come**.（if 半句里可以有 can）']),
    C('a', '“If it ___ on Saturday, the ceremony will be in the hall.”', [
      ['*rains', '对：if 半句用一般现在时，主语 it，加 s。'],
      ['will rain', 'if 半句不用 will。'],
      ['rained', '说的是星期六的事，不是过去。'],
    ], { keep: true }),
    C('b', '“If Yu ___ by half past ten, she ___ Fang in the hall.”', [
      ['*arrives … will see', '对：条件用一般现在时，结果用 will。'],
      ['will arrive … sees', '正好反了：will 该在结果那半句。'],
      ['arrived … will see', 'arrived 是过去时，可这是明天的事。'],
    ], { keep: true }),
    T('t2', '', '两半句可以换位置：**I will come tomorrow if I can get a ticket.** if 半句放在前面，中间加逗号；放在后面，就不用逗号。不管放哪儿，will 都只在结果那半句里。'),
    Wr('c', '用 If … , I will … 写一句：这个周末要是怎么样，你就会做什么？', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence about their own coming weekend, using a first conditional: If + present simple, … will + verb (e.g. “If it is sunny on Sunday, I will go hiking with my dad.”).',
      criteria: ['the if-clause uses the present simple (no “will” in the if-clause)', 'the main clause uses will / won’t + base verb', 'a real, sensible plan for the weekend; correct spelling and word order'],
      examples: ['If it is sunny on Sunday, I will go hiking with my dad.', 'If I finish my homework early, I will watch a film.', 'If my cousin comes, we will play basketball together.'],
      words: ['If it is sunny', 'I will', 'go …'], frame: 'If ______ this weekend, I will ______.', ph: 'If …',
    }),
  ] },
  { id: 'x2', title: '提醒和警告，也常用 if', need: 'opt', steps: [
    T('t1', '', '提醒别人“要是这样，就会那样”，英语最常用的就是 if 句：If you don’t hurry, you’ll miss the train.'),
    Mt('a', '前半句和后半句连起来。', ['If you leave now,', 'If you don’t water the tree,', 'If you shout in the library,', 'If we open the capsule too early,'], ['its leaves will turn yellow.', 'there will be no surprise in 2056.', 'you’ll catch the 8:30 train.', 'Mr Gao will ask you to be quiet.'], [2, 0, 3, 1], '前半句是条件（一般现在时），后半句是结果（will）。', { lh: '条件', rh: '结果', whys: [
      '现在就走——赶得上八点半那班车。',
      '不浇水——树叶会发黄。',
      '在图书馆大声嚷——高老师会让你安静。',
      '胶囊提前打开——到了 2056 年就没有惊喜了。',
    ] }),
  ] },
];

const EXT_WONT: Ext[] = [
  { id: 'x1', title: '两种 if：“如果”和“是否”', need: 'always', steps: [
    T('t1', '', 'if 有两个意思。一个是**如果**（条件）：If she comes, Fang will be so happy.——这个 if 半句不用 will。另一个是**是否、会不会**：I don’t know if she will come.（我不知道她会不会来）——这个 if 等于 whether，说的是将来，就用 will。周老师说过一句：Last year she asked me **if** I knew where Yu was.——这个 if 也是“是否”。'),
    C('a', '星期五晚上，Tao 盯着手机：“I don’t know if she ___ tomorrow.”（我不知道她明天会不会来）', [
      ['*will come', '对：这个 if 是“是否”，说的是明天，用 will。'],
      ['comes', '“是否”的 if 不受“if 半句不用 will”的限制：说将来，就用 will。'],
    ], { keep: true }),
    C('b', '“If she ___ tomorrow, I’ll give her the key myself.”（要是她明天来了，我亲手把钥匙给她）', [
      ['*comes', '对：这个 if 是“如果”，条件那半句用一般现在时。'],
      ['will come', '“如果”的 if 半句不用 will。'],
    ], { keep: true }),
    So('c', '这些句子里的 if，是“如果”，还是“是否”？', ['如果（条件）', '是否'], [
      ['**If** the train is late, she will miss the ceremony.', 0, '火车要是晚点——条件，后面跟着结果。'],
      ['**If** you find her, please give her the key.', 0, 'Fang 信里的话：要是你找到了她——条件。'],
      ['**If** it rains, the ceremony will be in the hall.', 0, '要是下雨——条件。'],
      ['Do you know **if** Yu is coming?', 1, '你知不知道 Yu 来不来——问“是不是”。'],
      ['Fang asked me **if** I knew where Yu was.', 1, '问我知不知道——“是否”。'],
      ['I wonder **if** the music box still works.', 1, '不知道八音盒还能不能响——“是否”。'],
    ]),
    C('d', '怎么一眼分出来？“是否”的 if，可以换成——', [
      ['*whether', '对：能换成 whether 的，就是“是否”。“如果”的 if 换成 whether，句子就不通了。'],
      ['when', 'when 是“……的时候”，和 if 的两个意思都不一样。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: 'unless：除非', need: 'opt', steps: [
    T('t1', '', '**unless** = if … not（除非；要是不……）。和 if 一样，unless 半句说将来也用一般现在时。', ['Yu won’t come **unless** she gets a ticket.', '= Yu won’t come **if** she **doesn’t** get a ticket.']),
    C('a', '“Unless she hurries, she will miss the train.” 意思是——', [
      ['*她要是不快点，就会误了火车', '对：unless = if … not。'],
      ['她要是快点，就会误了火车', '正好反了。'],
    ], { keep: true }),
    C('b', '“Tao won’t stop talking ___ you give him a mooncake.”', [
      ['*unless', '对：除非你给他一块月饼，不然他不会停。'],
      ['if', '“要是你给他月饼，他就不停地说”——意思不通。'],
    ], { keep: true }),
  ] },
];

const EXT_HOPE: Ext[] = [
  { id: 'x1', title: 'hope 和 wish：有可能，还是做不到', need: 'always', steps: [
    T('t0', '', '先看礼堂里的这两个人：', undefined, viz('clip', { shots: [['tc4.clipHope', 1]], dur: 11, cap: [[0, 'The train is on its way. Tao: “I **hope** it isn’t late.”（有可能准点）'], [0.5, 'You can’t tell Fang yet. “I **wish** I **could** tell her now.”（现在做不到）']], marks: [[0.05, 'hope'], [0.52, 'wish']] })),
    C('t0a', '画面里第二句：I wish I could tell her now. 说的明明是“现在”，为什么用 could，不用 can？', [
      ['*wish 说的是现在做不到的事，后面的动词要往过去推一步：can → could', '对：往过去推一步，表示“和现在的事实相反”——其实现在说不了。'],
      ['could 是 can 的过去式，说的是过去的事', '这里说的是 now（现在）。could 在这里不表示过去，表示“做不到、和事实相反”。'],
    ], { keep: true }),
    T('t1', '', '**hope**：希望——觉得**有可能**实现。后面常用一般现在时或 will：I hope you’re well. I hope she will come.\n**wish**：但愿——**不太可能、和现在相反**的事。后面的动词往过去推一步：can → could，have → had，am / is → was / were。', ['I wish I **could** fly.（我飞不了）', 'I wish I **had** more time.（时间不够）', 'I wish I **were / was** taller.（我不够高）']),
    C('a', '明天你的好朋友要比赛。你对他说——', [
      ['*I **hope** you win!', '对：赢是有可能的，用 hope。'],
      ['I **wish** you win!', 'wish 后面跟一句话，说的是做不到的事——这么说像是你觉得他赢不了。'],
    ], { keep: true }),
    C('b', '你只有十四岁，可是很想现在就能开车。', [
      ['*I wish I **could** drive.', '对：现在做不到，wish + could。'],
      ['I wish I **can** drive.', 'wish 后面要往过去推一步：can → could。'],
      ['I hope I **could** drive.', '现在根本做不到，用 wish；hope 后面也不这样用 could。'],
    ], { keep: true }),
    T('t2', '', 'wish 还有一个常用法：**wish + 人 + 名词**，是“祝”：We wish you a happy birthday!（祝你生日快乐）这里没有“做不到”的意思。'),
    fill('c', '放进句子，有的词用不上。', ['hope', 'wish', 'could', 'can'], [
      ['I ___ you will like my letter, students of 2056!', 'hope', '线索：you will like——将来有可能的事：hope。'],
      ['I ___ I could see the world of 2056 right now.', 'wish', '线索：I could see … right now——现在做不到：wish。'],
      ['Yu plays the piano so well. I wish I ___ play like her.', 'could', '线索：I wish I ___——wish 后面往过去推一步：could。can 不行：wish 后面不用 can。'],
      ['We ___ the school a happy 60th birthday!', 'wish', '线索：the school a happy 60th birthday——wish + 对象 + 祝福：祝。hope 后面不能这样直接跟“人 + 祝福”。'],
    ]),
    Wr('d', '写一句 I wish I could …：一件你现在做不到、却很想做的事。', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence about something they cannot do now but would really like to do, using “I wish I could …” (or I wish I had / were …).',
      criteria: ['uses wish correctly with a past form (could / had / were / was), not “I wish I can”', 'the wish is clearly something not possible or not true now', 'correct spelling; a complete sentence'],
      examples: ['I wish I could speak five languages.', 'I wish I could go back to my first day at this school.', 'I wish I had more time to read.'],
      words: ['I wish', 'I could', '…'], frame: 'I wish I could ______.', ph: 'I wish …',
    }),
  ] },
  { id: 'x2', title: 'wish 当名词：愿望、祝福', need: 'opt', steps: [
    T('t1', '', 'wish 也是名词：**make a wish**（许个愿），**Best wishes**（信末的“祝好”），**birthday wishes**（生日祝福）。'),
    C('a', '吹生日蜡烛前，大家喊：“Make a wish!” 是——', [
      ['*许个愿吧！', '对：make a wish，许愿。'],
      ['做一个蛋糕吧！', 'wish 是愿望。'],
    ], { keep: true }),
    C('b', '给 2056 年的信，结尾写——', [
      ['*Best wishes, Tao', '对：Best wishes——祝好，信末常用。'],
      ['Best wish, Tao', '固定说法是复数 wishes。'],
    ], { keep: true }),
  ] },
];

const EXT_SOON: Ext[] = [
  { id: 'x1', title: 'as soon as：一……就……', need: 'always', steps: [
    T('t0', '', '看 Fang 的这一下：', undefined, viz('clip', { shots: [['tc4.clipSoon', 1]], dur: 9, cap: [[0, 'The back door opens…'], [0.38, 'Fang **sees** her —'], [0.5, '— and right away she **stands up**.'], [0.72, '**As soon as** Fang sees her, she stands up.']], marks: [[0.4, 'sees'], [0.52, 'stands up']] })),
    C('t0a', '从“看见”到“站起来”，中间隔了多久？', [
      ['*几乎没有：一看见就站起来了', '对：as soon as，一……就……'],
      ['好一会儿：她先想了想', '那就不用 as soon as 了：After a while, she stood up.'],
    ], { keep: true }),
    T('t1', '', '**as soon as** 连起两件事：前一件刚发生，后一件马上跟着来。和 when 比：when 只说“在……的时候”，as soon as 强调“马上”。', ['When Fang saw her, she stood up.（看见她的时候，站了起来）', 'As soon as Fang saw her, she stood up.（一看见她，马上就站了起来）']),
    C('a', '哪一句更能看出 Tao 有多着急？', [
      ['*As soon as the email arrived, Tao called Mrs Hu.', '对：邮件一到，马上打电话。'],
      ['When the email arrived, Tao called Mrs Hu.', '这句没错，只是看不出“马上”。'],
    ], { keep: true }),
    T('t2', '', '说将来的事时，as soon as 和 if 一样：as soon as 那半句用**一般现在时**，另一半用 will。', ['I’ll call you **as soon as** I **get** to the station.']),
    C('b', 'Yu 在火车上发消息：“I’ll text you as soon as the train ___ in.”', [
      ['*gets', '对：as soon as 半句说将来，用一般现在时。'],
      ['will get', 'as soon as 半句和 if 半句一样，不用 will。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['as soon as', 'If', 'until', 'arrives', 'will arrive', 'when'], [
      ['I’ll call you ___ I get to the station.', 'as soon as', '线索：一到车站就打——as soon as。when 也说得通，只是少了“一……就……”那个“马上”的意思。', ['when']],
      ['___ it rains, we will have the party in the hall.', 'If', '线索：要是下雨——条件：If。'],
      ['Please wait here ___ the bell rings.', 'until', '线索：wait here——一直等到铃响：until。'],
      ['Tao will tell everyone as soon as Yu ___.', 'arrives', '线索：as soon as 半句说将来，用一般现在时，Yu 是第三人称单数：arrives。will arrive 不行：as soon as 半句不用 will。'],
    ]),
  ] },
];

const EXT_WAITED: Ext[] = [
  { id: 'x1', title: '从 1996 年一直到现在', need: 'always', steps: [
    T('t1', '', '回扣一下：**I’ve waited thirty years** = I have waited for thirty years——从 1996 年一直等到现在。现在完成时（have / has + 过去分词）常和 **for + 一段时间**、**since + 起点**一起用。胡老师在银杏树下就说过：It has been under this tree for thirty years!'),
    fill('a', '放进句子，有的词用不上。', ['since', 'for', 'ago', 'has kept', 'kept'], [
      ['Yu has kept the music box ___ 1996.', 'since', '线索：1996 是一个起点——since。'],
      ['Fang has worked at the children’s hospital ___ twenty years.', 'for', '线索：twenty years 是一段时间——for。'],
      ['They lost touch thirty years ___.', 'ago', '线索：lost 是一般过去时，说多久以前——ago。'],
      ['Yu ___ the box all these years.', 'has kept', '线索：all these years——这些年一直到现在：has kept。kept 只说过去，说不出“一直到现在”。'],
    ]),
    C('b', '有人问你：“How long have you known Tao?” 你们三年前认识的。回答——', [
      ['*For three years.', '对：问“多久了”，答一段时间：for。'],
      ['Since three years.', 'since 后面跟起点（since 2023），不跟一段时间。'],
      ['Three years ago.', '这是在答“什么时候认识的”（When did you meet?）。'],
    ], { keep: true }),
  ] },
];

const EXT_ONE: Ext[] = [
  { id: 'x1', title: 'the one who …：……的那个人', need: 'always', steps: [
    T('t1', '', '回扣一下：**who** 引出一句话，说明“是哪个人”：老合影上 **the girl who is holding a music box**（拿着八音盒的那个女孩）。说东西用 **that / which**：the box **that** was buried in 1996。**the one who …** 就是“……的那个人”。'),
    C('a', '“Yu is the girl ___ loves music.”', [
      ['*who', '对：说人，用 who。'],
      ['which', 'which 说东西，Yu 是人。'],
    ], { keep: true }),
    C('b', '“This is the music box ___ Yu kept for thirty years.”', [
      ['*that', '对：说东西，用 that（也可以用 which）。'],
      ['who', 'who 说人，八音盒是东西。'],
    ], { keep: true }),
    C('c', '教室的窗户被足球打碎了。老师问是谁干的，Tao 站起来说——', [
      ['*I’m the one who broke it. I’m sorry.', '对：the one who…——打碎它的那个人就是我。'],
      ['I’m the one which broke it.', '说人用 who，不用 which。'],
      ['I’m the one who break it.', '打碎是过去的事：broke。'],
    ], { keep: true }),
  ] },
];

const EXT_TOUCHED: Ext[] = [
  { id: 'x1', title: '人感到 -ed，事让人 -ing', need: 'always', steps: [
    T('t0', '', '先看礼堂里这一刻：', undefined, viz('clip', { shots: [['tc4.clipTouched', 1]], dur: 10, cap: [[0, 'The music box plays again. It is a **touching** moment.（这件事让人感动）'], [0.5, 'Everyone in the hall is **touched**.（人被感动了）']], marks: [[0.05, '事'], [0.52, '人']] })),
    C('t0a', '“It is a touching moment.” 说的是——', [
      ['*这一刻（这件事）让人感动', '对：-ing 说事情“让人……”。'],
      ['这一刻的人被感动了', '说人的感受用 touched。'],
    ], { keep: true }),
    T('t1', '', '规则：**-ing** 说东西、事情“让人……的”：a touching story，an exciting game，surprising news；**-ed** 说人“感到……的”：I’m touched / excited / surprised。所以 I’m touching 不通，I’m boring 是“我这个人很无趣”。\n**moved / moving** 和 touched / touching 意思差不多：a moving story（感人的故事），I was moved.（我被感动了）'),
    C('a', '典礼结束，Tao 说——', [
      ['*It was so **moving**. I was really **moved**.', '对：典礼让人感动（moving），我被感动了（moved）。'],
      ['It was so **moved**. I was really **moving**.', '正好用反了：事是 moving，人是 moved。'],
    ], { keep: true }),
    fill('b', '放进句子，有的词用不上。', ['touching', 'surprised', 'exciting', 'excited', 'touched', 'surprising'], [
      ['Yu’s letter was so ___ that Mr Zhou took off his glasses.', 'touching', '线索：主语是 letter（东西）——让人感动的：touching。touched 说人。'],
      ['Tao was ___ when Yu walked in.', 'surprised', '线索：主语 Tao 是人——感到吃惊：surprised。surprising 说事情让人吃惊。'],
      ['Opening a thirty-year-old box is really ___!', 'exciting', '线索：主语是“打开盒子这件事”——让人兴奋：exciting。'],
      ['We were all ___ about the new time capsule.', 'excited', '线索：we 是人——感到兴奋：excited about。'],
    ]),
    C('c', '下面哪一句用错了？', [
      ['*The ceremony was very **moved**.', '对，这句错了：典礼是事，让人感动——moving。'],
      ['Everyone was very **moved**.', '这句没错：人被感动了。'],
      ['It was a very **moving** ceremony.', '这句没错：让人感动的典礼。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: 'touch 的几个意思', need: 'opt', steps: [
    T('t1', '', '**touch** 本来是“摸、碰”。由“碰到”引申出去：心被碰了一下——**touched**（感动）；人和人还“碰得着”——**keep in touch**（保持联系）；碰不着了——**lose touch**（失去联系）。'),
    Mt('a', '这些 touch，各是什么意思？', ['Please don’t **touch** the old letters.', 'We **lost touch** with Yu long ago.', 'Let’s **keep in touch**!', 'Everyone was deeply **touched**.'], ['保持联系', '被感动', '摸、碰', '断了联系'], [2, 3, 0, 1], '', { lh: '句子', rh: '意思', whys: [
      '旧信很脆，别用手碰——touch 最本来的意思：摸、碰。',
      'lost touch：周老师说他们早就和 Yu 联系不上了——断了联系。',
      'keep in touch：一直“碰得着”——保持联系。它和 lost touch 正好相反。',
      'touched：心里被触动——被感动。',
    ] }),
    C('b', '要是 Fang 对 Yu 说：“Let’s never lose touch again.” 意思是——', [
      ['*我们再也别断了联系', '对：lose touch，失去联系。'],
      ['我们再也别把东西弄丢了', 'lose touch 是一个整体：失去联系。'],
    ], { keep: true }),
  ] },
];

const EXT_SAID: Ext[] = [
  { id: 'x1', title: '转述别人的话：时态往前推一步', need: 'always', steps: [
    T('t0', '', '先看这句话是怎么从典礼上到了报纸上的：', undefined, viz('clip', { shots: [['tc4.clipSaid', 1]], dur: 11, cap: [[0, 'Saturday. Yu: “I **have kept** this box for thirty years.”'], [0.5, 'Sunday, the newspaper: She told our reporter that she **had kept** the box for thirty years.']], marks: [[0.05, '星期六 说'], [0.52, '星期天 报道']] })),
    C('t0a', '原话里的 I 到了报纸上变成了 she。have kept 变成了——', [
      ['*had kept', '对：往过去推了一步。'],
      ['has kept', '人称换了，时态也要往前推：have kept → had kept。'],
    ], { keep: true }),
    T('t1', '', '规则：**said / told（过去时）+ that + 转述的话**。说话那一刻已经过去了，转述时动词往过去推一步；人称、“我的”“你的”也跟着换。', ['“I **am** a music teacher.” → She said (that) she **was** a music teacher.', '“I **have kept** the box.” → She said she **had kept** the box.', '“We **will** never lose touch.” → She said they **would** never lose touch.', '“I **can’t** believe it.” → She said she **couldn’t** believe it.']),
    C('a', 'Fang 在电话里说：“I can’t believe it’s still there.” 转述：Fang said that she ___ believe it was still there.', [
      ['*couldn’t', '对：can’t → couldn’t。'],
      ['can’t', '说话那一刻已经过去了，要往前推一步。'],
      ['doesn’t', '原话是 can’t，不是 don’t。'],
    ], { keep: true }),
    fill('b', '把这些人说过的话转述出来。有的词用不上。', ['was', 'would', 'had worked', 'could', 'is', 'will'], [
      ['Tao: “I am still waiting for my flying car.” → Tao said that he ___ still waiting for his flying car.', 'was', '线索：said 是过去时，往前推一步：am → was。is 是没推的样子。'],
      ['Mrs Hu: “The capsule will be buried under the tree.” → Mrs Hu said that the capsule ___ be buried under the tree.', 'would', '线索：will → would。will 是没推的样子。'],
      ['Mr Gao: “I have worked here since 1990.” → Mr Gao told us that he ___ there since 1990.', 'had worked', '线索：have worked → had worked；here 也跟着变成了 there（转述的人不在那儿）。'],
      ['Yu: “I can still remember the song.” → Yu said that she ___ still remember the song.', 'could', '线索：can → could。'],
    ]),
    T('t2', '', '两种情况不用推：一是转述用的是现在时 says / tells（Fang says she is happy.）；二是一直不变的事实（The teacher said that the earth goes around the sun.）。'),
    C('c', '“Our teacher said that light ___ faster than sound.”', [
      ['*travels', '对：光比声音快，是一直不变的事实，不用推。'],
      ['travelled', '这个事实现在也成立，不用往过去推。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '转述问题：asked if / asked where', need: 'opt', steps: [
    T('t1', '', '转述别人的**问题**：用 asked，后面变成陈述句的语序，时态照样往前推。一般疑问句用 **if**（是否），特殊疑问句保留 where、when 这些词。周老师说的 Last year she asked me if I knew where Yu was. 就是这么来的——Fang 当时问的是：“Do you know where Yu is?”'),
    C('a', 'Tao 问：“Where is the music box?” 转述——', [
      ['*Tao asked where the music box **was**.', '对：语序变成陈述句（the music box was），is → was。'],
      ['Tao asked where **was** the music box.', '转述问题，用陈述句的语序。'],
    ], { keep: true }),
    C('b', '记者问 Yu：“Do you still play the piano?” 转述——', [
      ['*The reporter asked Yu **if** she still **played** the piano.', '对：一般疑问句用 if；do play → played。'],
      ['The reporter asked Yu **do** you still play the piano.', '转述时要去掉 do，加 if，人称换成 she。'],
    ], { keep: true }),
  ] },
];

const EXT_ORDER: Ext[] = [
  { id: 'x1', title: '讲的顺序，和发生的顺序', need: 'always', steps: [
    T('t1', '', '这个故事是从 2026 年挖出盒子讲起的，1996 年的事是后来一点点讲出来的。先讲了后发生的事、再回头说更早的事，英语常用 **had + 过去分词**，把“更早”标出来。', ['When the workers found the box, it **had been** under the tree for thirty years.', 'Yu told the reporter that she **had kept** the box for thirty years.']),
    C('a', '“When Mrs Hu called Fang, Fang ___ Yu for thirty years.”', [
      ['*hadn’t seen', '对：打电话是过去的事；三十年没见，是比打电话更早、一直持续到那时的事。'],
      ['didn’t see', '这样说只是“没看见”，说不出“到那时已经三十年没见了”。'],
      ['hasn’t seen', '整句说的是过去（called），不说 has。'],
    ], { keep: true }),
    fill('b', '放进句子，有的词用不上。', ['found', 'had written', 'had been', 'had found', 'was'], [
      ['When the workers dug under the tree, they ___ a rusty box.', 'found', '线索：先挖、后找到，一件接一件按顺序说，用一般过去时 found。had found 会变成“挖之前就已经找到了”。'],
      ['Fang didn’t know that Yu ___ a letter too.', 'had written', '线索：Yu 写信（1996）比 Fang 不知道（2026 年之前一直如此）更早——had written。'],
      ['Before Fang wound it up, the music box ___ silent for thirty years.', 'had been', '线索：上发条之前，已经三十年没响了——更早、一直持续到那时：had been。was 只说一个过去的状态，说不出“已经三十年”。'],
    ]),
  ] },
  { id: 'x2', title: '用英语讲讲整个故事', need: 'opt', steps: [
    frag('用英语讲讲 The Time Capsule：挑句子，拼成一段话。', [
      ['*In 1996, Fang broke Yu’s music box by accident, and the two friends stopped talking.', 1, 'broke', { seq: 0 }],
      ['*Before the class buried the time capsule, each girl put a letter of apology inside.', 1, 'letters', { seq: 1 }],
      ['*Soon Yu’s family moved to Shanghai, and they lost touch.', 1, 'moved', { seq: 2 }],
      ['*Thirty years later, the capsule was dug up, and the two friends met again at the school’s 60th birthday.', 1, 'met', { seq: 3 }],
      ['Fang broke the music box on purpose.', 1, '不是故意的：是抱着书不小心碰掉的（by accident）。'],
      ['Yu read Fang’s letter in 1996.', 1, '信一直在盒子里，1996 年谁也没读到。'],
      ['*But neither of them knew about the other letter.', 2, undefined, { after: 'letters' }],
      ['So they never wanted to be friends again.', 2, '她们都想和好，只是没来得及说出口。'],
      ['*Sometimes a “sorry” takes a long time to arrive — but it can still arrive.', 3],
      ['Time capsules are only for fun.', 3, '这个故事说的不只是时间胶囊好玩。'],
    ], { broke: '还没说 1996 年出了什么事：八音盒怎么了？', letters: '还没说那两封道歉信。', moved: '还没说她们为什么断了联系。', met: '还没说三十年后发生了什么。' },
    { 1: '先说说发生了什么事。', 2: '事情都说对了。再说说：最让人意外的是什么？', 3: '最后用一句话说说：这个故事告诉你什么？' },
    'In 1996, Fang broke Yu’s music box by accident, and the two friends stopped talking. Before the class buried the time capsule, each girl put a letter of apology inside. But neither of them knew about the other letter. Soon Yu’s family moved to Shanghai, and they lost touch. Thirty years later, the capsule was dug up, and the two friends met again at the school’s 60th birthday. Sometimes a “sorry” takes a long time to arrive — but it can still arrive.'),
  ] },
];

const EXT_WRITE: Ext[] = [
  { id: 'x1', title: '新胶囊的标签：被动再用一次', need: 'always', steps: [
    T('t1', '', '新盒子上也要贴一张标签，就像 1996 年那张 Buried on June 28, 1996. Open in 2026. 一样。说东西“被做”，用被动：**be + 过去分词**；说将来会被做，用 **will be + 过去分词**。'),
    fill('a', '放进句子，有的词用不上。', ['was buried', 'will be opened', 'were written', 'is made', 'buried', 'will open'], [
      ['The old capsule ___ in 1996.', 'was buried', '线索：盒子自己不会埋自己——被埋，1996 年：was buried。只填 buried 不行：少了 was，就成了“盒子埋了（别的东西）”。'],
      ['The new capsule ___ in 2056.', 'will be opened', '线索：2056 年会被人打开——will be opened。will open 是“盒子自己打开”。'],
      ['All the letters ___ by the students.', 'were written', '线索：by the students——信是被学生写的：were written。'],
      ['The box ___ of metal, so it won’t break easily.', 'is made', '线索：of metal——是用金属做的：be made of，is made。'],
    ]),
    C('b', '标签上写 Buried on June 28, 1996.，不写是谁埋的（by …）。为什么？', [
      ['*谁埋的不重要（大家都知道是全班），重要的是盒子', '对：被动常常把“谁做的”省掉，把要说的东西放在前面。'],
      ['因为被动句里不能有 by', '可以有：The letters were written by the students. 只是这里没必要。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '一封信的开头和结尾', need: 'opt', steps: [
    T('t1', '', '英文信的开头：**Dear …,**（亲爱的……）；结尾：**Best wishes,** 或 **Yours,**，下一行写名字。正文写完还想补一句，用 **P.S.**（附言）。'),
    C('a', '给 2056 年的同学写信，开头最合适的是——', [
      ['*Dear students of 2056,', '对：Dear + 收信人，后面一个逗号。'],
      ['Hello everybody in the future!!!', '太随便了，像网上留言。'],
    ], { keep: true }),
    C('b', 'Tao 的信结尾写：P.S. Is my flying car ready yet? P.S. 是——', [
      ['*附言：正文写完以后补的一句', '对：P.S. 来自拉丁文 post scriptum，“写在后面”。'],
      ['信的标题', '标题不会写在最后。'],
    ], { keep: true }),
  ] },
];

const EXT_REVIEW: Ext[] = [
  { id: 'x1', title: '这个故事里的句式，再见一次', need: 'always', steps: [
    T('t1', '', '把整个故事连起来，它用到的句式差不多全在这条时间线上：', [
      '1996　Fang and Yu **used to** sit together.（以前常常，后来不了）',
      '1996　Fang was **so** hurt **that** she couldn’t say a word.',
      'July 1996　By the time Fang got there, Yu’s family **had moved**.（更早）',
      '2026　The box **was buried** in 1996. It **has been** under the tree for thirty years.',
      '2056　The new capsule **will be opened**.（将来 + 被动）',
    ]),
    C('a', '“Fang and Yu ___ share everything — lunch, books, even secrets. Then they stopped talking.”', [
      ['*used to', '对：以前常常这样，后来不这样了。'],
      ['use to', 'used to 的 d 不能丢。'],
      ['are used to', 'be used to 是“习惯于”，后面跟名词或 -ing，意思也不对。'],
    ], { keep: true }),
    C('b', '“Could you tell me where ___?”（问高老师旧年鉴在哪）', [
      ['*the old yearbooks are', '对：放进 Could you tell me 里，用陈述句的语序。'],
      ['are the old yearbooks', '这是直接问的语序；放进句子里要变成陈述句的语序。'],
    ], { keep: true }),
    C('c', '“Fang didn’t know about Yu’s letter ___ that day.”（直到那天才知道）', [
      ['*until', '对：not … until，直到……才。'],
      ['since', 'since 是“自从”，和 didn’t know 连不出“直到那天才知道”。'],
      ['for', 'for 后面跟一段时间。'],
    ], { keep: true }),
    C('d', '“It ___ you two hours to look through all the yearbooks.”', [
      ['*takes', '对：It takes + 人 + 时间 + to do。'],
      ['spends', 'spend 的主语是人：You spend two hours looking through them.'],
      ['costs', 'cost 说花钱，不说花时间做事。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '一个词变出一家人', need: 'opt', steps: [
    T('t1', '', '这个故事里好些词是从别的词变来的：名词 + **-y** 变形容词（rust → rusty）；动词 + **-ment / -ion** 变名词（retire → retirement，predict → prediction）。'),
    Mt('a', '连一连。', ['rusty', 'dusty', 'retirement', 'argument', 'apology'], ['道歉（名词）', '满是灰尘的', '争吵（名词）', '生锈的', '退休（名词）'], [3, 1, 4, 2, 0], '', { lh: '词', rh: '意思', whys: [
      'rust（锈）+ y：生锈的——银杏树下挖出来的那只铁盒。',
      'dust（灰尘）+ y：满是灰尘的——图书馆书架顶上的旧年鉴。它和 rusty 都是名词加 y，看词根是 rust 还是 dust。',
      'retire（退休）+ ment：退休（名词）。',
      'argue（争吵）去掉 e + ment：争吵（名词）。注意拼法：argument，没有 e。',
      'apologize（道歉）的名词：apology——a letter of apology，一封道歉信。',
    ] }),
  ] },
];

export const PLAY_EC4_ITEMS: Item[] = [
  item({
    id: 'c4-invite', st: 'ec4', lv: 1, type: 'word', topic: 'invitation', label: 'an invitation', intro: '', ask: 'invite 和 invitation 有什么不一样？',
    hints: ['学校想请谁来？请她来做什么？'],
    explain: 'invitation：邀请；请柬、邀请函（invite 的名词）。学校不知道 Chen Yu 在哪儿，只好把故事发到网上，附上一份邀请，盼着她能看到。',
    lock: { words: ['invitation'] },
    ext: EXT_INVITE,
  }, C('a', 'The school posts the story online, with an invitation. 这份 invitation 上最可能写的是——', [
    ['*Chen Yu, we would love you to come to our 60th birthday ceremony on Saturday.', '对：invitation 是邀请——请她来参加星期六的校庆典礼。'],
    ['Chen Yu must come to school on Saturday.', 'must 是命令；邀请是请人来，来不来由对方定。'],
    ['Chen Yu, please send the music box back to the school.', '这是一个请求，不是邀请；学校也没有要她的八音盒。'],
    ['The ceremony on Saturday is cancelled.', '这是通知，而且是取消——和邀请正相反。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c4-if', st: 'ec4', lv: 2, type: 'grammar', topic: 'if + present, will', label: 'If I can get a ticket, I will come', intro: '', ask: 'if 后面为什么不用 will？',
    hints: ['If 那半句是“条件”：条件满足了，才有后面的结果。'],
    explain: 'If I can get a train ticket, I will come tomorrow：要是能买到票，我明天就来——来不来，要看能不能买到票。if 半句说条件，用一般现在时；另一半说结果，用 will。',
    lock: { words: ['If I can get a train ticket'] },
    ext: EXT_IF,
  }, C('a', 'Yu 写：If I can get a train ticket, I will come tomorrow. 她明天一定会来吗？', [
    ['*不一定：要看能不能买到票，买到了就来', '对：if 引出条件——条件满足了，才会有“明天来”这个结果。'],
    ['一定来：她已经买好票了', '她说的是 If I can get…，票还没买到。'],
    ['不来了：她买不到票', '她没说买不到，只说“要是能买到”。'],
    ['她昨天就已经到了', 'will come tomorrow 说的是明天的事。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c4-wont', st: 'ec4', lv: 2, type: 'fill', topic: 'if + present, will', label: 'If she misses the train, she won’t …', intro: '', ask: 'if 有几个意思？',
    hints: ['先找 if 那半句：它用一般现在时。另一半说结果，用 will / won’t。'],
    explain: 'If + 一般现在时（条件），will / won’t + 动词原形（结果）。Tao 着急的那句：If she misses the train, she won’t see Fang!',
    ext: EXT_WONT,
  }, fill('a', 'Tao 越想越着急：一环扣一环。放进句子，有的词用不上。', ['won’t', 'is', 'will see', 'sees', 'will be', 'doesn’t'], [
    ['If she misses the train, she ___ see Fang.', 'won’t', '线索：前半句 If she misses… 是条件，这半句说将来的结果——won’t（will not）。doesn’t 是一般现在时，说平常的习惯，说不出“这一次就见不到了”。'],
    ['If the train ___ late, Yu will miss the music.', 'is', '线索：If 后面是条件，用一般现在时：is。will be 不能放在 if 半句里。'],
    ['If Yu arrives by half past ten, she ___ Fang in the front row.', 'will see', '线索：前半句是条件，这半句说结果——将来：will see。sees 是一般现在时，说不出将来的结果。'],
    ['If Fang ___ the music box, she will know it at once.', 'sees', '线索：if 半句用一般现在时，主语 Fang 是第三人称单数：sees。will see 不能放进 if 半句。'],
  ])),

  item({
    id: 'c4-hope', st: 'ec4', lv: 2, type: 'grammar', topic: 'hope / wish', label: 'I hope … / I wish …', intro: '', ask: 'hope 和 wish 有什么不一样？',
    hints: ['火车准点，有没有可能？你现在能不能告诉 Fang？'],
    explain: 'hope：希望——有可能实现（火车有可能准点）；wish：但愿——多半做不到、和现在相反（现在不能告诉 Fang：万一 Yu 来不了，她会更难过）。wish 后面的动词往过去推一步：can → could。',
    lock: { words: ['I hope', 'wish'] },
    ext: EXT_HOPE,
  }, C('a', 'Tao 说 I hope Yu’s train isn’t late.；你心里想的是 I wish I could tell Fang now. 为什么一个用 hope，一个用 wish？', [
    ['*火车准点是有可能的；现在告诉 Fang，你觉得还做不到（万一 Yu 来不了呢）', '对：hope 说有可能实现的事；wish 说多半做不到、和现在相反的事。'],
    ['两个词意思一样，换着说而已', '不一样：wish 带着“做不到”的意思，所以后面用 could。'],
    ['hope 说过去的事，wish 说将来的事', '两个词都能说现在、将来；分别在“有没有可能”。'],
    ['wish 比 hope 更客气', '分别不在客不客气，在有没有可能实现。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c4-soon', st: 'ec4', lv: 1, type: 'grammar', topic: 'as soon as', label: 'As soon as Fang sees her', intro: '', ask: 'as soon as 和 when 有什么不一样？',
    hints: ['从看见到站起来，中间停了多久？'],
    explain: 'as soon as：一……就……。Fang 一看见那位女士，马上就站了起来——三十年没见，她还是一眼认出了 Yu。',
    lock: { words: ['As soon as'] },
    ext: EXT_SOON,
  }, C('a', 'As soon as Fang sees her, she stands up. 意思是——', [
    ['*Fang 一看见她，马上就站了起来', '对：as soon as，前一件刚发生，后一件马上跟着来。'],
    ['Fang 看见她以后，过了好一会儿才站起来', '“过了好一会儿”正好和 as soon as 相反。'],
    ['Fang 先站起来，然后才看见她', '顺序反了：先看见，再站起来。'],
    ['Fang 一直站着等她', 'stands up 是“站起来”这个动作，她之前是坐着的。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c4-waited', st: 'ec4', lv: 1, type: 'tense', topic: 'present perfect for / since', label: 'I’ve waited thirty years', intro: '', ask: 'for 和 since 怎么分？',
    hints: ['她从哪一年开始等？等到什么时候？'],
    explain: 'I’ve waited thirty years = I have waited for thirty years：从 1996 年一直等到现在（since 1996）。for + 一段时间，since + 起点。',
    lock: { words: ['I’ve waited thirty years'] },
    ext: EXT_WAITED,
  }, C('a', 'Yu 说 I’ve waited thirty years to say this. 哪一句和她的意思一样？', [
    ['*She has waited **since** 1996.', '对：从 1996 年一直等到现在——since + 起点。'],
    ['She waited **in** 1996.', '这样说，等只是 1996 年的事，说不出“一直等到现在”。'],
    ['She will wait **for** thirty years.', '这是说以后还要等三十年。'],
    ['She has waited **for** 1996.', 'for 后面跟一段时间（for thirty years），1996 是一个起点，要用 since。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c4-one', st: 'ec4', lv: 2, type: 'grammar', topic: 'the one who', label: 'I’m the one who should say sorry', intro: '', ask: 'the one who 是什么意思？',
    hints: ['Yu 刚说了对不起。Fang 觉得该道歉的人是谁？'],
    explain: 'the one who should say sorry：该说对不起的那个人。who 引出一句话，说明是哪个人。Yu 刚道了歉，Fang 说：该道歉的是我——八音盒是她碰掉的。',
    lock: { words: ['the one who should say sorry'] },
    ext: EXT_ONE,
  }, C('a', 'Fang 说 I’m the one who should say sorry. 意思是——', [
    ['*该说对不起的人是我，不是你', '对：the one who…——……的那个人。八音盒是 Fang 碰掉的。'],
    ['我是唯一一个道过歉的人', 'should say 是“应该说”，不是“已经说过”。'],
    ['我只说一次对不起', 'the one 在这里是“那个人”，不是“一次”。'],
    ['你应该先对我说对不起', '正好反了：她是说自己该道歉。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c4-touched', st: 'ec4', lv: 2, type: 'word', topic: 'touched / touching', label: 'Everyone is deeply touched', intro: '', ask: 'touched 和 touching 怎么分？',
    hints: ['说的是人心里的感受，还是这件事让人怎样？'],
    explain: 'touched：（人）被感动了；touching：（事）让人感动的。人感到 -ed，事让人 -ing：Everyone is touched. It is a touching moment.',
    lock: { words: ['touched'] },
    ext: EXT_TOUCHED,
  }, C('a', 'Everyone is deeply touched. 为什么用 touched，不用 touching？', [
    ['*touched 说人心里的感受：大家被打动了', '对：人“感到……”，用 -ed。'],
    ['因为事情发生在过去，所以加 -ed', '这里的 -ed 不是过去时：句子用的是 is（现在）。touched 是形容词，说人的感受。'],
    ['touching 也行，意思一样', 'Everyone is touching 成了“大家正在摸（什么东西）”。'],
    ['touched 在这里是“被人摸了一下”', 'touch 本来是“摸”，可 deeply touched 说的是心里被触动。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c4-said', st: 'ec4', lv: 3, type: 'grammar', topic: 'reported speech', label: 'She told our reporter that she had kept …', intro: '', ask: '转述别人的话，时态为什么要往前推？',
    hints: ['报纸是第二天写的。Yu 当时对记者说的，是“到现在为止”保存了三十年。'],
    explain: '转述别人的话：said / told + that，时态往前推一步，人称跟着换。Yu 的原话是 “I have kept the music box for thirty years.”，报纸上写成 she had kept；Fang 的原话是 “We will never lose touch again.”，报纸上写成 they would never lose touch again。',
    lock: { words: ['that she had kept the music box', 'that they would never lose touch again'] },
    ext: EXT_SAID,
  }, C('a', '报纸上写：Chen Yu told our reporter that she had kept the music box for thirty years. 她当时对记者说的原话，最可能是——', [
    ['*“I have kept the music box for thirty years.”', '对：她说的是“到现在为止保存了三十年”，原话用 have kept；报纸转述时往前推一步，变成 had kept。'],
    ['“I had kept the music box for thirty years.”', '说话的那一刻，她说的是到现在为止的事，原话用 have kept；had kept 是转述时推出来的。'],
    ['“She has kept the music box for thirty years.”', '说自己，原话里是 I；she 是转述时换的。'],
    ['“I kept the music box thirty years ago.”', '意思变了：thirty years ago 只说三十年前那一下，说不出“一直保存到现在”。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c4-write', st: 'ec4', lv: 2, type: 'write', topic: 'letter to 2056', label: '写给 2056 年的一句话', intro: '', ask: '写给未来的信，可以写些什么？',
    hints: ['预测：In 2056, … will …；说经历：I have … / I have never …'],
    explain: '写给未来，可以用 will 预测（In 2056, students will …），也可以用现在完成时说到现在为止做过的事（I have learned …）。',
    ext: EXT_WRITE,
  }, Wr('w', 'Write one sentence in your letter to the students of 2056. Use **will** to predict something, or use **have done** to tell them something you have done.', {
    lang: 'en', role: 'en',
    task: 'In a school story, students put letters into a new time capsule that will be opened in 2056. The student writes ONE sentence of their own letter to the students of 2056: either a prediction with will (In 2056, … will …) or something they have done so far with the present perfect (I have …).',
    criteria: ['either a prediction with will + base verb, or a present perfect sentence (have / has + past participle) about the student’s own experience', 'the sentence makes sense for a letter to the future (about life, school, the world, or the writer)', 'correct grammar and spelling; one complete sentence (two short ones are fine)'],
    examples: ['In 2056, students will learn English from robot teachers, but I hope they still read books.', 'I have lived in this city for fifteen years, and I have seen the old ginkgo tree turn gold every autumn.', 'In 2056, people will travel to the moon for their holidays.'],
    words: ['In 2056,', 'will', 'I have …'], frame: 'In 2056, ______ will ______. / I have ______.', ph: 'In 2056, …',
  })),

  item({
    id: 'c4-order', st: 'ec4', lv: 1, type: 'order', topic: 'the whole story', label: '从 1996 到 2026', intro: '', ask: '为什么讲故事的顺序和发生的顺序不一样？',
    hints: ['先找 1996 年 6 月的事：吵架、八音盒摔了。'],
    explain: '1996 年 6 月吵架 → 第二天八音盒被碰掉、钥匙飞了 → 6 月 27 日 Fang 找到钥匙 → 6 月 28 日两封道歉信随胶囊埋下 → 7 月 Fang 去道歉，Yu 家已经搬走 → 2026 年工人挖出铁盒 → 星期五深夜 Yu 发来邮件 → 星期六八音盒又响了。',
    ext: EXT_ORDER,
  }, Od('o', '按真正发生的先后，把整个故事排一排。', [
    'Fang and Yu argued about who would sing first.',
    'Fang knocked the music box off Yu’s desk by accident, and the little key flew out.',
    'Fang found the key under a cupboard, but she was afraid to give it back.',
    'Each girl put a letter of apology into the time capsule, and the class buried it.',
    'Fang went to Yu’s home, but Yu’s family had already moved to Shanghai.',
    'Workers found a rusty box under the old ginkgo tree.',
    'Yu sent an email: “If I can get a train ticket, I will come tomorrow.”',
    'For the first time in thirty years, the music box played.',
  ], '1996 年 6 月 → 第二天 → 6 月 27 日 → 6 月 28 日 → 7 月 → 2026 年星期一 → 星期五深夜 → 星期六。故事是从挖出盒子讲起的，可真正发生的顺序要从 1996 年那次吵架算起。', ['June 1996', 'the next day', 'June 27', 'June 28', 'July 1996', 'Monday', 'Friday night', 'Saturday'])),

  item({
    id: 'c4-review', st: 'ec4', lv: 2, type: 'match', topic: 'words review', label: '故事里的词', intro: '', ask: '这个故事里，你最喜欢哪一句英语？为什么？',
    hints: ['一个一个回想：盒子、图书馆、周老师、两封信、校庆。'],
    explain: 'bury 埋；recognize 认出；retire 退休；regret 后悔；make up 和好；invitation 邀请；touched 被感动的。',
    ext: EXT_REVIEW,
  }, Mt('a', '这些词，在故事里都出现过。连一连它们的意思。', ['bury', 'recognize', 'retire', 'regret', 'make up', 'invitation', 'touched'], ['退休', '后悔', '和好', '认出', '埋', '被感动的', '邀请', '吵架'], [4, 3, 0, 1, 2, 6, 5], '这七个词，串起了整个故事。', { lh: '英语', rh: '中文', whys: [
    'bury：埋——1996 年，全班把时间胶囊埋在了老银杏树下（was buried）；新的胶囊也 will be buried 在那儿。',
    'recognize：认出（以前见过，再见时一眼认出来）——高老师一看照片就认出了 Fang 和 Yu。',
    'retire：退休——周老师早就退休了，还住在学校旁边。',
    'regret：后悔——Fang 一直后悔那年没把 sorry 说出口。它和“吵架”都是不好受的事：吵架是 argue。',
    'make up：和好——Yu 在信里写 Maybe one day we will make up. 三十年后，她们真的和好了。make up 也有“化妆”“编造”的意思，这里是和好。',
    'invitation：邀请——学校把故事发到网上，附了一份邀请。',
    'touched：被感动的——八音盒响起来，全场的人都被打动了。',
  ] })),

  // ---------------- 支线任务：可做可不做 ----------------
  item({
    id: 'c4-x-ed', st: 'ec4', lv: 2, type: 'word', topic: 'bored / boring', label: 'bored 还是 boring', intro: '', ask: 'I’m boring 和 I’m bored 有什么不一样？',
    hints: ['人感到 -ed，事让人 -ing。'],
    explain: '-ed 说人的感受（bored 无聊的、interested 感兴趣的、tired 累的、amazed 惊叹的），-ing 说事情让人怎样（boring、interesting、tiring、amazing）。I’m bored 是“我好无聊”，I’m boring 是“我这个人很无趣”。',
  },
    T('t1', '', 'touched / touching 只是一对。还有好几对一样的：**bored / boring**（无聊）、**interested / interesting**（感兴趣的 / 有意思的）、**tired / tiring**（累的 / 累人的）、**amazed / amazing**（惊叹的 / 了不起的）。人感到 -ed，事让人 -ing。'),
    C('a', '典礼开始前要等很久，Tao 想说“我好无聊”——', [
      ['*I’m so **bored**.', '对：说人的感受，用 -ed。'],
      ['I’m so **boring**.', '这是“我这个人好无趣”——Tao 可不这么想自己。'],
    ], { keep: true }),
    C('b', '“Tao’s predictions about 2056 are really ___.” （Tao 对 2056 年的预测真有意思）', [
      ['*interesting', '对：预测是东西——让人觉得有意思：interesting。'],
      ['interested', 'interested 说人感兴趣：I’m interested in his predictions.'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['boring', 'bored', 'tired', 'tiring', 'interested', 'interesting', 'amazing', 'amazed'], [
      ['The speech was so long and ___ that Tao almost fell asleep.', 'boring', '线索：主语是 speech（讲话）——让人觉得无聊：boring。bored 说人。'],
      ['After the long train ride, Yu was very ___.', 'tired', '线索：主语 Yu 是人——感到累：tired。tiring 说事情累人：The ride was tiring.'],
      ['Tao is ___ in old things like tapes and music boxes.', 'interested', '线索：Tao 是人，后面有 in——对……感兴趣：interested in。interesting 说东西有意思。'],
      ['It’s ___ that the music box still works after thirty years!', 'amazing', '线索：It（八音盒还能响这件事）——让人惊叹：amazing。amazed 说人。'],
    ]),
  ),
  item({
    id: 'c4-x-spot', st: 'ec4', lv: 3, type: 'spot', topic: 'spot the wrong word', label: 'Tao 的信里用错的词', intro: '', ask: 'spend 和 take 怎么分？',
    hints: ['每句只有一个地方错了：想想 spend / take、used to、if 半句、for / since。'],
    explain: '四个错：花时间做事，人做主语用 spend（It takes me … to do 也行）；used to 的 d 不能丢；if 半句不用 will；since 后面跟起点，一段时间用 for。',
  },
    T('t1', '', 'Tao 写好了给 2056 年的信，请你帮他看看。每一句都有一个地方用错了——点出来，再选怎么改。'),
    S('a', '点出用错的词', 'I |take |two |hours |on |my |homework |every |day.', [1], C('fix', '换成哪个词？', [
      ['*spend', '对：人做主语，花时间在某事上——spend + 时间 + on + 事。'],
      ['cost', 'cost 说花钱，不说花时间。'],
      ['pay', 'pay 是付钱。'],
    ]), { 3: 'hours 没问题，再找找。' }, { spend: 'I ~~take~~ ++spend++ two hours on my homework every day.' }),
    S('b', '点出用错的词', 'When |I |was |little, |I |use |to |play |with |toy |robots.', [5], C('fix', '换成哪个词？', [
      ['*used', '对：以前常常——used to，d 不能丢。'],
      ['using', 'using to 不是一个说法。'],
      ['am used', 'am used to 是“习惯于”，而且要接 -ing。'],
    ]), { 2: 'was 没问题：When I was little，小时候。' }, { used: 'When I was little, I ~~use~~ ++used++ to play with toy robots.' }),
    S('c', '点出用错的词', 'If |you |will |find |this |letter, |please |say |hi |to |my |grandchildren!', [2], C('fix', '怎么改？', [
      ['*把 will 去掉：If you find this letter', '对：if 半句是条件，用一般现在时，不用 will。'],
      ['把 will 换成 would', 'would 也不能放在这个 if 半句里。'],
      ['把 find 换成 found', 'found 是过去时；读信是将来的事。'],
    ]), {}, { '把 will 去掉：If you find this letter': 'If you ~~will~~ find this letter, please say hi to my grandchildren!' }),
    S('d', '点出用错的词', 'I |have |waited |for |a |flying |car |since |ten |years!', [7], C('fix', '换成哪个词？', [
      ['*for', '对：ten years 是一段时间——for ten years。'],
      ['ago', 'have waited 不和 ago 连用。'],
      ['in', 'in ten years 是“十年以后”。'],
    ]), { 3: '这个 for 是 wait for（等）的 for，没问题。' }, { for: 'I have waited for a flying car ~~since~~ ++for++ ten years!' }),
  ),
];
