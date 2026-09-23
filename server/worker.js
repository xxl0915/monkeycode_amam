import { samplePool } from './catalog.js'
import { refundCredits, save, settleCredits, state } from './db.js'

const runningDelay = 600
const finishDelay = 2200

function outputsFor(job) {
  const count = Math.max(1, Math.min(12, Number(job.params?.outputCount) || Number(job.params?.count) || 4))
  const start = Math.abs(hash(job.id)) % samplePool.length
  return Array.from({ length: count }, (_, index) => ({
    index,
    url: samplePool[(start + index) % samplePool.length]
  }))
}

function hash(text) {
  let h = 0
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0
  return h
}

function finish(job, status, error) {
  const user = state.users[job.userId]
  if (!user) return
  job.status = status
  job.finishedAt = Date.now()
  if (status === 'succeeded') {
    job.outputs = outputsFor(job)
    settleCredits(user, job.cost, job.id)
  } else {
    job.error = error || 'generation_failed'
    refundCredits(user, job.cost, job.id)
  }
  save()
}

export function startJob(jobId) {
  const job = state.jobs[jobId]
  if (!job) return
  setTimeout(() => {
    const current = state.jobs[jobId]
    if (!current || current.status !== 'queued') return
    current.status = 'running'
    current.startedAt = Date.now()
    current.progress = 0.4
    save()
  }, runningDelay)
  setTimeout(() => {
    const current = state.jobs[jobId]
    if (!current || current.status !== 'running') return
    if (current.params?.simulateFail) finish(current, 'failed', 'model_timeout')
    else finish(current, 'succeeded')
  }, finishDelay)
}
