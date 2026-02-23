'use client'

import { dateFormatter } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { QnAItemWithCategory } from './QnAMainTable'

export const getQnAColumns = (
  t: (key: string) => string
): ColumnDef<QnAItemWithCategory>[] => [
  {
    accessorKey: 'id',
    header: t('column_no'),
    cell: ({ row }) => row.original.order,
    sortingFn: 'basic',
    sortDescFirst: true
  },
  {
    accessorKey: 'a',
    header: ''
  },
  {
    accessorKey: 'category',
    header: t('column_category'),
    cell: ({ row }) => row.original.categoryName || row.original.category,
    filterFn: (row, id, value) => {
      const category = row.original.categoryName || row.original.category
      if (!category?.length) {
        return false
      }
      return (value as string[]).includes(category)
    }
  },
  {
    accessorKey: 'b',
    header: ''
  },
  {
    accessorKey: 'title',
    header: t('column_question'),
    cell: ({ row }) => row.original.title
  },
  {
    accessorKey: 'c',
    header: ''
  },
  {
    accessorKey: 'writer',
    header: t('column_writer'),
    cell: ({ row }) => row.original.createdBy.username
  },
  {
    accessorKey: 'd',
    header: ''
  },
  {
    accessorKey: 'createTime',
    header: t('column_date'),
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm:ss')
  }
]
