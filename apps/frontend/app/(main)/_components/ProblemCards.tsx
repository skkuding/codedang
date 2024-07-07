import { fetcher } from '@/lib/utils'
import type { WorkbookProblem } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import ProblemCard from './ProblemCard'

interface ProblemCardsProps {
  data: WorkbookProblem[]
  total: number
}

const getProblems = async () => {
  const res: ProblemCardsProps = await fetcher
    .get('problem', {
      searchParams: {
        take: 3
        // workbookId: 1
      }
    })
    .json()

  res.data ?? console.error('4.getProblem', res)
  return res.data ?? []
}

export default async function ProblemCards() {
  const problems = await getProblems()

  return (
    <>
      {problems.map((problem) => {
        return (
          <Link
            key={problem.id}
            href={`/problem/${problem.id}` as Route}
            className="inline-block w-full"
          >
            <ProblemCard problem={problem} />
          </Link>
        )
      })}
    </>
  )
}
