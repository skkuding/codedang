'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/components/shadcn/carousel'
import { fetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import Link from 'next/link'
import { CourseCard } from '../_components/CourseCard'
import { RegisterCourseButton } from './RegisterCourseButton'

interface CourseCardListProps {
  title: string
}

export function CourseCardList({ title }: CourseCardListProps) {
  const { t } = useTranslate()
  const { data: courses = [] } = useQuery({
    queryKey: ['joinedCourses'],
    queryFn: async () => {
      return await fetcherWithAuth.get('course/joined').json<JoinedCourse[]>()
    }
  })

  if (courses.length === 0) {
    return (
      <div className="flex w-full flex-col gap-10 md:items-center md:justify-between">
        <div className="flex gap-4 text-2xl font-semibold leading-9 tracking-[-0.9px] md:text-[28px]">
          {title}
          <RegisterCourseButton />
        </div>
        <div className="flex h-72 w-full flex-col items-center justify-center rounded-[20px] border border-[#DFDFDF] text-xl font-normal text-[#737373]">
          <p>{t('no_courses_registered_message')}</p>
          <p>{t('register_button_prompt')}</p>
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
        <RegisterCourseButton />
      </div>
      <CarouselContent className="mb-[100px] ml-2 grid auto-cols-[240px] grid-flow-col grid-rows-2 gap-3 md:auto-cols-[293px]">
        {courses.map((course, index) => (
          <CarouselItem key={course.id} className="p-0">
            <Link
              href={`/course/${course.id}` as const}
              className="block w-full"
            >
              <CourseCard course={course} index={index} />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
