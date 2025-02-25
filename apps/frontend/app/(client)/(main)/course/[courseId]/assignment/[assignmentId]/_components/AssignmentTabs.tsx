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

  console.log(pathname)

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === basePathname
    }
    return pathname.startsWith(`${basePathname}/${tab}`)
  }

  return (
    <div className="flex w-full justify-center">
      <div className="flex text-[#333333] md:gap-[60px]">
        <ActiveLink
          href={basePathname}
          activeCondition={isCurrentTab('')}
          text="INFO"
        />
        <ActiveLink
          href={`${basePathname}/problem`}
          activeCondition={isCurrentTab('problem')}
          text="PROBLEM"
        />
      </div>
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
        'flex w-1/2 justify-center p-[18px] text-lg',
        activeCondition &&
          'text-primary border-b-primary border-b-4 font-semibold'
      )}
    >
      {text}
    </Link>
  )
}
