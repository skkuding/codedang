'use client'

import {
  PageNavigation,
  Paginator,
  SlotNavigation
} from '@/components/PaginatorV2'
import { usePagination } from '@/libs/hooks/usePaginationV2'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { ProblemDataTop } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { Session } from 'next-auth'
import { useEffect, useState } from 'react'
import { QnADataTable } from './QnADataTable'
import { QnAColumns } from './QnAMainColumns'

const ITEMS_PER_PAGE = 12

interface QnAMainTableProps {
  session: Session | null
  contestId: number
  contestProblems: ProblemDataTop
  contestStatus: string
  search: string
  orderBy: string
  categories: string
  problemOrders: string
  isContestStaff: boolean
  canCreateQnA: boolean | null
}

export interface QnAItem {
  id: number
  order: number
  createdById: number
  title: string
  isResolved: boolean
  category: string
  problemId: number
  createTime: string
  createdBy: {
    username: string
  }
  isRead: boolean
}

export interface QnAItemWithCategory extends QnAItem {
  categoryName?: string
}

export function QnAMainTable({
  session,
  contestId,
  contestProblems,
  contestStatus,
  search,
  orderBy,
  categories,
  problemOrders,
  isContestStaff,
  canCreateQnA
}: QnAMainTableProps) {
  const { data: QnAData } = useSuspenseQuery({
    queryKey: [
      'QnA',
      session,
      contestId,
      search,
      orderBy,
      categories,
      problemOrders,
      canCreateQnA
    ],
    queryFn: () =>
      getFilteredQnAs(
        session,
        contestId,
        search,
        orderBy,
        categories,
        problemOrders
      )
  })

  const QnADataWithCategory: QnAItemWithCategory[] = QnAData.map((qna) => {
    const matchedProblem = contestProblems.data?.find(
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
        session={session}
        contestId={contestId}
        columns={QnAColumns}
        QnADataWithCategory={QnADataWithCategory}
        contestProblems={contestProblems}
        contestStatus={contestStatus}
        headerStyle={{
          id: 'w-[118px]',
          category: 'w-[190px]',
          title: 'w-[500px]',
          writer: 'w-[190px]',
          createTime: 'w-[190px]'
        }}
        emptyMessage="No results."
        itemsPerPage={ITEMS_PER_PAGE}
        currentPage={currentPage}
        setFilteredData={setFilteredData}
        resetPageIndex={resetPageIndex}
        isContestStaff={isContestStaff}
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
  session: Session | null,
  contestId: number,
  search: string,
  orderBy: string,
  categories: string,
  problemOrders: string
) => {
  const data = await (session ? fetcherWithAuth : fetcher)
    .get(`contest/${contestId}/qna`, {
      searchParams: { search, orderBy, categories, problemOrders }
    })
    .json<QnAItem[]>()
  return data
}
