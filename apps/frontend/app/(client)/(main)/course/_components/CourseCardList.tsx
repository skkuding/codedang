'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/shadcn/carousel'
import { fetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useMemo } from 'react'
import { CourseCard } from '../_components/CourseCard'
import { RegisterCourseButton } from './RegisterCourseButton'

interface CourseCardListProps {
  title: string
}

export function CourseCardList({ title }: CourseCardListProps) {
  const { data: courses = [] } = useQuery({
    queryKey: ['joinedCourses'],
    queryFn: async () => {
      return await fetcherWithAuth.get('course/joined').json<JoinedCourse[]>()
    }
  })

  const courseColumns = useMemo(() => {
    const columns: JoinedCourse[][] = []

    for (let i = 0; i < courses.length; i += 2) {
      columns.push(courses.slice(i, i + 2))
    }

    return columns
  }, [courses])

  if (courses.length === 0) {
    return (
      <div className="flex w-full flex-col gap-10 md:items-center md:justify-between">
        <div className="flex gap-4 text-2xl font-semibold leading-9 tracking-[-0.9px] md:text-[28px]">
          {title}
          <RegisterCourseButton />
        </div>
        <div className="flex h-72 w-full flex-col items-center justify-center rounded-[20px] border border-[#DFDFDF] text-xl font-normal text-[#737373]">
          <p>There are no courses registered!</p>
          <p>
            Please click the register button at the top to enroll in a course.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Carousel opts={{ align: 'start' }} className="flex w-full flex-col">
      <div className="mb-3 flex w-full items-center justify-between">
        <span className="text-2xl font-semibold leading-9 tracking-[-0.9px] md:text-[28px]">
          {title}
        </span>

        <div className="flex items-center gap-2">
          <CarouselPrevious className="h-5 w-5" />
          <CarouselNext className="h-5 w-5" />
          <RegisterCourseButton />
        </div>
      </div>

      <CarouselContent className="mb-[100px] ml-2">
        {courseColumns.map((column, columnIndex) => (
          <CarouselItem
            key={`course-column-${columnIndex}`}
            className="basis-[240px] md:basis-[293px]"
          >
            <div className="flex flex-col gap-3">
              {column.map((course, rowIndex) => {
                const originalIndex = columnIndex * 2 + rowIndex

                return (
                  <Link
                    key={course.id}
                    href={`/course/${course.id}` as const}
                    className="block w-full"
                  >
                    <CourseCard course={course} index={originalIndex} />
                  </Link>
                )
              })}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
