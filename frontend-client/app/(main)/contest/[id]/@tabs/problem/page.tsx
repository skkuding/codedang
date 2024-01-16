import ProblemTable from '@/app/(main)/problem/_components/ProblemTable'
import { fetcher } from '@/lib/utils'
import { Problem } from '@/types/type'
import { ContestDetailProps } from '../../layout'

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
    // Info 부분은 필요 없는데 ProblemTable에 showInfo prop 추가는 어떤지?
    <ProblemTable
      data={data as Problem[]}
      isLoading={!data}
      isTagChecked={false}
    />
  )
}
