import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { ContestClarification } from '@/types/type'
import { columns } from './_components/Columns'

interface ContestClarificationProps {
  params: { id: string }
}

export default async function ContestClarification({
  params
}: ContestClarificationProps) {
  const { id } = params
  const contestClarifications: ContestClarification[] = await fetcher
    .get('announcement', {
      searchParams: {
        contestId: id
      }
    })
    .json()

  return (
    <DataTable
      data={contestClarifications}
      columns={columns}
      headerStyle={{
        title: 'w-1/12',
        content: 'w-8/12',
        createTime: 'w-3/12'
      }}
      name=""
    />
  )
}
