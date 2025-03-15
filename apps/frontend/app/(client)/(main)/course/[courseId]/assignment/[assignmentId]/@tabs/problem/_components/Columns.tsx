'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Dialog } from '@/components/shadcn/dialog'
import { Skeleton } from '@/components/shadcn/skeleton'
import { convertToLetter, dateFormatter } from '@/libs/utils'
import type { AssignmentGrade, ProblemGrade } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Suspense, useState } from 'react'
import { DetailButton } from '../../../../../_components/DetailButton'
import { SubmissionDetailModal } from '../../../../../grade/_components/SubmissionDetailModal'
import { MySubmissionFallback } from './MySubmission'

export const columns = (
  assignment: AssignmentGrade
): ColumnDef<ProblemGrade>[] => [
  {
    header: '#',
    accessorKey: 'order',
    cell: ({ row }) => (
      <div className="h-full font-medium">
        {convertToLetter(row.original.order)}
      </div>
    )
  },
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-left font-medium md:text-base">{`${row.original.title}`}</p>
      )
    }
  },
  {
    header: 'My Submission',
    accessorKey: 'problemRecord',
    cell: ({ row }) => (
      <SubmissionCell problem={row.original} assignment={assignment} />
    )
  },
  {
    header: () => 'Submission Time',
    accessorKey: 'submissionTime',
    cell: ({ row }) =>
      row.original.submissionTime &&
      dateFormatter(row.original.submissionTime, 'YYYY-MM-DD HH:mm:ss')
  },
  {
    header: () => 'Score',
    accessorKey: 'score',
    cell: ({ row }) =>
      row.original.maxScore !== null
        ? `${row.original.problemRecord?.score ?? '-'} / ${row.original.maxScore}`
        : null
  }
]

interface SubmissionCellProps {
  problem: ProblemGrade
  assignment: AssignmentGrade
}

function SubmissionCell({ problem, assignment }: SubmissionCellProps) {
  const [openProblemId, setOpenProblemId] = useState<number | null>(null)

  const handleOpenChange = (problemId: number | null) => {
    setOpenProblemId(problemId)
  }

  return problem.submissionTime ? (
    <div className="flex items-center justify-center">
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<Skeleton className="size-[25px]" />}>
          <div className="flex w-[11%] justify-center">
            <Dialog
              open={openProblemId === problem.id}
              onOpenChange={(isOpen) =>
                handleOpenChange(isOpen ? problem.id : null)
              }
            >
              <DetailButton
                isActivated={new Date() > new Date(assignment.endTime)}
              />
              {openProblemId === problem.id && (
                <SubmissionDetailModal
                  problemId={problem.id}
                  gradedAssignment={assignment}
                  showEvaluation={false}
                />
              )}
            </Dialog>
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  ) : null
}
