import { Button } from '@/components/shadcn/button'
import Link from 'next/link'
import { getProblemList } from '../../_libs/apis/problem'
import ProblemCard from './ProblemCard'

export default async function ProblemCards() {
  const { data: problems } = await getProblemList({
    take: 3,
    order: 'submit-desc'
  })

  return (
    problems.length > 0 && (
      <div className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-between text-gray-700">
          <p className="text-2xl font-bold">Problem ✨</p>
          <Link href={'/problem'}>
            <Button variant="ghost" className="h-8 px-3">
              See More
            </Button>
          </Link>
        </div>
        <div className="flex justify-start gap-5 md:hidden">
          {problems.slice(0, 2).map((problem) => (
            <Link
              key={problem.id}
              href={`/problem/${problem.id}`}
              className="inline-block w-1/2"
            >
              <ProblemCard problem={problem} />
            </Link>
          ))}
        </div>
        <div className="hidden justify-start gap-5 md:flex">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              href={`/problem/${problem.id}`}
              className="inline-block w-1/3"
            >
              <ProblemCard problem={problem} />
            </Link>
          ))}
        </div>
      </div>
    )
  )
}
