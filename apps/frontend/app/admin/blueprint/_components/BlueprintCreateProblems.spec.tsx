import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  emptyBlueprintCreateDraft,
  type BlueprintCreateDraft,
  type BlueprintDraftProblem
} from '../_libs/createTypes'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'
import {
  createTestProblems,
  createTestProblemCatalog
} from '../_test/createFixtures'
import '../_test/mockCreateIcons'
import { BlueprintCreateProblems } from './BlueprintCreateProblems'

afterEach(cleanup)

const problems = createTestProblems()

function manualAlphaProblem(): BlueprintDraftProblem {
  return {
    problemId: 11,
    score: 40,
    solution: 'manual',
    manualReleaseTime: '2026-11-20T12:30'
  }
}

function Harness({
  initial = emptyBlueprintCreateDraft(),
  onChange = vi.fn(),
  isExercise = false,
  catalog = createTestProblemCatalog({ problems })
}: {
  initial?: BlueprintCreateDraft
  onChange?: (draft: BlueprintCreateDraft) => void
  isExercise?: boolean
  catalog?: BlueprintProblemCatalogController
}) {
  const [draft, setDraft] = useState(initial)
  return (
    <BlueprintCreateProblems
      problemCatalog={catalog}
      draft={draft}
      isExercise={isExercise}
      onChange={(next) => {
        setDraft(next)
        onChange(next)
      }}
    />
  )
}

describe('Blueprint create problem selection', () => {
  it('keeps the existing Course client selection limit while allowing deselection', () => {
    const problems = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1,
      title: `Problem ${index + 1}`,
      level: 'Level1',
      hasSolution: false
    }))
    render(<Harness catalog={createTestProblemCatalog({ problems })} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
    for (let id = 1; id <= 20; id += 1) {
      fireEvent.click(
        screen.getByRole('checkbox', {
          name: `Include Problem ${id}`
        })
      )
    }
    expect(
      screen.getByRole<HTMLButtonElement>('checkbox', {
        name: 'Include Problem 21'
      }).disabled
    ).toBe(true)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include Problem 1' }))
    expect(
      screen.getByRole<HTMLButtonElement>('checkbox', {
        name: 'Include Problem 21'
      }).disabled
    ).toBe(false)
  })

  it('keeps selections across loaded pages and search without resetting existing settings or order', () => {
    const onChange = vi.fn()
    const loadMore = vi.fn()
    const draft = {
      ...emptyBlueprintCreateDraft(),
      problems: [
        { problemId: 12, score: 60, solution: 'hidden' as const },
        manualAlphaProblem()
      ]
    }
    const catalog = createTestProblemCatalog({
      problems,
      hasMore: true,
      loadMore
    })
    const tree = (value: BlueprintProblemCatalogController) => (
      <Harness initial={draft} onChange={onChange} catalog={value} />
    )
    const { rerender } = render(tree(catalog))
    fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include Alpha' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include Alpha' }))
    fireEvent.click(screen.getByRole('button', { name: 'Load more problems' }))
    expect(loadMore).toHaveBeenCalledOnce()
    rerender(tree({ ...catalog, status: 'loading', isLoadingMore: true }))
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Apply' }).disabled
    ).toBe(true)
    rerender(
      tree({
        ...catalog,
        hasMore: false,
        problems: [
          ...catalog.problems,
          { id: 13, title: 'Gamma', level: 'Level3', hasSolution: true }
        ]
      })
    )
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search loaded problems' }),
      {
        target: { value: 'Gamma' }
      }
    )
    expect(screen.queryByRole('checkbox', { name: 'Include Alpha' })).toBeNull()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include Gamma' }))
    expect(
      screen.getByText('Search applies to loaded problems. 3 selected.')
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onChange.mock.lastCall?.[0].problems).toEqual([
      { problemId: 12, score: 60, solution: 'hidden' },
      manualAlphaProblem(),
      { problemId: 13, score: 0, solution: 'hidden' }
    ])
  })

  it.each([
    ['error', 'Could not load problems. Your selection has been kept.'],
    ['unauthenticated', 'Sign in again, then retry loading problems.'],
    ['forbidden', 'You do not have permission to load these problems.']
  ] as const)(
    'distinguishes %s from an empty result and blocks Apply until retry',
    (status, message) => {
      const retry = vi.fn()
      render(<Harness catalog={createTestProblemCatalog({ status, retry })} />)
      fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
      expect(screen.getByRole('alert').textContent).toBe(message)
      expect(screen.queryByText('No available problems.')).toBeNull()
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Apply' })
          .disabled
      ).toBe(true)
      fireEvent.click(
        screen.getByRole('button', { name: 'Retry loading problems' })
      )
      expect(retry).toHaveBeenCalledOnce()
    }
  )

  it('shows loading separately from an empty successful result', () => {
    const { rerender } = render(
      <Harness catalog={createTestProblemCatalog({ status: 'loading' })} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
    expect(screen.getByRole('status').textContent).toBe('Loading problems...')
    expect(screen.queryByText('No available problems.')).toBeNull()
    rerender(<Harness catalog={createTestProblemCatalog()} />)
    expect(screen.getByText('No available problems.')).toBeTruthy()
    expect(screen.queryByText('Loading problems...')).toBeNull()
  })

  it.each(['load', 'remove'] as const)(
    'preserves unresolved draft selections until an explicit %s action',
    (action) => {
      const onChange = vi.fn()
      const draft = {
        ...emptyBlueprintCreateDraft(),
        problems: [{ problemId: 11, score: 40, solution: 'hidden' as const }]
      }
      const { rerender } = render(
        <Harness
          initial={draft}
          onChange={onChange}
          catalog={createTestProblemCatalog()}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
      expect(
        screen.getByText(/Some selected problem information is not loaded/)
      ).toBeTruthy()
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Apply' })
          .disabled
      ).toBe(true)
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onChange).not.toHaveBeenCalled()
      if (action === 'load') {
        rerender(
          <Harness
            initial={draft}
            onChange={onChange}
            catalog={createTestProblemCatalog({
              problems
            })}
          />
        )
      } else {
        fireEvent.click(
          screen.getByRole('button', { name: 'Remove selection #11' })
        )
        expect(onChange).not.toHaveBeenCalled()
      }
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onChange.mock.lastCall?.[0].problems).toEqual(
        action === 'load' ? draft.problems : []
      )
    }
  )

  it.each(['Cancel', 'Escape'])(
    'keeps pending changes out of the draft until Apply and discards %s',
    async (close) => {
      const onChange = vi.fn()
      render(<Harness onChange={onChange} />)
      const trigger = screen.getByRole('button', { name: 'Edit Problem' })
      trigger.focus()
      fireEvent.click(trigger)
      fireEvent.click(screen.getByRole('checkbox', { name: 'Include Alpha' }))
      expect(onChange).not.toHaveBeenCalled()
      if (close === 'Escape') {
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      } else {
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      }
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull()
        expect(document.activeElement).toBe(trigger)
      })
      expect(onChange).not.toHaveBeenCalled()

      fireEvent.click(trigger)
      expect(
        screen
          .getByRole('checkbox', { name: 'Include Alpha' })
          .getAttribute('aria-checked')
      ).toBe('false')
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: 'Beta' }
      })
      expect(
        screen.queryByRole('checkbox', { name: 'Include Alpha' })
      ).toBeNull()
      fireEvent.click(screen.getByRole('checkbox', { name: 'Include Beta' }))
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
      expect(onChange.mock.lastCall?.[0].problems).toEqual([
        { problemId: 12, score: 0, solution: 'hidden' }
      ])
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull()
        expect(document.activeElement).toBe(trigger)
      })
    }
  )

  it('removes selected problems without changing remaining entries and re-adds them with new defaults', () => {
    const onChange = vi.fn()
    render(
      <Harness
        initial={{
          ...emptyBlueprintCreateDraft(),
          problems: [
            manualAlphaProblem(),
            { problemId: 12, score: 60, solution: 'hidden' }
          ]
        }}
        onChange={onChange}
      />
    )
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select added problem Alpha' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Remove selected' }))
    expect(onChange.mock.lastCall?.[0].problems).toEqual([
      { problemId: 12, score: 60, solution: 'hidden' }
    ])
    expect(screen.queryByRole('switch')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include Alpha' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onChange.mock.lastCall?.[0].problems).toEqual([
      { problemId: 12, score: 60, solution: 'hidden' },
      { problemId: 11, score: 0, solution: 'hidden' }
    ])
  })

  it('allows an explicit release reset when refreshed metadata no longer has a solution', () => {
    const onChange = vi.fn()
    const draft = {
      ...emptyBlueprintCreateDraft(),
      problems: [manualAlphaProblem()]
    }
    const { rerender } = render(<Harness initial={draft} onChange={onChange} />)
    rerender(
      <Harness
        initial={draft}
        onChange={onChange}
        catalog={createTestProblemCatalog({
          problems: problems.map((problem) => ({
            ...problem,
            hasSolution: false
          }))
        })}
      />
    )
    expect(screen.getByText(/Solution information has changed/)).toBeTruthy()
    expect(
      screen.getByLabelText<HTMLInputElement>(
        'Manual solution release for Alpha (Asia/Seoul)'
      ).disabled
    ).toBe(true)
    fireEvent.click(
      screen.getByRole('switch', { name: 'Reveal solution for Alpha' })
    )
    expect(onChange.mock.lastCall?.[0].problems).toEqual([
      {
        problemId: 11,
        score: 40,
        solution: 'hidden',
        manualReleaseTime: '2026-11-20T12:30',
        lastVisibleSolution: 'manual'
      }
    ])
    expect(screen.queryByRole('switch')).toBeNull()
  })

  it('keeps manual release input across mode changes and visibility toggles', () => {
    const onChange = vi.fn()
    render(
      <Harness
        initial={{
          ...emptyBlueprintCreateDraft(),
          problems: [
            { problemId: 11, score: 40, solution: 'hidden' },
            { problemId: 12, score: 60, solution: 'hidden' }
          ]
        }}
        onChange={onChange}
      />
    )
    expect(screen.getAllByRole('switch')).toHaveLength(1)
    expect(screen.queryByRole('radio')).toBeNull()
    expect(
      screen.getAllByTitle('Usage information is not connected')
    ).toHaveLength(2)
    fireEvent.click(
      screen.getByRole('switch', { name: 'Reveal solution for Alpha' })
    )
    expect(onChange.mock.lastCall?.[0].problems[0]).toEqual({
      problemId: 11,
      score: 40,
      solution: 'after-due'
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Manually' }))
    const manualInput = () =>
      screen.getByLabelText<HTMLInputElement>(
        'Manual solution release for Alpha (Asia/Seoul)'
      )
    expect(manualInput().value).toBe('')
    fireEvent.change(manualInput(), { target: { value: '2026-11-20T12:30' } })
    expect(onChange.mock.lastCall?.[0].problems[0]).toMatchObject({
      solution: 'manual',
      manualReleaseTime: '2026-11-20T12:30'
    })
    fireEvent.click(screen.getByRole('radio', { name: 'After Due Date' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Manually' }))
    expect(manualInput().value).toBe('2026-11-20T12:30')
    fireEvent.click(
      screen.getByRole('switch', { name: 'Reveal solution for Alpha' })
    )
    expect(onChange.mock.lastCall?.[0].problems[0].solution).toBe('hidden')
    expect(screen.queryByRole('radio')).toBeNull()
    fireEvent.click(
      screen.getByRole('switch', { name: 'Reveal solution for Alpha' })
    )
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: 'Manually' }).checked
    ).toBe(true)
    expect(manualInput().value).toBe('2026-11-20T12:30')
  })

  it('edits one problem release without replacing another problem choice', () => {
    const onChange = vi.fn()
    render(
      <Harness
        onChange={onChange}
        catalog={createTestProblemCatalog({
          problems: [
            { id: 11, title: 'Alpha', level: 'Level1', hasSolution: true },
            { id: 12, title: 'Beta', level: 'Level2', hasSolution: true }
          ]
        })}
        initial={{
          ...emptyBlueprintCreateDraft(),
          problems: [
            manualAlphaProblem(),
            { problemId: 12, score: 60, solution: 'after-due' }
          ]
        }}
      />
    )
    fireEvent.change(
      screen.getByLabelText('Manual solution release for Alpha (Asia/Seoul)'),
      { target: { value: '2026-11-21T09:45' } }
    )
    expect(onChange.mock.lastCall?.[0].problems).toEqual([
      {
        problemId: 11,
        score: 40,
        solution: 'manual',
        manualReleaseTime: '2026-11-21T09:45'
      },
      { problemId: 12, score: 60, solution: 'after-due' }
    ])
  })

  it('omits scoring controls for Exercise', () => {
    render(
      <Harness
        initial={{
          ...emptyBlueprintCreateDraft(),
          problems: [{ problemId: 11, score: 40, solution: 'hidden' }]
        }}
        isExercise
      />
    )
    const table = screen.getByRole('table', { name: 'Selected problems' })
    expect(
      within(table).queryByRole('columnheader', { name: 'Score' })
    ).toBeNull()
    expect(screen.queryByRole('spinbutton')).toBeNull()
    expect(screen.queryByText(/Score Sum/)).toBeNull()
    expect(
      within(table).getByRole('combobox', { name: 'Order for Alpha' })
    ).toBeTruthy()
  })
})
