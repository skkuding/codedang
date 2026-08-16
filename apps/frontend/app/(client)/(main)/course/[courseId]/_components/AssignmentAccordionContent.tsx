'use client'

import { AccordionContent } from '@/components/shadcn/accordion'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { useAssignmentAccordion } from './AssignmentAccordionContext'
import {
  AssignmentProblemList,
  AssignmentProblemListSkeleton
} from './AssignmentProblemList'

interface AssignmentAccordionContentProps {
  isOpen: boolean
}

export function AssignmentAccordionContent({
  isOpen
}: AssignmentAccordionContentProps) {
  const { assignment, isExercise } = useAssignmentAccordion()

  return (
    <AccordionContent className="-mb-4 w-full">
      {isOpen && (
        <ErrorBoundary
          fallback={null}
          onError={() => {
            if (dayjs().isBefore(dayjs(assignment.startTime))) {
              const noun = isExercise ? 'exercise' : 'assignment'
              toast.error(`This ${noun} has not started yet!`)
            }
          }}
        >
          <Suspense
            fallback={
              <AssignmentProblemListSkeleton count={assignment.problemCount} />
            }
          >
            <AssignmentProblemList />
          </Suspense>
        </ErrorBoundary>
      )}
    </AccordionContent>
  )
}
