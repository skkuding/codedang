'use client'

import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { IoIosArrowBack } from 'react-icons/io'
import ContestCard from '../_components/ContestCard'

const getContests = async () => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
  } = await fetcher.get('contest').json()
  data.ongoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.upcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })

  return data.ongoing.concat(data.upcoming)
}
//TODO: Registered로 요청했을 떄, 로그인 토큰 담아서 /contest/auth로 contest 받아오는 함수

export default function ContestCardList({ type }: { type: string }) {
  const [contests, setContests] = useState<Contest[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const contestsPerPage = 3

  useEffect(() => {
    const fetchData = async () => {
      const data = await getContests()
      setContests(data)
    }

    fetchData()
  }, [])

  const handleArrowClick = (direction: 'next' | 'prev') => {
    if (
      direction === 'next' &&
      currentIndex < Math.floor((contests.length - 2) / contestsPerPage) + 1
    ) {
      setCurrentIndex(currentIndex + 1)
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }
  const carouselStyle = {
    transform: `translateX(-${currentIndex * (100 / contestsPerPage)}%)`,
    transition: 'transform 0.5s ease-in-out'
  }

  return (
    <>
      <div className="flex justify-between">
        <div className="text-2xl font-bold text-gray-500">{type}</div>
        {contests.length < 4 ? (
          ''
        ) : (
          <div className="flex gap-1">
            <div
              className="rounded-lg border border-gray-200 p-2 text-2xl font-semibold text-gray-700"
              onClick={() => handleArrowClick('prev')}
            >
              <IoIosArrowBack />
            </div>
            <div
              className="rounded-lg border border-gray-200 p-2 text-2xl font-semibold text-gray-700"
              onClick={() => handleArrowClick('next')}
            >
              <IoIosArrowForward />
            </div>
          </div>
        )}
      </div>
      <div>
        <div className="bottom-30 flex w-full justify-between gap-5 overflow-hidden">
          {contests.map((contest) => {
            return (
              <Link
                key={contest.id}
                href={`/contest/${contest.id}` as Route}
                className="inline-block h-[120] w-[325]"
              >
                <ContestCard contest={contest} />
              </Link>
            )
          })}
        </div>
        <div className="relative bottom-[122px] left-[900px] h-[125px] w-[125px] bg-gradient-to-r from-transparent to-white"></div>
      </div>
    </>
  )
}
