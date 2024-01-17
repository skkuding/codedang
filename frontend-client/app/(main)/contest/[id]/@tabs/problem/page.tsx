import ProblemTable from '@/app/(main)/problem/_components/ProblemTable'
import { fetcher } from '@/lib/utils'
import type { Problem } from '@/types/type'
import type { ContestDetailProps } from '../../layout'

interface ContestProblem {
  id: number
  order: number
  problemId: number
  title: string
  difficulty: string
  submissionCount: number
  acceptedRate: number
}

export default async function ContestProblem({
  params
}: {
  params: ContestDetailProps['params']
}) {
  const { id } = params
  const data: ContestProblem[] = await fetcher
    .get(`contest/${id}/problem?take=10`)
    .json()
  data.forEach((problem: ContestProblem) => {
    problem.id = problem.problemId
  })
  return (
    <ProblemTable
      data={data as Problem[]}
      isLoading={!data}
      isTagChecked={false}
    />
  )
}
