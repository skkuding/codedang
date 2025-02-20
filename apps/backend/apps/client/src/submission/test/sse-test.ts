/* eslint-disable func-style */

/**
 * SSE 테스트 스크립트 사용법
 * 1. Bruno로 로그인 API 호출 해 로그인 한 후 Authorization 헤더에 세팅되는 Bearer Token 값 복사 후 jwtToken 변수에 붙여넣기
 * 2. submission 생성(제출) 후 반환되는 submission ID 설정 OR key 설정
 * 3. 테스트 할 API에 따라 API Path 설정
 */

const jwtToken = 'Bearer token'

const submissionId = 1 // (Get Submission Result 용) submissionId
const key = 'key' // (Get Test|User-Test Result 용) key

const paths = {
  getSubmissionResult: `http://localhost:4000/submission/submission-result/${submissionId}`,
  getTestResult: `http://localhost:4000/submission/test-result/${key}`
}

async function runSSE() {
  try {
    // 테스트 할 API에 따라 API Path를 설정 해 주세요.
    const response = await fetch(paths.getSubmissionResult, {
      headers: {
        Authorization: jwtToken
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to connect: ${response.statusText}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    console.log('Connection opened to SSE endpoint.')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const data = decoder.decode(value, { stream: true })
      console.log('Received message:', data)
    }
  } catch (error) {
    console.error('SSE connection failed:', error)
  }
}

runSSE()
