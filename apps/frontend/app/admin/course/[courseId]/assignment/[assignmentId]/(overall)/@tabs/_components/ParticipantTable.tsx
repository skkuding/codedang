'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Skeleton } from '@/components/shadcn/skeleton'
import { GET_ASSIGNMENT_SCORE_SUMMARIES } from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import { useParams } from 'next/navigation'
import { createColumns } from './Columns'

export function ParticipantTable({ assignmentId }: { assignmentId: number }) {
  const courseId = Number(useParams().courseId)

  const summaries = useSuspenseQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { assignmentId, groupId: courseId, take: 300 }
  })
  const summariesData = summaries.data.getAssignmentScoreSummaries.map(
    (item) => ({
      ...item,
      id: item.userId
    })
  )

  const problems = useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId: courseId, assignmentId }
  })

  const problemData = problems.data.getAssignmentProblems
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
            `/admin/course/${courseId}/assignment/${assignmentId}/participant/${data.id}` as Route
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
