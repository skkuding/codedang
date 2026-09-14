'use client'

import { EmptyStatePlaceholder } from '@/app/(client)/(main)/_components/EmptyStatePlaceholder'
import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import { useSuspenseQuery } from '@tanstack/react-query'
import { AssignmentAccordionItem } from './AssignmentAccordionItem'

interface AssignmentAccordionProps {
  courseId: number
  isExercise?: boolean
}

export function AssignmentAccordion({
  courseId,
  isExercise = false
}: AssignmentAccordionProps) {
  const { data: assignments } = useSuspenseQuery(
    assignmentQueries.muliple({ courseId, isExercise })
  )

  if (assignments.length === 0) {
    return (
      <EmptyStatePlaceholder
        title={`No ${isExercise ? 'exercise' : 'assignment'} has been released yet`}
        description="Please check again later"
        className="mt-4 py-10"
        titleTopMargin="mt-4"
      />
    )
  }

  return (
    <div className="mt-4 lg:mt-8">
      {assignments.map((assignment) => (
        <AssignmentAccordionItem
          key={assignment.id}
          assignment={assignment}
          isExercise={isExercise}
        />
      ))}
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
