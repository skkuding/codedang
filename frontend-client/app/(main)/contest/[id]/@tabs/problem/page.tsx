import DataTable from '@/components/DataTable'
import { fetcher } from '@/lib/utils'
import type { ContestProblem } from '@/types/type'
import { columns } from './_components/Columns'

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
  contestProblems.forEach((problem) => {
    problem.id = problem.problemId
  })

  return (
    <DataTable
      data={contestProblems}
      columns={columns}
      headerStyle={{
        order: 'w-[8%]',
        title: 'text-left w-[50%]',
        difficulty: 'w-[14%]',
        submissionCount: 'w-[14%]',
        acceptedRate: 'w-[14%]'
      }}
      name="problem"
    />
  )
}
