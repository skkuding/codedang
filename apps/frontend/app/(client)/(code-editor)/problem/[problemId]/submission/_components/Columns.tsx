'use client'

import { dateFormatter, getResultColor } from '@/libs/utils'
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
      return t('user_id_header')
    },
    accessorKey: 'username',
    cell: ({ row }) => row.original.user?.username ?? 'Unknown User'
  },
  {
    header: () => {
      return t('result_header')
    },
    accessorKey: 'result',
    cell: ({ row }) => {
      return (
        <p className={getResultColor(row.original.result)}>
          {row.original.result}
        </p>
      )
    }
  },
  {
    header: () => {
      return t('language_header')
    },
    accessorKey: 'language',
    cell: ({ row }) => row.original.language
  },
  {
    header: () => {
      return t('submission_time_header')
    },
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'MMM DD, YYYY HH:mm')
  },
  {
    header: () => {
      return t('code_size_header')
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
