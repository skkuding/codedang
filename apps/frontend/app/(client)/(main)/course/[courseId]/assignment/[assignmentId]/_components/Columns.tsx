'use client'

// 기획 확실하지 않아서 주석처리 (민규)
// import { FetchErrorFallback } from '@/components/FetchErrorFallback'
// import { Dialog } from '@/components/shadcn/dialog'
// import { Skeleton } from '@/components/shadcn/skeleton'
import { convertToLetter, dateFormatter } from '@/libs/utils'
import type {
  Assignment,
  AssignmentProblemRecord,
  AssignmentSubmission,
  ProblemGrade
} from '@/types/type'
// import { ErrorBoundary } from '@suspensive/react'
import type { ColumnDef, Row } from '@tanstack/react-table'
// import { Suspense, useState } from 'react'
// import { MdOutlineFileOpen } from 'react-icons/md'
// import { ProblemDetailModal } from '../../../_components/ProblemDetailModal'
// import { TestCaseResult } from '../../../_components/TestCaseResult'
import { ResultBadge } from '../../../_components/ResultBadge'

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
      )

      return (
        submission && (
          <div className="flex w-full justify-center">
            <ResultBadge assignmentSubmission={submission} />
          </div>
        )
      )
    }
  }
  // 기획 확실하지 않아서 주석처리 (민규)
  // {
  //   header: 'Detail',
  //   accessorKey: 'detail',
  //   cell: ({ row }) => (
  //     <DetailCell
  //       problem={row.original}
  //       assignment={assignment}
  //       courseId={courseId}
  //       submissions={submissions}
  //     />
  //   )
  // }
]

// interface SubmissionCellProps {
//   problem: ProblemGrade
//   assignment: Assignment
//   courseId: number
//   submissions: AssignmentSubmission[]
// }

// function DetailCell({
//   problem,
//   assignment,
//   courseId,
//   submissions
// }: SubmissionCellProps) {
//   const [isOpen, setIsOpen] = useState<boolean>(false)

//   const handleOpenChange = (open: boolean) => {
//     setIsOpen(open)
//   }

//   return (
//     submissions.find((submission) => submission.problemId === problem.id)
//       ?.submission && (
//       <div
//         className="flex items-center justify-center"
//         onClick={(e) => {
//           e.preventDefault()
//           e.stopPropagation()
//         }}
//       >
//         <ErrorBoundary fallback={FetchErrorFallback}>
//           <Suspense fallback={<Skeleton className="size-[25px]" />}>
//             <Dialog open={isOpen} onOpenChange={handleOpenChange}>
//               <button onClick={() => setIsOpen(true)}>
//                 <MdOutlineFileOpen size={20} />
//               </button>
//               {isOpen && (
//                 <ProblemDetailModal
//                   problemId={problem.id}
//                   assignment={assignment}
//                   courseId={courseId}
//                 />
//               )}
//             </Dialog>
//           </Suspense>
//         </ErrorBoundary>
//       </div>
//     )
//   )
// }
