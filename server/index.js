import { createServer } from 'node:http'
import { getScene, models, sceneSchemas } from './catalog.js'
import { creditUser, freezeCredits, newId, readAssetFile, refundCredits, save, state, writeAssetFile } from './db.js'
import { startJob } from './worker.js'

const PORT = Number(process.env.API_PORT || process.env.PORT || 8787)
const COST_PER_JOB = 4
const MAX_BODY_BYTES = 10_485_760
const MAX_ASSET_BYTES = 6 * 1024 * 1024
const ALLOWED_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif'
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  })
  res.end(body)
}

function sendBytes(res, status, bytes, contentType) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': bytes.length,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'private, max-age=31536000, immutable'
  })
  res.end(bytes)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false
    let oversized = false
    const finish = (fn, value) => {
      if (settled) return
      settled = true
      fn(value)
    }
    req.on('data', (chunk) => {
      if (settled) return
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        oversized = true
        chunks.length = 0
        return
      }
      if (!oversized) chunks.push(chunk)
    })
    req.on('end', () => {
      if (settled) return
      if (oversized) {
        finish(reject, Object.assign(new Error('payload_too_large'), { status: 413 }))
        return
      }
      if (!chunks.length) return finish(resolve, {})
      try {
        finish(resolve, JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        finish(resolve, {})
      }
    })
    req.on('error', () => {
      if (!settled) finish(resolve, {})
    })
  })
}

function publicUser(user) {
  return { id: user.id, name: user.name, account: user.account, credits: user.credits, invite: user.invite }
}

function issueToken(userId) {
  const token = newId('tok')
  state.sessions[token] = { token, userId, createdAt: Date.now() }
  save()
  return token
}

function currentUser(req) {
  const header = String(req.headers.authorization || '')
  if (!header.startsWith('Bearer ')) return null
  const session = state.sessions[header.slice(7)]
  if (!session) return null
  return state.users[session.userId] || null
}

function sniffImageMime(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 6 && bytes.slice(0, 3).toString('ascii') === 'GIF') return 'image/gif'
  if (bytes.length >= 12 && bytes.slice(0, 4).toString('ascii') === 'RIFF' && bytes.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return ''
}

function normalizeMime(value) {
  const mime = String(value || '').toLowerCase().split(';')[0].trim()
  if (mime === 'image/jpg' || mime === 'image/pjpeg') return 'image/jpeg'
  return mime
}

function decodeImageData(raw) {
  const text = String(raw || '').trim()
  if (!text) return null
  const comma = text.indexOf(',')
  const payload = text.startsWith('data:') && comma >= 0 ? text.slice(comma + 1) : text
  try {
    const bytes = Buffer.from(payload, 'base64')
    return bytes.length ? bytes : null
  } catch {
    return null
  }
}

function publicAsset(asset) {
  return {
    id: asset.id,
    name: asset.name,
    role: asset.role,
    url: asset.url,
    createdAt: asset.createdAt
  }
}

function isStaticRef(url) {
  if (url.includes('..') || url.includes('\\') || url.includes('\0')) return false
  return /^\/(product-scenes|business)\/[A-Za-z0-9._/-]+$/.test(url)
}

function assetIdFromUrl(url) {
  const match = String(url || '').match(/^\/api\/v1\/assets\/([A-Za-z0-9_]+)\/file$/)
  return match ? match[1] : ''
}

function normalizeRefs(user, refs) {
  const list = []
  for (const ref of refs) {
    const url = String(ref?.url || '')
    if (!url || url.startsWith('blob:') || url.startsWith('data:') || /^https?:/i.test(url)) {
      return { error: 'invalid_ref' }
    }
    if (isStaticRef(url)) {
      list.push({
        role: String(ref.role || 'product'),
        name: String(ref.name || ''),
        url,
        ...(ref.main ? { main: true } : {})
      })
      continue
    }
    const assetId = assetIdFromUrl(url) || String(ref.assetId || '')
    const asset = assetId ? state.assets[assetId] : null
    if (!asset || asset.userId !== user.id) return { error: 'invalid_ref' }
    list.push({
      role: String(ref.role || asset.role || 'product'),
      name: String(ref.name || asset.name || ''),
      url: asset.url,
      assetId: asset.id,
      ...(ref.main ? { main: true } : {})
    })
  }
  return { refs: list }
}

function findOrCreateUser(account) {
  const existing = Object.values(state.users).find((u) => u.account === account)
  if (existing) return existing
  const user = {
    id: newId('usr'),
    name: account.split('@')[0] || '创作者',
    account,
    credits: 0,
    invite: 'AMAM8K',
    createdAt: Date.now()
  }
  state.users[user.id] = user
  creditUser(user, 128.5, 'grant')
  return user
}

async function handle(req, res, url) {
  const path = url.pathname
  const method = req.method || 'GET'

  if (path === '/' || path === '/health' || path === '/api/v1/health') {
    const accept = String(req.headers.accept || '')
    if (path !== '/api/v1/health' && accept.includes('text/html')) {
      const html = '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>amam API</title></head><body><p>amam API 运行中。网页请打开前端 5173 预览。</p><p><a href="/api/v1/health">/api/v1/health</a></p></body></html>'
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(html),
        'Access-Control-Allow-Origin': '*'
      })
      return res.end(html)
    }
    return sendJson(res, 200, { ok: true, service: 'amam-api' })
  }

  if (path === '/api/v1/auth/login' && method === 'POST') {
    const body = await readBody(req)
    const account = String(body.account || '').trim()
    const password = String(body.password || '')
    if (!account || password.length < 4) return sendJson(res, 400, { error: '请输入账号和不少于 4 位的密码' })
    const user = findOrCreateUser(account)
    save()
    return sendJson(res, 200, { token: issueToken(user.id), user: publicUser(user) })
  }

  if (path === '/api/v1/auth/register' && method === 'POST') {
    const body = await readBody(req)
    const account = String(body.account || '').trim()
    const password = String(body.password || '')
    if (!account || password.length < 4) return sendJson(res, 400, { error: '请输入账号和不少于 4 位的密码' })
    if (Object.values(state.users).some((u) => u.account === account)) {
      return sendJson(res, 409, { error: '该账号已注册，请直接登录' })
    }
    const user = findOrCreateUser(account)
    save()
    return sendJson(res, 201, { token: issueToken(user.id), user: publicUser(user) })
  }

  if (path === '/api/v1/auth/logout' && method === 'POST') {
    const header = String(req.headers.authorization || '')
    if (header.startsWith('Bearer ')) {
      delete state.sessions[header.slice(7)]
      save()
    }
    return sendJson(res, 200, { ok: true })
  }

  if (path === '/api/v1/me' && method === 'GET') {
    const user = currentUser(req)
    if (!user) return sendJson(res, 401, { error: 'unauthorized' })
    return sendJson(res, 200, { user: publicUser(user) })
  }

  if (path === '/api/v1/orders' && method === 'POST') {
    const user = currentUser(req)
    if (!user) return sendJson(res, 401, { error: 'unauthorized' })
    const body = await readBody(req)
    const credits = Math.max(1, Number(body.credits) || 0)
    creditUser(user, credits, 'recharge')
    state.orders.push({
      id: newId('ord'),
      userId: user.id,
      credits,
      price: Number(body.price) || 0,
      createdAt: Date.now()
    })
    save()
    return sendJson(res, 200, { user: publicUser(user) })
  }

  if (path === '/api/v1/assets' && method === 'POST') {
    const user = currentUser(req)
    if (!user) return sendJson(res, 401, { error: 'unauthorized' })
    const body = await readBody(req)
    const bytes = decodeImageData(body.data)
    if (!bytes) return sendJson(res, 400, { error: 'missing_file' })
    if (bytes.length > MAX_ASSET_BYTES) return sendJson(res, 413, { error: 'file_too_large' })
    const mime = sniffImageMime(bytes)
    const declared = normalizeMime(body.mime)
    if (!mime || !ALLOWED_MIME[mime] || (declared && declared !== mime)) {
      return sendJson(res, 400, { error: 'invalid_mime' })
    }
    const ext = ALLOWED_MIME[mime]
    const assetId = newId('ast')
    const filename = `${assetId}.${ext}`
    writeAssetFile(filename, bytes)
    const asset = {
      id: assetId,
      userId: user.id,
      name: String(body.name || filename),
      role: String(body.role || 'product'),
      mime,
      size: bytes.length,
      file: `files/${filename}`,
      url: `/api/v1/assets/${assetId}/file`,
      createdAt: Date.now()
    }
    state.assets[assetId] = asset
    save()
    return sendJson(res, 200, { assetId, name: asset.name, role: asset.role, url: asset.url })
  }

  if (path === '/api/v1/assets' && method === 'GET') {
    const user = currentUser(req)
    if (!user) return sendJson(res, 401, { error: 'unauthorized' })
    const assets = Object.values(state.assets || {})
      .filter((asset) => asset.userId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(publicAsset)
    return sendJson(res, 200, { assets })
  }

  const assetFileMatch = path.match(/^\/api\/v1\/assets\/([A-Za-z0-9_]+)\/file$/)
  if (assetFileMatch && method === 'GET') {
    const asset = (state.assets || {})[assetFileMatch[1]]
    if (!asset) return sendJson(res, 404, { error: 'not_found' })
    const bytes = readAssetFile(String(asset.file || '').replace(/^files\//, ''))
    if (!bytes) return sendJson(res, 404, { error: 'not_found' })
    return sendBytes(res, 200, bytes, asset.mime)
  }

  if (path === '/api/v1/scenes' && method === 'GET') {
    return sendJson(res, 200, { scenes: sceneSchemas })
  }

  if (path === '/api/v1/models' && method === 'GET') {
    return sendJson(res, 200, { models })
  }

  if (path === '/api/v1/jobs' && method === 'POST') {
    const user = currentUser(req)
    if (!user) return sendJson(res, 401, { error: 'unauthorized' })
    const body = await readBody(req)
    const scene = String(body.scene || '')
    if (!scene) return sendJson(res, 400, { error: 'missing_scene' })
    if (!getScene(scene)) return sendJson(res, 400, { error: 'invalid_scene' })
    if (user.credits < COST_PER_JOB) return sendJson(res, 402, { error: 'insufficient_credits' })
    const normalized = normalizeRefs(user, Array.isArray(body.refs) ? body.refs : [])
    if (normalized.error) return sendJson(res, 400, { error: normalized.error })
    const job = {
      id: newId('job'),
      userId: user.id,
      scene,
      model: String(body.model || ''),
      params: body.params || {},
      refs: normalized.refs,
      cost: COST_PER_JOB,
      status: 'queued',
      progress: 0,
      outputs: [],
      error: null,
      createdAt: Date.now(),
      startedAt: null,
      finishedAt: null
    }
    state.jobs[job.id] = job
    freezeCredits(user, job.cost, job.id)
    save()
    startJob(job.id)
    return sendJson(res, 201, { job, user: publicUser(user) })
  }

  if (path === '/api/v1/jobs' && method === 'GET') {
    const user = currentUser(req)
    if (!user) return sendJson(res, 401, { error: 'unauthorized' })
    const jobs = Object.values(state.jobs)
      .filter((j) => j.userId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt)
    return sendJson(res, 200, { jobs })
  }

  const jobMatch = path.match(/^\/api\/v1\/jobs\/([A-Za-z0-9_]+)$/)
  if (jobMatch) {
    const user = currentUser(req)
    if (!user) return sendJson(res, 401, { error: 'unauthorized' })
    const job = state.jobs[jobMatch[1]]
    if (!job || job.userId !== user.id) return sendJson(res, 404, { error: 'not_found' })
    if (method === 'GET') return sendJson(res, 200, { job })
    if (method === 'DELETE') {
      if (job.status === 'queued' || job.status === 'running') {
        refundCredits(user, job.cost, job.id)
      }
      delete state.jobs[job.id]
      save()
      return sendJson(res, 200, { ok: true, user: publicUser(user) })
    }
  }

  if (path === '/api/v1/health' || path.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'not_found' })
  }
  return sendJson(res, 404, { error: 'not_found' })
}

export function createApiServer() {
  return createServer((req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
      })
      return res.end()
    }
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    handle(req, res, url).catch((err) => {
      if (err?.status === 413) return sendJson(res, 413, { error: 'file_too_large' })
      sendJson(res, 500, { error: 'internal_error', message: String(err?.message || err) })
    })
  })
}

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  createApiServer().listen(PORT, '0.0.0.0', () => {
    console.log(`[amam-api] listening on http://0.0.0.0:${PORT}`)
  })
}
