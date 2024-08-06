'use client'

import Badge from '@/app/(main)/_components/Badge'
import { dateFormatter } from '@/lib/utils'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Contest>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => (
      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base">
        {row.original.title}
      </p>
    )
  },
  {
    header: 'Registered',
    accessorKey: 'registered',
    cell: () => ''
  },
  {
    header: 'Participants',
    accessorKey: 'participants',
    cell: ({ row }) => row.original.participants
  },
  {
    header: 'Total score',
    accessorKey: 'totalScore',
    cell: () => '000/000'
  },
  {
    header: 'Period',
    accessorKey: 'period',
    cell: ({ row }) =>
      dateFormatter(row.original.startTime, 'YYYY-MM-DD') +
      ' ~ ' +
      dateFormatter(row.original.endTime, 'YYYY-MM-DD')
  }
]
