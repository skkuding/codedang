import { check, sleep } from 'k6'
import { SharedArray } from 'k6/data'
import http from 'k6/http'
import { Counter, Trend } from 'k6/metrics'

// ── Custom metrics ──────────────────────────────────────────────
const submissionErrors = new Counter('submission_errors')
const submissionDuration = new Trend('submission_duration', true)

// ── Environment variables ───────────────────────────────────────
function loadDotEnv() {
  try {
    return parseDotEnv(open('./.env'))
  } catch (_) {
    return {}
  }
}

function parseDotEnv(content) {
  const env = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue

    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[match[1]] = value
  }
  return env
}

const dotenv = loadDotEnv()

function env(name, fallback) {
  const value = __ENV[name] !== undefined ? __ENV[name] : dotenv[name]
  return value !== undefined && value !== '' ? value : fallback
}

function numberEnv(name, fallback) {
  const value = Number(env(name, fallback))
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number`)
  }
  return value
}

const BASE_URL = env('BASE_URL', 'https://codedang.com/api')
const USERNAME = env('USERNAME')
const PASSWORD = env('PASSWORD')
const PROBLEM_ID = env('PROBLEM_ID')

const NORMAL_VUS = numberEnv('NORMAL_VUS', 20)
const VILLAIN_VUS = numberEnv('VILLAIN_VUS', 2)
const RAMP_UP_DURATION = env('RAMP_UP_DURATION', '30s')
const STEADY_DURATION = env('STEADY_DURATION', '2m')
const RAMP_DOWN_DURATION = env('RAMP_DOWN_DURATION', '30s')

if (NORMAL_VUS === 0 && VILLAIN_VUS === 0) {
  throw new Error('At least one of NORMAL_VUS or VILLAIN_VUS must be greater than 0')
}

if (!USERNAME || !PASSWORD || !PROBLEM_ID) {
  throw new Error(
    'Required env vars: USERNAME, PASSWORD, PROBLEM_ID\n' +
      'Usage: create .env or run k6 with -e USERNAME=x -e PASSWORD=x -e PROBLEM_ID=123 submission-load.js'
  )
}

function rampingScenario(exec, vus, tags) {
  return {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: RAMP_UP_DURATION, target: vus },
      { duration: STEADY_DURATION, target: vus },
      { duration: RAMP_DOWN_DURATION, target: 0 }
    ],
    exec,
    tags
  }
}

const scenarios = {}
if (NORMAL_VUS > 0) {
  scenarios.normal_users = rampingScenario('normalSubmission', NORMAL_VUS, {
    user_type: 'normal'
  })
}
if (VILLAIN_VUS > 0) {
  scenarios.villain_users = rampingScenario('villainSubmission', VILLAIN_VUS, {
    user_type: 'villain'
  })
}

// ── Payloads ────────────────────────────────────────────────────
const normalPayloads = new SharedArray('normal', () => [
  { lang: 'C', code: open('./payloads/normal/solution.c') },
  { lang: 'Cpp', code: open('./payloads/normal/solution.cpp') },
  { lang: 'Java', code: open('./payloads/normal/solution.java') },
  { lang: 'Python3', code: open('./payloads/normal/solution.py') },
  { lang: 'PyPy3', code: open('./payloads/normal/solution.pypy.py') }
])

const villainPayloads = new SharedArray('villain', () => [
  { lang: 'C', code: open('./payloads/villain/infinite-loop.c') },
  { lang: 'Cpp', code: open('./payloads/villain/memory-bomb.cpp') },
  { lang: 'Java', code: open('./payloads/villain/output-flood.java') },
  { lang: 'Python3', code: open('./payloads/villain/resource-hog.py') },
  { lang: 'PyPy3', code: open('./payloads/villain/fork-attempt.pypy.py') }
])

// ── Scenarios ───────────────────────────────────────────────────
export const options = {
  scenarios,
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    submission_errors: ['count<50']
  }
}

// ── Setup: login once, share token across all VUs ───────────────
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ username: USERNAME, password: PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  )

  check(loginRes, {
    'login succeeded': (r) => r.status === 201 || r.status === 200
  })

  const token = loginRes.headers['Authorization']
  if (!token) {
    throw new Error(
      `Login failed: status=${loginRes.status} body=${loginRes.body}`
    )
  }

  console.log(`Login successful. Token obtained. Problem ID: ${PROBLEM_ID}`)
  return { token }
}

// ── Helpers ─────────────────────────────────────────────────────
function submitCode(token, language, code, tags) {
  const url = `${BASE_URL}/submission?problemId=${PROBLEM_ID}`
  const payload = JSON.stringify({
    language,
    code: [{ id: 1, text: code, locked: false }]
  })
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    tags
  }

  const res = http.post(url, payload, params)
  submissionDuration.add(res.timings.duration, tags)

  const ok = check(res, {
    'submission accepted': (r) => r.status === 201 || r.status === 200
  })

  if (!ok) {
    submissionErrors.add(1, tags)
    console.warn(
      `Submission failed: status=${res.status} lang=${language} body=${res.body.substring(0, 500)}`
    )
  }

  return res
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ── Scenario: normal users ──────────────────────────────────────
export function normalSubmission(data) {
  const payload = pickRandom(normalPayloads)
  submitCode(data.token, payload.lang, payload.code, {
    user_type: 'normal',
    language: payload.lang
  })
  sleep(Math.random() * 2 + 1) // 1~3s between submissions
}

// ── Scenario: villain users ─────────────────────────────────────
export function villainSubmission(data) {
  const payload = pickRandom(villainPayloads)
  submitCode(data.token, payload.lang, payload.code, {
    user_type: 'villain',
    language: payload.lang
  })
  sleep(Math.random() * 3 + 2) // 2~5s between submissions (slower pace)
}
