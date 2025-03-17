'use client'

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
  problemScores: {
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
  problemScores: {
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
      header: () => <p className="py-1 font-mono text-sm">Submit</p>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.submittedProblemCount}/{row.original.totalProblemCount}
        </div>
      )
    },
    {
      accessorKey: 'userAssignmentScore',
      header: () => <p className="py-1 font-mono text-sm">Total</p>,
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
      cell: ({ row }: { row: Row<DataTableSubmissionSummary> }) => {
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
