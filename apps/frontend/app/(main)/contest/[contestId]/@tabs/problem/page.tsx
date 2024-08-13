import DataTable from '@/components/DataTable'
import { fetcherWithAuth } from '@/lib/utils'
import type { ContestProblem } from '@/types/type'
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
      take: 10
    }
  })

  if (!res.ok) {
    const { statusCode, message }: { statusCode: number; message: string } =
      await res.json()
    return (
      <div className="flex h-44 translate-y-[22px] items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 font-mono">
          <p className="text-xl font-semibold">Access Denied</p>
          <p className="text-gray-500">
            {statusCode === 401
              ? 'Log in first to check the problems.'
              : message}
          </p>
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
        order: 'w-[8%]',
        title: 'text-left w-[50%]',
        difficulty: 'w-[14%]',
        submissionCount: 'w-[14%]',
        acceptedRate: 'w-[14%]'
      }}
      linked
    />
  )
}
