# Requirements Document

## Introduction

amam（复刻 aigc.easysu.cn）当前所有生成能力均为前端本地演示：登录写 `localStorage`、生成用 `setTimeout` + 随机样图、积分直接改本地数字。本规格定义一套最小可用的「生成任务管线」，让商品套图、商品场景和工作台通过统一的任务接口提交生成、轮询状态并展示结果，同时把账号态与积分改为以服务端为准。本阶段不接真实模型厂商，服务端用假 Worker 产出示例结果。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **amam API（API）**: 运行在 `127.0.0.1:8787` 的 Node.js BFF，挂载于 `/api/v1`。
- **任务（Job）**: 一次生成请求的服务端记录，包含场景、模型、参数、参考素材、状态与输出。
- **场景契约（Scene Contract）**: `src/data/sceneSchemas.json` 定义的场景、素材角色与表单字段。
- **冻结（Freeze）**: 创建任务时先行扣减的用户积分，任务失败时退回。
- **结算（Settle）**: 任务成功后确认扣减，不再退回。
- **会话令牌（Token）**: 登录后由 API 签发的随机字符串，前端通过 `Authorization: Bearer` 携带。

## Requirements

### Requirement 1

**User Story:** AS 访客, I want 用账号登录或注册, so that 我的积分与生成记录归属于我的账号

#### Acceptance Criteria

1. WHEN 用户提交非空的账号与不少于 4 位密码, THE API SHALL 返回会话令牌与包含 `id`、`name`、`account`、`credits` 的用户对象。
2. WHEN 用户提交的账号在服务端不存在, THE API SHALL 创建该账号并返回初始积分 128.5。
3. WHEN 前端收到成功登录响应, THE Frontend SHALL 将令牌写入 `localStorage` 并关闭登录弹窗。
4. IF 登录请求返回非 2xx 状态, THEN THE Frontend SHALL 在登录弹窗内展示服务端返回的错误信息。
5. WHILE 前端持有有效令牌, THE Frontend SHALL 在启动时通过 `GET /api/v1/me` 恢复用户与余额。

### Requirement 2

**User Story:** AS 创作者, I want 提交生成任务后异步拿到结果, so that 生成期间可以继续编辑和提交新任务

#### Acceptance Criteria

1. WHEN 前端提交包含有效场景、参数与参考素材的生成请求, THE API SHALL 创建状态为 `queued` 的任务并返回任务 `id`。
2. WHEN 任务被创建, THE API SHALL 按场景单价冻结发起用户的积分并写入积分流水。
3. WHILE 任务处于 `queued` 或 `running` 状态, THE Frontend SHALL 以不超过 1.5 秒的间隔轮询任务状态。
4. WHEN 任务成功, THE API SHALL 返回包含若干输出图片 URL 的 `succeeded` 任务, 且 THE API SHALL 结算已冻结的积分。
5. IF 任务失败, THEN THE API SHALL 返回带错误码的 `failed` 任务并将已冻结的积分退回。
6. WHILE 用户未登录, THE Frontend SHALL 打开登录弹窗并阻止提交任务。

### Requirement 3

**User Story:** AS 商家, I want 在商品套图与商品场景工作台填写参数并生成, so that 得到与我输入一致的成组图片

#### Acceptance Criteria

1. WHEN 商品套图页满足「有主图、有商品资料、至少一个输出版位」, THE Frontend SHALL 允许提交生成。
2. WHEN 商品场景页满足所有必填素材角色, THE Frontend SHALL 允许提交生成。
3. WHEN 商品场景页的生成成功, THE Frontend SHALL 在结果区渲染与 `outputCount` 一致数量的结果卡片。
4. WHEN 生成进行中, THE Frontend SHALL 禁用生成按钮并展示进行中文案。
5. WHEN 生成成功, THE Frontend SHALL 立即刷新顶部余额展示。

### Requirement 4

**User Story:** AS 创作者, I want 在「我的作品」「生成日志」查看历史任务, so that 我能回看和管理每次生成

#### Acceptance Criteria

1. WHEN 已登录用户打开作品或日志页, THE Frontend SHALL 调用 `GET /api/v1/jobs` 并渲染任务列表。
2. WHEN 任务列表为空, THE Frontend SHALL 展示空状态文案。
3. WHILE 任务仍在进行, THE Frontend SHALL 在列表项上展示进行中状态。
4. WHEN 用户点击任务条目的删除动作, THE Frontend SHALL 调用删除接口并从列表移除该任务。

### Requirement 5

**User Story:** AS 开发者, I want 通过 Vite 代理在本地与预览环境访问 API, so that 前后端同源、无需额外配置 CORS

#### Acceptance Criteria

1. THE Frontend SHALL 将 `/api/v1` 请求代理到 `http://127.0.0.1:8787`。
2. THE API SHALL 对未知路径返回 404 JSON。
3. WHEN 前端在无 API 运行时发起请求, THE Frontend SHALL 捕获错误并在界面提示，且不抛出未处理异常。
