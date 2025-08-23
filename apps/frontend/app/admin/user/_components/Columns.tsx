import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../../_components/table/DataTableColumnHeader'
import { UpdatePermissionSwitch } from './UpdatePermissionSwitch'

export interface DataTableUser {
  id: number
  username: string
  email: string
  studentId: string
  major: string
  role: string
  canCreateCourse: boolean
  canCreateContest: boolean
  lastLogin: string
  createTime: string
}

export const columns: ColumnDef<DataTableUser>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="#" filterType="number" />
    ),
    cell: ({ row }) => <p>{row.getValue('id')}</p>
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="User ID"
        filterType="search"
      />
    ),
    cell: ({ row }) => <p>{row.getValue('username')}</p>
  },
  {
    accessorKey: 'realName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" filterType="search" />
    ),
    cell: ({ row }) => <p className="text-nowrap">{row.getValue('realName')}</p>
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Email"
        filterType="search"
      />
    ),
    cell: ({ row }) => <p>{row.getValue('email')}</p>
  },
  {
    accessorKey: 'studentId',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Student ID"
        filterType="search"
      />
    ),
    cell: ({ row }) => <p>{row.getValue('studentId')}</p>
  },
  {
    accessorKey: 'major',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Major"
        filterType="multi-select"
      />
    ),
    cell: ({ row }) => <p className="text-nowrap">{row.getValue('major')}</p>
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Role"
        filterType="multi-select"
      />
    ),
    cell: ({ row }) => <p>{row.getValue('role')}</p>
  },
  {
    accessorKey: 'canCreateCourse',
    header: () => <p className="text-xs">Can Create Course</p>,
    cell: ({ row, column }) => (
      <UpdatePermissionSwitch row={row} accessorkey={column.id} />
    )
  },
  {
    accessorKey: 'canCreateContest',
    header: () => <p className="text-xs">Can Create Contest</p>,
    cell: ({ row, column }) => (
      <UpdatePermissionSwitch row={row} accessorkey={column.id} />
    )
  },
  {
    accessorKey: 'lastLogin',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Login"
        filterType="date"
      />
    ),
    cell: ({ row }) => (
      <p className="text-nowrap">{row.getValue('lastLogin')}</p>
    )
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Create Time"
        filterType="date"
      />
    ),
    cell: ({ row }) => (
      <p className="text-nowrap">{row.getValue('createTime')}</p>
    )
  }
]
