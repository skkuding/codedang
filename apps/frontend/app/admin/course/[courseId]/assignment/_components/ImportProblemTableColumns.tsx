import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Badge } from '@/components/shadcn/badge'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Link from 'next/link'
import { CiShare1 } from 'react-icons/ci'
import { FaCheck } from 'react-icons/fa6'
import { toast } from 'sonner'
import type { Solution } from '../../_libs/type'

export interface DataTableProblem {
  id: number
  title: string
  updateTime: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
  languages: string[]
  score?: number
  order?: number
  solutionReleaseTime: Date | null
  solution: Solution[]
}

export const DEFAULT_PAGE_SIZE = 5
export const MAX_SELECTED_ROW_COUNT = 20
export const ERROR_MESSAGE = `You can only import up to ${MAX_SELECTED_ROW_COUNT} problems in a assignment`
export const columns: ColumnDef<DataTableProblem>[] = [
  {
    accessorKey: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={() => {
          const currentPageNotSelectedCount = table
            .getRowModel()
            .rows.filter((row) => !row.getIsSelected()).length
          const selectedRowCount = table.getSelectedRowModel().rows.length

          if (
            selectedRowCount + currentPageNotSelectedCount <=
            MAX_SELECTED_ROW_COUNT
          ) {
            table.toggleAllPageRowsSelected()
            table.setSorting([{ id: 'select', desc: true }]) // NOTE: force to trigger sortingFn
          } else {
            toast.error(ERROR_MESSAGE)
          }
        }}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    sortingFn: (rowA, rowB) => {
      const aSelected = rowA.getIsSelected()
      const bSelected = rowB.getIsSelected()

      if (aSelected === bSelected) {
        return 0
      }
      return aSelected ? 1 : -1
    },
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Title"
        className="w-[32%] justify-start"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-[32%] flex-col overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
          {row.getValue('title')}
        </div>
      )
    },
    enableHiding: false,
    enableSorting: false
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Update"
        className="w-[23%]"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-[23%]">
          {row.original.updateTime.substring(2, 10)}
        </div>
      )
    }
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Level"
        className="w-[14%]"
      />
    ),
    cell: ({ row }) => {
      const level: string = row.getValue('difficulty')
      const formattedLevel = `Level ${level.slice(-1)}`
      return (
        <div className="flex w-[14%] justify-end">
          <Badge
            variant={level as Level}
            className="whitespace-nowrap rounded-md px-1.5 py-1 font-normal"
          >
            {formattedLevel}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'solution',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Solution"
        className="flex w-[14%] justify-center"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[14%] justify-center">
          {row.original.solution.some((solution) => solution.code !== '') ? (
            <FaCheck />
          ) : (
            '-'
          )}
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'preview',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Preview"
        className="flex w-[13%] justify-center"
      />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/problem/${row.original.id}/preview`}
          target="_blank"
          className="flex w-[13%] justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <CiShare1 size={20} />
        </Link>
      )
    },
    enableSorting: false
  }
]
