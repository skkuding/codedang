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
          id: 'w-[5%]',
          username: 'w-[20%]',
          result: 'w-[30%]',
          language: 'w-[15%]',
          createTime: 'w-[30%]'
        }}
        problemId={id}
      />
    </>
  )
}
