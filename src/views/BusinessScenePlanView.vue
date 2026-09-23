<template>
  <section v-if="category && scene" class="business-plan" :style="{ '--business-accent': category.accent, '--business-soft': category.soft }">
    <header class="plan-header">
      <RouterLink class="plan-back" :to="category.path">← 返回{{ category.label }}</RouterLink>
      <div class="plan-status" :class="{ ready: ready }">{{ ready ? '已接入' : '逐步接入' }}</div>
      <p class="plan-kicker">{{ category.kicker }}</p>
      <h1>{{ scene.title }}</h1>
      <p>{{ scene.description }}</p>
    </header>
    <div class="plan-layout">
      <div class="plan-preview">
        <img :src="scene.preview || category.hero.primary.file" :alt="scene.title" />
        <div class="plan-preview-copy">
          <span>{{ category.label }}</span>
          <strong>{{ ready ? '当前能力沿用已有工作台' : '本场景正在按业务契约接入' }}</strong>
        </div>
      </div>
      <div class="plan-content">
        <section class="plan-section">
          <div class="plan-section-title">
            <Icon name="upload" />
            <h2>场景输入</h2>
          </div>
          <ul>
            <li v-for="item in scene.inputHint || []" :key="item">{{ item }}</li>
          </ul>
        </section>
        <section class="plan-section">
          <div class="plan-section-title">
            <Icon name="files" />
            <h2>预期结果</h2>
          </div>
          <ul>
            <li v-for="item in scene.outputHint || []" :key="item">{{ item }}</li>
          </ul>
        </section>
        <section class="plan-contract">
          <span>实现方式</span>
          <strong>{{ scene.kind }}</strong>
          <p>{{ ready ? '当前入口会跳转到已经验证的商品图工作台，保持原有业务和计费链路。' : '接入后会使用独立场景字段、模型策略、积分价格和结果类型，不会改变现有生成页面。' }}</p>
        </section>
        <div class="plan-actions">
          <RouterLink v-if="ready && target" class="plan-primary" :to="target">
            <Icon name="spark" />
            前往已接入工作台
          </RouterLink>
          <RouterLink class="plan-secondary" :to="category.path">返回场景列表</RouterLink>
        </div>
      </div>
    </div>
  </section>
  <section v-else class="business-plan-empty">
    <Icon name="help" />
    <h1>找不到这个场景</h1>
    <RouterLink to="/">返回首页</RouterLink>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import { findBusinessScene, getBusinessCategory, sceneRoute } from '../data/business'

const props = defineProps({ categoryKey: String, sceneSlug: String })
const route = useRoute()
const category = computed(() => getBusinessCategory(props.categoryKey || route.meta.businessCategory))
const scene = computed(() => findBusinessScene(category.value?.key, props.sceneSlug || route.params.scene))
const ready = computed(() => scene.value?.capability === 'implemented')
const target = computed(() => (scene.value ? sceneRoute(category.value, scene.value) : ''))
</script>

<style scoped>
.business-plan {
  max-width: 1080px;
  margin: 0 auto;
  padding-bottom: 2rem;
  color: var(--fg);
}
.plan-header {
  position: relative;
  padding: .5rem 0 1.6rem;
  border-bottom: 1px solid var(--hairline);
}
.plan-back { color: var(--fg-3); font-size: .76rem; text-decoration: none; }
.plan-back:hover { color: var(--fg); }
.plan-status {
  position: absolute;
  top: .3rem;
  right: 0;
  padding: .3rem .5rem;
  border-radius: 6px;
  color: var(--fg-3);
  background: var(--surface-2);
  font-size: .65rem;
}
.plan-status.ready { color: #23866e; background: #23866e1a; }
.plan-kicker {
  margin: 1.8rem 0 .6rem;
  color: var(--business-accent);
  font-size: .67rem;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.plan-header h1 {
  margin: 0;
  font-size: 2.3rem;
  line-height: 1.2;
  font-weight: 780;
}
.plan-header > p:last-child {
  max-width: 720px;
  margin: .85rem 0 0;
  color: var(--fg-2);
  font-size: .9rem;
  line-height: 1.8;
}
.plan-layout {
  display: grid;
  grid-template-columns: minmax(300px, .85fr) minmax(0, 1fr);
  gap: 1.2rem;
  margin-top: 1.4rem;
}
.plan-preview {
  overflow: hidden;
  border: 1px solid var(--hairline);
  border-radius: 10px;
  background: var(--surface);
}
.plan-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 1.2;
  object-fit: cover;
}
.plan-preview-copy { display: grid; gap: .3rem; padding: .8rem; }
.plan-preview-copy span { color: var(--business-accent); font-size: .66rem; font-weight: 750; }
.plan-preview-copy strong { font-size: .8rem; line-height: 1.5; }
.plan-content { display: grid; align-content: start; gap: .8rem; }
.plan-section {
  padding: .9rem;
  border: 1px solid var(--hairline);
  border-radius: 9px;
  background: var(--surface);
}
.plan-section-title { display: flex; align-items: center; gap: .45rem; }
.plan-section-title svg { width: .95rem; height: .95rem; color: var(--business-accent); }
.plan-section-title h2 { margin: 0; font-size: .86rem; }
.plan-section ul {
  display: grid;
  gap: .4rem;
  margin: .7rem 0 0;
  padding-left: 1.1rem;
  color: var(--fg-2);
  font-size: .76rem;
  line-height: 1.55;
}
.plan-contract {
  padding: .9rem;
  border: 1px solid color-mix(in srgb, var(--business-accent) 18%, transparent);
  border-radius: 9px;
  background: color-mix(in srgb, var(--business-soft) 45%, transparent);
}
.plan-contract span { color: var(--fg-3); font-size: .66rem; }
.plan-contract strong {
  display: block;
  margin-top: .25rem;
  color: var(--business-accent);
  font-size: .82rem;
}
.plan-contract p { margin: .45rem 0 0; color: var(--fg-2); font-size: .72rem; line-height: 1.6; }
.plan-actions { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: .15rem; }
.plan-primary, .plan-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .35rem;
  min-height: 40px;
  padding: .6rem .8rem;
  border-radius: 7px;
  font-size: .75rem;
  font-weight: 750;
  text-decoration: none;
}
.plan-primary { color: #fff; background: var(--business-accent); }
.plan-primary svg { width: .85rem; height: .85rem; }
.plan-secondary {
  color: var(--fg-2);
  border: 1px solid var(--hairline);
  background: var(--surface);
}
.plan-primary:hover { filter: brightness(.94); }
.plan-secondary:hover { border-color: color-mix(in srgb, var(--business-accent) 45%, var(--hairline)); }
.business-plan-empty {
  display: grid;
  place-items: center;
  gap: .65rem;
  min-height: 360px;
  color: var(--fg-3);
  text-align: center;
}
.business-plan-empty svg { width: 1.5rem; height: 1.5rem; }
.business-plan-empty h1 { margin: 0; color: var(--fg); font-size: 1.2rem; }
.business-plan-empty a { color: var(--business-accent); font-size: .78rem; text-decoration: none; }
@media (max-width: 720px) {
  .plan-header { padding-top: 0; }
  .plan-status { top: 0; }
  .plan-header h1 { padding-right: 5rem; font-size: 1.8rem; }
  .plan-layout { grid-template-columns: 1fr; }
  .plan-preview img { aspect-ratio: 1.35; }
  .plan-actions { flex-direction: column; }
  .plan-primary, .plan-secondary { width: 100%; }
}
</style>
