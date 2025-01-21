'use client'

import {
  DataTableRoot,
  DataTableProblemFilter,
  DataTable,
  DataTablePagination,
  DataTableFallback
} from '@/app/admin/_components/table'
import { SubmissionDetailAdmin } from '@/app/admin/contest/[contestId]/_components/SubmissionDetailAdmin'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER } from '@/graphql/contest/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
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
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [submissionId, setSubmissionId] = useState(0)

  const submissionsData =
    submissions.data.getContestSubmissionSummaryByUserId.submissions

  return (
    <>
      <DataTableRoot
        columns={submissionColumns}
        data={submissionsData}
        defaultSortState={[{ id: 'submissionTime', desc: true }]}
      >
        <DataTableProblemFilter contestId={contestId} />
        <DataTable
          onRowClick={(_, row) => {
            setSubmissionId(row.original.id)
            setIsSubmissionDialogOpen(true)
          }}
        />
        <DataTablePagination />
      </DataTableRoot>
      <Dialog
        open={isSubmissionDialogOpen}
        onOpenChange={setIsSubmissionDialogOpen}
      >
        <DialogContent className="max-h-[840px] max-w-[1000px] justify-center">
          <SubmissionDetailAdmin submissionId={submissionId} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SubmissionTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={submissionColumns} />
}
