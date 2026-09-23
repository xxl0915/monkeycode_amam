<template>
  <div class="public-root">
    <header class="top-bar">
      <div class="top-bar-inner">
        <RouterLink to="/" class="brand">
          <LogoMark />
          <span>amam</span>
          <i class="brand-spark">✦</i>
        </RouterLink>

        <nav class="top-nav">
          <RouterLink to="/" class="top-link" :class="{ on: route.path === '/' }">首页</RouterLink>
          <RouterLink to="/user" class="top-link" :class="{ on: route.path === '/user' }">生成</RouterLink>
          <a class="top-link" href="/ic/canvas" @mouseenter="prefetchCanvas">无限画布</a>

          <div class="product-nav" @mouseenter="openMenu = 'product'" @mouseleave="openMenu = ''">
            <RouterLink to="/product-images" class="top-link" :class="{ on: isProduct }">
              商品图 <Icon name="chevron" class="nav-chevron" :class="{ open: openMenu === 'product' }" :size="12" />
            </RouterLink>
            <div v-if="openMenu === 'product'" class="product-menu">
              <div v-for="g in productCatalog" :key="g.key" class="product-menu-group">
                <span>{{ g.label }}</span>
                <RouterLink v-for="s in g.scenes" :key="s.slug" class="product-menu-item" :to="`/product-images/${s.slug}`">{{ s.title }}</RouterLink>
              </div>
            </div>
          </div>

          <div class="business-nav" @mouseenter="openMenu = 'video'" @mouseleave="openMenu = ''">
            <RouterLink to="/ai-video" class="top-link" :class="{ on: isVideo }">
              AI视频 <Icon name="chevron" class="nav-chevron" :class="{ open: openMenu === 'video' }" :size="12" />
            </RouterLink>
            <div v-if="openMenu === 'video'" class="business-menu video-business-menu">
              <div class="business-menu-featured">
                <RouterLink to="/ai-video/image-to-video" class="business-featured-link">
                  <strong>图生视频</strong><span>以商品图或首帧让静态素材动起来</span>
                </RouterLink>
                <RouterLink to="/ai-video/product-tvc" class="business-featured-link">
                  <strong>商品 TVC</strong><span>规划脚本、分镜和镜头生成广告片</span>
                </RouterLink>
              </div>
              <div v-for="g in videoCategory?.groups || []" :key="g.key" class="business-menu-group">
                <span>{{ g.label }}</span>
                <RouterLink v-for="s in g.scenes" :key="s.slug" class="business-menu-item" :to="bizTo(videoCategory, s)">
                  {{ s.title }}
                </RouterLink>
              </div>
            </div>
          </div>

          <div class="business-nav" @mouseenter="openMenu = 'model'" @mouseleave="openMenu = ''">
            <RouterLink to="/model-plaza" class="top-link" :class="{ on: isModel }">
              模特图 <Icon name="chevron" class="nav-chevron" :class="{ open: openMenu === 'model' }" :size="12" />
            </RouterLink>
            <div v-if="openMenu === 'model'" class="business-menu model-business-menu">
              <div class="business-menu-featured">
                <RouterLink to="/model-plaza" class="business-featured-link"><strong>模特广场</strong><span>浏览可直接使用的商用 AI 模特</span></RouterLink>
                <RouterLink to="/exclusive-models" class="business-featured-link"><strong>AI专属模特</strong><span>品牌专属模特工作室</span></RouterLink>
                <RouterLink to="/model-images/tryon-any" class="business-featured-link"><strong>万物上身</strong><span>商品图与模特图自然合成</span></RouterLink>
              </div>
              <div v-for="g in modelCatalog" :key="g.key" class="business-menu-group">
                <span>{{ g.label }}</span>
                <RouterLink v-for="s in g.scenes" :key="s.slug" class="business-menu-item" :to="`/model-images/${s.slug}`">{{ s.title }}</RouterLink>
              </div>
            </div>
          </div>

          <div class="business-nav" @mouseenter="openMenu = 'tools'" @mouseleave="openMenu = ''">
            <RouterLink to="/tools" class="top-link" :class="{ on: isTools }">
              图片工具 <Icon name="chevron" class="nav-chevron" :class="{ open: openMenu === 'tools' }" :size="12" />
            </RouterLink>
            <div v-if="openMenu === 'tools'" class="business-menu tools-business-menu">
              <div class="business-menu-featured">
                <RouterLink to="/tools/ai/layer-split" class="business-featured-link"><strong>AI 图层拆分</strong><span>拆成可编辑图层并导出 PSD</span></RouterLink>
                <RouterLink to="/tools/ai/ai-edit" class="business-featured-link"><strong>AI 万能改图</strong><span>一句话精准修改图片内容</span></RouterLink>
                <RouterLink to="/photo-edit" class="business-featured-link"><strong>本地图片编辑</strong><span>裁剪旋转调色在浏览器完成</span></RouterLink>
              </div>
              <div v-for="g in toolCategory?.groups || []" :key="g.key" class="business-menu-group tools-menu-group">
                <span>{{ g.label }}</span>
                <RouterLink v-for="s in g.scenes" :key="s.slug" class="business-menu-item" :to="bizTo(toolCategory, s)">{{ s.title }}</RouterLink>
              </div>
            </div>
          </div>

          <div class="business-nav" @mouseenter="openMenu = 'graphic'" @mouseleave="openMenu = ''">
            <RouterLink to="/graphic-design" class="top-link" :class="{ on: isGraphic }">
              平面设计 <Icon name="chevron" class="nav-chevron" :class="{ open: openMenu === 'graphic' }" :size="12" />
            </RouterLink>
            <div v-if="openMenu === 'graphic'" class="business-menu graphic-design-business-menu">
              <div v-for="g in graphicCategory?.groups || []" :key="g.key" class="business-menu-group">
                <span>{{ g.label }}</span>
                <RouterLink v-for="s in g.scenes" :key="s.slug" class="business-menu-item" :to="bizTo(graphicCategory, s)">{{ s.title }}</RouterLink>
              </div>
            </div>
          </div>

          <div class="business-nav" @mouseenter="openMenu = 'more'" @mouseleave="openMenu = ''">
            <RouterLink to="/cross-border" class="top-link" :class="{ on: isMore }">
              更多 <Icon name="chevron" class="nav-chevron" :class="{ open: openMenu === 'more' }" :size="12" />
            </RouterLink>
            <div v-if="openMenu === 'more'" class="business-menu more-business-menu">
              <div class="more-category-list">
                <RouterLink v-for="c in moreCategories" :key="c.key" :to="c.path" class="more-cat">
                  <b>{{ c.label }}</b>
                  <small>{{ c.description }}</small>
                </RouterLink>
              </div>
              <div class="more-preview">
                <b>继续探索业务入口</b>
                <p>跨境上架、营销场景、图片 POD 和爆款衍生都集中在这里。</p>
                <RouterLink to="/marketing">打开营销场景</RouterLink>
              </div>
            </div>
          </div>

          <RouterLink to="/docs" class="top-link" :class="{ on: route.path === '/docs' }">文档</RouterLink>
          <RouterLink to="/about" class="top-link" :class="{ on: route.path === '/about' }">关于</RouterLink>
        </nav>

        <div class="flex-1"></div>

        <div class="top-actions">
          <button class="icon-btn" type="button" aria-label="搜索" @click="store.searchOpen = true">
            <Icon name="search" :size="16" />
          </button>
          <div class="lang">
            <button class="top-link" type="button" @click="langOpen = !langOpen">{{ lang }}</button>
            <div v-if="langOpen" class="lang-menu">
              <button v-for="l in langs" :key="l" type="button" @click="lang = l; langOpen = false">{{ l }}</button>
            </div>
          </div>
          <template v-if="store.user">
            <button class="top-balance" type="button" @click="store.payOpen = true">{{ formatCredits(store.user.credits) }}</button>
            <div class="user-wrap" @mouseenter="userOpen = true" @mouseleave="userOpen = false">
              <button class="avatar" type="button">{{ initials }}</button>
              <div v-if="userOpen" class="user-menu">
                <div class="user-head">{{ store.user.name }}</div>
                <RouterLink to="/mylogs">生成日志</RouterLink>
                <RouterLink to="/logs">我的作品</RouterLink>
                <RouterLink to="/invite">邀请返利</RouterLink>
                <RouterLink to="/orders">订单</RouterLink>
                <RouterLink to="/settings">设置</RouterLink>
                <button type="button" @click="logout()">退出登录</button>
              </div>
            </div>
          </template>
          <button v-else class="login-btn" type="button" @click="store.loginOpen = true">登录</button>
          <button class="burger" type="button" @click="mobileOpen = !mobileOpen">菜单</button>
        </div>
      </div>
    </header>

    <div v-if="mobileOpen" class="mobile-drawer">
      <RouterLink to="/" @click="mobileOpen = false">首页</RouterLink>
      <RouterLink to="/user" @click="mobileOpen = false">生成</RouterLink>
      <a href="/ic/canvas" @click="mobileOpen = false">无限画布</a>
      <RouterLink to="/product-images" @click="mobileOpen = false">商品图</RouterLink>
      <RouterLink to="/ai-video" @click="mobileOpen = false">AI视频</RouterLink>
      <RouterLink to="/model-plaza" @click="mobileOpen = false">模特图</RouterLink>
      <RouterLink to="/tools" @click="mobileOpen = false">图片工具</RouterLink>
      <RouterLink to="/graphic-design" @click="mobileOpen = false">平面设计</RouterLink>
      <RouterLink to="/docs" @click="mobileOpen = false">文档</RouterLink>
    </div>

    <main class="page-main" :class="{ tight: isHome }">
      <RouterView />
    </main>

    <button class="help-fab" type="button" @click="store.helpOpen = true">
      <Icon name="message" :size="18" />
      帮助
    </button>

    <LoginModal />
    <HelpDrawer />
    <SearchModal />
    <PayModal />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import LogoMark from '../components/LogoMark.vue'
import LoginModal from '../components/LoginModal.vue'
import HelpDrawer from '../components/HelpDrawer.vue'
import SearchModal from '../components/SearchModal.vue'
import PayModal from '../components/PayModal.vue'
import { store, logout, formatCredits } from '../store'
import { productCatalog, modelCatalog, moreCategories } from '../data/catalogs'
import { getBusinessCategory, sceneRoute } from '../data/business'

const route = useRoute()
const openMenu = ref('')
const langOpen = ref(false)
const userOpen = ref(false)
const mobileOpen = ref(false)
const lang = ref('简体中文')
const langs = ['简体中文', '繁體中文', 'English']

const isHome = computed(() => route.path === '/')
const isProduct = computed(() => route.path.startsWith('/product-images'))
const isVideo = computed(() => route.path.startsWith('/ai-video'))
const isModel = computed(() => route.path.startsWith('/model'))
const isTools = computed(() => route.path.startsWith('/tools') || route.path === '/photo-edit')
const isGraphic = computed(() => route.path.startsWith('/graphic-design'))
const isMore = computed(() => ['/cross-border', '/marketing', '/pod-images', '/derive-images', '/image-creation', '/learn', '/templates', '/ecommerce-assets'].some((p) => route.path.startsWith(p)))
const videoCategory = computed(() => getBusinessCategory('video'))
const toolCategory = computed(() => getBusinessCategory('toolbox'))
const graphicCategory = computed(() => getBusinessCategory('graphic-design'))
const initials = computed(() => (store.user?.name || '我')[0])

function bizTo(category, scene) {
  return sceneRoute(category, scene)
}

function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    store.searchOpen = true
  }
  if (e.key === 'Escape') {
    store.searchOpen = false
    store.helpOpen = false
    langOpen.value = false
    mobileOpen.value = false
  }
}
function prefetchCanvas() {
  if (window.__icPrefetched) return
  window.__icPrefetched = true
  fetch('/ic/index.html', { priority: 'low' })
    .then((res) => res.text())
    .then((html) => {
      const hrefs = [...html.matchAll(/(?:src|href)="(\/ic\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1])
      hrefs.forEach((href) => {
        const link = document.createElement('link')
        link.rel = href.endsWith('.css') ? 'preload' : 'prefetch'
        if (href.endsWith('.css')) link.as = 'style'
        link.href = href
        document.head.appendChild(link)
      })
    })
    .catch(() => {})
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200))
  idle(() => prefetchCanvas())
})
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.public-root { min-height: 100vh; }
.top-bar {
  position: fixed; top: .6rem; right: .75rem; left: .75rem; z-index: 40;
  overflow: visible; border: 1px solid color-mix(in srgb, var(--hairline) 85%, transparent);
  border-radius: 1.15rem; background: color-mix(in srgb, var(--surface) 94%, var(--app-bg));
  box-shadow: 0 8px 24px -20px #0f172a80; backdrop-filter: blur(18px);
}
.top-bar-inner { display: flex; width: 100%; min-height: 4.35rem; align-items: center; gap: .7rem; padding: 0 1rem; }
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--fg); flex-shrink: 0; }
.brand span { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; }
.brand-spark { font-style: normal; color: #7c3aed; font-size: 12px; margin-left: -4px; }
.top-nav { display: flex; align-items: center; gap: .2rem; margin-left: .7rem; }
.flex-1 { flex: 1; min-width: 1rem; }
.top-link {
  min-height: 2.55rem; padding: .55rem .9rem; border-radius: 999px; font-size: 14px; font-weight: 500;
  color: var(--fg-2); text-decoration: none; background: transparent; border: none; cursor: pointer; white-space: nowrap;
}
.top-link:hover { color: var(--fg); background: var(--hover); }
.top-link.on { color: #a21caf; font-weight: 700; background: linear-gradient(135deg, #f472b629, #818cf829); box-shadow: inset 0 0 0 1px #d946ef4d; }
.product-nav, .business-nav { position: relative; display: flex; align-items: center; }
.product-nav:after, .business-nav:after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  width: min(760px, calc(100vw - 2rem));
  height: .6rem;
}
.nav-chevron { margin-left: 2px; color: var(--fg-2); transition: transform .15s; }
.nav-chevron.open { transform: rotate(180deg); }
.product-menu, .business-menu {
  position: absolute; top: calc(100% + .6rem); left: 0; z-index: 60; display: grid;
  grid-template-columns: repeat(2, minmax(150px, 1fr)); gap: 1rem; width: 500px; max-height: min(70vh, 520px);
  overflow: auto; padding: 1rem; border-radius: 1rem; background: var(--menu-bg);
  box-shadow: 0 20px 45px -20px #00000059, inset 0 0 0 1px var(--hairline);
}
.product-menu-group, .business-menu-group { display: flex; flex-direction: column; gap: .1rem; }
.product-menu-group > span, .business-menu-group > span { margin: 0 0 .3rem; padding: 0 .55rem; color: var(--fg-3); font-size: .68rem; letter-spacing: .06em; }
.product-menu-item, .business-menu-item { padding: .38rem .55rem; border-radius: .55rem; color: var(--fg-2); font-size: .78rem; text-decoration: none; }
.product-menu-item:hover, .business-menu-item:hover { color: var(--fg); background: var(--hover); }
.business-menu { width: 640px; grid-template-columns: repeat(3, minmax(145px, 1fr)); }
.business-menu-featured { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .55rem; padding-bottom: .65rem; border-bottom: 1px solid var(--hairline); }
.business-featured-link { display: grid; gap: .22rem; padding: .65rem .7rem; border: 1px solid var(--hairline); border-radius: .65rem; color: var(--fg); text-decoration: none; background: var(--surface-2); }
.business-featured-link:hover { border-color: #6754eb52; background: var(--hover); }
.business-featured-link strong { font-size: .76rem; }
.business-featured-link span { color: var(--fg-3); font-size: .64rem; line-height: 1.45; }
.video-business-menu { width: min(620px, calc(100vw - 2rem)); grid-template-columns: repeat(2, minmax(210px, 1fr)); }
.model-business-menu { width: min(720px, calc(100vw - 2rem)); }
.model-business-menu .business-menu-featured { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.tools-business-menu { width: min(680px, calc(100vw - 2rem)); grid-template-columns: repeat(2, minmax(190px, 1fr)); }
.tools-business-menu .tools-menu-group { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .1rem .45rem; }
.tools-business-menu .tools-menu-group > span { grid-column: 1 / -1; }
.graphic-design-business-menu { width: min(660px, calc(100vw - 2rem)); grid-template-columns: repeat(2, minmax(210px, 1fr)); }
.more-business-menu { grid-template-columns: 190px minmax(360px, 1fr); width: min(760px, calc(100vw - 2rem)); gap: 0; padding: .65rem; }
.more-category-list { display: grid; align-content: start; gap: .18rem; padding-right: .65rem; border-right: 1px solid var(--hairline); }
.more-cat { display: grid; padding: .5rem .6rem; border-radius: .55rem; text-decoration: none; }
.more-cat:hover { background: var(--hover); }
.more-cat b { font-size: .8rem; }
.more-cat small { color: var(--fg-3); font-size: .64rem; }
.more-preview { padding: 1rem 1.1rem; }
.more-preview b { font-size: .9rem; }
.more-preview p { color: var(--fg-2); font-size: .78rem; line-height: 1.6; }
.more-preview a { color: #7c3aed; font-size: .8rem; font-weight: 650; }
.top-actions { display: flex; align-items: center; gap: .55rem; flex-shrink: 0; }
.icon-btn { width: 36px; height: 36px; border: 0; border-radius: 999px; background: transparent; color: var(--fg-2); display: grid; place-items: center; }
.icon-btn:hover { background: var(--hover); color: var(--fg); }
.login-btn { min-height: 36px; padding: .4rem 1rem; border: 0; border-radius: 999px; color: #fff; background: var(--btn-solid-bg); font-weight: 650; }
.top-balance { border: 1px solid var(--hairline); background: var(--surface); border-radius: 999px; padding: .4rem .75rem; font-size: .8rem; color: var(--fg); }
.avatar { width: 34px; height: 34px; border-radius: 999px; border: 0; background: linear-gradient(135deg, #7c3aed, #db2777); color: #fff; font-weight: 700; }
.user-wrap, .lang { position: relative; }
.user-menu, .lang-menu {
  position: absolute; right: 0; top: calc(100% + .4rem); min-width: 180px; padding: .45rem;
  border-radius: .9rem; background: #fff; box-shadow: 0 18px 40px -22px #00000059, inset 0 0 0 1px var(--hairline);
  display: grid;
}
.user-menu a, .user-menu button, .lang-menu button {
  text-align: left; padding: .5rem .65rem; border: 0; background: transparent; border-radius: .5rem; color: var(--fg-2); text-decoration: none; font-size: .82rem;
}
.user-menu a:hover, .user-menu button:hover, .lang-menu button:hover { background: var(--hover); color: var(--fg); }
.user-head { padding: .45rem .65rem .6rem; font-weight: 700; }
.page-main { padding: 6.2rem clamp(1rem, 2.5vw, 2.25rem) 4rem; }
.page-main.tight { padding-left: 0; padding-right: 0; padding-bottom: 0; }
.help-fab {
  position: fixed; right: 1.1rem; bottom: 1.1rem; z-index: 30; display: inline-flex; align-items: center; gap: .4rem;
  min-height: 42px; padding: .55rem .9rem; border: 0; border-radius: 999px; color: #fff; background: var(--btn-solid-bg);
  box-shadow: 0 16px 32px -18px #0f172acc;
}
.burger { display: none; border: 1px solid var(--hairline); background: #fff; border-radius: 999px; padding: .4rem .7rem; }
.mobile-drawer { display: none; }
@media (max-width: 1120px) {
  .top-nav { display: none; }
  .burger { display: inline-flex; }
  .mobile-drawer { display: grid; position: fixed; top: 5.2rem; left: .75rem; right: .75rem; z-index: 39; padding: .75rem; border-radius: 1rem; background: #fff; box-shadow: 0 20px 40px -24px #0006; }
  .mobile-drawer a { padding: .65rem .7rem; text-decoration: none; border-radius: .55rem; color: var(--fg); }
  .mobile-drawer a:hover { background: var(--hover); }
}
</style>
