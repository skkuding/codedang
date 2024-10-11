import DataTable from '@/components/DataTable'
import { fetcherWithAuth } from '@/lib/utils'
import { getStatusWithStartEnd } from '@/lib/utils'
import { dateFormatter } from '@/lib/utils'
import type { ContestProblem } from '@/types/type'
import type { Contest } from '@/types/type'
import { columns } from './_components/Columns'

interface ContestProblemProps {
  params: { contestId: string }
}

interface ContestApiResponse {
  data: ContestProblem[]
  total: number
}

export default async function ContestProblem({ params }: ContestProblemProps) {
  const { contestId } = params
  const res = await fetcherWithAuth.get(`contest/${contestId}/problem`, {
    searchParams: {
      take: 20
    }
  })

  if (!res.ok) {
    const { statusCode, message }: { statusCode: number; message: string } =
      await res.json()

    const contest: Contest = await fetcherWithAuth
      .get(`contest/${contestId}`)
      .then((res) => res.json())

    const formattedStartTime = dateFormatter(
      contest.startTime,
      'YYYY-MM-DD HH:mm:ss'
    )
    const formattedEndTime = dateFormatter(
      contest.endTime,
      'YYYY-MM-DD HH:mm:ss'
    )
    const contestStatus = getStatusWithStartEnd(
      formattedStartTime,
      formattedEndTime
    )

    let displayMessage = ''

    if (statusCode === 401) {
      displayMessage = 'Log in first to check the problems.'
    } else {
      displayMessage =
        contestStatus === 'ongoing'
          ? 'Please register first to view the problem list'
          : 'You can access after the contest started'
    }

    return (
      <div className="flex h-44 translate-y-[22px] items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 font-mono">
          <p className="text-xl font-semibold">Access Denied</p>
          <p className="text-gray-500">{displayMessage}</p>
        </div>
      </div>
    )
  }

  const problems: ContestApiResponse = await res.json()

  return (
    <DataTable
      data={problems.data}
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
