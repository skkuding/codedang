'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import { cn, dateFormatter, getStatusColor } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableContest {
  id: number
  title: string
  startTime: string
  endTime: string
  description?: string | null | undefined
  participants: number
  status: string
}

export const getColumns = (
  t: (key: string) => string
): ColumnDef<DataTableContest>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label={t('select_all_aria_label')}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label={t('select_row_aria_label')}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('title_column_header')}
        className="w-[400px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('title')
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'participants',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('participants_column_header')}
      />
    ),
    cell: ({ row }) => {
      return row.original.participants
    }
  },
  {
    accessorKey: 'startTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('period_column_header')}
        className="text-center"
      />
    ),
    cell: ({ row }) => {
      return `${dateFormatter(row.original.startTime, 'YY-MM-DD HH:mm:ss')} ~ ${dateFormatter(row.original.endTime, 'YY-MM-DD HH:mm:ss')}`
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('state_column_header')} />
    ),
    cell: ({ row }) => (
      <p
        className={cn(
          `flex h-7 w-20 items-center justify-center rounded-full border border-solid text-center font-normal text-neutral-500 md:w-[92px]`,
          getStatusColor(row.original.status)
        )}
      >
        {row.original.status}
      </p>
    )
  }
]
