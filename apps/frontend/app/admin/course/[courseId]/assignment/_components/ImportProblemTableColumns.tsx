import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Badge } from '@/components/shadcn/badge'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { BaseDataTableProblem, Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import type { useTranslate } from '@tolgee/react'
import Link from 'next/link'
import { CiShare1 } from 'react-icons/ci'
import { FaCheck } from 'react-icons/fa6'
import { toast } from 'sonner'
import type { Solution } from '../../_libs/type'

export interface AssignmentProblem extends BaseDataTableProblem {
  solutionReleaseTime: Date | null
  solution: Solution[]
}

export const DEFAULT_PAGE_SIZE = 5
export const MAX_SELECTED_ROW_COUNT = 20

export const getColumns = (
  t: ReturnType<typeof useTranslate>['t']
): ColumnDef<AssignmentProblem>[] => [
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
            toast.error(
              t('import_problem_error_message', {
                count: MAX_SELECTED_ROW_COUNT
              })
            )
          }
        }}
        aria-label={t('select_all_aria_label')}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        aria-label={t('select_row_aria_label')}
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
      <DataTableColumnHeader column={column} title={t('title_column_header')} />
    ),
    cell: ({ row }) => row.getValue('title'),
    sortingFn: (rowA, rowB) => {
      const titleA = rowA.original.title
      const titleB = rowB.original.title
      return titleA.localeCompare(titleB, ['en', 'ko'], { numeric: true })
    },
    enableHiding: false
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('update_column_header')}
      />
    ),
    cell: ({ row }) => row.original.updateTime.substring(2, 10)
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('level_column_header')} />
    ),
    cell: ({ row }) => {
      const level: string = row.getValue('difficulty')
      return <Badge variant={level as Level}>Level {level.slice(-1)}</Badge>
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
        title={t('solution_column_header')}
      />
    ),
    cell: ({ row }) => {
      return row.original.solution.some((solution) => solution.code !== '') ? (
        <FaCheck />
      ) : (
        '-'
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'preview',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={t('preview_column_header')}
      />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/problem/${row.original.id}/preview`}
          target="_blank"
          className="flex justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <CiShare1 size={20} />
        </Link>
      )
    },
    enableSorting: false
  }
]
