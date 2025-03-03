'use client'

import type { ProblemSubmissionResultsResponse } from '@/app/(client)/_libs/apis/assignmentSubmission'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { contestSubmissionQueries } from '@/app/(client)/_libs/queries/contestSubmission'
import { CodeEditor } from '@/components/CodeEditor'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Separator } from '@/components/shadcn/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { dateFormatter } from '@/libs/utils'
import type { ContestProblem, SubmissionResponse } from '@/types/type'
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { MdArrowForwardIos } from 'react-icons/md'

interface SubmissionDetailModalProps {
  problemId: number
  assignmentId: number
  week: number
  title: string
}
export function SubmissionDetailModal({
  problemId,
  assignmentId,
  week,
  title
}: SubmissionDetailModalProps) {
  // const problem: ContestProblem = {
  //   id: 1,
  //   title: 101, // 제목이 숫자로 되어있는데, 원래 string이어야 하는 경우 수정 필요
  //   difficulty: 'Level1', // Level 타입이 enum이라면 적절한 값으로 변경
  //   order: 1,
  //   submissionCount: 120,
  //   maxScore: 100,
  //   score: '75',
  //   submissionTime: '2025-02-27T12:00:00Z',
  //   acceptedRate: 78.5
  // }
  // const submissionId = 1
  // const contestId = 1
  // // const problemId = 1

  const { data: submissions } = useQuery(
    assignmentSubmissionQueries.submissionResults({ assignmentId, problemId })
  )

  const { data: testResults } = useQuery(
    assignmentSubmissionQueries.testResult({
      assignmentId,
      problemId,
      submissionId: submissions?.data?.[0]?.id ?? 0
    })
  )

  return (
    <DialogContent
      className="max-h-[80vh] overflow-auto p-14 sm:max-w-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 text-lg font-medium">
            <span>Assignment</span>
            <MdArrowForwardIos />
            <span className="text-primary">Week {week}</span>
            <MdArrowForwardIos />
            <span className="max-w-[200px] overflow-hidden truncate whitespace-nowrap">
              {title}
            </span>
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Grade</span>
          <span className="flex h-[30px] w-[140px] items-center justify-center rounded-full border border-blue-500 font-bold text-blue-500">
            <span className="text-lg">20</span> /{' '}
            <span className="text-lg">40</span>
          </span>
        </div>

        <span className="text-sm font-medium">Last Submission</span>
        <ScrollArea className="rounded-md">
          <div className="flex items-center justify-around gap-5 border border-gray-300 bg-gray-50 p-5 text-xs [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-3 [&_*]:whitespace-nowrap [&_p]:text-slate-400">
            <div>
              <h2>User ID</h2>
              <p>{submissions?.data[0]?.user.username}</p>
            </div>
            <Separator
              orientation="vertical"
              className="h-[60px] w-[0.5px] bg-gray-400"
            />
            <div>
              <h2>Language</h2>
              <p>{submissions?.data[0]?.language}</p>
            </div>
            <Separator
              orientation="vertical"
              className="h-[60px] w-[0.5px] bg-gray-400"
            />
            <div>
              <h2>Code Size</h2>
              <p>{submissions?.data[0]?.codeSize}</p>
            </div>
            <Separator
              orientation="vertical"
              className="h-[60px] w-[0.5px] bg-gray-400"
            />
            <div>
              <h2>Submission Time</h2>
              <p>
                {dateFormatter(
                  submissions?.data[0]?.createTime ?? '',
                  'YYYY-MM-DD HH:mm:ss'
                )}
              </p>
            </div>
            <Separator
              orientation="vertical"
              className="h-[60px] w-[0.5px] bg-gray-400"
            />
            <div>
              <h2>Result</h2>
              <p>{submissions?.data[0]?.result}</p>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Comment</span>
          <div className="flex-col rounded border p-4">
            <span className="text-xs">
              정말 수고 많았습니다. 문제들을 살펴보니 많이 틀렸네요. 이걸 저렇게
              바꾸고 저걸 이렇게 바꿔보는건 어떨까요? 수고하셨습니다.
              수고하셨습니다. 수고하셨습니다.
            </span>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-base font-medium">Source Code</h2>
          <CodeEditor
            value="{submission?.code}"
            language="C"
            readOnly
            className="max-h-96 min-h-16 w-full"
          />
        </div>
      </div>
    </DialogContent>
  )
}
