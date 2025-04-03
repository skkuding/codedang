'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Dialog } from '@/components/shadcn/dialog'
import { Skeleton } from '@/components/shadcn/skeleton'
import { convertToLetter, dateFormatter } from '@/libs/utils'
import type {
  Assignment,
  AssignmentProblemRecord,
  ProblemGrade
} from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { Suspense, useState } from 'react'
import { FaCircleCheck } from 'react-icons/fa6'
import { MdOutlineFileOpen } from 'react-icons/md'
import { SubmissionDetailModal } from '../../../_components/SubmissionDetailModal'

export const columns = (
  record: AssignmentProblemRecord,
  assignment: Assignment,
  courseId: number
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
        <p className="w-[500px] text-left font-medium md:text-base">{`${row.original.title}`}</p>
      )
    }
  },
  {
    header: 'Last Submission',
    accessorKey: 'submission',
    cell: ({ row }) => {
      return row.original.submissionTime ? (
        <div className="flex w-full justify-center font-normal text-[#8A8A8A]">
          {dateFormatter(row.original.submissionTime, 'MMM D, HH:mm:ss')}
        </div>
      ) : null
    }
  },
  {
    header: 'T/C Result',
    accessorKey: 'tc_result',
    cell: ({ row }) => {
      return (
        <div className="flex w-full justify-center">
          <ResultCell row={row} record={record} />
        </div>
      )
    }
  },
  // {
  //   header: () => 'Score',
  //   accessorKey: 'score',
  //   cell: ({ row }) =>
  //     `${row.original.problemRecord?.isSubmitted ? (row.original.problemRecord?.score ?? '-') : '-'} / ${row.original.maxScore}`
  // },
  {
    header: 'Detail',
    accessorKey: 'detail',
    cell: ({ row }) => (
      <DetailCell
        problem={row.original}
        assignment={assignment}
        courseId={courseId}
      />
    )
  }
]

interface ResultCellProps {
  row: Row<ProblemGrade>
  record: AssignmentProblemRecord
}

function ResultCell({ row, record }: ResultCellProps) {
  const submissionResult =
    record.problems.find((problem) => problem.id === row.original.id)
      ?.submissionResult ?? ''

  const resultColor = submissionResult === 'Accepted' ? '#35C759' : '#FF3B2F'

  return (
    <p
      className="font-medium md:text-base"
      style={{ color: submissionResult ? resultColor : undefined }}
    >
      {submissionResult}
    </p>
  )
}

interface SubmissionCellProps {
  problem: ProblemGrade
  assignment: Assignment
  courseId: number
}

function DetailCell({ problem, assignment, courseId }: SubmissionCellProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return problem.submissionTime ? (
    <div
      className="flex items-center justify-center"
      onClick={(e) => {
        e.preventDefault() // <-- 이거 추가!
        e.stopPropagation()
      }}
    >
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<Skeleton className="size-[25px]" />}>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <button
              onClick={(e) => {
                setIsOpen(true)
              }}
            >
              <MdOutlineFileOpen size={20} />
            </button>
            {isOpen && (
              <SubmissionDetailModal
                problemId={problem.id}
                assignment={assignment}
                showEvaluation={false}
                courseId={courseId}
              />
            )}
          </Dialog>
        </Suspense>
      </ErrorBoundary>
    </div>
  ) : null
}
