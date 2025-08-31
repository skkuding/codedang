'use client'

import type { GetAssignmentSummaryResponse } from '@/app/(client)/_libs/apis/assignmentSubmission'
import { cn, getResultColor } from '@/libs/utils'
import type { Assignment, ProblemGrade } from '@/types/type'
import { SubmissionOverviewModal } from './SubmissionOverviewModal'

interface ProblemCardProps {
  problem: ProblemGrade
  parentItem: Assignment
  submissions: GetAssignmentSummaryResponse
  index: number
  courseId: number
  type: 'assignment' | 'exercise'
}

export function ProblemCard({
  problem,
  parentItem,
  submissions,
  index,
  courseId,
  type
}: ProblemCardProps) {
  const submission = submissions?.find((s) => s.problemId === problem.id)
  const hasSubmission = submission?.submission !== null
  const isAccepted = submission?.submission?.submissionResult === 'Accepted'

  const problemPath = `/course/${courseId}/${type}/${parentItem.id}/problem/${problem.id}`

  const handleCardClick = () => {
    window.location.href = problemPath
  }

  return (
    <div
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
            {String.fromCharCode(65 + index)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium text-gray-900">
              {problem.title}
            </h3>
            <p className="text-xs text-gray-500">
              {hasSubmission
                ? `Submitted on ${new Date(
                    submission?.submission?.submissionTime || ''
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}`
                : 'Not submitted'}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          {hasSubmission &&
            (type === 'assignment' ? (
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-12 rounded-full bg-gray-200">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{
                        width: isAccepted ? '100%' : '0%'
                      }}
                    />
                  </div>
                  <span className="text-primary text-xs font-medium">
                    {submission?.submission?.acceptedTestcaseCount || 0}/
                    {submission?.submission?.testcaseCount || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {isAccepted ? 'Accepted' : 'Wrong Answer'}
                </p>
              </div>
            ) : (
              <p
                className={cn(
                  'text-right text-xs',
                  getResultColor(isAccepted ? 'Accepted' : 'Wrong Answer')
                )}
              >
                {isAccepted ? 'Accepted' : 'Wrong Answer'}
              </p>
            ))}

          <SubmissionOverviewModal
            problem={problem}
            assignment={parentItem}
            submissions={submissions}
          />
        </div>
      </div>
    </div>
  )
}
