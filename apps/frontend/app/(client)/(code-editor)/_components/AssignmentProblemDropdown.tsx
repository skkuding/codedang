'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { cn, convertToLetter, isHttpError } from '@/libs/utils'
import checkIcon from '@/public/icons/check-green.svg'
import type { ProblemDetail } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaSortDown } from 'react-icons/fa'
import { assignmentProblemQueries } from '../../_libs/queries/assignmentProblem'

interface AssignmentProblemDropdownProps {
  problem: Required<ProblemDetail>
  assignmentId: number
  courseId: number
}

export function AssignmentProblemDropdown({
  problem,
  assignmentId,
  courseId
}: AssignmentProblemDropdownProps) {
  const { data: assignmentProblem, error } = useQuery({
    ...assignmentProblemQueries.list({ assignmentId, take: 20 }),
    throwOnError: false
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-1 text-lg text-white outline-none">
        <h1>{`${convertToLetter(problem.order)}. ${problem.title}`}</h1>
        <FaSortDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-slate-700 bg-slate-900">
        {error && isHttpError(error)
          ? 'Failed to load the assignment problem'
          : assignmentProblem?.data.map((p) => (
              <Link
                key={p.id}
                href={
                  `/course/${courseId}/assignment/${assignmentId}/problem/${p.id}` as Route
                }
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
                      <Image
                        src={checkIcon}
                        alt="check"
                        width={16}
                        height={16}
                      />
                    </div>
                  )}
                </DropdownMenuItem>
              </Link>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
