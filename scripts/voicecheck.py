# 配音核对：停顿在哪里、语音合成怎么分词、多音字实际读成了什么。
#   ~/Desktop/高中物化/.venv/bin/python scripts/voicecheck.py            # 全部句子
#   ~/Desktop/高中物化/.venv/bin/python scripts/voicecheck.py 12 30      # 只看第 12、30 句（build/voice-lines.json 里的序号）
# 停顿：用逐词时间点（build/voice-marks/）算词与词之间的空白，≥ 80 毫秒的在文字里标成 ‖（后面是毫秒数）。
# 读音：借用 高中物化/tools/polycheck.py——把多音字换成各个读音的单音同音字重新合成，和原配音逐帧比对，最像的就是实际读音。
import asyncio, json, os, sys
HOME = os.path.expanduser('~/Desktop/高中物化/tools')
sys.path.insert(0, HOME)
import polycheck as pc
from pypinyin import pinyin, Style

pc.COMMON.update({'食': 'shi2 si4', '王': 'wang2 wang4', '中': 'zhong1 zhong4', '见': 'jian4 xian4', '将': 'jiang1 jiang4', '父': 'fu4 fu3', '少': 'shao3 shao4'})
RISKY = pc.RISKY | set('食王中见将父少和着重数处称转当还长好为只冲')
SKIP = set('了的地得')

lines = json.load(open('build/voice-lines.json', encoding='utf-8'))
pick = [int(a) for a in sys.argv[1:]]

def spans(text, marks):
    pos, out = 0, []
    for m in marks:
        k = text.find(m['t'], pos) if m['t'] else -1
        if k < 0: out.append(None); continue
        out.append((k, k + len(m['t']))); pos = k + len(m['t'])
    return out

async def main():
    pc.SEM = asyncio.Semaphore(6)
    for n, x in enumerate(lines):
        if pick and n not in pick: continue
        mp = os.path.join('public/voice', x['file'])
        mk = json.load(open(os.path.join('build/voice-marks', x['file'].replace('.mp3', '.json')), encoding='utf-8'))
        text, marks = mk['text'], mk['marks']
        sp = spans(text, marks)
        # 停顿
        ins = {}
        for i in range(len(marks) - 1):
            gap = marks[i + 1]['o'] - (marks[i]['o'] + marks[i]['d'])
            if gap >= 0.08 and sp[i]: ins[sp[i][1]] = int(gap * 1000)
        shown = ''.join(ch + (f'‖{ins[i + 1]}' if i + 1 in ins else '') for i, ch in enumerate(text))
        seg = '/'.join(m['t'] for m in marks)
        print(f'\n#{n:02d} {shown}\n    分词：{seg}', flush=True)
        # 读音
        guess = [p[0] for p in pinyin(text, style=Style.TONE3, neutral_tone_with_five=True, errors=lambda s: list(s))]
        jobs = [i for i, ch in enumerate(text) if ch in RISKY and ch not in SKIP]
        async def run(i):
            async with pc.SEM: return await pc.check_one(text, x['voice'], x['rate'], i, mp, marks)
        res = await asyncio.gather(*[run(i) for i in jobs])
        for i, r in zip(jobs, res):
            if not r or len(r) < 2: continue
            best, gap = r[0], r[1][0] - r[0][0]
            g = guess[i] if i < len(guess) else '?'
            flag = '' if best[1] == g else '   ← 和字典不同'
            print(f'    {text[i]}「{text[max(0, i - 4):i + 5]}」读 {best[1]}（像“{best[2]}”，领先 {gap:.3f}）字典 {g}{flag}', flush=True)

asyncio.run(main())
