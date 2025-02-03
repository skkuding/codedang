'use client'

import Calendar from '@/public/icons/calendar-default.svg'
import Person from '@/public/icons/person.svg'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function CourseInfoBox() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const [courseCode, setcourseCode] = useState<string>()
  const [courseName, setcourseName] = useState<string>()
  const [courseSemester, setcourseSemester] = useState<string>()
  const [profName, setprofName] = useState<string>()

  useEffect(() => {
    const fetch = () => {
      try {
        setcourseCode('SWE3011_41')
        setcourseName('강의명은최대열세글자까지')
        setcourseSemester('2025 Spring')
        setprofName('박진영')
      } catch (err) {
        throw new Error('Failed to fetch data')
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="119"
          height="79"
          viewBox="0 0 119 79"
          fill="none"
          className="absolute bottom-0 right-0"
        >
          <path
            d="M143.953 75.5513C143.953 108.508 115.576 136.466 79 136.466C42.4238 136.466 14.047 108.508 14.047 75.5513C14.047 42.5946 42.4238 14.6368 79 14.6368C115.576 14.6368 143.953 42.5946 143.953 75.5513Z"
            stroke="url(#paint0_linear_7977_23144)"
            stroke-width="28.0939"
          />
          <defs>
            <linearGradient
              id="paint0_linear_7977_23144"
              x1="79"
              y1="0.589844"
              x2="79"
              y2="150.513"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#9B8AE7" />
              <stop offset="1" stop-color="#1F4C94" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
