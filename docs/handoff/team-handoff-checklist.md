# 团队交接清单

最后更新：2026-04-21

这份清单不是产品需求，而是交接当天建议逐项确认的内容。

## 1. 仓库与权限

- 确认开发团队已经有 GitHub 仓库访问权限
- 确认默认工作分支策略
- 确认谁负责 API、谁负责 Miniapp、谁负责 Admin、谁负责部署

## 2. 环境与密钥

必须单独交接，不要写进仓库：

- `.env` 真实值
- 微信小程序 `AppID`
- 微信支付商户配置
- 上游 vendor 配置
- `ADMIN_API_SECRET`
- `VENDOR_CALLBACK_SECRET`
- `JWT_SECRET`
- `VIEWER_ID_CARD_KEY`

## 3. 平台账号

需要明确交接这些平台账号或权限：

- 微信小程序后台
- 微信支付商户平台
- Linux 预发服务器
- 域名解析 / SSL 证书管理
- 上游 vendor 平台或接口联系人

## 4. 本地交接验证

建议交接当天让新团队现场完成一次：

1. `corepack pnpm install`
2. `corepack pnpm dev:infra`
3. `corepack pnpm bootstrap:local`
4. `corepack pnpm dev:api`
5. `corepack pnpm dev:miniapp`
6. 微信开发者工具打开小程序
7. 首页 -> 详情 -> 订单等主要页面 smoke test

## 5. 代码级确认

建议交接当天明确：

- 当前默认开发态用了 showcase 数据
- 当前默认开发态用了 mock 微信支付
- 真实接入前要关闭哪些开关
- 哪些脚本是部署脚本，哪些只是本地脚本

## 6. 部署级确认

建议交接当天至少过一遍这些文件：

- [docker-compose.beta.yml](/D:/miniTicket/docker-compose.beta.yml)
- [prepare-server.sh](/D:/miniTicket/ops/prepare-server.sh)
- [deploy-beta.sh](/D:/miniTicket/ops/deploy-beta.sh)
- [rollback-beta.sh](/D:/miniTicket/ops/rollback-beta.sh)
- [check-beta.sh](/D:/miniTicket/ops/check-beta.sh)

## 7. 业务规则确认

这几个规则必须和开发团队口头再确认一次：

- 实名购票
- 观演人修改限制
- 电子票 / 纸票时效
- `20%` 服务费扣除规则
- 支付成功不等于出票成功
- 退款申请提交不等于退款完成

## 8. 运营联动确认

交接给开发团队时，也建议同步确认：

- 运营文档已经在哪里
- 哪个阶段需要开发团队支持运营彩排
- 首场真实联调时谁盯后台、谁盯支付、谁盯回调、谁盯客服

## 9. 交接完成标志

只有下面这些都完成，才算真正交接完：

1. 代码已经推到远端
2. 团队知道看哪几份文档
3. 团队拿到了必需的环境权限
4. 团队能本地跑起来
5. 团队知道下一步优先级
