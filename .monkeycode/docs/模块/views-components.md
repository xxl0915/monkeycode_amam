# views 与 components

页面与可复用组件的展示层。视图负责目录浏览、参数收集、任务提交与结果渲染；组件负责顶栏弹窗、图标与工作台外壳等可复用界面。

## 结构

```
src/
├── views/
│   ├── HomeView.vue              # 首页
│   ├── CatalogView.vue           # 通用目录页（商品图/POD/衍生）
│   ├── ProductSuiteView.vue      # 商品套图工作台（接任务管线）
│   ├── ProductSceneView.vue      # 场景工作台，按 schema 动态渲染
│   ├── WorkbenchView.vue         # 通用工作台（模特/视频/工具/平面/POD/衍生）
│   ├── BusinessCatalogView.vue   # 业务分类目录
│   ├── BusinessScenePlanView.vue # 业务场景方案页
│   ├── ModelPlazaView.vue        # 模特广场
│   ├── ToolsView.vue             # 图片工具
│   ├── PhotoEditView.vue         # 本地图片编辑
│   ├── DocsView.vue              # 文档页
│   ├── AboutView.vue             # 关于页
│   ├── SimplePage.vue            # 通用页面，可渲染任务列表
│   ├── PlaygroundView.vue        # 重定向到 /user
│   └── InfiniteCanvasView.vue    # 重定向到 /ic/canvas
└── components/
    ├── LoginModal.vue            # 登录/注册/找回密码
    ├── PayModal.vue              # 充值
    ├── SearchModal.vue           # 站内搜索
    ├── HelpDrawer.vue            # 帮助抽屉
    ├── SceneWorkbenchShell.vue   # 工作台外壳
    ├── Icon.vue                  # 图标
    └── LogoMark.vue              # 品牌 Logo
```

## 关键文件

| 文件 | 目的 |
|------|------|
| `ProductSuiteView.vue` | 上传商品图、选择版位、提交 `createJob` 并轮询渲染套图结果 |
| `ProductSceneView.vue` | 依据 `sceneSchemas.json` 动态渲染素材角色与字段，组装 refs 提交任务 |
| `WorkbenchView.vue` | 通用工作台，把参数与参考图提交为任务并渲染输出 |
| `SimplePage.vue` | `/logs` 与 `/mylogs` 的任务列表，含状态、时间、缩略图与删除 |
| `LoginModal.vue` | 异步登录/注册、`busy` 态、服务端错误展示 |
| `PayModal.vue` | 调用 `recharge`，未登录时唤起登录弹窗 |

## 依赖

**本模块依赖**:

- `src/store.js` - 会话与任务动作
- `src/data/*` - 目录与契约
- `vue-router` - 路由与跳转

**依赖本模块的**:

- `src/router.js` - 注册视图路由
- `src/layouts/PublicLayout.vue` - 挂载弹窗组件

## 规范

### 代码模式

**提交任务并轮询**:

```js
const job = await createJob({ scene, model, params, refs })
const finished = await pollJob(job.id)
if (finished.status !== 'succeeded') throw new Error(finished.error || '生成失败，请稍后重试')
```

**未登录拦截**:

```js
if (!store.user) { store.loginOpen = true; return }
```

### 错误处理

组件内 `try/catch` 捕获 `ApiError`，将 `e.message` 写入 `notice` / `error` 响应式变量以提示用户。

### 测试

无自动化测试；通过页面手工验证。

## 添加新文件

### 添加新工作台场景页

1. 在 `src/data/catalogs.js` 或 `sceneSchemas.json` 中添加场景
2. 复用 `WorkbenchView` / `ProductSceneView`，无需新建视图
3. 如为全新交互，创建 `src/views/*View.vue` 并在 `router.js` 注册
