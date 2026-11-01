// 英文故事 The Case of the Golden Panda · Chapter 1 Gone!（播放式：分镜动画 + 英文配音 + 字幕，播到题就停）
// 语法和用词就是线索：has taken（现在还不在）、was eating（那一刻正在做）、borrow / lend（东西往哪边走）、Lent the panda（借出去了，不是偷）。
// 故事用英文讲、英文配音；AI 眼镜的话、题目的引导、拓展的讲解用中文，例句用英文。分镜见 第六堂课/分镜/英文第一章_Gone.md。
import { C, M, Mt, Od, So, Wr, item } from '../bank/h';
import type { Art, Ext, FillSub, FragSub, Item, Play, TeachSub, TypeSub } from '../types';

const fill = (key: string, q: string, bank: string[], sents: [string, string, string][]): FillSub => ({ kind: 'fill', key, q, bank, sents: sents.map(([t, a, why]) => ({ t, a, why })) });
const type = (key: string, q: string, accept: string[], why: string, near: Record<string, string> = {}, ph = ''): TypeSub => ({ kind: 'type', key, q, accept, near, why, ph });
const T = (key: string, q: string, t: string, ex?: string[], art?: Art): TeachSub => ({ kind: 'teach', key, q, t, ...(ex ? { ex } : {}), ...(art ? { art } : {}) });
/** 碎片：[文字, 第几层, 对不对（* 开头是对的）, 错在哪 / 讲到哪件事] */
const frag = (q: string, rows: [string, 1 | 2 | 3, string?][], events: Record<string, string>, need: FragSub['need'], order: string, model: string): FragSub => ({
  kind: 'frag', key: 'a', q, events, need, order, model,
  frags: rows.map(([t, layer, x]) => t.startsWith('*') ? { t: t.slice(1), layer, ok: true, ...(x ? { ev: x } : {}) } : { t, layer, ok: false, why: x }),
});
const viz = (k: string, p: Record<string, unknown> = {}) => ({ k, p });

export const PLAY_EN1: Play = {
  id: 'en1', lang: 'en', no: 1, title: 'Chapter 1　Gone!', sub: '金熊猫不见了', color: '#2F5DA8', next: 'en2', endAsk: ['侦探故事里的“不在场证明”英语怎么说？', '有人问 Where were you at 2:15? 怎么回答最好？', '“Lent the panda” 为什么不写成 I lent the panda？'],
  gloss: {
    prize: { d: 'n. 奖、奖品', py: '/praɪz/', s: { 'its top prize': '它的最高奖' }, more: { t: 'prize 是比赛赢来的奖；只差一个字母的 price 是“价格”。', q: '“The price is too high.” 说的是——', opts: [['价格太高了', true], ['奖太大了', false]] } },
    'Golden Panda': { d: '金熊猫：英语节最高奖的奖杯，是一只金色的熊猫。' },
    finalists: { d: 'n. 进入决赛的人（或作品）。final（决赛）+ -ist（……的人）', py: '/ˈfaɪnəlɪsts/', s: { 'one of the three finalists': '进入决赛的三篇作品之一' }, more: { t: '-ist 加在词后面，表示“干这一行的人”：art → artist（艺术家），piano → pianist（钢琴家），science → scientist（科学家）。', q: 'tour（旅行）+ -ist，tourist 是——', opts: [['游客', true], ['导游', false]] } },
    Relax: { d: 'v. 放松、别紧张', py: '/rɪˈlæks/' },
    mooncake: { d: 'n. 月饼（moon 月亮 + cake 饼）', py: '/ˈmuːnkeɪk/', more: { t: 'cake 能和别的词拼成新词：cupcake（纸杯蛋糕）、pancake（煎饼）、fishcake（鱼饼）。', q: 'pancake 是——', opts: [['煎饼（在平底锅 pan 里煎的饼）', true], ['熊猫饼', false]] } },
    'exchange student': { d: '交换生：到别的国家的学校上一段时间学的学生', py: '/ɪksˈtʃeɪndʒ ˈstjuːdnt/', more: { t: 'exchange 是“交换、兑换”：exchange gifts（交换礼物）、exchange money（换钱）。', q: '“We exchanged phone numbers.” 是——', opts: [['我们互相留了电话号码', true], ['我们换了新手机', false]] } },
    'bursts open': { d: '（门）猛地被冲开', py: '/bɜːsts/', s: { 'the door bursts open': '门一下子被猛地推开' }, more: { t: 'burst 是“一下子爆开、冲出来”：burst into tears（突然哭起来）、burst out laughing（突然笑出声）。', q: '“She burst into tears.” 是——', opts: [['她突然哭了起来', true], ['她把眼泪擦干了', false]] } },
    'in charge': { d: '负责、主管', s: { 'the teacher in charge': '负责（这次英语节）的老师' }, more: { t: 'charge 有好几个意思：charge your phone（给手机充电）、free of charge（免费）、in charge of（负责）。', q: '“Who is in charge of the class today?” 问的是——', opts: [['今天谁管这个班？', true], ['今天谁给班里充电？', false]] } },
    'went out': { d: '（灯、火）灭了；go out 的过去式', s: { 'the lights went out': '灯灭了' }, more: { t: 'go out 更常见的意思是“出门、出去”：Let’s go out for dinner.（我们出去吃晚饭吧）', q: '“She has gone out.” 是——', opts: [['她出去了（现在不在家）', true], ['她的灯灭了', false]] } },
    clue: { d: 'n. 线索', py: '/kluː/', more: { t: '“一点头绪都没有”，英语说 I have no clue! 或 I haven’t got a clue!', q: 'Ben 说“I have no clue!”，意思是——', opts: [['我一点头绪也没有', true], ['我把线索弄丢了', false]] } },
    'give it back': { d: '还回去（把东西还给原来的人）', s: { 'give it back after the case': '案子破了就还给你' } },
    case: { d: 'n. ① 案子、案件 ② 箱子、盒子', py: '/keɪs/', s: { 'after the case': '“案子”：等这个案子破了以后', 'a big drum case': '“箱子”：一个装鼓的大箱子', 'the drum case': '“箱子”：那个鼓箱', 'A drum case': '“箱子”：一个鼓箱' }, more: { t: '还有一个常用的说法 in case（以防万一）：Take an umbrella in case it rains.（带把伞，以防下雨）', q: '“pencil case” 是——', opts: [['文具盒、笔袋', true], ['铅笔案', false]] } },
    guard: { d: 'n. 门卫、保安', py: '/ɡɑːd/' },
    notice: { d: 'v. 注意到', py: '/ˈnəʊtɪs/', s: { 'I didn’t notice anyone': '我没注意到有什么人' }, more: { t: 'notice 也可以是名词“通知、告示”：a notice on the wall（墙上的一张告示）。', q: '“Did you read the notice?” 是——', opts: [['你看那张通知了吗？', true], ['你注意到了吗？', false]] } },
    match: { d: 'n. 比赛', py: '/mætʃ/', more: { t: 'match 还有两个意思：火柴（a box of matches）、相配（The shoes match your coat.）。', q: '“Your T-shirt matches your shoes.” 是——', opts: [['你的 T 恤和鞋子很配', true], ['你的 T 恤和鞋子在比赛', false]] } },
    scored: { d: 'v. 进球、得分（score 的过去式）', py: '/skɔːd/', more: { t: 'score 也是名词“比分、分数”：What’s the score?（比分多少？）a test score（考试分数）。', q: '“What’s the score?” 问的是——', opts: [['比分是多少', true], ['谁进的球', false]] } },
    enough: { d: 'adv. 足够地。big enough：足够大（enough 放在形容词后面）', py: '/ɪˈnʌf/', s: { 'big enough for a panda': '大得足够装下一只熊猫' }, more: { t: 'enough 放在形容词后面：old enough（年纪够大）、tall enough（够高）；放在名词前面：enough time（足够的时间）。', q: '“个子够高”是——', opts: [['tall enough', true], ['enough tall', false]] } },
    note: { d: 'n. 纸条、便条', py: '/nəʊt/', s: { 'a small yellow note': '一张黄色的小纸条' }, more: { t: 'note 还有：笔记（take notes 记笔记）、音符（a musical note）。', q: '“Please take notes in class.” 是——', opts: [['上课请记笔记', true], ['上课请传纸条', false]] } },
    stuck: { d: '粘住、卡住（stick 的过去分词）', py: '/stʌk/', s: { 'stuck under it': '贴在桌子底下' }, more: { t: 'stuck 还能说“卡住了、难住了”：I’m stuck on Question 5.（我卡在第 5 题了）', q: '“The door is stuck.” 是——', opts: [['门卡住了，打不开', true], ['门上贴着东西', false]] } },
    Back: { d: '回来、回到原处', py: '/bæk/', s: { 'Back at 3': '三点回来（谁回来？纸条上没写）' } },
    // 词组、语法点：句子里出现就画虚线、能点（点哪个词，给它所在的这个词组；题要考的那几个，由题的 lock 先锁住）。太简单的词不收。
    'p.m.': { d: '下午（拉丁文 post meridiem 的缩写）；上午是 a.m.' },
    hall: { d: 'n. 礼堂、大厅', py: '/hɔːl/' },
    'is full of': { d: '……满是、坐满了。be full of + 人或东西：The box is full of books.' },
    'In twenty minutes': { d: '再过二十分钟。in + 一段时间，说将来：……以后。注意：不是“在二十分钟之内”。' },
    'will give out': { d: '将要颁发。will + 动词原形：将要（将来）；give out：发出去、颁发。' },
    Festival: { d: 'n. 节日；English Festival：英语节', py: '/ˈfestɪvl/' },
    'one of': { d: '……之一。one of + 复数名词：one of my friends（我的朋友之一）。' },
    'You’ll be fine': { d: '你会没事的。You’ll = You will；fine 在这里是“好、没问题”。' },
    'Want a mooncake': { d: '口语里省掉了 Do you：Do you want a mooncake?（要不要来块月饼？）' },
    'has been in Beijing for two weeks': { d: '在北京待了两个星期（现在还在）。has been + 地方 + for + 一段时间：从那时起一直待到现在。' },
    'has already eaten': { d: '已经吃了（到现在为止）。already 常和 has + 过去分词一起用：I’ve already finished.' },
    Suddenly: { d: 'adv. 突然', py: '/ˈsʌdnli/' },
    Ms: { d: '女士（称呼女性，不管结没结婚）；男的叫 Mr。后面跟姓：Ms Green。', py: '/mɪz/' },
    'runs in': { d: '跑进来（run + in：往里跑）。说故事时用一般现在时，读起来像就在眼前。' },
    'Her face is white': { d: '她脸色发白——吓坏了、急坏了，脸上没有血色（也说 pale）。' },
    'Has anyone seen': { d: '有人看见……了吗？Has 放到前面就成了问句；anyone 用在问句里：任何人。' },
    'has taken': { d: '拿走了（现在还不在）：has + 过去分词，说过去的事、结果留到现在。' },
    'right here': { d: '就在这儿（right 加强语气：就、正好）' },
    'at two o’clock': { d: '在两点钟（整点用 o’clock）' },
    'for a minute': { d: '（持续了）一分钟' },
    took: { d: 'take 的过去式：拿走了。说的是过去那个时候（趁黑那会儿）发生的事，所以不用 has taken。' },
    'in the dark': { d: '在黑暗中、趁黑' },
    'What were you all doing': { d: '你们大家都在干什么？问的是“灯灭的那个时候”。were + 主语 + doing 是问“那时在做什么”。' },
    'was eating': { d: '那时正在吃：was / were + doing，说过去某一刻正在做的事。' },
    'of course': { d: '当然、那还用说' },
    'need to': { d: '需要（做某事）：need to + 动词原形' },
    'write down': { d: '写下来、记下来' },
    'haven’t got': { d: '没有。英国人常说 have got（＝have）；haven’t got ＝ don’t have。' },
    'Can I': { d: '我可以……吗？（请别人允许自己做某事）' },
    borrow: { d: 'v. 借（进来）：从别人那里借。借出去是 lend。' },
    'You both': { d: '你们俩（两个人都）' },
    gate: { d: 'n. 大门' },
    'is sitting': { d: '正坐着（is + doing：说眼前正在发生的事）' },
    'with his phone': { d: '拿着他的手机（with：带着、拿着）' },
    anyone: { d: 'pron. 任何人（用在问句、否定句里）：I didn’t see anyone.（我谁也没看见）' },
    'was watching': { d: '那时正在看：was / were + doing。看比赛这种盯着看一段时间的，用 watch。' },
    'on my phone': { d: '用我的手机（看）：在手机、电视上看，用 on' },
    'But wait': { d: '不过等等（突然想起了什么）' },
    'at about 2:20': { d: '大约两点二十（about：大约）' },
    drum: { d: 'n. 鼓', py: '/drʌm/' },
    'went towards': { d: '朝……走去（towards：朝着、往……那边）' },
    'Back in the hall': { d: '回到礼堂（back：回到原来的地方）' },
    'look at': { d: '看着、看向。look 后面要跟 at，才能接“看什么”：look at the clock。' },
    empty: { d: 'adj. 空的', py: '/ˈempti/' },
    'There is': { d: '有……。There is + 东西 + 地方：某处有某物（There is a note under the table.）' },
    'It says': { d: '上面写着（纸条、牌子、书上“说”，用 say）' },
    Lent: { d: 'lend 的过去式：借出去了。' },
    whispering: { d: '小声说、耳语（whisper 的 -ing 形式）', py: '/ˈwɪspərɪŋ/' },
    'Ms Green’s': { d: 'Green 老师的（’s 表示“……的”）' },
    'Did she lend it to someone': { d: '她把它借给别人了吗？lend + 东西 + to + 人：把……借给某人。' },
    'is still talking': { d: '还在说（still：还、仍然；is talking：正在说）' },
    'on the phone': { d: '在打电话' },
    'doesn’t look at': { d: '不看（doesn’t = does not）' },
    'You have twenty minutes': { d: '你们还有二十分钟' },
    'first name': { d: '名（不是姓）', more: { t: '英语里名在前、姓在后：Margaret Green——Margaret 是名（first name），Green 是姓（family name）。称呼老师用 Ms + 姓：Ms Green。', q: '刘师傅叫刘建国。英语里称呼他——', opts: [['Mr Liu', true], ['Mr Jianguo', false]] } },
  },
  lines: [
    { shots: [['e.hall', 1.2], ['e.clock240', 0.8]], t: '**Friday, 2:40 p.m.** The school hall is full of students.', tr: '星期五下午两点四十。学校{礼堂}里{坐满了}学生。', trHard: 'words', voice: 'en', ask: '英语节（English Festival）一般有哪些活动？' },
    { shots: [['e.stage'], ['e.panda', 0.9]], t: 'In twenty minutes, the English Festival will give out its top ⟦prize⟧ — the ⟦Golden Panda⟧.', tr: '再过二十分钟，英语节就要{颁发}{最高奖}——{金熊猫}。', trHard: 'frame', voice: 'en' },
    { side: ['e1-x-final'], shots: [['e.finalists'], ['e.hands', 0.8]], id: 'cold', t: 'Your story is one of the three ⟦finalists⟧. Your hands are cold.', tr: '你写的故事是三篇{决赛作品}之一。你的手{冰凉}。', trHard: 'words', voice: 'en', task: ['e1-nervous'] },
    { shots: [['e.benOffer']], who: 'Ben', voice: 'ben', t: '⟦Relax⟧! You’ll be fine. Want a ⟦mooncake⟧?', tr: '{放轻松}！你{没问题的}。来块{月饼}？', trHard: 'frame' },
    { shots: [['e.map'], ['e.benEats', 1.1]], id: 'ben', t: 'Ben is an ⟦exchange student⟧ from London. He has been in Beijing for two weeks, and he has already eaten nine mooncakes.', tr: 'Ben 是从伦敦来的{交换生}。他{!来北京已经两个星期了}，已经吃了九块{月饼}。', trHard: 'frame', voice: 'en', ask: '交换生是怎么回事？' },
    { shots: [['e.door'], ['e.greenRun']], id: 'door', t: 'Suddenly the door ⟦bursts open⟧. Ms Green, the teacher ⟦in charge⟧, runs in. Her face is white.', tr: '突然，门被{!猛地推开}。{!负责}英语节的 Green 老师{跑了进来}，{!脸色发白}。', trHard: 'words', voice: 'en' },
    { shots: [['e.glasses']], prompt: true, who: 'AI 眼镜', voice: 'ai', hide: true, t: 'AI 眼镜把刚才这几句翻成了中文。可是有几处不太对——找出来。', task: ['e1-mis'] },
    { shots: [['e.greenCU']], id: 'taken', who: 'Ms Green', voice: 'green', t: 'Has anyone seen the Golden Panda? Someone has taken it!', tr: '有人{看见}金熊猫了吗？有人把它{!拿走了}！', trHard: 'frame', task: ['e1-taken', 'e1-taken3'], ask: 'has taken 和 took 有什么不一样？' },
    { side: ['e1-x-lose'], shots: [['e.emptyTable']], who: 'Ms Green', voice: 'green', t: 'It was right here on this table at two o’clock. I saw it.', tr: '两点钟的时候，它{就在}这张{桌子}上。我{看见}了。', trHard: 'frame' },
    { shots: [['e.lightsOut']], who: 'Ms Green', voice: 'green', t: 'Then at 2:15, the lights ⟦went out⟧ for a minute. Maybe someone took it in the dark!', tr: '后来两点一刻，灯{灭}了一分钟。{说不定}有人{趁黑}把它{拿走}了！', trHard: 'words' },
    { shots: [['e.greenAsk']], who: 'Ms Green', voice: 'green', t: 'What were you all doing when the lights went out?', tr: '灯灭的时候，{你们}都{在做}什么？', trHard: 'frame' },
    { shots: [['e.benDark']], id: 'eating', who: 'Ben', voice: 'ben', t: 'I was eating a mooncake, of course!', tr: '我{!在吃}月饼呀，{那还用说}！', trHard: 'frame', task: ['e1-eating'], ask: 'was eating 和 ate 有什么不一样？' },
    { shots: [['e.benPockets']], who: 'Ben', voice: 'ben', id: 'clue', t: 'We need to write down every ⟦clue⟧. Hmm… I haven’t got a notebook.', tr: '我们{得}把每条{线索}都{记下来}。嗯……我{没带}本子。', trHard: 'words', task: ['e1-clueword'] },
    { shots: [['e.notebook']], id: 'borrow', who: 'Ben', voice: 'ben', t: 'Can I borrow your notebook? I’ll ⟦give it back⟧ after the ⟦case⟧.', tr: '能{借}一下你的本子吗？{案子}破了我就{还}你。', trHard: 'words', task: ['e1-borrow', 'e1-borrow1'], ask: 'borrow 和 lend 怎么分？' },
    { shots: [['e.corridor'], ['e.gate', 1.2]], t: 'You both run to the school gate. The ⟦guard⟧, Mr Liu, is sitting in his room with his phone.', tr: '你们俩跑到学校{门口}。{门卫}刘师傅正{坐}在门卫室里看手机。', trHard: 'words', voice: 'en' },
    { shots: [['e.booth']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '你想请刘师傅说说：两点以后，有谁进过礼堂？用英语开口，第一句怎么说最好？', task: ['e1-polite'], ask: '英语里怎么客气地请人帮忙？' },
    { shots: [['e.liuCU']], id: 'notice', who: 'Mr Liu', voice: 'liu', t: 'Hmm? Sorry, I didn’t ⟦notice⟧ anyone.', tr: '嗯？{不好意思}，我没{注意到}有人。', trHard: 'words', task: ['e1-notice'] },
    { shots: [['e.phone']], id: 'watch', who: 'Mr Liu', voice: 'liu', t: 'At 2:15 I was watching the football ⟦match⟧ on my phone. China ⟦scored⟧!', tr: '两点一刻我{在}用手机{看球赛}。中国队{进球}了！', trHard: 'words', task: ['e1-watch'], ask: 'look、see、watch 有什么不一样？' },
    { shots: [['e.drumBoy']], who: 'Mr Liu', voice: 'liu', t: 'But wait… at about 2:20, I saw a boy with a big drum ⟦case⟧. He went towards the music room.', tr: '不过等等……{大概}两点二十，我看见一个男孩{拖着}一个{大鼓箱}，{往}音乐教室那边去了。', trHard: 'words' },
    { shots: [['e.benWow']], who: 'Ben', voice: 'ben', t: 'A drum case! That’s big ⟦enough⟧ for a panda!', tr: '{鼓箱}！装一只熊猫{足够}了！', trHard: 'frame' },
    { shots: [['e.underTable']], t: 'Back in the hall, you look at the empty table again. There is a small yellow ⟦note⟧ ⟦stuck⟧ under it.', tr: '{回到}礼堂，你{又}看了看那张{空}桌子。桌子底下{贴着}一张黄色的小{纸条}。', trHard: 'words', voice: 'en' },
    { shots: [['e.note']], id: 'note', t: 'It says: “Lent the panda. ⟦Back⟧ at 3. — M”', read: 'It says: Lent the panda. Back at three. M.', tr: '纸条上写着：“{!熊猫借出去了}。{三点回来}。——M”', trHard: 'frame', voice: 'en', task: ['e1-lent'], ask: '纸条上的英语为什么这么短？' },
    { shots: [['e.whisper']], who: 'Ben', voice: 'ben', t: '(whispering) M… Ms Green’s ⟦first name⟧ is Margaret. Did she lend it to someone?', read: 'M… Ms Green’s first name is Margaret. Did she lend it to someone?', tr: '（{小声}）M……Green 老师的{名字}叫 Margaret。是她把熊猫{借给}了别人？', trHard: 'words' },
    { shots: [['e.write']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '侦探笔记的第一行，由你来写：到现在为止，发生了什么？用一句英语写下来。', task: ['e1-clue'] },
    { shots: [['e.greenPhone']], t: 'Ms Green is still talking on the phone. She doesn’t look at you.', tr: 'Green 老师{还在}{打电话}，看都不看你们一眼。', trHard: 'words', voice: 'en' },
    { shots: [['e.clockEnd']], t: 'Who is M? Who is the boy with the drum case? You have twenty minutes.', tr: 'M 是谁？拖鼓箱的男孩又是谁？你们{还有}二十分钟。', trHard: 'frame', voice: 'en' },
    { shots: [['e.boardHold']], prompt: true, who: 'AI 眼镜', voice: 'ai', t: '把今天找到的线索，按时间顺序排一排。', task: ['e1-order'] },
    { shots: [['e.board']], who: 'AI 眼镜', voice: 'ai', t: '第一章到这里。下一章，好几个人都说自己当时不在场——Where were you？', read: '第一章到这里。下一章，好几个人都说自己当时不在场。Where were you?', ask: '侦探故事里，“不在场证明”是什么意思？' },
  ],
};

// ---------------- 拓展：讲一小段、问一句，一步一步往下走 ----------------
const EXT_MIS: Ext[] = [
  { id: 'x1', title: '一个词，好几个意思', need: 'always', steps: [
    T('t1', '', 'AI 眼镜为什么会把 in charge 译成“正在充电”？因为 charge 最常见的意思之一就是“充电”。英语里很多词都有好几个意思，要看它和谁在一起。'),
    C('a', '“Who is in charge of the festival?” 问的是——', [
      ['*谁负责这次英语节', '对。in charge of：负责、主管。'],
      ['谁给英语节充电', '英语节没法充电：charge 和 in、of 在一起，是“负责”。'],
    ], { keep: true }),
    C('b', '再看一个：“My phone is dead. I need to charge it.” 这个 charge 是——', [
      ['*充电', '对，手机没电了，要充电。'],
      ['负责', '手机没电了（dead），后面要做的是充电。'],
    ], { keep: true }),
    T('t2', '', 'case 也是这样：after the case 是“案子”，a drum case 是“鼓箱”，a pencil case 是“笔袋”。'),
    Mt('c', '这三个 match，各是什么意思？', ['We watched a football match.', 'I need a match to light the candle.', 'Your hat matches your scarf.'], ['比赛', '火柴', '相配'], [0, 1, 2], '看它和谁在一起：football match 是比赛；light the candle（点蜡烛）用的是火柴；hat matches scarf 是帽子和围巾相配。', { lh: '句子', rh: '意思' }),
    C('d', '那 AI 眼镜该怎么做，才能少译错？', [
      ['*先看这个词前后跟着什么，再定它在这句话里的意思', '对。先看上下文，再定意思——你自己读英语时也是这样。'],
      ['每个词都用最常见的那个意思', '刚才的“正在充电”“门爆炸了”，就是这么错的。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: 'has been 和 has gone', need: 'opt', steps: [
    T('t1', '', '“He has been in Beijing for two weeks”：两周前来的，一直待到现在——人还在北京。还有两个长得很像的说法，说的是“人现在在哪儿”。'),
    C('a', '“Ben has gone to the library.” Ben 现在在哪儿？', [
      ['*在图书馆（去了，还没回来）', '对。has gone：去了，人现在在那儿。'],
      ['在教室（去过，已经回来了）', '那是 has been to the library。'],
    ], { keep: true }),
    C('b', '那“Ben has been to the library.”呢？', [
      ['*已经回来了（去过）', '对。has been to：去过，已经回来了。'],
      ['还在图书馆', '还在图书馆，是 has gone to。'],
    ], { keep: true }),
    C('c', 'Green 老师来找 Ben。同学说：“He’s not here. He ___ to the music room.”', [
      ['*has gone', '对。人不在这儿——去了，还没回来。'],
      ['has been', 'has been to 是去过、已经回来了；可 Ben 现在不在这儿。'],
    ], { keep: true }),
    C('d', '“Have you ever ___ to London?”（你去过伦敦吗？）', [
      ['*been', '对。问去没去过（有没有这个经历），用 been。'],
      ['gone', 'Have you gone to London? 成了“你去了伦敦（现在人在伦敦）吗”——你明明就在跟前。'],
    ], { keep: true }),
  ] },
];

const EXT_TAKEN: Ext[] = [
  { id: 'x1', title: '过去的事，现在的结果', need: 'always', steps: [
    T('t0', '', '先在同一张桌子前，把事情从头看一遍：两点钟，金熊猫在桌上；两点一刻灯一灭，它被拿走了；现在灯亮了，桌上空空的。', undefined, viz('clip', { shots: [['tq.perfect', 1]], dur: 10, cap: [[0, '2:00　The Golden Panda **is** on the table.'], [0.3, '2:15　The lights went out. Someone **took** it.'], [0.6, 'Now　“Someone **has taken** it!” It’s gone.']], marks: [[0.05, '2:00'], [0.42, '2:15'], [0.8, 'now']] })),
    C('t0a', '灯亮以后，Green 老师一看桌子，喊的是“Someone has taken it!”。她为什么用 has taken，不说 took？', [
      ['*她说的是眼前的样子：熊猫现在不在桌上', '对。has taken 盯着的是“现在”：东西被拿走了，现在还没回来。'],
      ['因为她知道是两点一刻被拿走的', '要说“两点一刻拿走的”，反而得用 took。'],
    ], { keep: true }),
    C('t0b', '要说“两点一刻的时候，有人把它拿走了”，用——', [
      ['*Someone took it at 2:15.', '对。说的是过去那一刻：took。'],
      ['Someone has taken it at 2:15.', 'has taken 不和 at 2:15 这样具体的过去时间放在一起。'],
    ], { keep: true }),
    T('t1', '', '把刚才那段画成时间线：拿走发生在过去，可是结果一直留到现在——现在还不在。', undefined, viz('timeline', { mode: 'perfect' })),
    C('a', 'Ben 站在宿舍门口，进不去。他会说——', [
      ['*I’ve lost my key.', '对。钥匙丢了，到现在还没找到——所以进不去。'],
      ['I lost my key last year.', '去年丢的钥匙，和他现在进不去门扯不上。'],
    ], { keep: true }),
    C('b', '要说清楚“是两点一刻拿走的”，哪句对？', [
      ['*Someone took it at 2:15.', '对。说出了过去的具体时间，就用 took。'],
      ['Someone has taken it at 2:15.', 'has taken 说的是“现在的结果”，不和 at 2:15、yesterday 这样的过去时间放在一起。'],
    ], { keep: true }),
    T('t2', '', '一会儿你会听到 Green 老师说：Maybe someone took it in the dark!——她说的是“趁黑的那个时候”，所以用 took。'),
    T('t3', '', '英国人和美国人在这儿习惯不一样：刚发生、结果还在的事，英国人一般用现在完成时（I’ve lost my key! Someone has taken it!），美国人也常说 I lost my key! Someone took it! 两种都是地道的英语。Ben 和 Green 老师是英国人，**这个故事按英式英语来答**。', ['🇬🇧 I’ve lost my key. Someone has taken my bike!', '🇺🇸 I lost my key. Someone took my bike!']),
    C('t3a', '一个美国同学丢了钥匙，说：“I lost my key!” 他说错了吗？', [
      ['*没错，美国人常这么说；英国人更常说 I’ve lost my key.', '对。这是英美习惯不同，不是对错。'],
      ['错了，必须说 I’ve lost my key.', '美国英语里 I lost my key! 很自然。这个故事按英式答，可别人这么说不算错。'],
    ], { keep: true }),
    C('t3b', '哪一句不管英式还是美式，都是错的？', [
      ['*I’ve lost my key yesterday.', '对。带了具体的过去时间（yesterday），英美都只能用一般过去时：I lost my key yesterday.'],
      ['I lost my key yesterday.', '这句英美都对：说的是昨天发生的事。'],
      ['I’ve lost my key.', '这句是英式最常见的说法。'],
    ]),
    So('c', '这些句子，说的是“现在的样子”，还是“过去那时候发生了什么”？', ['现在的样子（结果还在）', '过去那时候发生了什么'], [
      ['Look! Someone has broken the window.', 0, '玻璃现在还碎着。'],
      ['Someone broke the window last week. It’s fixed now.', 1, 'last week 的事，窗户早修好了。'],
      ['I’ve finished my homework. Can I go out now?', 0, '作业写完了，所以现在可以出去。'],
      ['I finished my homework at nine last night.', 1, '说的是昨晚九点那时候。'],
      ['Ben has eaten nine mooncakes.', 0, '到现在为止，一共吃了九块。'],
      ['Ben ate a mooncake at 2:15.', 1, '两点一刻那时候吃的。'],
    ]),
    T('t4', '', '再把三个时态放在一起比：同一个 Ben，同一块月饼，说法不一样，意思就不一样。', undefined, viz('clip', { shots: [['tq.every', 1], ['tq.once', 1], ['tq.sofar', 1]], dur: 13, cap: [[0, 'Ben **eats** mooncakes every day.（一般现在时：常常这样）'], [0.333, 'Ben **ate** a mooncake at 2:15.（一般过去时：过去那一刻）'], [0.666, 'Ben **has eaten** nine mooncakes.（现在完成时：到现在为止）']], marks: [[0.04, 'eats'], [0.37, 'ate'], [0.7, 'has eaten']] })),
    C('t4a', '“Ben has eaten nine mooncakes.” 说的是——', [
      ['*到现在为止，他一共吃了九块', '对：数到“现在”。'],
      ['他每天都吃九块', '每天的习惯，用 eats。'],
      ['两点一刻那一下，他吃了九块', '说过去那一刻，用 ate。'],
    ], { keep: true }),
    fill('t4b', '放进句子。', ['eats', 'ate', 'has eaten'], [
      ['Ben ___ a mooncake every afternoon.', 'eats', '每天都这样：一般现在时。'],
      ['Ben ___ a mooncake at 2:15 yesterday.', 'ate', '过去那一刻：一般过去时。'],
      ['Look at all the plates! Ben ___ nine mooncakes!', 'has eaten', '到现在为止的结果：现在完成时。'],
    ]),
    fill('d', 'has / have 后面跟过去分词。放进句子。', ['taken', 'lost', 'eaten', 'broken'], [
      ['Someone has ___ the Golden Panda!', 'taken', 'take → taken'],
      ['Oh no! I’ve ___ my key.', 'lost', 'lose → lost'],
      ['Who has ___ my mooncake? It was here a minute ago!', 'eaten', 'eat → eaten'],
      ['Be careful! Someone has ___ a glass on the floor.', 'broken', 'break → broken'],
    ]),
  ] },
  { id: 'x2', title: 'Has anyone seen…? 怎么回答', need: 'opt', steps: [
    T('t1', '', 'Green 老师问：Has anyone seen the Golden Panda?——“到现在为止，有谁看见过金熊猫吗？”'),
    C('a', '按英式英语，要回答“我没看见”，最自然的是——', [
      ['*No, I haven’t.', '对。问句用 Has / Have，回答也用 have / haven’t。'],
      ['No, I didn’t.', '美国人口语里也有人这么答；可问句用的是 Has / Have，按英式就答 No, I haven’t.'],
    ], { keep: true }),
    C('b', '“Have you ever eaten a mooncake?” 问的是——', [
      ['*你吃过月饼吗（有没有这个经历）', '对。ever：到现在为止，有没有过。'],
      ['你昨天吃月饼了吗', '问昨天要说：Did you eat a mooncake yesterday?'],
    ], { keep: true }),
    type('c', '用英语回答：“Have you ever eaten a mooncake?”（你吃过）', ['Yes, I have.', 'Yes I have'], 'Have you…? → Yes, I have. / No, I haven’t.', { 'Yes, I did.': 'Did you…? 才用 did 回答；这里问的是 Have you…?', 'Yes, I ate.': '简单地答 Yes, I have. 就好。' }, 'Yes, …'),
  ] },
];

const EXT_EATING: Ext[] = [
  { id: 'x1', title: '那一刻，正在做', need: 'always', steps: [
    T('t0', '', '先看两段小视频。第一段：', undefined, viz('clip', { shots: [['tq.cont', 1]], dur: 9, cap: [[0, '2:10　Ben **is eating** a mooncake.'], [0.45, '2:15　The lights went out. Ben **was eating** a mooncake.'], [0.85, '灯灭的那一刻，他已经吃了一会儿，还在吃。']], marks: [[0.05, '2:10'], [0.47, '2:15 灯灭']] })),
    T('t0b', '', '第二段：', undefined, viz('clip', { shots: [['tq.ate', 1]], dur: 9, cap: [[0, '2:10　Ben has a mooncake in his hand.'], [0.3, '2:15　The lights went out…'], [0.45, '…and then Ben **ate** the mooncake.'], [0.85, '灯一灭，他才开始吃——是不是有点可疑？']], marks: [[0.05, '2:10'], [0.32, '2:15 灯灭']] })),
    C('t0c', 'Ben 说的是 When the lights went out, I was eating a mooncake. 他说的是哪一段？', [
      ['*第一段：灯灭之前他就在吃，灯灭的时候还在吃', '对。was eating：那一刻，正在做。'],
      ['第二段：灯灭以后他才开始吃', '那要说 When the lights went out, I ate a mooncake.'],
    ], { keep: true }),
    T('t1', '', '把第一段画成时间线：was eating 是一段时间（一直在吃），灯灭的那一刻，正好落在这段时间中间。', undefined, viz('timeline', { mode: 'cont' })),
    C('a', '要是 Ben 说的是：When the lights went out, I **ate** a mooncake. 侦探会怎么想？', [
      ['*灯一灭他才开始吃——像是趁黑做了点什么', '对。ate 说的是一件接一件：灯先灭，他再吃。时态一换，嫌疑就来了。'],
      ['和 was eating 一样，没区别', '不一样：ate 是灯灭了以后才吃的。'],
    ], { keep: true }),
    C('b', '“When the phone rang, I was having a shower.” 电话响的时候——', [
      ['*我正在洗澡（所以没接）', '对。电话响的那一刻，澡已经洗了一会儿了。'],
      ['电话响了，我才去洗澡', '那要说 When the phone rang, I had a shower.'],
    ], { keep: true }),
    So('c', '哪个是“那一刻正在做”，哪个是“那之后才做”？', ['那一刻正在做', '那之后才做'], [
      ['When the bell rang, I was reading.', 0, '铃响时，已经在看书了。'],
      ['When the bell rang, I ran out of the classroom.', 1, '铃一响，才跑出去。'],
      ['When Mum came in, we were watching TV.', 0, '妈妈进来时，电视已经在看了。'],
      ['When Mum came in, we turned off the TV.', 1, '妈妈进来以后才关的电视。'],
      ['When the lights went out, Ben was eating a mooncake.', 0, '灯灭时他嘴里正嚼着。'],
      ['When the lights went out, everyone screamed.', 1, '灯一灭，大家才叫起来。'],
    ]),
    type('d', 'Green 老师问：“What ___ you all doing when the lights went out?” 空里填什么？', ['were'], 'you all 是“你们”，复数：were + doing。', { was: 'you（你们）后面用 were，不用 was。', are: '问的是过去（灯灭的时候），用过去式。' }),
    Wr('e', '你也回答 Green 老师：两点一刻你在做什么？用 At 2:15 I was … 写一句。', {
      lang: 'en', role: 'en',
      task: 'The student answers the question “What were you doing at 2:15?” with one English sentence about themselves, using the past continuous (At 2:15 I was … -ing).',
      criteria: ['uses the past continuous correctly (was + verb-ing)', 'a complete, sensible sentence about what the student was doing at that moment', 'spelling and word order are correct'],
      examples: ['At 2:15 I was reading a book in the library.', 'At 2:15 I was talking to my friend in the hall.', 'At 2:15 I was drinking some water.'],
      words: ['At 2:15', 'I was', 'reading / talking / playing'], frame: 'At 2:15 I was ______ing ______.', ph: 'At 2:15 I was …',
    }),
  ] },
  { id: 'x2', title: '侦探的问话', need: 'opt', steps: [
    T('t1', '', '问“当时在做什么”：What were you doing at 2:15? 问“当时在哪儿”：Where were you at 2:15?——下一章的题目就是这一句。'),
    Mt('a', '问话和回答连起来。', ['What were you doing at 2:15?', 'Where were you at 2:15?', 'Who were you with?', 'Did you see anyone?'], ['I was eating a mooncake.', 'I was in the hall.', 'I was with Ben.', 'No, I didn’t.'], [0, 1, 2, 3], '问什么，答什么：doing 问做什么，where 问在哪儿，who 问和谁，Did 问有没有。', { lh: '问', rh: '答' }),
    C('b', '“Where were you at 2:15?” 回答“I was eating a mooncake.”，好不好？', [
      ['*不好，答非所问：问的是“在哪儿”，要说地方', '对。要答 I was in the hall. 再补一句在做什么也行。'],
      ['可以，意思差不多', '侦探问的是地方。答非所问，最容易让人起疑心。'],
    ], { keep: true }),
  ] },
];

const EXT_BORROW: Ext[] = [
  { id: 'x1', title: '东西往哪边走', need: 'always', steps: [
    T('t1', '', 'borrow 和 lend 是同一件事，看谁是主语：你把本子借出去——You lend Ben your notebook；Ben 借进来——Ben borrows your notebook.', undefined, viz('give', { mode: 'both' })),
    C('a', '你把尺子借给同桌 Tom。你说——', [
      ['*I lent my ruler to Tom.', '对。你是借出的一方：lend → lent。'],
      ['I borrowed my ruler to Tom.', '你是借出去，不是借进来。'],
    ], { keep: true }),
    C('b', '反过来，Tom 说——', [
      ['*I borrowed a ruler from you.', '对。Tom 是借进来：borrow … from 某人。'],
      ['I lent a ruler from you.', 'lend 后面跟 to（借给谁），不跟 from。'],
    ], { keep: true }),
    fill('c', '放进句子。', ['borrow', 'lend', 'lent', 'borrowed'], [
      ['Can I ___ your pen, please?', 'borrow', '我借进来。'],
      ['Could you ___ me your ruler?', 'lend', '你借给我：lend + 人 + 东西。'],
      ['My sister ___ me her bike yesterday.', 'lent', '姐姐借出，又是昨天：lent。'],
      ['I ___ this book from the school library.', 'borrowed', '从图书馆借进来：borrowed。'],
    ]),
    T('t2', '', '英语里还有好几对“方向词”：bring（带过来，往说话人这边）/ take（带走，往别处去）；buy（买进）/ sell（卖出）。'),
    C('d', 'Ben 在学校给你打电话：“Can you ___ your notebook to school tomorrow?”', [
      ['*bring', '对。Ben 在学校，本子要往他那边来：bring。'],
      ['take', 'take 是带走、带到别处去；Ben 就在学校等着你。'],
    ], { keep: true }),
  ] },
  { id: 'x2', title: 'lend – lent – lent', need: 'opt', steps: [
    T('t1', '', 'lend 的过去式不是 lended，是 lent。好些常用的词都这么“不守规矩”，要一个一个记。'),
    Mt('a', '原形和过去式连起来。', ['lend', 'take', 'see', 'eat', 'lose'], ['lost', 'ate', 'lent', 'saw', 'took'], [2, 4, 3, 1, 0], '这些都是不规则动词：lend → lent，take → took，see → saw，eat → ate，lose → lost。', { lh: '原形', rh: '过去式' }),
    C('b', '“Can you lend me a hand?” 是——', [
      ['*能帮我一把吗？', '对。lend a hand：帮个忙。'],
      ['能借我一只手吗？', '字面是借一只手，其实是请人帮忙。'],
    ], { keep: true }),
    type('c', '“昨天我把伞借给了 Ben。” I ___ my umbrella to Ben yesterday.', ['lent'], '借出去，又是昨天：lend 的过去式 lent。', { lended: 'lend 的过去式是 lent，不是 lended。', borrowed: '你是借出去的一方。', lend: '说的是昨天，要用过去式。' }),
  ] },
];

const EXT_POLITE: Ext[] = [
  { id: 'x1', title: '越客气，句子越长', need: 'always', steps: [
    T('t1', '', '请别人帮忙，句子越委婉，听起来越客气：Could 比 Can 客气，加 please 更客气。', undefined, viz('meter', { items: [['Tell me …', 0.05], ['I want …', 0.2], ['Can you … ?', 0.5], ['Could you … , please?', 0.78], ['Would you mind …ing?', 0.95]] })),
    { ...So('a', '把这些话放到色带上：生硬的放左边，一般的放中间，客气的放右边。', ['生硬', '一般', '客气'], [
      ['Give me your pen.', 0, '命令的口气。'],
      ['I want some water.', 0, 'I want 听起来像在提要求。'],
      ['Can I have some water?', 1, '可以，熟人之间常这么说。'],
      ['Can you help me?', 1, '可以，不算失礼。'],
      ['Could I have some water, please?', 2, 'Could + please，很客气。'],
      ['Would you mind opening the window?', 2, '很客气、很委婉。'],
    ]), scale: true },
    C('b', '有人问你：“Would you mind opening the window?” 你愿意帮忙，该说——', [
      ['*Not at all.', '对。mind 是“介意”：Not at all——一点也不介意，我这就开。'],
      ['Yes, I would.', 'Yes, I would 的意思是“是的，我介意”——等于拒绝了。'],
    ], { keep: true }),
    C('c', '你不小心撞到了别人，说——', [
      ['*Sorry!', '对。给人添了麻烦、做错了事，说 Sorry。'],
      ['Excuse me.', 'Excuse me 是开口打扰别人、请人让路的时候说的。'],
    ], { keep: true }),
    C('d', '想请前面的人让一让，说——', [
      ['*Excuse me.', '对。Excuse me：打扰一下。'],
      ['Sorry.', '英国人有时也这么说，不过开口请人让路，Excuse me 最稳妥。'],
    ], { keep: true }),
    Wr('e', '把这句话改得客气一点：“Tell me where the music room is.”', {
      lang: 'en', role: 'en',
      task: 'Rewrite the impolite command “Tell me where the music room is.” as a polite request to a teacher or a stranger.',
      criteria: ['is a polite request (Excuse me / Could you / please)', 'keeps the meaning: asking where the music room is', 'correct word order in the indirect question (where the music room is, not where is the music room)'],
      examples: ['Excuse me, could you tell me where the music room is, please?', 'Excuse me, where is the music room, please?', 'Could you tell me the way to the music room, please?'],
      words: ['Excuse me', 'could you tell me', 'please'], frame: 'Excuse me, could you tell me ______, please?', ph: 'Excuse me, …',
    }),
  ] },
  { id: 'x2', title: '最容易说生硬的几句', need: 'opt', steps: [
    T('t1', '', '中文里很自然的说法，直接翻成英语，常常听起来不客气。'),
    Mt('a', '左边是生硬的说法，配上客气的说法。', ['I want a cola.', 'Give me the menu.', 'You must help me.', 'What’s your name?（对长辈）'], ['Could you help me, please?', 'May I ask your name?', 'Could I have a cola, please?', 'Could I see the menu, please?'], [2, 3, 0, 1], '把“我要”“给我”“你必须”换成 Could I … / Could you …，再加上 please。', { lh: '生硬', rh: '客气' }),
    C('b', '在饭馆点菜，最自然的是——', [
      ['*I’d like the noodles, please.', '对。I’d like … 比 I want … 客气。'],
      ['I want the noodles.', '意思懂，可是听起来很冲。'],
    ], { keep: true }),
  ] },
];

const EXT_WATCH: Ext[] = [
  { id: 'x1', title: '英语里的“看”', need: 'always', steps: [
    T('t1', '', 'look、see、watch，中文都说“看”：', undefined, viz('lsw')),
    C('a', 'Look! 是要你——', [
      ['*把眼睛转过去，看那边', '对。look：把眼睛转过去看（look at …）。'],
      ['你已经看见了', '“看见了”是 see。'],
    ], { keep: true }),
    fill('b', '放进句子。', ['look', 'see', 'watch', 'saw'], [
      ['Please ___ at the clock. It’s 2:40!', 'look', '把眼睛转过去看：look at。'],
      ['The lights went out. I couldn’t ___ anything!', 'see', '太黑，什么都看不见：see。'],
      ['Mr Liu likes to ___ football on his phone.', 'watch', '盯着看比赛：watch。'],
      ['I ___ Ben in the hall this morning.', 'saw', '早上看见了 Ben：see 的过去式 saw。'],
    ]),
    T('t2', '', '还记得中文《淮阴少年》里的“五种看”吗？瞥、瞪、凝视……英语也分得一样细：glance（瞥一眼）、stare（盯着看）、glare（生气地瞪）、gaze（久久地凝视）。'),
    Mt('c', '这几种“看”，各是什么样子？', ['glance at the clock', 'stare at the empty table', 'glare at the noisy boy', 'gaze at the moon'], ['生气地瞪', '久久地凝视', '瞥一眼', '盯着看（愣住了）'], [2, 3, 0, 1], 'glance 一眼带过；stare 盯着看、愣住了；glare 生气地瞪；gaze 带着感情、久久地看。', { lh: '英语', rh: '怎么看' }),
  ] },
  { id: 'x2', title: '听也分两种', need: 'opt', steps: [
    T('t1', '', '“看”分 look 和 see，“听”也分：listen（用心去听，像 look）、hear（听见，像 see）。'),
    C('a', '“I listened, but I couldn’t hear anything.” 是——', [
      ['*我仔细听了，可什么也没听见', '对。listen 是去听，hear 是听见。'],
      ['我听见了，可是没在听', '顺序反了：先去听（listen），结果没听见（couldn’t hear）。'],
    ], { keep: true }),
    fill('b', '放进句子。', ['listen', 'hear'], [
      ['Can you ___ the music? It’s very quiet.', 'hear', '能不能听见：hear。'],
      ['Please ___ to the teacher.', 'listen', '用心听：listen to。'],
    ]),
  ] },
];

const EXT_LENT: Ext[] = [
  { id: 'x1', title: '纸条上省掉的词', need: 'always', steps: [
    T('t1', '', '纸条、短信、便签为了快，常把“谁”和 be 省掉：Lent the panda. ＝ I lent the panda.　Back at 3. ＝ It will be back at 3.（也可能是 I will be back at 3.）'),
    C('a', '那 Back at 3 省掉的是谁？', [
      ['熊猫三点回来', '也可能是写纸条的 M 自己三点回来。'],
      ['M 三点回来', '也可能是熊猫三点被送回来。'],
      ['*都说得通——纸条把“谁”省掉了', '对。主语一省，就留下了两种可能——破案时要小心的就是这种地方。'],
    ], { keep: true }),
    Mt('b', '把纸条上的话，补成完整的句子。', ['Gone to the library.', 'Back soon.', 'Lunch in the fridge.', 'Can’t come. Sorry!'], ['I can’t come. I’m sorry!', 'Your lunch is in the fridge.', 'I have gone to the library.', 'I will be back soon.'], [2, 3, 1, 0], '纸条上省掉的，多半是 I、It、Your 和 am / is / will be。', { lh: '纸条', rh: '完整的句子' }),
    C('c', '要是纸条上写的是 Borrowed the panda，熊猫现在在谁手里？', [
      ['*在 M 手里（M 借来的）', '对。borrowed：M 借进来了。'],
      ['在别人手里（M 借出去的）', '借出去才是 lent。'],
    ], { keep: true }),
    Wr('d', '给 Ben 留一张纸条：你去音乐教室看看那个鼓箱，十分钟后回来。越短越好，但要看得懂。', {
      lang: 'en', role: 'en',
      task: 'Write a very short note to Ben in note style (subjects and some small words may be left out), saying: I have gone to the music room to check the drum case, and I will be back in ten minutes.',
      criteria: ['says where the writer has gone (the music room)', 'says when the writer will be back (in ten minutes / at 2:50)', 'short note style is fine (e.g. “Gone to the music room. Back in 10 mins.”); full sentences are also fine', 'easy to understand, no serious mistakes'],
      examples: ['Gone to the music room. Back in 10 mins.', 'Checking the drum case in the music room. Back at 2:50.', 'Ben — gone to check the drum case. Back in ten minutes!'],
      words: ['Gone to', 'the music room', 'Back in'], frame: 'Gone to ______. Back in ______.', ph: 'Gone to …',
    }),
  ] },
  { id: 'x2', title: '名在前，姓在后', need: 'opt', steps: [
    T('t1', '', 'Margaret Green：Margaret 是名（first name），Green 是姓（family name）。英语里名在前、姓在后；称呼老师，用 Mr / Ms + 姓。'),
    C('a', '同学们该怎么叫这位老师？', [
      ['*Ms Green', '对。Ms + 姓。'],
      ['Ms Margaret', 'Ms 后面跟姓，不跟名。'],
    ], { keep: true }),
    C('b', '刘师傅叫刘建国。英语里称呼他——', [
      ['*Mr Liu', '对。Liu 是姓。'],
      ['Mr Jianguo', 'Jianguo 是名。'],
    ], { keep: true }),
    C('c', '用英语说“我姓王”——', [
      ['*My family name is Wang.', '对。姓是 family name（也叫 surname）。'],
      ['My first name is Wang.', 'first name 是名，不是姓。'],
    ], { keep: true }),
  ] },
];

const EXT_CLUE: Ext[] = [
  { id: 'x1', title: '线索写事实，不写猜测', need: 'always', steps: [
    T('t1', '', '侦探笔记里，线索只写看见的、听见的事实；自己的猜测要另外写，还要打个问号。'),
    So('a', '这些话，哪些是事实（可以写进线索），哪些只是猜测？', ['事实', '猜测'], [
      ['The panda was on the table at 2:00.', 0, 'Green 老师亲眼看见的。'],
      ['The lights went out at 2:15.', 0, '大家都知道。'],
      ['A boy took a big drum case to the music room.', 0, '刘师傅看见的。'],
      ['The boy stole the panda.', 1, '只是猜：没人看见他拿熊猫。'],
      ['The note says “Lent the panda.”', 0, '纸条上白纸黑字写着。'],
      ['M is Ms Green.', 1, 'Ben 的猜测：M 也可能是别人。'],
    ]),
    C('b', '这两条线索，哪一条写得更好？', [
      ['*At 2:20 Mr Liu saw a boy with a big drum case.', '对：什么时候、谁看见、看见了什么，都清楚。'],
      ['A boy did something with a drum.', '太含糊：什么时候？谁看见的？做了什么？'],
    ], { keep: true }),
    C('c', 'Ben 猜 M 是 Green 老师。这句猜测，怎么写进笔记最好？', [
      ['*Maybe M is Ms Green?', '对。用 Maybe、打个问号，提醒自己：这还没证实。'],
      ['M is Ms Green.', '写成肯定句，就把猜测当成了事实。'],
    ], { keep: true }),
  ] },
];

const EXT_ORDER: Ext[] = [
  { id: 'x1', title: '用英语说说这一章', need: 'opt', steps: [
    frag('用英语讲讲第一章：挑句子，拼成一段话。', [
      ['*The Golden Panda, the top prize of the English Festival, has gone missing.', 1, 'gone'],
      ['*Ms Green saw it on the table at two, and at 2:15 the lights went out.', 1, 'time'],
      ['*Mr Liu saw a boy with a big drum case, and there is a note: “Lent the panda. Back at 3. — M”', 1, 'clue'],
      ['Ben took the panda in the dark.', 1, '没有证据：灯灭时 Ben 在吃月饼。'],
      ['The panda was broken at 2:15.', 1, '没人说熊猫坏了，是不见了。'],
      ['Mr Liu was sleeping at 2:15.', 1, '他在看球赛：was watching the match。'],
      ['*So maybe the panda was not stolen — someone may have borrowed it.', 2],
      ['*But nobody knows who M is.', 2],
      ['So Ms Green has stolen it.', 2, '这只是猜测——而且 Green 老师急得脸都白了。'],
      ['So the case is closed.', 2, '案子还没破呢。'],
      ['*We have twenty minutes to find out who M is and where the panda is.', 3],
      ['We have twenty days to find the panda.', 3, '是二十分钟。'],
    ], { gone: '还没说发生了什么事：金熊猫怎么了？', time: '还没说时间：两点、两点一刻发生了什么？', clue: '还没说找到的线索：鼓箱、纸条。' },
    { 1: '先说说发生了什么事、有哪些线索。', 2: '事情和线索都说对了。再说说：从线索能想到什么？', 3: '最后说说：接下来要做什么？' },
    '内容都对了。顺序调一调：先说发生了什么，再说想到什么，最后说接下来要做什么。拖动句子换位置。',
    'The Golden Panda, the top prize of the English Festival, has gone missing. Ms Green saw it on the table at two, and at 2:15 the lights went out. Mr Liu saw a boy with a big drum case, and there is a note: “Lent the panda. Back at 3. — M” So maybe the panda was not stolen — someone may have borrowed it. But nobody knows who M is. We have twenty minutes to find out who M is and where the panda is.'),
  ] },
];

// ---------------- 题 ----------------

// ---------------- 词汇：心情、注意到、线索（后面几章还会再见） ----------------
const EXT_NERVOUS: Ext[] = [
  { id: 'x1', title: '紧张、害怕、担心', need: 'always', steps: [
    T('t1', '', '手心发凉，中文说“紧张”。英语里说心情的词有好几个，意思不一样：**nervous**（紧张：怕事情不顺利、怕表现不好）、**afraid / scared**（害怕：怕危险、怕某样东西）、**worried**（担心：一直惦记着一件事）。'),
    C('a', '你马上要上台领奖，手心发凉。最合适的是——', [
      ['*I’m so nervous!', '对：nervous 是怕表现不好、怕事情不顺利。'],
      ['I’m so scared of you!', '这是“我好怕你”——你怕的不是人。'],
    ], { keep: true }),
    C('b', '晚上一个人走一条黑黑的小路，你会说——', [
      ['*I’m scared.', '对：怕的是危险，用 scared / afraid。'],
      ['I’m nervous.', 'nervous 更像考试、比赛、上台前的紧张。'],
    ], { keep: true }),
    T('t2', '', '后面跟的小词也不一样：afraid **of** / scared **of** + 怕的东西（afraid of the dark）；nervous **about** / worried **about** + 担心的事（nervous about the test）。'),
    fill('c', '放进句子。', ['nervous', 'afraid', 'worried', 'scared'], [
      ['I’m ___ about the English test tomorrow.', 'nervous', '考试前的紧张：nervous about。'],
      ['My little brother is ___ of dogs.', 'afraid', '怕狗：afraid of（scared of 也可以）。'],
      ['Mum is ___ because I’m late home.', 'worried', '妈妈一直惦记着：worried。'],
      ['The film was so frightening that I was ___ and closed my eyes.', 'scared', '吓坏了：scared。'],
    ]),
    T('t3', '', '词还能变形：nervous（紧张的）→ **nervously**（紧张地）。形容词加 -ly，就能说“怎么做”：quick → quickly，quiet → quietly。'),
    C('d', '“She smiled ___ at the judges.”（她紧张地朝评委笑了笑）', [
      ['*nervously', '对：说“怎么笑”，用 -ly：nervously。'],
      ['nervous', 'nervous 是“紧张的”，放在动作后面要说“紧张地”：nervously。'],
    ], { keep: true }),
    Wr('e', '写一句英语：你什么时候紧张过？（I was nervous when / before / about …）', {
      lang: 'en', role: 'en',
      task: 'The student writes one English sentence about a real time they felt nervous, using “nervous” correctly (nervous before / when / about …).',
      criteria: ['uses “nervous” correctly (not confused with scared/afraid of a thing)', 'a real, sensible situation (a test, a match, a speech, meeting new people…)', 'a complete sentence with correct past tense and spelling'],
      examples: ['I was nervous before my piano exam.', 'I was very nervous when I gave my first speech in English.', 'I was a bit nervous about meeting my new classmates.'],
      words: ['I was nervous', 'before / when / about', 'my …'], frame: 'I was nervous when ______.', ph: 'I was nervous …',
    }),
  ] },
];

const EXT_NOTICE: Ext[] = [
  { id: 'x1', title: '没注意到 ≠ 没去看', need: 'always', steps: [
    T('t1', '', '刘师傅说：“Sorry, I didn’t notice anyone.”——**notice**：注意到。本来没特意去看，可是发现了；或者，没发现。'),
    C('a', '“I didn’t notice anyone.” 是说刘师傅——', [
      ['*没留意到有人经过（他在看手机）', '对：人从旁边过去，他没发现。'],
      ['不认识任何人', '不认识是 I don’t know anyone.'],
    ], { keep: true }),
    C('b', '和 look、see 比一比：“I looked, but I didn’t see anything.” 是——', [
      ['*我去看了，可什么也没看见', '对：look 是去看，see 是看见。notice 是“没特意去看，却发现了”。'],
      ['我看见了，可是没去看', '顺序反了。'],
    ], { keep: true }),
    T('t2', '', '侦探最爱问的一句：**Did you notice anything strange?**（你注意到什么奇怪的地方吗？）回答时说出那个细节：I noticed that her shoes were wet.（我注意到她的鞋是湿的。）'),
    C('c', '侦探问证人：“Did you notice anything strange?” 最好的回答是——', [
      ['*Yes. I noticed that the back door was open.', '对：说出你注意到的那个细节。'],
      ['Yes. I watched a boy.', 'watch 是盯着看一段时间；证人只是留意到。'],
    ], { keep: true }),
    fill('d', '放进句子。', ['notice', 'looked', 'watched', 'saw'], [
      ['I ___ at the clock. It was 2:15.', 'looked', '把眼睛转过去看：looked at。'],
      ['I didn’t ___ anyone. I was busy with my phone.', 'notice', '没留意到：didn’t notice。'],
      ['Mr Liu ___ the football match on his phone.', 'watched', '盯着看比赛：watched。'],
      ['Yesterday I ___ Ben in the library.', 'saw', '看见了：saw。'],
    ]),
    T('t3', '', 'notice 还能当名词：**通知、告示**——a notice on the wall（墙上贴的通知）。'),
    C('e', '哪一句用错了？', [
      ['*I noticed TV for two hours last night.', '对，这句错了：看电视要说 I watched TV。'],
      ['Did you notice her new haircut?', '这句没错：你注意到她的新发型了吗？'],
    ], { keep: true }),
  ] },
];

const EXT_CLUEWORD: Ext[] = [
  { id: 'x1', title: '线索、证据、证明', need: 'always', steps: [
    T('t1', '', 'Ben 说：We need to write down every clue. **clue**：线索——一点一点的提示，帮你往下想。'),
    C('a', '下面哪一个是“线索”？', [
      ['*灯是两点一刻灭的，只灭了一分钟', '对：它不能直接告诉你答案，可是能帮你往下想——熊猫很可能就是那一分钟里不见的。'],
      ['“小偷一定还在学校里”', '这是猜出来的结论，不是线索。'],
    ], { keep: true }),
    T('t2', '', '侦探故事里还有两个词：**evidence**（证据：能支持一个说法的东西）；**proof**（证明：足以让人相信的证据）。线索越攒越多，就成了证据；证据足够了，就成了证明。'),
    C('b', '“There isn’t enough evidence.” 是——', [
      ['*证据还不够', '对：还不能下结论。'],
      ['线索太多了', 'not enough 是“不够”。'],
    ], { keep: true }),
    C('c', '哪一句对？', [
      ['*We found some evidence.', '对：evidence 不可数，不说 an evidence，要说 some evidence 或 a piece of evidence。'],
      ['We found an evidence.', 'evidence 不能直接加 an。'],
    ], { keep: true }),
    T('t3', '', '“一点头绪都没有”，英语说：**I have no clue!** 或 **I haven’t got a clue!**'),
    C('d', '有人问 Ben“M 是谁？”，他耸耸肩：“I haven’t got a clue!” 意思是——', [
      ['*我一点头绪都没有', '对。'],
      ['我没有拿线索', '这是一句口语：完全不知道。'],
    ], { keep: true }),
  ] },
];

export const PLAY_EN1_ITEMS: Item[] = [
  item({
    id: 'e1-nervous', st: 'en1', lv: 1, type: 'word', topic: 'nervous / scared', label: 'Your hands are cold', intro: '', ask: 'nervous 和 scared 有什么不一样？',
    hints: ['马上要宣布结果了：你怕的是危险，还是怕结果不好？'],
    explain: 'nervous：紧张（怕事情不顺利、怕表现不好）；scared / afraid：害怕（怕危险、怕某样东西）。等着宣布结果，手心发凉，是 nervous。',
    ext: EXT_NERVOUS,
  }, C('a', '“Your hands are cold.” 等着宣布结果，手心发凉。你此刻的心情，用英语说最合适的是——', [
    ['*nervous（紧张）', '对：怕结果不好、心里发紧，是 nervous。'],
    ['scared of the hall（害怕礼堂）', '你怕的不是礼堂。'],
    ['bored（无聊）', '手心发凉可不是无聊。'],
    ['angry（生气）', '你在等结果，不是在生气。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e1-notice', st: 'en1', lv: 2, type: 'word', topic: 'notice', label: 'I didn’t notice anyone', intro: '', ask: 'notice 和 see 有什么不一样？',
    hints: ['刘师傅当时在干什么？'],
    explain: 'notice：注意到（没特意去看，却发现了）。刘师傅在看手机上的球赛，有人经过，他没留意。',
    back: [{ ch: 'en1', line: 'watch', label: '回到刘师傅看球赛那一句：look / see / watch' }],
    lock: { words: ['notice'] },
    ext: EXT_NOTICE,
  }, C('a', '刘师傅说 I didn’t notice anyone。他的意思是——', [
    ['*他没留意到有人经过（他在看手机）', '对。'],
    ['他不想看任何人', 'notice 是“注意到”，不是“想不想看”。'],
    ['他不认识任何人', '不认识是 I don’t know anyone.'],
    ['他没通知任何人', 'notice 作名词才是“通知”。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e1-clueword', st: 'en1', lv: 1, type: 'word', topic: 'clue / evidence', label: 'every clue', intro: '', ask: 'clue、evidence、proof 有什么不一样？',
    hints: ['侦探要把什么都记下来？'],
    explain: 'clue：线索——一点一点的提示，帮你往下想。线索攒多了成了 evidence（证据），证据足够了就是 proof（证明）。',
    lock: { words: ['clue'] },
    ext: EXT_CLUEWORD,
  }, C('a', '“We need to write down every clue.” clue 是——', [
    ['*线索', '对。'],
    ['胶水', '那是 glue，只差一个字母。'],
    ['答案', '线索只是提示，还不是答案。'],
    ['钥匙', '钥匙是 key。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e1-mis', st: 'en1', lv: 2, type: 'mis', topic: 'AI 误译', label: 'AI 眼镜译错了什么', intro: '', ask: 'burst open 到底是什么意思？',
    hints: ['点一点英文里的词（bursts open、in charge），看看它们在这句话里的意思。', '“has been in Beijing for two weeks”：Ben 现在还在不在北京？'],
    explain: 'AI 眼镜按每个词最常见的意思去翻，没看上下文：burst open 不是爆炸，in charge 不是充电，has been … for two weeks 是“来了两周、现在还在”，face is white 是“脸色发白”。',
    lock: { words: ['bursts open', 'in charge', 'has been in Beijing for two weeks', 'Her face is white'], lines: ['ben', 'door'] },
    ext: EXT_MIS,
  }, M('a', 'AI 眼镜的译文有几处不对。点出来，改对。', 'Ben is an exchange student from London. He has been in Beijing for two weeks.\nSuddenly the door bursts open. Ms Green, the teacher in charge, runs in. Her face is white.', [
    'Ben 是从伦敦来的交换生。',
    ['他去过北京两个星期。', 'has been in Beijing for two weeks', ['*他来北京已经两个星期了（现在还在）', '他去过北京两个星期（早就回去了）', '他要在北京待两个星期'], 'has been in Beijing for two weeks：两个星期前来的，一直待到现在——人还在北京。“去过”是另一个说法：has been to。'],
    '突然，',
    ['门爆炸了。', 'bursts open', ['*门被猛地推开了', '门爆炸了', '门慢慢地开了'], 'burst 本来有“爆裂”的意思，可 burst open 说的是门一下子被冲开。'],
    ['正在充电的 Green 老师', 'the teacher in charge', ['*负责英语节的 Green 老师', '正在充电的 Green 老师', '收费的 Green 老师'], 'charge 确实有“充电”“收费”的意思，可 in charge 是“负责、主管”。'],
    '跑了进来。',
    ['她的脸是白色的。', 'Her face is white', ['*她脸色发白（吓坏了）', '她的脸涂成了白色', '她长得很白'], '人吓坏了、着急了，脸上没有血色，英语说 Her face is white（或 pale），中文说“脸色发白”。'],
  ], 'AI 眼镜的译文')),

  item({
    id: 'e1-taken', st: 'en1', lv: 1, type: 'tense', topic: 'has taken', label: 'Someone has taken it', intro: '', ask: 'has taken 和 took 有什么不一样？',
    hints: ['has taken 说的是过去的一件事，还是那件事留到现在的结果？'],
    explain: 'has taken：过去拿走了，结果留到现在——奖杯现在还不在。重点不在“什么时候拿的”，在“现在怎么样了”。（这是英式的说法；美国人也常说 Someone took it!）',
    lock: { words: ['has taken'] },
    ext: EXT_TAKEN,
  }, C('a', 'Green 老师说 Someone has taken it! 她的意思是——', [
    ['*奖杯被人拿走了，现在还不在这儿', '对。has taken：拿走了，到现在还没回来。'],
    ['有人拿过奖杯，后来又放回去了', '要是放回来了，她就不会急成这样了。'],
    ['有人马上要来拿奖杯', '那是还没发生：Someone is going to take it.'],
    ['很多年前有人拿走过一个奖杯', '她说的是眼前的事：奖杯现在不见了。'],
  ], { cols: 1, reveal: 'chosen' })),
  item({
    id: 'e1-taken3', st: 'en1', lv: 3, type: 'tense', topic: 'has taken', label: 'has taken / took', intro: '', ask: 'has taken 和 took 有什么不一样？',
    hints: ['奖杯现在还在不在？她为什么急着要在三点前找到？'],
    explain: 'has taken：过去拿走了，结果留到现在——奖杯现在还不在。英国人说这种“刚发生、结果还在”的事，用现在完成时；美国人也常用 took。这个故事说英式英语，按英式答。可只要带了具体的过去时间（at 2:15、yesterday），英美都只能用 took。',
    lock: { words: ['has taken'] },
    ext: EXT_TAKEN,
  }, C('a', 'Green 老师是英国人。她着急地喊：“Someone ___ the Golden Panda! We must find it before three!” 按英式英语，填哪个最地道？', [
    ['*has taken', '对。拿走了，现在还不在——英国人说这种“刚发生、结果还在”的事，用现在完成时。'],
    ['took', '美国人这么说也很自然（Someone took it!）；可这个故事说英式英语，英国人在这里用 has taken。'],
    ['takes', '一般现在时说习惯：Someone takes it every day.'],
    ['will take', '那是还没发生。'],
  ], { reveal: 'chosen' })),

  item({
    id: 'e1-eating', st: 'en1', lv: 2, type: 'tense', topic: 'was eating', label: 'I was eating a mooncake', intro: '', ask: 'was eating 和 ate 有什么不一样？',
    hints: ['灯灭的那一刻，月饼是不是已经在他嘴里了？'],
    explain: 'was eating：过去某一刻正在做的事。灯灭的那一刻，Ben 嘴里正嚼着月饼——他不是趁黑才开始吃的。',
    lock: { words: ['was eating'] },
    ext: EXT_EATING,
  }, C('a', 'Ben 说 I was eating a mooncake. 意思是——', [
    ['*灯灭的那一刻，他正在吃（已经吃了一会儿）', '对。was eating：那一刻正在做的事。'],
    ['灯灭了以后，他才开始吃', '那要说 When the lights went out, I ate a mooncake.——一件接一件。'],
    ['他每天这个时候都吃月饼', '那是习惯：I eat a mooncake every afternoon.'],
    ['他本来打算吃，可还没吃', '那要说 I was going to eat a mooncake.'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e1-borrow', st: 'en1', lv: 2, type: 'word', topic: 'borrow lend', label: 'borrow / lend', intro: '', ask: 'borrow 和 lend 怎么分？',
    hints: ['lend 是借出去。本子从谁那里借出去？'],
    explain: 'borrow：借进来（东西到我这儿）；lend：借出去（东西从我这儿走）。中文都说“借”，英语要看东西往哪边走。',
    lock: { words: ['borrow'] },
    ext: EXT_BORROW,
  }, C('a', 'Ben 说 Can I borrow your notebook? 要是换成 lend，这句话该怎么说？', [
    ['*Can you lend me your notebook?', '对。lend 是借出：你把本子借给 Ben，所以主语换成了 you。'],
    ['Can I lend your notebook?', '方向反了：lend 是借出去，可 Ben 是借进来的那个。'],
    ['Can you borrow me your notebook?', 'borrow 后面不跟“借给谁”。'],
    ['Can I lend you my notebook?', '这成了 Ben 要把他的本子借给你——可他根本没带本子。'],
  ], { cols: 1, reveal: 'chosen' })),
  item({
    id: 'e1-borrow1', st: 'en1', lv: 1, type: 'word', topic: 'borrow lend', label: 'borrow：借进来', intro: '', ask: 'borrow 和 lend 怎么分？',
    hints: ['Ben 带本子了吗？'],
    explain: 'borrow：借进来（东西到我这儿）；lend：借出去（东西从我这儿走）。中文都说“借”，英语要看东西往哪边走。',
    lock: { words: ['borrow'] },
    ext: EXT_BORROW,
  }, C('a', 'Ben 说 Can I borrow your notebook? 本子会往哪边走？', [
    ['*从你这里，到 Ben 那里', '对。borrow：借进来——东西到说话的人这儿。'],
    ['从 Ben 那里，到你这里', '反了：Ben 没带本子，是他要借。'],
    ['本子留在你这儿，Ben 只是看一眼', 'borrow 是拿去用，用完再还：I’ll give it back after the case.'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e1-polite', st: 'en1', lv: 1, type: 'polite', topic: 'could you', label: '客气地请人帮忙', intro: '', ask: '英语里怎么客气地请人帮忙？',
    hints: ['刘师傅不欠你什么。怎么开口，他才愿意帮你？'],
    explain: '请别人帮忙：先说 Excuse me（打扰一下），再用 Could you … , please?（客气地请求）。命令句、I want … 在英语里听起来很生硬。',
    ext: EXT_POLITE,
  }, C('a', '第一句，怎么说最好？', [
    ['*Excuse me, Mr Liu. Could you tell me who came in after two?', '对。先 Excuse me，再 Could you…?——客气、清楚。'],
    ['Tell me who came in after two.', '命令的口气，对长辈很不礼貌。'],
    ['I want to know who came in.', '直接说“我想要”，在英语里很生硬。'],
    ['Hey! Who came in after two?', '太随便了，像在喊人。'],
    ['You must tell me who came in.', 'must 是命令，对方会不高兴。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e1-watch', st: 'en1', lv: 2, type: 'word', topic: 'look see watch', label: 'look / see / watch', intro: '', ask: 'look、see、watch 有什么不一样？',
    hints: ['看比赛，是看一眼，还是盯着看一段时间？'],
    explain: 'look：把眼睛转过去看（look at the clock）；see：看见（东西进了眼睛）；watch：盯着看一段时间（看比赛、看电视）。中文都是“看”，英语分得很细。',
    back: [{ ch: 'zh1', line: 'kan', label: '中文《淮阴少年》：五种“看”' }],
    lock: { words: ['was watching'] },
    ext: EXT_WATCH,
  }, C('a', '刘师傅说 I was watching the football match。为什么用 watch，不用 see 或 look？', [
    ['*看比赛要盯着看一段时间，用 watch', '对。watch：盯着看一段时间（比赛、电视、视频）。'],
    ['see 也行，意思一样', 'see 是“看见”——东西进了眼睛，不是一直盯着看。'],
    ['look 也行，只是少了个 at', 'look at 是把眼睛转过去看一下，不说看完一场比赛。'],
    ['因为 watch 也是“手表”', '这里的 watch 是动词“看”。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e1-lent', st: 'en1', lv: 2, type: 'read', topic: 'lent', label: 'Lent the panda', intro: '', ask: '纸条上的英语为什么这么短？',
    hints: ['lent 是哪个词的过去式？借进来，还是借出去？'],
    explain: 'Lent the panda = I lent the panda：M 把熊猫借给了别人。要是真的，熊猫不是被偷了，是被借走了——还说三点回来。',
    back: [{ ch: 'en1', line: 'borrow', label: '回到 Ben 借本子那一句' }],
    lock: { words: ['Lent'] },
    ext: EXT_LENT,
  }, C('a', '纸条上写着 Lent the panda. 这说明——', [
    ['*写纸条的 M 把熊猫借给了别人', '对。lent（lend 的过去式）：借出去了。熊猫在借它的人手里。'],
    ['M 从别人那里借来了熊猫', '那是 borrowed：Borrowed the panda.'],
    ['有人偷走了熊猫', 'lent 是借出，不是偷。'],
    ['M 要把熊猫还回去', 'lent 是已经借出去了。'],
  ], { cols: 1, reveal: 'chosen' })),

  item({
    id: 'e1-clue', st: 'en1', lv: 2, type: 'write', topic: 'first clue', label: '写第一条线索', intro: '', ask: '侦探笔记一般怎么写？',
    hints: ['奖杯被拿走了，现在还不在——用 has + 过去分词。'],
    explain: '侦探笔记的第一句：Someone has taken the Golden Panda.（或者 The Golden Panda is missing.）——过去的事，现在的结果。',
    ext: EXT_CLUE,
  }, Wr('w', 'Write the first clue in English: what has happened? (one sentence)', {
    lang: 'en', role: 'en',
    task: 'In a detective story, the school trophy “the Golden Panda” has been taken and is still missing. The student writes the first clue in a notebook: one English sentence saying what has happened. The present perfect (has taken / has disappeared) or “is missing” is the most natural choice.',
    criteria: ['says that the Golden Panda has been taken / is missing', 'the story uses British English: for a result that is still true now, the present perfect (has taken / has disappeared) or “is missing / is gone” are best; “Someone took the Golden Panda.” is natural American English — treat it as a minor point and say the British version uses has taken; “was taken” is acceptable', 'one clear sentence, correct spelling'],
    examples: ['Someone has taken the Golden Panda.', 'The Golden Panda has disappeared from the table.', 'The Golden Panda is missing.'],
    words: ['Someone', 'has taken', 'the Golden Panda'], frame: 'Someone has ______ the Golden Panda.', ph: 'Someone …',
  })),

  item({
    id: 'e1-order', st: 'en1', lv: 1, type: 'order', topic: 'timeline', label: '线索的时间线', intro: '', ask: '为什么破案要先排时间线？',
    hints: ['先找两点钟的事，再找两点一刻的事。'],
    explain: '时间线一排出来，问题就清楚了：熊猫是两点到两点四十之间不见的；灯灭的那一分钟、鼓箱、那张纸条，都可能是关键。',
    ext: EXT_ORDER,
  }, Od('o', '按时间先后，把线索排一排。', [
    'Ms Green saw the Golden Panda on the table.',
    'The lights went out for a minute. Ben was eating a mooncake, and Mr Liu was watching a football match.',
    'Mr Liu saw a boy with a big drum case going towards the music room.',
    'Ms Green found that the panda was gone.',
    'If the note is true, the panda will be back.',
  ], '2:00 熊猫还在 → 2:15 灯灭 → 2:20 鼓箱 → 2:40 发现不见了 → 3:00（纸条说）会回来。', ['2:00', '2:15', '2:20', '2:40', '3:00 ?'])),
  // ---------------- 支线任务：可做可不做（补词汇：词族、易混的词、挑错） ----------------
  item({
    id: 'e1-x-final', st: 'en1', lv: 2, type: 'word', topic: 'final → finalist', label: 'finalist：一个词变出一家人', intro: '', ask: 'finalist 和 final 有什么关系？',
    hints: ['-ist、-er 常常表示“做……的人”。'],
    explain: 'final（最后的；决赛）+ -ist → finalist（进入决赛的人或作品）。英语里一个词加上词尾，就能变出一家人：-ist、-er 表示人，-ly 表示“怎么做”。',
  },
    T('t1', '', '“Your story is one of the three **finalists**.”——**final** 是“最后的；决赛”，加上 **-ist**，就成了“进入决赛的人（或作品）”。'),
    C('a', 'Your story is one of the three finalists. 意思是——', [
      ['*你的故事是进了决赛的三篇之一', '对：三篇里选一篇拿金熊猫。'],
      ['你的故事是最后写完的三篇之一', 'finalist 是进入决赛的，不是最后写完的。'],
    ], { keep: true }),
    T('t2', '', '**-ist** 常常表示“做……的人”：art → **artist**（艺术家），piano → **pianist**（钢琴家），science → **scientist**（科学家），tour → **tourist**（游客）。**-er** 也表示人：teach → **teacher**，report → **reporter**（记者），photograph → **photographer**（摄影师）。'),
    C('b', 'Mia 给校报拍照、写新闻。她在校报当——', [
      ['*a reporter and a photographer', '对：report + -er，photograph + -er。'],
      ['a finalist and a tourist', '她不是参赛的，也不是来游玩的。'],
    ], { keep: true }),
    fill('c', '放进句子。', ['finalists', 'pianist', 'finally', 'scientist'], [
      ['Only three stories are ___. One of them will win the Golden Panda.', 'finalists', '进入决赛的：finalists。'],
      ['Lang Lang plays the piano all over the world. He is a famous ___.', 'pianist', '弹钢琴的人：pianist。'],
      ['We looked everywhere, and ___ we found the panda in the garden.', 'finally', '最后、终于：final + -ly。'],
      ['A ___ does experiments in a lab.', 'scientist', '做科学研究的人：scientist。'],
    ]),
  ),
  item({
    id: 'e1-x-lose', st: 'en1', lv: 2, type: 'word', topic: 'lose / miss / missing', label: 'lose、miss、missing', intro: '', ask: 'lose 和 miss 有什么不一样？',
    hints: ['missing：不见了；lose：把自己的东西弄丢；miss：错过、想念。'],
    explain: '东西不见了，说 It’s missing 或 It’s gone；自己弄丢了，说 I lost it；错过、想念，用 miss。中文都可能说“丢”“没了”，英语分得很清楚。',
  },
    T('t1', '', '金熊猫不见了。英语可以说：The Golden Panda is **missing**!（不见了、找不到）也可以说 It’s **gone**!（没了）。这一章的题目就是 Gone!'),
    C('a', 'Green 老师并没有把熊猫弄丢，是有人拿走了。哪一句说得最准确？', [
      ['*The Golden Panda is missing!', '对：只说“不见了”，不说是谁弄的。'],
      ['Ms Green lost the Golden Panda.', 'lost 是“她自己弄丢了”，可熊猫是被人拿走的。'],
    ], { keep: true }),
    T('t2', '', '**lose**（lost, lost）：把自己的东西弄丢、找不到了（I lost my key.），也是“输”（We lost the match.）。**miss**：错过（miss the bus）、没打中（He missed the ball.），还有“想念”（I miss my family.）。'),
    C('b', 'Ben 来北京两个星期了。他给妈妈打电话：“I ___ you, Mum!”', [
      ['*miss', '对：想念。'],
      ['lose', 'lose 是弄丢，不是想念。'],
    ], { keep: true }),
    C('c', '“快点！还有二十分钟就颁奖了，可不能错过！”', [
      ['*Hurry! We can’t miss the prize-giving!', '对：错过一件事，用 miss。'],
      ['Hurry! We can’t lose the prize-giving!', 'lose 没有“错过”的意思。'],
    ], { keep: true }),
    fill('d', '放进句子。', ['lost', 'missing', 'miss', 'gone'], [
      ['I ___ my pen yesterday. Can I borrow yours?', 'lost', '自己弄丢了：lost。'],
      ['One page is ___ from my notebook. Where is it?', 'missing', '缺了、找不到：missing from。'],
      ['Get up now, or you’ll ___ the bus!', 'miss', '错过：miss。'],
      ['Ben ate my mooncake. Now it’s all ___!', 'gone', '吃光了、没了：all gone。'],
    ]),
  ),
];
