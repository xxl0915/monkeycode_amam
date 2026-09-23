<template>
  <div class="product-catalog">
    <header class="catalog-heading">
      <div class="catalog-title">
        <h1>{{ title }}</h1>
        <span class="catalog-total">{{ total }} 项功能</span>
      </div>
      <RouterLink v-if="cta" class="suite-cta" :to="cta.to">
        <Icon name="package" />
        <span>{{ cta.label }}</span>
        <Icon name="chevron" class="forward-icon" />
      </RouterLink>
    </header>
    <p v-if="kicker" class="kicker">{{ kicker }}</p>
    <div class="catalog-toolbar">
      <label class="catalog-search">
        <Icon name="search" />
        <input v-model="q" type="search" :placeholder="`搜索${title}功能`" />
      </label>
      <span v-if="q.trim()" class="catalog-count">{{ filteredScenes.length }} 项结果</span>
    </div>
    <div v-if="!groups.length" class="catalog-empty">
      <Icon name="search" />
      <strong>没有找到匹配的功能</strong>
      <button type="button" class="text-btn" @click="q = ''">清除搜索</button>
    </div>
    <section v-for="g in groups" :key="g.key || g.label" class="catalog-group">
      <div class="group-heading">
        <Icon :name="g.icon || 'spark'" :data-tone="g.tone" />
        <h2>{{ g.label }}</h2>
        <span class="group-count">{{ g.scenes.length }}</span>
      </div>
      <div class="scene-grid">
        <RouterLink v-for="s in g.scenes" :key="s.slug" class="scene-card" :to="`${base}/${s.slug}`">
          <div class="scene-card-top">
            <Icon :name="g.icon || 'spark'" class="scene-icon" :data-tone="g.tone" />
            <span class="scene-status" data-ready="true">已开放</span>
          </div>
          <h3>{{ s.title }}</h3>
          <p class="scene-description">{{ s.description }}</p>
          <span class="scene-open">进入工作台 <Icon name="chevron" class="forward-icon" /></span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'

const props = defineProps({
  title: String,
  kicker: String,
  catalog: { type: Array, default: () => [] },
  base: String,
  cta: Object
})
const q = ref('')
const total = computed(() => props.catalog.reduce((n, g) => n + (g.scenes?.length || 0), 0))
const filteredScenes = computed(() => {
  const k = q.value.trim().toLowerCase()
  const all = props.catalog.flatMap((g) => g.scenes || [])
  return k ? all.filter((s) => `${s.title} ${s.description}`.toLowerCase().includes(k)) : all
})
const groups = computed(() => {
  const slugs = new Set(filteredScenes.value.map((s) => s.slug))
  return props.catalog.map((g) => ({ ...g, scenes: (g.scenes || []).filter((s) => slugs.has(s.slug)) })).filter((g) => g.scenes.length)
})
</script>
<style scoped>
.product-catalog { padding-bottom: 2rem; max-width: 1280px; margin: 0 auto; }
.catalog-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .5rem 0 1.5rem; border-bottom: 1px solid var(--hairline); }
.catalog-title { display: flex; align-items: baseline; flex-wrap: wrap; gap: .8rem; }
h1 { margin: 0; font-size: 1.7rem; font-weight: 700; }
.catalog-total, .catalog-count, .group-count { color: var(--fg-3); font-size: .8rem; }
.kicker { color: var(--fg-2); max-width: 46rem; line-height: 1.7; }
.suite-cta { display: inline-flex; align-items: center; gap: .5rem; min-height: 40px; padding: .6rem .85rem; border: 1px solid var(--hairline); border-radius: 8px; color: var(--fg); background: var(--surface); font-size: .85rem; font-weight: 600; text-decoration: none; }
.forward-icon { transform: rotate(-90deg); }
.catalog-toolbar { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0 1.75rem; }
.catalog-search { display: flex; align-items: center; gap: .65rem; width: min(100%, 26rem); padding: .65rem .8rem; border: 1px solid var(--hairline); border-radius: 8px; color: var(--fg-3); background: var(--surface); }
.catalog-search input { width: 100%; border: 0; outline: 0; background: transparent; color: var(--fg); }
.catalog-group { margin-top: 1.75rem; }
.group-heading { display: flex; align-items: center; gap: .6rem; margin-bottom: .85rem; }
.group-heading h2 { margin: 0; font-size: 1rem; font-weight: 650; }
.scene-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .85rem; }
.scene-card { display: flex; flex-direction: column; gap: .5rem; min-height: 176px; padding: 1rem; border: 1px solid var(--hairline); border-radius: 8px; color: var(--fg-2); background: var(--surface); text-decoration: none; }
.scene-card:hover { border-color: var(--fg-3); background: var(--surface-2); }
.scene-card-top { display: flex; justify-content: space-between; align-items: center; }
.scene-status { color: #348972; font-size: .7rem; }
.scene-card h3 { margin: .4rem 0 0; color: var(--fg); font-size: .95rem; font-weight: 600; }
.scene-description { margin: 0; color: var(--fg-3); font-size: .78rem; line-height: 1.6; }
.scene-open { display: flex; align-items: center; gap: .35rem; margin-top: auto; padding-top: .5rem; font-size: .75rem; }
.catalog-empty { display: grid; justify-items: center; gap: .75rem; min-height: 220px; color: var(--fg-3); padding-top: 3rem; }
.text-btn { border: 0; background: transparent; color: var(--fg-2); text-decoration: underline; }
@media (max-width: 1100px) { .scene-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 720px) { .scene-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
