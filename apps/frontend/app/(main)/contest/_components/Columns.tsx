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
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge type={row.original.status}>
        <p>
          {row.original.status.startsWith('registered')
            ? 'registered'
            : row.original.status}
        </p>
      </Badge>
    )
  },
  {
    header: 'Starts at',
    accessorKey: 'startTime',
    cell: ({ row }) => dateFormatter(row.original.startTime, 'YYYY-MM-DD')
  },
  {
    header: 'Ends at',
    accessorKey: 'endTime',
    cell: ({ row }) => dateFormatter(row.original.endTime, 'YYYY-MM-DD')
  },
  {
    header: 'Participants',
    accessorKey: 'participants',
    cell: ({ row }) => row.original.participants
  }
]
