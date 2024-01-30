'use client'

import { Badge } from '@/components/ui/badge'
import type { ContestProblem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<ContestProblem>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-left text-sm md:text-base">{`${row.original.order}. ${row.original.title}`}</p>
      )
    }
  },
  {
    header: 'Level',
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
    header: () => 'Submission',
    accessorKey: 'submissionCount',
    cell: ({ row }) => row.original.submissionCount
  },
  {
    header: () => 'Solved',
    accessorKey: 'acceptedRate',
    cell: ({ row }) => `${row.original.acceptedRate}%`
  }
]
