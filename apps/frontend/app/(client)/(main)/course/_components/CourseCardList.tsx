'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '@/components/shadcn/carousel'
import { fetcherWithAuth } from '@/libs/utils'
import type { JoinedCourse } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CourseCard } from '../_components/CourseCard'
import { RegisterCourseButton } from './RegisterCourseButton'

// const bgVariants = [
//   'bg-[#fed7de]',
//   'bg-[#c4f2de]',
//   'bg-[#e6ffe2]',
//   'bg-[#e7d9fe]',
//   'bg-[#c4d8f7]',
//   'bg-[#ffef98]'
// ]

// interface Profile {
//   username: string // ID
//   userProfile: {
//     realName: string
//   }
//   studentId: string
//   major: string
// }

// function getRandomColorArray(username: string) {
//   let hash = 0
//   for (let i = 0; i < username.length; i++) {
//     hash = (hash << 5) - hash + username.charCodeAt(i)
//     hash |= 0
//   }

//   function pseudoRandom(seed: number) {
//     seed = (seed * 9301 + 49297) % 233280
//     return seed / 233280
//   }

//   const array = [...bgVariants]

//   let seed = Math.abs(hash)
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(pseudoRandom(seed) * (i + 1))
//     ;[array[i], array[j]] = [array[j], array[i]]
//     seed = seed * 9301 + 49297
//   }

//   return array
// }

interface CourseCardListProps {
  title: string
}

export function CourseCardList({ title }: CourseCardListProps) {
  // Get username and generate colors
  // const { data: username = 'unknown' } = useQuery({
  //   queryKey: ['username'],
  //   queryFn: async () => {
  //     const data: Profile = await safeFetcherWithAuth.get('user').json()
  //     return data.username
  //   }
  // })

  const { data: courses = [] } = useQuery({
    queryKey: ['joinedCourses'],
    queryFn: async () => {
      return await fetcherWithAuth.get('course/joined').json<JoinedCourse[]>()
    }
  })

  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!carouselApi) {
      return
    }

    const onInit = () => {
      setCount(carouselApi.scrollSnapList().length)
      setCurrent(carouselApi.selectedScrollSnap() + 1)
    }

    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1)
    }

    onInit()
    carouselApi.on('reInit', onInit)
    carouselApi.on('select', onSelect)

    return () => {
      carouselApi.off('reInit', onInit)
      carouselApi.off('select', onSelect)
    }
  }, [carouselApi])

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
    <Carousel
      setApi={setCarouselApi}
      opts={{ align: 'start' }}
      className="flex w-full flex-col"
    >
      <div className="mb-3 flex w-full items-center justify-between">
        <span className="text-2xl font-semibold leading-9 tracking-[-0.9px] md:text-[28px]">
          {title}
        </span>
        <RegisterCourseButton />
        {/* <div className="hidden items-center justify-end gap-2 md:flex">
          <CarouselPrevious />
          <CarouselNext />
        </div> */}
      </div>
      <CarouselContent className="mb-[100px] ml-2 grid auto-cols-[240px] grid-flow-col grid-rows-2 gap-3 md:auto-cols-[293px]">
        {courses.map((course, index) => (
          <CarouselItem key={course.id} className="p-0">
            <Link href={`/course/${course.id}`} className="block w-full">
              <CourseCard course={course} index={index} />
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
