# Requirements Document

## Introduction

amam 已能对图像模型走服务端代调，但 Worker 只拼接场景名与少量文本字段，商品图与模特图的契约字段基本不进入上游提示词。POD、爆款衍生以及图层拆分、去水印 Pro、打印尺寸仍使用通用工作台，没有角色与字段契约。本规格补齐 P0：按场景契约组装上游提示词；为 POD 15 个场景、爆款衍生 11 个场景、以及图层拆分、去水印 Pro、打印尺寸补契约并接入场景工作台。本阶段不接入视频 live 代调，不改无限画布与本地图片工具。营销场景延后到 P1，采用跳转到已有商品图工作台。

## Glossary

- **amam 前端（Frontend）**: `/workspace/src` 下的 Vue 3 + Vite 单页应用。
- **amam API（API）**: 运行在 `0.0.0.0:8787` 的 Node.js BFF，挂载于 `/api/v1`。
- **任务（Job）**: 一次生成请求的服务端记录，包含场景、模型、参数、参考素材、状态与输出。
- **场景契约（Scene Contract）**: `src/data/sceneSchemas.json` 中一条记录，声明 `slug`、`title`、`roles`、`fields`、`maxOutputs`、`defaultRatio`、`outputMode`、`instruction`。
- **场景工作台（Scene Workbench）**: `ProductSceneView`，按场景契约渲染角色上传区与动态表单并提交任务。
- **套图工作台（Suite Workbench）**: `ProductSuiteView`，商品套图专用页面。
- **通用工作台（Generic Workbench）**: `WorkbenchView`，通用 prompt / 模型 / 参考图表单。
- **参考引用（Ref）**: 任务 `refs` 中的一项，包含 `role`、`name`、`url`，可选 `assetId`。
- **提示词组装（Prompt Assembly）**: Worker 根据场景契约、角色与表单字段生成发给上游的文本提示词。
- **P0 目标场景（P0 Target Scene）**: POD 目录 15 个场景、爆款衍生目录 11 个场景、以及 `layer-split`、`watermark-pro`、`print-size`。
- **图像模型（Image Model）**: `video` 为假的模型 id：`nano-banana`、`nano-pro`、`seedream`、`gpt-image`。

## Requirements

### Requirement 1

**User Story:** AS 已登录创作者, I want 提交商品图或模特图任务时上游收到该场景的说明、角色和表单内容, so that 不同场景产出不同的图像意图

#### Acceptance Criteria

1. WHEN 任务的 `scene` 命中一条场景契约, THE API SHALL 使用该契约的 `title` 与 `instruction` 写入上游提示词。
2. WHEN 任务 `refs` 含带 `role` 的参考图, THE API SHALL 把每个角色的契约标签与该参考图在提示词中的顺序写入上游提示词。
3. WHEN 任务 `params` 含场景契约声明的字段, THE API SHALL 把非空字段以「字段标签 + 可读值」写入上游提示词。
4. WHEN 字段类型为 `select` 或 `multiselect` 且契约提供选项标签, THE API SHALL 使用选项标签作为可读值。
5. THE API SHALL 将组装后的上游提示词截断为最多 4000 个字符。

### Requirement 2

**User Story:** AS 创作者, I want 空字段和无关参数不干扰出图, so that 提示词只包含我实际填写的内容

#### Acceptance Criteria

1. WHEN 表单字段值为空字符串、空数组或未提供, THE API SHALL 省略该字段。
2. WHEN 任务 `params` 含契约未声明的键, THE API SHALL 仅在该键属于 `prompt`、`product_info`、`extra_description`、`instruction`、`description` 且值非空时写入提示词。
3. WHEN 场景契约未找到, THE API SHALL 使用场景名与 `params.prompt` 等既有文本键组装提示词，并继续调用上游。
4. WHILE `AMAM_VENDOR_MODE` 为 `fake`, THE API SHALL 继续使用样图池产出结果，并跳过上游 HTTP 请求。

### Requirement 3

**User Story:** AS POD 商家, I want 每个 POD 场景有独立的素材角色和字段, so that 印花提取、连续图案和效果图按各自规则提交

#### Acceptance Criteria

1. THE 场景契约集合 SHALL 为全部 15 个 POD 场景各提供一条契约，`slug` 与目录一致：`pattern-extract`、`allover-extract`、`seamless-pattern`、`image-variant`、`style-transfer`、`print-design`、`skin-design`、`material-bond`、`print-mockup`、`pod-main-image`、`pod-size-image`、`pod-scene-image`、`local-replace`、`targeted-replace`、`smart-cutout`。
2. WHEN 用户打开 `/pod-images/:scene` 且该 `scene` 属于上述 slug, THE Frontend SHALL 渲染场景工作台，并按对应契约展示角色上传区与字段。
3. WHEN 场景工作台中该场景的必填角色均已上传, THE Frontend SHALL 允许提交生成任务。
4. WHEN 用户提交 POD 场景任务, THE Frontend SHALL 把 `scene` 设为该场景 `slug`，并把角色写入每条 `refs.role`。
5. WHEN 用户未登录并点击生成, THE Frontend SHALL 打开登录弹窗并阻止提交。

### Requirement 4

**User Story:** AS 服装商家, I want 爆款衍生每个场景有独立契约, so that 融款、换面料、换拍按各自参考图提交

#### Acceptance Criteria

1. THE 场景契约集合 SHALL 为全部 11 个爆款衍生场景各提供一条契约，`slug` 与目录一致：`style-innovate`、`style-fusion`、`inspired-redesign`、`fabric-replace`、`color-replace`、`season-shift`、`series-derive`、`part-redesign`、`tech-sketch`、`same-style-reshoot`、`outfit-matrix`。
2. WHEN 用户打开 `/derive-images/:scene` 且该 `scene` 属于上述 slug, THE Frontend SHALL 渲染场景工作台，并按对应契约展示角色上传区与字段。
3. WHEN 场景工作台中该场景的必填角色均已上传, THE Frontend SHALL 允许提交生成任务。
4. WHEN 用户提交爆款衍生任务, THE Frontend SHALL 把 `scene` 设为该场景 `slug`，并把角色写入每条 `refs.role`。
5. THE `style-fusion` 契约 SHALL 声明至少两个款式参考角色；THE `inspired-redesign` 契约 SHALL 声明商品角色与灵感参考角色。

### Requirement 5

**User Story:** AS 创作者, I want 图层拆分、去水印 Pro、打印尺寸也按契约提交, so that 这三个已能打开的入口与商品场景使用同一套工作台

#### Acceptance Criteria

1. THE 场景契约集合 SHALL 为 `layer-split`、`watermark-pro`、`print-size` 各提供一条契约。
2. WHEN 用户打开 `/tools/ai/layer-split`、`/tools/ai/watermark-pro` 或 `/graphic-design/print-size`, THE Frontend SHALL 渲染场景工作台。
3. THE `layer-split` 契约 SHALL 声明至少 1 张成品图角色，并说明产出可分层编辑的主体、文字、装饰与背景关系。
4. THE `watermark-pro` 契约 SHALL 声明至少 1 张带水印图片角色，并说明去除水印并修补遮挡区域。
5. THE `print-size` 契约 SHALL 声明至少 1 张参考图或主题说明字段，并声明印刷宽度、高度与单位字段。
6. WHEN 用户提交上述三个场景的任务, THE Frontend SHALL 把 `scene` 设为对应 `slug`。

### Requirement 6

**User Story:** AS 创作者, I want 商品图与模特图继续按原契约出图, so that 已接入的 50 个场景在提示词组装上线后仍可提交

#### Acceptance Criteria

1. WHEN 用户打开已有商品场景或模特场景路由, THE Frontend SHALL 继续渲染场景工作台并使用现有契约。
2. WHEN 用户打开 `/product-images/suite`, THE Frontend SHALL 继续渲染套图工作台。
3. WHEN 商品场景或模特场景提交任务, THE Frontend SHALL 把 `scene` 设为该场景 `slug`。
4. WHEN `GET /api/v1/scenes` 被调用, THE API SHALL 返回包含原 50 条契约与 P0 目标场景契约的列表。
5. WHEN `POST /api/v1/jobs` 的 `scene` 为契约 `slug` 或 `title`, THE API SHALL 接受该任务。

### Requirement 7

**User Story:** AS 创作者, I want 生成仍走现有积分与图像代调, so that 补齐场景逻辑不改变计费和厂商 Key 边界

#### Acceptance Criteria

1. WHEN 已登录用户提交有效 P0 目标场景任务, THE API SHALL 创建 `queued` 任务并冻结 4 积分。
2. WHEN 任务使用图像模型且凭证完整, THE API SHALL 按现有代调调用上游；无参考图走文生图，有参考图走编辑接口。
3. WHEN 上游返回图像字节, THE API SHALL 将结果落为调用者名下 `role=output` 资产并结算积分。
4. IF 所选模型缺少凭证, THEN THE API SHALL 将任务标为 `failed`，写入 `vendor_unconfigured`，并退回已冻结积分。
5. THE Frontend SHALL 继续只携带会话令牌调用 `/api/v1`。
6. THE API SHALL 继续使用 Node 内置模块发起上游请求，运行时不新增第三方 npm 依赖。

### Requirement 8

**User Story:** AS 创作者, I want 本阶段视频入口保持不可用的视频代调, so that 图像契约补齐不误接视频厂商

#### Acceptance Criteria

1. WHEN 任务的 `model` 对应 `video` 为真的模型, THE API SHALL 将任务标为 `failed`，写入 `unsupported_model`，并退回已冻结积分。
2. WHEN 场景工作台渲染 P0 目标场景, THE Frontend SHALL 仅提供图像模型。
3. THE `/ai-video` 目录与视频方案页 SHALL 保持现有路由与方案页行为。

### Requirement 9

**User Story:** AS 开发者, I want 自动化测试覆盖提示词组装与新契约提交, so that CI 能锁定 P0 行为

#### Acceptance Criteria

1. THE 自动化测试 SHALL 在 `AMAM_VENDOR_MODE=fake` 与隔离的 `AMAM_DB_FILE` 下证明：命中契约的任务提示词包含场景 `instruction` 与非空字段标签。
2. THE 自动化测试 SHALL 证明带 `role` 的 `refs` 使提示词包含该角色标签。
3. THE 自动化测试 SHALL 证明空字段不出现在提示词中。
4. THE 自动化测试 SHALL 证明使用 P0 目标场景 `slug` 可以创建任务。
5. THE 自动化测试 SHALL 继续覆盖现有成功落盘、`vendor_unconfigured`、`unsupported_model` 与超时退款路径。
