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
  const data = await fetcher<{
    ongoing: Contest[]
    upcoming: Contest[]
  }>('/contest')
  //dummy test
  data.ongoing.push({
    id: 2,
    title: '대회',
    startTime: '2023-12-05T08:47:24.799Z',
    endTime: '2024-02-03T08:47:24.800Z',
    group: {
      id: 1,
      groupName: 'Example Group'
    }
  })
  data.upcoming.push(
    {
      id: 12,
      title: '2대회',
      startTime: '2023-01-25T08:47:24.799Z',
      endTime: '2024-02-03T08:47:24.800Z',
      group: {
        id: 1,
        groupName: 'Example Group'
      }
    },
    {
      id: 3,
      title: 'test 대회',
      startTime: '2023-02-02T08:47:24.799Z',
      endTime: '2024-03-03T08:47:24.800Z',
      group: {
        id: 1,
        groupName: 'Example Group'
      }
    }
    // {
    //   id: 38,
    //   title: 'testing',
    //   startTime: '2024-12-02T08:47:24.799Z',
    //   endTime: '2024-12-03T08:47:24.800Z',
    //   group: {
    //     id: 1,
    //     groupName: 'Example Group'
    //   }
    // }
    // {
    //   id: 28,
    //   title: 'yesdjkfj',
    //   startTime: '2024-04-02T08:47:24.799Z',
    //   endTime: '2024-04-03T08:47:24.800Z',
    //   group: {
    //     id: 1,
    //     groupName: 'Example Group'
    //   }
    // }
  )
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
    console.log('current index is ', currentIndex)
    if (
      direction === 'next' &&
      currentIndex < Math.floor((contests.length - 2) / contestsPerPage) + 1
    ) {
      console.log(
        'result is ',
        Math.floor((contests.length - 2) / contestsPerPage) + 2
      )
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
      <div className="flex justify-between gap-4 overflow-hidden">
        <div className="flex" style={carouselStyle}>
          {contests.map((contest) => (
            <Link
              key={contest.id}
              href={`/contest/${contest.id}` as Route}
              className="mr-5 w-72 hover:opacity-80"
            >
              <ContestCard contest={contest} />
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
