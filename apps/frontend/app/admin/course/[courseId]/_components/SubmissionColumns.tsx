'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { SUBMISSION_PROBLEM_COLUMN_ID } from '@/app/admin/_components/table/constants'
import type { OverallSubmission } from '@/app/admin/contest/_libs/schemas'
import { cn, getResultColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const getColumns = (
  t: (key: string) => string
): ColumnDef<OverallSubmission>[] => [
  {
    accessorKey: 'title',
    id: SUBMISSION_PROBLEM_COLUMN_ID,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('problem_title_header')}
      />
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
      <DataTableColumnHeader column={column} title={t('student_id_header')} />
    ),
    cell: ({ row }) => row.getValue('studentId')
  },
  {
    accessorKey: 'realname',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('name_header')} />
    ),
    cell: ({ row }) => row.getValue('realname')
  },
  {
    accessorKey: 'result',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('result_header')} />
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
      <DataTableColumnHeader column={column} title={t('language_header')} />
    ),
    cell: ({ row }) => row.getValue('language')
  },
  {
    accessorKey: 'submissionTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('submission_time_header')}
      />
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
      <DataTableColumnHeader column={column} title={t('code_size_header')} />
    ),
    cell: ({ row }) => {
      return row.getValue('codeSize')
        ? `${row.getValue('codeSize')} B`
        : t('n_a')
    }
  },
  {
    accessorKey: 'ip',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('ip_header')} />
    ),
    cell: ({ row }) => row.getValue('ip')
  }
]
