import { fetcher } from '@/lib/utils'
import type { WorkbookProblem } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import ProblemCard from './ProblemCard'

const getProblems = async () => {
  const problems: WorkbookProblem[] = await fetcher
    .get('problem', {
      searchParams: {
        take: 3,
        workbookId: 1
      }
    })
    .json()

  return problems
}

export default async function ProblemCards() {
  const problems = await getProblems()

  return (
    <>
      {problems.map((problem) => {
        return (
          <Link
            key={problem.problemId}
            href={`/problem/${problem.problemId}` as Route}
            className="inline-block w-full"
          >
            <ProblemCard problem={problem} />
          </Link>
        )
      })}
    </>
  )
}
