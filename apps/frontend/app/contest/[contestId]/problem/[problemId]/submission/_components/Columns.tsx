'use client'

import { dateFormatter } from '@/lib/utils'
import type { SubmissionItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<SubmissionItem>[] = [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => <p className="text-sm">{row.original.id}</p>
  },
  {
    header: () => 'User ID',
    accessorKey: 'username',
    cell: ({ row }) => row.original.user.username
  },
  {
    header: () => 'Result',
    accessorKey: 'result',
    cell: ({ row }) => {
      return row.original.result === 'Accepted' ? (
        <p className="text-green-500">{row.original.result}</p>
      ) : row.original.result === 'Judging' ? (
        <p className="text-gray-300">{row.original.result}</p>
      ) : (
        <p className="text-red-500">{row.original.result}</p>
      )
    }
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
