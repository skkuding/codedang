import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { Course } from '@/types/type'
import { ErrorBoundary } from '@suspensive/react'
import { AssignmentAccordionNew } from '../_components/AssignmentAccordionNew'

interface AssignmentProps {
  params: { courseId: string }
}

export default async function Assignment({ params }: AssignmentProps) {
  const { courseId } = params

  const course = await getCourse(courseId)
  const week = course.courseInfo.week

  return (
    <div className="mb-12 mt-20 flex w-full flex-col px-6">
      <p className="text-2xl font-semibold">Assignment</p>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <AssignmentAccordionNew week={week} courseId={courseId} />
      </ErrorBoundary>
    </div>
  )
}

const getCourse = async (courseId: string) => {
  const response = await safeFetcherWithAuth.get(`course/${courseId}`)
  const data = await response.json<Course>()
  return data
}
