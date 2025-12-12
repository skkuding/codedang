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
import { cn, dateFormatter } from '@/libs/utils'
import type { Language } from '@/types/type'
import { useLazyQuery, useQuery } from '@apollo/client'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { IoWarning } from 'react-icons/io5'

export function SubmissionDetailAdmin({
  submissionId
}: {
  submissionId: number
}) {
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
        ? `Hidden #${hiddenIndex++}`
        : `Sample #${sampleIndex++}`
      const matchingResult = submission.testcaseResult[index]

      if (matchingResult?.result === 'Accepted') {
        correct.push(label)
      } else {
        wrong.push(label)
      }
    })

    return { correctTestcases: correct, wrongTestcases: wrong }
  })()

  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  return (
    <ScrollArea className="mt-5 max-h-[545px] w-[976px]">
      {!loading && (
        <div className="mx-[70px] flex flex-col gap-6">
          <h1 className="flex text-lg font-semibold">
            <span className="max-w-[30%] truncate">
              {submission?.user?.userProfile?.realName}(
              {submission?.user?.username})&nbsp; &gt; &nbsp;
            </span>
            <span className="text-primary max-w-[30%] truncate">
              {submission?.problem.title}
            </span>
          </h1>
          <ScrollArea className="mt-4 max-w-full shrink-0 rounded-md">
            <div className="**:whitespace-nowrap flex items-center justify-around gap-5 bg-gray-100 p-7 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_p]:text-slate-400">
              <div>
                <h2 className="mb-[14px]">User ID</h2>
                <p>{submission?.user?.username}</p>
              </div>
              <div className="h-14 border-l border-neutral-200" />
              <div>
                <h2 className="mb-[14px]">Language</h2>
                <p>{submission?.language}</p>
              </div>
              <div className="h-14 border-l border-neutral-200" />
              <div>
                <h2 className="mb-[14px]">Submission Time</h2>
                <p>
                  {dateFormatter(submission?.createTime, 'YYYY-MM-DD HH:mm:ss')}
                </p>
              </div>
              <div className="h-14 border-l border-neutral-200" />
              <div>
                <h2 className="mb-[14px]">Code Size</h2>
                <p>{new TextEncoder().encode(submission?.code).length} B</p>
              </div>
              <div className="h-14 border-l border-neutral-200" />
              <div>
                <span
                  className={cn(
                    'flex h-[38px] w-36 items-center justify-center rounded-full text-base font-semibold',
                    submission?.result === 'Accepted'
                      ? 'border-primary text-primary border-2'
                      : 'border-flowkit-red text-flowkit-red border-2'
                  )}
                >
                  {submission?.result}
                </span>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <h2 className="mt-4 font-bold">Testcase</h2>
          {submission?.testcaseResult.length !== 0 ? (
            <div className="flex flex-col gap-4">
              <table>
                <tbody className="text-sm font-light">
                  <tr>
                    <td className="w-52 py-1">Correct Testcase:</td>
                    <td className="py-1 text-slate-500">
                      {correctTestcases.length}/
                      {testcaseData?.getProblem?.testcase?.length || 0}
                    </td>
                  </tr>
                  {wrongTestcases.length > 0 && (
                    <tr>
                      <td className="w-52 py-1 align-top">
                        Wrong Testcase Number:
                      </td>
                      <td className="py-1 text-slate-500">
                        {wrongTestcases.join(', ') || 'None'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <Table className="**:text-center **:text-sm [&_tr]:border-neutral-200! table-fixed rounded-lg [&_td]:p-2 [&_th]:text-white">
                <TableHeader>
                  <TableRow className="bg-[#619cfb] hover:bg-[#619cfb] dark:hover:bg-[#619cfb]">
                    <TableHead className="w-32 px-2" />
                    <TableHead className="w-44 px-2 font-semibold">
                      Result
                    </TableHead>
                    <TableHead className="w-32 px-2 font-semibold">
                      Input
                    </TableHead>
                    <TableHead className="w-32 px-2 font-semibold">
                      Expected Output
                    </TableHead>
                    <TableHead className="w-32 px-2 font-semibold">
                      Output
                    </TableHead>
                    <TableHead className="w-24 px-2 font-semibold">
                      Memory
                    </TableHead>
                    <TableHead className="w-10 px-2 font-semibold" />
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
                        const isExpanded = expandedRow === index

                        return (
                          <>
                            <TableRow key={testcase.id}>
                              <TableCell className="py-4! border-y-[#619cfb] bg-[#619cfb] font-semibold text-white">
                                {label}
                              </TableCell>
                              <TableCell className="flex items-center justify-center">
                                <span
                                  className={cn(
                                    'flex h-[38px] w-36 items-center justify-center rounded-full text-base font-semibold',
                                    submission?.result === 'Accepted'
                                      ? 'border-primary text-primary border-2'
                                      : 'border-flowkit-red text-flowkit-red border-2'
                                  )}
                                >
                                  {submission?.result}
                                </span>
                              </TableCell>
                              <TableCell className="max-w-24 truncate">
                                {testcase.input}
                              </TableCell>
                              <TableCell className="max-w-24 truncate">
                                {testcase.output}
                              </TableCell>
                              <TableCell className="max-w-24 truncate">
                                {matchingResult?.output || '-'}
                              </TableCell>
                              <TableCell>
                                {matchingResult?.memoryUsage
                                  ? `${(matchingResult.memoryUsage / (1024 * 1024)).toFixed(2)} MB`
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <button
                                  onClick={() =>
                                    setExpandedRow(isExpanded ? null : index)
                                  }
                                  className="p-1"
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </button>
                              </TableCell>
                            </TableRow>

                            {isExpanded && (
                              <TableRow
                                key={testcase.id}
                                className="bg-neutral-100 hover:bg-neutral-100"
                              >
                                <TableCell className="py-4! border-y-[#619cfb] bg-[#619cfb] text-white" />
                                <TableCell colSpan={6}>
                                  <div className="flex items-center justify-center">
                                    <div className="px-5 py-[10px]">
                                      <div className="flex gap-4">
                                        <div className="flex h-8 w-[200px] items-center justify-center rounded-full border border-neutral-400 bg-white text-neutral-700">
                                          Input
                                        </div>
                                        <div className="flex h-8 w-[200px] items-center justify-center rounded-full border border-neutral-400 bg-white text-neutral-700">
                                          Expected Output
                                        </div>
                                        <div className="flex h-8 w-[200px] items-center justify-center rounded-full border border-neutral-400 bg-white text-neutral-700">
                                          Output
                                        </div>
                                      </div>
                                      <div className="mt-3 flex gap-4 font-mono text-neutral-500">
                                        <div className="flex w-[200px] items-center rounded-xl border border-neutral-400 bg-white px-5 py-[10px]">
                                          {testcase.input}
                                        </div>
                                        <div className="flex w-[200px] items-center rounded-xl border border-neutral-400 bg-white px-5 py-[10px]">
                                          {testcase.output}
                                        </div>
                                        <div className="flex w-[200px] items-center rounded-xl border border-neutral-400 bg-white px-5 py-[10px]">
                                          {matchingResult?.output || '-'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
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
              <AlertTitle>Testcase Judge Results Not Available</AlertTitle>
              <AlertDescription>
                The testcases have been recently updated and are now outdated.
              </AlertDescription>
            </Alert>
          )}
          <h2 className="mt-4 font-bold">Source Code</h2>
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
