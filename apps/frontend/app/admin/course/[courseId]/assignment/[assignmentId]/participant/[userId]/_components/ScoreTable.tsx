'use client'

import {
  DataTable,
  DataTableFallback,
  DataTableRoot
} from '@/app/admin/_components/table'
import { GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER } from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { createColumns } from './ScoreColumns'

interface ScoreTableProps {
  groupId: number
  assignmentId: number
  userId: number
}

export function ScoreTable({ groupId, assignmentId, userId }: ScoreTableProps) {
  const { t } = useTranslate()
  const submissions = useSuspenseQuery(
    GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER,
    {
      variables: { groupId, assignmentId, userId, take: 1000 }
    }
  )
  const scoreData =
    submissions.data.getAssignmentSubmissionSummaryByUserId.scoreSummary

  const problems = useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId, assignmentId }
  })
  const problemData = problems.data.getAssignmentProblems
    .slice()
    .sort((a, b) => a.order - b.order)

  return (
    <DataTableRoot
      data={[{ ...scoreData, id: userId }]}
      columns={createColumns(problemData, t)}
    >
      <DataTable />
    </DataTableRoot>
  )
}

export function ScoreTableFallback() {
  return (
    <DataTableFallback
      withSearchBar={false}
      columns={createColumns([], () => '')}
    />
  )
}
