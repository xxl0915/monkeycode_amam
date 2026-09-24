<template>
  <section class="tools-page">
    <header class="tools-hero">
      <div class="tools-hero-copy">
        <p class="tools-kicker">实用工具</p>
        <h1>电商图片实用工具箱</h1>
        <p class="tools-hero-text">拼图、压缩、改尺寸、格式转换、图片标注，打开即用，文件只在当前浏览器处理。</p>
        <div class="tools-hero-meta">
          <span><Icon name="check" /> 本地处理</span>
          <span><Icon name="shield" /> 不消耗点数</span>
          <span><Icon name="spark" /> 无需登录</span>
        </div>
      </div>
      <div class="tools-hero-art" aria-hidden="true">
        <div class="tools-art-sheet tools-art-sheet-back"></div>
        <div class="tools-art-sheet tools-art-sheet-mid">
          <span class="tools-art-dot"></span>
          <span class="tools-art-line"></span>
          <span class="tools-art-line short"></span>
        </div>
        <div class="tools-art-sheet tools-art-sheet-main">
          <Icon name="files" />
          <strong>LOCAL</strong>
          <span>IMAGE KIT</span>
        </div>
      </div>
    </header>
    <div class="tools-toolbar">
      <div>
        <p class="tools-section-kicker">LOCAL IMAGE KIT</p>
        <h2>选择一个工具开始</h2>
      </div>
      <label class="tools-search">
        <Icon name="search" />
        <input v-model="query" type="search" placeholder="搜索图片工具" aria-label="搜索图片工具" />
      </label>
    </div>
    <div v-if="!filtered.length" class="tools-empty" role="status">
      <Icon name="search" />
      <strong>没有找到匹配的工具</strong>
      <button type="button" @click="query = ''">清除搜索</button>
    </div>
    <div v-else class="tools-grid">
      <RouterLink v-for="tool in filtered" :key="tool.slug" class="tool-card" :to="tool.route">
        <div class="tool-card-art" :data-tone="tool.tone">
          <img :src="tool.preview" :alt="`${tool.title}示例`" loading="lazy" />
          <span class="local-badge"><Icon name="check" /> 本地免费</span>
          <span class="tool-card-icon"><Icon :name="tool.icon" /></span>
        </div>
        <div class="tool-card-body">
          <div class="tool-card-title">
            <h3>{{ tool.title }}</h3>
            <Icon name="chevron" />
          </div>
          <p>{{ tool.description }}</p>
          <small>{{ tool.detail }}</small>
        </div>
      </RouterLink>
    </div>
    <section class="tools-note">
      <div class="tools-note-icon"><Icon name="shield" /></div>
      <div>
        <strong>文件只在浏览器本地处理</strong>
        <p>实用工具不上传到服务器、不消耗积分。AI 图层拆分、去水印和万能改图请从顶栏进入 AI 图片工具。</p>
      </div>
    </section>
  </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { localTools } from '../data/catalogs'

const query = ref('')
const filtered = computed(() => {
  const k = query.value.trim().toLowerCase()
  if (!k) return localTools
  return localTools.filter((t) => `${t.title} ${t.description} ${t.detail}`.toLowerCase().includes(k))
})
</script>
<style scoped>
.tools-page { color: var(--fg); padding-bottom: 2rem; }
.tools-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  align-items: center;
  gap: 2rem;
  min-height: 285px;
  margin: 0 -2rem 2.6rem;
  padding: 3.3rem 4rem;
  overflow: hidden;
  border-top: 1px solid rgb(244 114 182 / .15);
  border-bottom: 1px solid rgb(56 189 248 / .14);
  background: linear-gradient(115deg, #fff7fc, #fff 54%, #f0fbff);
}
.tools-hero-copy { position: relative; z-index: 1; max-width: 720px; }
.tools-kicker, .tools-section-kicker {
  margin: 0 0 .7rem;
  color: #be4f87;
  font-size: .68rem;
  font-weight: 800;
  letter-spacing: .16em;
  text-transform: uppercase;
}
.tools-hero h1 { margin: 0; font-size: 3.25rem; line-height: 1.13; font-weight: 780; }
.tools-hero-text { max-width: 650px; margin: 1.05rem 0 0; color: var(--fg-2); font-size: .94rem; line-height: 1.8; }
.tools-hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: .9rem 1.3rem;
  margin-top: 1.3rem;
  color: var(--fg-3);
  font-size: .73rem;
}
.tools-hero-meta span { display: inline-flex; align-items: center; gap: .35rem; }
.tools-hero-meta svg { width: .82rem; height: .82rem; color: #38a98b; }
.tools-hero-art { position: relative; min-height: 220px; }
.tools-art-sheet {
  position: absolute;
  overflow: hidden;
  border: 8px solid rgb(255 255 255 / .86);
  border-radius: 16px;
  box-shadow: 0 22px 38px -28px #2b274594;
}
.tools-art-sheet:after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgb(255 255 255 / .25), transparent 55%);
}
.tools-art-sheet-back {
  top: 34px; left: 4%; width: 56%; height: 155px; transform: rotate(-8deg);
  background: linear-gradient(140deg, #fbcfe8, #f0abfc 50%, #bfdbfe);
}
.tools-art-sheet-mid {
  z-index: 2; top: 18px; right: 3%; width: 58%; height: 174px; transform: rotate(8deg);
  background: linear-gradient(140deg, #cffafe, #bae6fd 46%, #ddd6fe);
}
.tools-art-sheet-main {
  z-index: 3; top: 23px; left: 21%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 57%; height: 175px; transform: rotate(-1deg); color: #56489f;
  background: linear-gradient(145deg, #fff, #fdf4ff);
}
.tools-art-sheet-main svg { width: 2.4rem; height: 2.4rem; margin-bottom: .6rem; color: #d14e96; }
.tools-art-sheet-main strong { font-size: 1.15rem; letter-spacing: .18em; }
.tools-art-sheet-main span { margin-top: .25rem; color: #8c82a8; font-size: .6rem; letter-spacing: .28em; }
.tools-art-dot {
  position: absolute; top: 30px; left: 28px; width: 26px; height: 26px; border-radius: 50%;
  background: #f9a8d4; box-shadow: 25px 35px #a5b4fc, 85px 15px #67e8f9;
}
.tools-art-line {
  position: absolute; right: 28px; bottom: 33px; width: 80px; height: 6px; border-radius: 999px; background: #6366f147;
}
.tools-art-line.short { right: 48px; bottom: 18px; width: 50px; background: #ec489940; }
.tools-toolbar { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.2rem; }
.tools-toolbar h2 { margin: 0; font-size: 1.45rem; font-weight: 760; }
.tools-search {
  display: flex; align-items: center; gap: .55rem; width: min(100%, 280px);
  padding: .65rem .75rem; border: 1px solid var(--hairline); border-radius: 8px; color: var(--fg-3); background: var(--surface);
}
.tools-search:focus-within { outline: 2px solid rgb(190 79 135 / .22); outline-offset: 2px; }
.tools-search svg { width: 1rem; height: 1rem; flex: none; }
.tools-search input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--fg); background: transparent; font: inherit; font-size: .78rem; }
.tools-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.tool-card {
  min-width: 0; overflow: hidden; border: 1px solid var(--hairline); border-radius: 11px;
  color: var(--fg); background: var(--surface); text-decoration: none;
  transition: transform .15s ease, border-color .15s ease, background .15s ease;
}
.tool-card:hover { transform: translateY(-2px); border-color: #be4f874d; background: var(--surface-2); }
.tool-card-art { position: relative; aspect-ratio: 1.55; overflow: hidden; background: var(--surface-2); }
.tool-card-art img { display: block; width: 100%; height: 100%; object-fit: cover; }
.local-badge {
  position: absolute; top: .55rem; left: .55rem; display: inline-flex; align-items: center; gap: .2rem;
  padding: .22rem .4rem; border-radius: 5px; color: #23866e; background: #ffffffe8; font-size: .6rem;
}
.local-badge svg { width: .7rem; height: .7rem; }
.tool-card-icon {
  position: absolute; right: .55rem; bottom: .55rem; display: grid; place-items: center;
  width: 1.8rem; height: 1.8rem; border-radius: 7px; color: #fff; background: #be4f87cc;
}
.tool-card-icon svg { width: .9rem; height: .9rem; }
.tool-card-body { padding: .85rem .9rem 1rem; }
.tool-card-title { display: flex; align-items: center; justify-content: space-between; gap: .4rem; }
.tool-card-title h3 { margin: 0; font-size: .95rem; font-weight: 750; }
.tool-card-title svg { width: .72rem; height: .72rem; color: var(--fg-3); transform: rotate(-90deg); }
.tool-card-body p { margin: .4rem 0 .5rem; color: var(--fg-2); font-size: .76rem; line-height: 1.55; }
.tool-card-body small { color: var(--fg-3); font-size: .66rem; line-height: 1.5; }
.tools-empty { display: grid; justify-items: center; gap: .7rem; min-height: 180px; color: var(--fg-3); padding-top: 2rem; }
.tools-empty button { border: 0; background: transparent; color: #be4f87; }
.tools-note {
  display: flex; align-items: flex-start; gap: .75rem; margin-top: 2.4rem;
  padding: 1rem 1.1rem; border: 1px solid #be4f8729; border-radius: 10px; background: #fff7fc;
}
.tools-note-icon {
  display: grid; place-items: center; width: 1.7rem; height: 1.7rem; border-radius: 7px; color: #be4f87; background: #fce7f3;
}
.tools-note strong { font-size: .77rem; }
.tools-note p { margin: .3rem 0 0; color: var(--fg-3); font-size: .69rem; line-height: 1.55; }
@media (max-width: 1100px) {
  .tools-hero { padding: 2.6rem 2rem; }
  .tools-hero h1 { font-size: 2.5rem; }
  .tools-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .tools-hero { display: block; margin: 0 -1rem 2rem; padding: 2.2rem 1rem; }
  .tools-hero h1 { font-size: 2.1rem; }
  .tools-hero-art { min-height: 180px; margin-top: 1.2rem; }
  .tools-toolbar { flex-direction: column; align-items: start; }
  .tools-grid { grid-template-columns: 1fr; }
}
</style>
