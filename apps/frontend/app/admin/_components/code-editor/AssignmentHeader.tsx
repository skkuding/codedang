'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import {
  GET_ASSIGNMENT,
  GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER
} from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { cn, convertToLetter } from '@/libs/utils'
import arrowBottomIcon from '@/public/icons/arrow-bottom.svg'
import checkIcon from '@/public/icons/check-green.svg'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import { useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export function AssignmentHeader() {
  const params = useParams<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>()
  const { courseId, assignmentId, userId, problemId } = params
  const assignment = useSuspenseQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId)
    },
    fetchPolicy: 'cache-first'
  }).data.getAssignment

  const assignmentProblems =
    useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
      variables: {
        groupId: Number(courseId),
        assignmentId: Number(assignmentId)
      }
    }).data?.getAssignmentProblems ?? []

  const problemsScores =
    useSuspenseQuery(GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER, {
      variables: {
        groupId: Number(courseId),
        assignmentId: Number(assignmentId),
        userId: Number(userId),
        take: 1000
      }
    }).data?.getAssignmentSubmissionSummaryByUserId.scoreSummary
      .scoreSummaryByProblem ?? []

  const sortedProblems = [...assignmentProblems].sort(
    (a, b) => a.order - b.order
  )

  const currentProblem = assignmentProblems.find(
    (p) => p.problemId === Number(problemId)
  )

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <div className="-px-1 flex items-center justify-start py-[10px] text-lg text-[#787E80]">
      <Link href="/" className="mr-3">
        <Image src={codedangLogo} alt="코드당" width={35} />
      </Link>
      <Link
        href={`/admin/course/${courseId}/assignment/${assignmentId}` as const}
      >
        {assignment.title}
      </Link>
      <div className="border-1 mx-3 h-5 border-[#404351]" />
      <div className="flex items-center gap-1 font-medium">
        <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
          <DropdownMenuTrigger className="outline-hidden flex gap-2 text-lg text-white">
            <h1>{`${convertToLetter(currentProblem?.order ?? 0)}. ${currentProblem?.problem.title}`}</h1>
            <Image
              src={arrowBottomIcon}
              alt="open dropdown"
              width={16}
              height={16}
              className={cn(
                'transition-transform duration-200',
                isDropdownOpen && 'rotate-180'
              )}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-slate-700 bg-slate-900">
            {sortedProblems.map((p) => (
              <Link
                href={
                  `/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${userId}/problem/${p.problemId}` as Route
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
                  {problemsScores.some(
                    (score) =>
                      score.problemId === p.problemId &&
                      score.finalScore !== null
                  ) && (
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
      </div>
    </div>
  )
}
