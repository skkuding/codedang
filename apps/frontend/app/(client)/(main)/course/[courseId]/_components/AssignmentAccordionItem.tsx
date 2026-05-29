'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import {
  Accordion,
  AccordionContent,
  AccordionItem
} from '@/components/shadcn/accordion'
import type { Assignment } from '@/types/type'
import { Suspense } from '@suspensive/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { AssignmentAccordionTrigger } from './AssignmentAccordionTrigger'
import {
  AssignmentProblemListFetcher,
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
  const problemCount = grade?.problemCount ?? 0

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
          assignment={assignment}
          isExercise={isExercise}
          submittedCount={submittedCount}
          problemCount={problemCount}
          scoreText={scoreText}
          isDetailActivated={isDetailActivated}
          isAssignmentDialogOpen={isAssignmentDialogOpen}
          onAssignmentDialogChange={setIsAssignmentDialogOpen}
        />
        <AccordionContent className="-mb-4 w-full">
          {isAccordionOpen && (
            <Suspense
              fallback={
                <AssignmentProblemListSkeleton
                  count={problemCount}
                  isExercise={isExercise}
                />
              }
            >
              <AssignmentProblemListFetcher
                assignment={assignment}
                isExercise={isExercise}
              />
            </Suspense>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
