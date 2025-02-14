import type { ColumnDef } from '@tanstack/react-table'

interface DataTableGroupUser {
  id: number
  studentId: string
  name: string
  email: string
  role: string
}

export const columns: ColumnDef<DataTableGroupUser>[] = [
  {
    accessorKey: 'studentId',
    header: 'Student ID',
    cell: ({ row }) => <div>{row.getValue('studentId')}</div>
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return <div>{row.getValue('name') || '-'}</div>
    }
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div>{row.getValue('email')}</div>
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <div>{row.getValue('role')}</div>
  }
]
