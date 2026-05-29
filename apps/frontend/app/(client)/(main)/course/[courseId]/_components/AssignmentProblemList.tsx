'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import type {
  Assignment,
  AssignmentProblem,
  AssignmentProblemRecord,
  AssignmentSubmission
} from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import Link from 'next/link'
import { ResultBadge } from './ResultBadge'

interface AssignmentProblemListFetcherProps {
  assignment: Assignment
  isExercise: boolean
}

export function AssignmentProblemListFetcher({
  assignment,
  isExercise
}: AssignmentProblemListFetcherProps) {
  const { data: problems } = useSuspenseQuery(
    assignmentProblemQueries.list({
      assignmentId: assignment.id,
      groupId: Number(assignment.group.id)
    })
  )
  const { data: record } = useSuspenseQuery(
    assignmentQueries.record({ assignmentId: assignment.id })
  )
  const { data: submission } = useSuspenseQuery(
    assignmentSubmissionQueries.summary({ assignmentId: assignment.id })
  )

  return (
    <AssignmentProblemList
      problems={problems.data}
      assignment={assignment}
      isExercise={isExercise}
      record={record}
      submission={submission}
    />
  )
}

interface AssignmentProblemListSkeletonProps {
  count: number
  isExercise: boolean
}

export function AssignmentProblemListSkeleton({
  count,
  isExercise
}: AssignmentProblemListSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="h-6 bg-[#F3F3F3]" />
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'border-b last:border-none',
            isExercise
              ? 'bg-background-alternative border-line-neutral px-14 py-6'
              : 'bg-[#F8F8F8] px-8 py-6'
          )}
        >
          {/* Mobile */}
          <div className="lg:hidden">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-4 w-6 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden w-full items-center lg:flex">
            <div className="mr-4 w-[10%]">
              <div className="h-5 w-8 animate-pulse rounded bg-gray-200" />
            </div>
            <div
              className={cn(
                'flex flex-col',
                isExercise ? 'w-[45%]' : 'w-[30%]'
              )}
            >
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            </div>
            <div
              className={cn(
                'flex justify-center',
                isExercise ? 'w-[25%]' : 'w-[30%]'
              )}
            >
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>
            {!isExercise && (
              <div className="flex w-[10%] justify-center">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            )}
            <div
              className={cn(
                'flex justify-center',
                isExercise ? 'w-[20%]' : 'w-[13%]'
              )}
            >
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface AssignmentProblemListProps {
  problems: AssignmentProblem[]
  assignment: Assignment

  isExercise: boolean
  record: AssignmentProblemRecord | undefined
  submission: AssignmentSubmission[] | undefined
}

function AssignmentProblemList({
  problems,
  assignment,

  isExercise,
  record,
  submission
}: AssignmentProblemListProps) {
  const routeType = isExercise ? 'exercise' : 'assignment'

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="h-6 bg-[#F3F3F3]" />

      {/* Mobile */}
      <div className="lg:hidden">
        {problems.map((problem, index) => {
          const problemSubmission = submission?.find(
            (sub) => sub.problemId === problem.id
          )
          return (
            <div
              key={problem.id}
              className="border-b bg-[#F8F8F8] px-4 py-4 last:border-none"
            >
              <div className="mb-2 flex items-center gap-3">
                <div className="text-color-violet-60 text-sm font-semibold">
                  {convertToLetter(problem.order)}
                </div>
                <Link
                  href={`/course/${Number(assignment.group.id)}/${routeType}/${assignment.id}/problem/${problem.id}`}
                  className="flex-1"
                >
                  <span className="line-clamp-2 text-sm font-medium text-[#171717]">
                    {problem.title}
                  </span>
                </Link>
              </div>
              {record && submission && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex flex-col gap-1">
                    {(() => {
                      const submissionTime =
                        problemSubmission?.submission?.submissionTime
                      return submissionTime ? (
                        <span>
                          Last Submission :{' '}
                          {dateFormatter(submissionTime, 'MMM D, HH:mm')}
                        </span>
                      ) : null
                    })()}
                    {!isExercise && (
                      <span>
                        Score:{' '}
                        {dayjs().isAfter(
                          dayjs(assignment.dueTime ?? assignment.endTime)
                        )
                          ? (record.problems[index].problemRecord?.finalScore ??
                            '-')
                          : '-'}{' '}
                        / {problem.maxScore}
                      </span>
                    )}
                  </div>
                  {isExercise && problemSubmission && (
                    <ResultBadge assignmentSubmission={problemSubmission} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        {problems.map((problem, index) => {
          const problemSubmission = submission?.find(
            (sub) => sub.problemId === problem.id
          )
          const submissionTime = problemSubmission?.submission?.submissionTime

          return (
            <div
              key={problem.id}
              className={cn(
                'hidden w-full items-center border-b last:border-none lg:flex',
                isExercise
                  ? 'bg-background-alternative border-line-neutral px-14 py-6'
                  : 'bg-[#F8F8F8] px-8 py-6'
              )}
            >
              <div
                className={cn('mr-4', isExercise ? 'flex w-[10%]' : 'w-[10%]')}
              >
                <div className="text-color-violet-60 w-[76px] text-center text-base font-semibold">
                  {convertToLetter(problem.order)}
                </div>
              </div>

              <div
                className={cn(
                  'flex flex-col',
                  isExercise ? 'w-[45%]' : 'w-[30%]'
                )}
              >
                <Link
                  href={`/course/${Number(assignment.group.id)}/${routeType}/${assignment.id}/problem/${problem.id}`}
                >
                  <span className="line-clamp-1 text-base font-medium text-[#171717]">
                    {problem.title}
                  </span>
                </Link>
              </div>

              <div
                className={cn(
                  'flex justify-center',
                  isExercise ? 'w-[25%]' : 'w-[30%]'
                )}
              >
                {submissionTime && (
                  <div
                    className={cn(
                      'text-primary flex w-full justify-center text-sm font-normal',
                      isExercise && 'truncate'
                    )}
                  >
                    Last Submission :{' '}
                    {dateFormatter(submissionTime, 'MMM D, HH:mm:ss')}
                  </div>
                )}
              </div>

              {!isExercise && (
                <div className="flex w-[10%] justify-center gap-1 text-base font-medium">
                  {dayjs().isAfter(
                    dayjs(assignment.dueTime ?? assignment.endTime)
                  ) && record
                    ? (record.problems[index].problemRecord?.finalScore ?? '-')
                    : '-'}{' '}
                  / {problem.maxScore}
                </div>
              )}

              <div
                className={cn(
                  'flex justify-center',
                  isExercise ? 'w-[20%]' : 'w-[13%]'
                )}
              >
                {problemSubmission && (
                  <ResultBadge assignmentSubmission={problemSubmission} />
                )}
              </div>

              {!isExercise && <div className="w-[6%]" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
