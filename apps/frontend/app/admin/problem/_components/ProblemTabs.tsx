'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const tabs = [
  { path: 'creating', label: '제작 중인 문제' },
  { path: '', label: '내가 만든 문제' },
  { path: 'shared', label: 'Shared Problem' }
]

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
        {tabs.map(({ path, label }) => (
          <Link
            key={label}
            href={withQuery(path ? `/admin/problem/${path}` : '/admin/problem')}
            className={cn(
              'flex w-1/3 justify-center p-[18px] py-[22.5px] text-center text-lg',
              isCurrentTab(path) &&
                'text-primary border-b-primary border-b-4 font-semibold'
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
