'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ContestTabs({ contestId }: { contestId: string }) {
  const id = contestId
  const pathname = usePathname()

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === `/contest/${id}`
    }
    return pathname.startsWith(`/contest/${id}/${tab}`)
  }

  return (
    <div className="flex w-full justify-center">
      <div className="flex text-[#333333] md:gap-[60px]">
        <Link
          href={`/contest/${id}` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] text-lg',
            isCurrentTab('') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          OVERVIEW
        </Link>
        <Link
          href={`/contest/${id}/announcement` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] text-lg',
            isCurrentTab('announcement') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          ANNOUNCEMENT
        </Link>
        <Link
          href={`/contest/${id}/leaderboard` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] text-lg',
            isCurrentTab('leaderboard') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          LEADERBOARD
        </Link>
        <Link
          href={`/contest/${id}/statistics` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] text-lg',
            isCurrentTab('statistics') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          STATISTICS
        </Link>
        <Link
          href={`/contest/${id}/qna` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] text-lg',
            isCurrentTab('qna') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          Q&A
        </Link>
        {/* <Link
          href={`/contest/${id}/problem` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg text-gray-400',
            isCurrentTab('problem') && 'text-primary'
          )}
        >
          Problem
        </Link> */}
        {/* <Link
          href={`/contest/${id}/announcement` as Route}
          className={cn(
            'flex w-1/3 justify-center text-lg text-gray-400',
            isCurrentTab('announcement') && 'text-primary'
          )}
        >
          Clarification
        </Link>
      </div>
       <Link
        href={`/contest/${id}/standings` as Route}
        className={cn(
          'text-lg text-gray-400',
          isCurrentTab('standings') && 'text-primary'
        )}
      >
        Standings
      </Link> */}
      </div>
    </div>
  )
}
