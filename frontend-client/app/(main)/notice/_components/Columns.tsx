'use client'

import { cn } from '@/lib/utils'
import type { Notice } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { PiPushPinFill } from 'react-icons/pi'

export const columns: ColumnDef<Notice>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-start gap-3 md:gap-4">
          {row.original.isFixed && (
            <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full p-1 text-white md:h-6 md:w-6">
              <PiPushPinFill />
            </div>
          )}
          <span
            className={cn(
              row.original.isFixed && 'font-semibold',
              'overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base'
            )}
          >
            {row.original.title}
          </span>
        </div>
      )
    }
  },
  {
    header: 'Writer',
    accessorKey: 'createdBy',
    cell: ({ row }) => row.original.createdBy
  },
  {
    header: 'Date',
    accessorKey: 'createTime',
    cell: ({ row }) => dayjs(row.original.createTime).format('YYYY-MM-DD')
  }
]
