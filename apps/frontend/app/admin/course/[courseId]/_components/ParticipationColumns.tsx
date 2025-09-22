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
      cell: ({ row }) => row.getValue('studentId')
    },
    {
      accessorKey: 'realName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.getValue('realName'),
      filterFn: 'includesString'
    },
    {
      accessorKey: 'submittedProblemCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submit" />
      ),
      cell: ({ row }) => (
        <>
          {row.original.submittedProblemCount}/{row.original.totalProblemCount}
        </>
      )
    },
    {
      accessorKey: 'userAssignmentScore',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <>
          {row.original.userAssignmentScore}/
          {row.original.assignmentPerfectScore}
        </>
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
