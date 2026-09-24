import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'

const here = dirname(fileURLToPath(import.meta.url))
const dataFile = process.env.AMAM_DB_FILE || join(here, 'data', 'db.json')
const dataDir = dirname(dataFile)

const empty = () => ({ users: {}, sessions: {}, jobs: {}, orders: [], ledger: [] })

function load() {
  if (!existsSync(dataFile)) return empty()
  try {
    const parsed = JSON.parse(readFileSync(dataFile, 'utf8'))
    return { ...empty(), ...parsed }
  } catch {
    return empty()
  }
}

const state = load()

export function save() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
  writeFileSync(dataFile, JSON.stringify(state, null, 2))
}

export function ledgerTotal(userId) {
  return round(state.ledger.filter((entry) => entry.userId === userId).reduce((sum, entry) => sum + entry.delta, 0))
}

function reconcileLedger() {
  let changed = false
  Object.values(state.users).forEach((user) => {
    const diff = round(user.credits - ledgerTotal(user.id))
    if (diff !== 0) {
      addLedger(user.id, diff, 'adjust', null)
      changed = true
    }
  })
  if (changed) save()
}

export { state }

export function newId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 18)}`
}

function round(n) {
  return Math.round(Number(n || 0) * 100) / 100
}

export function addLedger(userId, delta, reason, jobId) {
  state.ledger.push({ id: newId('led'), userId, delta: round(delta), reason, jobId: jobId || null, createdAt: Date.now() })
}

function alreadyFinalized(jobId) {
  if (!jobId) return false
  return state.ledger.some((entry) => entry.jobId === jobId && (entry.reason === 'settle' || entry.reason === 'refund'))
}

export function freezeCredits(user, cost, jobId) {
  user.credits = round(user.credits - cost)
  addLedger(user.id, -cost, 'freeze', jobId)
}

export function settleCredits(user, cost, jobId) {
  if (alreadyFinalized(jobId)) return
  addLedger(user.id, 0, 'settle', jobId)
}

export function refundCredits(user, cost, jobId) {
  if (alreadyFinalized(jobId)) return
  user.credits = round(user.credits + cost)
  addLedger(user.id, cost, 'refund', jobId)
}

export function creditUser(user, amount, reason) {
  user.credits = round(user.credits + amount)
  addLedger(user.id, amount, reason)
}

reconcileLedger()
