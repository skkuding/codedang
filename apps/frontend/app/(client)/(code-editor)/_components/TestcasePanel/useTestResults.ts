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

const useSSE = (endpoint: string) => {
  const [results, setResults] = useState<SSEData[]>([]) // SSE에서 수신된 데이터를 저장하고
  const [isError, setIsError] = useState<boolean>(false) // 에러 상태를 관리하고
  const eventSourceRef = useRef<EventSource | null>(null) // 연결 참고

  useEffect(() => {
    const eventSource = new EventSource(endpoint) // SSE 연결 생성
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const data: SSEData = JSON.parse(event.data)
        setResults((prev) => [...prev, data])

        // 모든 테스트 케이스를 실행한게 아닐 경우 Judging을 반환하는 구조임
        if (data.result !== 'Judging') {
          eventSource.close() // 즉, 최종 결과가 반환되면 모두 실행한 것으로 파악하고 SSE 연결 종료
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = () => {
      setIsError(true)
      toast.error('Failed to receive test results.')
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [endpoint])

  return { results, isError }
}

export const useTestResults = () => {
  const testcases = useTestcaseStore((state) => state.getTestcases())

  const { results: sampleResults, isError: sampleError } =
    useSSE('/submission/:id')
  const { results: userResults, isError: userError } =
    useSSE('/submission/test')
  const [testResults, setTestResults] = useState<TestResultDetail[]>([]) // 타입 명시 에러 해결

  useEffect(() => {
    if (sampleError || userError) {
      toast.error('Failed to execute some testcases. Please try again later.')
    }
  }, [sampleError, userError])
  //TO-DO: 여기서 지금 루프 에러나는 듯
  useEffect(() => {
    const allResults = [...sampleResults, ...userResults]

    const enrichedResults = testcases.map((testcase, index) => {
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

    setTestResults(enrichedResults)
  }, [sampleResults, userResults, testcases])

  return testResults
}
