// 楚汉的故事线图：刘邦、项羽、萧何、张良、韩信五条线，按时间往下走；★ 是几条线汇合的节点（读哪条线都会走到）。
// 学生可以只走一个人的线，也可以跳着读；每个节点都自己讲得通。规划见 第六堂课/故事线规划.md。
// ★ 汇合节点是主线：故事长、题多；只属于一个人的支线短一些（两三道题）。韩信线的四段是最早写的，比别的支线长。
// mins 不是手填的：node scripts/minutes.mjs --write 按内容算（配音实际时长 + 题 + 必做拓展的步骤），内容改了要重跑。
// 学生按进度往下走：每条线的第一站一开始就能看，读完一站，这条线的下一站才打开（见 shared/adapt.ts 的 progressOpen）。
// 节点 id 就是 PLAYS 里的 id；还没写好的，目录上显示“制作中”。
export type Lane = 'lb' | 'xy' | 'xh' | 'zl' | 'hx';
export const LANES: { id: Lane; name: string; color: string; who: string }[] = [
  { id: 'lb', name: '刘邦', color: '#A8322A', who: '沛县的亭长，后来的汉高祖' },
  { id: 'xy', name: '项羽', color: '#3B3B52', who: '楚国名将的后代，西楚霸王' },
  { id: 'xh', name: '萧何', color: '#2E6A5A', who: '沛县的小吏，汉朝第一功臣' },
  { id: 'zl', name: '张良', color: '#5B4B8A', who: '韩国贵族的后代，运筹帷幄的谋士' },
  { id: 'hx', name: '韩信', color: '#9A3B2E', who: '淮阴的穷少年，国士无双的大将' },
];
export interface MapNode { id: string; title: string; sub: string; row: number; lanes: Lane[]; star?: boolean; mins: number }
/** 每一行的时间 */
export const ROWS: string[] = ['秦末', '', '前 209 年', '前 209—前 207', '前 206 年', '前 206 年', '前 206 年', '前 206 年', '前 205—前 203', '前 203 年', '前 202 年', '前 202 年', '前 201—前 195', '前 193 年'];
export const NODES: MapNode[] = [
  { id: 'lb1', title: '泗水亭长', sub: '大丈夫当如此也', row: 0, lanes: ['lb'], mins: 6 },
  { id: 'xy1', title: '学万人敌', sub: '彼可取而代也', row: 0, lanes: ['xy'], mins: 7 },
  { id: 'xh1', title: '沛县主吏', sub: '何独以五', row: 0, lanes: ['xh'], mins: 7 },
  { id: 'zl1', title: '博浪沙', sub: '误中副车', row: 0, lanes: ['zl'], mins: 7 },
  { id: 'zh1', title: '淮阴少年', sub: '漂母分饭，胯下之辱', row: 0, lanes: ['hx'], mins: 14 },
  { id: 'zl2', title: '圯上纳履', sub: '孺子可教矣', row: 1, lanes: ['zl'], mins: 7 },
  { id: 'dz', title: '大泽乡', sub: '王侯将相宁有种乎', row: 2, lanes: ['lb', 'xy', 'xh', 'zl', 'hx'], star: true, mins: 17 },
  { id: 'lb2', title: '沛公', sub: '天下苦秦久矣', row: 3, lanes: ['lb', 'xh'], mins: 8 },
  { id: 'xy2', title: '破釜沉舟', sub: '巨鹿之战，作壁上观', row: 3, lanes: ['xy'], mins: 8 },
  { id: 'zl3', title: '沛公殆天授', sub: '张良遇刘邦', row: 3, lanes: ['zl'], mins: 4 },
  { id: 'zh2', title: '执戟郎中', sub: '言不听，画不用', row: 3, lanes: ['hx'], mins: 12 },
  { id: 'lb3', title: '约法三章', sub: '忠言逆耳利于行', row: 4, lanes: ['lb', 'zl'], mins: 7 },
  { id: 'xh2', title: '收图籍', sub: '诸将争金帛，何独收图书', row: 4, lanes: ['xh'], mins: 5 },
  { id: 'zh3', title: '鸿门宴', sub: '项庄舞剑，意在沛公', row: 5, lanes: ['lb', 'xy', 'xh', 'zl', 'hx'], star: true, mins: 18 },
  { id: 'xy3', title: '沐猴而冠', sub: '富贵不归故乡，如衣绣夜行', row: 6, lanes: ['xy'], mins: 8 },
  { id: 'zl4', title: '烧栈道', sub: '示天下无还心', row: 6, lanes: ['zl'], mins: 8 },
  { id: 'zh4', title: '拜将', sub: '萧何追韩信，国士无双', row: 7, lanes: ['lb', 'xh', 'hx'], star: true, mins: 17 },
  { id: 'lb4', title: '彭城之败', sub: '推堕孝惠、鲁元车下', row: 8, lanes: ['lb'], mins: 6 },
  { id: 'xy4', title: '彭城大捷', sub: '三万破五十六万', row: 8, lanes: ['xy'], mins: 6 },
  { id: 'xh3', title: '镇守关中', sub: '转漕给军，不乏', row: 8, lanes: ['xh'], mins: 8 },
  { id: 'zl5', title: '借箸代筹', sub: '竖儒，几败而公事', row: 8, lanes: ['zl'], mins: 7 },
  { id: 'zh5', title: '背水一战', sub: '置之死地而后生', row: 8, lanes: ['hx'], mins: 19 },
  { id: 'lb5', title: '分我一杯羹', sub: '吾翁即若翁', row: 9, lanes: ['lb', 'xy'], mins: 7 },
  { id: 'zl6', title: '养虎遗患', sub: '鸿沟之约', row: 9, lanes: ['zl', 'lb'], mins: 5 },
  { id: 'hx4', title: '假王真王', sub: '何以假为', row: 9, lanes: ['hx', 'zl'], mins: 7 },
  { id: 'zh6', title: '垓下', sub: '四面楚歌，乌江', row: 10, lanes: ['lb', 'xy', 'zl', 'hx'], star: true, mins: 9 },
  { id: 'sj', title: '论三杰', sub: '运筹帷幄，镇国家，战必胜', row: 11, lanes: ['lb', 'xh', 'zl', 'hx'], star: true, mins: 21 },
  { id: 'lb6', title: '大风歌', sub: '威加海内兮归故乡', row: 12, lanes: ['lb'], mins: 6 },
  { id: 'xh4', title: '功人功狗', sub: '汗马之劳', row: 12, lanes: ['xh'], mins: 5 },
  { id: 'zl7', title: '从赤松子游', sub: '功成身退', row: 12, lanes: ['zl'], mins: 5 },
  { id: 'zh7', title: '鸟尽弓藏', sub: '狡兔死，良狗烹', row: 12, lanes: ['hx', 'xh', 'lb'], mins: 18 },
  { id: 'xh5', title: '萧规曹随', sub: '顜若画一', row: 13, lanes: ['xh'], mins: 8 },
];
export const NODE_BY_ID: Record<string, MapNode> = Object.fromEntries(NODES.map((n) => [n.id, n]));
/** 这个节点在 lane 这条线上的下一站（★ 节点在每条线上都算） */
export const nextOnLane = (id: string, lane: Lane): MapNode | undefined => {
  const n = NODE_BY_ID[id]; if (!n) return undefined;
  return NODES.filter((x) => x.row > n.row && (x.star || x.lanes[0] === lane) && laneHas(x, lane)).sort((a, b) => a.row - b.row)[0];
};
/** 普通节点只属于它的第一条线（其余是“出场的人”）；★ 节点属于所有出场的线 */
export const laneHas = (n: MapNode, lane: Lane) => (n.star ? n.lanes.includes(lane) : n.lanes[0] === lane);
/** 这个节点所在的线（★ 节点是所有出场的人） */
export const lanesOf = (id: string): Lane[] => { const n = NODE_BY_ID[id]; return !n ? [] : n.star ? n.lanes : [n.lanes[0]]; };
export const laneName = (l: Lane) => LANES.find((x) => x.id === l)!.name;
