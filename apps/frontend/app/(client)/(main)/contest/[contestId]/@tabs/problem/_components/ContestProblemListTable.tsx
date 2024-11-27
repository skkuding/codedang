import DataTable from '@/app/(client)/(main)/_components/DataTable'
import { safeGetContestProblemList } from '@/app/(client)/_libs/apis/contestProblem'
import { isErrorResponse } from '@/app/(client)/_libs/apis/utils'
import { ContestDetailErrorFallback } from '../../_components/ContestDetailErrorFallback'
import { columns } from './Columns'

interface ContestProblemListTableProps {
  contestId: number
}

export async function ContestProblemListTable({
  contestId
}: ContestProblemListTableProps) {
  const contestProblems = await safeGetContestProblemList({
    contestId,
    take: 20
  })

  if (isErrorResponse(contestProblems)) {
    return <ContestDetailErrorFallback error={contestProblems} />
  }

  return (
    <DataTable
      data={contestProblems.data}
      columns={columns}
      headerStyle={{
        order: 'w-[8%] ',
        title: 'text-left w-[50%]',
        submit: 'w-[11%]',
        submissionTime: 'w-[20%]',
        score: 'w-[11%]'
      }}
      linked
    />
  )
}
