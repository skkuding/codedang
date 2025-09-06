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
          <AssignmentStatus
            startTime={exercise.startTime}
            dueTime={exercise.dueTime ?? exercise.endTime}
          />
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
                {record.problems.map((problem, index) => (
                  <ProblemCard
                    key={problem.id}
                    problem={problem}
                    parentItem={exercise}
                    submissions={submissions}
                    index={index}
                    courseId={courseId}
                    type="exercise"
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
