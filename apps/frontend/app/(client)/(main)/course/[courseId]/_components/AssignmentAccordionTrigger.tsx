'use client'

import { CountdownStatus } from '@/components/CountdownStatus'
import { AccordionTrigger } from '@/components/shadcn/accordion'
import { Badge } from '@/components/shadcn/badge'
import { Dialog } from '@/components/shadcn/dialog'
import { Separator } from '@/components/shadcn/separator'
import { cn, formatDateRange, hasDueDate } from '@/libs/utils'
import type { Assignment } from '@/types/type'
import dayjs from 'dayjs'
import { AssignmentLink } from './AssignmentLink'
import { DetailButton } from './DetailButton'
import { GradeStatisticsModal } from './GradeStatisticsModal'

interface AssignmentAccordionTriggerProps {
  assignment: Assignment
  isExercise: boolean
  submittedCount: number
  problemCount: number
  scoreText: string
  isDetailActivated: boolean
  isAssignmentDialogOpen: boolean
  onAssignmentDialogChange: (open: boolean) => void
}

export function AssignmentAccordionTrigger({
  assignment,
  isExercise,
  submittedCount,
  problemCount,
  scoreText,
  isDetailActivated,
  isAssignmentDialogOpen,
  onAssignmentDialogChange
}: AssignmentAccordionTriggerProps) {
  return (
    <AccordionTrigger
      className={cn(
        'mt-[14px] flex w-full items-center rounded-2xl bg-white px-3 py-4 text-left text-sm shadow-md',
        isExercise ? 'lg:px-[60px] lg:py-6' : 'lg:px-8 lg:py-6',
        'data-[state=open]:-mb-6',
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
              onOpenChange={onAssignmentDialogChange}
            >
              <DetailButton isActivated={isDetailActivated} />
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
              onOpenChange={onAssignmentDialogChange}
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
