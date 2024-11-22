import { safeFetcherWithAuth } from '@/libs/utils'
import type { TestResult } from '@/types/type'
import { useQueries } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useTestPollingStore } from '../context/TestPollingStoreProvider'
import { useTestcaseStore } from '../context/TestcaseStoreProvider'

const MAX_ATTEMPTS = 10
const REFETCH_INTERVAL = 2000

const useGetTestResult = (type: 'sample' | 'user') => {
  const attempts = useRef(0)
  const setIsTesting = useTestPollingStore((state) => state.setIsTesting)
  const stopPolling = useTestPollingStore((state) => state.stopPolling)

  const baseUrl = type === 'sample' ? 'submission/test' : 'submission/user-test'

  const getTestResult = async () => {
    const res = await safeFetcherWithAuth.get(baseUrl, {
      next: {
        revalidate: 0
      }
    })

    const results: TestResult[] = await res.json()

    const allJudged = results.every(
      (submission) => submission.result !== 'Judging'
    )

    if (allJudged) {
      // Test execution is finished
      setIsTesting(false)
      stopPolling(type)
    } else if (attempts.current < MAX_ATTEMPTS) {
      // Retry
      attempts.current += 1
    } else {
      // No more retry
      setIsTesting(false)
      stopPolling(type)
      toast.error('Judging took too long. Please try again later.')
    }

    return results
  }

  return getTestResult
}

export const useTestResults = () => {
  const getSampleTestResult = useGetTestResult('sample')
  const getUserTestResult = useGetTestResult('user')
  const {
    samplePollingEnabled,
    userPollingEnabled,
    setIsTesting,
    stopPolling
  } = useTestPollingStore((state) => state)

  const { data, isError } = useQueries({
    queries: [
      {
        queryKey: ['submittion', 'test'],
        queryFn: getSampleTestResult,
        throwOnError: false,
        refetchInterval: REFETCH_INTERVAL,
        enabled: samplePollingEnabled
      },
      {
        queryKey: ['submission', 'user-test'],
        queryFn: getUserTestResult,
        throwOnError: false,
        refetchInterval: REFETCH_INTERVAL,
        enabled: userPollingEnabled
      }
    ],
    combine: (results) => ({
      data: results.flatMap((result) => result.data ?? []),
      isError: results.some((result) => result.isError)
    })
  })

  const testcases = useTestcaseStore((state) => state.getTestcases())
  let usertestcaseCount = 1
  let sampletestcaseCount = 1
  const testResults =
    data.length > 0
      ? testcases.map((testcase, index) => {
          const testResult = data.find((item) => item.id === testcase.id)
          if (testcase.isUserTestcase) {
            testcase.id = usertestcaseCount++
          } else {
            testcase.id = sampletestcaseCount++
          }
          return {
            id: testcase.id,
            originalId: index + 1,
            input: testcase.input,
            expectedOutput: testcase.output,
            output: testResult?.output ?? '',
            result: testResult?.result ?? '',
            isUserTestcase: testcase.isUserTestcase
          }
        })
      : []

  useEffect(() => {
    if (isError) {
      toast.error('Failed to execute some testcases. Please try again later.')
      setIsTesting(false)
      stopPolling('sample')
      stopPolling('user')
    }
  }, [isError])

  return testResults
}
