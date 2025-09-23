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
      <div className="flex text-left">
        <DataTableColumnHeader column={column} title="Title" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
        {row.getValue('title')}
      </p>
    ),
    enableSorting: false
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Code" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
        {row.getValue('code')}
      </p>
    )
  },
  {
    accessorKey: 'semester',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Semester" />
      </div>
    ),
    cell: ({ row }) => {
      const yearSeason = row.original.semester
      return (
        <div className="flex justify-center">
          <div
            className={cn(
              'border-primary text-primary flex h-[30px] w-[116px] items-center justify-center rounded-full border'
            )}
          >
            <p className="text-sm font-medium">{yearSeason}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'studentCount',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader
          column={column}
          title="Members"
          className="text-center"
        />
      </div>
    ),
    cell: ({ row }) => (
      <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">
        {row.getValue('studentCount')}
      </p>
    ),
    enableSorting: false
  }
]
