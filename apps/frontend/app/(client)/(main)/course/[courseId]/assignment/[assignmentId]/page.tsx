'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { AssignmentStatusTimeDiff } from '@/components/AssignmentStatusTimeDiff'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import {
  dateFormatter,
  formatDateRange,
  getStatusWithStartEnd
} from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { columns } from './_components/Columns'
import { TotalScoreLabel } from './_components/TotalScoreLabel'

interface AssignmentDetailProps {
  params: {
    assignmentId: number
    courseId: number
  }
}

export default function AssignmentDetail({ params }: AssignmentDetailProps) {
  const { assignmentId, courseId } = params

  const { data: assignment } = useQuery(
    assignmentQueries.single({ assignmentId })
  )

  const { data: record } = useQuery(
    assignmentQueries.record({ assignmentId, courseId })
  )

  const { data: submissions } = useQuery(
    assignmentSubmissionQueries.summary({ assignmentId: assignment?.id ?? 0 })
  )

  // const { data: testResults } = useQuery(
  //   assignmentSubmissionQueries.testResult({
  //     assignmentId: assignment?.id ?? 0,
  //     problemId,
  //     submissionId: submissions?.id ?? 0
  //   })
  // )

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
      <div className="flex flex-col gap-[45px] px-[100px] py-[80px]">
        <div className="flex justify-between">
          <div className="flex flex-col gap-[30px]">
            <p className="text-2xl font-semibold">
              <span className="text-primary">[Week {assignment.week}] </span>
              {assignment.title}
            </p>
            {record && <TotalScoreLabel record={record} />}
          </div>
          <div className="flex min-w-[150px] flex-col gap-[16px]">
            <div className="flex gap-2">
              <Image src={calendarIcon} alt="calendar" width={16} height={16} />
              <p className="text-sm font-medium text-[#333333e6]">
                {formatDateRange(
                  assignment.startTime,
                  assignment.endTime,
                  false
                )}
              </p>
            </div>
            <AssignmentStatusTimeDiff
              assignment={assignment}
              textStyle="text-[#333333e6] font-medium opacity-100 text-sm"
              inAssignmentEditor={false}
            />
          </div>
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
            <div className="mb-[42px] flex gap-1 text-base font-semibold">
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
        )}
      </div>
    )
  )
}
