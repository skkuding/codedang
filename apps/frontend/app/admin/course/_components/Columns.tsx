import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableCourse {
  id: number
  title: string
  code: string
  semester: string
  studentCount: number
}

export const columns: ColumnDef<DataTableCourse>[] = [
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
        className="translate-y-[2px] bg-transparent"
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
        title="Title"
        className="w-[400px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('title')
    },
    enableSorting: false
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
    cell: ({ row }) => row.getValue('code')
  },
  {
    accessorKey: 'semester',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Semester" />
    ),
    cell: ({ row }) => {
      const yearSeason = row.original.semester
      return (
        <div
          className={cn(
            'border-primary text-primary flex h-[30px] w-[116px] items-center justify-center rounded-full border'
          )}
        >
          <p className="text-body2_m_14">{yearSeason}</p>
        </div>
      )
    }
  },
  {
    accessorKey: 'studentCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => row.getValue('studentCount'),
    enableSorting: false
  }
]
