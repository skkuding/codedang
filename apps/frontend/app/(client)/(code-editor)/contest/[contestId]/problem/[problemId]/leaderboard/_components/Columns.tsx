'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { LeaderboardItemCodeEditorPagination } from './LeaderboardPaginatedTable'

// TODO: rank 1,2,3 순위의 색 파란색으로 바꿔주기
export const columns: ColumnDef<LeaderboardItemCodeEditorPagination>[] = [
  {
    header: 'Rank',
    accessorKey: 'rank',
    cell: ({ row }) => <p className="text-sm">{row.original.rank}</p>
  },
  {
    header: 'User ID',
    accessorKey: 'userId',
    cell: ({ row }) => <p className="text-sm">{row.original.userId}</p>
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
      return <p className="text-sm">{row.original.solved}</p>
    }
  }
]
