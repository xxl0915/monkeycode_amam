# 接口文档

本文件描述 amam 的两类接口：本地生成 API（HTTP）与前端模块接口（store / client / 组件）。

## HTTP API

- 基路径：`/api/v1`
- 默认地址：`http://127.0.0.1:8787`（可用环境变量 `API_PORT` 或 `PORT` 覆盖）
- 数据格式：JSON（`Content-Type: application/json; charset=utf-8`）
- 认证：受保护接口需携带请求头 `Authorization: Bearer <token>`
- CORS：允许所有来源，允许头 `Content-Type, Authorization`，允许方法 `GET, POST, DELETE, OPTIONS`

响应统一结构：

- 成功：直接返回数据对象（如 `{ user }`、`{ job }`、`{ jobs }`）
- 失败：`{ "error": "..." }`，部分错误附带 `message`

### 错误码约定

| 状态码 | 场景 | 响应示例 |
|--------|------|----------|
| `400` | 参数缺失或场景无效 | `{ "error": "missing_scene" }` / `{ "error": "invalid_scene" }` / `{ "error": "请输入账号和不少于 4 位的密码" }` |
| `401` | 未携带或无效令牌 | `{ "error": "unauthorized" }` |
| `402` | 积分不足 | `{ "error": "insufficient_credits" }` |
| `404` | 未知路径或资源不存在 | `{ "error": "not_found" }` |
| `409` | 注册时账号已存在 | `{ "error": "该账号已注册，请直接登录" }` |
| `500` | 服务端异常 | `{ "error": "internal_error", "message": "..." }` |

### 端点列表

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| `GET` | `/api/v1/health` | 否 | 健康检查 |
| `POST` | `/api/v1/auth/login` | 否 | 登录；账号不存在时自动创建 |
| `POST` | `/api/v1/auth/register` | 否 | 注册；账号已存在返回 409 |
| `POST` | `/api/v1/auth/logout` | 否 | 注销当前令牌 |
| `GET` | `/api/v1/me` | 是 | 获取当前用户 |
| `POST` | `/api/v1/orders` | 是 | 充值并返回最新用户 |
| `POST` | `/api/v1/assets` | 是 | 登记参考素材元信息 |
| `GET` | `/api/v1/scenes` | 否 | 返回全部场景契约 |
| `GET` | `/api/v1/models` | 否 | 返回可用模型列表 |
| `POST` | `/api/v1/jobs` | 是 | 创建生成任务并冻结积分 |
| `GET` | `/api/v1/jobs` | 是 | 列出当前用户任务 |
| `GET` | `/api/v1/jobs/:id` | 是 | 查询单个任务 |
| `DELETE` | `/api/v1/jobs/:id` | 是 | 删除任务 |

### GET /api/v1/health

响应 `200`：

```json
{ "ok": true }
```

### POST /api/v1/auth/login

请求：

```json
{ "account": "user@example.com", "password": "pass123" }
```

- `account` 为空或 `password` 少于 4 位：`400`
- 账号不存在时自动创建，并赠送初始积分 `128.5`
- 账号已存在时直接登录，不改变已有积分（幂等）

响应 `200`：

```json
{
  "token": "tok_xxxxxxxxxxxxxxxxxx",
  "user": { "id": "usr_...", "name": "user", "account": "user@example.com", "credits": 128.5, "invite": "AMAM8K" }
}
```

### POST /api/v1/auth/register

请求同 `login`。

- 账号已存在：`409 { "error": "该账号已注册，请直接登录" }`
- 创建成功：`201`，响应结构同 `login`

### POST /api/v1/auth/logout

携带 Bearer 令牌时删除对应会话，始终返回 `200 { "ok": true }`。

### GET /api/v1/me

响应 `200`：

```json
{ "user": { "id": "usr_...", "name": "...", "account": "...", "credits": 128.5, "invite": "AMAM8K" } }
```

### POST /api/v1/orders

请求：

```json
{ "credits": 500, "price": 79 }
```

- `credits` 至少为 1（小于 1 或非法值按 1 处理）
- 写入账本（reason 为 `recharge`）并追加一条 `orders` 记录

响应 `200`：

```json
{ "user": { "id": "usr_...", "credits": 628.5, "..." : "..." } }
```

### POST /api/v1/assets

请求：

```json
{ "name": "product.png", "role": "product", "url": "blob:..." }
```

响应 `200`：

```json
{ "assetId": "ast_xxxxxxxxxxxxxxxxxx", "name": "product.png", "role": "product", "url": "blob:..." }
```

说明：素材元信息仅登记返回，不落盘；`role` 缺省为 `product`。

### GET /api/v1/scenes

响应 `200`：

```json
{ "scenes": [ { "slug": "suite", "title": "商品套图", "group": "...", "roles": [], "fields": [], "maxOutputs": 4, "defaultRatio": "3:4", "outputMode": "...", "instruction": "..." } ] }
```

数据来源：`src/data/sceneSchemas.json`（共 50 个场景）。

### GET /api/v1/models

响应 `200`：

```json
{ "models": [ { "id": "seedream-4.0", "name": "Seedream 4.0", "video": false } ] }
```

内置 5 个模型：`seedream-4.0`、`gpt-image-1`、`flux-kontext`、`nano-banana`、`seedance-1.0`（`seedance-1.0` 为 `video: true`）。

### POST /api/v1/jobs

请求：

```json
{
  "scene": "商品主图",
  "model": "seedream-4.0",
  "params": { "outputCount": 2, "ratio": "3:4" },
  "refs": [ { "role": "product", "name": "a.png", "url": "blob:..." } ]
}
```

- `scene` 为空：`400 missing_scene`
- `scene` 不在已知场景集合内：`400 invalid_scene`（匹配 `slug` 或 `title`，集合为 `sceneSchemas.json` 与 `catalogs.js` 的并集）
- 积分小于单次消耗（`COST_PER_JOB = 4`）：`402 insufficient_credits`
- 成功：`201`，任务初始状态 `queued`，并调用 `freezeCredits` 冻结积分

响应 `201`：

```json
{
  "job": {
    "id": "job_...", "userId": "usr_...", "scene": "商品主图", "model": "seedream-4.0",
    "params": { "outputCount": 2 }, "refs": [], "cost": 4, "status": "queued",
    "progress": 0, "outputs": [], "error": null,
    "createdAt": 0, "startedAt": null, "finishedAt": null
  },
  "user": { "id": "usr_...", "credits": 124.5 }
}
```

### GET /api/v1/jobs

返回当前令牌用户的任务，按 `createdAt` 倒序：

```json
{ "jobs": [ { "id": "job_...", "status": "succeeded", "outputs": [ { "index": 0, "url": "/product-scenes/samples/suite.webp" } ] } ] }
```

### GET /api/v1/jobs/:id 与 DELETE /api/v1/jobs/:id

- 任务不存在或不属于当前用户：`404 not_found`（按令牌隔离）
- `GET` 返回 `{ "job": { ... } }`
- `DELETE` 成功返回 `{ "ok": true }`

## 前端模块接口

### `src/api/client.js`

```js
import { api, ApiError, getToken, setToken } from './api/client'

api.login(account, password)       // POST /auth/login
api.register(account, password, invite) // POST /auth/register
api.logout()                       // POST /auth/logout
api.me()                           // GET /me
api.recharge(credits, price)       // POST /orders
api.registerAsset(asset)           // POST /assets
api.createJob(payload)             // POST /jobs
api.listJobs()                     // GET /jobs
api.getJob(id)                     // GET /jobs/:id
api.deleteJob(id)                  // DELETE /jobs/:id
```

- 令牌默认从 `localStorage` 的 `amam-token` 读取并注入 Bearer 头
- 非 2xx 响应抛出 `ApiError`（含 `status` 与 `message`）
- 网络不可达时抛出 `ApiError('无法连接生成服务，请确认 API 已启动', 0)`

### `src/store.js`

响应式单例 `store` 字段：`user`、`ready`、`loginOpen`、`helpOpen`、`searchOpen`、`payOpen`、`jobs`、`jobsLoading`、`lastError`。

导出的动作：

| 函数 | 说明 |
|------|------|
| `bootstrap()` | 若存在令牌则调用 `me()` 恢复会话，并加载任务 |
| `login({ account, password })` | 登录、保存令牌、关闭登录弹窗、加载任务 |
| `register({ account, password, invite })` | 注册，同上 |
| `logout()` | 调用服务端注销并清空本地会话与任务 |
| `recharge(credits, price)` | 充值并刷新 `store.user` |
| `loadJobs()` | 加载当前用户任务列表 |
| `createJob(payload)` | 创建任务并把新任务插入列表头部，同步积分 |
| `deleteJob(id)` | 删除任务并从列表移除 |
| `pollJob(id, { interval, timeout })` | 轮询任务直至 `succeeded`/`failed` 或超时（默认 1s 间隔、60s 超时） |
| `formatCredits(n)` | 格式化为「x,xxx.xx 积分」 |

### 组件接口

| 组件 | 关键 props / 行为 |
|------|-------------------|
| `PublicLayout.vue` | 顶栏导航、语言切换、用户菜单、弹窗挂载、`/ic` 预取、快捷键 `Ctrl/Cmd+K` 搜索、`Esc` 关闭浮层 |
| `LoginModal.vue` | 登录/注册/找回密码三个标签；`busy` 态与服务端错误展示 |
| `PayModal.vue` | 三档充值套餐；未登录时转为打开登录弹窗 |
| `SearchModal.vue` | 基于 `searchIndex` 的站内搜索 |
| `HelpDrawer.vue` | 基于 `helpFaqs` 的帮助抽屉 |
| `SimplePage.vue` | 通用页面；`jobs=true` 时渲染任务列表，`logs=true` 时显示积分消耗 |
