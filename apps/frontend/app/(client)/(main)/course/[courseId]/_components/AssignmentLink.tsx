'use client'

import type { Assignment } from '@/types/type'
import dayjs from 'dayjs'
import Link from 'next/link'
import { toast } from 'sonner'

interface AssignmentLinkProps {
  assignment: Assignment
  courseId: number
  isExercise?: boolean
}

export function AssignmentLink({
  assignment,
  courseId,
  isExercise = false
}: AssignmentLinkProps) {
  const type = isExercise ? 'exercise' : 'assignment'

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (dayjs().isBefore(assignment.startTime)) {
      e.preventDefault()
      const noun = isExercise ? 'exercise' : 'assignment'
      toast.error(`This ${noun} has not started yet!`)
    }
  }

  return (
    <Link
      href={`/course/${courseId}/${type}/${assignment.id}`}
      onClick={handleClick}
      className="w-fit"
    >
      <p className="line-clamp-1 truncate text-sm font-normal lg:text-base">
        {assignment.title}
      </p>
    </Link>
  )
}
