'use client'

import {
  GET_CONTEST_SCORE_SUMMARIES,
  GET_CONTEST_SUBMISSION_SUMMARIES_OF_USER
} from '@/graphql/contest/queries'
import { cn } from '@/libs/utils'
import { useQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SubmissionSummary {
  problemId: number
}

export function ContestOverallTabs({ contestId }: { contestId: string }) {
  const id = parseInt(contestId, 10)
  const pathname = usePathname()
  const { t } = useTranslate()

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

  const [realSize, setRealSize] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setRealSize(window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /*
  TODO: 사실 전반적인 admin 페이지는 반응형을 고려하지 않고 설계되었기 때문에
  아래의 처리를 굳이 할 필요가 없고, 하더라도 조건문보다는 tailwind로 overflow를 처리하는 게 바람직할 듯함
  일단 현재 태스크의 목적이 리팩토링은 아니므로 수정하지 않고 주석으로 남김.
  */
  const leaderBoard =
    realSize >= 1024 ? (
      <p>{t('leaderboard_title')}</p>
    ) : (
      <p className="text-xs">
        {t('leaderboard_leader')}
        <br />
        {t('leaderboard_board')}
      </p>
    )

  const allSubmission =
    realSize >= 1024 ? (
      <p>{t('all_submission_title')}</p>
    ) : (
      <p className="text-xs">
        {t('all_submission_all')}
        <br />
        {t('all_submission_sub')}
        <br />
        {t('all_submission_mission')}
      </p>
    )

  const announcement =
    realSize >= 1024 ? (
      <p>{t('announcement_title')}</p>
    ) : (
      <p className="text-xs">
        {t('announcement_announce')}
        <br />
        {t('announcement_ment')}
      </p>
    )

  const statistics =
    realSize >= 1024 ? (
      <p>{t('statistics_title')}</p>
    ) : (
      <p className="text-xs">
        {t('statistics_statis')}
        <br />
        {t('statistics_tics')}
      </p>
    )

  const qna =
    realSize >= 1024 ? <p>{t('qna')}</p> : <p className="text-xs">{t('qna')}</p>

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
        <div>{leaderBoard}</div>
      </Link>
      <Link
        href={`/admin/contest/${id}/submission`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('submission') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <div>{allSubmission}</div>
      </Link>
      <Link
        href={`/admin/contest/${id}/announcement`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('announcement') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <div>{announcement}</div>
      </Link>
      <Link
        href={`/admin/contest/${id}/statistics`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('statistics') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <div>{statistics}</div>
      </Link>
      <Link
        href={`/admin/contest/${id}/qna`}
        className={cn(
          'flex h-full w-1/5 items-center justify-center rounded-full text-lg font-medium',
          isCurrentTab('qna') &&
            'text-primary border-primary border-2 border-solid bg-white font-semibold'
        )}
      >
        <div>{qna}</div>
      </Link>
    </div>
  )
}
