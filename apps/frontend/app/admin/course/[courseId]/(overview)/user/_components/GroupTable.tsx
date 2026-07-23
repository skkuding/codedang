'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { GET_WHITE_LIST_ENTRIES } from '@/graphql/course/queries'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useQuery, useSuspenseQuery } from '@apollo/client'
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

  // Roster names are optional (instructors, pre-roster members, or a
  // backend that doesn't support this query yet all have no entry here),
  // so a fetch error just means everyone falls back to their account name.
  const { data: whitelistData } = useQuery(GET_WHITE_LIST_ENTRIES, {
    variables: { groupId },
    errorPolicy: 'ignore'
  })
  const rosterNameByStudentId = new Map(
    whitelistData?.getWhitelistEntries
      .filter((entry) => entry.name)
      .map((entry) => [entry.studentId, entry.name as string])
  )

  const members = data.getGroupMembers.map((member) => ({
    id: member.userId,
    username: member.username,
    userId: member.userId,
    name: rosterNameByStudentId.get(member.studentId) ?? member.name,
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
