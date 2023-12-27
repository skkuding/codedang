import { fetcher } from '@/lib/utils'
import type { Contest, WorkbookProblem } from '@/types/type'
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
    <>
      <div className="flex">
        {contests.map((contest) => {
          return <ContestCard key={contest.id} contest={contest} />
        })}
      </div>
      <div className="flex">
        {problems.map((problem) => {
          return <ProblemCard key={problem.problemId} problem={problem} />
        })}
      </div>
    </>
  )
}
