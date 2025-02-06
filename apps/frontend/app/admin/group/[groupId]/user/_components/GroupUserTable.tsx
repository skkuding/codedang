'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot
} from '@/app/admin/_components/table'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useSuspenseQuery } from '@apollo/client'
import { columns } from './Columns'

interface GroupUserTableProps {
  groupId: string
}

export function GroupUserTable({ groupId }: GroupUserTableProps) {
  const { data } = useSuspenseQuery(GET_GROUP_MEMBERS, {
    variables: {
      groupId: Number(groupId),
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
      {/* 유저를 눌렀을 때 해당 학생의 여러 assignment 점수들을 통합한 overall 페이지로 이동하게 만들 예정*/}
      <DataTable />
      <DataTablePagination />
    </DataTableRoot>
  )
}

export function GroupUserTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
