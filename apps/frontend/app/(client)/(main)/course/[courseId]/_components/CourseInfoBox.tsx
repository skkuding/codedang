import { fetcherWithAuth } from '@/libs/utils'
import QuarterEllipse from '@/public/icons/quarter-ellipse.svg'
import type { Course } from '@/types/type'
import Image from 'next/image'
import { BsPersonFill } from 'react-icons/bs'
import { FaCalendar } from 'react-icons/fa'

interface CourseInfoBoxProps {
  courseId: string
}

export async function CourseInfoBox({ courseId }: CourseInfoBoxProps) {
  const res = await fetcherWithAuth.get(`course/${courseId}`)
  if (res.ok) {
    const course: Course = await res.json()

    return (
      <div className="relative m-4 flex h-[153px] w-[281px] flex-col justify-between rounded-xl p-7 shadow">
        <div className="flex flex-col text-sm font-semibold">
          <span>
            [{`${course.courseInfo.courseNum}_${course.courseInfo.classNum}`}]
          </span>
          <span className="line-clamp-2">{course.groupName}</span>
        </div>
        <div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex">
              <FaCalendar className="ml-[2px]" />
              <span className="ml-1 font-light">
                {course.courseInfo.semester}
              </span>
            </div>
            <div className="flex">
              <BsPersonFill size={19} />
              <span className="ml-1 font-light">
                Prof. {course.courseInfo.professor}
              </span>
            </div>
          </div>
          <Image
            src={QuarterEllipse}
            alt="Quarter Ellipse"
            layout="intrinsic"
            className="absolute bottom-0 right-0"
          />
        </div>
      </div>
    )
  }
}
