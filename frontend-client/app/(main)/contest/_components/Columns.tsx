'use client'

import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

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
    header: 'Starts at',
    accessorKey: 'startTime',
    cell: ({ row }) => dayjs(row.original.startTime).format('YYYY-MM-DD')
  },
  {
    header: 'Ends at',
    accessorKey: 'endTime',
    cell: ({ row }) => dayjs(row.original.endTime).format('YYYY-MM-DD')
  },
  {
    header: 'Participants',
    accessorKey: 'participants',
    cell: ({ row }) => row.original.id
  }
]
