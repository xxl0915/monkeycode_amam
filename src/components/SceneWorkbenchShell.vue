<template>
  <div class="compact-workbench" :class="`${kind}-workbench`">
    <div class="mobile-scene-tabs" :aria-label="navLabel">
      <RouterLink
        v-for="s in allScenes"
        :key="s.slug"
        :to="`${base}/${s.slug}`"
        :class="{ active: s.slug === scene }"
      >{{ s.title }}</RouterLink>
    </div>
    <div class="workbench-layout">
      <aside class="scene-sidebar" :aria-label="navLabel">
        <div v-for="g in catalog" :key="g.key" class="scene-group">
          <p>{{ g.label }}</p>
          <RouterLink
            v-for="s in g.scenes"
            :key="s.slug"
            :to="`${base}/${s.slug}`"
            class="scene-nav-item"
            :class="{ active: s.slug === scene }"
          >
            <span>{{ s.title }}</span>
          </RouterLink>
        </div>
      </aside>
      <section class="workbench-main">
        <slot />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { modelCatalog, productCatalog } from '../data/catalogs'

const props = defineProps({
  kind: { type: String, default: 'product' },
  scene: { type: String, default: '' }
})

const catalog = computed(() => (props.kind === 'model' ? modelCatalog : productCatalog))
const base = computed(() => (props.kind === 'model' ? '/model-images' : '/product-images'))
const navLabel = computed(() => (props.kind === 'model' ? '模特图功能导航' : '商品图功能导航'))
const allScenes = computed(() => catalog.value.flatMap((g) => g.scenes || []))
</script>

<style scoped>
.compact-workbench { min-width: 0; }
.workbench-layout { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: .65rem; align-items: start; }
.scene-sidebar {
  position: sticky; top: 74px; max-height: calc(100dvh - 100px); overflow: auto;
  padding: .65rem; border: 1px solid var(--hairline); border-radius: .9rem;
  background: var(--surface); box-shadow: 0 1px 2px #0f172a08;
}
.scene-group { margin: .1rem 0 .65rem; }
.scene-group > p { margin: .3rem .5rem .35rem; color: var(--fg-3); font-size: .64rem; font-weight: 600; letter-spacing: .04em; }
.scene-nav-item {
  display: flex; align-items: center; justify-content: space-between; gap: .45rem;
  min-height: 2rem; padding: .45rem .55rem; border: 1px solid transparent; border-radius: .65rem;
  color: var(--fg-2); font-size: .74rem; line-height: 1.25; text-decoration: none;
}
.scene-nav-item:hover { border-color: color-mix(in srgb, #a78bfa 28%, var(--hairline)); background: var(--hover); color: var(--fg); }
.scene-nav-item.active { border-color: #d946ef4d; color: var(--fg); background: linear-gradient(135deg, #f472b629, #818cf829); box-shadow: inset 0 0 0 1px #d946ef1f; }
.workbench-main { min-width: 0; }
.mobile-scene-tabs { display: none; }
@media (max-width: 900px) {
  .workbench-layout { grid-template-columns: minmax(0, 1fr); }
  .scene-sidebar { display: none; }
  .mobile-scene-tabs {
    display: flex; gap: .45rem; overflow-x: auto; margin-bottom: .7rem; padding: .15rem 0;
    scrollbar-width: none;
  }
  .mobile-scene-tabs::-webkit-scrollbar { display: none; }
  .mobile-scene-tabs a {
    flex: none; padding: .55rem .8rem; border: 1px solid var(--hairline); border-radius: 999px;
    color: var(--fg-2); font-size: .75rem; text-decoration: none; white-space: nowrap;
  }
  .mobile-scene-tabs a.active { border-color: #fb7185; color: #ef4444; background: #fb718514; font-weight: 700; }
}
</style>
