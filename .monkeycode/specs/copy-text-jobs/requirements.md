# Requirements Document

## Introduction

电商素材文案/标题与跨境 Listing 文案三类原先停在方案页。SenseNova Token Plan 提供 OpenAI 兼容对话接口。本规格把这 5 个场景接到现有任务管线：冻结积分、对话代调、文本结果落在 `job.outputs`。不改图像代调、不接视频、不接证件照与投前检测。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **API**: `server/` 下零第三方依赖的 Node HTTP 服务。
- **文案场景（Copy Scene）**: `ai-copywriting`、`title-generator`、`listing-generate`、`listing-localize`、`listing-compliance`。
- **文案工作台（Copy Workbench）**: 收集商品资料并展示可复制文本结果的页面。
- **对话代调（Chat Proxy）**: 服务端调用上游 `/v1/chat/completions`。
- **文本产出（Text Output）**: `job.outputs[]` 中带 `text` 字段的条目。

## Requirements

### Requirement 1

**User Story:** AS 商家, I want 文案与标题入口进入可提交的工作台, so that 我能根据商品资料生成可复制文本

#### Acceptance Criteria

1. THE 电商素材目录 SHALL 将 `ai-copywriting` 与 `title-generator` 标记为 `implemented`。
2. THE 跨境目录 SHALL 将 `listing-generate`、`listing-localize` 与 `listing-compliance` 标记为 `implemented`。
3. WHEN 用户打开这 5 个入口, THE Frontend SHALL 进入文案工作台。
4. THE 5 个文案场景 SHALL 各自拥有场景契约，且 `outputMode` 为 `text`。
5. THE 场景契约集合 SHALL 在现有 88 条基础上增加这 5 条。

### Requirement 2

**User Story:** AS 商家, I want 提交文案任务后得到文本结果, so that 我能复制标题、卖点和 Listing

#### Acceptance Criteria

1. WHEN 用户在文案工作台提交任务, THE Frontend SHALL 调用 `POST /api/v1/jobs`，`scene` 为该文案场景 slug。
2. THE API SHALL 按现有规则冻结 `COST_PER_JOB` 积分。
3. WHEN 文案任务成功, THE API SHALL 把文本写入 `job.outputs[].text`。
4. WHEN 文案任务失败, THE API SHALL 退还该任务已冻结积分，并写入现有错误码。
5. THE Frontend SHALL 在结果区展示可复制文本。

### Requirement 3

**User Story:** AS 开发者, I want 文案走对话代调而图像仍走 Images API, so that 两类任务互不影响

#### Acceptance Criteria

1. WHEN 文案任务处于 `AMAM_VENDOR_MODE=live`, THE API SHALL 调用上游 `/v1/chat/completions`。
2. WHEN 图像任务处于 live, THE API SHALL 继续调用 Images generations/edits。
3. IF 对话凭证缺失, THE API SHALL 将文案任务标记为 `vendor_unconfigured` 并退款。
4. WHILE `AMAM_VENDOR_MODE=fake`, THE API SHALL 为文案任务返回样例文本。
5. THE 对话凭证 SHALL 只从服务端 `AMAM_VENDOR_*` 环境变量读取。

### Requirement 4

**User Story:** AS 商家, I want 文案不编造价格和资质, so that 我能直接使用生成文本

#### Acceptance Criteria

1. THE 对话提示词 SHALL 要求只使用用户提供的商品资料。
2. THE 对话提示词 SHALL 要求缺失价格、认证或规格时保持空白并标明待补。
3. THE 文案工作台 SHALL 在用户未填写主资料且未上传参考图时阻止提交。

### Requirement 5

**User Story:** AS 开发者, I want 文案映射与对话代调可被测试锁定, so that 后续改目录时不会漏接

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明 5 个文案场景均为 `implemented`，且契约 `outputMode` 为 `text`。
2. THE 自动化测试 SHALL 证明 fake 文案任务成功时 `outputs[].text` 非空。
3. THE 自动化测试 SHALL 证明 live 文案任务请求 `/v1/chat/completions`。
4. THE 自动化测试 SHALL 证明图像任务不请求 `/v1/chat/completions`。
