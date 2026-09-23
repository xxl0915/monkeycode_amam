<template>
  <div class="plaza">
    <header>
      <div>
        <h1>{{ exclusive ? 'AI专属模特' : '模特广场' }}</h1>
        <p>{{ exclusive ? '创建属于品牌自己的长期可复用模特资产。' : '浏览可直接使用的商用 AI 模特，选中后可带入试穿工作台。' }}</p>
      </div>
      <RouterLink v-if="!exclusive" class="cta" to="/exclusive-models">设计专属模特</RouterLink>
    </header>
    <div class="filters">
      <button v-for="t in tags" :key="t" type="button" :class="{ on: tag === t }" @click="tag = t">{{ t }}</button>
    </div>
    <div class="grid">
      <button v-for="m in list" :key="m.id" type="button" @click="$router.push({ path: '/model-images/tryon-any', query: { model: m.name } })">
        <img :src="m.image" :alt="m.name" />
        <b>{{ m.name }}</b>
        <span>{{ m.tag }}</span>
      </button>
    </div>
    <section v-if="!exclusive">
      <h2>模特图场景</h2>
      <div class="scenes">
        <RouterLink v-for="s in modelScenes" :key="s.slug" :to="`/model-images/${s.slug}`">
          <b>{{ s.title }}</b>
          <span>{{ s.description }}</span>
        </RouterLink>
      </div>
    </section>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { plazaModels, modelScenes } from '../data/catalogs'
defineProps({ exclusive: Boolean })
const tag = ref('全部')
const tags = ['全部', '东亚', '通勤', '时尚', '男性']
const list = computed(() => tag.value === '全部' ? plazaModels : plazaModels.filter((m) => m.tag.includes(tag.value)))
</script>
<style scoped>
.plaza { max-width: 1280px; margin: 0 auto; }
header { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; }
h1 { margin: 0; font-size: 1.7rem; }
p { color: var(--fg-2); max-width: 36rem; line-height: 1.7; }
.cta { min-height: 40px; display: inline-flex; align-items: center; padding: 0 1rem; border-radius: 8px; background: var(--btn-solid-bg); color: #fff; text-decoration: none; font-weight: 650; }
.filters { display: flex; gap: .45rem; margin: 1.4rem 0; flex-wrap: wrap; }
.filters button { border: 1px solid var(--hairline); background: #fff; border-radius: 999px; padding: .4rem .8rem; color: var(--fg-2); }
.filters button.on { color: #a21caf; background: linear-gradient(135deg, #f472b629, #818cf829); border-color: #d946ef4d; }
.grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.grid button { border: 0; padding: 0; text-align: left; background: transparent; }
.grid img { width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 1.1rem; background: #e2e8f0; }
.grid b { display: block; margin-top: .55rem; }
.grid span { color: var(--fg-3); font-size: .78rem; }
h2 { margin: 2.4rem 0 .9rem; font-size: 1.1rem; }
.scenes { display: grid; grid-template-columns: repeat(3, 1fr); gap: .8rem; }
.scenes a { display: grid; gap: .3rem; padding: 1rem; border: 1px solid var(--hairline); border-radius: .85rem; text-decoration: none; background: var(--surface); }
.scenes b { font-size: .9rem; }
.scenes span { color: var(--fg-3); font-size: .76rem; line-height: 1.55; }
@media (max-width: 900px) { .grid, .scenes { grid-template-columns: repeat(2, 1fr); } }
</style>
