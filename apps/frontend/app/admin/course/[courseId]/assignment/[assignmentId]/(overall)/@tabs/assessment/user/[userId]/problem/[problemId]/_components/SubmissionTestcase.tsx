'use client'

import { mapTestResults } from '@/app/admin/_components/code-editor/libs/util'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/shadcn/table'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { cn, getResultColor } from '@/libs/utils'
import { useTestcaseStore } from '@/stores/testcaseStore'
import { useSuspenseQuery } from '@apollo/client'
import { ResultStatus, type TestCaseResult } from '@generated/graphql'
import { ChevronRight } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SubmissionTestcaseError() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      Unable to load testcase data for this problem.
    </div>
  )
}

export function SubmissionTestcase() {
  const params = useParams<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>()
  const { courseId, assignmentId, userId, problemId } = params
  const { setSelectedTestcase, setIsTestResult } = useTestcaseStore()

  const handleTestcaseSelect = (
    order: number,
    isHidden: boolean,
    id: number
  ) => {
    setSelectedTestcase(order, isHidden, id)
    setIsTestResult(false)
  }

  const [testResults, setTestResults] = useState<
    (Omit<TestCaseResult, 'problemTestcase'> & {
      expectedOutput: string
      order: number
      input: string
    })[]
  >([])
  const submission = useSuspenseQuery(GET_ASSIGNMENT_LATEST_SUBMISSION, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId),
      userId: Number(userId),
      problemId: Number(problemId)
    }
  }).data.getAssignmentLatestSubmission

  const testcase = useSuspenseQuery(GET_PROBLEM_TESTCASE, {
    variables: {
      id: Number(problemId)
    }
  }).data.getProblem.testcase

  useEffect(() => {
    if (submission && testcase) {
      const mappedResults = mapTestResults(testcase, submission.testcaseResult)
      setTestResults(mappedResults)
    }
  }, [submission, testcase])

  return (
    <div>
      <h2 className="mb-5 text-xl font-semibold">Testcase</h2>
      <Table className="**:border-separate **:border-spacing-0 **:text-center **:font-normal [&_td]:p-0 [&_td]:text-xs">
        <TableHeader className="**:text-slate-100 **:text-sm **:h-[33px] **:bg-editor-fill-1]">
          <TableRow>
            <TableHead className="rounded-l-sm pl-3">#</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Runtime</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead className="rounded-r-sm pr-6">ScoreWeight</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="h-1 border-none" colSpan={5} />
          </TableRow>
        </TableBody>
        <TableBody>
          {testResults
            .sort((a, b) => Number(a.isHidden) - Number(b.isHidden))
            .map((item, index, array) => {
              const caseLabel = item.isHidden
                ? `Hidden #${item.order}`
                : `Sample #${item.order}`
              return (
                <TableRow
                  className={cn(
                    '[&_td]:border-b-1 [&_td]:border-editor-line-2 h-10 cursor-pointer',
                    index === array.length - 1 && '[&_td]:border-none'
                  )}
                  key={item.problemTestcaseId}
                  onClick={() => {
                    handleTestcaseSelect(
                      item.order,
                      item.isHidden,
                      item.problemTestcaseId
                    )
                  }}
                >
                  <TableCell className="rounded-l-sm">
                    <div className="pl-3">{caseLabel}</div>
                  </TableCell>
                  <TableCell className={getResultColor(item.result)}>
                    {item.result}
                  </TableCell>
                  <TableCell>
                    {item.cpuTime ? `${item.cpuTime} ms` : '-'}
                  </TableCell>
                  <TableCell>
                    {item.memoryUsage
                      ? `${(item.memoryUsage / (1024 * 1024)).toFixed(2)} MB`
                      : '-'}
                  </TableCell>
                  <TableCell className="rounded-r-sm">
                    <div className="flex pr-3">
                      <div className="m-auto">
                        {(() => {
                          if (
                            item.scoreWeightNumerator &&
                            item.scoreWeightDenominator
                          ) {
                            const percentage =
                              (item.scoreWeightNumerator /
                                item.scoreWeightDenominator) *
                              100
                            return `${percentage.toFixed(2)}%`
                          }
                          return '-'
                        })()}
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
        <TableBody>
          <TableRow>
            <TableCell className="h-1 border-none" colSpan={5} />
          </TableRow>
        </TableBody>
        <TableFooter className="bg-editor-fill-1 h-[34px] [&_td]:border-none">
          <TableRow>
            <TableCell className="rounded-l-sm">
              <div className="pl-3">
                {(() => {
                  const totalTestcases = testResults.length
                  const correctTestcases = testResults.filter(
                    (item) => item.result === ResultStatus.Accepted
                  ).length
                  return `${correctTestcases}/${totalTestcases}`
                })()}
              </div>
            </TableCell>
            <TableCell colSpan={3} />
            <TableCell className="rounded-r-sm">
              <div className="pr-6">
                {(() => {
                  const totalPercentage = testResults.reduce((sum, item) => {
                    if (
                      item.scoreWeightNumerator &&
                      item.scoreWeightDenominator
                    ) {
                      const percentage =
                        (item.scoreWeightNumerator /
                          item.scoreWeightDenominator) *
                        100
                      return sum + percentage
                    }
                    return sum
                  }, 0)
                  return `${totalPercentage.toFixed(2)}%`
                })()}
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
