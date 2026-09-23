<template>
  <Teleport to="body">
    <div v-if="store.helpOpen" class="mask" @click.self="store.helpOpen = false">
      <aside class="panel">
        <header>
          <div>
            <b>帮助中心</b>
            <p>常见问题、接口文档和联系客服都在这里。</p>
          </div>
          <button type="button" @click="store.helpOpen = false"><Icon name="close" :size="16" /></button>
        </header>
        <label class="search">
          <Icon name="search" :size="16" />
          <input v-model="q" placeholder="搜索帮助内容" />
        </label>
        <h3>常见问题</h3>
        <div v-for="item in filtered" :key="item.q" class="faq">
          <button type="button" @click="open = open === item.q ? '' : item.q">
            {{ item.q }}
            <Icon name="chevron" :size="14" />
          </button>
          <p v-if="open === item.q">{{ item.a }}</p>
        </div>
        <div class="links">
          <RouterLink to="/docs" @click="store.helpOpen = false">接口文档</RouterLink>
          <a href="mailto:hello@amam.ai">邮件联系</a>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import { store } from '../store'
import { helpFaqs } from '../data/catalogs'
const q = ref('')
const open = ref('')
const filtered = computed(() => helpFaqs.filter((i) => `${i.q}${i.a}`.includes(q.value.trim())))
</script>
<style scoped>
.mask { position: fixed; inset: 0; z-index: 70; background: #0f172a40; display: flex; justify-content: flex-end; }
.panel { width: min(380px, 100%); height: 100%; background: #fff; padding: 1.2rem; box-shadow: -20px 0 40px -28px #0f172a66; overflow: auto; }
header { display: flex; justify-content: space-between; gap: 1rem; }
header b { font-size: 1.05rem; }
header p { margin: .3rem 0 0; color: var(--fg-3); font-size: .8rem; }
header button { border: 0; background: transparent; color: var(--fg-3); }
.search { display: flex; align-items: center; gap: .5rem; margin: 1rem 0; padding: .6rem .75rem; border: 1px solid var(--hairline); border-radius: .7rem; color: var(--fg-3); }
.search input { border: 0; outline: 0; width: 100%; }
h3 { font-size: .78rem; color: var(--fg-3); font-weight: 650; }
.faq button { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: .75rem 0; border: 0; background: transparent; text-align: left; font-weight: 650; }
.faq p { margin: 0 0 .8rem; color: var(--fg-2); font-size: .82rem; line-height: 1.65; }
.links { display: grid; gap: .45rem; margin-top: 1rem; }
.links a { color: #7c3aed; text-decoration: none; font-size: .85rem; }
</style>
