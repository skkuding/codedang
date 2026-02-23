'use client'

import { convertToLetter, dateFormatter } from '@/libs/utils'
import type {
  Assignment,
  AssignmentProblem,
  AssignmentProblemRecord,
  AssignmentSubmission,
  ProblemGrade
} from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { SubmissionOverviewModal } from '../../../_components/SubmissionOverviewModal'
import { TestCaseResult } from '../../../_components/TestCaseResult'

export const getColumns = (
  record: AssignmentProblemRecord,
  assignment: Assignment,
  courseId: number,
  submissions: AssignmentSubmission[],
  t: (key: string) => string
): ColumnDef<ProblemGrade>[] => {
  return [
    {
      header: t('order_header'),
      accessorKey: 'order',
      cell: ({ row }) => (
        <div className="h-full text-sm font-medium text-[#8A8A8A]">
          {convertToLetter(row.original.order)}
        </div>
      )
    },
    {
      header: t('title_header'),
      accessorKey: 'title',
      cell: ({ row }) => {
        return (
          <p className="w-[500px] text-left font-medium md:text-base">{`${row.original.title}`}</p>
        )
      }
    },
    {
      header: t('submission_time_header'),
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
      header: t('submission_result_header'),
      accessorKey: 'tc_result',
      cell: ({ row }) => {
        const submission = submissions.find(
          (submission) => submission.problemId === row.original.id
        )?.submission

        return (
          submission && (
            <div className="flex w-full justify-center">
              <TestCaseResult submission={submission} />
              {/* <ResultBadge assignmentSubmission={submission} /> */}
            </div>
          )
        )
      }
    },
    {
      header: t('detail_header'),
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

export const getProblemColumns = (
  t: (key: string) => string
): ColumnDef<AssignmentProblem>[] => {
  return [
    {
      header: t('order_header'),
      accessorKey: 'order',
      cell: ({ row }) => (
        <div className="h-full text-sm font-medium text-[#8A8A8A]">
          {convertToLetter(row.original.order)}
        </div>
      )
    },
    {
      header: t('title_header'),
      accessorKey: 'title',
      cell: ({ row }) => {
        return (
          <p className="w-[500px] text-left font-medium md:text-base">{`${row.original.title}`}</p>
        )
      }
    },
    {
      header: t('submission_time_header'),
      accessorKey: 'submission'
    },
    {
      header: t('submission_result_header'),
      accessorKey: 'tc_result'
    },
    {
      header: t('detail_header'),
      accessorKey: 'detail'
    }
  ]
}
