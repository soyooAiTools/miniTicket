# 后台工作台版本说明

最后更新：2026-04-22

这份文档不是完整 changelog，而是给交接和发版用的版本摘要。重点是让接手的人知道：这次合了什么、影响了哪里、后面还要补什么。

## 本次合并范围

- 后台工作台主链路已经合并进来。
- 账号管理后续能力已经补上。
- 后台前端 bundle 和启动链路做了整理，方便本地开发和后续排查。

## 这次主要覆盖的入口

- `/dashboard`
- `/events`
- `/orders`
- `/refunds`
- `/users`

## 你需要知道的几个事实

- 现在的管理后台仍然是 MVP，不是细粒度权限系统。
- 后台仍然依赖同站点 cookie 会话，不支持任意跨域直连。
- `ticketing.admin.apiBaseUrl` 只是在切环境时改请求目标，不会替你解决登录态。
- `ticketing.admin.apiSecret` 已经不再是当前 admin workbench 的必读配置。

## 接手时建议先看

- `apps/admin/src/router.tsx`
- `apps/admin/src/pages/dashboard/index.tsx`
- `apps/admin/src/pages/users/index.tsx`
- `apps/api/src/modules/admin-users`
- `packages/contracts/src/admin-user.ts`

## 后续还要继续做什么

- 真正的微信登录和支付联调。
- 上游出票、退款联调。
- Linux 预发部署与环境联动。

## 适合交接时说清楚的一句话

这次后台工作台把主页面和账号管理入口先补齐了，后面要继续补的是联调、环境和部署层面的稳定性。
