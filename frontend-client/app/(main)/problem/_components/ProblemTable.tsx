import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { Problem } from '@/types/type'
import { columns } from './Columns'

interface Props {
  search: string
  order: string
}

export default async function ProblemTable({ search, order }: Props) {
  const problems: Problem[] = await fetcher
    .get('problem', {
      searchParams: {
        take: 10,
        search,
        order
      }
    })
    .json()

  return (
    <DataTable
      data={problems}
      columns={columns}
      headerStyle={{
        title: 'text-left w-5/12',
        difficulty: 'w-2/12',
        submissionCount: 'w-2/12',
        acceptedRate: 'w-2/12',
        info: 'w-1/12'
      }}
      name="problem"
    />
  )
}
