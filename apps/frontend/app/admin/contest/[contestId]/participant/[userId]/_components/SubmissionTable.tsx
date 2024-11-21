'use client'

import DataTable from '@/app/admin/_components/table/DataTable'
import DataTableFallback from '@/app/admin/_components/table/DataTableFallback'
import DataTablePagination from '@/app/admin/_components/table/DataTablePagination'
import DataTableProblemFilter from '@/app/admin/_components/table/DataTableProblemFilter'
import DataTableRoot from '@/app/admin/_components/table/DataTableRoot'
import { GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER } from '@/graphql/contest/queries'
import { useSuspenseQuery } from '@apollo/client'
import { submissionColumns } from './SubmissionColumns'

export function SubmissionTable({
  contestId,
  userId
}: {
  contestId: number
  userId: number
}) {
  const submissions = useSuspenseQuery(
    GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER,
    {
      variables: { contestId, userId, take: 1000 }
    }
  )

  const submissionsData =
    submissions.data.getContestSubmissionSummaryByUserId.submissions

  return (
    <DataTableRoot
      columns={submissionColumns}
      data={submissionsData}
      defaultSortState={[{ id: 'submissionTime', desc: true }]}
    >
      <DataTableProblemFilter contestId={contestId} />
      <DataTable />
      <DataTablePagination />
    </DataTableRoot>
  )
}

export function SubmissionTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={submissionColumns} />
}
