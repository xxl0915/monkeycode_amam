<template>
  <Teleport to="body">
    <div v-if="store.loginOpen" class="mask" @click.self="store.loginOpen = false">
      <div class="card">
        <button class="x" type="button" @click="store.loginOpen = false"><Icon name="close" :size="16" /></button>
        <div class="logo-halo"><LogoMark :size="46" /></div>
        <h2>{{ titles[tab] }}</h2>
        <p>{{ sub[tab] }}</p>
        <div class="tabs">
          <button type="button" :class="{ 'tab-on': tab === 'login' }" @click="tab = 'login'">登录</button>
          <button type="button" :class="{ 'tab-on': tab === 'register' }" @click="tab = 'register'">注册</button>
          <button type="button" :class="{ 'tab-on': tab === 'reset' }" @click="tab = 'reset'">找回密码</button>
        </div>
        <form @submit.prevent="submit">
          <label class="lm-field">
            <Icon class="ic" :name="tab === 'reset' ? 'phone' : 'user'" />
            <input v-model="account" class="fld" :placeholder="tab === 'reset' ? '手机号' : '登录账号（手机号/邮箱/用户名）'" />
          </label>
          <label v-if="tab !== 'reset'" class="lm-field">
            <Icon class="ic" name="lock" />
            <input v-model="password" class="fld" :type="show ? 'text' : 'password'" :placeholder="tab === 'register' ? '新密码(8-24位)' : '密码'" />
          </label>
          <label v-if="tab === 'reset'" class="lm-field">
            <Icon class="ic" name="shield" />
            <input v-model="code" class="fld" placeholder="短信验证码" />
            <button class="sms" type="button" @click="sent = true">{{ sent ? '已发送' : '获取验证码' }}</button>
          </label>
          <p v-if="error" class="err">{{ error }}</p>
          <button class="go" type="submit" :disabled="busy">{{ busy ? '处理中…' : tab === 'login' ? '登 录' : tab === 'register' ? '注 册' : '重置密码' }}</button>
        </form>
        <p v-if="invite" class="hint">已应用邀请码 {{ invite }}，注册成功后其每次充值邀请人获得 10% 返利</p>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
import LogoMark from './LogoMark.vue'
import { store, login, register } from '../store'

const tab = ref('login')
const account = ref('')
const password = ref('')
const code = ref('')
const show = ref(false)
const sent = ref(false)
const error = ref('')
const invite = ref('')
const busy = ref(false)
const titles = { login: '欢迎回来', register: '创建账号', reset: '找回密码' }
const sub = { login: '登录以继续你的创作', register: '创建账号后即可开始生成', reset: '通过短信验证码重置你的密码' }

async function submit() {
  error.value = ''
  if (busy.value) return
  if (tab.value === 'reset') {
    if (!/^1\d{10}$/.test(account.value)) { error.value = '请输入正确的 11 位手机号'; return }
    if (!code.value) { error.value = '请输入验证码'; return }
    tab.value = 'login'
    error.value = '密码已重置,请用新密码登录'
    return
  }
  if (!account.value || password.value.length < 4) { error.value = '请输入账号和至少 4 位密码'; return }
  busy.value = true
  try {
    if (tab.value === 'register') await register({ account: account.value, password: password.value, invite: invite.value })
    else await login({ account: account.value, password: password.value })
  } catch (e) {
    error.value = e?.message || '操作失败，请稍后重试'
  } finally {
    busy.value = false
  }
}
</script>
<style scoped>
.mask { position: fixed; inset: 0; z-index: 80; background: #0f172a66; display: grid; place-items: center; padding: 1rem; }
.card { position: relative; width: min(420px, 100%); padding: 1.6rem 1.5rem 1.4rem; border-radius: 1.25rem; background: linear-gradient(165deg, #fff, #f6f6fb); color: var(--fg); border: 1px solid var(--hairline); box-shadow: 0 30px 70px -22px #0f172a40; }
.x { position: absolute; right: .85rem; top: .85rem; border: 0; background: transparent; color: var(--fg-3); }
.logo-halo { filter: drop-shadow(0 8px 18px rgb(168 85 247 / .45)); width: fit-content; margin: 0 auto .4rem; }
h2 { margin: .4rem 0 0; text-align: center; font-size: 1.35rem; }
p { margin: .4rem 0 0; text-align: center; color: var(--fg-3); font-size: .82rem; }
.tabs { display: flex; gap: .25rem; padding: .25rem; margin: 1rem 0 .9rem; border-radius: .75rem; background: var(--surface-2); border: 1px solid var(--hairline); }
.tabs button { flex: 1; padding: .45rem 0; border: 0; background: transparent; border-radius: .55rem; font-size: .8125rem; color: var(--fg-3); }
.tab-on { color: #7c3aed !important; background: linear-gradient(135deg, #a78bfa38, #ec48992e) !important; box-shadow: 0 1px #ffffff14 inset, 0 4px 12px -4px #a855f780; }
.lm-field { position: relative; display: block; margin-bottom: .65rem; }
.ic { position: absolute; left: .8rem; top: 50%; transform: translateY(-50%); color: var(--fg-3); }
.fld { width: 100%; padding: .7rem .85rem .7rem 2.4rem; border-radius: .7rem; background: #0f172a08; border: 1px solid var(--hairline); color: var(--fg); }
.fld:focus { outline: 2px solid #7c3aed55; border-color: #7c3aed66; }
.sms { position: absolute; right: .4rem; top: 50%; transform: translateY(-50%); border: 0; background: transparent; color: #7c3aed; font-size: .75rem; }
.go { width: 100%; min-height: 44px; margin-top: .4rem; border: 0; border-radius: .8rem; color: #fff; background: linear-gradient(135deg, #7c3aed, #db2777); font-weight: 750; }
.err { color: #e11d48; }
.hint { font-size: .72rem; }
</style>
