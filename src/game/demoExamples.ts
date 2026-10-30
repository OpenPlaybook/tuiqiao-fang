// 演示版（单个 HTML，不连服务器）用的“AI 再举例”：2026-10-30 用 DeepSeek 事先生成，逐条核对过（删了两条高中课文的例子）。
export const DEMO_EXAMPLES: Record<string, { s: string; note: string }[]> = {
 "huoyong": [
  {
   "s": "父命之，往送之门，戒之曰……（《富贵不能淫》）",
   "note": "“命”本是名词“命令”，这里作动词“命令他”，是长辈对晚辈下命令。"
  },
  {
   "s": "山不在高，有仙则名（《陋室铭》）",
   "note": "“名”本是名词“名声”，这里作动词“出名”，说的是山，不是人。"
  },
  {
   "s": "策之不以其道（《马说》）",
   "note": "“策”本是名词马鞭，这里作动词，是用鞭子打、驱赶的意思。"
  },
  {
   "s": "不蔓不枝（《爱莲说》）",
   "note": "“蔓”“枝”本是名词，这里作动词，指生藤蔓、长枝节。"
  }
 ],
 "piaomu": [
  {
   "s": "学而时习之，不亦说乎？（《论语》）",
   "note": "“不亦……乎”是反问，译“不也是……吗”，别当成真在提问。"
  },
  {
   "s": "燕雀安知鸿鹄之志哉！（《陈涉世家》）",
   "note": "“安……哉”表反问，译“怎么……呢”，别误读成疑问句。"
  }
 ],
 "baoen": [
  {
   "s": "同桌每天中午分我一半饭，毕业时我把攒的零花钱全给他买了套球鞋，这算不算一饭千金？",
   "note": "小恩大报，用“一饭千金”；不是“一诺千金”，那说的是说话算数。"
  },
  {
   "s": "邻居阿姨下雨天帮我收过被子，我记了三年，每年端午都给她送粽子，妈妈说这叫知恩图报。",
   "note": "记恩并回报，用“知恩图报”；不是“过河拆桥”，那指事后翻脸不认人。"
  },
  {
   "s": "班长考前把复习笔记借我抄了一晚，后来他腿受伤，我天天帮他打饭，这算不算一饭千金？",
   "note": "小恩也记着还，用“一饭千金”；不是“投桃报李”那种对等交换。"
  },
  {
   "s": "老师课后给我补了两次课，我考上重点后回校送她一张感谢卡，这叫知恩图报。",
   "note": "受助后主动回报，用“知恩图报”；不是“过河拆桥”那种用完就丢。"
  }
 ],
 "gujin": [
  {
   "s": "《桃花源记》：“率妻子邑人来此绝境。”",
   "note": "“妻子”古指妻子和儿女，今只指妻子；“绝境”古指与世隔绝之地，今指走投无路。"
  },
  {
   "s": "《曹刿论战》：“牺牲玉帛，弗敢加也。”",
   "note": "“牺牲”古指祭祀用的牲畜，今指舍弃生命或利益，别混。"
  },
  {
   "s": "《陈涉世家》：“今亡亦死，举大计亦死。”",
   "note": "“亡”古义是逃跑，今义是死亡；别把“亡亦死”理解成“死了也是死”。"
  },
  {
   "s": "《桃花源记》：“阡陌交通，鸡犬相闻。”",
   "note": "“交通”古义是交错相通，今义是运输往来；别理解成村里修了路。"
  }
 ],
 "kan": [
  {
   "s": "体育课自由活动时，我瞟了一眼操场那边，看见同桌正偷偷把手机塞回口袋。",
   "note": "用“瞟”是斜着飞快看一眼，不想被发现；用“瞥”就太正面、太随意了。"
  },
  {
   "s": "放学后我站在校门口眺望公交站，远远看见要坐的那路车正慢慢开过来。",
   "note": "用“眺望”是从远处往远看；用“凝视”只强调盯得久，看不出距离远。"
  },
  {
   "s": "数学课上我瞥了一眼窗外，看见班主任正朝教室走来。",
   "note": "匆匆看一眼用“瞥”，不是久久地“凝视”。"
  },
  {
   "s": "课间我扫视了一圈教室，发现值日生还没擦黑板。",
   "note": "目光快速掠过全场用“扫视”，不是只盯一处。"
  }
 ],
 "baobian": [
  {
   "s": "同桌夸我做事果断，隔壁班同学却说我专断。",
   "note": "同一件事，夸用“果断”是褒义，批评用“专断”是贬义，别混。"
  },
  {
   "s": "妈妈说我遇事冷静，弟弟却说我遇事冷漠。",
   "note": "“冷静”是褒义，“冷漠”是贬义，同一表现两种评价。"
  },
  {
   "s": "老师夸小林上课积极发言，同桌却说他就爱出风头。",
   "note": "“积极”是褒义，夸他主动；“出风头”是贬义，同一举动换个说法就带批评。"
  },
  {
   "s": "奶奶说姐姐花钱大方，爸爸却说她花钱大手大脚。",
   "note": "“大方”是褒义，赞她慷慨；“大手大脚”是贬义，指不会节省，别混用。"
  }
 ],
 "zhuyu": [
  {
   "s": "通过这次运动会，使我们班的同学更加团结了。",
   "note": "“通过”和“使”连用，主语被吞掉；删“通过”或删“使”，让“这次运动会”或“我们班的同学”做主语。"
  },
  {
   "s": "在老师的耐心帮助下，使我的英语成绩提高了很多。",
   "note": "“在……下”和“使”连用，缺主语；删“使”让“我的英语成绩”做主语，或删“在……下”让“老师的耐心帮助”做主语。"
  },
  {
   "s": "通过观看《长津湖》，使同学们懂得了今天的幸福生活来之不易。",
   "note": "“通过……使……”连用，主语被吞掉；删“通过”或删“使”即可。"
  },
  {
   "s": "在妈妈的反复劝说下，使我终于同意去参加数学竞赛。",
   "note": "“在……下，使……”同样缺主语；去掉“使”，让“我”做主语。"
  }
 ],
 "perfect": [
  {
   "s": "I have already eaten lunch, so I'm not hungry now.",
   "note": "现在完成时强调现在的结果：已经吃过，所以现在不饿；不是只说过去吃了。"
  },
  {
   "s": "I ate lunch at 12:00 with my classmates.",
   "note": "一般过去时说过去某时发生的事，有明确时间 at 12:00，不强调现在结果。"
  },
  {
   "s": "I have cleaned the blackboard, so you can write on it now.",
   "note": "强调现在黑板是干净的、能用；若说 I cleaned it after class 只讲过去那次动作。"
  },
  {
   "s": "Our team won the basketball game last Friday.",
   "note": "last Friday 是过去具体时间，只讲当时赢了；不能说 have won last Friday。"
  }
 ],
 "polite": [
  {
   "s": "不礼貌：Tell me who came into the hall after two o'clock. 礼貌：Could you tell me who came into the hall after two o'clock, Mr. Liu?",
   "note": "直接命令像下指令；Could you…? 才是请求，别用Tell me开头。"
  },
  {
   "s": "不礼貌：Give me that notebook. 礼貌：Would you mind giving me that notebook?",
   "note": "Would you mind后接动名词giving，不是give；比直接命令客气。"
  },
  {
   "s": "不礼貌：Give me a bag for the apples. 礼貌：Could I have a bag for the apples, please?",
   "note": "对店员用Could I…?是问自己能不能要，比直接命令Give me客气。"
  },
  {
   "s": "不礼貌：You, tell me the way to the station. 礼貌：Would you mind telling me the way to the station?",
   "note": "对陌生人用Would you mind doing…?，比直接命令Tell me委婉。"
  }
 ],
 "look": [
  {
   "s": "Look at the blackboard, please — there is a new word on it.",
   "note": "look at 强调主动把眼睛转向某处，看黑板上的字；别和 see 混，see 是无意看见。"
  },
  {
   "s": "On my way home I saw a big rainbow in the sky.",
   "note": "see 指无意中看见，彩虹是自己闯进眼里的；不是主动去看，所以不用 look at。"
  },
  {
   "s": "My grandpa watched the news on TV after dinner.",
   "note": "watch 指盯着看会动的画面，如电视、比赛；看电视用 watch，不用 look at。"
  },
  {
   "s": "Look at the dark clouds — it's going to rain soon.",
   "note": "look at 强调主动把眼睛转向某物，看的过程；别和 see 混，see 是看见的结果。"
  },
  {
   "s": "I saw your brother in the school library this morning.",
   "note": "see 指无意中看见，强调结果；不是特意去看，别用 look at。"
  },
  {
   "s": "We watched our class play basketball after school yesterday.",
   "note": "watch 指观看活动的过程，如比赛、电视；别和 see（看见）混。"
  }
 ]
};
