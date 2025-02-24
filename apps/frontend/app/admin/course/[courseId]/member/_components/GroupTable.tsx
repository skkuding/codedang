'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { INVITE_USER } from '@/graphql/user/mutation'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { columns } from './Columns'
import { InviteButton } from './InviteButton'

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
    role: member.role
  }))

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_GROUP_MEMBERS]
    })
  } // 변수 넣어야하나??

  return (
    <div>
      <DataTableRoot data={members} columns={columns}>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <DataTableSearchBar columndId="title" className="rounded-full" />
            <InviteButton
              onSuccess={onSuccess}
              params={{
                courseId: groupId
              }}
            />
          </div>
        </div>
        <DataTable headerStyle={headerStyle} />
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}

export function GroupTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
