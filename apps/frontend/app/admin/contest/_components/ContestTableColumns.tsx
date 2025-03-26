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
  description: string
  participants: number
  status: string
}

export const columns: ColumnDef<DataTableContest>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label="Select all"
        className="translate-y-[2px] bg-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
        className="translate-y-[2px] bg-white"
      />
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
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-normal">
        {row.getValue('title')}
      </p>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'participants',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Participants" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-center font-normal text-neutral-500">
        {row.original.participants}
      </p>
    ),
    size: 100
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
      <p className="overflow-hidden whitespace-nowrap text-center font-normal text-neutral-500">
        {`${dateFormatter(row.original.startTime, 'YY-MM-DD HH:mm')} ~ ${dateFormatter(row.original.endTime, 'YY-MM-DD HH:mm')}`}
      </p>
    ),
    size: 250
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="State" />
      </div>
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
