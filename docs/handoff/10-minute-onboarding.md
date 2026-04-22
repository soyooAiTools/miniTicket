# 10 分钟接手指南

最后更新：2026-04-22

这份文档给第一次接手 miniTicket 的同学看。目标只有一个：先把项目跑起来，再知道该从哪里下手。

## 这是什么项目

- `apps/api`：NestJS 后端 API，提供登录、订单、退款、账号管理等接口。
- `apps/admin`：管理后台，当前重点是 admin workbench 和账号管理后续。
- `apps/miniapp`：微信小程序端。
- `packages/contracts`：前后端共享的请求和响应契约。

## 10 分钟内怎么跑起来

1. 安装依赖：`corepack pnpm install`
2. 复制环境文件：`cp .env.example .env`
3. 启动数据库和 Redis：`corepack pnpm dev:infra`
4. 初始化本地数据：`corepack pnpm bootstrap:local`
5. 启动后端：`corepack pnpm dev:api`
6. 启动后台：`corepack pnpm dev:admin`

如果你还要看小程序，再加一条：

- `corepack pnpm dev:miniapp`

## 先看哪些代码

- `apps/admin/src/router.tsx`
- `apps/admin/src/app/AdminLayout.tsx`
- `apps/admin/src/pages/dashboard/index.tsx`
- `apps/admin/src/pages/users/index.tsx`
- `apps/api/src/modules/admin-users/admin-users.controller.ts`
- `packages/contracts/src/admin-user.ts`

## 你应该先确认什么

- 后台能否正常登录，中文提示是否按预期显示。
- `/users` 页面能否看到列表、创建、启用和停用入口。
- 后台默认是否仍然走同源 `/api`。
- 本地环境里是否已经配置好 cookie、同站点或反向代理。

## 这次任务最重要的边界

- 这个仓库还是 MVP，不是完整权限系统。
- 账号管理是当前最重要的后台入口之一。
- `ticketing.admin.apiBaseUrl` 只负责改请求目标地址，不负责替代登录态。
- 当前 admin workbench 不再依赖 `ticketing.admin.apiSecret`。

## 如果你只想先做一件事

先打开 `docs/handoff/project-status-and-next-steps.md`，再看 `apps/admin/src/pages/users/index.tsx`。这样最容易知道下一步应该补什么。
