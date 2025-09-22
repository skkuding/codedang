'use client'

import { GET_CONTEST_QNAS } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useSuspenseQuery, useQuery } from '@apollo/client'
import type { Row, Table } from '@tanstack/react-table'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../../../../../_components/table'
import { createColumns } from './ContestQnaTableColumns'
import type { DataTableQna } from './ContestQnaTableColumns'
import { QnaDetailModal } from './QnaDetailModal'

export function ContestQnaTable() {
  const { contestId } = useParams<{ contestId: string }>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedQnaOrder, setSelectedQnaOrder] = useState<number | null>(null)
  const { data, refetch } = useSuspenseQuery(GET_CONTEST_QNAS, {
    variables: {
      contestId: Number(contestId)
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
        <div className="flex gap-4">
          <DataTableSearchBar columndId="title" />
        </div>
        <DataTable onRowClick={handleRowClick} bodyStyle={bodyStyle} />
        <DataTablePagination showSelection />
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
