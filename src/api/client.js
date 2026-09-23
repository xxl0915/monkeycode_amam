const BASE = '/api/v1'
const TOKEN_KEY = 'amam-token'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
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
    throw new ApiError(data?.error || `请求失败（${res.status}）`, res.status)
  }
  return data
}

export const api = {
  login: (account, password) => request('/auth/login', { method: 'POST', body: { account, password }, auth: false }),
  register: (account, password, invite) => request('/auth/register', { method: 'POST', body: { account, password, invite }, auth: false }),
  logout: () => request('/auth/logout', { method: 'POST', body: {} }),
  me: () => request('/me'),
  recharge: (credits, price) => request('/orders', { method: 'POST', body: { credits, price } }),
  registerAsset: (asset) => request('/assets', { method: 'POST', body: asset }),
  createJob: (payload) => request('/jobs', { method: 'POST', body: payload }),
  listJobs: () => request('/jobs'),
  getJob: (id) => request(`/jobs/${id}`),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' })
}
