# 课程应用

完整源码、教学内容、后端和固定宿主 SDK 都属于本课程仓库。正式工作区位于本 Lesson 的 NAS `workdir`。

`pnpm test` 验证课堂业务；`pnpm typecheck` 检查类型；平台以干净 Git 提交调用 `pnpm build`，提供 `RDFZ_LESSON_ID` 与 `RDFZ_BUILD_ID`。发布配方在 `lesson.application.json`。构建失败不会切换正式版本。

此应用接入平台资源可见性及作者教师身份，学生按本课规则加入。后台由平台宿主启动并接收当前请求身份；模型经受控 IPC 调用，不读取平台 secret。不再使用单独的教师 PIN 后台。课堂 JSON-store 路径与参与凭据、roundId/revision、并发校验保持原语义，业务数据不放入 Git 或 dist。

SDK 是固定提交中的公共依赖，升级须显式更新本课程源码后构建，不在浏览器中替换全局脚本。前端、媒体和后台为同一次固定 build，hash 导航不使用 HTML base 改写。

未配置 origin 仍可本地构建、发布和运行；有 origin 时由平台检查并快进同步，不覆盖未提交修改或分叉。
