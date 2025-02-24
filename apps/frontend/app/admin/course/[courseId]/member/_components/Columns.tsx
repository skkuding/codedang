import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
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
