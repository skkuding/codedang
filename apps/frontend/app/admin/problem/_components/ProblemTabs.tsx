'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export function ProblemTabs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()

  const withQuery = (path: string) =>
    (query ? `${path}?${query}` : path) as Route

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
          href={withQuery('/admin/problem')}
          className={cn(
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-center text-lg',
            isCurrentTab('') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          내가 만든 문제
        </Link>
        <Link
          href={withQuery('/admin/problem/creating')}
          className={cn(
            'flex w-1/2 justify-center p-[18px] py-[22.5px] text-center text-lg',
            isCurrentTab('creating') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          제작 중인 문제
        </Link>
      </div>
    </div>
  )
}
