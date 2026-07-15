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
    { name: 'Home', title: 'HOME', href: `/admin/course/${courseId}` },
    {
      name: 'Member',
      title: 'MEMBER',
      description:
        "Here's a list of the instructors and students of the course",
      href: `/admin/course/${courseId}/user`
    },
    {
      name: 'Assignment',
      title: 'ASSIGNMENT',
      description: "Here's a assignment list you made",
      href: `/admin/course/${courseId}/assignment`
    },
    {
      name: 'Exercise',
      title: 'EXERCISE',
      description: "Here's a exercise list you made",
      href: `/admin/course/${courseId}/exercise`
    },
    {
      name: 'Q&A',
      title: 'Question & Answer',
      description:
        'Assignment와 Exercise 문제와 관련된 질문과 답변을 제공합니다.',
      href: `/admin/course/${courseId}/qna`
    }
  ]

  const activeTabName =
    tabs.find((tab) => pathname === tab.href)?.title || 'HOME'

  return (
    <>
      <h1 className="text-head3_sb_28">{activeTabName}</h1>
      <p className="text-body1_m_16 text-color-neutral-50">
        {activeTabName === 'HOME'
          ? `[${courseCode}] ${courseTitle}`
          : tabs.find((tab) => tab.title === activeTabName)?.description}
      </p>

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
