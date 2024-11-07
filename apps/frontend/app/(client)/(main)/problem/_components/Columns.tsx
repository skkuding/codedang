'use client'

import SortButton from '@/components/SortButton'
import { Badge } from '@/components/ui/badge'
import type { Level, Problem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Problem>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base">{`${row.original.id}. ${row.original.title}`}</p>
      )
    }
  },
  {
    header: () => <SortButton order="level">Level</SortButton>,
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge className="rounded-md" variant={row.original.difficulty as Level}>
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
    header: () => <SortButton order="acrate">Success Rate</SortButton>,
    accessorKey: 'acceptedRate',
    cell: ({ row }) => `${(row.original.acceptedRate * 100).toFixed(2)}%`
  },
  {
    header: 'Info',
    accessorKey: 'info',
    cell: ({ row }) => row.original.info
  }
]
