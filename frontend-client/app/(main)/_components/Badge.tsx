import { cn } from '@/lib/utils'
import React from 'react'

const variants = {
  ongoing: 'bg-emerald-700',
  upcoming: 'bg-blue-700',
  finished: 'bg-gray-700'
}

interface Props {
  type: keyof typeof variants
  children: React.ReactNode
}

export default function Badge({ type, children }: Props) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-2 self-start rounded-sm px-2 py-0.5 font-bold',
        variants[type]
      )}
    >
      <div className="text-[10px]">{children}</div>
    </div>
  )
}
