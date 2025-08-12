'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { CountdownStatus } from '@/components/CountdownStatus'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/shadcn/accordion'
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

  return (
    <div className="mt-8">
      {exercises?.map((exercise) => (
        <ExerciseAccordionItem
          key={exercise.id}
          exercise={exercise}
          grade={
            gradeMap.get(exercise.id) ?? {
              id: 0,
              submittedCount: 0,
              problemCount: 0,
              userAssignmentFinalScore: 0,
              userAssignmentJudgeScore: 0,
              assignmentPerfectScore: 0
            }
          } // 인덱스로 대응
          courseId={courseId}
        />
      ))}
    </div>
  )
}

interface ExerciseAccordionItemProps {
  exercise: Assignment
  courseId: number
  grade: AssignmentSummary
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

  const handleAccordionOpenChange = (value: string) => {
    setIsAccordionOpen(value === exercise.id.toString())
  }

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
            'mt-[14px] flex w-full items-center rounded-2xl bg-white px-[60px] py-5 text-left text-sm shadow-md',
            'data-[state=open]:-mb-6 data-[state=open]:mt-[24px]',
            'relative',
            'hover:no-underline'
          )}
          iconStyle="w-5 h-5 absolute right-[3%]"
        >
          <p className="text-primary w-[10%] text-left font-normal">
            [Week {exercise.week}]
          </p>
          <div className="flex w-[45%] flex-col">
            <AssignmentLink
              key={exercise.id}
              assignment={exercise}
              courseId={courseId}
              isExercise
            />
            {exercise && hasDueDate(exercise.dueTime) && (
              <CountdownStatus
                baseTime={exercise.dueTime}
                target="Submission"
                textStyle="text-color-neutral-50"
                showIcon={false}
              />
            )}
          </div>
          {exercise && (
            <div className="flex w-[25%] justify-center">
              <div className="max-w-[200px] flex-1 text-left">
                <p className="overflow-hidden whitespace-nowrap font-normal text-[#8A8A8A]">
                  {formatDateRange(exercise.startTime, exercise.endTime, false)}
                </p>
              </div>
            </div>
          )}
          <div className="flex w-[20%] justify-center">
            {dayjs().isAfter(dayjs(exercise.startTime)) && (
              <SubmissionBadge grade={grade} />
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="-mb-4 w-full">
          {isAccordionOpen && record && submission && (
            <div className="overflow-hidden rounded-2xl border">
              <div className="h-6 bg-[#F3F3F3]" />
              {record.problems.map((problem, index) => (
                <div
                  key={problem.id}
                  className="flex w-full items-center justify-between border-b bg-[#F8F8F8] px-[60px] py-6 last:border-none"
                >
                  <div className="text-primary flex w-[10%] justify-center font-normal">
                    <p> {convertToLetter(problem.order)}</p>
                  </div>
                  <div className="flex w-[45%]">
                    <Link
                      href={
                        `/course/${courseId}/exercise/${exercise.id}/problem/${problem.id}` as const
                      }
                      // onClick={handleClick}
                    >
                      <span className="line-clamp-1 font-medium text-[#171717]">
                        {problem.title}
                      </span>
                    </Link>
                  </div>
                  <div className="w-[25%]">
                    {submission[index].submission?.submissionTime && (
                      <div className="flex w-full justify-center text-xs font-normal text-[#8A8A8A]">
                        Last Submission :{' '}
                        {dateFormatter(
                          submission[index].submission.submissionTime,
                          'MMM D, HH:mm:ss'
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex w-[20%] justify-center font-medium">
                    <ResultBadge assignmentSubmission={submission[index]} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

interface SubmissionBadgeProps {
  className?: string
  grade: AssignmentSummary
}

function SubmissionBadge({ className, grade }: SubmissionBadgeProps) {
  const badgeStyle =
    grade.submittedCount === grade.problemCount
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
      <div className="text-sm font-medium">
        <p>
          {grade.submittedCount}/{grade.problemCount}
        </p>
      </div>
    </div>
  )
}
