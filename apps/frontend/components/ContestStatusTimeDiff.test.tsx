import { render, screen, act } from '@testing-library/react'
import dayjs from 'dayjs'
import { Toaster, toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ContestStatusTimeDiff } from './ContestStatusTimeDiff'

vi.mock('next/navigation', () => {
  return {
    __esModule: true,
    useRouter: () => ({
      push: vi.fn()
    }),
    useParams: () => ({
      problemId: '123'
    })
  }
})

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  },
  Toaster: vi.fn()
}))

describe('ContestStatusTimeDiff Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mockContest = {
    id: 123,
    title: 'Test Contest',
    startTime: dayjs().add(10, 'minutes').toDate(),
    endTime: dayjs().add(20, 'minutes').toDate(),
    status: 'upcoming' as const,
    group: { id: 'group1', groupName: 'Test Group' },
    isJudgeResultVisible: true,
    enableCopyPaste: false,
    participants: 10,
    isRegistered: true
  }

  it('초기 렌더링 시, "Starts in" 상태를 표시해야 한다', () => {
    render(
      <ContestStatusTimeDiff
        contest={mockContest}
        textStyle=""
        inContestEditor={true}
      />
    )

    expect(screen.getByText(/Starts in/i)).toBeInTheDocument()
  })

  it('시간이 경과하면, "Ends in" 상태로 변경된다.', () => {
    render(
      <ContestStatusTimeDiff
        contest={mockContest}
        textStyle=""
        inContestEditor={true}
      />
    )

    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })
    expect(screen.getByText(/Ends in/i)).toBeInTheDocument()
  })

  it('대회 종료 시, "Finished" 상태로 변경된다.', () => {
    render(
      <ContestStatusTimeDiff
        contest={mockContest}
        textStyle=""
        inContestEditor={true}
      />
    )

    act(() => {
      vi.advanceTimersByTime(20 * 60 * 1000)
    })

    expect(screen.getByText(/Finished/i)).toBeInTheDocument()
  })

  it('대회 종료 5분 전, 토스트가 노출된다', () => {
    const toastSpy = vi.spyOn(toast, 'error')

    render(
      <>
        <Toaster />
        <ContestStatusTimeDiff
          contest={{
            ...mockContest,
            startTime: dayjs().toDate(),
            endTime: dayjs().add(10, 'minutes').toDate()
          }}
          textStyle=""
          inContestEditor={true}
        />
      </>
    )

    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000)
    })
    expect(toastSpy).toHaveBeenCalledWith(
      'Contest ends in 5 minutes.',
      expect.objectContaining({
        duration: 10000
      })
    )
  })

  it('대회 종료 1분 전, 토스트가 노출된다', () => {
    const toastSpy = vi.spyOn(toast, 'error')

    render(
      <>
        <Toaster />
        <ContestStatusTimeDiff
          contest={{
            ...mockContest,
            startTime: dayjs().toDate(),
            endTime: dayjs().add(10, 'minutes').toDate()
          }}
          textStyle=""
          inContestEditor={true}
        />
      </>
    )

    act(() => {
      vi.advanceTimersByTime(9 * 60 * 1000)
    })
    expect(toastSpy).toHaveBeenCalledWith(
      'Contest ends in 1 minute.',
      expect.objectContaining({
        duration: 10000
      })
    )
  })
})
