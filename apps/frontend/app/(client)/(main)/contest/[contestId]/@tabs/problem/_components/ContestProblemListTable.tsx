import DataTable from '@/app/(client)/(main)/_components/DataTable'
import { safeGetContestProblemList } from '@/app/(client)/_libs/apis/contestProblem'
import type { ErrorResponse } from '@/app/(client)/_libs/apis/types'
import { isErrorResponse } from '@/app/(client)/_libs/apis/utils'
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
    return <ContestProblemListErrorFallback error={contestProblems} />
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

interface ContestProblemListErrorFallbackProps {
  error: ErrorResponse
}

function ContestProblemListErrorFallback({
  error
}: ContestProblemListErrorFallbackProps) {
  let message = 'Something went wrong!'
  if (error.statusCode === 401) {
    message = 'Log in first to check the problems.'
  }
  if (error.statusCode === 404) {
    message = 'Contest does not exist'
  }
  if (
    error.statusCode === 403 &&
    error.message === 'Cannot access problems before the contest starts.'
  ) {
    message = 'You can access after the contest started'
  }
  if (
    error.statusCode === 403 &&
    error.message === 'Register to access the problems of this contest.'
  ) {
    message = 'Please register first to view the problem list'
  }

  return (
    <div className="flex h-44 translate-y-[22px] items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-1 font-mono">
        <p className="text-xl font-semibold">Access Denied</p>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  )
}
