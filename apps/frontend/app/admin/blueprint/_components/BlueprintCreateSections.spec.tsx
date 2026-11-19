import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  emptyBlueprintCreateDraft,
  type BlueprintCreateDraft
} from '../_libs/createTypes'
import { createTestOptions } from '../_test/createFixtures'
import { BlueprintCreateSections } from './BlueprintCreateSections'

afterEach(cleanup)

const options = createTestOptions({
  courseTitle: 'Algorithms',
  weeks: [1]
})

function Harness({
  initial = emptyBlueprintCreateDraft(),
  errors = {},
  disabled = false
}: {
  initial?: BlueprintCreateDraft
  errors?: Readonly<Record<string, string>>
  disabled?: boolean
}) {
  const [draft, setDraft] = useState(initial)
  return (
    <BlueprintCreateSections
      options={options}
      draft={draft}
      onChange={setDraft}
      errors={errors}
      disabled={disabled}
    />
  )
}

function sectionCheckbox(groupId: number) {
  return screen.getByRole('checkbox', {
    name: `Select section Section ${groupId}`
  })
}

function dateInput(label: string, groupId: number) {
  return screen.getByLabelText<HTMLInputElement>(
    `${label} for Section ${groupId}`
  )
}

describe('Blueprint creation section selection', () => {
  it('starts dates empty and keeps existing dates when selecting all sections', () => {
    render(<Harness />)
    expect(
      screen.getByText('Select sections to enter their schedules.')
    ).toBeTruthy()
    fireEvent.click(sectionCheckbox(1))
    expect(dateInput('Start Time', 1).value).toBe('')
    expect(dateInput('Due Time', 1).value).toBe('')
    expect(dateInput('End Time', 1).value).toBe('')
    fireEvent.change(dateInput('Start Time', 1), {
      target: { value: '2026-11-15T09:00' }
    })
    const all = screen.getByRole('checkbox', { name: 'Select all sections' })
    expect(all.getAttribute('data-state')).toBe('indeterminate')
    fireEvent.click(all)
    expect(dateInput('Start Time', 1).value).toBe('2026-11-15T09:00')
    expect(dateInput('Start Time', 2).value).toBe('')
    expect(dateInput('End Time', 3).value).toBe('')
    expect(all.getAttribute('data-state')).toBe('checked')
    fireEvent.click(all)
    expect(screen.queryByLabelText('Start Time for Section 1')).toBeNull()
    expect(screen.getByText('0/3')).toBeTruthy()
  })

  it('applies the provisional bulk-edit policy only to selected sections and the enabled field', () => {
    render(<Harness />)
    fireEvent.click(sectionCheckbox(1))
    fireEvent.click(sectionCheckbox(2))
    const applyStart = screen.getByRole('switch', {
      name: 'Apply Start Time to selected sections'
    })
    fireEvent.click(applyStart)
    fireEvent.change(dateInput('Start Time', 1), {
      target: { value: '2026-11-15T09:00' }
    })
    expect(dateInput('Start Time', 2).value).toBe('2026-11-15T09:00')
    expect(screen.queryByLabelText('Start Time for Section 3')).toBeNull()
    fireEvent.change(dateInput('Due Time', 1), {
      target: { value: '2026-11-16T09:00' }
    })
    expect(dateInput('Due Time', 2).value).toBe('')
    fireEvent.click(applyStart)
    fireEvent.change(dateInput('Start Time', 1), {
      target: { value: '2026-11-15T10:00' }
    })
    expect(dateInput('Start Time', 2).value).toBe('2026-11-15T09:00')
  })

  it('associates each date error with its field and disables controls during saving', () => {
    render(
      <Harness
        initial={{
          ...emptyBlueprintCreateDraft(),
          sections: [{ groupId: 1, startTime: '', dueTime: '', endTime: '' }]
        }}
        errors={{ 'sections.1.startTime': 'Start Time is required.' }}
        disabled
      />
    )
    const field = dateInput('Start Time', 1)
    expect(field.getAttribute('aria-invalid')).toBe('true')
    const error = screen.getByRole('alert')
    expect(field.getAttribute('aria-describedby')).toBe(error.id)
    expect(field.disabled).toBe(true)
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect((checkbox as HTMLButtonElement).disabled).toBe(true)
    }
    for (const toggle of screen.getAllByRole('switch')) {
      expect((toggle as HTMLButtonElement).disabled).toBe(true)
    }
  })
})
