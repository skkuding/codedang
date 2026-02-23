'use client'

import {
  DataTable,
  DataTableFallback,
  DataTableRoot
} from '@/app/admin/_components/table'
import { GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { createColumns } from './ScoreColumns'

interface ScoreTableProps {
  contestId: number
  userId: number
}

export function ScoreTable({ userId, contestId }: ScoreTableProps) {
  const { t } = useTranslate()
  const submissions = useSuspenseQuery(
    GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER,
    {
      variables: { contestId, userId, take: 1000 }
    }
  )
  const scoreData =
    submissions.data.getContestSubmissionSummaryByUserId.scoreSummary

  const problems = useSuspenseQuery(GET_CONTEST_PROBLEMS, {
    variables: { contestId }
  })
  const problemData = problems.data.getContestProblems
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
