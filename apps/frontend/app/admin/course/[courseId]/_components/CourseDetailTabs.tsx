'use client'

import { cn } from '@/libs/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface CourseDetailTabsProps {
  courseId: string
  courseCode: string
  courseTitle: string
}

export function CourseDetailTabs({
  courseId,
  courseCode,
  courseTitle
}: CourseDetailTabsProps) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Home', href: `/admin/course/${courseId}` },
    { name: 'Member', href: `/admin/course/${courseId}/user` },
    { name: 'Assignment', href: `/admin/course/${courseId}/assignment` },
    { name: 'Exercise', href: `/admin/course/${courseId}/exercise` }
  ]

  const activeTabName =
    tabs.find((tab) => pathname === tab.href)?.name || 'Home'

  return (
    <>
      <div className="w-full">
        <h1 className="text-head3_sb_28 uppercase">{activeTabName}</h1>
        <p className="text-body1_m_16 text-color-neutral-50">
          [{courseCode}] {courseTitle}
        </p>
      </div>

      <div className="mx-auto my-10 w-full">
        <nav className="flex w-full justify-start border-b border-gray-200">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={`tab-${tab.name}`}
                href={tab.href}
                className={cn(
                  'text-sub3_sb_16 relative flex h-[40px] w-[285.5px] items-center justify-center pb-4 transition-colors',
                  isActive
                    ? 'text-primary after:bg-primary after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-full'
                    : 'text-color-neutral-40 hover:text-color-neutral-70'
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
