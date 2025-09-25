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
      <div className="h-full text-sm font-medium text-[#8A8A8A]">
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
    header: 'Submission Time',
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
    header: 'Submisison Result',
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

export const problemColumns = (): ColumnDef<AssignmentProblem>[] => [
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
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="w-[500px] text-left font-medium md:text-base">{`${row.original.title}`}</p>
      )
    }
  },
  {
    header: 'Submission Time',
    accessorKey: 'submission'
  },
  {
    header: 'Submisison Result',
    accessorKey: 'tc_result'
  },
  {
    header: 'Detail',
    accessorKey: 'detail'
  }
]
