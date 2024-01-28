import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/utils'
import type { Contest } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import ContestCard from './ContestCard'

const getContests = async () => {
  let count = 0
  const interval = setInterval(() => {
    console.log('Fetching contest data...', ++count, 'times')
  }, 1000)
  const before = new Date()
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
  } = await fetcher.get('contest').json()
  const after = new Date()
  console.log('Response time:', after.getTime() - before.getTime(), 'ms')
  clearInterval(interval)

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
      {contests.length !== 0 && (
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between text-gray-700">
            <p className="text-xl font-bold">Contest</p>
            <Link href="/contest">
              <Button variant="outline" className="h-8">
                More
              </Button>
            </Link>
          </div>
          <div className="grid w-full grid-cols-3 gap-5">
            {contests.map((contest) => {
              return (
                <Link
                  key={contest.id}
                  href={`/contest/${contest.id}` as Route}
                  className="inline-block h-[125px] w-[375px]"
                >
                  <ContestCard contest={contest} />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
