'use client'

import {
  GET_CONTEST_SCORE_SUMMARIES,
  GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER
} from '@/graphql/contest/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SubmissionSummary {
  problemId: number
}

export function ContestOverallTabs({ contestId }: { contestId: string }) {
  const id = parseInt(contestId, 10)
  const pathname = usePathname()

  const { data: userData } = useQuery<{
    getUserIdByContest: { userId: number }
  }>(GET_CONTEST_SCORE_SUMMARIES, {
    variables: { contestId: id },
    skip: !contestId
  })

  const userId = userData?.getUserIdByContest?.userId

  useQuery<{
    getContestSubmissionSummaryByUserId: { submissions: SubmissionSummary[] }
  }>(GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER, {
    variables: { contestId: id, userId, take: 300 },
    skip: !contestId || !userId
  })

  const isCurrentTab = (tab: string) => {
    if (tab === '') {
      return pathname === `/admin/contest/${id}`
    }
    return pathname.startsWith(`/admin/contest/${id}/${tab}`)
  }

  return (
    <div className="mb-16 flex h-[60px] w-full rounded-full border border-solid border-[#80808040] bg-white">
      <Link
        href={`/admin/contest/${id}/leaderboard`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('leaderboard') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <p>LEADERBOARD</p>
      </Link>
      <Link
        href={`/admin/contest/${id}/submission`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('submission') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <p>ALL SUBMISSION</p>
      </Link>
      <Link
        href={`/admin/contest/${id}/announcement`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('announcement') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <p>ANNOUNCEMENT</p>
      </Link>
      <Link
        href={`/admin/contest/${id}/statistics`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('statistics') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <p>STATISTICS</p>
      </Link>
      <Link
        href={`/admin/contest/${id}/qna`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('qna') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <p>Q&A</p>
      </Link>
    </div>
  )
}
