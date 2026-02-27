import { safeFetcherWithAuth } from '@/libs/utils'
import type { TestResult } from '@/types/type'
import { useQueries } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useShallow } from 'zustand/shallow'
import { useTestPollingStore } from '../context/TestPollingStoreProvider'
import { useTestcaseStore } from '../context/TestcaseStoreProvider'

const MAX_ATTEMPTS = 10
const REFETCH_INTERVAL = 2000

const useGetTestResult = (type: 'non-user' | 'user') => {
  const { t } = useTranslate()
  const attempts = useRef(0)
  const setIsTesting = useTestPollingStore((state) => state.setIsTesting)
  const stopPolling = useTestPollingStore((state) => state.stopPolling)

  const baseUrl =
    type === 'non-user' ? 'submission/test' : 'submission/user-test'

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
      attempts.current = 0
      setIsTesting(false)
      stopPolling(type)
    } else if (attempts.current < MAX_ATTEMPTS) {
      // Retry
      attempts.current += 1
    } else {
      // No more retry
      attempts.current = 0
      setIsTesting(false)
      stopPolling(type)
      toast.error(t('judging_took_long'))
    }

    return results
  }

  return getTestResult
}

export const useTestResults = () => {
  const { t } = useTranslate()
  const getNonUserTestResult = useGetTestResult('non-user')
  const getUserTestResult = useGetTestResult('user')
  const {
    nonUserPollingEnabled,
    userPollingEnabled,
    setIsTesting,
    stopPolling
  } = useTestPollingStore((state) => state)
  const [getTestcases] = useTestcaseStore(
    useShallow((state) => [state.getTestcases])
  )
  const testcases = getTestcases()

  const { data, isError } = useQueries({
    queries: [
      {
        queryKey: ['submission', 'test'],
        queryFn: getNonUserTestResult,
        throwOnError: false,
        refetchInterval: REFETCH_INTERVAL,
        enabled: nonUserPollingEnabled
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

  let userTestcaseCount = 1
  let sampleTestcaseCount = 1
  let hiddenTestcaseCount = 1
  const testResults =
    data.length > 0
      ? testcases.map((testcase, index) => {
          const testResult = data.find((item) => item.id === testcase.id)
          let type: 'user' | 'sample' | 'hidden' = 'sample'
          if (testcase.isUserTestcase) {
            testcase.id = userTestcaseCount++
            type = 'user'
          } else if (testcase.isHidden === true) {
            testcase.id = hiddenTestcaseCount++
            type = 'hidden'
          } else {
            testcase.id = sampleTestcaseCount++
            type = 'sample'
          }
          return {
            id: testcase.id,
            originalId: index + 1,
            input: testcase.input,
            expectedOutput: testcase.output,
            output: testResult?.output ?? '',
            result: testResult?.result ?? '',
            type
          }
        })
      : []

  // type에 따라 testResults 정렬 hidden - sample - user 순으로
  const PRIOR_TESTCASE = {
    hidden: 0,
    sample: 1,
    user: 2
  }

  testResults.sort((a, b) => PRIOR_TESTCASE[a.type] - PRIOR_TESTCASE[b.type])

  useEffect(() => {
    if (isError) {
      toast.error(t('failed_testcases_execution'))
      setIsTesting(false)
      stopPolling('non-user')
      stopPolling('user')
    }
  }, [isError, t])

  return testResults
}
