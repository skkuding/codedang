import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Skeleton } from '@/components/shadcn/skeleton'
import { GET_TESTCASE } from '@/graphql/problem/queries'
import { cn } from '@/libs/utils'
import { useTestcaseStore } from '@/stores/testcaseStore'
import { useSuspenseQuery } from '@apollo/client'
import { ResultStatus, type TestCaseResult } from '@generated/graphql'
import React, { Suspense, useMemo } from 'react'
import { WhitespaceVisualizer } from './WhitespaceVisualizer'

interface TestcasePanelProps {
  testResults: (Omit<TestCaseResult, 'problemTestcase'> & {
    expectedOutput: string
    order: number
    input: string
  })[]
  isTesting?: boolean
}

export function TestcasePanel({
  testResults,
  isTesting = false
}: TestcasePanelProps) {
  const { order, setSelectedTestcase, isHidden, isTestResult } =
    useTestcaseStore()

  const displayTestResults = useMemo(() => {
    if (isTesting) {
      return testResults.map((result) => ({
        ...result,
        output: '',
        result: ResultStatus.Judging
      }))
    }
    return testResults
  }, [isTesting, testResults])

  const acceptedTestcases = displayTestResults
    .filter((t) => t.result === 'Accepted')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  const notAcceptedTestcases = displayTestResults
    .filter((t) => t.result !== 'Accepted')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div className="flex h-full flex-col bg-[#121728]">
      {isTestResult && (
        <div className="border-b border-[#222939] p-4">
          <table className="min-w-full">
            <tbody>
              <tr>
                <td className="w-20 py-1 align-top text-slate-400">Correct:</td>
                <td className="py-1 text-white">
                  <div className="max-h-20 overflow-y-auto">
                    {acceptedTestcases.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {acceptedTestcases.map((tc) => (
                          <span
                            key={tc.id}
                            onClick={() => {
                              setSelectedTestcase(
                                tc.order ?? 0,
                                tc.isHidden,
                                tc.id
                              )
                            }}
                            className={cn(
                              'cursor-pointer rounded px-1 hover:bg-slate-700',
                              order === tc.order &&
                                tc.isHidden === isHidden &&
                                'bg-primary text-white'
                            )}
                          >
                            #{tc.isHidden ? 'H' : 'S'}
                            {tc.order ?? 0}
                          </span>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="w-20 py-1 align-top text-slate-400">Wrong:</td>
                <td className="py-1 text-white">
                  <div className="max-h-20 overflow-y-auto">
                    {notAcceptedTestcases.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {notAcceptedTestcases.map((tc) => (
                          <span
                            key={tc.id}
                            onClick={() => {
                              setSelectedTestcase(
                                tc.order ?? 0,
                                tc.isHidden,
                                tc.id
                              )
                            }}
                            className={cn(
                              'cursor-pointer rounded px-1 hover:bg-slate-700',
                              order === tc.order &&
                                tc.isHidden === isHidden &&
                                'bg-primary text-white'
                            )}
                          >
                            #{tc.isHidden ? 'H' : 'S'}
                            {tc.order ?? 0}
                          </span>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="flex-1 overflow-hidden p-1">
        <ScrollArea className="h-full">
          <table className="min-w-full rounded-t-md">
            <thead className="bg-[#121728] [&_tr]:border-b-slate-600">
              <tr className="text-base hover:bg-slate-900/60">
                <th className="w-[25%] p-3 text-left">Input</th>
                <th className="w-[25%] p-3 text-left">Expected Output</th>
                <th className="w-[25%] p-3 text-left">Output</th>
              </tr>
            </thead>
            <Suspense
              fallback={
                <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
              }
            >
              <TestcaseResult displayTestResults={displayTestResults} />
            </Suspense>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}

interface TestcaseResultProps {
  displayTestResults: (Omit<TestCaseResult, 'problemTestcase'> & {
    expectedOutput: string
    order: number
    input: string
  })[]
}

function TestcaseResult({ displayTestResults }: TestcaseResultProps) {
  const { testcaseId, order, isHidden } = useTestcaseStore()

  const { data: testcaseResponse } = useSuspenseQuery(GET_TESTCASE, {
    variables: {
      testcaseId: Number(testcaseId)
    },
    skip: !testcaseId || testcaseId === 0 // testcaseId가 0이면 skip
  })
  const testcaseData = testcaseResponse?.getTestcase
  const selectedTestResult = displayTestResults.find(
    (tr) => tr.order === order && tr.isHidden === isHidden
  )
  return (
    <tbody>
      <tr className="cursor-pointer text-left hover:bg-slate-700">
        <td className="max-w-96 truncate p-3 align-top">
          <WhitespaceVisualizer text={testcaseData?.input ?? ''} />
        </td>
        <td className="max-w-96 truncate p-3 align-top">
          <WhitespaceVisualizer text={testcaseData?.output ?? ''} />
        </td>
        <td className="max-w-96 truncate p-3 align-top">
          <WhitespaceVisualizer text={selectedTestResult?.output ?? ''} />
        </td>
      </tr>
    </tbody>
  )
}
