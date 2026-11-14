import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { BlueprintListPagination } from './BlueprintListPagination'

vi.mock('@/public/icons/arrow-bottom-thin.svg', () => ({
  default: () => null
}))
vi.mock('@/public/icons/arrow-top.svg', () => ({ default: () => null }))

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(cleanup)

function pagination(overrides = {}) {
  return {
    kind: 'assignments' as const,
    page: 3,
    pageSize: 2,
    selectedCount: 1,
    currentPageCount: 2,
    hasPrevious: true,
    hasNext: false,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onPageSizeChange: vi.fn(),
    ...overrides
  }
}

describe('Blueprint cursor pagination', () => {
  it('shows the known current page without inventing a total or page jump', () => {
    render(<BlueprintListPagination {...pagination()} />)
    const pages = screen.getByRole('navigation', {
      name: 'assignments pages'
    })
    expect(
      within(pages).getByLabelText('Page 3').getAttribute('aria-current')
    ).toBe('page')
    expect(within(pages).getAllByRole('button')).toHaveLength(2)
    expect(screen.getByRole('status').textContent).toBe(
      '1 of 2 selected on this page'
    )
    expect(screen.queryByText(/last page|page 3 of/i)).toBeNull()
  })

  it('uses adapter cursor boundaries to enable arrows and invoke navigation', () => {
    const props = pagination()
    render(<BlueprintListPagination {...props} />)
    const previous = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Previous'
    })
    const next = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Next'
    })
    expect(previous.disabled).toBe(false)
    expect(next.disabled).toBe(true)
    fireEvent.click(previous)
    fireEvent.click(next)
    expect(props.onPrevious).toHaveBeenCalledOnce()
    expect(props.onNext).not.toHaveBeenCalled()
  })

  it('keeps a nonstandard current take and requests a Course page-size option', async () => {
    const props = pagination({ kind: 'exercises' as const })
    render(<BlueprintListPagination {...props} />)
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Rows per page' }), {
      key: 'ArrowDown'
    })
    expect(
      await screen.findByRole('option', { name: '2', exact: true })
    ).toBeTruthy()
    for (const size of [10, 20, 30, 40, 50]) {
      expect(
        screen.getByRole('option', { name: String(size), exact: true })
      ).toBeTruthy()
    }
    fireEvent.click(screen.getByRole('option', { name: '20', exact: true }))
    expect(props.onPageSizeChange).toHaveBeenCalledWith(20)
  })
})
