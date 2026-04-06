'use client'

import { cn, dateFormatter } from '@/libs/utils'
import type { Notice } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { PiPushPinFill } from 'react-icons/pi'

export const columns: ColumnDef<Notice>[] = [
  {
    header: '제목',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <div className="flex min-w-0 items-center justify-start gap-2">
          {row.original.isFixed && (
            <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full p-1 text-white md:h-6 md:w-6">
              <PiPushPinFill />
            </div>
          )}
          <span
            className={cn(
              row.original.isFixed && 'font-semibold',
              'text-body1_m_16 overflow-hidden text-ellipsis whitespace-nowrap'
            )}
          >
            {row.original.title}
          </span>
        </div>
      )
    }
  },
  {
    header: '날짜',
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm')
  },
  {
    header: '작성자',
    accessorKey: 'createdBy',
    cell: ({ row }) => row.original.createdBy
  }
]
