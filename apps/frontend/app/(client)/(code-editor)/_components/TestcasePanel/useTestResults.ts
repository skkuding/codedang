import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTestcaseStore } from '../context/TestcaseStoreProvider'

interface TestResultDetail {
  id: number
  originalId: number // 추가
  input: string
  expectedOutput: string // 추가
  output: string
  result: string
  isUserTestcase: boolean
}
interface SSETestcaseResult {
  id: number // 백엔드 /test 고려
  submissionId: number
  problemTestcaseId: number
  result: string
  cpuTime: string
  memoryUsage: number
  output?: string
}

interface SSEData {
  result: string
  testcaseResult: SSETestcaseResult
  userTest?: boolean
}

// SSE를 통해 데이터를 수신하는 커스텀 훅
const useSSE = (endpoint: string) => {
  // SSE를 통해 수신된 데이터를 저장

  const [results, setResults] = useState<SSEData[]>([])
  const [isError, setIsError] = useState<boolean>(false) // 에러 상태를 관리하고

  // EventSource 인스턴스를 관리하기 위한 ref
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // 본격 SSE 연결 생성
    const eventSource = new EventSource(endpoint)
    eventSourceRef.current = eventSource

    // SSE로 데이터 수신 시 호출되는 핸들러
    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data: SSEData = JSON.parse(event.data)
        setResults((prev) => [...prev, data])

        // 만약 전체 제출 상태가 Judging이 아니라면, 최종 결과로 간주하고 SSE 연결 종료
        // 모든 테스트 케이스를 실행한게 아닐 경우 Judging을 반환하는 구조임
        if (data.result !== 'Judging') {
          eventSource.close() // 즉, 최종 결과가 반환되면 모두 실행한 것으로 파악하고 SSE 연결 종료
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    // SSE 연결 에러 시 호출되는 핸들러
    // TO-DO
    eventSource.onerror = () => {
      setIsError(true)
      toast.error('Failed to receive test results.') // 지금 이 에러 메세지가 **두번** 뜨고 있음 ->SSE 연결 중 에러 발생
      eventSource.close()
    }

    // 컴포넌트 언마운트 시 SSE 연결 정리
    return () => {
      eventSource.close()
    }
  }, [endpoint])

  return { results, isError }
}

// 테스트 결과를 처리하는 커스텀 훅
export const useTestResults = () => {
  // 상태 관리: 테스트케이스 데이터를 가져오기
  const testcases = useTestcaseStore((state) => state.getTestcases())
  const [initialTestcases] = useState(testcases) // 초기 데이터 저장

  const { results: sampleResults, isError: sampleError } = useSSE(
    '/submission/result/:submissionId'
  ) //엔드 포인트
  const { results: userResults, isError: userError } = useSSE(
    '/submission/result/test'
  )
  const [testResults, setTestResults] = useState<TestResultDetail[]>([])

  // SSE 에러 발생 시 사용자에게 알림
  // TO-DO
  useEffect(() => {
    if (sampleError || userError) {
      toast.error('Failed to execute some testcases. Please try again later.') // 이 에러도 한번 발생. SSE 연결 문제
    }
  }, [sampleError, userError])
  // SSE에서 수신된 데이터를 테스트케이스와 매핑하여 결과 생성
  useEffect(() => {
    // 모든 SSE 결과를 통합
    const allResults = [...sampleResults, ...userResults]

    // 초기 테스트케이스 데이터와 SSE 결과를 매핑하여 최종 결과 생성
    // 매핑 부분 좀 더 확인 필요
    const enrichedResults = initialTestcases.map((testcase, index) => {
      const testResult = allResults.find((result) => {
        if (result.userTest) {
          return result.testcaseResult.id === testcase.id
        } else {
          return result.testcaseResult.problemTestcaseId === testcase.id
        }
      })

      return {
        id: testcase.id,
        originalId: index + 1,
        input: testcase.input,
        expectedOutput: testcase.output,
        output: testResult?.testcaseResult?.output ?? '',
        result: testResult?.testcaseResult?.result ?? 'Pending',
        isUserTestcase: testcase.isUserTestcase
      }
    })

    // 런타임 에러는 해결
    setTestResults(enrichedResults)
  }, [sampleResults, userResults, initialTestcases])

  return testResults
}
