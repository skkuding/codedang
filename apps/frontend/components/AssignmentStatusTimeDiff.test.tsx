import { render, screen, act } from '@testing-library/react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AssignmentStatusTimeDiff } from './AssignmentStatusTimeDiff'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  },
  Toaster: vi.fn()
}))

vi.mock('next/navigation', () => {
  const router = {
    push: vi.fn()
  }
  return {
    useRouter: vi.fn().mockReturnValue(router),
    useParams: vi.fn().mockReturnValue({ problemId: '123' })
  }
})

const createAssignmentWithMinuteOffset = (
  startOffset: number,
  endOffset: number
) => ({
  id: 123,
  title: 'Test Assignment',
  startTime: dayjs().add(startOffset, 'minutes').toDate(),
  endTime: dayjs().add(endOffset, 'minutes').toDate(),
  status: 'upcoming' as const,
  group: { id: 'group1', groupName: 'Test Group' },
  isJudgeResultVisible: true,
  enableCopyPaste: false,
  participants: 10,
  isRegistered: true
})

const renderWithMinuteOffset = (startOffset: number, endOffset: number) => {
  render(
    <>
      <Toaster />
      <AssignmentStatusTimeDiff
        assignment={createAssignmentWithMinuteOffset(startOffset, endOffset)}
        textStyle=""
        inAssignmentEditor={true}
      />
    </>
  )
}

describe.concurrent('AssignmentStatusTimeDiff Component', () => {
  beforeEach(() => {
    const date = new Date(2025, 1, 1, 0, 0, 0)
    vi.useFakeTimers()
    vi.setSystemTime(date)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('"Starts in" should be displayed before the assignment starts', () => {
    renderWithMinuteOffset(10, 20)
    expect(screen.getByText(/Starts in/i)).toBeInTheDocument()
  })

  it('"Ends in" should be displayed when the assignment starts', () => {
    renderWithMinuteOffset(0, 20)
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })
    expect(screen.getByText(/Ends in/i)).toBeInTheDocument()
  })

  it('Toast message should be displayed when the assignment ends in 5 minutes', () => {
    renderWithMinuteOffset(0, 20)
    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000)
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Assignment ends in 5 minutes.',
      expect.objectContaining({
        duration: 10000
      })
    )
  })

  it('Toast message should be displayed when the assignment ends in 1 minute', () => {
    renderWithMinuteOffset(0, 20)
    act(() => {
      vi.advanceTimersByTime(19 * 60 * 1000)
    })
    expect(toast.error).toHaveBeenCalledWith(
      'Assignment ends in 1 minute.',
      expect.objectContaining({
        duration: 10000
      })
    )
  })

  it('Should navigate to finished page when the assignment ends', () => {
    renderWithMinuteOffset(0, 20)
    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000)
    })
    expect(useRouter().push).toHaveBeenCalledWith(
      '/contest/123/finished/problem/123'
    )
  })
})
