'use client'

import { dateFormatter } from '@/libs/utils'
import type { SubmissionItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<SubmissionItem>[] = [
  {
    header: '#',
    accessorKey: 'id',
    cell: ({ row }) => <p className="text-body4_r_14">{row.original.id}</p>
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
      dateFormatter(row.original.createTime, 'MMM DD, YYYY HH:mm')
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
