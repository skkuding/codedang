'use client'

import { convertToLetter, dateFormatter } from '@/libs/utils'
import type { ContestAnnouncement } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<ContestAnnouncement>[] = [
  {
    header: 'No',
    accessorKey: 'no',
    cell: ({ row, table }) => (
      <div className="text-body3_r_16 h-full">
        {table.getCoreRowModel().rows.length - row.index}
      </div>
    )
  },
  {
    header: 'Problem',
    accessorKey: 'problem',
    cell: ({ row }) => (
      <div className="text-body3_r_16 h-full">
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
      <div className="text-body3_r_16 text-left">{row.original.content}</div>
    )
  },
  {
    header: () => 'Date',
    accessorKey: 'createTime',
    cell: ({ row }) => (
      <div className="text-body3_r_16 text-[#808080]">
        {dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm')}
      </div>
    )
  }
]
