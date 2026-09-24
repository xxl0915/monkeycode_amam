# amam

复刻 [aigc.easysu.cn](https://aigc.easysu.cn/) 的 AI 视觉创作平台前端。

```bash
npm install

# 启动本地生成 API（默认 127.0.0.1:8787）
npm run server

# 启动前端（/api 已代理到本地 API）
npm run dev
```

商品套图、商品场景与工作台的生成请求会提交到本地 API，由假 Worker 异步产出示例结果；账号、积分与作品记录以 API 为准，数据保存在 `server/data/db.json`。

