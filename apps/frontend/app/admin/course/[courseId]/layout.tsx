import { auth } from '@/libs/auth'
import { adminBaseUrl } from '@/libs/constants'
import { redirect } from 'next/navigation'
import { CourseDetailTabs } from './_components/CourseDetailTabs'

const GET_COURSE_QUERY = `
  query GetCourse($groupId: Int!) {
    getCourse(groupId: $groupId) {
      id
      groupName
      courseInfo {
        courseNum
        classNum
      }
    }
  }
`
import { GET_COURSE } from '@/graphql/course/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { title } from 'process'
import { description } from 'valibot'

export default async function CourseDetailLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  let json
  try {
    const res = await fetch(adminBaseUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: session.token.accessToken
      },
      body: JSON.stringify({
        query: GET_COURSE_QUERY,
        variables: { groupId: Number(courseId) }
      })
    })
    json = await res.json()
  } catch {
    redirect('/')
  }

  // If the user doesn't have permission, the backend's GroupLeaderGuard
  // will throw a ForbiddenException and return errors here.
  if (json.errors || !json.data?.getCourse) {
    redirect('/')
  }

  const course = json.data.getCourse
  const courseNum = course.courseInfo?.courseNum
  const classNum = course.courseInfo?.classNum
  const courseCode = courseNum ? `${courseNum}-${classNum}` : courseId
  const courseTitle = course.groupName || ''
  const courseTitle =
    currentCourse?.groupName || (loading ? '로딩 중...' : '과목 정보 없음')

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
    <div className="flex w-full flex-col">
      <div className="pb-[71px] pl-[86px] pr-[106px] pt-[80px]">
        <CourseDetailTabs
          courseId={courseId}
          courseCode={courseCode}
          courseTitle={courseTitle}
        />
        <h1 className="text-head3_sb_28">{activeTabName}</h1>
        <p className="text-body1_m_16 text-color-neutral-50">
          {activeTabName === 'HOME'
            ? `[${courseCode}] ${courseTitle}`
            : tabs.find((tab) => tab.title === activeTabName)?.description}
        </p>

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
