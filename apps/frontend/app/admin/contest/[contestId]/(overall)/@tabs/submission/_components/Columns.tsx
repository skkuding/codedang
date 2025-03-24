'use client'

import type { OverallSubmission } from '@/app/admin/contest/_libs/schemas'
import { cn, getResultColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const columns: ColumnDef<OverallSubmission>[] = [
  {
    accessorKey: 'username',
    header: () => null, // 헤더 제거
    cell: ({ row }) => (
      <div className="flex flex-col gap-4 rounded-lg border bg-white px-10 py-6 shadow-sm">
        <div className="text-primary flex items-center gap-2">
          <div className="rounded-full bg-[#e1ecfe] px-4 py-1">User ID</div>
          <div>{row.original.username}</div>
        </div>
        <div className="flex items-center justify-between px-[10px] text-[26px] font-semibold">
          {String.fromCharCode(65 + (row.original.order ?? 0))}.{' '}
          {row.original.title}
          <span
            className={cn(
              'flex h-[42px] w-40 items-center justify-center rounded-full text-base font-semibold',
              row.original.result === 'Accepted'
                ? 'border-primary text-primary border'
                : 'border border-red-600 text-red-600'
            )}
          >
            {row.original.result}
          </span>
        </div>

        {/* 상세 정보 (그리드) */}
        <div className="flex items-center justify-between gap-2 text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-black">
              Language
            </div>
            <div className="w-20 text-left">{row.original.language}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-black">
              Code Size
            </div>
            <div className="w-24 text-left">{row.original.codeSize} Bytes</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-black">
              IP
            </div>
            <div className="w-32 text-left">{row.original.ip}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-neutral-100 px-3 py-1 text-black">
              Submission Time
            </div>
            <div className="w-40 text-left">
              {dayjs(
                new Date(parseInt(row.original.submissionTime, 10))
              ).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>

          {/* <div>Submission Time</div>
          <div className="text-right">
            {dayjs(new Date(parseInt(row.original.submissionTime, 10))).format(
              'YYYY-MM-DD HH:mm:ss'
            )}
          </div> */}
        </div>
      </div>
    )
  },
  {
    accessorKey: 'title',
    id: 'problemTitle'
  },
  {
    accessorKey: 'submissionTime'
  }
]
