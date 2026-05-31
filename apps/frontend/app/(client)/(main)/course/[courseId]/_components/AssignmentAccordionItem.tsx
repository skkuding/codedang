'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem
} from '@/components/shadcn/accordion'
import type { Assignment } from '@/types/type'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import dayjs from 'dayjs'
import { useState } from 'react'
import { toast } from 'sonner'
import { AssignmentAccordionProvider } from './AssignmentAccordionContext'
import { AssignmentAccordionTrigger } from './AssignmentAccordionTrigger'
import {
  AssignmentProblemList,
  AssignmentProblemListSkeleton
} from './AssignmentProblemList'

interface AssignmentAccordionItemProps {
  assignment: Assignment
  isExercise?: boolean
}

export function AssignmentAccordionItem({
  assignment,
  isExercise = false
}: AssignmentAccordionItemProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)

  return (
    <AssignmentAccordionProvider
      assignment={assignment}
      isExercise={isExercise}
    >
      <Accordion
        type="single"
        collapsible
        className="w-full"
        onValueChange={(value) =>
          setIsAccordionOpen(value === assignment.id.toString())
        }
      >
        <AccordionItem
          value={assignment.id.toString()}
          className="group border-b-0"
        >
          <AssignmentAccordionTrigger />
          <AccordionContent className="-mb-4 w-full">
            {isAccordionOpen && (
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
                    <AssignmentProblemListSkeleton
                      count={assignment.problemCount}
                    />
                  }
                >
                  <AssignmentProblemList />
                </Suspense>
              </ErrorBoundary>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </AssignmentAccordionProvider>
  )
}
