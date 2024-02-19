import { fetcherWithAuth } from '@/lib/utils'
import type { SubmissionItem } from '@/types/type'
import { columns } from './_components/Columns'
import DataTable from './_components/DataTable'

export default async function Submission({
  params
}: {
  params: { problemId: string }
}) {
  const { problemId } = params
  const data: SubmissionItem[] = await fetcherWithAuth
    .get('submission', {
      searchParams: {
        problemId
      }
    })
    .json()
  return (
    <>
      <DataTable
        data={data.toReversed()}
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
    </>
  )
}
