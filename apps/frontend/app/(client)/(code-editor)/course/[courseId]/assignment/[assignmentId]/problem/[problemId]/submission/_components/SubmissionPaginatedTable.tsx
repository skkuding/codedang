'use client'

import {
  SubmissionTable,
  SubmissionTableFallback
} from '@/app/(client)/(code-editor)/_components/SubmissionTable'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { getTakeQueryParam, usePagination } from '@/libs/hooks/usePaginationV2'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import type { Route } from 'next'
import { useMemo, useState } from 'react'
import { getColumns } from './Columns'

const itemsPerPage = 20

interface SubmissionPaginatedTableProps {
  courseId: number
  assignmentId: number
  problemId: number
}

export function SubmissionPaginatedTable({
  courseId,
  assignmentId,
  problemId
}: SubmissionPaginatedTableProps) {
  const { t } = useTranslate()
  const columns = useMemo(() => getColumns(t), [t])
  const [queryParams, updateQueryParams] = useState({
    take: getTakeQueryParam({ itemsPerPage })
  })

  const { data } = useSuspenseQuery(
    assignmentSubmissionQueries.list({
      ...queryParams,
      problemId,
      assignmentId
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
        getHref={(row) =>
          `/course/${courseId}/assignment/${assignmentId}/problem/${problemId}/submission/${row.original.id}` as Route
        }
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
  const { t } = useTranslate()
  const columns = useMemo(() => getColumns(t), [t])
  return <SubmissionTableFallback columns={columns} />
}
