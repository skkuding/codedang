'use client'

import type { LeaderboardContestCodeEditorItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

// TODO: rank 1,2,3 순위의 색 파란색으로 바꿔주기
export const columns: ColumnDef<LeaderboardContestCodeEditorItem>[] = [
  {
    header: 'Rank',
    accessorKey: 'rank',
    cell: ({ row }) => <p className="text-sm">{row.original.rank}</p>
  },
  {
    header: 'User ID',
    accessorKey: 'userID',
    cell: ({ row }) => <p className="text-sm">{row.original.userID}</p>
  },
  {
    header: 'Penalty',
    accessorKey: 'penalty',
    cell: ({ row }) => <p className="text-sm">{row.original.penalty}</p>
  },
  {
    header: 'Solved',
    accessorKey: 'solved',
    cell: ({ row }) => {
      return (
        <p className="text-sm">
          {row.original.solved.solvedProblem}/{row.original.solved.totalProblem}
        </p>
      )
    }
  }
]
