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
import { useDataTable } from '@/app/admin/_components/table/context'
import { SubmissionDetailAdmin } from '@/app/admin/contest/[contestId]/_components/SubmissionDetailAdmin'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { GET_CONTEST_SUBMISSIONS } from '@/graphql/submission/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { columns } from './Columns'

export function SubmissionTable({ contestId }: { contestId: number }) {
  const { data } = useSuspenseQuery(GET_CONTEST_SUBMISSIONS, {
    variables: {
      contestId,
      input: {},
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
        hiddenColumns={['problemTitle', 'submissionTime']}
      >
        <SubmissionTableHeader />
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

function SubmissionTableHeader() {
  const { table } = useDataTable()
  const filteredRowCount = table.getFilteredRowModel().rows.length

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-head5_sb_24">
        <span className="text-primary text-[26px] font-extrabold">
          {filteredRowCount}
        </span>{' '}
        Submissions
      </div>
      <div className="flex items-center gap-2">
        <DataTableSortButton columnIds={['problemTitle', 'submissionTime']} />
        <DataTableSearchBar placeholder="Search User ID" columndId="username" />
      </div>
    </div>
  )
}

export function SubmissionTableFallback() {
  return <DataTableFallback columns={columns} />
}
