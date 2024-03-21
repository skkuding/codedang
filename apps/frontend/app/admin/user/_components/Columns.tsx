import type { ColumnDef } from '@tanstack/react-table'

interface DataTableUser {
  username: string
  userId: number
  name: string
  email: string
}

export const columns: ColumnDef<DataTableUser>[] = [
  {
    accessorKey: 'userId',
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('userId')}</div>
  },
  {
    accessorKey: 'username',
    header: 'Username',
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
