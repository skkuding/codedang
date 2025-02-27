'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { dateFormatter } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableGrade {
  id: number
  title: string
  startTime: string
  endTime: string
  week: number
}

export const columns: ColumnDef<DataTableGrade>[] = [
  {
    accessorKey: 'week',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Week" />
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
        {row.getValue('week')}
      </p>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
        {row.getValue('title')}
      </p>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader
          column={column}
          title="Period"
          className="text-center"
        />
      </div>
    ),
    cell: ({ row }) => (
      <p className="overflow-hidden whitespace-nowrap text-center font-normal">
        {`${dateFormatter(row.original.startTime, 'YY-MM-DD HH:mm')} ~ ${dateFormatter(row.original.endTime, 'YY-MM-DD HH:mm')}`}
      </p>
    ),
    size: 250
  }
]
