'use client'

import DataTable from '@/app/admin/_components/table/DataTable'
import DataTableFallback from '@/app/admin/_components/table/DataTableFallback'
import DataTablePagination from '@/app/admin/_components/table/DataTablePagination'
import DataTableProblemFilter from '@/app/admin/_components/table/DataTableProblemFilter'
import DataTableRoot from '@/app/admin/_components/table/DataTableRoot'
import DataTableSearchBar from '@/app/admin/_components/table/DataTableSearchBar'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { GET_CONTEST_SUBMISSIONS } from '@/graphql/submission/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { columns } from './Columns'
import SubmissionDetailAdmin from './SubmissionDetailAdmin'

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
        <DialogContent className="max-h-[620px] max-w-[800px] justify-center">
          <SubmissionDetailAdmin submissionId={submissionId} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SubmissionTableFallback() {
  return <DataTableFallback columns={columns} />
}
