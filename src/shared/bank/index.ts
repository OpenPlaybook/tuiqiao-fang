import type { Item } from '../types';
import { CI } from './ci';
import { CY } from './cy';
import { BJ } from './bj';
import { ZJ } from './zj';
import { EN1, EN2 } from './en';
import { STORY_ITEMS } from '../story';
import { PLAY_ITEMS } from '../play';

export { ROOMS, SLOTS, FINAL_LINE, FINAL_NOTE } from './zj';
// 旧版六个关卡的题现在是题库：故事里的变式练习从这里挑
export const ITEMS: Item[] = [...PLAY_ITEMS, ...STORY_ITEMS, ...CI, ...CY, ...BJ, ...ZJ, ...EN1, ...EN2];
export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

/** 英语词汇热身：9 个真词分三档，3 个是编出来的（点了要扣分） */
export const VOCAB: { w: string; band: 0 | 1 | 2 | -1 }[] = [
  { w: 'weather', band: 0 }, { w: 'borrow', band: 0 }, { w: 'kitchen', band: 0 },
  { w: 'invite', band: 1 }, { w: 'healthy', band: 1 }, { w: 'decide', band: 1 },
  { w: 'available', band: 2 }, { w: 'reluctant', band: 2 }, { w: 'efficient', band: 2 },
  { w: 'glimber', band: -1 }, { w: 'tranfid', band: -1 }, { w: 'wobsle', band: -1 },
];
