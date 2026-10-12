# Requirements Document

## Introduction

工具箱里证件照制作、职业形象照、艺术写真照仍停在方案页。本规格为这 3 个入口补独立图像契约，并接入现有场景工作台。投前检测、点击率预测、涂抹蒙版与视频 live 不在本规格。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **amam API（API）**: 运行在 `0.0.0.0:8787` 的 Node.js BFF。
- **场景工作台（Scene Workbench）**: `ProductSceneView`。
- **人像出图场景（Portrait Scene）**: `id-photo`、`pro-portrait`、`art-portrait`。
- **分析类场景（Analysis Scene）**: `pre-check`、`click-rate`。

## Requirements

### Requirement 1

**User Story:** AS 创作者, I want 证件照和形象照入口有独立契约, so that 我按一张人物照和规格提交出图任务

#### Acceptance Criteria

1. THE 场景契约集合 SHALL 为 `id-photo`、`pro-portrait`、`art-portrait` 各提供一条契约，`slug` 与工具箱目录一致。
2. THE 每条人像出图场景契约 SHALL 声明至少 1 张人物照角色。
3. THE `id-photo` 契约 SHALL 声明证件规格、底色与着装方向字段。
4. THE `pro-portrait` 契约 SHALL 声明职业类型、着装正式程度与背景字段。
5. THE `art-portrait` 契约 SHALL 声明写真主题与视觉风格字段。
6. THE 人像出图场景契约 SHALL 把产出模式设为图像变体。
7. THE 场景契约集合在完成本规格后 SHALL 共有 96 条。

### Requirement 2

**User Story:** AS 创作者, I want 从工具箱进入这些入口后直接出图, so that 我不再停在方案页

#### Acceptance Criteria

1. WHEN 用户打开 `/tools/ai/{slug}` 且 slug 属于人像出图场景, THE Frontend SHALL 渲染场景工作台。
2. WHEN 用户在 `/tools/ai` 点击已接入的人像出图场景卡片, THE Frontend SHALL 导航到 `/tools/ai/{slug}`。
3. THE 工具箱目录 SHALL 把 3 个人像出图场景的 `capability` 设为 `implemented`，并提供 `targetRoute` 为 `/tools/ai/{slug}`。
4. THE 工具箱目录 SHALL 把 `pre-check` 与 `click-rate` 保持为 `planned`。
5. WHEN 必填人物照已上传, THE Frontend SHALL 允许提交任务，并把 `scene` 设为该 slug。
6. WHEN 用户未登录并点击生成, THE Frontend SHALL 打开登录弹窗并阻止提交。

### Requirement 3

**User Story:** AS 创作者, I want 这些任务仍走现有图像代调, so that 有参考图时走编辑接口并保留人物身份

#### Acceptance Criteria

1. WHEN 已登录用户提交有效人像出图任务, THE API SHALL 创建 `queued` 任务并冻结 4 积分。
2. WHEN 任务含参考图且图像模型凭证完整, THE API SHALL 调用上游编辑接口。
3. WHEN 上游返回图像, THE API SHALL 落为 `role=output` 资产并结算积分。
4. THE API SHALL 继续用场景契约组装提示词。
5. THE Frontend SHALL 仅为这些人像出图场景提供图像模型。
6. THE 人像出图场景提示词 SHALL 要求保留原图人物身份，并只改变服装、背景、规格或风格。

### Requirement 4

**User Story:** AS 开发者, I want 测试锁定人像出图 slug 与目录映射, so that 工具入口不会漏接

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明 3 个人像出图 slug 可通过 `POST /jobs` 创建任务。
2. THE 自动化测试 SHALL 证明工具箱目录中这 3 个场景均为 `implemented`，且 `targetRoute` 为 `/tools/ai/{slug}`。
3. THE 自动化测试 SHALL 证明 `pre-check` 与 `click-rate` 仍为 `planned`。
4. THE 自动化测试 SHALL 证明场景契约总数为 96。
