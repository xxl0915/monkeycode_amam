const BASE = '/api/v1'
const TOKEN_KEY = 'amam-token'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code || ''
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore storage failures */
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  } catch {
    throw new ApiError('无法连接生成服务，请确认 API 已启动', 0)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    throw new ApiError(friendlyError(data?.error, res.status), res.status, data?.error)
  }
  return data
}

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

export function isPersistedRefUrl(url) {
  const value = String(url || '')
  return value.startsWith('/api/v1/assets/') || value.startsWith('/product-scenes/') || value.startsWith('/business/')
}

const MAX_ASSET_BYTES = 6 * 1024 * 1024

const ERROR_TEXT = {
  missing_file: '请选择有效图片',
  invalid_mime: '仅支持 PNG / JPEG / WebP / GIF',
  file_too_large: '单张图片不能超过 6 MB',
  invalid_ref: '参考图无效，请重新上传',
  invalid_scene: '当前场景不可用',
  missing_scene: '请选择生成场景',
  insufficient_credits: '积分不足，请先充值',
  unauthorized: '登录已失效，请重新登录',
  not_found: '资源不存在'
}

function friendlyError(code, status) {
  return ERROR_TEXT[code] || (status ? `请求失败（${status}）` : '请求失败')
}

function mimeFromFile(file) {
  const declared = String(file.type || '').toLowerCase().split(';')[0].trim()
  if (declared === 'image/jpg' || declared === 'image/pjpeg') return 'image/jpeg'
  if (/^image\/(png|jpeg|webp|gif)$/.test(declared)) return declared
  const name = String(file.name || '').toLowerCase()
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.webp')) return 'image/webp'
  if (name.endsWith('.gif')) return 'image/gif'
  return ''
}

export async function persistAsset(file, role = 'product') {
  if (file.size > MAX_ASSET_BYTES) throw new ApiError(friendlyError('file_too_large', 413), 413, 'file_too_large')
  const mime = mimeFromFile(file)
  if (!mime) throw new ApiError(friendlyError('invalid_mime', 400), 400, 'invalid_mime')
  const data = await readDataUrl(file)
  return request('/assets', {
    method: 'POST',
    body: {
      name: file.name || 'image',
      role,
      mime,
      data
    }
  })
}

export const api = {
  login: (account, password) => request('/auth/login', { method: 'POST', body: { account, password }, auth: false }),
  register: (account, password, invite) => request('/auth/register', { method: 'POST', body: { account, password, invite }, auth: false }),
  logout: () => request('/auth/logout', { method: 'POST', body: {} }),
  me: () => request('/me'),
  recharge: (credits, price) => request('/orders', { method: 'POST', body: { credits, price } }),
  registerAsset: (asset) => request('/assets', { method: 'POST', body: asset }),
  listAssets: () => request('/assets'),
  persistAsset,
  createJob: (payload) => request('/jobs', { method: 'POST', body: payload }),
  listJobs: () => request('/jobs'),
  getJob: (id) => request(`/jobs/${id}`),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' })
}
