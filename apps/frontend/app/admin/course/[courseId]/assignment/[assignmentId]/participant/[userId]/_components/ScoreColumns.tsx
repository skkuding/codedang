'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type { ProblemData } from '@/app/admin/contest/_libs/schemas'
import type { ColumnDef, Row } from '@tanstack/react-table'

export interface ScoreSummary {
  studentId: string
  realName?: string | null
  username: string
  submittedProblemCount: number
  totalProblemCount: number
  userAssignmentScore: number
  assignmentPerfectScore: number
  scoreSummaryByProblem: {
    problemId: number
    score: number
    maxScore: number
  }[]
}

interface DataTableSubmissionSummary
  extends Pick<
    ScoreSummary,
    | 'assignmentPerfectScore'
    | 'submittedProblemCount'
    | 'userAssignmentScore'
    | 'totalProblemCount'
  > {
  id: number
  scoreSummaryByProblem: {
    problemId: number
    score: number
  }[]
}

// interface DataTableSubmissionSummary {
//   id: number
//   studentId: string
//   realName?: string | null
//   username: string
//   submittedProblemCount: number
//   totalProblemCount: number
//   userAssignmentScore: number
//   assignmentPerfectScore: number
//   userAssignmentFinalScore?: number | null | undefined
//   problemScores: {
//     problemId: number
//     score: number
//     maxScore: number
//   }[]
// }

export const createColumns = (
  problemData: ProblemData[]
): ColumnDef<DataTableSubmissionSummary>[] => {
  return [
    {
      accessorKey: 'submittedProblemCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Submit" />
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
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
        <p className="text-body4_r_14 font-mono">
          {String.fromCharCode(Number(65 + i))}
        </p>
      ),
      cell: ({ row }: { row: Row<DataTableSubmissionSummary> }) => {
        const problemScore = row.original.scoreSummaryByProblem.find(
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
