import { reactive } from 'vue'
import { api, getToken, setToken } from './api/client'

export const store = reactive({
  user: null,
  ready: false,
  loginOpen: false,
  helpOpen: false,
  searchOpen: false,
  payOpen: false,
  jobs: [],
  jobsLoading: false,
  lastError: ''
})

export function formatCredits(n) {
  return (Math.round(Number(n || 0) * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' 积分'
}

export async function bootstrap() {
  if (getToken()) {
    try {
      const { user } = await api.me()
      store.user = user
    } catch {
      setToken('')
      store.user = null
    }
  }
  store.ready = true
  if (store.user) loadJobs()
}

export async function login({ account, password }) {
  const { token, user } = await api.login(account, password)
  setToken(token)
  store.user = user
  store.loginOpen = false
  loadJobs()
  return user
}

export async function register({ account, password, invite }) {
  const { token, user } = await api.register(account, password, invite)
  setToken(token)
  store.user = user
  store.loginOpen = false
  loadJobs()
  return user
}

export async function logout() {
  try {
    await api.logout()
  } catch {
    /* token may already be gone */
  }
  setToken('')
  store.user = null
  store.jobs = []
}

export async function recharge(credits, price) {
  const { user } = await api.recharge(credits, price)
  store.user = user
  return user
}

export async function loadJobs() {
  if (!store.user) return []
  store.jobsLoading = true
  try {
    const { jobs } = await api.listJobs()
    store.jobs = jobs
    return jobs
  } finally {
    store.jobsLoading = false
  }
}

export async function createJob(payload) {
  const { job, user } = await api.createJob(payload)
  store.user = user
  store.jobs.unshift(job)
  return job
}

export async function deleteJob(id) {
  await api.deleteJob(id)
  store.jobs = store.jobs.filter((job) => job.id !== id)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function pollJob(id, { interval = 1000, timeout = 60000 } = {}) {
  const deadline = Date.now() + timeout
  let job = store.jobs.find((item) => item.id === id) || (await api.getJob(id)).job
  while (job.status === 'queued' || job.status === 'running') {
    if (Date.now() > deadline) return job
    await sleep(interval)
    job = (await api.getJob(id)).job
    const index = store.jobs.findIndex((item) => item.id === id)
    if (index >= 0) store.jobs[index] = job
  }
  return job
}
