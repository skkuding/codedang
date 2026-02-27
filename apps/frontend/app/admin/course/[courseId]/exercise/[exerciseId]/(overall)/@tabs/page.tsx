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
import { useQuery } from '@apollo/client'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { ErrorBoundary } from '@suspensive/react'
import { useState, use } from 'react'
import { FaEye } from 'react-icons/fa'

interface InformationProps {
  params: Promise<{ courseId: string; exerciseId: string }>
}

export default function Information(props: InformationProps) {
  const params = use(props.params)
  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: Number(params.courseId),
      assignmentId: Number(params.exerciseId)
    }
  }).data?.getAssignment

  const problemsData =
    useQuery(GET_ASSIGNMENT_PROBLEMS, {
      variables: {
        groupId: Number(params.courseId),
        assignmentId: Number(params.exerciseId)
      }
    }).data?.getAssignmentProblems || []

  const [problemsOpen, setProblemsOpen] = useState(false)

  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
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
              className="rounded-xs flex h-7 w-7 items-center justify-center transition hover:bg-transparent"
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
                    <TableHead className="text-body4_r_14 w-12 bg-gray-50 text-center text-gray-500">
                      Order
                    </TableHead>
                    <TableHead className="text-body4_r_14 bg-gray-50 text-left text-gray-500">
                      Title
                    </TableHead>
                    <TableHead className="text-body4_r_14 w-40 bg-gray-50 text-center text-gray-500">
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
                      <TableCell className="text-body4_r_14 text-center font-mono text-gray-900">
                        {String.fromCharCode(65 + idx)}
                      </TableCell>
                      <TableCell className="text-body4_r_14 text-left text-gray-900">
                        {problem.problem.title}
                      </TableCell>
                      <TableCell className="text-center">
                        <FaEye className="inline text-gray-400" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <Separator className="my-2 h-px bg-[#E5E5E5]" />

        <div className="flex flex-col gap-2">
          <span className="text-left text-[16px] font-bold leading-[1.4] tracking-[-3%] text-black">
            Exercise Setting
          </span>
          <div className="flex w-full flex-col gap-4 rounded-[12px] bg-white p-6">
            <div className="flex items-center gap-4">
              <span className="text-sub3_sb_16">
                Reveal Hidden Testcase Result
              </span>
              <span
                className={`rounded-[12px] px-4 py-1 text-xs font-bold text-white ${assignmentData?.isJudgeResultVisible ? 'bg-primary' : 'bg-gray-300'}`}
              >
                {assignmentData?.isJudgeResultVisible ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sub3_sb_16">Enable Copy/Paste</span>
              <span
                className={`rounded-[12px] px-4 py-1 text-xs font-bold text-white ${assignmentData?.enableCopyPaste ? 'bg-primary' : 'bg-gray-300'}`}
              >
                {assignmentData?.enableCopyPaste ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
