'use client'

import { problemQueries } from '@/app/(client)/_libs/queries/problem'
import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { Skeleton } from '@/components/shadcn/skeleton'
import { getTakeQueryParam, usePagination } from '@/libs/hooks/usePaginationV2'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { columns } from './Columns'
import { ProblemDataTable } from './ProblemDataTable'

const ITEMS_PER_PAGE = 10
const PAGES_PER_SLOT = 10

export function ProblemTable() {
  const searchParams = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const order = searchParams.get('order') ?? 'id-asc'

  return (
    <ProblemPaginatedTable
      key={`${search}:${order}`}
      search={search}
      order={order}
    />
  )
}

function ProblemPaginatedTable({
  search,
  order
}: {
  search: string
  order: string
}) {
  const [queryParams, updateQueryParams] = useState({
    take: getTakeQueryParam({
      itemsPerPage: ITEMS_PER_PAGE,
      pagesPerSlot: PAGES_PER_SLOT
    })
  })

  const { data } = useSuspenseQuery(
    problemQueries.list({
      ...queryParams,
      search,
      order
    })
  )

  const {
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
    itemsPerPage: ITEMS_PER_PAGE,
    pagesPerSlot: PAGES_PER_SLOT,
    updateQueryParams
  })

  return (
    <div className="flex w-full flex-col items-center">
      <ProblemDataTable
        data={data.data}
        total={data.total}
        columns={columns}
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        search={search}
        headerStyle={{
          title:
            'shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] rounded-l-full px-5 text-body1_m_16 text-color-neutral-30',
          difficulty:
            'shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] w-48 px-5 text-body1_m_16 text-color-neutral-30',
          submissionCount:
            'shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] w-48 px-5 text-body1_m_16 text-color-neutral-30',
          acceptedRate:
            'shadow-[inset_0_-1px_0_0_theme(colors.line.DEFAULT)] rounded-r-full w-48 px-5 text-body1_m_16 text-color-neutral-30'
        }}
        linked
      />
      <Paginator contentClassName="flex gap-[30px] items-center py-0">
        <SlotNavigation
          direction="prev"
          gotoSlot={gotoSlot}
          disabled={prevDisabled}
          spacerClassName="w-0"
        />
        <PageNavigation
          firstPage={firstPage}
          lastPage={lastPage}
          currentPage={currentPage}
          gotoPage={gotoPage}
          buttonClassName="h-10 min-w-10 rounded-[45px] p-2 text-base font-medium font-['Roboto'] leading-4 tracking-wide"
          activeButtonClassName="text-primary"
          inactiveButtonClassName="text-neutral-60"
        />
        <SlotNavigation
          direction="next"
          gotoSlot={gotoSlot}
          disabled={nextDisabled}
          spacerClassName="w-0"
        />
      </Paginator>
    </div>
  )
}

export function ProblemTableFallback() {
  return (
    <>
      <div className="mt-4 flex">
        <span className="w-5/12">
          <Skeleton className="h-6 w-20" />
        </span>
      </div>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="my-2 flex h-12 w-full rounded-xl" />
      ))}
    </>
  )
}
