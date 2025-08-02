'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { useApolloClient } from '@apollo/client'
import { ErrorBoundary } from '@suspensive/react'
import { useParams } from 'next/navigation'
import { Suspense } from 'react'
import { GroupTable, GroupTableFallback } from './_components/GroupTable'
import { InviteButton } from './_components/InviteButton'

export default function Page() {
  const client = useApolloClient()
  const params = useParams() // 경로에서 params 가져오기
  const groupId = Number(params.courseId) // 문자열이므로 숫자로 변환
  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_GROUP_MEMBERS]
    })
  } // 변수 넣어야하나??
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<GroupTableFallback />}>
        <div className="container mx-auto space-y-2 py-10">
          <div className="flex justify-between">
            <h1 className="text-4xl font-bold">MEMBER LIST</h1>
            <InviteButton
              onSuccess={onSuccess}
              params={{
                courseId: groupId
              }}
            />
          </div>
          <GroupTable />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
