// 配音、讲解视频放在哪里。默认和网页在同一个服务器（dist/voice、dist/shorts，网页里用相对路径）；
// 要放到 CDN 或对象存储：打包时设 VITE_MEDIA_BASE=https://某地址/（以 / 结尾），把 dist/voice、dist/shorts 传上去。
export const MEDIA: string = (import.meta.env.VITE_MEDIA_BASE as string | undefined) ?? '';
