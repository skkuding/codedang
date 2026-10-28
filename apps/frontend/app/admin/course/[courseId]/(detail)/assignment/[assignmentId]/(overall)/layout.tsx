'use client'

import { CountdownStatus } from '@/components/CountdownStatus'
import { DurationDisplay } from '@/components/DurationDisplay'
import { Button } from '@/components/shadcn/button'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_COURSE } from '@/graphql/course/queries'
import PenIcon from '@/public/icons/pen.svg'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FaAngleLeft } from 'react-icons/fa6'
import { AssignmentOverallTabs } from '../../../../_components/AssignmentOverallTabs'
import { AssignmentTitle } from './_components/AssignmentTitle'

export default function Layout({ tabs }: { tabs: React.ReactNode }) {
  const { courseId, assignmentId } = useParams()

  const { data: assignment, loading: assignmentLoading } = useQuery(
    GET_ASSIGNMENT,
    {
      variables: {
        groupId: Number(courseId),
        assignmentId: Number(assignmentId)
      }
    }
  )

  const { data, loading: courseLoading } = useQuery(GET_COURSE, {
    variables: { groupId: Number(courseId) },
    skip: !courseId
  })

  const assignmentData = assignment?.getAssignment
  const loading = assignmentLoading || courseLoading

  const currentCourse = data?.getCourse

  const courseNum = currentCourse?.courseInfo?.courseNum
  const classNum = currentCourse?.courseInfo?.classNum
  const courseSemester = currentCourse?.courseInfo?.semester

  const courseCode = courseNum ? `${courseNum}-${classNum}` : courseId
  const courseTitle =
    currentCourse?.groupName || (loading ? '로딩 중...' : '과목 정보 없음')

  return (
    <main className="flex flex-col gap-6 px-20 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/course/${courseId}/assignment` as const}>
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <AssignmentTitle
            title={assignmentData?.title}
            courseCode={String(courseCode)}
            courseTitle={courseTitle}
            courseSemester={courseSemester}
            isLoading={loading}
          />
        </div>
        <Link
          href={
            `/admin/course/${courseId}/assignment/${assignmentId}/edit` as const
          }
        >
          <Button variant="default">
            <PenIcon className="mr-2 h-4 w-4 text-white" />
            Edit
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-[6px]">
        <CountdownStatus
          showText={true}
          startTime={assignmentData?.startTime}
          baseTime={assignmentData?.dueTime ?? assignmentData?.endTime}
          isLoading={loading}
        />
        <DurationDisplay
          startTime={assignmentData?.startTime}
          endTime={assignmentData?.endTime}
          title="visible"
          isLoading={loading}
        />
      </div>

      <AssignmentOverallTabs
        groupId={Number(courseId)}
        assignmentId={Number(assignmentId)}
      />
      {tabs}
    </main>
  )
}
