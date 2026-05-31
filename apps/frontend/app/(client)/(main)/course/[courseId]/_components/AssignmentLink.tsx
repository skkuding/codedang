'use client'

import type { Assignment } from '@/types/type'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const type = isExercise ? 'exercise' : 'assignment'

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (new Date() < new Date(assignment.startTime)) {
      const noun = isExercise ? 'exercise' : 'assignment'
      toast.error(`This ${noun} has not started yet!`)
      return
    }
    router.push(`/course/${courseId}/${type}/${assignment.id}`)
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
