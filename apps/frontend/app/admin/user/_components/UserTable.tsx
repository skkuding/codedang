'use client'

import { GET_USERS } from '@/graphql/user/queries'
import { dateFormatter } from '@/libs/utils'
import { useSuspenseQuery } from '@apollo/client'
import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../_components/table'
import { columns } from './Columns'

export function UserTable() {
  const { data } = useSuspenseQuery(GET_USERS, {
    variables: {
      take: 5000
    }
  })
  const users = data.getUsers

  const mappedUsers = users.map((user) => ({
    id: Number(user.id),
    username: user.username,
    email: user.email,
    studentId: user.studentId,
    major: user.major ?? '-',
    role: user.role,
    canCreateCourse: user.canCreateCourse,
    canCreateContest: user.canCreateContest,
    lastLogin: dateFormatter(user.lastLogin, 'YYYY-MM-DD HH:mm:ss'),
    createTime: dateFormatter(
      user.userProfile?.createTime,
      'YYYY-MM-DD HH:mm:ss'
    )
  }))

  return (
    <DataTableRoot data={mappedUsers} columns={columns}>
      <DataTableSearchBar columndId="username" />
      <div className="[&_tr]:cursor-default">
        <DataTable />
      </div>
      <DataTablePagination />
    </DataTableRoot>
  )
}

export function UserTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
