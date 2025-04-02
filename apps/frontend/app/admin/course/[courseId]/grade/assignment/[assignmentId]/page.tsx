'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { dateFormatter, formatDateRange } from '@/libs/utils'
import { useQuery, useSuspenseQuery } from '@apollo/client'
import { ErrorBoundary } from '@suspensive/react'
import type { Route } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { FaAngleLeft } from 'react-icons/fa6'
import {
  ParticipantTable,
  ParticipantTableFallback
} from './_components/ParticipantTable'

export default function Layout({
  params
}: {
  params: { courseId: string; assignmentId: string }
}) {
  const { courseId, assignmentId } = params

  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId)
    }
  }).data?.getAssignment

  const problems = useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId)
    }
  })

  const totalScore = problems.data.getAssignmentProblems.reduce(
    (sum, problem) => sum + problem.score,
    0
  )

  return (
    <main className="flex flex-col gap-6 px-20 py-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/course/${courseId}/grade` as Route}>
            <FaAngleLeft className="h-12 hover:text-gray-700/80" />
          </Link>
          <span className="text-4xl font-bold">{assignmentData?.title}</span>
        </div>
        <Link
          href={`/admin/course/${courseId}/assignment/${assignmentId}` as Route}
        >
          <Button variant="default">Go to Assignment Detail</Button>
        </Link>
      </div>
      <div className="flex justify-between border-y border-gray-300 py-6">
        {assignmentData && (
          <div className="grid gap-2">
            {[
              {
                label: 'Period',
                value: formatDateRange(
                  assignmentData?.startTime,
                  assignmentData?.endTime
                )
              },

              { label: 'Score', value: totalScore },
              {
                label: 'Grade Method',
                value: assignmentData?.autoFinalizeScore
                  ? 'Automatically Finalize Score (No Manual Review)'
                  : 'Manual Review'
              }
            ].map((item) => (
              <div key={item.label} className="grid grid-cols-[8rem_auto]">
                <span className="font-bold">{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<ParticipantTableFallback />}>
          <ParticipantTable
            groupId={Number(params.courseId)}
            assignmentId={Number(params.assignmentId)}
          />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}
