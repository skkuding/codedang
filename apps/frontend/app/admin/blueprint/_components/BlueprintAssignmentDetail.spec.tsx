import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BlueprintAssignmentCopy,
  BlueprintAssignmentDetail as Detail
} from '../_libs/types'
import { BlueprintAssignmentDetail } from './BlueprintAssignmentDetail'
import { BlueprintAssignmentSections } from './BlueprintAssignmentSections'

afterEach(cleanup)

const copy: BlueprintAssignmentCopy = {
  id: 703,
  groupId: 42,
  sectionLabel: 'CHS1330-43',
  startTime: '2026-11-13T00:00:00Z',
  dueTime: null,
  endTime: '2026-11-20T09:00:00Z'
}

function detail(isExercise = false): Detail {
  return {
    id: 91,
    title: 'Week 4 problems',
    week: 4,
    isExercise,
    description: '<p>Read the instructions.</p><script>malicious()</script>',
    assignment: [copy],
    blueprintAssignmentProblem: Object.freeze([
      { problemId: 11, title: 'Second problem', order: 1, score: 60 },
      { problemId: 10, title: 'First problem', order: 0, score: 40 }
    ]),
    isVisible: true,
    isRankVisible: false,
    isJudgeResultVisible: null,
    enableCopyPaste: true,
    autoFinalizeScore: false
  }
}

describe.each([false, true])(
  'Blueprint detail, isExercise=%s',
  (isExercise) => {
    it('shows master information and links copies using the group and copy IDs', () => {
      const { container } = render(
        <BlueprintAssignmentDetail
          state={{ status: 'success', data: detail(isExercise) }}
          isExercise={isExercise}
          onBack={vi.fn()}
        />
      )

      expect(
        screen.getByRole('heading', { name: 'Master Information' })
      ).toBeTruthy()
      expect(screen.getByText('Read the instructions.')).toBeTruthy()
      expect(container.querySelector('script')).toBeNull()
      expect(
        screen
          .getByRole('link', { name: copy.sectionLabel })
          .getAttribute('href')
      ).toBe(`/admin/course/42/${isExercise ? 'exercise' : 'assignment'}/703`)
      const sections = screen.getByRole('table', { name: 'Section copies' })
      expect(within(sections).getByText('Nov 13, 2026 09:00')).toBeTruthy()
      expect(within(sections).getByText('Nov 20, 2026 18:00')).toBeTruthy()
      expect(within(sections).getByText('-')).toBeTruthy()
      expect(screen.getByText('Section schedules (Asia/Seoul)')).toBeTruthy()
      expect(
        screen.queryByText(/countdown|time left|remaining|period/i)
      ).toBeNull()
      expect(screen.queryByRole('tab')).toBeNull()
      const problems = screen.getByRole('table', { name: 'Included problems' })
      if (isExercise) {
        expect(
          within(problems).queryByRole('columnheader', { name: 'Score' })
        ).toBeNull()
        expect(within(problems).queryByText('Total')).toBeNull()
        expect(within(problems).queryByText('40')).toBeNull()
        expect(within(problems).queryByText('60')).toBeNull()
      } else {
        expect(
          within(problems).getByRole('columnheader', { name: 'Score' })
        ).toBeTruthy()
        expect(within(problems).getByText('Total')).toBeTruthy()
      }
      expect(
        screen.queryByRole('button', { name: /create|edit|delete|submit/i })
      ).toBeNull()
    })

    it('treats another content kind as not found instead of showing its data', () => {
      render(
        <BlueprintAssignmentDetail
          state={{ status: 'success', data: detail(!isExercise) }}
          isExercise={isExercise}
          onBack={vi.fn()}
        />
      )
      expect(screen.getByRole('alert').textContent).toContain(
        'could not be found'
      )
      expect(screen.queryByText('Week 4 problems')).toBeNull()
      expect(screen.queryByRole('link')).toBeNull()
    })
  }
)

describe('Blueprint master information', () => {
  it('sorts a copy of the problem relation and computes its total', () => {
    const data = detail()
    render(
      <BlueprintAssignmentDetail
        state={{ status: 'success', data }}
        isExercise={false}
        onBack={vi.fn()}
      />
    )

    const rows = within(
      screen.getByRole('table', { name: 'Included problems' })
    ).getAllByRole('row')
    expect(rows[1].textContent).toContain('First problem')
    expect(rows[2].textContent).toContain('Second problem')
    expect(within(rows[1]).getAllByRole('cell')[0].textContent).toBe('A')
    expect(within(rows[2]).getAllByRole('cell')[0].textContent).toBe('B')
    expect(rows[3].textContent).toBe('Total100')
    expect(
      data.blueprintAssignmentProblem?.map((problem) => problem.order)
    ).toEqual([1, 0])
    expect(screen.queryByText('Solution')).toBeNull()
  })

  it('preserves unknown settings instead of displaying OFF', () => {
    render(
      <BlueprintAssignmentDetail
        state={{ status: 'success', data: detail() }}
        isExercise={false}
        onBack={vi.fn()}
      />
    )

    const settings = screen.getByRole('region', { name: 'Settings' })
    const expected = [
      ['Visible', 'ON'],
      ['Show Rankings', 'OFF'],
      ['Reveal Hidden Testcase Result', 'Unavailable'],
      ['Enable Copy/Paste', 'ON'],
      ['Auto Finalize Score', 'OFF']
    ]
    for (const [label, value] of expected) {
      expect(
        within(settings).getByText(label).nextElementSibling?.textContent
      ).toBe(value)
    }
    expect(within(settings).queryByRole('switch')).toBeNull()
  })

  it('distinguishes missing problems from an empty relation', () => {
    const { rerender } = render(
      <BlueprintAssignmentDetail
        state={{
          status: 'success',
          data: { ...detail(), blueprintAssignmentProblem: null }
        }}
        isExercise={false}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByText('Problem information is unavailable.')).toBeTruthy()
    expect(screen.queryByText('No included problems.')).toBeNull()

    rerender(
      <BlueprintAssignmentDetail
        state={{
          status: 'success',
          data: { ...detail(), blueprintAssignmentProblem: [] }
        }}
        isExercise={false}
        onBack={vi.fn()}
      />
    )
    expect(screen.getByText('No included problems.')).toBeTruthy()
    expect(
      screen.queryByRole('table', { name: 'Included problems' })
    ).toBeNull()
  })

  it('hides prior data during loading, failed reads, and denied access', () => {
    const retry = vi.fn()
    const onBack = vi.fn()
    const { rerender } = render(
      <BlueprintAssignmentDetail
        state={{ status: 'success', data: detail() }}
        isExercise={false}
        onBack={onBack}
      />
    )

    rerender(
      <BlueprintAssignmentDetail
        state={{ status: 'loading' }}
        isExercise={false}
        onBack={onBack}
      />
    )
    expect(screen.getByRole('status').textContent).toContain('Loading')
    expect(screen.queryByText('Week 4 problems')).toBeNull()

    rerender(
      <BlueprintAssignmentDetail
        state={{ status: 'error', onRetry: retry }}
        isExercise={false}
        onBack={onBack}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(retry).toHaveBeenCalledOnce()
    expect(screen.queryByRole('link')).toBeNull()

    rerender(
      <BlueprintAssignmentDetail
        state={{ status: 'forbidden' }}
        isExercise={false}
        onBack={onBack}
      />
    )
    expect(screen.getByRole('alert').textContent).toContain(
      'do not have access'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Back to Assignments' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})

describe('Blueprint section copies', () => {
  it('distinguishes an unavailable relation from no copies', () => {
    const { rerender } = render(
      <BlueprintAssignmentSections copies={null} isExercise={false} />
    )
    expect(screen.getByRole('status').textContent).toBe(
      'Section information is unavailable.'
    )
    rerender(<BlueprintAssignmentSections copies={[]} isExercise={false} />)
    expect(screen.getByText('No section copies.')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('never navigates using missing, nonpositive, or fractional identifiers', () => {
    const copies = [
      { ...copy, id: null },
      { ...copy, groupId: null },
      { ...copy, id: 0 },
      { ...copy, groupId: -2 },
      { ...copy, id: 1.5 }
    ]
    render(<BlueprintAssignmentSections copies={copies} isExercise={false} />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getAllByText(/detail unavailable/)).toHaveLength(5)
  })

  it('keeps separate schedules for each copy and handles malformed dates', () => {
    render(
      <BlueprintAssignmentSections
        copies={[
          copy,
          {
            ...copy,
            id: 704,
            sectionLabel: 'CHS1330-44',
            startTime: '2026-11-14T00:00:00Z',
            dueTime: 'invalid-date'
          }
        ]}
        isExercise={false}
      />
    )
    expect(screen.getByText('Nov 13, 2026 09:00')).toBeTruthy()
    expect(screen.getByText('Nov 14, 2026 09:00')).toBeTruthy()
    expect(screen.getByText('Unavailable')).toBeTruthy()
    expect(screen.queryByText(/linked|unlinked/i)).toBeNull()
  })
})
