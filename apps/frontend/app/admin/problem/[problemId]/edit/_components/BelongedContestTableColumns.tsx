'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface BelongedContest {
  id: number
  title: string
  state: string
  problemScore: number
  totalScore: number
  isSetToZero: boolean
}

export const columns: ColumnDef<BelongedContest>[] = [
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
        className="translate-y-[2px]"
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
    cell: ({ row }) => {
      return row.getValue('title')
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'state',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    cell: ({ row }) => {
      return row.getValue('state')
    }
  },
  {
    accessorKey: 'problemScore',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem Score" />
    ),
    cell: ({ row }) => (
      <p
        className={cn(
          'text-center font-light text-black',
          row.original.isSetToZero && 'text-primary'
        )}
      >
        {row.original.isSetToZero ? '0' : row.getValue('problemScore')}
      </p>
    )
  },
  {
    accessorKey: 'totalScore',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total Score" />
    ),
    cell: ({ row }) => (
      <p
        className={cn(
          'text-center font-light text-black',
          row.original.isSetToZero && 'text-primary'
        )}
      >
        {row.original.isSetToZero ? '0' : row.getValue('problemScore')}/
        {row.original.isSetToZero
          ? Number(row.getValue('totalScore')) -
            Number(row.getValue('problemScore'))
          : row.getValue('totalScore')}
      </p>
    )
  }
]
