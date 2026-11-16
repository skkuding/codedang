import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { BlueprintCreateOptions } from '../_libs/createTypes'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'
import {
  createTestOptions,
  createTestProblemCatalog,
  createTestProblems
} from '../_test/createFixtures'
import {
  fillCreateForm as fill,
  openCreateConfirmation
} from '../_test/createFormActions'
import '../_test/createFormEnvironment'
import '../_test/mockCreateIcons'
import { BlueprintCreateForm } from './BlueprintCreateForm'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const options = createTestOptions({ weeks: [1, 2] })

function setup(
  isExercise = false,
  problemCatalog = createTestProblemCatalog({ problems: createTestProblems() })
) {
  const onCancel = vi.fn()
  const props = { isExercise, options, problemCatalog, onCancel }
  const view = render(<BlueprintCreateForm {...props} />)
  return {
    onCancel,
    rerenderCatalog: (catalog: BlueprintProblemCatalogController) =>
      view.rerender(
        <BlueprintCreateForm {...props} problemCatalog={catalog} />
      ),
    rerenderOptions: (next: BlueprintCreateOptions, optionsReady = true) =>
      view.rerender(
        <BlueprintCreateForm
          {...props}
          options={next}
          optionsReady={optionsReady}
        />
      )
  }
}

function chooseManualProblem() {
  fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Include Alpha' }))
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
  fireEvent.change(
    screen.getByRole('spinbutton', { name: 'Score for Alpha' }),
    { target: { value: '40' } }
  )
  fireEvent.click(
    screen.getByRole('switch', { name: 'Reveal solution for Alpha' })
  )
  fireEvent.click(screen.getByRole('radio', { name: 'Manually' }))
  fireEvent.change(
    screen.getByLabelText('Manual solution release for Alpha (Asia/Seoul)'),
    { target: { value: '2026-11-20T12:30' } }
  )
}

describe('Blueprint creation input and confirmation', () => {
  it('keeps both steps mounted and validates required content before review', () => {
    setup()
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Keep my title' }
    })
    for (const name of ['Sections', 'Assignment']) {
      fireEvent.mouseDown(screen.getByRole('tab', { name }), {
        button: 0,
        ctrlKey: false
      })
    }
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Keep my title'
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Create in 0 sections' })
    )
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it.each([false, true])(
    'reviews selected schedules without claiming creation or sending a request: exercise=%s',
    async (isExercise) => {
      const request = vi.spyOn(globalThis, 'fetch')
      setup(isExercise)
      await fill()
      const form = screen.getByRole('form', { name: /Create Blueprint/ })
      const dialog = await openCreateConfirmation()
      expect(within(dialog).getByText('3개 분반에 저장할까요?')).toBeTruthy()
      expect(
        within(dialog).getAllByText(/2026-11-20 10:00 → 2026-11-21 10:00/)
      ).toHaveLength(3)
      fireEvent.submit(form)
      expect(screen.getAllByRole('dialog')).toHaveLength(1)
      const confirm = within(dialog).getByRole('button', { name: 'Confirm' })
      fireEvent.click(confirm)
      fireEvent.click(confirm)
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getByRole('alert').textContent).toBe(
        'Blueprint creation is not connected. No content has been created.'
      )
      expect(screen.queryByText(/반영되었습니다/)).toBeNull()
      expect(request).not.toHaveBeenCalled()
    }
  )

  it.each(['Cancel', 'Escape'])(
    'retains input, options, problem settings and section schedules after confirmation %s',
    async (action) => {
      setup()
      chooseManualProblem()
      fireEvent.click(
        screen.getByRole('switch', { name: 'Hide Hidden Testcase Result' })
      )
      fireEvent.click(
        screen.getByRole('switch', { name: 'Disable Copy/Paste' })
      )
      await fill()
      fireEvent.change(screen.getByLabelText('Due Time for Section 1'), {
        target: { value: '2026-11-21T09:00' }
      })
      const create = screen.getByRole('button', {
        name: 'Create in 3 sections'
      })
      const dialog = await openCreateConfirmation()
      if (action === 'Escape') {
        fireEvent.keyDown(dialog, { key: 'Escape' })
      } else {
        fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      }
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(document.activeElement).toBe(create)
      expect(
        screen.getByLabelText<HTMLInputElement>('Due Time for Section 1').value
      ).toBe('2026-11-21T09:00')
      fireEvent.mouseDown(screen.getByRole('tab', { name: 'Assignment' }), {
        button: 0,
        ctrlKey: false
      })
      expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
        'New content'
      )
      expect(
        screen.getByRole<HTMLTextAreaElement>('textbox', {
          name: 'Description'
        }).value
      ).toBe('<p>Description</p>')
      expect(
        within(screen.getByRole('combobox', { name: /Week/ })).getByText('1')
      ).toBeTruthy()
      expect(
        screen
          .getByRole('switch', { name: 'Hide Hidden Testcase Result' })
          .getAttribute('aria-checked')
      ).toBe('true')
      expect(
        screen
          .getByRole('switch', { name: 'Disable Copy/Paste' })
          .getAttribute('aria-checked')
      ).toBe('true')
      expect(
        screen.getByRole<HTMLInputElement>('spinbutton', {
          name: 'Score for Alpha'
        }).value
      ).toBe('40')
      expect(
        screen.getByLabelText<HTMLInputElement>(
          'Manual solution release for Alpha (Asia/Seoul)'
        ).value
      ).toBe('2026-11-20T12:30')
    }
  )

  it.each(['loading', 'error', 'unauthenticated', 'forbidden'] as const)(
    'blocks selected-problem review and Confirm while catalogue status is %s',
    async (status) => {
      const ready = createTestProblemCatalog({ problems: createTestProblems() })
      const { rerenderCatalog } = setup(false, ready)
      chooseManualProblem()
      await fill()
      rerenderCatalog({ ...ready, status })
      fireEvent.click(
        screen.getByRole('button', { name: 'Create in 3 sections' })
      )
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(
        screen.getByText(
          'Reload problem information before saving selected problems.'
        )
      ).toBeTruthy()
      rerenderCatalog(ready)
      const dialog = await openCreateConfirmation()
      rerenderCatalog({ ...ready, status })
      fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
        'New content'
      )
      expect(
        screen.getByRole<HTMLInputElement>('spinbutton', {
          name: 'Score for Alpha'
        }).value
      ).toBe('40')
    }
  )

  it.each(['missing', 'without-solution'] as const)(
    'rechecks selected problem information when it becomes %s',
    async (change) => {
      const ready = createTestProblemCatalog({ problems: createTestProblems() })
      const { rerenderCatalog } = setup(false, ready)
      chooseManualProblem()
      await fill()
      const dialog = await openCreateConfirmation()
      rerenderCatalog({
        ...ready,
        problems:
          change === 'missing'
            ? []
            : ready.problems.map((problem) => ({
                ...problem,
                hasSolution: false
              }))
      })
      fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
      expect(
        screen.getByRole<HTMLInputElement>('spinbutton', { name: /^Score for/ })
          .value
      ).toBe('40')
    }
  )

  it('rechecks sections before Confirm and preserves the draft when options recover', async () => {
    const { rerenderOptions } = setup()
    await fill()
    const dialog = await openCreateConfirmation()
    rerenderOptions({ ...options, sections: [] })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(
      screen.getByText('Select unique sections from this Blueprint.')
    ).toBeTruthy()
    rerenderOptions(options)
    expect(
      screen.getByLabelText<HTMLInputElement>('Start Time for Section 1').value
    ).toBe('2026-11-20T10:00')
  })

  it('keeps input editable and review disabled while creation options are unavailable', async () => {
    const { rerenderOptions } = setup()
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Preserved title' }
    })
    rerenderOptions(options, false)
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Create in 0 sections'
      }).disabled
    ).toBe(true)
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Preserved title'
    )
    rerenderOptions(options)
    await fill()
    const dialog = await openCreateConfirmation()
    rerenderOptions(options, false)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }))
    await waitFor(() => {
      expect(document.activeElement?.getAttribute('role')).toBe('tab')
    })
    expect(screen.getByRole('alert').textContent).toBe(
      'Reload creation options before saving.'
    )
  })

  it('returns to the owner-provided list action without resetting input itself', () => {
    const { onCancel } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
