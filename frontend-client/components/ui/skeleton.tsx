import { cn } from '@/lib/utils'

export default function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-900/10 dark:bg-gray-50/10',
        className
      )}
      {...props}
    />
  )
}
