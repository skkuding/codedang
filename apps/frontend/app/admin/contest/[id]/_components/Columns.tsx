'use client'

import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import OptionSelect from '@/components/OptionSelect'
import { Checkbox } from '@/components/ui/checkbox'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

interface Problem {
  id: number
  title: string
  order: number
  difficulty: Level
}

export const columns: ColumnDef<Problem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
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
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => row.getValue('title'),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'order',
    header: () => <p className="text-center text-sm">Order</p>,
    cell: ({ table, row }) => {
      const tableRows = table.getRowModel().rows
      const alphabetArray = tableRows.map((_, index) =>
        String.fromCharCode(65 + index)
      )
      return (
        <div className="flex justify-center">
          <OptionSelect
            placeholder={
              row.original.order !== undefined
                ? String.fromCharCode(Number(65 + row.original.order))
                : String.fromCharCode(Number(65 + row.index))
            }
            options={alphabetArray}
            onChange={(selectedOrder) => {
              const storedValue = localStorage.getItem('orderArray')
              const orderArray = storedValue ? JSON.parse(storedValue) : []
              orderArray[row.index] = Number(
                selectedOrder.charCodeAt(0) - 'A'.charCodeAt(0)
              )
              localStorage.setItem('orderArray', JSON.stringify(orderArray))
            }}
          />
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Level" />
      </div>
    ),
    cell: ({ row }) => <p className="text-center">{row.original.difficulty}</p>
  }
]
