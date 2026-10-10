import { isTextScene, samplePool } from './catalog.js'
import { newId, refundCredits, save, settleCredits, state, writeAssetFile } from './db.js'
import { extForMime, generateForJob, generateTextForJob, sniffImageMime, vendorMode } from './vendor.js'

function wantsText(job) {
  return isTextScene(job.scene) || job.params?.outputMode === 'text'
}

const runningDelay = 600
const finishDelay = 2200

function outputsFor(job) {
  const count = Math.max(1, Math.min(12, Number(job.params?.outputCount) || Number(job.params?.count) || 4))
  const start = Math.abs(hash(job.id)) % samplePool.length
  const slots = Array.isArray(job.params?.slots) ? job.params.slots : []
  return Array.from({ length: count }, (_, index) => ({
    index,
    url: samplePool[(start + index) % samplePool.length],
    slot: String(slots[index]?.label || slots[index]?.key || '').trim() || undefined
  }))
}

function hash(text) {
  let h = 0
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0
  return h
}

function textOutputsFor(job) {
  if (job.params?.analyze) {
    return [{ index: 0, text: '[产品名称]：示例商品\n[核心卖点]：根据主图识别的外形、材质与使用场景\n[适用人群]：待补\n[规格参数]：待补\n[套图建议]：白底主图、卖点图、场景图、标准 A+' }]
  }
  const samples = {
    'ai-copywriting': '【样例文案】\n卖点：突出用户给出的核心功能与使用场景。\n详情：补充规格、材质与适用人群。价格与认证缺失时标为待补。',
    'title-generator': '【样例标题】\n1. 按平台习惯组织品名与核心属性\n2. 加入用户给出的关键词\n3. 缺失认证与产地标为待补',
    'listing-generate': 'Title: sample product title\nBullet 1: key fact from the brief\nBullet 2: material / size 待补\nSearch terms: user keywords',
    'listing-localize': '原文要点：用户提供的 Listing 事实\n本地化文本：按目标语言重写，不新增卖点。',
    'listing-compliance': '风险等级：待核\n问题位置：需人工核对夸大表述\n缺失信息：价格 / 认证 待补'
  }
  return [{ index: 0, text: samples[job.scene] || '【样例文案】请在 live 模式下生成完整结果。' }]
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
    const slot = Array.isArray(job.params?.slots) ? job.params.slots[index] : null
    return {
      index,
      url: asset.url,
      assetId,
      slot: String(slot?.label || slot?.key || '').trim() || undefined
    }
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
    if (wantsText(job)) {
      const text = await generateTextForJob(job)
      finish(job, 'succeeded', [{ index: 0, text }])
      return
    }
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
      finish(current, 'succeeded', wantsText(current) ? textOutputsFor(current) : outputsFor(current))
      return
    }
    runLive(current)
  }, finishDelay)
}
