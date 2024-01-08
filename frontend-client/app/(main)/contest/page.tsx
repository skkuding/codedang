import { baseUrl } from '@/lib/vars'
import type { Contest } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import ContestCard from '../_components/ContestCard'
import ContestTable from './_components/ContestTable'

export default async function Contest() {
  const unfinishedRes = await fetch(baseUrl + '/contest')
  const unfinishedData = await unfinishedRes.json()

  const finishedRes = await fetch(baseUrl + '/contest/finished?take=51', {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const finishedData = await finishedRes.json()

  // TODO: LogIn 했을 때 Registered Contest Card

  unfinishedData.ongoing.forEach((contest: { status: string }) => {
    contest.status = 'ongoing'
  })
  unfinishedData.upcoming.forEach((contest: { status: string }) => {
    contest.status = 'upcoming'
  })
  finishedData.finished.forEach((contest: { status: string }) => {
    contest.status = 'finished'
  })
  const contests: Contest[] = [
    ...unfinishedData.upcoming,
    ...unfinishedData.ongoing,
    ...finishedData.finished
  ]

  const ongoingContests = contests.filter(
    (contest) => contest.status === 'ongoing'
  )
  ongoingContests.slice(0, 3)

  return (
    <>
      {ongoingContests.length !== 0 && (
        <div className="max-w-max">
          <div className="flex items-center justify-between p-2 text-gray-700">
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold md:text-2xl">Ongoing</p>
            </div>
          </div>
          <div className="scrollbar-hide h-46 -ml-8 -mr-8 flex gap-10 overflow-x-auto">
            <div className="sticky left-0 z-10 -mr-10 bg-gradient-to-r from-white to-transparent pr-10"></div>
            {ongoingContests.map((contest) => {
              return (
                <Link key={contest.id} href={`/contest/${contest.id}` as Route}>
                  <ContestCard contest={contest} />
                </Link>
              )
            })}
            {Array.from({ length: 3 - ongoingContests.length }).map((_, i) => {
              return <div key={i} className="w-60 md:w-72"></div>
            })}
            <div className="sticky right-0 z-10 -ml-10 bg-gradient-to-l from-white to-transparent pl-10"></div>
          </div>
        </div>
      )}
      {/* TODO: Add search bar */}
      <ContestTable data={contests} />
    </>
  )
}
