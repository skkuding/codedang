import { cn } from '@/lib/utils'
import { useState } from 'react'

export default function ExpandableCell({
  children
}: {
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className={cn(
        !expanded && 'overflow-hidden text-ellipsis whitespace-nowrap',
        'cursor-pointer text-left'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      {children}
    </div>
  )
}
