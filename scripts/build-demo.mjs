// 演示版：构建成一个单独的 HTML（JS、CSS、图标都内嵌），双击就能打开，不用服务器、不用登录、不保存记录。
// 用法：node scripts/build-demo.mjs  → ../推敲坊_演示版.html
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const OUT = 'dist-demo';
execSync(`npx vite build --outDir ${OUT} --emptyOutDir`, { stdio: 'inherit', env: { ...process.env, VITE_DEMO: '1' } });
let html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
// 内嵌 CSS
html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/g, (_, f) => `<style>${fs.readFileSync(path.join(OUT, f), 'utf8')}</style>`); // 回调的返回值不会被当成替换模式
// 内嵌 JS（脚本里的 </script 要转义，不然会提前结束标签）
html = html.replace(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/g, (_, f) => '');
const js = fs.readdirSync(path.join(OUT, 'assets')).filter((f) => f.endsWith('.js')).map((f) => fs.readFileSync(path.join(OUT, 'assets', f), 'utf8'));
if (js.length !== 1) throw new Error('应该只有一个 JS 文件，实际有 ' + js.length);
// 用函数做替换：JS 里的 $& $' 之类不能被当成替换模式
const inline = `<script type="module">${js[0].replace(/<\/script/gi, '<\\/script')}</script>\n</body>`;
html = html.replace('</body>', () => inline);
// 配音：内嵌成 data URL（演示版没有服务器）
const VD = 'public/voice';
const idx = JSON.parse(fs.readFileSync(path.join(VD, 'index.json'), 'utf8'));
const voice = Object.fromEntries(Object.keys(idx).map((f) => [f, 'data:audio/mpeg;base64,' + fs.readFileSync(path.join(VD, f)).toString('base64')]));
const vscript = `<script>window.__VOICE_IDX__=${JSON.stringify(idx)};window.__VOICE__=${JSON.stringify(voice)};</script>`;
html = html.replace('<div id="root"></div>', () => '<div id="root"></div>' + vscript);
// 图标
const ico = fs.readFileSync('public/favicon.svg', 'utf8');
html = html.replace(/<link rel="icon"[^>]*>/, `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(ico)}">`);
html = html.replace('<title>推敲坊</title>', '<title>推敲坊（演示版）</title>');
const dest = path.resolve('..', '推敲坊_演示版.html');
fs.writeFileSync(dest, html);
console.log(`${dest}  ${(html.length / 1024).toFixed(0)} KB`);
