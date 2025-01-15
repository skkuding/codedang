import { cn } from '@/libs/utils'
import finishedIcon from '@/public/icons/finished.svg'
import ongoingIcon from '@/public/icons/ongoing.svg'
import upcomingIcon from '@/public/icons/upcoming.svg'
import Image from 'next/image'
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
  const { image, text, color } = variants[variant]
  return (
    <div className="inline-flex items-center gap-2">
      <Image src={image} alt={text} />
      <p className={cn('font-mono font-medium', color)}>{text}</p>
    </div>
  )
}
