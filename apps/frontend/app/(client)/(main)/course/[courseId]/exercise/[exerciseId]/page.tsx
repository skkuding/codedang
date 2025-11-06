'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { AssignmentStatus } from '@/components/AssignmentStatus'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import errorImage from '@/public/logos/error.webp'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { use } from 'react'
import { ProblemCard } from '../../_components/ProblemCard'
import { problemColumns } from '../../assignment/[assignmentId]/_components/Columns'
import { columns } from './_components/Columns'

interface ExerciseDetailProps {
  params: Promise<{
    exerciseId: number
    courseId: number
  }>
}

export default function ExerciseDetail(props: ExerciseDetailProps) {
  const params = use(props.params)
  const exerciseId = Number(params.exerciseId)
  const courseId = Number(params.courseId)

  const { data: exercise, isFetched: exerciseFetched } = useQuery(
    assignmentQueries.single({ assignmentId: exerciseId })
  )

  const { data: record } = useQuery(
    assignmentQueries.record({ assignmentId: exerciseId })
  )

  const { data: submissions } = useQuery({
    ...assignmentSubmissionQueries.summary({
      assignmentId: (exercise?.id as number) ?? 0
    }),
    enabled: Boolean(exercise?.id)
  })

  const { data: problems } = useQuery(
    assignmentProblemQueries.list({
      assignmentId: exerciseId,
      groupId: courseId
    })
  )

  const invalidId =
    !Number.isFinite(exerciseId) ||
    exerciseId <= 0 ||
    !Number.isFinite(courseId) ||
    courseId <= 0

  const notFound = exerciseFetched && !exercise

  const shouldShowError = invalidId || notFound

  if (shouldShowError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <Image
          src={errorImage}
          alt="Error"
          className="mx-auto block h-auto max-w-full"
        />
        <p className="mt-4 text-[20px] font-semibold text-neutral-700">
          This exercise is unavailable.
          <br />
          Please check the URL or try again later.
        </p>
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
          <KatexContent
            content={exercise.description}
            classname="text-[#7F7F7F] font-normal text-base"
          />
        </div>

        <Separator className="my-0" />

        {problems && (
          <div>
            <p className="mb-[16px] text-2xl font-semibold">PROBLEMS</p>
            <div className="flex gap-[30px] lg:mb-[42px]">
              <div className="flex gap-[6px]">
                <span className="rounded-full bg-gray-100 px-[25px] py-[2px] text-center text-sm font-normal">
                  Total
                </span>
                <span className="text-primary text-base font-semibold">
                  {problems.total}
                </span>
              </div>
              {record && (
                <div className="flex gap-[6px]">
                  <span className="rounded-full bg-gray-100 px-[25px] py-[2px] text-center text-sm font-normal">
                    Submit
                  </span>
                  <span className="text-primary text-base font-semibold">
                    {
                      (submissions || []).filter(
                        (submission) => submission.submission !== null
                      ).length
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {!(record && submissions) && problems && (
          <div className="hidden lg:block">
            <DataTable
              data={problems.data}
              columns={problemColumns()}
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
        )}

        {record && submissions && (
          <>
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
