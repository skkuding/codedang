'use client'

//거의 이름만 바꿈.
//원래 ContestStatusTimeDiff -> CourseStatusTimeDiff로 이름 바꿈. -> _components에 파일을 만들
import { cn } from '@/libs/utils'
import type { Course } from '@/types/type'
import 'react-circular-progressbar/dist/styles.css'
import { StatusBadge } from '../../../(main)/_components/StatusBadge'

const txtVariants = {
  ongoing: 'text-blue-500',
  upcoming: 'text-red-400',
  finished: 'text-gray-500',
  registeredOngoing: 'text-blue-500',
  registeredUpcoming: 'text-red-400'
}

interface Props {
  course: Course //type 변경 필요.
  color: string
}

export function CourseCard({ course, color }: Props) {
  //contest props -> course props로 변경해야..

  return (
    <div className="flex w-full flex-col justify-between gap-2 rounded-lg border border-gray-200 shadow-none transition hover:scale-105 hover:opacity-80">
      <div className={cn('h-40 w-full rounded-t-lg', color)} />
      <div className="flex w-full flex-col gap-2 px-6 py-4">
        <div className="line-clamp-4 text-ellipsis whitespace-pre-wrap text-lg font-semibold leading-tight text-black min-[400px]:line-clamp-2">
          {course.groupName}
        </div>
        <p className="text-sm font-normal">{course.semester}</p>
        <p className="py-2 font-mono text-sm font-normal text-neutral-500">
          {course.professor}
        </p>
        <div className="my-2 border-b" />

        <StatusBadge variant={course.status} />
      </div>
    </div>
  )
}
