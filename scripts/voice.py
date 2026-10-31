# 用 edge-tts 生成配音（只补缺的），量出时长写进 index.json。由 scripts/voice.mjs 调用。
import asyncio, json, os, re, subprocess, sys
import edge_tts

lines = json.load(open(sys.argv[1], encoding='utf-8'))
out = sys.argv[2]
MARKS = os.path.join(os.path.dirname(os.path.abspath(sys.argv[1])), 'voice-marks')
os.makedirs(MARKS, exist_ok=True)
poly = {}
if len(sys.argv) > 3 and os.path.exists(sys.argv[3]):  # 多音字表：左边的词换成右边的同音写法（只影响配音）
    for a, b in re.findall(r"'([^']+)':\s*'([^']*)'", open(sys.argv[3], encoding='utf-8').read()):
        poly[a] = b

def fix(t):
    for a in sorted(poly, key=len, reverse=True):
        t = t.replace(a, poly[a])
    return t

async def one(sem, x):
    path = os.path.join(out, x['file'])
    marks_path = os.path.join(MARKS, x['file'].replace('.mp3', '.json'))
    if os.path.exists(path) and os.path.getsize(path) > 1000 and os.path.exists(marks_path):
        return
    text = fix(x['text'])
    async with sem:
        for k in range(4):
            try:
                comm = edge_tts.Communicate(text, x['voice'], rate=x['rate'], boundary='WordBoundary')
                audio, marks = bytearray(), []
                async for c in comm.stream():
                    if c['type'] == 'audio': audio += c['data']
                    elif c['type'] == 'WordBoundary': marks.append(dict(o=c['offset'] / 1e7, d=c['duration'] / 1e7, t=c.get('text', '')))
                open(path, 'wb').write(audio)
                # 逐词时间点（检查停顿、读音用）：放在 build/voice-marks/，不随网站发布
                json.dump(dict(text=text, voice=x['voice'], rate=x['rate'], marks=marks), open(marks_path, 'w', encoding='utf-8'), ensure_ascii=False)
                return
            except Exception as e:
                print('重试', x['file'], e)
                await asyncio.sleep(2 + k * 2)

async def main():
    sem = asyncio.Semaphore(4)
    await asyncio.gather(*[one(sem, x) for x in lines])

asyncio.run(main())
idx = {}
for x in lines:
    path = os.path.join(out, x['file'])
    if os.path.exists(path):
        d = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip()
        if d:
            idx[x['file']] = round(float(d), 2)
json.dump(idx, open(os.path.join(out, 'index.json'), 'w'), ensure_ascii=False)
print(f'配音 {len(idx)} / {len(lines)} 句，共 {sum(idx.values()):.0f} 秒')
