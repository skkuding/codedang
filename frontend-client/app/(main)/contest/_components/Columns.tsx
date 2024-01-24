'use client'

import Badge from '@/app/(main)/_components/Badge'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const columns: ColumnDef<Contest>[] = [
  {
    header: 'Name',
    accessorKey: 'title',
    cell: ({ row }) => (
      <p className="text-left text-sm md:text-base">{row.original.title}</p>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge type={row.original.status}>
        <p>{row.original.status}</p>
      </Badge>
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
    cell: ({ row }) => row.original.participants
  }
]
