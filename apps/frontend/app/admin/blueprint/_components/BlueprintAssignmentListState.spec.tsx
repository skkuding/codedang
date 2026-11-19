import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BlueprintAssignmentSummary,
  BlueprintListScope,
  BlueprintReadState
} from '../_libs/types'
import { useBlueprintAssignmentListState } from '../_libs/useBlueprintAssignmentListState'
import { BlueprintAssignmentList } from './BlueprintAssignmentList'

vi.mock('@/public/icons/arrow-bottom-thin.svg', () => ({
  default: () => null
}))
vi.mock('@/public/icons/arrow-top.svg', () => ({ default: () => null }))

const rows: readonly BlueprintAssignmentSummary[] = [
  {
    id: 10,
    title: 'Alpha content',
    week: 1,
    isExercise: false,
    assignment: [
      {
        id: 100,
        groupId: 5,
        sectionLabel: 'Section 01',
        startTime: '2026-11-01T00:00:00Z',
        dueTime: null,
        endTime: '2026-11-08T00:00:00Z'
      }
    ]
  },
  {
    id: 11,
    title: 'Beta content',
    week: 2,
    isExercise: false,
    assignment: []
  }
]

const scope: BlueprintListScope = {
  blueprintCourseId: 1,
  isExercise: false,
  cursor: null,
  take: 10
}

const success: BlueprintReadState<readonly BlueprintAssignmentSummary[]> = {
  status: 'success',
  data: rows
}

function ListOwner({
  currentScope = scope,
  state = success
}: {
  currentScope?: BlueprintListScope
  state?: BlueprintReadState<readonly BlueprintAssignmentSummary[]>
}) {
  const viewState = useBlueprintAssignmentListState(currentScope)
  const [masterOpen, setMasterOpen] = useState(false)

  if (masterOpen) {
    return (
      <div>
        <p>Master view</p>
        <button type="button" onClick={() => setMasterOpen(false)}>
          Back to list
        </button>
      </div>
    )
  }

  return (
    <BlueprintAssignmentList
      scope={currentScope}
      state={state}
      viewState={viewState}
      onOpenMaster={() => setMasterOpen(true)}
      pagination={{
        page: 1,
        hasPrevious: false,
        hasNext: true,
        onPrevious: vi.fn(),
        onNext: vi.fn(),
        onPageSizeChange: vi.fn()
      }}
    />
  )
}

function search(value: string) {
  fireEvent.change(screen.getByLabelText('Search this page'), {
    target: { value }
  })
}

function selectAndExpandAlpha() {
  fireEvent.click(
    screen.getByRole('checkbox', { name: 'Select Alpha content' })
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Sections for Alpha content' })
  )
  search('alpha')
}

function openMaster() {
  fireEvent.click(screen.getByRole('button', { name: 'Alpha content' }))
  expect(screen.queryByRole('table')).toBeNull()
  expect(screen.getByText('Master view')).toBeTruthy()
}

function backToList() {
  fireEvent.click(screen.getByRole('button', { name: 'Back to list' }))
}

function expectAlphaRestored() {
  expect(
    screen.getByLabelText<HTMLInputElement>('Search this page').value
  ).toBe('alpha')
  expect(
    screen
      .getByRole('checkbox', { name: 'Select Alpha content' })
      .getAttribute('aria-checked')
  ).toBe('true')
  expect(
    screen
      .getByRole('button', { name: 'Sections for Alpha content' })
      .getAttribute('aria-expanded')
  ).toBe('true')
  expect(screen.getByRole('link', { name: 'Section 01' })).toBeTruthy()
}

function expectInitialState() {
  expect(
    screen.getByLabelText<HTMLInputElement>('Search this page').value
  ).toBe('')
  expect(screen.getByRole('status').textContent).toMatch(/^0 of /)
  for (const expand of screen.getAllByRole('button', {
    name: /^Sections for /
  })) {
    expect(expand.getAttribute('aria-expanded')).toBe('false')
  }
}

afterEach(cleanup)

describe('Blueprint list state ownership across master navigation', () => {
  it.each([false, true])(
    'restores search, selection and expansion after unmounting the list, isExercise=%s',
    (isExercise) => {
      render(
        <ListOwner
          currentScope={{ ...scope, isExercise }}
          state={{
            status: 'success',
            data: rows.map((row) => ({ ...row, isExercise }))
          }}
        />
      )
      selectAndExpandAlpha()
      openMaster()
      backToList()
      expectAlphaRestored()
    }
  )

  it('compares scope values rather than the identity of the parent scope object', () => {
    const { rerender } = render(<ListOwner />)
    selectAndExpandAlpha()
    rerender(<ListOwner currentScope={{ ...scope }} />)
    expectAlphaRestored()
  })

  it.each([
    { blueprintCourseId: 2 },
    { isExercise: true },
    { cursor: 11 },
    { take: 20 },
    { page: 2 }
  ])(
    'resets rather than caching a previous scope when changing %j',
    (change) => {
      const { rerender } = render(<ListOwner />)
      selectAndExpandAlpha()

      rerender(
        <ListOwner
          currentScope={{ ...scope, ...change }}
          state={{
            status: 'success',
            data: rows.map((row) => ({
              ...row,
              isExercise: change.isExercise ?? false
            }))
          }}
        />
      )
      expectInitialState()

      rerender(<ListOwner currentScope={{ ...scope }} />)
      expectInitialState()
    }
  )

  it('clears the stored snapshot when the scope changes while master is mounted', () => {
    const { rerender } = render(<ListOwner />)
    selectAndExpandAlpha()
    openMaster()
    rerender(<ListOwner currentScope={{ ...scope, blueprintCourseId: 2 }} />)
    rerender(<ListOwner currentScope={{ ...scope }} />)
    backToList()
    expectInitialState()
  })

  it('permanently prunes disappeared IDs when fresh successful data is read', () => {
    const { rerender } = render(<ListOwner />)
    selectAndExpandAlpha()
    openMaster()
    rerender(<ListOwner state={{ status: 'success', data: rows.slice(1) }} />)
    backToList()
    expect(screen.getByRole('status').textContent).toBe(
      '0 of 1 selected on this page'
    )

    rerender(<ListOwner />)
    expect(
      screen.getByLabelText<HTMLInputElement>('Search this page').value
    ).toBe('alpha')
    expect(
      screen
        .getByRole('checkbox', { name: 'Select Alpha content' })
        .getAttribute('aria-checked')
    ).toBe('false')
    expect(
      screen
        .getByRole('button', { name: 'Sections for Alpha content' })
        .getAttribute('aria-expanded')
    ).toBe('false')
    expect(screen.queryByRole('link', { name: 'Section 01' })).toBeNull()
  })

  it('retains search-hidden rows across master navigation and same-scope reads', () => {
    const { rerender } = render(<ListOwner />)
    selectAndExpandAlpha()
    search('beta')
    fireEvent.click(screen.getByRole('button', { name: 'Beta content' }))
    rerender(<ListOwner state={{ status: 'success', data: [...rows] }} />)
    backToList()
    expect(screen.getByRole('status').textContent).toBe(
      '1 of 2 selected on this page'
    )
    search('alpha')
    expectAlphaRestored()
  })

  it.each(['loading', 'error'] as const)(
    'does not treat a %s read as deleted data',
    (status) => {
      const { rerender } = render(<ListOwner />)
      selectAndExpandAlpha()
      const state: BlueprintReadState<readonly BlueprintAssignmentSummary[]> =
        status === 'error' ? { status, onRetry: vi.fn() } : { status }
      rerender(<ListOwner state={state} />)
      expect(screen.queryByRole('table')).toBeNull()
      rerender(<ListOwner />)
      expectAlphaRestored()
    }
  )

  it('prunes rows that no longer belong to this content kind', () => {
    const { rerender } = render(<ListOwner />)
    selectAndExpandAlpha()
    rerender(
      <ListOwner
        state={{
          status: 'success',
          data: rows.map((row) => ({ ...row, isExercise: true }))
        }}
      />
    )
    expect(screen.getByRole('status').textContent).toBe(
      '0 of 0 selected on this page'
    )
    rerender(<ListOwner />)
    expect(
      screen
        .getByRole('checkbox', { name: 'Select Alpha content' })
        .getAttribute('aria-checked')
    ).toBe('false')
    expect(
      screen
        .getByRole('button', { name: 'Sections for Alpha content' })
        .getAttribute('aria-expanded')
    ).toBe('false')
  })
})
