'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableProblemFilter,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { DataTableSortButton } from '@/app/admin/_components/table/DataTableSortButton'
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
      take: 5000
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
        hiddenColumns={['problemTitle', 'realname', 'submissionTime']}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-2xl font-semibold">
            <span className="text-primary text-[26px] font-extrabold">
              {data.getContestSubmissions.length}
            </span>{' '}
            Submissions
          </div>
          <div className="flex items-center gap-2">
            <DataTableSortButton
              columnIds={['problemTitle', 'submissionTime']}
            />
            <DataTableSearchBar
              placeholder="Search User ID"
              columndId="username"
            />
          </div>
        </div>
        <DataTableProblemFilter contestId={contestId} />
        <DataTable
          isCardView={true}
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
