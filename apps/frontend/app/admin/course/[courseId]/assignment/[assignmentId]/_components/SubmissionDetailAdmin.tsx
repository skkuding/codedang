'use client'

import { CodeEditor } from '@/components/CodeEditor'
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn/alert'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { GET_SUBMISSION } from '@/graphql/submission/queries'
import { dateFormatter, getResultColor } from '@/libs/utils'
import type { Language } from '@/types/type'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { IoWarning } from 'react-icons/io5'

export function SubmissionDetailAdmin({
  submissionId
}: {
  submissionId: number
}) {
  const { t } = useTranslate()

  const { data, loading } = useQuery(GET_SUBMISSION, {
    variables: {
      id: Number(submissionId)
    },
    onCompleted: (data) => {
      if (data?.getSubmission?.problemId) {
        fetchTestcase({
          variables: { id: data.getSubmission.problemId }
        })
      }
    }
  })
  const submission = data?.getSubmission

  const [fetchTestcase, { data: testcaseData }] =
    useLazyQuery(GET_PROBLEM_TESTCASE)

  const { correctTestcases, wrongTestcases } = (() => {
    if (!testcaseData?.getProblem?.testcase || !submission?.testcaseResult) {
      return { correctTestcases: [], wrongTestcases: [] }
    }

    let sampleIndex = 1
    let hiddenIndex = 1

    const correct: string[] = []
    const wrong: string[] = []

    testcaseData.getProblem.testcase.forEach((testcase, index) => {
      const label = testcase.isHidden
        ? t('hidden_label', { hidden: hiddenIndex++ })
        : t('sample_label', { sample: sampleIndex++ })
      const matchingResult = submission.testcaseResult[index]

      if (matchingResult?.result === 'Accepted') {
        correct.push(label)
      } else {
        wrong.push(label)
      }
    })

    return { correctTestcases: correct, wrongTestcases: wrong }
  })()

  return (
    <ScrollArea className="mt-5 max-h-[760px] w-[1000px]">
      {!loading && (
        <div className="mx-14 flex flex-col gap-4">
          <h1 className="flex text-lg font-semibold">
            <span className="max-w-[30%] truncate text-gray-400">
              {submission?.user?.userProfile?.realName}(
              {submission?.user?.studentId})
            </span>
            <span className="max-w-[30%] truncate text-gray-400">
              &nbsp; &gt; &nbsp;{submission?.problem.title}
            </span>
            <span className="max-w-[40%] truncate">
              &nbsp; &gt; &nbsp;{t('submission_number', { submissionId })}
            </span>
          </h1>
          <h2 className="font-bold">{t('summary')}</h2>
          <ScrollArea className="max-w-full shrink-0 rounded-md">
            <div className="**:whitespace-nowrap flex items-center justify-around gap-5 bg-gray-100 p-5 text-xs [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_p]:text-slate-400">
              <div>
                <h2>{t('name')}</h2>
                <p>{submission?.user?.userProfile?.realName}</p>
              </div>
              <div>
                <h2>{t('student_id')}</h2>
                <p>{submission?.user?.studentId}</p>
              </div>
              <div>
                <h2>{t('major')}</h2>
                <p className="max-w-[20ch] truncate">
                  {submission?.user?.major}
                </p>
              </div>
              <div>
                <h2>{t('user_id')}</h2>
                <p>{submission?.user?.username}</p>
              </div>
              <div>
                <h2>{t('result')}</h2>
                <p className={getResultColor(submission?.result)}>
                  {submission?.result}
                </p>
              </div>
              <div>
                <h2>{t('language')}</h2>
                <p>{submission?.language}</p>
              </div>
              <div>
                <h2>{t('submission_time')}</h2>
                <p>
                  {dateFormatter(submission?.createTime, 'MMM DD, YYYY HH:mm')}
                </p>
              </div>
              <div>
                <h2>{t('code_size')}</h2>
                <p>{new TextEncoder().encode(submission?.code).length} B</p>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <h2 className="mt-4 font-bold">{t('testcase')}</h2>
          {submission?.testcaseResult.length !== 0 ? (
            <div className="flex flex-col gap-4">
              <table>
                <tbody className="text-sm font-light">
                  <tr>
                    <td className="w-52 py-1">{t('correct_testcase')}:</td>
                    <td className="py-1 text-slate-500">
                      {correctTestcases.length}/
                      {testcaseData?.getProblem?.testcase?.length || 0}
                    </td>
                  </tr>
                  {wrongTestcases.length > 0 && (
                    <tr>
                      <td className="w-52 py-1 align-top">
                        {t('wrong_testcase_number')}:
                      </td>
                      <td className="py-1 text-slate-500">
                        {wrongTestcases.join(', ') || t('none')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Table className="**:text-center **:text-xs **:hover:bg-transparent [&_tr]:border-neutral-200! [&_td]:p-2">
                <TableHeader>
                  <TableRow>
                    <TableHead />
                    <TableHead className="text-sm! text-black">
                      {t('result')}
                    </TableHead>
                    <TableHead className="text-sm! text-black">
                      {t('runtime')}
                    </TableHead>
                    <TableHead className="text-sm! text-black">
                      {t('memory')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-slate-400">
                  {(() => {
                    let sampleIndex = 1
                    let hiddenIndex = 1

                    return testcaseData?.getProblem?.testcase?.map(
                      (testcase, index) => {
                        const matchingResult = submission?.testcaseResult[index]

                        const label = testcase.isHidden
                          ? `Hidden #${hiddenIndex++}`
                          : `Sample #${sampleIndex++}`

                        return (
                          <TableRow key={testcase.id}>
                            <TableCell className="py-4!">{label}</TableCell>
                            <TableCell
                              className={getResultColor(matchingResult?.result)}
                            >
                              {matchingResult?.result || t('n_a')}
                            </TableCell>
                            <TableCell>
                              {matchingResult?.cpuTime || t('n_a')} ms
                            </TableCell>
                            <TableCell>
                              {matchingResult?.memoryUsage
                                ? `${(matchingResult.memoryUsage / (1024 * 1024)).toFixed(2)} MB`
                                : t('n_a')}
                            </TableCell>
                          </TableRow>
                        )
                      }
                    )
                  })()}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Alert variant="default">
              <IoWarning className="mr-2 h-4 w-4" />
              <AlertTitle>
                {t('testcase_judge_results_not_available')}
              </AlertTitle>
              <AlertDescription>{t('testcases_outdated')}</AlertDescription>
            </Alert>
          )}
          <h2 className="mt-4 font-bold">{t('source_code')}</h2>
          <CodeEditor
            value={submission?.code}
            language={submission?.language as Language}
            readOnly
            className="max-h-96 min-h-16 w-full"
          />
        </div>
      )}
    </ScrollArea>
  )
}
