'use client'

import { GET_COURSE } from '@/graphql/course/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
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

  const { data, loading } = useQuery(GET_COURSE, {
    variables: { groupId: Number(courseId) },
    skip: !courseId
  })

  const currentCourse = data?.getCourse

  const courseNum = currentCourse?.courseInfo?.courseNum
  const classNum = currentCourse?.courseInfo?.classNum

  const courseCode = courseNum ? `${courseNum}-${classNum}` : courseId
  const courseTitle =
    currentCourse?.groupName || (loading ? '로딩 중...' : '과목 정보 없음')

  const tabs = [
    { name: 'Home', href: `/admin/course/${courseId}` },
    { name: 'Member', href: `/admin/course/${courseId}/user` },
    { name: 'Assignment', href: `/admin/course/${courseId}/assignment` },
    { name: 'Exercise', href: `/admin/course/${courseId}/exercise` }
  ]

  const activeTabName =
    tabs.find((tab) => pathname === tab.href)?.name || 'Home'

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto w-full pb-[71px] pl-[86px] pr-[106px] pt-[80px]">
        <div className="w-full">
          <h1 className="text-head3_sb_28 uppercase">{activeTabName}</h1>
          <p className="text-body1_m_16 text-color-neutral-50">
            [{courseCode}] {courseTitle}
          </p>
        </div>

        <div className="mx-auto my-10 w-full">
          <div className="w-full">
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
        </div>

        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  )
}
