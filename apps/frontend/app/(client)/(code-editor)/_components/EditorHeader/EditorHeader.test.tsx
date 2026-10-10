import { assignmentProblemQueries } from '@/app/(client)/_libs/queries/assignmentProblem'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import { contestProblemQueries } from '@/app/(client)/_libs/queries/contestProblem'
import { contestSubmissionQueries } from '@/app/(client)/_libs/queries/contestSubmission'
import { problemSubmissionQueries } from '@/app/(client)/_libs/queries/problemSubmission'
import type * as Utils from '@/libs/utils'
import type { ProblemDetail } from '@/types/type'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SubmissionProgressPanel } from '../TestcasePanel/SubmissionProgressPanel'
import {
  TestPollingStoreProvider,
  useTestPollingStore
} from '../context/TestPollingStoreProvider'
import { EditorHeader } from './EditorHeader'

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  invalidate: vi.fn(),
  session: { user: { username: 'student' } },
  router: { push: vi.fn() },
  confetti: vi.fn(),
  destroyCanvas: vi.fn(),
  onSubmissionStart: vi.fn()
}))

vi.mock('@/libs/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof Utils>()),
  fetcherWithAuth: Object.assign(mocks.get, { post: mocks.post })
}))
vi.mock('@/libs/hooks/useSession', () => ({ useSession: () => mocks.session }))
vi.mock('next/navigation', () => ({
  useRouter: () => mocks.router
}))
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate })
}))
vi.mock('js-confetti', () => ({
  default: class {
    addConfetti = mocks.confetti
    destroyCanvas = mocks.destroyCanvas
  }
}))
vi.mock('@/stores/editor', () => ({
  useCodeStore: (selector: (state: unknown) => unknown) =>
    selector({ getCode: () => 'int main() {}', setCode: vi.fn() }),
  useLanguageStore: () => () => ({ language: 'C', setLanguage: vi.fn() }),
  getStorageKey: () => undefined,
  getCodeFromLocalStorage: () => undefined
}))
vi.mock('../TestcasePanel/useRunner', () => ({
  useRunner: () => ({ startRunner: vi.fn() })
}))
vi.mock('@/components/AlertModal', () => ({ AlertModal: () => null }))
vi.mock('./RunTestButton', () => ({ RunTestButton: () => null }))
vi.mock('@/public/icons/submit.svg', () => ({ default: () => <svg /> }))

function ProgressView() {
  const progress = useTestPollingStore((state) => state.submissionProgress)
  return progress ? <SubmissionProgressPanel progress={progress} /> : null
}

const problem = {
  id: 1,
  languages: ['C'],
  problemTestcase: []
} as unknown as ProblemDetail
const response = (result: string) => ({
  ok: true,
  json: () =>
    Promise.resolve({
      result,
      testcaseResult: [
        {
          id: 1,
          problemTestcaseId: 1,
          result,
          cpuTime: '35',
          memoryUsage: 1024
        }
      ]
    })
})

const mount = (props: Partial<ComponentProps<typeof EditorHeader>> = {}) =>
  render(
    <TestPollingStoreProvider>
      <EditorHeader
        {...props}
        problem={problem}
        templateString="[]"
        onSubmissionStart={mocks.onSubmissionStart}
      />
      <ProgressView />
    </TestPollingStoreProvider>
  )

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  mocks.post.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 42 })
  })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('submission workflow', () => {
  it.each([
    {
      props: {},
      searchParams: { problemId: 1 },
      queryKeys: [problemSubmissionQueries.lists(1)]
    },
    {
      props: { contestId: 10 },
      searchParams: { problemId: 1, contestId: 10 },
      queryKeys: [
        contestProblemQueries.lists(10),
        contestSubmissionQueries.lists({ contestId: 10, problemId: 1 })
      ]
    },
    {
      props: { assignmentId: 20 },
      searchParams: { problemId: 1, assignmentId: 20 },
      queryKeys: [
        assignmentProblemQueries.lists(20),
        assignmentSubmissionQueries.lists({ assignmentId: 20, problemId: 1 })
      ]
    },
    {
      props: { exerciseId: 30 },
      searchParams: { problemId: 1, assignmentId: 30 },
      queryKeys: [
        assignmentProblemQueries.lists(30),
        assignmentSubmissionQueries.lists({ assignmentId: 30, problemId: 1 })
      ]
    }
  ])(
    'refreshes lists on submission and completion for $props',
    async ({ props, searchParams, queryKeys }) => {
      mocks.get.mockResolvedValue(response('WrongAnswer'))
      mount(props)
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Submit/ }))
        await Promise.resolve()
      })
      expect(mocks.post).toHaveBeenCalledWith(
        'submission',
        expect.objectContaining({ searchParams })
      )
      expect(
        mocks.invalidate.mock.calls.map(([options]) => options.queryKey)
      ).toEqual(queryKeys)
      mocks.invalidate.mockClear()
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500)
      })
      expect(screen.getByText('틀렸습니다!')).toBeTruthy()
      expect(mocks.get).toHaveBeenCalledWith(
        'submission/42',
        expect.objectContaining({
          searchParams: { ...searchParams, pollingTime: expect.any(Number) }
        })
      )
      expect(
        mocks.invalidate.mock.calls.map(([options]) => options.queryKey)
      ).toEqual(queryKeys)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000)
      })
      expect(mocks.get).toHaveBeenCalledTimes(1)
      expect(mocks.invalidate).toHaveBeenCalledTimes(queryKeys.length)
    }
  )

  it('ignores a polling response after the editor unmounts', async () => {
    let finishPoll: (value: ReturnType<typeof response>) => void = () => {
      throw new Error('Polling has not started')
    }
    mocks.get.mockReturnValueOnce(
      new Promise((resolve) => {
        finishPoll = resolve
      })
    )
    const view = mount()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit/ }))
      await Promise.resolve()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    expect(mocks.get).toHaveBeenCalledTimes(1)
    mocks.invalidate.mockClear()
    view.unmount()
    await act(async () => {
      finishPoll(response('Accepted'))
      await Promise.resolve()
    })
    expect(mocks.confetti).not.toHaveBeenCalled()
    expect(mocks.invalidate).not.toHaveBeenCalled()
  })

  it('releases the submit button and shows an error after a rejected POST', async () => {
    mocks.post.mockRejectedValueOnce(new Error('offline'))
    mount()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit/ }))
      await Promise.resolve()
    })
    expect(screen.getByRole('alert').textContent).toContain(
      '제출 요청에 실패했습니다'
    )
    expect(
      screen.getByRole('button', { name: /Submit/ }).hasAttribute('disabled')
    ).toBe(false)
    expect(mocks.get).not.toHaveBeenCalled()
  })

  it('does not overlap slow polls and transitions to the final result once', async () => {
    let finishPoll: (value: ReturnType<typeof response>) => void = () => {
      throw new Error('Polling has not started')
    }
    mocks.get
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finishPoll = resolve
        })
      )
      .mockResolvedValue(response('Accepted'))
    mount()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit/ }))
      await Promise.resolve()
    })
    expect(screen.getByText('채점 대기 중...')).toBeTruthy()
    expect(mocks.onSubmissionStart).toHaveBeenCalledTimes(1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500)
    })
    expect(mocks.get).toHaveBeenCalledTimes(1)
    await act(async () => {
      finishPoll(response('Judging'))
      await Promise.resolve()
    })
    expect(screen.getByText('채점 대기 중...')).toBeTruthy()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    expect(screen.getByText('맞았습니다!')).toBeTruthy()
    expect(mocks.confetti).toHaveBeenCalledTimes(1)
    expect(mocks.invalidate).toHaveBeenCalledTimes(2)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(mocks.get).toHaveBeenCalledTimes(2)
  })

  it('ignores a POST that resolves after the editor unmounts', async () => {
    let finishSubmit: (value: {
      ok: boolean
      json: () => Promise<{ id: number }>
    }) => void = () => {
      throw new Error('Submission has not started')
    }
    mocks.post.mockReturnValueOnce(
      new Promise((resolve) => {
        finishSubmit = resolve
      })
    )
    const view = mount()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit/ }))
      await Promise.resolve()
    })
    view.unmount()
    await act(async () => {
      finishSubmit({ ok: true, json: () => Promise.resolve({ id: 42 }) })
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(mocks.invalidate).not.toHaveBeenCalled()
    expect(mocks.get).not.toHaveBeenCalled()
    expect(mocks.destroyCanvas).toHaveBeenCalledTimes(1)
  })

  it('stops repeated polling failures and releases the button', async () => {
    mocks.get.mockRejectedValue(new Error('offline'))
    mount()
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Submit/ }))
      await Promise.resolve()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20000)
    })
    expect(mocks.get).toHaveBeenCalledTimes(5)
    expect(screen.getByRole('alert').textContent).toContain(
      '제출 내역에서 결과를 확인'
    )
    expect(
      screen.getByRole('button', { name: /Submit/ }).hasAttribute('disabled')
    ).toBe(false)
  })
})
