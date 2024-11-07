'use client'

import type {
  ProblemData,
  ScoreSummary
} from '@/app/admin/contest/_libs/schemas'
import type { ColumnDef, Row } from '@tanstack/react-table'

interface DataTableScoreSummary
  extends Pick<
    ScoreSummary,
    | 'contestPerfectScore'
    | 'submittedProblemCount'
    | 'userContestScore'
    | 'totalProblemCount'
  > {
  id: number
  problemScores: {
    problemId: number
    score: number
  }[]
}

export const createColumns = (
  problemData: ProblemData[]
): ColumnDef<DataTableScoreSummary>[] => {
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
      accessorKey: 'userContestScore',
      header: () => <p className="py-1 font-mono text-sm">Total</p>,
      cell: ({ row }) => (
        <div>
          {row.original.userContestScore}/{row.original.contestPerfectScore}
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
