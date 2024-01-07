import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/utils'
import type { Contest, WorkbookProblem } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import Carousel from './_components/Carousel'
import ContestCard from './_components/ContestCard'
import ProblemCard from './_components/ProblemCard'

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
  const contests = await getContests()
  const problems: WorkbookProblem[] = await fetcher
    .get('workbook/1/problem', {
      searchParams: {
        take: 3
      }
    })
    .json()
  return (
    <div className="flex flex-col gap-12">
      <Carousel slides={slides}></Carousel>
      <div>
        <div className="flex items-center justify-between pb-5">
          <p className="text-2xl font-bold text-gray-500">Contest</p>
          <Link href="/contest">
            <Button
              variant="outline"
              className="h-7 rounded-full border-gray-500 px-5 text-sm"
            >
              More
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {contests.map((contest) => {
            return (
              <Link
                key={contest.id}
                href={`/contest/${contest.id}` as Route}
                className="hover:opacity-80"
              >
                <ContestCard contest={contest} />
              </Link>
            )
          })}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between pb-5">
          <p className="text-2xl font-bold text-gray-500">Dive in!</p>
          <Link href="/contest">
            <Button
              variant="outline"
              className="h-7 rounded-full border-gray-500 px-5 text-sm"
            >
              More
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {problems.map((problem) => {
            return (
              <Link
                key={problem.problemId}
                href={`/workbook/1/${problem.problemId}` as Route}
                className="hover:opacity-80"
              >
                <ProblemCard problem={problem} />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
