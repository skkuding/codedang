'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { SUBMISSION_PROBLEM_COLUMN_ID } from '@/app/admin/_components/table/constants'
import type { OverallSubmission } from '@/app/admin/contest/_libs/schemas'
import { cn, getResultColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const columns: ColumnDef<OverallSubmission>[] = [
  {
    accessorKey: 'title',
    id: SUBMISSION_PROBLEM_COLUMN_ID,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem Title" />
    ),
    cell: ({ row }) => (
      <>
        {String.fromCharCode(65 + (row.original.order ?? 0))}.{' '}
        {row.original.title}
      </>
    ),
    filterFn: 'arrIncludesSome'
  },
  {
    accessorKey: 'studentId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student ID" />
    ),
    cell: ({ row }) => row.getValue('studentId')
  },
  {
    accessorKey: 'realname',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => row.getValue('realname')
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
    cell: ({ row }) => row.getValue('language')
  },
  {
    accessorKey: 'submissionTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission Time" />
    ),
    cell: ({ row }) => {
      return dayjs(
        new Date(parseInt(row.getValue('submissionTime'), 10))
      ).format('MMM DD, YYYY HH:mm')
    }
  },
  {
    accessorKey: 'codeSize',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code Size" />
    ),
    cell: ({ row }) => {
      return row.getValue('codeSize') ? `${row.getValue('codeSize')} B` : 'N/A'
    }
  },
  {
    accessorKey: 'ip',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IP" />
    ),
    cell: ({ row }) => row.getValue('ip')
  }
]
