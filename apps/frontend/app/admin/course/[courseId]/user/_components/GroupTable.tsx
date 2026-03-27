'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { InviteUserButton } from '../_components/InviteUserButton'
import { createColumns } from './Columns'
import { DeleteUserButton } from './DeleteUserButton'

export function GroupTable() {
  const params = useParams() // 경로에서 params 가져오기
  const groupId = Number(params.courseId) // 문자열이므로 숫자로 변환

  const { data } = useSuspenseQuery(GET_GROUP_MEMBERS, {
    variables: { groupId, take: 1000, leaderOnly: false }
  })

  const members = data.getGroupMembers.map((member) => ({
    id: member.userId,
    username: member.username,
    userId: member.userId,
    name: member.name,
    email: member.email,
    major: member.major,
    studentId: member.studentId,
    role: member.isGroupLeader ? 'Instructor' : 'Student'
  }))

  return (
    <div>
      <DataTableRoot data={members} columns={createColumns(groupId)}>
        <div className="flex items-center justify-between gap-[10px]">
          <div className="min-w-0 flex-1">
            <DataTableSearchBar columndId="name" className="rounded-full" />
          </div>

          <div className="flex shrink-0 items-center gap-[10px]">
            <DeleteUserButton />
            <InviteUserButton />
          </div>
        </div>

        <div className="mt-[28px]">
          <DataTable />
        </div>
        <div className="mt-[40px]">
          <DataTablePagination showSelection />
        </div>
      </DataTableRoot>
    </div>
  )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={createColumns(1)} />
}
