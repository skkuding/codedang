/* eslint-disable @typescript-eslint/no-explicit-any */
import { check, sleep } from 'k6'
import { SharedArray } from 'k6/data'
import http from 'k6/http'
import { Trend } from 'k6/metrics'

// --- 설정값 ---
const BASE_URL = __ENV.CODEDANG_BASE_URL || 'http://localhost:4000'
const LOGIN_USERNAME = __ENV.LOGIN_USERNAME || 'instructor'
const LOGIN_PASSWORD = __ENV.LOGIN_PASSWORD || 'Instructorinstructor'
const PROBLEM_ID = 6
const OTEL_ENDPOINT = __ENV.K6_OTEL_EXPORTER_OTLP_ENDPOINT || 'localhost:4317'

// --- 코드 파일 설정 ---
type scriptType = 'normal' | 'villain'
const getCodeSnippets = (scriptType: scriptType) => {
  const submissionScripts = {
    normal: ['scripts/normal/1.c'],
    villain: {
      c: [
        // 'scripts/villain/c/execve_shell.c',
        // 'scripts/villain/c/fopen_sesnsitive_files.c',
        // 'fopen_write_1TB_dummy.c',
        // 'scripts/villain/c/fork_bomb.c'
        // 'scripts/villain/c/inject_file.c'
        'scripts/villain/c/memory_hog.c'
        // 'scripts/villain/c/long_output.c'
      ],
      java: [
        'scripts/villain/java/memory_hog.java'
        // 'scripts/villain/java/long_output.java'
      ],
      python: [
        // 'scripts/villain/python/basic_infinite_loop.py',
        // 'scripts/villain/python/nested_for.py',
        'scripts/villain/python/memory_hog.py'
        // 'scripts/villain/python/long_output.py'
      ],
      cpp: [
        // 'scripts/villain/cpp/buffer_overflow.cpp',
        // 'scripts/villain/cpp/use_after_free.cpp',
        'scripts/villain/cpp/memory_hog.cpp'
        // 'scripts/villain/cpp/long_output.cpp'
      ]
    }
  } as const

  const snippets = []
  const fileNames: string[] = []
  if (scriptType === 'normal') {
    fileNames.push(...submissionScripts.normal)
  } else if (scriptType === 'villain') {
    fileNames.push(...submissionScripts.villain.c)
    fileNames.push(...submissionScripts.villain.python)
    fileNames.push(...submissionScripts.villain.java)
    fileNames.push(...submissionScripts.villain.cpp)
  }

  for (const fileName of fileNames) {
    const filePath = `./${fileName}`
    try {
      console.log(`Attempting to open: ${filePath}`)
      const content = open(filePath)
      snippets.push(content)
    } catch (e) {
      console.error(`Failed to open file ${filePath}: ${e}`)
    }
  }
  if (snippets.length === 0) {
    throw new Error(
      `Could not load any code snippets. Check file paths (${`./scripts/${scriptType}/`}) and permissions.`
    )
  }
  return snippets
}

// SharedArray로 파일 미리 로드
const villainCodeSnippets = new SharedArray('villainCodeSnippets', () =>
  getCodeSnippets('villain')
)
const normalCodeSnippets = new SharedArray('normalCodeSnippets', () =>
  getCodeSnippets('normal')
)
// ------------------------------------------

// --- 공통 함수: 로그인 ---
// 로그인 로직을 별도 함수로 분리하여 재사용
function loginAndGetAuth(baseUrl: string, username: string, password: string) {
  const loginUrl = `${baseUrl}/auth/login`
  const loginPayload = JSON.stringify({ username, password })
  const loginParams = {
    headers: { 'Content-Type': 'application/json' },
    tags: { scenario: 'login' } // 태그는 시나리오별로 다르게 지정 가능
  }
  const loginRes = http.post(loginUrl, loginPayload, loginParams)
  loginLatency.add(loginRes.timings.duration) // Trend 메트릭에 값 추가

  const loginSuccess = check(loginRes, {
    'login status is 200 or 201': (r) => [200, 201].includes(r.status),
    'authorization header exists': (r) => r.headers.Authorization != null,
    'set-cookie header exists': (r) => r.headers['Set-Cookie'] != null
  })

  if (!loginSuccess) {
    console.error(`Login failed for user ${username}`)
    return null
  }
  return {
    authToken: loginRes.headers.Authorization,
    cookie: loginRes.headers['Set-Cookie']
  }
}

// --- 공통 함수: 코드 제출 ---
// 코드 제출 로직도 별도 함수로 분리
function submitCode(
  baseUrl: string,
  problemId: number,
  authInfo: { authToken: string; cookie: string },
  codeSnippet: string,
  tags: any
) {
  const submissionPayload = JSON.stringify({
    code: [{ id: 1, text: codeSnippet, locked: false }],
    language: 'C'
  })
  const submissionUrl = `${baseUrl}/submission?problemId=${problemId}`
  const submissionParams = {
    headers: {
      Authorization: authInfo.authToken,
      Cookie: authInfo.cookie,
      'Content-Type': 'application/json'
    },
    tags: { scenario: 'submission', ...tags } // 기본 태그와 추가 태그 병합
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
const loginLatency = new Trend('login_latency', true) // 로그인 응답 시간
const submissionLatency = new Trend('submission_latency', true) // 제출 응답 시간

// --- Setup 함수 ---
// 테스트 시작 전 한 번 실행 (모든 시나리오 공통)
export function setup() {
  console.log(`[k6 Setup] Target API Server: ${BASE_URL}`)
  console.log(`[k6 Setup] Sending OTLP metrics to: ${OTEL_ENDPOINT}`)
  console.log(
    `[k6 Setup] Loaded ${villainCodeSnippets.length} villain code snippets.`
  )
  console.log(
    `[k6 Setup] Loaded ${normalCodeSnippets.length} normal code snippets.`
  )
  if (villainCodeSnippets.length === 0 && normalCodeSnippets.length === 0) {
    throw new Error('No code snippets were loaded.')
  }
}

// --- k6 옵션: Scenarios 정의 ---
export const options = {
  // thresholds는 전체 테스트에 대해 적용 가능
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
      // 이 시나리오에서 실행할 함수 이름
      exec: 'villainScenario',
      stages: [{ duration: '10s', target: 10 }],
      tags: { user_type: 'villain' }
    },
    // 시나리오 2: Normal 사용자
    normals: {
      executor: 'ramping-vus',
      // 이 시나리오에서 실행할 함수 이름
      exec: 'normalScenario',
      stages: [{ duration: '10s', target: 140 }],
      tags: { user_type: 'normal' }
    }
  }
}

// --- Villain 시나리오 실행 함수 ---
export function villainScenario() {
  // 1. 로그인
  const authInfo = loginAndGetAuth(BASE_URL, LOGIN_USERNAME, LOGIN_PASSWORD)
  if (!authInfo) {
    sleep(1)
    return // 로그인 실패 시 중단
  }
  sleep(0.5)

  // 2. Villain 코드 제출
  if (villainCodeSnippets.length > 0) {
    const randomCode =
      villainCodeSnippets[
        Math.floor(Math.random() * villainCodeSnippets.length)
      ]
    // 제출 함수 호출 + 태그 전달
    submitCode(BASE_URL, PROBLEM_ID, authInfo, randomCode, {
      snippet_type: 'villain'
    })
  } else {
    console.warn('Villain snippet array is empty!')
  }

  sleep(1)
}

// --- Normal 시나리오 실행 함수 ---
export function normalScenario() {
  // 1. 로그인
  const authInfo = loginAndGetAuth(BASE_URL, LOGIN_USERNAME, LOGIN_PASSWORD)
  if (!authInfo) {
    sleep(1)
    return // 로그인 실패 시 중단
  }
  sleep(0.5)

  // 2. Normal 코드 제출
  if (normalCodeSnippets.length > 0) {
    const randomCode =
      normalCodeSnippets[Math.floor(Math.random() * normalCodeSnippets.length)]
    // 제출 함수 호출 + 태그 전달
    submitCode(BASE_URL, PROBLEM_ID, authInfo, randomCode, {
      snippet_type: 'normal'
    })
  } else {
    console.warn('Normal snippet array is empty!')
  }

  sleep(1)
}

// 기존 default 함수는 더 이상 사용되지 않으므로 삭제하거나 주석 처리합니다.
// export default function () { ... }
