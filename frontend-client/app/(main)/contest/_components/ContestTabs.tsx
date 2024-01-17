'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ContestTabs({ contestId }: { contestId: string }) {
  const id = contestId
  const pathname = usePathname()

  const isCurrentTab = (tab: string) => {
    if (tab === '') return pathname === `/contest/${id}`
    return pathname.startsWith(`/contest/${id}/${tab}`)
  }

  return (
    <div className="flex justify-center gap-12 border-b-2 border-gray-300 pb-4">
      <Link
        href={`/contest/${id}`}
        className={cn(
          'text-lg text-gray-400',
          isCurrentTab('') && 'text-primary'
        )}
      >
        Top
      </Link>
      <Link
        href={`/contest/${id}/problem`}
        className={cn(
          'text-lg text-gray-400',
          isCurrentTab('problem') && 'text-primary'
        )}
      >
        Problem
      </Link>
      <Link
        href={`/contest/${id}/clarification`}
        className={cn(
          'text-lg text-gray-400',
          isCurrentTab('clarification') && 'text-primary'
        )}
      >
        Clarification
      </Link>
      <Link
        href={`/contest/${id}/standings`}
        className={cn(
          'text-lg text-gray-400',
          isCurrentTab('standings') && 'text-primary'
        )}
      >
        Standings
      </Link>
    </div>
  )
}
