import { cn } from '@/libs/utils'

interface FormSectionProps {
  children: React.ReactNode | React.ReactNode[]
  title: string
  isLabeled?: boolean
  isFlexColumn?: boolean
  isJustifyBetween?: boolean
  className?: string
  isOngoing?: boolean
  isFinished?: boolean
  titleSize?: 'base' | 'lg'
}

export function FormSection({
  children,
  title,
  isLabeled = true,
  isFlexColumn = false,
  isJustifyBetween = true,
  className,
  isOngoing = false,
  isFinished = false,
  titleSize = 'lg'
}: FormSectionProps) {
  const isChildrenArray = Array.isArray(children)
  const [badge, content] = isChildrenArray ? children : [null, children]

  return (
    <div
      className={cn(
        'flex',
        {
          'flex-col': isFlexColumn,
          'gap-[18px]': isFlexColumn,
          'justify-between': isJustifyBetween
        },
        isOngoing && 'pointer-events-none opacity-50',
        isFinished && 'pointer-events-none',
        className
      )}
    >
      <div className="flex items-center gap-[4px] text-lg">
        <span
          className={cn(
            'whitespace-nowrap',
            titleSize === 'base' && 'text-base',
            titleSize === 'lg' && 'text-lg'
          )}
        >
          {title}
        </span>
        {isLabeled && <span className="mt-1 text-red-500">*</span>}
        {badge}
      </div>
      {content}
    </div>
  )
}
