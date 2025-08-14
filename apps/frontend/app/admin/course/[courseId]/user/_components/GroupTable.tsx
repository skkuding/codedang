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
      <div className="flex gap-2 text-base font-bold">
        <span className="text-primary">{members.length}</span>
        <span>Members</span>
      </div>
      <h1 className="mb-5 text-lg font-normal text-gray-500">
        Here&apos;s a list of the instructors and students of the course
      </h1>
      <DataTableRoot data={members} columns={createColumns(groupId)}>
        <div className="flex justify-between">
          <DataTableSearchBar columndId="name" className="rounded-full" />
          <DeleteUserButton />
        </div>
        <DataTable />
        <DataTablePagination showSelection />
      </DataTableRoot>
    </div>
  )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={createColumns(1)} />
}
