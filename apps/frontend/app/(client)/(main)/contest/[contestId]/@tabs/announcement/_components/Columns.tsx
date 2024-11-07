'use client'

import { convertToLetter, dateFormatter } from '@/lib/utils'
import type { ContestAnnouncement } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

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
      <div className="text-left [tr:not(.expanded)_&]:truncate">
        {row.original.content}
      </div>
    )
  },
  {
    header: () => 'Posted',
    accessorKey: 'updateTime',
    cell: ({ row }) =>
      dateFormatter(row.original.updateTime, 'YYYY-MM-DD HH:mm')
  }
]
