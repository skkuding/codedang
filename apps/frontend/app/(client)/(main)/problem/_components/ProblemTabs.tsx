'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function ProblemTabs() {
  const pathname = usePathname()

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === `/problem`
    }
    return pathname.startsWith(`/problem/${tab}`)
  }

  return (
    <div className="pb-15 flex w-full items-center justify-start">
      <div className="flex h-16 text-[#333333] md:gap-[60px]">
        <Link
          href={`/problem` as Route}
          className={cn(
            'flex justify-center p-[18px] py-[22.5px] text-lg',
            'whitespace-nowrap',
            isCurrentTab('') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          Published
        </Link>
        <Link
          href={`/problem/creating` as Route}
          className={cn(
            'flex justify-center p-[18px] py-[22.5px] text-lg',
            'whitespace-nowrap',
            isCurrentTab('creating') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          Creating
        </Link>
        <Link
          href={`/problem/my-problems` as Route}
          className={cn(
            'flex justify-center whitespace-nowrap p-[18px] py-[22.5px] text-lg',
            isCurrentTab('my-problems') &&
              'text-primary border-b-primary border-b-4 font-semibold'
          )}
        >
          My problems
        </Link>
      </div>
    </div>
  )
}
