'use client'

import { dateFormatter } from '@/libs/utils'
import type { SubmissionItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<SubmissionItem>[] = [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => <p className="text-sm">{row.original.id}</p>
  },
  {
    header: () => 'Language',
    accessorKey: 'language',
    cell: ({ row }) => row.original.language
  },
  {
    header: () => 'Submission Time',
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'YYYY-MM-DD HH:mm:ss')
  },
  {
    header: () => 'Code Size',
    accessorKey: 'codeSize',
    cell: ({ row }) => {
      return row.original.codeSize === null ? (
        <p>N/A</p>
      ) : (
        <p>{row.original.codeSize} B</p>
      )
    }
  }
]
