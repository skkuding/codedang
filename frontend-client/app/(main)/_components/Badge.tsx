import { cn } from '@/lib/utils'
import React from 'react'

const variants = {
  ongoing: 'bg-red-500',
  Level1: 'bg-sky-200 text-sky-900',
  Level2: 'bg-emerald-200 text-emerald-900',
  Level3: 'bg-amber-200 text-amber-900',
  Level4: 'bg-orange-300 text-orange-900',
  Level5: 'bg-rose-400 text-rose-50'
}

interface Props {
  type: keyof typeof variants
  filled?: boolean
  children: React.ReactNode
}

export default function Badge({ type, filled, children }: Props) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-2 self-end rounded-3xl bg-white px-3 py-0.5',
        filled && variants[type]
      )}
    >
      {!filled && (
        <div className={cn('h-2.5 w-2.5 rounded-full', variants[type])}></div>
      )}
      <div className="text-sm">{children}</div>
    </div>
  )
}
