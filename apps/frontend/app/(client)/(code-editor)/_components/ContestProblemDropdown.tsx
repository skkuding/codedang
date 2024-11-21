'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { cn, convertToLetter, fetcherWithAuth } from '@/libs/utils'
import checkIcon from '@/public/icons/check-green.svg'
import type { ContestProblem, ProblemDetail } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaSortDown } from 'react-icons/fa'

interface ContestProblemProps {
  data: ContestProblem[]
  total: number
}

interface ContestProblemDropdownProps {
  problems: ContestProblemProps | undefined
  problem: ProblemDetail
  problemId: number
  contestId: number
}

export default function ContestProblemDropdown({
  problems,
  problem,
  problemId,
  contestId
}: ContestProblemDropdownProps) {
  const { data, isSuccess } = useQuery<ContestProblemProps | undefined>({
    queryKey: ['contest', contestId, 'problems'],
    queryFn: () =>
      fetcherWithAuth.get(`contest/${contestId}/problem?take=20`).json(),
    enabled: false
  })

  if (isSuccess) problems = data

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-1 text-lg text-white outline-none">
        <h1>{`${convertToLetter(problems?.data.find((item) => item.id === Number(problemId))?.order as number)}. ${problem.title}`}</h1>
        <FaSortDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-slate-700 bg-slate-900">
        {problems?.data.map((p: ContestProblem) => (
          <Link
            key={p.id}
            href={`/contest/${contestId}/problem/${p.id}` as Route}
          >
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
