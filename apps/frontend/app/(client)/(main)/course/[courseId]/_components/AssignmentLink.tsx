'use client'

import { cn } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AssignmentLinkProps {
  assignment: Assignment
  courseId: number
  isExercise?: boolean
  className?: string
}

export function AssignmentLink({
  assignment,
  courseId,
  isExercise = false,
  className
}: AssignmentLinkProps) {
  const router = useRouter()
  const type = isExercise ? 'exercise' : 'assignment'

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (new Date() < new Date(assignment.startTime)) {
      const noun = isExercise ? 'exercise' : 'assignment'
      toast.error(`This ${noun} has not started yet!`)
    } else {
      router.push(`/course/${courseId}/${type}/${assignment.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn('pointer-events-auto w-fit cursor-pointer', className)}
      role="button"
      tabIndex={0}
    >
      <p className="line-clamp-1 truncate text-sm font-normal lg:text-base">
        {assignment.title}
      </p>
    </div>
  )
}
