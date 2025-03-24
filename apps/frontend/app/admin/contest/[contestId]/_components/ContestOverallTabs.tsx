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
    <div className="flex w-full rounded-full border border-solid border-[#80808040] bg-white">
      <Link
        href={`/admin/contest/${id}`}
        className={cn(
          'w-1/5 rounded-full px-3 py-1.5 text-lg font-medium',
          isCurrentTab('') &&
            'text-primary border-primary w-1/5 border-2 border-solid bg-white font-semibold'
        )}
      >
        <p className="justify-self-center">LEADERBOARD</p>
      </Link>
      <Link
        href={`/admin/contest/${id}/submission`}
        className={cn(
          'w-1/5 rounded-full px-3 py-1.5 text-lg font-medium',
          isCurrentTab('submission') &&
            'text-primary border-primary w-1/5 border-2 border-solid bg-white font-semibold'
        )}
      >
        <p className="justify-self-center">ALL SUBMISSION</p>
      </Link>
      <Link
        href={`/admin/contest/${id}/announcement`}
        className={cn(
          'w-1/5 rounded-full px-3 py-1.5 text-lg font-medium',
          isCurrentTab('announcement') &&
            'text-primary border-primary w-1/5 border-2 border-solid bg-white font-semibold'
        )}
      >
        <p className="justify-self-center">ANNOUNCEMENT</p>
      </Link>
      <Link
        href={`/admin/contest/${id}/statistics`}
        className={cn(
          'w-1/5 rounded-full px-3 py-1.5 text-lg font-medium',
          isCurrentTab('statistics') &&
            'text-primary border-primary w-1/5 border-2 border-solid bg-white font-semibold'
        )}
      >
        <p className="justify-self-center">STATISTICS</p>
      </Link>
      <Link
        href={`/admin/contest/${id}/qna`}
        className={cn(
          'w-1/5 rounded-full px-3 py-1.5 text-lg font-medium',
          isCurrentTab('qna') &&
            'ext-primary border-primary w-1/5 border-2 border-solid bg-white font-semibold'
        )}
      >
        <p className="justify-self-center">Q&A</p>
      </Link>
    </div>
  )
}
