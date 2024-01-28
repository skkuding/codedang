import { Button } from '@/components/ui/button'
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
      {problems.length !== 0 && (
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center justify-between text-gray-700">
            <p className="text-xl font-bold">Professor’s Recommendation</p>
            <Link href={'/workbook/1' as Route}>
              <Button variant="outline" className="h-8">
                More
              </Button>
            </Link>
          </div>
          <div className="grid w-full grid-cols-3 gap-5">
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
          </div>
        </div>
      )}
    </>
  )
}
