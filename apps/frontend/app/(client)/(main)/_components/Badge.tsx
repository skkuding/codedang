import { cn } from '@/libs/utils'
import React from 'react'

const variants = {
  registeredOngoing: 'bg-rose-700',
  registeredUpcoming: 'bg-rose-700',
  ongoing: 'bg-emerald-700',
  upcoming: 'bg-blue-700',
  finished: 'bg-gray-700',
  Level1: 'bg-violet-400',
  Level2: 'bg-violet-600',
  Level3: 'bg-violet-800',
  Level4: 'bg-rose-700',
  Level5: 'bg-rose-900'
}

interface Props {
  type: keyof typeof variants
  children: React.ReactNode
}

export function Badge({ type, children }: Props) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-2 self-start rounded-sm px-2 py-0.5 font-bold text-white',
        variants[type]
      )}
    >
      <div className="text-[10px]">{children}</div>
    </div>
  )
}
