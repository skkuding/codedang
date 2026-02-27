'use client'

import type { LeaderboardItemCodeEditorPagination } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<LeaderboardItemCodeEditorPagination>[] = [
  {
    header: 'Rank',
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
        <p className="text-body4_r_14 text-[#619CFB]">{strRank}</p>
      ) : (
        <p className="text-body4_r_14">{strRank}</p>
      )
    }
  },
  {
    header: 'User ID',
    accessorKey: 'userId',
    cell: ({ row }) =>
      row.original.rank <= 3 ? (
        <p className="text-body4_r_14 text-[#619CFB]">{row.original.userId}</p>
      ) : (
        <p className="text-body4_r_14">{row.original.userId}</p>
      )
  },
  {
    header: 'Penalty',
    accessorKey: 'penalty',
    cell: ({ row }) =>
      row.original.rank <= 3 ? (
        <p className="text-body4_r_14 text-[#619CFB]">{row.original.penalty}</p>
      ) : (
        <p className="text-body4_r_14">{row.original.penalty}</p>
      )
  },
  {
    header: 'Solved',
    accessorKey: 'solved',
    cell: ({ row }) => {
      return row.original.rank <= 3 ? (
        <p className="text-body4_r_14 text-[#619CFB]">{row.original.solved}</p>
      ) : (
        <p className="text-body4_r_14">{row.original.solved}</p>
      )
    }
  }
]
