'use client'

import { Badge } from '@/components/shadcn/badge'
import type { Problem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { SortButton } from './SortButton'

export const columns: ColumnDef<Problem>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-body4_r_14 overflow-hidden text-ellipsis whitespace-nowrap text-left md:text-base">{`${row.original.id}. ${row.original.title}`}</p>
      )
    }
  },
  {
    header: () => <SortButton order="level">Level</SortButton>,
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge variant={row.original.difficulty}>
        Level {row.original.difficulty.slice(-1)}
      </Badge>
    )
  },
  {
    header: () => <SortButton order="submit">Submission</SortButton>,
    accessorKey: 'submissionCount',
    cell: ({ row }) => row.original.submissionCount
  },
  {
    header: () => <SortButton order="acrate">Success Rate</SortButton>,
    accessorKey: 'acceptedRate',
    cell: ({ row }) => `${(row.original.acceptedRate * 100).toFixed(2)}%`
  }
]
