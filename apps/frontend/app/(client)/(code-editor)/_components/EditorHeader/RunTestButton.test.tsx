import { TooltipProvider } from '@/components/shadcn/tooltip'
import type * as Utils from '@/libs/utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import {
  TestPollingStoreProvider,
  useTestPollingStore
} from '../context/TestPollingStoreProvider'
import { RunTestButton } from './RunTestButton'

vi.mock('@/libs/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof Utils>()),
  safeFetcherWithAuth: { post: vi.fn().mockResolvedValue({ ok: true }) }
}))
vi.mock('@/libs/hooks/useSession', () => ({
  useSession: () => ({ user: { username: 'student' } })
}))
vi.mock('@/stores/editor', () => ({
  useCodeStore: (selector: (state: unknown) => unknown) =>
    selector({ getCode: () => 'int main() {}' })
}))
vi.mock('../context/TestcaseStoreProvider', () => ({
  useTestcaseStore: (selector: (state: unknown) => unknown) =>
    selector({ getUserTestcases: () => [] })
}))

afterEach(cleanup)

function SubmissionState() {
  const progress = useTestPollingStore((state) => state.submissionProgress)
  const setProgress = useTestPollingStore(
    (state) => state.setSubmissionProgress
  )
  return (
    <>
      <button
        onClick={() =>
          setProgress({
            stage: 'finished',
            result: 'Accepted',
            completed: 1,
            total: 1
          })
        }
      >
        Seed submission
      </button>
      <p>{progress ? 'Previous submission result' : 'Test results'}</p>
    </>
  )
}

it('clears the previous submission when the user starts a testcase test', async () => {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { mutations: { retry: false } } })
      }
    >
      <TestPollingStoreProvider>
        <TooltipProvider>
          <SubmissionState />
          <RunTestButton problemId={1} language="C" saveCode={vi.fn()} />
        </TooltipProvider>
      </TestPollingStoreProvider>
    </QueryClientProvider>
  )
  fireEvent.click(screen.getByRole('button', { name: 'Seed submission' }))
  expect(screen.getByText('Previous submission result')).toBeTruthy()
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /^Test$/ }))
    await Promise.resolve()
  })
  expect(screen.queryByText('Previous submission result')).toBeNull()
  expect(screen.getByText('Test results')).toBeTruthy()
})
