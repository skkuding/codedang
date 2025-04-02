import type { ColumnDef } from '@tanstack/react-table'
import { UpdatePermission } from './UpdatePermission'

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
    header: () => <p className="text-xs">#</p>,
    cell: ({ row }) => <p>{row.getValue('id')}</p>
  },
  {
    accessorKey: 'username',
    header: () => <p className="text-xs">User ID</p>,
    cell: ({ row }) => <p>{row.getValue('username')}</p>
  },
  {
    accessorKey: 'realName',
    header: () => <p className="text-xs">Name</p>,
    cell: ({ row }) => <p className="text-nowrap">{row.getValue('realName')}</p>
  },
  {
    accessorKey: 'email',
    header: () => <p className="text-xs">Email</p>,
    cell: ({ row }) => <p>{row.getValue('email')}</p>
  },
  {
    accessorKey: 'studentId',
    header: () => <p className="text-xs">Student ID</p>,
    cell: ({ row }) => <p>{row.getValue('studentId')}</p>
  },
  {
    accessorKey: 'major',
    header: () => <p className="text-xs">Major</p>,
    cell: ({ row }) => <p className="text-nowrap">{row.getValue('major')}</p>
  },
  {
    accessorKey: 'role',
    header: () => <p className="text-xs">Role</p>,
    cell: ({ row }) => <p>{row.getValue('role')}</p>
  },
  {
    accessorKey: 'canCreateCourse',
    header: () => <p className="text-xs">Can Create Course</p>,
    cell: ({ row, column }) => (
      <UpdatePermission row={row} accessorkey={column.id} />
    )
  },
  {
    accessorKey: 'canCreateContest',
    header: () => <p className="text-xs">Can Create Contest</p>,
    cell: ({ row, column }) => (
      <UpdatePermission row={row} accessorkey={column.id} />
    )
  },
  {
    accessorKey: 'lastLogin',
    header: () => <p className="text-xs">Last Login</p>,
    cell: ({ row }) => (
      <p className="text-nowrap">{row.getValue('lastLogin')}</p>
    )
  },
  {
    accessorKey: 'createTime',
    header: () => <p className="text-xs">Create Time</p>,
    cell: ({ row }) => (
      <p className="text-nowrap">{row.getValue('createTime')}</p>
    )
  }
]
