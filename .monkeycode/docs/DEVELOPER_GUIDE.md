# 开发者指南

## 项目目的

amam 是复刻 [aigc.easysu.cn](https://aigc.easysu.cn/) 的 AI 视觉创作平台前端，配合一个本地生成 API 演示完整的产品闭环：登录、积分、提交生成任务、轮询状态、展示结果与作品日志。

**核心职责**:

- 提供多业务入口（商品图、模特图、AI 视频、图片工具、平面设计、POD、爆款衍生、营销、跨境等）的目录与工作台界面
- 收集场景参数与参考素材，调用服务端任务接口并轮询展示结果
- 以服务端会话与积分账本为准，维护登录态与积分展示
- 承载独立的无限画布子应用（`/ic/`）

**相关系统**:

- 本地生成 API（`server/`）- 提供账号、积分、素材与任务接口
- 无限画布静态子应用（`public/ic/`）- 独立构建产物，经 `/ic/` 访问

## 环境搭建

### 前置条件

- Node.js（支持 ES Modules 与 `node:` 内建模块）
- npm
- 一个现代浏览器

### 安装

```bash
# 安装依赖
npm install
```

本项目没有 `.env` 文件，运行时配置通过命令行参数或环境变量传入。

### 环境变量

| 变量 | 必需 | 描述 | 示例 |
|------|------|------|------|
| `API_PORT` | 否 | 本地 API 监听端口，优先于 `PORT` | `8787` |
| `PORT` | 否 | 本地 API 监听端口（回退） | `8787` |

API 默认监听 `0.0.0.0:8787`。`vite.config.js` 中开发代理固定指向 `http://127.0.0.1:8787`，修改端口时需同步调整代理目标。

### 运行

```bash
# 启动本地生成 API（默认 127.0.0.1:8787）
npm run server

# 启动前端开发服务器（/api 已代理到本地 API）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

预览服务器不包含 `/api` 代理，需要接口时请使用 `npm run dev` 并单独运行 `npm run server`。

## 开发工作流

### 代码质量工具

当前仓库未配置 lint / typecheck / test 脚本。现有校验手段：

| 工具 | 命令 | 目的 |
|------|------|------|
| Vite Build | `npm run build` | 验证 SPA 可构建、无编译错误 |
| Tests | `npm test` | 积分账本属性测试与任务生命周期接口测试 |
| 手工/接口验证 | `curl` + `npm run server` | 验证 API 行为 |

### 提交前检查

1. 运行 `npm run build`，确认构建通过
2. 启动 `npm run server` 与 `npm run dev`，验证受影响的接口或页面
3. 检查 `git status`，仅提交预期文件

### 分支策略

- `master` - 主干
- `YYMMDD-<type>-<slug>` - 功能/修复分支（如 `260923-feat-generation-job-pipeline`）

### Pull Request 流程

1. 从 `master` 创建功能分支
2. 编写代码
3. 运行 `npm run build`
4. 创建 PR 并填写描述

## 常见任务

### 添加新场景（业务入口）

**需修改的文件**:

1. `src/data/sceneSchemas.json` - 若该场景需要结构化表单，添加契约对象
2. `src/data/catalogs.js` - 在对应的 `*Scenes` 数组中添加 `[group, title, slug, description, status]`
3. `src/data/business.json` - 若属于业务分类，补充对应 category/groups/scenes

**步骤**:

1. 确定场景归属目录（商品图 / 模特图 / 视频 / 工具 / 平面等）
2. 添加场景条目，保证 `slug` 唯一
3. 如工作台需要，路由已由 `:scene` 动态参数覆盖，无需改路由
4. 服务端会自动从 `catalogs.js` + `sceneSchemas.json` 合并校验场景，无需改服务端

### 添加新 API 端点

**需修改的文件**:

1. `server/index.js` - 在 `handle()` 中按 `path` + `method` 添加分支
2. `src/api/client.js` - 添加对应封装方法
3. `src/store.js` - 如需要，暴露 action

**步骤**:

1. 在 `handle()` 中匹配路径，使用 `currentUser(req)` 做鉴权
2. 用 `readBody(req)` 读取请求体，`sendJson(res, status, payload)` 返回
3. 需要持久化时调用 `save()`
4. 在 `client.js` 中添加方法并复用 `request()`

**示例提交**: `feat(api): add GET /api/v1/assets/:id endpoint`

### 调整生成任务行为

**需修改的文件**:

1. `server/worker.js` - 调整 `runningDelay` / `finishDelay`、输出数量或失败逻辑
2. `server/index.js` - 调整 `COST_PER_JOB` 或创建逻辑

**说明**:

- `params.outputCount`（或 `params.count`）决定输出数量，上限 12
- `params.simulateFail = true` 会让任务失败以便验证退款流程
- 成功时 `settleCredits`（delta 0），失败时 `refundCredits`（返还冻结积分）

### 修改积分规则

**需修改的文件**:

1. `server/db.js` - `creditUser` / `freezeCredits` / `settleCredits` / `refundCredits` 与 `reconcileLedger`
2. `server/index.js` - 初始赠送积分与充值逻辑

**约束**:

- 任何积分变化都必须写入 `ledger`，保证「余额 = 流水累计」
- `reconcileLedger()` 会在启动时对历史数据补齐 `adjust` 流水，不要绕过账本直接改 `user.credits`

### 修复 Bug

**流程**:

1. 用 `curl` 或页面复现问题
2. 定位是前端（`src/`）还是 API（`server/`）层
3. 最小改动修复
4. 重新验证并运行 `npm run build`

**示例提交**: `fix(jobs): reject unknown scene with 400 invalid_scene`

## 编码规范

### 文件组织

- 每个 `.vue` 文件一个组件，使用 `<script setup>`
- 页面放在 `src/views/`，可复用组件放在 `src/components/`
- 纯数据与目录放在 `src/data/`
- 服务端按职责拆分：入口 `index.js`、持久化 `db.js`、任务 `worker.js`、目录 `catalog.js`

### 命名

| 类型 | 约定 | 示例 |
|------|------|------|
| Vue 组件文件 | PascalCase | `ProductSuiteView.vue` |
| JS 模块 | camelCase | `client.js`, `worker.js` |
| 函数 | camelCase | `createJob`, `freezeCredits` |
| 常量 | SCREAMING_SNAKE | `COST_PER_JOB`, `BASE` |
| ID | 前缀 + 随机串 | `usr_`, `job_`, `tok_`, `ast_`, `ord_`, `led_` |

### 错误处理

- API 统一返回 `{ error: "..." }` 并在 `server/index.js` 末尾兜底 `404 not_found`
- 前端统一通过 `ApiError` 抛错，组件捕获后展示 `e.message`
- 网络不可达时给出明确中文提示

### 日志

服务端仅在启动时输出监听日志（`[amam-api] listening on ...`）。如需排查，可在 `handle()` 内临时打印，但不要提交调试日志。

### 测试

测试文件位于 `tests/generation-pipeline.test.js`，使用 Node 内置 `node:test`。运行 `npm test`。测试通过 `AMAM_DB_FILE` 隔离存储，不会改写运行时 `server/data/db.json`。
