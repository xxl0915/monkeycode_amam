# Requirements Document

## Introduction

amam 平面设计目录除打印尺寸外仍停在方案页，电商素材目录的出图入口也未接通。P3 不新建独立契约，把可出图的平面与电商素材场景标为已接入，并通过 `targetRoute` 进入已有工作台。文案/标题生成、视频 live、证件照与涂抹蒙版不在本规格。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **平面设计目录（Graphic Catalog）**: `src/data/business.json` 中 `key=graphic-design` 的分类及其场景。
- **电商素材目录（Material Catalog）**: `src/data/business.json` 中 `key=material` 的分类及其场景，路由前缀为 `/ecommerce-assets`。
- **目标工作台（Target Workbench）**: `targetRoute` 指向的已有场景工作台，使用现有场景契约与 Job 管线。
- **文案场景（Copy Scene）**: `ai-copywriting` 与 `title-generator`，产出文本，本阶段保持逐步接入。

## Requirements

### Requirement 1

**User Story:** AS 创作者, I want 平面设计目录里的场景都能进入已验证的出图工作台, so that 我不用停在说明页

#### Acceptance Criteria

1. THE 平面设计目录 SHALL 为全部 6 个平面场景设置 `capability` 为 `implemented`，并提供 `targetRoute`。
2. WHEN 用户在 `/graphic-design` 点击某一平面场景卡片, THE Frontend SHALL 导航到该场景的 `targetRoute`。
3. WHEN 用户打开带 `targetRoute` 的 `/graphic-design/:scene`, THE Frontend SHALL 重定向到该 `targetRoute`。
4. WHEN 平面设计目录统计已接入数量, THE Frontend SHALL 把上述 6 个场景计为已接入。

### Requirement 2

**User Story:** AS 创作者, I want 每个平面入口落到语义接近的已有能力, so that 上传参考图或填写主题后能继续出图

#### Acceptance Criteria

1. THE 平面设计目录 SHALL 将 `free-poster` 指向 `/product-images/selling-point`。
2. THE 平面设计目录 SHALL 将 `cover-set` 指向 `/product-images/main-collage`。
3. THE 平面设计目录 SHALL 将 `print-size` 与 `flyer-fold` 指向 `/graphic-design/print-size`。
4. THE 平面设计目录 SHALL 将 `infographic` 指向 `/product-images/detail-sheet`。
5. THE 平面设计目录 SHALL 将 `design-longform` 指向 `/product-images/detail-page`。

### Requirement 3

**User Story:** AS 商家, I want 电商素材里能出图的入口进入已有工作台, so that 我能从商品资料继续生成销售图

#### Acceptance Criteria

1. THE 电商素材目录 SHALL 为 11 个出图场景设置 `capability` 为 `implemented`，并提供 `targetRoute`。
2. THE 电商素材目录 SHALL 将 `ai-copywriting` 与 `title-generator` 保持为 `planned`。
3. WHEN 用户在 `/ecommerce-assets` 点击已接入场景卡片, THE Frontend SHALL 导航到该场景的 `targetRoute`。
4. WHEN 用户打开带 `targetRoute` 的 `/ecommerce-assets/:scene`, THE Frontend SHALL 重定向到该 `targetRoute`。
5. WHEN 电商素材目录统计已接入数量, THE Frontend SHALL 只把上述 11 个出图场景计为已接入。

### Requirement 4

**User Story:** AS 商家, I want 每个电商出图入口落到语义接近的已有能力, so that 上传商品图后能继续出图

#### Acceptance Criteria

1. THE 电商素材目录 SHALL 将 `param-board`、`compare-chart` 与 `instruction-card` 指向 `/product-images/detail-sheet`。
2. THE 电商素材目录 SHALL 将 `feature-stack` 指向 `/product-images/selling-point`。
3. THE 电商素材目录 SHALL 将 `usage-scene` 指向 `/product-images/seeding`。
4. THE 电商素材目录 SHALL 将 `size-chart` 指向 `/pod-images/pod-size-image`。
5. THE 电商素材目录 SHALL 将 `package-design` 指向 `/product-images/product-composite`。
6. THE 电商素材目录 SHALL 将 `label-design` 与 `tag-design` 指向 `/graphic-design/print-size`。
7. THE 电商素材目录 SHALL 将 `package-series` 指向 `/product-images/suite`。
8. THE 电商素材目录 SHALL 将 `package-mockup` 指向 `/pod-images/print-mockup`。

### Requirement 5

**User Story:** AS 创作者, I want 从这些入口进入后仍走现有积分与图像代调, so that 计费和 Key 边界不变

#### Acceptance Criteria

1. WHEN 用户从平面或电商素材入口进入目标工作台并提交任务, THE Frontend SHALL 使用该工作台既有的场景 `slug`、角色与字段提交 `POST /api/v1/jobs`。
2. THE API SHALL 继续按现有图像代调、积分冻结与退款规则处理这些任务。
3. THE Frontend SHALL 不为平面设计和电商素材新增独立工作台组件。
4. THE 场景契约集合 SHALL 保持现有 88 条，不为这些入口新增契约。

### Requirement 6

**User Story:** AS 开发者, I want 映射关系可被测试锁定, so that 后续改目录时不会漏掉平面和电商入口

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明平面设计分类下每个场景的 `capability` 为 `implemented`。
2. THE 自动化测试 SHALL 证明每个平面场景的 `sceneRoute` 等于需求中的 `targetRoute`。
3. THE 自动化测试 SHALL 证明电商素材 11 个出图场景均为 `implemented`，且 `sceneRoute` 等于需求中的 `targetRoute`。
4. THE 自动化测试 SHALL 证明 `ai-copywriting` 与 `title-generator` 仍为 `planned`。
5. THE 自动化测试 SHALL 证明每个已接入 `targetRoute` 对应的工作台 slug 存在于场景契约中。
