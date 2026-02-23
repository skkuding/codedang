'use client'

import type { UserSubmission } from '@/app/admin/contest/_libs/schemas'
import { cn, getResultColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const createSubmissionColumns = (
  t: (key: string) => string
): ColumnDef<UserSubmission>[] => [
  {
    accessorKey: 'problemTitle',
    header: () => {
      return <div className="py-1 font-mono text-sm">{t('problem_title')}</div>
    },
    cell: ({ row }) => (
      <div className="whitespace-nowrap py-1 text-center text-xs">
        {String.fromCharCode(65 + (row.original.order ?? 0))}.{' '}
        {row.getValue('problemTitle')}
      </div>
    ),
    filterFn: 'arrIncludesSome'
  },
  {
    accessorKey: 'submissionResult',
    header: () => {
      return <p className="font-mono text-sm">{t('result')}</p>
    },
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
    header: () => {
      return <p className="font-mono text-sm">{t('language')}</p>
    },
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs">
        {row.getValue('language')}
      </div>
    )
  },
  {
    accessorKey: 'submissionTime',
    header: () => {
      return <p className="font-mono text-sm">{t('submission_time')}</p>
    },
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
    header: () => {
      return <p className="font-mono text-sm">{t('code_size')}</p>
    },
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs">
        {row.getValue('codeSize') ? `${row.getValue('codeSize')} B` : t('n_a')}
      </div>
    )
  },
  {
    accessorKey: 'ip',
    header: () => {
      return <p className="font-mono text-sm">{t('ip')}</p>
    },
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-center text-xs">
        {row.getValue('ip') ?? t('unknown')}
      </div>
    )
  }
]
