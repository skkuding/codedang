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
  submissions: AssignmentSubmission[],
  t: (key: string) => string
): ColumnDef<ProblemGrade>[] => {
  return [
    {
      header: '#',
      accessorKey: 'order',
      cell: ({ row }) => (
        <div className="h-full text-sm font-medium text-[#8A8A8A]">
          {convertToLetter(row.original.order)}
        </div>
      )
    },
    {
      header: t('title_column_header'),
      accessorKey: 'title',
      cell: ({ row }) => {
        return (
          <p className="w-[500px] text-left font-medium md:text-base">{`${row.original.title}`}</p>
        )
      }
    },
    {
      header: t('submission_time_column_header'),
      accessorKey: 'submission',
      cell: ({ row }) => {
        const submission = submissions.find(
          (submission) => submission.problemId === row.original.id
        )?.submission

        return (
          submission?.submissionTime && (
            <div className="flex w-full justify-center font-normal text-[#8A8A8A]">
              {dateFormatter(submission.submissionTime, 'MMM D, HH:mm:ss')}
            </div>
          )
        )
      }
    },
    {
      header: t('submission_result_column_header'),
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
      header: t('detail_column_header'),
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
}
