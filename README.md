# amam

复刻 [aigc.easysu.cn](https://aigc.easysu.cn/) 的 AI 视觉创作平台前端。

```bash
npm install

# 启动本地生成 API（默认 127.0.0.1:8787）
npm run server

# 启动前端（/api 已代理到本地 API）
npm run dev
```

商品套图、商品场景与工作台的生成请求会提交到本地 API。`AMAM_VENDOR_MODE=live`（缺省）时由服务端按模型凭证代调上游图像接口，结果落为资产；`AMAM_VENDOR_MODE=fake` 时仍用样图。厂商 Key 只放在服务端环境变量（见 `.env.example`），账号、积分与作品记录以 API 为准，数据保存在 `server/data/db.json`。

