import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { Problem } from '@/types/type'
import { columns } from './Columns'

interface Props {
  search: string
  order: string
}

export default async function ProblemTable({ search, order }: Props) {
  const res: { problems: Problem[] } | object = await fetcher
    .get('problem', {
      searchParams: {
        take: 10,
        search,
        order
      }
    })
    .json()

  if (!('problems' in res)) {
    console.dir(res)
    throw new Error('Error occurred while fetching problems.')
  }
  return (
    <DataTable
      data={res.problems}
      columns={columns}
      headerStyle={{
        title: 'text-left w-5/12',
        difficulty: 'w-2/12',
        submissionCount: 'w-2/12',
        acceptedRate: 'w-2/12',
        info: 'w-1/12'
      }}
      linked
    />
  )
}