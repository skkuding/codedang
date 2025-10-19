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
  problemScores: {
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
  const firstHiddenIndex = results.findIndex((item) => item.isHidden)
  return (
    <div className="whitespace-nowrap">
      {results.length === 0 ? (
        <span className="text-xs text-gray-400">No testcases</span>
      ) : (
        results.map((r, i) => {
          const isPass = r.result === 'Accepted'
          return (
            <span
              key={i}
              className={cn(
                'inline-block select-none py-1 font-mono text-sm',
                isPass ? getResultColor('Accepted') : getResultColor('Wrong')
              )}
              title={`${r.isHidden ? 'Hidden' : 'Sample'} #${r.isHidden ? i - firstHiddenIndex + 1 : i + 1}`}
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

        const contentWidth = results.length * 16

        return (
          <div className="mx-auto w-[600px]">
            {isFirstRow && (
              <div
                className="line-scrollbar mx-auto w-[600px] overflow-x-auto"
                onScroll={(e) => {
                  const left = e.currentTarget.scrollLeft
                  document
                    .querySelectorAll('.tc-scroll')
                    .forEach((el: unknown) => {
                      ;(el as HTMLElement).scrollLeft = left
                    })
                }}
              >
                <div style={{ width: contentWidth, height: 1 }} />
              </div>
            )}

            <div className="tc-scroll mx-auto w-[600px] overflow-x-hidden">
              <div
                className="inline-flex justify-start"
                style={{ width: contentWidth }}
              >
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
