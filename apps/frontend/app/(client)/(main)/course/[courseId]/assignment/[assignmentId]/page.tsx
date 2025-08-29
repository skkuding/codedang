'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { AssignmentStatus } from '@/components/AssignmentStatus'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import { dateFormatter, getStatusWithStartEnd } from '@/libs/utils'
import { useQuery } from '@tanstack/react-query'
import { use } from 'react'
import { ProblemCard } from '../../_components/ProblemCard'
import { columns } from './_components/Columns'
import { TotalScoreLabel } from './_components/TotalScoreLabel'

interface AssignmentDetailProps {
  params: Promise<{
    assignmentId: number
    courseId: number
  }>
}

export default function AssignmentDetail(props: AssignmentDetailProps) {
  const params = use(props.params)
  const { assignmentId, courseId } = params

  const { data: assignment } = useQuery(
    assignmentQueries.single({ assignmentId })
  )

  const { data: record } = useQuery(assignmentQueries.record({ assignmentId }))

  const { data: submissions } = useQuery(
    assignmentSubmissionQueries.summary({ assignmentId: assignment?.id ?? 0 })
  )

  const formattedStartTime = assignment
    ? dateFormatter(assignment.startTime, 'MMM DD, YYYY HH:mm')
    : ''
  const formattedEndTime = assignment
    ? dateFormatter(assignment.endTime, 'MMM DD, YYYY HH:mm')
    : ''

  const assignmentStatus = getStatusWithStartEnd(
    formattedStartTime,
    formattedEndTime
  )

  if (assignmentStatus === 'upcoming') {
    return (
      <div className="flex h-44 translate-y-[22px] items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 font-mono">
          <p className="text-xl font-semibold">Access Denied</p>
          <p className="text-gray-500">
            You can access after the assignment started
          </p>
        </div>
      </div>
    )
  }

  return (
    assignment && (
      <div className="flex flex-col gap-[45px] px-4 py-[80px] lg:px-[100px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-4 lg:gap-7">
            <p className="text-2xl font-semibold">
              <span className="text-primary">[Week {assignment.week}] </span>
              {assignment.title}
            </p>
            {record && <TotalScoreLabel record={record} />}
          </div>
          <AssignmentStatus
            startTime={assignment.startTime}
            dueTime={assignment.dueTime}
          />
        </div>
        <Separator className="my-0" />
        <div className="flex flex-col gap-[30px]">
          <p className="text-2xl font-semibold">DESCRIPTION</p>
          {assignment && (
            <KatexContent
              content={assignment.description}
              classname="text-[#7F7F7F] font-normal text-base"
            />
          )}
        </div>
        <Separator className="my-0" />
        {record && (
          <div>
            <p className="mb-[16px] text-2xl font-semibold">PROBLEM(S)</p>
            <div className="flex gap-1 text-base font-semibold lg:mb-[42px]">
              <span>Total</span>
              <span className="text-primary">{record.problems.length}</span>
              <span>Submit</span>
              <span className="text-primary">
                {
                  submissions?.filter(
                    (submission) => submission.submission !== null
                  ).length
                }
              </span>
            </div>
          </div>
        )}
        {record && submissions && (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <DataTable
                data={record.problems}
                columns={columns(record, assignment, courseId, submissions)}
                headerStyle={{
                  order: 'w-[10%]',
                  title: 'text-left w-[40%]',
                  submissions: 'w-[20%]',
                  tc_result: 'w-[20%]',
                  detail: 'w-[10%]'
                }}
                linked
                pathSegment={'problem'}
              />
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-3">
                {record.problems.map((problem, index) => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    parentItem={assignment}
                    submissions={submissions}
                    index={index}
                    courseId={courseId}
                    type="assignment"
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  )
}
