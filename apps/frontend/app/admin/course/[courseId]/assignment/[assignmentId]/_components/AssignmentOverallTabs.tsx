'use client'

import {
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER
} from '@/graphql/assignment/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SubmissionSummary {
  problemId: number
}

interface AssignmentOverallTabsProps {
  groupId: number
  assignmentId: number
}

export function AssignmentOverallTabs({
  groupId,
  assignmentId
}: AssignmentOverallTabsProps) {
  const pathname = usePathname()

  const { data: userData } = useQuery<{
    getUserIdByAssignment: { userId: number }
  }>(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { groupId, assignmentId }
  })

  const userId = userData?.getUserIdByAssignment?.userId

  useQuery<{
    getAssignmentSubmissionSummaryByUserId: { submissions: SubmissionSummary[] }
  }>(GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER, {
    variables: { groupId, assignmentId, userId, take: 300 }
  })

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === `/admin/course/${groupId}/assignment/${assignmentId}`
    }
    return pathname.startsWith(
      `/admin/course/${groupId}/assignment/${assignmentId}/${tab}`
    )
  }

  return (
    <div className="flex h-[48px] w-full rounded-full border border-solid border-[#80808040] bg-white text-lg font-normal text-[#737373]">
      <Link
        href={`/admin/course/${groupId}/assignment/${assignmentId}` as const}
        className={cn(
          'flex h-full w-1/4 items-center justify-center rounded-full',
          isCurrentTab('') &&
            'text-primary border-primary border-2 border-solid bg-white'
        )}
      >
        INFORMATION
      </Link>
      <Link
        href={
          `/admin/course/${groupId}/assignment/${assignmentId}/submission` as const
        }
        className={cn(
          'flex h-full w-1/4 items-center justify-center rounded-full',
          isCurrentTab('submission') &&
            'text-primary border-primary border-2 border-solid bg-white'
        )}
      >
        SUBMISSION
      </Link>
      <Link
        href={
          `/admin/course/${groupId}/assignment/${assignmentId}/assessment` as const
        }
        className={cn(
          'flex h-full w-1/4 items-center justify-center rounded-full',
          isCurrentTab('assessment') &&
            'text-primary border-primary border-2 border-solid bg-white'
        )}
      >
        ASSESSMENT
      </Link>
      <Link
        href={
          `/admin/course/${groupId}/assignment/${assignmentId}/statictics` as const
        }
        className={cn(
          'flex h-full w-1/4 items-center justify-center rounded-full',
          isCurrentTab('statictics') &&
            'text-primary border-primary border-2 border-solid bg-white'
        )}
      >
        STATISTICS
      </Link>
    </div>
  )
}
