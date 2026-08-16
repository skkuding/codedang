'use client'

import type { Assignment } from '@/types/type'
import { createContext, useContext } from 'react'

interface AssignmentAccordionContextValue {
  assignment: Assignment
  isExercise: boolean
}

const AssignmentAccordionContext =
  createContext<AssignmentAccordionContextValue | null>(null)

export function AssignmentAccordionProvider({
  assignment,
  isExercise,
  children
}: AssignmentAccordionContextValue & { children: React.ReactNode }) {
  return (
    <AssignmentAccordionContext.Provider value={{ assignment, isExercise }}>
      {children}
    </AssignmentAccordionContext.Provider>
  )
}

export function useAssignmentAccordion() {
  const context = useContext(AssignmentAccordionContext)
  if (!context) {
    throw new Error(
      'useAssignmentAccordion must be used within AssignmentAccordionProvider'
    )
  }
  return context
}
