# Requirements Document

Feature: pre-check-analysis
Updated: 2026-10-15

## Introduction

工具箱「投前检测」目前是 `planned` 占位。本规格把它接入为文本场景：创作者上传待投放图片，系统按主体、文字、构图与平台投放风险生成结构化检测报告，走已有对话识图链路。人像、视频与投前检测以外的 planned 项不在本规格。

## Glossary

- **投前检测**：对单张或多张待投放图片做主体、文字、构图、平台风险四个维度的检查，输出文本报告
- **检测报告**：按维度分节、含风险等级与优化建议的文本结果
- **投放平台**：图片计划投放的平台（全部、抖音、天猫、小红书、拼多多、京东）

## Requirements

### Requirement 1

**User Story:** AS 创作者, I want 上传待投放图片并获得结构化检测报告, so that 投放前能先修正风险项

#### Acceptance Criteria

1. WHEN 用户在投前检测工作台提交任务, THE 场景工作台 SHALL 要求至少 1 张待检测图片。
2. WHEN 任务包含图片与检测参数, THE API SHALL 冻结 4 积分并把任务派发到文本生成链路。
3. WHEN 文本生成链路收到投前检测任务, THE API SHALL 把图片以 `image_url` Data-URL 放进对话 user content，并附检测指令。
4. IF 图片缺失, THE 工作台 SHALL 禁用生成按钮并提示先上传待检测图片。

### Requirement 2

**User Story:** AS 创作者, I want 检测报告按维度分节并给出风险等级, so that 我能逐项修改图片

#### Acceptance Criteria

1. THE 检测指令 SHALL 要求报告覆盖主体、文字、构图、平台风险四个维度。
2. THE 检测指令 SHALL 要求每个维度给出风险等级（通过 / 低风险 / 高风险）与具体优化建议。
3. THE 检测指令 SHALL 要求缺失信息标「待补」，禁止编造价格、认证、规格或审核结论。

### Requirement 3

**User Story:** AS 创作者, I want 选择投放平台与版位, so that 报告贴合实际投放环境

#### Acceptance Criteria

1. THE 契约 SHALL 提供「投放平台」下拉字段，含全部、抖音、天猫、小红书、拼多多、京东。
2. THE 契约 SHALL 提供可选「版位」与「投放目标」字段，并纳入检测指令。
3. WHEN 用户未选择平台, THE 契约 SHALL 默认「全部」。

### Requirement 4

**User Story:** AS 开发者, I want 测试锁定投前检测链路, so that 契约与对话识图行为不被回归

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明 `pre-check` 契约 `outputMode` 为 `text`。
2. THE 自动化测试 SHALL 证明 fake 模式下 `pre-check` 任务返回文本样例并退款为 0 扣费路径与文案任务一致。
3. THE 自动化测试 SHALL 证明 live 模式下 `pre-check` 任务把图片发进对话 completions 请求。

### Requirement 5

**User Story:** AS 创作者, I want 从工具箱目录直达投前检测, so that 不再看到「逐步接入」占位

#### Acceptance Criteria

1. THE 工具箱目录 SHALL 把投前检测条目指向 `/tools/ai/pre-check`。
2. WHEN 用户打开 `/tools/ai/pre-check`, THE 前端 SHALL 渲染投前检测工作台。
