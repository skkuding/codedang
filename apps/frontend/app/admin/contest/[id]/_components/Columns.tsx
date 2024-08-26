'use client'

import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import OptionSelect from '@/components/OptionSelect'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import type { ContestProblem } from '../../utils'

export const columns = (
  setProblems: React.Dispatch<React.SetStateAction<ContestProblem[]>>
): ColumnDef<ContestProblem>[] => [
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
    cell: ({ row }) => <p className="text-left">{row.getValue('title')}</p>,
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
            value={
              row.original.order !== undefined
                ? String.fromCharCode(Number(65 + row.original.order))
                : String.fromCharCode(Number(65 + row.index))
            }
            options={alphabetArray}
            onChange={(selectedOrder) => {
              setProblems((prevProblems: ContestProblem[]) =>
                prevProblems.map((problem) =>
                  problem.id === row.original.id
                    ? { ...problem, order: selectedOrder.charCodeAt(0) - 65 }
                    : problem
                )
              )
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
