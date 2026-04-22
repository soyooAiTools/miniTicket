# 后台补齐项设计

## 背景

`admin workbench` 已经合入主线，但还留有 3 个明显缺口：

1. `apps/admin` 的首屏包体仍然过大，构建仍提示 chunk size warning。
2. 账号管理目前只有创建、启停和角色展示，缺少最小可用的角色修改流。
3. 交接文档已经有了入口，但还缺一份更适合新同事快速上手的 `10 分钟接手指南`，也缺一份能追溯本次后台大合并范围的 `版本说明`。

这轮只补这 3 项，不扩大到权限树、复杂打包优化或完整发布流程。

## 目标

在不改变当前后台信息架构的前提下：

- 让 `admin` 前端按路由和基础依赖做初步分包，显著降低主包体压力。
- 让账号管理页支持最小角色修改流，只保留 `ADMIN / OPERATIONS` 两档。
- 补齐适合团队协作的文档入口，降低新成员接手门槛，并为这次后台大合并提供可引用的版本说明。

## 方案对比

### 方案 A：最小补齐

- 只做 `vite manualChunks`
- 账号页不加角色修改
- 文档只在 `README` 里多写几段

优点：最快。  
缺点：核心问题只被部分缓解，后续还得再补一轮。

### 方案 B：推荐方案

- `React.lazy + Suspense` 做路由级懒加载
- `vite manualChunks` 拆 `react`、`antd`、`admin pages`
- 账号页增加角色切换
- 新增两份独立文档，并补首页链接

优点：投入适中，但能同时解决包体、后台可用性和交接体验。  
缺点：会同时触碰前端、后端和文档，需要一轮完整验证。

### 方案 C：激进重构

- 重新拆管理端路由、状态层和页面组织
- 角色体系一步扩成可配置权限
- 文档重写成完整 onboarding 套件

优点：一步做满。  
缺点：超出本轮范围，风险高，和当前 MVP 阶段不匹配。

本轮采用 **方案 B**。

## 详细设计

### 1. `admin` 分包策略

#### 目标

- 降低首屏 bundle 压力。
- 保持当前路由结构不变，不重写页面实现。

#### 实现

- 在 `apps/admin/src/router.tsx` 中把大页面改成 `React.lazy` 按路由加载。
- 在 `apps/admin` 根入口加入统一的 `Suspense` fallback，保持现有工作台风格。
- 在 `apps/admin/vite.config.mts` 里增加 `build.rollupOptions.output.manualChunks`：
  - `react-vendor`
  - `antd-vendor`
  - `admin-pages`
- 本轮只做初步拆分，不继续引入更复杂的分析工具或逐组件级拆包。

#### 验收

- `admin build` 继续通过。
- 输出 chunk 结构比当前更合理，主入口 bundle 明显下降。
- 即使仍有 warning，也要比当前状态更接近可控。

### 2. 账号角色修改

#### 目标

- 在现有账号页上补最小角色修改能力。
- 仍然保持 `超级管理员 / 运营` 两档，不引入细粒度权限。

#### 后端

- 在 `admin-users` 模块补一个最小更新入口，例如 `PATCH /admin/users/:userId`。
- 只允许修改：
  - `role`
  - 必要时复用已有 `enabled`
- 服务端继续用 shared contracts 做校验。
- 更新后写入审计日志，便于后续追溯。

#### 前端

- 在 `/users` 页的表格里增加“修改角色”动作。
- 交互采用轻量方式：
  - 行内 `Select` + 保存
  - 或弹窗选择
- 推荐用小弹窗/下拉，不单独做详情页。

#### 验收

- 能把账号从 `ADMIN` 改成 `OPERATIONS`，也能反向改回。
- 列表刷新后角色显示正确。
- 对应接口和页面都有测试。

### 3. 交接文档补齐

#### 新增文档

- `docs/handoff/10-minute-onboarding.md`
- `docs/handoff/release-notes-admin-workbench.md`

#### `10-minute-onboarding.md` 内容

- 项目是什么
- 本地 10 分钟怎么跑起来
- 管理后台入口在哪里
- 先看哪些代码/文档
- 当前最重要的未完成事项

目标是让新同事不用翻完整历史，就能在 10 分钟内建立基本认知。

#### `release-notes-admin-workbench.md` 内容

- 本次后台工作台新增了什么
- 改了哪些关键路由、接口和文档
- 有哪些已知边界
- 团队接手后优先继续什么

目标是让团队能追溯这次大合并的实际范围，而不是只看提交历史猜。

#### 首页入口

- `README.md`
- `docs/handoff/README.md`

都要补上这两份文档的清晰链接，并把说明写得更像给团队看的入口页。

## 不做的事

- 不做完整权限树或资源级权限控制。
- 不做账号详情页。
- 不做完整打包性能专项优化。
- 不做发布流程、PR 模板或 GitHub 自动化。

## 验证策略

本轮至少要重新跑：

- `corepack pnpm --filter admin test`
- `corepack pnpm --filter admin build`
- `corepack pnpm lint`
- 如果动到 `admin-users` 后端：`corepack pnpm --filter api test -- src/modules/admin-users`

## 风险与边界

- 路由懒加载会改变页面加载时机，需要保证现有认证壳子和 fallback 不闪乱。
- 角色修改虽然范围很小，但必须走服务端校验和审计日志，不能只改前端显示。
- 文档中文化要准确，不能把跨域 cookie 这类边界重新写模糊。
