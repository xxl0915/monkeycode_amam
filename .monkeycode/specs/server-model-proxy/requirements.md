# Requirements Document

## Introduction

amam 生成任务管线与参考素材持久化已上线：登录、积分冻结/结算、任务创建与轮询、资产落盘均走服务端。Worker 仍用内置样图模拟生成。本规格把 Worker 从假样图改为服务端代调真实图像模型：API 用服务端持有的厂商凭证调用上游，把返回图片落为资产并写回任务 `outputs`。厂商 Key 只存在于服务端环境变量，前端与任务 JSON 均不携带密钥。本阶段只覆盖图像生成（含参考图），视频模型与无限画布 `/ic/` 不改。本地图片工具仍只在浏览器处理。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **amam API（API）**: 运行在 `0.0.0.0:8787` 的 Node.js BFF，挂载于 `/api/v1`。
- **任务（Job）**: 一次生成请求的服务端记录，包含场景、模型、参数、参考素材、状态与输出。
- **资产（Asset）**: 一条属于登录用户的图片记录，包含 `id`、文件名、角色、MIME、字节数与可访问 URL。
- **参考引用（Ref）**: 任务 `refs` 中的一项，包含 `role`、`name`、`url`，可选 `assetId` 与 `main`。
- **厂商凭证（Vendor Credential）**: 某一图像模型在服务端环境变量中的上游 API Key、Base URL 与上游模型名，仅 Worker 读取。
- **上游提供方（Provider）**: 实际执行该图像模型生成的外部 HTTP 服务。
- **模型路由（Model Route）**: 前端图像模型 id 到该模型专属凭证、上游模型名与调用方式的映射。
- **图像模型（Image Model）**: `video` 为假的模型，用于文生图或图生图。
- **生成工作台（Workbench Pages）**: 商品套图页、商品场景页与通用工作台页。
- **会话令牌（Token）**: 登录后由 API 签发的随机字符串，前端通过 `Authorization: Bearer` 携带。

## Requirements

### Requirement 1

**User Story:** AS 已登录创作者, I want 提交图像生成任务后拿到真实模型产出的图片, so that 结果与我选择的模型和参考图相关

#### Acceptance Criteria

1. WHEN 已登录用户提交包含有效场景、图像模型 id、参数与合法 `refs` 的任务, THE API SHALL 创建状态为 `queued` 的任务并冻结积分。
2. WHEN 任务进入 `running`, THE API SHALL 使用服务端厂商凭证调用与该模型 id 对应的上游图像接口。
3. WHEN 上游返回成功的图像字节, THE API SHALL 将每张结果写入调用者名下的资产，并把任务 `outputs` 设为这些资产的 `/api/v1/assets/{id}/file` URL。
4. WHEN 任务成功, THE API SHALL 将任务状态设为 `succeeded` 并结算已冻结积分。
5. WHILE 任务处于 `queued` 或 `running`, THE Frontend SHALL 继续以现有间隔轮询任务状态并在成功后渲染 `outputs`。

### Requirement 2

**User Story:** AS 平台运营者, I want 厂商 Key 只留在服务端, so that 浏览器与任务记录都拿不到上游凭证

#### Acceptance Criteria

1. THE API SHALL 为每个图像模型 id 从该模型专属的服务端环境变量读取厂商凭证，变量名使用 `AMAM_VENDOR_` 前缀，与 Agent 运行环境变量名隔离。
2. WHEN API 返回任务、用户、模型列表或错误, THE API SHALL 使响应 JSON 不含厂商凭证字段或凭证值。
3. THE Frontend SHALL 继续只携带会话令牌调用 `/api/v1`，且不在请求体、查询参数或 `localStorage` 中存放厂商凭证。
4. IF 当前任务所用图像模型缺少 Key 或 Base URL, THEN THE API SHALL 将任务标为 `failed`，写入可展示错误码 `vendor_unconfigured`，并退回已冻结积分。
5. WHEN 某一图像模型缺少凭证, THE API SHALL 仍允许使用已配置凭证的其他图像模型创建并完成任务。

### Requirement 3

**User Story:** AS 创作者, I want 按工作台所选模型走对应上游能力, so that 文生图与带参考图的生成都能完成

#### Acceptance Criteria

1. WHEN `GET /api/v1/models` 被调用, THE API SHALL 返回与前端 `onlineModels` 对齐的列表，图像项的 `id` 为 `nano-banana`、`nano-pro`、`seedream`、`gpt-image`，每项含 `id`、`name`、`video`。
2. WHEN 任务的 `model` 为已知图像模型 id, THE API SHALL 按模型路由使用该 id 对应的专属凭证与上游模型名发起调用。
3. WHEN 任务 `refs` 为空, THE API SHALL 以文生图方式调用上游，提示词来自任务 `params` 中的场景说明与用户输入文本。
4. WHEN 任务 `refs` 含本人资产或静态样图, THE API SHALL 读取这些图片字节并作为参考图随请求发给上游。
5. IF 任务的 `model` 为未知 id 或 `video` 为真, THEN THE API SHALL 将任务标为 `failed`，写入错误码 `unsupported_model`，并退回已冻结积分。

### Requirement 4

**User Story:** AS 创作者, I want 上游失败时任务失败并退积分, so that 我不会为未产出的结果付费

#### Acceptance Criteria

1. IF 上游在配置的等待时限内返回错误或拒绝, THEN THE API SHALL 将任务标为 `failed`，写入错误码 `vendor_error`，并退回已冻结积分。
2. IF 上游在配置的等待时限内未完成, THEN THE API SHALL 将任务标为 `failed`，写入错误码 `vendor_timeout`，并退回已冻结积分。
3. IF 上游成功响应中不含可用图像字节, THEN THE API SHALL 将任务标为 `failed`，写入错误码 `vendor_empty`，并退回已冻结积分。
4. WHEN 任务失败, THE API SHALL 使 `GET /api/v1/jobs/:id` 返回该任务的 `error` 字段，且 THE Frontend SHALL 展示对应中文说明。
5. THE API SHALL 对同一任务只结算或退款一次。

### Requirement 5

**User Story:** AS 开发者, I want 无凭证或测试环境下仍能验证任务生命周期, so that CI 不依赖真实上游

#### Acceptance Criteria

1. WHEN 环境变量 `AMAM_VENDOR_MODE` 为 `fake`, THE API SHALL 使用现有假 Worker 样图路径产出 `outputs`，且不发起上游 HTTP 请求。
2. WHEN `AMAM_VENDOR_MODE` 缺省或为 `live`, THE API SHALL 按模型路由调用真实上游。
3. THE 自动化测试 SHALL 在 `AMAM_VENDOR_MODE=fake` 与隔离的 `AMAM_DB_FILE` 下覆盖：成功落盘输出、`vendor_unconfigured`、`unsupported_model`、超时失败退款。
4. THE API SHALL 继续使用 Node 内置模块发起上游 HTTP 请求，运行时不新增第三方 npm 依赖。
