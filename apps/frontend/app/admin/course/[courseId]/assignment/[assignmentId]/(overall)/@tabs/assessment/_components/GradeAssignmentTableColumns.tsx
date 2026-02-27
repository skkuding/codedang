'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { formatDateRange } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableGrade {
  id: number
  title: string
  startTime: string
  endTime: string
  week: number
}

export const getColumns = (
  t: (key: string) => string
): ColumnDef<DataTableGrade>[] => [
  {
    accessorKey: 'week',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('week_header')} />
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-center font-medium">
        Week {row.getValue('week')}
      </p>
    ),
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('title_header')} />
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
          title={t('period_header')}
          className="text-center"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="max-w-[270px] flex-1 text-left">
          <p className="overflow-hidden whitespace-nowrap">
            {formatDateRange(row.original.startTime, row.original.endTime)}
          </p>
        </div>
      </div>
    ),
    size: 250
  }
]
