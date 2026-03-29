'use client'

import { cn, dateFormatter } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface CourseNoticeRow {
  id: number
  no: string
  title: string
  createdBy: string
  date: string
  isRead: boolean
  isFixed: boolean
}

export const courseNoticeColumns: ColumnDef<CourseNoticeRow>[] = [
  {
    accessorKey: 'no',
    header: 'NO',
    cell: ({ row }) => (
      <div
        className={cn(
          'relative w-full text-center text-sm text-[#666666]',
          row.original.isFixed &&
            "before:bg-primary before:absolute before:left-[-16px] before:top-[-18px] before:h-[57px] before:w-[3px] before:rounded-full before:content-['']"
        )}
      >
        {row.original.no}
      </div>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="flex items-center justify-start gap-2 overflow-hidden text-sm text-black">
        <span className="line-clamp-1">{row.original.title}</span>
        {!row.original.isRead && (
          <span className="bg-primary h-[6px] w-[6px] shrink-0 rounded-full" />
        )}
      </div>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-[#666666]">
        {row.original.date
          ? dateFormatter(row.original.date, 'YY-MM-DD HH:mm')
          : '-'}
      </span>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'createdBy',
    header: 'Writer',
    cell: ({ row }) => (
      <span className="text-sm text-[#666666]">{row.original.createdBy}</span>
    ),
    enableSorting: false
  }
]
