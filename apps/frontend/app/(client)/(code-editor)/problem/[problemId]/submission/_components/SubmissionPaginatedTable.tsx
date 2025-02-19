'use client'

import {
  SubmissionTable,
  SubmissionTableFallback
} from '@/app/(client)/(code-editor)/_components/SubmissionTable'
import { problemSubmissionQueries } from '@/app/(client)/_libs/queries/problemSubmission'
import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { getTakeQueryParam, usePagination } from '@/libs/hooks/usePaginationV2'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { columns } from './Columns'

const itemsPerPage = 20

export function SubmissionPaginatedTable({ problemId }: { problemId: number }) {
  const [queryParams, updateQueryParams] = useState({
    take: getTakeQueryParam({ itemsPerPage })
  })

  const { data } = useSuspenseQuery(
    problemSubmissionQueries.list({
      ...queryParams,
      problemId
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
    itemsPerPage,
    updateQueryParams
  })

  return (
    <>
      <SubmissionTable
        data={paginatedItems}
        columns={columns}
        getHref={(row) => `/problem/${problemId}/submission/${row.original.id}`}
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
    </>
  )
}

export function SubmissionPaginatedTableFallback() {
  return <SubmissionTableFallback columns={columns} />
}
