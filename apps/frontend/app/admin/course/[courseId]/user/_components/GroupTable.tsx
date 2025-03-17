'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { DELETE_GROUP_MEMBER } from '@/graphql/user/mutation'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { createColumns } from './Columns'
import { DeleteUserButton } from './DeleteUserButton'

const headerStyle = {
  select: '',
  groupName: 'w-2/5',
  courseNum: 'px-0 w-1/5',
  semester: 'px-0 w-1/5',
  members: 'px-0 w-1/6'
}

export function GroupTable() {
  const client = useApolloClient()
  const params = useParams() // 경로에서 params 가져오기
  const groupId = Number(params.courseId) // 문자열이므로 숫자로 변환
  const [deleteGroupMember] = useMutation(DELETE_GROUP_MEMBER)
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

  const deleteTarget = (userId: number, groupId: number) => {
    return deleteGroupMember({
      variables: {
        groupId,
        userId
      }
    })
  }

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_GROUP_MEMBERS]
    })
  }

  return (
    <div>
      <DataTableRoot data={members} columns={createColumns(groupId)}>
        <div className="flex justify-between">
          <DataTableSearchBar columndId="name" className="rounded-full" />
          <DeleteUserButton deleteTarget={deleteTarget} onSuccess={onSuccess} />
        </div>
        <DataTable headerStyle={headerStyle} />
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={createColumns(1)} />
}
