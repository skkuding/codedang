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

  return (
    submission && (
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
              <span className="text-sm font-medium">Testcase Result</span>
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
  )
}
