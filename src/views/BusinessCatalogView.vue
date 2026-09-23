<template>
  <section v-if="category" class="business-catalog" :data-tone="category.tone" :style="{ '--business-accent': category.accent, '--business-soft': category.soft }">
    <header class="business-catalog-hero">
      <div class="business-hero-copy">
        <RouterLink class="business-back" to="/">← 返回首页</RouterLink>
        <p class="business-kicker">{{ category.kicker }}</p>
        <h1>{{ category.title }}</h1>
        <p class="business-hero-description">{{ category.description }}</p>
        <div class="business-hero-actions">
          <RouterLink v-if="primaryScene" class="business-primary" :to="sceneRoute(category, primaryScene)">
            <Icon :name="category.icon" />
            {{ primaryScene.capability === 'implemented' ? '开始创作' : '查看场景规划' }}
          </RouterLink>
          <a class="business-secondary" href="#business-scene-list">
            浏览全部场景
            <Icon name="chevron" />
          </a>
        </div>
      </div>
      <div class="business-hero-art" :aria-label="`${category.label}示例`">
        <figure class="business-art-card business-art-card-back">
          <img :src="category.hero.secondary.file" :alt="category.hero.secondary.label" />
          <figcaption>{{ category.hero.secondary.label }}</figcaption>
        </figure>
        <figure class="business-art-card business-art-card-side">
          <img :src="category.hero.tertiary.file" :alt="category.hero.tertiary.label" />
          <figcaption>{{ category.hero.tertiary.label }}</figcaption>
        </figure>
        <figure class="business-art-card business-art-card-main">
          <img :src="category.hero.primary.file" :alt="category.hero.primary.label" />
          <figcaption>{{ category.hero.primary.label }}</figcaption>
        </figure>
      </div>
    </header>

    <section id="business-scene-list" class="business-scene-library">
      <div class="business-library-head">
        <div>
          <p class="business-kicker">SCENE LIBRARY</p>
          <h2>按业务选择{{ category.label }}功能</h2>
        </div>
        <div class="business-summary">
          <strong>{{ implementedCount }}</strong> 项已接入
          <span>/</span>
          {{ allScenes.length }} 项场景
        </div>
      </div>
      <div class="business-toolbar">
        <label class="business-search">
          <Icon name="search" />
          <input v-model="query" type="search" :placeholder="`搜索${category.label}功能`" :aria-label="`搜索${category.label}功能`" />
        </label>
        <span v-if="query.trim()" class="business-filter-count" role="status">{{ matchedScenes.length }} 项结果</span>
      </div>
      <div v-if="!groups.length" class="business-empty" role="status">
        <Icon name="search" />
        <strong>没有找到匹配的功能</strong>
        <button type="button" @click="query = ''">清除搜索</button>
      </div>
      <section v-for="group in groups" :key="group.key" class="business-group" :aria-label="group.label">
        <div class="business-group-head">
          <span class="business-group-icon">
            <Icon :name="group.icon" />
          </span>
          <div>
            <h3>{{ group.label }}</h3>
            <p>{{ group.description }}</p>
          </div>
          <span class="business-group-count">{{ group.scenes.length }}</span>
        </div>
        <div class="business-scene-grid">
          <RouterLink v-for="scene in group.scenes" :key="scene.slug" class="business-scene-card" :to="sceneRoute(category, scene)">
            <div class="business-scene-image">
              <img :src="scene.preview || category.hero.primary.file" :alt="scene.title" loading="lazy" />
              <span :class="{ ready: scene.capability === 'implemented' }">{{ statusLabel(scene) }}</span>
            </div>
            <div class="business-scene-body">
              <div class="business-scene-title">
                <h4>{{ scene.title }}</h4>
                <Icon name="chevron" />
              </div>
              <p>{{ scene.description }}</p>
              <span class="business-scene-link">{{ actionLabel(scene) }}</span>
            </div>
          </RouterLink>
        </div>
      </section>
    </section>

    <section class="business-note">
      <div class="business-note-icon">
        <Icon name="check" />
      </div>
      <div>
        <strong>场景先展示清晰契约，再逐项开放</strong>
        <p>已接入场景沿用现有工作台；其余场景先保留真实的输入、输出和业务边界，接入模型、计费和结果处理后再开放提交。</p>
      </div>
    </section>
  </section>
  <section v-else class="business-empty-page">
    <Icon name="help" />
    <h1>找不到这个业务分类</h1>
    <RouterLink to="/">返回首页</RouterLink>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import { filterBusinessScenes, getBusinessCategory, sceneRoute } from '../data/business'

const props = defineProps({ categoryKey: String })
const route = useRoute()
const query = ref('')
const category = computed(() => getBusinessCategory(props.categoryKey || route.meta.businessCategory))
const matchedScenes = computed(() => filterBusinessScenes(category.value?.key, query.value))
const groups = computed(() => {
  const slugs = new Set(matchedScenes.value.map((scene) => scene.slug))
  return (category.value?.groups || [])
    .map((group) => ({ ...group, scenes: group.scenes.filter((scene) => slugs.has(scene.slug)) }))
    .filter((group) => group.scenes.length)
})
const allScenes = computed(() => category.value?.groups.flatMap((group) => group.scenes) || [])
const implementedCount = computed(() => allScenes.value.filter((scene) => scene.capability === 'implemented').length)
const primaryScene = computed(() => allScenes.value.find((scene) => scene.capability === 'implemented') || allScenes.value[0] || null)

function statusLabel(scene) {
  if (scene.navigation) return '导航入口'
  if (scene.capability === 'implemented') return '已接入'
  return '逐步接入'
}

function actionLabel(scene) {
  if (scene.navigation) return '打开入口'
  if (scene.capability === 'implemented') return '进入工作台'
  return '查看场景规划'
}
</script>

<style scoped>
.business-catalog {
  color: var(--fg);
  padding-bottom: 2rem;
}
.business-catalog-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(350px, .82fr);
  gap: 3.5rem;
  align-items: center;
  min-height: 370px;
  margin: 0 -2rem 2.8rem;
  padding: 3.5rem 4rem;
  border-top: 1px solid color-mix(in srgb, var(--business-accent) 18%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--business-accent) 16%, transparent);
  background: color-mix(in srgb, var(--business-soft) 46%, var(--surface));
}
.business-hero-copy { max-width: 650px; }
.business-back {
  display: inline-flex;
  color: var(--fg-3);
  font-size: .76rem;
  text-decoration: none;
}
.business-back:hover { color: var(--fg); }
.business-kicker {
  margin: .7rem 0;
  color: var(--business-accent);
  font-size: .67rem;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.business-hero-copy h1 {
  margin: 0;
  font-size: 2.75rem;
  line-height: 1.16;
  font-weight: 780;
}
.business-hero-description {
  max-width: 610px;
  margin: 1.15rem 0 0;
  color: var(--fg-2);
  font-size: .92rem;
  line-height: 1.85;
}
.business-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .65rem;
  margin-top: 1.45rem;
}
.business-primary, .business-secondary {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  min-height: 41px;
  padding: .64rem .9rem;
  border-radius: 8px;
  font-size: .78rem;
  font-weight: 750;
  text-decoration: none;
}
.business-primary {
  color: #fff;
  background: var(--business-accent);
  box-shadow: 0 12px 22px -15px color-mix(in srgb, var(--business-accent) 85%, transparent);
}
.business-primary:hover { filter: brightness(.94); }
.business-primary svg { width: .9rem; height: .9rem; }
.business-secondary {
  color: var(--fg);
  border: 1px solid var(--hairline);
  background: var(--surface);
}
.business-secondary:hover { border-color: color-mix(in srgb, var(--business-accent) 45%, var(--hairline)); }
.business-secondary svg { width: .75rem; height: .75rem; transform: rotate(-90deg); }
.business-hero-art { position: relative; min-height: 285px; }
.business-art-card {
  position: absolute;
  overflow: hidden;
  margin: 0;
  border: 7px solid rgb(255 255 255 / .92);
  border-radius: 16px;
  background: var(--surface-2);
  box-shadow: 0 24px 48px -32px #0f172aa6;
}
.business-art-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.business-art-card figcaption {
  position: absolute;
  right: .55rem;
  bottom: .55rem;
  left: .55rem;
  padding: .38rem .48rem;
  border-radius: 6px;
  color: #fff;
  background: #0f172aa3;
  font-size: .62rem;
  font-weight: 700;
}
.business-art-card-back { top: 38px; left: 4%; width: 52%; height: 212px; transform: rotate(-7deg); }
.business-art-card-side { top: 28px; right: 3%; width: 48%; height: 202px; transform: rotate(7deg); }
.business-art-card-main { z-index: 2; top: 8px; left: 23%; width: 53%; height: 260px; transform: rotate(1deg); }
.business-scene-library { padding: 0 1rem; }
.business-library-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}
.business-library-head .business-kicker { margin-bottom: .5rem; }
.business-library-head h2 { margin: 0; font-size: 1.75rem; font-weight: 760; }
.business-summary { margin-bottom: .2rem; color: var(--fg-3); font-size: .72rem; }
.business-summary strong { color: var(--business-accent); }
.business-summary span { margin: 0 .3rem; }
.business-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.35rem 0 1.9rem;
}
.business-search {
  display: flex;
  align-items: center;
  gap: .55rem;
  width: min(100%, 420px);
  padding: .7rem .8rem;
  border: 1px solid var(--hairline);
  border-radius: 8px;
  color: var(--fg-3);
  background: var(--surface);
}
.business-search:focus-within {
  outline: 2px solid color-mix(in srgb, var(--business-accent) 25%, transparent);
  outline-offset: 2px;
}
.business-search svg { width: 1rem; height: 1rem; flex: none; }
.business-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: var(--fg);
  background: transparent;
  font: inherit;
  font-size: .8rem;
}
.business-search input::placeholder { color: var(--fg-3); }
.business-filter-count { color: var(--fg-3); font-size: .72rem; }
.business-group { margin-top: 2rem; }
.business-group-head {
  display: flex;
  align-items: center;
  gap: .7rem;
  margin-bottom: .85rem;
}
.business-group-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  color: var(--business-accent);
  background: var(--business-soft);
}
.business-group-icon svg { width: 1rem; height: 1rem; }
.business-group-head h3 { margin: 0; font-size: .96rem; font-weight: 750; }
.business-group-head p { margin: .2rem 0 0; color: var(--fg-3); font-size: .69rem; }
.business-group-count { margin-left: auto; color: var(--fg-3); font-size: .72rem; }
.business-scene-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .9rem;
}
.business-scene-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--hairline);
  border-radius: 9px;
  color: var(--fg);
  background: var(--surface);
  text-decoration: none;
  transition: transform .15s ease, border-color .15s ease, background .15s ease;
}
.business-scene-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--business-accent) 45%, var(--hairline));
  background: var(--surface-2);
}
.business-scene-image {
  position: relative;
  aspect-ratio: 1.42;
  overflow: hidden;
  background: var(--surface-2);
}
.business-scene-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .3s ease;
}
.business-scene-card:hover .business-scene-image img { transform: scale(1.04); }
.business-scene-image > span {
  position: absolute;
  top: .5rem;
  right: .5rem;
  padding: .24rem .36rem;
  border-radius: 5px;
  color: var(--fg-3);
  background: #ffffffe0;
  font-size: .6rem;
}
.business-scene-image > span.ready { color: #23866e; }
.business-scene-body { padding: .72rem; }
.business-scene-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .35rem;
}
.business-scene-title h4 {
  margin: 0;
  font-size: .83rem;
  font-weight: 750;
  line-height: 1.4;
}
.business-scene-title svg {
  width: .72rem;
  height: .72rem;
  flex: none;
  color: var(--fg-3);
  transform: rotate(-90deg);
}
.business-scene-body p {
  min-height: 3.1em;
  margin: .35rem 0 .7rem;
  color: var(--fg-3);
  font-size: .68rem;
  line-height: 1.55;
}
.business-scene-link {
  color: var(--business-accent);
  font-size: .67rem;
  font-weight: 700;
}
.business-empty, .business-empty-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .7rem;
  min-height: 220px;
  color: var(--fg-3);
}
.business-empty svg, .business-empty-page > svg { width: 1.45rem; height: 1.45rem; }
.business-empty strong, .business-empty-page h1 { color: var(--fg-2); font-size: .9rem; }
.business-empty button {
  border: 0;
  color: var(--business-accent);
  background: transparent;
  font: inherit;
  font-size: .76rem;
  cursor: pointer;
}
.business-empty-page h1 { margin: 0; font-size: 1.2rem; }
.business-empty-page a { color: var(--business-accent); font-size: .78rem; text-decoration: none; }
.business-note {
  display: flex;
  align-items: flex-start;
  gap: .75rem;
  margin: 3.5rem 1rem 0;
  padding: 1rem 1.1rem;
  border: 1px solid color-mix(in srgb, var(--business-accent) 18%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--business-soft) 48%, transparent);
}
.business-note-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 7px;
  color: var(--business-accent);
  background: var(--business-soft);
}
.business-note-icon svg { width: .85rem; height: .85rem; }
.business-note strong { color: var(--fg); font-size: .77rem; }
.business-note p { margin: .3rem 0 0; color: var(--fg-3); font-size: .69rem; line-height: 1.55; }
@media (max-width: 1100px) {
  .business-catalog-hero { gap: 2rem; padding-right: 2.5rem; padding-left: 2.5rem; }
  .business-hero-copy h1 { font-size: 2.5rem; }
  .business-scene-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .business-catalog-hero { display: block; margin: 0 -1rem 2rem; padding: 2.4rem 1rem 2rem; }
  .business-hero-copy h1 { font-size: 2.15rem; }
  .business-hero-description { font-size: .86rem; }
  .business-hero-art { min-height: 255px; margin-top: 1.4rem; }
  .business-library-head { align-items: start; flex-direction: column; }
  .business-library-head h2 { font-size: 1.5rem; }
  .business-summary { margin: 0; }
  .business-scene-library { padding: 0; }
  .business-scene-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem; }
  .business-scene-body { padding: .65rem; }
  .business-scene-body p { min-height: 4.6em; }
  .business-note { margin-right: 0; margin-left: 0; }
}
@media (max-width: 380px) {
  .business-scene-grid { grid-template-columns: 1fr; }
}
</style>
