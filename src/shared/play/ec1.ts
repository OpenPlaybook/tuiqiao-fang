// 英文故事二 The Time Capsule · Chapter 1 Open in 2026（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）。规划见 第六堂课/英文故事二_时间胶囊.md
// 星期一早上，老银杏树下挖出一只 1996 年埋下的铁盒：标签、四十封信、1996 年的预测、一封粉色的道歉信（钥匙包在里面，最后一行被水洇了，只剩一个字母 F）。
// 语法第一次讲：被动语态（was buried / were written）、现在完成时 + for / since（has been … for thirty years）、will 预测将来。
// 这一章还不知道写信的是谁（署名只剩 F）：题和讲解里只说“写信的人”，不提 Lin Fang（第二章看合影才对上）。
import { C, M, Mt, Od, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, FragSub, Item, Play, TeachSub, TypeSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string, string[]?][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why, alt]) => ({ t, a, why, ...(alt ? { alt } : {}) })) });
const type = (key: string, q: string, accept: string[], why: string, near: Record<string, string> = {}, ph = ''): TypeSub => ({ kind: 'type', key, q, accept, near, why, ph });
const T = (key: string, q: string, t: string, ex?: string[], art?: Art): TeachSub => ({ kind: 'teach', key, q, t, ...(ex ? { ex } : {}), ...(art ? { art } : {}) });
/** 拼句：[句子（* 是对的）, 第几层, 对的写事件 ev / 错的写为什么, { seq（事情的先后，一样的可以互换）, after（评价放在哪件事后面）}] */
const frag = (q: string, rows: [string, 1 | 2 | 3, string?, { seq?: number; after?: string }?][], events: Record<string, string>, need: FragSub['need'], model: string): FragSub => ({
  kind: 'frag', key: 'a', q, events, need, model,
  frags: rows.map(([t, layer, x, o]) => t.startsWith('*') ? { t: t.slice(1), layer, ok: true, ...(x ? { ev: x } : {}), ...(o ?? {}) } : { t, layer, ok: false, why: x }),
});
const viz = (k: string, p: Record<string, unknown> = {}) => ({ k, p });

export const PLAY_EC1: Play = {
  id: 'ec1', lang: 'en', no: 1, title: 'Chapter 1　Open in 2026', sub: '三十年前埋下的盒子', color: '#2E7D6B', next: 'ec2',
  endAsk: ['被动语态什么时候不用说 by 谁？', 'for 和 since 怎么分？', '如果你来埋一个时间胶囊，会放什么进去？'],
  gloss: {
    celebrate: { d: 'v. 庆祝', py: '/ˈselɪbreɪt/' },
    '60th anniversary': { d: '六十周年纪念。60th 读作 sixtieth（第六十）；anniversary：周年纪念日。', py: '/ˌænɪˈvɜːsəri/' },
    'ginkgo tree': { d: '银杏树', py: '/ˈɡɪŋkəʊ/', more: { t: '银杏是世界上最古老的树种之一，被叫作“活化石”；秋天叶子金黄，像一把把小扇子。它的种子叫 ginkgo nuts，就是白果。', q: '“ginkgo nuts” 是——', opts: [['白果（银杏的种子）', true], ['银杏的叶子', false]] } },
    digging: { d: '挖（dig 的 -ing 形式）', py: '/ˈdɪɡɪŋ/', more: { t: 'dig 的过去式、过去分词都是 dug；dig up 是“挖出来”：Workers dug up a box.（工人挖出了一只盒子）', q: '“They dug up an old coin.” 是——', opts: [['他们挖出了一枚旧硬币', true], ['他们埋下了一枚旧硬币', false]] } },
    Clang: { d: '当！（金属碰在一起的声音）', py: '/klæŋ/' },
    spade: { d: 'n. 铁锹', py: '/speɪd/', more: { t: 'spade 还是扑克牌里的“黑桃”——黑桃的样子，就像一把小铁锹。', q: '“the ace of spades” 是——', opts: [['黑桃 A', true], ['一把最好的铁锹', false]] } },
    'brushes off': { d: '（用手）拂掉、掸掉' },
    rusty: { d: 'adj. 生锈的（rust 铁锈 + -y）', py: '/ˈrʌsti/' },
    'push through': { d: '挤过（人群）' },
    crowd: { d: 'n. 人群', py: '/kraʊd/' },
    faded: { d: 'adj. 褪了色的', py: '/ˈfeɪdɪd/' },
    lid: { d: 'n. 盖子', py: '/lɪd/' },
    'English Club': { d: '英语社（学校的社团）' },
    'Class 3, Grade 9': { d: '初三（3）班。英语先说班、再说年级；Grade 9 是九年级，也就是初三。' },
    Buried: { d: '被埋（的）：bury（埋）的过去分词。标签上省掉了 This box was。', py: '/ˈberid/', more: { t: 'bury 读 /ˈberi/，和 berry（浆果）读音一样，不读成 /ˈbjʊəri/。', q: 'bury 和哪个词读音一样？', opts: [['berry', true], ['busy', false]] } },
    'Open in 2026': { d: '（请在）2026 年打开：写给将来的人看的，叫人做事——祈使句。' },
    'has been under this tree for thirty years': { d: '在这棵树下已经待了三十年（一直到现在）：has been + for + 一段时间。' },
    'twice as old as': { d: '年纪是……的两倍。twice：两倍；as old as：和……一样大。' },
    'time capsule': { d: '时间胶囊：把“现在”的东西封进盒子，留给将来的人打开。', py: '/ˈkæpsjuːl/' },
    message: { d: 'n. 口信、留言、信息', py: '/ˈmesɪdʒ/' },
    'holds their breath': { d: '屏住呼吸（紧张、期待的时候）' },
    'lifts the lid': { d: '掀开盖子' },
    'class photo': { d: '全班合影' },
    'cassette tape': { d: '磁带：上世纪八九十年代听歌、学英语用的', py: '/kəˈset teɪp/', more: { t: 'tape 还有“胶带”的意思：sticky tape（透明胶带）。', q: '“Can I use your tape? This page is torn.” 这里的 tape 是——', opts: [['胶带', true], ['磁带', false]] } },
    'were all written': { d: '全都是（被人）写的：were + 过去分词 written。' },
    'To the students of 2026': { d: '致 2026 年的同学（信封上、信开头的写法）' },
    'will have': { d: '将会有：will + 动词原形，说将来会怎样。' },
    'help me with my homework': { d: '帮我做作业：help sb with sth' },
    'traffic jams': { d: '堵车', py: '/ˈtræfɪk dʒæmz/' },
    'there will be': { d: '将会有……：There will be + 东西。' },
    'still waiting for': { d: '还在等……（wait for + 等的人或东西）' },
    anymore: { d: 'adv. 再也（不）……：放在否定句的末尾', py: '/ˌeniˈmɔː/' },
    'does have': { d: '确实有、还真有：does 放在动词前，加强语气。' },
    'vacuum cleaner': { d: '吸尘器；robot vacuum cleaner：扫地机器人', py: '/ˈvækjuːm/' },
    'eats my socks': { d: '“吃我的袜子”：开玩笑——扫地机器人把地上的袜子吸了进去。' },
    envelope: { d: 'n. 信封', py: '/ˈenvələʊp/' },
    brass: { d: 'n. 黄铜', py: '/brɑːs/' },
    'slides out': { d: '滑出来' },
    'music box': { d: '八音盒：拧几圈钥匙上好弦，就会叮叮咚咚放出一段音乐的小盒子' },
    'fell off': { d: '（从……上）掉下来。fall off 的过去式。' },
    accident: { d: 'n. 意外、事故：没打算、没想到就发生了的事', py: '/ˈæksɪdənt/' },
    'on purpose': { d: '故意地', py: '/ˈpɜːpəs/' },
    'won’t talk to me': { d: '不肯跟我说话。won’t = will not；这里不是猜将来，是“不肯、不愿意”。' },
    'walk home alone': { d: '一个人走回家（alone：独自）' },
    'is moving to': { d: '要搬到……：已经定好的安排，可以用 is + doing 说将来。' },
    'how to say sorry': { d: '怎么说对不起：how to + 动词原形（怎么做）' },
    'the key to': { d: '……的钥匙。英语说 the key to the door / the box，用 to，不用 of。' },
    'If you find her': { d: '如果你们找到她：if 后面用一般现在时，说将来可能发生的事。' },
    smudged: { d: 'adj. （字迹）被水、手蹭得模糊不清的', py: '/smʌdʒd/' },
    'one letter': { d: '一个字母。letter 有两个意思：信；字母。' },
    'Thirty years have passed': { d: '三十年过去了：have passed，从 1996 年一直算到现在。' },
  },
  lines: [
    { side: ['c1-x-anni'], shots: [['tc.title', 0.8], ['tc1.campus', 1.2]], id: 'mon', t: '**Monday, 7:50 a.m.** In five days, our school will ⟦celebrate⟧ its ⟦60th anniversary⟧.', read: 'Monday, seven fifty a.m. In five days, our school will celebrate its sixtieth anniversary.', tr: '星期一，早上七点五十。再过五天，我们学校就要{庆祝}{建校六十周年}了。', trHard: 'words', voice: 'en', ask: '学校的六十周年校庆，英语怎么说？' },
    { shots: [['tc1.ginkgo', 1.2], ['tc1.spade', 0.8]], id: 'dig', t: 'Under the old ⟦ginkgo tree⟧, workers are ⟦digging⟧ the ground for a new garden. ⟦Clang⟧! A ⟦spade⟧ hits something hard.', tr: '老{银杏树}下，工人们正在{挖地}，要修一座新花园。{当}的一声！一把{铁锹}碰到了什么硬东西。', trHard: 'words', voice: 'en', ask: '银杏树为什么叫“活化石”？' },
    { shots: [['tc1.boxUp', 1.2]], id: 'rusty', t: 'The worker ⟦brushes off⟧ the soil. It’s a metal box, red-brown and ⟦rusty⟧.', tr: '工人{拂去}泥土：是一只铁盒子，红褐色，{!锈迹斑斑}。', trHard: 'words', voice: 'en', task: ['c1-rusty'], ask: '铁为什么会生锈？' },
    { shots: [['tc1.crowd', 1.2]], id: 'crowd', t: 'You and your classmate Tao ⟦push through⟧ the crowd. Mrs Hu, our English Club teacher, is reading the ⟦faded⟧ label on the ⟦lid⟧.', tr: '你和同班同学 Tao {挤过}人群。英语社的胡老师正在看{盒盖}上那张{褪了色的}标签。', trHard: 'words', voice: 'en' },
    { shots: [['tc1.label', 1.2]], id: 'label', who: 'Mrs Hu', voice: 'hu', t: '(reading) “Class 3, Grade 9. ⟦Buried⟧ on June 28, 1996. Open in 2026.”', read: 'Class three, Grade nine. Buried on June the twenty-eighth, nineteen ninety-six. Open in twenty twenty-six.', tr: '（念着）“{!初三（3）班}。1996 年 6 月 28 日{埋下}。{!2026 年开启}。”', trHard: 'words', ask: 'Grade 9 是几年级？' },
    { shots: [['tc1.glasses']], prompt: true, who: 'AI 眼镜', voice: 'ai', hide: true, t: 'AI 眼镜把标签翻成了中文。可它有时只认一个词最常见的意思——这一回可能翻错了。找出来，改对。', task: ['c1-mis'] },
    { shots: [['tc1.taoAsk']], id: 'who', who: 'Tao', voice: 'tao', t: '“⟦Buried⟧ on June 28, 1996”… So who buried it here — and why?', read: 'Buried on June the twenty-eighth, nineteen ninety-six… So who buried it here, and why?', tr: '“1996 年 6 月 28 日{埋下}”……那是{谁把它埋在这儿的}——为什么要埋？', trHard: 'frame', task: ['c1-buried'], ask: '什么时候用被动语态？' },
    { shots: [['tc1.huThirty', 1.2]], id: 'thirty', who: 'Mrs Hu', voice: 'hu', t: 'The students of 1996, I think. So it has been under this tree for thirty years!', read: 'The students of nineteen ninety-six, I think. So it has been under this tree for thirty years!', tr: '{应该是} 1996 年的学生吧。{这么说}，它{!在这棵树下已经待了整整三十年}！', trHard: 'frame', task: ['c1-for'], ask: 'for 和 since 怎么分？' },
    { shots: [['tc1.taoJoke']], id: 'twice', who: 'Tao', voice: 'tao', t: 'Thirty years? That’s ⟦twice as old as⟧ me!', tr: '三十年？{比我大一倍}呢！', trHard: 'frame', ask: 'twice as old as 是什么意思？' },
    { shots: [['tc1.huCapsule', 1.2]], id: 'capsule', who: 'Mrs Hu', voice: 'hu', t: 'It’s a ⟦time capsule⟧! A ⟦message⟧ from 1996 — to us.', read: 'It’s a time capsule! A message from nineteen ninety-six, to us.', tr: '这是一个{!时间胶囊}！一份 1996 年捎来的{口信}——捎给我们的。', trHard: 'words', task: ['c1-capsule'], ask: '时间胶囊里一般放什么？' },
    { shots: [['tc1.clubroom', 1.2]], id: 'club', t: 'In the English Club room, everyone ⟦holds their breath⟧. Mrs Hu slowly ⟦lifts the lid⟧.', tr: '英语社活动室里，大家都{屏住了呼吸}。胡老师慢慢地{掀开了盒盖}。', trHard: 'words', voice: 'en' },
    { shots: [['tc1.inside', 1.2]], id: 'inside', t: 'Inside, there are forty letters, an old ⟦class photo⟧ and a ⟦cassette tape⟧.', tr: '里面有四十封信、一张旧的{全班合影}，还有一盘{磁带}。', trHard: 'words', voice: 'en', ask: '磁带是什么？现在还有人用吗？' },
    { shots: [['tc1.letters', 1.2]], id: 'written', who: 'Tao', voice: 'tao', t: 'They were all written in English! Look — “To the students of 2026.” That’s us!', read: 'They were all written in English! Look. To the students of twenty twenty-six. That’s us!', tr: '它们{!全是用英语写的}！看——“{致 2026 年的同学}”。那就是我们！', trHard: 'frame', task: ['c1-written'], ask: 'was 和 were 怎么选？' },
    { shots: [['tc1.robot', 1.2]], id: 'robot', who: 'Mrs Hu', voice: 'hu', t: '(reading) “In 2026, every family will have a robot. It will cook, clean and help me with my homework!”', read: 'In twenty twenty-six, every family will have a robot. It will cook, clean and help me with my homework!', tr: '（念着）“到了 2026 年，{!每家都会有一个机器人}。它会做饭、打扫，还会{帮我写作业}！”', trHard: 'frame', task: ['c1-will'], ask: 'will 和 want 有什么不一样？' },
    { shots: [['tc1.flyCar', 1.2]], id: 'fly', who: 'Tao', voice: 'tao', t: '(reading) “Cars will fly, and there will be no ⟦traffic jams⟧.” Flying cars? I’m ⟦still waiting for⟧ mine!', read: 'Cars will fly, and there will be no traffic jams. Flying cars? I’m still waiting for mine!', tr: '（念着）“汽车会飞，{再也不会堵车}。”会飞的汽车？我的那辆{还没等来}呢！', trHard: 'words', ask: '“I’m still waiting for mine” 里的 mine 指什么？' },
    { side: ['c1-x-predict'], shots: [['tc1.nobody', 1.2]], id: 'nobody', who: 'Mrs Hu', voice: 'hu', t: '(laughing) And this one says, “Nobody will write letters ⟦anymore⟧.” — in a letter!', read: 'And this one says, nobody will write letters anymore. In a letter!', tr: '（笑着）这一封写着：“以后{再也}没有人写信了。”——这话可是写在信里的！', trHard: 'words' },
    { shots: [['tc1.vacuum', 1.2]], id: 'vacuum', who: 'Tao', voice: 'tao', t: 'Well, my mom ⟦does have⟧ a robot — a robot ⟦vacuum cleaner⟧. It cleans the floor… and ⟦eats my socks⟧.', read: 'Well, my mom does have a robot. A robot vacuum cleaner. It cleans the floor… and eats my socks.', tr: '{不过}，我妈{还真有}一个机器人——{扫地机器人}。它扫地……还{吃我的袜子}。', trHard: 'words' },
    { shots: [['tc1.predBoard']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '三十年前的这些预测，到今天成真了没有？分一分。', task: ['c1-sort'], ask: '1996 年的时候，手机是什么样子？' },
    { shots: [['tc1.write2056']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '轮到你了：给三十年后、2056 年的同学，写一句预测。', task: ['c1-write'] },
    { shots: [['tc1.pink', 1.4]], id: 'pink', t: 'At the bottom of the box, one ⟦envelope⟧ is pink. Tao opens it, and a tiny ⟦brass⟧ key ⟦slides out⟧.', tr: '盒底有一个粉色的{信封}。Tao 拆开它，一把小小的{铜}钥匙{滑了出来}。', trHard: 'words', voice: 'en', ask: '这把小钥匙会是开什么的？' },
    { shots: [['tc1.letterA', 1.2]], id: 'f1', who: 'The pink letter', voice: 'fang', t: 'This letter is not for the future. It is for my best friend, Chen Yu.', tr: '这封信不是写给未来的。它是写给我{最好的朋友} Chen Yu 的。', trHard: 'words' },
    { shots: [['tc1.fall1996', 1.3]], id: 'accident', who: 'The pink letter', voice: 'fang', t: 'Two weeks ago, her ⟦music box⟧ ⟦fell off⟧ the desk, and the music stopped. I did it — but it was an ⟦accident⟧.', tr: '两个星期前，她的{八音盒}从桌上{掉了下去}，音乐停了。是我弄的——可那是{!一个意外}。', trHard: 'words', task: ['c1-accident'], ask: 'accident 一定是“事故”吗？' },
    { shots: [['tc1.alone', 1.2]], id: 'purpose', who: 'The pink letter', voice: 'fang', t: 'She thinks I did it ⟦on purpose⟧. Now she ⟦won’t talk to me⟧, and I ⟦walk home alone⟧.', tr: '她以为我是{故意的}。现在她{不肯理我}了，我只好{一个人走回家}。', trHard: 'words', ask: 'won’t 在这里为什么是“不肯”？' },
    { shots: [['tc1.moving', 1.2]], id: 'moving', who: 'The pink letter', voice: 'fang', t: 'Her family ⟦is moving to⟧ Shanghai next month. I don’t know ⟦how to say sorry⟧.', tr: '她家下个月{就要搬到}上海去了。我不知道{该怎么说对不起}。', trHard: 'words' },
    { shots: [['tc1.keyHand', 1.2]], id: 'keyline', who: 'The pink letter', voice: 'fang', t: 'This is ⟦the key to⟧ her music box. ⟦If you find her⟧, please give it to her and tell her —', read: 'This is the key to her music box. If you find her, please give it to her, and tell her…', tr: '这是她八音盒的{钥匙}。{如果你们找到她}，请把它交给她，再告诉她——', trHard: 'words' },
    { shots: [['tc1.smudge', 1.4]], id: 'smudge', t: 'The last line is ⟦smudged⟧ — water got in long ago. Under it, you can only read ⟦one letter⟧: “F”.', read: 'The last line is smudged. Water got in long ago. Under it, you can only read one letter: F.', tr: '最后一行{被水洇了}——很久以前进过水。下面只认得出{一个字母}：“F”。', trHard: 'words', voice: 'en', task: ['c1-smudge'], ask: '被洇掉的那一行，会写着什么？' },
    { shots: [['tc1.taoWhat']], id: 'what', who: 'Tao', voice: 'tao', t: 'Tell her what? We have to find Chen Yu!', tr: '告诉她什么？我们{得}找到 Chen Yu！', trHard: 'frame' },
    { shots: [['tc1.huWindow', 1.2]], id: 'passed', who: 'Mrs Hu', voice: 'hu', t: '⟦Thirty years have passed⟧. Who is “F”? Who is Chen Yu? And where are they now?', read: 'Thirty years have passed. Who is F? Who is Chen Yu? And where are they now?', tr: '{三十年过去了}。“F”是谁？Chen Yu 是谁？她们现在{在哪儿}？', trHard: 'frame', ask: 'Thirty years have passed 为什么用 have passed？' },
    { shots: [['tc1.timeline']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '这只盒子的故事，按真实发生的先后，排一排。', task: ['c1-order'] },
    { shots: [['tc1.end', 1.4]], who: 'AI 眼镜', voice: 'ai', t: '第一章到这里。下一章，你们翻出那张老合影：四十张笑脸里，哪一个是 Chen Yu？“F”又是谁？', read: '第一章到这里。下一章，你们翻出那张老合影：四十张笑脸里，哪一个是 Chen Yu？F 又是谁？', ask: '一张老照片上，能找到哪些线索？' },
  ],
};

// ---------------- 拓展：讲一小段、问一句，一步一步往下走 ----------------
const EXT_RUSTY: Ext[] = [
  { id: 'x1', title: '名词 + y，变成“有……的”', need: 'always', steps: [
    T('t1', '', '**rust** 是铁锈（名词）；在后面加上 **-y**，**rusty** 就成了形容词“生锈的”。英语里好些名词都能这么变：rain（雨）→ **rainy**（下雨的），dust（灰尘）→ **dusty**（满是灰的），cloud（云）→ **cloudy**（多云的）。'),
    Mt('a', '这几个 -y 形容词，各是什么意思？', ['a **rusty** key', 'a **dusty** shelf', 'a **muddy** shoe', 'a **salty** soup', 'a **cloudy** day'], ['多云的天', '很咸的汤', '生锈的钥匙', '沾满泥的鞋', '落满灰的架子'], [2, 4, 3, 1, 0], '名词加 -y，意思多半是“有很多……的、带着……的”。', { lh: '英语', rh: '意思', whys: [
      'rust（铁锈）+ y：钥匙上全是锈。',
      'dust（灰尘）+ y：好久没人碰的架子，落满了灰。',
      'mud（泥）+ d + y：鞋上全是泥。注意 mud 要双写 d。',
      'salt（盐）+ y：盐放多了，汤很咸。',
      'cloud（云）+ y：天上云很多。',
    ] }),
    T('t2', '', '拼写要留心两点：① 短词以“一个元音字母 + 一个辅音字母”结尾，先双写最后那个字母：sun → **sunny**，mud → **muddy**，fog → **foggy**；② 以不发音的 e 结尾，先去掉 e：noise → **noisy**，ice → **icy**。'),
    C('b', 'fog（雾）加 -y，“有雾的”怎么写？', [
      ['*foggy', '对：fog 是“一个元音 o + 一个辅音 g”结尾的短词，先双写 g，再加 -y。'],
      ['fogy', '少了一个 g：短词 fog 加 -y 之前，要先双写最后的 g。'],
      ['fogey', 'fog 结尾没有 e，不用加 e。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['rusty', 'dusty', 'rainy', 'salty', 'rust', 'sunny'], [
      ['Don’t drink sea water. It’s too ___.', 'salty', '线索：sea water——海水太咸：salty。'],
      ['Take an umbrella. It’s going to be ___ this afternoon.', 'rainy', '线索：Take an umbrella——要带伞，下午会下雨：rainy。sunny 是晴天，晴天用不着叮嘱人带伞。'],
      ['Nobody has touched these old books for years. They are very ___.', 'dusty', '线索：好多年没人碰——上面落满了灰：dusty。rusty 说的是金属生锈，书不会生锈。'],
      ['The old iron gate is red-brown and ___. Nobody has painted it for years.', 'rusty', '线索：iron gate（铁门）、red-brown——铁生锈了：rusty。rust 是名词“铁锈”，放在 is 后面要用形容词 rusty。'],
    ]),
  ] },
];

const EXT_MIS: Ext[] = [
  { id: 'x1', title: '一个词，几个意思', need: 'always', steps: [
    T('t1', '', '这几个词，AI 眼镜都挑了最常见的意思：class 常是“课”，grade 常是“成绩”，open 常是“开门营业”。可一个词放进不同的地方，意思就跟着变——要看它和谁在一起、写在什么地方。'),
    C('a', '“What **grade** are you in?” 问的是——', [
      ['*你上几年级？', '对：问年级。中国的初一、初二、初三，英语常说 Grade 7、8、9。'],
      ['你考了多少分？', '问成绩要说 What grade did you get?——有 get（得到），问的才是考试得的成绩。'],
    ], { keep: true }),
    C('b', '“We have an English **class** at ten.” 这里的 class 是——', [
      ['*一节课', '对：at ten，十点钟有一节英语课。'],
      ['一个班', '“十点钟有一个英语班”说不通：have an English class at ten 是十点上一节英语课。'],
    ], { keep: true }),
    Mt('c', '这几个词，在句子里各是什么意思？', ['There are 26 **letters** in English.', 'I wrote a **letter** to my grandma.', 'The shop is **open** until ten.', 'Please **open** the box in 2026.'], ['打开', '信', '字母', '营业、开着门'], [2, 1, 3, 0], '', { lh: '句子', rh: '意思', whys: [
      '英语里有 26 个——是字母。',
      'wrote a letter to my grandma：写给奶奶的——是信。',
      'The shop is open until ten：商店开到十点——营业。这里的 open 是形容词（开着的）。',
      'Please open the box：请把盒子打开——动词“打开”。标签上的 Open in 2026 也是这个意思。',
    ] }),
    C('d', '那 Class 3, Grade 9 该怎么翻，靠的是什么线索？', [
      ['*它写在一个班埋下的盒子上，class 和 grade 又挨在一起——说的是“哪个年级、哪个班”', '对：先看词写在哪儿、和谁在一起，再定意思。你自己读英语，也这么做。'],
      ['class 只有“课”一个意思，grade 只有“成绩”一个意思', '“第三节课，成绩九级”就是这么翻出来的。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '先说小的，再说大的', need: 'opt', steps: [
    T('t1', '', '初三（3）班，英语写 **Class 3, Grade 9**：先说小的（班），再说大的（年级）。地址也一样，从小往大说：Room 302, Building 3, Haidian District, Beijing。中文正好反过来，从大往小说。'),
    C('a', '初二（5）班，英语是——', [
      ['*Class 5, Grade 8', '对：先说班，再说年级；初二是八年级。'],
      ['Grade 5, Class 8', '班和年级颠倒了：5 是班，初二是 Grade 8。'],
      ['Class 5, Grade 2', '初二是八年级：小学六年，再加初中第二年——Grade 8。'],
    ], { keep: true }),
    C('b', '“北京市海淀区人民路 18 号”，英语怎么写？', [
      ['*18 Renmin Road, Haidian District, Beijing', '对：从门牌号说起，最后才是城市。'],
      ['Beijing, Haidian District, Renmin Road 18', '这是中文的顺序。英语地址从小往大说。'],
    ], { keep: true }),
    type('c', '用英语写：初一（2）班', ['Class 2, Grade 7'], '先说班，再说年级；初一是七年级：Class 2, Grade 7。', { 'Grade 7, Class 2': '英语里先说班，再说年级：Class 2, Grade 7。', 'Class 2, Grade 1': '初一是七年级：Grade 7。' }, 'Class …'),
  ] },
];

const EXT_BURIED: Ext[] = [
  { id: 'x1', title: '被埋的盒子：被动语态', need: 'always', steps: [
    T('t0', '', '先回到 1996 年 6 月 28 日，看看那天发生了什么：', undefined, viz('clip', { shots: [['tc1.clipBuryDig', 0.8], ['tc1.clipBuryLabel', 0.2]], dur: 12, cap: [[0, '1996　The students **buried** the box.（主动：从“学生”说起——谁做了什么）'], [0.45, 'The box **was buried** by the students.（被动：从“盒子”说起——它被怎么样了）'], [0.8, 'The label: **Buried** on June 28, 1996.（标签上：省掉了 This box was）']], marks: [[0.04, 'dig'], [0.3, 'put in'], [0.55, 'cover'], [0.82, 'label']] })),
    C('t0a', '“The students buried the box.” 和 “The box was buried by the students.” 说的是——', [
      ['*同一件事：一句从“学生”说起，一句从“盒子”说起', '对：事情一样，站的角度不一样。'],
      ['两件事：学生埋了盒子，后来盒子又埋了学生', '没有这回事。by the students 是“被学生（埋）”，埋东西的始终是学生。'],
    ], { keep: true }),
    T('t1', '', '这就是**被动语态**：**be + 过去分词**。主语放的是“被怎么样”的那个东西；be 跟着时间变——说过去，用 was / were；说现在，用 is / are；说将来，用 will be。', ['The box **is made of** iron.（现在：盒子是铁做的）', 'The box **was buried** in 1996.（过去：1996 年被埋下）', 'The box **will be opened** on Saturday.（将来：星期六会被打开）']),
    C('a', '主动变被动：“Workers found the box on Monday.” →', [
      ['*The box **was found** by workers on Monday.', '对：盒子放到前面，found 换成 was found，原来的主语 workers 放到 by 后面。'],
      ['The box **found** workers on Monday.', '成了“盒子在星期一找到了工人”。'],
      ['The box **is found** by workers on Monday.', '找到是星期一（过去）的事：was found。'],
    ], { keep: true }),
    T('t2', '', '被动句常常不说 by 谁，因为：① 不知道是谁——标签上就没写是谁埋的；② 谁都知道，或者说了也没用——Our school was built in 1966.（盖楼的是谁，不是要说的）。真要说清是谁做的，才加 by：This poem was written by Li Bai.'),
    C('b', '哪一句里的 by …，删掉更好？', [
      ['*Our school was built **by builders** in 1966.', '对：楼当然是建筑工人盖的，by builders 说了等于没说。'],
      ['These letters were written **by forty students**.', '这个 by 有用：告诉你信是四十个学生写的。'],
      ['This poem was written **by Li Bai**.', '有用：诗是谁写的，正是要说的。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['was', 'were', 'built', 'opened', 'build', 'is'], [
      ['The box ___ buried under the ginkgo tree in 1996.', 'was', '线索：The box（一只）+ in 1996（过去）——was buried。were 用在好几个东西后面；is 说的是现在。'],
      ['The letters ___ written by the students of Class 3.', 'were', '线索：The letters（好几封）——were written。'],
      ['Our school was ___ in 1966.', 'built', '线索：前面有 was——被动后面跟过去分词：build → built。build 是原形，不能跟在 was 后面。'],
      ['The new time capsule will be ___ in 2056.', 'opened', '线索：will be 后面跟过去分词：open → opened。'],
    ]),
  ] },
  { id: 'x2', title: '标签上的两种省略', need: 'opt', steps: [
    T('t1', '', '再看一遍标签：Buried on June 28, 1996. Open in 2026. 两句都省掉了词，可省法不一样：**Buried** … 省掉了 This box was（被动：盒子被埋了）；**Open** … 是叫人做事（祈使句：请打开）。牌子、标签上，这两种句子最多。'),
    So('a', '这些牌子、标签上的话，哪些是被动（东西被怎么样了），哪些是叫人做事？', ['被动：省掉了 is / was', '叫人做事（祈使句）'], [
      ['**Made** in China', 0, '= It is made in China.（在中国制造）'],
      ['**Built** in 1966', 0, '= This building was built in 1966.（建于 1966 年）'],
      ['**Written** by the students of Class 3', 0, '= These letters were written by the students of Class 3.'],
      ['**Keep** off the grass', 1, '请勿踩踏草地：叫人别做。'],
      ['**Open** in 2026', 1, '请在 2026 年打开：叫将来的人做。'],
      ['**Push**', 1, '门上的“推”：叫你推。'],
    ]),
    C('b', '盒子上要是写成 “Opened in 2026”，意思就成了——', [
      ['*（它）在 2026 年被打开了——像在说一件已经发生的事', '对：Opened 是过去分词，成了被动“被打开了”。写给将来的人，要用 Open（请打开）。'],
      ['和 Open in 2026 一样', '多一个 -ed，意思就从“请你打开”变成了“已经被打开了”。'],
    ], { keep: true }),
  ] },
];

const EXT_FOR: Ext[] = [
  { id: 'x1', title: '从 1996，一直到现在', need: 'always', steps: [
    T('t0', '', '先看这只盒子的三十年：', undefined, viz('clip', { shots: [['tc1.clipYears', 1]], dur: 13, cap: [[0, '1996　The students **buried** the box under the tree.'], [0.3, '叶子黄了又绿，绿了又黄：盒子一直在土里。'], [0.74, '2026　“It **has been** under this tree **for thirty years**!”']], marks: [[0.04, '1996'], [0.38, '2006'], [0.56, '2016'], [0.8, '2026 now']] })),
    C('t0a', '中文说“它在这棵树下三十年了”。为什么英语不说 It **is** under this tree for thirty years?', [
      ['*is 只说“现在在哪儿”，说不出“从那时到现在这一段”；要把过去和现在连起来，用 has been', '对：中文一个“了”字就带出了“到现在”，英语要靠 has been。'],
      ['可以这么说，意思一样', '这是中国同学最常犯的错：“在……三十年了”要说 has been … for thirty years。'],
    ], { keep: true }),
    T('t1', '', '这就是**现在完成时**：**have / has + 过去分词**（be → been）。它把过去和现在连在一起：从过去某个时候开始，一直延续到现在。说“多长时间”有两种说法：**for** + 一段时间（for thirty years、for two weeks、for a long time）；**since** + 起点（since 1996、since last Monday、since I was ten）。', ['It has been there **for** thirty years.（一段时间：三十年）', 'It has been there **since** 1996.（起点：从 1996 年起）']),
    So('a', 'for 还是 since？分一分。', ['for + 一段时间', 'since + 起点'], [
      ['thirty years', 0, '三十年：一段时间。'],
      ['1996', 1, '1996 年：从那一年算起。'],
      ['a long time', 0, '很久：一段时间。'],
      ['last Monday', 1, '上星期一：从那一天算起。'],
      ['two hours', 0, '两个小时：一段时间。'],
      ['I was ten', 1, '我十岁那年：从那时候算起——since 后面也能跟一句话。'],
    ]),
    T('t2', '', '再和**一般过去时**比一比。“三十年前埋下”是过去的一个时间点，用一般过去时 + ago；“在树下待了三十年、一直到现在”是一段时间，用现在完成时 + for。', ['It **was buried** thirty years **ago**.（三十年前：一个时间点）', 'It **has been** under the tree **for** thirty years.（三十年来：一直到现在）']),
    fill('b', '放进句子，有的词用不上。', ['for', 'since', 'ago', 'has been', 'is', 'in'], [
      ['The box has been under the tree ___ 1996.', 'since', '线索：1996 是起点——从那一年起：since。for 后面要跟一段时间，不跟年份。'],
      ['The box was buried thirty years ___.', 'ago', '线索：was buried，过去的一个时间点——三十年前：thirty years ago。'],
      ['My grandpa ___ a doctor for forty years. He still works in a small hospital.', 'has been', '线索：for forty years、He still works——当了四十年，现在还在当：has been。is 只说他现在是医生，说不出“四十年来”。'],
      ['I have lived in this city ___ ten years.', 'for', '线索：ten years 是一段时间：for。换成 in ten years，就成了“十年以后”，说的是将来。'],
    ]),
    type('c', '“How long has the box been under the tree?” 用 for 回答。', ['For thirty years.', 'For 30 years.', 'It has been under the tree for thirty years.', 'It has been under the tree for 30 years.', 'It has been there for thirty years.', 'It has been there for 30 years.'], 'How long 问“多长时间”：For thirty years.（也可以说 Since 1996.）', { 'Thirty years ago.': 'ago 说的是“三十年前”那个时间点；How long 问的是“多长时间”：For thirty years.', 'Since thirty years.': 'since 后面跟起点（since 1996）；一段时间用 for：For thirty years.' }, 'For …'),
  ] },
  { id: 'x2', title: '它现在还在树下吗？', need: 'opt', steps: [
    T('t1', '', '盒子被搬进了英语社活动室。这时候再说它在树下的那三十年，说法就要变了：', undefined, viz('clip', { shots: [['tc1.clipTree', 1], ['tc1.clipTable', 1]], dur: 10, cap: [[0, 'Under the tree:　“It **has been** here **for** thirty years!”（一直到现在）'], [0.5, 'In the clubroom:　“It **was** under the tree **for** thirty years.”（那三十年已经结束了）']], marks: [[0.05, 'under the tree'], [0.55, 'in the clubroom']] })),
    C('a', '“My grandpa **has lived** in Beijing for seventy years.” 爷爷现在住在哪儿？', [
      ['*还住在北京', '对：has lived … for——一直住到现在。'],
      ['早就搬走了', '搬走了要说 He lived in Beijing for seventy years.——那七十年已经过去了。'],
    ], { keep: true }),
    C('b', '“My grandma **lived** in Shanghai for ten years.” 奶奶现在还住在上海吗？', [
      ['*不住了：那十年已经结束了', '对：lived … for ten years，一段已经结束的时间。'],
      ['还住在上海', '还住在上海要说 She has lived in Shanghai for ten years.'],
    ], { keep: true }),
    C('c', '盒子已经摆在活动室的桌上了。Tao 跟来参观的人介绍：“This box ___ under the ginkgo tree for thirty years. We dug it up this morning.”', [
      ['*was', '对：盒子已经挖出来了，在树下的那三十年结束了——was。'],
      ['has been', 'has been 是“一直到现在”。可盒子已经不在树下了。'],
    ], { keep: true }),
  ] },
];

const EXT_CAPSULE: Ext[] = [
  { id: 'x1', title: '两个词，拼出一样新东西', need: 'always', steps: [
    T('t1', '', '**capsule** 本来是“小小的、密封的外壳”：药的胶囊是 capsule；飞船上载着航天员回到地面的返回舱，也叫 capsule。**time capsule**：把“时光”封在里面的小盒子。'),
    C('a', '“The **space capsule** landed safely in Inner Mongolia.” 说的是——', [
      ['*飞船的返回舱安全降落在内蒙古', '对：神舟飞船的返回舱就降落在内蒙古的着陆场。'],
      ['一粒太空药掉在了内蒙古', 'landed safely（安全着陆）——能载着航天员着陆的，是返回舱。'],
    ], { keep: true }),
    T('t2', '', '英语里，两个词常常拼成一个新词：**后面那个词说“它是什么东西”**，前面那个词说“什么样的、做什么用的”。time capsule 是一种 capsule（密封的盒子），装的是 time（时光）。', ['class + mate → **classmate**（同一个班的伙伴：同学）', 'home + work → **homework**（在家做的功课：家庭作业）', 'book + shelf → **bookshelf**（放书的架子：书架）']),
    Mt('b', '这些拼出来的词，各是什么？', ['**classmate**', '**raincoat**', '**bookshelf**', '**music box**', '**time capsule**'], ['放书的架子', '同一个班的同学', '会放音乐的小盒子', '挡雨的外套', '封着时光的盒子'], [1, 3, 0, 2, 4], '', { lh: '英语', rh: '是什么', whys: [
      'class（班）+ mate（伙伴）：同一个班的伙伴。',
      'rain（雨）+ coat（外套）：下雨时穿的外套——雨衣。',
      'book + shelf：shelf 是架子——它是一种架子，不是一种书。',
      'music + box：它是一种盒子，上好弦会放音乐——八音盒。',
      'time + capsule：它是一种密封的盒子，封着的是时光。',
    ] }),
    C('c', '照这个规律，**a key box** 和 **a box key**，哪个是“放钥匙的盒子”？', [
      ['*a key box', '对：后面的 box 说它是什么——一个盒子；前面的 key 说里面放什么。'],
      ['a box key', 'a box key 后面是 key：它是一把钥匙（开盒子用的）。'],
    ], { keep: true }),
  ] },
];

const EXT_WRITTEN: Ext[] = [
  { id: 'x1', title: 'was 还是 were；过去分词怎么变', need: 'always', steps: [
    T('t1', '', '被动句里的 be，要和主语对上：一样东西用 was（说现在用 is），好几样用 were（说现在用 are）。', ['The box **was** buried in 1996.（一只盒子）', 'The letters **were** written in English.（四十封信）']),
    C('a', '“The cassette tape ___ made in 1995.”', [
      ['*was', '对：一盘磁带，单数——was made。'],
      ['were', 'were 用在好几样东西后面；磁带只有一盘。'],
    ], { keep: true }),
    T('t2', '', '被动要用**过去分词**。规则的词加 -ed：bury → buried，open → opened，use → used。常用的不规则词，要一个一个记：write — wrote — **written**，build — built — **built**，find — found — **found**，give — gave — **given**，hide — hid — **hidden**。'),
    Mt('b', '原形和过去分词连起来。', ['write', 'build', 'find', 'give', 'bury'], ['buried', 'given', 'found', 'built', 'written'], [4, 3, 2, 1, 0], '', { lh: '原形', rh: '过去分词', whys: [
      'write → wrote → written：过去分词多了 -ten，中间的 t 要双写。',
      'build → built → built：d 换成 t，过去式和过去分词一样。',
      'find → found → found：过去式和过去分词一样。',
      'give → gave → given：过去分词在原形后面加 -n。',
      'bury → buried：规则变化，y 变成 i，再加 -ed。',
    ] }),
    C('c', '两句话，各填什么？\nA. Forty students ___ these letters.\nB. These letters ___ by forty students.', [
      ['*A 填 wrote，B 填 were written', '对：A 从学生说起（主动），学生写了信；B 从信说起（被动），信被学生写。'],
      ['A 填 were written，B 填 wrote', '反了：学生是写信的人，用主动 wrote；信是被写的，用被动 were written。'],
      ['两句都填 wrote', 'B 的主语是信，信自己不会写字：要用 were written。'],
    ], { keep: true }),
    Wr('d', '用被动写一句：说说你身边的一样东西，是什么时候、在哪儿、或者被谁做（建、写、送）的。', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence in the passive voice about a real thing around them (a building, a book, a gift, a photo, food…), saying when / where / by whom it was made, built, written, given, etc.',
      criteria: ['uses the passive correctly: was / were / is / are + past participle', 'be agrees with the subject (was for one thing, were for more than one)', 'a sensible, real-life sentence with correct spelling'],
      examples: ['Our school library was built in 2010.', 'This watch was given to me by my grandpa.', 'Camel Xiangzi was written by Lao She.', 'These dumplings were made by my mom.'],
      words: ['was / were', 'built / made / written / given', 'in … / by …'], frame: 'This ______ was ______ in / by ______.', ph: 'This … was …',
    }),
  ] },
];

const EXT_WILL: Ext[] = [
  { id: 'x1', title: '猜将来：will', need: 'always', steps: [
    T('t0', '', '先看一封 1996 年的信，和它的三十年：', undefined, viz('clip', { shots: [['tc1.clipWill96', 1], ['tc1.clipWill26', 1]], dur: 11, cap: [[0, '1996　A girl writes: “In 2026, cars **will fly**.”（她在猜将来）'], [0.52, '2026　Cars **don’t fly**. Tao **is** still waiting.（现在真实的样子）']], marks: [[0.05, '1996'], [0.55, '2026']] })),
    C('t0a', '1996 年写这封信的时候，会飞的汽车——', [
      ['*还没有出现：will fly 只是她的猜想', '对：will 说的是还没发生的事。'],
      ['已经满街都是了', '要是那时满街都是，她就会写 Cars fly.（一般现在时：现在就是这样）'],
    ], { keep: true }),
    T('t1', '', '**will + 动词原形**：will fly、will have、will be。不管主语是谁，will 都不变，后面的动词也不加 s、不加 -ing、不带 to。否定是 **won’t**（= will not）。', ['Cars **will fly**.', 'Every family **will have** a robot.', 'People **won’t** write letters.']),
    C('a', '哪一句写对了？', [
      ['*In 2056, robots **will help** old people at home.', '对：will + 原形 help。'],
      ['In 2056, robots **will helps** old people at home.', 'will 后面的动词不加 s。'],
      ['In 2056, robots **will helping** old people at home.', 'will 后面不跟 -ing。'],
      ['In 2056, robots **will to help** old people at home.', 'will 后面不带 to。'],
    ], { keep: true }),
    T('t2', '', '预测有的很有把握，有的只是猜猜。英语用几个小词说出“有多肯定”：', undefined, viz('scale', { left: ['Maybe … will …'], mid: ['I think … will …', '… will probably …'], right: ['I’m sure … will …', '… will definitely …'], lt: '只是猜猜', rt: '很有把握' })),
    C('b', '哪一句说得最有把握？', [
      ['*I’m sure people **will** still read books in 2056.', '对：I’m sure——我敢肯定。'],
      ['Maybe people **will** live on the Moon in 2056.', 'Maybe——也许吧，只是猜猜。'],
      ['I think it **will** rain tomorrow.', 'I think——我觉得，有几分把握，还算不上肯定。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['will be', 'will have', 'won’t', 'will', 'wills', 'are'], [
      ['In 2056, there ___ a robot in every classroom.', 'will be', '线索：there + 将来——将来会有：there will be。不说 there will have；there are 说的是现在有。'],
      ['I think every student ___ a computer at home.', 'will have', '线索：every student 将来会拥有——某人将会有：will have。'],
      ['Don’t worry. It ___ rain tomorrow — look at the blue sky!', 'won’t', '线索：Don’t worry、blue sky——明天不会下雨：won’t（= will not）。'],
      ['Practise every day, and you ___ get better!', 'will', '线索：说将来会怎样：will + get。will 永远不变形，没有 wills。'],
    ]),
  ] },
  { id: 'x2', title: 'will 的另外两张脸', need: 'opt', steps: [
    T('t1', '', 'will 不只是“猜将来”。**won’t** 还能说“不肯、怎么也不”：My little brother **won’t** eat carrots.（弟弟就是不肯吃胡萝卜。）东西也能“不肯”：The car **won’t** start.（车怎么也发动不起来。）'),
    C('a', '“The door **won’t** open!” 意思是——', [
      ['*门怎么也打不开', '对：眼前这扇门就是推不开。'],
      ['门将来不会开', '这里不是预测将来，说的是现在这扇门推不开。'],
    ], { keep: true }),
    T('t2', '', 'will 还能当名词：**意志、决心**。有一句谚语：Where there’s a **will**, there’s a way.'),
    C('b', '“Where there’s a will, there’s a way.” 意思最接近——', [
      ['*有志者，事竟成', '对：只要有决心（will），就能找到办法（way）。'],
      ['有遗嘱的地方就有路', 'will 作名词也有“遗嘱”的意思，可这句谚语说的是决心。'],
    ], { keep: true }),
  ] },
];

const EXT_SORT: Ext[] = [
  { id: 'x1', title: '成真了：come true', need: 'always', steps: [
    T('t1', '', '一个预测、一个梦想“实现了、成真了”，英语说 **come true**（过去式 came true）。站在 2026 年回头看三十年前的预测，常用现在完成时——从说出口那天，一直算到现在：', ['That prediction **has come true**.（成真了：现在就是这样）', 'It **hasn’t come true yet**.（到现在还没有）', 'His dream **came true** in 2020.（说出了过去的具体时间：一般过去时）']),
    C('a', 'Tao 说：“Flying cars? I’m still waiting for mine!” 他的意思，换成一句完整的话——', [
      ['*That prediction **hasn’t come true yet**.', '对：到现在为止，还没成真。yet 放在否定句末尾：还（没有）。'],
      ['That prediction **didn’t come true in 1996**.', '1996 年本来就没人指望它成真——他要说的是“到现在还没有”。'],
      ['That prediction **will come true yesterday**.', 'will 说将来，yesterday 是过去，放在一起说不通。'],
    ], { keep: true }),
    C('b', '“Has the prediction about phones come true?” 最好的回答是——', [
      ['*Yes, it has. Almost everyone has a smartphone now.', '对：Has …? → Yes, it has. 再说说现在的样子。'],
      ['Yes, it did. Almost everyone has a smartphone now.', '问句用 Has，回答也用 has。'],
      ['Yes, it will.', '它已经成真了，不是将来的事。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['come true', 'came true', 'already', 'yet', 'comes'], [
      ['His dream ___ in 2020: he became a pilot.', 'came true', '线索：in 2020，过去的具体时间——用一般过去时 came true。'],
      ['I hope your wish will ___ one day.', 'come true', '线索：will 后面跟原形：will come true。comes 只用在说现在、主语是 he / she / it 的时候；will 后面不加 s。'],
      ['We have ___ read half of the letters. Let’s read the rest!', 'already', '线索：have read half——已经读了一半：already 放在 have 后面。yet 用在否定句和问句的末尾。'],
      ['Holidays on the Moon? That hasn’t happened ___.', 'yet', '线索：hasn’t happened——到现在还没有：否定句末尾用 yet。'],
    ]),
  ] },
];

const EXT_WRITE: Ext[] = [
  { id: 'x1', title: '好的预测：具体，有理由', need: 'always', steps: [
    T('t1', '', '盒子里最准的一个预测，不是乱猜出来的：写信的人先看到了一个变化，再往前推了一步。', ['Computers are getting smaller every year, **so** in 2026 a computer **will fit** in my pocket.（看到变化 → 往前推一步：后来真的有了智能手机）']),
    C('a', '这两句预测，哪一句更好？', [
      ['*In 2056, more old people will live alone, so robot helpers will be common in homes.', '对：先说一个正在发生的变化，再往前推一步——具体、有理由。'],
      ['In 2056, everything will be very good.', '太笼统：什么东西会怎样好？为什么这么想？'],
    ], { keep: true }),
    C('b', '给这句预测配一个说得通的理由：“In 2056, more people will work from home, because ___.”', [
      ['*the internet makes it easy to work anywhere', '对：有了网络，在哪儿都能工作——这个变化今天就能看到。'],
      ['people will drive flying cars to their offices', '开着飞车去办公室，正说明他们没在家工作——和前半句矛盾。'],
      ['there will be no homework', '没有作业，和大人在家工作扯不上关系。'],
    ], { keep: true }),
    T('t2', '', '说“不会”用 **won’t**；还可以用 I think、Maybe 说出你有多肯定。英语里说“我认为……不会……”，更常把“不”放到 think 前面：I **don’t think** people will use cash in 2056.——听起来更委婉。'),
    C('c', '“我想，2056 年的人不会再用现金了。”哪一句写对了？', [
      ['*I think people **won’t use** cash in 2056.', '对：won’t + 原形 use。说成 I don’t think people will use cash in 2056. 更委婉，也对。'],
      ['I think people **will not to use** cash in 2056.', 'will not 后面直接跟原形，不带 to。'],
      ['I think people **don’t will use** cash in 2056.', '没有 don’t will 这种说法：will 的否定就是 won’t（will not）。'],
    ], { keep: true }),
  ] },
];

const EXT_ACCIDENT: Ext[] = [
  { id: 'x1', title: '不是故意的', need: 'always', steps: [
    T('t1', '', '**accident**：没打算、没想到就发生了的事，多半不是好事。中文要看场合来翻：', ['Sorry, it was an **accident**!（对不起，我不是故意的！）', 'There was a car **accident** on the road.（路上出了车祸。）', 'He had an **accident** and broke his arm.（他出了意外，摔断了胳膊。）']),
    C('a', '你打球时，球不小心砸碎了邻居的窗户。你跑过去说——', [
      ['*I’m so sorry! It was an **accident**. I’ll pay for the window.', '对：先道歉，再说明不是故意的，最后说怎么补救。'],
      ['It was an **accident**. Goodbye!', '光说“不是故意的”就走，太不负责了：先说 sorry，再想办法补救。'],
    ], { keep: true }),
    C('b', '“There was an **accident** at the crossing this morning. Two cars hit each other.” 这里的 accident 是——', [
      ['*车祸、交通事故', '对：两辆车撞到了一起。'],
      ['不小心弄坏的东西', '两辆车相撞，中文要说“车祸、交通事故”。'],
    ], { keep: true }),
    T('t2', '', '说“不是故意的”，英语还有一句很常用的话：**I didn’t mean to.**（我不是有意的。）mean to do：有意要做。', ['Sorry! I didn’t mean to wake you up.（对不起，我不是有意吵醒你的。）']),
    C('c', '你不小心踩了同学一脚。最自然的是——', [
      ['*Oh, sorry! I didn’t mean to.', '对：马上道歉，再说不是有意的。'],
      ['Oh, sorry! I didn’t mean.', 'mean to 后面的 to 不能丢：I didn’t mean to.'],
      ['Oh, sorry! It was a car accident.', '踩了一脚，可不是车祸。'],
    ], { keep: true }),
    C('d', '写信的人先写 I did it，再写 but it was an accident。她为什么先承认“是我弄的”？', [
      ['*先认下自己做的事，再解释——这样的道歉，才让人相信', '对：只说“不是故意的”却不认，听起来像在推卸。'],
      ['因为她想让 Chen Yu 更生气', '整封信都在想怎么道歉、怎么和好。'],
    ], { keep: true }),
  ] },
];

const EXT_SMUDGE: Ext[] = [
  { id: 'x1', title: '看不清的字，靠上下文猜', need: 'always', steps: [
    T('t1', '', '读英语时，碰上看不清的字、不认识的词，先别慌：前后的句子常常给出线索——前面说了什么、后面说了什么、整段话想干什么。'),
    C('a', '盒子里另一封信也洇了一处：“It was raining hard, so I took my ▒▒▒▒▒▒.” 被洇掉的最可能是——', [
      ['*umbrella', '对：线索是 raining hard（雨下得很大）——出门带的是伞。'],
      ['sunglasses', '下大雨，用不着墨镜。'],
      ['homework', '带作业和下雨没关系，so 前后连不上。'],
    ], { keep: true }),
    C('b', '不认识的词也能猜：“The old tape was so **crackly** that we could hardly hear the song — just pops and hisses.” crackly 最可能是——', [
      ['*噼里啪啦、全是杂音的', '对：线索是 could hardly hear the song（几乎听不清歌）和 pops and hisses（噼啪声、嘶嘶声）。'],
      ['又新又清楚的', '那就不会听不清了。'],
    ], { keep: true }),
    T('t2', '', '再回到那封粉色的信：猜被洇掉的字，不光看前一句，还要看整封信——写给谁、想干什么、为什么把钥匙放进来。'),
    C('c', '那把小钥匙，写信的人最希望它——', [
      ['*回到 Chen Yu 手里，让八音盒重新响起来', '对：钥匙和道歉，都是为了让坏掉的事情重新好起来。'],
      ['永远埋在土里，谁也别找到', '她写了 If you find her, please give it to her——她盼着有人把它交出去。'],
    ], { keep: true }),
    C('d', 'Under it, you can only read one letter: “F”. 这个 “F” 最可能是——', [
      ['*写信人名字的第一个字母', '对：信的末尾一般是署名。F 是写信人名字的开头——这是找到她的第一条线索。'],
      ['Friday（星期五）', '信的最后、署名的地方，最可能是名字。'],
      ['成绩等级 F（不及格）', '没有人会在道歉信的末尾给自己打分。'],
    ], { keep: true }),
  ] },
];

const EXT_ORDER: Ext[] = [
  { id: 'x1', title: '说时间：in、on、ago、for、since', need: 'always', steps: [
    T('t1', '', '这一章里，说时间的小词特别多。换一个小词，意思就不一样：', ['**in** 1966、**in** June（年、月：in）', '**on** June 28, 1996、**on** Monday（具体哪一天：on）', 'thirty years **ago**（多久以前：过去的一个时间点）', '**for** thirty years、**since** 1996（到现在为止：多长时间；从哪儿算起）']),
    fill('a', '放进句子，有的词用不上。', ['in', 'on', 'ago', 'since', 'for', 'at'], [
      ['Our school was built ___ 1966.', 'in', '线索：1966 是年份——年、月前面用 in。具体的钟点才用 at（at 7:50）。'],
      ['The box was buried ___ June 28, 1996.', 'on', '线索：June 28 是具体的哪一天——日子前面用 on。只说 June 可以用 in June；加上了 28 号，就要用 on。'],
      ['My grandpa came to Beijing fifty years ___.', 'ago', '线索：came，过去的一个时间点——五十年前：fifty years ago。'],
      ['The box has been under the tree ___ 1996.', 'since', '线索：has been + 1996（起点）——since。for 后面跟一段时间（for thirty years），不跟年份。'],
    ]),
    C('b', '“The school is sixty years old.” 换个说法——', [
      ['*The school was built sixty years **ago**.', '对：sixty years ago，六十年前（建的）。'],
      ['The school was built **for** sixty years.', 'for sixty years 是“持续六十年”，和“建成”这个一下子的动作放不到一起。'],
      ['The school was built **since** sixty years.', 'since 后面跟起点（since 1966），不跟一段时间。'],
    ], { keep: true }),
    C('c', '1966 年建校，一直到今天。用 since 怎么说？', [
      ['*The school has been here **since** 1966.', '对：since + 起点，配上 has been，一直说到现在。'],
      ['The school was here **since** 1966.', 'since 一直说到现在，要和现在完成时（has been）连用。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '用英语说说这一章', need: 'opt', steps: [
    frag('用英语讲讲第一章：挑句子，拼成一段话。', [
      ['*Workers found a rusty box under the old ginkgo tree.', 1, 'found', { seq: 0 }],
      ['*It was buried in 1996, so it has been there for thirty years.', 1, 'time', { seq: 0 }],
      ['*Inside, there were forty letters written in English, but one pink letter was different.', 1, 'letters', { seq: 1 }],
      ['*In it, someone said sorry to her best friend, Chen Yu: the music box fell, but it was an accident.', 1, 'sorry', { seq: 2 }],
      ['The box was found in 1996.', 1, '1996 年是埋下的年份；盒子是 2026 年才被挖出来的。'],
      ['All the letters were written to Chen Yu.', 1, '只有粉色的那一封是写给 Chen Yu 的；其他的都写给“2026 年的同学”。'],
      ['The writer broke the music box on purpose.', 1, '信里说 it was an accident——不是故意的。'],
      ['*But the last line is smudged, so nobody knows what she wanted to say.', 2, undefined, { after: 'sorry' }],
      ['*We only know that her name starts with “F”.', 2, undefined, { after: 'sorry' }],
      ['So the writer is Chen Yu.', 2, '信是写给 Chen Yu 的；写信的人，名字以 F 开头。'],
      ['So the story is over.', 2, '故事才刚开始。'],
      ['*Now we want to find Chen Yu — and “F” — after thirty years.', 3],
      ['Now we will bury the box again and forget it.', 3, '大家都想找到 Chen Yu，可没人想把盒子埋回去。'],
    ], { found: '还没说发生了什么：挖出了什么？', time: '还没说这只盒子埋了多久。', letters: '还没说盒子里有什么。', sorry: '还没说那封粉色的信写了什么。' },
    { 1: '先说说发生了什么：挖出了什么、里面有什么、粉色的信写了什么。', 2: '事情都说对了。再说说：信里还有什么让人放不下？', 3: '最后说说：接下来要做什么？' },
    'Workers found a rusty box under the old ginkgo tree. It was buried in 1996, so it has been there for thirty years. Inside, there were forty letters written in English, but one pink letter was different. In it, someone said sorry to her best friend, Chen Yu: the music box fell, but it was an accident. But the last line is smudged, so nobody knows what she wanted to say. We only know that her name starts with “F”. Now we want to find Chen Yu — and “F” — after thirty years.'),
  ] },
];

// ---------------- 题 ----------------
export const PLAY_EC1_ITEMS: Item[] = [
  item({
    id: 'c1-rusty', st: 'ec1', lv: 1, type: 'word', topic: 'rusty', label: 'a rusty metal box', intro: '', ask: 'rust 和 rusty 有什么关系？',
    hints: ['铁盒在湿土里埋了很久。红褐色的那一层，是什么？'],
    explain: 'rusty：生锈的。rust 是铁锈（名词），加上 -y 就成了形容词“生锈的”。铁盒在潮湿的土里埋了三十年，表面全是红褐色的锈。',
    know: '铁生锈要有水和空气。埋在潮湿的土里，铁盒最容易生锈——所以后来做时间胶囊，常用不锈钢、铜或者密封的塑料盒。',
    lock: { words: ['rusty'] },
    ext: EXT_RUSTY,
  }, C('a', 'It’s a metal box, red-brown and **rusty**. rusty 是——', [
    ['*生锈的', '对：铁碰上水和空气，就会生出红褐色的锈（rust）。在湿土里埋得越久，锈得越厉害。'],
    ['布满灰尘的', '布满灰尘是 dusty。盒子刚从土里挖出来，身上是泥和锈，不是灰。'],
    ['沾满泥的', '沾满泥是 muddy。泥已经被工人拂掉了（brushes off the soil），剩下的红褐色是锈。'],
    ['年代久远的', 'rusty 说的是表面生了锈，不是年头长——不过盒子锈成这样，正说明它埋了很久。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c1-mis', st: 'ec1', lv: 2, type: 'mis', topic: 'AI 误译', label: 'AI 眼镜译错了标签', intro: '', ask: 'Grade 9 是几年级？',
    hints: ['点一点标签上的 Class、Grade、Open，想想它们写在这只盒子上是什么意思。', '标签是写给谁看的？写给“将来打开它的人”。'],
    explain: 'AI 眼镜只按每个词最常见的意思去翻，没想到这是贴在一个班埋下的盒子上的标签：Class 3, Grade 9 是“初三（3）班”，不是“第三节课，成绩九级”；Open in 2026 是“请在 2026 年打开”，不是“2026 年开业”。',
    lock: { words: ['Class 3, Grade 9', 'Open in 2026'], lines: ['label'] },
    ext: EXT_MIS,
  }, M('a', 'AI 眼镜的译文有几处不对。点出来，改对。', 'Class 3, Grade 9. Buried on June 28, 1996. Open in 2026.', [
    ['第三节课，', 'Class 3', ['*（初三）3 班', '第三节课', '第三类'], 'class 有“课”的意思（an English class：一节英语课），也有“班”的意思。标签上它和 Grade 9 连在一起，说的是哪个班：3 班。'],
    ['成绩九级。', 'Grade 9', ['*九年级（初三）', '成绩九级', '九度的坡'], 'grade 可以是“成绩、等级”（get a good grade：考个好成绩），也可以是“年级”。和 Class 3 连在一起，说的是年级：Grade 9 就是九年级，也就是初三。'],
    '1996 年 6 月 28 日埋下。',
    ['2026 年开业。', 'Open in 2026', ['*请在 2026 年打开', '2026 年开业', '2026 年一直开着'], '商店说 We’re open，才是“营业”。这张标签贴在要埋进土里的盒子上，Open 是写给将来的人看的：请在 2026 年打开它。'],
  ], 'AI 眼镜的译文')),

  item({
    id: 'c1-buried', st: 'ec1', lv: 2, type: 'tense', topic: 'passive: was buried', label: 'Buried on June 28, 1996', intro: '', ask: '什么时候用被动语态？',
    hints: ['盒子自己会埋东西吗？它是去埋别的东西，还是被埋？', '1996 年的事，be 要用过去式。'],
    explain: '标签上的 Buried on June 28, 1996，补完整是 This box was buried on June 28, 1996.——盒子是“被埋”的：be（was）+ 过去分词（buried）。这就是被动语态：把“东西”放在前面，说它被怎么样了；是谁做的，可以不说——标签上就没写是谁埋的。',
    lock: { words: ['Buried'] },
    ext: EXT_BURIED,
  }, C('a', '标签上只写了 **Buried** on June 28, 1996，前面省掉了几个词。补成完整的一句，是——', [
    ['*This box **was buried** on June 28, 1996.', '对：盒子是被埋的——was（过去）+ buried（过去分词）。'],
    ['This box **buried** on June 28, 1996.', '这成了“这只盒子在 1996 年埋了（别的东西）”——盒子自己不会埋东西。它是被埋的：was buried。'],
    ['This box **is buried** on June 28, 1996.', 'is 说的是现在；June 28, 1996 是过去的一天，be 要用过去式 was。'],
    ['This box **was bury** on June 28, 1996.', 'was 后面要跟过去分词 buried，不能跟原形 bury。'],
    ['We **were buried** on June 28, 1996.', '这成了“我们在 1996 年被埋了”！被埋的是盒子，不是人。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c1-for', st: 'ec1', lv: 2, type: 'tense', topic: 'has been … for', label: 'has been under this tree for thirty years', intro: '', ask: 'for 和 since 怎么分？',
    hints: ['1996 年埋下以后，盒子挪过地方吗？一直待到什么时候？'],
    explain: 'has been … for thirty years：从 1996 年一直到现在，整整三十年。现在完成时（have / has + 过去分词）把过去和现在连在一起：从过去开始，一直延续到现在。for + 一段时间（for thirty years），since + 起点（since 1996）。',
    lock: { words: ['has been under this tree for thirty years'] },
    ext: EXT_FOR,
  }, C('a', '胡老师说 It has been under this tree for thirty years! 意思是——', [
    ['*从 1996 年埋下，它就一直在这棵树下，直到今天：整整三十年', '对：has been … for thirty years——从过去一直延续到现在。'],
    ['三十年前，它在这棵树下待过（现在早就不在了）', '那要说 It was under this tree thirty years ago.——只说过去那时候，和现在没关系。'],
    ['它还要在这棵树下再待三十年', '说将来要用 will：It will be under this tree for another thirty years.'],
    ['它每过三十年就被埋一次', 'for thirty years 是“持续三十年”，不是“每三十年”。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c1-capsule', st: 'ec1', lv: 1, type: 'word', topic: 'time capsule', label: 'It’s a time capsule!', intro: '', ask: '时间胶囊里一般放什么？',
    hints: ['盒子 1996 年埋下，标签写着 Open in 2026——它是留给谁的？'],
    explain: 'time capsule：时间胶囊——把“现在”的东西（信、照片、小物件）装进盒子，封好、埋起来，留给将来的人打开。capsule 本来是“小小的密封外壳”，药的胶囊、飞船的返回舱都叫 capsule。',
    know: '最有名的时间胶囊之一，是 1939 年纽约世界博览会上埋下的，约好要到 6939 年才打开——整整五千年以后。',
    lock: { words: ['time capsule'] },
    ext: EXT_CAPSULE,
  }, C('a', '胡老师说 It’s a **time capsule**! time capsule 是——', [
    ['*装着“现在”的东西、封好留给将来的人打开的盒子', '对：1996 年的同学把信和照片封进去，写明 2026 年打开——留给三十年后的人。'],
    ['能把人送回过去的机器', '那是 time machine（时光机），科幻小说里才有。'],
    ['一种吃了能让人变年轻的药', 'capsule 确实可以是“胶囊（药）”，可这是从土里挖出来的铁盒子。'],
    ['一个记录时间的钟', '钟是 clock。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c1-written', st: 'ec1', lv: 2, type: 'tense', topic: 'passive: were written', label: 'They were all written in English', intro: '', ask: 'was 和 were 怎么选？',
    hints: ['信是自己写自己吗？', '四十封信，是一样东西还是好几样？'],
    explain: 'The letters were written by the students：信是“被写”的，用被动；letters 是复数，be 用 were；write 的过去分词是 written。',
    lock: { words: ['were all written'] },
    ext: EXT_WRITTEN,
  }, C('a', 'Tao 说 They were all written in English! 用英语说“这些信是 1996 年的学生写的”——', [
    ['*The letters **were written** by the students of 1996.', '对：信是被写的——were（复数、过去）+ written（过去分词）。'],
    ['The letters **wrote** by the students of 1996.', '成了“信写了……”——信自己不会写字。要用被动：were written。'],
    ['The letters **was written** by the students of 1996.', 'letters 是复数，be 用 were，不用 was。'],
    ['The students of 1996 **were written** the letters.', '成了“学生被写了”——主语放错了：被写的是信。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c1-will', st: 'ec1', lv: 1, type: 'read', topic: 'will: predictions', label: 'every family will have a robot', intro: '', ask: 'will 和 want 有什么不一样？',
    hints: ['这封信是哪一年写的？写信的人，那时候能看到 2026 年吗？'],
    explain: 'In 2026, every family will have a robot：1996 年的同学在猜三十年后的样子。will + 动词原形，说将来会怎样——常常是一个预测、一个猜想。',
    lock: { words: ['will have'] },
    ext: EXT_WILL,
  }, C('a', '1996 年的同学写：“In 2026, every family **will have** a robot.” 他是在说——', [
    ['*他猜三十年后，每家都会有一个机器人', '对：will + 动词原形，说将来会怎么样。他在预测 2026 年。'],
    ['他想要一个机器人当礼物', '“想要”是 want：I want a robot. will 不是“想要”。'],
    ['1996 年他家就有一个机器人', '说当时的事，要说 Every family has a robot.（一般现在时）'],
    ['他要求每家都去买一个机器人', '要求别人做事，要用 must、should；will 只是说将来会怎样。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c1-sort', st: 'ec1', lv: 2, type: 'sort', topic: 'predictions: came true?', label: '1996 年的预测成真了吗', intro: '', ask: '1996 年的时候，手机是什么样子？',
    hints: ['想想你家里有什么、街上能看到什么。', '“部分成真”：有是有了，可没有信里写的那么厉害。'],
    explain: '手机、发消息这些早就成真了；扫地机器人、网课、手写信越来越少——只成真了一部分；会飞的汽车、去月球度假、没有作业——到现在还没有。',
    know: '1996 年，手机（人们叫它“大哥大”）又大又贵，用得起的人很少；互联网刚刚进入中国，绝大多数人还没发过一封电子邮件。',
    ext: EXT_SORT,
  }, So('s', '1996 年的这些预测，到 2026 年成真了吗？分一分。', ['成真了', '部分成真', '还没有'], [
    ['“We will carry phones in our pockets — and they will take photos!”', 0, '智能手机：几乎人手一部，还能拍照。'],
    ['“We will send letters to friends in other countries in one second.”', 0, '电子邮件、微信：一按发送，世界那头马上就收到了。'],
    ['“Every family will have a robot. It will cook and clean.”', 1, '扫地机器人已经很常见；可会做饭、样样都干的机器人，家里还没有。'],
    ['“Nobody will write letters anymore.”', 1, '手写信确实少多了，可还有人写——这只盒子里就有四十封。'],
    ['“Students will have lessons at home on computers.”', 1, '网课有了，有时候也在家上；可大家还是天天到学校上课。'],
    ['“Cars will fly, and there will be no traffic jams.”', 2, '有人在试飞会飞的汽车，可街上照样堵车——Tao 还在等他的那一辆。'],
    ['“We will spend our holidays on the Moon.”', 2, '登上过月球的只有少数航天员，去月球度假还没有实现。'],
    ['“There will be no homework!”', 2, '还没有。'],
  ])),

  item({
    id: 'c1-write', st: 'ec1', lv: 2, type: 'write', topic: 'will: my prediction', label: '给 2056 年写一句预测', intro: '', ask: '怎样让一个预测更有意思？',
    hints: ['用 In 2056, … will … 写一句。', '想想你最关心的事：学校、交通、看病、运动、动物……三十年后会怎样？'],
    explain: '预测用 will + 动词原形：In 2056, … will …。好的预测要具体，最好还能说出为什么这么想。',
    ext: EXT_WRITE,
  }, Wr('w', 'Write one prediction for 2056: In 2056, … will … (one sentence)', {
    lang: 'en', role: 'en',
    task: 'In a story, students in 2026 have just read predictions that students wrote in 1996 for 2026 (flying cars, robots, no homework…). Now the student writes ONE English sentence predicting life in 2056, thirty years from now, using will / won’t + base verb. A reason (because / so) is welcome but not required.',
    criteria: ['uses will / won’t + the base form of the verb correctly (not “will goes / will going / will to go”)', 'a clear, specific prediction about 2056 (not just “life will be good”)', 'a complete sentence with correct spelling and word order; a reason with because / so is a plus'],
    examples: ['In 2056, doctors will use tiny robots to make people better.', 'In 2056, people won’t need keys, because doors will know our faces.', 'In 2056, students will have some lessons with AI teachers, but they will still go to school to meet their friends.'],
    words: ['In 2056,', 'will / won’t', 'because'], frame: 'In 2056, ______ will ______.', ph: 'In 2056, …',
  })),

  item({
    id: 'c1-accident', st: 'ec1', lv: 1, type: 'word', topic: 'accident', label: 'it was an accident', intro: '', ask: 'accident 一定是“事故”吗？',
    hints: ['写信的人说 I did it — but…（是我弄的，可是……）。她想说清楚什么？'],
    explain: 'accident：没打算、没想到就发生了的事——不是故意的。中文要看场合翻：意外、不小心、事故（a car accident 是车祸）。写信的人说 it was an accident：八音盒是她不小心碰掉的。',
    lock: { words: ['accident'] },
    ext: EXT_ACCIDENT,
  }, C('a', '写信的人说：I did it — but it was an **accident**. 她的意思是——', [
    ['*是我弄掉的，可我不是故意的', '对：accident 是没打算、没想到就发生的事。'],
    ['那是一场交通事故', 'accident 可以指车祸（a car accident），可这里说的是八音盒从桌上掉下去。'],
    ['是别人弄的，不是我', '她自己说了 I did it（是我弄的）。'],
    ['那天正好赶上一件大事', 'accident 不是“大事件”，是没想到、不小心发生的事。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c1-smudge', st: 'ec1', lv: 2, type: 'read', topic: 'inference', label: '被水洇掉的那一行', intro: '', ask: '信的最后一行，你觉得写的是什么？',
    hints: ['往前看：她说自己 don’t know how to say sorry，又叫 Chen Yu my best friend。', '她把钥匙放进信封，是想让什么事发生？'],
    explain: '整封信都在说一件事：她想道歉，想和好。所以被洇掉的那一行，最可能是“我很抱歉，我还想做她的朋友”。可它到底写了什么，谁也不知道——除非找到她。',
    ext: EXT_SMUDGE,
  }, C('a', '“…please give it to her and tell her —” 后面被水洇掉的那一行，最可能写的是——', [
    ['*I’m sorry, and I still want to be her friend.', '对：信里说她 don’t know how to say sorry，又叫 Chen Yu my best friend——她最想托人带去的话，就是道歉、和好。'],
    ['I broke it on purpose.', '和信里的话矛盾：她说 it was an accident（不是故意的）。'],
    ['I am moving to Shanghai.', '要搬去上海的是 Chen Yu 一家：Her family is moving to Shanghai.'],
    ['I never want to see her again.', '那她就不会叫 Chen Yu my best friend，也不会把钥匙留给她了。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c1-order', st: 'ec1', lv: 1, type: 'order', topic: 'timeline', label: '这只盒子的时间线', intro: '', ask: '为什么要先把时间线排出来？',
    hints: ['学校今年六十岁：哪一年建的？', '信上说八音盒是“两个星期前”掉的——是埋盒子以前，还是以后？'],
    explain: '1966 年建校 → 1996 年 6 月中旬，八音盒掉了，两个好朋友不说话了 → 6 月 28 日，信封进盒子、埋在树下 → 2026 年的星期一，盒子被挖出来 → 星期六，学校六十周年（还没到）。',
    ext: EXT_ORDER,
  }, Od('o', '按真实发生的先后，排一排。', [
    'Our school was built.',
    'A music box fell off a desk, and two best friends stopped talking.',
    'The box was buried under the ginkgo tree, with the pink letter inside.',
    'Workers dug up the box.',
    'Our school will celebrate its 60th anniversary.',
  ], '1966 年建校 → 1996 年 6 月中旬，八音盒掉了 → 6 月 28 日，埋下盒子 → 2026 年星期一，挖出来 → 星期六，校庆（还没到）。', ['1966', 'mid-June 1996', 'June 28, 1996', 'Monday', 'Saturday'])),

  // ---------------- 支线任务：可做可不做（补词汇：词族、易混的词） ----------------
  item({
    id: 'c1-x-anni', st: 'ec1', lv: 2, type: 'word', topic: 'anniversary / birthday', label: 'anniversary 和 birthday', intro: '', ask: '60th 怎么读？',
    hints: ['人过生日；学校建校、两个人结婚，过的是什么？'],
    explain: 'anniversary：周年纪念——一件事发生以后，每到那一天就纪念一次（建校、结婚、公司成立）。人出生的那一天是 birthday。60th 读作 sixtieth（第六十）。',
  },
    T('t1', '', '“our school’s **60th anniversary**”——**anniversary** 是“周年纪念”：一件事发生以后，每年的那一天都纪念它。学校建校、公司成立、两个人结婚，过的都是 anniversary；人出生的那一天，过的是 **birthday**。'),
    C('a', '爸爸妈妈结婚二十年了。这一天是他们的——', [
      ['*20th wedding anniversary', '对：结婚纪念日是 wedding anniversary。'],
      ['20th wedding birthday', 'birthday 只说人（或动物）出生的那一天。'],
    ], { keep: true }),
    C('b', '校庆海报上写着：“Happy 60th birthday, our school!” 这么写——', [
      ['*可以：把学校当成人来“过生日”，很亲切；正式的说法是 the school’s 60th anniversary', '对：海报、贺卡上常这样拟人。正式场合（讲话、新闻）说 anniversary。'],
      ['完全错了，学校不能过生日', '拟人的说法很常见，写在海报上很亲切；只是正式场合用 anniversary。'],
    ], { keep: true }),
    T('t2', '', '“第几”要用序数词：1st（first）、2nd（second）、3rd（third），其余大多加 -th：4th（fourth）、20th（twentieth）、60th（sixtieth）。twenty、sixty 这种 -ty 结尾的，先把 y 变成 ie，再加 -th。'),
    fill('c', '放进句子，有的词用不上。', ['first', 'third', 'twentieth', 'sixtieth', 'sixty', 'three'], [
      ['Our school is sixty years old. This is its ___ anniversary.', 'sixtieth', '线索：第六十个周年——序数词 sixtieth（sixty 的 y 变 ie，再加 th）。sixty 是基数词“六十”，说不出“第六十”。'],
      ['Tao came ___ in the drawing contest and won the bronze medal.', 'third', '线索：bronze medal（铜牌）——第三名：third。three 是基数词“三”，说第几要用 third。'],
      ['My grandparents got married twenty years ago. Today is their ___ wedding anniversary.', 'twentieth', '线索：结婚二十年——第二十个周年：twentieth。'],
      ['January is the ___ month of the year.', 'first', '线索：一年里的第一个月：first。'],
    ]),
  ),
  item({
    id: 'c1-x-predict', st: 'ec1', lv: 2, type: 'word', topic: 'predict → prediction', label: 'predict 和 prediction', intro: '', ask: '-ion 能把哪些词变成名词？',
    hints: ['-ion 常常把“做这件事”变成“这件事 / 这样东西”。'],
    explain: 'predict（预测，动词）+ -ion → prediction（预测，名词：说出来的那个猜想）。英语里很多动词加 -ion 变成名词：invent → invention，collect → collection，celebrate → celebration。',
  },
    T('t1', '', '1996 年的同学在 **predict**（预测）2026 年——这是动词。他们写下的一句句猜想，叫 **predictions**——这是名词。动词加上 **-ion**，就成了“这件事、这样东西”。', ['predict → **prediction**（预测）', 'invent → **invention**（发明）', 'collect → **collection**（收藏；一批收藏品）']),
    C('a', '“The students wrote forty ___ about 2026.”', [
      ['*predictions', '对：wrote 后面要名词；四十个预测，复数加 s。'],
      ['predict', 'predict 是动词“预测”；wrote 后面要跟名词：predictions。'],
    ], { keep: true }),
    T('t2', '', '以 e 结尾的词，先去掉 e，再加 -ion：celebrate → **celebration**，decorate → **decoration**，educate → **education**。'),
    Mt('b', '动词和它的名词连起来。', ['predict', 'celebrate', 'invent', 'collect', 'decorate'], ['decoration', 'collection', 'prediction', 'invention', 'celebration'], [2, 4, 3, 1, 0], '', { lh: '动词', rh: '名词', whys: [
      'predict + -ion：prediction（预测）。',
      'celebrate 去 e 加 -ion：celebration（庆祝活动）——学校的六十周年，就是一场 celebration。',
      'invent + -ion：invention（发明）。',
      'collect + -ion：collection（收藏）。',
      'decorate 去 e 加 -ion：decoration（装饰）。',
    ] }),
    fill('c', '放进句子，有的词用不上。', ['prediction', 'predict', 'celebration', 'celebrate', 'invention', 'invent'], [
      ['Nobody can ___ the future exactly.', 'predict', '线索：can 后面跟动词原形：predict。prediction 是名词。'],
      ['The school’s ___ will be on Saturday.', 'celebration', '线索：The school’s ___——“学校的……”后面要名词：celebration。celebrate 是动词。'],
      ['The telephone was an important ___.', 'invention', '线索：an important ___——前面有 an 和形容词，要名词：invention。invent 是动词。'],
    ]),
  ),
];
