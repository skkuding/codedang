import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { SubmissionProgressPanel } from './SubmissionProgressPanel'

afterEach(cleanup)

describe('SubmissionProgressPanel', () => {
  it('shows waiting and compilation without a determinate bar', () => {
    const { rerender } = render(
      <SubmissionProgressPanel
        progress={{ stage: 'waiting', completed: 0, total: 200 }}
      />
    )
    expect(screen.getByText('채점 대기 중...')).toBeTruthy()
    expect(screen.queryByRole('progressbar')).toBeNull()
    rerender(
      <SubmissionProgressPanel
        progress={{ stage: 'compiling', completed: 0, total: 200 }}
      />
    )
    expect(screen.getByText('컴파일 중...')).toBeTruthy()
  })

  it('uses the same percentage for the text, fill and accessible value', () => {
    render(
      <SubmissionProgressPanel
        progress={{ stage: 'grading', completed: 80, total: 200 }}
      />
    )
    expect(screen.getByText('40%')).toBeTruthy()
    expect(screen.getByText('(80 / 200 Test cases)')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
      '40'
    )
  })

  it('shows accepted runtime and memory using the API units', () => {
    render(
      <SubmissionProgressPanel
        progress={{
          stage: 'finished',
          result: 'Accepted',
          completed: 200,
          total: 200,
          runtime: 35,
          memoryUsage: 1468006
        }}
      />
    )
    expect(screen.getByText('맞았습니다!')).toBeTruthy()
    expect(screen.getByText('35 ms')).toBeTruthy()
    expect(screen.getByText('1.4 MB')).toBeTruthy()
  })

  it('shows the failed case on wrong answer and unavailable runtime as a dash', () => {
    render(
      <SubmissionProgressPanel
        progress={{
          stage: 'finished',
          result: 'WrongAnswer',
          completed: 147,
          total: 200,
          failedCase: 147
        }}
      />
    )
    expect(screen.getByText('틀렸습니다!')).toBeTruthy()
    expect(screen.getByText('147 / 200')).toBeTruthy()
    expect(screen.getByText('-')).toBeTruthy()
  })

  it('does not label a compile error as a wrong answer', () => {
    render(
      <SubmissionProgressPanel
        progress={{
          stage: 'finished',
          result: 'CompileError',
          completed: 0,
          total: 200
        }}
      />
    )
    expect(screen.getByText('컴파일 오류')).toBeTruthy()
    expect(screen.queryByText('틀렸습니다!')).toBeNull()
  })

  it('does not display runtime, memory or failure counts for blind results', () => {
    render(
      <SubmissionProgressPanel
        progress={{
          stage: 'finished',
          result: 'Blind',
          completed: 0,
          total: 200
        }}
      />
    )
    expect(screen.getByText('채점 결과 비공개')).toBeTruthy()
    expect(screen.queryByText('실패 케이스')).toBeNull()
    expect(screen.queryByText('실행시간')).toBeNull()
  })

  it('announces submission and polling failures', () => {
    render(
      <SubmissionProgressPanel
        progress={{
          stage: 'error',
          completed: 0,
          total: 0,
          message: '제출 요청에 실패했습니다.'
        }}
      />
    )
    expect(screen.getByRole('alert').textContent).toBe(
      '제출 요청에 실패했습니다.'
    )
  })
})
