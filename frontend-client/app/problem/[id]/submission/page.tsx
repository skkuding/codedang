import { fetcherWithAuth } from '@/lib/utils'
import type { Submission } from '@/types/type'
import { columns } from './_components/Columns'
import DataTable from './_components/DataTable'

export default async function Submission({
  params
}: {
  params: { id: number }
}) {
  const { id } = params
  const data: Submission[] = await fetcherWithAuth
    .get('submission', {
      searchParams: {
        problemId: id
      }
    })
    .json()

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        headerStyle={{
          id: 'w-[8%]',
          username: 'w-[15%]',
          result: 'w-[27%]',
          language: 'w-[12%]',
          createTime: 'w-[25%]',
          codeSize: 'w-[13%]'
        }}
        problemId={id}
      />
    </>
  )
}
