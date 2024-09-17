'use client'

import EditorResizablePanel from '@/components/EditorResizablePanel'
import { TestResultsContext, createTestResultsStore } from '@/stores/editor'
import { Contest, ProblemDetail } from '@/types/type'

export default function EditorResizablePanelWithContext({
  problem,
  contestId,
  contest,
  children
}: {
  problem: ProblemDetail
  contestId?: number | undefined
  contest?: Contest | undefined
  children: React.ReactNode
}) {
  const testResultsStore = createTestResultsStore(problem.id, contestId)

  return (
    <TestResultsContext.Provider value={testResultsStore}>
      <EditorResizablePanel
        problem={problem}
        contestId={contestId}
        enableCopyPaste={contest ? contest.enableCopyPaste : true}
      >
        {children}
      </EditorResizablePanel>
    </TestResultsContext.Provider>
  )
}
