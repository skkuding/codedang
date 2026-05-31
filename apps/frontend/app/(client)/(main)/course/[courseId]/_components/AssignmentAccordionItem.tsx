'use client'

import { Accordion, AccordionItem } from '@/components/shadcn/accordion'
import type { Assignment } from '@/types/type'
import { useState } from 'react'
import { AssignmentAccordionContent } from './AssignmentAccordionContent'
import { AssignmentAccordionProvider } from './AssignmentAccordionContext'
import { AssignmentAccordionTrigger } from './AssignmentAccordionTrigger'

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
          <AssignmentAccordionContent isOpen={isAccordionOpen} />
        </AccordionItem>
      </Accordion>
    </AssignmentAccordionProvider>
  )
}
