import { Button } from '@/components/ui/button'
import { fetcher } from '@/lib/utils'
import type { Contest, WorkbookProblem } from '@/types/type'
import Link from 'next/link'
import ContestCard from './_components/ContestCard'
import ProblemCard from './_components/ProblemCard'

const getContests = async () => {
  const data = await fetcher<{
    ongoing: Contest[]
    upcoming: Contest[]
  }>('/contest')
  data.ongoing.forEach((contest) => {
    contest.badge = 'ongoing'
  })
  data.upcoming.forEach((contest) => {
    contest.badge = 'upcoming'
  })
  let contests = data.ongoing.concat(data.upcoming)

  if (contests.length < 3) {
    const data = await fetcher<{ finished: Contest[] }>(
      '/contest/finished?take=3'
    )
    data.finished.forEach((contest) => {
      contest.badge = 'finished'
    })
    contests = contests.concat(data.finished)
  }
  return contests.slice(0, 3)
}

export default async function Home() {
  const contests = await getContests()
  const problems = await fetcher<WorkbookProblem[]>(
    '/workbook/1/problem?take=3'
  )

  return (
    <div className="flex flex-col gap-12">
      <div>
        <div className="flex justify-between pb-5">
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
        <div className="flex w-full gap-4">
          {contests.map((contest) => {
            return (
              <Link
                key={contest.id}
                href={`/contest/${contest.id}`}
                className="w-1/3 hover:opacity-80"
              >
                <ContestCard contest={contest} />
              </Link>
            )
          })}
        </div>
      </div>
      <div>
        <div className="flex justify-between pb-5">
          <p className="text-2xl font-bold text-gray-500">[Prof. Kim] Pick!</p>
          <Link href="/contest">
            <Button
              variant="outline"
              className="h-7 rounded-full border-gray-500 px-5 text-sm"
            >
              More
            </Button>
          </Link>
        </div>
        <div className="flex w-full gap-4">
          {problems.map((problem) => {
            return (
              <Link
                key={problem.problemId}
                href={`/workbook/1/${problem.problemId}`}
                className="w-1/3 hover:opacity-80"
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
