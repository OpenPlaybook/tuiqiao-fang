/** Lesson 路径使用课堂服务；独立页面复用不依赖服务的演示模式。 */
export function resolveRuntime(pathname: string, demoBuild = false) {
  const match = pathname.match(/^\/(?:api\/ensemble\/lesson|lesson|lesson-app)\/([^/]+)(?:\/|$)/);
  return {
    lessonId: match ? decodeURIComponent(match[1]) : 'demo',
    demo: demoBuild || !match,
  };
}
