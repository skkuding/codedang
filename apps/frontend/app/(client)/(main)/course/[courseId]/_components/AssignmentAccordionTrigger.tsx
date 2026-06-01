'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { CountdownStatus } from '@/components/CountdownStatus'
import { AccordionTrigger } from '@/components/shadcn/accordion'
import { Badge } from '@/components/shadcn/badge'
import { Dialog } from '@/components/shadcn/dialog'
import { Separator } from '@/components/shadcn/separator'
import { cn, formatDateRange, hasDueDate } from '@/libs/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useAssignmentAccordion } from './AssignmentAccordionContext'
import { AssignmentLink } from './AssignmentLink'
import { AssignmentSubmissionBadge } from './AssignmentSubmissionBadge'
import { DetailButton } from './DetailButton'
import { GradeStatisticsModal } from './GradeStatisticsModal'

export function AssignmentAccordionTrigger() {
  const { assignment, isExercise } = useAssignmentAccordion()
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)

  const { data: grades } = useSuspenseQuery(
    assignmentQueries.grades({
      courseId: Number(assignment.group.id),
      isExercise
    })
  )
  const grade = grades.find((g) => g.id === assignment.id)

  const hasStarted = grade !== undefined
  const submittedCount = grade?.submittedCount ?? 0
  const problemCount = grade?.problemCount ?? assignment.problemCount

  let scoreText = '- / -'
  let isDetailActivated = false

  if (!isExercise && grade) {
    const userScore = grade.userAssignmentFinalScore ?? '-'
    scoreText = `${userScore} / ${grade.assignmentPerfectScore}`
    isDetailActivated =
      grade.userAssignmentFinalScore !== null &&
      dayjs().isAfter(dayjs(assignment.endTime))
  }

  return (
    <AccordionTrigger
      disabled={!hasStarted}
      className={cn(
        'mt-[14px] flex w-full items-center rounded-2xl bg-white px-3 py-4 text-left text-sm shadow-md',
        isExercise ? 'lg:px-[60px] lg:py-6' : 'lg:px-8 lg:py-6',
        'data-[state=open]:-mb-6',
        'relative',
        'hover:no-underline'
      )}
      iconStyle={cn(
        'w-5 h-5 absolute right-3 top-[15%] lg:right-[3%] lg:top-auto',
        !hasStarted && 'invisible'
      )}
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
                assignment={assignment}
                courseId={Number(assignment.group.id)}
                isExercise={isExercise}
              />
            </div>
          </div>
          {(assignment.dueTime ?? hasDueDate(assignment.endTime)) && (
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
          <span className={cn(!hasStarted && 'invisible')}>
            <AssignmentSubmissionBadge
              submittedCount={submittedCount}
              problemCount={problemCount}
              size="sm"
            />
          </span>
          {!isExercise && dayjs().isAfter(assignment.startTime) && (
            <p className="text-sm font-medium">Score: {scoreText}</p>
          )}
          {!isExercise && (
            <Dialog
              open={isAssignmentDialogOpen}
              onOpenChange={setIsAssignmentDialogOpen}
            >
              <span className={cn(!hasStarted && 'invisible')}>
                <DetailButton isActivated={isDetailActivated} />
              </span>
              {isAssignmentDialogOpen && (
                <GradeStatisticsModal
                  courseId={Number(assignment.group.id)}
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
          className={cn('flex flex-col', isExercise ? 'w-[45%]' : 'w-[30%]')}
        >
          <AssignmentLink
            assignment={assignment}
            courseId={Number(assignment.group.id)}
            isExercise={isExercise}
          />
          {(assignment.dueTime ?? hasDueDate(assignment.endTime)) && (
            <CountdownStatus
              baseTime={assignment.dueTime ?? assignment.endTime}
              textStyle="text-color-neutral-50"
              showIcon={false}
            />
          )}
        </div>

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

        {!isExercise && (
          <div className="flex w-[10%] justify-center gap-1 text-base font-medium">
            {dayjs().isAfter(assignment.startTime) && <p>{scoreText}</p>}
          </div>
        )}

        <div
          className={cn(
            'flex justify-center',
            isExercise ? 'w-[20%]' : 'w-[13%]',
            !hasStarted && 'invisible'
          )}
        >
          <AssignmentSubmissionBadge
            submittedCount={submittedCount}
            problemCount={problemCount}
            size={isExercise ? 'lg' : 'md'}
          />
        </div>

        {!isExercise && (
          <div
            className={cn(
              'flex w-[5%] justify-center',
              !hasStarted && 'invisible'
            )}
          >
            <Dialog
              open={isAssignmentDialogOpen}
              onOpenChange={setIsAssignmentDialogOpen}
            >
              <DetailButton isActivated={isDetailActivated} />
              {isAssignmentDialogOpen && (
                <GradeStatisticsModal
                  courseId={Number(assignment.group.id)}
                  assignment={assignment}
                />
              )}
            </Dialog>
          </div>
        )}

        {!isExercise && <div className="w-[1%]" />}
      </div>
    </AccordionTrigger>
  )
}
