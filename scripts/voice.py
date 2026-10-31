# 用 edge-tts 生成配音（只补缺的），量出时长写进 index.json。由 scripts/voice.mjs 调用。
import asyncio, json, os, re, subprocess, sys
import edge_tts

lines = json.load(open(sys.argv[1], encoding='utf-8'))
out = sys.argv[2]
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
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return
    async with sem:
        for k in range(4):
            try:
                await edge_tts.Communicate(fix(x['text']), x['voice'], rate=x['rate']).save(path)
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
