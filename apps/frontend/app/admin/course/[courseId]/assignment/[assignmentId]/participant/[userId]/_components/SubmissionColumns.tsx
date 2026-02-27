'use client'

import type { UserSubmission } from '@/app/admin/contest/_libs/schemas'
import { cn, getResultColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const submissionColumns: ColumnDef<UserSubmission>[] = [
  {
    accessorKey: 'problemTitle',
    header: () => (
      <div className="text-body4_r_14 py-1 font-mono">Problem Title</div>
    ),
    cell: ({ row }) => (
      <div className="text-caption4_r_12 whitespace-nowrap py-1 text-center">
        {String.fromCharCode(65 + (row.original.order ?? 0))}.{' '}
        {row.getValue('problemTitle')}
      </div>
    ),
    filterFn: 'arrIncludesSome'
  },
  {
    accessorKey: 'submissionResult',
    header: () => <p className="text-body4_r_14 font-mono">Result</p>,
    cell: ({ row }) => (
      <div
        className={cn(
          'whitespace-nowrap text-center text-xs',
          getResultColor(row.getValue('submissionResult'))
        )}
      >
        {row.getValue('submissionResult')}
      </div>
    )
  },
  {
    accessorKey: 'language',
    header: () => <p className="text-body4_r_14 font-mono">Language</p>,
    cell: ({ row }) => (
      <div className="text-caption4_r_12 whitespace-nowrap text-center">
        {row.getValue('language')}
      </div>
    )
  },
  {
    accessorKey: 'submissionTime',
    header: () => <p className="text-body4_r_14 font-mono">Submission Time</p>,
    cell: ({ row }) => (
      <div className="text-caption4_r_12 whitespace-nowrap text-center">
        {dayjs(new Date(parseInt(row.getValue('submissionTime'), 10))).format(
          'MMM DD, YYYY HH:mm'
        )}
      </div>
    )
  },
  {
    accessorKey: 'codeSize',
    header: () => <p className="text-body4_r_14 font-mono">Code Size</p>,
    cell: ({ row }) => (
      <div className="text-caption4_r_12 whitespace-nowrap text-center">
        {row.getValue('codeSize') ? `${row.getValue('codeSize')} B` : 'N/A'}
      </div>
    )
  },
  {
    accessorKey: 'ip',
    header: () => <p className="text-body4_r_14 font-mono">IP</p>,
    cell: ({ row }) => (
      <div className="text-caption4_r_12 whitespace-nowrap text-center">
        {row.getValue('ip') ?? 'Unknown'}
      </div>
    )
  }
]
