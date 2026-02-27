'use client'

import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ProblemTabs() {
  const pathname = usePathname()
  const { t } = useTranslate()

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === '/admin/problem'
    }
    return pathname.startsWith(`/admin/problem/${tab}`)
  }

  return (
    <div className="my-16 flex w-full justify-center">
      <div className="flex w-full text-[#333333] md:gap-[60px]">
        <Link
          href={'/admin/problem' as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-center text-lg',
            isCurrentTab('') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          {t('my_problem')}
        </Link>
        <Link
          href={'/admin/problem/shared' as Route}
          className={cn(
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-center text-lg',
            isCurrentTab('shared') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          {t('shared_problem')}
        </Link>
      </div>
    </div>
  )
}
