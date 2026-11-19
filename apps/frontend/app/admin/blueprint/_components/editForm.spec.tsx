import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BlueprintCreateDraft } from '../_libs/createTypes'
import {
  createTestOptions,
  createTestProblemCatalog,
  createTestProblems,
  createTestSchedule
} from '../_test/createFixtures'
import '../_test/createFormEnvironment'
import '../_test/mockCreateIcons'
import { BlueprintCreateForm } from './BlueprintCreateForm'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function editDraft(): BlueprintCreateDraft {
  return {
    title: 'Existing content',
    week: 2,
    description: '<p>Existing description</p>',
    isJudgeResultVisible: false,
    enableCopyPaste: false,
    problems: [
      { problemId: 12, score: 7, solution: 'hidden' },
      {
        problemId: 11,
        score: 35,
        solution: 'manual',
        manualReleaseTime: '2026-11-16T12:30'
      }
    ],
    sections: [createTestSchedule(1), createTestSchedule(2)]
  }
}

type EditProps = Extract<
  ComponentProps<typeof BlueprintCreateForm>,
  { mode: 'edit' }
>

function setup(overrides: Partial<EditProps> = {}) {
  const props: EditProps = {
    mode: 'edit',
    initialDraft: editDraft(),
    isExercise: false,
    options: createTestOptions(),
    problemCatalog: createTestProblemCatalog({
      problems: createTestProblems()
    }),
    onCancel: vi.fn(),
    ...overrides
  }
  const view = render(<BlueprintCreateForm {...props} />)
  return {
    props,
    rerender: (next: Partial<EditProps>) =>
      view.rerender(<BlueprintCreateForm {...props} {...next} />)
  }
}

function openSections() {
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Sections' }), {
    button: 0,
    ctrlKey: false
  })
}

function review() {
  fireEvent.click(screen.getByRole('button', { name: 'Review changes' }))
  return screen.findByRole('dialog')
}

describe('Blueprint edit form', () => {
  it.each([false, true])(
    'prefills known values without create defaults: exercise=%s',
    (isExercise) => {
      setup({ isExercise })
      expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
        'Existing content'
      )
      expect(
        screen.getByRole<HTMLTextAreaElement>('textbox', {
          name: 'Description'
        }).value
      ).toBe('<p>Existing description</p>')
      expect(screen.getByRole('combobox', { name: /Week/ }).textContent).toBe(
        '2'
      )
      for (const name of [
        'Hide Hidden Testcase Result',
        'Disable Copy/Paste'
      ]) {
        expect(
          screen.getByRole('switch', { name }).getAttribute('aria-checked')
        ).toBe('true')
      }
      expect(
        screen.getByRole('combobox', { name: 'Order for Alpha' }).textContent
      ).toBe('B')
      expect(
        screen.getByLabelText<HTMLInputElement>(
          'Manual solution release for Alpha (Asia/Seoul)'
        ).value
      ).toBe('2026-11-16T12:30')
      if (isExercise) {
        expect(screen.queryByRole('spinbutton')).toBeNull()
      } else {
        expect(
          screen.getByRole<HTMLInputElement>('spinbutton', {
            name: 'Score for Alpha'
          }).value
        ).toBe('35')
      }
    }
  )

  it('locks composition and scores by default while allowing order and Solution edits', async () => {
    setup()
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Edit Problem' })
        .disabled
    ).toBe(true)
    expect(
      screen.getByRole<HTMLInputElement>('spinbutton', {
        name: 'Score for Alpha'
      }).disabled
    ).toBe(true)
    const order = screen.getByRole<HTMLButtonElement>('combobox', {
      name: 'Order for Alpha'
    })
    expect(order.disabled).toBe(false)
    fireEvent.keyDown(order, { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('option', { name: 'A' }))
    expect(order.textContent).toBe('A')
    fireEvent.click(screen.getByRole('radio', { name: 'After Due Date' }))
    expect(
      screen.getByRole<HTMLInputElement>('radio', { name: 'After Due Date' })
        .checked
    ).toBe(true)
    expect(await review()).toBeTruthy()
  })

  it('allows explicitly authorized composition changes while preserving retained settings', () => {
    setup({ problemChangesAllowed: true })
    fireEvent.change(
      screen.getByRole('spinbutton', { name: 'Score for Alpha' }),
      { target: { value: '40' } }
    )
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select added problem Beta' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Remove selected' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include Beta' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(
      screen.getByRole<HTMLInputElement>('spinbutton', {
        name: 'Score for Alpha'
      }).value
    ).toBe('40')
    expect(
      screen.getByLabelText<HTMLInputElement>(
        'Manual solution release for Alpha (Asia/Seoul)'
      ).value
    ).toBe('2026-11-16T12:30')
    expect(
      screen.getByRole<HTMLInputElement>('spinbutton', {
        name: 'Score for Beta'
      }).value
    ).toBe('0')
  })

  it.each(['score', 'selection'] as const)(
    'rechecks protected %s after permission is revoked during confirmation',
    async (change) => {
      const view = setup({ problemChangesAllowed: true })
      if (change === 'score') {
        fireEvent.change(
          screen.getByRole('spinbutton', { name: 'Score for Alpha' }),
          { target: { value: '90' } }
        )
      } else {
        fireEvent.click(
          screen.getByRole('checkbox', { name: 'Select added problem Beta' })
        )
        fireEvent.click(screen.getByRole('button', { name: 'Remove selected' }))
      }
      const dialog = await review()
      view.rerender({ problemChangesAllowed: false })
      fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(
        screen.getByText(
          'Problem selection and scores cannot change without permission.'
        )
      ).toBeTruthy()
      expect(
        screen.queryByText(
          'Blueprint updates are not connected. No content has been updated.'
        )
      ).toBeNull()
    }
  )

  it('fixes linked sections and preserves schedule changes after reviewing and canceling', async () => {
    setup()
    openSections()
    expect(screen.getByRole('table', { name: 'Linked sections' })).toBeTruthy()
    expect(screen.queryByRole('checkbox', { name: /section/i })).toBeNull()
    expect(screen.queryByLabelText('Start Time for Section 3')).toBeNull()
    fireEvent.change(screen.getByLabelText('Due Time for Section 1'), {
      target: { value: '2026-11-18T12:30' }
    })
    const dialog = await review()
    expect(within(dialog).getByText('변경사항을 저장할까요?')).toBeTruthy()
    expect(
      within(dialog).getByText(/연결된 2개 분반에 즉시 반영됩니다/)
    ).toBeTruthy()
    expect(
      within(dialog).getByRole('region', { name: 'Changed section schedules' })
        .textContent
    ).toContain('2026-11-18 12:30')
    expect(
      within(dialog).getByRole('region', {
        name: 'Unchanged section schedules'
      }).textContent
    ).toContain('Section 2')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(
      screen.getByLabelText<HTMLInputElement>('Due Time for Section 1').value
    ).toBe('2026-11-18T12:30')
    fireEvent.click(
      screen.getByRole('switch', {
        name: 'Apply Start Time to selected sections'
      })
    )
    fireEvent.change(screen.getByLabelText('Start Time for Section 1'), {
      target: { value: '2026-11-15T10:00' }
    })
    expect(
      screen.getByLabelText<HTMLInputElement>('Start Time for Section 2').value
    ).toBe('2026-11-15T10:00')
    expect(screen.queryByLabelText('Start Time for Section 3')).toBeNull()
  })

  it('confirms only the unconnected update notice without sending a request', async () => {
    const request = vi.spyOn(globalThis, 'fetch')
    setup()
    const dialog = await review()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))
    expect(screen.getByRole('alert').textContent).toBe(
      'Blueprint updates are not connected. No content has been updated.'
    )
    expect(screen.queryByText(/반영되었습니다/)).toBeNull()
    expect(request).not.toHaveBeenCalled()
  })

  it('reviews an explicitly empty linked-section list without requiring a create selection', async () => {
    setup({
      initialDraft: { ...editDraft(), sections: [] },
      options: createTestOptions({ sections: [] })
    })
    openSections()
    expect(screen.getByText('No sections are currently linked.')).toBeTruthy()
    const dialog = await review()
    expect(within(dialog).getByText(/연결된 0개 분반/)).toBeTruthy()
  })

  it('ignores restored Solution UI history but reports an active manual time change', async () => {
    setup()
    const reveal = screen.getByRole('switch', {
      name: 'Reveal solution for Alpha'
    })
    fireEvent.click(reveal)
    fireEvent.click(reveal)
    const restored = await review()
    expect(within(restored).getByText('콘텐츠 변경 없음')).toBeTruthy()
    fireEvent.click(within(restored).getByRole('button', { name: 'Cancel' }))
    fireEvent.change(
      screen.getByLabelText('Manual solution release for Alpha (Asia/Seoul)'),
      { target: { value: '2026-11-17T12:30' } }
    )
    expect(
      within(await review()).getByText('변경 내용: Problem settings')
    ).toBeTruthy()
  })

  it('ignores remembered manual input after returning to After Due Date', async () => {
    const initialDraft = editDraft()
    setup({
      initialDraft: {
        ...initialDraft,
        problems: initialDraft.problems.map((problem) =>
          problem.problemId === 11
            ? { ...problem, solution: 'after-due' }
            : problem
        )
      }
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Manually' }))
    fireEvent.change(
      screen.getByLabelText('Manual solution release for Alpha (Asia/Seoul)'),
      { target: { value: '2026-11-17T12:30' } }
    )
    fireEvent.click(screen.getByRole('radio', { name: 'After Due Date' }))
    expect(within(await review()).getByText('콘텐츠 변경 없음')).toBeTruthy()
  })

  it('preserves unchanged original title spacing when reviewing edit changes', async () => {
    setup({ initialDraft: { ...editDraft(), title: '  Existing content  ' } })
    const unchanged = await review()
    expect(within(unchanged).getByText('콘텐츠 변경 없음')).toBeTruthy()
    fireEvent.click(within(unchanged).getByRole('button', { name: 'Cancel' }))
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Existing content' }
    })
    expect(within(await review()).getByText('변경 내용: Title')).toBeTruthy()
  })

  it('keeps draft input when refreshed initial props arrive for the same form owner', () => {
    const view = setup()
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Unsaved title' }
    })
    view.rerender({
      initialDraft: { ...editDraft(), title: 'Refetched title' }
    })
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Unsaved title'
    )
    expect(view.props.initialDraft.title).toBe('Existing content')
  })
})
