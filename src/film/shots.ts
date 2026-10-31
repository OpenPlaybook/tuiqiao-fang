// 所有镜头（按回分文件）
import type { ShotDef } from './Film';
import { SHOTS1 } from './shots1';
import { SHOTS2 } from './shots2';
import { SHOTS3 } from './shots3';
import { SHOTS4 } from './shots4';
import { SHOTS5 } from './shots5';
import { SHOTS7 } from './shots7';
import { SHOTS6 } from './shots6';
import { SHOTS_E1 } from './shotsE1';
import { SHOTS_E2 } from './shotsE2';
import { SHOTS_E3 } from './shotsE3';
import { SHOTS_E4 } from './shotsE4';
export const SHOTS: Record<string, ShotDef> = { ...SHOTS1, ...SHOTS2, ...SHOTS3, ...SHOTS4, ...SHOTS5, ...SHOTS6, ...SHOTS7, ...SHOTS_E1, ...SHOTS_E2, ...SHOTS_E3, ...SHOTS_E4 };
