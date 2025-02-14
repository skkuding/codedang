'use client'

import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { usePagination } from '@/libs/hooks/usePaginationV2'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { columns } from './Columns'
import { LeaderboardTable, LeaderboardTableFallback } from './LeaderboardTable'

const itemsPerPage = 17

export function LeaderboardPaginatedTable({
  problemId,
  contestId
}: {
  problemId: number
  contestId: number
}) {
  const fetchContestLeaderboard = async (contestId: number) => {
    const res = await safeFetcherWithAuth.get(
      `contest/${contestId}/leaderboard`
    )
    if (!res.ok) {
      throw new Error('Fetch Contest Leaderboard function got network error.')
    }
    return res.json()
  }

  const { data } = useSuspenseQuery({
    queryKey: ['leaderboard', contestId],
    queryFn: () => {
      return fetchContestLeaderboard(contestId)
    }
  })

  console.log('fetch contest leaderboard: ', data)

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
    data: data.data,
    totalCount: data.total,
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
