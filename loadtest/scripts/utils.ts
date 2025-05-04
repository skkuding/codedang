import { check } from 'k6'
import http from 'k6/http'
import { Trend } from 'k6/metrics'

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
