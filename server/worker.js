import { samplePool } from './catalog.js'
import { newId, refundCredits, save, settleCredits, state, writeAssetFile } from './db.js'
import { extForMime, generateForJob, sniffImageMime, vendorMode } from './vendor.js'

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

function persistOutputs(job, images) {
  return images.map((image, index) => {
    const mime = image.mime || sniffImageMime(image.bytes) || 'image/png'
    const ext = extForMime(mime)
    const assetId = newId('ast')
    const filename = `${assetId}.${ext}`
    writeAssetFile(filename, image.bytes)
    const asset = {
      id: assetId,
      userId: job.userId,
      name: `${job.id}-${index}.${ext}`,
      role: 'output',
      mime,
      size: image.bytes.length,
      file: `files/${filename}`,
      url: `/api/v1/assets/${assetId}/file`,
      createdAt: Date.now()
    }
    state.assets[assetId] = asset
    return { index, url: asset.url, assetId }
  })
}

function finish(job, status, extra) {
  const user = state.users[job.userId]
  if (!user) return
  job.status = status
  job.finishedAt = Date.now()
  if (status === 'succeeded') {
    job.outputs = extra || []
    settleCredits(user, job.cost, job.id)
  } else {
    job.error = extra || 'generation_failed'
    refundCredits(user, job.cost, job.id)
  }
  save()
}

async function runLive(job) {
  try {
    const images = await generateForJob(job)
    finish(job, 'succeeded', persistOutputs(job, images))
  } catch (error) {
    finish(job, 'failed', error?.code || 'generation_failed')
  }
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
    if (current.params?.simulateFail) {
      finish(current, 'failed', 'model_timeout')
      return
    }
    if (vendorMode() === 'fake') {
      finish(current, 'succeeded', outputsFor(current))
      return
    }
    runLive(current)
  }, finishDelay)
}
