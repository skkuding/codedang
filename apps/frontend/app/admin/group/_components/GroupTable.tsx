'use client'

import { GET_GROUPS } from '@/graphql/group/queries'
import { useSuspenseQuery } from '@apollo/client'
import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot
} from '../../_components/table'
import { columns } from './Columns'

export function GroupTable() {
  const { data } = useSuspenseQuery(GET_GROUPS, {
    variables: {
      cursor: 1,
      take: 5
    }
  })
  const groups = data.getGroups.map((group) => ({
    id: Number(group.id),
    groupName: group.groupName,
    description: group.description
  }))

  return (
    <DataTableRoot data={groups} columns={columns}>
      <DataTable getHref={(data) => `/admin/group/${data.id}`} />
      <DataTablePagination />
    </DataTableRoot>
  )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
