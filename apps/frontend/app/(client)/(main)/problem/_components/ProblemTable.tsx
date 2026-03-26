'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
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
import { SearchBar } from '../../_components/SearchBar'
import { columns } from './Columns'

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
    itemsPerPage: ITEMS_PER_PAGE,
    pagesPerSlot: PAGES_PER_SLOT,
    updateQueryParams
  })

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <p className="text-head3_sb_28">등록된 문제</p>
          <p className="text-head3_sb_28 text-primary">{data.total}</p>
        </div>
        <div className="flex items-center justify-start gap-2">
          <SearchBar className="w-60" />
        </div>
      </div>
      <div className="mb-10 mt-5 w-full overflow-hidden rounded-[20px] bg-white">
        <DataTable
          data={paginatedItems}
          columns={columns}
          tableClassName="border-line border-separate border-spacing-0"
          headerClassName="border-line overflow-hidden rounded-[1000px] border-b"
          bodyClassName="[&_tr:last-child]:border-b [&_tr:last-child]:border-line"
          headerRowClassName="h-12"
          headerCellClassName="border-line h-12 bg-white px-5 py-2 text-body1_m_16 text-color-cool-neutral-30 first:rounded-l-[1000px] last:rounded-r-[1000px]"
          cellClassName="border-line h-16 px-5 py-0 align-middle"
          tableRowStyle="border-line h-16 border-b hover:bg-transparent"
          emptyCellClassName="border-line h-16 align-middle"
          headerStyle={{
            title: 'w-4/12',
            difficulty: 'w-2/12',
            submissionCount: 'w-3/12',
            acceptedRate: 'w-2/12',
            info: 'w-1/12'
          }}
          linked
        />
      </div>
      <Paginator contentClassName="gap-7 py-0">
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
          buttonClassName="h-10 min-w-10 rounded-full px-2 text-base font-medium tracking-wide"
          activeButtonClassName="bg-[#EDF4FF] text-primary hover:bg-[#EDF4FF]"
          inactiveButtonClassName="text-[#737373] hover:bg-transparent"
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
