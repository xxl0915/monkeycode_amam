# 需求实施计划

- [x] 1. 搭建本地 API 服务骨架
   - 建立 server/ 目录，实现零依赖的 Node HTTP 服务入口与 /api/v1 路由前缀
   - 定义 JSON 响应与统一错误结构（需求 5.2、5.3）

- [x] 2. 实现数据持久化与积分账本
  - [x] 2.1 实现 JSON 持久化存储（server/db.js）
    - 定义 users / sessions / jobs / orders / ledger 结构并落盘 server/data/db.json
    - 实现 newId 与 save（设计「Data Models」）

  - [x] 2.2 实现积分冻结 / 结算 / 退回
    - freezeCredits / settleCredits / refundCredits 同步写入 ledger（需求 2.2、2.4、2.5，正确性属性 1）

  - [x] 2.3 为积分账本编写属性测试
    - 属性 1：任意冻结 + 结算或退回后，用户余额恒等于流水累计
    - 属性 2：同一任务不重复结算或退款

- [x] 3. 实现认证与用户接口
  - [x] 3.1 实现登录 / 注册 / 注销
    - POST /auth/login 账号不存在时自动创建并返回初始积分 128.5（需求 1.1、1.2，正确性属性 4）
    - POST /auth/register 对已存在账号返回 409（需求 1.2）
    - POST /auth/logout 删除会话

  - [x] 3.2 实现 GET /me 与 Bearer 鉴权
    - 缺失或无效令牌返回 401（设计「Error Handling」）
    - 实现 POST /orders 充值并返回最新用户（需求 1.5）

- [x] 4. 实现场景契约与素材接口
  - [x] 4.1 实现 GET /scenes 与 GET /models
    - 读取 src/data/sceneSchemas.json 输出场景契约摘要

  - [x] 4.2 实现 POST /assets 素材登记
    - 返回 assetId、role、url

- [x] 5. 实现任务管线与假 Worker
  - [x] 5.1 实现 POST /jobs 创建任务并冻结积分
    - 校验 scene，积分不足返回 402（需求 2.1、2.2）

  - [x] 5.2 实现任务查询与删除
    - GET /jobs、GET /jobs/:id、DELETE /jobs/:id，按令牌隔离（需求 4.1、4.4，正确性属性 3）

  - [x] 5.3 实现假 Worker 状态推进
    - queued→running→succeeded/failed，成功产出样图、失败退款（需求 2.3、2.4、2.5）

  - [x] 5.4 为任务生命周期编写接口测试
    - 轮询至 succeeded，outputs 数量等于 outputCount

- [x] 6. 检查点 - 确保所有测试通过
  - `npm test` 4/4 通过；服务端 e2e 全量手工验证通过

- [x] 7. 实现前端 API 层
  - [x] 7.1 新增 src/api/client.js
    - 封装 fetch、注入 Bearer 令牌、非 2xx 转 ApiError 与网络错误提示（需求 5.3）

- [x] 8. 改造全局 store 为服务端会话
  - [x] 8.1 重写 src/store.js
    - bootstrap 恢复会话，login/register/logout/recharge（需求 1.3、1.5）
    - loadJobs/createJob/pollJob/deleteJob（需求 2.3）

  - [x] 8.2 在 src/main.js 启动时调用 bootstrap（需求 1.5）

- [x] 9. 登录与充值弹窗接服务端
  - [x] 9.1 改造 LoginModal.vue
    - 异步提交、busy 态与服务端错误展示（需求 1.3、1.4）

  - [x] 9.2 改造 PayModal.vue
    - 调用 recharge，未登录时唤起登录弹窗（需求 1.5）

- [x] 10. 工作台接任务轮询
  - [x] 10.1 改造 ProductSuiteView.vue
    - 组装 params/refs 提交任务并轮询渲染任务结果（需求 3.1、3.3、3.5）

  - [x] 10.2 改造 ProductSceneView.vue
    - 按 schema 组装 refs，渲染与 outputCount 一致的结果（需求 3.2、3.3）

  - [x] 10.3 改造 WorkbenchView.vue
    - 提交任务并将历史标签映射为服务端任务输出（需求 3.4）

- [x] 11. 作品 / 日志页接服务端
  - [x] 11.1 改造 SimplePage.vue 渲染任务列表
    - 状态、时间、输出缩略图与删除（需求 4.1、4.2、4.3、4.4）

  - [x] 11.2 更新 router.js
    - 为 /logs、/mylogs 传入 jobs/logs 参数（需求 4.1）

- [x] 12. 挂载 API 与验证
  - [x] 12.1 package.json 新增 server 脚本，更新 README 与 .gitignore（需求 5.1）
  - [x] 12.2 通过 Vite 代理验证登录→创建任务→轮询→充值（需求 5.1、5.3）

- [x] 13. 检查点 - 确保所有测试通过
  - `npm test` 4/4 通过；`npm run build` 与 Vite 代理 e2e 全量通过
