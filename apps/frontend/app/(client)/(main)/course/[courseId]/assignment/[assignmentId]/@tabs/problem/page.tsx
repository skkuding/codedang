import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { fetcherWithAuth } from '@/libs/utils'
import { getStatusWithStartEnd } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import type { Assignment, AssignmentProblem } from '@/types/type'
import { columns } from './_components/Columns'

interface AssignmentProblemProps {
  params: { assignmentId: string }
}

interface AssignmentApiResponse {
  data: AssignmentProblem[]
  total: number
}

export default async function AssignmentProblem({
  params
}: AssignmentProblemProps) {
  const { assignmentId } = params

  const res = await fetcherWithAuth.get(`assignment/${assignmentId}/problem`, {
    searchParams: {
      take: 20
    }
  })

  // TODO: use error boundary
  if (!res.ok) {
    const { statusCode }: { statusCode: number } = await res.json()

    const assignment: Assignment = await fetcherWithAuth
      .get(`assignment/${assignmentId}`)
      .then((res) => res.json())

    const formattedStartTime = dateFormatter(
      assignment.startTime,
      'YYYY-MM-DD HH:mm:ss'
    )
    const formattedEndTime = dateFormatter(
      assignment.endTime,
      'YYYY-MM-DD HH:mm:ss'
    )
    const assignmentStatus = getStatusWithStartEnd(
      formattedStartTime,
      formattedEndTime
    )

    let displayMessage = ''

    if (statusCode === 401) {
      displayMessage = 'Log in first to check the problems.'
    } else {
      if (assignmentStatus === 'ongoing') {
        displayMessage = 'Please register first to view the problem list'
      } else {
        displayMessage = 'You can access after the assignment started'
      }
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

  const problems: AssignmentApiResponse = await res.json()

  return (
    <DataTable
      data={problems.data}
      columns={columns}
      headerStyle={{
        order: 'w-[6%]',
        title: 'text-left w-[36%]',
        submit: 'w-[18%]',
        submissionTime: 'w-[21%]',
        score: 'w-[10%]'
      }}
      linked
    />
  )
}
