'use client'

import { dateFormatter, getResultColor, omitString } from '@/libs/utils'
import type { SubmissionItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const getColumns = (
  t: (key: string) => string
): ColumnDef<SubmissionItem>[] => [
  {
    header: 'Id',
    accessorKey: 'id',
    cell: ({ row }) => <p className="text-sm">{row.original.id}</p>
  },
  {
    header: () => {
      return t('problem_head')
    },
    accessorKey: 'problem',
    cell: ({ row }) =>
      omitString({ targetString: row.original.problem.title, maxlength: 13 })
  },
  {
    header: () => {
      return t('result_head')
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
      return t('language_head')
    },
    accessorKey: 'language',
    cell: ({ row }) => {
      return (
        <p>{row.original.language !== 'Cpp' ? row.original.language : 'C++'}</p>
      )
    }
  },
  {
    header: () => {
      return t('submission_time_head')
    },
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm:ss')
  },
  {
    header: () => {
      return t('code_size_head')
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
