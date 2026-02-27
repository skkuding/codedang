'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { cn, convertToLetter } from '@/libs/utils'
import checkIcon from '@/public/icons/check-green.svg'
import type { ProblemDetail } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FaSortDown } from 'react-icons/fa'
import { assignmentProblemQueries } from '../../_libs/queries/assignmentProblem'

interface AssignmentProblemDropdownProps {
  problem: Required<ProblemDetail>
  isExercise?: boolean
}

export function AssignmentProblemDropdown({
  problem,
  isExercise = false
}: AssignmentProblemDropdownProps) {
  const params = useParams<{
    assignmentId?: string
    exerciseId?: string
    courseId: string
  }>()

  const courseId = Number(params.courseId)
  const id = isExercise
    ? Number(params.exerciseId)
    : Number(params.assignmentId)

  const problems = useSuspenseQuery({
    ...assignmentProblemQueries.list({
      assignmentId: id,
      take: 20,
      groupId: courseId
    })
  }).data.data

  const { t } = useTranslate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-hidden flex gap-1 text-lg text-white">
        <h1>{`${convertToLetter(problem.order)}. ${problem.title}`}</h1>
        <FaSortDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-editor-background-1">
        {problems.map((p) => (
          <Link
            key={p.id}
            href={
              `/course/${courseId}/${isExercise ? 'exercise' : 'assignment'}/${id}/problem/${p.id}` as const
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
                    alt={t('check_icon_alt')}
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
