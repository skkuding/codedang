'use client'

import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { usePagination } from '@/libs/hooks/usePaginationV2'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Session } from 'next-auth'
import { useState, useEffect } from 'react'
import { ContestDataTable } from './ContestDataTable'
import { columns } from './ContestMainColumns'

const ITEMS_PER_PAGE = 10

interface ContestMainTableProps {
  search: string
  session: Session | null
}

export function ContestMainTable({ search, session }: ContestMainTableProps) {
  const { data: contestData } = useSuspenseQuery({
    queryKey: ['contest', search],
    queryFn: () => getOngoingUpcomingContests(search, session)
  })

  const [filteredData, setFilteredData] = useState(contestData)

  useEffect(() => {
    setFilteredData(contestData)
  }, [contestData])

  const {
    currentPage,
    firstPage,
    lastPage,
    gotoPage,
    gotoSlot,
    prevDisabled,
    nextDisabled
  } = usePagination({
    data: filteredData,
    totalCount: filteredData.length,
    pagesPerSlot: 10,
    itemsPerPage: ITEMS_PER_PAGE
  })

  const resetPageIndex = () => gotoPage(1)

  return (
    <div className="flex flex-col gap-[69px]">
      <ContestDataTable
        data={contestData}
        columns={columns}
        headerStyle={{
          title:
            'shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] px-5 rounded-l-full text-color-neutral-30 font-medium text-left w-2/5 md:w-1/2',
          period:
            'shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] text-color-neutral-30 font-medium w-1/5 text-left px-5 md:w-1/3',
          status:
            'shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] text-color-neutral-30 font-medium w-1/5 md:w-1/6',
          registered:
            'shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] rounded-r-full text-color-neutral-30 font-medium w-1/5 md:w-1/6'
        }}
        linked
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        setFilteredData={setFilteredData}
        resetPageIndex={resetPageIndex}
        search={search}
      />
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
    </div>
  )
}

const getOngoingUpcomingContests = async (
  search: string,
  session: Session | null
) => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
    finished: Contest[]
  } = await (session ? fetcherWithAuth : fetcher)
    .get('contest', {
      searchParams: {
        search
      }
    })
    .json()

  // NOTE: contest list 에서 'registered~' status 사용x -> 우선 status만 사용
  data.ongoing = data.ongoing.map((contest) => ({
    ...contest,
    // status: contest.isRegistered ? 'registeredOngoing' : 'ongoing'
    status: 'ongoing'
  }))
  data.upcoming = data.upcoming.map((contest) => ({
    ...contest,
    // status: contest.isRegistered ? 'registeredUpcoming' : 'upcoming'
    status: 'upcoming'
  }))
  data.finished = data.finished.map((contest) => ({
    ...contest,
    status: 'finished'
  }))
  return data.upcoming.concat(data.ongoing, data.finished)
}
