'use client'

import { dateFormatter } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { QnAItemWithCategory } from './QnAMainTable'

export const QnAColumns: ColumnDef<QnAItemWithCategory>[] = [
  {
    accessorKey: 'id',
    header: 'No',
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
    header: 'Category',
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
    header: 'Question',
    cell: ({ row }) => row.original.title
  },
  {
    accessorKey: 'c',
    header: ''
  },
  {
    accessorKey: 'writer',
    header: 'Writer',
    cell: ({ row }) => row.original.createdBy.username
  },
  {
    accessorKey: 'd',
    header: ''
  },
  {
    accessorKey: 'createTime',
    header: 'Date',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm:ss')
  }
]
