# Requirements Document

## Introduction

amam 图片工具目录里，图层拆分与去水印 Pro 已走场景工作台。P2 把高频单图编辑补齐契约并接入同一工作台：万能改图、商品白底、抠图、超清、放大 Pro、扩图、扩图 Pro、涂抹消除、AI 消除。本阶段涂抹类按整图编辑，蒙版可选；证件照、形象照、检测类与视频不在范围。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **amam API（API）**: 运行在 `0.0.0.0:8787` 的 Node.js BFF。
- **场景工作台（Scene Workbench）**: `ProductSceneView`。
- **P2 编辑场景（P2 Edit Scene）**: `ai-edit`、`white-bg`、`cutout-pro`、`upscale`、`upscale-pro`、`outpaint`、`outpaint-pro`、`eliminate-pro`、`remove-watermark`。

## Requirements

### Requirement 1

**User Story:** AS 创作者, I want 高频改图入口有独立契约, so that 我按一张主图和说明提交编辑任务

#### Acceptance Criteria

1. THE 场景契约集合 SHALL 为全部 9 个 P2 编辑场景各提供一条契约，`slug` 与工具目录一致。
2. THE 每条 P2 契约 SHALL 声明至少 1 张原图角色。
3. THE `ai-edit` 契约 SHALL 声明修改说明字段。
4. THE `white-bg` 契约 SHALL 说明生成电商白底并保留主体。
5. THE `cutout-pro` 契约 SHALL 声明边缘精度与底色字段。
6. THE `upscale` 与 `upscale-pro` 契约 SHALL 声明放大倍数字段。
7. THE `outpaint` 与 `outpaint-pro` 契约 SHALL 声明目标比例字段。
8. THE `eliminate-pro` 契约 SHALL 允许可选蒙版角色，并声明消除说明字段。
9. THE `remove-watermark` 契约 SHALL 声明需要消除的内容说明字段。

### Requirement 2

**User Story:** AS 创作者, I want 从图片工具目录进入这些场景后直接出图, so that 我不再停在方案页

#### Acceptance Criteria

1. WHEN 用户打开 `/tools/ai/{slug}` 且 slug 属于 P2 编辑场景, THE Frontend SHALL 渲染场景工作台。
2. WHEN 用户在 `/tools/ai` 点击已接入的 P2 场景卡片, THE Frontend SHALL 导航到 `/tools/ai/{slug}`。
3. THE 工具目录 SHALL 把 9 个 P2 场景的 `capability` 设为 `implemented`。
4. WHEN 必填原图已上传, THE Frontend SHALL 允许提交任务，并把 `scene` 设为该 slug。
5. WHEN 用户未登录并点击生成, THE Frontend SHALL 打开登录弹窗并阻止提交。

### Requirement 3

**User Story:** AS 创作者, I want 这些任务仍走现有图像代调, so that 有参考图时走编辑接口

#### Acceptance Criteria

1. WHEN 已登录用户提交有效 P2 任务, THE API SHALL 创建 `queued` 任务并冻结 4 积分。
2. WHEN 任务含参考图且图像模型凭证完整, THE API SHALL 调用上游编辑接口。
3. WHEN 上游返回图像, THE API SHALL 落为 `role=output` 资产并结算积分。
4. THE API SHALL 继续用场景契约组装提示词。
5. THE Frontend SHALL 仅为这些场景提供图像模型。

### Requirement 4

**User Story:** AS 开发者, I want 测试锁定 P2 slug 与目录映射, so that 工具入口不会漏接

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明 9 个 P2 slug 可通过 `POST /jobs` 创建任务。
2. THE 自动化测试 SHALL 证明工具目录中这 9 个场景均为 `implemented` 且 `targetRoute` 为 `/tools/ai/{slug}`。
3. THE 自动化测试 SHALL 证明现有图层拆分与去水印 Pro 仍为已接入。
