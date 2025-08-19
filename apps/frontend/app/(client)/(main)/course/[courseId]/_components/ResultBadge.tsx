import { cn } from '@/libs/utils'
import type { AssignmentSubmission } from '@/types/type'

interface ResultBadgeProps {
  className?: string
  assignmentSubmission: AssignmentSubmission
}

export function ResultBadge({
  className,
  assignmentSubmission
}: ResultBadgeProps) {
  const submissionResult =
    assignmentSubmission?.submission?.submissionResult ?? 'No Result'

  let badgeStyle = ''

  if (submissionResult === 'Accepted') {
    badgeStyle = 'border border-primary text-primary'
  } else if (submissionResult === 'No Result') {
    badgeStyle = 'border border-[#B0B0B0] text-[#B0B0B0]'
  } else {
    badgeStyle = 'border border-[#FC5555] text-[#FC5555]'
  }

  return (
    <div
      className={cn(
        'flex h-[38px] w-[140px] items-center justify-center rounded-full border',
        badgeStyle,
        className
      )}
    >
      <p className="text-base font-medium">{submissionResult}</p>
    </div>
  )
}
