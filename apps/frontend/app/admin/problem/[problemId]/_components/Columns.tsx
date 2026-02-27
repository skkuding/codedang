'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { dateFormatter, getResultColor } from '@/libs/utils'
import type { Submission } from '@generated/graphql'
import type { ColumnDef } from '@tanstack/react-table'

interface DataTableSubmission
  extends Omit<
    Submission,
    'id' | 'problemId' | '_count' | 'score' | 'problem' | 'updateTime'
  > {
  id: number
}

export const getColumns = (
  t: (key: string) => string
): ColumnDef<DataTableSubmission>[] => [
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('column_header_id')} />
    ),
    accessorKey: 'id',
    cell: ({ row }) => row.original.id,
    filterFn: (row, _, value) => {
      const id = row.original.id
      return id.toString().includes(value)
    }
  },
  {
    id: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('column_header_user_id')}
      />
    ),
    accessorKey: 'username',
    cell: ({ row }) => row.original.user?.username
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('column_header_result')}
      />
    ),
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
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('column_header_language')}
      />
    ),
    accessorKey: 'language',
    cell: ({ row }) => row.original.language
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('column_header_submission_time')}
      />
    ),
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'MMM DD, YYYY HH:mm')
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('column_header_code_size')}
      />
    ),
    accessorKey: 'codeSize',
    cell: ({ row }) => {
      return row.original.codeSize === null ? (
        <p>{t('not_available')}</p>
      ) : (
        <p>{row.original.codeSize} B</p>
      )
    }
  }
]
