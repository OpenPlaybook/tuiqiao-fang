// 所有镜头（按回分文件）
import type { ShotDef } from './Film';
import { SHOTS1 } from './shots1';
import { SHOTS6 } from './shots6';
import { SHOTS_E1 } from './shotsE1';
export const SHOTS: Record<string, ShotDef> = { ...SHOTS1, ...SHOTS6, ...SHOTS_E1 };
