'use client'

import { SolutionLayout } from '@/app/(client)/(code-editor)/_components/SolutionLayout'
import { useProblem } from '@/app/(client)/(code-editor)/_components/context/ProblemContext'
import { redirect } from 'next/navigation'

export default function SolutionPage({
  params: { courseId, assignmentId, problemId }
}: {
  params: { courseId: string; assignmentId: string; problemId: string }
}) {
  const { problem } = useProblem()

  if (!problem.solution || problem.solution.length === 0) {
    redirect(
      `/course/${courseId}/assignment/${assignmentId}/problem/${problemId}`
    )
  }

  return (
    <div className="py-8">
      <SolutionLayout
        solution={problem.solution}
        languages={problem.languages}
      />
    </div>
  )
}
