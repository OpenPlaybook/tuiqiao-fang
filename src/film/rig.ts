// 人物、马、特写（脸、手）的画法。人物是“骨架 + 衣服”：给出每个关节的角度（姿势），就能画出走、坐、作揖、爬、跪着洗、唱、舞。
// 角度都用“度”：手臂、腿 0 = 垂直向下，90 = 水平朝前（面朝的方向），180 = 朝上；肘、膝是在上一节的基础上再弯。
import { GOLD, INK, RED, SKIN, f, lerp, rng, wav } from './core';

export interface Pose { lean: number; head: number; aF: number; eF: number; aB: number; eB: number; lF: number; kF: number; lB: number; kB: number; dy?: number }
export interface Look {
  robe: string; robe2?: string; pants: string; hair: 'knot' | 'kerchief' | 'helmet' | 'bun' | 'messy' | 'crown' | 'cap' | 'scholar' | 'short' | 'tousled' | 'pony' | 'bob' | 'guardcap' | 'shag' | 'crop' | 'lob' | 'braids' | 'lowtail' | 'sparse' | 'hardhat'; hairC?: string;
  long?: boolean; armor?: boolean; patches?: boolean; sleeve?: 'wide' | 'tight' | 'bare'; beard?: 'stub' | 'long'; sword?: boolean; cape?: string; trim?: string; belt?: string; tall?: number; wide?: number;
  /** 现代的人：上衣短（到胯）、长裤；skirt 裙子；stripe 校服袖子上的白条；lanyard 胸前挂的工作牌；shoe 鞋的颜色 */
  modern?: boolean; skirt?: string; glasses?: boolean; stripe?: string; lanyard?: string; shoe?: string; hood?: boolean;
  /** 时间胶囊新增：inner 开衫 / 敞开的外套里露出的衬衫颜色；arms 袖子的颜色（马甲：身子深、袖子是衬衫）；stoop 背驼（度）；
   *  retro 1996 年的运动服校服（胸前一道宽白条、裤子侧面白条，给白条的颜色）；coat 外套长到大腿；scarf 围巾的颜色；hivis 工装的反光条；grey 头发里的白丝 */
  inner?: string; arms?: string; stoop?: number; retro?: string; coat?: boolean; scarf?: string; hivis?: string; grey?: string;
}
export const LOOKS: Record<string, Look> = {
  hanxin: { robe: '#6E7378', robe2: '#5D6267', pants: '#3E3B38', hair: 'knot', patches: true, sleeve: 'tight', sword: true, belt: '#4A3A2C', tall: 1.06 },
  king: { robe: '#6B2E28', robe2: '#4E211D', pants: '#2E2622', hair: 'crown', sleeve: 'wide', trim: GOLD, sword: true, belt: '#2B2722', tall: 1.06 },
  general: { robe: '#5A4A3A', robe2: '#3E342A', pants: '#2E2622', hair: 'knot', sleeve: 'tight', armor: true, cape: '#7A2A22', sword: true, tall: 1.06 },
  piaomu: { robe: '#8A7B66', robe2: '#76684F', pants: '#5B5045', hair: 'kerchief', hairC: '#D9D2C4', long: true, sleeve: 'tight', belt: '#5B4E40', tall: 0.92 },
  tuhu: { robe: '#4A3F36', robe2: '#3A322B', pants: '#2F2924', hair: 'messy', sleeve: 'bare', beard: 'stub', belt: '#8A3A2A', wide: 1.18 },
  xiangyu: { robe: '#3A3436', robe2: '#2A2527', pants: '#221E1E', hair: 'helmet', armor: true, cape: '#8E2B22', sword: true, beard: 'stub', tall: 1.1, wide: 1.1 },
  yuji: { robe: '#D8C3B0', robe2: '#C2A894', pants: '#9C8572', hair: 'bun', long: true, sleeve: 'wide', trim: '#A8322A', belt: '#A8322A', tall: 0.96 },
  soldier: { robe: '#4E4640', robe2: '#3B3530', pants: '#2A2522', hair: 'helmet', armor: true, sleeve: 'tight' },
  hanSoldier: { robe: '#3F4A52', robe2: '#2F383E', pants: '#232A2E', hair: 'helmet', armor: true, sleeve: 'tight' },
  tingzhang: { robe: '#6A6152', robe2: '#574F42', pants: '#3A342C', hair: 'cap', beard: 'long', sleeve: 'tight', belt: '#3A342C' },
  poetTang: { robe: '#6B7A6A', robe2: '#5A6859', pants: '#3A3F38', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#3A3F38' },
  poetSong: { robe: '#5E6678', robe2: '#4E5566', pants: '#33373F', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#33373F' },
  poetLi: { robe: '#A9898C', robe2: '#957578', pants: '#6E5658', hair: 'bun', long: true, sleeve: 'wide', trim: '#5E3A3E', belt: '#5E3A3E' },
  liubang: { robe: '#7A2A22', robe2: '#5E201A', pants: '#2E2622', hair: 'crown', sleeve: 'wide', trim: GOLD, beard: 'long', long: true },
  crowd1: { robe: '#7A7064', pants: '#4A4239', hair: 'cap', sleeve: 'tight' },
  crowd2: { robe: '#6A6F66', pants: '#3F433C', hair: 'knot', sleeve: 'tight' },
  crowd3: { robe: '#8C7B62', pants: '#4E4436', hair: 'kerchief', hairC: '#CFC6B2', long: true, sleeve: 'tight' },
  crowd4: { robe: '#5D564E', pants: '#35302B', hair: 'messy', sleeve: 'tight', beard: 'stub' },
  rebel: { robe: '#5C5248', pants: '#3A332C', hair: 'kerchief', hairC: '#8C3A2E', sleeve: 'bare' },
  // ---------- 第二回起：楚汉的人 ----------
  chensheng: { robe: '#6A4E3A', robe2: '#5A4230', pants: '#3A332C', hair: 'kerchief', hairC: '#A8322A', sleeve: 'tight', beard: 'stub', belt: '#A8322A', tall: 1.04 },
  qinguan: { robe: '#2E2A2C', robe2: '#221F21', pants: '#1E1B1C', hair: 'cap', sleeve: 'tight', armor: true, sword: true },
  xiangliang: { robe: '#4A3A3A', robe2: '#3A2C2C', pants: '#221E1E', hair: 'helmet', armor: true, cape: '#6E2A22', sword: true, beard: 'long', tall: 1.06 },
  hanxinLang: { robe: '#6E7378', robe2: '#5D6267', pants: '#2E2622', hair: 'helmet', armor: true, sleeve: 'tight', sword: true, tall: 1.06 },
  hanxinHan: { robe: '#3F4A52', robe2: '#2F383E', pants: '#232A2E', hair: 'knot', sleeve: 'tight', sword: true, belt: '#2B2722', tall: 1.06 },
  ziying: { robe: '#EDE8DC', robe2: '#D9D3C4', pants: '#CFC8B8', hair: 'knot', long: true, sleeve: 'wide', belt: '#BDB5A4' },
  zhangliang: { robe: '#6B7A6A', robe2: '#5A6859', pants: '#3A3F38', hair: 'scholar', sleeve: 'wide', long: true, belt: '#3A3F38' },
  fankuai: { robe: '#4A3A30', robe2: '#3A2C24', pants: '#2A221C', hair: 'helmet', armor: true, sword: true, beard: 'long', sleeve: 'tight', tall: 1.1, wide: 1.2 },
  xiaohe: { robe: '#3E4A5A', robe2: '#323C4A', pants: '#2A303A', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#2A303A' },
  fanzeng: { robe: '#5A4A6A', robe2: '#4A3C5A', pants: '#33293F', hair: 'scholar', hairC: '#D9D2C4', beard: 'long', sleeve: 'wide', long: true, belt: '#33293F', tall: 0.96 },
  xiangzhuang: { robe: '#3A3436', robe2: '#2A2527', pants: '#221E1E', hair: 'helmet', armor: true, sword: true, sleeve: 'tight' },
  xiangbo: { robe: '#4E4038', robe2: '#3E3229', pants: '#2A231E', hair: 'helmet', armor: true, sword: true, beard: 'long', sleeve: 'tight' },
  tenggong: { robe: '#4E5A4A', robe2: '#3E4A3A', pants: '#2A3028', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#2A3028' },
  zhaoSoldier: { robe: '#8A7650', robe2: '#76643F', pants: '#4A3E2A', hair: 'helmet', armor: true, sleeve: 'tight' },
  chenyu: { robe: '#4A5A7A', robe2: '#3C4A66', pants: '#262E3E', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, sword: true, belt: '#262E3E' },
  lizuoche: { robe: '#5A5A4A', robe2: '#4A4A3C', pants: '#33332A', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#33332A' },
  liyiji: { robe: '#7A5A3A', robe2: '#5E442C', pants: '#3A2C20', hair: 'scholar', hairC: '#B8B0A4', beard: 'long', sleeve: 'wide', long: true, belt: '#3A2C20' }, // 郦食其：爱喝酒的老儒生
  chenping: { robe: '#5E5470', robe2: '#4C4460', pants: '#2E2A3A', hair: 'scholar', sleeve: 'wide', long: true, belt: '#2E2A3A' }, // 陈平
  hougong: { robe: '#6A6458', robe2: '#58534A', pants: '#38342E', hair: 'scholar', hairC: '#C8C0B4', beard: 'long', sleeve: 'wide', long: true, belt: '#38342E' }, // 侯公
  baosheng: { robe: '#4E6A6A', robe2: '#3E5656', pants: '#2A3A3A', hair: 'scholar', beard: 'stub', sleeve: 'wide', long: true, belt: '#2A3A3A' }, // 鲍生
  zhanger: { robe: '#5A4A3A', robe2: '#3E342A', pants: '#2E2622', hair: 'knot', sleeve: 'tight', armor: true, sword: true, beard: 'long', tall: 1.02 },
  zhonglimo: { robe: '#3A3436', robe2: '#2A2527', pants: '#221E1E', hair: 'helmet', armor: true, cape: '#5A2A22', sword: true, beard: 'stub', sleeve: 'tight', tall: 1.06 },
  lvhou: { robe: '#5A1E28', robe2: '#46161F', pants: '#3A1218', hair: 'bun', long: true, sleeve: 'wide', trim: GOLD, belt: GOLD, tall: 0.96 },
  simaqian: { robe: '#4E5A5E', robe2: '#3E4A4E', pants: '#2A3236', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#2A3236' },
  // ---------- 五条故事线新增的人 ----------
  liuji: { robe: '#7A6A52', robe2: '#655741', pants: '#3A342C', hair: 'cap', beard: 'long', sleeve: 'tight', belt: '#3A342C', tall: 1.04 }, // 当亭长时的刘季
  liubangGen: { robe: '#7A2A22', robe2: '#5E201A', pants: '#2E2622', hair: 'cap', beard: 'long', sleeve: 'tight', armor: true, cape: '#5E201A', sword: true, tall: 1.04 }, // 起兵以后的沛公
  xiangyuYoung: { robe: '#4A4044', robe2: '#3A3234', pants: '#262022', hair: 'knot', sleeve: 'tight', sword: true, belt: '#8E2B22', tall: 1.12, wide: 1.08 },
  qinshihuang: { robe: '#1E1C22', robe2: '#141218', pants: '#141218', hair: 'crown', sleeve: 'wide', trim: GOLD, beard: 'long', long: true, belt: GOLD, tall: 1.04 },
  wuguang: { robe: '#5A5040', robe2: '#4A4234', pants: '#3A332C', hair: 'kerchief', hairC: '#7A3A2E', sleeve: 'tight', belt: '#7A3A2E' },
  songyi: { robe: '#4A5060', robe2: '#3A4050', pants: '#262A34', hair: 'scholar', beard: 'long', sleeve: 'wide', long: true, belt: '#262A34', tall: 0.98 },
  lishi: { robe: '#4A3E34', robe2: '#3A3028', pants: '#2A231E', hair: 'messy', sleeve: 'bare', beard: 'stub', belt: '#2A231E', tall: 1.14, wide: 1.32 },
  laofu: { robe: '#7E7462', robe2: '#6A604E', pants: '#4A4238', hair: 'kerchief', hairC: '#E6E0D4', beard: 'long', sleeve: 'tight', long: true, belt: '#4A4238', tall: 0.92 },
  zhangliangYoung: { robe: '#8A9A88', robe2: '#768674', pants: '#4A5048', hair: 'knot', sleeve: 'wide', long: true, belt: '#4A5048', tall: 0.98 },
  caocan: { robe: '#4E5560', robe2: '#3E4450', pants: '#2A2E36', hair: 'cap', beard: 'stub', sleeve: 'tight', belt: '#2A2E36' },
  lvgong: { robe: '#6A5A44', robe2: '#5A4C38', pants: '#3A3228', hair: 'scholar', hairC: '#D9D2C4', beard: 'long', sleeve: 'wide', long: true, belt: '#3A3228', tall: 0.96 },
  kuaitong: { robe: '#4E4A5E', robe2: '#3E3A4E', pants: '#2A2836', hair: 'scholar', beard: 'stub', sleeve: 'wide', long: true, belt: '#2A2836' },
  // ---------- 英文故事：学校里的人 ----------
  you: { robe: '#2F5DA8', robe2: '#26508F', pants: '#2F5DA8', hair: 'short', modern: true, stripe: '#F4F4F0', sleeve: 'tight', shoe: '#F2F0EA', belt: '#2F5DA8' },
  ben: { robe: '#C2552E', robe2: '#A54726', pants: '#3A4E6E', hair: 'tousled', hairC: '#D8B266', modern: true, hood: true, sleeve: 'tight', shoe: '#E9E4DA', belt: '#C2552E', tall: 1.05 },
  green: { robe: '#4E7A5A', robe2: '#40654A', pants: '#3A3A44', skirt: '#3E3C48', hair: 'bob', hairC: '#6B4A32', glasses: true, lanyard: '#C23B2E', modern: true, sleeve: 'tight', shoe: '#2B2722', belt: '#4E7A5A' },
  liu: { robe: '#2E3B55', robe2: '#26324A', pants: '#262E40', hair: 'guardcap', modern: true, sleeve: 'tight', beard: 'stub', belt: '#1E1E1E', shoe: '#1E1E1E', wide: 1.1 },
  stuA: { robe: '#2F5DA8', robe2: '#26508F', pants: '#2F5DA8', hair: 'short', modern: true, stripe: '#F4F4F0', sleeve: 'tight', shoe: '#F2F0EA', belt: '#2F5DA8' },
  stuB: { robe: '#2F5DA8', robe2: '#26508F', pants: '#2F5DA8', hair: 'pony', modern: true, stripe: '#F4F4F0', sleeve: 'tight', shoe: '#F2F0EA', belt: '#2F5DA8', tall: 0.97 },
  mia: { robe: '#2F5DA8', robe2: '#26508F', pants: '#2F5DA8', skirt: '#2F4A7A', hair: 'pony', hairC: '#2A1E18', modern: true, stripe: '#F4F4F0', sleeve: 'tight', shoe: '#F2F0EA', belt: '#2F5DA8', tall: 0.9 },
  drummer: { robe: '#5E6066', robe2: '#4E5056', pants: '#2E3036', hair: 'short', modern: true, hood: true, sleeve: 'tight', shoe: '#E9E4DA', belt: '#5E6066' },
  // ---------- 英文故事二 The Time Capsule ----------
  tao: { robe: '#2F5DA8', robe2: '#26508F', pants: '#2F5DA8', hair: 'shag', hairC: '#231C18', modern: true, stripe: '#F4F4F0', sleeve: 'tight', shoe: '#F2F0EA', belt: '#2F5DA8', tall: 1.02 }, // 初三男生，今天的校服，短发有点乱
  hu: { robe: '#7E4656', robe2: '#683946', pants: '#33323A', hair: 'lob', hairC: '#231A16', inner: '#F1ECE2', lanyard: '#2F6DB0', modern: true, sleeve: 'tight', shoe: '#3A2E2A', belt: '#7E4656', tall: 0.98 }, // 胡老师：齐肩发，酒红开衫，工作牌
  gao: { robe: '#3F4A44', robe2: '#343E39', pants: '#4A4640', hair: 'short', hairC: '#C9C5BC', glasses: true, arms: '#E9E4D6', inner: '#E9E4D6', modern: true, sleeve: 'tight', shoe: '#2B2722', belt: '#3F4A44', stoop: 4 }, // 高老师：花白头发、眼镜，深色马甲 + 白衬衫
  zhou: { robe: '#8C6F4E', robe2: '#76603F', pants: '#55504A', hair: 'sparse', hairC: '#EEEBE4', inner: '#E6DFCF', modern: true, sleeve: 'tight', shoe: '#3A2E26', belt: '#8C6F4E', stoop: 11, tall: 0.95 }, // 周老师：七十五岁，白发稀，驼色开衫，背微驼
  fang: { robe: '#29457E', robe2: '#22396A', pants: '#29457E', hair: 'crop', hairC: '#1E1814', retro: '#F2EFE4', modern: true, sleeve: 'tight', shoe: '#E8E4D8', belt: '#29457E', tall: 1.05 }, // 1996 年的林芳：高个子、短发，旧式运动服校服
  yu: { robe: '#29457E', robe2: '#22396A', pants: '#29457E', hair: 'braids', hairC: '#1E1814', retro: '#F2EFE4', modern: true, sleeve: 'tight', shoe: '#E8E4D8', belt: '#29457E', tall: 0.95 }, // 1996 年的陈雨：两条辫子
  fang2: { robe: '#454B57', robe2: '#3A3F4A', pants: '#2E323A', hair: 'crop', hairC: '#1E1814', inner: '#F4F1EA', coat: true, modern: true, sleeve: 'tight', shoe: '#1E1E22', belt: '#454B57', tall: 1.04 }, // 2026 年的林芳医生：短发，深灰外套
  yu2: { robe: '#B4976F', robe2: '#9C8260', pants: '#4A4048', hair: 'lowtail', hairC: '#2A1F1A', grey: '#CFC9C0', scarf: '#A8455A', inner: '#EDE6DA', coat: true, modern: true, sleeve: 'tight', shoe: '#4A3A30', belt: '#B4976F', tall: 0.96 }, // 2026 年的陈雨：低马尾，几丝白发，围巾
  worker: { robe: '#E0742E', robe2: '#C7652A', pants: '#D86E2C', hair: 'hardhat', hairC: '#2A221C', hivis: '#E9EBE2', modern: true, sleeve: 'tight', shoe: '#4A3626', belt: '#E0742E', beard: 'stub', wide: 1.08, tall: 1.03 }, // 工人：黄安全帽、橙色工装、反光条
};

// ---------------- 姿势 ----------------
export const P = {
  stand: (): Pose => ({ lean: 0, head: 0, aF: 6, eF: 12, aB: -6, eB: 10, lF: 4, kF: 0, lB: -4, kB: 0 }),
  walk: (ph: number, k = 1): Pose => { const s = Math.sin(ph * Math.PI * 2), c = Math.cos(ph * Math.PI * 2); return { lean: 4 * k, head: 2, aF: -18 * s * k, eF: 18, aB: 18 * s * k, eB: 18, lF: 24 * s * k, kF: Math.max(0, 34 * c) * k, lB: -24 * s * k, kB: Math.max(0, -34 * c) * k, dy: -Math.abs(c) * 4 * k }; },
  sit: (): Pose => ({ lean: -4, head: 6, aF: 50, eF: 30, aB: 30, eB: 50, lF: 82, kF: 84, lB: 74, kB: 78 }),
  sitRest: (): Pose => ({ lean: 2, head: 4, aF: 22, eF: 62, aB: 16, eB: 68, lF: 82, kF: 84, lB: 74, kB: 78 }), // 坐着，两手搭在膝盖上
  eat: (ph = 0): Pose => ({ lean: 2, head: -4 + 3 * Math.sin(ph * 6.28), aF: 60, eF: 118 + 6 * Math.sin(ph * 6.28), aB: 16, eB: 68, lF: 82, kF: 84, lB: 74, kB: 78 }), // 坐着，手送到嘴边咬一口
  sitCross: (): Pose => ({ lean: 0, head: 0, aF: 30, eF: 50, aB: 20, eB: 60, lF: 88, kF: 150, lB: 82, kB: 150 }),
  bow: (u: number): Pose => ({ lean: 36 * u, head: 10 * u, aF: lerp(6, 34, u), eF: lerp(12, 96, u), aB: lerp(-6, 30, u), eB: lerp(10, 100, u), lF: 3, kF: 0, lB: -3, kB: 0 }), // 作揖：两手在胸前合抱
  crawl: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: 76, head: -24, aF: 8 + 14 * s, eF: 4, aB: 8 - 14 * s, eB: 4, lF: -4 + 10 * s, kF: 92, lB: -4 - 10 * s, kB: 92 }; },
  kneelWash: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: 42, head: 8, aF: 42 + 14 * s, eF: 8, aB: 34 - 12 * s, eB: 12, lF: 64, kF: 154, lB: 56, kB: 146 }; },
  akimbo: (): Pose => ({ lean: -6, head: -6, aF: -38, eF: 112, aB: -40, eB: 108, lF: 16, kF: 0, lB: -16, kB: 0 }),
  legsApart: (u: number): Pose => ({ lean: -8, head: -8, aF: lerp(-38, 28, u), eF: lerp(112, -6, u), aB: -40, eB: 108, lF: 22, kF: 0, lB: -22, kB: 0 }),
  point: (u = 1): Pose => ({ lean: -2, head: -4, aF: lerp(10, 86, u), eF: lerp(20, -4, u), aB: -20, eB: 90, lF: 8, kF: 0, lB: -10, kB: 0 }),
  give: (u: number): Pose => ({ lean: 10 * u, head: 6, aF: lerp(30, 74, u), eF: lerp(60, 8, u), aB: lerp(26, 70, u), eB: lerp(64, 14, u), lF: 6, kF: 0, lB: -6, kB: 0 }),
  drink: (u: number): Pose => ({ ...P.sitCross(), head: -10 * u, aF: lerp(50, 118, u), eF: lerp(40, 92, u) }),
  sing: (ph = 0): Pose => ({ lean: -8, head: -18, aF: 132 + 6 * Math.sin(ph * 6.28), eF: -14, aB: 30, eB: 40, lF: 14, kF: 0, lB: -14, kB: 0 }),
  dance: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: 10 * s, head: -8 * s, aF: 110 + 50 * s, eF: -10, aB: 70 - 50 * s, eB: -6, lF: 10 + 8 * s, kF: 8, lB: -10, kB: 4 }; },
  weep: (): Pose => ({ lean: 14, head: 22, aF: 128, eF: 84, aB: 10, eB: 40, lF: 4, kF: 0, lB: -4, kB: 0 }),
  laugh: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 4); return { lean: -10 + 14 * s, head: -18 + 10 * s, aF: 84, eF: -4, aB: 24, eB: 96, lF: 8, kF: 0, lB: -8, kB: 0 }; },
  rideRun: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: 18, head: -8, aF: 64, eF: 30, aB: 120 + 10 * s, eB: -20, lF: 70, kF: 70, lB: 60, kB: 64 }; },
  cheer: (ph: number): Pose => { const s = Math.sin(ph * Math.PI * 2); return { lean: -4, head: -10, aF: 150 + 18 * s, eF: -10, aB: 40, eB: 30, lF: 8, kF: 0, lB: -8, kB: 0 }; },
  slump: (): Pose => ({ lean: 30, head: 30, aF: 24, eF: 60, aB: 16, eB: 70, lF: 82, kF: 84, lB: 74, kB: 80 }),
  write: (ph: number): Pose => ({ lean: 6, head: 6, aF: 64 + 4 * Math.sin(ph * 12), eF: 30, aB: -8, eB: 10, lF: 4, kF: 0, lB: -4, kB: 0 }),
  mix: (a: Pose, b: Pose, t: number): Pose => Object.fromEntries(Object.keys(a).map((k) => [k, lerp((a as unknown as Record<string, number>)[k] ?? 0, (b as unknown as Record<string, number>)[k] ?? 0, t)])) as unknown as Pose,
};

const rad = (d: number) => (d * Math.PI) / 180;
const dirOf = (a: number) => [Math.sin(rad(a)), Math.cos(rad(a))]; // 0 = 向下，90 = 向前
const add = (p: number[], d: number[], l: number) => [p[0] + d[0] * l, p[1] + d[1] * l];
const pt = (p: number[]) => `${f(p[0])},${f(p[1])}`;
const darker = (c: string, k = 0.78) => { const n = parseInt(c.slice(1), 16); const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`; };

export interface PersonOpts { x: number; y: number; s?: number; face?: 1 | -1; who: string; pose: Pose; g?: number; a?: number; hold?: 'rod' | 'bowl' | 'cup' | 'spear' | 'basket' | 'reins' | 'brush' | 'torch' | 'pole' | 'scroll' | 'punt' | 'phone' | 'mooncake' | 'notebook' | 'note' | 'camera' | 'pen' | 'paper' | 'blade'
    /** 时间胶囊：letter 信纸；envPink / envBlue 粉、蓝信封；key 小铜钥匙；musicbox 八音盒（两手捧着更像：pose 用 P.give）；photo 照片；
     *  shovel 铁锹（锹头落在地上，手的高度决定锹杆的斜度）；teacup 茶杯（带托、冒热气）；yearbook 年鉴；tin 生锈的铁盒（捧着） */
    | 'letter' | 'envPink' | 'envBlue' | 'key' | 'musicbox' | 'photo' | 'shovel' | 'teacup' | 'yearbook' | 'tin'; detail?: boolean; mood?: 'calm' | 'sneer' | 'sad' | 'shock' | 'laugh' }
/** 画一个人。x、y 是两脚中间落地的点 */
export const person = (o: PersonOpts) => {
  const L = LOOKS[o.who] ?? LOOKS.crowd1, s = o.s ?? 1, fc = o.face ?? 1, g = o.g ?? 0, p = o.pose;
  const T = 46 * (L.tall ?? 1), S = 46 * (L.tall ?? 1), TOR = 60 * (L.tall ?? 1), UA = 33, FA = 31, W = L.wide ?? 1;
  // 先算脚落地：髋的高度 = 最低那只脚 / 膝到髋的距离
  const legPts = (l: number, k: number) => { const kn = add([0, 0], dirOf(l), T), an = add(kn, dirOf(l - k), S); return [kn, an]; };
  const [kF0, aF0] = legPts(p.lF, p.kF), [kB0, aB0] = legPts(p.lB, p.kB);
  const hipY = -Math.max(kF0[1], aF0[1], kB0[1], aB0[1]) + (p.dy ?? 0) - 4;
  const hip = [0, hipY];
  const kF = [kF0[0], kF0[1] + hipY], anF = [aF0[0], aF0[1] + hipY], kB = [kB0[0], kB0[1] + hipY], anB = [aB0[0], aB0[1] + hipY];
  const st = L.stoop ?? 0, lean = p.lean + st, headA = p.lean + p.head + st * 0.25; // 背驼：上身往前倾，头抬回来大半（脸还朝前看）
  const up = [Math.sin(rad(lean)), -Math.cos(rad(lean))], side = [-up[1], up[0]]; // side：朝前的垂线
  const sh = add(hip, up, TOR), neck = add(sh, up, 8);
  const hd = [Math.sin(rad(headA)), -Math.cos(rad(headA))];
  const hc = add(neck, hd, 15);
  const armPts = (a: number, e: number) => { const el = add(sh, dirOf(a), UA), wr = add(el, dirOf(a + e), FA); return [el, wr]; };
  const [elF, wrF] = armPts(p.aF, p.eF), [elB, wrB] = armPts(p.aB, p.eB);
  const robe = L.robe, robe2 = L.robe2 ?? darker(robe), ol = `stroke="${INK}" stroke-opacity=".55" stroke-width="1.4" stroke-linejoin="round"`;
  let out = '';
  // 披风（在最后面）
  if (L.cape) { const sw = wav(g, 1.6) * 6; out += `<path d="M${pt(add(sh, side, -6))} Q${f(sh[0] - 34 + sw)},${f((sh[1] + hip[1]) / 2)} ${f(hip[0] - 40 + sw * 1.5)},${f(hip[1] + 52)} L${f(hip[0] - 4)},${f(hip[1] + 40)} L${pt(add(sh, side, 8))} Z" fill="${L.cape}" ${ol}/>`; }
  // 后面的胳膊
  const arm = (el: number[], wr: number[], c: string, front: boolean) => {
    let a = `<path d="M${pt(sh)} L${pt(el)} L${pt(wr)}" stroke="${c}" stroke-width="${L.sleeve === 'bare' ? 9 : 12}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (L.sleeve === 'bare') a = `<path d="M${pt(sh)} L${pt(el)}" stroke="${c}" stroke-width="12" stroke-linecap="round" fill="none"/><path d="M${pt(el)} L${pt(wr)}" stroke="${SKIN}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${pt(el)} L${pt(wr)}" stroke="${INK}" stroke-opacity=".35" stroke-width="1" fill="none"/>`;
    if (L.sleeve === 'wide') { const dv = [wr[0] - el[0], wr[1] - el[1]], n = Math.hypot(dv[0], dv[1]) || 1, pp = [-dv[1] / n, dv[0] / n]; a += `<path d="M${pt(add(el, pp, 6))} L${pt(add(wr, pp, 11))} Q${f(wr[0] + 4)},${f(wr[1] + 16)} ${pt(add(wr, pp, -9))} L${pt(add(el, pp, -6))} Z" fill="${c}" ${ol}/>`; }
    if (L.trim && L.sleeve === 'wide') a += `<circle cx="${f(wr[0])}" cy="${f(wr[1])}" r="7" fill="none" stroke="${L.trim}" stroke-width="2" opacity=".8"/>`;
    a += `<circle cx="${f(wr[0])}" cy="${f(wr[1])}" r="5.6" fill="${SKIN}" stroke="${INK}" stroke-opacity=".45" stroke-width="1"/>`;
    return front ? a : `<g opacity=".95">${a}</g>`;
  };
  out += arm(elB, wrB, L.arms ? darker(L.arms, 0.9) : robe2, false);
  // 后腿
  const leg = (kn: number[], an: number[], c: string) => `<path d="M${pt(hip)} L${pt(kn)} L${pt(an)}" stroke="${c}" stroke-width="${13 * W}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M${f(an[0] - 4)},${f(an[1] + 2)} q${f(9)},${f(-6)} ${f(17)},${f(1)}" stroke="${L.shoe ?? INK}" stroke-width="7" stroke-linecap="round" fill="none"/>${L.shoe ? `<path d="M${f(an[0] - 5)},${f(an[1] + 5)} h20" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>` : ''}`;
  out += leg(kB, anB, darker(L.pants, 0.85));
  // 1996 年的运动服：裤子侧面一道白条（侧面看正好在腿中间）；工装：小腿上一道反光条
  const legStripe = (kn: number[], an: number[], c: string) => `<path d="M${pt(hip)} L${pt(kn)} L${pt([lerp(kn[0], an[0], 0.86), lerp(kn[1], an[1], 0.86)])}" stroke="${c}" stroke-width="3.2" fill="none" stroke-linejoin="round" opacity=".92"/>`;
  const legBand = (kn: number[], an: number[], c: string) => `<path d="M${pt([lerp(kn[0], an[0], 0.36), lerp(kn[1], an[1], 0.36)])} L${pt([lerp(kn[0], an[0], 0.52), lerp(kn[1], an[1], 0.52)])}" stroke="${c}" stroke-width="${f(13 * W)}" fill="none"/>`;
  if (L.retro) out += legStripe(kB, anB, darker(L.retro, 0.88));
  if (L.hivis) out += legBand(kB, anB, darker(L.hivis, 0.88));
  // 下摆
  const hemK = L.long ? 0.9 : 0.42;
  const hF = [lerp(kF[0], anF[0], hemK) + 13 * W, lerp(kF[1], anF[1], hemK) + 4], hB = [lerp(kB[0], anB[0], hemK) - 12 * W, lerp(kB[1], anB[1], hemK) + 4];
  const wF = add(hip, side, 15 * W), wB = add(hip, side, -16 * W);
  const hemSw = wav(g, 2.2) * 2;
  out += leg(kF, anF, L.pants);
  if (L.retro) out += legStripe(kF, anF, L.retro);
  if (L.hivis) out += legBand(kF, anF, L.hivis);
  if (L.modern) {
    // 现代：上衣下摆在胯下面一点；穿裙子的再画一条到膝盖的裙子
    if (L.skirt) { const sF = [lerp(hip[0], kF[0], 1.05) + 12 * W, lerp(hip[1], kF[1], 1.05)], sB = [lerp(hip[0], kB[0], 1.05) - 12 * W, lerp(hip[1], kB[1], 1.05)]; out += `<path d="M${pt(add(hip, side, -15 * W))} L${pt(sB)} Q${f((sB[0] + sF[0]) / 2)},${f(Math.max(sB[1], sF[1]) + 5)} ${pt(sF)} L${pt(add(hip, side, 14 * W))} Z" fill="${L.skirt}" ${ol}/>`; }
    const hemL = L.coat ? (Math.max(p.lF, p.lB) > 45 ? 26 : 50) : 20, hemW = L.coat ? 6 : 3; // 外套长到大腿（坐着时搭在腿上，短一些）
    const hB2 = add(add(wB, up, -hemL), side, -hemW), hF2 = add(add(wF, up, -hemL), side, hemW);
    out += `<path d="M${pt(wB)} L${pt(hB2)} Q${f((hB2[0] + hF2[0]) / 2)},${f(Math.max(hB2[1], hF2[1]) + 3)} ${pt(hF2)} L${pt(wF)} Z" fill="${robe2}" ${ol}/>`;
  } else out += `<path d="M${pt(wB)} Q${f(wB[0] - 10 + hemSw)},${f((wB[1] + hB[1]) / 2)} ${f(hB[0] + hemSw)},${f(hB[1])} Q${f((hB[0] + hF[0]) / 2)},${f(Math.max(hB[1], hF[1]) + 6)} ${f(hF[0] + hemSw)},${f(hF[1])} Q${f(wF[0] + 10)},${f((wF[1] + hF[1]) / 2)} ${pt(wF)} Z" fill="${robe2}" ${ol}/>`;
  // 身子
  const sF = add(sh, side, 21 * W), sB = add(sh, side, -20 * W);
  out += `<path d="M${pt(wB)} L${pt(sB)} Q${pt(add(sh, up, 7))} ${pt(sF)} L${pt(wF)} Z" fill="${robe}" ${ol}/>`;
  // 身上一圈的位置：a 是从肩往下多少，b 是前后（-1 后背，1 前胸）
  const tor = (a: number, b: number) => add(add(sh, up, -a), side, (b > 0 ? lerp(21, 15, a / TOR) : lerp(20, 16, a / TOR)) * W * b);
  if (L.inner) out += `<path d="M${pt(tor(0, 0.5))} L${pt(tor(0, 0.95))} L${pt(tor(TOR - 2, 0.96))} L${pt(tor(TOR - 2, 0.74))} Z" fill="${L.inner}"/><path d="M${pt(tor(0, 0.5))} L${pt(tor(TOR - 2, 0.74))}" stroke="${darker(robe, 0.8)}" stroke-width="2.4"/>` + [0.4, 0.62, 0.84].map((k) => `<circle cx="${f(tor(TOR * k, 0.6 + 0.12 * k)[0])}" cy="${f(tor(TOR * k, 0.6 + 0.12 * k)[1])}" r="1.6" fill="${darker(robe, 0.7)}"/>`).join(''); // 开衫、外套敞着，露出里面的衬衫
  if (L.retro) out += `<path d="M${pt(tor(9, -1))} L${pt(tor(9, 1))} L${pt(tor(21, 1))} L${pt(tor(21, -1))} Z" fill="${L.retro}" opacity=".95"/>`; // 1996 年的运动服：胸前一道宽白条
  if (L.hivis) out += [24, 38].map((a) => `<path d="M${pt(tor(a, -1))} L${pt(tor(a, 1))}" stroke="${L.hivis}" stroke-width="5"/><path d="M${pt(tor(a, -1))} L${pt(tor(a, 1))}" stroke="${INK}" stroke-opacity=".25" stroke-width="5" stroke-dasharray="1 9"/>`).join(''); // 反光条
  if (L.patches) out += `<rect x="${f(sh[0] - 12)}" y="${f(sh[1] + 18)}" width="11" height="9" fill="#8E9398" opacity=".8" transform="rotate(${f(p.lean)} ${f(sh[0])} ${f(sh[1])})"/><rect x="${f(hB[0] + 8)}" y="${f(hB[1] - 18)}" width="10" height="8" fill="#7E8388" opacity=".8"/>`;
  if (L.armor) for (let i = 1; i <= 4; i++) { const a0 = add(add(hip, up, TOR * i / 5.2), side, -18 * W), a1 = add(add(hip, up, TOR * i / 5.2), side, 19 * W); out += `<path d="M${pt(a0)} Q${pt(add(add(hip, up, TOR * i / 5.2 - 4), side, 0))} ${pt(a1)}" stroke="#8A7E6A" stroke-width="1.6" fill="none" opacity=".8"/>`; }
  if (L.armor) out += `<path d="M${pt(add(sh, side, -14))} q${f(side[0] * 16 + up[0] * 8)},${f(side[1] * 16 + up[1] * 8)} ${f(side[0] * 30)},${f(side[1] * 30)}" stroke="#8A7E6A" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  // 领口、腰带
  if (L.modern) {
    if (L.hood) out += `<path d="M${pt(add(sh, side, -18))} Q${pt(add(add(sh, up, 14), side, -26))} ${pt(add(add(sh, up, 2), side, -2))}" stroke="${robe2}" stroke-width="9" stroke-linecap="round" fill="none"/>`;
    out += `<path d="M${pt(add(sh, side, 9))} L${pt(add(add(sh, up, -10), side, 4))} L${pt(add(sh, side, -4))}" stroke="${L.stripe ?? L.inner ?? L.retro ?? '#E9DFCB'}" stroke-width="${L.retro ? 4.5 : 3}" fill="none" opacity=".9"/>`;
    if (L.stripe) out += `<path d="M${pt(add(sh, side, 4))} L${pt(add(hip, side, 4))}" stroke="${L.stripe}" stroke-width="2" opacity=".8"/>`; // 拉链
    if (L.scarf) { const n0 = add(sh, up, 3), sw = wav(g, 2.4) * 1.5; out += `<path d="M${pt(add(n0, side, -14))} Q${pt(add(add(n0, up, -7), side, 1))} ${pt(add(n0, side, 15))}" stroke="${L.scarf}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M${pt(add(add(sh, up, -1), side, 11))} Q${pt(add(add(sh, up, -18), side, 17 + sw))} ${pt(add(add(sh, up, -36), side, 15 + sw))}" stroke="${darker(L.scarf, 0.88)}" stroke-width="8.5" fill="none" stroke-linecap="round"/><path d="M${pt(add(n0, side, -13))} Q${pt(add(add(n0, up, -7), side, 1))} ${pt(add(n0, side, 14))}" stroke="#F4EDE2" stroke-opacity=".35" stroke-width="2" stroke-dasharray="3 4" fill="none"/>`; }
    if (L.lanyard) { const b = add(add(sh, up, -30), side, 8); out += `<path d="M${pt(add(sh, side, 12))} L${pt(b)} L${pt(add(sh, side, -2))}" stroke="${L.lanyard}" stroke-width="2.2" fill="none"/><rect x="${f(b[0] - 7)}" y="${f(b[1])}" width="14" height="18" rx="2" fill="#F4F1E8" stroke="${INK}" stroke-opacity=".5"/><rect x="${f(b[0] - 5)}" y="${f(b[1] + 3)}" width="10" height="3" fill="${L.lanyard}"/>`; }
  } else {
    out += `<path d="M${pt(add(sh, side, 10))} L${pt(add(add(sh, up, -20), side, 2))} L${pt(add(sh, side, -6))}" stroke="${L.trim ?? '#E9DFCB'}" stroke-width="2" fill="none" opacity=".75"/>`;
    out += `<path d="M${pt(add(add(hip, up, 9), side, -16 * W))} L${pt(add(add(hip, up, 9), side, 15 * W))}" stroke="${L.belt ?? INK}" stroke-width="6"/>`;
  }
  // 佩剑
  if (L.sword && o.hold !== 'spear') { const h0 = add(add(hip, up, 6), side, 10), h1 = add(h0, [-side[0] * 0.95 - up[0] * 0.3, -side[1] * 0.95 - up[1] * 0.3 + 0.32], 62); out += `<path d="M${pt(h0)} L${pt(h1)}" stroke="#3A2A1E" stroke-width="5" stroke-linecap="round"/><path d="M${pt(h0)} L${pt(add(h0, [side[0] * 0.9 + up[0] * 0.4, side[1] * 0.9 + up[1] * 0.4], 16))}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="${f(h0[0])}" cy="${f(h0[1])}" r="3" fill="${GOLD}"/>`; }
  // 头
  out += headSide(hc, headA, L, g, o.detail ?? s >= 1.6, o.mood ?? 'calm');
  // 手里拿的
  const hold = o.hold;
  if (hold === 'rod') { const tx = wrF[0] + 210, ty = wrF[1] - 120, ex = tx + 24, ey = -8; out += `<path d="M${pt(wrF)} L${f(tx)},${f(ty)}" stroke="#5A4630" stroke-width="2.4"/><path d="M${f(tx)},${f(ty)} Q${f(tx + 6 + wav(g, 3) * 3)},${f((ty + ey) / 2)} ${f(ex)},${f(ey)}" stroke="${INK}" stroke-opacity=".55" stroke-width="1" fill="none"/>` + [0, 1, 2].map((i) => { const k = (g * 0.45 + i / 3) % 1; return `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="${f(4 + k * 30)}" ry="${f(1.5 + k * 6)}" fill="none" stroke="${INK}" stroke-opacity="${f(0.45 * (1 - k))}" stroke-width="1.2"/>`; }).join(''); }
  if (hold === 'bowl') out += bowl(wrF[0] + 8, wrF[1] - 4, 0.55, g);
  if (hold === 'cup') out += `<path d="M${f(wrF[0] - 6)},${f(wrF[1] - 10)} h12 l-2,10 h-8 z" fill="#8A6A3A" stroke="${INK}" stroke-width="1"/>`;
  if (hold === 'spear') out += `<line x1="${f(wrF[0])}" y1="${f(wrF[1] + 40)}" x2="${f(wrF[0] + 6)}" y2="${f(wrF[1] - 150)}" stroke="#4A3A2A" stroke-width="3"/><path d="M${f(wrF[0] + 6)},${f(wrF[1] - 150)} l-5,12 h10 z" fill="#8A8A8A"/>`;
  if (hold === 'basket') out += `<path d="M${f(wrB[0] - 18)},${f(wrB[1] + 4)} h36 l-5,22 h-26 z" fill="#9C7E52" stroke="${INK}" stroke-opacity=".6"/><path d="M${f(wrB[0] - 14)},${f(wrB[1] + 4)} q14,-16 28,0" stroke="#7A5E3A" stroke-width="2" fill="none"/>`;
  if (hold === 'reins') out += `<path d="M${pt(wrF)} q40,10 90,-4" stroke="#3A2A1E" stroke-width="2" fill="none"/>`;
  if (hold === 'brush') out += `<line x1="${f(wrF[0])}" y1="${f(wrF[1])}" x2="${f(wrF[0] + 6)}" y2="${f(wrF[1] - 26)}" stroke="#5A4630" stroke-width="2.5"/>`;
  if (hold === 'torch') out += `<line x1="${f(wrF[0])}" y1="${f(wrF[1] + 8)}" x2="${f(wrF[0] + 4)}" y2="${f(wrF[1] - 40)}" stroke="#4A3A2A" stroke-width="3"/><path d="M${f(wrF[0] + 4)},${f(wrF[1] - 40)} q-8,-14 0,-30 q10,14 0,30" fill="#E07A2E"/>`;
  if (hold === 'pole') out += `<line x1="${f(wrF[0] - 10)}" y1="${f(wrF[1] + 60)}" x2="${f(wrF[0] + 14)}" y2="${f(wrF[1] - 170)}" stroke="#6E5A3A" stroke-width="3.5"/><path d="M${f(wrF[0] + 14)},${f(wrF[1] - 170)} q30,${f(8 + wav(g, 1.3) * 6)} 60,${f(2 + wav(g, 1.3, 0.3) * 8)} l0,40 q-30,${f(6 + wav(g, 1.3) * 6)} -60,-4 z" fill="#8C3A2E"/>`;
  if (hold === 'punt') out += `<line x1="${f(wrB[0] - 60)}" y1="${f(-hipY * 0 + 40)}" x2="${f(wrB[0] + 30)}" y2="${f(wrB[1] - 120)}" stroke="#6E5A3A" stroke-width="4"/>`; // 撑船的长篙
  if (hold === 'phone') out += `<rect x="${f(wrF[0] - 6)}" y="${f(wrF[1] - 22)}" width="13" height="23" rx="2.5" fill="#1E2028" stroke="${INK}" stroke-width="1"/><rect x="${f(wrF[0] - 4.5)}" y="${f(wrF[1] - 20)}" width="10" height="17" rx="1" fill="#8FD0A6" opacity="${f(0.8 + 0.2 * Math.sin(g * 5))}"/>`;
  if (hold === 'mooncake') out += `<circle cx="${f(wrF[0] + 4)}" cy="${f(wrF[1] - 6)}" r="9" fill="#C98A3E" stroke="#7A4E1E" stroke-width="1.5"/><circle cx="${f(wrF[0] + 4)}" cy="${f(wrF[1] - 6)}" r="5" fill="none" stroke="#7A4E1E" stroke-width="1"/>`;
  if (hold === 'notebook') out += `<rect x="${f(wrF[0] - 4)}" y="${f(wrF[1] - 18)}" width="22" height="28" rx="2" fill="#E4B83E" stroke="${INK}" stroke-width="1.2"/><path d="M${f(wrF[0] - 1)},${f(wrF[1] - 18)} v28" stroke="${INK}" stroke-opacity=".5" stroke-width="2"/>`;
  if (hold === 'note') out += `<rect x="${f(wrF[0] - 2)}" y="${f(wrF[1] - 14)}" width="16" height="16" fill="#F6DC5A" stroke="#B89A2A" stroke-width="1"/>`;
  if (hold === 'camera') out += `<rect x="${f(wrF[0] - 14)}" y="${f(wrF[1] - 20)}" width="30" height="20" rx="4" fill="#1E2028" stroke="${INK}" stroke-width="1.2"/><circle cx="${f(wrF[0] + 1)}" cy="${f(wrF[1] - 10)}" r="6.5" fill="#3A4A5A" stroke="#9AA8B4" stroke-width="1.5"/><rect x="${f(wrF[0] - 10)}" y="${f(wrF[1] - 24)}" width="8" height="4" fill="#1E2028"/>`;
  if (hold === 'pen') out += `<line x1="${f(wrF[0] - 2)}" y1="${f(wrF[1] + 2)}" x2="${f(wrF[0] + 10)}" y2="${f(wrF[1] - 18)}" stroke="#2F5DA8" stroke-width="3" stroke-linecap="round"/>`;
  if (hold === 'paper') out += `<rect x="${f(wrF[0] - 4)}" y="${f(wrF[1] - 26)}" width="26" height="34" fill="#F4F1E8" stroke="${INK}" stroke-width="1"/><path d="M${f(wrF[0])},${f(wrF[1] - 18)} h16 M${f(wrF[0])},${f(wrF[1] - 12)} h16" stroke="#C9A23A" stroke-width="1.5"/>`;
  if (hold === 'blade') { const d = [wrF[0] - elF[0], wrF[1] - elF[1]], n = Math.hypot(d[0], d[1]) || 1, u2 = [d[0] / n, d[1] / n], tip = add(wrF, u2, 78), gd = [-u2[1] * 9, u2[0] * 9]; out += `<path d="M${pt(add(wrF, u2, 6))} L${pt(tip)}" stroke="#D8DCE0" stroke-width="4" stroke-linecap="round"/><path d="M${f(wrF[0] + u2[0] * 6 + gd[0])},${f(wrF[1] + u2[1] * 6 + gd[1])} L${f(wrF[0] + u2[0] * 6 - gd[0])},${f(wrF[1] + u2[1] * 6 - gd[1])}" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>`; } // 拔出来的剑
  if (hold === 'scroll') out += `<rect x="${f(wrF[0] - 3)}" y="${f(wrF[1] - 16)}" width="34" height="22" fill="#EFE3C6" stroke="#8A6A3A"/>`;
  if (hold) out += holdTC(hold, wrF, wrB, g);
  out += arm(elF, wrF, L.arms ?? robe, true);
  if (L.retro && L.modern) out += `<path d="M${pt(sh)} L${pt(elF)} L${pt(add(wrF, [elF[0] - wrF[0], elF[1] - wrF[1]], 0.18))}" stroke="${L.retro}" stroke-width="3.4" fill="none" opacity=".9" stroke-linejoin="round"/>`;
  if (L.stripe && L.modern) out += `<path d="M${pt(sh)} L${pt(elF)} L${pt(add(wrF, [elF[0] - wrF[0], elF[1] - wrF[1]], 0.18))}" stroke="${L.stripe}" stroke-width="2.4" fill="none" opacity=".85" stroke-linejoin="round"/>`;
  return `<g data-p="person" transform="translate(${f(o.x)},${f(o.y)}) scale(${f(s * fc)},${f(s)})" opacity="${o.a ?? 1}">${out}</g>`;
};

/** 时间胶囊的道具拿在手里（人物大小；大一点的特写用 capsule.ts 里的画法） */
const holdTC = (hold: string, wrF: number[], wrB: number[], g: number) => {
  const [x, y] = wrF, ol = `stroke="${INK}" stroke-width="1" stroke-linejoin="round"`;
  switch (hold) {
    case 'letter': return `<g transform="translate(${f(x)},${f(y)}) rotate(-8)"><rect x="-4" y="-31" width="24" height="31" fill="#FBF7EC" ${ol}/>${[0, 1, 2, 3].map((i) => `<path d="M0,${-25 + i * 6} q4,-2 8,0 t8,0" stroke="#2B3A6E" stroke-width="1" fill="none" opacity=".75"/>`).join('')}</g>`;
    case 'envPink': case 'envBlue': { const c = hold === 'envPink' ? '#EFB3BF' : '#9DBDE2'; return `<g transform="translate(${f(x)},${f(y)}) rotate(-6)"><rect x="-6" y="-21" width="32" height="21" fill="${c}" ${ol}/><path d="M-6,-21 L10,-9 L26,-21" stroke="${INK}" stroke-opacity=".5" stroke-width="1" fill="none"/></g>`; }
    case 'key': return `<g transform="translate(${f(x + 2)},${f(y - 3)}) rotate(-30)"><path d="M0,0 h13 M10,0 v3 M13,0 v3" stroke="#B8862A" stroke-width="2" fill="none"/><ellipse cx="-3" cy="-2.5" rx="3" ry="2.4" fill="#D9A441" stroke="#8A6218" stroke-width=".8"/><ellipse cx="-3" cy="2.5" rx="3" ry="2.4" fill="#D9A441" stroke="#8A6218" stroke-width=".8"/><circle cx="6" cy="-4" r="${f(1.5 + Math.max(0, Math.sin(g * 3)) * 1.5)}" fill="#FFF6D0" opacity=".9"/></g>`;
    case 'musicbox': return `<g transform="translate(${f(x)},${f(y)})"><rect x="-10" y="-22" width="34" height="20" rx="2" fill="#7A4A2A" ${ol}/><rect x="-11" y="-26" width="36" height="6" rx="2" fill="#8E5A34" ${ol}/><path d="M-10,-12 h34" stroke="${GOLD}" stroke-width="1.4"/><circle cx="7" cy="-12" r="2" fill="${GOLD}"/></g>`;
    case 'photo': return `<g transform="translate(${f(x)},${f(y)}) rotate(-5)"><rect x="-4" y="-22" width="30" height="22" fill="#F4EFE2" ${ol}/><rect x="-1" y="-19" width="24" height="15" fill="#A99B82"/><path d="M1,-5 q3,-6 6,0 M8,-5 q3,-6 6,0 M15,-5 q3,-6 6,0" fill="#5E5446"/></g>`;
    case 'shovel': {
      // 锹杆：从手的上方斜着穿过手，锹头落在地上（人的原点就是地面）
      const T = [x - 16, y - 34], d = [x - T[0], y - T[1]], k = (-22 - T[1]) / d[1], B = [T[0] + d[0] * k, T[1] + d[1] * k], n = Math.hypot(d[0], d[1]), u = [d[0] / n, d[1] / n], v = [-u[1], u[0]];
      const bl = (a: number, b: number) => `${f(B[0] + u[0] * a + v[0] * b)},${f(B[1] + u[1] * a + v[1] * b)}`;
      return `<path d="M${f(T[0])},${f(T[1])} L${f(B[0])},${f(B[1])}" stroke="#8A6A44" stroke-width="3.4" stroke-linecap="round"/><path d="M${f(T[0] - v[0] * 6)},${f(T[1] - v[1] * 6)} L${f(T[0] + v[0] * 6)},${f(T[1] + v[1] * 6)}" stroke="#5A4630" stroke-width="3" stroke-linecap="round"/><path d="M${bl(-2, -8)} L${bl(-2, 8)} L${bl(16, 7)} Q${bl(24, 0)} ${bl(16, -7)} Z" fill="#8E9498" ${ol}/><path d="M${bl(10, -6)} Q${bl(18, 0)} ${bl(10, 6)}" stroke="#6A4E32" stroke-width="3" fill="none"/>`;
    }
    case 'teacup': return `<g transform="translate(${f(x + 4)},${f(y - 3)})"><ellipse cx="0" cy="0" rx="11" ry="2.6" fill="#F4F1EA" ${ol}/><path d="M-7,-1 L-6,-11 L6,-11 L7,-1 Z" fill="#F4F1EA" ${ol}/><path d="M-6,-9 h12" stroke="#4A7A9A" stroke-width="1.4"/>${[0, 1].map((i) => { const k = (g * 0.4 + i / 2) % 1; return `<path d="M${-2 + i * 4},${f(-14 - k * 16)} q3,-4 0,-8" stroke="#fff" stroke-width="1.6" fill="none" opacity="${f(0.75 * Math.sin(k * Math.PI))}"/>`; }).join('')}</g>`;
    case 'yearbook': return `<g transform="translate(${f(x)},${f(y)}) rotate(-6)"><rect x="-5" y="-34" width="26" height="34" rx="1.5" fill="#6E2E2A" ${ol}/><rect x="-5" y="-34" width="4" height="34" fill="#4E1E1A"/><path d="M2,-26 h14 M2,-8 h14" stroke="${GOLD}" stroke-width="1.4"/><rect x="5" y="-21" width="8" height="8" fill="none" stroke="${GOLD}" stroke-width="1"/></g>`;
    case 'tin': return `<g transform="translate(${f((x + wrB[0]) / 2 + 6)},${f(y)})"><rect x="-20" y="-20" width="40" height="24" rx="2" fill="#8A5E3E" ${ol}/><rect x="-21" y="-24" width="42" height="7" rx="2" fill="#9A6A44" ${ol}/><circle cx="-10" cy="-8" r="4" fill="#B0653A" opacity=".8"/><circle cx="9" cy="-3" r="3" fill="#6E4428" opacity=".8"/><rect x="-8" y="-23" width="16" height="5" fill="#E8DDC4" opacity=".9"/></g>`;
  }
  return '';
};
/** 侧面的头：头型、头发 / 头盔 / 头巾、脸（大一点时才画眼睛、眉毛、嘴） */
const headSide = (c: number[], ang: number, L: Look, g: number, detail: boolean, mood: string) => {
  const r = 15;
  let o = `<g transform="translate(${f(c[0])},${f(c[1])}) rotate(${f(ang)})">`;
  const hairC = L.hairC ?? '#1E1A18';
  if (L.hair === 'bun') o += `<path d="M-12,4 Q-22,30 -14,58 Q-10,${f(64 + wav(g, 2.5) * 2)} -4,58 Q-8,30 -4,6 Z" fill="${hairC}"/>`; // 长发垂在背后
  if (L.hair === 'braids') { // 两条辫子：从耳后垂到肩下，辫梢扎红头绳
    const braid = (x0: number, ph: number, c: string) => { const sw = wav(g, 2.2, ph) * 2.5; let b = ''; for (let i = 0; i < 6; i++) { const t = i / 5, bx = x0 - 3 * t + sw * t, by = 6 + i * 6.4; b += `<ellipse cx="${f(bx)}" cy="${f(by)}" rx="3.6" ry="4.2" fill="${c}" stroke="${INK}" stroke-opacity=".35" stroke-width=".7" transform="rotate(${f(-18 + (i % 2) * 36)} ${f(bx)} ${f(by)})"/>`; } const ex = x0 - 3 + sw, ey = 6 + 6 * 6.4; return b + `<path d="M${f(ex - 3)},${f(ey - 3)} l6,0" stroke="#C23B2E" stroke-width="2.4"/><path d="M${f(ex)},${f(ey - 2)} q-1,4 0,6" stroke="${c}" stroke-width="3" stroke-linecap="round" fill="none"/>`; };
    o += braid(-3, 0.3, darker(hairC, 0.8)) + braid(-9, 0, hairC);
  }
  if (L.hair === 'lowtail') o += `<path d="M-12,4 Q${f(-19 + wav(g, 2.4) * 1.5)},20 ${f(-15 + wav(g, 2.4) * 2.5)},38 Q-10,42 -8,34 Q-10,18 -6,6 Z" fill="${hairC}"/><path d="M-13,7 l6,2" stroke="#8A6A5A" stroke-width="2.2"/>`; // 低低扎起的马尾
  o += `<circle cx="0" cy="0" r="${r}" fill="${SKIN}" stroke="${INK}" stroke-opacity=".6" stroke-width="1.2"/>`;
  o += `<path d="M${r - 1},-3 q5,4 1,8" fill="${SKIN}" stroke="${INK}" stroke-opacity=".6" stroke-width="1.2"/>`; // 鼻子
  if (L.hair === 'knot' || L.hair === 'crown' || L.hair === 'scholar' || L.hair === 'cap' || L.hair === 'messy') o += `<path d="M${-r},2 Q${-r - 2},${-r - 2} 0,${-r - 1} Q${r - 2},${-r} ${r - 2},-7 Q4,-8 -2,-4 Q-6,6 -9,10 Z" fill="${hairC}"/>`;
  if (L.hair === 'knot') o += `<circle cx="-4" cy="${-r - 5}" r="6.5" fill="${hairC}"/><rect x="-9" y="${-r - 2}" width="10" height="3" fill="#D9CFBD"/>`;
  if (L.hair === 'scholar') o += `<path d="M-12,${-r + 1} q12,-14 24,-2 l-2,-8 q-10,-8 -20,0 z" fill="${INK}"/><path d="M-12,-8 q-6,10 -4,24" stroke="${INK}" stroke-width="2" fill="none"/>`;
  if (L.hair === 'crown') o += `<rect x="-11" y="${-r - 16}" width="22" height="12" fill="${INK}"/><rect x="-14" y="${-r - 18}" width="28" height="4" fill="${GOLD}"/><path d="M-12,${-r - 14} l-4,${f(26 + wav(g, 2) * 2)} M12,${-r - 14} l4,${f(26 + wav(g, 2, 0.3) * 2)}" stroke="${GOLD}" stroke-width="1.5"/>`;
  if (L.hair === 'cap') o += `<path d="M${-r - 2},-4 Q0,${-r - 12} ${r + 1},-5 Q0,-9 ${-r - 2},-4 Z" fill="#4A4238"/>`;
  if (L.hair === 'messy') o += `<path d="M${-r},-2 l-5,-8 l6,2 l-1,-9 l7,5 l2,-9 l5,7 l5,-6 l1,8 l6,-2 l-4,7" fill="${hairC}"/><path d="M-15,-6 l27,-4" stroke="#8A3A2A" stroke-width="3"/>`;
  if (L.hair === 'kerchief') o += `<path d="M${-r - 2},6 Q${-r - 4},${-r - 6} 2,${-r - 3} Q${r + 1},${-r} ${r},-4 Q2,-9 -6,-2 Q-10,8 -12,14 Z" fill="${hairC}" stroke="${INK}" stroke-opacity=".4"/><path d="M${-r - 1},4 q-9,4 -12,14 q6,-2 10,-8" fill="${hairC}" stroke="${INK}" stroke-opacity=".35"/>`;
  if (L.hair === 'helmet') o += `<path d="M${-r - 3},4 Q${-r - 4},${-r - 8} 0,${-r - 5} Q${r + 3},${-r - 4} ${r + 2},-5 L${r - 2},-3 Q2,-8 -8,-2 L-10,10 Z" fill="#3A3330" stroke="#8A7E6A" stroke-width="1.4"/><path d="M0,${-r - 5} l0,-6" stroke="#8A7E6A" stroke-width="2"/><path d="M0,${-r - 11} q${f(-8 + wav(g, 1.4) * 3)},-6 ${f(-16 + wav(g, 1.4) * 5)},${f(6)}" stroke="${RED}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  if (L.hair === 'bun') o += `<path d="M${-r},4 Q${-r - 2},${-r - 4} 0,${-r - 1} Q${r - 2},${-r} ${r - 3},-8 Q2,-9 -4,-4 Q-8,6 -10,10 Z" fill="${hairC}"/><ellipse cx="-6" cy="${-r - 7}" rx="9" ry="6" fill="${hairC}"/><path d="M-16,${-r - 9} l22,-3" stroke="${GOLD}" stroke-width="2"/><circle cx="7" cy="${-r - 11}" r="2.5" fill="${RED}"/>`;
  if (L.hair === 'short' || L.hair === 'tousled' || L.hair === 'pony' || L.hair === 'shag' || L.hair === 'braids' || L.hair === 'lowtail') o += `<path d="M${-r - 1},4 Q${-r - 3},${-r - 4} 0,${-r - 2} Q${r},${-r - 1} ${r - 1},-6 Q6,-9 0,-6 Q-6,4 -9,10 Z" fill="${hairC}"/>`;
  if (L.hair === 'tousled') o += `<path d="M-14,-10 l-6,-8 l9,1 l-2,-9 l8,6 l3,-9 l5,8 l6,-6 l1,9 l7,-2 l-4,8" fill="${hairC}"/><path d="M-4,-14 q6,-3 10,2" stroke="#B08A44" stroke-width="1.4" fill="none"/>`;
  if (L.hair === 'pony') o += `<path d="M-12,-10 Q${f(-30 + wav(g, 1.6) * 3)},${f(-4)} ${f(-26 + wav(g, 1.6) * 4)},${f(22)} Q-20,6 -10,-4 Z" fill="${hairC}"/><circle cx="-13" cy="-8" r="3" fill="#C23B2E"/>`;
  if (L.hair === 'bob') o += `<path d="M${r - 2},-8 Q4,${-r - 5} ${-r - 3},-2 Q${-r - 5},14 -10,${r + 3} L-3,${r} Q-7,4 -3,-3 Q4,-6 ${r - 2},-8 Z" fill="${hairC}"/><path d="M${r - 1},-9 Q${r + 3},-1 ${r - 3},2" stroke="${hairC}" stroke-width="3" fill="none"/>`;
  if (L.hair === 'guardcap') o += `<path d="M${-r - 1},2 Q${-r - 2},-6 -6,-9" fill="#8E8A84"/><path d="M${-r - 2},-4 Q${-r},${-r - 10} 2,${-r - 9} Q${r + 1},${-r - 8} ${r},-6 Z" fill="#26324A" stroke="${INK}" stroke-opacity=".5"/><path d="M${r - 2},-6 Q${r + 10},-6 ${r + 13},-2 Q${r + 4},-1 ${r - 3},-3 Z" fill="#1A2236"/><circle cx="3" cy="${-r - 2}" r="3" fill="${GOLD}"/>`;
  if (L.hair === 'shag') o += `<path d="M-15,-8 l-5,-6 l7,0 l-2,-7 l6,4 l2,-7 l4,6 l5,-5 l1,7 l6,-2 l-3,6 Z" fill="${hairC}"/><path d="M9,-16 q7,3 6,10 q-3,-4 -9,-5 z" fill="${hairC}"/>`; // 有点乱的短发
  if (L.hair === 'crop') o += `<path d="M${r - 2},-9 Q4,${-r - 6} ${-r - 2},-4 Q${-r - 4},8 -12,13 L-5,11 Q-7,2 -3,-4 Q5,-7 ${r - 2},-9 Z" fill="${hairC}"/><path d="M${r - 1},-10 Q${r + 3},-4 ${r - 3},0" stroke="${hairC}" stroke-width="2.6" fill="none"/>`; // 女生的短发：盖住耳朵，到后颈
  if (L.hair === 'lob') o += `<path d="M${r - 2},-8 Q4,${-r - 6} ${-r - 3},-3 Q${-r - 6},16 -13,${r + 9} Q-8,${r + 10} -4,${r + 6} Q-8,5 -3,-3 Q4,-6 ${r - 2},-8 Z" fill="${hairC}"/><path d="M${r - 1},-9 Q${r + 3},-1 ${r - 3},2" stroke="${hairC}" stroke-width="3" fill="none"/><path d="M-2,${-r - 2} q4,4 10,4" stroke="${darker(hairC, 0.7)}" stroke-width="1" fill="none"/>`; // 齐肩发
  if (L.hair === 'sparse') o += `<path d="M-15,6 Q-17,-6 -11,-11 Q-7,-6 -9,1 Q-6,8 -9,11 Z" fill="${hairC}" stroke="${INK}" stroke-opacity=".3" stroke-width=".6"/><path d="M-11,-11 q9,-6 18,-4 M-8,-13 q8,-3 14,0" stroke="${hairC}" stroke-width="1.3" fill="none" opacity=".9"/>`; // 头顶稀了，耳后一圈白发
  if (L.hair === 'hardhat') o += `<path d="M-16,0 Q-17,8 -10,10 Q-11,4 -8,0 Z" fill="${hairC}"/><path d="M-17,-2 Q-17,-22 0,-22 Q17,-22 17,-5 Z" fill="#F2C230" stroke="${INK}" stroke-opacity=".6" stroke-width="1.1"/><path d="M-19,-2 L22,-5 L24,-2 L-19,1 Z" fill="#D9A520" stroke="${INK}" stroke-opacity=".5" stroke-width=".8"/><path d="M-1,-22 Q-3,-12 -2,-3" stroke="#D9A520" stroke-width="2.2" fill="none"/>`; // 黄色安全帽
  if (L.grey) o += `<path d="M-12,-11 q6,-6 14,-6 M-14,-3 q3,-8 9,-11" stroke="${L.grey}" stroke-width="1.1" fill="none" opacity=".9"/>`; // 头发里的几丝白
  if (L.glasses) o += `<circle cx="8" cy="-3" r="5.5" fill="#E8F2F6" fill-opacity=".35" stroke="${INK}" stroke-width="1.6"/><path d="M2.5,-4 L-6,-5" stroke="${INK}" stroke-width="1.4"/>`;
  if (L.beard === 'stub') o += `<path d="M${r - 6},8 q-6,8 -16,6" stroke="${INK}" stroke-opacity=".35" stroke-width="3" fill="none" stroke-dasharray="1.5 2"/>`;
  if (L.beard === 'long') o += `<path d="M${r - 5},9 q-2,${f(18 + wav(g, 2.4) * 1.5)} -10,${f(26)} q-2,-12 -4,-22 z" fill="#5A5048"/>`;
  if (detail) {
    const eyeY = -3, sq = mood === 'sneer' ? 0.5 : mood === 'shock' ? 1.6 : 1;
    o += `<path d="M5,${eyeY} q3,${f(-1.6 * sq)} 6,0" stroke="${INK}" stroke-width="1.6" fill="none"/>`;
    const bA = mood === 'sneer' ? -14 : mood === 'sad' ? 14 : mood === 'shock' ? -6 : 0;
    o += `<path d="M3,${eyeY - 6} l9,0" stroke="${INK}" stroke-width="1.8" transform="rotate(${bA} 7 ${eyeY - 6})"/>`;
    const mo = mood === 'laugh' ? `<path d="M${r - 6},8 q-4,5 -8,1" fill="#5A2A22"/>` : mood === 'sneer' ? `<path d="M${r - 5},8 q-4,1 -7,-2" stroke="${INK}" stroke-width="1.3" fill="none"/>` : mood === 'shock' ? `<ellipse cx="${r - 7}" cy="9" rx="2" ry="3" fill="#5A2A22"/>` : `<path d="M${r - 5},9 l-5,0" stroke="${INK}" stroke-width="1.2"/>`;
    o += mo;
    o += `<path d="M-3,-3 q-4,3 0,7" stroke="${INK}" stroke-opacity=".5" stroke-width="1.2" fill="none"/>`; // 耳朵
  }
  return o + '</g>';
};

/** 碗：米饭、热气 */
export const bowl = (x: number, y: number, s = 1, g = 0, steam = true) => {
  let o = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})"><path d="M-30,0 Q-28,26 0,30 Q28,26 30,0 Z" fill="#8A6A48" stroke="${INK}" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="30" ry="8" fill="#6E543A" stroke="${INK}" stroke-width="1.5"/><path d="M-24,0 Q0,-18 24,0 Z" fill="#F7F2E6" stroke="${INK}" stroke-opacity=".3"/>`;
  if (steam) for (let i = 0; i < 3; i++) { const k = ((g * 0.5 + i / 3) % 1); o += `<path d="M${-10 + i * 10},${f(-14 - k * 40)} q${f(6 + wav(g, 1.2, i) * 4)},-10 0,-20" stroke="#fff" stroke-width="3" fill="none" opacity="${f(0.7 * Math.sin(k * Math.PI))}" stroke-linecap="round"/>`; }
  return o + '</g>';
};

// ---------------- 马（侧面，朝右） ----------------
export const horse = (o: { x: number; y: number; s?: number; face?: 1 | -1; g?: number; gait?: 'stand' | 'run' | 'paw' | 'walk'; ph?: number; head?: number; c?: string; spots?: boolean; rider?: string; riderPose?: Pose; a?: number }) => {
  const s = o.s ?? 1, fc = o.face ?? 1, g = o.g ?? 0, c = o.c ?? '#1C1918', ph = o.ph ?? g;
  const legA = (base: number, phase: number, amp: number) => (o.gait === 'run' ? base + Math.sin((ph + phase) * Math.PI * 2) * amp : o.gait === 'walk' ? base + Math.sin((ph + phase) * Math.PI * 2) * amp * 0.45 : base);
  const leg = (hx: number, hy: number, a: number, k: number, front: boolean, sh: number) => {
    const kn = [hx + Math.sin(rad(a)) * 44, hy + Math.cos(rad(a)) * 44], b = a + (front ? -k : k), ho = [kn[0] + Math.sin(rad(b)) * 46, kn[1] + Math.cos(rad(b)) * 46];
    return `<path d="M${f(hx)},${f(hy)} L${pt(kn)}" stroke="${sh ? darker(c, 0.8) : c}" stroke-width="${front ? 19 : 22}" stroke-linecap="round" fill="none"/><path d="M${pt(kn)} L${pt(ho)}" stroke="${sh ? darker(c, 0.8) : c}" stroke-width="11" stroke-linecap="round" fill="none"/><path d="M${f(ho[0] - 7)},${f(ho[1])} h15" stroke="#3A3330" stroke-width="9" stroke-linecap="round"/>`;
  };
  const paw = o.gait === 'paw' ? Math.max(0, Math.sin(g * 2.2)) * 40 : 0;
  const run = o.gait === 'run' ? 1 : 0, bob = run ? Math.sin(ph * Math.PI * 4) * 4 : 0;
  const hdA = (o.head ?? 0) + (o.gait === 'paw' ? Math.sin(g * 1.7) * 6 : 0) + (run ? Math.sin(ph * Math.PI * 2) * 5 : 0);
  let out = '';
  out += leg(50, -92 + bob, legA(4, 0.5, 34), legA(14, 0.25, 20), true, 1);
  out += leg(-56, -96 + bob, legA(-6, 0, 30), legA(26, 0.5, 18), false, 1);
  // 尾巴
  const tw = wav(g, 1.8) * 10 + (run ? 18 : 0);
  out += `<path d="M-80,${f(-116 + bob)} Q${f(-112 - tw * 0.4)},${f(-96 + bob)} ${f(-108 - tw)},${f(-40 + bob - run * 30)}" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M-82,${f(-112 + bob)} Q${f(-104 - tw * 0.6)},${f(-80 + bob)} ${f(-96 - tw * 1.1)},${f(-30 + bob - run * 30)}" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>`;
  // 身子
  out += `<path d="M-90,${f(-104 + bob)} Q-92,${f(-140 + bob)} -54,${f(-142 + bob)} Q10,${f(-150 + bob)} 58,${f(-134 + bob)} Q92,${f(-124 + bob)} 90,${f(-94 + bob)} Q84,${f(-70 + bob)} 50,${f(-72 + bob)} Q0,${f(-66 + bob)} -54,${f(-76 + bob)} Q-90,${f(-80 + bob)} -90,${f(-104 + bob)} Z" fill="${c}"/>`;
  if (o.spots ?? true) { const r = rng(17); for (let i = 0; i < 22; i++) out += `<circle cx="${f(-70 + r() * 140)}" cy="${f(-128 + r() * 44 + bob)}" r="${f(2 + r() * 3)}" fill="#D9D4CC" opacity="${f(0.35 + r() * 0.35)}"/>`; }
  // 脖子、头
  out += `<g transform="translate(58,${f(-116 + bob)}) rotate(${f(hdA)})"><path d="M-30,4 Q-18,-58 22,-90 L58,-70 Q36,-34 30,18 Z" fill="${c}"/><path d="M18,-92 Q36,-112 58,-104 Q74,-94 92,-68 L120,-34 Q128,-22 118,-14 Q104,-8 90,-16 Q70,-30 50,-50 Q30,-64 18,-92 Z" fill="${c}"/><path d="M30,-104 l-4,-20 l12,14 M40,-106 l4,-19 l7,16" stroke="${c}" stroke-width="5" fill="${c}"/><ellipse cx="52" cy="-84" rx="5" ry="3.6" fill="#E9DFCB"/><circle cx="53" cy="-84" r="2.2" fill="#1E1A18"/><path d="M114,-22 q-6,3 -12,0" stroke="#5A504A" stroke-width="2" fill="none"/><path d="M110,-30 q-4,-2 -2,-6" stroke="#5A504A" stroke-width="2" fill="none"/>`;
  for (let i = 0; i < 9; i++) { const t = i / 8, mx = lerp(-24, 22, t), my = lerp(-4, -92, t); out += `<path d="M${f(mx)},${f(my)} q${f(-16 - wav(g, 1.5, t) * 6 - run * 10)},${f(4)} ${f(-24 - run * 12)},${f(14)}" stroke="#121010" stroke-width="6" stroke-linecap="round" fill="none"/>`; }
  out += `</g>`;
  out += leg(40, -94 + bob, legA(-2, 0, 32) + paw, legA(10, 0.75, 22) + paw * 1.6, true, 0);
  out += leg(-46, -98 + bob, legA(6, 0.5, 30), legA(22, 0, 18), false, 0);
  if (o.rider) out += `<g transform="translate(-6,${f(-128 + bob)})">${person({ x: 0, y: 70, who: o.rider, pose: o.riderPose ?? P.rideRun(ph), g, s: 1 })}</g>`;
  return `<g data-p="horse" transform="translate(${f(o.x)},${f(o.y)}) scale(${f(s * fc)},${f(s)})" opacity="${o.a ?? 1}">${out}</g>`;
};

// ---------------- 特写：侧脸（朝右） ----------------
export interface FaceOpts { x: number; y: number; s?: number; face?: 1 | -1; who: 'hanxin' | 'xiangyu' | 'yuji' | 'piaomu' | 'tuhu' | 'ben' | 'green' | 'liu' | 'you' | 'mia' | 'max' | 'tao' | 'hu' | 'gao' | 'zhou' | 'fang' | 'yu' | 'fang2' | 'yu2' | 'worker' | keyof typeof FACE_X; g?: number; open?: number; brow?: number; mouth?: number; tear?: number; look?: number; shake?: number; nod?: number; id: string }
/** 第二回起新增的特写脸：衣服颜色、头上戴什么、胡子（不画专门的五官，用同一副脸） */
const FACE_X = {
  chensheng: { col: '#6A4E3A', hair: 'kerchief', hc: '#A8322A', beard: 'stub' },
  liubang: { col: '#7A2A22', hair: 'tallcap', hc: GOLD, beard: 'long', bc: '#2A2420' },
  zhangliang: { col: '#6B7A6A', hair: 'scholar', hc: '#2B2722', beard: 'thin', bc: '#1E1A18' },
  fankuai: { col: '#4A3A30', hair: 'helmet', hc: '#3A3330', beard: 'full', bc: '#1E1A18' },
  xiaohe: { col: '#3E4A5A', hair: 'official', hc: '#1E1A18', beard: 'long', bc: '#4A4440' },
  fanzeng: { col: '#5A4A6A', hair: 'scholar', hc: '#4A4450', beard: 'long', bc: '#E6E0D4', old: true },
  hanxinKing: { col: '#6B2E28', hair: 'crown', hc: GOLD, beard: 'thin', bc: '#1E1A18' },
  lizuoche: { col: '#5A5A4A', hair: 'scholar', hc: '#3A3A30', beard: 'long', bc: '#4A4440' },
  zhonglimo: { col: '#3A3436', hair: 'helmet', hc: '#3A3330', beard: 'full', bc: '#1E1A18' },
  liuji: { col: '#7A6A52', hair: 'tallcap', hc: '#8A6A3A', beard: 'long', bc: '#2A2420' },
  xiangyuYoung: { col: '#4A4044', hair: 'scholar', hc: '#1E1A18' },
  qinshihuang: { col: '#1E1C22', hair: 'crown', hc: GOLD, beard: 'long', bc: '#1E1A18' },
  laofu: { col: '#7E7462', hair: 'kerchief', hc: '#E6E0D4', beard: 'long', bc: '#ECE6DA', old: true },
  zhangliangYoung: { col: '#8A9A88', hair: 'scholar', hc: '#1E1A18' },
  wuguang: { col: '#5A5040', hair: 'kerchief', hc: '#7A3A2E', beard: 'stub' },
  songyi: { col: '#4A5060', hair: 'scholar', hc: '#3A3A40', beard: 'long', bc: '#5A5450' },
} as const;
export const faceCU = (o: FaceOpts) => {
  const s = o.s ?? 1, fc = o.face ?? 1, g = o.g ?? 0, open = o.open ?? 1, brow = o.brow ?? 0, mo = o.mouth ?? 0;
  const X = (FACE_X as Record<string, { col: string; hair: string; hc: string; beard?: string; bc?: string; old?: boolean }>)[o.who];
  const tc = (TC_FACE as Record<string, boolean>)[o.who] ?? false, aged = o.who === 'gao' || o.who === 'zhou';
  const old = o.who === 'piaomu', fem = o.who === 'yuji' || old || o.who === 'green' || o.who === 'mia' || o.who === 'hu' || o.who === 'fang' || o.who === 'yu' || o.who === 'fang2' || o.who === 'yu2', ruff = o.who === 'tuhu' || o.who === 'liu' || o.who === 'chensheng' || o.who === 'fankuai', hero = o.who === 'xiangyu';
  const nose = fem ? 0.82 : 1, jaw = hero || ruff ? 1.1 : fem ? 0.9 : 1;
  const breathe = Math.sin(g * 1.4) * 2;
  let out = '';
  // 衣领、肩
  const col = ({ hanxin: '#6E7378', xiangyu: '#3A3436', yuji: '#D8C3B0', piaomu: '#8A7B66', tuhu: '#4A3F36', ben: '#C2552E', green: '#4E7A5A', liu: '#2E3B55', you: '#2F5DA8', mia: '#2F5DA8', max: '#5E6066', tao: '#2F5DA8', hu: '#7E4656', gao: '#3F4A44', zhou: '#8C6F4E', fang: '#29457E', yu: '#29457E', fang2: '#454B57', yu2: '#B4976F', worker: '#E0742E' } as Record<string, string>)[o.who] ?? X?.col ?? '#6E7378';
  out += `<path d="M-300,${f(420 + breathe)} Q-280,236 -60,${f(178 + breathe)} Q20,170 90,${f(182 + breathe)} Q290,226 320,${f(420 + breathe)} Z" fill="${col}" stroke="${INK}" stroke-opacity=".55" stroke-width="3"/>`;
  const modern = o.who === 'ben' || o.who === 'green' || o.who === 'liu' || o.who === 'you' || o.who === 'mia' || o.who === 'max' || tc;
  if (tc) out += tcCollar(o.who, breathe, g);
  if (o.who === 'ben') out += `<path d="M-150,${f(250 + breathe)} Q-120,150 -40,${f(150 + breathe)} Q-90,190 -96,${f(260 + breathe)} Z" fill="#A54726" stroke="${INK}" stroke-opacity=".5" stroke-width="3"/><path d="M40,200 l-6,90 M70,196 l8,92" stroke="#F0E6D8" stroke-width="5" stroke-linecap="round"/>`; // 卫衣的兜帽、抽绳
  if (o.who === 'you' || o.who === 'mia') out += `<path d="M10,182 L58,252 L98,184" stroke="#F4F4F0" stroke-width="10" fill="none"/><path d="M58,252 L58,420" stroke="#F4F4F0" stroke-width="4"/>`; // 校服的白领、拉链
  if (o.who === 'mia') out += `<path d="M-20,186 Q30,300 60,${f(330 + breathe)}" stroke="#1E2028" stroke-width="6" fill="none"/>`; // 相机背带
  if (o.who === 'max') out += `<path d="M-150,${f(250 + breathe)} Q-120,150 -40,${f(150 + breathe)} Q-90,190 -96,${f(260 + breathe)} Z" fill="#4E5056" stroke="${INK}" stroke-opacity=".5" stroke-width="3"/><path d="M40,200 l-6,90 M70,196 l8,92" stroke="#E9E4DA" stroke-width="5" stroke-linecap="round"/>`; // 卫衣的兜帽
  if (o.who === 'green') out += `<path d="M14,182 L56,236 L96,184 L84,178 L56,214 L28,176 Z" fill="#F4F1E8" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M-20,190 Q40,330 60,${f(330 + breathe)} M150,200 Q90,320 70,${f(330 + breathe)}" stroke="#C23B2E" stroke-width="5" fill="none"/>`; // 衬衫领、工作牌的挂绳
  if (o.who === 'liu') out += `<path d="M-200,${f(250 + breathe)} l90,-40 l10,24 l-90,40 z M150,${f(214 + breathe)} l90,30 l-8,26 l-90,-30 z" fill="#1A2236"/><path d="M20,182 L58,240 L96,184" stroke="#DDE3EC" stroke-width="5" fill="none"/>`; // 制服的肩章、领子
  if (modern) { /* 现代的领口已画 */ } else if (hero) out += `<path d="M-160,${f(320 + breathe)} Q-110,220 -20,200 M-140,300 Q-80,240 0,232 M100,300 Q120,250 170,320" stroke="#8A7E6A" stroke-width="5" fill="none"/>`;
  else out += `<path d="M20,182 L60,250 L95,186" stroke="${o.who === 'yuji' ? RED : '#E9DFCB'}" stroke-width="5" fill="none" opacity=".8"/>`;
  // 脖子、后脑的头发（长发）
  if (o.who === 'yuji') out += `<path d="M-60,-40 Q-140,80 -110,${f(260 + wav(g, 3) * 6)} L-60,250 Q-80,100 -40,0 Z" fill="#1E1A18"/>`;
  out += `<path d="M-62,70 Q-64,140 -78,196 L84,196 Q56,150 48,112 Z" fill="url(#${o.id}skin)" stroke="${INK}" stroke-opacity=".5" stroke-width="2.5"/>`;
  if (o.who === 'yu2') { // 围巾绕在脖子外面
    const sw = wav(g, 2.6) * 4; out += `<path d="M-96,${f(170 + breathe)} Q10,${f(230 + breathe)} 120,${f(166 + breathe)} L126,${f(210 + breathe)} Q10,${f(276 + breathe)} -100,${f(210 + breathe)} Z" fill="#A8455A" stroke="${INK}" stroke-opacity=".45" stroke-width="2.5"/><path d="M70,${f(228 + breathe)} Q${f(90 + sw)},310 ${f(76 + sw)},420 L${f(118 + sw)},420 Q${f(124 + sw)},300 104,${f(220 + breathe)} Z" fill="#94394C" stroke="${INK}" stroke-opacity=".4" stroke-width="2.5"/><path d="M-80,${f(190 + breathe)} Q10,${f(246 + breathe)} 116,${f(186 + breathe)}" stroke="#F4EDE2" stroke-opacity=".35" stroke-width="4" stroke-dasharray="8 10" fill="none"/>`;
  }
  // 脸的轮廓（侧面）
  const face = `M40,-140 Q-40,-170 -92,-70 Q-112,10 -76,80 Q-50,124 0,${f(126 * jaw)} Q${f(60 * jaw)},${f(122 * jaw)} ${f(84 * jaw)},${f(100 * jaw)} Q${f(96)},${f(84)} 92,72 Q100,68 94,62 Q100,56 96,50 Q${f(90 + 4 * nose)},${f(44)} ${f(92 + 16 * nose)},${f(24)} Q${f(96 + 12 * nose)},${f(14)} 86,-14 Q84,-30 90,-46 Q86,-100 40,-140 Z`;
  out += `<path d="${face}" fill="url(#${o.id}skin)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  if (old || X?.old || aged) out += `<path d="M44,-6 q10,14 2,30 M58,-34 q12,-6 22,0 M60,44 q-10,16 2,34 M30,96 q20,6 40,-6" stroke="${INK}" stroke-opacity=".35" stroke-width="2" fill="none"/>`;
  if (o.who === 'hanxin') out += `<path d="M60,92 q-20,10 -44,4" stroke="${INK}" stroke-opacity=".18" stroke-width="2" fill="none"/>`; // 消瘦：面颊凹下去一点
  if (ruff || hero) out += `<path d="M10,110 Q60,116 86,96 Q60,104 20,100" fill="${INK}" opacity=".18"/>`; // 胡茬
  // 耳朵
  out += `<path d="M-30,-20 Q-50,-24 -48,4 Q-46,30 -26,28" fill="url(#${o.id}skin)" stroke="${INK}" stroke-width="2.5"/>`;
  // 眼睛：open 0—1（眯起来就小）
  const ey = -22, eh = 9 * open;
  out += `<path d="M38,${ey} Q56,${f(ey - eh - 2)} 74,${ey - 1} Q56,${f(ey + eh * 0.6 + 2)} 38,${ey} Z" fill="#F7F2E6" stroke="${INK}" stroke-width="2.5"/>`;
  if (open > 0.12) out += `<circle cx="${f(62 + (o.look ?? 0) * 4)}" cy="${f(ey - 1)}" r="${f(Math.min(6, 2 + 5 * open))}" fill="#1E1A18"/>`;
  out += `<path d="M36,${f(ey - eh - 4)} Q56,${f(ey - eh - 9)} 76,${f(ey - eh - 4)}" stroke="${INK}" stroke-width="2.4" fill="none" opacity=".7"/>`;
  // 眉：brow −1（怒、皱）到 1（愁）
  out += `<path d="M30,${f(-50 - 4 * brow)} Q52,${f(-60 + 2 * brow)} ${f(80)},${f(-50 + 10 * brow)}" stroke="${aged ? '#9A948A' : '#1E1A18'}" stroke-width="${hero || ruff ? 9 : fem ? 4 : 6}" stroke-linecap="round" fill="none"/>`;
  // 嘴：mouth −1（下撇）到 1（笑），0.5 张开唱
  const mY = 62;
  if (o.mouth !== undefined && o.mouth > 0.4 && o.mouth < 0.7) out += `<path d="M94,${mY - 4} Q80,${mY + 14} 70,${mY} Z" fill="#5A2A22"/>`;
  else out += `<path d="M94,${mY} Q82,${f(mY - 6 * mo)} 68,${f(mY + 4 * mo)}" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  // 泪
  if ((o.tear ?? 0) > 0) { const ty = lerp(-10, 110, o.tear!); out += `<path d="M52,-8 Q48,${f(ty * 0.6)} 46,${f(ty)}" stroke="#BFD4E2" stroke-width="3" fill="none" opacity=".8"/><path d="M46,${f(ty - 8)} q-6,10 0,14 q6,-4 0,-14 z" fill="#CFE0EC" stroke="#8FAABC" stroke-width="1.2"/>`; }
  // 头发 / 头盔 / 头巾
  if (o.who === 'hanxin') out += `<path d="M44,-136 Q-30,-176 -96,-80 Q-110,-10 -84,40 Q-70,-20 -40,-40 Q-10,-70 30,-80 Q60,-96 70,-112 Z" fill="#1E1A18"/><ellipse cx="-30" cy="-160" rx="38" ry="28" fill="#1E1A18"/><rect x="-60" y="-150" width="50" height="10" fill="#D9CFBD" transform="rotate(-12 -35 -145)"/><path d="M60,-110 q14,30 4,60 M44,-112 q4,26 -6,46" stroke="#1E1A18" stroke-width="3" fill="none"/>`;
  if (hero) out += `<path d="M90,-60 Q96,-150 20,-176 Q-80,-190 -112,-80 Q-124,-10 -100,60 L-70,80 Q-84,0 -60,-50 Q-20,-80 50,-74 Z" fill="#3A3330" stroke="#8A7E6A" stroke-width="4"/><path d="M96,-62 L-112,-80" stroke="#8A7E6A" stroke-width="8"/><path d="M-10,-182 l0,-26" stroke="#8A7E6A" stroke-width="7"/><path d="M-10,-206 q${f(-40 + wav(g, 1.3) * 10)},-26 ${f(-90 + wav(g, 1.3) * 16)},${f(10)}" stroke="${RED}" stroke-width="18" stroke-linecap="round" fill="none"/>`;
  if (o.who === 'yuji') out += `<path d="M44,-136 Q-30,-176 -96,-80 Q-110,-10 -90,40 Q-74,-30 -40,-50 Q0,-74 40,-84 Q70,-92 76,-108 Z" fill="#1E1A18"/><ellipse cx="-50" cy="-150" rx="48" ry="34" fill="#1E1A18"/><path d="M-110,-170 L10,-150" stroke="${GOLD}" stroke-width="5"/><circle cx="12" cy="-150" r="8" fill="${RED}"/><path d="M-30,40 l0,${f(30 + wav(g, 2) * 4)}" stroke="${GOLD}" stroke-width="2"/><circle cx="-30" cy="${f(74 + wav(g, 2) * 4)}" r="6" fill="#7FB3A3"/>`;
  if (old) out += `<path d="M86,-50 Q90,-150 10,-170 Q-90,-180 -118,-70 Q-128,20 -100,90 Q-80,40 -70,-20 Q-40,-70 40,-80 Q76,-80 86,-50 Z" fill="#D9D2C4" stroke="${INK}" stroke-opacity=".5" stroke-width="2.5"/><path d="M-100,60 q-30,30 -30,70 q20,-20 40,-40" fill="#D9D2C4" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M60,-84 q20,10 26,30" stroke="#9A9288" stroke-width="3" fill="none"/>`;
  if (ruff) out += `<path d="M60,-110 Q-30,-180 -100,-80 Q-112,-10 -90,40 Q-80,-10 -60,-40 l20,4 l-6,-16 l24,6 l-4,-18 l26,10 l2,-16 l20,10 Z" fill="#1E1A18"/><path d="M-100,-60 L80,-84" stroke="#8A3A2A" stroke-width="10"/>`;
  if (o.who === 'mia') out += `<path d="M-92,-96 Q-170,-60 -150,${f(90 + wav(g, 2) * 6)} Q-120,10 -86,-40 Z" fill="#2A1E18"/><circle cx="-96" cy="-92" r="10" fill="#C23B2E"/><path d="M44,-136 Q-30,-178 -98,-84 Q-112,-14 -88,36 Q-76,-20 -46,-46 Q-6,-70 40,-74 Q62,-80 72,-96 Q86,-60 92,-44 Q98,-90 70,-124 Z" fill="#2A1E18"/><path d="M60,-120 q20,20 22,60" stroke="#2A1E18" stroke-width="10" fill="none"/>`;
  if (o.who === 'max') out += `<path d="M44,-136 Q-30,-178 -98,-84 Q-112,-14 -88,36 Q-76,-20 -46,-46 Q-6,-70 40,-74 Q62,-80 72,-96 Q86,-60 92,-44 Q98,-90 70,-124 Z" fill="#1E1A18"/>` + [[-70, -130], [-36, -158], [0, -168], [36, -158]].map(([x, y], i) => `<path d="M${x},${y} l${-10 + i * 5},-24 l${20 - i * 2},14 Z" fill="#1E1A18"/>`).join('');
  if (o.who === 'you') out += `<path d="M44,-136 Q-30,-178 -98,-84 Q-112,-14 -88,36 Q-76,-20 -46,-46 Q-6,-70 40,-74 Q62,-80 72,-96 Q86,-60 92,-44 Q98,-90 70,-124 Z" fill="#1E1A18"/>`;
  if (o.who === 'ben') out += `<path d="M44,-136 Q-30,-178 -98,-84 Q-112,-14 -88,36 Q-76,-20 -46,-46 Q-6,-70 40,-74 Q62,-80 74,-92 Q90,-60 96,-40 Q102,-96 70,-128 Z" fill="#D8B266"/>` + [[-80, -120], [-50, -150], [-14, -164], [24, -160], [56, -142]].map(([x, y], i) => `<path d="M${x},${y} l${-14 + i * 6},-30 l${24 - i * 3},18 Z" fill="#D8B266"/>`).join('') + `<path d="M-40,-120 q30,-20 60,-4 M-60,-90 q30,-14 54,0" stroke="#B08A44" stroke-width="3" fill="none"/>`;
  if (o.who === 'green') out += `<path d="M86,-50 Q92,-150 10,-170 Q-90,-180 -118,-70 Q-130,30 -108,104 L-58,106 Q-82,20 -64,-30 Q-30,-76 50,-82 Q78,-82 86,-50 Z" fill="#6B4A32"/><path d="M84,-56 Q96,-30 88,-6" stroke="#6B4A32" stroke-width="10" fill="none"/><circle cx="58" cy="-22" r="26" fill="#E8F2F6" fill-opacity=".25" stroke="#2B2722" stroke-width="5"/><path d="M32,-26 L-32,-30" stroke="#2B2722" stroke-width="4"/>`;
  if (o.who === 'liu') out += `<path d="M-40,-60 Q-80,-50 -92,10 Q-90,30 -78,40 Q-70,-10 -40,-30 Z" fill="#8E8A84"/><path d="M-118,-70 Q-108,-176 0,-182 Q96,-176 104,-78 Z" fill="#26324A" stroke="${INK}" stroke-width="3"/><path d="M96,-80 Q156,-80 176,-60 Q132,-52 92,-64 Z" fill="#1A2236" stroke="${INK}" stroke-width="2"/><path d="M-116,-74 L102,-80" stroke="#1A2236" stroke-width="9"/><circle cx="10" cy="-132" r="16" fill="${GOLD}" stroke="#7A5A1E" stroke-width="3"/>`;
  if (tc) out += tcHair(o.who, g);
  if (X) {
    // 头发：后脑一片，再按戴的东西加
    out += `<path d="M44,-136 Q-30,-176 -96,-80 Q-110,-10 -84,40 Q-70,-20 -40,-40 Q-10,-70 30,-80 Q60,-96 70,-112 Z" fill="${X.old ? '#BDB6AA' : '#1E1A18'}"/>`;
    if (X.hair === 'kerchief') out += `<path d="M-114,-60 Q-104,-172 0,-178 Q78,-174 84,-98 Q40,-112 -20,-104 Q-84,-96 -114,-60 Z" fill="${X.hc}" stroke="${INK}" stroke-opacity=".5" stroke-width="3"/><path d="M-104,-96 q${f(-22 + wav(g, 1.6) * 6)},40 ${f(-26 + wav(g, 1.6) * 8)},110 l16,2 q2,-60 22,-104 z M-96,-92 q${f(-8 + wav(g, 1.8) * 5)},44 ${f(-4 + wav(g, 1.8) * 6)},96 l14,-2 q-4,-50 4,-92 z" fill="${X.hc}" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>`;
    if (X.hair === 'crown') out += `<ellipse cx="-22" cy="-160" rx="30" ry="22" fill="#1E1A18"/><path d="M-50,-154 Q-22,-178 6,-154" stroke="${X.hc}" stroke-width="9" fill="none"/><path d="M-72,-166 L30,-172" stroke="${X.hc}" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="-172" r="6" fill="${X.hc}"/>`;
    if (X.hair === 'tallcap') out += `<path d="M-100,-92 Q-96,-174 -10,-180 Q70,-176 80,-106 Z" fill="#1E1A18"/><path d="M-62,-170 L-54,-238 L34,-242 L46,-172 Z" fill="#1E1A18"/><path d="M-62,-176 L44,-178" stroke="${X.hc}" stroke-width="6"/><path d="M-100,-96 L80,-108" stroke="${X.hc}" stroke-width="4" opacity=".8"/><path d="M-90,-110 Q-110,-20 -70,60" stroke="#1E1A18" stroke-width="3" fill="none"/>`;
    if (X.hair === 'scholar') out += `<path d="M-104,-88 Q-98,-182 0,-186 Q88,-178 92,-98 Q30,-112 -30,-106 Z" fill="${X.hc}"/><path d="M-96,-120 q-40,${f(30 + wav(g, 2) * 8)} -50,80 M-86,-110 q-30,${f(40 + wav(g, 2.2) * 8)} -26,92" stroke="${X.hc}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    if (X.hair === 'official') out += `<path d="M-102,-92 Q-94,-172 8,-178 Q82,-172 94,-100 Z" fill="${X.hc}"/><path d="M-30,-174 L46,-214 L72,-172 Z" fill="${X.hc}"/><path d="M-102,-92 L94,-100" stroke="#5A5048" stroke-width="6"/>`;
    if (X.hair === 'helmet') out += `<path d="M90,-60 Q96,-150 20,-176 Q-80,-190 -112,-80 Q-124,-10 -100,60 L-70,80 Q-84,0 -60,-50 Q-20,-80 50,-74 Z" fill="${X.hc}" stroke="#8A7E6A" stroke-width="4"/><path d="M96,-62 L-112,-80" stroke="#8A7E6A" stroke-width="8"/><path d="M-10,-182 l0,-26" stroke="#8A7E6A" stroke-width="7"/>`;
    const bc = X.bc ?? '#1E1A18';
    if (X.beard === 'long') out += `<path d="M28,96 Q36,${f(160 + wav(g, 3) * 3)} 72,${f(236 + wav(g, 3) * 4)} Q92,160 106,88 Q80,108 28,96 Z" fill="${bc}" stroke="${INK}" stroke-opacity=".3" stroke-width="2"/><path d="M66,48 q16,6 30,-4" stroke="${bc}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    if (X.beard === 'full') out += `<path d="M-24,70 Q-6,196 72,${f(206 + wav(g, 3) * 3)} Q116,164 106,66 Q84,100 44,104 Q8,104 -24,70 Z" fill="${bc}"/><path d="M62,46 q18,8 34,-4" stroke="${bc}" stroke-width="9" stroke-linecap="round" fill="none"/>`;
    if (X.beard === 'thin') out += `<path d="M62,108 q8,${f(40 + wav(g, 3) * 2)} 22,64 q8,-36 12,-68 z" fill="${bc}"/><path d="M70,48 q12,4 24,-2" stroke="${bc}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  }
  const shake = (o.shake ?? 0) * Math.sin(g * 14) * 6, nod = (o.nod ?? 0) * 8;
  return `<g data-p="face" transform="translate(${f(o.x + shake)},${f(o.y + nod)}) scale(${f(s * fc)},${f(s)})">${out}</g>`;
};

// ---------------- 时间胶囊的人：特写脸的衣领和头发 ----------------
const TC_FACE = { tao: true, hu: true, gao: true, zhou: true, fang: true, yu: true, fang2: true, yu2: true, worker: true };
/** 衣领（画在脖子前面那片衣服上） */
const tcCollar = (who: string, br: number, g: number) => {
  const B = (y: number) => f(y + br);
  switch (who) {
    case 'tao': return `<path d="M10,182 L58,252 L98,184" stroke="#F4F4F0" stroke-width="10" fill="none"/><path d="M58,252 L58,420" stroke="#F4F4F0" stroke-width="4"/>`; // 今天的校服：白领、拉链
    case 'fang': case 'yu': return `<path d="M-288,${B(318)} Q-200,${B(250)} -60,${B(232)} Q40,${B(226)} 120,${B(232)} Q262,${B(250)} 318,${B(318)} L320,${B(352)} Q262,${B(284)} 120,${B(266)} Q40,${B(260)} -60,${B(266)} Q-200,${B(286)} -290,${B(352)} Z" fill="#F2EFE4" stroke="${INK}" stroke-opacity=".3" stroke-width="2"/><path d="M4,182 Q30,214 58,226 Q84,214 104,184 L118,196 Q88,236 58,246 Q24,236 -8,194 Z" fill="#F2EFE4" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>`; // 1996 年的运动服：肩上一道宽白条、白翻领
    case 'hu': return `<path d="M8,180 L56,262 L104,182 Z" fill="#F1ECE2"/><path d="M8,180 L56,262 M104,182 L56,262" stroke="#683946" stroke-width="8"/><path d="M-20,190 Q40,330 60,${B(330)} M150,200 Q90,320 70,${B(330)}" stroke="#2F6DB0" stroke-width="5" fill="none"/>`; // 开衫 V 领 + 衬衫、工作牌挂绳
    case 'gao': return `<path d="M-10,186 L56,330 L122,188" stroke="#2C3530" stroke-width="12" fill="#E9E4D6"/><path d="M14,182 L56,236 L96,184 L84,178 L56,214 L28,176 Z" fill="#F4F1E8" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M50,232 L62,232 L66,320 L56,336 L46,320 Z" fill="#7A3A30"/>`; // 马甲 + 白衬衫 + 领带
    case 'zhou': return `<path d="M0,182 L56,300 L114,184 Z" fill="#E6DFCF"/><path d="M0,182 L56,300 M114,184 L56,300" stroke="#6E5536" stroke-width="10"/><path d="M20,182 L56,226 L92,184" stroke="#D2C8B2" stroke-width="5" fill="none"/><circle cx="56" cy="${B(340)}" r="7" fill="#5A4430"/><circle cx="56" cy="${B(396)}" r="7" fill="#5A4430"/>`; // 驼色开衫、衬衫领、扣子
    case 'fang2': return `<path d="M14,182 L56,262 L98,184 Z" fill="#F4F1EA"/><path d="M-6,184 L14,180 L56,262 L40,330 Z" fill="#3A3F4A" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/><path d="M98,182 L126,190 L74,330 L56,262 Z" fill="#3A3F4A" stroke="${INK}" stroke-opacity=".4" stroke-width="2"/>`; // 外套翻领 + 白衬衫
    case 'yu2': return `<path d="M14,182 L56,250 L98,184 Z" fill="#EDE6DA"/>`;
    case 'worker': return `<path d="M-292,${B(334)} Q0,${B(282)} 322,${B(334)} L322,${B(362)} Q0,${B(310)} -292,${B(362)} Z" fill="#E9EBE2" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/><path d="M14,180 L56,236 L98,182" stroke="#C7652A" stroke-width="12" fill="none"/>`; // 工装：反光条
  }
  return '';
};
/** 头发（画在脸上面） */
const tcHair = (who: string, g: number) => {
  const cap = (c: string) => `<path d="M44,-136 Q-30,-178 -98,-84 Q-112,-14 -88,36 Q-76,-20 -46,-46 Q-6,-70 40,-74 Q62,-80 72,-96 Q86,-60 92,-44 Q98,-90 70,-124 Z" fill="${c}"/>`;
  switch (who) {
    case 'tao': return cap('#231C18') + [[54, -126, 18, -148, 40, -168], [26, -144, -16, -152, -4, -176], [-4, -150, -46, -138, -44, -168], [-34, -142, -72, -114, -84, -146], [-62, -124, -96, -84, -112, -108]].map((t) => `<path d="M${t[0]},${t[1]} L${t[4]},${t[5]} L${t[2]},${t[3]} Z" fill="#231C18"/>`).join('') + `<path d="M58,-128 Q96,-112 92,-62 Q80,-84 56,-92 Z" fill="#231C18"/><path d="M-30,-140 q20,-6 40,4 M-60,-118 q16,-8 34,-4" stroke="#4A3E36" stroke-width="3" fill="none"/>`; // 有点乱的短发，一绺搭在额前
    case 'hu': return `<path d="M86,-50 Q92,-150 10,-170 Q-90,-180 -120,-70 Q-136,40 -118,150 Q-92,170 -60,152 Q-82,40 -64,-30 Q-30,-76 50,-82 Q78,-82 86,-50 Z" fill="#231A16"/><path d="M84,-56 Q98,-30 88,-4" stroke="#231A16" stroke-width="11" fill="none"/><path d="M-14,-160 q24,22 70,30" stroke="#4A3A32" stroke-width="3" fill="none"/><path d="M-112,100 q10,20 32,22" stroke="#4A3A32" stroke-width="3" fill="none"/>`; // 齐肩发、侧分
    case 'gao': return `<path d="M24,-142 Q-34,-178 -98,-84 Q-112,-14 -88,36 Q-76,-20 -46,-46 Q-14,-72 16,-96 Q36,-118 40,-136 Z" fill="#C9C5BC" stroke="#9A958C" stroke-width="2"/><path d="M-40,-150 q30,-8 60,4 M-70,-120 q30,-16 70,-12" stroke="#E6E2DA" stroke-width="4" fill="none"/><circle cx="58" cy="-22" r="26" fill="#E8F2F6" fill-opacity=".25" stroke="#2B2722" stroke-width="5"/><path d="M32,-26 L-32,-30" stroke="#2B2722" stroke-width="4"/>`; // 花白短发、发际线后移，眼镜
    case 'zhou': return `<path d="M-30,-110 Q-86,-104 -104,-54 Q-114,0 -96,42 Q-86,8 -78,-20 Q-64,-64 -24,-92 Z" fill="#EEEBE4" stroke="#B8B2A8" stroke-width="2"/><path d="M-58,-126 q40,-22 92,-10 M-78,-104 q36,-22 84,-20 M-40,-136 q30,-10 60,-2" stroke="#E6E2DA" stroke-width="3" fill="none" opacity=".9"/><path d="M30,-62 q22,-8 48,0" stroke="#D8D4CC" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M84,-34 l16,-6 M84,-22 l16,2 M84,-12 l12,8" stroke="${INK}" stroke-opacity=".3" stroke-width="2"/><path d="M66,40 q10,22 30,24" stroke="${INK}" stroke-opacity=".25" stroke-width="2.5" fill="none"/>`; // 头顶稀，耳后一圈白发；眼角的笑纹
    case 'fang': return `<path d="M60,-132 Q10,-178 -60,-160 Q-120,-130 -118,-40 Q-118,30 -104,74 Q-94,86 -80,80 Q-70,72 -72,62 Q-84,0 -68,-36 Q-40,-72 20,-84 Z" fill="#1E1814"/><path d="M40,-146 Q94,-132 98,-62 L86,-70 L80,-58 L70,-70 L60,-60 L52,-74 L40,-66 Q32,-90 18,-84 Q-6,-80 -30,-60 Q-6,-112 40,-146 Z" fill="#1E1814"/><path d="M-20,-150 q40,-6 76,20" stroke="#3A2E28" stroke-width="3" fill="none"/>`; // 齐耳短发、刘海
    case 'yu': { const sw = wav(g, 2.2) * 5; let b = cap('#1E1814') + `<path d="M-20,-146 q30,4 70,22" stroke="#3A2E28" stroke-width="3" fill="none"/>`; for (let i = 0; i < 9; i++) { const t = i / 8, bx = -74 - 18 * t + sw * t, by = 10 + i * 26; b += `<ellipse cx="${f(bx)}" cy="${f(by)}" rx="17" ry="20" fill="#1E1814" stroke="#3A2E28" stroke-width="2" transform="rotate(${f(-20 + (i % 2) * 40)} ${f(bx)} ${f(by)})"/>`; } return b + `<path d="M${f(-104 + sw)},236 l26,4" stroke="#C23B2E" stroke-width="9" stroke-linecap="round"/>`; } // 辫子垂在肩上，扎红头绳
    case 'fang2': return `<path d="M64,-128 Q10,-178 -66,-158 Q-122,-122 -116,-40 Q-114,10 -96,40 Q-86,48 -76,40 Q-84,0 -70,-30 Q-50,-60 -10,-76 Z" fill="#1E1814"/><path d="M64,-130 Q102,-106 94,-54 Q76,-88 34,-96 Q2,-92 -34,-58 Q-14,-104 64,-130 Z" fill="#1E1814"/><path d="M50,-118 q-40,-6 -76,30" stroke="#4A3E38" stroke-width="3" fill="none"/><circle cx="-34" cy="34" r="5" fill="${GOLD}"/>`; // 利落的短发（侧分、露耳朵），小耳钉
    case 'yu2': { const sw = wav(g, 2.4) * 5; return `<path d="M-90,10 Q${f(-130 + sw)},70 ${f(-118 + sw)},180 Q-98,200 -84,170 Q-92,90 -70,30 Z" fill="#2A1F1A"/>` + cap('#2A1F1A') + `<path d="M-58,-134 q50,-30 108,-8 M-84,-96 q40,-34 104,-36 M-96,-60 q30,-24 70,-30" stroke="#CFC9C0" stroke-width="3" fill="none" opacity=".9"/><path d="M-96,14 l24,8" stroke="#8A6A5A" stroke-width="8" stroke-linecap="round"/>`; } // 低马尾，几丝白发
    case 'worker': return `<path d="M-104,-50 Q-110,0 -92,30 Q-84,-10 -70,-40 Z" fill="#2A221C"/><path d="M-120,-58 Q-116,-196 0,-202 Q104,-198 102,-72 Z" fill="#F2C230" stroke="${INK}" stroke-width="3"/><path d="M-132,-56 L150,-76 Q162,-64 150,-56 L-130,-42 Z" fill="#D9A520" stroke="${INK}" stroke-width="2.5"/><path d="M-12,-200 Q-22,-130 -14,-64" stroke="#D9A520" stroke-width="10" fill="none"/><path d="M10,110 Q60,116 86,96 Q60,104 20,100" fill="${INK}" opacity=".18"/>`; // 黄色安全帽，胡茬
  }
  return '';
};

/** 特写：握剑柄的手（grip 0 松 — 1 紧） */
export const swordHand = (x: number, y: number, s = 1, grip = 0, g = 0) => {
  const sh = grip > 0.6 ? Math.sin(g * 30) * 1.5 * (grip - 0.6) * 4 : 0;
  let o = `<g transform="translate(${f(x + sh)},${f(y)}) scale(${f(s)})">`;
  o += `<path d="M-420,40 L-60,10 L-60,-14 L-420,-40 Z" fill="#3A2A1E"/><path d="M-420,40 L-60,10 M-420,-40 L-60,-14" stroke="#1E1A18" stroke-width="3"/>`; // 剑鞘
  o += `<rect x="-70" y="-46" width="20" height="92" rx="5" fill="${GOLD}" stroke="#7A5A1E" stroke-width="3"/>`; // 护手
  o += `<rect x="-50" y="-18" width="250" height="36" rx="10" fill="#4A3A2C"/>`;
  for (let i = 0; i < 9; i++) o += `<path d="M${-40 + i * 26},-18 l14,36" stroke="#2E2420" stroke-width="5"/>`;
  o += `<circle cx="210" cy="0" r="22" fill="${GOLD}" stroke="#7A5A1E" stroke-width="3"/>`;
  // 袖子
  o += `<path d="M120,260 Q60,150 30,80 L170,60 Q200,150 260,240 Z" fill="#6E7378" stroke="${INK}" stroke-width="3"/>`;
  // 手：手背 + 四个指节（越握越紧，指节越白）
  const k = grip;
  o += `<path d="M20,70 Q0,${f(30 - 10 * k)} 10,${f(-30 + 6 * k)} Q40,${f(-50 + 8 * k)} 150,${f(-44 + 8 * k)} Q186,${f(-30 + 6 * k)} 180,20 Q170,70 120,90 Z" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>`;
  for (let i = 0; i < 4; i++) { const fx = 30 + i * 36; o += `<path d="M${fx},${f(-34 + 8 * k)} Q${fx + 4},${f(16 - 4 * k)} ${fx + 24},${f(26 - 2 * k)}" stroke="${INK}" stroke-width="2.5" fill="none" opacity=".7"/><ellipse cx="${fx + 14}" cy="${f(-36 + 8 * k)}" rx="12" ry="7" fill="#fff" opacity="${f(0.15 + 0.55 * k)}"/>`; }
  o += `<path d="M10,0 Q-14,30 6,70" stroke="${INK}" stroke-width="2.5" fill="none" opacity=".6"/>`;
  return o + '</g>';
};
