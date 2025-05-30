'use client'

import type { OverallSubmission } from '@/app/admin/contest/_libs/schemas'
import { cn, getResultColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const columns: ColumnDef<OverallSubmission>[] = [
  {
    accessorKey: 'title',
    id: 'problemTitle',
    header: () => (
      <div className="border-r py-1 font-mono text-sm">Problem Title</div>
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap border-r py-1 text-center text-xs">
        {String.fromCharCode(65 + (row.original.order ?? 0))}.{' '}
        {row.getValue('problemTitle')}
      </div>
    ),
    filterFn: 'arrIncludesSome'
  },
  {
    accessorKey: 'studentId',
    header: () => <p className="font-mono text-sm">Student ID</p>,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs font-medium">
        {row.getValue('studentId')}
      </div>
    )
  },
  {
    accessorKey: 'realname',
    header: () => <p className="border-r py-1 font-mono text-sm">Name</p>,
    cell: ({ row }) => (
      <div className="whitespace-nowrap border-r py-1 text-center text-xs font-medium">
        {row.getValue('realname')}
      </div>
    )
  },
  {
    accessorKey: 'result',
    header: () => <p className="py-1 font-mono text-sm">Result</p>,
    cell: ({ row }) => (
      <div
        className={cn(
          'whitespace-nowrap py-1 text-center text-xs',
          getResultColor(row.getValue('result'))
        )}
      >
        {row.getValue('result')}
      </div>
    )
  },
  {
    accessorKey: 'language',
    header: () => <p className="font-mono text-sm">Language</p>,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs">
        {row.getValue('language')}
      </div>
    )
  },
  {
    accessorKey: 'submissionTime',
    header: () => <p className="font-mono text-sm">Submission Time</p>,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs">
        {dayjs(new Date(parseInt(row.getValue('submissionTime'), 10))).format(
          'MMM DD, YYYY HH:mm'
        )}
      </div>
    )
  },
  {
    accessorKey: 'codeSize',
    header: () => <p className="font-mono text-sm">Code Size</p>,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs">
        {row.getValue('codeSize') ? `${row.getValue('codeSize')} B` : 'N/A'}
      </div>
    )
  },
  {
    accessorKey: 'ip',
    header: () => <p className="font-mono text-sm">IP</p>,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs">
        {row.getValue('ip')}
      </div>
    )
  }
]
