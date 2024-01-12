import { Button } from '@/components/ui/button'
import { fetcher, fetcherWithAuth } from '@/lib/utils'
import type { Contest, WorkbookProblem } from '@/types/type'
import { Trophy, ThumbsUp } from 'lucide-react'
import type { Route } from 'next'
import Link from 'next/link'
import Carousel from './_components/Carousel'
import ContestCard from './_components/ContestCard'
import ProblemCard from './_components/ProblemCard'

// FIXME: Build error occurs when using static routes
// Disable static routes as a workaround for now
// https://github.com/vercel/next.js/issues/54961
export const dynamic = 'force-dynamic'

const slides = [{ href: '/problem/1' }, { href: '/problem/2' }]

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

export default async function Home() {
  const data = await fetcherWithAuth.get('user').json()
  console.log(data)
  const contests = await getContests()
  const problems: WorkbookProblem[] = await fetcher
    .get('workbook/1/problem', {
      searchParams: {
        take: 3
      }
    })
    .json()
  return (
    <div className="flex w-full flex-col gap-12 lg:items-center">
      <Carousel slides={slides}></Carousel>
      {contests.length !== 0 && (
        <div className="max-w-max">
          <div className="flex items-center justify-between p-2 text-gray-700">
            <div className="flex items-center gap-2">
              <Trophy />
              <p className="text-xl font-bold md:text-2xl">Contest</p>
            </div>
            <Link href="/contest">
              <Button
                variant="ghost"
                className="text-md rounded-full border-gray-500 px-5 font-semibold"
              >
                More
              </Button>
            </Link>
          </div>
          <div className="scrollbar-hide h-46 -ml-8 -mr-8 flex gap-10 overflow-x-auto">
            <div className="sticky left-0 z-10 -mr-10 bg-gradient-to-r from-white to-transparent pr-10"></div>
            {contests.map((contest) => {
              return (
                <Link key={contest.id} href={`/contest/${contest.id}` as Route}>
                  <ContestCard contest={contest} />
                </Link>
              )
            })}
            {Array.from({ length: 3 - contests.length }).map((_, i) => {
              return <div key={i} className="w-60 md:w-72"></div>
            })}
            <div className="sticky right-0 z-10 -ml-10 bg-gradient-to-l from-white to-transparent pl-10"></div>
          </div>
        </div>
      )}
      {problems.length !== 0 && (
        <div className="max-w-max">
          <div className="flex items-center justify-between p-2 text-gray-700">
            <div className="flex items-center gap-2">
              <div>
                <ThumbsUp />
              </div>
              <p className="text-xl font-bold md:text-2xl">Dive in!</p>
            </div>
            <Link href={'/workbook/1' as Route}>
              <Button
                variant="ghost"
                className="text-md rounded-full border-gray-500 px-5 font-semibold"
              >
                More
              </Button>
            </Link>
          </div>
          <div className="scrollbar-hide h-46 -ml-8 -mr-8 flex gap-10 overflow-x-auto">
            <div className="sticky left-0 z-10 -mr-10 bg-gradient-to-r from-white to-transparent pr-10"></div>
            {problems.map((problem) => {
              return (
                <Link
                  key={problem.problemId}
                  href={`/problem/${problem.problemId}` as Route}
                >
                  <ProblemCard problem={problem} />
                </Link>
              )
            })}
            {Array.from({ length: 3 - problems.length }).map((_, i) => {
              return <div key={i} className="w-60 md:w-72"></div>
            })}
            <div className="sticky right-0 z-10 -ml-10 bg-gradient-to-l from-white to-transparent pl-10"></div>
          </div>
        </div>
      )}
    </div>
  )
}
