'use client'

import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useSuspenseQuery } from '@apollo/client'
import DataTable from '../../_components/table/DataTable'
import DataTableFallback from '../../_components/table/DataTableFallback'
import DataTablePagination from '../../_components/table/DataTablePagination'
import DataTableRoot from '../../_components/table/DataTableRoot'
import { columns } from './Columns'

export function UserTable() {
  const { data } = useSuspenseQuery(GET_GROUP_MEMBERS, {
    variables: {
      groupId: 1,
      cursor: 1,
      take: 1000,
      leaderOnly: false
    }
  })
  const users = data.getGroupMembers.map((member) => ({
    ...member,
    id: member.userId
  }))

  return (
    <DataTableRoot data={users} columns={columns}>
      <DataTable />
      <DataTablePagination />
    </DataTableRoot>
  )
}

export function UserTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
