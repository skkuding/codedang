import { fetcher } from '@/libs/utils'
import type { Contest } from '@/types/type'
import Link from 'next/link'
import ContestCard from './ContestCard'

const getContests = async () => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
  } = await fetcher.get('contest/ongoing-upcoming').json()

  const contests = [
    ...data.ongoing.map((item) => ({ ...item, status: 'ongoing' as const })),
    ...data.upcoming.map((item) => ({ ...item, status: 'upcoming' as const }))
  ]

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
              href={`/contest/${contest.id}`}
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
              href={`/contest/${contest.id}`}
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
