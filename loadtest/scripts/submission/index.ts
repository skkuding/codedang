/* eslint-disable @typescript-eslint/no-explicit-any */
import { check, sleep } from 'k6'
import { SharedArray } from 'k6/data'
import http from 'k6/http'
import { Trend } from 'k6/metrics'
import {
  getCodeSnippet,
  loginAndGetAuth,
  type AuthInfo,
  type CodeSnippet
} from '../utils.ts'

// --- 설정값 ---
const BASE_URL = __ENV.CODEDANG_BASE_URL || 'http://localhost:4000'
const LOGIN_USERNAME = __ENV.LOGIN_USERNAME || 'instructor'
const LOGIN_PASSWORD = __ENV.LOGIN_PASSWORD || 'Instructorinstructor'
const CONTEST_ID = Number(__ENV.CONTEST_ID)
const PROBLEM_ID = Number(__ENV.PROBLEM_ID) || 6
const OTEL_ENDPOINT = __ENV.K6_OTEL_EXPORTER_OTLP_ENDPOINT || 'localhost:4317'

// --- 공통 함수: 코드 제출 ---
// 코드 제출 로직도 별도 함수로 분리
function submitCode({
  baseUrl,
  contestId,
  problemId,
  authInfo,
  codeSnippet,
  tags
}: {
  baseUrl: string
  contestId?: number
  problemId: number
  authInfo: AuthInfo
  codeSnippet: CodeSnippet
  tags: any
}) {
  const submissionUrl = getSubmissionUrl({ baseUrl, contestId, problemId })
  const submissionPayload = JSON.stringify({
    code: [{ id: 1, text: codeSnippet.text, locked: false }],
    language: codeSnippet.language
  })
  const submissionParams = {
    headers: {
      Authorization: authInfo.authToken,
      Cookie: authInfo.cookie,
      'Content-Type': 'application/json'
    },
    tags: { scenario: 'submission', ...tags }
  }

  const submissionRes = http.post(
    submissionUrl,
    submissionPayload,
    submissionParams
  )
  // Trend 메트릭에 값과 태그 추가
  submissionLatency.add(submissionRes.timings.duration, tags)

  check(submissionRes, {
    'submission status is 201': (r) => r.status === 201
  })
}

// --- 메트릭 정의 ---
const submissionLatency = new Trend('submission_latency', true) // 제출 응답 시간

// 코드 스니펫 로드
const codeSnippets = new SharedArray('codeSnippets', () => [
  getCodeSnippet('./scripts/normal/default.py'),
  getCodeSnippet('./scripts/villain/python/default.py')
])
const getNormalCodeSnippet = () => codeSnippets[0]
const getVillainCodeSnippet = () => codeSnippets[1]

// --- Setup 함수 ---
// 테스트 시작 전 한 번 실행 (모든 시나리오 공통)
export function setup() {
  // API 서버와 OTLP 엔드포인트 설정
  console.log(`[k6 Setup] Target API Server: ${BASE_URL}`)
  console.log(`[k6 Setup] Sending OTLP metrics to: ${OTEL_ENDPOINT}`)

  // 코드 스니펫 검증 및 전달
  const normalCodeSnippet = getNormalCodeSnippet()
  if (!normalCodeSnippet) {
    throw new Error('Failed to load normal code snippet.')
  }
  console.log(
    `[k6 Setup] Loaded normal code snippet: ${normalCodeSnippet.filePath}(${normalCodeSnippet.language})`
  )

  const villainCodeSnippet = getVillainCodeSnippet()
  if (!villainCodeSnippet) {
    throw new Error('Failed to load villain code snippet.')
  }
  console.log(
    `[k6 Setup] Loaded villain code snippet: ${villainCodeSnippet.filePath}(${villainCodeSnippet.language})`
  )

  // 로그인 정보 로드
  console.log(`[k6 Setup] Attempting login for user: ${LOGIN_USERNAME}`)
  const authInfo = loginAndGetAuth(BASE_URL, LOGIN_USERNAME, LOGIN_PASSWORD)
  if (!authInfo) {
    throw new Error('Login failed. Check your credentials.')
  }
  console.log(`[k6 Setup] Login successful!`)

  return {
    codeSnippets: {
      normal: normalCodeSnippet,
      villain: villainCodeSnippet
    },
    sharedAuthInfo: authInfo
  } as const
}

// --- k6 옵션: Scenarios 정의 ---
export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{scenario:login}': ['p(95)<500'],
    // submission 시나리오 태그 또는 snippet_type 태그로 세분화 가능
    'http_req_duration{scenario:submission}': ['p(95)<1500'],
    'http_req_duration{snippet_type:villain}': ['p(95)<2000'], // 예: villain은 2초
    'http_req_duration{snippet_type:normal}': ['p(95)<1000'], // 예: normal은 1초
    login_latency: ['p(95)<500'],
    'submission_latency{snippet_type:villain}': ['p(95)<2000'],
    'submission_latency{snippet_type:normal}': ['p(95)<1000']
  },
  scenarios: {
    // 시나리오 1: Villain 사용자
    villains: {
      executor: 'ramping-vus',
      exec: 'villainScenario',
      stages: [{ duration: '10s', target: 15 }],
      tags: { user_type: 'villain' }
    },
    // 시나리오 2: Normal 사용자
    normals: {
      executor: 'ramping-vus',
      exec: 'normalScenario',
      stages: [{ duration: '10s', target: 135 }],
      tags: { user_type: 'normal' }
    }
  }
}

export function villainScenario(data: ReturnType<typeof setup>) {
  const authInfo = data.sharedAuthInfo
  const codeSnippet = data.codeSnippets.villain

  submitCode({
    baseUrl: BASE_URL,
    contestId: CONTEST_ID,
    problemId: PROBLEM_ID,
    authInfo,
    codeSnippet,
    tags: {
      snippet_type: 'villain'
    }
  })

  sleep(10)
}

export function normalScenario(data: ReturnType<typeof setup>) {
  const authInfo = data.sharedAuthInfo
  const codeSnippet = data.codeSnippets.normal

  submitCode({
    baseUrl: BASE_URL,
    contestId: CONTEST_ID,
    problemId: PROBLEM_ID,
    authInfo,
    codeSnippet,
    tags: {
      snippet_type: 'normal'
    }
  })

  sleep(10)
}

const getSubmissionUrl = ({
  baseUrl,
  contestId,
  problemId
}: {
  baseUrl: string
  contestId?: number
  problemId: number
}) => {
  let submissionUrl = `${baseUrl}/submission?problemId=${problemId}`
  if (contestId) {
    submissionUrl += `&contestId=${contestId}`
  }
  return submissionUrl
}
