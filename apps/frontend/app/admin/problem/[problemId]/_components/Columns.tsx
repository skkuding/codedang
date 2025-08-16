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

export const columns: ColumnDef<DataTableSubmission>[] = [
  {
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
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
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    accessorKey: 'username',
    cell: ({ row }) => row.original.user?.username
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Result" />
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
      <DataTableColumnHeader column={column} title="Language" />
    ),
    accessorKey: 'language',
    cell: ({ row }) => row.original.language
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission Time" />
    ),
    accessorKey: 'createTime',
    cell: ({ row }) =>
      dateFormatter(row.original.createTime, 'MMM DD, YYYY HH:mm')
  },
  {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code Size" />
    ),
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
