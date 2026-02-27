'use client'

import { cn, dateFormatter } from '@/libs/utils'
import type { Notice } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { PiPushPinFill } from 'react-icons/pi'

export const columns = (t: (key: string) => string): ColumnDef<Notice>[] => [
  {
    header: t('column_title_header'),
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
    header: t('column_writer_header'),
    accessorKey: 'createdBy',
    cell: ({ row }) => row.original.createdBy
  },
  {
    header: t('column_date_header'),
    accessorKey: 'createTime',
    cell: ({ row }) => dateFormatter(row.original.createTime, 'YYYY-MM-DD')
  }
]
