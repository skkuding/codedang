'use client'

import type { UserSubmission } from '@/app/admin/contest/utils'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const submissionColumns: ColumnDef<UserSubmission>[] = [
  {
    accessorKey: 'problemTitle',
    header: () => (
      <div className="py-1 pr-4 font-mono text-sm">Problem Title</div>
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap py-1 text-center text-xs">
        {row.getValue('problemTitle')}
      </div>
    )
  },
  {
    accessorKey: 'submissionResult',
    header: () => <p className="font-mono text-sm">Result</p>,
    cell: ({ row }) => (
      <div
        className={cn(
          'whitespace-nowrap text-center text-xs',
          row.getValue('submissionResult') === 'Accept'
            ? 'text-green-500'
            : row.getValue('submissionResult') === 'Judging'
              ? 'text-gray-500'
              : 'text-red-500'
        )}
      >
        {row.getValue('submissionResult')}
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
          'YYYY-MM-DD HH:mm:ss'
        )}
      </div>
    )
  },
  {
    accessorKey: 'codeSize',
    header: () => <p className="font-mono text-sm">Code Size</p>,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs">
        {!row.getValue('codeSize') || `${row.getValue('codeSize')} Bytes`}
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
