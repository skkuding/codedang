'use client'

import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { usePagination } from '@/libs/hooks/usePaginationV2'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { ProblemDataTop } from '@/types/type'
import { useSuspenseQueries } from '@tanstack/react-query'
import type { Session } from 'next-auth'
import { useEffect, useState } from 'react'
import { QnADataTable } from './QnADataTable'
import type { QnAItem } from './QnAMainColumns'
import type { QnAItemWithCategory } from './QnAMainColumns'
import { QnAColumns } from './QnAMainColumns'

const ITEMS_PER_PAGE = 12

interface QnAMainTableProps {
  contestId: string
  contestProblems: ProblemDataTop
  search: string
  orderBy: string
  categories: string
  problemOrders: string
  session: Session | null
  isPrivilegedRole: boolean
  canCreateQnA: boolean
}

export function QnAMainTable({
  contestId,
  contestProblems,
  search,
  orderBy,
  categories,
  problemOrders,
  session,
  isPrivilegedRole,
  canCreateQnA
}: QnAMainTableProps) {
  const [{ data: QnAData }] = useSuspenseQueries({
    queries: [
      {
        queryKey: [
          'QnA',
          contestId,
          search,
          orderBy,
          categories,
          problemOrders,
          session,
          isPrivilegedRole,
          canCreateQnA
        ],
        queryFn: () =>
          getFilteredQnAs(
            contestId,
            search,
            orderBy,
            categories,
            problemOrders,
            session
          )
      }
    ]
  })

  const QnADataWithCategory: QnAItemWithCategory[] = QnAData.map((qna) => {
    const matchedProblem = contestProblems?.data?.find(
      (problem) => problem.id === qna.problemId
    )

    return {
      ...qna,
      categoryName: matchedProblem
        ? `${String.fromCharCode(65 + matchedProblem.order)}. ${matchedProblem.title}`
        : undefined
    }
  })

  const [filteredData, setFilteredData] = useState<QnAItem[]>(QnAData)
  useEffect(() => {
    setFilteredData(QnAData)
  }, [QnAData])

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
    <>
      <QnADataTable
        contestId={contestId}
        columns={QnAColumns}
        QnADataWithCategory={QnADataWithCategory}
        contestProblems={contestProblems}
        search={''}
        orderBy={'desc'}
        categories={''}
        problemOrders={''}
        headerStyle={{
          id: 'w-[118px]',
          category: 'w-[190px]',
          title: 'flex-1 w-[500px]',
          'createdBy.username': 'w-[190px]',
          createTime: 'w-[190px]'
        }}
        linked={true}
        emptyMessage="No results."
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        setFilteredData={setFilteredData}
        resetPageIndex={resetPageIndex}
        session={session}
        isPrivilegedRole={isPrivilegedRole}
        canCreateQnA={canCreateQnA}
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

const getFilteredQnAs = async (
  contestId: string,
  search: string,
  orderBy: string,
  categories: string,
  problemOrders: string,
  session: Session | null
) => {
  const data = await (session ? fetcherWithAuth : fetcher)
    .get(`contest/${contestId}/qna`, {
      searchParams: { search, orderBy, categories, problemOrders }
    })
    .json<QnAItem[]>()
  return data
}
