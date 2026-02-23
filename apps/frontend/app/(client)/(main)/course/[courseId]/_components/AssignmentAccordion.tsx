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
import { useTranslate } from '@tolgee/react'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useState } from 'react'
import { AssignmentLink } from './AssignmentLink'
import { DetailButton } from './DetailButton'
import { GradeStatisticsModal } from './GradeStatisticsModal'
import { ResultBadge } from './ResultBadge'

interface AssignmentAccordianProps {
  courseId: number
}

export function AssignmentAccordion({ courseId }: AssignmentAccordianProps) {
  const { t } = useTranslate()
  const { data: assignments } = useQuery(
    assignmentQueries.muliple({ courseId, isExercise: false })
  )
  const { data: grades } = useQuery(assignmentQueries.grades({ courseId }))

  const gradeMap = new Map(grades?.map((grade) => [grade.id, grade]) ?? [])

  if (!assignments || assignments.length === 0) {
    return (
      <div className="mt-13 lg:mt-8">
        <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20">
          <p className="text-color-neutral-60 text-base">
            {t('no_assignments_registered')}
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
        />
      ))}
    </div>
  )
}

interface AssignmentAccordionItemProps {
  assignment: Assignment
  courseId: number
  grade?: AssignmentSummary
}

function AssignmentAccordionItem({
  assignment,
  courseId,
  grade
}: AssignmentAccordionItemProps) {
  const { t } = useTranslate()
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

  if (grade) {
    const userScore = grade.userAssignmentFinalScore ?? '-'
    const perfectScore = grade.assignmentPerfectScore
    scoreText = `${userScore} / ${perfectScore}`

    isDetailActivated =
      grade.userAssignmentFinalScore !== null &&
      dayjs().isAfter(dayjs(assignment.endTime))
  }

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
            'mt-[14px] flex w-full items-center rounded-2xl bg-white px-3 py-4 text-left text-sm shadow-md lg:px-8 lg:py-6',
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
              {dayjs().isAfter(assignment.startTime) && (
                <p className="text-sm font-medium">
                  {t('score_label')}: {scoreText}
                </p>
              )}

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

            <div className="flex w-[30%] flex-col">
              <AssignmentLink
                key={assignment.id}
                assignment={assignment}
                courseId={courseId}
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
              <div className="flex w-[30%] justify-center">
                <p className="text-color-neutral-60 truncate text-center text-base font-normal">
                  {formatDateRange(
                    assignment.startTime,
                    assignment.dueTime ?? assignment.endTime,
                    false
                  )}
                </p>
              </div>
            )}

            <div className="flex w-[10%] justify-center gap-1 text-base font-medium">
              {dayjs().isAfter(assignment.startTime) && <p>{scoreText}</p>}
            </div>

            <div className="flex w-[13%] justify-center">
              <SubmissionBadge
                submittedCount={submittedCount}
                problemCount={problemCount}
              />
            </div>

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

            <div className="w-[1%]" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="-mb-4 w-full">
          {isAccordionOpen && problems && (
            <div className="overflow-hidden rounded-2xl border">
              <div className="h-6 bg-[#F3F3F3]" />

              {/* Mobile Problem List */}
              <div className="lg:hidden">
                {problems.data.map((problem, index) => (
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
                          href={`/course/${courseId}/assignment/${assignment.id}/problem/${problem.id}`}
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
                            const problemSubmission = submission.find(
                              (sub) => sub.problemId === problem.id
                            )
                            const submissionTime =
                              problemSubmission?.submission?.submissionTime

                            return submissionTime ? (
                              <span>
                                {t('last_submission')} :{' '}
                                {dateFormatter(submissionTime, 'MMM D, HH:mm')}
                              </span>
                            ) : null
                          })()}
                          <span>
                            {t('score_label')}:{' '}
                            {dayjs().isAfter(
                              dayjs(assignment.dueTime ?? assignment.endTime)
                            )
                              ? (record.problems[index].problemRecord
                                  ?.finalScore ?? '-')
                              : '-'}{' '}
                            / {problem.maxScore}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
                      className="hidden w-full items-center border-b bg-[#F8F8F8] px-8 py-6 last:border-none lg:flex"
                    >
                      <div className="mr-4 w-[10%]">
                        <div className="text-color-violet-60 w-[76px] text-center text-base font-semibold">
                          {convertToLetter(problem.order)}
                        </div>
                      </div>

                      <div className="flex w-[30%] flex-col">
                        <Link
                          href={`/course/${courseId}/assignment/${assignment.id}/problem/${problem.id}`}
                        >
                          <span className="line-clamp-1 text-base font-medium text-[#171717]">
                            {problem.title}
                          </span>
                        </Link>
                      </div>

                      <div className="flex w-[30%] justify-center">
                        {submissionTime && (
                          <div className="text-primary flex w-full justify-center text-sm font-normal">
                            {t('last_submission')} :{' '}
                            {dateFormatter(submissionTime, 'MMM D, HH:mm:ss')}
                          </div>
                        )}
                      </div>

                      <div className="flex w-[10%] justify-center gap-1 text-base font-medium">
                        {dayjs().isAfter(
                          dayjs(assignment.dueTime ?? assignment.endTime)
                        ) && record
                          ? (record.problems[index].problemRecord?.finalScore ??
                            '-')
                          : '-'}{' '}
                        / {problem.maxScore}
                      </div>

                      <div className="flex w-[13%] justify-center">
                        {problemSubmission && (
                          <ResultBadge
                            assignmentSubmission={problemSubmission}
                          />
                        )}
                      </div>

                      <div className="w-[6%]" />
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
}

function SubmissionBadge({
  className,
  submittedCount,
  problemCount
}: SubmissionBadgeProps) {
  const badgeStyle =
    problemCount > 0 && submittedCount === problemCount
      ? 'border-transparent bg-primary text-white'
      : 'border-primary text-primary'

  return (
    <div
      className={cn(
        'flex h-[36px] w-[120px] items-center justify-center rounded-full border',
        badgeStyle,
        className
      )}
    >
      <div className="flex gap-2 text-base font-medium">
        <p>{submittedCount}</p>
        <p>/</p>
        <p>{problemCount}</p>
      </div>
    </div>
  )
}
