'use client'

import Calendar from '@/public/icons/calendar-default.svg'
import Person from '@/public/icons/person.svg'
import QuarterEllipse from '@/public/icons/quarter-ellipse.svg'
import Image from 'next/image'
// TODO: 백엔드 API 사용할 떄 필요할 것 같습니다(민규)
// import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function CourseInfoBox() {
  // TODO: 백엔드 API 사용할 떄 필요할 것 같습니다(민규)
  // const searchParams = useSearchParams()\
  // const courseId = searchParams.get('courseId')
  const [courseCode, setCourseCode] = useState('')
  const [courseName, setCourseName] = useState('')
  const [courseSemester, setCourseSemester] = useState('')
  const [profName, setProfName] = useState('')

  useEffect(() => {
    const fetch = () => {
      try {
        setCourseCode('SWE3011_41')
        setCourseName('강의명은최대열세글자까지')
        setCourseSemester('2025 Spring')
        setProfName('박진영')
      } catch (err) {
        throw new Error(`Failed to fetch data: ${err}`)
      }
    }
    fetch()
  }, [])

  return (
    <div className="relative m-4 flex h-[153px] w-[281px] flex-col justify-between rounded-xl p-4 shadow">
      <div className="text-primary flex flex-col text-base font-semibold">
        <span>[{courseCode}]</span>
        <span>{courseName}</span>
      </div>
      <div>
        <div className="flex flex-col gap-1">
          <div className="flex">
            <Image src={Calendar} alt="Calendar" height={20} />
            <span className="ml-1 font-light">{courseSemester}</span>
          </div>
          <div className="flex">
            <Image src={Person} alt="Person" height={20} />
            <span className="ml-1 font-light">Prof. {profName}</span>
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
