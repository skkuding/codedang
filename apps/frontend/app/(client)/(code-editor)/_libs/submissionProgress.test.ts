import { describe, expect, it } from 'vitest'
import { getProgressValue, getSubmissionProgress } from './submissionProgress'

const testcase = (
  problemTestcaseId: number,
  result: string,
  cpuTime: string | null = null,
  memoryUsage: number | null = null
) => ({
  id: problemTestcaseId,
  submissionId: 1,
  problemTestcaseId,
  result,
  cpuTime,
  memoryUsage,
  createTime: new Date(),
  updateTime: new Date()
})

describe('submission progress from API responses', () => {
  it('keeps queueing/compilation in waiting until a testcase completes', () => {
    expect(
      getSubmissionProgress({
        result: 'Judging',
        testcaseResult: [testcase(1, 'Judging')]
      })
    ).toEqual({ stage: 'waiting', completed: 0, total: 1 })
    expect(
      getSubmissionProgress({ result: 'Judging', testcaseResult: [] })
    ).toEqual({ stage: 'waiting', completed: 0, total: 0 })
  })

  it('counts processed cases, not just accepted ones or skipped cases', () => {
    const progress = getSubmissionProgress({
      result: 'Judging',
      testcaseResult: [
        testcase(1, 'Accepted'),
        testcase(2, 'WrongAnswer'),
        testcase(3, 'Judging'),
        testcase(4, 'Canceled')
      ]
    })
    expect(progress).toEqual({ stage: 'grading', completed: 2, total: 4 })
    expect(getProgressValue(progress.completed, progress.total)).toBe(50)
  })

  it('finds the first failed case in testcase order and preserves metric units', () => {
    const progress = getSubmissionProgress({
      result: 'WrongAnswer',
      testcaseResult: [
        testcase(30, 'Canceled'),
        testcase(20, 'WrongAnswer', '35', 1468006),
        testcase(10, 'Accepted', '27', 1048576)
      ]
    })
    expect(progress).toMatchObject({
      stage: 'finished',
      result: 'WrongAnswer',
      completed: 2,
      total: 3,
      failedCase: 2,
      runtime: 35,
      memoryUsage: 1468006
    })
  })

  it('does not turn unavailable runtime or memory into a fabricated zero', () => {
    const progress = getSubmissionProgress({
      result: 'CompileError',
      testcaseResult: [testcase(1, 'CompileError')]
    })
    expect(progress.runtime).toBeUndefined()
    expect(progress.memoryUsage).toBeUndefined()
    const zero = getSubmissionProgress({
      result: 'Accepted',
      testcaseResult: [testcase(1, 'Accepted', '0', 0)]
    })
    expect(zero.runtime).toBe(0)
    expect(zero.memoryUsage).toBe(0)
  })

  it('hides all metrics for a blind submission', () => {
    expect(
      getSubmissionProgress({
        result: 'Blind',
        testcaseResult: [testcase(1, 'Blind', '35', 100)]
      })
    ).toEqual({ stage: 'finished', completed: 0, total: 1, result: 'Blind' })
  })

  it('keeps invalid or out-of-range values inside a valid percentage range', () => {
    expect(getProgressValue(80, 200)).toBe(40)
    expect(getProgressValue(300, 200)).toBe(100)
    expect(getProgressValue(-1, 200)).toBe(0)
    expect(getProgressValue(0, 0)).toBe(0)
    expect(getProgressValue(NaN, 200)).toBe(0)
  })
})
