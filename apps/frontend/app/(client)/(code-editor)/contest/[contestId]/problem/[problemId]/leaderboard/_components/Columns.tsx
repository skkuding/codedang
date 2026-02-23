'use client'

import type { LeaderboardItemCodeEditorPagination } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const getColumns = (
  t: (key: string) => string
): ColumnDef<LeaderboardItemCodeEditorPagination>[] => [
  {
    header: t('rank_column_header'),
    accessorKey: 'rank',
    cell: ({ row }) => {
      const rank = row.original.rank
      let strRank = rank.toString()
      const numZeros = 3 - rank.toString().length
      if (numZeros > 0) {
        for (let i = 0; i < numZeros; ++i) {
          strRank = `0${strRank}`
        }
      }

      return row.original.rank <= 3 ? (
        <p className="text-sm text-[#619CFB]">{strRank}</p>
      ) : (
        <p className="text-sm">{strRank}</p>
      )
    }
  },
  {
    header: t('user_id_column_header'),
    accessorKey: 'userId',
    cell: ({ row }) =>
      row.original.rank <= 3 ? (
        <p className="text-sm text-[#619CFB]">{row.original.userId}</p>
      ) : (
        <p className="text-sm">{row.original.userId}</p>
      )
  },
  {
    header: t('penalty_column_header'),
    accessorKey: 'penalty',
    cell: ({ row }) =>
      row.original.rank <= 3 ? (
        <p className="text-sm text-[#619CFB]">{row.original.penalty}</p>
      ) : (
        <p className="text-sm">{row.original.penalty}</p>
      )
  },
  {
    header: t('solved_column_header'),
    accessorKey: 'solved',
    cell: ({ row }) => {
      return row.original.rank <= 3 ? (
        <p className="text-sm text-[#619CFB]">{row.original.solved}</p>
      ) : (
        <p className="text-sm">{row.original.solved}</p>
      )
    }
  }
]
