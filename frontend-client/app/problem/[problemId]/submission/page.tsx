'use client'

import Paginator from '@/components/Paginator'
import { usePagination } from '@/lib/usePagination'
import type { SubmissionItem } from '@/types/type'
import { columns } from './_components/Columns'
import DataTable from './_components/DataTable'

export default function Submission({
  params
}: {
  params: { problemId: string }
}) {
  const { problemId } = params

  const { items, paginator } = usePagination<SubmissionItem>(
    `submission?problemId=${problemId}`,
    20
  )

  return (
    <>
      <DataTable
        data={items ?? []}
        columns={columns}
        headerStyle={{
          id: 'w-[8%]',
          username: 'w-[15%]',
          result: 'w-[27%]',
          language: 'w-[12%]',
          createTime: 'w-[25%]',
          codeSize: 'w-[13%]'
        }}
        problemId={Number(problemId)}
      />
      <Paginator page={paginator.page} slot={paginator.slot} />
    </>
  )
}
