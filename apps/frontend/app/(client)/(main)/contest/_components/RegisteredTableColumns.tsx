'use client'

import { dateFormatter } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import StatusBadge from '../../_components/StatusBadge'

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
    cell: ({ row }) => <StatusBadge variant={row.original.status} />
  },
  {
    header: 'Participants',
    accessorKey: 'participants',
    cell: ({ row }) => row.original.participants
  },
  {
    header: 'Period',
    accessorKey: 'period',
    cell: ({ row }) =>
      `${dateFormatter(row.original.startTime, 'YYYY-MM-DD')} ~ ${dateFormatter(
        row.original.endTime,
        'YYYY-MM-DD'
      )}`
  }
]
