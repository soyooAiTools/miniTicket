# 开发团队交接入口

最后更新：2026-04-21

这套交接包是给接手 `miniTicket` 的开发团队用的。目标不是重复写一遍历史讨论，而是让新同事在最短时间内知道：

- 这个项目是什么
- 当前做到哪一步
- 本地怎么跑
- 预发怎么上
- 还差什么没有完成

## 先看什么

建议按这个顺序阅读：

1. [需求摘要](./requirements-summary.md)
2. [开发交接](./development-handoff.md)
3. [项目现状与下一步](./project-status-and-next-steps.md)
4. [交接清单](./team-handoff-checklist.md)

## 代码范围

当前仓库已经是纯票务项目仓库，不再包含原来的压测/抢票系统。

- `apps/miniapp`: 微信小程序
- `apps/api`: NestJS API
- `apps/admin`: 后台管理端
- `packages/contracts`: 前后端共享 contracts
- `deploy` / `ops`: 预发部署模板与脚本

## 现成文档

如果团队需要追溯更早的设计背景，可以继续看这些文档：

- [初版票务方案](../superpowers/specs/2026-04-16-ticketing-miniapp-design.md)
- [B 阶段内测设计](../superpowers/specs/2026-04-17-ticketing-b-internal-beta-design.md)
- [预发部署设计](../superpowers/specs/2026-04-18-ticketing-beta-preprod-deployment-design.md)
- [小程序 UI 重做设计](../superpowers/specs/2026-04-21-ticketing-miniapp-ui-revamp-design.md)
- [运营规则说明](../operations/ticketing-operator-rules.md)

## 交接结论

现在这套项目已经不是“空架子”，而是：

- 核心代码骨架齐了
- 本地 mock 闭环能跑
- 小程序 UI 已经重做过一轮
- 预发部署脚本已补齐
- 还没有完成真实微信与真实上游的最终上线验证

所以接手团队的重点，不是从零设计，而是：

1. 稳定接手当前代码和环境
2. 跑通本地联调
3. 完成真实环境接入
4. 上预发
5. 做首场真实联调/彩排
