import { safeFetcherWithAuth } from '@/libs/utils'
import type { Course } from '@/types/type'
import { AssignmentAccordion } from '../_components/AssignmentAccordion'

export default async function Assignment({
  params
}: {
  params: { courseId: string }
}) {
  const { courseId } = params

  const course = await getCourse(courseId)
  const week = course.courseInfo.week

  return (
    <div className="mb-12 mt-[67px] flex w-full flex-col">
      <AssignmentAccordion week={week} />
    </div>
  )
}

const getCourse = async (courseId: string) => {
  const response = await safeFetcherWithAuth.get(`course/${courseId}`)
  const data = await response.json<Course>()
  return data
}
