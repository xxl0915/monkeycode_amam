# Requirements Document

## Introduction

涂抹消除、局部替换、产品替换、商品换背景与商品精修已声明可选 `mask` 角色，但工作台只能上传图片，厂商 edits 也把全部参考图当作 `image[]`。本规格为这些场景补画笔蒙版，并把蒙版作为独立 `mask` 传给上游编辑接口。无蒙版时仍按文字说明整图编辑。人像、文案、视频与投前检测不在本规格。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **amam API（API）**: 运行在 `0.0.0.0:8787` 的 Node.js BFF。
- **场景工作台（Scene Workbench）**: `ProductSceneView`。
- **蒙版场景（Mask Scene）**: `eliminate-pro`、`local-replace`、`material-apply`、`change-bg`、`product-retouch-pro`。
- **蒙版角色（Mask Role）**: 场景契约中 `key=mask` 的参考素材角色。
- **画笔蒙版（Painted Mask）**: 用户在原图上涂抹后导出的 PNG，白色不透明区域保留，透明区域交给上游编辑。
- **厂商代调（Vendor Proxy）**: `server/vendor.js` 对 `/v1/images/edits` 的调用。

## Requirements

### Requirement 1

**User Story:** AS 创作者, I want 在蒙版场景里对着原图涂抹区域, so that 我能指定编辑范围而不必先做一张蒙版图

#### Acceptance Criteria

1. WHEN 当前场景声明蒙版角色且已有至少 1 张非蒙版参考图, THE 场景工作台 SHALL 为蒙版角色提供涂抹入口。
2. WHEN 用户打开涂抹入口, THE 场景工作台 SHALL 以第一张非蒙版参考图为底图，并提供画笔、橡皮、笔刷大小与清空。
3. WHEN 用户完成涂抹并确认, THE 场景工作台 SHALL 导出一张与底图相同像素尺寸的 PNG 蒙版，写入蒙版角色，且最多保留 1 张。
4. THE 导出的画笔蒙版 SHALL 把涂抹区域写成全透明像素，并把未涂抹区域写成不透明像素。
5. THE 场景工作台 SHALL 继续允许用户直接上传一张蒙版图。
6. WHEN 蒙版角色已有图片, THE 场景工作台 SHALL 允许删除后重新涂抹或重新上传。

### Requirement 2

**User Story:** AS 创作者, I want 不涂抹也能提交, so that 我仍可按文字说明做整图编辑

#### Acceptance Criteria

1. THE 5 个蒙版场景的蒙版角色 SHALL 保持 `min=0`。
2. WHEN 必填非蒙版参考图已齐且蒙版角色为空, THE 场景工作台 SHALL 允许提交任务。
3. WHEN 用户在未上传非蒙版参考图时打开涂抹入口, THE 场景工作台 SHALL 提示先上传原图，并保持涂抹面板关闭。
4. WHEN 提交任务且用户已确认蒙版, THE 场景工作台 SHALL 把该图片作为 `refs.role=mask` 交给 API。

### Requirement 3

**User Story:** AS 创作者, I want 蒙版按编辑接口的 mask 字段上传, so that 上游只改涂抹区域

#### Acceptance Criteria

1. WHEN 任务参考图含 `role=mask` 且图像模型凭证完整, THE API SHALL 调用上游编辑接口。
2. WHEN 厂商代调走球球 Token multipart 编辑且任务含蒙版, THE API SHALL 把蒙版作为最后一张 `image[]` 参考图，并在提示词中说明透明像素为编辑区域。
3. WHEN 厂商代调走非球球 multipart 编辑且任务含蒙版, THE API SHALL 把非蒙版参考图放进字段名 `image`，并把第一张蒙版放进字段名 `mask`。
4. WHEN 厂商代调走 SenseNova JSON 编辑, THE API SHALL 把非蒙版参考图放进 `images[].image_url`，并把第一张蒙版放进 `mask.image_url`。
5. WHEN 任务没有蒙版参考图, THE API SHALL 保持现有整图编辑请求体，不附加 mask 字段。
6. THE API SHALL 继续用场景契约组装提示词，并在提示词中保留蒙版角色标签。

### Requirement 4

**User Story:** AS 开发者, I want 测试锁定蒙版拆分, so that 以后改 edits 不会再把蒙版混进 image[]

#### Acceptance Criteria

1. THE 自动化测试 SHALL 证明非球球 multipart 编辑在同时上传原图与蒙版时包含 `image` 与 `mask`，且不含 `image[]`。
2. THE 自动化测试 SHALL 证明球球 Token multipart 编辑把蒙版放进 `image[]`，请求不含独立 `mask` 字段，且提示词说明透明区域。
3. THE 自动化测试 SHALL 证明 SenseNova JSON 编辑请求的 `images` 只含非蒙版图，且 `mask.image_url` 为 Data-URL。
4. THE 自动化测试 SHALL 证明无蒙版的编辑请求不包含 mask 字段。
5. THE 自动化测试 SHALL 证明 5 个蒙版场景的蒙版角色均为可选。
