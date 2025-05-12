/* eslint-disable @typescript-eslint/no-explicit-any */
import { check } from 'k6'
import http from 'k6/http'
import { Trend } from 'k6/metrics'
import type { Options } from 'k6/options'

export type CodeSnippet = {
  filePath: string
  text: string
  language: Language
}

export const getCodeSnippet = (filePath: string): CodeSnippet => {
  console.log(`Attempting to open: ${filePath}`)
  const text = open(filePath)
  const fileExtension = filePath.split('.').at(-1) || ''
  return {
    filePath,
    text,
    language: getLanguageTypeWithFileExtension(fileExtension)
  }
}

export type Language = 'C' | 'Java' | 'Python3' | 'Cpp'

const getLanguageTypeWithFileExtension = (fileExtension: string): Language => {
  switch (fileExtension) {
    case 'c':
      return 'C'
    case 'cpp':
      return 'Cpp'
    case 'java':
      return 'Java'
    case 'py':
      return 'Python3'
    default:
      throw TypeError(`Invalid file extension '${fileExtension}'`)
  }
}

export const loginLatency = new Trend('login_latency', true) // 로그인 응답 시간
export type AuthInfo = {
  authToken: string
  cookie: string
}

export function loginAndGetAuth(
  baseUrl: string,
  username: string,
  password: string
): AuthInfo | null {
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

/**
 * handleSummary 함수는 테스트 종료 후 결과 데이터를 커스텀 형식으로 출력하는 데 사용됩니다.
 * @param data k6 테스트 결과 데이터
 * @param testOptions 테스트 옵션 (시나리오 정보 포함)
 * @param envVars 환경 변수 정보
 * @returns 요약 보고서 객체
 */
export function generateSummary(
  data: any,
  testOptions: Options,
  filePath: string,
  envVars: any
) {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  const fileName = `${filePath}/submission_${year}${month}${day}_${hours}${minutes}.txt`

  let summaryText = ''

  // 환경 정보 추가
  const {
    CODEDANG_BASE_URL,
    LOGIN_USERNAME,
    LOGIN_PASSWORD,
    CONTEST_ID,
    PROBLEM_ID,
    K6_OTEL_EXPORTER_OTLP_ENDPOINT,
    SLEEP_INTERVAL_SECONDS,
    NORMAL_CODE_SNIPPET_FILE_PATH,
    VILLAIN_CODE_SNIPPET_FILE_PATH
  } = envVars

  summaryText += '=== 테스트 환경 정보 ===\n'
  summaryText += `실행 시간: ${year}-${month}-${day} ${hours}:${minutes}\n`
  summaryText += `대상 API 서버: ${CODEDANG_BASE_URL || 'http://localhost:4000'}\n`
  summaryText += `로그인 유저: ${LOGIN_USERNAME || 'instructor'}\n`
  summaryText += `대회 ID: ${CONTEST_ID || '설정되지 않음'}\n`
  summaryText += `문제 ID: ${PROBLEM_ID || 6}\n`
  summaryText += `OTLP 엔드포인트: ${K6_OTEL_EXPORTER_OTLP_ENDPOINT || '설정되지 않음'}\n`
  summaryText += `요청 간 대기시간: ${SLEEP_INTERVAL_SECONDS || 10}초\n`
  summaryText += `일반 코드 스니펫 경로: ${NORMAL_CODE_SNIPPET_FILE_PATH || './scripts/normal/default.py'}\n`
  summaryText += `빌런 코드 스니펫 경로: ${VILLAIN_CODE_SNIPPET_FILE_PATH || './scripts/villain/python/default.py'}\n\n`

  // TODO: 시나리오 정보 동적 추가
  summaryText += '=== 시나리오 정보 ===\n'

  const scenarios = testOptions.scenarios || {}
  const scenarioNames = ['villains', 'normals']
  if (scenarioNames.length === 0) {
    summaryText += '시나리오 정보가 없습니다.\n'
  } else {
    scenarioNames.forEach((scenarioName) => {
      const scenario = scenarios[scenarioName]
      summaryText += `시나리오 이름: ${scenarioName}\n`
      summaryText += `  실행기: ${scenario.executor}\n`
      summaryText += `  단계: ${scenario.env}\n`
      summaryText += `  태그: ${JSON.stringify(scenario.tags || {})}\n`
      summaryText += `  실행 함수: ${scenario.exec}\n`
      summaryText += `  실행 시간: ${scenario.startTime}\n`
    })
  }
  summaryText += '\n'

  // 테스트 결과 정보 추가
  summaryText += '=== 테스트 결과 요약 ===\n'
  summaryText += `테스트 지속 시간: ${data.state.testRunDurationMs / 1000}초\n`
  summaryText += `총 반복 횟수: ${data.metrics.iterations.values.count}\n`
  summaryText += '\n=== HTTP 요청 결과 ===\n'
  summaryText += `총 요청 수: ${data.metrics.http_reqs.values.count}\n`
  summaryText += `실패한 요청 수: ${data.metrics.http_req_failed.values.count}\n`
  summaryText += `응답 시간 평균: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`
  summaryText += `응답 시간 중앙값: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms\n`
  summaryText += `응답 시간 p95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`
  summaryText += `응답 시간 최대: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`
  summaryText += '\n=== 커스텀 메트릭 ===\n'

  // 커스텀 메트릭 (submission_latency) 결과 추가
  if (data.metrics.submission_latency) {
    summaryText += '제출 지연 시간:\n'
    summaryText += `  평균: ${data.metrics.submission_latency.values.avg.toFixed(2)}ms\n`
    summaryText += `  중앙값: ${data.metrics.submission_latency.values.med.toFixed(2)}ms\n`
    summaryText += `  p95: ${data.metrics.submission_latency.values['p(95)'].toFixed(2)}ms\n`
    summaryText += `  최소: ${data.metrics.submission_latency.values.min.toFixed(2)}ms\n`
    summaryText += `  최대: ${data.metrics.submission_latency.values.max.toFixed(2)}ms\n`
  }

  // 시나리오별 지표 분석
  if (data.metrics.submission_latency?.thresholds) {
    summaryText += '\n=== 시나리오별 성능 지표 ===\n'

    // 시나리오별 태그를 기반으로 데이터 추출 시도
    Object.keys(scenarios).forEach((scenarioName) => {
      const scenarioTag = scenarios[scenarioName].tags?.user_type

      if (
        scenarioTag &&
        data.metrics[`submission_latency{user_type:${scenarioTag}}`]
      ) {
        const tagMetric =
          data.metrics[`submission_latency{user_type:${scenarioTag}}`]
        summaryText += `${scenarioName} (${scenarioTag}):\n`
        summaryText += `  평균 응답 시간: ${tagMetric.values.avg.toFixed(2)}ms\n`
        summaryText += `  중앙값: ${tagMetric.values.med.toFixed(2)}ms\n`
        summaryText += `  p95: ${tagMetric.values['p(95)'].toFixed(2)}ms\n`
      }
    })
  }

  // 체크 결과 추가
  if (data.metrics.checks) {
    summaryText += '\n=== 체크 결과 ===\n'
    summaryText += `성공률: ${(data.metrics.checks.values.rate * 100).toFixed(2)}%\n`
    summaryText += `통과: ${data.metrics.checks.values.passes}\n`
    summaryText += `실패: ${data.metrics.checks.values.fails}\n`
  }

  // 결과 파일 반환
  return {
    stdout: summaryText, // 콘솔에도 출력
    [fileName]: summaryText // 파일로 저장
  }
}
