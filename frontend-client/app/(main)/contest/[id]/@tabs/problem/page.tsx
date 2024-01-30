import { fetcher } from '@/lib/utils'
import type { ContestProblem } from '@/types/type'
import { columns } from './_components/Columns'
import DataTable from './_components/DataTable'

interface ContestProblemProps {
  params: { id: string }
}

export default async function ContestProblem({ params }: ContestProblemProps) {
  const { id } = params
  const contestProblems: ContestProblem[] = await fetcher
    .get('problem', {
      searchParams: {
        take: 10,
        contestId: id
      }
    })
    .json()
  return (
    <DataTable
      data={contestProblems}
      columns={columns}
      headerStyle={{
        title: 'text-left w-6/12',
        difficulty: 'w-2/12',
        submissionCount: 'w-2/12',
        acceptedRate: 'w-2/12'
      }}
      name="problem"
    />
  )
}
