// 演示版：VITE_DEMO=1 构建成一个单独的 HTML（node scripts/build-demo.mjs）。不用登录、不连服务器、不保存记录；AI 举例用事先生成的，写句子不评分。
import {resolveRuntime} from './runtime';
export const runtime = resolveRuntime(location.pathname, import.meta.env.VITE_DEMO === '1');
export const DEMO = runtime.demo;
