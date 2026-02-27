'use client'

import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
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
  const { t } = useTranslate()

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
        text={t('info-tab')}
        isLeft={true}
      />
      <ActiveLink
        href={`${basePathname}/problem`}
        activeCondition={isCurrentTab('problem')}
        text={t('problem-tab')}
        isLeft={false}
      />
    </div>
  )
}

interface ActiveLinkProps<T extends string> {
  href: Route<T>
  activeCondition: boolean
  text: string
  isLeft?: boolean
}

function ActiveLink<T extends string>({
  href,
  activeCondition,
  text,
  isLeft
}: ActiveLinkProps<T>) {
  return (
    <Link
      href={href}
      className={cn(
        'flex h-[50px] w-[420px] items-center justify-center rounded-full text-lg font-semibold',
        activeCondition && 'text-primary border-primary border',
        '-translate-y-px transform',
        isLeft ? '-translate-x-px' : 'translate-x-px'
      )}
    >
      {text}
    </Link>
  )
}
