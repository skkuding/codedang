'use client'

//거의 이름만 바꿈.
import CourseStatusTimeDiff from '@/app/(client)/(main)/course/_components/CourseStatusTimeDiff'
//원래 ContestStatusTimeDiff -> CourseStatusTimeDiff로 이름 바꿈. -> _components에 파일을 만들
import { cn, dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import type { Course } from '@/types/type'
import Image from 'next/image'
import 'react-circular-progressbar/dist/styles.css'
import StatusBadge from '../../../(main)/_components/StatusBadge'

const bgVariants = {
  ongoing: 'bg-gradient-to-b from-blue-100 to-white',
  upcoming: 'bg-white',
  finished: 'bg-gray-500',
  registeredOngoing: 'bg-gradient-to-b from-blue-100 to-white',
  registeredUpcoming: 'bg-white'
}

const txtVariants = {
  ongoing: 'text-blue-500',
  upcoming: 'text-red-400',
  finished: 'text-gray-500',
  registeredOngoing: 'text-blue-500',
  registeredUpcoming: 'text-red-400'
}
interface Props {
  course: Course //type 변경 필요.
}

export default function CourseCard({ course }: Props) {
  //contest props -> course props로 변경해야..
  const startTime = dateFormatter(course.startTime, 'YYYY-MM-DD')
  const endTime = dateFormatter(course.endTime, 'YYYY-MM-DD')

  return (
    <div
      className={cn(
        'flex w-full flex-col justify-between gap-4 rounded-md border border-gray-200 px-3 shadow-none transition hover:scale-105 hover:opacity-80',
        bgVariants[course.status]
      )}
    >
      <div
        className={cn(
          'flex flex-col justify-between gap-4 pt-4 uppercase',
          txtVariants[course.status]
        )}
      >
        <StatusBadge variant={course.status} />
        <div className="line-clamp-4 text-ellipsis whitespace-pre-wrap text-lg font-semibold leading-tight text-black min-[400px]:line-clamp-2">
          {course.title}
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div className="line-clamp-2 flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-gray-800 opacity-80">
            <Image src={calendarIcon} alt="Calendar" />
            <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
              {startTime} ~ {endTime}
            </p>
          </div>
          <CourseStatusTimeDiff
            course={course}
            textStyle="text-xs text-gray-800"
            inCourseEditor={false}
          />
        </div>
      </div>
    </div>
  )
}
