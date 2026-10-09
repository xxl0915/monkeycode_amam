import { existsSync, readFileSync } from 'node:fs'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { basename, dirname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getScene, models } from './catalog.js'
import { readAssetFile, state } from './db.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')

function loadDotEnv() {
  const file = join(root, '.env')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    if (!key.startsWith('AMAM_')) continue
    if (process.env[key] !== undefined) continue
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadDotEnv()

const ROUTES = {
  'nano-banana': {
    key: 'AMAM_VENDOR_NANO_BANANA_API_KEY',
    base: 'AMAM_VENDOR_NANO_BANANA_BASE_URL',
    model: 'AMAM_VENDOR_NANO_BANANA_MODEL',
    fallbackModel: 'sensenova-u1.5-fast'
  },
  'nano-pro': {
    key: 'AMAM_VENDOR_NANO_PRO_API_KEY',
    base: 'AMAM_VENDOR_NANO_PRO_BASE_URL',
    model: 'AMAM_VENDOR_NANO_PRO_MODEL',
    fallbackModel: 'sensenova-u1.5-lite'
  },
  seedream: {
    key: 'AMAM_VENDOR_SEEDREAM_API_KEY',
    base: 'AMAM_VENDOR_SEEDREAM_BASE_URL',
    model: 'AMAM_VENDOR_SEEDREAM_MODEL',
    fallbackModel: 'sensenova-u1.5-fast'
  },
  'gpt-image': {
    key: 'AMAM_VENDOR_GPT_IMAGE_API_KEY',
    base: 'AMAM_VENDOR_GPT_IMAGE_BASE_URL',
    model: 'AMAM_VENDOR_GPT_IMAGE_MODEL',
    fallbackModel: 'sensenova-u1.5-lite'
  }
}

const TEXT_KEYS = ['prompt', 'product_info', 'extra_description', 'instruction', 'description']
const TEXT_POLICY = 'Typography: do not invent, misspell, or hallucinate logos, captions, prices, slogans, or Chinese/English characters. If the user did not supply exact copy, output a text-free product photo and keep only real brand marks already on the product. If exact copy is supplied, render only that copy spelled exactly and omit any other text.'

function vendorError(code, message) {
  const err = new Error(message || code)
  err.code = code
  return err
}

export function vendorMode() {
  const value = String(process.env.AMAM_VENDOR_MODE || 'live').trim().toLowerCase()
  return value === 'fake' ? 'fake' : 'live'
}

export function vendorTimeoutMs() {
  const n = Number(process.env.AMAM_VENDOR_TIMEOUT_MS)
  return Number.isFinite(n) && n > 0 ? n : 120000
}

export function getModelRecord(id) {
  return models.find((item) => item.id === id) || null
}

export function isUnsupportedModel(id) {
  const record = getModelRecord(id)
  return !record || record.video === true
}

export function getVendorRoute(id) {
  const spec = ROUTES[id]
  if (!spec) return null
  return {
    id,
    key: String(process.env[spec.key] || '').trim(),
    baseUrl: String(process.env[spec.base] || '').trim(),
    model: String(process.env[spec.model] || spec.fallbackModel).trim() || spec.fallbackModel
  }
}

export function isSenseNovaRoute(route) {
  const model = String(route?.model || '').toLowerCase()
  const base = String(route?.baseUrl || '').toLowerCase()
  return model.startsWith('sensenova-') || base.includes('sensenova.cn')
}

function toDataUrl(file) {
  const mime = file.mime || sniffImageMime(file.bytes) || 'image/png'
  return `data:${mime};base64,${file.bytes.toString('base64')}`
}

export function sniffImageMime(bytes) {
  if (!bytes || bytes.length < 3) return ''
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png'
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 6 && bytes.slice(0, 3).toString('ascii') === 'GIF') return 'image/gif'
  if (bytes.length >= 12 && bytes.slice(0, 4).toString('ascii') === 'RIFF' && bytes.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  return ''
}

export function extForMime(mime) {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'png'
}

export function outputCount(params) {
  const n = Number(params?.outputCount ?? params?.count)
  const fallback = Number.isFinite(n) && n > 0 ? n : 4
  return Math.max(1, Math.min(8, fallback))
}

export function mapSize(params) {
  const raw = String(params?.size || params?.ratio || params?.aspect_ratio || '1:1')
  if (/^\d+x\d+$/.test(raw)) return raw
  if (['3:4', '2:3', '9:16', '4:5'].includes(raw)) return '1024x1536'
  if (['4:3', '3:2', '16:9', '5:4'].includes(raw)) return '1536x1024'
  return '1024x1024'
}

function isEmptyValue(value) {
  if (value == null || value === false) return true
  if (typeof value === 'string' && !value.trim()) return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

function optionLabel(field, value) {
  const hit = (field.options || []).find((opt) => String(opt.value) === String(value))
  return hit ? hit.label : String(value)
}

function formatFieldValue(field, value) {
  if (field.type === 'checkbox') return value === true ? field.label : ''
  if (field.type === 'select') return optionLabel(field, value)
  if (field.type === 'multiselect') {
    return (Array.isArray(value) ? value : []).map((item) => optionLabel(field, item)).filter(Boolean).join('、')
  }
  if (field.type === 'repeater') {
    const subFields = field.fields || []
    return (Array.isArray(value) ? value : []).map((row) => {
      if (subFields.length) {
        return subFields.map((sub) => {
          if (isEmptyValue(row?.[sub.key])) return ''
          const formatted = formatFieldValue(sub, row[sub.key])
          return formatted ? `${sub.label}=${formatted}` : ''
        }).filter(Boolean).join(' ')
      }
      return Object.entries(row || {})
        .filter(([key, val]) => key !== 'id' && !isEmptyValue(val))
        .map(([key, val]) => `${key}=${val}`)
        .join(' ')
    }).filter(Boolean).join('；')
  }
  if (typeof value === 'string') return value.trim()
  return String(value)
}

function roleLabel(schema, role) {
  const hit = (schema?.roles || []).find((item) => item.key === role)
  return hit?.label || role || 'reference'
}

export function buildPrompt(job) {
  const params = job.params || {}
  const schema = getScene(job.scene)
  const parts = []
  const title = schema?.title || job.scene
  if (title) parts.push(`Scene: ${title}`)
  if (schema?.instruction) parts.push(String(schema.instruction).trim())
  ;(job.refs || []).forEach((ref, index) => {
    const name = String(ref?.name || '').trim()
    parts.push(`Reference ${index + 1} (${roleLabel(schema, ref?.role)})${name ? `: ${name}` : ''}`)
  })
  const declaredKeys = new Set()
  ;(schema?.fields || []).forEach((field) => {
    declaredKeys.add(field.key)
    const value = params[field.key]
    if (isEmptyValue(value)) return
    if (field.type === 'checkbox') {
      parts.push(field.label)
      return
    }
    const readable = formatFieldValue(field, value)
    if (!readable) return
    parts.push(`${field.label}: ${readable}`)
  })
  TEXT_KEYS.forEach((key) => {
    if (declaredKeys.has(key)) return
    const value = String(params[key] || '').trim()
    if (value && !parts.includes(value)) parts.push(value)
  })
  if (params.no_text === true) {
    parts.push('No on-image text except original product branding already visible in the reference.')
  }
  parts.push(TEXT_POLICY)
  const text = parts.filter(Boolean).join('\n').trim()
  return (text || 'product photo').slice(0, 4000)
}

function readStaticRef(url) {
  const rel = String(url || '').replace(/^\//, '')
  const full = normalize(join(publicDir, rel))
  if (!full.startsWith(publicDir)) return null
  if (!existsSync(full)) return null
  const bytes = readFileSync(full)
  return {
    bytes,
    mime: sniffImageMime(bytes) || 'image/png',
    name: basename(rel) || 'ref.png'
  }
}

export function loadRefImages(refs) {
  const list = []
  for (const ref of (refs || []).slice(0, 8)) {
    if (ref?.assetId) {
      const asset = state.assets[ref.assetId]
      if (!asset) continue
      const bytes = readAssetFile(String(asset.file || '').replace(/^files\//, ''))
      if (!bytes) continue
      list.push({
        bytes,
        mime: asset.mime || sniffImageMime(bytes) || 'image/png',
        name: asset.name || `${asset.id}.png`
      })
      continue
    }
    const url = String(ref?.url || '')
    if (url.startsWith('/product-scenes/') || url.startsWith('/business/')) {
      const file = readStaticRef(url)
      if (file) list.push(file)
    }
  }
  return list
}

function imagesUrl(baseUrl, kind) {
  const base = String(baseUrl || '').replace(/\/+$/, '')
  const suffix = kind === 'edits' ? '/images/edits' : '/images/generations'
  if (base.endsWith('/v1')) return base + suffix
  return `${base}/v1${suffix}`
}

function requestRaw(url, { method = 'POST', headers = {}, body, timeout }) {
  return new Promise((resolve, reject) => {
    let parsed
    try {
      parsed = new URL(url)
    } catch {
      reject(vendorError('vendor_error'))
      return
    }
    let settled = false
    const done = (fn, value) => {
      if (settled) return
      settled = true
      fn(value)
    }
    const lib = parsed.protocol === 'https:' ? httpsRequest : httpRequest
    const req = lib({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port,
      path: `${parsed.pathname}${parsed.search}`,
      method,
      headers
    }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => done(resolve, { status: res.statusCode || 0, body: Buffer.concat(chunks) }))
    })
    req.setTimeout(timeout, () => {
      req.destroy()
      done(reject, vendorError('vendor_timeout'))
    })
    req.on('error', () => done(reject, vendorError(settled ? 'vendor_timeout' : 'vendor_error')))
    if (body) req.write(body)
    req.end()
  })
}

function parseJson(buf) {
  try {
    return JSON.parse(buf.toString('utf8'))
  } catch {
    return null
  }
}

async function decodeVendorImages(payload, timeout) {
  const data = Array.isArray(payload?.data) ? payload.data : []
  const images = []
  for (const item of data) {
    if (item?.b64_json) {
      const bytes = Buffer.from(String(item.b64_json), 'base64')
      if (bytes.length) {
        images.push({ bytes, mime: sniffImageMime(bytes) || 'image/png' })
        continue
      }
    }
    const url = String(item?.url || '')
    if (!url) continue
    const res = await requestRaw(url, { method: 'GET', timeout })
    if (res.status >= 200 && res.status < 300 && res.body.length) {
      images.push({ bytes: res.body, mime: sniffImageMime(res.body) || 'image/png' })
    }
  }
  return images
}

function multipartBody(fields, files) {
  const boundary = `amam${Date.now().toString(16)}`
  const chunks = []
  Object.entries(fields).forEach(([name, value]) => {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`))
  })
  files.forEach((file, index) => {
    const filename = file.name || `ref-${index}.png`
    const mime = file.mime || 'image/png'
    chunks.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`
    ))
    chunks.push(file.bytes)
    chunks.push(Buffer.from('\r\n'))
  })
  chunks.push(Buffer.from(`--${boundary}--\r\n`))
  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/form-data; boundary=${boundary}`
  }
}

async function postVendorJson(url, headers, payload, timeout) {
  const body = Buffer.from(JSON.stringify(payload))
  const nextHeaders = {
    ...headers,
    'Content-Type': 'application/json',
    'Content-Length': body.length
  }
  return requestRaw(url, { headers: nextHeaders, body, timeout })
}

async function decodeVendorResponse(res, timeout) {
  if (res.status < 200 || res.status >= 300) throw vendorError('vendor_error')
  const payload = parseJson(res.body)
  if (!payload) throw vendorError('vendor_error')
  const images = await decodeVendorImages(payload, timeout)
  if (!images.length) throw vendorError('vendor_empty')
  return images
}

export async function generateForJob(job) {
  if (isUnsupportedModel(job.model)) throw vendorError('unsupported_model')
  const route = getVendorRoute(job.model)
  if (!route || !route.key || !route.baseUrl) throw vendorError('vendor_unconfigured')
  const prompt = buildPrompt(job)
  const n = outputCount(job.params)
  const size = mapSize(job.params)
  const refs = loadRefImages(job.refs)
  const timeout = vendorTimeoutMs()
  const headers = { Authorization: `Bearer ${route.key}` }
  const senseNova = isSenseNovaRoute(route)
  if (refs.length) {
    if (senseNova) {
      const images = []
      const rounds = Math.max(1, n)
      for (let i = 0; i < rounds; i += 1) {
        const res = await postVendorJson(imagesUrl(route.baseUrl, 'edits'), headers, {
          model: route.model,
          prompt,
          n: 1,
          size,
          watermark: false,
          prompt_extend: false,
          response_format: 'b64_json',
          images: refs.map((file) => ({ image_url: toDataUrl(file) }))
        }, timeout)
        images.push(...await decodeVendorResponse(res, timeout))
      }
      return images
    }
    const packed = multipartBody({
      model: route.model,
      prompt,
      n: String(n),
      size,
      response_format: 'b64_json'
    }, refs)
    headers['Content-Type'] = packed.contentType
    headers['Content-Length'] = packed.body.length
    const res = await requestRaw(imagesUrl(route.baseUrl, 'edits'), { headers, body: packed.body, timeout })
    return decodeVendorResponse(res, timeout)
  }
  if (senseNova) {
    const images = []
    const rounds = Math.max(1, n)
    for (let i = 0; i < rounds; i += 1) {
      const res = await postVendorJson(imagesUrl(route.baseUrl, 'generations'), headers, {
        model: route.model,
        prompt,
        n: 1,
        size,
        watermark: false,
        prompt_extend: false,
        response_format: 'b64_json'
      }, timeout)
      images.push(...await decodeVendorResponse(res, timeout))
    }
    return images
  }
  const res = await postVendorJson(imagesUrl(route.baseUrl, 'generations'), headers, {
    model: route.model,
    prompt,
    n,
    size,
    response_format: 'b64_json'
  }, timeout)
  return decodeVendorResponse(res, timeout)
}
