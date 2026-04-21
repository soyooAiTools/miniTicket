# 开发交接

最后更新：2026-04-21

## 1. 仓库结构

### 1.1 Monorepo 结构

- `apps/miniapp`: Taro 微信小程序
- `apps/api`: NestJS API
- `apps/admin`: 后台管理端
- `packages/contracts`: 前后端共享 contracts
- `tests`: 工作区级别检查
- `deploy`: Nginx / Compose 模板
- `ops`: 预发部署、回滚、健康检查、备份脚本

### 1.2 远端仓库

当前远端：

- `origin`: `https://github.com/soyooAiTools/miniTicket.git`

## 2. 技术栈

### 2.1 小程序

- Taro 4
- React 18
- 微信开发者工具

### 2.2 API

- NestJS 11
- Prisma
- PostgreSQL
- Redis

### 2.3 后台

- React 18
- Vite
- Ant Design

## 3. 本地启动

### 3.1 安装依赖

```bash
corepack pnpm install
```

### 3.2 启动基础依赖

```bash
corepack pnpm dev:infra
```

这一步会拉起本地 `Postgres + Redis`。

### 3.3 初始化数据库

```bash
corepack pnpm bootstrap:local
```

这一步会执行：

- Prisma Client 生成
- Prisma migrate
- 本地种子数据写入

### 3.4 启动 API

```bash
corepack pnpm dev:api
```

### 3.5 启动小程序开发构建

```bash
corepack pnpm dev:miniapp
```

### 3.6 启动真机联调构建

```bash
corepack pnpm dev:api:device
corepack pnpm dev:miniapp:device
```

这套命令会把 API 暴露到局域网地址，并把小程序开发态 API 地址切到局域网 IP。

## 4. 开发态约定

### 4.1 默认开发配置

当前小程序开发态默认使用：

- `TARO_APP_API_BASE_URL=http://127.0.0.1:3100/api`
- `TARO_APP_SHOWCASE_DATA=true`
- `TARO_APP_MOCK_WECHAT_PAY=true`

对应文件：

- [dev.js](/D:/miniTicket/apps/miniapp/config/dev.js)
- [prod.js](/D:/miniTicket/apps/miniapp/config/prod.js)

### 4.2 Showcase 数据

为了方便在没有后端数据时快速看 UI，小程序开发态内置了一套展示数据：

- 演出列表
- 演出详情
- 订单列表 / 订单详情
- 观演人数据

对应文件：

- [showcase-data.ts](/D:/miniTicket/apps/miniapp/src/ui/showcase-data.ts)

如果需要强制切回真实接口，可设置：

```bash
TARO_APP_SHOWCASE_DATA=false
```

### 4.3 小程序开发者工具

当前仓库包含：

- [project.config.json](/D:/miniTicket/apps/miniapp/project.config.json)

当前是为了本地开发方便，使用了：

- `appid: touristappid`
- `urlCheck: false`

这适合本地看 UI 和联调，不适合最终上线提审。接手团队后续需要换成真实小程序 `AppID`。

## 5. 环境变量

环境变量模板：

- [.env.example](/D:/miniTicket/.env.example)

重点变量分三类：

### 5.1 基础运行

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `ADMIN_API_SECRET`
- `VIEWER_ID_CARD_KEY`

### 5.2 微信

- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`
- `WECHAT_MCH_ID`
- `WECHAT_PRIVATE_KEY_PEM`
- `WECHAT_API_V3_KEY`
- `WECHAT_NOTIFY_URL`

### 5.3 上游 Vendor

- `VENDOR_API_BASE_URL`
- `VENDOR_API_KEY`
- `VENDOR_CALLBACK_SECRET`

### 5.4 开发态 mock 开关

- `WECHAT_DEV_LOGIN_OPEN_ID`
- `WECHAT_PAY_DEV_MOCK`
- `VENDOR_DEV_MOCK`
- `TARO_APP_MOCK_WECHAT_PAY`

## 6. 当前部署资产

预发部署脚本已经在仓库里：

- [prepare-server.sh](/D:/miniTicket/ops/prepare-server.sh)
- [deploy-beta.sh](/D:/miniTicket/ops/deploy-beta.sh)
- [rollback-beta.sh](/D:/miniTicket/ops/rollback-beta.sh)
- [check-beta.sh](/D:/miniTicket/ops/check-beta.sh)
- [backup-beta.sh](/D:/miniTicket/ops/backup-beta.sh)

配套模板：

- [docker-compose.beta.yml](/D:/miniTicket/docker-compose.beta.yml)
- [ticketing-beta.conf](/D:/miniTicket/deploy/nginx/ticketing-beta.conf)
- [api.env.example](/D:/miniTicket/deploy/compose/api.env.example)

当前部署目标是：

- 单台 Linux 服务器
- 宿主机 Nginx
- Docker Compose 跑 API / Postgres / Redis
- 管理后台静态部署

## 7. 当前代码状态

### 7.1 已完成

- 仓库从混合项目中拆分为纯票务仓库
- API / Admin / Miniapp 基础骨架已完成
- 本地 mock 登录 / mock 支付 / mock 上游联调链路已补齐
- 小程序 UI 已完成一轮重做
- 详情页点击白屏问题已修复
- 预发部署脚本已补齐

### 7.2 未完成

- 真实小程序 AppID 替换
- 真实微信登录联调
- 真实微信支付联调
- 真实上游出票 / 退款联调
- 真实预发服务器首轮部署验证

## 8. 常用验证命令

### 8.1 全仓

```bash
corepack pnpm lint
corepack pnpm test
```

### 8.2 API

```bash
corepack pnpm --filter api exec tsc -p tsconfig.build.json
```

### 8.3 Miniapp

```bash
corepack pnpm --filter miniapp lint
corepack pnpm --filter miniapp test
corepack pnpm --filter miniapp exec taro build --type weapp --mode development
```

## 9. 建议接手顺序

建议新团队按下面顺序接手，而不是一上来直接上预发：

1. 拉代码、安装依赖
2. 跑通本地 `mock` 闭环
3. 用微信开发者工具确认小程序主要页面
4. 接真实微信配置
5. 接真实上游配置
6. 上 Linux 预发
7. 做首场彩排
