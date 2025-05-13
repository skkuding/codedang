'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableProblemFilter,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { SubmissionDetailAdmin } from '@/app/admin/course/[courseId]/assignment/[assignmentId]/_components/SubmissionDetailAdmin'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { GET_ASSIGNMENT_SUBMISSIONS } from '@/graphql/submission/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { columns } from './Columns'
import { DataTableProblemFilterMini } from './DataTableProblemFilterMini'

export function SubmissionTable({
  groupId,
  assignmentId
}: {
  groupId: number
  assignmentId: number
}) {
  const { data } = useSuspenseQuery(GET_ASSIGNMENT_SUBMISSIONS, {
    variables: {
      groupId,
      input: {
        assignmentId
      },
      take: 5000
    }
  })

  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [submissionId, setSubmissionId] = useState(0)

  return (
    <>
      <DataTableRoot
        data={data.getAssignmentSubmissions}
        columns={columns}
        defaultSortState={[{ id: 'submissionTime', desc: true }]}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="font-semibold">
              <span className="text-primary font-bold">
                {data.getAssignmentSubmissions.length}
              </span>{' '}
              Submissions
            </div>
            <DataTableProblemFilterMini
              groupId={groupId}
              assignmentId={assignmentId}
            />
          </div>
          <DataTableSearchBar columndId="realname" placeholder="Search Name" />
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
