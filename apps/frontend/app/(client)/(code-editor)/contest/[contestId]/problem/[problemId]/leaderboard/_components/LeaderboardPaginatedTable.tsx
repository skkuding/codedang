'use client'

import { useLeaderboardSync } from '@/app/(client)/(code-editor)/_components/context/ReFetchingLeaderboardStoreProvider'
import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { usePagination } from '@/libs/hooks/usePaginationV2'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { Contest, Leaderboard } from '@/types/type'
import { useSuspenseQueries } from '@tanstack/react-query'
import { columns } from './Columns'
import { LeaderboardTable, LeaderboardTableFallback } from './LeaderboardTable'

const itemsPerPage = 17

export interface LeaderboardItemCodeEditorPagination {
  id: number
  rank: number
  userId: string
  penalty: number
  solved: string
}
interface BriefLeaderboardItem {
  user: {
    username: string
  }
  rank: number
  totalPenalty: number
  problemRecords: {
    score: number
    order: number
    problemId: number
    penalty: number
    submissionCount: number
  }[]
}

interface LeaderboardItemCodeEditor {
  rank: number
  userId: string
  penalty: number
  solved: number
}
export function LeaderboardPaginatedTable({
  contestId
}: {
  contestId: number
}) {
  const refreshTrigger = useLeaderboardSync((state) => state.refreshTrigger)
  console.log('refreshTrigger: ', refreshTrigger)

  const fetchContestLeaderboard = async (contestId: number) => {
    const res: Leaderboard = await safeFetcherWithAuth
      .get(`contest/${contestId}/leaderboard`)
      .json()
    const leaderboard: BriefLeaderboardItem[] = res.leaderboard

    const leaderboardItems: LeaderboardItemCodeEditor[] = []

    leaderboard.forEach((item) => {
      const leaderboardItem = {
        rank: item.rank,
        userId: item.user.username,
        penalty: item.totalPenalty,
        solved: item.problemRecords.length
      }

      leaderboardItems.push(leaderboardItem)
    })

    return leaderboardItems
  }

  const fetchContestProblemSize = async (contestId: number) => {
    const res: Contest = await safeFetcherWithAuth
      .get(`contest/${contestId}`)
      .json()

    const problemSize = res.contestProblem.length

    return problemSize
  }

  const [leaderboardQuery, ProblemSizeQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['leaderboard', contestId, refreshTrigger],
        queryFn: () => {
          return fetchContestLeaderboard(contestId)
        }
      },
      {
        queryKey: ['problem size', contestId, refreshTrigger],
        queryFn: () => {
          return fetchContestProblemSize(contestId)
        }
      }
    ]
  })

  const apiData = {
    leaderboard: leaderboardQuery.data,
    problemSize: ProblemSizeQuery.data
  }

  const paginationData: LeaderboardItemCodeEditorPagination[] = []
  apiData.leaderboard.forEach((item, index) => {
    const solvedString = `${item.solved.toString()}/${apiData.problemSize.toString()}`

    paginationData.push({
      id: index,
      rank: item.rank,
      userId: item.userId,
      penalty: item.penalty,
      solved: solvedString
    })
  })

  const {
    paginatedItems,
    currentPage,
    firstPage,
    lastPage,
    gotoPage,
    gotoSlot,
    prevDisabled,
    nextDisabled
  } = usePagination({
    data: paginationData,
    totalCount: apiData.leaderboard.length,
    itemsPerPage
  })

  return (
    <>
      <LeaderboardTable data={paginatedItems} columns={columns} />
      <Paginator>
        <SlotNavigation
          direction="prev"
          gotoSlot={gotoSlot}
          disabled={prevDisabled}
        />
        <PageNavigation
          firstPage={firstPage}
          lastPage={lastPage}
          currentPage={currentPage}
          gotoPage={gotoPage}
        />
        <SlotNavigation
          direction="next"
          gotoSlot={gotoSlot}
          disabled={nextDisabled}
        />
      </Paginator>
    </>
  )
}

export function SubmissionPaginatedTableFallback() {
  return <LeaderboardTableFallback columns={columns} />
}
