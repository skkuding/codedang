/* eslint-disable func-style */

/**
 * SSE 테스트 스크립트 사용법
 * 1. Bruno로 로그인 API 호출 해 로그인 한 후 Authorization 헤더에 세팅되는 Bearer Token 값 복사 후 jwtToken 변수에 붙여넣기
 * 2. submission 생성(제출) 후 반환되는 submission ID 설정
 */

const submissionId = 1 // 테스트할 submissionId
const jwtToken = 'Bearer abcdef' // JWT Token

async function startSSE() {
  try {
    const response = await fetch(
      `http://localhost:4000/submission/result/${submissionId}`,
      {
        headers: {
          Authorization: jwtToken
        }
      }
    )

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

startSSE()
