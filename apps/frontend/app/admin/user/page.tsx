'use client'

import { gql } from '@generated'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import { ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@apollo/client'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { columns } from './_components/Columns'

const GET_GROUP_MEMBERS = gql(`
  query GetGroupMembers($groupId: Int!, $cursor: Int, $take: Int!, $leaderOnly: Boolean!) {
    getGroupMembers(groupId: $groupId, cursor: $cursor, take: $take, leaderOnly: $leaderOnly) {
      username
      userId
      name
      email
    }
  }
`)

export default function User() {
  const { data, loading } = useQuery(GET_GROUP_MEMBERS, {
    variables: {
      groupId: 1,
      cursor: 1,
      take: 1000,
      leaderOnly: false
    }
  })
  return (
    <ScrollArea className="shrink-0">
      <div className="container mx-auto space-y-5 py-10">
        <div className="flex justify-between">
          <h1 className="text-4xl font-bold">User List</h1>
        </div>
        {loading ? (
          <>
            <div className="mb-16 flex gap-4">
              <span className="w-2/12">
                <Skeleton className="h-10 w-full" />
              </span>
              <span className="w-1/12">
                <Skeleton className="h-10 w-full" />
              </span>
              <span className="w-1/12">
                <Skeleton className="h-10 w-full" />
              </span>
            </div>
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
            ))}
          </>
        ) : (
          <DataTableAdmin
            columns={columns}
            data={
              data?.getGroupMembers.map((member) => {
                return {
                  username: member.username,
                  userId: member.userId,
                  name: member.name,
                  email: member.email
                }
              }) ?? []
            }
            enablePagination
          />
        )}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
