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
