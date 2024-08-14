'use client'

import DataTable from '@/app/admin/_components/DataTable'
import Paginator from '@/components/Paginator'
import { usePagination } from '@/lib/pagination'
import { columns } from './_components/SubmissionColumns'

export interface SubmissionItem {
  id: number
  user: {
    username: string
  }
  createTime: string
  language: string
  result: string
  codeSize: number
}

export default function Submission({ params }: { params: { id: string } }) {
  const { id } = params
  // TODO: delete problemId to show every submission
  const { items, paginator } = usePagination<SubmissionItem>(
    `contest/${id}/submission?problemId=1`,
    20,
    5,
    true
  )
  return (
    <>
      <DataTable
        data={items ?? []}
        columns={columns}
        headerStyle={{
          id: 'w-[%]',
          username: 'w-[15%]',
          result: 'w-[27%]',
          language: 'w-[14%]',
          createTime: 'w-[23%]',
          codeSize: 'w-[13%]'
        }}
        problemId={5}
      />
      <Paginator page={paginator.page} slot={paginator.slot} />
    </>
  )
}
