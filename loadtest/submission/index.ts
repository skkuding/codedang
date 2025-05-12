/* eslint-disable @typescript-eslint/no-explicit-any */
import { check, sleep } from 'k6'
import { SharedArray } from 'k6/data'
import http from 'k6/http'
import { Trend } from 'k6/metrics'
import type { Options } from 'k6/options'
import {
  generateSummary,
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
const OTEL_ENDPOINT = __ENV.K6_OTEL_EXPORTER_OTLP_ENDPOINT // OTLP 형식으로 메트릭을 전송할 엔드포인트(선택적)
const SLEEP_INTERVAL_SECONDS = Number(__ENV.SLEEP_INTERVAL_SECONDS) || 10 // 각 vu가 요청 후 대기하는 시간
const NORMAL_CODE_SNIPPET_FILE_PATH =
  __ENV.NORMAL_CODE_SNIPPET_FILE_PATH || './scripts/normal/default.py'
const VILLAIN_CODE_SNIPPET_FILE_PATH =
  __ENV.VILLAIN_CODE_SNIPPET_FILE_PATH || './scripts/villain/python/default.py'

// --- k6 옵션: Scenarios 정의 ---
export const options: Options = {
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
} as const

/**
 * 제출 함수로서, 정상 또는 빌런 사용자의 코드 스니펫을 제출합니다.
 * @param baseUrl API 서버 URL
 * @param contestId 대회 ID(선택적)
 * @param problemId 문제 ID
 * @param authInfo 인증 정보
 * @param codeSnippet 코드 스니펫
 * @param tags 메트릭 태그(선택적)
 */
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
  tags?: any
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

// --- 코드 스니펫 로드 ---
// --- SharedArray로 코드 스니펫 로드 (init 단계에서 한 번만 실행됨) ---
// SharedArray 생성자의 두 번째 인자로 넘기는 함수는 init 단계에서 한 번만 실행됨
const normalCodeSnippets = new SharedArray('normalSnippets', () => {
  // 이 함수 내부에서만 open() 함수 호출 가능
  return [getCodeSnippet(NORMAL_CODE_SNIPPET_FILE_PATH)]
})

const villainCodeSnippets = new SharedArray('villainSnippets', () => {
  return [getCodeSnippet(VILLAIN_CODE_SNIPPET_FILE_PATH)]
})

// 유틸리티 함수로 편하게 접근
const getNormalCodeSnippet = (): CodeSnippet => normalCodeSnippets[0]
const getVillainCodeSnippet = (): CodeSnippet => villainCodeSnippets[0]

/**
 * 테스트 시작 전 한 번 실행되는 Setup 함수입니다.
 * 이 함수는 코드 스니펫을 로드하고, API 서버에 로그인하여
 * 필요한 데이터를 반환합니다.
 * (참고: https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/#setup-and-teardown-stages)
 */
export function setup() {
  // API 서버와 엔드포인트 확인
  if (!BASE_URL) {
    throw new Error('BASE_URL is not defined. Please set CODEDANG_BASE_URL.')
  }
  console.log(`[k6 Setup] Target API Server: ${BASE_URL}`)

  // OTLP 엔드포인트 확인
  if (!OTEL_ENDPOINT) {
    console.warn('OTEL_ENDPOINT is not defined. Metrics will not be sent.')
  } else {
    console.log(`[k6 Setup] Sending OTLP metrics to: ${OTEL_ENDPOINT}`)
  }

  // SharedArray에서 코드 스니펫 가져오기 (복사가 아닌 참조)
  const normalCodeSnippet = getNormalCodeSnippet()
  const villainCodeSnippet = getVillainCodeSnippet()

  // 코드 스니펫 검증
  if (!normalCodeSnippet) {
    throw new Error('Failed to load normal code snippet.')
  }
  console.log(
    `[k6 Setup] Loaded normal code snippet: ${normalCodeSnippet.filePath}(${normalCodeSnippet.language})`
  )

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

export function villainScenario(data: ReturnType<typeof setup>) {
  const authInfo = data.sharedAuthInfo
  const codeSnippet = data.codeSnippets.villain
  const tags = {
    snippet_type: 'villain'
  }

  submitCode({
    baseUrl: BASE_URL,
    contestId: CONTEST_ID,
    problemId: PROBLEM_ID,
    authInfo,
    codeSnippet,
    tags
  })

  sleep(SLEEP_INTERVAL_SECONDS)
}

export function normalScenario(data: ReturnType<typeof setup>) {
  const authInfo = data.sharedAuthInfo
  const codeSnippet = data.codeSnippets.normal
  const tags = {
    snippet_type: 'normal'
  }

  submitCode({
    baseUrl: BASE_URL,
    contestId: CONTEST_ID,
    problemId: PROBLEM_ID,
    authInfo,
    codeSnippet,
    tags
  })

  sleep(SLEEP_INTERVAL_SECONDS)
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

// --- Summary 함수: 테스트 결과 요약 ---
export function handleSummary(data: any) {
  return generateSummary(data, options, './loadtest/submission/results', {
    BASE_URL,
    LOGIN_USERNAME,
    LOGIN_PASSWORD,
    CONTEST_ID,
    PROBLEM_ID,
    OTEL_ENDPOINT,
    SLEEP_INTERVAL_SECONDS,
    NORMAL_CODE_SNIPPET_FILE_PATH,
    VILLAIN_CODE_SNIPPET_FILE_PATH
  })
}
