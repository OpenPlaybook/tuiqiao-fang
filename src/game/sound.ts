// 用 WebAudio 现场合成的小音效，不需要任何音频文件。默认关闭（机房里几十台电脑一起响会很吵），学生可以自己打开。
let ctx: AudioContext | null = null;
const LS = 'jd-sound';
export let soundOn = (() => { try { return localStorage.getItem(LS) === '1'; } catch { return false; } })();
export const setSound = (v: boolean) => { soundOn = v; try { localStorage.setItem(LS, v ? '1' : '0'); } catch { /* */ } if (v) sfx('star'); };

const tone = (f: number, t0: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, f2?: number) => {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, ctx.currentTime + t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, ctx.currentTime + t0 + dur);
  g.gain.setValueAtTime(0, ctx.currentTime + t0);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + t0);
  o.stop(ctx.currentTime + t0 + dur + 0.05);
};

export type Sfx = 'star' | 'ok' | 'no' | 'click' | 'hint' | 'combo' | 'badge' | 'win' | 'flip' | 'stamp';
export const sfx = (k: Sfx) => {
  if (!soundOn) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { return; }
  switch (k) {
    case 'star': tone(1320, 0, 0.12, 'triangle', 0.1); tone(1760, 0.07, 0.18, 'triangle', 0.09); break;
    case 'ok': tone(660, 0, 0.12, 'sine', 0.12); tone(880, 0.09, 0.2, 'sine', 0.12); break;
    case 'no': tone(220, 0, 0.22, 'square', 0.05, 160); break;
    case 'click': tone(900, 0, 0.04, 'triangle', 0.06); break;
    case 'hint': tone(520, 0, 0.1, 'sine', 0.1); tone(780, 0.08, 0.16, 'sine', 0.08); break;
    case 'combo': [660, 830, 990, 1320].forEach((f, i) => tone(f, i * 0.06, 0.16, 'triangle', 0.09)); break;
    case 'badge': [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.3, 'sine', 0.1)); break;
    case 'win': [523, 659, 784, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.11, 0.28, 'triangle', 0.1)); break;
    case 'flip': tone(400, 0, 0.08, 'triangle', 0.06, 700); break;
    case 'stamp': tone(140, 0, 0.12, 'square', 0.08, 70); break;
  }
};
