'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { CodeEditor } from '@/components/CodeEditor'
import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Separator } from '@/components/shadcn/separator'
import { dateFormatter } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { MdArrowForwardIos } from 'react-icons/md'

interface SubmissionDetailModalProps {
  problemId: number
  assignment: Assignment
}
export function SubmissionDetailModal({
  problemId,
  assignment
}: SubmissionDetailModalProps) {
  const { data: assignmentProblemRecord } = useSuspenseQuery({
    ...assignmentQueries.record({
      assignmentId: assignment.id
    })
  })

  const { data: submission } = useQuery(
    assignmentSubmissionQueries.lastestSubmissionResult({
      assignmentId: assignment.id,
      problemId
    })
  )

  const { data: testResults } = useQuery(
    assignmentSubmissionQueries.testResult({
      assignmentId: assignment.id,
      problemId,
      submissionId: submission?.id ?? 0
    })
  )

  return (
    <DialogContent
      className="max-h-[80vh] overflow-auto p-14 sm:max-w-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 overflow-hidden truncate whitespace-nowrap text-lg font-medium">
            <span
              title={`Week ${assignment.week}`}
              className="max-w-[80px] truncate"
            >
              Week {assignment.week}
            </span>
            <MdArrowForwardIos />
            <span
              title={assignment.title}
              className="text-primary max-w-[200px] overflow-hidden truncate"
            >
              {assignment.title}
            </span>
            <MdArrowForwardIos />
            <span
              title={
                assignmentProblemRecord?.problems.find(
                  (problem) => problem.id === problemId
                )?.title || 'Not found'
              }
              className="max-w-[200px] overflow-hidden truncate"
            >
              {assignmentProblemRecord?.problems.find(
                (problem) => problem.id === problemId
              )?.title || 'Not found'}
            </span>
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="flex h-[30px] w-[140px] items-center justify-center gap-1 rounded-full border border-blue-500 font-bold text-blue-500">
            <span className="text-lg">
              {assignmentProblemRecord?.problems.find(
                (problem) => problem.id === problemId
              )?.problemRecord?.finalScore ?? '-'}
            </span>
            {'  /  '}
            <span className="text-lg">
              {
                assignmentProblemRecord?.problems.find(
                  (problem) => problem.id === problemId
                )?.maxScore
              }
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Comment</span>
          <div className="rounded-xs flex-col border p-4">
            <span className="text-xs">
              {assignmentProblemRecord?.problems.find(
                (problem) => problem.id === problemId
              )?.problemRecord?.comment || ''}
            </span>
          </div>
        </div>

        {submission && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Last Submission</span>
            <ScrollArea className="rounded-md">
              <div className="**:whitespace-nowrap flex items-center justify-around gap-5 rounded-lg border border-[#E6E6E6] bg-gray-50 p-5 text-xs [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-[14px] [&_p]:text-slate-400">
                <div>
                  <h2>User ID</h2>
                  <p>{submission?.user.username}</p>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-[60px] w-[0.5px] bg-[#E6E6E6]"
                />
                <div>
                  <h2>Language</h2>
                  <p>{submission?.language}</p>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-[60px] w-[0.5px] bg-[#E6E6E6]"
                />
                <div>
                  <h2>Code Size</h2>
                  <p>{submission?.codeSize} B</p>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-[60px] w-[0.5px] bg-[#E6E6E6]"
                />
                <div>
                  <h2>Submission Time</h2>
                  <p>
                    {dateFormatter(
                      submission?.createTime ?? '',
                      'MMM DD, YYYY HH:mm'
                    )}
                  </p>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
        {testResults && (
          <div className="flex flex-col gap-2">
            {testResults && (
              <div>
                <span className="text-sm font-medium">Testcase Result</span>

                {(() => {
                  const sortedResults = [...testResults.testcaseResult].sort(
                    (a, b) =>
                      Number(a.problemTestcase.isHidden) -
                      Number(b.problemTestcase.isHidden)
                  )

                  // 인덱스 관리
                  let sampleCount = 0
                  let hiddenCount = 0

                  return (
                    <table className="w-full border-collapse text-center text-sm">
                      <thead className="bg-gray-50 text-[#737373]">
                        <tr>
                          {sortedResults.map((result, index) => {
                            const isHidden = result.problemTestcase.isHidden
                            const label = isHidden
                              ? `Hidden #${++hiddenCount}`
                              : `Sample #${++sampleCount}`
                            return (
                              <th
                                key={index}
                                className="border px-4 py-2 text-xs font-normal"
                              >
                                {label}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          {sortedResults.map((result, index) => (
                            <td
                              key={result.id || index}
                              className={`border px-4 py-3 text-xs font-semibold ${
                                result.result === 'Accepted'
                                  ? 'text-blue-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {result.result === 'Accepted' ? 'P' : 'F'}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  )
                })()}
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Source Code</span>
          <CodeEditor
            value={testResults?.code ?? ''}
            language={testResults?.language ?? 'C'}
            readOnly
            className="max-h-96 min-h-16 w-full"
          />
        </div>
      </div>
    </DialogContent>
  )
}
