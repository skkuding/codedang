import ProblemTable from '@/app/(main)/problem/_components/ProblemTable'
import { fetcher } from '@/lib/utils'
import { ContestDetailProps } from '../../layout'

export default async function ContestProblem({
  params
}: {
  params: ContestDetailProps['params']
}) {
  const { id } = params
  const contest = await fetcher.get(`contest/${id}/problem?take=10`).json()
  contest.forEach((problem: { id: string; problemId: string }) => {
    problem.id = problem.problemId
  })
  return (
    <ProblemTable data={contest} isLoading={!contest} isTagChecked={false} />
  )
}
