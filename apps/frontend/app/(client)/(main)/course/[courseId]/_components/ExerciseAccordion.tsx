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
import { ResultBadge } from './ResultBadge'

interface ExerciseAccordionProps {
  courseId: number
}

export function ExerciseAccordion({ courseId }: ExerciseAccordionProps) {
  const { data: exercises } = useQuery(
    assignmentQueries.muliple({ courseId, isExercise: true })
  )
  const { data: grades } = useQuery(
    assignmentQueries.grades({ courseId, isExercise: true })
  )

  const gradeMap = new Map(grades?.map((grade) => [grade.id, grade]) ?? [])

  if (!exercises || exercises.length === 0) {
    return (
      <div className="mt-13 lg:mt-8">
        <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20">
          <p className="text-color-neutral-60 text-base">
            No exercises registered
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 lg:mt-8">
      {exercises.map((exercise) => (
        <ExerciseAccordionItem
          key={exercise.id}
          exercise={exercise}
          grade={gradeMap.get(exercise.id)}
          courseId={courseId}
        />
      ))}
    </div>
  )
}

interface ExerciseAccordionItemProps {
  exercise: Assignment
  courseId: number
  grade?: AssignmentSummary
}

function ExerciseAccordionItem({
  exercise,
  courseId,
  grade
}: ExerciseAccordionItemProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)

  const { data: record } = useQuery({
    ...assignmentQueries.record({
      assignmentId: exercise.id
    }),
    enabled: isAccordionOpen
  })

  const { data: submission } = useQuery({
    ...assignmentSubmissionQueries.summary({ assignmentId: exercise.id }),
    enabled: isAccordionOpen
  })

  const { data: problems } = useQuery(
    assignmentProblemQueries.list({
      assignmentId: exercise.id,
      groupId: courseId
    })
  )

  const handleAccordionOpenChange = (value: string) => {
    setIsAccordionOpen(value === exercise.id.toString())
  }

  const submittedCount = grade?.submittedCount ?? 0
  const problemCount = grade?.problemCount ?? problems?.total ?? 0

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      onValueChange={handleAccordionOpenChange}
    >
      <AccordionItem
        value={exercise.id.toString()}
        className="group border-b-0"
      >
        <AccordionTrigger
          className={cn(
            'mt-[14px] flex w-full items-center rounded-2xl bg-white px-3 py-4 text-left text-sm shadow-md lg:px-[60px] lg:py-6',
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
                  Week {exercise.week.toString().padStart(2, '0')}
                </Badge>
                <div className="flex flex-col">
                  <AssignmentLink
                    key={exercise.id}
                    assignment={exercise}
                    courseId={courseId}
                    isExercise
                  />
                </div>
              </div>
              {exercise &&
                (exercise.dueTime ?? hasDueDate(exercise.endTime)) && (
                  <CountdownStatus
                    baseTime={exercise.dueTime ?? exercise.endTime}
                    textStyle="text-color-neutral-50"
                    showIcon={false}
                  />
                )}
            </div>
            <Separator className="my-2" />
            <div
              className={cn(
                'flex items-center text-xs text-gray-600',
                dayjs().isAfter(dayjs(exercise.startTime))
                  ? 'justify-between'
                  : 'justify-end'
              )}
            >
              <SubmissionBadge
                submittedCount={submittedCount}
                problemCount={problemCount}
                className="h-8 w-24 text-xs"
              />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden w-full items-center lg:flex">
            <div className="mr-4 w-[10%]">
              <Badge
                variant="course"
                className="px-[10px] py-1 text-sm font-medium"
              >
                Week {exercise.week.toString().padStart(2, '0')}
              </Badge>
            </div>

            <div className="flex w-[45%] flex-col">
              <AssignmentLink
                key={exercise.id}
                assignment={exercise}
                courseId={courseId}
                isExercise
              />
              {exercise &&
                (exercise.dueTime ?? hasDueDate(exercise.endTime)) && (
                  <CountdownStatus
                    baseTime={exercise.dueTime ?? exercise.endTime}
                    textStyle="text-color-neutral-50"
                    showIcon={false}
                  />
                )}
            </div>

            {exercise && (
              <div className="flex w-[25%] justify-center">
                <p className="text-color-neutral-60 truncate text-center text-base font-normal">
                  {formatDateRange(exercise.startTime, exercise.endTime, false)}
                </p>
              </div>
            )}

            <div className="flex w-[20%] justify-center">
              <SubmissionBadge
                submittedCount={submittedCount}
                problemCount={problemCount}
              />
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="-mb-4 w-full">
          {isAccordionOpen && problems && (
            <div className="overflow-hidden rounded-2xl border">
              <div className="h-6 bg-[#F3F3F3]" />

              {/* Mobile Problem List */}
              <div className="lg:hidden">
                {problems.data.map((problem) => {
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
                            href={`/course/${courseId}/exercise/${exercise.id}/problem/${problem.id}`}
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
                          </div>
                          {problemSubmission && (
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
                {problems.data.map((problem) => {
                  const problemSubmission = submission?.find(
                    (sub) => sub.problemId === problem.id
                  )
                  return (
                    <div
                      key={problem.id}
                      className="bg-background-alternative border-line-neutral hidden w-full items-center border-b px-14 py-6 lg:flex"
                    >
                      <div className="mr-4 flex w-[10%]">
                        <div className="text-color-violet-60 w-[76px] text-center text-base font-semibold">
                          {convertToLetter(problem.order)}
                        </div>
                      </div>

                      <div className="flex w-[45%] flex-col">
                        <Link
                          href={`/course/${courseId}/exercise/${exercise.id}/problem/${problem.id}`}
                        >
                          <span className="line-clamp-1 text-base font-medium text-[#171717]">
                            {problem.title}
                          </span>
                        </Link>
                      </div>

                      <div className="flex w-[25%] justify-center">
                        {(() => {
                          const submissionTime =
                            problemSubmission?.submission?.submissionTime
                          return submissionTime ? (
                            <div className="text-primary flex w-full justify-center truncate text-sm font-normal">
                              Last Submission :{' '}
                              {dateFormatter(submissionTime, 'MMM D, HH:mm:ss')}
                            </div>
                          ) : null
                        })()}
                      </div>

                      <div className="flex w-[20%] justify-center">
                        {problemSubmission && (
                          <ResultBadge
                            assignmentSubmission={problemSubmission}
                          />
                        )}
                      </div>
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
        'flex h-[38px] w-[140px] items-center justify-center rounded-full border',
        badgeStyle,
        className
      )}
    >
      <div className="text-base font-medium">
        <p>
          {submittedCount} / {problemCount}
        </p>
      </div>
    </div>
  )
}
