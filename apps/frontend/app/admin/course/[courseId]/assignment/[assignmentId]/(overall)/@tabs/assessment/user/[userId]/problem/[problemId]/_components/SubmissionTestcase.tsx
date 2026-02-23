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
import { getResultColor } from '@/libs/utils'
import { useTestcaseStore } from '@/stores/testcaseStore'
import { useSuspenseQuery } from '@apollo/client'
import { ResultStatus, type TestCaseResult } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function SubmissionTestcaseError() {
  const { t } = useTranslate()
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      {t('unable_to_load_testcase_data')}
    </div>
  )
}

export function SubmissionTestcase() {
  const { t } = useTranslate()
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
      <h2 className="text-lg font-bold">{t('testcase_header')}</h2>
      <Table className="**:text-center **:text-sm **:hover:bg-transparent [&_td]:p-2 [&_tr]:border-slate-600">
        <TableHeader className="**:text-slate-100">
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>{t('result_header')}</TableHead>
            <TableHead>{t('runtime_header')}</TableHead>
            <TableHead>{t('memory_header')}</TableHead>
            <TableHead>{t('score_weight_header')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testResults
            .sort((a, b) => Number(a.isHidden) - Number(b.isHidden))
            .map((item) => {
              const caseLabel = item.isHidden
                ? t('hidden_label', { hidden: item.order })
                : t('sample_label', { sample: item.order })
              return (
                <TableRow
                  className="cursor-pointer text-[#9B9B9B] hover:bg-slate-800"
                  key={item.problemTestcaseId}
                  onClick={() => {
                    handleTestcaseSelect(
                      item.order,
                      item.isHidden,
                      item.problemTestcaseId
                    )
                    console.log(item.order, item.isHidden)
                  }}
                >
                  <TableCell>
                    <div className="py-2">{caseLabel}</div>
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
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
        <TableFooter className="bg-transparent">
          <TableRow>
            <TableCell>
              {(() => {
                const totalTestcases = testResults.length
                const correctTestcases = testResults.filter(
                  (item) => item.result === ResultStatus.Accepted
                ).length
                return `${correctTestcases}/${totalTestcases}`
              })()}
            </TableCell>
            <TableCell colSpan={3} />
            <TableCell>
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
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
