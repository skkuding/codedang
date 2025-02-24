import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableMember {
  id: number
  name: string
  email: string
  major: string
  studentId: string
  role: string
}

export const columns: ColumnDef<DataTableMember>[] = [
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
    accessorKey: 'studentId',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Student ID" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
        {row.getValue('studentId')}
      </p>
    )
  },
  {
    accessorKey: 'major',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Major" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
        {row.getValue('major')}
      </p>
    )
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="User ID" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="max-w-[700px] overflow-hidden text-ellipsis whitespace-nowrap font-medium">
        {row.getValue('id')}
      </p>
    )
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Name" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="whitespace-nowrapfont-medium max-w-[700px] overflow-hidden text-ellipsis">
        {row.getValue('name')}
      </p>
    )
  },
  {
    accessorKey: 'string',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Role" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="whitespace-nowrapfont-medium max-w-[700px] overflow-hidden text-ellipsis">
        {row.getValue('string')}
      </p>
    )
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Email" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="whitespace-nowrapfont-medium max-w-[700px] overflow-hidden text-ellipsis">
        {row.getValue('email')}
      </p>
    )
  }
]
