'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import {
  Accordion,
  AccordionContent,
  AccordionItem
} from '@/components/shadcn/accordion'
import type { Assignment } from '@/types/type'
import { ErrorBoundary, Suspense } from '@suspensive/react'
import { useSuspenseQuery } from '@tanstack/react-query'
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
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)

  const { data: grades } = useSuspenseQuery(
    assignmentQueries.grades({
      courseId: Number(assignment.group.id),
      isExercise
    })
  )
  const grade = grades.find((g) => g.id === assignment.id)

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
          <AssignmentAccordionTrigger
            hasStarted={grade !== undefined}
            submittedCount={submittedCount}
            problemCount={problemCount}
            scoreText={scoreText}
            isDetailActivated={isDetailActivated}
            isAssignmentDialogOpen={isAssignmentDialogOpen}
            onAssignmentDialogChange={setIsAssignmentDialogOpen}
          />
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
                    <AssignmentProblemListSkeleton count={problemCount} />
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
