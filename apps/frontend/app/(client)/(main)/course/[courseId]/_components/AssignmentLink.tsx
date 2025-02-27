'use client'

import { fetcherWithAuth, dateFormatter } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CountBadge } from './AssignmentAccordion'

interface AssignmentLinkProps {
  assignment: Assignment
  courseId: string
}

export function AssignmentLink({ assignment, courseId }: AssignmentLinkProps) {
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

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
      <div className="flex items-center justify-between border-b bg-[#F8F8F8] px-12 py-6">
        <div className="flex gap-6">
          <span className="bg-primary mt-[7px] h-[10px] w-[10px] rounded-full" />
          <div className="flex flex-col gap-[6px]">
            <p className="line-clamp-1 w-96 text-base font-medium text-black">
              {assignment.title}
            </p>
            <p className="text-base text-slate-500">
              {dateFormatter(assignment.startTime, 'YYYY-MM-DD HH:mm:ss')} -{' '}
              {dateFormatter(assignment.endTime, 'YYYY-MM-DD HH:mm:ss')}
            </p>
          </div>
        </div>

        <CountBadge
          solvedProblemCount={assignment.submittedNumber}
          problemCount={assignment.problemNumber}
        />
      </div>
    </Link>
  )
}
