import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { cn, convertToLetter } from '@/libs/utils'
import checkIcon from '@/public/icons/check-green.svg'
import { useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaSortDown } from 'react-icons/fa'

interface AssignmentProblemDropdownProps {
  problemId: number
  assignmentId: number
  courseId: number
  userId: number
  isSubmitted: boolean
}

export function AssignmentProblemDropdown({
  problemId,
  assignmentId,
  courseId,
  userId,
  isSubmitted
}: AssignmentProblemDropdownProps) {
  const assignmentProblems =
    useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
      variables: {
        groupId: courseId,
        assignmentId
      }
    }).data?.getAssignmentProblems ?? []

  const sortedProblems = [...assignmentProblems].sort(
    (a, b) => a.order - b.order
  )

  const currentProblem = assignmentProblems.find(
    (p) => p.problemId === problemId
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-1 text-lg text-white outline-none">
        <h1>{`${convertToLetter(currentProblem?.order ?? 0)}. ${currentProblem?.problem.title}`}</h1>
        <FaSortDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-slate-700 bg-slate-900">
        {sortedProblems.map((p) => (
          <Link
            href={
              `/admin/course/${courseId}/grade/assignment/${assignmentId}/user/${userId}/problem/${p.problemId}` as Route
            }
            key={p.problemId}
          >
            <DropdownMenuItem
              className={cn(
                'flex justify-between text-white hover:cursor-pointer focus:bg-slate-800 focus:text-white',
                currentProblem?.problemId === p.problemId &&
                  'text-primary-light focus:text-primary-light'
              )}
              key={p.problemId}
            >
              {`${convertToLetter(p.order)}. ${p.problem.title}`}
              {isSubmitted && (
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
