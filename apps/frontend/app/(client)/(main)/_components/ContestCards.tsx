import { fetcher } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import ContestCard from './ContestCard'

const getContests = async () => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
  } = await fetcher.get('contest/ongoing-upcoming').json()

  data.ongoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.upcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })
  const contests = data.ongoing.concat(data.upcoming)

  return contests.slice(0, 3)
}

export default async function ContestCards() {
  const contests = await getContests()

  return (
    <>
      <div className="flex justify-start gap-5 md:hidden">
        {contests.slice(0, 2).map((contest) => {
          return (
            <Link
              key={contest.id}
              href={`/contest/${contest.id}` as Route}
              className="inline-block w-1/2"
            >
              <ContestCard contest={contest} />
            </Link>
          )
        })}
      </div>
      <div className="hidden justify-start gap-5 md:flex">
        {contests.map((contest) => {
          return (
            <Link
              key={contest.id}
              href={`/contest/${contest.id}` as Route}
              className="inline-block w-1/3"
            >
              <ContestCard contest={contest} />
            </Link>
          )
        })}
      </div>
    </>
  )
}
