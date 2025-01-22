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
    <div className="flex justify-center gap-[130px] border-b-2 border-gray-300 pb-4">
      <div className="flex w-full text-[#333333] md:w-3/5">
        <Link
          href={`/contest/${id}` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg',
            isCurrentTab('') && 'text-primary'
          )}
        >
          Overview
        </Link>
        <Link
          href={`/contest/${id}/notice` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg',
            isCurrentTab('notice') && 'text-primary'
          )}
        >
          Notice
        </Link>
        <Link
          href={`/contest/${id}/leaderboard` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg',
            isCurrentTab('leaderboard') && 'text-primary'
          )}
        >
          Leaderboard
        </Link>
        <Link
          href={`/contest/${id}/statistics` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg',
            isCurrentTab('statistics') && 'text-primary'
          )}
        >
          Statistics
        </Link>
        <Link
          href={`/contest/${id}/qna` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg',
            isCurrentTab('qna') && 'text-primary'
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
