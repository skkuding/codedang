'use client'

import { Badge } from '@/components/ui/badge'
import { convertToLetter } from '@/lib/utils'
import type { ContestProblem, Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<ContestProblem>[] = [
  {
    header: '#',
    accessorKey: 'order',
    cell: ({ row }) => (
      <div className="h-full">{convertToLetter(row.original.order)}</div>
    )
  },
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-left text-sm md:text-base">{`${row.original.title}`}</p>
      )
    }
  },
  {
    header: 'Level',
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge className="rounded-md" variant={row.original.difficulty as Level}>
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
    cell: ({ row }) => `${row.original.acceptedRate.toFixed(2)}%`
  }
]
