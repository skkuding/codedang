'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Dialog } from '@/components/shadcn/dialog'
import { Skeleton } from '@/components/shadcn/skeleton'
import type {
  Assignment,
  AssignmentSubmission,
  ProblemGrade
} from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useState } from 'react'
import { MdOutlineFileOpen } from 'react-icons/md'
import { ProblemDetailModal } from './ProblemDetailModal'

interface SubmissionOverviewModalProps {
  problem: ProblemGrade
  assignment: Assignment
  submissions: AssignmentSubmission[]
}

export function SubmissionOverviewModal({
  problem,
  assignment,
  submissions
}: SubmissionOverviewModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  return (
    submissions.find((submission) => submission.problemId === problem.id)
      ?.submission && (
      <div
        className="flex items-center justify-center"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<Skeleton className="size-[25px]" />}>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
              <button onClick={() => setIsOpen(true)}>
                <MdOutlineFileOpen size={20} />
              </button>
              {isOpen && (
                <ProblemDetailModal
                  problemId={problem.id}
                  assignment={assignment}
                />
              )}
            </Dialog>
          </Suspense>
        </ErrorBoundary>
      </div>
    )
  )
}
