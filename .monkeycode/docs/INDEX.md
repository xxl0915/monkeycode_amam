# amam 项目文档

本目录包含 amam（复刻 aigc.easysu.cn 的 AI 视觉创作平台）的架构、接口、开发者指南、核心概念与模块说明，面向新加入的开发者、需要集成的前端工程师与代码贡献者。

**快速链接**: [架构](./ARCHITECTURE.md) | [接口](./INTERFACES.md) | [开发者指南](./DEVELOPER_GUIDE.md)

---

## 核心文档

### 架构
系统设计、技术栈、项目结构、子系统与数据流程。从这里开始了解系统如何运作。
见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

### 接口
HTTP API 端点、请求/响应格式、错误码，以及前端 store 与组件接口。集成或使用本系统的参考。
见 [INTERFACES.md](./INTERFACES.md)。

### 开发者指南
环境搭建、运行命令、开发工作流、编码规范和常见任务。贡献者必读。
见 [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)。

---

## 模块

| 模块 | 描述 | 文档 |
|------|------|------|
| `server/` | 本地生成 API：账号、积分、素材与任务 | [server.md](./模块/server.md) |
| `src/api` + `src/store.js` | 前端 API 封装与全局会话/任务 store | [frontend-api-store.md](./模块/frontend-api-store.md) |
| `src/data/` | 业务目录与场景契约数据 | [data.md](./模块/data.md) |
| `src/views` + `src/components` | 页面与可复用组件 | [views-components.md](./模块/views-components.md) |
| `public/ic/` | 无限画布静态子应用 | [infinite-canvas.md](./模块/infinite-canvas.md) |

---

## 核心概念

理解这些领域概念有助于导航代码库：

| 概念 | 描述 | 文档 |
|------|------|------|
| Job | 一次生成请求的服务端记录与生命周期 | [Job.md](./专有概念/Job.md) |
| Credits 与 Ledger | 积分账本，余额 = 流水累计 | [Credits-Ledger.md](./专有概念/Credits-Ledger.md) |
| Scene Contract | 场景契约：素材角色、表单字段与产出模式 | [Scene-Contract.md](./专有概念/Scene-Contract.md) |
| Session | 服务端会话令牌与鉴权 | [Session.md](./专有概念/Session.md) |

---

## 入门指南

### 项目新人？

按此路径学习：

1. [架构](./ARCHITECTURE.md) - 了解全局
2. [核心概念](#核心概念) - 学习领域术语
3. [开发者指南](./DEVELOPER_GUIDE.md) - 搭建环境
4. [接口](./INTERFACES.md) - 探索公开 API

### 需要集成？

1. [接口](./INTERFACES.md) - API 契约与认证
2. [架构](./ARCHITECTURE.md) - 系统边界与数据流

### 首次贡献？

1. [开发者指南](./DEVELOPER_GUIDE.md) - 搭建与工作流
2. [常见任务](./DEVELOPER_GUIDE.md#常见任务) - 分步指南

---

## 快速参考

### 命令

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

### 重要文件

| 文件 | 目的 |
|------|------|
| `src/main.js` | 应用入口，挂载路由并执行 `bootstrap()` |
| `src/router.js` | 全部路由定义 |
| `src/store.js` | 全局会话与任务状态 |
| `server/index.js` | API 入口与路由分发 |
| `server/db.js` | JSON 持久化与积分账本 |
| `package.json` | 依赖与脚本 |
