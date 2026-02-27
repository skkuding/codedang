import type { ColumnDef } from '@tanstack/react-table'
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
    header: () => <p className="text-caption4_r_12">#</p>,
    cell: ({ row }) => <p>{row.getValue('id')}</p>
  },
  {
    accessorKey: 'username',
    header: () => <p className="text-caption4_r_12">User ID</p>,
    cell: ({ row }) => <p>{row.getValue('username')}</p>
  },
  {
    accessorKey: 'realName',
    header: () => <p className="text-caption4_r_12">Name</p>,
    cell: ({ row }) => <p className="text-nowrap">{row.getValue('realName')}</p>
  },
  {
    accessorKey: 'email',
    header: () => <p className="text-caption4_r_12">Email</p>,
    cell: ({ row }) => <p>{row.getValue('email')}</p>
  },
  {
    accessorKey: 'studentId',
    header: () => <p className="text-caption4_r_12">Student ID</p>,
    cell: ({ row }) => <p>{row.getValue('studentId')}</p>
  },
  {
    accessorKey: 'major',
    header: () => <p className="text-caption4_r_12">Major</p>,
    cell: ({ row }) => <p className="text-nowrap">{row.getValue('major')}</p>
  },
  {
    accessorKey: 'role',
    header: () => <p className="text-caption4_r_12">Role</p>,
    cell: ({ row }) => <p>{row.getValue('role')}</p>
  },
  {
    accessorKey: 'canCreateCourse',
    header: () => <p className="text-caption4_r_12">Can Create Course</p>,
    cell: ({ row, column }) => (
      <UpdatePermissionSwitch row={row} accessorkey={column.id} />
    )
  },
  {
    accessorKey: 'canCreateContest',
    header: () => <p className="text-caption4_r_12">Can Create Contest</p>,
    cell: ({ row, column }) => (
      <UpdatePermissionSwitch row={row} accessorkey={column.id} />
    )
  },
  {
    accessorKey: 'lastLogin',
    header: () => <p className="text-caption4_r_12">Last Login</p>,
    cell: ({ row }) => (
      <p className="text-nowrap">{row.getValue('lastLogin')}</p>
    )
  },
  {
    accessorKey: 'createTime',
    header: () => <p className="text-caption4_r_12">Create Time</p>,
    cell: ({ row }) => (
      <p className="text-nowrap">{row.getValue('createTime')}</p>
    )
  }
]
