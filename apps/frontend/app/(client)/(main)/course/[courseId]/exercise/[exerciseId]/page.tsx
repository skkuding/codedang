'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { CountdownStatus } from '@/components/CountdownStatus'
import { DurationDisplay } from '@/components/DurationDisplay'
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

  const {
    data: problems,
    isError: problemsIsError,
    isFetched: problemsFetched
  } = useQuery(
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

  if (invalidId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <Image
          src={errorImage}
          alt="Error"
          className="mx-auto block h-auto max-w-full"
        />
        <p className="text-title1_sb_20 mt-4 text-neutral-700">
          This exercise is unavailable.
          <br />
          Please check the URL or try again later.
        </p>
      </div>
    )
  }

  if (!exerciseFetched || !problemsFetched) {
    return null
  }

  const notFound = !exercise
  const wrongCourseByProblem = problemsIsError

  const shouldShowError = notFound || wrongCourseByProblem

  if (shouldShowError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <Image
          src={errorImage}
          alt="Error"
          className="mx-auto block h-auto max-w-full"
        />
        <p className="text-title1_sb_20 mt-4 text-neutral-700">
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
          <p className="text-head5_sb_24">
            <span className="text-primary">[Week {exercise.week}] </span>
            {exercise.title}
          </p>
          <div className="flex flex-shrink-0 flex-col gap-[6px]">
            <CountdownStatus
              showText={true}
              startTime={exercise.startTime}
              baseTime={exercise.dueTime ?? exercise.endTime}
            />
            <DurationDisplay
              title="visible"
              startTime={exercise.startTime}
              endTime={exercise.endTime}
            />
          </div>
        </div>
        <Separator className="my-0" />
        <div className="flex flex-col gap-[30px]">
          <p className="text-head5_sb_24">DESCRIPTION</p>
          <KatexContent
            content={exercise.description}
            classname="text-[#7F7F7F] font-normal text-base"
          />
        </div>
        <Separator className="my-0" />
        {problems && (
          <div>
            <p className="text-head5_sb_24 mb-[16px]">PROBLEMS</p>
            <div className="flex gap-[30px] lg:mb-[42px]">
              <div className="flex gap-[6px]">
                <span className="text-body4_r_14 rounded-full bg-gray-100 px-[25px] py-[2px] text-center">
                  Total
                </span>
                <span className="text-primary text-sub3_sb_16">
                  {problems.total}
                </span>
              </div>
              {record && (
                <div className="flex gap-[6px]">
                  <span className="text-body4_r_14 rounded-full bg-gray-100 px-[25px] py-[2px] text-center">
                    Submit
                  </span>
                  <span className="text-primary text-sub3_sb_16">
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
