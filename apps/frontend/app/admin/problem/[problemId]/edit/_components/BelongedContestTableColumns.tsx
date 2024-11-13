'use client'

import DataTableColumnHeader from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'

export interface BelongedContest {
  id: number
  title: string
  state: string
}

export const columns: ColumnDef<BelongedContest>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] bg-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
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
      <DataTableColumnHeader column={column} title="Contest Title" />
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
    accessorKey: 'state',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="State" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-center font-normal">{row.getValue('state')}</p>
    )
  }
]
