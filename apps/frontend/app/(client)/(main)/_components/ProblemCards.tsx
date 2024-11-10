'use client'

import { Skeleton } from '@/components/shadcn/skeleton'
import { fetcher } from '@/lib/utils'
import type { WorkbookProblem } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ProblemCard from './ProblemCard'

interface ProblemCardsProps {
  data: WorkbookProblem[]
  total: number
}

const getProblems = async () => {
  const problemRes: ProblemCardsProps = await fetcher
    .get('problem', {
      searchParams: {
        take: 3,
        order: 'submit-desc'
        // workbookId: 1
      }
    })
    .json()

  problemRes.data ?? console.error('4.getProblem', problemRes)
  return problemRes.data ?? problemRes
}

export default function ProblemCards() {
  const [problems, setProblems] = useState<WorkbookProblem[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getProblems().then((res) => {
      setProblems(res)
      setLoading(false)
    })
  }, [])

  return (
    <>
      <div className="flex justify-start gap-5 md:hidden">
        {loading
          ? [...Array(2)].map((_, i) => (
              <Skeleton key={i} className="flex h-[120px] w-full rounded-xl" />
            ))
          : problems.slice(0, 2).map((problem) => {
              return (
                <Link
                  key={problem.id}
                  href={`/problem/${problem.id}` as Route}
                  className="inline-block w-1/2"
                >
                  <ProblemCard problem={problem} />
                </Link>
              )
            })}
      </div>
      <div className="hidden justify-start gap-5 md:flex">
        {loading
          ? [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="flex h-[120px] w-full rounded-xl" />
            ))
          : problems.map((problem) => {
              return (
                <Link
                  key={problem.id}
                  href={`/problem/${problem.id}` as Route}
                  className="inline-block w-1/3"
                >
                  <ProblemCard problem={problem} />
                </Link>
              )
            })}
      </div>
    </>
  )
}
