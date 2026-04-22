# miniTicket

这是一个 ticketing monorepo，包含 Nest API、微信小程序、管理后台和共享 contracts。

## 入口说明

- [docs/handoff/README.md](docs/handoff/README.md) - 团队交接总入口
- [docs/handoff/10-minute-onboarding.md](docs/handoff/10-minute-onboarding.md) - 新同学 10 分钟接手指南
- [docs/handoff/release-notes-admin-workbench.md](docs/handoff/release-notes-admin-workbench.md) - 后台工作台版本说明
- `apps/api` - 后端 API
- `apps/miniapp` - 微信小程序
- `apps/admin` - 管理后台
- `packages/contracts` - 前后端共享契约

## 当前工作重点

- 登录页使用中文提示和中文校验信息。
- `/users` 是账号管理入口，支持列表、创建、启用、停用，并展示角色。
- 管理后台默认请求同源 `/api`。
- 切到其他环境时，`ticketing.admin.apiBaseUrl` 只会改变请求目标地址；管理后台登录态仍依赖浏览器 cookie、同站点部署或反向代理配置。
- 当前 admin workbench 不再读取 `ticketing.admin.apiSecret`。

## 常用命令

- `corepack pnpm install`
- `corepack pnpm lint`
- `corepack pnpm test`
- `corepack pnpm --filter admin test`
- `corepack pnpm --filter admin build`
- `corepack pnpm --filter api test`

## 设备调试入口

如果你要连真机或看设备侧行为，优先看这些脚本和环境变量：

- `dev:api:device`
- `dev:miniapp:device`
- `VENDOR_DEV_MOCK`

## 本地启动

1. 复制 `.env.example` 到 `.env`。
2. 启动数据库和 Redis。
3. 运行 `corepack pnpm bootstrap:local`。
4. 分别启动 `corepack pnpm dev:api`、`corepack pnpm dev:admin`、`corepack pnpm dev:miniapp`。

## 交接时优先看这些文档

- [docs/handoff/README.md](docs/handoff/README.md)
- [docs/handoff/10-minute-onboarding.md](docs/handoff/10-minute-onboarding.md)
- [docs/handoff/release-notes-admin-workbench.md](docs/handoff/release-notes-admin-workbench.md)
- [docs/handoff/project-status-and-next-steps.md](docs/handoff/project-status-and-next-steps.md)
- [docs/handoff/team-handoff-checklist.md](docs/handoff/team-handoff-checklist.md)
