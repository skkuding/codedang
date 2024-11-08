'use client'

import { cn } from '@/lib/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ContestOverallTabs({
  contestId
}: {
  contestId: string
}) {
  const id = contestId
  const pathname = usePathname()

  const isCurrentTab = (tab: string) => {
    if (tab === '') return pathname === `/admin/contest/${id}`
    return pathname.startsWith(`/admin/contest/${id}/${tab}`)
  }

  return (
    <span className="flex w-max gap-1 rounded-lg bg-slate-200 p-1">
      <Link
        href={`/admin/contest/${id}` as Route}
        className={cn(
          'rounded-md px-3 py-1.5 text-lg font-semibold',
          isCurrentTab('') && 'text-primary bg-white font-bold'
        )}
      >
        Participant
      </Link>
      <Link
        href={`/admin/contest/${id}/submission` as Route}
        className={cn(
          'rounded-md px-3 py-1.5 text-lg font-semibold',
          isCurrentTab('submission') && 'text-primary bg-white font-bold'
        )}
      >
        All Submission
      </Link>
    </span>
  )
}
