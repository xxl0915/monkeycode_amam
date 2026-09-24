<template>
  <Teleport to="body">
    <div v-if="store.searchOpen" class="mask" @click.self="store.searchOpen = false">
      <div class="box">
        <label>
          <Icon name="search" :size="16" />
          <input ref="input" v-model="q" placeholder="搜索功能、场景和工作台" @keydown.esc="store.searchOpen = false" />
        </label>
        <div class="list">
          <RouterLink v-for="item in results" :key="item.to + item.label" :to="item.to" @click="store.searchOpen = false">
            <b>{{ item.label }}</b>
            <span>{{ item.description }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import Icon from './Icon.vue'
import { store } from '../store'
import { searchIndex } from '../data/catalogs'
const q = ref('')
const input = ref(null)
const results = computed(() => {
  const k = q.value.trim().toLowerCase()
  const list = k ? searchIndex.filter((i) => `${i.label} ${i.description}`.toLowerCase().includes(k)) : searchIndex
  return list.slice(0, 12)
})
watch(() => store.searchOpen, async (v) => {
  if (v) {
    q.value = ''
    await nextTick()
    input.value?.focus()
  }
})
</script>
<style scoped>
.mask { position: fixed; inset: 0; z-index: 75; background: #0f172a55; display: grid; align-content: start; justify-items: center; padding: 12vh 1rem 1rem; }
.box { width: min(560px, 100%); border-radius: 1.1rem; background: #fff; box-shadow: 0 30px 70px -28px #0f172a80; overflow: hidden; }
label { display: flex; align-items: center; gap: .65rem; padding: .9rem 1rem; border-bottom: 1px solid var(--hairline); color: var(--fg-3); }
input { flex: 1; border: 0; outline: 0; font-size: .95rem; }
.list { max-height: 360px; overflow: auto; padding: .4rem; display: grid; }
.list a { display: grid; gap: .15rem; padding: .7rem .75rem; border-radius: .7rem; text-decoration: none; }
.list a:hover { background: var(--hover); }
.list b { font-size: .88rem; }
.list span { color: var(--fg-3); font-size: .74rem; }
</style>
