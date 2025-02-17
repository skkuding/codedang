import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BaseModal } from './BaseModal'

describe('BaseModal Component', () => {
  it('Should not show modal if open is false', () => {
    render(<BaseModal open={false} handleClose={vi.fn()} title="Test Modal" />)
    const modalContent = screen.queryByRole('alertdialog')
    expect(modalContent).not.toBeInTheDocument()
  })

  it('Render modal with the correct title and description', () => {
    render(
      <BaseModal
        open={true}
        handleClose={vi.fn()}
        title="Test Modal"
        description="This is a test description."
      />
    )

    expect(screen.getByText(/Test Modal/i)).toBeInTheDocument()
    expect(screen.getByText(/This is a test description./i)).toBeInTheDocument()
  })

  it('Render modal with loading state and loading message', () => {
    render(
      <BaseModal
        open={true}
        handleClose={vi.fn()}
        loading={true}
        loadingMessage="Loading data..."
      />
    )

    expect(screen.getByText(/Loading data.../i)).toBeInTheDocument()
  })
})
