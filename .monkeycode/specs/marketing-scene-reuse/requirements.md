# Requirements Document

## Introduction

amam 营销目录有 14 个场景，目前仅「社媒种草图」跳到商品种草工作台，其余停留在方案页。P1 不新建独立营销契约，把剩余营销场景标为已接入，并通过 `targetRoute` 进入已有商品图工作台。大促整套物料进入商品套图。视频、跨境文案、图像编辑工具不在本规格。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **营销目录（Marketing Catalog）**: `src/data/business.json` 中 `key=marketing` 的分类及其场景。
- **目标工作台（Target Workbench）**: `targetRoute` 指向的已有商品图页面，使用现有场景契约与 Job 管线。
- **方案页（Plan Page）**: `BusinessScenePlanView`，展示输入输出说明且不提交任务。

## Requirements

### Requirement 1

**User Story:** AS 商家, I want 营销目录里的场景都能进入已验证的出图工作台, so that 我不用停在说明页

#### Acceptance Criteria

1. THE 营销目录 SHALL 为全部 14 个营销场景设置 `capability` 为 `implemented`，并提供以 `/product-images/` 开头的 `targetRoute`。
2. WHEN 用户在 `/marketing` 点击某一营销场景卡片, THE Frontend SHALL 导航到该场景的 `targetRoute`。
3. WHEN 用户打开带 `targetRoute` 的 `/marketing/:scene`, THE Frontend SHALL 重定向到该 `targetRoute`。
4. WHEN 营销目录统计已接入数量, THE Frontend SHALL 把上述 14 个场景计为已接入。

### Requirement 2

**User Story:** AS 商家, I want 每个营销入口落到语义接近的商品图能力, so that 上传商品图后能继续出图

#### Acceptance Criteria

1. THE 营销目录 SHALL 将 `main-image` 指向 `/product-images/hero-image`。
2. THE 营销目录 SHALL 将 `poster-replica` 指向 `/product-images/hot-replica`。
3. THE 营销目录 SHALL 将 `social-card`、`festival`、`creative-variants` 指向 `/product-images/seeding`。
4. THE 营销目录 SHALL 将 `marketing-image`、`ai-poster`、`image-copy`、`popup` 指向 `/product-images/selling-point`。
5. THE 营销目录 SHALL 将 `banner` 指向 `/product-images/clothing-ztc`。
6. THE 营销目录 SHALL 将 `live-bg` 指向 `/product-images/product-composite`。
7. THE 营销目录 SHALL 将 `creator-cover` 与 `graphic-cover` 指向 `/product-images/main-collage`。
8. THE 营销目录 SHALL 将 `campaign-kit` 指向 `/product-images/suite`。

### Requirement 3

**User Story:** AS 创作者, I want 从营销入口进入后仍走现有积分与图像代调, so that 计费和 Key 边界不变

#### Acceptance Criteria

1. WHEN 用户从营销入口进入目标工作台并提交任务, THE Frontend SHALL 使用该工作台既有的场景 `slug`、角色与字段提交 `POST /api/v1/jobs`。
2. THE API SHALL 继续按现有图像代调、积分冻结与退款规则处理这些任务。
3. THE Frontend SHALL 不为营销场景新增独立工作台组件。

### Requirement 4

**User Story:** AS 开发者, I want 映射关系可被测试锁定, so that 后续改目录时不会漏掉营销入口

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明营销分类下每个场景的 `capability` 为 `implemented`。
2. THE 自动化测试 SHALL 证明每个营销场景的 `sceneRoute` 等于需求中的 `targetRoute`。
3. THE 自动化测试 SHALL 证明每个 `targetRoute` 对应的商品图 `slug` 存在于场景契约中。
