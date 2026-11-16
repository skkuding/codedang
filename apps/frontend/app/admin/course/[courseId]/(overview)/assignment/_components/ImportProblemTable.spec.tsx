import { PROBLEM_IMPORT_FILTER } from '@/app/admin/_libs/problemImport'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest'
import { AssignmentSolutionTable } from '../../../_components/AssignmentSolutionTable'
import type { AssignmentProblem } from '../../../_libs/type'
import { ImportProblemTable } from './ImportProblemTable'

const { read } = vi.hoisted(() => ({ read: vi.fn() }))
vi.mock('@apollo/client', () => ({ useSuspenseQuery: read }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))
vi.mock('@/public/icons/calendar.svg', () => ({ default: () => null }))

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
})
afterAll(() => vi.unstubAllGlobals())
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('keeps selected settings through Course import and filters missing solutions in the consumer', () => {
  const release = new Date('2026-11-20T03:00:00Z')
  const problem = {
    id: '11',
    title: 'Own title',
    updateTime: '2026-11-16T00:00:00Z',
    difficulty: 'Level1',
    solution: [{ language: 'Python3', code: 'print(1)' }]
  }
  read.mockImplementation((_, { variables }) => ({
    data: {
      getProblems:
        variables.mode === 'my'
          ? [
              problem,
              { ...problem, id: '12', title: 'No solution', solution: null }
            ]
          : [{ ...problem, title: 'Shared title' }]
    }
  }))
  const exported = vi.fn<(problems: AssignmentProblem[]) => void>()
  const { unmount } = render(
    <ImportProblemTable
      checkedProblems={[
        {
          id: 11,
          title: 'Selected',
          difficulty: 'Level1',
          score: 40,
          order: 2,
          solutionReleaseTime: release
        }
      ]}
      onSelectedExport={exported}
    />
  )
  expect(
    read.mock.calls.slice(0, 2).map(([, { variables }]) => variables)
  ).toEqual(
    ['my', 'shared'].map((mode) => ({
      mode,
      take: 500,
      input: PROBLEM_IMPORT_FILTER
    }))
  )
  expect(screen.queryByRole('cell', { name: 'Own title' })).toBeNull()
  expect(screen.getAllByRole('cell', { name: 'Shared title' })).toHaveLength(1)
  fireEvent.click(screen.getByRole('cell', { name: 'No solution' }))
  fireEvent.click(screen.getByRole('button', { name: 'Import' }))
  const [problems] = exported.mock.calls[0]
  expect(problems).toMatchObject([
    { id: 11, score: 40, order: 0, solutionReleaseTime: release },
    { id: 12, score: 0, order: 1, solutionReleaseTime: null, solution: [] }
  ])

  unmount()
  render(<AssignmentSolutionTable problems={problems} setProblems={vi.fn()} />)
  expect(screen.getByRole('cell', { name: 'Shared title' })).toBeTruthy()
  expect(screen.queryByRole('cell', { name: 'No solution' })).toBeNull()
  expect(
    screen.getByRole<HTMLInputElement>('radio', { name: 'Manually' }).checked
  ).toBe(true)
})

it('enforces the Course limit across filtered rows and permits replacing a selected problem', () => {
  const problems = Array.from({ length: 21 }, (_, index) => ({
    id: index + 1,
    title: `Problem ${index + 1}`,
    difficulty: 'Level1',
    updateTime: '2026-11-16T00:00:00Z',
    score: index + 1,
    order: index,
    solutionReleaseTime: null,
    solution: []
  }))
  read.mockImplementation((_, { variables }) => ({
    data: { getProblems: variables.mode === 'my' ? problems : [] }
  }))
  const exported = vi.fn<(problems: AssignmentProblem[]) => void>()
  render(
    <ImportProblemTable
      checkedProblems={problems.slice(0, 20)}
      onSelectedExport={exported}
    />
  )
  const search = screen.getByPlaceholderText('Search')
  fireEvent.change(search, { target: { value: 'Problem 21' } })
  fireEvent.click(screen.getByRole('cell', { name: 'Problem 21' }))
  expect(toast.error).toHaveBeenCalledTimes(1)
  expect(
    screen
      .getByRole('checkbox', { name: 'Select row' })
      .getAttribute('aria-checked')
  ).toBe('false')

  fireEvent.change(search, { target: { value: 'Problem 1' } })
  fireEvent.click(screen.getByRole('cell', { name: 'Problem 1' }))
  fireEvent.change(search, { target: { value: 'Problem 21' } })
  fireEvent.click(screen.getByRole('cell', { name: 'Problem 21' }))
  fireEvent.click(screen.getByRole('button', { name: 'Import' }))
  const [selected] = exported.mock.calls[0]
  expect(selected).toHaveLength(20)
  expect(selected.map(({ id }) => id)).toEqual(
    Array.from({ length: 20 }, (_, index) => index + 2)
  )
  expect(toast.error).toHaveBeenCalledTimes(1)
})
