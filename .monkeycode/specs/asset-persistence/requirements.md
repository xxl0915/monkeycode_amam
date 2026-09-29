# Requirements Document

## Introduction

amam 生成任务管线已上线：登录、积分冻结/结算、任务创建与轮询均走服务端。参考素材仍停留在浏览器：`POST /api/v1/assets` 只回 `assetId` 不落盘，商品套图、商品场景与工作台把 `blob:` / 本地 preview URL 直接写入任务 `refs`。本规格把参考素材改为服务端持久化：登录用户上传图片后得到可访问的服务端 URL 与资产记录，任务 `refs` 只引用这些 URL（或已有静态样图路径），刷新或换设备后素材与任务引用仍可用。本阶段不接真实模型厂商，本地图片工具（裁剪/压缩等）仍只在浏览器处理。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **amam API（API）**: 运行在 `0.0.0.0:8787` 的 Node.js BFF，挂载于 `/api/v1`。
- **资产（Asset）**: 一条属于登录用户的参考素材记录，包含 `id`、文件名、角色、MIME、字节数与可访问 URL。
- **参考引用（Ref）**: 任务 `refs` 中的一项，包含 `role`、`name`、`url`，可选 `assetId` 与 `main`。
- **静态样图（Sample）**: 站点内已有的静态路径，例如 `/product-scenes/samples/*.webp`，无需再上传。
- **会话令牌（Token）**: 登录后由 API 签发的随机字符串，前端通过 `Authorization: Bearer` 携带。
- **生成工作台（Workbench Pages）**: 商品套图页、商品场景页与通用工作台页。

## Requirements

### Requirement 1

**User Story:** AS 已登录创作者, I want 把本地图片上传为服务端资产, so that 生成任务可以引用稳定的素材地址

#### Acceptance Criteria

1. WHEN 已登录用户以 JSON 提交 `name`、`role`、`mime` 与 base64 字段 `data` 且图片符合类型与大小限制, THE API SHALL 写入资产记录并返回 `assetId`、`name`、`role`、`url`。
2. WHEN 上传成功, THE API SHALL 将返回的 `url` 设为 `/api/v1/assets/{assetId}/file`。
3. WHEN 未携带有效令牌的请求访问上传接口, THE API SHALL 返回 `401` 与 `error` 为 `unauthorized`。
4. IF 请求体缺失图片内容或 MIME 不属于 `image/png`、`image/jpeg`、`image/webp`、`image/gif`, THEN THE API SHALL 返回 `400` 与可展示的错误信息。
5. IF 解码后的单张图片超过 6 MiB, THEN THE API SHALL 返回 `413` 与可展示的错误信息。

### Requirement 2

**User Story:** AS 已登录创作者, I want 用资产 URL 直接显示图片, so that 缩略图与任务引用在刷新后仍能显示

#### Acceptance Criteria

1. WHEN 客户端请求已存在资产的图片路径, THE API SHALL 返回该文件的原始字节与对应 `Content-Type`，且不要求 `Authorization` 头。
2. IF 资产记录或文件不存在, THEN THE API SHALL 返回 `404` 与 `error` 为 `not_found`。
3. WHEN 已登录用户请求本人资产列表, THE API SHALL 返回该用户资产的 `id`、`name`、`role`、`url`、`createdAt` 数组。
4. IF 未携带有效令牌的请求访问资产列表, THEN THE API SHALL 返回 `401` 与 `error` 为 `unauthorized`。

### Requirement 3

**User Story:** AS 商家, I want 在生成工作台选图后自动得到服务端 URL, so that 提交任务时不再把 `blob:` 地址发给 API

#### Acceptance Criteria

1. WHEN 用户在生成工作台（商品套图、商品场景、通用工作台）选择本地图片且当前已登录, THE Frontend SHALL 调用上传接口，并用返回的 `url` 替换该条目的预览地址。
2. WHEN 用户在未登录时选择本地图片, THE Frontend SHALL 用 `blob:` 预览该条目，并在登录成功后或提交生成前补传该文件。
3. WHEN 用户使用内置静态样图, THE Frontend SHALL 将样图的站点路径作为 `url` 写入任务 `refs`，且不调用上传接口。
4. WHEN 用户提交生成任务, THE Frontend SHALL 使每条 `refs[].url` 以 `/api/v1/assets/`、`/product-scenes/` 或 `/business/` 开头。
5. WHILE 某张本地图片仍在上传, THE Frontend SHALL 阻止用该条目提交生成，并展示上传中状态。
6. IF 单张图片上传失败, THEN THE Frontend SHALL 在该条目或表单区域展示错误信息，且保留已成功的其他条目。

### Requirement 4

**User Story:** AS 创作者, I want 创建任务时服务端校验参考地址, so that 任务只绑定可读取的素材

#### Acceptance Criteria

1. WHEN 任务 `refs` 中的 `url` 指向调用者本人的已存在资产, THE API SHALL 接受该引用并在任务记录中保留 `url` 与对应 `assetId`（若请求携带或可解析）。
2. WHEN 任务 `refs` 中的 `url` 为站点静态样图路径且以 `/product-scenes/` 或 `/business/` 开头, THE API SHALL 接受该引用。
3. IF 某条 `refs[].url` 为 `blob:`、`data:` 或缺少主机内可解析路径, THEN THE API SHALL 拒绝创建任务并返回 `400` 与 `error` 为 `invalid_ref`。
4. IF 某条 `refs[].url` 指向其他用户的资产, THEN THE API SHALL 拒绝创建任务并返回 `400` 与 `error` 为 `invalid_ref`。

### Requirement 5

**User Story:** AS 开发者, I want 运行时素材文件与数据库一样被忽略且可被测试隔离, so that 仓库不含用户图片、测试不污染运行时数据

#### Acceptance Criteria

1. THE API SHALL 将资产元数据写入与现有 `db.json` 相同的持久化文件，并将图片字节写入该数据目录下的独立文件。
2. WHEN 环境变量 `AMAM_DB_FILE` 指向测试目录, THE API SHALL 把资产元数据与图片字节都放在该测试目录内。
3. THE 仓库 gitignore 规则 SHALL 覆盖运行时数据目录 `server/data/`，使默认运行产生的图片与 `db.json` 不被提交。
