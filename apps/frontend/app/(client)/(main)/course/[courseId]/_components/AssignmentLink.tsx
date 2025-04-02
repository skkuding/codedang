'use client'

import { fetcherWithAuth } from '@/libs/utils'
import type { Assignment, AssignmentStatus } from '@/types/type'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useInterval } from 'react-use'
import { toast } from 'sonner'

interface AssignmentLinkProps {
  assignment: Assignment
  courseId: number
}

export function AssignmentLink({ assignment, courseId }: AssignmentLinkProps) {
  const router = useRouter()
  const [assignmentStatus, setAssignmentStatus] =
    useState<AssignmentStatus>('upcoming')

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
    updateAssignmentStatus()
  }, [])

  useInterval(() => {
    updateAssignmentStatus()
  }, 1000)

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    if (assignmentStatus === 'upcoming') {
      toast.error('This assignment is not started yet!')
      return
    }

    const res = await fetcherWithAuth.post(
      `assignment/${assignment.id}/participation`,
      {
        searchParams: {
          groupId: courseId
        }
      }
    )
    if (!res.ok && res.status !== 409) {
      toast.error('Failed to participate in the assignment')
      return
    }
    router.push(`/course/${courseId}/assignment/${assignment.id}`)
  }

  return (
    <Link
      href={`/course/${courseId}/assignment/${assignment.id}`}
      onClick={handleClick}
    >
      <p className="line-clamp-1 font-normal">{assignment.title}</p>
    </Link>
  )
}
