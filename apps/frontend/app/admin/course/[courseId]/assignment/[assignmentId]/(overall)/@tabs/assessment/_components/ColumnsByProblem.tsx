'use client'

import type { ProblemData } from '@/app/admin/contest/_libs/schemas'
import { cn, getResultColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'
import { CommentCell } from './CommentCell'

interface DataTableScoreSummary {
  id: number
  studentId: string
  realName?: string | null
  username: string
  submittedProblemCount: number
  totalProblemCount: number
  userAssignmentScore: number
  assignmentPerfectScore: number
  userAssignmentFinalScore?: number | null | undefined
  scoreSummaryByProblem: {
    problemId: number
    score: number
    maxScore: number
  }[]
  testcaseResults?: { id: number; isHidden: boolean; result: string }[]
}

function TestcaseCell({
  results
}: {
  results: { id: number; isHidden: boolean; result: string }[]
}) {
  const samples = results.filter((r) => !r.isHidden)
  const hiddens = results.filter((r) => r.isHidden)

  const ordered = [...samples, ...hiddens]
  let sampleIdx = 0
  let hiddenIdx = 0

  return (
    <div className="whitespace-nowrap">
      {ordered.length === 0 ? (
        <span className="text-xs text-gray-400">No testcases</span>
      ) : (
        ordered.map((r, i) => {
          const isPass = r.result === 'Accepted'
          const title = r.isHidden
            ? `Hidden #${++hiddenIdx}`
            : `Sample #${++sampleIdx}`

          return (
            <span
              key={i}
              className={cn(
                'inline-block select-none py-1 font-mono text-sm',
                isPass ? getResultColor('Accepted') : getResultColor('Wrong')
              )}
              title={title}
            >
              {isPass ? 'O' : 'X'}
            </span>
          )
        })
      )}
    </div>
  )
}

export const createColumns = (
  problemData: ProblemData[],
  selectedProblemId: number | null,
  courseId: number,
  assignmentId: number,
  groupId: number,
  isAssignmentFinished: boolean
): ColumnDef<DataTableScoreSummary>[] => {
  return [
    {
      accessorKey: 'studentId',
      header: () => <p className="font-mono text-xs">Student ID</p>,
      cell: ({ row }) => (
        <div className="text-center text-xs font-medium">
          {row.getValue('studentId')}
        </div>
      )
    },
    {
      id: 'testcases',
      header: () => <p className="text-center font-mono text-xs">Testcase</p>,
      cell: ({ row, table }) => {
        const isFirstRow = table.getRowModel().rows[0].id === row.id
        const results = row.original.testcaseResults ?? []

        return (
          <div className="relative mx-auto w-full max-w-[600px] min-[1600px]:max-w-[750px] min-[1800px]:max-w-[900px] min-[2100px]:max-w-[1100px]">
            {isFirstRow && (
              <div
                className="line-scrollbar absolute left-0 right-0 top-[-10px] z-10 h-3 overflow-x-auto overflow-y-hidden"
                onScroll={(e) => {
                  const left = e.currentTarget.scrollLeft
                  document
                    .querySelectorAll('.tc-scroll')
                    .forEach((el: unknown) => {
                      ;(el as HTMLElement).scrollLeft = left
                    })
                }}
              >
                <div className="inline-flex h-1 overflow-hidden opacity-0">
                  <TestcaseCell results={results} />
                </div>
              </div>
            )}

            <div className="tc-scroll overflow-x-hidden">
              <div className="inline-flex w-fit justify-start">
                <TestcaseCell results={results} />
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'testcase-total',
      header: () => <p className="text-center font-mono text-xs">Total</p>,
      cell: ({ row }) => {
        const results = row.original.testcaseResults ?? []
        const total = results.length
        return (
          <div className="text-xs">
            {results.filter((r) => r.result === 'Accepted').length} / {total}
          </div>
        )
      }
    },
    {
      id: 'comment',
      header: () => <p className="text-center font-mono text-xs">Comment</p>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <CommentCell
            groupId={groupId}
            assignmentId={assignmentId}
            userId={row.original.id}
            problemId={selectedProblemId ?? problemData[0].problemId}
          />
        </div>
      )
    },
    {
      id: 'detail',
      header: () => <span className="sr-only">Detail</span>,
      cell: ({ row }) => {
        if (!problemData || problemData.length === 0) {
          return null
        }
        const pid = selectedProblemId ?? problemData[0].problemId
        if (!pid) {
          return (
            <button className="flex w-full justify-center">
              <SquareArrowOutUpRight className="h-4 w-4 text-gray-300" />
            </button>
          )
        }
        if (isAssignmentFinished) {
          return (
            <Link
              href={
                `/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${row.original.id}/problem/${pid}` as const
              }
              target="_blank"
              className="flex justify-center"
            >
              <SquareArrowOutUpRight className="hover:text-primary text-black-500 h-4 w-4" />
            </Link>
          )
        } else {
          return (
            <button className="flex w-full justify-center">
              <SquareArrowOutUpRight className="h-4 w-4 text-gray-300" />
            </button>
          )
        }
      }
    }
  ]
}
