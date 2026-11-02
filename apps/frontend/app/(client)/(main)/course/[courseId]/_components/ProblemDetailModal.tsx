'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { CodeEditor } from '@/components/CodeEditor'
import { KatexContent } from '@/components/KatexContent'
import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { Separator } from '@/components/shadcn/separator'
import { dateFormatter } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { MdArrowForwardIos } from 'react-icons/md'

export const hasProblemComment = (comment: string | null | undefined) =>
  Boolean(comment?.trim())

interface ProblemDetailModalProps {
  problemId: number
  assignment: Assignment
}
export function ProblemDetailModal({
  problemId,
  assignment
}: ProblemDetailModalProps) {
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

  const comment = assignmentProblemRecord?.problems.find(
    (problem) => problem.id === problemId
  )?.problemRecord?.comment
  const hasComment = hasProblemComment(comment)

  return (
    (submission || hasComment) && (
      <DialogContent
        className="flex max-h-[80vh] flex-col overflow-hidden p-0 pb-[30px] pl-10 pr-5 pt-11 sm:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto overflow-x-hidden pr-4">
          <DialogHeader>
            <DialogTitle>
              <div className="text-head5_sb_24 flex items-center gap-[6px] overflow-hidden truncate whitespace-nowrap">
                <span
                  title={`Week ${assignment.week}`}
                  className="max-w-[90px] truncate"
                >
                  Week{assignment.week}
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
            <div className="flex flex-col gap-[14px]">
              <span className="text-sub2_m_18">Comment</span>
              <div className="text-body1_m_16 text-color-neutral-30 border-line rounded-lg border p-5">
                {hasComment ? (
                  <KatexContent
                    content={comment ?? ''}
                    classname="[&>:first-child]:mt-0 [&>:last-child]:mb-0"
                  />
                ) : (
                  <p>There is no comment.</p>
                )}
              </div>
            </div>
            {submission && (
              <div className="flex flex-col gap-[14px]">
                <span className="text-sub2_m_18">Last Submission</span>
                <div className="border-line bg-color-neutral-99 grid grid-cols-2 gap-4 rounded-lg border p-5 text-center sm:flex sm:items-center sm:justify-around [&>div]:flex [&>div]:min-w-0 [&>div]:flex-col [&>div]:items-center [&>div]:gap-[14px] [&_p]:break-words">
                  <div>
                    <p className="text-sub3_sb_16 text-color-neutral-60">
                      User ID
                    </p>
                    <p className="text-body1_m_16">
                      {submission?.user.username}
                    </p>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-[60px] w-[0.5px] bg-[#E6E6E6] max-sm:!hidden"
                  />
                  <div>
                    <p className="text-sub3_sb_16 text-color-neutral-60">
                      Language
                    </p>
                    <p className="text-body1_m_16">{submission?.language}</p>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-[60px] w-[0.5px] bg-[#E6E6E6] max-sm:!hidden"
                  />
                  <div>
                    <p className="text-sub3_sb_16 text-color-neutral-60">
                      Code Size
                    </p>
                    <p className="text-body1_m_16">{submission?.codeSize} B</p>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-[60px] w-[0.5px] bg-[#E6E6E6] max-sm:!hidden"
                  />
                  <div>
                    <p className="text-sub3_sb_16 text-color-neutral-60">
                      Submission Time
                    </p>
                    <p className="text-body1_m_16">
                      {dateFormatter(
                        submission?.createTime ?? '',
                        'MMM DD, YYYY HH:mm'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {testResults && (
              <div className="flex flex-col gap-[14px]">
                <span className="text-sub2_m_18">Testcase Result</span>
                <table
                  className="w-full border-separate text-center text-sm"
                  style={{ borderSpacing: 0 }}
                >
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="rounded-tl-md px-4 py-2" />
                      <th className="px-4 py-2 text-xs font-light">Memory</th>
                      <th className="px-4 py-2 text-xs font-light">Runtime</th>
                      <th className="rounded-tr-md px-4 py-2 text-xs font-light">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults?.testcaseResult.map((test, index) => (
                      <tr key={test.id} className="border-b">
                        <td
                          className={`bg-primary w-[60px] px-2 py-3 text-xs font-light text-white ${
                            index === testResults.testcaseResult.length - 1
                              ? 'rounded-bl-md'
                              : ''
                          }`}
                        >
                          {index + 1}
                        </td>

                        <td className="px-4 py-3 text-xs font-light text-gray-500">
                          {test.memoryUsage !== null
                            ? `${(test.memoryUsage / (1024 * 1024)).toFixed(2)} MB`
                            : '-'}
                        </td>

                        <td className="px-4 py-3 text-xs font-light text-gray-500">
                          {test.cpuTime !== null ? `${test.cpuTime} ms` : '-'}
                        </td>

                        <td className="px-4 py-3">
                          {test.result === 'Accepted' ? (
                            <span className="rounded-full border border-blue-500 px-2 py-1 text-xs font-light text-blue-500">
                              {test.result}
                            </span>
                          ) : (
                            <span className="rounded-full border border-gray-400 px-2 py-1 text-xs font-light text-gray-400">
                              {test.result}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {submission && (
              <div className="flex flex-col gap-[14px]">
                <span className="text-sub2_m_18">Source Code</span>
                <CodeEditor
                  value={testResults?.code ?? ''}
                  language={testResults?.language ?? 'C'}
                  readOnly
                  className="max-h-96 min-h-16 w-full"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    )
  )
}
