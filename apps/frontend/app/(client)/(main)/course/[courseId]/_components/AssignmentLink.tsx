'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import type { Assignment, AssignmentStatus } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useInterval } from 'react-use'
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
  const [type, setType] = useState<'assignment' | 'exercise'>('assignment')
  const [assignmentStatus, setAssignmentStatus] =
    useState<AssignmentStatus>('upcoming')

  const updateType = () => {
    if (isExercise) {
      setType('exercise')
    }
  }
  const { error: assignmentError } = useQuery({
    ...assignmentQueries.single({ assignmentId: assignment.id }),
    retry: false
  })

  const updateAssignmentStatus = () => {
    // TODO: change to use server date
    const now = dayjs()
    if (now.isAfter(assignment.endTime)) {
      setAssignmentStatus('finished')
    } else if (now.isAfter(assignment.startTime)) {
      setAssignmentStatus('ongoing')
    } else {
      setAssignmentStatus('upcoming')
    }
  }

  useEffect(() => {
    updateType()
    updateAssignmentStatus()
  }, [])

  useInterval(() => {
    updateAssignmentStatus()
  }, 1000)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (assignmentStatus === 'upcoming' && assignmentError) {
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
