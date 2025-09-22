'use client'

import { Button } from '@/components/shadcn/button'
import { GET_CONTEST_QNAS } from '@/graphql/contest/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../../../../../_components/table'
import { createColumns } from './ContestQnaTableColumns'
import type { DataTableQna } from './ContestQnaTableColumns'
import { QnaDetailButton } from './QnaDetailButton'

export function ContestQnaTable() {
  const { contestId } = useParams<{ contestId: string }>()
  const { data } = useSuspenseQuery(GET_CONTEST_QNAS, {
    variables: {
      contestId: Number(contestId)
    }
  })
  const qnaData: DataTableQna[] = data.getContestQnAs.map((qna) => ({
    ...qna,
    id: Number(qna.id),
    createTime: String(qna.createTime)
  }))

  const bodyStyle = { title: 'justify-start' }

  const hanleRowclick = (row: DataTableQna) => {
    return (
      <QnaDetailButton
        trigger={<div className="h-full w-full" />}
        qnaId={row.id}
      />
    )
  }

  return (
    <DataTableRoot
      data={qnaData}
      columns={createColumns()}

      // defaultSortState={[{ id: 'updateTime', desc: true }]}
    >
      <div className="flex gap-4">
        <DataTableSearchBar columndId="title" />
      </div>
      <DataTable
        onRowClick={(_, row) => hanleRowclick(row.original as DataTableQna)}
        bodyStyle={bodyStyle}
      />
      <DataTablePagination showSelection />
    </DataTableRoot>
  )
}

export function ContestQnaTableFallback() {
  return <DataTableFallback columns={createColumns()} />
}
