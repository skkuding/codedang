import { cn } from '@/lib/utils'
import FinishedIcon from '@/public/20_finished.svg'
import OngoingIcon from '@/public/20_ongoing.svg'
import UpcomingIcon from '@/public/20_upcoming.svg'
import Image from 'next/image'
import React from 'react'

const variants = {
  registeredOngoing: {
    image: OngoingIcon,
    text: 'ONGOING',
    color: 'text-blue-500'
  },
  registeredUpcoming: {
    image: UpcomingIcon,
    text: 'UPCOMING',
    color: 'text-red-400'
  },
  ongoing: {
    image: OngoingIcon,
    text: 'ONGOING',
    color: 'text-blue-500'
  },
  upcoming: {
    image: UpcomingIcon,
    text: 'UPCOMING',
    color: 'text-red-400'
  },
  finished: {
    image: FinishedIcon,
    text: 'FINISHED',
    color: 'text-gray-400'
  }
}

interface Props {
  variant: keyof typeof variants
}

export default function StatusBadge({ variant }: Props) {
  const { image, text, color } = variants[variant]
  return (
    <div className="inline-flex items-center gap-2">
      <Image src={image} alt={text} />
      <p className={cn('font-mono font-medium', color)}>{text}</p>
    </div>
  )
}
