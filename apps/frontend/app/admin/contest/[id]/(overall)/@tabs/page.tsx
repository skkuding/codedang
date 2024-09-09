'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_CONTEST_SCORE_SUMMARIES } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import type { ScoreSummary, ProblemData } from '../../../utils'
import { columns } from './_components/Columns'

export default function Submission() {
  const { id } = useParams()

  const summaries = useQuery(GET_CONTEST_SCORE_SUMMARIES, {
    variables: { contestId: Number(id), take: 300 }
  })
  const summariesData = summaries.data?.getContestScoreSummaries
  const summariesLoading = summaries.loading

  const problems =
    useQuery(GET_CONTEST_PROBLEMS, {
      variables: { groupId: 1, contestId: Number(id) }
    }) || []
  const problemData = problems.data?.getContestProblems
    .slice()
    .sort((a, b) => a.order - b.order)
  const problemLoading = problems.loading

  return (
    <div>
      {summariesLoading || problemLoading ? (
        <>
          <div className="mb-16 flex gap-4">
            <span className="w-2/12">
              <Skeleton className="h-10 w-full" />
            </span>
          </div>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
          ))}
        </>
      ) : (
        <>
          <p className="mb-3 font-medium">
            <span className="text-primary font-bold">
              {summariesData?.length}
            </span>{' '}
            Participants
          </p>
          <ScrollArea>
            <DataTableAdmin
              columns={columns(problemData as ProblemData[])}
              data={summariesData as ScoreSummary[]}
              enableSearch={true}
              searchColumn="realName"
              enablePagination={true}
            />
            <div className="mt-6" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>
      )}
    </div>
  )
}
