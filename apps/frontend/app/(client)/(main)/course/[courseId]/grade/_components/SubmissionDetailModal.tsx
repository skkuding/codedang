'use client'

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
import type { AssignmentGrade } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import { MdArrowForwardIos } from 'react-icons/md'

interface SubmissionDetailModalProps {
  problemId: number
  gradedAssignment: AssignmentGrade
  showEvaluation: boolean
}
export function SubmissionDetailModal({
  problemId,
  gradedAssignment,
  showEvaluation
}: SubmissionDetailModalProps) {
  const { data: submission } = useQuery(
    assignmentSubmissionQueries.lastestSubmissionResult({
      assignmentId: gradedAssignment.id,
      problemId
    })
  )

  const { data: testResults } = useQuery(
    assignmentSubmissionQueries.testResult({
      assignmentId: gradedAssignment.id,
      problemId,
      submissionId: submission?.id ?? 0
    })
  )
  const getResultStyle = (result: string) => {
    if (result === 'Accepted') {
      return 'rounded-full border border-blue-500 px-2 py-1 text-xs font-light text-blue-500'
    }
    if (result === 'Blind') {
      return 'rounded-full border border-purple-500 px-2 py-1 text-xs font-light text-purple-500'
    }
    return 'rounded-full border border-gray-400 px-2 py-1 text-xs font-light text-gray-400'
  }

  const result = submission?.result
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
                title={`Week ${gradedAssignment.week}`}
                className="max-w-[80px] truncate"
              >
                Week {gradedAssignment.week}
              </span>
              <MdArrowForwardIos />
              <span
                title={gradedAssignment.title}
                className="text-primary max-w-[200px] overflow-hidden truncate"
              >
                {gradedAssignment.title}
              </span>
              <MdArrowForwardIos />
              <span
                title={
                  gradedAssignment.problems.find(
                    (problem) => problem.id === problemId
                  )?.title || 'Not found'
                }
                className="max-w-[200px] overflow-hidden truncate"
              >
                {gradedAssignment.problems.find(
                  (problem) => problem.id === problemId
                )?.title || 'Not found'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          {showEvaluation && (
            <div className="flex flex-col gap-2">
              <span className="flex h-[30px] w-[140px] items-center justify-center rounded-full border border-blue-500 font-bold text-blue-500">
                <span className="text-lg">
                  {gradedAssignment.problems.find(
                    (problem) => problem.id === problemId
                  )?.problemRecord?.finalScore ??
                    gradedAssignment.problems.find(
                      (problem) => problem.id === problemId
                    )?.problemRecord?.score}
                </span>
                {'  /  '}
                <span className="text-lg">
                  {
                    gradedAssignment.problems.find(
                      (problem) => problem.id === problemId
                    )?.maxScore
                  }
                </span>
              </span>
            </div>
          )}

          {submission && (
            <div>
              <span className="text-sm font-medium">Last Submission</span>
              <ScrollArea className="rounded-md">
                <div className="flex items-center justify-around gap-5 rounded-lg border border-[#E6E6E6] bg-gray-50 p-5 text-xs [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-3 [&_*]:whitespace-nowrap [&_p]:text-slate-400">
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
                        'YYYY-MM-DD HH:mm:ss'
                      )}
                    </p>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-[60px] w-[0.5px] bg-[#E6E6E6]"
                  />
                  <div>
                    <h2>Result</h2>
                    <span className={getResultStyle(result ?? '')}>
                      {result}
                    </span>
                  </div>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
          {testResults && (
            <div>
              <span className="text-sm font-medium">Testcase</span>
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
          {showEvaluation && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Comment</span>
              <div className="flex-col rounded border p-4">
                <span className="text-xs">
                  {gradedAssignment.problems.find(
                    (problem) => problem.id === problemId
                  )?.problemRecord?.comment || ''}
                </span>
              </div>
            </div>
          )}
          <div>
            <h2 className="mb-3 text-base font-medium">Source Code</h2>
            <CodeEditor
              value={testResults?.code || ''}
              language="C"
              readOnly
              className="max-h-96 min-h-16 w-full"
            />
          </div>
        </div>
      </DialogContent>
    )
  )
}
