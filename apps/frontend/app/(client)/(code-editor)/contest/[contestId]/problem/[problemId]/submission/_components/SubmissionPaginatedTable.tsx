'use client'

import SubmissionTable, {
  SubmissionTableFallback
} from '@/app/(client)/(code-editor)/_components/SubmissionTable'
import { submissionQueries } from '@/app/(client)/_libs/queries/submission'
import {
  Paginator,
  PageNavigation,
  SlotNavigation
} from '@/components/PaginatorV2'
import {
  usePagination,
  usePaginationQueryParams
} from '@/libs/hooks/usePaginationV2'
import { useSuspenseQuery } from '@tanstack/react-query'
import { columns } from './Columns'

const itemsPerPage = 20

export function SubmissionPaginatedTable({
  problemId,
  contestId
}: {
  problemId: number
  contestId: number
}) {
  const [{ take, cursor }, setPaginationQueryParams] = usePaginationQueryParams(
    {
      itemsPerPage
    }
  )

  const { data } = useSuspenseQuery(
    submissionQueries.contestList({
      problemId,
      contestId,
      take,
      ...(cursor ? { cursor } : undefined)
    })
  )

  const {
    paginatedItems,
    currentPage,
    firstPage,
    lastPage,
    gotoPage,
    gotoSlot
  } = usePagination({
    data: data.data,
    itemsPerPage,
    takeQueryParams: take,
    setPaginationQueryParams
  })

  return (
    <>
      <SubmissionTable
        data={paginatedItems}
        columns={columns}
        getHref={(row) =>
          `/contest/${contestId}/problem/${problemId}/submission/${row.original.id}`
        }
      />
      <Paginator>
        <SlotNavigation
          gotoSlot={gotoSlot}
          direction="prev"
          disabled={firstPage > 1}
        />
        <PageNavigation
          gotoPage={gotoPage}
          firstPage={firstPage}
          lastPage={lastPage}
          currentPage={currentPage}
        />
        <SlotNavigation
          gotoSlot={gotoSlot}
          direction="next"
          disabled={lastPage * itemsPerPage < data.total}
        />
      </Paginator>
    </>
  )
}

export function SubmissionPaginatedTableFallback() {
  return <SubmissionTableFallback columns={columns} />
}
