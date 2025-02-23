import { auth } from '@/libs/auth'
import {
  dateFormatter,
  fetcher,
  fetcherWithAuth,
  getStatusWithStartEnd
} from '@/libs/utils'
import type { Assignment } from '@/types/type'

interface AssignmentInfoProps {
  params: {
    assignmentId: string
  }
}

export default async function AssginmentInfo({ params }: AssignmentInfoProps) {
  const session = await auth()
  const { assignmentId } = params

  const res = await (session ? fetcherWithAuth : fetcher).get(
    `assignment/${assignmentId}`
  )
  const assignment: Assignment = await res.json()
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

  return <div>Info</div>
}
