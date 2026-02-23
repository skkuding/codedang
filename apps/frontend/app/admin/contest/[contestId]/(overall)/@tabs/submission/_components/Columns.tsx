'use client'

import type { OverallSubmission } from '@/app/admin/contest/_libs/schemas'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const getColumns = (
  t: (key: string) => string
): ColumnDef<OverallSubmission>[] => [
  {
    accessorKey: 'username',
    header: () => null,
    cell: ({ row }) => {
      return (
        <div className="shadow-2xs flex flex-col rounded-2xl border bg-white px-[30px] py-[18px]">
          <div className="text-primary flex items-center gap-2">
            <div className="rounded-full bg-[#e1ecfe] px-4 py-1">
              {t('user_id')}
            </div>
            <div>{row.original.username}</div>
          </div>
          <div className="flex items-end justify-between px-[10px] text-xl font-semibold">
            {String.fromCharCode(65 + (row.original.order ?? 0))}.{' '}
            {row.original.title}
            <span
              className={cn(
                'flex h-[38px] w-40 items-center justify-center rounded-full text-base font-semibold',
                row.original.result === 'Accepted'
                  ? 'border-primary text-primary border-2'
                  : 'border-2 border-[#fc5555] text-[#fc5555]'
              )}
            >
              {row.original.result}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-black">
                {t('submission_time')}
              </div>
              <div className="w-40 text-left">
                {dayjs(
                  new Date(parseInt(row.original.submissionTime, 10))
                ).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-black">
                {t('language')}
              </div>
              <div className="w-20 text-left">{row.original.language}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-black">
                {t('code_size')}
              </div>
              <div className="w-24 text-left">
                {row.original.codeSize} Bytes
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-black">
                {t('ip')}
              </div>
              <div className="w-32 text-left">{row.original.ip}</div>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'title',
    id: 'problemTitle',
    filterFn: 'arrIncludesSome'
  },
  {
    accessorKey: 'submissionTime'
  }
]
