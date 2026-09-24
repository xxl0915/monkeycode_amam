<template>
  <component :is="shellKind ? SceneWorkbenchShell : 'div'" :kind="shellKind" :scene="scene">
    <div class="wb">
      <aside>
        <div class="crumb">{{ kindLabel }} / {{ sceneMeta.title }}</div>
        <h1>{{ sceneMeta.title }}</h1>
        <p>{{ sceneMeta.description }}</p>
        <label class="block">提示词
          <textarea v-model="prompt" rows="6" placeholder="描述你想生成的画面、构图、光线和商品卖点"></textarea>
        </label>
        <label class="block">模型
          <select v-model="model">
            <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </label>
        <div class="row">
          <label>比例
            <select v-model="ratio">
              <option>1:1</option><option>3:4</option><option>4:5</option><option>16:9</option>
            </select>
          </label>
          <label>画质
            <select v-model="res">
              <option>1K</option><option>2K</option><option>4K</option>
            </select>
          </label>
        </div>
        <label class="upload">
          参考图
          <input type="file" accept="image/*" multiple @change="onFiles" />
          <div class="thumbs">
            <img v-for="(f, i) in refs" :key="i" :src="f" alt="" />
          </div>
        </label>
        <button class="gen" type="button" :disabled="busy" @click="generate">{{ busy ? '生成中…' : '开始生成 · 4 积分' }}</button>
        <p v-if="error" class="err">{{ error }}</p>
      </aside>
      <section>
        <div class="tabs">
          <button type="button" :class="{ on: tab === 'result' }" @click="tab = 'result'">结果</button>
          <button type="button" :class="{ on: tab === 'history' }" @click="tab = 'history'">历史</button>
        </div>
        <div v-if="!results.length && !busy" class="empty">
          <Icon name="spark" :size="28" />
          <b>还没有结果</b>
          <p>补充提示词和参考图后，点击开始生成。</p>
        </div>
        <div v-if="busy" class="empty">正在按 {{ sceneMeta.title }} 场景生成…</div>
        <div class="grid">
          <article v-for="r in shown" :key="r.id">
            <img :src="r.image" alt="" />
            <footer>
              <span>{{ r.model }} · {{ r.ratio }}</span>
              <a :href="r.image" download>下载</a>
            </footer>
          </article>
        </div>
      </section>
    </div>
  </component>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import SceneWorkbenchShell from '../components/SceneWorkbenchShell.vue'
import { productScenes, modelScenes, videoGroups, graphicGroups, podScenes, deriveScenes, marketingScenes, toolGroups, onlineModels } from '../data/catalogs'
import { store, createJob, pollJob } from '../store'

const props = defineProps({ kind: String, scene: String })
const route = useRoute()
const shellKind = computed(() => (props.kind === 'product' || props.kind === 'model' ? props.kind : ''))
const all = [
  ...productScenes,
  ...modelScenes,
  ...podScenes,
  ...deriveScenes,
  ...marketingScenes,
  ...graphicGroups.flatMap((g) => g.scenes),
  ...videoGroups.flatMap((g) => g.scenes),
  ...toolGroups.flatMap((g) => g.scenes)
]
const sceneMeta = computed(() => all.find((s) => s.slug === props.scene) || { title: props.scene, description: '按当前场景生成对应视觉结果。' })
const kindLabel = computed(() => ({ product: '商品图', model: '模特图', video: 'AI视频', tool: '图片工具', graphic: '平面设计', pod: '图片POD', derive: '爆款衍生', marketing: '营销场景', cross: '跨境上架', ecom: '电商素材' }[props.kind] || '工作台'))
const prompt = ref(route.query.prompt || sceneMeta.value.description || '')
const model = ref(onlineModels[0].id)
const models = onlineModels.filter((m) => props.kind === 'video' ? m.video : !m.video).concat(onlineModels)
const ratio = ref('3:4')
const res = ref('2K')
const refs = ref([])
const tab = ref('result')
const busy = ref(false)
const error = ref('')
const results = ref([])

function onFiles(e) {
  refs.value = [...e.target.files].slice(0, 4).map((f) => URL.createObjectURL(f))
}
async function generate() {
  if (!store.user) {
    store.loginOpen = true
    return
  }
  busy.value = true
  error.value = ''
  try {
    const job = await createJob({
      scene: sceneMeta.value.title,
      model: model.value,
      params: { prompt: prompt.value, ratio: ratio.value, resolution: res.value, outputCount: 1 },
      refs: refs.value.map((url, i) => ({ role: 'reference', name: `ref-${i + 1}`, url }))
    })
    const finished = await pollJob(job.id)
    if (finished.status !== 'succeeded') throw new Error(finished.error || '生成失败，请稍后重试')
    ;(finished.outputs || []).forEach((output, i) => {
      results.value.unshift({
        id: `${finished.id}-${output.index ?? i}`,
        image: output.url,
        model: model.value,
        ratio: ratio.value,
        prompt: prompt.value,
        scene: sceneMeta.value.title
      })
    })
  } catch (e) {
    error.value = e?.message || '生成失败，请稍后重试'
  } finally {
    busy.value = false
  }
}
const shown = computed(() => {
  if (tab.value !== 'history') return results.value
  return store.jobs.flatMap((job) => (job.outputs || []).map((output, i) => ({
    id: `${job.id}-${output.index ?? i}`,
    image: output.url,
    model: job.model,
    ratio: job.params?.ratio || '3:4'
  })))
})
</script>
<style scoped>
.wb { display: grid; grid-template-columns: minmax(280px, 360px) minmax(0, 1fr); gap: 1.25rem; max-width: 1280px; margin: 0 auto; min-height: calc(100vh - 8rem); }
aside { position: sticky; top: 6.2rem; align-self: start; padding: 1.1rem; border: 1px solid var(--hairline); border-radius: 1.1rem; background: var(--surface); }
.crumb { color: var(--fg-3); font-size: .72rem; }
h1 { margin: .35rem 0 0; font-size: 1.25rem; }
p { color: var(--fg-2); font-size: .82rem; line-height: 1.65; }
.block, .row label, .upload { display: grid; gap: .35rem; margin: .85rem 0; font-size: .78rem; color: var(--fg-3); }
textarea, select { width: 100%; border: 1px solid var(--hairline); border-radius: .7rem; padding: .7rem; background: #fff; color: var(--fg); }
.row { display: grid; grid-template-columns: 1fr 1fr; gap: .6rem; }
.thumbs { display: flex; gap: .4rem; flex-wrap: wrap; }
.thumbs img { width: 56px; height: 56px; object-fit: cover; border-radius: .5rem; }
.gen { width: 100%; min-height: 44px; border: 0; border-radius: .85rem; color: #fff; background: var(--generation-cta-bg); box-shadow: var(--generation-cta-shadow); font-weight: 750; }
.err { color: #e11d48; font-size: .78rem; }
section { min-width: 0; }
.tabs { display: flex; gap: .3rem; margin-bottom: 1rem; }
.tabs button { border: 0; background: var(--surface-2); border-radius: 999px; padding: .45rem .9rem; color: var(--fg-3); }
.tabs button.on { color: #7c3aed; background: linear-gradient(135deg, #a78bfa38, #ec48992e); }
.empty { display: grid; justify-items: center; gap: .5rem; padding: 4rem 1rem; color: var(--fg-3); text-align: center; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: .9rem; }
article { overflow: hidden; border-radius: 1rem; background: #fff; box-shadow: inset 0 0 0 1px var(--hairline); }
article img { width: 100%; aspect-ratio: 3/4; object-fit: cover; }
article footer { display: flex; justify-content: space-between; padding: .65rem .8rem; font-size: .74rem; color: var(--fg-3); }
article a { color: #7c3aed; text-decoration: none; }
@media (max-width: 900px) { .wb { grid-template-columns: 1fr; } aside { position: static; } }
</style>
