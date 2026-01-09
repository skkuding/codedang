'use client'

import { GET_CONTEST_QNAS } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery, useQuery } from '@apollo/client'
import { useLazyQuery } from '@apollo/client'
import type { Row, Table } from '@tanstack/react-table'
import { useParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../../../../../_components/table'
import { ContestQnaAnsweredTab } from './ContestQnaAnsweredTab'
import { createColumns } from './ContestQnaTableColumns'
import type { DataTableQna } from './ContestQnaTableColumns'
import { QnaDetailModal } from './QnaDetailModal'
import { useQnaCommentsSync } from './context/RefetchingQnaStoreProvider'

export function ContestQnaTable() {
  const { contestId } = useParams<{ contestId: string }>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const prevModalStatus = useRef(isModalOpen)
  const [selectedQnaOrder, setSelectedQnaOrder] = useState<number | null>(null)
  const [clickUnanswered, setClickUnanswered] = useState(false)
  const filterUnanswered = clickUnanswered ? { isResolved: false } : {}
  const { data } = useSuspenseQuery(GET_CONTEST_QNAS, {
    variables: {
      contestId: Number(contestId),
      filter: filterUnanswered
    },
    fetchPolicy: 'cache-and-network'
  })
  const [refetchQnas] = useLazyQuery(GET_CONTEST_QNAS, {
    variables: {
      contestId: Number(contestId),
      filter: filterUnanswered
    },
    fetchPolicy: 'cache-and-network'
  })

  const refreshTrigger = useQnaCommentsSync((s) => s.refreshTrigger)

  useEffect(() => {
    refetchQnas()
  }, [refreshTrigger, refetchQnas])

  const qnaData: DataTableQna[] = data.getContestQnAs.map((qna) => ({
    ...qna,
    id: Number(qna.id),
    createTime: String(qna.createTime)
  }))
  useEffect(() => {
    if (prevModalStatus.current === true && isModalOpen === false) {
      refetchQnas()
    }
    prevModalStatus.current = isModalOpen
  }, [isModalOpen, refetchQnas])

  const { data: problemsData } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: {
      contestId: Number(contestId)
    }
  })
  const contestProblems = problemsData?.getContestProblems || []

  const columns = createColumns(contestProblems)

  const bodyStyle = { title: 'justify-start' }

  const handleRowClick = (_: Table<DataTableQna>, row: Row<DataTableQna>) => {
    setSelectedQnaOrder(Number(row.original.order))
    setIsModalOpen(true)
  }
  return (
    <>
      <DataTableRoot data={qnaData} columns={columns}>
        <div className="mb-[30px] flex flex-col gap-4">
          <div className="flex items-center gap-[10px]">
            <p className="text-primary text-[30.6px] font-extrabold">
              {data?.getContestQnAs?.length || 0}
            </p>
            <p className="text-[26.22px] font-semibold">Questions</p>
          </div>
          <div className="flex justify-between">
            <ContestQnaAnsweredTab
              clickUnanswered={clickUnanswered}
              setClickUnanswered={setClickUnanswered}
            />
            <DataTableSearchBar columndId="title" size="lg" />
          </div>
        </div>
        <DataTable onRowClick={handleRowClick} bodyStyle={bodyStyle} />
        <DataTablePagination />
      </DataTableRoot>
      {isModalOpen && selectedQnaOrder && (
        <QnaDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          qnaOrder={selectedQnaOrder}
        />
      )}
    </>
  )
}

export function ContestQnaTableFallback() {
  const columns = createColumns([])
  return <DataTableFallback columns={columns} />
}
