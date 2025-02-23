import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth, getStatusWithStartEnd } from '@/libs/utils'
import { dateFormatter } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import { AssignmentTabs } from './_components/AssignmentTabs'

interface ContestDetailProps {
  params: {
    assignmentId: string
    courseId: string
  }
  tabs: React.ReactNode
}

export default async function Layout({ params, tabs }: ContestDetailProps) {
  const { assignmentId, courseId } = params
  const session = await auth()

  const res = await (session ? fetcherWithAuth : fetcher).get(
    `assignment/${assignmentId}`
  )
  if (res.ok) {
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

    return (
      <article>
        <AssignmentTabs assignmentId={assignmentId} courseId={courseId} />
        {tabs}
        {assignmentStatus.toString()}
      </article>
    )
  }
  return <p className="text-center">No Results.</p>
}
