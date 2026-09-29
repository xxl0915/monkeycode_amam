import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

const dir = mkdtempSync(join(tmpdir(), 'amam-'))
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
})
