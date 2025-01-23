'use client'

import type { LeaderboardItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<LeaderboardItem>[] = [
  {
    header: 'Rank',
    accessorKey: 'rank',
    cell: ({ row }) => {
      return <p className="text-sm">{row.original.rank}</p>
    }
  },
  {
    header: () => 'User ID',
    accessorKey: 'username',
    cell: ({ row }) => {
      return <p>{row.original.username}</p>
    }
  },
  {
    header: () => 'Penalty',
    accessorKey: 'penalty',
    cell: ({ row }) => {
      return <p>{row.original.penalty}</p>
    }
  },
  {
    header: () => 'Solved',
    accessorKey: 'solved',
    cell: ({ row }) => {
      return <p>{row.original.solved}</p>
    }
  }
]
