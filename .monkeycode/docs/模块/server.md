# server

本地生成 API。零第三方依赖，仅使用 Node.js 内建模块，为前端提供账号、积分、素材、场景与生成任务接口。

## 结构

```
server/
├── index.js     # HTTP 入口、路由分发、鉴权、请求体读取
├── db.js        # JSON 持久化与积分账本
├── worker.js    # 任务推进：fake 样图或 live 代调
├── vendor.js    # 按模型凭证调用上游 Images API
├── catalog.js   # 场景契约、模型列表、样图池
└── data/
    ├── db.json  # 运行时数据（gitignore）
    └── files/   # 上传素材字节（gitignore）
```

## 关键文件

| 文件 | 目的 |
|------|------|
| `index.js` | 路由分发：`/api/v1/*`，`sendJson`、`readBody`、`currentUser`、`issueToken` |
| `db.js` | `state`、`save`、`newId`、`addLedger`、`creditUser`、`freezeCredits`、`settleCredits`、`refundCredits`、`reconcileLedger`、`writeAssetFile`、`readAssetFile` |
| `worker.js` | `startJob(jobId)`：`queued → running → succeeded/failed` |
| `vendor.js` | `generateForJob(job)` / `generateTextForJob(job)` / `buildPrompt(job)`：读 `AMAM_VENDOR_*`。图像走 `/v1/images/generations` 或 `/edits`；文案走 `/v1/chat/completions`。分析/识图任务把商品图以 `image_url` Data-URL 放进 user content。套图 `params.slots` 时按版位分别出图。`no_text` 时从图像提示词剔除商品资料、待补稿和文案字段。SenseNova 编辑走 JSON `images[].image_url` Data-URL，`watermark: false`、`prompt_extend: false`；多张时连打 `n=1`。球球 Token 三档（`gpt-image-25-sunburst` / `gpt-image-25-flare` / `gpt-image-25`）共用 `AMAM_VENDOR_GPT_IMAGE_25_*`，generations JSON / edits multipart，并带 `quality`、`output_format=png`。图像提示词禁止发明画面文字，文案提示词禁止编造价格与资质 |
| `catalog.js` | `sceneSchemas`、`getScene`、`models`（对齐 `onlineModels`）、`samplePool` |

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

使用 `npm test` 运行 `tests/generation-pipeline.test.js`。测试通过 `AMAM_DB_FILE` 隔离存储。

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
