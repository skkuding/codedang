import { fireEvent, screen } from '@testing-library/react'

export async function fillCreateForm() {
  fireEvent.change(screen.getByLabelText(/Title/), {
    target: { value: 'New content' }
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
    target: { value: '<p>Description</p>' }
  })
  fireEvent.keyDown(screen.getByRole('combobox', { name: /Week/ }), {
    key: 'ArrowDown'
  })
  fireEvent.click(await screen.findByRole('option', { name: '1' }))
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Sections' }), {
    button: 0,
    ctrlKey: false
  })
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all sections' }))
  for (const field of ['Start', 'End']) {
    for (const groupId of [1, 2, 3]) {
      fireEvent.change(
        screen.getByLabelText(`${field} Time for Section ${groupId}`),
        {
          target: { value: `2026-11-${field === 'Start' ? '20' : '21'}T10:00` }
        }
      )
    }
  }
}

export function openCreateConfirmation() {
  fireEvent.click(screen.getByRole('button', { name: 'Create in 3 sections' }))
  return screen.findByRole('dialog')
}
