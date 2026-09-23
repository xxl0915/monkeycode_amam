# src/data

业务目录与场景契约数据层。集中定义平台所有可浏览的业务分类、场景清单与场景表单 schema，并提供少量读取辅助函数。

## 结构

```
src/data/
├── catalogs.js        # 商品图/模特图/视频/工具/平面/POD/衍生等目录与索引
├── sceneSchemas.json  # 50 个场景的契约（roles/fields/maxOutputs 等）
├── business.js        # 业务分类读取辅助函数
└── business.json      # 业务分类数据（category/groups/scenes）
```

## 关键文件

| 文件 | 目的 |
|------|------|
| `catalogs.js` | 导出 `productCatalog`、`modelCatalog`、`podCatalog`、`deriveCatalog`、`onlineModels`、`searchIndex`、`helpFaqs` 等 |
| `sceneSchemas.json` | 服务端 `GET /scenes` 与前端 `ProductSceneView` 共享的场景契约 |
| `business.js` | `getBusinessCategory`、`getBusinessScenes`、`findBusinessScene`、`filterBusinessScenes`、`sceneRoute` |
| `business.json` | 业务分类原始数据 |

## 依赖

**本模块依赖**:

- 无（纯数据与纯函数）

**依赖本模块的**:

- `src/router.js` - 路由与目录绑定
- `src/layouts/PublicLayout.vue` - 顶栏下拉菜单
- `src/views/*` - 目录页与工作台
- `server/catalog.js` - 读取 `sceneSchemas.json` 与 `catalogs.js` 做场景校验

## 规范

### 代码模式

**场景条目**（`catalogs.js` 中多为数组元组映射）:

```js
['套图上架', '商品套图', 'suite', '一套生成多种电商版位', '已接入']
```

对应字段：`group`、`title`、`slug`、`description`、`status`。

**业务分类读取**:

```js
import { getBusinessCategory, sceneRoute } from '../data/business'
const category = getBusinessCategory('video')
sceneRoute(category, scene) // 返回目标路由
```

### 错误处理

数据层为纯静态，无运行时错误处理；缺失分类时 `getBusinessCategory` 返回 `null`。

### 测试

无自动化测试；修改后通过构建和页面验证。
