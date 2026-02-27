import { cn } from '@/libs/utils'

interface LabelProps {
  children: React.ReactNode
  required?: boolean
  disabled?: boolean
  className?: string
}

export function Label({
  children,
  required = true,
  disabled = false,
  className = ''
}: LabelProps) {
  return (
    <div>
      <span
        className={cn('text-sub1_sb_18', disabled ?? 'opacity-50', className)}
      >
        {children}{' '}
      </span>
      {required && <span className="text-red-500">*</span>}
    </div>
  )
}
