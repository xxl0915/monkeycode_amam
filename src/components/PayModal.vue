<template>
  <Teleport to="body">
    <div v-if="store.payOpen" class="mask" @click.self="store.payOpen = false">
      <div class="card">
        <button class="x" type="button" @click="store.payOpen = false"><Icon name="close" :size="16" /></button>
        <h2>充值</h2>
        <p>当前余额 {{ formatCredits(store.user?.credits) }}</p>
        <div class="packs">
          <button v-for="p in packs" :key="p.credits" type="button" :class="{ on: pack === p }" @click="pack = p">
            <b>{{ p.credits }} 积分</b>
            <span>¥ {{ p.price }}</span>
          </button>
        </div>
        <div class="pays">
          <button type="button" :class="{ on: pay === 'wx' }" @click="pay = 'wx'">微信支付</button>
          <button type="button" :class="{ on: pay === 'ali' }" @click="pay = 'ali'">支付宝</button>
        </div>
        <div class="qr">扫码支付 · 演示环境点击下方完成充值</div>
        <p v-if="error" class="err">{{ error }}</p>
        <button class="go" type="button" :disabled="busy" @click="done">{{ busy ? '处理中…' : `确认充值 ¥${pack.price}` }}</button>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
import { store, recharge, formatCredits } from '../store'
const packs = [
  { credits: 100, price: 19 },
  { credits: 500, price: 79 },
  { credits: 2000, price: 269 }
]
const pack = ref(packs[1])
const pay = ref('wx')
const busy = ref(false)
const error = ref('')
async function done() {
  if (busy.value) return
  if (!store.user) {
    store.payOpen = false
    store.loginOpen = true
    return
  }
  busy.value = true
  error.value = ''
  try {
    await recharge(pack.value.credits, pack.value.price)
    store.payOpen = false
  } catch (e) {
    error.value = e?.message || '充值失败，请稍后重试'
  } finally {
    busy.value = false
  }
}
</script>
<style scoped>
.mask { position: fixed; inset: 0; z-index: 80; background: #0f172a66; display: grid; place-items: center; padding: 1rem; }
.card { width: min(420px, 100%); padding: 1.4rem; border-radius: 1.2rem; background: #fff; position: relative; box-shadow: 0 30px 70px -22px #0f172a40; }
.x { position: absolute; right: .8rem; top: .8rem; border: 0; background: transparent; }
h2 { margin: 0; }
p { color: var(--fg-3); }
.packs, .pays { display: grid; grid-template-columns: repeat(3, 1fr); gap: .55rem; margin: 1rem 0; }
.pays { grid-template-columns: 1fr 1fr; }
.packs button, .pays button { border: 1px solid var(--hairline); background: var(--surface-2); border-radius: .8rem; padding: .75rem .5rem; }
.packs button.on, .pays button.on { border-color: #7c3aed88; background: #7c3aed14; }
.packs b { display: block; }
.packs span { color: var(--fg-3); font-size: .78rem; }
.qr { text-align: center; color: var(--fg-3); font-size: .78rem; padding: 1.4rem; border: 1px dashed var(--hairline); border-radius: .8rem; }
.go { width: 100%; margin-top: .9rem; min-height: 42px; border: 0; border-radius: .8rem; color: #fff; background: var(--btn-solid-bg); font-weight: 700; }
.go:disabled { opacity: .7; }
.err { color: #e11d48; font-size: .78rem; }
</style>
