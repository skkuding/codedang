'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { useQuery, useSuspenseQuery } from '@apollo/client'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useState } from 'react'
import { FaEye } from 'react-icons/fa'
import { ParticipantTableFallback } from '../../../../_components/ParticipantTable'

interface InformationProps {
  params: { courseId: string; assignmentId: string }
}

export default function Information({ params }: InformationProps) {
  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: Number(params.courseId),
      assignmentId: Number(params.assignmentId)
    }
  }).data?.getAssignment

  const problemsData =
    useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
      variables: {
        groupId: Number(params.courseId),
        assignmentId: Number(params.assignmentId)
      }
    }).data?.getAssignmentProblems || []

  const [problemsOpen, setProblemsOpen] = useState(false)

  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<ParticipantTableFallback />}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="font-bold">Description</span>
            <KatexContent
              content={assignmentData?.description}
              classname="mb-4 w-full max-w-full rounded-2xl border-y-gray-300 bg-white p-6"
            />
          </div>

          <Separator className="my-2 h-px bg-[#E5E5E5]" />

          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="font-bold">Included Problem</span>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-sm transition hover:bg-transparent"
                onClick={() => setProblemsOpen((prev) => !prev)}
              >
                <ChevronDownIcon
                  className={`h-5 w-5 transition-transform ${problemsOpen ? '-rotate-180' : ''}`}
                />
              </button>
            </div>
            {problemsOpen && (
              <div className="w-full rounded-b-[12px] bg-white">
                <Table className="overflow-hidden rounded-xl border border-gray-200">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="w-12 bg-gray-50 text-center text-sm font-normal text-gray-500">
                        Order
                      </TableHead>
                      <TableHead className="bg-gray-50 text-left text-sm font-normal text-gray-500">
                        Title
                      </TableHead>
                      <TableHead className="w-20 bg-gray-50 text-center text-sm font-normal text-gray-500">
                        Score
                      </TableHead>
                      <TableHead className="w-20 bg-gray-50 text-center text-sm font-normal text-gray-500">
                        Solution
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problemsData.map((problem, idx) => (
                      <TableRow
                        key={problem.problemId}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        <TableCell className="text-center font-mono text-sm text-gray-900">
                          {String.fromCharCode(65 + idx)}
                        </TableCell>
                        <TableCell className="text-left text-sm text-gray-900">
                          {problem.problem.title}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-900">
                          {problem.score}
                        </TableCell>
                        <TableCell className="text-center">
                          {problem.solutionReleaseTime &&
                            new Date(problem.solutionReleaseTime) <=
                              new Date() && (
                              <FaEye className="inline text-gray-400" />
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="rounded-bl-xl bg-gray-50 text-right text-sm font-semibold text-gray-700"
                      >
                        Total
                      </TableCell>
                      <TableCell className="text-primary bg-gray-50 text-center text-sm font-semibold">
                        {problemsData.reduce(
                          (acc, cur) => acc + (cur.score || 0),
                          0
                        )}
                      </TableCell>
                      <TableCell className="rounded-br-xl bg-gray-50" />
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <Separator className="my-2 h-px bg-[#E5E5E5]" />

          <div className="flex flex-col gap-2">
            <span className="text-left text-[16px] font-bold leading-[1.4] tracking-[-3%] text-black">
              Assignment Setting
            </span>
            <div className="flex w-full flex-col gap-4 rounded-[12px] bg-white p-6">
              <div className="flex items-center gap-4">
                <span className="text-[16px] font-semibold">
                  Reveal Hidden Testcase Result
                </span>
                <span
                  className={`rounded-[12px] px-4 py-1 text-xs font-bold text-white ${assignmentData?.isJudgeResultVisible ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  {assignmentData?.isJudgeResultVisible ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[16px] font-semibold">
                  Enable Copy/Paste
                </span>
                <span
                  className={`rounded-[12px] px-4 py-1 text-xs font-bold text-white ${assignmentData?.enableCopyPaste ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  {assignmentData?.enableCopyPaste ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
