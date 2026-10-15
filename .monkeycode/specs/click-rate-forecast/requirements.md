# Requirements Document

Feature: click-rate-forecast
Updated: 2026-10-15

## Introduction

工具箱「点击率预测」目前是 `planned` 占位。本规格把它接入为文本场景：创作者上传一张或多张商品主图，系统逐张评估点击潜力、给出多图优选结论与维度诊断建议，走已有对话识图链路。投前检测已完成，本规格与其同构。

## Glossary

- **点击率预测**：对多张商品主图做点击潜力评估，输出逐张档位评分、优选结论与优化建议的文本报告
- **主推图**：多张候选主图中最适合优先投放的一张
- **点击档位**：预估点击潜力的三档定性结论（高 / 中 / 低），与精确百分比区分

## Requirements

### Requirement 1

**User Story:** AS 创作者, I want 上传多张主图并获得逐张点击评估, so that 我能选出主推图再投放

#### Acceptance Criteria

1. WHEN 用户在点击率预测工作台提交任务, THE 场景工作台 SHALL 要求至少 1 张、至多 4 张主图。
2. WHEN 任务包含图片与评估参数, THE API SHALL 冻结 4 积分并把任务派发到文本生成链路。
3. WHEN 文本生成链路收到点击率预测任务, THE API SHALL 把全部主图以 `image_url` Data-URL 按顺序放进对话 user content，并附评估指令。
4. IF 图片缺失, THE 工作台 SHALL 禁用生成按钮并提示先上传主图。

### Requirement 2

**User Story:** AS 创作者, I want 报告给出主推图结论与维度诊断, so that 我知道选哪张、怎么改

#### Acceptance Criteria

1. THE 评估指令 SHALL 要求逐张按主体吸引力、文字引导、色彩对比、场景氛围、平台适配五个维度诊断，并给出点击档位（高 / 中 / 低）。
2. THE 评估指令 SHALL 要求在多张候选中明确选出主推图并说明理由。
3. THE 评估指令 SHALL 要求以定性档位评估点击潜力，禁止编造精确百分比或历史 CTR 数据。
4. THE 评估指令 SHALL 要求缺失信息标「待补」，禁止编造价格、认证或规格。

### Requirement 3

**User Story:** AS 创作者, I want 指定投放平台与版位, so that 评估贴合实际投放环境

#### Acceptance Criteria

1. THE 契约 SHALL 提供「投放平台」下拉字段，含全部、抖音、天猫、小红书、拼多多、京东。
2. THE 契约 SHALL 提供可选「版位」与「投放目标」字段，并纳入评估指令。
3. WHEN 用户未选择平台, THE 契约 SHALL 默认「全部」。

### Requirement 4

**User Story:** AS 开发者, I want 测试锁定点击率预测链路, so that 契约与对话识图行为不被回归

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明 `click-rate` 契约 `outputMode` 为 `text` 且图片角色 `min=1`、`max=4`。
2. THE 自动化测试 SHALL 证明 fake 模式下 `click-rate` 任务返回含优选结论的样例文本。
3. THE 自动化测试 SHALL 证明 live 模式下 `click-rate` 任务把多张主图按顺序发进对话 completions 请求。

### Requirement 5

**User Story:** AS 创作者, I want 从工具箱目录直达点击率预测, so that 不再看到「逐步接入」占位

#### Acceptance Criteria

1. THE 工具箱目录 SHALL 把点击率预测条目指向 `/tools/ai/click-rate`。
2. WHEN 用户打开 `/tools/ai/click-rate`, THE 前端 SHALL 渲染点击率预测工作台。
