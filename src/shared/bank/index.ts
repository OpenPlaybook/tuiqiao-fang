// 题：都在播放式故事里（src/shared/play/：楚汉第一回、第六回，英文第一章）。这里只是汇总，服务器、统计、后台都从这里取。
import type { Item } from '../types';
import { PLAY_ITEMS } from '../play';

export const ITEMS: Item[] = PLAY_ITEMS;
export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
