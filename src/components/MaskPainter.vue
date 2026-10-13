<template>
  <Teleport to="body">
    <div class="painter-mask" @click.self="emit('cancel')">
      <div class="painter-card">
        <header>
          <div>
            <h2>涂抹蒙版</h2>
            <p>红色区域会交给模型编辑，其余画面保持原样。</p>
          </div>
          <button type="button" class="text-btn" @click="emit('cancel')">关闭</button>
        </header>
        <div class="stage">
          <div class="frame">
            <img ref="sourceEl" :src="src" alt="原图" @load="onLoad" />
            <canvas
              ref="viewEl"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="onPointerUp"
              @pointercancel="onPointerUp"
            />
          </div>
        </div>
        <div class="tools">
          <div class="tool-pills">
            <button type="button" :class="{ active: tool === 'brush' }" @click="tool = 'brush'">画笔</button>
            <button type="button" :class="{ active: tool === 'eraser' }" @click="tool = 'eraser'">橡皮</button>
          </div>
          <label>笔刷
            <input v-model.number="size" type="range" min="8" max="64" />
            <span>{{ size }}</span>
          </label>
          <button type="button" class="text-btn" @click="clearPaint">清空</button>
        </div>
        <footer>
          <p>{{ hint }}</p>
          <div>
            <button type="button" class="text-btn" @click="emit('cancel')">取消</button>
            <button type="button" class="primary-btn" :disabled="!dirty || exporting" @click="confirm">
              {{ exporting ? '导出中…' : '确认蒙版' }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  src: { type: String, required: true }
})
const emit = defineEmits(['confirm', 'cancel'])

const sourceEl = ref(null)
const viewEl = ref(null)
const tool = ref('brush')
const size = ref(28)
const dirty = ref(false)
const exporting = ref(false)
const last = ref(null)
const paintCanvas = document.createElement('canvas')
let drawing = false

const hint = computed(() => (dirty.value ? '已圈选编辑区域' : '先在原图上涂抹要改的区域'))

function syncViewSize() {
  const img = sourceEl.value
  const canvas = viewEl.value
  if (!img || !canvas || !img.naturalWidth) return
  const width = img.clientWidth || img.naturalWidth
  const height = img.clientHeight || img.naturalHeight
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  paintCanvas.width = img.naturalWidth
  paintCanvas.height = img.naturalHeight
  redrawView()
}

function onLoad() {
  dirty.value = false
  last.value = null
  syncViewSize()
}

onMounted(() => {
  if (sourceEl.value?.complete) onLoad()
})

function redrawView() {
  const canvas = viewEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(paintCanvas, 0, 0)
}

function pointFromEvent(e) {
  const canvas = viewEl.value
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function stroke(from, to) {
  const ctx = paintCanvas.getContext('2d')
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = Number(size.value) || 28
  if (tool.value === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = 'rgba(0,0,0,1)'
  } else {
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = '#ef4444'
  }
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  dirty.value = true
  redrawView()
}

function onPointerDown(e) {
  e.preventDefault()
  viewEl.value?.setPointerCapture(e.pointerId)
  drawing = true
  const point = pointFromEvent(e)
  last.value = point
  stroke(point, point)
}

function onPointerMove(e) {
  if (!drawing || !last.value) return
  const point = pointFromEvent(e)
  stroke(last.value, point)
  last.value = point
}

function onPointerUp() {
  drawing = false
  last.value = null
}

function clearPaint() {
  const ctx = paintCanvas.getContext('2d')
  ctx.clearRect(0, 0, paintCanvas.width, paintCanvas.height)
  dirty.value = false
  redrawView()
}

function confirm() {
  if (!dirty.value || exporting.value) return
  exporting.value = true
  const out = document.createElement('canvas')
  out.width = paintCanvas.width
  out.height = paintCanvas.height
  const ctx = out.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.globalCompositeOperation = 'destination-out'
  ctx.drawImage(paintCanvas, 0, 0)
  out.toBlob((blob) => {
    exporting.value = false
    if (!blob) return
    emit('confirm', new File([blob], 'mask.png', { type: 'image/png' }))
  }, 'image/png')
}

onBeforeUnmount(() => {
  drawing = false
})
</script>

<style scoped>
.painter-mask { position: fixed; inset: 0; z-index: 90; display: grid; place-items: center; padding: 1rem; background: #0f172a66; }
.painter-card { display: grid; width: min(720px, 100%); max-height: min(92dvh, 840px); overflow: hidden; border: 1px solid var(--hairline); border-radius: 12px; background: var(--surface); color: var(--fg); }
header, footer { display: flex; align-items: flex-start; justify-content: space-between; gap: .7rem; padding: .85rem 1rem; }
header { border-bottom: 1px solid var(--hairline); }
footer { align-items: center; border-top: 1px solid var(--hairline); }
header h2 { margin: 0; font-size: 1rem; }
header p, footer p { margin: .2rem 0 0; color: var(--fg-3); font-size: .68rem; }
.stage { display: grid; place-items: center; min-height: 280px; padding: .8rem; background: repeating-conic-gradient(#e2e8f0 0 25%, #fff 0 50%) 50% / 16px 16px; overflow: auto; }
.frame { position: relative; display: inline-block; max-width: 100%; }
.frame img { display: block; max-width: 100%; max-height: min(52dvh, 520px); }
.frame canvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: crosshair; opacity: .55; }
.tools { display: flex; align-items: center; gap: .7rem; flex-wrap: wrap; padding: .65rem 1rem; border-top: 1px solid var(--hairline); }
.tool-pills { display: flex; gap: .35rem; }
.tool-pills button { min-height: 2rem; padding: .35rem .7rem; border: 1px solid var(--hairline); border-radius: 999px; color: var(--fg-2); background: var(--surface); font-size: .72rem; }
.tool-pills button.active { border-color: #7c3aed; color: #7c3aed; background: #7c3aed14; }
.tools label { display: flex; align-items: center; gap: .4rem; color: var(--fg-2); font-size: .72rem; }
.tools input { width: 120px; }
.text-btn { padding: .45rem .7rem; border: 0; border-radius: 999px; color: #7c3aed; background: transparent; font-size: .7rem; }
.primary-btn { min-height: 36px; padding: .45rem .8rem; border: 0; border-radius: 7px; color: #fff; background: #7c3aed; font-weight: 600; }
.primary-btn:disabled { opacity: .45; }
footer div { display: flex; gap: .4rem; }
</style>
