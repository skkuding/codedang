import { auth } from '@/libs/auth'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { Course, JoinedCourse } from '@/types/type'
import { redirect } from 'next/navigation'
import { CourseDetailTabs } from './_components/CourseDetailTabs'

export default async function CourseDetailLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const session = await auth()

  // Admin/SuperAdmin은 groupLeader 체크 없이 통과 (GroupLeaderGuard와 동일한 로직)
  const isAdmin = session?.user?.role !== 'User'
  if (!isAdmin) {
    try {
      const joinedCourses: JoinedCourse[] = await safeFetcherWithAuth
        .get('course/joined')
        .json()

      const isGroupLeaderOfThisCourse = joinedCourses.some(
        (course) =>
          course.id === Number(courseId) && course.isGroupLeader === true
      )

      if (!isGroupLeaderOfThisCourse) {
        redirect('/')
      }
    } catch {
      redirect('/')
    }
  }

  // course 정보 fetch (이름, 과목코드 표시용)
  let courseCode = courseId
  let courseTitle = ''
  try {
    const course: Course = await safeFetcherWithAuth
      .get(`course/${courseId}`)
      .json()
    const courseNum = course.courseInfo?.courseNum
    const classNum = course.courseInfo?.classNum
    courseCode = courseNum ? `${courseNum}-${classNum}` : courseId
    courseTitle = course.groupName
  } catch {
    // fetch 실패 시 fallback: courseId를 코드로, 빈 제목 사용
  }

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto w-full pb-[71px] pl-[86px] pr-[106px] pt-[80px]">
        <CourseDetailTabs
          courseId={courseId}
          courseCode={courseCode}
          courseTitle={courseTitle}
        />

        <main className="w-full flex-1">{children}</main>
      </div>
    </div>
  )
}
