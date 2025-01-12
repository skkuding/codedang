import type { ColumnDef } from '@tanstack/react-table'

interface DataTableUser {
  id: number
  username: string
  userId: number
  name: string
  email: string
}

export const columns: ColumnDef<DataTableUser>[] = [
  {
    accessorKey: 'userId',
    header: '#',
    cell: ({ row }) => <div>{row.getValue('userId')}</div>
  },
  {
    accessorKey: 'username',
    header: 'User ID',
    cell: ({ row }) => <div>{row.getValue('username')}</div>
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
  }
]
