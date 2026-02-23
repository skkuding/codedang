'use client'

import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ContestTabs({ contestId }: { contestId: string }) {
  const id = contestId
  const pathname = usePathname()
  const { t } = useTranslate()

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
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-lg',
            isCurrentTab('') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          {t('overview')}
        </Link>
        <Link
          href={`/contest/${id}/announcement` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-lg',
            isCurrentTab('announcement') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          {t('announcement')}
        </Link>
        <Link
          href={`/contest/${id}/leaderboard` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-lg',
            isCurrentTab('leaderboard') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          {t('leaderboard')}
        </Link>
        <Link
          href={`/contest/${id}/statistics` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-lg',
            isCurrentTab('statistics') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          {t('statistics')}
        </Link>
        <Link
          href={`/contest/${id}/qna` as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-lg',
            isCurrentTab('qna') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          {t('q_and_a')}
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
