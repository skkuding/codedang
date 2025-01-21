'use client'

//거의 이름만 바꿈.
//원래 ContestStatusTimeDiff -> CourseStatusTimeDiff로 이름 바꿈. -> _components에 파일을 만들
import { Progress } from '@/components/shadcn/progress'
import { cn } from '@/libs/utils'
import type { Course } from '@/types/type'
import 'react-circular-progressbar/dist/styles.css'
import { StatusBadge } from '../../../(main)/_components/StatusBadge'

interface Props {
  course: Course //type 변경 필요.
  color: string
}

export function CourseCard({ course, color }: Props) {
  //contest props -> course props로 변경해야..

  return (
    <div className="flex w-full flex-col justify-between gap-2 rounded-lg border border-gray-200 shadow-none transition hover:scale-105 hover:opacity-80">
      <div className={cn('h-40 w-full rounded-t-lg', color)} />
      <div className="flex w-full flex-col gap-1 px-6 py-4">
        <div className="line-clamp-4 text-ellipsis whitespace-pre-wrap text-lg font-semibold leading-tight text-black min-[400px]:line-clamp-2">
          {course.groupName}
        </div>
        <p className="text-sm font-normal">{course.professor}</p>
        <p className="my-2 font-mono text-sm font-normal text-neutral-500">
          {course.semester}
        </p>
        <div className="my-2 border-b" />
        <StatusBadge variant={course.status} />
        <div className="m-2">
          <p className="text-primary pb-2 text-xs font-semibold">2주차</p>
          <Progress value={75} className="w-2/3" />
          <p className="pt-1 text-xs font-normal text-neutral-500">3/4</p>
        </div>
      </div>
    </div>
  )
}
