'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import {
  Accordion,
  AccordionContent,
  AccordionItem
} from '@/components/shadcn/accordion'
import type { Assignment, AssignmentSummary } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useState } from 'react'
import { AssignmentAccordionTrigger } from './AssignmentAccordionTrigger'
import { AssignmentProblemList } from './AssignmentProblemList'

interface AssignmentAccordionItemProps {
  assignment: Assignment
  courseId: number
  grade?: AssignmentSummary
  isExercise?: boolean
}

export function AssignmentAccordionItem({
  assignment,
  courseId,
  grade,
  isExercise = false
}: AssignmentAccordionItemProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)

  const { data: record } = useQuery({
    ...assignmentQueries.record({ assignmentId: assignment.id }),
    enabled: isAccordionOpen
  })

  const { data: submission } = useQuery({
    ...assignmentSubmissionQueries.summary({ assignmentId: assignment.id }),
    enabled: isAccordionOpen
  })

  const { data: problems } = useQuery(
    assignmentProblemQueries.list({
      assignmentId: assignment.id,
      groupId: courseId
    })
  )

  const submittedCount = grade?.submittedCount ?? 0
  const problemCount = grade?.problemCount ?? problems?.total ?? 0

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
          courseId={courseId}
          isExercise={isExercise}
          submittedCount={submittedCount}
          problemCount={problemCount}
          scoreText={scoreText}
          isDetailActivated={isDetailActivated}
          isAssignmentDialogOpen={isAssignmentDialogOpen}
          onAssignmentDialogChange={setIsAssignmentDialogOpen}
        />
        <AccordionContent className="-mb-4 w-full">
          {isAccordionOpen && problems && (
            <AssignmentProblemList
              problems={problems.data}
              assignment={assignment}
              courseId={courseId}
              isExercise={isExercise}
              record={record}
              submission={submission}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
