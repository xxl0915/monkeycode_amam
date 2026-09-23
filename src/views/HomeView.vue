<template>
  <div class="home-page">
    <section class="home-hero">
      <div class="home-hero-copy">
        <span class="home-kicker">AI 视觉创作平台</span>
        <h1>把商品素材变成可上线的图片、视频和营销内容</h1>
        <p>从商品主图、详情页、模特试穿到图生视频，围绕真实电商生产流程组织入口。选择业务场景，上传素材，生成结果可直接进入下载和复用。</p>
        <div class="home-actions">
          <button type="button" class="primary-action" @click="go('/user')">开始创作</button>
          <button type="button" class="secondary-action" @click="go('/product-images')">浏览商品图场景</button>
        </div>
        <form class="quick-composer" @submit.prevent="compose">
          <input v-model="prompt" type="text" placeholder="输入一句描述，快速进入生成工作台" />
          <button type="submit">生成</button>
        </form>
      </div>
      <div class="hero-showcase">
        <button type="button" class="hero-main-card" :style="bg(hero.image)" @click="go('/user', { prompt: hero.prompt })">
          <span class="media-shade"></span>
          <span class="hero-main-copy">
            <i>{{ hero.subtitle }}</i>
            <b>{{ hero.title }}</b>
            <em>{{ hero.prompt }}</em>
          </span>
        </button>
        <div class="hero-side-list">
          <button v-for="item in sides" :key="item.id" type="button" class="hero-side-card" :style="bg(item.image)" @click="go('/user', { prompt: item.prompt })">
            <span class="media-shade"></span>
            <span>{{ item.title }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="home-stats">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <strong>{{ s.value }}</strong>
        <span>{{ s.label }}</span>
      </div>
    </section>

    <section class="showcase-rail">
      <div class="showcase-track">
        <button v-for="(w, i) in rail" :key="w.id + i" type="button" class="rail-card" :style="bg(w.image)" @click="go('/user', { prompt: w.prompt })">
          <span class="media-shade"></span>
          <span class="rail-copy"><i>{{ w.subtitle }}</i><b>{{ w.title }}</b></span>
        </button>
      </div>
    </section>

    <section class="home-section capability-section">
      <div class="section-head">
        <span>能力</span>
        <h2>4 种方式开始创作</h2>
        <p>分辨率、时长和参考图能力直接读取当前在线模型配置，入口展示的就是实际可用能力。</p>
      </div>
      <div class="cap-grid">
        <button v-for="c in caps" :key="c.key" type="button" class="cap-card" @click="go('/user')">
          <span class="cap-arrow"><Icon name="open" :size="16" /></span>
          <span class="cap-icon" :style="{ background: c.tint, color: c.color }"><Icon :name="c.icon" :size="22" /></span>
          <span class="cap-title">{{ c.title }}</span>
          <span class="cap-desc">{{ c.desc }}</span>
          <span class="cap-metas"><i v-for="m in c.metas" :key="m" class="cap-meta">{{ m }}</i></span>
        </button>
      </div>
    </section>

    <section class="home-section">
      <div class="section-head">
        <span>模型</span>
        <h2>在线模型</h2>
        <p>每个模型的分辨率、时长与参考图能力都写在卡片上，选之前就知道能做什么。</p>
      </div>
      <div class="model-row">
        <div v-for="m in onlineModels" :key="m.id" class="model-card">
          <span class="model-glow" :style="{ background: m.glow }"></span>
          <div class="model-name">{{ m.name }}</div>
          <div class="model-spec">{{ m.spec }}</div>
          <div class="model-tag-wrap">
            <span class="model-tag" :class="m.video ? 'is-video' : 'is-image'">{{ m.video ? '视频' : '图像' }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="home-section">
      <div class="section-head">
        <span>业务入口</span>
        <h2>按真实创作任务进入，不从模型参数开始</h2>
        <p>首页优先呈现业务结果和使用路径，复杂模型、比例、画质等参数留在具体工作台中配置。</p>
      </div>
      <div class="business-grid">
        <button v-for="b in businesses" :key="b.title" type="button" class="business-card" :class="{ 'is-featured': b.featured }" @click="go(b.route)">
          <span class="business-media" :style="bg(b.image)"></span>
          <span class="business-copy">
            <b>{{ b.title }}</b>
            <em>{{ b.desc }}</em>
            <span class="tag-row"><i v-for="t in b.tags" :key="t">{{ t }}</i></span>
          </span>
        </button>
      </div>
    </section>

    <section class="home-section">
      <div class="section-head">
        <span>精选案例</span>
        <h2>从成熟构图和提示词直接开始</h2>
        <p>点击案例后进入生成工作台，继续沿用同款提示词和创作方向。</p>
      </div>
      <div class="case-grid">
        <button v-for="w in showcaseWorks.slice(0, 4)" :key="w.id" type="button" class="case-card" :style="bg(w.image)" @click="go('/user', { prompt: w.prompt })">
          <span class="media-shade"></span>
          <span class="case-copy"><i>{{ w.subtitle }}</i><b>{{ w.title }}</b><em>{{ w.prompt }}</em></span>
        </button>
      </div>
    </section>

    <section class="home-section">
      <div class="section-head">
        <span>作品展示</span>
        <h2>真实作品比装饰图更重要</h2>
        <p>展示后台维护的精选成品，让访客先看到实际可交付的画面质量和内容方向。</p>
      </div>
      <div class="work-grid">
        <button v-for="w in showcaseWorks.slice(4)" :key="w.id" type="button" class="work-card" @click="go('/user', { prompt: w.prompt })">
          <span class="work-media" :style="bg(w.image)"></span>
          <span class="media-shade"></span>
          <span class="work-copy"><b>{{ w.title }}</b><em>{{ w.prompt }}</em></span>
        </button>
      </div>
    </section>

    <section class="final-cta">
      <div>
        <span>amam</span>
        <h2>从一个具体场景开始，而不是从空白页面开始</h2>
        <p>进入商品图中心或直接打开生成工作台，先选择业务目标，再补充素材和参数。</p>
      </div>
      <div class="final-actions">
        <button type="button" class="primary-action" @click="go('/product-images')">查看业务场景</button>
        <button type="button" class="secondary-action" @click="go('/user')">进入生成</button>
      </div>
    </section>

    <footer class="home-footer">
      <span>amam</span>
      <nav>
        <RouterLink to="/docs">文档</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </footer>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import { onlineModels, showcaseWorks } from '../data/catalogs'

const router = useRouter()
const prompt = ref('')
const hero = showcaseWorks[0]
const sides = showcaseWorks.slice(1, 4)
const rail = computed(() => [...showcaseWorks, ...showcaseWorks])
const stats = [
  { value: '6', label: '在线模型' },
  { value: '1K-4K', label: '图片画质' },
  { value: '4-12s', label: '视频时长' },
  { value: '1.8s', label: '近 24h 平均出片' }
]
const caps = [
  { key: 't2i', icon: 'files', title: '文字生图', desc: '一句话生成商品图、海报、场景图和风格图，画幅与画质按模型能力提供。', tint: 'rgb(52 211 153 / 0.14)', color: 'rgb(52 211 153)', metas: ['1K-4K', '4 个模型'] },
  { key: 'i2i', icon: 'layers', title: '参考图生图', desc: '上传商品图、风格图或构图参考，继续做换背景、变体和系列化延展。', tint: 'rgb(217 70 239 / 0.14)', color: 'rgb(232 121 249)', metas: ['多图参考', '3 个模型'] },
  { key: 't2v', icon: 'video', title: '文字生视频', desc: '用一段描述生成短片，适合商品展示、氛围片和营销内容预览。', tint: 'rgb(14 165 233 / 0.14)', color: 'rgb(56 189 248)', metas: ['4-12s', '720p / 1080p', '2 个模型'] },
  { key: 'i2v', icon: 'play', title: '图生视频', desc: '以商品图、模特图或首帧为基础，让静态素材动起来。', tint: 'rgb(245 158 11 / 0.14)', color: 'rgb(251 191 36)', metas: ['参考图', '2 个模型'] }
]
const businesses = [
  { title: '商品图生产', desc: '主图、套图、详情页、白底图和卖点海报，围绕电商上架流程组织。', route: '/product-images', image: '/product-scenes/samples/suite.webp', tags: ['商品套图', '详情页', '主图'], featured: true },
  { title: '模特图与试穿', desc: '用参考商品和服饰素材生成模特展示图，适合服饰、配饰和鞋包场景。', route: '/model-plaza', image: '/business/models/model-4.png', tags: ['AI 模特', '试穿', '穿搭'] },
  { title: 'AI 视频内容', desc: '从商品图片延展到短视频、口播、动作展示和实体获客素材。', route: '/ai-video', image: '/product-scenes/samples/product-composite.webp', tags: ['图生视频', 'TVC', '获客'] },
  { title: '图片工具箱', desc: '图层拆分、改图、抠图、扩图和无损处理集中在一个入口。', route: '/tools/ai', image: '/product-scenes/samples/detail-sheet.webp', tags: ['PSD', '改图', '抠图'] }
]
function bg(src) {
  return { backgroundImage: `url("${src}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
}
function go(path, query) {
  router.push(query ? { path, query } : path)
}
function compose() {
  go('/user', prompt.value.trim() ? { prompt: prompt.value.trim() } : null)
}
</script>
<style scoped>
.home-page { position: relative; isolation: isolate; padding: 0 clamp(1rem, 2.5vw, 2.25rem); color: var(--fg); background: linear-gradient(180deg, rgb(99 102 241 / .055), transparent 34rem), linear-gradient(90deg, transparent, rgb(14 165 233 / .035), transparent); }
.home-hero { min-height: 720px; display: grid; grid-template-columns: minmax(0, .9fr) minmax(420px, 1.1fr); gap: clamp(2rem, 5vw, 5rem); align-items: center; padding: 4.75rem 0 2.4rem; }
.home-hero-copy { max-width: 700px; }
.home-kicker, .section-head > span, .final-cta span { display: inline-flex; align-items: center; width: fit-content; color: #4f46e5; background: #6366f114; box-shadow: inset 0 0 0 1px #6366f129; border-radius: 999px; padding: .36rem .72rem; font-size: .72rem; font-weight: 750; }
.home-hero h1 { margin: 1.25rem 0 0; color: var(--fg); max-width: 12.5em; font-size: 4.1rem; line-height: 1.06; font-weight: 850; }
.home-hero p { margin: 1.25rem 0 0; max-width: 39rem; color: var(--fg-2); font-size: 1rem; line-height: 1.78; }
.home-actions, .final-actions { margin-top: 2rem; display: flex; align-items: center; flex-wrap: wrap; gap: .75rem; }
.primary-action, .secondary-action, .quick-composer button { border: 0; min-height: 44px; border-radius: 999px; padding: .72rem 1.15rem; font-size: .92rem; font-weight: 750; transition: transform .18s ease, box-shadow .18s ease; }
.primary-action { color: var(--btn-solid-fg); background: var(--btn-solid-bg); box-shadow: 0 18px 34px -22px #0f172ae0; }
.primary-action:hover, .secondary-action:hover, .quick-composer button:hover { transform: translateY(-1px); }
.secondary-action { color: var(--fg); background: var(--surface); box-shadow: inset 0 0 0 1px var(--hairline), 0 14px 32px -26px #0f172aa6; }
.quick-composer { margin-top: 1.1rem; display: flex; align-items: center; gap: .5rem; max-width: 38rem; padding: .42rem; border-radius: 1.1rem; background: var(--surface); box-shadow: inset 0 0 0 1px var(--hairline), 0 24px 70px -44px #0f172a9e; }
.quick-composer input { flex: 1; min-width: 0; border: 0; outline: 0; color: var(--fg); background: transparent; font-size: .92rem; padding: .72rem .82rem; }
.quick-composer button { color: var(--btn-solid-fg); background: var(--btn-solid-bg); }
.hero-showcase { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) 160px; gap: 1rem; align-items: stretch; filter: drop-shadow(0 38px 46px rgb(15 23 42 / .13)); }
.hero-main-card, .hero-side-card, .case-card, .work-card { position: relative; overflow: hidden; border: 0; text-align: left; background-color: var(--surface-2); box-shadow: inset 0 0 0 1px #ffffff3d, 0 22px 50px -36px #0f172ab8; }
.hero-main-card { min-height: 525px; border-radius: 1.55rem; background-size: cover; background-position: center; }
.hero-main-card:hover, .hero-side-card:hover, .case-card:hover, .work-card:hover { transform: translateY(-3px); }
.media-shade { position: absolute; inset: 0; background: linear-gradient(to top, rgb(2 6 23 / .82), rgb(2 6 23 / .24) 48%, transparent 72%); }
.hero-main-copy, .case-copy, .work-copy { position: absolute; left: 1.25rem; right: 1.25rem; bottom: 1.1rem; display: grid; gap: .35rem; color: #fff; z-index: 1; }
.hero-main-copy i, .case-copy i { font-style: normal; color: #ffffffa8; font-size: .64rem; font-weight: 750; text-transform: uppercase; }
.hero-main-copy b { font-size: 1.9rem; line-height: 1.12; }
.hero-main-copy em, .case-copy em, .work-copy em { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #ffffffbd; font-style: normal; font-size: .78rem; line-height: 1.6; }
.hero-side-list { display: grid; grid-template-rows: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.hero-side-card { min-height: 0; border-radius: 1rem; background-size: cover; background-position: center; }
.hero-side-card span:last-child { position: absolute; left: .82rem; right: .82rem; bottom: .72rem; color: #fff; font-size: .82rem; font-weight: 750; z-index: 1; }
.home-stats { position: relative; z-index: 2; margin-top: -.6rem; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
.stat-card { min-height: 6.5rem; padding: 1.15rem 1.2rem; border-radius: 1rem; background: linear-gradient(135deg, #ffffffd1, #ffffff85), var(--surface); box-shadow: inset 0 0 0 1px var(--hairline), 0 18px 42px -34px #0f172aad; }
.stat-card strong { display: block; color: var(--fg); font-size: 1.85rem; line-height: 1; }
.stat-card span { display: block; margin-top: .45rem; color: var(--fg-3); font-size: .76rem; }
.showcase-rail { margin-top: 1.25rem; overflow: hidden; -webkit-mask-image: linear-gradient(to right, transparent, #000 5%, #000 95%, transparent); mask-image: linear-gradient(to right, transparent, #000 5%, #000 95%, transparent); }
.showcase-track { display: flex; width: max-content; gap: .9rem; padding: .35rem 0 .65rem; animation: showcaseScroll 44s linear infinite; }
.showcase-track:hover { animation-play-state: paused; }
.rail-card { position: relative; flex: 0 0 15rem; height: 9.5rem; overflow: hidden; border: 0; border-radius: 1.05rem; text-align: left; background-size: cover; background-position: center; }
.rail-copy { position: absolute; left: .9rem; right: .9rem; bottom: .8rem; display: grid; gap: .2rem; color: #fff; z-index: 1; }
.rail-copy i { color: #ffffffa8; font-size: .6rem; font-style: normal; font-weight: 750; }
.rail-copy b { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; font-size: .9rem; }
@keyframes showcaseScroll { to { transform: translate(-50%); } }
.home-section, .final-cta { margin-top: 5.5rem; }
.capability-section + .home-section { margin-top: 3.25rem; }
.section-head { max-width: 720px; }
.section-head h2, .final-cta h2 { margin: .9rem 0 0; color: var(--fg); font-size: 2.55rem; line-height: 1.08; font-weight: 820; }
.section-head p, .final-cta p { margin: .85rem 0 0; color: var(--fg-2); font-size: .94rem; line-height: 1.75; }
.business-grid { margin-top: 1.65rem; display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(26rem, .88fr); grid-auto-rows: minmax(9.8rem, auto); gap: 1rem; }
.business-card { display: grid; overflow: hidden; border: 0; border-radius: 1.2rem; text-align: left; background: var(--surface); box-shadow: inset 0 0 0 1px var(--hairline), 0 18px 42px -34px #0f172a99; }
.business-card.is-featured { grid-row: span 3; }
.business-card:not(.is-featured) { grid-template-columns: 10.75rem minmax(0, 1fr); min-height: 10rem; }
.business-card:hover { transform: translateY(-4px); }
.business-media { display: block; aspect-ratio: 4 / 3; background-size: cover; background-position: center; }
.business-card.is-featured .business-media { aspect-ratio: 16 / 10; }
.business-card:not(.is-featured) .business-media { aspect-ratio: auto; min-height: 100%; }
.business-copy { display: grid; gap: .5rem; padding: 1rem; }
.business-copy b { color: var(--fg); font-size: 1rem; }
.business-copy em { color: var(--fg-2); font-style: normal; font-size: .82rem; line-height: 1.65; }
.tag-row { display: flex; flex-wrap: wrap; gap: .35rem; }
.tag-row i { color: var(--fg-2); background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--hairline); border-radius: 999px; padding: .22rem .52rem; font-size: .68rem; font-style: normal; }
.cap-grid { margin-top: 1.65rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem; }
.cap-card { position: relative; overflow: hidden; display: grid; align-content: start; min-height: 12.6rem; text-align: left; border: 0; padding: 1.35rem; border-radius: 1.25rem; background: linear-gradient(145deg, #ffffffd1, #ffffff80), var(--surface); box-shadow: inset 0 0 0 1px var(--hairline); }
.cap-card:hover { transform: translateY(-4px); }
.cap-arrow { position: absolute; top: 1.05rem; right: 1.05rem; color: var(--fg-3); }
.cap-icon { width: 2.6rem; height: 2.6rem; display: grid; place-items: center; margin-bottom: .9rem; border-radius: .85rem; }
.cap-title { color: var(--fg); font-size: .98rem; font-weight: 800; }
.cap-desc { margin-top: .55rem; color: var(--fg-3); font-size: .79rem; line-height: 1.7; }
.cap-metas { margin-top: .9rem; display: flex; flex-wrap: wrap; gap: .4rem; }
.cap-meta { color: var(--fg-2); background: var(--surface-2); border-radius: .45rem; padding: .2rem .5rem; font-size: .68rem; font-style: normal; }
.case-grid { margin-top: 1.65rem; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: 190px; gap: 1rem; }
.case-card { border-radius: 1.2rem; background-size: cover; background-position: center; }
.work-grid { margin-top: 1.65rem; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.work-card { min-height: 380px; border-radius: 1.2rem; }
.work-media { position: absolute; inset: 0; background-size: cover; background-position: center; }
.model-row { margin-top: 1.65rem; display: flex; gap: 1rem; overflow-x: auto; padding: .15rem 0 .65rem; }
.model-card { position: relative; flex: 0 0 14.5rem; overflow: hidden; min-height: 8.6rem; padding: 1.25rem; border-radius: 1.25rem; background: linear-gradient(145deg, #ffffffd1, #ffffff80), var(--surface); box-shadow: inset 0 0 0 1px var(--hairline); }
.model-glow { position: absolute; top: -2.5rem; right: -2.5rem; width: 8rem; height: 8rem; border-radius: 50%; filter: blur(40px); opacity: .3; }
.model-name { position: relative; color: var(--fg); font-size: .95rem; font-weight: 800; }
.model-spec { position: relative; margin-top: .45rem; color: var(--fg-3); font-size: .72rem; line-height: 1.55; }
.model-tag-wrap { position: relative; margin-top: .9rem; }
.model-tag { border-radius: .42rem; padding: .2rem .55rem; font-size: .68rem; }
.model-tag.is-image { color: #34d399; background: #34d39924; }
.model-tag.is-video { color: #38bdf8; background: #7dd3fc24; }
.final-cta { display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding: 2.5rem; border-radius: 1.5rem; background: linear-gradient(135deg, rgb(99 102 241 / .14), transparent 48%), linear-gradient(90deg, transparent, rgb(14 165 233 / .12)), var(--surface); box-shadow: inset 0 0 0 1px var(--hairline); }
.final-cta > div:first-child { max-width: 680px; }
.home-footer { margin-top: 4rem; padding: 2rem 0 3rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-top: 1px solid var(--hairline); color: var(--fg-3); font-size: .8rem; }
.home-footer span { color: var(--fg-2); font-weight: 750; }
.home-footer nav { display: flex; gap: 1rem; }
.home-footer a { color: inherit; text-decoration: none; }
@media (max-width: 1120px) {
  .home-hero { grid-template-columns: 1fr; min-height: auto; padding-top: 3.2rem; }
  .home-hero h1 { font-size: 3.45rem; }
  .hero-showcase { grid-template-columns: minmax(0, 1fr); }
  .hero-side-list { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: none; }
  .hero-side-card { min-height: 150px; }
  .business-grid, .case-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .business-card.is-featured { grid-column: span 2; grid-row: auto; }
  .business-card:not(.is-featured) { grid-template-columns: 1fr; }
  .work-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .home-hero h1 { font-size: 2.4rem; }
  .home-stats, .case-grid, .work-grid, .business-grid { grid-template-columns: 1fr; }
  .final-cta { flex-direction: column; align-items: flex-start; }
}
</style>
