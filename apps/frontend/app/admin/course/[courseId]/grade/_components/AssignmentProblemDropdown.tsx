import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { cn, convertToLetter } from '@/libs/utils'
import checkIcon from '@/public/icons/check-green.svg'
import { useQuery } from '@apollo/client'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FaSortDown } from 'react-icons/fa'

interface CurrentProblem {
  id: number
  order: number
  title: string
}

interface AssignmentProblemDropdownProps {
  problem: CurrentProblem
  assignmentId: number
  courseId: number
}

export function AssignmentProblemDropdown({
  problem,
  assignmentId,
  courseId
}: AssignmentProblemDropdownProps) {
  const assignmentProblem = useQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: {
      groupId: courseId,
      assignmentId
    }
  }).data?.getAssignmentProblems

  console.log(assignmentProblem)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-1 text-lg text-white outline-none">
        <h1>{`${convertToLetter(problem.order)}. ${problem.title}`}</h1>
        <FaSortDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-slate-700 bg-slate-900">
        {assignmentProblem?.map((p) => (
          <Link
            key={p.problemId}
            href={
              `/course/${courseId}/assignment/${assignmentId}/problem/${p.problemId}` as Route
            }
          >
            <DropdownMenuItem
              className={cn(
                'flex justify-between text-white hover:cursor-pointer focus:bg-slate-800 focus:text-white',
                problem.id === p.problemId &&
                  'text-primary-light focus:text-primary-light'
              )}
            >
              {`${convertToLetter(p.order)}. ${p.problem.title}`}
              {/* {p.submissionTime && (
                <div className="flex items-center justify-center pl-2">
                  <Image src={checkIcon} alt="check" width={16} height={16} />
                </div>
              )} */}
            </DropdownMenuItem>
          </Link>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
