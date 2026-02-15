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
import { columns, problemColumns } from './_components/Columns'
import { TotalScoreLabel } from './_components/TotalScoreLabel'

interface AssignmentDetailProps {
  params: Promise<{
    assignmentId: number
    courseId: number
  }>
}

export default function AssignmentDetail(props: AssignmentDetailProps) {
  const params = use(props.params)
  const assignmentId = Number(params.assignmentId)
  const courseId = Number(params.courseId)

  const { data: assignment, isFetched: assignmentFetched } = useQuery(
    assignmentQueries.single({ assignmentId })
  )

  const { data: record } = useQuery(assignmentQueries.record({ assignmentId }))

  const { data: submissions } = useQuery({
    ...assignmentSubmissionQueries.summary({
      assignmentId: (assignment?.id as number) ?? 0
    }),
    enabled: Boolean(assignment?.id)
  })

  const {
    data: problems,
    isError: problemsIsError,
    isFetched: problemsFetched
  } = useQuery(
    assignmentProblemQueries.list({ assignmentId, groupId: courseId })
  )

  const invalidId = !Number.isFinite(assignmentId) || !Number.isFinite(courseId)

  if (invalidId) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <Image
          src={errorImage}
          alt="Error"
          className="mx-auto block h-auto max-w-full"
        />
        <p className="mt-4 text-[20px] font-semibold text-neutral-700">
          This assignment is unavailable.
          <br />
          Please check the URL or try again later.
        </p>
      </div>
    )
  }

  if (!assignmentFetched || !problemsFetched) {
    return null
  }

  const notFound = !assignment
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
        <p className="mt-4 text-[20px] font-semibold text-neutral-700">
          This assignment is unavailable.
          <br />
          Please check the URL or try again later.
        </p>
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
          <div className="flex flex-shrink-0 flex-col gap-[6px]">
            <CountdownStatus
              showText={true}
              startTime={assignment.startTime}
              baseTime={assignment.dueTime ?? assignment.endTime}
            />
            <DurationDisplay
              title="visible"
              startTime={assignment.startTime}
              endTime={assignment.endTime}
            />
          </div>
        </div>

        <Separator className="my-0" />

        <div className="flex flex-col gap-[30px]">
          <p className="text-2xl font-semibold">DESCRIPTION</p>
          <KatexContent
            content={assignment.description}
            classname="text-[#7F7F7F] font-normal text-base"
          />
        </div>

        <Separator className="my-0" />

        {problems && (
          <div>
            <p className="mb-[16px] text-2xl font-semibold">PROBLEM(S)</p>
            <div className="flex gap-1 text-base font-semibold lg:mb-[42px]">
              <span>Total</span>
              <span className="text-primary">{problems.total}</span>
              {record && (
                <>
                  <span>Submit</span>
                  <span className="text-primary">
                    {submissions?.filter((s) => s.submission !== null).length ??
                      0}
                  </span>
                </>
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
