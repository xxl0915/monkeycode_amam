# 需求实施计划

- [x] 1. 扩展持久化以支持资产
  - [x] 1.1 在 db.js 增加 assets 集合与 files 目录
    - empty() 增加 `assets: {}`；按 `AMAM_DB_FILE` 所在目录写 `files/{id}.{ext}`（需求 5.1、5.2）

- [x] 2. 实现资产上传、读取与列表
  - [x] 2.1 POST /api/v1/assets
    - JSON + base64，校验 MIME 与 6 MiB，落盘后返回 assetId/url（需求 1.1–1.5）
  - [x] 2.2 GET /api/v1/assets/:id/file
    - 无鉴权返回字节与 Content-Type（需求 2.1、2.2）
  - [x] 2.3 GET /api/v1/assets
    - Bearer，仅返回当前用户资产（需求 2.3、2.4）
  - [x] 2.4 将 readBody 上限调整为 10 MiB

- [x] 3. 创建任务时校验 refs
  - [x] 3.1 POST /jobs 拒绝 blob/data/外用户资产，接受本人资产 URL、/product-scenes/ 与 /business/（需求 4.1–4.4）

- [x] 4. 前端上传与工作台改造
  - [x] 4.1 client.js 提交 name/role/mime/data，并提供 File 转 base64 上传
  - [x] 4.2 ProductSuiteView / ProductSceneView / WorkbenchView
    - 未登录 blob 预览；登录后或提交前补传；样图不上传（需求 3.1–3.6）
  - [x] 4.3 vite preview.proxy 转发 /api（设计「Architecture」）

- [x] 5. 测试与文档
  - [x] 5.1 资产上传/鉴权/MIME/大小/列表/job refs 测试
  - [x] 5.2 更新 INTERFACES.md、ARCHITECTURE.md、模块文档
  - [x] 5.3 npm test 与 npm run build
