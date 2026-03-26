import http from 'k6/http'
import { check, sleep } from 'k6'
import { SharedArray } from 'k6/data'
import { Counter, Trend } from 'k6/metrics'

// ── Custom metrics ──────────────────────────────────────────────
const submissionErrors = new Counter('submission_errors')
const submissionDuration = new Trend('submission_duration', true)

// ── Environment variables ───────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'https://codedang.com/api'
const USERNAME = __ENV.USERNAME
const PASSWORD = __ENV.PASSWORD
const PROBLEM_ID = __ENV.PROBLEM_ID

if (!USERNAME || !PASSWORD || !PROBLEM_ID) {
  throw new Error(
    'Required env vars: USERNAME, PASSWORD, PROBLEM_ID\n' +
      'Usage: k6 run -e USERNAME=x -e PASSWORD=x -e PROBLEM_ID=123 submission-load.js'
  )
}

// ── Payloads ────────────────────────────────────────────────────
const LANGUAGES = ['C', 'Cpp', 'Java', 'Python3', 'PyPy3']

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
  scenarios: {
    normal_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 140 },
        { duration: '10m', target: 140 },
        { duration: '2m', target: 0 }
      ],
      exec: 'normalSubmission',
      tags: { user_type: 'normal' }
    },
    villain_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '10m', target: 10 },
        { duration: '2m', target: 0 }
      ],
      exec: 'villainSubmission',
      tags: { user_type: 'villain' }
    }
  },
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
      `Submission failed: status=${res.status} lang=${language} body=${res.body}`
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
