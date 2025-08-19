'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { AssignmentStatusTimeDiff } from '@/components/AssignmentStatusTimeDiff'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import {
  cn,
  dateFormatter,
  formatDateRange,
  getResultColor,
  getStatusWithStartEnd
} from '@/libs/utils'
import calendarIcon from '@/public/icons/calendar.svg'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { use } from 'react'
import { SubmissionOverviewModal } from '../../_components/SubmissionOverviewModal'
import { columns } from './_components/Columns'

interface ExerciseDetailProps {
  params: Promise<{
    exerciseId: number
    courseId: number
  }>
}

export default function ExerciseDetail(props: ExerciseDetailProps) {
  const params = use(props.params)
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
      <div className="flex flex-col gap-[45px] px-4 py-[80px] lg:px-[100px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
          <p className="text-2xl font-semibold">
            <span className="text-primary">[Week {exercise.week}] </span>
            {exercise.title}
          </p>
          <div className="flex min-w-[150px] flex-col gap-[6px]">
            <div className="flex gap-2">
              <Image src={calendarIcon} alt="calendar" width={16} height={16} />
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
            <div className="flex gap-[30px] lg:mb-[42px]">
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
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
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
            </div>
            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="space-y-3">
                {record.problems.map((problem, index) => {
                  const submission = submissions?.find(
                    (s) => s.problemId === problem.id
                  )
                  const hasSubmission = submission?.submission !== null
                  const isAccepted =
                    submission?.submission?.submissionResult === 'Accepted'

                  return (
                    <div
                      key={problem.id}
                      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
                      onClick={() => {
                        window.location.href = `${window.location.pathname}/problem/${problem.id}`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-medium text-gray-900">
                              {problem.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {hasSubmission
                                ? `Submitted on ${new Date(
                                    submission?.submission?.submissionTime || ''
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}`
                                : 'Not submitted'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {hasSubmission && (
                            <p
                              className={cn(
                                'text-right text-xs text-gray-500',
                                getResultColor(
                                  isAccepted ? 'Accepted' : 'Wrong Answer'
                                )
                              )}
                            >
                              {isAccepted ? 'Accepted' : 'Wrong Answer'}
                            </p>
                          )}

                          <SubmissionOverviewModal
                            problem={problem}
                            assignment={exercise}
                            submissions={submissions}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    )
  )
}
