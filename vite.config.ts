import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base: './' 让网站可以挂在任意子路径下（例如 https://某域名/judge/），接口也用相对路径。
// 机房电脑的浏览器可能比较旧（Win7 最高只有 Chrome 109）：JS 编译到 Chrome 87，CSS 用 Lightning CSS 给 oklch / color-mix 加上旧浏览器能用的写法。
const chrome87 = 87 << 16;
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://localhost:8083' } },
  css: { transformer: 'lightningcss', lightningcss: { targets: { chrome: chrome87, edge: 88 << 16, firefox: 78 << 16, safari: 14 << 16 } } },
  build: { outDir: 'dist', chunkSizeWarningLimit: 1500, target: ['chrome87', 'edge88', 'firefox78', 'safari14'], cssMinify: 'lightningcss' },
});
