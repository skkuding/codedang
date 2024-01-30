'use client'

import type { ContestClarification } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const columns: ColumnDef<ContestClarification>[] = [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => row.original.id
  },
  {
    header: () => 'Description',
    accessorKey: 'content',
    cell: ({ row }) => <p className="text-left">{row.original.content}</p>
  },
  {
    header: () => 'Time',
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dayjs(row.original.createTime).format('YYYY-MM-DD HH:mm:ss')
  }
]
