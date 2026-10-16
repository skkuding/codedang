import {
  RUN_CODE_TAB,
  TESTCASE_RESULT_TAB,
  useTestcaseTabStore
} from '@/stores/editorTabs'
import type { TabbedTestResult } from '@/types/type'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  TestPollingStoreProvider,
  useTestPollingStore,
  type SubmissionProgress
} from '../context/TestPollingStoreProvider'
import { TestcasePanel } from './TestcasePanel'

vi.mock('@/components/shadcn/scroll-area', () => ({
  ScrollArea: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ScrollBar: () => null
}))
vi.mock('./useTestResults', () => ({
  useTestResults: () => [
    {
      id: 1,
      originalId: 1,
      input: '1',
      expectedOutput: '1',
      output: '1',
      result: 'Accepted',
      type: 'sample'
    } satisfies TabbedTestResult
  ]
}))
vi.mock('./RunnerTab', () => ({
  RunnerTab: ({ className }: { className: string }) => (
    <div className={className}>Runner</div>
  )
}))
vi.mock('./AddUserTestcaseDialog', () => ({
  AddUserTestcaseDialog: () => null
}))

let setProgress: (progress: SubmissionProgress | null) => void

function ProgressControl() {
  setProgress = useTestPollingStore((state) => state.setSubmissionProgress)
  return null
}

function showProgress(progress: SubmissionProgress) {
  act(() => setProgress(progress))
}

function selectedTab(name: RegExp) {
  return screen.getByRole('button', { name }).className.includes('bg-[#222939]')
}

beforeEach(() => {
  useTestcaseTabStore.setState({ activeTab: RUN_CODE_TAB })
})

afterEach(cleanup)

describe('TestcasePanel submission tabs', () => {
  it('keeps Run Code selected across repeated polls and grading', () => {
    render(
      <TestPollingStoreProvider>
        <ProgressControl />
        <TestcasePanel isContest={false} />
      </TestPollingStoreProvider>
    )

    showProgress({ stage: 'waiting', completed: 0, total: 0 })
    expect(selectedTab(/^Testcase Result$/)).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: /Run Code/ }))
    showProgress({ stage: 'waiting', completed: 0, total: 1 })
    showProgress({ stage: 'grading', completed: 1, total: 2 })
    showProgress({ stage: 'grading', completed: 1, total: 2 })

    expect(selectedTab(/Run Code/)).toBe(true)
    expect(useTestcaseTabStore.getState().activeTab).toBe(RUN_CODE_TAB)
  })

  it('clears an open detail on submission, then preserves a reselected detail', () => {
    render(
      <TestPollingStoreProvider>
        <ProgressControl />
        <TestcasePanel isContest={false} />
      </TestPollingStoreProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: /^Testcase Result$/ }))
    fireEvent.click(screen.getByRole('row', { name: /Sample #1/ }))
    expect(selectedTab(/Sample #1/)).toBe(true)

    showProgress({ stage: 'waiting', completed: 0, total: 0 })
    expect(selectedTab(/^Testcase Result$/)).toBe(true)
    expect(useTestcaseTabStore.getState().activeTab).toBe(TESTCASE_RESULT_TAB)

    fireEvent.click(screen.getByRole('button', { name: /Sample #1/ }))
    showProgress({ stage: 'waiting', completed: 0, total: 1 })
    showProgress({ stage: 'grading', completed: 1, total: 2 })
    showProgress({ stage: 'grading', completed: 1, total: 2 })

    expect(selectedTab(/Sample #1/)).toBe(true)
  })
})
