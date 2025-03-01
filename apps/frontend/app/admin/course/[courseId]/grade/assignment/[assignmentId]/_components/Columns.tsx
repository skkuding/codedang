'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type { ProblemData } from '@/app/admin/contest/_libs/schemas'
import type { ColumnDef, Row } from '@tanstack/react-table'

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
}

export const createColumns = (
  problemData: ProblemData[]
): ColumnDef<DataTableScoreSummary>[] => {
  return [
    {
      accessorKey: 'studentId',
      header: () => <p className="font-mono text-sm">Student ID</p>,
      cell: ({ row }) => (
        <div className="whitespace-nowrap text-center text-xs font-medium">
          {row.getValue('studentId')}
        </div>
      )
    },
    {
      accessorKey: 'realName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Name"
          className="flex justify-center border-r"
        />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap border-r text-center text-xs font-medium">
          {row.original.realName}
        </div>
      ),
      filterFn: 'includesString'
    },
    ...problemData.map((problem, i) => ({
      accessorKey: `${String.fromCharCode(Number(65 + i))}`,
      header: () => (
        <p className="font-mono text-sm">
          {String.fromCharCode(Number(65 + i))}
        </p>
      ),
      cell: ({ row }: { row: Row<DataTableScoreSummary> }) => {
        const problemScore = row.original.problemScores.find(
          (ps) => ps.problemId === problem.problemId
        )
        return (
          <div>
            {problemScore
              ? `${problemScore.score}/${problem.score}`
              : `-/${problem.score}`}
          </div>
        )
      }
    })),
    {
      accessorKey: 'userAssignmentScore',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Raw Score"
          className="flex justify-center border-x"
        />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center border-x">
          {row.original.userAssignmentScore || '-'}/
          {row.original.assignmentPerfectScore}
        </div>
      )
    },
    {
      accessorKey: 'userAssignmentFinalScore',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Final Score"
          className="flex justify-center"
        />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.userAssignmentFinalScore || '-'}/
          {row.original.assignmentPerfectScore}
        </div>
      )
    }
  ]
}
