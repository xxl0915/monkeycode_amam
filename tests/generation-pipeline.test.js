import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const dir = mkdtempSync(join(tmpdir(), 'amam-'))
process.env.AMAM_VENDOR_MODE = 'fake'
process.env.AMAM_DB_FILE = join(dir, 'db.json')
writeFileSync(process.env.AMAM_DB_FILE, JSON.stringify({
  users: {},
  sessions: {},
  jobs: {},
  orders: [],
  ledger: [],
  assets: {}
}))

const db = await import('../server/db.js')
const { createApiServer } = await import('../server/index.js')
const { buildPrompt } = await import('../server/vendor.js')

function user(id, credits) {
  const record = { id, name: id, account: `${id}@amam.ai`, credits, invite: 'AMAM8K', createdAt: Date.now() }
  db.state.users[id] = record
  return record
}

function listen() {
  return new Promise((resolve) => {
    const server = createApiServer()
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ server, base: `http://127.0.0.1:${port}/api/v1` })
    })
  })
}

async function json(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  const body = await res.json().catch(() => null)
  return { status: res.status, body }
}

async function pollJob(base, token, id, timeout = 8000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const { body } = await json(`${base}/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    const job = body?.job
    if (job && job.status !== 'queued' && job.status !== 'running') return job
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`job ${id} did not finish`)
}

test('property 1: freeze + settle/refund keeps credits equal to ledger total', () => {
  const cases = [
    { start: 128.5, ops: [['freeze', 4, 'job_a'], ['settle', 4, 'job_a']] },
    { start: 50, ops: [['freeze', 4, 'job_b'], ['refund', 4, 'job_b']] },
    { start: 20, ops: [['freeze', 4, 'job_c1'], ['settle', 4, 'job_c1'], ['freeze', 4, 'job_c2'], ['refund', 4, 'job_c2']] },
    { start: 8, ops: [['freeze', 4, 'job_d1'], ['freeze', 4, 'job_d2'], ['settle', 4, 'job_d1'], ['settle', 4, 'job_d2']] }
  ]
  cases.forEach((item, index) => {
    const account = user(`prop1_${index}`, item.start)
    db.addLedger(account.id, item.start, 'grant')
    item.ops.forEach(([op, cost, jobId]) => {
      if (op === 'freeze') db.freezeCredits(account, cost, jobId)
      if (op === 'settle') db.settleCredits(account, cost, jobId)
      if (op === 'refund') db.refundCredits(account, cost, jobId)
    })
    assert.equal(account.credits, db.ledgerTotal(account.id), `case ${index}`)
  })
})

test('property 2: the same job is not settled or refunded twice', () => {
  const account = user('prop2', 20)
  db.addLedger(account.id, 20, 'grant')
  db.freezeCredits(account, 4, 'job_once')
  db.settleCredits(account, 4, 'job_once')
  db.settleCredits(account, 4, 'job_once')
  db.refundCredits(account, 4, 'job_once')
  const finals = db.state.ledger.filter((entry) => entry.jobId === 'job_once' && (entry.reason === 'settle' || entry.reason === 'refund'))
  assert.equal(finals.length, 1)
  assert.equal(finals[0].reason, 'settle')
  assert.equal(account.credits, db.ledgerTotal(account.id))

  db.freezeCredits(account, 4, 'job_fail')
  db.refundCredits(account, 4, 'job_fail')
  db.refundCredits(account, 4, 'job_fail')
  db.settleCredits(account, 4, 'job_fail')
  const failFinals = db.state.ledger.filter((entry) => entry.jobId === 'job_fail' && (entry.reason === 'settle' || entry.reason === 'refund'))
  assert.equal(failFinals.length, 1)
  assert.equal(failFinals[0].reason, 'refund')
  assert.equal(account.credits, db.ledgerTotal(account.id))
})

test('job lifecycle: poll until succeeded and outputs match outputCount', async (t) => {
  const { server, base } = await listen()
  t.after(() => new Promise((resolve) => server.close(resolve)))

  const login = await json(`${base}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ account: 'lifecycle@amam.ai', password: 'pass123' })
  })
  assert.equal(login.status, 200)
  const token = login.body.token
  const before = login.body.user.credits

  const created = await json(`${base}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ scene: 'suite', model: 'seedream-4.0', params: { outputCount: 3 } })
  })
  assert.equal(created.status, 201)
  assert.equal(created.body.job.status, 'queued')
  assert.equal(created.body.user.credits, before - 4)

  const finished = await pollJob(base, token, created.body.job.id)
  assert.equal(finished.status, 'succeeded')
  assert.equal(finished.outputs.length, 3)
  finished.outputs.forEach((output, index) => {
    assert.equal(output.index, index)
    assert.match(output.url, /^\/product-scenes\/samples\//)
  })

  const me = await json(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } })
  assert.equal(me.body.user.credits, before - 4)
})

test('job lifecycle: failed job refunds credits', async (t) => {
  const { server, base } = await listen()
  t.after(() => new Promise((resolve) => server.close(resolve)))

  const login = await json(`${base}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ account: 'failcase@amam.ai', password: 'pass123' })
  })
  const token = login.body.token
  const before = login.body.user.credits

  const created = await json(`${base}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ scene: 'suite', params: { outputCount: 2, simulateFail: true } })
  })
  assert.equal(created.status, 201)

  const finished = await pollJob(base, token, created.body.job.id)
  assert.equal(finished.status, 'failed')
  assert.equal(finished.outputs.length, 0)

  const me = await json(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } })
  assert.equal(me.body.user.credits, before)
})

const PNG_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function loginAs(base, account) {
  const login = await json(`${base}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ account, password: 'pass123' })
  })
  return login.body
}

test('asset upload persists bytes and serves them without auth', async (t) => {
  const { server, base } = await listen()
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const { token } = await loginAs(base, 'asset@amam.ai')

  const denied = await json(`${base}/assets`, {
    method: 'POST',
    body: JSON.stringify({ name: 'a.png', mime: 'image/png', data: PNG_1X1 })
  })
  assert.equal(denied.status, 401)

  const badMime = await json(`${base}/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'a.svg', mime: 'image/svg+xml', data: PNG_1X1 })
  })
  assert.equal(badMime.status, 400)
  assert.equal(badMime.body.error, 'invalid_mime')

  const missing = await json(`${base}/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'a.png', mime: 'image/png' })
  })
  assert.equal(missing.status, 400)
  assert.equal(missing.body.error, 'missing_file')

  const tooLarge = await json(`${base}/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: 'big.png',
      mime: 'image/png',
      data: Buffer.alloc(6 * 1024 * 1024 + 1, 1).toString('base64')
    })
  })
  assert.equal(tooLarge.status, 413)
  assert.equal(tooLarge.body.error, 'file_too_large')

  const created = await json(`${base}/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'dot.png', role: 'product', mime: 'image/png', data: PNG_1X1 })
  })
  assert.equal(created.status, 200)
  assert.match(created.body.assetId, /^ast_/)
  assert.equal(created.body.url, `/api/v1/assets/${created.body.assetId}/file`)

  const fileRes = await fetch(`${base}/assets/${created.body.assetId}/file`)
  assert.equal(fileRes.status, 200)
  assert.equal(fileRes.headers.get('content-type'), 'image/png')
  const bytes = Buffer.from(await fileRes.arrayBuffer())
  assert.equal(bytes.toString('base64'), PNG_1X1)

  const listed = await json(`${base}/assets`, { headers: { Authorization: `Bearer ${token}` } })
  assert.equal(listed.status, 200)
  assert.equal(listed.body.assets.length, 1)
  assert.equal(listed.body.assets[0].id, created.body.assetId)
})

test('jobs reject blob refs and accept persisted or static urls', async (t) => {
  const { server, base } = await listen()
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const { token } = await loginAs(base, 'refs@amam.ai')

  const blobJob = await json(`${base}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      scene: 'suite',
      refs: [{ role: 'product', name: 'a.png', url: 'blob:http://localhost/abc' }]
    })
  })
  assert.equal(blobJob.status, 400)
  assert.equal(blobJob.body.error, 'invalid_ref')

  const created = await json(`${base}/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'dot.png', role: 'product', mime: 'image/png', data: PNG_1X1 })
  })
  const okJob = await json(`${base}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      scene: 'suite',
      params: { outputCount: 1 },
      refs: [
        { role: 'product', name: 'dot.png', url: created.body.url },
        { role: 'product', name: 'sample', url: '/product-scenes/samples/suite.webp' },
        { role: 'model', name: 'model', url: '/business/models/model-1.png' }
      ]
    })
  })
  assert.equal(okJob.status, 201)
  assert.equal(okJob.body.job.refs[0].assetId, created.body.assetId)
  assert.equal(okJob.body.job.refs[1].url, '/product-scenes/samples/suite.webp')
  assert.equal(okJob.body.job.refs[2].url, '/business/models/model-1.png')

  const traversal = await json(`${base}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      scene: 'suite',
      refs: [{ role: 'product', name: 'x', url: '/product-scenes/../package.json' }]
    })
  })
  assert.equal(traversal.status, 400)
  assert.equal(traversal.body.error, 'invalid_ref')

  const other = await loginAs(base, 'other@amam.ai')
  const stolen = await json(`${base}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${other.token}` },
    body: JSON.stringify({
      scene: 'suite',
      refs: [{ role: 'product', name: 'dot.png', url: created.body.url }]
    })
  })
  assert.equal(stolen.status, 400)
  assert.equal(stolen.body.error, 'invalid_ref')

  const mismatch = await json(`${base}/assets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'lie.jpg', role: 'product', mime: 'image/jpeg', data: PNG_1X1 })
  })
  assert.equal(mismatch.status, 400)
  assert.equal(mismatch.body.error, 'invalid_mime')
})

test('deleting a queued job refunds frozen credits', async (t) => {
  const { server, base } = await listen()
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const { token, user } = await loginAs(base, 'refund-delete@amam.ai')
  const before = user.credits

  const created = await json(`${base}/jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ scene: 'suite', params: { outputCount: 1 } })
  })
  assert.equal(created.status, 201)
  assert.equal(created.body.user.credits, before - 4)

  const deleted = await json(`${base}/jobs/${created.body.job.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  assert.equal(deleted.status, 200)
  assert.equal(deleted.body.user.credits, before)

  const me = await json(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } })
  assert.equal(me.body.user.credits, before)
})

function listenMock(handler) {
  return new Promise((resolve) => {
    const server = createServer(handler)
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ server, origin: `http://127.0.0.1:${port}` })
    })
  })
}

function readRaw(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

function sendMockJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) })
  res.end(body)
}

function withVendorEnv(vars, fn) {
  const keys = Object.keys(vars)
  const prev = {}
  keys.forEach((key) => {
    prev[key] = process.env[key]
    if (vars[key] === undefined) delete process.env[key]
    else process.env[key] = vars[key]
  })
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      keys.forEach((key) => {
        if (prev[key] === undefined) delete process.env[key]
        else process.env[key] = prev[key]
      })
    })
}

test('GET /models matches frontend image and video ids', async (t) => {
  const { server, base } = await listen()
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const listed = await json(`${base}/models`)
  assert.equal(listed.status, 200)
  assert.deepEqual(listed.body.models.map((item) => item.id), [
    'nano-banana', 'nano-pro', 'seedream', 'gpt-image', 'kling', 'seedance'
  ])
})

test('live vendor persists generation outputs as assets', async (t) => {
  const seen = { generations: 0, edits: 0, hasImagePart: false }
  const mock = await listenMock(async (req, res) => {
    const raw = await readRaw(req)
    if (req.url === '/v1/images/generations') {
      seen.generations += 1
      sendMockJson(res, 200, { data: [{ b64_json: PNG_1X1 }, { b64_json: PNG_1X1 }] })
      return
    }
    if (req.url === '/v1/images/edits') {
      seen.edits += 1
      seen.hasImagePart = raw.toString('latin1').includes('name="image[]"')
      sendMockJson(res, 200, { data: [{ b64_json: PNG_1X1 }] })
      return
    }
    sendMockJson(res, 404, { error: 'not_found' })
  })
  t.after(() => new Promise((resolve) => mock.server.close(resolve)))

  await withVendorEnv({
    AMAM_VENDOR_MODE: 'live',
    AMAM_VENDOR_SEEDREAM_API_KEY: 'test-seedream-key',
    AMAM_VENDOR_SEEDREAM_BASE_URL: mock.origin,
    AMAM_VENDOR_SEEDREAM_MODEL: 'seedream-4.5'
  }, async () => {
    const { server, base } = await listen()
    t.after(() => new Promise((resolve) => server.close(resolve)))
    const { token, user } = await loginAs(base, 'live-ok@amam.ai')
    const created = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scene: 'suite', model: 'seedream', params: { outputCount: 2, prompt: 'white background product' } })
    })
    assert.equal(created.status, 201)
    const finished = await pollJob(base, token, created.body.job.id)
    assert.equal(finished.status, 'succeeded')
    assert.equal(finished.outputs.length, 2)
    assert.equal(seen.generations, 1)
    const dump = JSON.stringify(finished)
    assert.equal(dump.includes('test-seedream-key'), false)
    assert.equal(dump.includes('Authorization'), false)
    for (const output of finished.outputs) {
      assert.match(output.url, /^\/api\/v1\/assets\/ast_[A-Za-z0-9]+\/file$/)
      assert.match(output.assetId, /^ast_/)
      const fileRes = await fetch(`${base.replace('/api/v1', '')}${output.url}`)
      assert.equal(fileRes.status, 200)
      assert.equal(fileRes.headers.get('content-type'), 'image/png')
    }
    const me = await json(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } })
    assert.equal(me.body.user.credits, user.credits - 4)

    const asset = await json(`${base}/assets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'dot.png', role: 'product', mime: 'image/png', data: PNG_1X1 })
    })
    const edited = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        scene: 'suite',
        model: 'seedream',
        params: { outputCount: 1 },
        refs: [{ role: 'product', name: 'dot.png', url: asset.body.url }]
      })
    })
    const editedJob = await pollJob(base, token, edited.body.job.id)
    assert.equal(editedJob.status, 'succeeded')
    assert.equal(seen.edits, 1)
    assert.equal(seen.hasImagePart, true)
  })
})

test('SenseNova live vendor sends JSON data-URL edits without watermark', async (t) => {
  const seen = { generations: 0, edits: 0, watermark: null, promptExtend: null, imageUrl: '', contentType: '', genN: [], editN: [] }
  const mock = await listenMock(async (req, res) => {
    const raw = await readRaw(req)
    const type = String(req.headers['content-type'] || '')
    if (req.url === '/v1/images/generations') {
      seen.generations += 1
      const body = JSON.parse(raw.toString('utf8') || '{}')
      seen.watermark = body.watermark
      seen.promptExtend = body.prompt_extend
      seen.genN.push(body.n)
      sendMockJson(res, 200, { data: [{ b64_json: PNG_1X1 }] })
      return
    }
    if (req.url === '/v1/images/edits') {
      seen.edits += 1
      seen.contentType = type
      const body = JSON.parse(raw.toString('utf8') || '{}')
      seen.watermark = body.watermark
      seen.promptExtend = body.prompt_extend
      seen.editN.push(body.n)
      seen.imageUrl = String(body.images?.[0]?.image_url || '')
      sendMockJson(res, 200, { data: [{ b64_json: PNG_1X1 }] })
      return
    }
    sendMockJson(res, 404, { error: 'not_found' })
  })
  t.after(() => new Promise((resolve) => mock.server.close(resolve)))

  await withVendorEnv({
    AMAM_VENDOR_MODE: 'live',
    AMAM_VENDOR_NANO_BANANA_API_KEY: 'test-sensenova-key',
    AMAM_VENDOR_NANO_BANANA_BASE_URL: mock.origin,
    AMAM_VENDOR_NANO_BANANA_MODEL: 'sensenova-u1.5-fast'
  }, async () => {
    const { server, base } = await listen()
    t.after(() => new Promise((resolve) => server.close(resolve)))
    const { token } = await loginAs(base, 'live-sensenova@amam.ai')
    const created = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scene: 'suite', model: 'nano-banana', params: { outputCount: 2, prompt: 'studio product' } })
    })
    const finished = await pollJob(base, token, created.body.job.id)
    assert.equal(finished.status, 'succeeded')
    assert.equal(finished.outputs.length, 2)
    assert.equal(seen.generations, 2)
    assert.deepEqual(seen.genN, [1, 1])
    assert.equal(seen.watermark, false)
    assert.equal(seen.promptExtend, false)

    const asset = await json(`${base}/assets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'dot.png', role: 'product', mime: 'image/png', data: PNG_1X1 })
    })
    const edited = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        scene: 'suite',
        model: 'nano-banana',
        params: { outputCount: 1 },
        refs: [{ role: 'product', name: 'dot.png', url: asset.body.url }]
      })
    })
    const editedJob = await pollJob(base, token, edited.body.job.id)
    assert.equal(editedJob.status, 'succeeded')
    assert.equal(seen.edits, 1)
    assert.deepEqual(seen.editN, [1])
    assert.match(seen.contentType, /application\/json/)
    assert.equal(seen.watermark, false)
    assert.equal(seen.promptExtend, false)
    assert.match(seen.imageUrl, /^data:image\/png;base64,/)
    assert.equal(JSON.stringify(editedJob).includes('test-sensenova-key'), false)
  })
})

test('live vendor maps unconfigured, unsupported, timeout and empty errors', async (t) => {
  const mock = await listenMock(async (req, res) => {
    if (req.url === '/v1/images/generations') {
      const raw = await readRaw(req)
      const body = JSON.parse(raw.toString('utf8') || '{}')
      if (String(body.prompt || '').includes('timeout')) return
      if (String(body.prompt || '').includes('empty')) {
        sendMockJson(res, 200, { data: [] })
        return
      }
      sendMockJson(res, 500, { error: { message: 'upstream' } })
      return
    }
    await readRaw(req)
    sendMockJson(res, 404, {})
  })
  t.after(() => new Promise((resolve) => mock.server.close(resolve)))

  await withVendorEnv({
    AMAM_VENDOR_MODE: 'live',
    AMAM_VENDOR_TIMEOUT_MS: '400',
    AMAM_VENDOR_GPT_IMAGE_API_KEY: 'test-gpt-key',
    AMAM_VENDOR_GPT_IMAGE_BASE_URL: mock.origin,
    AMAM_VENDOR_NANO_BANANA_API_KEY: undefined,
    AMAM_VENDOR_NANO_BANANA_BASE_URL: undefined
  }, async () => {
    const { server, base } = await listen()
    t.after(() => new Promise((resolve) => server.close(resolve)))
    const { token, user } = await loginAs(base, 'live-err@amam.ai')

    const missing = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scene: 'suite', model: 'nano-banana', params: { outputCount: 1 } })
    })
    const missingJob = await pollJob(base, token, missing.body.job.id)
    assert.equal(missingJob.status, 'failed')
    assert.equal(missingJob.error, 'vendor_unconfigured')

    const video = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scene: 'suite', model: 'kling', params: { outputCount: 1 } })
    })
    const videoJob = await pollJob(base, token, video.body.job.id)
    assert.equal(videoJob.status, 'failed')
    assert.equal(videoJob.error, 'unsupported_model')

    const timed = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scene: 'suite', model: 'gpt-image', params: { outputCount: 1, prompt: 'timeout' } })
    })
    const timedJob = await pollJob(base, token, timed.body.job.id)
    assert.equal(timedJob.status, 'failed')
    assert.equal(timedJob.error, 'vendor_timeout')

    const empty = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scene: 'suite', model: 'gpt-image', params: { outputCount: 1, prompt: 'empty' } })
    })
    const emptyJob = await pollJob(base, token, empty.body.job.id)
    assert.equal(emptyJob.status, 'failed')
    assert.equal(emptyJob.error, 'vendor_empty')

    const me = await json(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } })
    assert.equal(me.body.user.credits, user.credits)
  })
})

test('buildPrompt includes instruction, role labels and omits empty fields', () => {
  const prompt = buildPrompt({
    scene: 'change-bg',
    params: { background_mode: 'solid', extra: '', count: 1 },
    refs: [{ role: 'product', name: 'bag.png' }]
  })
  assert.match(prompt, /Scene: 商品换背景/)
  assert.match(prompt, /替换商品背景/)
  assert.match(prompt, /Reference 1 \(商品图\): bag\.png/)
  assert.match(prompt, /背景方式: 纯色背景/)
  assert.equal(prompt.includes('补充要求'), false)
  assert.match(prompt, /Typography: do not invent, misspell, or hallucinate/)
})

test('P0 scene slugs can create jobs', async (t) => {
  const { server, base } = await listen()
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const { token } = await loginAs(base, 'p0-scenes@amam.ai')
  const scenes = await json(`${base}/scenes`)
  assert.equal(scenes.status, 200)
  assert.equal(scenes.body.scenes.length >= 88, true)
  for (const scene of ['style-fusion', 'pattern-extract', 'watermark-pro', 'white-bg', 'ai-edit']) {
    const created = await json(`${base}/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ scene, model: 'seedream', params: { outputCount: 1 } })
    })
    assert.equal(created.status, 201, scene)
    assert.equal(created.body.job.scene, scene)
  }
})

test('marketing catalog maps every scene to an implemented product workbench', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const cats = JSON.parse(readFileSync(join(root, 'src/data/business.json'), 'utf8'))
  const schemas = JSON.parse(readFileSync(join(root, 'src/data/sceneSchemas.json'), 'utf8'))
  const slugs = new Set(schemas.map((scene) => scene.slug))
  const expected = {
    'main-image': '/product-images/hero-image',
    'poster-replica': '/product-images/hot-replica',
    'social-card': '/product-images/seeding',
    festival: '/product-images/seeding',
    'creative-variants': '/product-images/seeding',
    'marketing-image': '/product-images/selling-point',
    'ai-poster': '/product-images/selling-point',
    'image-copy': '/product-images/selling-point',
    popup: '/product-images/selling-point',
    banner: '/product-images/clothing-ztc',
    'live-bg': '/product-images/product-composite',
    'creator-cover': '/product-images/main-collage',
    'graphic-cover': '/product-images/main-collage',
    'campaign-kit': '/product-images/suite'
  }
  const marketing = cats.find((item) => item.key === 'marketing')
  const scenes = marketing.groups.flatMap((group) => group.scenes)
  assert.equal(scenes.length, 14)
  for (const scene of scenes) {
    assert.equal(scene.capability, 'implemented', scene.slug)
    assert.equal(scene.targetRoute, expected[scene.slug], scene.slug)
    const slug = scene.targetRoute.split('/').pop()
    assert.equal(slugs.has(slug), true, slug)
  }
})

test('P2 image-edit toolbox scenes are implemented workbenches', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const cats = JSON.parse(readFileSync(join(root, 'src/data/business.json'), 'utf8'))
  const schemas = JSON.parse(readFileSync(join(root, 'src/data/sceneSchemas.json'), 'utf8'))
  const slugs = new Set(schemas.map((scene) => scene.slug))
  const expected = [
    'ai-edit', 'white-bg', 'cutout-pro', 'upscale', 'upscale-pro',
    'outpaint', 'outpaint-pro', 'eliminate-pro', 'remove-watermark',
    'layer-split', 'watermark-pro'
  ]
  const toolbox = cats.find((item) => item.key === 'toolbox')
  const scenes = Object.fromEntries(toolbox.groups.flatMap((group) => group.scenes).map((scene) => [scene.slug, scene]))
  for (const slug of expected) {
    const scene = scenes[slug]
    assert.equal(scene.capability, 'implemented', slug)
    assert.equal(scene.targetRoute, `/tools/ai/${slug}`, slug)
    assert.equal(slugs.has(slug), true, slug)
  }
})

test('graphic-design catalog maps every scene to an implemented workbench', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const cats = JSON.parse(readFileSync(join(root, 'src/data/business.json'), 'utf8'))
  const schemas = JSON.parse(readFileSync(join(root, 'src/data/sceneSchemas.json'), 'utf8'))
  const slugs = new Set(schemas.map((scene) => scene.slug))
  const expected = {
    'free-poster': '/product-images/selling-point',
    'cover-set': '/product-images/main-collage',
    'print-size': '/graphic-design/print-size',
    'flyer-fold': '/graphic-design/print-size',
    infographic: '/product-images/detail-sheet',
    'design-longform': '/product-images/detail-page'
  }
  const graphic = cats.find((item) => item.key === 'graphic-design')
  const scenes = graphic.groups.flatMap((group) => group.scenes)
  assert.equal(scenes.length, 6)
  for (const scene of scenes) {
    assert.equal(scene.capability, 'implemented', scene.slug)
    assert.equal(scene.targetRoute, expected[scene.slug], scene.slug)
    const slug = scene.targetRoute.split('/').pop()
    assert.equal(slugs.has(slug), true, slug)
  }
  const bySlug = Object.fromEntries(scenes.map((scene) => [scene.slug, scene]))
  for (const [slug, targetRoute] of Object.entries(expected)) {
    assert.equal(bySlug[slug].targetRoute || `/graphic-design/${slug}`, targetRoute, slug)
  }
})

test('ecommerce-assets catalog maps compose scenes and keeps copy planned', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const cats = JSON.parse(readFileSync(join(root, 'src/data/business.json'), 'utf8'))
  const schemas = JSON.parse(readFileSync(join(root, 'src/data/sceneSchemas.json'), 'utf8'))
  const slugs = new Set(schemas.map((scene) => scene.slug))
  const expected = {
    'param-board': '/product-images/detail-sheet',
    'feature-stack': '/product-images/selling-point',
    'usage-scene': '/product-images/seeding',
    'compare-chart': '/product-images/detail-sheet',
    'size-chart': '/pod-images/pod-size-image',
    'package-design': '/product-images/product-composite',
    'label-design': '/graphic-design/print-size',
    'package-series': '/product-images/suite',
    'package-mockup': '/pod-images/print-mockup',
    'instruction-card': '/product-images/detail-sheet',
    'tag-design': '/graphic-design/print-size'
  }
  const material = cats.find((item) => item.key === 'material')
  const scenes = Object.fromEntries(material.groups.flatMap((group) => group.scenes).map((scene) => [scene.slug, scene]))
  assert.equal(Object.keys(scenes).length, 13)
  assert.equal(scenes['ai-copywriting'].capability, 'planned')
  assert.equal(scenes['title-generator'].capability, 'planned')
  assert.equal(scenes['ai-copywriting'].targetRoute, undefined)
  assert.equal(scenes['title-generator'].targetRoute, undefined)
  for (const [slug, targetRoute] of Object.entries(expected)) {
    const scene = scenes[slug]
    assert.equal(scene.capability, 'implemented', slug)
    assert.equal(scene.targetRoute, targetRoute, slug)
    const workbench = targetRoute.split('/').pop()
    assert.equal(slugs.has(workbench), true, workbench)
  }
})

test('toolbox remaining image scenes map to existing workbenches', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const cats = JSON.parse(readFileSync(join(root, 'src/data/business.json'), 'utf8'))
  const schemas = JSON.parse(readFileSync(join(root, 'src/data/sceneSchemas.json'), 'utf8'))
  const slugs = new Set(schemas.map((scene) => scene.slug))
  const expected = {
    'product-explode': '/product-images/detail-sheet',
    'logo-design': '/pod-images/print-design',
    'image-translate': '/tools/ai/ai-edit',
    'product-pile': '/product-images/product-composite',
    'ai-text-edit': '/tools/ai/ai-edit',
    'multi-image-fusion': '/product-images/product-composite',
    'photo-style-transfer': '/pod-images/style-transfer',
    'lineart-studio': '/derive-images/tech-sketch',
    'smart-layout': '/graphic-design/print-size',
    'limb-fix': '/tools/ai/ai-edit',
    'clothes-fix': '/product-images/wrinkle-remove',
    'shoes-fix': '/tools/ai/ai-edit'
  }
  const deferred = ['id-photo', 'pro-portrait', 'art-portrait', 'pre-check', 'click-rate']
  const toolbox = cats.find((item) => item.key === 'toolbox')
  const scenes = Object.fromEntries(toolbox.groups.flatMap((group) => group.scenes).map((scene) => [scene.slug, scene]))
  for (const slug of deferred) {
    assert.equal(scenes[slug].capability, 'planned', slug)
    assert.equal(scenes[slug].targetRoute, undefined, slug)
  }
  for (const [slug, targetRoute] of Object.entries(expected)) {
    const scene = scenes[slug]
    assert.equal(scene.capability, 'implemented', slug)
    assert.equal(scene.targetRoute, targetRoute, slug)
    const workbench = targetRoute.split('/').pop()
    assert.equal(slugs.has(workbench), true, workbench)
  }
  assert.equal(scenes['id-photo'].targetRoute || '/tools/ai/id-photo', '/tools/ai/id-photo')
})

test('cross-border image-set scenes map and listing text stays planned', async () => {
  const { readFileSync } = await import('node:fs')
  const { dirname, join } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const cats = JSON.parse(readFileSync(join(root, 'src/data/business.json'), 'utf8'))
  const schemas = JSON.parse(readFileSync(join(root, 'src/data/sceneSchemas.json'), 'utf8'))
  const slugs = new Set(schemas.map((scene) => scene.slug))
  const expected = {
    'platform-image-set': '/product-images/suite',
    'language-size-matrix': '/product-images/clothing-ztc',
    'aplus-brand-story': '/product-images/detail-page',
    'sku-listing-pack': '/product-images/sku-image'
  }
  const deferred = ['listing-generate', 'listing-localize', 'listing-compliance']
  const catalog = cats.find((item) => item.key === 'cross-border')
  const scenes = Object.fromEntries(catalog.groups.flatMap((group) => group.scenes).map((scene) => [scene.slug, scene]))
  assert.equal(Object.keys(scenes).length, 7)
  for (const slug of deferred) {
    assert.equal(scenes[slug].capability, 'planned', slug)
    assert.equal(scenes[slug].targetRoute, undefined, slug)
  }
  for (const [slug, targetRoute] of Object.entries(expected)) {
    const scene = scenes[slug]
    assert.equal(scene.capability, 'implemented', slug)
    assert.equal(scene.targetRoute, targetRoute, slug)
    const workbench = targetRoute.split('/').pop()
    assert.equal(slugs.has(workbench), true, workbench)
  }
})
