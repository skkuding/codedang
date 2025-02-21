'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableProblemFilter,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { SubmissionDetailAdmin } from '@/app/admin/contest/[contestId]/_components/SubmissionDetailAdmin'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { GET_CONTEST_SUBMISSIONS } from '@/graphql/submission/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { columns } from './Columns'

export function SubmissionTable({ contestId }: { contestId: number }) {
  const { data } = useSuspenseQuery(GET_CONTEST_SUBMISSIONS, {
    variables: {
      input: {
        contestId
      },
      take: 1000
    }
  })

  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [submissionId, setSubmissionId] = useState(0)

  return (
    <>
      <DataTableRoot
        data={data.getContestSubmissions}
        columns={columns}
        defaultSortState={[{ id: 'submissionTime', desc: true }]}
      >
        <div className="flex gap-4">
          <DataTableSearchBar columndId="realname" />
          <DataTableProblemFilter contestId={contestId} />
        </div>
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
  return <DataTableFallback columns={columns} />
}
