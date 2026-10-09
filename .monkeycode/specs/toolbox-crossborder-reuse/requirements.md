# Requirements Document

## Introduction

SenseNova Token Plan 当前只有对话与 U1 图像接口，没有视频生成 API，P4 视频 live 暂缓。本规格把图片工具箱中仍停在方案页的出图入口，以及跨境上架里的套图入口，按 P1/P3 方式复用已有工作台。证件照/形象照、投前检测/点击率预测、跨境文案与合规、视频 live 不在本规格。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **工具箱目录（Toolbox Catalog）**: `src/data/business.json` 中 `key=toolbox` 的分类，路由前缀为 `/tools/ai`。
- **跨境目录（Cross-border Catalog）**: `src/data/business.json` 中 `key=cross-border` 的分类，路由前缀为 `/cross-border`。
- **目标工作台（Target Workbench）**: `targetRoute` 指向的已有场景工作台或本地工具页。
- **P4 暂缓场景（Deferred Scene）**: 证件照、职业形象照、艺术写真、投前检测、点击率预测、跨境 Listing 文案/本地化/合规，以及全部视频 live 场景。

## Requirements

### Requirement 1

**User Story:** AS 创作者, I want 工具箱里能出图的入口进入已有工作台, so that 我不用停在说明页

#### Acceptance Criteria

1. THE 工具箱目录 SHALL 为 12 个出图场景设置 `capability` 为 `implemented`，并提供 `targetRoute`。
2. THE 工具箱目录 SHALL 将 `id-photo`、`pro-portrait`、`art-portrait`、`pre-check`、`click-rate` 保持为 `planned`。
3. WHEN 用户在 `/tools/ai` 点击已接入场景卡片, THE Frontend SHALL 导航到该场景的 `targetRoute`。
4. WHEN 用户打开带外部 `targetRoute` 的 `/tools/ai/:scene`, THE Frontend SHALL 重定向到该 `targetRoute`。
5. WHEN 工具箱目录统计已接入数量, THE Frontend SHALL 把既有 18 个已接入场景与上述 12 个出图场景一并计为已接入。

### Requirement 2

**User Story:** AS 创作者, I want 每个工具箱出图入口落到语义接近的已有能力, so that 上传原图后能继续出图

#### Acceptance Criteria

1. THE 工具箱目录 SHALL 将 `product-explode` 指向 `/product-images/detail-sheet`。
2. THE 工具箱目录 SHALL 将 `logo-design` 指向 `/pod-images/print-design`。
3. THE 工具箱目录 SHALL 将 `image-translate`、`ai-text-edit`、`limb-fix` 与 `shoes-fix` 指向 `/tools/ai/ai-edit`。
4. THE 工具箱目录 SHALL 将 `product-pile` 与 `multi-image-fusion` 指向 `/product-images/product-composite`。
5. THE 工具箱目录 SHALL 将 `photo-style-transfer` 指向 `/pod-images/style-transfer`。
6. THE 工具箱目录 SHALL 将 `lineart-studio` 指向 `/derive-images/tech-sketch`。
7. THE 工具箱目录 SHALL 将 `smart-layout` 指向 `/graphic-design/print-size`。
8. THE 工具箱目录 SHALL 将 `clothes-fix` 指向 `/product-images/wrinkle-remove`。

### Requirement 3

**User Story:** AS 商家, I want 跨境上架里能出图的入口进入已有工作台, so that 我能继续生成销售套图

#### Acceptance Criteria

1. THE 跨境目录 SHALL 为 4 个出图场景设置 `capability` 为 `implemented`，并提供 `targetRoute`。
2. THE 跨境目录 SHALL 将 `listing-generate`、`listing-localize` 与 `listing-compliance` 保持为 `planned`。
3. THE 跨境目录 SHALL 将 `platform-image-set` 指向 `/product-images/suite`。
4. THE 跨境目录 SHALL 将 `language-size-matrix` 指向 `/product-images/clothing-ztc`。
5. THE 跨境目录 SHALL 将 `aplus-brand-story` 指向 `/product-images/detail-page`。
6. THE 跨境目录 SHALL 将 `sku-listing-pack` 指向 `/product-images/sku-image`。
7. WHEN 用户打开带 `targetRoute` 的 `/cross-border/:scene`, THE Frontend SHALL 重定向到该 `targetRoute`。

### Requirement 4

**User Story:** AS 创作者, I want 从这些入口进入后仍走现有积分与图像代调, so that 计费和 Key 边界不变

#### Acceptance Criteria

1. WHEN 用户从工具箱或跨境入口进入目标工作台并提交任务, THE Frontend SHALL 使用该工作台既有的场景 `slug`、角色与字段提交 `POST /api/v1/jobs`。
2. THE API SHALL 继续按现有图像代调、积分冻结与退款规则处理这些任务。
3. THE Frontend SHALL 不为这些入口新增独立工作台组件或场景契约。
4. THE 场景契约集合 SHALL 保持现有 88 条。

### Requirement 5

**User Story:** AS 开发者, I want 映射关系可被测试锁定, so that 后续改目录时不会漏接

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明工具箱 12 个出图场景均为 `implemented`，且 `targetRoute` 与需求一致。
2. THE 自动化测试 SHALL 证明证件照、形象照、写真、投前检测与点击率预测仍为 `planned`。
3. THE 自动化测试 SHALL 证明跨境 4 个出图场景均为 `implemented`，Listing 文案三类仍为 `planned`。
4. THE 自动化测试 SHALL 证明每个已接入 `targetRoute` 的工作台 slug 存在于场景契约或本地工具路由中。
