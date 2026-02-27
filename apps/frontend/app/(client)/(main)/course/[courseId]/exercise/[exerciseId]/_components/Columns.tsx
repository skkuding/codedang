'use client'

// 기획 확실하지 않아서 주석처리 (민규)
// import { FetchErrorFallback } from '@/components/FetchErrorFallback'
// import { Dialog } from '@/components/shadcn/dialog'
// import { Skeleton } from '@/components/shadcn/skeleton'
import {
  cn,
  convertToLetter,
  dateFormatter,
  getResultColor
} from '@/libs/utils'
import type {
  Assignment,
  AssignmentProblemRecord,
  AssignmentSubmission,
  ProblemGrade
} from '@/types/type'
// import { ErrorBoundary } from '@suspensive/react'
import type { ColumnDef } from '@tanstack/react-table'
import { SubmissionOverviewModal } from '../../../_components/SubmissionOverviewModal'

// import { Suspense, useState } from 'react'
// import { MdOutlineFileOpen } from 'react-icons/md'
// import { ProblemDetailModal } from '../../../_components/ProblemDetailModal'

export const columns = (
  record: AssignmentProblemRecord,
  assignment: Assignment,
  courseId: number,
  submissions: AssignmentSubmission[]
): ColumnDef<ProblemGrade>[] => [
  {
    header: '#',
    accessorKey: 'order',
    cell: ({ row }) => (
      <div className="text-body2_m_14 h-full text-[#8A8A8A]">
        {convertToLetter(row.original.order)}
      </div>
    )
  },
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-body1_m_16 w-[500px] text-left md:text-base">{`${row.original.title}`}</p>
      )
    }
  },
  {
    header: 'Submission Time',
    accessorKey: 'submission',
    cell: ({ row }) => {
      const submission = submissions.find(
        (submission) => submission.problemId === row.original.id
      )?.submission

      return (
        submission?.submissionTime && (
          <div className="text-body3_r_16 flex w-full justify-center text-[#8A8A8A]">
            {dateFormatter(submission.submissionTime, 'MMM D, HH:mm:ss')}
          </div>
        )
      )
    }
  },
  {
    header: 'Submisison Result',
    accessorKey: 'tc_result',
    cell: ({ row }) => {
      const submission = submissions.find(
        (submission) => submission.problemId === row.original.id
      )?.submission

      return (
        submission && (
          <div className="flex w-full justify-center">
            <p className={cn(getResultColor(submission.submissionResult))}>
              {submission.submissionResult}
            </p>
          </div>
        )
      )
    }
  },
  {
    header: 'Detail',
    accessorKey: 'detail',
    cell: ({ row }) => (
      <SubmissionOverviewModal
        problem={row.original}
        assignment={assignment}
        submissions={submissions}
      />
    )
  }
]
