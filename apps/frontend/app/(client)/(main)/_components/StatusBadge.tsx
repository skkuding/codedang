import { cn } from '@/libs/utils'
import React from 'react'

const variants = {
  registeredOngoing: {
    text: 'ONGOING',
    color: 'text-blue-500'
  },
  registeredUpcoming: {
    text: 'UPCOMING',
    color: 'text-red-400'
  },
  ongoing: {
    text: 'ONGOING',
    color: 'text-blue-500'
  },
  upcoming: {
    text: 'UPCOMING',
    color: 'text-red-400'
  },
  finished: {
    text: 'FINISHED',
    color: 'text-gray-400'
  }
}

interface Props {
  variant: keyof typeof variants
}

export function StatusBadge({ variant }: Props) {
  const { text, color } = variants[variant]
  return (
    <div className="inline-flex items-center gap-[6px]">
      <p className={cn('font-sans text-base font-medium', color)}>{text}</p>
    </div>
  )
}
