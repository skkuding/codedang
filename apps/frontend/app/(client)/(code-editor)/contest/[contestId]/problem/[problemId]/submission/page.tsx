'use client'

import Paginator from '@/components/Paginator'
import { usePagination } from '@/lib/pagination'
import type { SubmissionItem } from '@/types/type'
import { columns } from './_components/Columns'
import DataTable from './_components/DataTable'

export default function Submission({
  params
}: {
  params: { problemId: string; contestId: string }
}) {
  const { problemId, contestId } = params

  const { items, paginator } = usePagination<SubmissionItem>(
    `contest/${contestId}/submission?problemId=${problemId}`,
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
          id: 'w-[8%]',
          username: 'w-[15%]',
          result: 'w-[27%]',
          language: 'w-[14%]',
          createTime: 'w-[23%]',
          codeSize: 'w-[13%]'
        }}
        problemId={Number(problemId)}
        contestId={Number(contestId)}
      />
      <Paginator page={paginator.page} slot={paginator.slot} />
    </>
  )
}
