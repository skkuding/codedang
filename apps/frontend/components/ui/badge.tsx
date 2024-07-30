import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:border-gray-800 dark:focus:ring-gray-300',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-gray-200 text-blue-400 hover:bg-gray-900/80',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80',
        destructive:
          'border-transparent bg-red-500 text-gray-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/80',
        outline: 'text-gray-950 dark:text-gray-50',
        level1: 'bg-level-light-1 text-level-dark-1 border-0',
        level2: 'bg-level-light-2 text-level-dark-2 border-0',
        level3: 'bg-level-light-3 text-level-dark-3 border-0',
        level4: 'bg-level-light-4 text-level-dark-4 border-0',
        level5: 'bg-level-light-5 text-level-dark-5 border-0'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
