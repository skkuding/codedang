'use client'

import { convertToLetter, dateFormatter } from '@/libs/utils'
import type { ContestAnnouncement } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import './styles.css'

export const columns: ColumnDef<ContestAnnouncement>[] = [
  {
    header: 'Problem',
    accessorKey: 'problem',
    cell: ({ row }) => (
      <div className="h-full">
        {row.original.problemId !== null
          ? convertToLetter(row.original.problemId)
          : ''}
      </div>
    )
  },
  {
    header: () => 'Description',
    accessorKey: 'content',
    cell: ({ row }) => (
      <div className="expandable text-left">{row.original.content}</div>
    )
  },
  {
    header: () => 'Posted',
    accessorKey: 'updateTime',
    cell: ({ row }) =>
      dateFormatter(row.original.updateTime, 'YYYY-MM-DD HH:mm')
  }
]
