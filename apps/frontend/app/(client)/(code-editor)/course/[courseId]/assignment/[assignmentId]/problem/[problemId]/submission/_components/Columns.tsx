'use client'

import { dateFormatter } from '@/libs/utils'
import type { SubmissionItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const getColumns = (
  t: (key: string) => string
): ColumnDef<SubmissionItem>[] => [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => <p className="text-sm">{row.original.id}</p>
  },
  {
    header: () => {
      return t('language')
    },
    accessorKey: 'language',
    cell: ({ row }) => row.original.language
  },
  {
    header: () => {
      return t('submission_time')
    },
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'MMM DD, YYYY HH:mm')
  },
  {
    header: () => {
      return t('code_size')
    },
    accessorKey: 'codeSize',
    cell: ({ row }) => {
      return row.original.codeSize === null ? (
        <p>{t('n_a')}</p>
      ) : (
        <p>{row.original.codeSize} B</p>
      )
    }
  }
]
