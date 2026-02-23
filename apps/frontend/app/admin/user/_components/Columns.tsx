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

export const getColumns = (
  t: (key: string) => string
): ColumnDef<DataTableUser>[] => {
  return [
    {
      accessorKey: 'id',
      header: () => <p className="text-xs">#</p>,
      cell: ({ row }) => <p>{row.getValue('id')}</p>
    },
    {
      accessorKey: 'username',
      header: () => <p className="text-xs">{t('user_id')}</p>,
      cell: ({ row }) => <p>{row.getValue('username')}</p>
    },
    {
      accessorKey: 'realName',
      header: () => <p className="text-xs">{t('name')}</p>,
      cell: ({ row }) => (
        <p className="text-nowrap">{row.getValue('realName')}</p>
      )
    },
    {
      accessorKey: 'email',
      header: () => <p className="text-xs">{t('email')}</p>,
      cell: ({ row }) => <p>{row.getValue('email')}</p>
    },
    {
      accessorKey: 'studentId',
      header: () => <p className="text-xs">{t('student_id')}</p>,
      cell: ({ row }) => <p>{row.getValue('studentId')}</p>
    },
    {
      accessorKey: 'major',
      header: () => <p className="text-xs">{t('major')}</p>,
      cell: ({ row }) => <p className="text-nowrap">{row.getValue('major')}</p>
    },
    {
      accessorKey: 'role',
      header: () => <p className="text-xs">{t('role')}</p>,
      cell: ({ row }) => <p>{row.getValue('role')}</p>
    },
    {
      accessorKey: 'canCreateCourse',
      header: () => <p className="text-xs">{t('can_create_course')}</p>,
      cell: ({ row, column }) => (
        <UpdatePermissionSwitch row={row} accessorkey={column.id} />
      )
    },
    {
      accessorKey: 'canCreateContest',
      header: () => <p className="text-xs">{t('can_create_contest')}</p>,
      cell: ({ row, column }) => (
        <UpdatePermissionSwitch row={row} accessorkey={column.id} />
      )
    },
    {
      accessorKey: 'lastLogin',
      header: () => <p className="text-xs">{t('last_login')}</p>,
      cell: ({ row }) => (
        <p className="text-nowrap">{row.getValue('lastLogin')}</p>
      )
    },
    {
      accessorKey: 'createTime',
      header: () => <p className="text-xs">{t('create_time')}</p>,
      cell: ({ row }) => (
        <p className="text-nowrap">{row.getValue('createTime')}</p>
      )
    }
  ]
}
