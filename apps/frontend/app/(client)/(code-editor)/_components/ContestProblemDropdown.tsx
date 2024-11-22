'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { Skeleton } from '@/components/shadcn/skeleton'
import { cn, convertToLetter } from '@/libs/utils'
import checkIcon from '@/public/icons/check-green.svg'
import type { ProblemDetail } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { FaSortDown } from 'react-icons/fa'
import { contestProblemQueries } from '../../_libs/queries/contestProblem'

interface ContestProblemDropdownProps {
  problem: Required<ProblemDetail>
  contestId: number
}

export default function ContestProblemDropdown({
  problem,
  contestId
}: ContestProblemDropdownProps) {
  const { data: contestProblems } = useSuspenseQuery(
    contestProblemQueries.list({ contestId, take: 20 })
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-1 text-lg text-white outline-none">
        <h1>{`${convertToLetter(problem.order)}. ${problem.title}`}</h1>
        <FaSortDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-slate-700 bg-slate-900">
        {contestProblems.data.map((p) => (
          <Link key={p.id} href={`/contest/${contestId}/problem/${p.id}`}>
            <DropdownMenuItem
              className={cn(
                'flex justify-between text-white hover:cursor-pointer focus:bg-slate-800 focus:text-white',
                problem.id === p.id &&
                  'text-primary-light focus:text-primary-light'
              )}
            >
              {`${convertToLetter(p.order)}. ${p.title}`}
              {p.submissionTime && (
                <div className="flex items-center justify-center pl-2">
                  <Image src={checkIcon} alt="check" width={16} height={16} />
                </div>
              )}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ContestProblemDropdownFallback({
  problemTitle
}: {
  problemTitle: string
}) {
  return (
    <div className="flex gap-1 text-lg text-white outline-none">
      <Skeleton className="size-6 bg-gray-50/10" />
      <h1>{`. ${problemTitle}`}</h1>
      <FaSortDown />
    </div>
  )
}
