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
  isExercise?: boolean
}

export function AssignmentOverallTabs({
  groupId,
  assignmentId,
  isExercise
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
    const basePath = `/admin/course/${groupId}/${isExercise ? 'exercise' : 'assignment'}/${assignmentId}`
    const currentPath = tab ? `${basePath}/${tab}` : basePath
    return pathname === currentPath
  }

  return (
    <div className="flex w-full border-b border-[#E1E1E1]">
      <Link
        href={
          `/admin/course/${groupId}/${isExercise ? 'exercise' : 'assignment'}/${assignmentId}` as const
        }
        className={cn(
          'flex h-12 flex-1 items-center justify-center font-semibold',
          isCurrentTab('')
            ? 'border-b-2 border-[#3581FA] text-[#3581FA]'
            : 'text-[#737373]'
        )}
      >
        INFORMATION
      </Link>
      <Link
        href={
          `/admin/course/${groupId}/${isExercise ? 'exercise' : 'assignment'}/${assignmentId}/submission` as const
        }
        className={cn(
          'flex h-12 flex-1 items-center justify-center font-semibold',
          isCurrentTab('submission')
            ? 'border-b-2 border-[#3581FA] text-[#3581FA]'
            : 'text-[#737373]'
        )}
      >
        SUBMISSION
      </Link>
      {!isExercise && (
        <Link
          href={
            `/admin/course/${groupId}/assignment/${assignmentId}/assessment` as const
          }
          className={cn(
            'flex h-12 flex-1 items-center justify-center font-semibold',
            isCurrentTab('assessment')
              ? 'border-b-2 border-[#3581FA] text-[#3581FA]'
              : 'text-[#737373]'
          )}
        >
          ASSESSMENT
        </Link>
      )}
      {/* <Link
        href={
          `/admin/course/${groupId}/${isExercise ? 'exercise' : 'assignment'}/${assignmentId}/statistics` as const
        }
        className={cn(
          'flex h-12 flex-1 items-center justify-center font-semibold',
          isCurrentTab('statistics')
            ? 'border-b-2 border-[#3581FA] text-[#3581FA]'
            : 'text-[#737373]'
        )}
      >
        STATISTICS
      </Link> */}
    </div>
  )
}
