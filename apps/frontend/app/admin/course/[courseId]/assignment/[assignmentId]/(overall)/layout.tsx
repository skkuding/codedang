'use client'

import { KatexContent } from '@/components/KatexContent'
import { Button } from '@/components/shadcn/button'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { dateFormatter } from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import { useQuery } from '@apollo/client'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FaAngleLeft, FaPencil } from 'react-icons/fa6'
import { AssignmentOverallTabs } from '../_components/AssignmentOverallTabs'

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
          <Link href={`/admin/course/${courseId}/assignment` as Route}>
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">{assignmentData?.title}</span>
        </div>
        <Link
          href={
            `/admin/course/${courseId}/assignment/${assignmentId}/edit` as Route
          }
        >
          <Button variant="default">
            <FaPencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Image src={calendarIcon} alt="calendar" width={22} />
          <p className="font-semibold">
            {dateFormatter(assignmentData?.startTime, 'YY-MM-DD HH:mm')} ~{' '}
            {dateFormatter(assignmentData?.endTime, 'YY-MM-DD HH:mm')}
          </p>
        </div>
      </div>
      <KatexContent
        content={assignmentData?.description}
        classname="prose mb-4 w-full max-w-full border-y-2 border-y-gray-300 p-5 py-12"
      />
      <AssignmentOverallTabs
        groupId={Number(courseId)}
        assignmentId={Number(assignmentId)}
      />
      {tabs}
    </main>
  )
}
