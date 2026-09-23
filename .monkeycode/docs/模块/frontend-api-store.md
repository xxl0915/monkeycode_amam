# 前端 API 层与全局 Store

该模块封装对本地生成 API 的访问（`src/api/client.js`）并维护全局会话、积分与任务状态（`src/store.js`），是视图组件与服务端之间的唯一通道。

## 结构

```
src/
├── api/
│   └── client.js   # fetch 封装、令牌注入、ApiError
└── store.js        # 响应式 store 与会话/任务动作
```

## 关键文件

| 文件 | 目的 |
|------|------|
| `src/api/client.js` | `request()` 统一处理请求、Bearer 令牌、错误转换；导出 `api` 方法集合 |
| `src/store.js` | `store` 响应式单例；`bootstrap`、`login`、`register`、`logout`、`recharge`、`loadJobs`、`createJob`、`deleteJob`、`pollJob`、`formatCredits` |

## 依赖

**本模块依赖**:

- `vue` - `reactive`
- 浏览器 `fetch`、`localStorage`

**依赖本模块的**:

- `src/layouts/PublicLayout.vue`
- `src/views/ProductSuiteView.vue`、`ProductSceneView.vue`、`WorkbenchView.vue`、`SimplePage.vue`
- `src/components/LoginModal.vue`、`PayModal.vue`

## 规范

### 代码模式

**新增接口封装**:

```js
// src/api/client.js
export const api = {
  // ...
  myNewAction: (payload) => request('/my-path', { method: 'POST', body: payload })
}
```

**新增 store 动作**:

```js
// src/store.js
export async function myAction(payload) {
  const data = await api.myNewAction(payload)
  store.user = data.user
  return data
}
```

### 错误处理

- `client.js` 将非 2xx 转为 `ApiError(message, status)`，网络异常转为 `ApiError(msg, 0)`
- 组件负责 `try/catch` 并展示 `e.message`
- `bootstrap()` 在令牌失效时静默清除令牌并置空 `store.user`

### 测试

无自动化测试；建议在浏览器控制台调用 store 动作验证。
