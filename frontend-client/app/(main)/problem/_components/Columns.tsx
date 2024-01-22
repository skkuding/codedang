'use client'

import SortButton from '@/components/SortButton'
import { Badge } from '@/components/ui/badge'
import type { Problem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Problem>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-left text-sm md:text-base">{`${row.original.id}. ${row.original.title}`}</p>
      )
    }
  },
  {
    header: () => <SortButton order="level">Level</SortButton>,
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge
        className="rounded-md"
        variant={
          row.original.difficulty.toLowerCase() as
            | 'level1'
            | 'level2'
            | 'level3'
            | 'level4'
            | 'level5'
        }
      >
        {row.original.difficulty}
      </Badge>
    )
  },
  {
    header: () => <SortButton order="submit">Submission</SortButton>,
    accessorKey: 'submissionCount',
    cell: ({ row }) => row.original.submissionCount
  },
  {
    header: () => <SortButton order="acrate">Solved</SortButton>,
    accessorKey: 'acceptedRate',
    cell: ({ row }) => `${row.original.acceptedRate}%`
  },
  {
    header: 'Info',
    accessorKey: 'info',
    cell: ({ row }) => row.original.info
  }
]
