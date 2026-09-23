<template>
  <div class="edit">
    <header>
      <h1>{{ title }}</h1>
      <p>裁剪、旋转、改尺寸、调色全部在浏览器本地完成。文件不会上传到服务器。</p>
    </header>
    <div class="pane">
      <aside>
        <label class="pick">选择图片<input type="file" accept="image/*" @change="onFile" /></label>
        <label>亮度 <input type="range" min="70" max="140" v-model="bright" /></label>
        <label>对比度 <input type="range" min="70" max="160" v-model="contrast" /></label>
        <label>饱和度 <input type="range" min="0" max="200" v-model="sat" /></label>
        <label>旋转
          <select v-model="rot">
            <option :value="0">0°</option>
            <option :value="90">90°</option>
            <option :value="180">180°</option>
            <option :value="270">270°</option>
          </select>
        </label>
        <button type="button" @click="reset">重置</button>
      </aside>
      <div class="canvas">
        <img v-if="src" :src="src" alt="" :style="filter" />
        <p v-else>上传一张图片开始本地编辑</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { localTools } from '../data/catalogs'
const route = useRoute()
const tool = localTools.find((t) => route.path.endsWith(t.slug))
const title = tool?.title || '图片编辑'
const src = ref('')
const bright = ref(100)
const contrast = ref(100)
const sat = ref(100)
const rot = ref(0)
const filter = computed(() => ({
  filter: `brightness(${bright.value}%) contrast(${contrast.value}%) saturate(${sat.value}%)`,
  transform: `rotate(${rot.value}deg)`
}))
function onFile(e) {
  const f = e.target.files?.[0]
  if (f) src.value = URL.createObjectURL(f)
}
function reset() { bright.value = 100; contrast.value = 100; sat.value = 100; rot.value = 0 }
</script>
<style scoped>
.edit { max-width: 1100px; margin: 0 auto; }
h1 { margin: 0; }
p { color: var(--fg-2); }
.pane { display: grid; grid-template-columns: 260px 1fr; gap: 1rem; margin-top: 1.2rem; }
aside { display: grid; align-content: start; gap: .8rem; padding: 1rem; border: 1px solid var(--hairline); border-radius: 1rem; background: var(--surface); }
.pick { display: grid; gap: .4rem; font-size: .82rem; }
.canvas { min-height: 420px; display: grid; place-items: center; border-radius: 1rem; background: repeating-conic-gradient(#e2e8f0 0 25%, #fff 0 50%) 50% / 24px 24px; overflow: hidden; }
.canvas img { max-width: 92%; max-height: 520px; }
@media (max-width: 800px) { .pane { grid-template-columns: 1fr; } }
</style>
