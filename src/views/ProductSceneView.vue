<template>
  <SceneWorkbenchShell :kind="kind" :scene="sceneSlug">
    <div v-if="schema" class="scene-workbench">
      <div class="scene-columns">
        <div class="scene-input-column">
          <div class="scene-input-head">
            <div>
              <h2>{{ schema.title }}</h2>
              <p>{{ schema.description }}</p>
            </div>
            <button type="button" class="scene-new-task" :disabled="busy" @click="resetTask">＋ 新建任务</button>
          </div>
          <div class="scene-scroll">
            <section class="form-section">
              <div class="section-title">
                <span>1</span>
                <div>
                  <h2>上传参考图</h2>
                  <p>按角色上传素材，必填项会在生成前校验。</p>
                </div>
              </div>
              <div v-for="role in schema.roles" :key="role.key" class="role-block">
                <div class="role-head">
                  <strong>{{ role.label }} <em v-if="role.min > 0">（必填）</em><em v-else>（非必填）</em></strong>
                  <small>{{ (uploads[role.key] || []).length }}/{{ role.max }}</small>
                </div>
                <div class="reference-row">
                  <button v-for="item in uploads[role.key] || []" :key="item.id" type="button" class="thumb-preview">
                    <img :src="item.preview" :alt="item.name" />
                    <i @click.stop="removeImage(role.key, item.id)">×</i>
                  </button>
                  <button v-if="(uploads[role.key] || []).length < role.max" type="button" class="upload-tile" @click="pick(role.key)">
                    <Icon name="plus" :size="18" />
                    <span>上传{{ role.label }}</span>
                    <small>JPG / PNG / WebP</small>
                  </button>
                </div>
                <div v-if="!(uploads[role.key] || []).length" class="example-strip">
                  <span>推荐示例</span>
                  <button v-for="ex in examplesFor(role)" :key="ex.file" type="button" @click="useExample(role.key, ex)">
                    <img :src="ex.file" :alt="ex.name" />
                  </button>
                </div>
              </div>
              <p class="tips"><b>Tips.</b> 支持 JPG / PNG / GIF / WebP，单张不超过 50MB；建议清晰展示主体全貌。</p>
            </section>

            <section class="form-section">
              <div class="section-title">
                <span>2</span>
                <div>
                  <h2>生成参数</h2>
                  <p>{{ schema.instruction }}</p>
                </div>
              </div>
              <div class="field-stack">
                <template v-for="field in schema.fields" :key="field.key">
                  <div v-if="visible(field)" class="field-block" :class="field.type">
                    <label v-if="field.type === 'select'">{{ field.label }}
                      <select v-model="form[field.key]">
                        <option v-for="opt in field.options || []" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                      </select>
                    </label>
                    <label v-else-if="field.type === 'textarea'">{{ field.label }}
                      <textarea v-model="form[field.key]" :rows="4" :maxlength="field.max || 4000" :placeholder="field.placeholder || ''"></textarea>
                    </label>
                    <label v-else-if="field.type === 'text'">{{ field.label }}
                      <input v-model="form[field.key]" type="text" :maxlength="field.max || 500" :placeholder="field.placeholder || ''" />
                    </label>
                    <label v-else-if="field.type === 'number'">{{ field.label }}
                      <select v-model.number="form[field.key]">
                        <option v-for="n in numberOptions(field)" :key="n" :value="n">{{ n }}</option>
                      </select>
                    </label>
                    <label v-else-if="field.type === 'color'" class="color-label">{{ field.label }}
                      <input v-model="form[field.key]" type="color" />
                    </label>
                    <label v-else-if="field.type === 'checkbox'" class="toggle-row">
                      <input v-model="form[field.key]" type="checkbox" />
                      {{ field.label }}
                    </label>
                    <div v-else-if="field.type === 'multiselect'">
                      <span class="field-name">{{ field.label }}</span>
                      <div class="choice-pills">
                        <button
                          v-for="opt in field.options || []"
                          :key="opt.value"
                          type="button"
                          :class="{ active: (form[field.key] || []).includes(opt.value) }"
                          @click="toggleMulti(field, opt.value)"
                        >{{ opt.label }}</button>
                      </div>
                    </div>
                    <div v-else-if="field.type === 'repeater'" class="repeater">
                      <div class="repeater-head">
                        <span class="field-name">{{ field.label }}</span>
                        <button type="button" class="text-btn" @click="addRepeater(field)">{{ field.addLabel || '添加' }}</button>
                      </div>
                      <article v-for="(row, idx) in form[field.key] || []" :key="row.id || idx" class="repeater-row">
                        <div class="repeater-row-head">
                          <strong>{{ row.label || row.id || `项目 ${idx + 1}` }}</strong>
                          <button type="button" class="text-btn" @click="removeRepeater(field, idx)">删除</button>
                        </div>
                        <label v-for="sub in field.fields || []" :key="sub.key">{{ sub.label }}
                          <select v-if="sub.type === 'select'" v-model="row[sub.key]">
                            <option v-for="opt in sub.options || []" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                          </select>
                          <textarea v-else-if="sub.type === 'textarea'" v-model="row[sub.key]" rows="2"></textarea>
                          <input v-else-if="sub.type === 'number'" v-model.number="row[sub.key]" type="number" :min="sub.min" :max="sub.max" />
                          <input v-else v-model="row[sub.key]" type="text" />
                        </label>
                      </article>
                    </div>
                  </div>
                </template>
              </div>
            </section>
          </div>
          <div class="scene-submit">
            <div>
              <strong>{{ outputCount }} 张</strong>
              <span>{{ canGenerate ? 'AI 生成 · 4 积分' : generateHint }}</span>
            </div>
            <button type="button" class="primary-btn" :disabled="!canGenerate" @click="generate">
              {{ busy ? '生成中…' : `开始生成 ${outputCount} 张 4 积分` }}
            </button>
          </div>
          <p v-if="notice" class="scene-feedback">{{ notice }}</p>
        </div>

        <aside class="scene-result-column">
          <div class="result-head">
            <div>
              <p>{{ kindLabel }}</p>
              <h2>{{ schema.title }}</h2>
              <span>{{ schema.description }}</span>
            </div>
            <button type="button" class="text-btn" @click="resultTab = 'result'">刷新</button>
          </div>
          <div class="result-tabs">
            <button type="button" :class="{ on: resultTab === 'result' }" @click="resultTab = 'result'">AI 创作结果</button>
            <button type="button" :class="{ on: resultTab === 'examples' }" @click="resultTab = 'examples'">创作案例</button>
          </div>
          <div class="result-scroll">
            <template v-if="resultTab === 'result'">
              <div v-if="!results.length" class="result-empty">
                <Icon name="spark" :size="28" />
                <strong>还没有结果</strong>
                <p>补齐必填素材后，点击开始生成。</p>
              </div>
              <div v-else class="result-grid">
                <article v-for="item in results" :key="item.id" class="result-card">
                  <img :src="item.image" :alt="item.title" />
                  <div class="result-meta">
                    <div>
                      <strong>{{ item.title }}</strong>
                      <small>{{ item.ratio }} · {{ item.model }}</small>
                    </div>
                    <a :href="item.image" download>下载</a>
                  </div>
                </article>
              </div>
            </template>
            <div v-else class="result-grid">
              <article v-for="ex in caseExamples" :key="ex.file" class="result-card">
                <img :src="ex.file" :alt="ex.name" />
                <div class="result-meta"><strong>{{ ex.name }}</strong></div>
              </article>
            </div>
          </div>
        </aside>
      </div>
      <input ref="fileInput" class="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple @change="onFiles" />
    </div>
    <div v-else class="missing">未找到场景 {{ sceneSlug }}</div>
  </SceneWorkbenchShell>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import SceneWorkbenchShell from '../components/SceneWorkbenchShell.vue'
import sceneSchemas from '../data/sceneSchemas.json'
import { onlineModels, plazaModels } from '../data/catalogs'
import { store, createJob, pollJob } from '../store'

const props = defineProps({
  kind: { type: String, default: '' },
  scene: { type: String, default: '' }
})

const route = useRoute()
const sceneSlug = computed(() => props.scene || String(route.params.scene || ''))
const kind = computed(() => props.kind || (route.path.startsWith('/model-images') ? 'model' : 'product'))
const kindLabel = computed(() => (kind.value === 'model' ? '模特图' : '商品图'))
const schema = computed(() => sceneSchemas.find((s) => s.slug === sceneSlug.value) || null)
const models = onlineModels.filter((m) => !m.video)

const fileInput = ref(null)
const pickRole = ref('product')
const uploads = reactive({})
const form = reactive({})
const busy = ref(false)
const resultTab = ref('result')
const results = ref([])
const notice = ref('')

const productPool = [
  { name: '商品套图', file: '/product-scenes/samples/suite.webp' },
  { name: '主图', file: '/product-scenes/samples/hero-image.webp' },
  { name: '种草', file: '/product-scenes/samples/seeding.webp' },
  { name: '面料上身', file: '/product-scenes/samples/fabric-tryon.webp' },
  { name: '服饰多变', file: '/product-scenes/samples/garment-multi.webp' },
  { name: '箱包', file: '/product-scenes/samples/bag.jpg' },
  { name: '项链', file: '/product-scenes/samples/necklace.jpg' }
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function defaultValue(field) {
  if (field.default !== undefined) return clone(field.default)
  if (field.type === 'multiselect' || field.type === 'repeater') return []
  if (field.type === 'checkbox') return false
  if (field.type === 'number') return field.min || 1
  return ''
}

function resetForm(next) {
  Object.keys(form).forEach((key) => { delete form[key] })
  ;(next?.fields || []).forEach((field) => { form[field.key] = defaultValue(field) })
}

function resetUploads(next) {
  Object.keys(uploads).forEach((key) => { delete uploads[key] })
  ;(next?.roles || []).forEach((role) => { uploads[role.key] = [] })
}

function resetTask() {
  resetForm(schema.value)
  resetUploads(schema.value)
  results.value = []
}

watch(schema, (next) => {
  resetForm(next)
  resetUploads(next)
  results.value = []
  resultTab.value = 'result'
}, { immediate: true })

function visible(field) {
  if (!field.when) return true
  return form[field.when.key] === field.when.value
}

function numberOptions(field) {
  const min = Number(field.min || 1)
  const max = Number(field.max || 8)
  return Array.from({ length: Math.max(1, max - min + 1) }, (_, i) => min + i)
}

function toggleMulti(field, value) {
  const current = Array.isArray(form[field.key]) ? [...form[field.key]] : []
  const i = current.indexOf(value)
  if (i >= 0) current.splice(i, 1)
  else {
    if (field.max && current.length >= field.max) return
    current.push(value)
  }
  form[field.key] = current
}

function addRepeater(field) {
  const list = Array.isArray(form[field.key]) ? form[field.key] : []
  if (field.max && list.length >= field.max) return
  const preset = field.presets?.[0]?.value || Object.fromEntries((field.fields || []).map((sub) => [sub.key, defaultValue(sub)]))
  const row = { ...clone(preset), id: `${field.key}-${Date.now()}` }
  form[field.key] = [...list, row]
}

function removeRepeater(field, idx) {
  form[field.key] = (form[field.key] || []).filter((_, i) => i !== idx)
}

function examplesFor(role) {
  if (['model', 'target', 'face', 'pose'].includes(role.key)) {
    return plazaModels.slice(0, 6).map((m) => ({ name: m.name, file: m.image }))
  }
  const own = `/product-scenes/samples/${sceneSlug.value}.webp`
  return [{ name: schema.value?.title || '示例', file: own }, ...productPool].slice(0, 6)
}

const caseExamples = computed(() => examplesFor(schema.value?.roles?.[0] || { key: 'product' }))

const missingRole = computed(() => (schema.value?.roles || []).find((role) => (uploads[role.key] || []).length < (role.min || 0)))
const outputCount = computed(() => Math.max(1, Number(form.count) || 1))
const canGenerate = computed(() => !!schema.value && !missingRole.value && !busy.value)
const generateHint = computed(() => (missingRole.value ? `请先上传${missingRole.value.label}` : '补充参数后即可生成'))

function pick(role) {
  pickRole.value = role
  fileInput.value?.click()
}

function addItems(role, items) {
  const meta = schema.value?.roles.find((r) => r.key === role)
  const max = meta?.max || 10
  const current = uploads[role] || []
  uploads[role] = [...current, ...items.slice(0, Math.max(0, max - current.length))]
}

function onFiles(e) {
  addItems(pickRole.value, [...(e.target.files || [])].map((file) => ({
    id: `${Date.now()}-${file.name}`,
    name: file.name,
    preview: URL.createObjectURL(file)
  })))
  e.target.value = ''
}

function useExample(role, ex) {
  addItems(role, [{ id: `${Date.now()}-${ex.name}`, name: ex.name, preview: ex.file }])
}

function removeImage(role, id) {
  uploads[role] = (uploads[role] || []).filter((item) => item.id !== id)
}

async function generate() {
  if (!canGenerate.value) return
  if (!store.user) {
    store.loginOpen = true
    return
  }
  busy.value = true
  notice.value = ''
  try {
    const refs = Object.entries(uploads).flatMap(([role, list]) =>
      (list || []).map((item) => ({ role, name: item.name, url: item.preview }))
    )
    const modelId = models[0]?.id || ''
    const job = await createJob({
      scene: schema.value.title,
      model: modelId,
      params: { ...form, outputCount: outputCount.value, ratio: form.ratio || schema.value.defaultRatio },
      refs
    })
    const finished = await pollJob(job.id)
    if (finished.status !== 'succeeded') throw new Error(finished.error || '生成失败，请稍后重试')
    const ratio = form.ratio || schema.value.defaultRatio || '3:4'
    ;(finished.outputs || []).forEach((output, i) => {
      results.value.unshift({
        id: `${finished.id}-${output.index ?? i}`,
        title: `${schema.value.title} ${i + 1}`,
        image: output.url,
        ratio,
        model: modelId
      })
    })
    resultTab.value = 'result'
  } catch (error) {
    notice.value = error?.message || '生成失败，请稍后重试'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.scene-workbench { color: var(--fg); min-width: 0; }
.scene-columns { display: grid; grid-template-columns: minmax(360px, 42%) minmax(0, 1fr); gap: 1rem; min-height: calc(100dvh - 10rem); }
.scene-input-column, .scene-result-column {
  display: flex; flex-direction: column; min-width: 0; max-height: calc(100dvh - 10rem);
  overflow: hidden; border: 1px solid var(--hairline); border-radius: 8px; background: var(--surface);
}
.scene-input-head, .result-head { display: flex; align-items: flex-start; justify-content: space-between; gap: .7rem; flex: none; padding: .85rem 1rem; border-bottom: 1px solid var(--hairline); }
.scene-input-head h2, .result-head h2 { margin: .15rem 0 0; font-size: 1rem; }
.scene-input-head p, .result-head span { margin: .2rem 0 0; color: var(--fg-3); font-size: .68rem; line-height: 1.4; }
.section-title p { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.result-head p { margin: 0; color: var(--fg-3); font-size: .62rem; font-weight: 700; }
.scene-new-task, .text-btn { padding: .45rem .7rem; border: 1px solid color-mix(in srgb, #8b5cf6 30%, var(--hairline)); border-radius: 999px; color: #7c3aed; background: color-mix(in srgb, #8b5cf6 8%, var(--surface)); font-size: .7rem; white-space: nowrap; }
.text-btn { border: 0; background: transparent; }
.scene-scroll, .result-scroll { min-height: 0; flex: 1; overflow-y: auto; padding: 1rem; }
.form-section { padding: 0 0 1.2rem; margin: 0 0 1.2rem; border-bottom: 1px solid var(--hairline); }
.form-section:last-child { margin-bottom: 0; border-bottom: 0; }
.section-title { display: flex; align-items: flex-start; gap: .65rem; margin-bottom: 1rem; }
.section-title > span { display: grid; place-content: center; flex: none; width: 1.7rem; height: 1.7rem; border-radius: 50%; color: #fff; background: #7c3aed; font-size: .75rem; font-weight: 700; }
.section-title h2 { margin: 0; font-size: .95rem; }
.section-title p { margin: .18rem 0 0; color: var(--fg-3); font-size: .7rem; line-height: 1.5; }
.role-block { margin: .8rem 0; }
.role-head { display: flex; justify-content: space-between; gap: .5rem; margin-bottom: .5rem; font-size: .8rem; }
.role-head em { color: #ef6b6b; font-style: normal; }
.role-head small { color: var(--fg-3); font-size: .7rem; }
.reference-row { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
.upload-tile { display: grid; place-items: center; gap: .2rem; width: 105px; min-height: 88px; border: 1px dashed var(--hairline); border-radius: 8px; color: var(--fg-2); background: var(--surface-2); cursor: pointer; }
.upload-tile span, .upload-tile small { font-size: .68rem; }
.upload-tile small { color: var(--fg-3); }
.thumb-preview { position: relative; padding: 0; border: 1px solid var(--hairline); border-radius: 8px; background: transparent; cursor: pointer; }
.thumb-preview img { display: block; width: 72px; height: 72px; object-fit: cover; border-radius: 7px; }
.thumb-preview i { position: absolute; top: -.3rem; right: -.25rem; width: 1rem; height: 1rem; border-radius: 50%; color: #fff; background: #ef4444; font-size: .7rem; font-style: normal; line-height: 1rem; }
.example-strip { display: flex; align-items: center; gap: .45rem; overflow: auto; margin-top: .65rem; color: var(--fg-3); font-size: .66rem; }
.example-strip button { flex: none; padding: .15rem; border: 1px solid var(--hairline); border-radius: .45rem; background: var(--surface); }
.example-strip img { display: block; width: 50px; height: 50px; object-fit: cover; border-radius: .3rem; }
.tips { margin-top: .65rem; padding: .65rem; border-radius: .55rem; color: var(--fg-3); background: color-mix(in srgb, #8b5cf6 10%, var(--surface)); font-size: .68rem; line-height: 1.5; }
.tips b { color: var(--fg-2); font-style: italic; }
.field-stack { display: grid; gap: .8rem; }
.field-block label, .field-name { display: grid; gap: .35rem; color: var(--fg-2); font-size: .72rem; }
.field-block input, .field-block textarea, .field-block select { box-sizing: border-box; width: 100%; padding: .62rem .7rem; border: 1px solid var(--hairline); border-radius: 7px; color: var(--fg); background: var(--app-bg); font: inherit; font-size: .78rem; }
.field-block textarea { resize: vertical; line-height: 1.6; }
.toggle-row { display: flex !important; align-items: center; gap: .35rem; color: var(--fg-2); font-size: .72rem; }
.toggle-row input { width: auto; accent-color: #7c3aed; }
.choice-pills { display: flex; gap: .35rem; flex-wrap: wrap; }
.choice-pills button { padding: .4rem .55rem; border: 1px solid var(--hairline); border-radius: 999px; color: var(--fg-2); background: var(--surface); font-size: .64rem; }
.choice-pills button.active { border-color: #fb7185; color: #ef4444; background: #fb71851a; }
.color-label input { width: 3rem; height: 2.2rem; padding: 0; }
.repeater-head, .repeater-row-head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.repeater-row { display: grid; gap: .45rem; margin-top: .45rem; padding: .65rem; border: 1px solid var(--hairline); border-radius: 8px; background: var(--surface-2); }
.scene-submit { display: flex; align-items: center; justify-content: space-between; gap: .8rem; flex: none; padding: .75rem 1rem; border-top: 1px solid var(--hairline); background: var(--surface); }
.scene-feedback { margin: 0; padding: .5rem 1rem; color: #e11d48; background: #e11d4812; font-size: .74rem; }
.scene-submit span { color: var(--fg-3); font-size: .65rem; }
.scene-submit strong { display: block; font-size: .82rem; }
.primary-btn { display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-height: 39px; padding: .55rem .8rem; border: 0; border-radius: 7px; color: #fff; background: var(--generation-cta-bg, #7c3aed); font-weight: 600; }
.primary-btn:disabled { opacity: .45; }
.result-tabs { display: flex; gap: .35rem; padding: .65rem 1rem 0; }
.result-tabs button { min-height: 2rem; padding: .35rem .7rem; border: 0; border-radius: 999px; color: var(--fg-3); background: var(--surface-2); font-size: .72rem; }
.result-tabs button.on { color: #7c3aed; background: linear-gradient(135deg, #a78bfa38, #ec48992e); }
.result-empty { display: grid; place-content: center; justify-items: center; gap: .5rem; min-height: 300px; color: var(--fg-3); font-size: .75rem; text-align: center; }
.result-empty strong { color: var(--fg); }
.result-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: .65rem; }
.result-card { overflow: hidden; border: 1px solid var(--hairline); border-radius: 8px; background: var(--surface-2); }
.result-card img { display: block; width: 100%; aspect-ratio: 3/4; object-fit: cover; }
.result-meta { display: flex; justify-content: space-between; gap: .4rem; padding: .55rem; }
.result-meta strong { display: block; overflow: hidden; font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }
.result-meta small { color: var(--fg-3); font-size: .62rem; }
.result-meta a { color: #7c3aed; font-size: .68rem; text-decoration: none; }
.missing { padding: 2rem; color: var(--fg-3); }
.hidden { display: none; }
@media (max-width: 980px) {
  .scene-columns { grid-template-columns: 1fr; min-height: 0; }
  .scene-input-column, .scene-result-column { max-height: none; }
}
</style>
