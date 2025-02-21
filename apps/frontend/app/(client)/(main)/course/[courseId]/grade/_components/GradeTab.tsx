'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function GradeTab({ courseId }: { courseId: string }) {
  const id = courseId
  const pathname = usePathname()

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === `/course/${id}/grade`
    }
    return pathname.startsWith(`/course/${id}/grade/${tab}`)
  }

  return (
    <div className="flex w-full px-14">
      <div className="flex text-[#333333] md:gap-[60px]">
        <Link
          href={`/course/${id}/grade` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg font-medium',
            isCurrentTab('') &&
              'text-primary border-b-primary border-b-2 font-semibold'
          )}
        >
          ALL
        </Link>
        <Link
          href={`/course/${id}/grade/assignment` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg font-medium',
            isCurrentTab('assignment') &&
              'text-primary border-b-primary border-b-2 font-semibold'
          )}
        >
          ASSIGNMENT
        </Link>
        <Link
          href={`/course/${id}/grade/exam` as Route}
          className={cn(
            'flex w-1/2 justify-center text-lg font-medium',
            isCurrentTab('exam') &&
              'text-primary border-b-primary border-b-2 font-semibold'
          )}
        >
          EXAM
        </Link>
      </div>
    </div>
  )
}
