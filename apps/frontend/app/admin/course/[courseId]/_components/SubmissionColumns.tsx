'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type { OverallSubmission } from '@/app/admin/contest/_libs/schemas'
import { cn, getResultColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const columns: ColumnDef<OverallSubmission>[] = [
  {
    accessorKey: 'title',
    id: 'problemTitle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem Title" />
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {String.fromCharCode(65 + (row.original.order ?? 0))}.{' '}
        {row.getValue('problemTitle')}
      </div>
    ),
    filterFn: 'arrIncludesSome'
  },
  {
    accessorKey: 'studentId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student ID" />
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue('studentId')}</div>
    )
  },
  {
    accessorKey: 'realname',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue('realname')}</div>
    )
  },
  {
    accessorKey: 'result',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Result" />
    ),
    cell: ({ row }) => (
      <div
        className={cn(
          'whitespace-nowrap',
          getResultColor(row.getValue('result'))
        )}
      >
        {row.getValue('result')}
      </div>
    )
  },
  {
    accessorKey: 'language',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Language" />
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue('language')}</div>
    )
  },
  {
    accessorKey: 'submissionTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission Time" />
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {dayjs(new Date(parseInt(row.getValue('submissionTime'), 10))).format(
          'MMM DD, YYYY HH:mm'
        )}
      </div>
    )
  },
  {
    accessorKey: 'codeSize',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code Size" />
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {row.getValue('codeSize') ? `${row.getValue('codeSize')} B` : 'N/A'}
      </div>
    )
  },
  {
    accessorKey: 'ip',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP" />
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue('ip')}</div>
    )
  }
]
