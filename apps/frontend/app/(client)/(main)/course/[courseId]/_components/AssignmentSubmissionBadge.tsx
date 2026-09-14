import { cn } from '@/libs/utils'

interface AssignmentSubmissionBadgeProps {
  submittedCount: number
  problemCount: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: { container: 'h-8 w-24 text-xs', content: 'flex gap-2' },
  md: { container: 'h-[36px] w-[120px] text-base', content: 'flex gap-2' },
  lg: { container: 'h-[38px] w-[140px] text-base', content: '' }
}

export function AssignmentSubmissionBadge({
  submittedCount,
  problemCount,
  size = 'md'
}: AssignmentSubmissionBadgeProps) {
  const badgeStyle =
    problemCount > 0 && submittedCount === problemCount
      ? 'border-transparent bg-primary text-white'
      : 'border-primary text-primary'

  const { container, content } = sizeStyles[size]

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border font-medium',
        container,
        badgeStyle
      )}
    >
      {size === 'lg' ? (
        <p>
          {submittedCount} / {problemCount}
        </p>
      ) : (
        <div className={content}>
          <p>{submittedCount}</p>
          <p>/</p>
          <p>{problemCount}</p>
        </div>
      )}
    </div>
  )
}
