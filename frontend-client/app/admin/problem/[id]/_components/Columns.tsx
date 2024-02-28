'use client'

import type { SubmissionItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'

export const columns: ColumnDef<SubmissionItem>[] = [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => <p className="text-sm">{row.original.id}</p>
  },
  {
    id: 'username',
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
        <p className="text-gray-500">{row.original.result}</p>
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
      dayjs(row.original.createTime).format('YYYY-MM-DD HH:mm:ss')
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
