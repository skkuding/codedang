'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { AssignmentStatus } from '@/components/AssignmentStatus'
import { KatexContent } from '@/components/KatexContent'
import { Separator } from '@/components/shadcn/separator'
import welcomeImage from '@/public/logos/welcome.png'
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
  const { assignmentId, courseId } = params

  const { data: assignment, isFetched: isAssignmentFetched } = useQuery(
    assignmentQueries.single({ assignmentId })
  )

  const { data: record } = useQuery(assignmentQueries.record({ assignmentId }))

  const {
    data: problems,
    isFetched: isProblemsFetched,
    isSuccess: isProblemsSuccess
  } = useQuery({
    ...assignmentProblemQueries.list({ assignmentId, groupId: courseId }),
    retry: false
  })

  let startDate: Date | null = null
  if (assignment?.startTime) {
    startDate =
      typeof assignment.startTime === 'string'
        ? new Date(assignment.startTime)
        : assignment.startTime
  }
  const isPreStartByTime =
    startDate !== null && startDate.getTime() > Date.now()
  const isPreStartByNoData = isAssignmentFetched && assignment === undefined

  const canAccess =
    (!isPreStartByTime && !isPreStartByNoData) || isProblemsSuccess

  const showPreStart = isAssignmentFetched && isProblemsFetched && !canAccess

  const { data: submissions } = useQuery({
    ...assignmentSubmissionQueries.summary({
      assignmentId: assignment?.id ?? 0
    }),
    enabled: (assignment?.id ?? 0) > 0 && canAccess
  })

  return (
    <div className="flex flex-col gap-[45px] px-4 py-[80px] lg:px-[100px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
        <div className="flex flex-col gap-4 lg:gap-7">
          {assignment && (
            <>
              <p className="text-2xl font-semibold">
                <span className="text-primary">[Week {assignment.week}] </span>
                {assignment.title}
              </p>
              {record && <TotalScoreLabel record={record} />}
            </>
          )}
        </div>
        {assignment && (
          <AssignmentStatus
            startTime={assignment.startTime}
            dueTime={assignment.dueTime ?? assignment.endTime}
          />
        )}
      </div>

      <Separator className="my-0" />

      {showPreStart && (
        <>
          <div className="flex flex-col items-center">
            <Image src={welcomeImage} alt="welcome_image" />
            <p className="text-center font-normal text-neutral-500">
              This assignment hasn&apos;t started yet.
              <br />
              Please wait until the start time.
            </p>
          </div>
          <Separator className="my-0" />
        </>
      )}

      {canAccess && assignment && (
        <>
          <div className="flex flex-col gap-[30px]">
            <p className="text-2xl font-semibold">DESCRIPTION</p>
            <KatexContent
              content={assignment.description}
              classname="text-[#7F7F7F] font-normal text-base"
            />
          </div>
          <Separator className="my-0" />
        </>
      )}

      {canAccess && problems && (
        <div>
          <p className="mb-[16px] text-2xl font-semibold">PROBLEM(S)</p>
          <div className="flex gap-1 text-base font-semibold lg:mb-[42px]">
            <span>Total</span>
            <span className="text-primary">{problems.total}</span>
            {record && (
              <>
                <span>Submit</span>
                <span className="text-primary">
                  {
                    (submissions ?? []).filter(
                      (submission) => submission.submission !== null
                    ).length
                  }
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {canAccess && !(record && submissions) && problems && (
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

      {canAccess && record && submissions && assignment && (
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
}
