'use client'

import type { ContestClarification } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import './styles.css'

export const columns: ColumnDef<ContestClarification>[] = [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => <div className="h-full">{row.original.id}</div>
  },
  {
    header: () => 'Description',
    accessorKey: 'content',
    cell: ({ row }) => (
      <div className="expandable text-left">{row.original.content}</div>
    )
  },
  {
    header: () => 'Time',
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dayjs(row.original.createTime).format('YYYY-MM-DD HH:mm:ss')
  }
]
