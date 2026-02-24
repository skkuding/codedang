import { cn } from '@/libs/utils'
import finishedIcon from '@/public/icons/finished.svg'
import ongoingIcon from '@/public/icons/ongoing.svg'
import upcomingIcon from '@/public/icons/upcoming.svg'
import React from 'react'

const variants = {
  registeredOngoing: {
    image: ongoingIcon,
    text: 'ONGOING',
    color: 'text-blue-500'
  },
  registeredUpcoming: {
    image: upcomingIcon,
    text: 'UPCOMING',
    color: 'text-red-400'
  },
  ongoing: {
    image: ongoingIcon,
    text: 'ONGOING',
    color: 'text-blue-500'
  },
  upcoming: {
    image: upcomingIcon,
    text: 'UPCOMING',
    color: 'text-red-400'
  },
  finished: {
    image: finishedIcon,
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
