'use client'

import { convertToLetter, dateFormatter } from '@/libs/utils'
import type { ContestAnnouncement } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<ContestAnnouncement>[] = [
  {
    header: 'No',
    accessorKey: 'no',
    cell: ({ row, table }) => (
      <div className="h-full text-base">
        {table.getCoreRowModel().rows.length - row.index}
      </div>
    )
  },
  {
    header: 'Problem',
    accessorKey: 'problem',
    cell: ({ row }) => (
      <div className="h-full text-base">
        {row.original.problemOrder !== null
          ? convertToLetter(row.original.problemOrder)
          : ''}
      </div>
    )
  },
  {
    header: () => 'Announcement',
    accessorKey: 'content',
    cell: ({ row }) => (
      <div className="text-left text-base">{row.original.content}</div>
    )
  },
  {
    header: () => 'Date',
    accessorKey: 'createTime',
    cell: ({ row }) => (
      <div className="text-base text-[#808080]">
        {dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm')}
      </div>
    )
  }
]
