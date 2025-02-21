'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Skeleton } from '@/components/shadcn/skeleton'
import { GET_CONTEST_SCORE_SUMMARIES } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { createColumns } from './Columns'

export function ParticipantTable({ contestId }: { contestId: number }) {
  const summaries = useSuspenseQuery(GET_CONTEST_SCORE_SUMMARIES, {
    variables: { contestId, take: 300 }
  })
  const summariesData = summaries.data.getContestScoreSummaries.map((item) => ({
    ...item,
    id: item.userId
  }))

  const problems = useSuspenseQuery(GET_CONTEST_PROBLEMS, {
    variables: { groupId: 1, contestId }
  })

  const problemData = problems.data.getContestProblems
    .slice()
    .sort((a, b) => a.order - b.order)

  return (
    <div>
      <p className="mb-3 font-medium">
        <span className="text-primary font-bold">{summariesData.length}</span>{' '}
        Participants
      </p>
      <DataTableRoot data={summariesData} columns={createColumns(problemData)}>
        <DataTableSearchBar columndId="realName" placeholder="Search Name" />
        <DataTable
          getHref={(data) =>
            `/admin/contest/${contestId}/participant/${data.id}`
          }
        />
        <DataTablePagination />
      </DataTableRoot>
    </div>
  )
}

export function ParticipantTableFallback() {
  return (
    <div>
      <Skeleton className="mb-3 h-[24px] w-2/12" />
      <DataTableFallback columns={createColumns([])} />
    </div>
  )
}
