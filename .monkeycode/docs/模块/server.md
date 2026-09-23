# server

本地生成 API。零第三方依赖，仅使用 Node.js 内建模块，为前端提供账号、积分、素材、场景与生成任务接口。

## 结构

```
server/
├── index.js     # HTTP 入口、路由分发、鉴权、请求体读取
├── db.js        # JSON 持久化与积分账本
├── worker.js    # 假 Worker 状态推进与结算/退款
├── catalog.js   # 场景契约、模型列表、样图池
└── data/
    └── db.json  # 运行时数据（gitignore）
```

## 关键文件

| 文件 | 目的 |
|------|------|
| `index.js` | 路由分发：`/api/v1/*`，`sendJson`、`readBody`、`currentUser`、`issueToken` |
| `db.js` | `state`、`save`、`newId`、`addLedger`、`creditUser`、`freezeCredits`、`settleCredits`、`refundCredits`、`reconcileLedger` |
| `worker.js` | `startJob(jobId)`：`queued → running → succeeded/failed` |
| `catalog.js` | `sceneSchemas`、`getScene`、`models`、`samplePool` |

## 依赖

**本模块依赖**:

- `node:http`、`node:fs`、`node:crypto`、`node:path`、`node:url` - 内建模块
- `src/data/sceneSchemas.json` - 场景契约
- `src/data/catalogs.js` - 场景目录（校验用）

**依赖本模块的**:

- 前端 SPA - 经 Vite `/api` 代理访问

## 规范

### 文件命名

- 入口固定为 `index.js`
- 按职责命名：`db.js`、`worker.js`、`catalog.js`

### 代码模式

**路由分发**:

```js
async function handle(req, res, url) {
  const path = url.pathname
  const method = req.method || 'GET'
  if (path === '/api/v1/health') return sendJson(res, 200, { ok: true })
  if (path === '/api/v1/jobs' && method === 'POST') {
    const user = currentUser(req)
    if (!user) return sendJson(res, 401, { error: 'unauthorized' })
    // ...
  }
  return sendJson(res, 404, { error: 'not_found' })
}
```

### 错误处理

所有失败返回 `{ error: "..." }`；`createApiServer()` 用 `.catch()` 兜底 `500 internal_error`。

### 测试

当前无自动化测试，使用 `curl` 手工验证。

## 添加新文件

### 添加新接口

1. 在 `handle()` 中按 `path` + `method` 添加分支
2. 使用 `currentUser(req)` 鉴权、`readBody(req)` 读取请求体
3. 需要持久化时调用 `save()`
4. 同步更新 `src/api/client.js` 与 `INTERFACES.md`

**检查清单**:

- [ ] 鉴权正确
- [ ] 错误码符合约定
- [ ] 已在 `INTERFACES.md` 记录
