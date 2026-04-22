# miniTicket

这是一个 ticketing monorepo，包含 Nest API、微信小程序、管理员工作台，以及共享 contracts。

## 入口说明

- [docs/handoff/README.md](docs/handoff/README.md) - 团队交接入口
- `apps/api` - 后端 API
- `apps/miniapp` - 微信小程序
- `apps/admin` - 管理员工作台
- `packages/contracts` - 前后端共享契约

## 本次工作台重点

- 登录页使用中文提示和中文校验信息。
- `/users` 是账号管理入口，支持列表、创建、启用/停用，并展示角色。
- 后台默认同域请求 `/api`，如果切到其他环境，只改 `ticketing.admin.apiBaseUrl`。
- 当前 admin workbench 不再读取 `ticketing.admin.apiSecret`。

## 常用命令

- `corepack pnpm install`
- `corepack pnpm lint`
- `corepack pnpm test`
- `corepack pnpm --filter admin test`
- `corepack pnpm --filter admin build`
- `corepack pnpm --filter api test`

## 本地启动

1. 复制 `.env.example` 到 `.env`。
2. 启动数据库和 Redis。
3. 运行 `corepack pnpm bootstrap:local`。
4. 分别启动 `corepack pnpm dev:api`、`corepack pnpm dev:admin`、`corepack pnpm dev:miniapp`。

## 交接文档

更完整的项目背景、部署和运行说明请看：

- [docs/handoff/development-handoff.md](docs/handoff/development-handoff.md)
- [docs/handoff/project-status-and-next-steps.md](docs/handoff/project-status-and-next-steps.md)
- [docs/handoff/team-handoff-checklist.md](docs/handoff/team-handoff-checklist.md)
