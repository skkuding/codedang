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
      {/* <div className="flex items-center justify-between border-b bg-[#F8F8F8] px-12 py-6">
        <div className="-ml-4 flex gap-6">
          <span
            className={cn(
              'mt-[7px] h-[10px] w-[10px] rounded-full',
              assignmentStatus === 'upcoming' ? 'bg-[#C4C4C4]' : 'bg-primary'
            )}
          />
          <div className="flex flex-col gap-[6px]">
            <p
              className={cn(
                'line-clamp-1 w-96 text-base font-medium',
                assignmentStatus === 'upcoming'
                  ? 'text-neutral-500'
                  : 'text-black'
              )}
            >
              {assignment.title}
            </p>
            <p
              className={cn(
                'text-base',
                assignmentStatus === 'upcoming'
                  ? 'text-neutral-500'
                  : 'text-slate-500'
              )}
            >
              {dateFormatter(assignment.startTime, 'MMM D, YYYY HH:mm:ss')} -{' '}
              {dateFormatter(assignment.endTime, 'MMM D, YYYY HH:mm:ss')}
            </p>
          </div>
        </div>

        <CountBadge
          solvedProblemCount={assignment.submittedCount}
          problemCount={assignment.problemCount}
        />
      </div> */}
    </Link>
  )
}
