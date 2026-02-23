'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { ColumnDef } from '@tanstack/react-table'

export interface BelongedContest {
  id: number
  title: string
  courseNum: string
  groupId: number
}

export const createColumns = (
  onSelectedAssignmentsChange: (assignments: BelongedContest[]) => void,
  t: (key: string) => string
): ColumnDef<BelongedContest>[] => {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(Boolean(value))
            setTimeout(() => {
              const selectedRows = table.getSelectedRowModel().rows
              const selectedAssignments = selectedRows.map((r) => r.original)
              onSelectedAssignmentsChange(selectedAssignments)
            }, 0)
          }}
          aria-label={t('select_all_aria_label')}
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row, table }) => (
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(Boolean(value))
            setTimeout(() => {
              const selectedRows = table.getSelectedRowModel().rows
              const selectedAssignments = selectedRows.map((r) => r.original)
              onSelectedAssignmentsChange(selectedAssignments)
            }, 0)
          }}
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
          title={t('assignment_title_column_header')}
        />
      ),
      cell: ({ row }) => {
        return row.getValue('title')
      },
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'courseNum',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('course_column_header')}
        />
      ),
      cell: ({ row }) => {
        return row.getValue('courseNum')
      }
    }
  ]
}
