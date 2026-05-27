'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { dateFormatter } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableQna {
  id: number
  title: string
  startTime: string
  dueTime?: string
  endTime: string
  description: string
  participants: number
  isVisible: boolean
  isRankVisible: boolean
  week: number
}

export const columns: ColumnDef<DataTableQna>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" className="w-30" />
    ),
    cell: ({ row }) => {
      return <div className="max-w-30 truncate">{row.getValue('title')}</div>
    }
  },
  {
    accessorKey: 'isRankVisible',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
        className="w-[140px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('isRankVisible') ? 'Exercise' : 'Assignment'
    }
  },
  {
    accessorKey: 'week',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Week" />
    ),
    cell: ({ row }) => {
      return row.getValue('week')
    }
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Question"
        className="w-[290px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('description')
    },
    enableSorting: false
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Writer"
        className="w-[100px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('id')
    },
    enableSorting: false
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Date"
        className="w-[140px]"
      />
    ),
    cell: ({ row }) => {
      return dateFormatter(row.getValue('startTime'), 'YY-MM-DD HH:mm')
    },
    enableSorting: false
  },
  {
    accessorKey: 'isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Answer"
        className="w-[102px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <div>
          {row.getValue('isVisible') ? (
            <div className="bg-color-neutral-99 text-color-neutral-70 border-color-neutral-90 items-center justify-center rounded-full border px-5 py-2 font-medium">
              Answered
            </div>
          ) : (
            <div className="text-primary border-primary items-center justify-center rounded-full border px-5 py-2 font-medium">
              Unanswered
            </div>
          )}
        </div>
      )
    },
    enableSorting: false
  }
]
