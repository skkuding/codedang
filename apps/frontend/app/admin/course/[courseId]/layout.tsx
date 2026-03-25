'use client'

import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import type { Route } from 'next'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

export default function CourseDetailLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const params = useParams()
  const courseId = params?.courseId as string

  const { data, loading } = useQuery(GET_COURSES_USER_LEAD)

  const currentCourse = data?.getCoursesUserLead?.find(
    (course: { id: string | number }) => String(course.id) === String(courseId)
  )

  const courseNum = currentCourse?.courseInfo?.courseNum
  const classNum = currentCourse?.courseInfo?.classNum

  const displayCode = courseNum ? `${courseNum}-${classNum}` : courseId
  const displayName =
    currentCourse?.groupName || (loading ? '로딩 중...' : '과목 정보 없음')

  const tabs = [
    { name: 'Home', href: `/admin/course/${courseId}` },
    { name: 'Member', href: `/admin/course/${courseId}/user` },
    { name: 'Assignment', href: `/admin/course/${courseId}/assignment` },
    { name: 'Exercise', href: `/admin/course/${courseId}/exercise` }
  ]

  const activeTabName = `${tabs.find((tab) => pathname === tab.href)?.name || 'Home'} LIST`

  return (
    <div className="flex min-h-screen w-full flex-col overflow-y-scroll bg-white">
      <div className="mx-auto w-full pb-[71px] pl-[86px] pr-[106px] pt-[80px]">
        <div className="w-full">
          <h1 className="text-[28px] font-bold uppercase leading-[130%] tracking-[-0.84px] text-black">
            {activeTabName}
          </h1>
          <p className="text-[16px] font-medium leading-[150%] tracking-[-0.48px] text-[#737373]">
            [{displayCode}] {displayName}
          </p>
        </div>

        <div className="mx-auto my-10 w-full">
          <div className="w-full">
            <nav className="flex w-full justify-start">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href
                return (
                  <Link
                    key={`tab-${tab.name}`}
                    href={tab.href as Route}
                    className={cn(
                      'relative flex h-[40px] w-[285.5px] items-center justify-center pb-4 text-sm font-semibold transition-colors',
                      isActive
                        ? 'text-blue-500 after:absolute after:bottom-[-1px] after:left-0 after:h-[2px] after:w-full after:bg-blue-500'
                        : 'text-gray-400 hover:text-gray-600'
                    )}
                  >
                    {tab.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  )
}
