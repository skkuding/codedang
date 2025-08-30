'use client'

import { Button } from '@/components/shadcn/button'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FaAngleLeft, FaPencil } from 'react-icons/fa6'
import { AssignmentStatus } from '../../../../../../../components/AssignmentStatus'
import { AssignmentOverallTabs } from '../../../_components/AssignmentOverallTabs'

export default function Layout({ tabs }: { tabs: React.ReactNode }) {
  const { courseId, assignmentId } = useParams()

  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId)
    }
  }).data?.getAssignment

  return (
    <main className="flex flex-col gap-6 px-20 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/course/${courseId}/assignment` as const}>
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">{assignmentData?.title}</span>
        </div>
        <Link
          href={
            `/admin/course/${courseId}/assignment/${assignmentId}/edit` as const
          }
        >
          <Button variant="default">
            <FaPencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>
      {assignmentData && (
        <AssignmentStatus
          startTime={assignmentData?.startTime}
          dueTime={assignmentData?.dueTime}
        />
      )}

      <AssignmentOverallTabs
        groupId={Number(courseId)}
        assignmentId={Number(assignmentId)}
      />
      {tabs}
    </main>
  )
}
