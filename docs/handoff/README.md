# 开发交接入口

最后更新：2026-04-22

这组交接文档的目标不是复述历史，而是让新同事快速知道：

- 这个项目是什么
- 现在做到哪一步
- 本地怎么跑
- 预发怎么发
- 还缺什么

## 建议阅读顺序

1. [需求摘要](./requirements-summary.md)
2. [开发交接](./development-handoff.md)
3. [项目现状和下一步](./project-status-and-next-steps.md)
4. [交接清单](./team-handoff-checklist.md)

## 代码范围

当前仓库已经收敛成纯 ticketing 项目：

- `apps/miniapp` - 用户侧微信小程序
- `apps/api` - NestJS 后端
- `apps/admin` - 管理后台
- `packages/contracts` - 前后端共享契约
- `deploy` / `ops` - 部署与运维脚本

## 管理后台说明

- 管理后台现在默认走 cookie 会话，不再依赖前端读取 `ticketing.admin.apiSecret`。
- 后台若要连到非默认环境，只需在浏览器 localStorage 里设置 `ticketing.admin.apiBaseUrl`。
- `/users` 是账号管理入口，支持列表、创建、启用/停用。

## 本地启动

1. 复制 `.env.example` 到 `.env`。
2. 启动 PostgreSQL 和 Redis。
3. 运行 `corepack pnpm bootstrap:local`。
4. 分别启动 API、admin 和 miniapp。

## 交接时要看什么

- `docs/handoff/project-status-and-next-steps.md`：当前完成度和下一步
- `docs/handoff/team-handoff-checklist.md`：交接时的检查项
- `docs/handoff/development-handoff.md`：运行和环境说明

如果你只想快速确认“现在该做什么”，优先看 `project-status-and-next-steps.md`。
