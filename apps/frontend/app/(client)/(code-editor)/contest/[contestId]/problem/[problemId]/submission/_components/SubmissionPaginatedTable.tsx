'use client'

import {
  SubmissionTable,
  SubmissionTableFallback
} from '@/app/(client)/(code-editor)/_components/SubmissionTable'
import { useSubmissionSync } from '@/app/(client)/(code-editor)/_components/context/ReFetchingSubmissionStoreProvider'
import { getContestProblemList } from '@/app/(client)/_libs/apis/contestProblem'
import { contestSubmissionQueries } from '@/app/(client)/_libs/queries/contestSubmission'
import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { getTakeQueryParam, usePagination } from '@/libs/hooks/usePaginationV2'
import type { SubmissionItem } from '@/types/type'
import { useSuspenseQuery, useSuspenseQueries } from '@tanstack/react-query'
import { useState } from 'react'
import { columns } from './Columns'

const itemsPerPage = 17

export function SubmissionPaginatedTable({
  problemId,
  contestId
}: {
  problemId: number
  contestId: number
}) {
  const refreshTrigger = useSubmissionSync((state) => state.refreshTrigger)
  const [queryParams] = useState({
    take: getTakeQueryParam({ itemsPerPage })
  })
  const problemIdList = useSuspenseQuery({
    queryKey: ['Contest Problem', contestId, refreshTrigger],
    queryFn: async () => {
      const response = await getContestProblemList({
        contestId,
        ...queryParams
      })
      const problemIdList: number[] = []
      response.data.map((problemData) => {
        problemIdList.push(problemData.id)
      })

      return problemIdList
    }
  })

  const [...allSubmissionsResponse] = useSuspenseQueries({
    queries: problemIdList.data.map((problemIndex) =>
      contestSubmissionQueries.list({
        ...queryParams,
        problemId: problemIndex,
        contestId
      })
    )
  })
  const allSubmissions: SubmissionItem[] = []
  allSubmissionsResponse.map((submissionPerProblem) => {
    submissionPerProblem.data.data.map((submission) => {
      allSubmissions.push(submission)
    })
  })
  allSubmissions.sort(
    (a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
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
    data: allSubmissions,
    totalCount: allSubmissions.length,
    itemsPerPage
  })

  return (
    <>
      <SubmissionTable
        data={paginatedItems}
        columns={columns}
        getHref={(row) =>
          `/contest/${contestId}/problem/${problemId}/submission/${row.original.id}?cellProblemId=${row.original.problemId}`
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
  return <SubmissionTableFallback columns={columns} />
}
