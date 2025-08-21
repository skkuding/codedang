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
import { Badge } from '@/components/shadcn/badge'
import { Dialog } from '@/components/shadcn/dialog'
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

interface AssignmentAccordianProps {
  courseId: number
}

export function AssignmentAccordion({ courseId }: AssignmentAccordianProps) {
  const { data: assignments } = useQuery(
    assignmentQueries.muliple({ courseId, isExercise: false })
  )
  const { data: grades } = useQuery(assignmentQueries.grades({ courseId }))

  const gradeMap = new Map(grades?.map((grade) => [grade.id, grade]) ?? [])

  return (
    <div className="mt-8">
      {assignments?.map((assignment) => (
        <AssignmentAccordionItem
          key={assignment.id}
          assignment={assignment}
          grade={
            gradeMap.get(assignment.id) ?? {
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

interface AssignmentAccordionItemProps {
  assignment: Assignment
  courseId: number
  grade: AssignmentSummary
}

function AssignmentAccordionItem({
  assignment,
  courseId,
  grade
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

  const handleAccordionOpenChange = (value: string) => {
    setIsAccordionOpen(value === assignment.id.toString())
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
            'mt-[14px] flex w-full items-center rounded-2xl bg-white px-8 py-6 text-left text-sm shadow-md',
            'data-[state=open]:-mb-6 data-[state=open]:mt-[24px]',
            'relative',
            'hover:no-underline'
          )}
          iconStyle="w-5 h-5 absolute right-[3%]"
        >
          <div className="mr-4 w-[10%]">
            <Badge
              variant="Course"
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
            {assignment && hasDueDate(assignment.dueTime) && (
              <CountdownStatus
                baseTime={assignment.dueTime}
                textStyle="text-color-neutral-50"
                showIcon={false}
              />
            )}
          </div>

          {assignment && (
            <div className="flex w-[30%] justify-center">
              <div className="max-w-[250px] flex-1 text-left">
                <p className="text-color-neutral-60 overflow-hidden whitespace-nowrap text-center text-base font-normal">
                  {formatDateRange(
                    assignment.startTime,
                    assignment.dueTime,
                    false
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="flex w-[10%] justify-center gap-1 text-base font-medium">
            {dayjs().isAfter(assignment.startTime) && (
              <p>
                {grade.submittedCount > 0
                  ? `${grade.userAssignmentFinalScore ?? '-'} / ${grade.assignmentPerfectScore}`
                  : `- / ${grade.assignmentPerfectScore}`}
              </p>
            )}
          </div>

          <div className="flex w-[13%] justify-center">
            {dayjs().isAfter(dayjs(assignment.startTime)) && (
              <SubmissionBadge grade={grade} />
            )}
          </div>

          <div className="flex w-[5%] justify-center">
            <Dialog
              open={isAssignmentDialogOpen}
              onOpenChange={setIsAssignmentDialogOpen}
            >
              <DetailButton
                isActivated={
                  grade.userAssignmentFinalScore !== null &&
                  dayjs().isAfter(dayjs(assignment.endTime))
                }
              />
              {isAssignmentDialogOpen && (
                <GradeStatisticsModal
                  courseId={courseId}
                  assignment={assignment}
                />
              )}
            </Dialog>
          </div>

          <div className="w-[1%]" />
        </AccordionTrigger>
        <AccordionContent className="-mb-4 w-full">
          {isAccordionOpen && record && submission && (
            <div className="overflow-hidden rounded-2xl border">
              <div className="h-6 bg-[#F3F3F3]" />
              {record.problems.map((problem, index) => (
                <div
                  key={problem.id}
                  className="flex w-full items-center justify-between border-b bg-[#F8F8F8] px-8 py-6 last:border-none"
                >
                  <div className="mr-4 flex w-[10%]">
                    <div className="text-color-violet-60 w-[76px] text-center text-base font-semibold">
                      {' '}
                      {convertToLetter(problem.order)}
                    </div>
                  </div>

                  <div className="flex w-[30%]">
                    <Link
                      href={`/course/${courseId}/assignment/${assignment.id}/problem/${problem.id}`}
                      // onClick={handleClick}
                    >
                      <span className="line-clamp-1 text-base font-medium text-[#171717]">
                        {problem.title}
                      </span>
                    </Link>
                  </div>

                  <div className="w-[30%]">
                    {submission[index].submission?.submissionTime && (
                      <div className="text-primary flex w-full justify-center text-sm font-normal">
                        Last Submission :{' '}
                        {dateFormatter(
                          submission[index].submission.submissionTime,
                          'MMM D, HH:mm:ss'
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex w-[10%] justify-center text-base font-medium">
                    {dayjs().isAfter(dayjs(assignment.endTime))
                      ? (problem.problemRecord?.finalScore ?? '-')
                      : '-'}{' '}
                    / {problem.maxScore}
                  </div>

                  <div className="flex w-[13%] justify-center" />

                  <div className="w-[6%]" />
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
        'flex h-[36px] w-[120px] items-center justify-center rounded-full border',
        badgeStyle,
        className
      )}
    >
      <div className="flex gap-2 text-base font-medium">
        <p> {grade.submittedCount}</p>
        <p> /</p>
        <p> {grade.problemCount}</p>
      </div>
    </div>
  )
}
