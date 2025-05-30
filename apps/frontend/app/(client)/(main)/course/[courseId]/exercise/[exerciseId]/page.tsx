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

interface ExerciseDetailProps {
  params: {
    exerciseId: number
    courseId: number
  }
}

export default function ExerciseDetail({ params }: ExerciseDetailProps) {
  const { exerciseId, courseId } = params

  const { data: exercise } = useQuery(
    assignmentQueries.single({ assignmentId: exerciseId })
  )

  const { data: record } = useQuery(
    assignmentQueries.record({ assignmentId: exerciseId })
  )

  const { data: submissions } = useQuery(
    assignmentSubmissionQueries.summary({ assignmentId: exercise?.id ?? 0 })
  )

  const formattedStartTime = exercise
    ? dateFormatter(exercise.startTime, 'MMM DD, YYYY HH:mm')
    : ''
  const formattedEndTime = exercise
    ? dateFormatter(exercise.endTime, 'MMM DD, YYYY HH:mm')
    : ''

  const exerciseStatus = getStatusWithStartEnd(
    formattedStartTime,
    formattedEndTime
  )

  if (exerciseStatus === 'upcoming') {
    return (
      <div className="flex h-44 translate-y-[22px] items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 font-mono">
          <p className="text-xl font-semibold">Access Denied</p>
          <p className="text-gray-500">
            You can access after the exercise started
          </p>
        </div>
      </div>
    )
  }

  return (
    exercise && (
      <div className="flex flex-col gap-[45px] px-[100px] py-[80px]">
        <div className="flex justify-between">
          <div className="flex flex-col gap-[30px]">
            <p className="text-2xl font-semibold">
              <span className="text-primary">[Week {exercise.week}] </span>
              {exercise.title}
            </p>
            <div className="flex min-w-[150px] flex-col gap-[6px]">
              <div className="flex gap-2">
                <Image
                  src={calendarIcon}
                  alt="calendar"
                  width={16}
                  height={16}
                />
                <p className="text-sm font-medium text-[#333333e6]">
                  {formatDateRange(exercise.startTime, exercise.endTime, false)}
                </p>
              </div>
              <AssignmentStatusTimeDiff
                assignment={exercise}
                textStyle="text-[#333333e6] font-medium opacity-100 text-sm"
                inAssignmentEditor={false}
              />
            </div>
          </div>
        </div>
        <Separator className="my-0" />
        <div className="flex flex-col gap-[30px]">
          <p className="text-2xl font-semibold">DESCRIPTION</p>
          {exercise && (
            <KatexContent
              content={exercise.description}
              classname="text-[#7F7F7F] font-normal text-base"
            />
          )}
        </div>
        <Separator className="my-0" />
        {record && (
          <div>
            <p className="mb-[16px] text-2xl font-semibold">PROBLEMS</p>
            <div className="mb-[42px] flex gap-[30px]">
              <div className="flex gap-[6px]">
                <span className="rounded-full bg-gray-100 px-[25px] py-[2px] text-center text-sm font-normal">
                  Total
                </span>
                <span className="text-primary text-base font-semibold">
                  {record.problems.length}
                </span>
              </div>
              <div className="flex gap-[6px]">
                <span className="rounded-full bg-gray-100 px-[25px] py-[2px] text-center text-sm font-normal">
                  Submit
                </span>
                <span className="text-primary text-base font-semibold">
                  {
                    submissions?.filter(
                      (submission) => submission.submission !== null
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>
        )}
        {record && submissions && (
          <DataTable
            data={record.problems}
            columns={columns(record, exercise, courseId, submissions)}
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
