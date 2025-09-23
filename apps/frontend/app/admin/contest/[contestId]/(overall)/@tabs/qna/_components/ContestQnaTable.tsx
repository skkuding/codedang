'use client'

import { GET_CONTEST_QNAS } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery, useQuery } from '@apollo/client'
import type { Row, Table } from '@tanstack/react-table'
import { filter } from 'jszip'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { is } from 'valibot'
import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../../../../../_components/table'
import { ContestQnaResolvedTab } from './ContestQnaResolvedTab'
import { createColumns } from './ContestQnaTableColumns'
import type { DataTableQna } from './ContestQnaTableColumns'
import { QnaDetailModal } from './QnaDetailModal'

export function ContestQnaTable() {
  const { contestId } = useParams<{ contestId: string }>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQnaOrder, setSelectedQnaOrder] = useState<number | null>(null)
  const [clickUnanswered, setClickUnanswered] = useState(false)
  const filterUnanswered = clickUnanswered ? { isResolved: false } : {}
  const { data, refetch } = useSuspenseQuery(GET_CONTEST_QNAS, {
    variables: {
      contestId: Number(contestId),
      filter: filterUnanswered
    }
  })
  const qnaData: DataTableQna[] = data.getContestQnAs.map((qna) => ({
    ...qna,
    id: Number(qna.id),
    createTime: String(qna.createTime)
  }))
  const { data: problemsData } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: {
      contestId: Number(contestId)
    }
  })
  const contestProblems = problemsData?.getContestProblems || []

  const columns = createColumns(contestProblems)

  const bodyStyle = { title: 'justify-start' }

  const handleRowClick = (
    table: Table<{ id: number }>,
    row: Row<{ id: number }>
  ) => {
    console.log(row.original)
    const qnaData = row.original as DataTableQna
    setSelectedQnaOrder(Number(qnaData.order))
    setIsModalOpen(true)
  }

  return (
    <>
      <DataTableRoot
        data={qnaData}
        columns={columns}

        // defaultSortState={[{ id: 'updateTime', desc: true }]}
      >
        <div className="mb-[30px] flex flex-col gap-4">
          <div className="flex items-center gap-[10px]">
            <p className="text-primary text-[30.6px] font-extrabold">
              {qnaData.length}
            </p>
            <p className="text-[26.22px] font-semibold">Questions</p>
          </div>
          <div className="flex justify-between">
            <ContestQnaResolvedTab
              clickUnanswered={clickUnanswered}
              setClickUnanswered={setClickUnanswered}
            />
            <DataTableSearchBar columndId="title" size="lg" />
          </div>
        </div>
        <DataTable onRowClick={handleRowClick} bodyStyle={bodyStyle} />
        <DataTablePagination />
      </DataTableRoot>
      {isModalOpen && selectedQnaOrder !== null && (
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
