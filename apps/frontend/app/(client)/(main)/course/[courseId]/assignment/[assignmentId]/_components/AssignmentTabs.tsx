'use client'

import { cn } from '@/libs/utils'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AssignmentTabsProps {
  assignmentId: string
  courseId: string
}

export function AssignmentTabs({
  assignmentId,
  courseId
}: AssignmentTabsProps) {
  const pathname = usePathname()

  const basePathname = `/course/${courseId}/assignment/${assignmentId}` as const

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === basePathname
    }
    return pathname.startsWith(`${basePathname}/${tab}`)
  }

  return (
    <div className="flex h-[50px] w-fit rounded-full border border-[#C4C4C4] text-[#8A8A8A]">
      <ActiveLink
        href={basePathname}
        activeCondition={isCurrentTab('')}
        text="Info"
      />
      <ActiveLink
        href={`${basePathname}/problem`}
        activeCondition={isCurrentTab('problem')}
        text="Problem"
      />
    </div>
  )
}

interface ActiveLinkProps<T extends string> {
  href: Route<T>
  activeCondition: boolean
  text: string
}

function ActiveLink<T extends string>({
  href,
  activeCondition,
  text
}: ActiveLinkProps<T>) {
  return (
    <Link
      href={href}
      className={cn(
        'flex h-[50px] w-[420px] items-center justify-center rounded-full text-lg font-semibold',
        activeCondition && 'text-primary border-primary border'
      )}
    >
      {text}
    </Link>
  )
}
