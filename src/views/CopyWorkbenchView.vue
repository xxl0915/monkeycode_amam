<template>
  <div v-if="schema" class="copy-workbench">
    <div class="copy-columns">
      <div class="copy-input">
        <div class="copy-head">
          <div>
            <p>{{ kindLabel }}</p>
            <h2>{{ schema.title }}</h2>
            <span>{{ schema.description }}</span>
          </div>
          <button type="button" class="text-btn" :disabled="busy" @click="resetTask">＋ 新建任务</button>
        </div>
        <div class="copy-scroll">
          <section class="form-section">
            <div class="section-title">
              <span>1</span>
              <div>
                <h2>商品资料</h2>
                <p>{{ schema.instruction }}</p>
              </div>
            </div>
            <div class="field-stack">
              <template v-for="field in schema.fields" :key="field.key">
                <label v-if="field.type === 'select'">{{ field.label }}
                  <select v-model="form[field.key]">
                    <option v-for="opt in field.options || []" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </label>
                <label v-else-if="field.type === 'textarea'">{{ field.label }}
                  <textarea v-model="form[field.key]" :rows="field.key.includes('info') || field.key.includes('listing') || field.key === 'source_listing' ? 8 : 4" :maxlength="field.max || 8000" :placeholder="field.placeholder || ''"></textarea>
                </label>
                <label v-else>{{ field.label }}
                  <input v-model="form[field.key]" type="text" :maxlength="field.max || 500" :placeholder="field.placeholder || ''" />
                </label>
               </template>
               <label>图片模型
                 <select v-model="selectedModel">
                   <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
                 </select>
               </label>
             </div>
           </section>
            <section class="form-section">
             <div class="section-title">
              <span>2</span>
              <div>
                <h2>{{ requireImage ? '待检测图片' : '可选商品图' }}</h2>
                <p>{{ requireImage ? '检测报告基于上传图片生成，至少上传 1 张。' : '参考图仅辅助描述，结果仍是文本。' }}</p>
              </div>
            </div>
            <div class="reference-row">
              <button v-for="item in uploads" :key="item.id" type="button" class="thumb-preview">
                <img :src="item.preview" :alt="item.name" />
                <i @click.stop="removeImage(item.id)">×</i>
              </button>
              <button v-if="uploads.length < 4" type="button" class="upload-tile" @click="pick">
                <Icon name="plus" :size="18" />
                <span>上传商品图</span>
              </button>
            </div>
          </section>
        </div>
        <div class="copy-submit">
          <div>
            <strong>文案结果</strong>
            <span>{{ canGenerate ? '对话生成 · 4 积分' : generateHint }}</span>
          </div>
          <button type="button" class="primary-btn" :disabled="!canGenerate" @click="generate">
            {{ busy ? '生成中…' : uploading ? '上传中…' : '开始生成 4 积分' }}
          </button>
        </div>
        <p v-if="notice" class="copy-feedback">{{ notice }}</p>
      </div>
      <aside class="copy-result">
        <div class="copy-head">
          <div>
            <p>结果</p>
            <h2>{{ schema.title }}</h2>
            <span>可复制后继续编辑</span>
          </div>
          <button v-if="resultText" type="button" class="text-btn" @click="copyText">{{ copied ? '已复制' : '复制全文' }}</button>
        </div>
        <div class="copy-scroll">
          <div v-if="!resultText" class="result-empty">
            <Icon name="spark" :size="28" />
            <strong>还没有文案</strong>
            <p>填写商品资料后点击开始生成。</p>
          </div>
          <pre v-else class="result-text">{{ resultText }}</pre>
        </div>
      </aside>
    </div>
    <input ref="fileInput" class="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple @change="onFiles" />
  </div>
  <div v-else class="missing">未找到场景 {{ sceneSlug }}</div>
</template>

<script setup>
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '../components/Icon.vue'
import sceneSchemas from '../data/sceneSchemas.json'
import { persistLocalItem, localImageItem, revokePreview } from '../api/upload'
import { friendlyJobError } from '../api/client'
import { store, createJob, pollJob } from '../store'
import { onlineModels } from '../data/catalogs'

const props = defineProps({
  kind: { type: String, default: 'material' },
  scene: { type: String, default: '' }
})

const route = useRoute()
const sceneSlug = computed(() => props.scene || String(route.params.scene || ''))
const schema = computed(() => sceneSchemas.find((item) => item.slug === sceneSlug.value) || null)
const kindLabel = computed(() => (props.kind === 'cross' ? '跨境上架' : props.kind === 'tool' ? 'AI 智能处理' : '电商素材'))
const models = onlineModels.filter((item) => !item.video)
const selectedModel = ref(models[0]?.id || 'nano-banana')

const fileInput = ref(null)
const form = reactive({})
const uploads = ref([])
const busy = ref(false)
const notice = ref('')
const resultText = ref('')
const copied = ref(false)

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function defaultValue(field) {
  if (field.default !== undefined) return clone(field.default)
  return ''
}

function resetForm(next) {
  Object.keys(form).forEach((key) => { delete form[key] })
  ;(next?.fields || []).forEach((field) => { form[field.key] = defaultValue(field) })
}

function resetUploads() {
  uploads.value.forEach((item) => revokePreview(item.preview))
  uploads.value = []
}

function resetTask() {
  resetForm(schema.value)
  resetUploads()
  resultText.value = ''
  notice.value = ''
  copied.value = false
}

watch(schema, (next) => {
  resetForm(next)
  resetUploads()
  resultText.value = ''
  notice.value = ''
}, { immediate: true })

onUnmounted(() => {
  uploads.value.forEach((item) => revokePreview(item.preview))
})

const primaryText = computed(() => {
  const keys = ['product_info', 'source_listing', 'listing_text']
  return keys.map((key) => String(form[key] || '').trim()).find(Boolean) || ''
})
const uploading = computed(() => uploads.value.some((item) => item.uploading))
const requireImage = computed(() => schema.value?.slug === 'pre-check')
const canGenerate = computed(() => {
  if (!schema.value || busy.value || uploading.value) return false
  if (requireImage.value) return uploads.value.length >= 1
  return !!primaryText.value || uploads.value.length > 0
})
const generateHint = computed(() => {
  if (requireImage.value && !uploads.value.length) return '请先上传待检测图片'
  if (!primaryText.value && !uploads.value.length) return '请先填写商品资料或上传参考图'
  if (uploading.value) return '图片上传中'
  return '补充资料后即可生成'
})

function pick() {
  fileInput.value?.click()
}

async function persistPendingUploads() {
  const userId = store.user?.id
  for (const item of uploads.value) await persistLocalItem(item, 'product', userId)
}

watch(() => store.user?.id, async (id) => {
  if (!id) return
  try {
    await persistPendingUploads()
  } catch (err) {
    notice.value = err?.message || '上传失败'
  }
})

async function onFiles(e) {
  const items = [...(e.target.files || [])].map((file) => localImageItem(file, { id: `${Date.now()}-${file.name}` }))
  uploads.value = [...uploads.value, ...items].slice(0, 4)
  e.target.value = ''
  if (store.user) {
    try {
      await persistPendingUploads()
    } catch (err) {
      notice.value = err?.message || '上传失败'
    }
  }
}

function removeImage(id) {
  const target = uploads.value.find((item) => item.id === id)
  revokePreview(target?.preview)
  uploads.value = uploads.value.filter((item) => item.id !== id)
}

async function copyText() {
  try {
    await navigator.clipboard.writeText(resultText.value)
    copied.value = true
  } catch {
    copied.value = false
  }
}

async function generate() {
  if (!canGenerate.value) return
  if (!store.user) {
    store.loginOpen = true
    return
  }
  busy.value = true
  notice.value = ''
  copied.value = false
  try {
    await persistPendingUploads()
    const failed = uploads.value.find((item) => item?.file && !item.url)
    if (failed) throw new Error(failed.error || '图片上传失败')
    const refs = uploads.value.filter((item) => item.url).map((item) => ({
      role: 'product',
      name: item.name,
      url: item.url,
      assetId: item.assetId
    }))
    const job = await createJob({
      scene: schema.value.slug,
      model: selectedModel.value || models[0]?.id || 'nano-banana',
      params: { ...form, outputCount: 1 },
      refs
    })
    const finished = await pollJob(job.id)
    if (finished.status !== 'succeeded') throw new Error(friendlyJobError(finished.error))
    resultText.value = String(finished.outputs?.[0]?.text || '').trim()
    if (!resultText.value) throw new Error('上游未返回文案，积分已退回')
  } catch (error) {
    notice.value = error?.message || '生成失败，请稍后重试'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.copy-workbench { color: var(--fg); min-width: 0; }
.copy-columns { display: grid; grid-template-columns: minmax(360px, 42%) minmax(0, 1fr); gap: 1rem; min-height: calc(100dvh - 10rem); }
.copy-input, .copy-result {
  display: flex; flex-direction: column; min-width: 0; max-height: calc(100dvh - 10rem);
  overflow: hidden; border: 1px solid var(--hairline); border-radius: 8px; background: var(--surface);
}
.copy-head { display: flex; align-items: flex-start; justify-content: space-between; gap: .7rem; flex: none; padding: .85rem 1rem; border-bottom: 1px solid var(--hairline); }
.copy-head p { margin: 0; color: var(--fg-3); font-size: .62rem; font-weight: 700; }
.copy-head h2 { margin: .15rem 0 0; font-size: 1rem; }
.copy-head span { margin: .2rem 0 0; color: var(--fg-3); font-size: .68rem; line-height: 1.4; }
.text-btn { padding: .45rem .7rem; border: 0; border-radius: 999px; color: #7c3aed; background: transparent; font-size: .7rem; white-space: nowrap; }
.copy-scroll { min-height: 0; flex: 1; overflow-y: auto; padding: 1rem; }
.form-section { padding: 0 0 1.2rem; margin: 0 0 1.2rem; border-bottom: 1px solid var(--hairline); }
.form-section:last-child { margin-bottom: 0; border-bottom: 0; }
.section-title { display: flex; align-items: flex-start; gap: .65rem; margin-bottom: 1rem; }
.section-title > span { display: grid; place-content: center; flex: none; width: 1.7rem; height: 1.7rem; border-radius: 50%; color: #fff; background: #7c3aed; font-size: .75rem; font-weight: 700; }
.section-title h2 { margin: 0; font-size: .95rem; }
.section-title p { margin: .18rem 0 0; color: var(--fg-3); font-size: .7rem; line-height: 1.5; }
.field-stack { display: grid; gap: .8rem; }
.field-stack label { display: grid; gap: .35rem; color: var(--fg-2); font-size: .72rem; }
.field-stack input, .field-stack textarea, .field-stack select { box-sizing: border-box; width: 100%; padding: .62rem .7rem; border: 1px solid var(--hairline); border-radius: 7px; color: var(--fg); background: var(--app-bg); font: inherit; font-size: .78rem; }
.field-stack textarea { resize: vertical; line-height: 1.6; }
.reference-row { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
.upload-tile { display: grid; place-items: center; gap: .2rem; width: 105px; min-height: 88px; border: 1px dashed var(--hairline); border-radius: 8px; color: var(--fg-2); background: var(--surface-2); cursor: pointer; }
.upload-tile span { font-size: .68rem; }
.thumb-preview { position: relative; padding: 0; border: 1px solid var(--hairline); border-radius: 8px; background: transparent; cursor: pointer; }
.thumb-preview img { display: block; width: 72px; height: 72px; object-fit: cover; border-radius: 7px; }
.thumb-preview i { position: absolute; top: -.3rem; right: -.25rem; width: 1rem; height: 1rem; border-radius: 50%; color: #fff; background: #ef4444; font-size: .7rem; font-style: normal; line-height: 1rem; }
.copy-submit { display: flex; align-items: center; justify-content: space-between; gap: .8rem; flex: none; padding: .75rem 1rem; border-top: 1px solid var(--hairline); }
.copy-submit span { color: var(--fg-3); font-size: .65rem; }
.copy-submit strong { display: block; font-size: .82rem; }
.primary-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 39px; padding: .55rem .8rem; border: 0; border-radius: 7px; color: #fff; background: var(--generation-cta-bg, #7c3aed); font-weight: 600; }
.primary-btn:disabled { opacity: .45; }
.copy-feedback { margin: 0; padding: .5rem 1rem; color: #e11d48; background: #e11d4812; font-size: .74rem; }
.result-empty { display: grid; place-content: center; justify-items: center; gap: .5rem; min-height: 300px; color: var(--fg-3); font-size: .75rem; text-align: center; }
.result-empty strong { color: var(--fg); }
.result-text { margin: 0; white-space: pre-wrap; word-break: break-word; color: var(--fg); font: inherit; font-size: .86rem; line-height: 1.7; }
.missing { padding: 2rem; color: var(--fg-3); }
.hidden { display: none; }
@media (max-width: 980px) {
  .copy-columns { grid-template-columns: 1fr; min-height: 0; }
  .copy-input, .copy-result { max-height: none; }
}
</style>
