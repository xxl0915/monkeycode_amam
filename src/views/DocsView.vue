<template>
  <div class="docs">
    <h1>文档</h1>
    <p>接口与使用文档。当前为前端复刻版本，生成走本地演示流程。</p>
    <section>
      <h2>快速开始</h2>
      <ol>
        <li>注册或登录账号</li>
        <li>从首页或商品图中心选择业务场景</li>
        <li>上传商品素材，填写提示词后生成</li>
        <li>在结果页下载或继续二次创作</li>
      </ol>
    </section>
    <section>
      <h2>生成接口（示意）</h2>
      <pre>POST /api/generate
{
  "scene": "suite",
  "prompt": "白底主图，自然投影",
  "model": "nano-banana",
  "ratio": "1:1"
}</pre>
    </section>
    <section>
      <h2>积分</h2>
      <p>文生图默认 4 积分 / 张，视频按时长计费。登录后可在右上角充值。</p>
    </section>
  </div>
</template>
<style scoped>
.docs { max-width: 760px; margin: 0 auto; }
h1 { font-size: 1.7rem; }
p, li { color: var(--fg-2); line-height: 1.75; }
pre { padding: 1rem; border-radius: .9rem; background: #0f172a; color: #e2e8f0; overflow: auto; }
section { margin-top: 1.8rem; }
</style>
