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

    const itemsPerColumn = courses.length <= 4 ? 4 : 2

    for (let i = 0; i < courses.length; i += itemsPerColumn) {
      columns.push(courses.slice(i, i + itemsPerColumn))
    }

    return columns
  }, [courses])

  if (courses.length === 0) {
    return (
      <div className="flex w-full flex-col gap-10 md:items-center md:justify-between">
        <div className="text-head5_sb_24 md:text-head3_sb_28 flex w-full justify-between gap-4">
          {title}
          <RegisterCourseButton />
        </div>
        <div className="text-title2_m_20 flex h-72 w-full flex-col items-center justify-center rounded-[20px] border border-[#DFDFDF] text-[#737373]">
          <p>There are no courses registered!</p>
          <p>
            Please click the register button at the top to enroll in a course.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {courses.length <= 4 ? (
        <>
          <div className="mb-3 flex w-full items-center justify-between">
            <span className="text-head5_sb_24 md:text-head3_sb_28">
              {title}
            </span>
            <RegisterCourseButton />
          </div>
          <div className="hidden gap-3 md:grid md:grid-cols-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/course/${course.id}`}
                className="block"
              >
                <CourseCard course={course} index={0} />
              </Link>
            ))}
          </div>
          <Carousel
            opts={{ align: 'start', slidesToScroll: 1 }}
            className="flex w-full flex-col md:hidden"
          >
            <CarouselContent className="mb-[15px] ml-2">
              {courseColumns.map((column, columnIndex) => (
                <CarouselItem
                  key={`course-column-${columnIndex}`}
                  className="basis-[240px]"
                >
                  <div className="flex flex-col gap-3">
                    {column.map((course, rowIndex) => {
                      const originalIndex = columnIndex * 4 + rowIndex

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
        </>
      ) : (
        <Carousel
          opts={{ align: 'start', slidesToScroll: 1 }}
          className="flex w-full flex-col"
        >
          <div className="mb-3 flex w-full items-center justify-between">
            <span className="text-head5_sb_24 md:text-head3_sb_28">
              {title}
            </span>
            <div className="flex items-center gap-3">
              <CarouselPrevious className="h-6 w-6" />
              <CarouselNext className="h-6 w-6" />
              <RegisterCourseButton />
            </div>
          </div>

          <CarouselContent className="mb-[15px] ml-2">
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
      )}
    </div>
  )
}
