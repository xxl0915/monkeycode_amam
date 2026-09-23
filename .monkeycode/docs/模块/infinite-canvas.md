# 无限画布子应用（public/ic）

无限画布是一个独立构建的静态子应用，挂载在 `/ic/` 路径下，与主 SPA 相互独立但共享同一静态资源服务。

## 结构

```
public/ic/
├── index.html        # 子应用入口
├── config.js         # 运行时配置
├── logo.svg          # 标识
├── assets/           # 构建产物（js/css，含 .gz 预压缩副本）
├── icons/            # 图标资源
├── plugins/          # 插件资源
└── prompt-sources/   # 提示词资源
```

## 关键文件

| 文件 | 目的 |
|------|------|
| `public/ic/index.html` | 子应用 SPA 入口 |
| `public/ic/assets/*.js` / `*.css` | 构建产物，由 Vite 中间件提供 gzip |
| `src/views/InfiniteCanvasView.vue` | `window.location.replace('/ic/canvas')` 跳转入口 |
| `vite.config.js` | `infiniteCanvasAssets()` 插件：路径重写 + gzip 服务 |

## 依赖

**本模块依赖**:

- 无（独立构建产物）

**依赖本模块的**:

- `src/layouts/PublicLayout.vue` - 顶栏「无限画布」链接与空闲预取
- `vite.config.js` - `/ic/` 路由重写与 `/ic/assets/*.js|.css` 的 gzip 响应

## 规范

### 代码模式

**路径重写**（`vite.config.js`）:

```js
if (path === '/ic' || path === '/ic/' || (path.startsWith('/ic/') && !/\.[a-zA-Z0-9]+$/.test(path))) {
  req.url = '/ic/index.html' + query
}
```

**gzip 服务**: 当请求 `Accept-Encoding: gzip` 且存在 `public/ic/assets/<file>.gz` 时返回预压缩内容，并补齐 `Content-Length`、`Cache-Control` 与 `Vary`。

**预取**（`PublicLayout.vue`）: 在空闲时拉取 `index.html`，解析其中的 js/css 并插入 `prefetch`/`preload` 链接；同时利用 `vendor` 单一分包避免加载卡顿。

### 错误处理

预取失败静默忽略（`.catch(() => {})`），不影响主应用。

### 测试

在主应用顶栏点击「无限画布」或访问 `/ic/canvas` 验证。
