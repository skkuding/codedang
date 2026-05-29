'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { CountdownStatus } from '@/components/CountdownStatus'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
import { Badge } from '@/components/shadcn/badge'
import { Dialog } from '@/components/shadcn/dialog'
import { Separator } from '@/components/shadcn/separator'
import {
  cn,
  convertToLetter,
  dateFormatter,
  formatDateRange,
  hasDueDate
} from '@/libs/utils'
import type { Assignment, AssignmentSummary } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useState } from 'react'
import { AssignmentLink } from './AssignmentLink'
import { DetailButton } from './DetailButton'
import { GradeStatisticsModal } from './GradeStatisticsModal'
import { ResultBadge } from './ResultBadge'

interface AssignmentAccordionProps {
  courseId: number
  isExercise?: boolean
}

export function AssignmentAccordion({
  courseId,
  isExercise = false
}: AssignmentAccordionProps) {
  const { data: assignments, isPending: assignmentsPending } = useQuery(
    // eslint-disable-next-line object-shorthand
    assignmentQueries.muliple({ courseId, isExercise: isExercise })
  )
  const { data: grades, isPending: gradesPending } = useQuery(
    // eslint-disable-next-line object-shorthand
    assignmentQueries.grades({ courseId, isExercise: isExercise })
  )

  if (assignmentsPending || gradesPending) {
    return <AssignmentAccordionSkeleton isExercise={isExercise} />
  }

  const gradeMap = new Map(grades?.map((grade) => [grade.id, grade]) ?? [])

  if (!assignments || assignments.length === 0) {
    return (
      <div className="mt-13 lg:mt-8">
        <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20">
          <p className="text-color-neutral-60 text-base">
            {isExercise
              ? 'No exercises registered'
              : 'No assignments registered'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 lg:mt-8">
      {assignments.map((assignment) => (
        <AssignmentAccordionItem
          key={assignment.id}
          assignment={assignment}
          grade={gradeMap.get(assignment.id)}
          courseId={courseId}
          isExercise={isExercise}
        />
      ))}
    </div>
  )
}

interface AssignmentAccordionItemProps {
  assignment: Assignment
  courseId: number
  grade?: AssignmentSummary
  isExercise?: boolean
}

function AssignmentAccordionItem({
  assignment,
  courseId,
  grade,
  isExercise = false
}: AssignmentAccordionItemProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)

  const { data: record } = useQuery({
    ...assignmentQueries.record({
      assignmentId: assignment.id
    }),
    enabled: isAccordionOpen
  })

  const { data: submission } = useQuery({
    ...assignmentSubmissionQueries.summary({ assignmentId: assignment.id }),
    enabled: isAccordionOpen
  })

  const { data: problems } = useQuery(
    assignmentProblemQueries.list({
      assignmentId: assignment.id,
      groupId: courseId
    })
  )

  const handleAccordionOpenChange = (value: string) => {
    setIsAccordionOpen(value === assignment.id.toString())
  }

  const submittedCount = grade?.submittedCount ?? 0
  const problemCount = grade?.problemCount ?? problems?.total ?? 0

  let scoreText = '- / -'
  let isDetailActivated = false

  if (!isExercise && grade) {
    const userScore = grade.userAssignmentFinalScore ?? '-'
    const perfectScore = grade.assignmentPerfectScore
    scoreText = `${userScore} / ${perfectScore}`

    isDetailActivated =
      grade.userAssignmentFinalScore !== null &&
      dayjs().isAfter(dayjs(assignment.endTime))
  }

  const routeType = isExercise ? 'exercise' : 'assignment'

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      onValueChange={handleAccordionOpenChange}
    >
      <AccordionItem
        value={assignment.id.toString()}
        className="group border-b-0"
      >
        <AccordionTrigger
          className={cn(
            'mt-[14px] flex w-full items-center rounded-2xl bg-white px-3 py-4 text-left text-sm shadow-md',
            isExercise ? 'lg:px-[60px] lg:py-6' : 'lg:px-8 lg:py-6',
            'data-[state=open]:-mb-6 data-[state=open]:mt-[24px]',
            'relative',
            'hover:no-underline'
          )}
          iconStyle="w-5 h-5 absolute right-3 top-[15%] lg:right-[3%] lg:top-auto"
        >
          {/* Mobile Layout */}
          <div className="flex w-full flex-col gap-2 lg:hidden">
            <div className="mr-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="course"
                  className="min-w-fit px-2 py-1 text-xs font-medium lg:px-[10px] lg:text-sm"
                >
                  Week {assignment.week.toString().padStart(2, '0')}
                </Badge>
                <div className="flex flex-col">
                  <AssignmentLink
                    key={assignment.id}
                    assignment={assignment}
                    courseId={courseId}
                    isExercise={isExercise}
                  />
                </div>
              </div>
              {assignment &&
                (assignment.dueTime ?? hasDueDate(assignment.endTime)) && (
                  <CountdownStatus
                    baseTime={assignment.dueTime ?? assignment.endTime}
                    textStyle="text-color-neutral-50"
                    showIcon={false}
                  />
                )}
            </div>
            <Separator className="my-2" />
            <div
              className={cn(
                'flex items-center text-xs text-gray-600',
                dayjs().isAfter(dayjs(assignment.startTime))
                  ? 'justify-between'
                  : 'justify-end'
              )}
            >
              <SubmissionBadge
                submittedCount={submittedCount}
                problemCount={problemCount}
                className="h-8 w-24 text-xs"
              />
              {!isExercise && dayjs().isAfter(assignment.startTime) && (
                <p className="text-sm font-medium">Score: {scoreText}</p>
              )}
              {!isExercise && (
                <Dialog
                  open={isAssignmentDialogOpen}
                  onOpenChange={setIsAssignmentDialogOpen}
                >
                  <DetailButton isActivated={isDetailActivated} />
                  {isAssignmentDialogOpen && (
                    <GradeStatisticsModal
                      courseId={courseId}
                      assignment={assignment}
                    />
                  )}
                </Dialog>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden w-full items-center lg:flex">
            <div className="mr-4 w-[10%]">
              <Badge
                variant="course"
                className="px-[10px] py-1 text-sm font-medium"
              >
                Week {assignment.week.toString().padStart(2, '0')}
              </Badge>
            </div>

            <div
              className={cn(
                'flex flex-col',
                isExercise ? 'w-[45%]' : 'w-[30%]'
              )}
            >
              <AssignmentLink
                key={assignment.id}
                assignment={assignment}
                courseId={courseId}
                isExercise={isExercise}
              />
              {assignment &&
                (assignment.dueTime ?? hasDueDate(assignment.endTime)) && (
                  <CountdownStatus
                    baseTime={assignment.dueTime ?? assignment.endTime}
                    textStyle="text-color-neutral-50"
                    showIcon={false}
                  />
                )}
            </div>

            {assignment && (
              <div
                className={cn(
                  'flex justify-center',
                  isExercise ? 'w-[25%]' : 'w-[30%]'
                )}
              >
                <p className="text-color-neutral-60 truncate text-center text-base font-normal">
                  {formatDateRange(
                    assignment.startTime,
                    assignment.dueTime ?? assignment.endTime,
                    false
                  )}
                </p>
              </div>
            )}

            {!isExercise && (
              <div className="flex w-[10%] justify-center gap-1 text-base font-medium">
                {dayjs().isAfter(assignment.startTime) && <p>{scoreText}</p>}
              </div>
            )}

            <div
              className={cn(
                'flex justify-center',
                isExercise ? 'w-[20%]' : 'w-[13%]'
              )}
            >
              <SubmissionBadge
                submittedCount={submittedCount}
                problemCount={problemCount}
                isExercise={isExercise}
              />
            </div>

            {!isExercise && (
              <div className="flex w-[5%] justify-center">
                <Dialog
                  open={isAssignmentDialogOpen}
                  onOpenChange={setIsAssignmentDialogOpen}
                >
                  <DetailButton isActivated={isDetailActivated} />
                  {isAssignmentDialogOpen && (
                    <GradeStatisticsModal
                      courseId={courseId}
                      assignment={assignment}
                    />
                  )}
                </Dialog>
              </div>
            )}

            {!isExercise && <div className="w-[1%]" />}
          </div>
        </AccordionTrigger>
        <AccordionContent className="-mb-4 w-full">
          {isAccordionOpen && problems && (
            <div className="overflow-hidden rounded-2xl border">
              <div className="h-6 bg-[#F3F3F3]" />

              {/* Mobile Problem List */}
              <div className="lg:hidden">
                {problems.data.map((problem, index) => {
                  const problemSubmission = submission?.find(
                    (sub) => sub.problemId === problem.id
                  )
                  return (
                    <div
                      key={problem.id}
                      className="border-b bg-[#F8F8F8] px-4 py-4 last:border-none"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-color-violet-60 text-sm font-semibold">
                            {convertToLetter(problem.order)}
                          </div>
                          <Link
                            href={`/course/${courseId}/${routeType}/${assignment.id}/problem/${problem.id}`}
                            className="flex-1"
                          >
                            <span className="line-clamp-2 text-sm font-medium text-[#171717]">
                              {problem.title}
                            </span>
                          </Link>
                        </div>
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
                                  {dateFormatter(
                                    submissionTime,
                                    'MMM D, HH:mm'
                                  )}
                                </span>
                              ) : null
                            })()}
                            {!isExercise && (
                              <span>
                                Score:{' '}
                                {dayjs().isAfter(
                                  dayjs(
                                    assignment.dueTime ?? assignment.endTime
                                  )
                                )
                                  ? (record.problems[index].problemRecord
                                      ?.finalScore ?? '-')
                                  : '-'}{' '}
                                / {problem.maxScore}
                              </span>
                            )}
                          </div>
                          {isExercise && problemSubmission && (
                            <ResultBadge
                              assignmentSubmission={problemSubmission}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Desktop Problem List */}
              <div className="hidden lg:block">
                {problems.data.map((problem, index) => {
                  const problemSubmission = submission?.find(
                    (sub) => sub.problemId === problem.id
                  )
                  const submissionTime =
                    problemSubmission?.submission?.submissionTime

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
                        className={cn(
                          'mr-4',
                          isExercise ? 'flex w-[10%]' : 'w-[10%]'
                        )}
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
                          href={`/course/${courseId}/${routeType}/${assignment.id}/problem/${problem.id}`}
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
                            ? (record.problems[index].problemRecord
                                ?.finalScore ?? '-')
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
                          <ResultBadge
                            assignmentSubmission={problemSubmission}
                          />
                        )}
                      </div>

                      {!isExercise && <div className="w-[6%]" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

interface SubmissionBadgeProps {
  className?: string
  submittedCount: number
  problemCount: number
  isExercise?: boolean
}

function SubmissionBadge({
  className,
  submittedCount,
  problemCount,
  isExercise = false
}: SubmissionBadgeProps) {
  const badgeStyle =
    problemCount > 0 && submittedCount === problemCount
      ? 'border-transparent bg-primary text-white'
      : 'border-primary text-primary'

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border',
        isExercise ? 'h-[38px] w-[140px]' : 'h-[36px] w-[120px]',
        badgeStyle,
        className
      )}
    >
      <div className={cn('text-base font-medium', !isExercise && 'flex gap-2')}>
        {isExercise ? (
          <p>
            {submittedCount} / {problemCount}
          </p>
        ) : (
          <>
            <p>{submittedCount}</p>
            <p>/</p>
            <p>{problemCount}</p>
          </>
        )}
      </div>
    </div>
  )
}

interface AssignmentAccordionSkeletonProps {
  isExercise?: boolean
}

export function AssignmentAccordionSkeleton({
  isExercise = false
}: AssignmentAccordionSkeletonProps) {
  return (
    <div className="mt-4 flex flex-col lg:mt-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="mt-[14px] w-full rounded-2xl bg-white px-3 py-4 shadow-md lg:px-8 lg:py-6"
        >
          {/* Mobile */}
          <div className="flex w-full flex-col gap-2 lg:hidden">
            <div className="mr-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-[76px] animate-pulse rounded-full bg-gray-200" />
                <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
            </div>
            <Separator className="my-2" />
            <div className="flex justify-end">
              <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden w-full items-center lg:flex">
            <div className="mr-4 w-[10%]">
              <div className="h-7 w-[76px] animate-pulse rounded-full bg-gray-200" />
            </div>
            <div
              className={cn(
                'flex flex-col gap-1',
                isExercise ? 'w-[45%]' : 'w-[30%]'
              )}
            >
              <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
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
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            )}
            <div
              className={cn(
                'flex justify-center',
                isExercise ? 'w-[20%]' : 'w-[13%]'
              )}
            >
              <div
                className={cn(
                  'animate-pulse rounded-full bg-gray-200',
                  isExercise ? 'h-[38px] w-[140px]' : 'h-[36px] w-[120px]'
                )}
              />
            </div>
            {!isExercise && <div className="w-[6%]" />}
          </div>
        </div>
      ))}
    </div>
  )
}
