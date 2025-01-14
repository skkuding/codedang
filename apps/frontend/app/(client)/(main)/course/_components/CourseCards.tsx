import { Button } from '@/components/shadcn/button'
import { fetcher } from '@/libs/utils'
import type { Course } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import CourseCard from './CourseCard'

export default async function CourseCards() {
  const courses = await getcourses()

  return (
    courses.length > 0 && (
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-between text-gray-700">
          <p className="text-2xl font-bold">Course 🏆</p>
          <Link href={'/course'}>
            <Button variant="ghost" className="h-8 px-3">
              See More
            </Button>
          </Link>
        </div>
        <div className="flex justify-start gap-5 md:hidden">
          {courses.slice(0, 2).map((course) => {
            return (
              <Link
                key={course.id}
                href={`/course/${course.id}` as Route}
                className="inline-block w-1/2"
              >
                <CourseCard course={course} />
              </Link>
            )
          })}
        </div>
        <div className="hidden justify-start gap-5 md:flex">
          {courses.map((course) => {
            return (
              <Link
                key={course.id}
                href={`/course/${course.id}` as Route}
                className="inline-block w-1/3"
              >
                <CourseCard course={course} />
              </Link>
            )
          })}
        </div>
      </div>
    )
  )
}

const getcourses = async () => {
  const data: {
    ongoing: Course[]
    upcoming: Course[]
  } = await fetcher.get('course/ongoing-upcoming').json()

  data.ongoing.forEach((course) => {
    course.status = 'ongoing'
  })
  //TODO: finished일때 뒷처리 안함!
  data.upcoming.forEach((course) => {
    course.status = 'finished'
  })
  const courses = data.ongoing.concat(data.upcoming)

  return courses.slice(0, 3)
}
