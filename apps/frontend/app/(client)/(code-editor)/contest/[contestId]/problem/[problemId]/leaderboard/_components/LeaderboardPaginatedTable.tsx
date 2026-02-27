'use client'

import { useLeaderboardSync } from '@/app/(client)/(code-editor)/_components/context/ReFetchingLeaderboardStoreProvider'
import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { usePagination } from '@/libs/hooks/usePaginationV2'
import { safeFetcherWithAuth } from '@/libs/utils'
import type { Leaderboard } from '@/types/type'
import type { LeaderboardItemCodeEditorPagination } from '@/types/type'
import { useSuspenseQueries } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import { useMemo } from 'react'
import { getColumns } from './Columns'
import { LeaderboardTable, LeaderboardTableFallback } from './LeaderboardTable'

const itemsPerPage = 17

interface BriefLeaderboardItem {
  username: string
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
  userId: string
  penalty: number
  solved: number
  problemLength: number
  rank?: number
}

function rankCompetitors(
  competitors: LeaderboardItemCodeEditor[]
): LeaderboardItemCodeEditor[] {
  competitors.sort((a, b) => {
    if (a.solved !== b.solved) {
      return b.solved - a.solved
    }
    return a.penalty - b.penalty
  })

  competitors.forEach((comp, index) => {
    if (index > 0) {
      const prev = competitors[index - 1]
      if (comp.solved === prev.solved && comp.penalty === prev.penalty) {
        comp.rank = prev.rank
      } else {
        comp.rank = index + 1
      }
    } else {
      comp.rank = index + 1
    }
  })

  return competitors
}

export function LeaderboardPaginatedTable({
  contestId
}: {
  contestId: number
}) {
  const refreshTrigger = useLeaderboardSync((state) => state.refreshTrigger)

  const fetchContestLeaderboard = async (contestId: number) => {
    const res: Leaderboard = await safeFetcherWithAuth
      .get(`contest/${contestId}/leaderboard`)
      .json()
    const leaderboard: BriefLeaderboardItem[] = res.leaderboard

    const leaderboardItems: LeaderboardItemCodeEditor[] = []

    leaderboard.forEach((item) => {
      let solvedProblems = 0
      let totalPenalty = 0

      item.problemRecords.forEach((problem) => {
        if (problem.score !== 0) {
          solvedProblems++
        }
        totalPenalty += problem.penalty
      })

      const leaderboardItem = {
        userId: item.username,
        penalty: totalPenalty,
        solved: solvedProblems,
        problemLength: item.problemRecords.length
      }

      leaderboardItems.push(leaderboardItem)
    })

    return leaderboardItems
  }

  const [leaderboardQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ['leaderboard', contestId, refreshTrigger],
        queryFn: () => fetchContestLeaderboard(contestId),
        refetchInterval: 5 * 1000 // 5 seconds
      }
    ]
  })

  const apiData = {
    leaderboard: leaderboardQuery.data
  }
  const leaderboard = rankCompetitors(apiData.leaderboard)

  const paginationData: LeaderboardItemCodeEditorPagination[] = []
  leaderboard.forEach((item, index) => {
    const solvedString = `${item.solved.toString()}/${item.problemLength.toString()}`
    const contestRank = item.rank ? item.rank : 0

    paginationData.push({
      id: index,
      rank: contestRank,
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

  const { t } = useTranslate()

  const columns = useMemo(() => getColumns(t), [t])
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

export function LeaderboardPaginatedTableFallback() {
  const { t } = useTranslate()

  const columns = useMemo(() => getColumns(t), [t])
  return <LeaderboardTableFallback columns={columns} />
}
