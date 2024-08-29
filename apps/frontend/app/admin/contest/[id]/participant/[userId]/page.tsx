'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { GET_GROUP_MEMBER } from '@/graphql/user/queries'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { FaAngleLeft } from 'react-icons/fa6'
import type { ScoreSummary, ProblemData } from '../../../utils'
import { scoreColumns } from './_components/ScoreColumns'
import { submissionColumns } from './_components/SubmissionColumns'

export default function Page({
  params
}: {
  params: { id: string; userId: string }
}) {
  const { id, userId } = params

  const user = useQuery(GET_GROUP_MEMBER, {
    variables: { groupId: 1, userId: Number(userId) }
  })
  const userData = user.data?.getGroupMember

  const submissions = useQuery(GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER, {
    variables: { contestId: Number(id), userId: Number(userId) }
  })
  const submissionsLoading = submissions.loading
  const scoreData =
    submissions.data?.getContestSubmissionSummaryByUserId.scoreSummary || []
  const submissionsData =
    submissions.data?.getContestSubmissionSummaryByUserId.submissions || []

  const problems =
    useQuery(GET_CONTEST_PROBLEMS, {
      variables: { groupId: 1, contestId: Number(id) },
      onCompleted: (data) => console.log(data.getContestProblems)
    }) || []
  const problemData = problems.data?.getContestProblems
    .slice()
    .sort((a, b) => a.order - b.order)
  const problemLoading = problems.loading

  return (
    <ScrollArea className="shrink-0">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin/contest/${id}`}>
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
        <div>
          {submissionsLoading || problemLoading ? (
            <>
              <div className="mb-16 flex gap-4">
                <span className="w-2/12">
                  <Skeleton className="h-10 w-full" />
                </span>
              </div>
              {[...Array(8)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="my-2 flex h-12 w-full rounded-xl"
                />
              ))}
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <DataTableAdmin
                columns={scoreColumns(problemData as ProblemData[])}
                data={[scoreData] as ScoreSummary[]}
              />
              <DataTableAdmin
                columns={submissionColumns}
                data={submissionsData}
                enableSearch={true}
                enablePagination={true}
                enableFilter={true}
                enableProblemFilter={true}
              />
            </div>
          )}
        </div>
      </main>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
