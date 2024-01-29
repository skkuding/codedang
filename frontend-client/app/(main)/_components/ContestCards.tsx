import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import ContestCard from './ContestCard'

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
  let contests = data.ongoing.concat(data.upcoming)

  if (contests.length < 3) {
    const data: {
      finished: Contest[]
    } = await fetcher
      .get('contest/finished', {
        searchParams: {
          take: 3
        }
      })
      .json()
    data.finished.forEach((contest) => {
      contest.status = 'finished'
    })
    contests = contests.concat(data.finished)
  }

  return contests.slice(0, 3)
}

export default async function ContestCards() {
  const contests = await getContests()

  return (
    <>
      {contests.map((contest) => {
        return (
          <Link
            key={contest.id}
            href={`/contest/${contest.id}` as Route}
            className="inline-block w-full"
          >
            <ContestCard contest={contest} />
          </Link>
        )
      })}
    </>
  )
}
