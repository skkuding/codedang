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
        className={cn(
          'text-lg font-semibold',
          disabled ?? 'opacity-50',
          className
        )}
      >
        {children}{' '}
      </span>
      {required && <span className="text-red-500">*</span>}
    </div>
  )
}
