'use client'

import { convertToLetter, dateFormatter } from '@/libs/utils'
import type { ContestAnnouncement } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const getColumns = (
  t: (key: string) => string
): ColumnDef<ContestAnnouncement>[] => {
  return [
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
      header: () => {
        return t('announcement')
      },
      accessorKey: 'content',
      cell: ({ row }) => (
        <div className="text-left text-base">{row.original.content}</div>
      )
    },
    {
      header: () => {
        return t('date')
      },
      accessorKey: 'createTime',
      cell: ({ row }) => (
        <div className="text-base text-[#808080]">
          {dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm')}
        </div>
      )
    }
  ]
}
