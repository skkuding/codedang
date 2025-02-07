import { render, screen, act } from '@testing-library/react'
import dayjs from 'dayjs'
import { Toaster, toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ContestStatusTimeDiff } from './ContestStatusTimeDiff'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn()
  },
  Toaster: vi.fn()
}))

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

const toastSpy = vi.spyOn(toast, 'error')

const createContestWithMinuteOffset = (
  startOffset: number,
  endOffset: number
) => ({
  id: 123,
  title: 'Test Contest',
  startTime: dayjs().add(startOffset, 'minutes').toDate(),
  endTime: dayjs().add(endOffset, 'minutes').toDate(),
  status: 'registeredUpcoming' as const,
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
      <ContestStatusTimeDiff
        contest={createContestWithMinuteOffset(startOffset, endOffset)}
        textStyle=""
        inContestEditor={true}
      />
    </>
  )
}

describe.concurrent('ContestStatusTimeDiff Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('초기 렌더링 시, "Starts in" 상태를 표시해야 한다', () => {
    renderWithMinuteOffset(10, 20)
    expect(screen.getByText(/Starts in/i)).toBeInTheDocument()
  })

  it('시간이 경과하면, "Ends in" 상태로 변경된다.', () => {
    renderWithMinuteOffset(0, 20)
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000)
    })
    expect(screen.getByText(/Ends in/i)).toBeInTheDocument()
  })

  it('대회 종료 5분 전, 토스트가 노출된다', () => {
    renderWithMinuteOffset(0, 20)
    act(() => {
      vi.advanceTimersByTime(15 * 60 * 1000 + 1000)
    })

    expect(toastSpy).toHaveBeenCalledWith(
      'Contest ends in 5 minutes.',
      expect.objectContaining({
        duration: 10000
      })
    )
  })

  it('대회 종료 1분 전, 토스트가 노출된다', () => {
    renderWithMinuteOffset(0, 20)
    act(() => {
      vi.advanceTimersByTime(19 * 60 * 1000 + 2000)
    })
    expect(toastSpy).toHaveBeenCalledWith(
      'Contest ends in 1 minute.',
      expect.objectContaining({
        duration: 10000
      })
    )
  })
})
