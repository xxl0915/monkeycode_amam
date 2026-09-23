<template>
  <div class="simple">
    <h1>{{ title }}</h1>
    <p>{{ kicker }}</p>
    <p v-if="body">{{ body }}</p>

    <template v-if="jobs">
      <div v-if="!store.user" class="empty">
        登录后即可查看你的{{ logs ? '生成日志' : '作品' }}。
        <button type="button" @click="store.loginOpen = true">去登录</button>
      </div>
      <div v-else-if="store.jobsLoading && !store.jobs.length" class="empty">正在加载…</div>
      <div v-else-if="!store.jobs.length" class="empty">还没有生成记录，去工作台试试吧。</div>
      <div v-else class="job-list">
        <article v-for="job in store.jobs" :key="job.id" class="job-card">
          <div class="job-thumbs">
            <img v-for="output in job.outputs.slice(0, 4)" :key="output.url + output.index" :src="output.url" :alt="job.scene" />
            <span v-if="!job.outputs.length" class="job-placeholder">{{ statusLabel(job) }}</span>
          </div>
          <div class="job-body">
            <b>{{ job.scene }}</b>
            <small>{{ job.model }}</small>
            <small v-if="logs">消耗 {{ job.cost }} 积分 · {{ when(job) }}</small>
            <small v-else>{{ when(job) }}</small>
            <span class="job-status" :class="`is-${job.status}`">{{ statusLabel(job) }}</span>
          </div>
          <button type="button" class="job-del" @click="remove(job)">删除</button>
        </article>
      </div>
    </template>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { store, loadJobs, deleteJob } from '../store'

const props = defineProps({
  title: String,
  kicker: String,
  body: String,
  jobs: { type: Boolean, default: false },
  logs: { type: Boolean, default: false }
})

onMounted(() => {
  if (props.jobs && store.user) loadJobs()
})

const labels = { queued: '排队中', running: '生成中', succeeded: '已完成', failed: '失败' }
function statusLabel(job) {
  return labels[job.status] || job.status
}
function when(job) {
  return new Date(job.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
async function remove(job) {
  try {
    await deleteJob(job.id)
  } catch {
    /* ignore */
  }
}
</script>
<style scoped>
.simple { max-width: 960px; margin: 0 auto; }
h1 { margin: 0; }
p { color: var(--fg-2); line-height: 1.75; max-width: 40rem; }
.empty { margin-top: 2rem; padding: 2.5rem 1rem; text-align: center; color: var(--fg-3); border: 1px dashed var(--hairline); border-radius: 1rem; }
.empty button { margin-left: .5rem; border: 0; background: transparent; color: #7c3aed; font-weight: 700; }
.job-list { display: grid; gap: .8rem; margin-top: 1.5rem; }
.job-card { display: grid; grid-template-columns: 160px minmax(0, 1fr) auto; align-items: center; gap: 1rem; padding: .75rem; border: 1px solid var(--hairline); border-radius: 1rem; background: var(--surface); }
.job-thumbs { display: flex; gap: .3rem; flex-wrap: wrap; }
.job-thumbs img { width: 48px; height: 48px; object-fit: cover; border-radius: .5rem; }
.job-placeholder { display: grid; place-items: center; width: 100%; min-height: 48px; border-radius: .5rem; background: var(--surface-2); color: var(--fg-3); font-size: .74rem; }
.job-body { display: grid; gap: .15rem; }
.job-body b { font-size: .9rem; }
.job-body small { color: var(--fg-3); font-size: .72rem; }
.job-status { margin-top: .2rem; width: fit-content; padding: .1rem .5rem; border-radius: 999px; font-size: .68rem; background: var(--surface-2); color: var(--fg-3); }
.job-status.is-running, .job-status.is-queued { color: #7c3aed; background: #7c3aed14; }
.job-status.is-succeeded { color: #059669; background: #05966914; }
.job-status.is-failed { color: #e11d48; background: #e11d4814; }
.job-del { align-self: start; border: 0; background: transparent; color: var(--fg-3); font-size: .74rem; }
@media (max-width: 640px) { .job-card { grid-template-columns: 1fr; } }
</style>
