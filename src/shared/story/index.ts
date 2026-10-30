// 两条故事主线：每一章的故事、题（几个难度版本）、变式练习、知识点（老师怎么讲）。
import type { Chapter, KNode } from '../types';
import { ZH1, ZH1_TASKS, ZH1_PRACTICE, ZH1_NODES } from './zh1';
import { EN1, EN1_TASKS, EN1_PRACTICE, EN1_NODES } from './en1';

export const CHAPTERS: Chapter[] = [ZH1, EN1];
export const STORY_ITEMS = [...ZH1_TASKS, ...ZH1_PRACTICE, ...EN1_TASKS, ...EN1_PRACTICE];
export const NODES: KNode[] = [...ZH1_NODES, ...EN1_NODES];
export const NODE_BY_ID: Record<string, KNode> = Object.fromEntries(NODES.map((n) => [n.id, n]));
export const CHAPTER_BY_ID: Record<string, Chapter> = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));
/** 还没写好的章：地图上显示“制作中” */
export const PLANNED: { id: string; line: 'zh' | 'en'; title: string; sub: string }[] = [
  { id: 'zh2', line: 'zh', title: '第二回　两次投奔', sub: '揭竿而起；萧何月下追韩信' },
  { id: 'zh3', line: 'zh', title: '第三回　鸿门宴', sub: '项庄舞剑，意在沛公' },
  { id: 'zh4', line: 'zh', title: '第四回　拜将', sub: '明修栈道，暗度陈仓' },
  { id: 'zh5', line: 'zh', title: '第五回　背水一战', sub: '置之死地而后生' },
  { id: 'zh6', line: 'zh', title: '第六回　四面楚歌', sub: '垓下、乌江' },
  { id: 'zh7', line: 'zh', title: '尾声　大风起兮', sub: '狡兔死，走狗烹' },
  { id: 'en2', line: 'en', title: 'Chapter 2　Where were you?', sub: '三个嫌疑人' },
  { id: 'en3', line: 'en', title: 'Chapter 3　The Note', sub: '一个用反了的词' },
  { id: 'en4', line: 'en', title: 'Chapter 4　Case Closed', sub: '真相与颁奖' },
];
/** 一章里的题：每个 task 是几个难度版本 */
export const chapterSlots = (c: Chapter) => c.flow.filter((f): f is { task: string[] } => 'task' in f);
