'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { GET_GROUP_MEMBER } from '@/graphql/user/queries'
import { useQuery } from '@apollo/client'
import { ErrorBoundary } from '@suspensive/react'
import Link from 'next/link'
import { Suspense } from 'react'
import { FaAngleLeft } from 'react-icons/fa6'
import { ScoreTable, ScoreTableFallback } from './_components/ScoreTable'
import {
  SubmissionTable,
  SubmissionTableFallback
} from './_components/SubmissionTable'

export default function Page({
  params
}: {
  params: { contestId: string; userId: string }
}) {
  const contestId = Number(params.contestId)
  const userId = Number(params.userId)

  const user = useQuery(GET_GROUP_MEMBER, {
    variables: { groupId: 1, userId }
  })
  const userData = user.data?.getGroupMember

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/contest/${contestId}`}>
              <FaAngleLeft className="h-12 hover:text-gray-700/80" />
            </Link>
            <span className="text-4xl font-bold">
              {userData?.name} ({userData?.studentId})
            </span>
          </div>
        </div>
        <div className="prose mb-4 w-full max-w-full border-y-2 border-y-gray-300 p-5 py-12">
          <div className="flex flex-col gap-4">
            <div className="font-semibold">{userData?.major}</div>
            <div className="flex space-x-4">
              <div className="flex flex-col gap-4 font-medium">
                <span>User ID</span>
                <span>Student ID</span>
              </div>
              <div className="flex flex-col gap-4">
                <span>{userData?.username}</span>
                <span>{userData?.studentId}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<ScoreTableFallback />}>
              <ScoreTable contestId={contestId} userId={userId} />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<SubmissionTableFallback />}>
              <SubmissionTable contestId={contestId} userId={userId} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
