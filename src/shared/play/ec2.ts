// 英文故事二 The Time Capsule · Chapter 2 The Girl in the Photo（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）。规划见 第六堂课/英文故事二_时间胶囊.md
// 星期二：老合影背面的名字 → 胡老师让去找图书馆的高老师 → 旧年鉴 → 高老师认出 Fang 和 Yu（她们以前形影不离，那年六月不说话了）→ Fang 当了医生、Yu 搬去了上海 → 周老师的地址 → 年鉴里的座右铭。
// 第一次讲：定语从句 who / that、间接问句（Could you tell me where … are? / Do you know where she lives?）、used to、It takes … / spend / cost。
// 回扣第一章：被动语态（The photo was taken … the box was buried）、现在完成时 + since（He has worked here since 1990）。
import { C, M, Mt, Od, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, Item, Play, TeachSub, TypeSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string, string[]?][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why, alt]) => ({ t, a, why, ...(alt ? { alt } : {}) })) });
const type = (key: string, q: string, accept: string[], why: string, near: Record<string, string> = {}, ph = ''): TypeSub => ({ kind: 'type', key, q, accept, near, why, ph });
const T = (key: string, q: string, t: string, ex?: string[], art?: Art): TeachSub => ({ kind: 'teach', key, q, t, ...(ex ? { ex } : {}), ...(art ? { art } : {}) });
const viz = (k: string, p: Record<string, unknown> = {}) => ({ k, p });

export const PLAY_EC2: Play = {
  id: 'ec2', lang: 'en', no: 2, title: 'Chapter 2　The Girl in the Photo', sub: '照片里的两个女孩', color: '#3B6EA8', next: 'ec3',
  endAsk: ['the girl who is holding a music box 里的 who 为什么不是“谁”？', '“你知道她住在哪儿吗”为什么是 where she lives，不是 where does she live？', 'used to 和一般过去时有什么不一样？'],
  gloss: {
    'row by row': { d: '一排一排地（照片上从前排到后排，挨着写下来）', more: { t: '“名词 + by + 名词”表示一个接一个：one by one（一个一个地）、step by step（一步一步地）、day by day（一天天地）。', q: '“Step by step, Yu learned to play the piano.” 意思是——', opts: [['Yu 一步一步地学会了弹钢琴', true], ['Yu 一边走路一边学钢琴', false]] } },
    'Middle row': { d: '中排（合影里中间那一排）。前排是 front row，后排是 back row' },
    'who is holding': { d: '（那个）正捧着……的。who 引出一段话，跟在 the girl 后面，说明“是哪一个女孩”。' },
    'music box': { d: '八音盒：拧紧发条（wind it up），打开盖子就会叮叮咚咚地放音乐', py: '/ˈmjuːzɪk bɒks/' },
    'with short hair': { d: '短头发的（with + 样子：长着、带着……）。the girl with short hair：短头发的那个女孩' },
    'after thirty years': { d: '隔了三十年（after + 一段时间：过了多久以后）' },
    'one more line': { d: '还有一行字（one more：再多一个）' },
    'was taken': { d: '被拍下。take a photo 是“拍照”；照片是被拍的那一方，就说 The photo was taken（be + 过去分词）。' },
    'was buried': { d: '被埋下。bury（埋）的过去分词是 buried；盒子是被埋的那一方：the box was buried。' },
    'the same day': { d: '同一天。the same + 名词：同一个……（the same class 同一个班）' },
    'has worked here since 1990': { d: '从 1990 年起一直在这儿工作（到现在还在）。has + 过去分词 + since + 起点。' },
    'top floor': { d: '顶楼（楼的最高一层）' },
    'smells of': { d: '有……的气味。smell of + 东西：The room smells of old paper.（屋里有一股旧纸的味儿）' },
    'grey hair': { d: '花白的头发（英式拼写 grey，美式 gray）' },
    sorting: { d: '整理、分类（sort 的 -ing 形式）', py: '/ˈsɔːtɪŋ/', more: { t: 'sort 还是名词“种类”：What sort of books do you like?（你喜欢哪一类书？）sort out 是“理清楚、解决”。', q: '“What sort of music do you like?” 问的是——', opts: [['你喜欢哪一类音乐？', true], ['你怎么整理音乐？', false]] } },
    'Excuse me': { d: '打扰一下（开口问人、请人帮忙时先说）' },
    'Could you tell me': { d: '您能告诉我……吗？（客气地问）。后面接的问句要按陈述句的语序：Could you tell me where the yearbooks are?' },
    yearbooks: { d: 'n. 年鉴、毕业纪念册（yearbook 的复数）：每年一本，印着全校学生的照片和留言', py: '/ˈjɪəbʊks/' },
    yearbook: { d: 'n. 年鉴、毕业纪念册：每年一本，印着全校学生的照片和留言', py: '/ˈjɪəbʊk/' },
    shelf: { d: 'n. 架子的一层、搁板（复数 shelves）', py: '/ʃelf/' },
    'Mind the dust': { d: '当心灰尘！（mind 在这里是“当心、注意”）' },
    'hundreds of': { d: '好几百（hundreds of + 复数名词）' },
    'look the same': { d: '看起来一样（look + 形容词：看起来……）' },
    'It takes you almost an hour': { d: '花了你们将近一个小时。It takes + 人 + 时间 + to do：做某事要花某人多少时间（it 指后面的 to do）。' },
    'the one from 1996': { d: '1996 年的那一本（one 代替前面说过的 yearbook，免得重复）' },
    'putting on his glasses': { d: '戴上他的眼镜（put on：穿上、戴上，说的是动作）' },
    recognize: { d: 'v. 认出（以前见过、知道，再见到时一下子认出来）。英式也写 recognise', py: '/ˈrekəɡnaɪz/' },
    'used to': { d: 'used to + 动词原形：过去常常（或一直）这样，现在不这样了。' },
    'by the window': { d: '靠窗、在窗边' },
    share: { d: 'v. 分享、合用（share sth with sb：和某人分享某物）', py: '/ʃeə/', more: { t: 'share 还能说“说出来、讲给别人听”：Can you share your idea with the class?（能把你的想法讲给全班听吗？）', q: '“Thank you for sharing your story.” 是——', opts: [['谢谢你把你的故事讲给我们听', true], ['谢谢你把故事分成两半', false]] } },
    secrets: { d: 'n. 秘密（secret 的复数）', py: '/ˈsiːkrəts/', more: { t: '保守秘密：keep a secret；说出秘密：tell a secret。Can you keep a secret?（你能保密吗？）', q: '“She can’t keep a secret.” 是说她——', opts: [['守不住秘密，什么都往外说', true], ['没有秘密', false]] } },
    'stopped talking': { d: '不再说话了。stop doing：停下正在做的事（停止说话）。注意 stop to do 是“停下来去做另一件事”。', more: { t: 'stop doing 和 stop to do 意思差得远：She stopped talking.（她不说话了）She stopped to talk to me.（她停下脚步，来跟我说话）', q: '“Tao stopped to look at the photo.” 是——', opts: [['Tao 停下来，去看那张照片', true], ['Tao 不再看那张照片了', false]] } },
    'Nobody knew why': { d: '谁也不知道为什么。why 后面省掉了 they stopped talking（为什么她们不说话了）。' },
    'children’s hospital': { d: '儿童医院（children’s：孩子们的）' },
    'on TV': { d: '在电视上' },
    'I’m afraid': { d: '恐怕……（客气地说出对方不想听的消息）。这里不是“我害怕”。', more: { t: 'I’m afraid 后面跟一句话，是客气地说“不好意思，……”：I’m afraid I can’t come.（恐怕我来不了。）afraid of + 东西 才是“害怕”。', q: '“I’m afraid the library is closed.” 是——', opts: [['不好意思，图书馆已经关门了', true], ['我很怕图书馆关门', false]] } },
    'moved to': { d: '搬到（move to + 地方：搬家搬到……）' },
    'that summer': { d: '那年夏天（that：那个，说的是过去的那一年）' },
    'may know more': { d: '也许知道得更多。may + 动词原形：也许、可能' },
    retired: { d: 'v. 退休了（retire 的过去式）；adj. 退休了的（a retired teacher）', py: '/rɪˈtaɪəd/' },
    contact: { d: 'v. 联系（contact + 人，不加 with）', py: '/ˈkɒntækt/' },
    'old teachers’ apartments': { d: '老教师宿舍（apartment：一套公寓房，美式说法；英式常说 flat）', py: '/əˈpɑːtmənts/' },
    visitors: { d: 'n. 来访的人、客人（visit 拜访 + -or）', py: '/ˈvɪzɪtəz/', more: { t: '-or、-er 加在动词后面表示“做这件事的人”：visit → visitor（来访者），act → actor（演员），direct → director（导演）。', q: '“The director of the film is very young.” director 是——', opts: [['导演', true], ['方向', false]] } },
    'Before you leave': { d: '在你离开之前（before + 一句话）' },
    motto: { d: 'n. 座右铭：一句提醒自己、说出自己看重什么的话', py: '/ˈmɒtəʊ/' },
    'give up': { d: '放弃。Never give up：永不放弃' },
    'go round': { d: '转动、运转。… makes the world go round：……让世界转起来（说它最重要、离不开）' },
    'in small letters': { d: '用小字（写着）。letter 在这里是“字母”' },
    'My dream': { d: '我的梦想。My dream: to be …＝My dream is to be …（我的梦想是成为……）' },
    'not smiling': { d: '没有笑（is not smiling：此刻没在笑）' },
    'her eyes are sad': { d: '她的眼神很难过（直译：她的眼睛是难过的）' },
  },
  lines: [
    { shots: [['tc.title']], t: 'Chapter 2: The Girl in the Photo', tr: '第二章：照片里的两个女孩', voice: 'en' },
    { shots: [['tc2.clubRoom', 1.2], ['tc2.photoBack', 0.8]], id: 'open', t: '**Tuesday morning.** You and Tao look at the old class photo again. On the back, someone has written all forty names, ⟦row by row⟧.', read: 'Tuesday morning. You and Tao look at the old class photo again. On the back, someone has written all forty names, row by row.', tr: '星期二上午。你和 Tao 又拿出那张{老合影}来看。照片{背面}，有人把四十个名字{一排一排地}全写上了。', trHard: 'words', voice: 'en', ask: '毕业合影一般怎么排？英语里“前排”“后排”怎么说？' },
    { shots: [['tc2.photo', 1]], id: 'who', who: 'Tao', voice: 'tao', t: '⟦Middle row⟧… Chen Yu… here! She’s the girl ⟦who is holding⟧ a ⟦music box⟧.', read: 'Middle row. Chen Yu. Here! She’s the girl who is holding a music box.', tr: '{中排}……Chen Yu……在这儿！她就是{!捧着八音盒的}那个女孩。', trHard: 'frame', task: ['c2-who'], ask: 'the girl who is holding … 里的 who 是什么意思？' },
    { shots: [['tc2.photoFang']], id: 'fang', who: 'Tao', voice: 'tao', t: 'And the tall girl ⟦with short hair⟧ next to her is Lin Fang. Fang — “F”! She wrote the pink letter!', read: 'And the tall girl with short hair next to her is Lin Fang. Fang. F! She wrote the pink letter!', tr: '她{旁边}那个{高个子、短头发}的女孩，是 Lin Fang。Fang——就是那个“F”！那封{粉色的信}是她写的！', trHard: 'words', ask: '信末只剩一个“F”，凭什么认定是 Lin Fang？' },
    { shots: [['tc2.taoThink']], id: 'find', who: 'Tao', voice: 'tao', t: 'But how can we find them ⟦after thirty years⟧?', tr: '可是{隔了三十年}，我们{怎么才能}找到她们呢？', trHard: 'frame' },
    { shots: [['tc2.photoDate', 1]], id: 'back', t: 'Under the names, there is ⟦one more line⟧: “Taken on June 28, 1996.” So the photo ⟦was taken⟧ on ⟦the same day⟧ the box ⟦was buried⟧.', read: 'Under the names, there is one more line: Taken on June 28, 1996. So the photo was taken on the same day the box was buried.', tr: '名字下面{还有一行字}：“摄于 1996 年 6 月 28 日。”所以，这张照片{!是}在盒子{!被埋下}的{同一天}{!拍的}。', trHard: 'frame', voice: 'en' },
    { shots: [['tc2.huSays']], id: 'since', who: 'Mrs Hu', voice: 'hu', t: 'Ask Mr Gao in the library. He ⟦has worked here since 1990⟧.', tr: '去图书馆问问高老师吧。他{!从 1990 年起就一直在这儿工作}。', trHard: 'frame' },
    { shots: [['tc2.glasses']], prompt: true, who: 'AI 眼镜', voice: 'ai', hide: true, t: 'AI 眼镜把照片背面那几句和胡老师的话翻成了中文。这种句子它最容易看走眼，可能翻错了——找出来。', task: ['c2-mis'], ask: 'was taken 在这里为什么不是“被拿走”？' },
    { shots: [['tc2.library', 1.2]], id: 'lib', t: 'The library is on the ⟦top floor⟧. It is quiet and ⟦smells of⟧ old paper. Mr Gao, a man with ⟦grey hair⟧ and glasses, is ⟦sorting⟧ old books.', tr: '图书馆在{顶楼}，很安静，{有一股}旧纸的{味道}。头发{花白}、戴着眼镜的高老师，正在{整理}旧书。', trHard: 'words', voice: 'en' },
    { shots: [['tc2.taoAsk']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '你想问高老师：1996 年的旧年鉴放在哪儿？用英语开口，第一句怎么说最好？', task: ['c2-ask'], ask: '英语里怎么客气地问“……在哪儿”？' },
    { shots: [['tc2.taoAsk']], id: 'ask', who: 'Tao', voice: 'tao', t: '⟦Excuse me⟧, Mr Gao. ⟦Could you tell me⟧ where the old ⟦yearbooks⟧ are?', tr: '{打扰一下}，高老师。您{能告诉我}旧{年鉴}放在哪儿吗？', trHard: 'frame' },
    { shots: [['tc2.topShelf', 1.2]], id: 'shelf', who: 'Mr Gao', voice: 'gao', t: 'The yearbooks? They’re on the top ⟦shelf⟧. ⟦Mind the dust⟧!', tr: '年鉴？在{!最上面那一层}。{当心灰尘}！', trHard: 'words', task: ['c2-shelf'], side: ['c2-x-dust'], ask: 'Mind the dust 里的 mind 是什么意思？' },
    { shots: [['tc2.search', 1.3], ['tc2.found', 0.8]], id: 'take', t: 'There are ⟦hundreds of⟧ yearbooks, and their covers all ⟦look the same⟧. ⟦It takes you almost an hour⟧ to find ⟦the one from 1996⟧.', tr: '年鉴有{好几百本}，封面{看起来都一样}。{!你们花了将近一个小时}，才找到 1996 年{的那本}。', trHard: 'frame', voice: 'en', task: ['c2-take'], ask: 'take、spend、cost 都能说“花”，怎么分？' },
    { shots: [['tc2.gaoLook', 1.1]], id: 'rec', who: 'Mr Gao', voice: 'gao', t: '(⟦putting on his glasses⟧) Ah — Fang and Yu! I ⟦recognize⟧ them.', read: 'Ah, Fang and Yu! I recognize them.', tr: '（{戴上眼镜}）啊——Fang 和 Yu！我{!认出来了}。', trHard: 'words', task: ['c2-recognize'], ask: 'recognize 和 know 有什么不一样？' },
    { shots: [['tc2.flash96', 1.3]], id: 'used', who: 'Mr Gao', voice: 'gao', t: 'They ⟦used to⟧ sit together ⟦by the window⟧. They used to ⟦share⟧ everything — lunch, books, even ⟦secrets⟧.', read: 'They used to sit together by the window. They used to share everything, lunch, books, even secrets.', tr: '她们俩{!以前总是}{靠窗}坐在一起。她们{!以前}什么都{一起分享}——午饭、书，{连}{秘密}都不瞒着。', trHard: 'frame', task: ['c2-used'], ask: 'used to 和一般过去时有什么不一样？' },
    { shots: [['tc2.flashJune', 1.2]], id: 'june', who: 'Mr Gao', voice: 'gao', t: 'But that June, they ⟦stopped talking⟧. ⟦Nobody knew why⟧.', tr: '可是那年六月，她们{不再说话了}。{谁也不知道为什么}。', trHard: 'frame' },
    { shots: [['tc2.taoKey']], id: 'mbox', who: 'Tao', voice: 'tao', t: '(quietly) We know why. The ⟦music box⟧.', read: 'We know why. The music box.', tr: '（小声）我们知道为什么。是那只{八音盒}。', trHard: 'frame' },
    { shots: [['tc2.twoQ']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '你想请高老师说说：她们俩现在在哪儿？先把下面几句问话补完整。', task: ['c2-where'], ask: '“你知道她住在哪儿吗”英语怎么说？' },
    { shots: [['tc2.taoAsk']], id: 'where', who: 'Tao', voice: 'tao', t: 'Mr Gao, do you know where they live now?', tr: '高老师，您{知道}她们现在{住在哪儿}吗？', trHard: 'frame' },
    { shots: [['tc2.tv', 1.2]], id: 'doctor', who: 'Mr Gao', voice: 'gao', t: 'Fang became a doctor. I saw her ⟦on TV⟧ last year. She works at a ⟦children’s hospital⟧ in Beijing.', tr: 'Fang {当了}医生。去年我{在电视上}看到过她。她在北京一家{儿童医院}工作。', trHard: 'words' },
    { shots: [['tc2.truck', 1.2]], id: 'shanghai', who: 'Mr Gao', voice: 'gao', t: 'Yu? ⟦I’m afraid⟧ I don’t know. Her family ⟦moved to⟧ Shanghai ⟦that summer⟧.', tr: 'Yu？{恐怕}我不知道。{那年夏天}，她家{搬到}上海去了。', trHard: 'words', ask: 'I’m afraid 在这里为什么不是“我害怕”？' },
    { shots: [['tc2.zhouHome', 1.2]], id: 'zhou', who: 'Mr Gao', voice: 'gao', t: 'Their English teacher, Mr Zhou, ⟦may know more⟧. He ⟦retired⟧ ten years ago, but he still lives near the school.', tr: '她们的英语老师周老师，{也许知道得多一些}。他十年前就{!退休了}，可{还住在}学校附近。', trHard: 'words', task: ['c2-retired'] },
    { shots: [['tc2.taoAsk']], id: 'contact', who: 'Tao', voice: 'tao', t: 'Could you tell me how we can ⟦contact⟧ him?', tr: '您能告诉我，我们{怎么才能}{联系上}他吗？', trHard: 'frame', side: ['c2-x-contact'], ask: '“和他联系”为什么是 contact him，不加 with？' },
    { shots: [['tc2.address', 1.1]], id: 'addr', who: 'Mr Gao', voice: 'gao', t: 'Building 3, the ⟦old teachers’ apartments⟧. He loves ⟦visitors⟧ — and he loves tea!', read: 'Building 3, the old teachers’ apartments. He loves visitors, and he loves tea!', tr: '3 号楼，{老教师宿舍}。他{喜欢有人去看他}——也{爱喝茶}！', trHard: 'words' },
    { shots: [['tc2.note']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '周老师不认识你们。去之前，你想先在他门上留一张纸条，客气地问一问：能不能去拜访他？用一句英语写下来。', task: ['c2-write'], ask: '给不认识的长辈留纸条，英语怎么开头？' },
    { shots: [['tc2.yearbook', 1.2]], id: 'motto', t: '⟦Before you leave⟧, you open the yearbook at the Class 3 page. Under each student’s photo, there is a ⟦motto⟧.', tr: '{走之前}，你把年鉴{翻到}三班那一页。每个学生的{小照片}下面，都有一句{座右铭}。', trHard: 'words', voice: 'en' },
    { shots: [['tc2.mottos', 1.3]], id: 'mottos', t: 'Lin Fang: “Never ⟦give up⟧.” Chen Yu: “Music makes the world ⟦go round⟧.” And under it, ⟦in small letters⟧: “⟦My dream⟧: to be a music teacher.”', read: 'Lin Fang: Never give up. Chen Yu: Music makes the world go round. And under it, in small letters: My dream: to be a music teacher.', tr: 'Lin Fang：“{永不放弃}。”Chen Yu：“音乐让世界{转起来}。”下面还有一行{小字}：“{我的梦想}：当一名音乐老师。”', trHard: 'words', voice: 'en', task: ['c2-motto'], ask: '英语里有哪些常见的座右铭？' },
    { shots: [['tc2.sad', 1.3]], id: 'sad', t: 'You look at the class photo once more. Fang is ⟦not smiling⟧. She is looking at Yu, and ⟦her eyes are sad⟧.', tr: '你又看了一眼那张合影。照片上的 Fang {没有笑}。她正{看着} Yu，{眼神里满是难过}。', trHard: 'words', voice: 'en' },
    { shots: [['tc2.board']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '今天认识了好几个人。用 who 的句子说说他们是谁：把描述和人连起来。', task: ['c2-match'] },
    { shots: [['tc2.end', 1.2]], who: 'AI 眼镜', voice: 'ai', t: '第二章到这里。下一章，你们去敲周老师的门——1996 年的那个夏天，到底发生了什么？', read: '第二章到这里。下一章，你们去敲周老师的门。1996 年的那个夏天，到底发生了什么？', ask: '“退休的老师”英语怎么说？' },
  ],
};

// ---------------- 拓展：讲一小段、问一句，一步一步往下走 ----------------

// ---------- 定语从句 who（第一次讲） ----------
const EXT_WHO: Ext[] = [
  { id: 'x1', title: 'who：说明是哪一个人', need: 'always', steps: [
    T('t0', '', '先看照片：四十个学生，二十来个女孩。光说 a girl，谁也找不着；加上一段说明，就只剩一个人了。', undefined, viz('clip', { shots: [['tc2.clipWho', 1]], dur: 11, cap: [[0, 'Forty students. Which girl is Chen Yu?'], [0.3, 'She’s **the girl who is holding a music box**.'], [0.66, 'Lin Fang is **the girl who is standing next to her**.']], marks: [[0.04, 'a girl?'], [0.32, 'who is holding…'], [0.68, 'who is standing…']] })),
    C('t0a', '要是 Tao 只说 “She’s a girl.”，你能在照片上找到 Chen Yu 吗？', [
      ['*找不到：照片上女孩太多了，得说明是哪一个', '对。who 后面那一段，就是用来说明“哪一个”的。'],
      ['找得到：a girl 就是她', '照片上有二十来个女孩，a girl 指哪一个都行。'],
    ], { keep: true }),
    T('t1', '', '把句子拆开看：She’s **the girl** ＋ **who is holding a music box**。前面先说“女孩”，后面用 who 接上一段话，说明是哪个女孩。中文把说明放在前面（捧着八音盒的那个女孩），英语把说明放在后面。这段放在后面的说明，叫**定语从句**。', ['the girl **who** is holding a music box　捧着八音盒的那个女孩', 'the man **who** works in the library　在图书馆工作的那个人', 'the students **who** buried the box　埋下盒子的那些学生']),
    C('a', '“the man who works in the library” 说的是——', [
      ['*在图书馆工作的那个人', '对：中心词是 the man，who works in the library 说明他是哪一个。'],
      ['那个人在图书馆工作吗？', '没有问号，who 也不在句首——它不是在提问，是在说明前面的人。'],
      ['图书馆里的工作', '中心词是 the man（人），后面那段在说明他。'],
    ], { keep: true }),
    T('t2', '', '说的是东西，不用 who，用 **that** 或 **which**：the box **that** was under the tree（埋在树下的那个盒子）、the letter **which** was in a pink envelope（装在粉色信封里的那封信）。说人也可以用 that，不过 who 一眼就看得出是人。'),
    fill('b', '放进句子，有的词用不上。', ['who', 'that', 'which', 'what', 'where'], [
      ['Mr Gao is the librarian ___ knows every student in this school.', 'who', '线索：前面是 the librarian（人）——说人用 who。that 说人也可以，不过 who 更清楚。what 不能跟在名词后面引出说明：它本身就是“……的东西”。', ['that']],
      ['This is the music box ___ stopped playing in 1996.', 'that', '线索：前面是 the music box（东西）——用 that 或 which，两个都对。说东西不用 who。', ['which']],
      ['Tao found the yearbook ___ has Fang’s motto in it.', 'which', '线索：前面是 the yearbook（一本书，东西）——which 或 that。where 说的是地方（the room where we meet），一本年鉴不是地方。', ['that']],
      ['We need someone ___ knew Fang and Yu in 1996.', 'who', '线索：someone（某个人）——说人，用 who（that 也可以）。', ['that']],
    ]),
    C('c', '“The girl who sat next to Yu wrote the pink letter.” 粉色的信是谁写的？', [
      ['*坐在 Yu 旁边的那个女孩（Fang）', '对。先找主干：The girl … wrote the pink letter。who sat next to Yu 只是在说明是哪个女孩。'],
      ['Yu', 'Yu 在 who 那一段里，只是用来说明“坐在谁旁边”；写信的是 the girl。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: 'who 后面的动词，跟着前面的人走', need: 'opt', steps: [
    T('t1', '', 'who 后面的动词用单数还是复数，看 who 前面说的是一个人还是几个人：the girl who **is** holding…（一个女孩）／ the girls who **are** holding…（几个女孩）。'),
    C('a', '“I have two friends who ___ the piano.”', [
      ['*play', '对：who 指的是 two friends（复数），用 play。'],
      ['plays', 'plays 是单数；who 前面是两个朋友。'],
    ], { keep: true }),
    C('b', '“Mr Zhou is the teacher who ___ near the school.”', [
      ['*lives', '对：who 指的是 the teacher（一个人），lives 要加 s。'],
      ['live', 'who 前面是一位老师，要用 lives。'],
    ], { keep: true }),
  ] },
];

// ---------- AI 误译：回扣被动语态、since ----------
const EXT_MIS: Ext[] = [
  { id: 'x1', title: '回扣：被拍、被埋；从 1990 年到现在', need: 'always', steps: [
    T('t1', '', '被动语态，回扣一句：主语是“被……”的那一方，用 **be + 过去分词**。The box **was buried** in 1996.（盒子被埋下）The photo **was taken** that day.（照片被拍下）谁埋的、谁拍的不重要，或者不知道，就不说 by…。'),
    C('a', '照片背面只写着 Taken on June 28, 1996. 补成完整的句子——', [
      ['*This photo **was taken** on June 28, 1996.', '对：照片是被拍的，be + 过去分词。'],
      ['This photo **took** on June 28, 1996.', '照片自己不会拍：主语是被拍的那一方，要用 was taken。'],
      ['This photo **was took** on June 28, 1996.', 'was 后面要用过去分词 taken，不用过去式 took。'],
    ], { keep: true }),
    T('t2', '', 'since 也回扣一句：has worked here **since 1990**——从 1990 年这个起点开始，一直做到现在。since 后面跟起点（1990、last week、I was ten），for 后面跟一段时间（thirty years、two hours）。'),
    fill('b', '放进句子，有的词用不上。', ['since', 'for', 'ago', 'in'], [
      ['Mr Gao has worked in the library ___ 1990.', 'since', '线索：1990 是一个起点，前面是 has worked——从那年一直到现在：since。in 1990 只说那一年，不和 has worked 一起说“一直到现在”。'],
      ['The box has been under the ginkgo tree ___ thirty years.', 'for', '线索：thirty years 是一段时间——for。'],
      ['Mr Zhou retired ten years ___.', 'ago', '线索：retired 是一般过去时，ten years ___ 说“多久以前”：ago。它说的是过去那一刻，不和 has been、has worked 连用。'],
    ]),
    C('c', '“高老师在这所学校工作多久了？”用英语问——', [
      ['*How long **has** Mr Gao **worked** here?', '对：问“到现在为止有多久”，How long + has + 过去分词。'],
      ['How long **did** Mr Gao **work** here?', '这样问，像是他已经不在这儿工作了。'],
      ['When **has** Mr Gao **worked** here?', '问什么时候开始，要说 When did he start working here?；has worked 不和 When 连用。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: 'How long…? 用 for 答，还是用 since 答', need: 'opt', steps: [
    T('t1', '', 'How long have you…? 两种答法都行：说一段时间用 for，说起点用 since。I’ve lived here **for** five years. ＝ I’ve lived here **since** 2021.'),
    C('a', 'Mrs Hu: “How long have you been in the English Club?” 你初一就入了会，现在初三。最自然的回答——', [
      ['*Since Grade 7.', '对：从初一这个起点到现在。也可以说 For two years.'],
      ['For Grade 7.', 'for 后面要跟一段时间，Grade 7 是起点。'],
      ['Two years ago.', 'Two years ago 回答的是 When…?（什么时候），不是 How long…?（多久）。'],
    ], { keep: true }),
    type('b', '“我从十岁起就开始弹钢琴，一直弹到现在。” I have played the piano ___ I was ten.', ['since'], 'I was ten 是一个起点（十岁那年），用 since。', { for: 'for 后面跟一段时间（for five years）；I was ten 是起点。', from: '“从……起一直到现在”，和 have played 搭配用 since。' }, 'since / for'),
  ] },
];

// ---------- 间接问句（第一次讲） ----------
const EXT_ASK: Ext[] = [
  { id: 'x1', title: '问句放进句子里：词序变回来', need: 'always', steps: [
    T('t0', '', '看这几张词卡怎么动：', undefined, viz('clip', { shots: [['tc2.clipOrder', 1]], dur: 10, cap: [[0, '直接问：Where **are** the yearbooks?'], [0.36, '前面加上 Could you tell me…'], [0.62, 'Could you tell me where the yearbooks **are**?']], marks: [[0.04, '直接问'], [0.38, '放进句子'], [0.64, 'are 回到后面']] })),
    C('t0a', '为什么 are 跑到了后面？', [
      ['*问句放进 Could you tell me 后面，成了句子的一部分，要按陈述句的语序排：主语在前，动词在后', '对。The yearbooks are on the top shelf.——陈述句就是这个顺序。'],
      ['因为 Could you 已经是问句了，are 可以随便放', '不是随便放：它回到了陈述句的位置（the yearbooks are）。'],
      ['为了听起来更客气', '客气靠的是 Could you tell me；are 往后挪，是语序的规矩。'],
    ], { keep: true }),
    T('t1', '', '记住一句话：**一句话只问一次**。Could you tell me…? 已经在问了，后面那一半就按陈述句排：疑问词 + 主语 + 动词。这样藏在句子里的问句，叫**间接问句**。', ['Where is the library? → Could you tell me **where the library is**?', 'What time is it? → Do you know **what time it is**?', 'Who is that girl? → Can you tell me **who that girl is**?']),
    Od('b', '把这几块排成一句客气的问话。', ['Excuse me,', 'could you tell me', 'where', 'Building 3', 'is?'], '先打招呼，再 could you tell me，后面按陈述句排：where + 主语 Building 3 + is。'),
    C('c', '哪一句对？', [
      ['*Do you know what time it is?', '对：what time + it + is。'],
      ['Do you know what time is it?', '后一半要按陈述句排：it is。'],
    ], { keep: true }),
    C('d', 'Tao 想问高老师照片上这两个女孩是谁，写成了 “Could you tell me who are these girls?” 怎么改？', [
      ['*Could you tell me who these girls are?', '对：who + these girls + are。'],
      ['Could you tell me who these girls?', '少了 are，句子没有动词了。'],
      ['Could you tell me these girls are who?', 'who 要放在这一半的最前面。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '问“是不是”：if / whether', need: 'opt', steps: [
    T('t1', '', '要是原来的问句没有疑问词，只问“是不是”（**Is** Mr Gao in the library?），放进句子里时，前面加 **if** 或 **whether**（是否），后面照样按陈述句排：Do you know **if** Mr Gao is in the library? ＝ Do you know **whether** Mr Gao is in the library?'),
    C('a', '“Is the library open on Sunday?” 放进 Could you tell me 后面——', [
      ['*Could you tell me if the library is open on Sunday?', '对：加 if，后面按陈述句排：the library is…'],
      ['Could you tell me is the library open on Sunday?', '没有 if，还是问句的语序。'],
      ['Could you tell me where the library is open on Sunday?', 'where 问的是在哪儿；原来问的是“开不开门”，要用 if。'],
    ], { keep: true }),
    C('b', '“Do you know if Chen Yu still has the music box?” 问的是——', [
      ['*你知道 Chen Yu 是不是还留着那只八音盒吗？', '对：if 跟在 know、ask、tell me 后面，是“是否”。'],
      ['如果 Chen Yu 还留着八音盒，你知道吗？', '这里的 if 不是“如果”，是“是否”。'],
    ], { keep: true }),
  ] },
];

// ---------- shelf：一层一层 ----------
const EXT_SHELF: Ext[] = [
  { id: 'x1', title: '一层一层：shelf 和 shelves', need: 'always', steps: [
    T('t1', '', '书架有好几层：the **top** shelf（最上面一层）、the **middle** shelf（中间一层）、the **bottom** shelf（最下面一层）。“在某一层上”用 on：on the top shelf。', undefined, viz('clip', { shots: [['tc2.clipShelf', 1]], dur: 9, cap: [[0, 'the **top** shelf　最上面一层'], [0.33, 'the **middle** shelf　中间一层'], [0.66, 'the **bottom** shelf　最下面一层']], marks: [[0.04, 'top'], [0.37, 'middle'], [0.7, 'bottom']] })),
    C('a', '1996 年以前的旧报纸，放在最下面一层。高老师会说——', [
      ['*They’re on the **bottom** shelf.', '对：最下面一层，bottom。'],
      ['They’re on the **top** shelf.', 'top 是最上面一层。'],
      ['They’re **in** the bottom shelf.', '东西放在一层搁板上，用 on。'],
    ], { keep: true }),
    T('t2', '', '一个书架有很多层，复数不是 shelfs，是 **shelves**：f 变成 v，再加 -es。好几个以 -f、-fe 结尾的词都这样：leaf → **leaves**（叶子），knife → **knives**（刀），half → **halves**（一半），life → **lives**（生命）。也有不变的：roof → **roofs**（屋顶）。'),
    fill('b', '放进句子，有的词用不上。', ['shelves', 'leaves', 'knives', 'roofs', 'shelfs', 'lives'], [
      ['The library has twenty ___, and every one of them is full of books.', 'shelves', '线索：twenty（二十个）——要复数：shelf → shelves。shelfs 是最常见的拼错。'],
      ['In autumn, the ginkgo ___ turn yellow and fall like gold.', 'leaves', '线索：银杏树上的、会变黄飘落的——叶子：leaf → leaves。lives 也是 f 变 v，可它是 life（生命）的复数。'],
      ['Be careful with those ___ in the kitchen. They are very sharp.', 'knives', '线索：kitchen、very sharp（很锋利）——刀：knife → knives。'],
      ['From the top floor, you can see the red ___ of the old teachers’ apartments.', 'roofs', '线索：从顶楼往下看到的红色的——屋顶。roof 是例外，直接加 s：roofs。'],
    ]),
    C('c', '哪一句对？', [
      ['*Cut the apple into two **halves**.', '对：half → halves，把苹果切成两半。'],
      ['Cut the apple into two **halfs**.', 'half 的复数是 halves：f 变 v，再加 -es。'],
    ], { keep: true }),
  ] },
];

// ---------- It takes … / spend / cost（第一次讲） ----------
const EXT_TAKE: Ext[] = [
  { id: 'x1', title: '花时间、花钱：take、spend、cost', need: 'always', steps: [
    T('t0', '', '同样是“花”，看是谁在花：', undefined, viz('clip', { shots: [['tc2.clipTake', 2], ['tc2.clipCost', 1]], dur: 13, cap: [[0, '**It took** us an hour **to find** the yearbook.（事情做下来要多久：it + take）'], [0.34, '**We spent** an hour **looking for** it.（人花时间：人 + spend）'], [0.68, 'The new frame **cost** thirty yuan.（东西值多少钱：东西 + cost）']], marks: [[0.03, 'took'], [0.36, 'spent'], [0.7, 'cost']] })),
    C('t0a', '同样是“花了一个小时”，主语不一样，动词就不一样。哪一组都说得对？', [
      ['*It **took** us an hour. ／ We **spent** an hour.', '对：it 打头用 take；人当主语用 spend。'],
      ['It **spent** us an hour. ／ We **cost** an hour.', 'spend 的主语是花时间的人，不能是 it；cost 说的是东西值多少钱，人不能当 cost 的主语。'],
    ], { keep: true }),
    T('t1', '', '三个词，先看主语：\n· **It takes (sb) + 时间 + to do**：做这件事要花（某人）多少时间。\n· **sb spends + 时间 / 钱 + doing / on sth**：人花时间、花钱。\n· **sth costs (sb) + 钱**：东西值多少钱。', ['It takes me twenty minutes to walk to school.', 'I spend twenty minutes walking to school.', 'This dictionary cost me 80 yuan.']),
    So('a', '这几句的空里，各该用哪个词（时态先不管）？', ['take', 'spend', 'cost'], [
      ['It ___ Mr Zhou ten minutes to make a pot of tea.', 0, 'It … to make——it 打头，后面是 to do：take。'],
      ['It ___ the workers two days to dig the new garden.', 0, '同样是 It + 人 + 时间 + to do：take。'],
      ['Yu ___ hours practising the piano every day.', 1, '主语是人（Yu），后面是 practising：spend + 时间 + doing。'],
      ['Tao ___ all his pocket money on old stamps.', 1, '人花钱，后面是 on + 东西：spend … on。'],
      ['The music box ___ Yu’s grandma a lot of money.', 2, '主语是东西（the music box），说的是钱：cost。'],
      ['How much does a train ticket to Shanghai ___?', 2, '问东西值多少钱：How much does … cost?'],
    ]),
    fill('b', '用对的形式填空，有的词用不上。', ['took', 'spent', 'cost', 'takes', 'costs', 'spend'], [
      ['Yesterday it ___ us almost an hour to find the 1996 yearbook.', 'took', '线索：it … to find，又有 Yesterday——take 的过去式 took。takes 是现在时，有 Yesterday 要用过去式。'],
      ['Last summer, Tao ___ two weeks in Shanghai with his cousin.', 'spent', '线索：主语是人（Tao），又是 Last summer——spend 的过去式 spent。spend 是原形，说过去的事要用过去式。'],
      ['Thirty years ago, a music box like Yu’s ___ only fifty yuan.', 'cost', '线索：主语是东西（a music box），说的是钱，又是三十年前——cost 的过去式还是 cost。costs 是现在时。'],
    ]),
    C('c', '哪一句是错的？', [
      ['*I **spent** two hours **to find** the key.', '对，这句错了：spend 后面不跟 to do。要说 I spent two hours **finding** the key.，或者 It took me two hours to find the key.'],
      ['It **took** me two hours to find the key.', '这句没错：It took + 人 + 时间 + to do。'],
      ['I **spent** two hours **looking for** the key.', '这句没错：spend + 时间 + doing。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '付钱：pay for；花在哪儿：spend on', need: 'opt', steps: [
    T('t1', '', '人花钱，还可以说 **pay**（付钱）：pay + 钱 + **for** + 东西。spend 后面接 **on** + 东西。三句说的是同一件事：Tao **paid** 20 yuan **for** the stamp. ＝ Tao **spent** 20 yuan **on** the stamp. ＝ The stamp **cost** Tao 20 yuan.'),
    C('a', '“Yu’s grandma ___ 300 yuan for the music box.”', [
      ['*paid', '对：人付钱买东西，pay … for，过去式 paid。'],
      ['cost', 'cost 的主语是东西：The music box cost 300 yuan.'],
      ['spent', 'spent 后面接 on：She spent 300 yuan on the music box.'],
    ], { keep: true }),
    Wr('b', '用 It takes me … to … 写一句：你每天做哪件事，要花多少时间？', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence about something they do every day and how long it takes, using the pattern “It takes me + time + to do …”.',
      criteria: ['uses “It takes me + time + to + verb” correctly', 'a real, sensible daily activity and a reasonable amount of time', 'correct spelling and word order'],
      examples: ['It takes me twenty minutes to walk to school.', 'It takes me about an hour to finish my homework.', 'It takes me five minutes to make my bed.'],
      words: ['It takes me', 'minutes', 'to'], frame: 'It takes me ______ to ______.', ph: 'It takes me …',
    }),
  ] },
];

// ---------- recognize ----------
const EXT_REC: Ext[] = [
  { id: 'x1', title: '认识、认出来、见到', need: 'always', steps: [
    T('t1', '', '**recognize** 是一下子的事：以前见过、知道，现在一看——“啊，是你！”**know** 是一直有的状态：认识、知道。**meet** 是第一次见面，或者碰见。', ['I **know** Mr Gao. He’s our librarian.（认识，一直认识）', 'I didn’t **recognize** you in your new glasses!（没认出来）', 'I first **met** Mrs Hu in Grade 7.（第一次见到）']),
    C('a', '一个暑假你长高了一大截。开学那天，班主任盯着你看了半天才说——', [
      ['*Wow, I didn’t **recognize** you!', '对：她认识你，可这一回一下子没认出来。'],
      ['Wow, I didn’t **know** you!', '说成了“我不认识你”——她可是你的班主任。'],
    ], { keep: true }),
    C('b', '要是 Fang 和 Yu 三十年后在街上擦肩而过，谁也没认出谁。英语说——', [
      ['*They didn’t **recognize** each other.', '对：没认出来，用 recognize。'],
      ['They didn’t **know** each other.', '那是“她们不认识”，可她们曾经是最好的朋友。'],
      ['They didn’t **meet** each other.', '她们其实碰见了（擦肩而过），只是没认出来。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['recognize', 'know', 'met', 'recognized', 'knew', 'meet'], [
      ['I’ve changed my hair. Do you think Tao will ___ me?', 'recognize', '线索：换了发型，担心他一看认不出——recognize。know 说的是认不认识，Tao 本来就认识你。'],
      ['Do you ___ Mr Zhou’s phone number?', 'know', '线索：phone number——知道（一直知道的事）：know。'],
      ['I first ___ Tao on the first day of Grade 7.', 'met', '线索：first … on the first day——第一次见面：met。meet 是原形；说过去那天，要用过去式。'],
      ['Mr Gao ___ the two girls at once.', 'recognized', '线索：at once（一下子）——一看就认出来了：recognized。knew 说的是一直认识，不说“一下子”。'],
    ]),
  ] },
];

// ---------- used to（第一次讲） ----------
const EXT_USED: Ext[] = [
  { id: 'x1', title: '以前常常，现在不了', need: 'always', steps: [
    T('t0', '', '先看同一扇窗户前的两个画面：', undefined, viz('clip', { shots: [['tc2.clipUsed', 1]], dur: 12, cap: [[0, '1996　Fang and Yu **sit** together by the window every day.'], [0.48, '2026　The two seats are empty.'], [0.72, 'They **used to** sit together.（以前常常这样，现在不了）']], marks: [[0.04, '1996'], [0.5, '2026']] })),
    C('t0a', '说 They used to sit together，话里带着的意思是——', [
      ['*现在她们已经不坐在一起了', '对：used to 让人听出“现在不这样了”。'],
      ['现在她们还天天坐在一起', '那要用一般现在时：They sit together every day.'],
    ], { keep: true }),
    T('t1', '', '和一般过去时比一比：**They sat together in 1996.**——只说 1996 年怎么样，现在呢？没说。**They used to sit together.**——过去常常这样（不是一次），而且话里带着“现在不这样了”。', ['I **played** football yesterday.（昨天踢了一次）', 'I **used to play** football every weekend.（以前每个周末都踢，现在不踢了）']),
    C('a', '爷爷说：“我小时候常在那棵银杏树下看书，现在走不动了。”英语最好说——', [
      ['*I **used to** read under that ginkgo tree when I was young.', '对：小时候常常这样，现在不了——used to + 原形。'],
      ['I **read** under that ginkgo tree yesterday.', '说成了昨天的一次。'],
      ['I **am used to** reading under that ginkgo tree.', 'be used to doing 是“习惯于”，说的是现在已经习惯了，正好和爷爷的意思相反。'],
    ], { keep: true }),
    So('b', '这些句子，说的是“过去常常（现在不了）”，还是“过去的某一次”？', ['过去常常（现在不了）', '过去的某一次'], [
      ['Fang **used to** carry a pile of books every day.', 0, 'every day，天天如此——used to。'],
      ['Fang **carried** a pile of books into the classroom that morning.', 1, 'that morning，那天早上的一次。'],
      ['Yu **used to** play her music box after lunch.', 0, '以前每天午饭后都放，现在放不了了。'],
      ['The music box **stopped** in June 1996.', 1, '1996 年 6 月的某一天，停了。'],
      ['There **used to** be a pond behind the library.', 0, 'There used to be…：以前那儿有（现在没了）。'],
      ['Mr Zhou **retired** ten years ago.', 1, '十年前的一件事。'],
    ]),
    T('t2', '', 'used to 后面一定是**动词原形**，主语是谁都一样：I / she / they **used to** play。**There used to be …**：以前那儿有……（现在没了）。还有一个长得很像的：**be used to + -ing**（习惯于），别弄混。'),
    fill('c', '放进句子，有的词用不上。', ['used to', 'played', 'is used to', 'uses to'], [
      ['Yu ___ play her music box every day after lunch. Now it doesn’t play anymore.', 'used to', '线索：Now it doesn’t play anymore——以前天天放，现在不了：used to + 原形 play。uses to 不对：used to 没有加 s 的形式，主语是谁都一样。'],
      ['Yu ___ her music box at the school show in 1995.', 'played', '线索：in 1995 那一次演出——过去的某一次，用一般过去时 played。'],
      ['Mr Gao ___ getting up at five. He has done it for forty years.', 'is used to', '线索：He has done it for forty years——四十年了，早习惯了：be used to + -ing（习惯于）。它和 used to + 原形（以前常常）长得像，意思不一样。'],
    ]),
    C('d', '高老师说完 They used to share everything，接下来最可能说的是——', [
      ['*But that June, they stopped talking.', '对：used to 后面，常常跟着一个“可是后来……”。'],
      ['And they still share everything now.', '和 used to 冲突：used to 说的正是“现在不这样了”。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: 'used to 的否定和问句', need: 'opt', steps: [
    T('t1', '', '否定：**didn’t use to** + 原形（以前不……）；问句：**Did** you **use to** + 原形？——有了 did，过去的意思由 did 带着，used 就变回 use。', ['I **didn’t use to** like English, but now I love it.', '**Did** you **use to** walk to school?']),
    C('a', '“你以前戴眼镜吗？”', [
      ['*Did you use to wear glasses?', '对：did 已经表示过去，后面用 use to。'],
      ['Did you used to wear glasses?', 'did 后面用原形 use，不写 used。'],
      ['Do you used to wear glasses?', '问过去，用 Did；而且后面要用 use to。'],
    ], { keep: true }),
    Wr('b', '写一句：你小时候常做、现在不做了的一件事（I used to …, but now …）。', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence about something they often did when they were younger but don’t do now, using “used to + base verb” (ideally with “but now …”).',
      criteria: ['uses “used to + base verb” correctly (not “use to” in a statement, not “used to + -ing”)', 'the meaning is clear: a past habit that has stopped', 'correct spelling and grammar'],
      examples: ['I used to be afraid of the dark, but now I’m not.', 'I used to watch cartoons every morning, but now I read the news.', 'I used to hate vegetables, but now I love them.'],
      words: ['I used to', 'but now', 'every day'], frame: 'I used to ______, but now ______.', ph: 'I used to …',
    }),
  ] },
];

// ---------- 间接问句：do / does / did 去哪儿了 ----------
const EXT_WHERE: Ext[] = [
  { id: 'x1', title: 'do、does、did 去哪儿了', need: 'always', steps: [
    T('t1', '', '直接问的时候，要靠 do / does / did 帮忙：Where **does** she **live**? 放进句子里，变回陈述句的语序，就不用它们帮忙了——does 里的 -s 跑到了动词身上（she **lives**），did 里的“过去”也跑到了动词身上（they **went**）。', ['Where does she live? → Do you know where she **lives**?', 'When did the school open? → Do you know when the school **opened**?', 'What do they want? → Could you tell me what they **want**?']),
    C('a', '“When did the school open?” 放进 Do you know 后面——', [
      ['*Do you know when the school opened?', '对：did 不见了，过去的意思落到 opened 上。（答案是 1966 年。）'],
      ['Do you know when did the school open?', 'did 还留着，是直接问句的语序。'],
      ['Do you know when the school open?', 'did 去掉了，可过去的意思也丢了：要说 opened。'],
    ], { keep: true }),
    Od('b', '把这几块排成一句。', ['Could you tell me', 'how long', 'it takes', 'to get to Shanghai', 'by train?'], 'Could you tell me + how long + it takes（陈述句的语序）+ to get to Shanghai by train。'),
    C('c', '哪一句对？', [
      ['*I don’t know what time the library closes.', '对：what time + the library + closes；does 不见了，-s 跑到 close 上。'],
      ['I don’t know what time does the library close.', 'does 留下了，还是直接问的语序。'],
      ['I don’t know what time the library close.', 'does 去掉了，-s 要跑到 close 上：closes。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: '句末用问号，还是句号？', need: 'opt', steps: [
    T('t1', '', '整句是不是问句，看开头：**Could you tell me / Do you know …**——还是在问，句末打问号。**I don’t know / I wonder / Nobody knew …**——是在陈述，句末打句号。高老师说的 Nobody knew why. 就是这样：why 后面省掉了 they stopped talking。'),
    C('a', '哪一句的语序和标点都对？', [
      ['*I wonder where Fang is now.', '对：I wonder（我想知道）开头，是陈述句，句号；where + Fang + is。'],
      ['I wonder where is Fang now?', '语序和标点都错了：where Fang is，句末用句号。'],
    ], { keep: true }),
    C('b', '把 Nobody knew why. 说完整——', [
      ['*Nobody knew why they stopped talking.', '对：why + they + stopped talking，陈述句的语序。'],
      ['Nobody knew why did they stop talking.', 'did 留下了，是直接问的语序。'],
    ], { keep: true }),
  ] },
];

// ---------- retire 一家人 ----------
const EXT_RETIRE: Ext[] = [
  { id: 'x1', title: '一家人：retire、retired、retirement', need: 'always', steps: [
    T('t1', '', '一个词变出一家人：**retire**（v. 退休）→ **retired**（adj. 退休了的：a retired teacher）→ **retirement**（n. 退休：after his retirement）。-ment 加在动词后面，变成名词：move → movement（动作、运动），agree → agreement（同意、协议），develop → development（发展）。'),
    C('a', '“Mr Zhou is a retired English teacher.” 这里的 retired 是——', [
      ['*形容词：退休了的（说明是什么样的老师）', '对：放在 English teacher 前面，说明是哪一种老师。'],
      ['动词的过去式：他退休了', '前面有 is a，后面有 teacher，retired 在修饰 teacher。'],
    ], { keep: true }),
    fill('b', '放进句子，有的词用不上。', ['retire', 'retirement', 'retired', 'tired', 'agreement'], [
      ['Mr Gao will ___ next year, so he is teaching the new librarian.', 'retire', '线索：will 后面用动词原形：retire。'],
      ['After his ___, Mr Zhou started to grow flowers.', 'retirement', '线索：his 后面要一个名词：retirement。agreement 也是 -ment 名词，可意思是“同意、协议”，和种花没关系。'],
      ['My grandma is a ___ doctor. She stopped working in 2020.', 'retired', '线索：a ___ doctor，放在名词前面说明是什么样的医生：retired。tired 是“累”，只是长得像。'],
    ]),
    C('c', '高老师还没退休，明年才退。“高老师快退休了”，英语说——', [
      ['*Mr Gao is going to retire soon.', '对：快要发生的事，is going to + 原形。'],
      ['Mr Gao retired soon.', 'retired 是已经退休了，和 soon（很快就要）冲突。'],
    ], { keep: true }),
  ] },
];

// ---------- 给周老师的纸条 ----------
const EXT_WRITE: Ext[] = [
  { id: 'x1', title: '一张客气的小纸条', need: 'always', steps: [
    T('t1', '', '给不认识的长辈留纸条，一般有四块：称呼（Dear Mr Zhou,）→ 我们是谁、为什么来（We are students at your old school…）→ 请求（Could you tell me if…?）→ 道谢、署名（Thank you very much!）。'),
    Od('a', '把这张纸条排一排。', ['Dear Mr Zhou,', 'We are two students at your old school.', 'We have found a letter from your old student, Lin Fang.', 'Could you tell me if we can visit you this Thursday afternoon?', 'Thank you very much! — Tao and the English Club'], '称呼 → 我们是谁 → 为什么来（找到了 Fang 的信）→ 请求 → 道谢、署名。'),
    C('b', '哪一句做纸条的请求最好？', [
      ['*Could you tell me if we can visit you this Thursday afternoon?', '对：客气、清楚，时间也说了，让对方好回答。'],
      ['We will come to your home on Thursday.', '没问对方方不方便，直接通知，对长辈不太礼貌。'],
      ['Could you tell me if can we visit you?', 'if 后面要按陈述句排：if we can visit you。'],
    ], { keep: true }),
    C('c', '纸条最后，最合适的一句是——', [
      ['*Thank you very much!', '对：请人帮忙，最后要道谢。'],
      ['Reply quickly!', '命令的口气，对长辈很不礼貌。'],
    ], { keep: true }),
  ] },
];

// ---------- 座右铭 ----------
const EXT_MOTTO: Ext[] = [
  { id: 'x1', title: '一句话的座右铭', need: 'always', steps: [
    T('t1', '', '座右铭常常很短：要么是一句提醒自己的话（Never give up.），要么是一句道理（Practice makes perfect.）。读懂一句座右铭，常常要看懂一个关键词。'),
    Mt('a', '这些常见的英语座右铭，各是什么意思？', ['Never give up.', 'Practice makes perfect.', 'Where there is a will, there is a way.', 'Actions speak louder than words.', 'Knowledge is power.'], ['熟能生巧', '有志者事竟成', '永不放弃', '知识就是力量', '行动比说话更有力'], [2, 0, 1, 4, 3], '', { lh: '座右铭', rh: '意思', whys: [
      'never（永远不）+ give up（放弃）：永不放弃。像在对自己说。',
      'practice（练习）让事情变得 perfect（完美）——练得多了就熟了：熟能生巧。',
      'will 在这里是名词“意志、决心”，way 是“路”：有了决心，就会有路——有志者事竟成。',
      'actions（行动）比 words（话）说得更响：做出来，比说出来更有力。它和 Practice makes perfect 都在讲“做”：一个说多练，一个说行动胜过空话。',
      'knowledge（知识）就是 power（力量）——英国哲学家培根的名言。',
    ] }),
    T('t2', '', 'Yu 在座右铭下面写了 My dream: to be a music teacher.——说梦想，dream 后面用 **to be**（成为）：My dream is **to be** a … ／ I want **to be** a … when I grow up.'),
    C('b', '哪一句说梦想说得对？', [
      ['*My dream is **to be** a doctor.', '对：dream is to be……'],
      ['My dream is **be** a doctor.', 'is 后面要用 to be。'],
      ['My dream is **doctor**.', '少了 to be a：梦想是“成为一名医生”，不是“梦想就是医生”。'],
    ], { keep: true }),
    Wr('c', '写一句你自己的座右铭（英语），可以是名言，也可以自己写。', {
      lang: 'en', role: 'en',
      task: 'The student writes their own motto in English: one short sentence that says what they value or reminds them how to act. It may be a famous saying or their own words.',
      criteria: ['one short, clear English sentence that works as a motto (an imperative like “Never give up.” or a short saying)', 'correct grammar and spelling', 'meaningful — it says something the student values'],
      examples: ['Never give up.', 'Every day is a new chance.', 'Be kind, and work hard.', 'Read more, learn more.'],
      words: ['Never', 'Always', 'Be …'], frame: 'My motto: ______.', ph: 'My motto: …',
    }),
  ] },
];

// ---------- 两句并一句 ----------
const EXT_MATCH: Ext[] = [
  { id: 'x1', title: '两句并成一句', need: 'always', steps: [
    T('t1', '', 'who 能把两句话并成一句：I know a teacher. **He** has worked here since 1990. → I know a teacher **who** has worked here since 1990. who 代替了后一句里的 he，接在 a teacher 后面。'),
    C('a', '把这两句并成一句：Fang was a girl. She never gave up.', [
      ['*Fang was a girl who never gave up.', '对：who 代替 she，接在 a girl 后面。'],
      ['Fang was a girl who she never gave up.', 'who 已经代替了 she，后面不能再有 she。'],
      ['Fang was a girl which never gave up.', '说人用 who；which 说东西。'],
    ], { keep: true }),
    C('b', '再并一句：This is the music box. It was a present from Yu’s grandma.', [
      ['*This is the music box that was a present from Yu’s grandma.', '对：说东西用 that（或 which），它代替了 it。'],
      ['This is the music box who was a present from Yu’s grandma.', '说东西不用 who。'],
      ['This is the music box that it was a present from Yu’s grandma.', 'that 已经代替了 it，不能再有 it。'],
    ], { keep: true }),
    C('c', '“the student who wrote the pink letter” 和 “the pink letter that the student wrote”，说的各是什么？', [
      ['*前一个说人（写了粉色信的那个学生），后一个说信（那个学生写的粉色的信）', '对：看最前面那个中心词——一个是 the student，一个是 the pink letter。'],
      ['两个说的都是那封信', '前一个的中心词是 the student：说的是人。'],
    ], { keep: true }),
    Wr('d', '用 who 写一句，介绍你的一位朋友或老师（He / She is the … who …）。', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence introducing a friend or teacher, using a relative clause with “who” (e.g. “She is the girl who …”, “Mr Wang is the teacher who …”).',
      criteria: ['uses a relative clause with “who” correctly after a noun for a person', 'no extra subject after who (not “who she …”)', 'the verb after who agrees with the person (who is / who are, who lives / who live)', 'a clear, sensible sentence'],
      examples: ['My best friend is the girl who sits next to me in maths class.', 'Mr Wang is the teacher who taught me to love history.', 'Tom is the boy who can play the guitar very well.'],
      words: ['is the …', 'who', 'sits / plays / taught'], frame: '______ is the ______ who ______.', ph: 'My best friend is …',
    }),
  ] },
];

// ---------------- 题 ----------------
export const PLAY_EC2_ITEMS: Item[] = [
  item({
    id: 'c2-who', st: 'ec2', lv: 1, type: 'clause', topic: 'who 定语从句', label: 'the girl who is holding a music box', intro: '', ask: 'who 在这里为什么不是“谁”？',
    hints: ['who 前面紧挨着的是什么？句子末尾有问号吗？'],
    explain: 'who 引出的一段话（who is holding a music box）跟在 the girl 后面，说明“是哪一个女孩”——这段放在后面的说明叫定语从句。说人用 who；说东西用 that 或 which。',
    lock: { words: ['who is holding'] },
    ext: EXT_WHO,
  }, C('a', 'Tao 指着照片说：She’s the girl **who is holding a music box**. 他说的是哪一个？', [
    ['*中排中间，两条辫子、怀里捧着八音盒的女孩', '对。who is holding a music box 接在 the girl 后面，说明是“哪一个女孩”——正捧着八音盒的那个。'],
    ['她旁边那个高个子、短头发的女孩', '她手里什么也没拿，正侧着头看旁边的人。who 后面说的是“捧着八音盒”，要找手里有八音盒的。'],
    ['前排正中那位男老师', 'who 前面是 the girl（女孩），说的是一个女孩，不是老师。'],
    ['谁都不是：who 在这里是问“谁捧着八音盒？”', '这里的 who 不是在提问：句子没有问号，who 前面紧挨着 the girl。它引出一段话，说明是哪个女孩。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c2-mis', st: 'ec2', lv: 2, type: 'mis', topic: 'AI 误译', label: 'AI 眼镜译错了什么', intro: '', ask: 'was taken 在这里为什么不是“被拿走”？',
    hints: ['点一点英文里的 was taken、was buried：照片和盒子，是“做事的”，还是“被……的”？', '“has worked here since 1990”：高老师现在还在不在学校？'],
    explain: 'AI 眼镜按每个词最常见的意思去翻，没看句子的结构：was taken 说的是照片，是“被拍下”；the box was buried 是盒子“被埋下”；has worked here since 1990 是“从 1990 年起一直在这儿工作”，高老师现在还在学校。',
    lock: { words: ['was taken', 'was buried', 'has worked here since 1990'], lines: ['back', 'since'] },
    ext: EXT_MIS,
  }, M('a', 'AI 眼镜的译文有三处不对。点出来，改对。', 'Under the names, there is one more line: “Taken on June 28, 1996.” So the photo was taken on the same day the box was buried.\nMrs Hu: “Ask Mr Gao in the library. He has worked here since 1990.”', [
    '名字下面还有一行字：“摄于 1996 年 6 月 28 日。”所以，这张照片是在',
    ['盒子埋东西的', 'the box was buried', ['*盒子被埋下的', '盒子埋东西的', '盒子被挖出来的'], 'was buried 是被动：盒子是“被埋”的那一方，不是它去埋别的东西。被挖出来是 was dug up——那是三十年以后的事。'],
    '同一天',
    ['被拿走的。', 'the photo was taken', ['*拍的', '被拿走的', '被冲洗出来的'], 'take 有好几个意思：拿走（Someone took my pen.）、拍（take a photo）。说照片，was taken 是“被拍下”。照片好好地躺在盒子里，没被谁拿走；冲洗照片是 develop。'],
    '胡老师说：“去图书馆问问高老师吧。',
    ['他 1990 年在这儿工作过。”', 'He has worked here since 1990', ['*他从 1990 年起就一直在这儿工作（现在还在）', '他 1990 年在这儿工作过（后来走了）', '他 1990 年来过这儿一次'], 'has worked + since 1990：从 1990 年开始，一直做到现在——高老师现在还在学校。要是“工作过、后来走了”，胡老师怎么会让你们去图书馆找他？'],
  ], 'AI 眼镜的译文')),

  item({
    id: 'c2-ask', st: 'ec2', lv: 2, type: 'polite', topic: '间接问句', label: 'Could you tell me where … are?', intro: '', ask: '英语里怎么客气地问“……在哪儿”？',
    hints: ['先客气地打个招呼。Could you tell me 后面那一半，是问句的语序，还是陈述句的语序？'],
    explain: '客气地问，用 Could you tell me…? / Do you know…?。问句放进句子里以后，要变回陈述句的语序：Where are the yearbooks? → Could you tell me where the yearbooks are?',
    ext: EXT_ASK,
  }, C('a', '第一句，怎么问最好？', [
    ['*Excuse me, Mr Gao. Could you tell me where the old yearbooks are?', '对：先说 Excuse me，再用 Could you tell me…? 客气地问；where the old yearbooks are 用的是陈述句的语序。'],
    ['Excuse me, Mr Gao. Could you tell me where are the old yearbooks?', '很接近了，可是词序错了：问句放进 Could you tell me 后面，要变回陈述句的语序——where the old yearbooks are。'],
    ['Where are the old yearbooks? Tell me.', '问句本身没错，可是加上 Tell me，成了命令，对长辈不礼貌。'],
    ['Mr Gao, do you know the old yearbooks are where?', 'where 要放在这一半的最前面：do you know where the old yearbooks are。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c2-shelf', st: 'ec2', lv: 1, type: 'word', topic: 'shelf', label: 'on the top shelf', intro: '', ask: 'shelf 和 self 怎么分？',
    hints: ['高老师抬手往上指：书架的哪一层？'],
    explain: 'shelf：架子的一层、搁板（书架上的一层）。top shelf：最上面一层；bottom shelf：最下面一层。复数是 shelves。',
    lock: { words: ['shelf'] },
    ext: EXT_SHELF,
  }, C('a', '高老师说 They’re on the top shelf. 年鉴在哪儿？', [
    ['*书架最上面那一层', '对。shelf：架子上的一层；top shelf：最上面一层——你们得踩着梯子去拿。'],
    ['书架的顶上（书架外面的上头）', '书架顶上是 on top of the bookcase；shelf 是书架里面的一层。'],
    ['他自己（self）那儿', 'self 是“自己”（myself、himself），只差一个 h；shelf 才是架子的一层。'],
    ['最上面那个抽屉里', '抽屉是 drawer；shelf 是敞开的一层搁板。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c2-take', st: 'ec2', lv: 2, type: 'pattern', topic: 'take / spend / cost', label: 'It takes you almost an hour', intro: '', ask: 'take、spend、cost 都能说“花”，怎么分？',
    hints: ['It 指的是后面的哪件事？take 后面跟着的是一段时间。'],
    explain: 'It takes + 人 + 时间 + to do：做某事要花某人多少时间，it 指的是后面的 to do。人花时间、花钱用 spend；东西值多少钱用 cost。',
    lock: { words: ['It takes you almost an hour'] },
    ext: EXT_TAKE,
  }, C('a', 'It takes you almost an hour to find the one from 1996. 意思是——', [
    ['*你们花了将近一个小时，才找到 1996 年的那本', '对。It takes + 人 + 时间 + to do：做某事花了某人多少时间。it 指的是后面的 to find the one from 1996。'],
    ['那本年鉴把你们带走了将近一个小时', 'take 在这里不是“带走”，是“花（时间）”。'],
    ['你们拿着 1996 年的那本，看了将近一个小时', '拿着是 hold；这里说的是“找”花了多长时间。'],
    ['再过将近一个小时，你们才能找到那本', '说的是已经花掉的时间。“再过一个小时”要说 in an hour。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c2-recognize', st: 'ec2', lv: 2, type: 'word', topic: 'recognize', label: 'I recognize them', intro: '', ask: 'recognize 和 know 有什么不一样？',
    hints: ['高老师三十年前就教过这两个学生。他戴上眼镜，看了一眼照片……'],
    explain: 'recognize：认出来（以前见过、知道，再见到时一下子认出是谁）。know 是一直有的“认识、知道”；meet 是第一次见面、碰见。',
    lock: { words: ['recognize'] },
    ext: EXT_REC,
  }, C('a', '高老师说 I recognize them. 意思是——', [
    ['*（隔了三十年）他一看照片，就认出了她们俩', '对。recognize：以前见过、知道，现在一看就认出来。'],
    ['他刚刚才认识她们俩', '刚认识是 meet（I’ve just met them）；他三十年前就见过这两个学生。'],
    ['他记得她们俩的电话号码', 'recognize 说的是“认出是谁”，不是记住号码。'],
    ['他把她们的名字写在了照片背面', '名字早就写在背面了；recognize 是“认出来”。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c2-used', st: 'ec2', lv: 2, type: 'tense', topic: 'used to', label: 'They used to sit together', intro: '', ask: 'used to 和一般过去时有什么不一样？',
    hints: ['高老师接着说：But that June, they stopped talking. 那现在呢？'],
    explain: 'used to + 动词原形：过去常常（或一直）这样，现在不这样了。一般过去时只说过去发生了什么，不说现在怎么样。',
    lock: { words: ['used to'] },
    ext: EXT_USED,
  }, C('a', '高老师说 They used to sit together by the window. 意思是——', [
    ['*她们以前总是坐在一起（后来不这样了）', '对。used to + 动词原形：过去常常这样，现在（或后来）不这样了。'],
    ['她们习惯了坐在窗边', '“习惯了”是 be used to + -ing（They are used to sitting there.）；used to sit 是“以前常常坐”。'],
    ['她们只在窗边坐过一次', 'used to 说的是过去常常、一直这样，不是一次。'],
    ['她们现在还坐在一起', 'used to 正好暗示：现在不这样了。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c2-where', st: 'ec2', lv: 2, type: 'fill', topic: '间接问句', label: 'Do you know where she lives?', intro: '', ask: '“你知道她住在哪儿吗”为什么不说 where does she live？',
    hints: ['Do you know 后面那一半，按陈述句排：疑问词 + 主语 + 动词。do / does / did 还要不要？'],
    explain: '问句放进 Do you know / Could you tell me 后面：疑问词 + 主语 + 动词（陈述句的语序）；原来帮忙的 do / does / did 不见了，单复数和时态落到动词上：where she lives、where they went。',
    back: [{ ch: 'ec2', line: 'ask', label: '回到问年鉴那一句：Could you tell me where the old yearbooks are?' }],
    ext: EXT_WHERE,
  }, fill('a', '放进句子，有的词用不上。', ['lives', 'does', 'went', 'does she live', 'did they go', 'live'], [
    ['Do you know where she ___ now?', 'lives', '线索：Do you know 后面这一半按陈述句排：where + she + 动词；she 是“她”，动词加 s：lives。live 少了 s。does she live 是直接问的语序（Where does she live?），放进句子里就不用 does 了。'],
    ['Could you tell me what Fang ___ now?', 'does', '线索：直接问是 What does Fang do?（Fang 做什么工作？）。放进句子里，帮忙的 does 不见了，可这里的 do 本身就是动词“做”，跟着 Fang 加 s：what Fang does。'],
    ['Do you know where they ___ after Grade 9?', 'went', '线索：after Grade 9 是过去的事。Where did they go? 放进句子里，did 不见了，过去的意思落到动词上：went。did they go 还是直接问句的语序。'],
  ])),

  item({
    id: 'c2-retired', st: 'ec2', lv: 1, type: 'word', topic: 'retire', label: 'He retired ten years ago', intro: '', ask: 'retired 和 tired 有关系吗？',
    hints: ['后半句说：but he still lives near the school。'],
    explain: 'retire：退休（v.）；retired：退休了的（adj.）；retirement：退休（n.）。周老师十年前就退休了，可还住在学校附近。',
    lock: { words: ['retired'] },
    ext: EXT_RETIRE,
  }, C('a', 'He retired ten years ago. 周老师十年前——', [
    ['*退休了（不再上班，人还住在学校附近）', '对。retire：到了年纪，不再工作。'],
    ['累坏了', '“累”是 tired；retired 只是长得像，意思没关系。'],
    ['离开了这座城市', '后半句说 he still lives near the school：他还住在学校附近。'],
    ['又回学校上课了', 're- 常常是“再、又”，可 retire 不是“再上班”，正好相反。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c2-write', st: 'ec2', lv: 2, type: 'write', topic: 'polite request', label: '给周老师留纸条', intro: '', ask: '给不认识的长辈留纸条，英语怎么开头？',
    hints: ['可以用 Could you tell me if we can … ? 后半句按陈述句排。'],
    explain: '请长辈帮忙、约时间，用 Could you tell me if / when…? 或 May we…?；间接问句的后半句用陈述句的语序：if we can visit you。',
    ext: EXT_WRITE,
  }, Wr('w', 'Write one polite sentence to Mr Zhou: can you visit him?', {
    lang: 'en', role: 'en',
    task: 'The student writes one polite English sentence in a short note to Mr Zhou, a retired teacher they have never met, asking if they may visit him (for example this Thursday afternoon) to ask about two of his former students. An indirect question (Could you tell me if / when …?) or “Could we / May we …?” is ideal.',
    criteria: ['a polite request (Could you tell me if / when …, Could we …, May we …, please)', 'clear meaning: asking whether or when the students can visit Mr Zhou', 'if an indirect question is used, the word order is a statement (if we can visit you, not if can we visit you)', 'spelling and grammar mostly correct'],
    examples: ['Dear Mr Zhou, could you tell me if we can visit you this Thursday afternoon?', 'Could you tell me when we can come to see you, please?', 'May we visit you on Thursday to ask about Lin Fang and Chen Yu?'],
    words: ['Could you tell me', 'if / when', 'we can visit you'], frame: 'Dear Mr Zhou, could you tell me ______?', ph: 'Dear Mr Zhou, …',
  })),

  item({
    id: 'c2-motto', st: 'ec2', lv: 2, type: 'read', topic: 'motto', label: '两句座右铭', intro: '', ask: '英语里有哪些常见的座右铭？',
    hints: ['give up 是“放弃”；go round 是“转动”。一个人把什么写成座右铭，说明她看重什么。'],
    explain: 'motto：座右铭——一句话说出一个人看重什么。Fang 写 Never give up（永不放弃）；Yu 写 Music makes the world go round（音乐让世界转起来），还写下了梦想：当一名音乐老师。',
    ext: EXT_MOTTO,
  }, C('a', '从两句座右铭看，这两个女孩是什么样的人？', [
    ['*Fang 认准了的事就不放弃；Yu 热爱音乐，梦想当音乐老师', '对。Never give up：永不放弃。Music makes the world go round：音乐让世界转起来——在她心里，音乐最要紧。'],
    ['Fang 很爱玩，什么都不在乎；Yu 不喜欢上学', '座右铭里看不出这些。Never give up 说的是坚持。'],
    ['两个人都想当医生', 'Fang 后来当了医生，可座右铭里没说；Yu 写下的梦想是 music teacher。'],
    ['Yu 想去世界各地旅行', 'go round 在这里是“转动”：音乐让世界转起来，不是去环游世界（travel around the world）。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'c2-match', st: 'ec2', lv: 2, type: 'match', topic: 'who 定语从句', label: '他们是谁', intro: '', ask: 'who、that、which 怎么分？',
    hints: ['先看 who 前面是哪种人（girl、librarian、teacher、boy），再看 who 后面说他做了什么。'],
    explain: 'who 引出的一段话放在“人”的后面，说明是哪一个人：the girl who…、the teacher who…。',
    back: [{ ch: 'ec2', line: 'who', label: '回到 Tao 在照片上找到 Chen Yu 那一句' }],
    ext: EXT_MATCH,
  }, Mt('a', '他们分别是谁？', ['the girl **who** is holding a music box', 'the tall girl **who** is standing next to her', 'the librarian **who** has worked here since 1990', 'the teacher **who** retired ten years ago', 'the boy **who** found Chen Yu in the photo'], ['Lin Fang', 'Mr Zhou', 'Chen Yu', 'Tao', 'Mr Gao', 'Mrs Hu'], [2, 0, 4, 1, 3], '', { lh: '描述', rh: '人', whys: [
    'who is holding a music box：捧着八音盒的女孩——Chen Yu。',
    'who is standing next to her：站在 Yu 旁边的高个子女孩——Lin Fang。她和上一项都是 girl，要看 who 后面说的是“捧着八音盒”，还是“站在她旁边”。',
    'who has worked here since 1990：从 1990 年起一直在这儿工作的图书管理员——Mr Gao。',
    'who retired ten years ago：十年前退休的老师——Mr Zhou。Mrs Hu 也是老师，可她还在上班。',
    'who found Chen Yu in the photo：在照片上找到 Chen Yu 的男生——Tao。',
  ] })),

  // ---------------- 支线任务：可做可不做 ----------------
  item({
    id: 'c2-x-dust', st: 'ec2', lv: 2, type: 'word', topic: 'mind', label: 'Mind the dust! 的 mind', intro: '', ask: 'mind 有几个意思？',
    hints: ['Mind the …! 是提醒：当心……；Do you mind…? 是问：你介意……吗？'],
    explain: 'Mind …!：当心……（Mind the dust / the gap / your head）；Do you mind…?：你介意……吗？；Never mind：没关系。',
  },
    T('t1', '', '高老师说 **Mind the dust!**——“当心灰尘！”这里的 mind 是“当心、注意”。伦敦的地铁站里，一天到晚都能听到这句广播：**Mind the gap.**（当心列车和站台之间的空隙。）'),
    C('a', '你要进一扇很矮的门，管理员提醒你：“Mind your head!” 意思是——', [
      ['*当心碰头！', '对：mind your head——当心你的头（别撞了）。'],
      ['动动你的脑子！', 'mind 在这里不是“头脑”，是“当心”。'],
    ], { keep: true }),
    T('t2', '', 'mind 还有一个常用的意思：**介意**。Do you mind if I open the window?（我开窗你介意吗？）回答 Not at all.（一点也不介意）就是“开吧”。还有一句 **Never mind.**——没关系、算了。'),
    C('b', 'Tao 碰翻了你的水杯，连声说 Sorry。你说——', [
      ['*Never mind.', '对：没关系，别放在心上。'],
      ['Mind the cup.', '杯子已经翻了，这时候提醒“当心杯子”，晚了。'],
      ['Not at all.', 'Not at all 用来回答 Do you mind…?（你介意吗）或者 Thank you。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['Mind', 'mind', 'Never mind', 'dusty', 'dust'], [
      ['___ the step! It’s dark here.', 'Mind', '线索：It’s dark here——提醒别人注意脚下：Mind the step!（当心台阶）Never mind 是“没关系”，不是提醒。'],
      ['Do you ___ if I sit here?', 'mind', '线索：Do you ___ if…——问对方介不介意：mind。'],
      ['“I’m sorry I’m late.” “___. Come in.”', 'Never mind', '线索：对方在道歉——没关系：Never mind。'],
      ['Nobody has opened these yearbooks for years. They’re all ___.', 'dusty', '线索：好多年没人翻——落满了灰：dusty（形容词）。dust 是名词“灰尘”，不能跟在 They’re all 后面说它们的样子。'],
    ]),
  ),
  item({
    id: 'c2-x-contact', st: 'ec2', lv: 2, type: 'word', topic: 'contact / keep in touch', label: 'contact、keep in touch、lose touch', intro: '', ask: '“保持联系”英语怎么说？',
    hints: ['contact 后面直接跟人；keep in touch 是保持联系，lose touch 是断了联系。'],
    explain: 'contact sb：联系某人（不加 with）；keep in touch：保持联系；lose touch（with sb）：和某人失去联系。',
  },
    T('t1', '', '**contact** 是“联系”：contact him（联系他）。注意：中文说“和他联系”，英语的 contact 后面直接跟人，不加 with。也可以说 **get in touch with** him。'),
    C('a', '哪一句对？', [
      ['*How can we **contact** him?', '对：contact + 人。'],
      ['How can we **contact with** him?', 'contact 当动词，后面直接跟人，不加 with。'],
    ], { keep: true }),
    T('t2', '', '保持联系：**keep in touch**；失去联系：**lose touch**（with sb）。1996 年夏天以后，Fang 和 Yu 就 **lost touch**——谁也不知道谁去了哪儿。'),
    C('b', '毕业那天，同学们互相说——', [
      ['*Let’s keep in touch!', '对：以后常联系！'],
      ['Let’s lose touch!', '这成了“以后断了联系吧”。'],
    ], { keep: true }),
    fill('c', '放进句子，有的词用不上。', ['contact', 'keep in touch', 'lost touch', 'touch', 'lose'], [
      ['We moved away and slowly ___ with our old neighbours.', 'lost touch', '线索：搬走了，slowly——渐渐没了联系：lost touch（lose 的过去式）。lose 是原形；说过去的事，要用 lost。'],
      ['Here is my email. Let’s ___!', 'keep in touch', '线索：留了邮箱——以后常联系：keep in touch。'],
      ['If you find anything, please ___ me at once.', 'contact', '线索：please ___ me——联系我：contact + 人。只写 touch 是“摸、碰”。'],
    ]),
  ),
];
