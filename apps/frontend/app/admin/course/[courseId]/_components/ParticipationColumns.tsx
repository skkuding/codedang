'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type {
  ProblemData,
  ScoreSummary
} from '@/app/admin/course/[courseId]/_libs/type'
import type { ColumnDef, Row } from '@tanstack/react-table'

interface DataTableScoreSummary extends ScoreSummary {
  id: number
}

export const createColumns = (
  problemData: ProblemData[]
): ColumnDef<DataTableScoreSummary>[] => {
  return [
    {
      accessorKey: 'studentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student ID" />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap">{row.getValue('studentId')}</div>
      )
    },
    {
      accessorKey: 'realName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap">{row.original.realName}</div>
      ),
      filterFn: 'includesString'
    },
    {
      accessorKey: 'submittedProblemCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submit" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center border-x">
          {row.original.submittedProblemCount}/{row.original.totalProblemCount}
        </div>
      )
    },
    {
      accessorKey: 'userAssignmentScore',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.userAssignmentScore}/
          {row.original.assignmentPerfectScore}
        </div>
      )
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
    }))
  ]
}
