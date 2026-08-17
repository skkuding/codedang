import { cn } from '@/libs/utils'
import FinishedIcon from '@/public/icons/finished.svg'
import OngoingIcon from '@/public/icons/ongoing.svg'
import UpcomingIcon from '@/public/icons/upcoming.svg'
import React from 'react'

const variants = {
  registeredOngoing: {
    Icon: OngoingIcon,
    text: 'ONGOING',
    color: 'text-blue-500'
  },
  registeredUpcoming: {
    Icon: UpcomingIcon,
    text: 'UPCOMING',
    color: 'text-red-400'
  },
  ongoing: {
    Icon: OngoingIcon,
    text: 'ONGOING',
    color: 'text-blue-500'
  },
  upcoming: {
    Icon: UpcomingIcon,
    text: 'UPCOMING',
    color: 'text-red-400'
  },
  finished: {
    Icon: FinishedIcon,
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
