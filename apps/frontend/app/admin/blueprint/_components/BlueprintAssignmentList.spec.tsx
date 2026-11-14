import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BlueprintAssignmentSummary,
  BlueprintListScope,
  BlueprintReadState
} from '../_libs/types'
import { BlueprintAssignmentList } from './BlueprintAssignmentList'

vi.mock('@/public/icons/arrow-bottom-thin.svg', () => ({
  default: () => null
}))
vi.mock('@/public/icons/arrow-top.svg', () => ({ default: () => null }))

const assignments: readonly BlueprintAssignmentSummary[] = [
  {
    id: 10,
    title: 'Alpha assignment',
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
    title: 'Beta assignment',
    week: 2,
    isExercise: false,
    assignment: []
  },
  {
    id: 12,
    title: 'Practice exercise',
    week: 1,
    isExercise: true,
    assignment: null
  }
]

const scope: BlueprintListScope = {
  blueprintCourseId: 1,
  isExercise: false,
  cursor: null,
  take: 10
}

function createProps() {
  return {
    scope,
    state: {
      status: 'success',
      data: assignments
    } as BlueprintReadState<readonly BlueprintAssignmentSummary[]>,
    onOpenMaster: vi.fn(),
    pagination: {
      page: 1,
      hasPrevious: false,
      hasNext: true,
      onPrevious: vi.fn(),
      onNext: vi.fn(),
      onPageSizeChange: vi.fn()
    }
  }
}

afterEach(cleanup)

describe('BlueprintAssignmentList', () => {
  it('uses the Course column order without adding unsupported master fields or sorting', () => {
    render(<BlueprintAssignmentList {...createProps()} />)
    const headers = within(screen.getByRole('table')).getAllByRole(
      'columnheader'
    )
    expect(headers.map((header) => header.textContent)).toEqual([
      '',
      'Week',
      'Title',
      'Sections'
    ])
    expect(screen.getByText('Week 1')).toBeTruthy()
    expect(
      screen.getByLabelText('Search this page').getAttribute('placeholder')
    ).toBe('Search')
    expect(screen.getByText('Searches this page only.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /sort|asc|desc/i })).toBeNull()
    expect(screen.queryByText('Period')).toBeNull()
    expect(screen.queryByText('Visible')).toBeNull()
  })

  it('keeps hidden page selections and selects only visible search matches', () => {
    render(<BlueprintAssignmentList {...createProps()} />)

    expect(screen.queryByText('Practice exercise')).toBeNull()
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Alpha assignment' })
    )
    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: 'beta' }
    })
    expect(screen.getByRole('status').textContent).toBe(
      '1 of 2 selected on this page'
    )
    expect(
      screen.queryByRole('button', { name: 'Alpha assignment' })
    ).toBeNull()

    const selectVisible = screen.getByRole('checkbox', {
      name: 'Select all visible assignments'
    })
    fireEvent.click(selectVisible)
    expect(screen.getByRole('status').textContent).toBe(
      '2 of 2 selected on this page'
    )
    fireEvent.click(selectVisible)
    expect(screen.getByRole('status').textContent).toBe(
      '1 of 2 selected on this page'
    )
    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: '' }
    })
    expect(
      screen
        .getByRole('checkbox', { name: 'Select Alpha assignment' })
        .getAttribute('aria-checked')
    ).toBe('true')
  })

  it.each([
    { blueprintCourseId: 2 },
    { isExercise: true },
    { cursor: 11 },
    { take: 20 }
  ])('resets local state when the request scope changes: %j', (change) => {
    const props = createProps()
    const { rerender } = render(<BlueprintAssignmentList {...props} />)
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Alpha assignment' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Sections for Alpha assignment' })
    )
    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: 'alpha' }
    })

    rerender(
      <BlueprintAssignmentList {...props} scope={{ ...scope, ...change }} />
    )
    expect(
      screen.getByLabelText<HTMLInputElement>('Search this page').value
    ).toBe('')
    expect(screen.getByRole('status').textContent).toMatch(/^0 of /)
    for (const button of screen.getAllByRole('button', {
      name: /^Sections for /
    })) {
      expect(button.getAttribute('aria-expanded')).toBe('false')
      expect(button.hasAttribute('aria-controls')).toBe(false)
    }
    if ('isExercise' in change) {
      expect(
        screen.getByRole('button', { name: 'Practice exercise' })
      ).toBeTruthy()
      expect(
        screen.queryByRole('button', { name: 'Alpha assignment' })
      ).toBeNull()
    }
  })

  it('restores an expanded selected row after hiding it with a page filter', () => {
    render(<BlueprintAssignmentList {...createProps()} />)
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Alpha assignment' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Sections for Alpha assignment' })
    )
    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: 'beta' }
    })
    expect(screen.queryByRole('link', { name: 'Section 01' })).toBeNull()

    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: '' }
    })
    expect(
      screen
        .getByRole('checkbox', { name: 'Select Alpha assignment' })
        .getAttribute('aria-checked')
    ).toBe('true')
    const expand = screen.getByRole('button', {
      name: 'Sections for Alpha assignment'
    })
    expect(expand.getAttribute('aria-expanded')).toBe('true')
    expect(
      document.getElementById(expand.getAttribute('aria-controls') ?? '')
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Section 01' })).toBeTruthy()
    fireEvent.click(expand)
    expect(expand.hasAttribute('aria-controls')).toBe(false)
    expect(screen.queryByRole('link', { name: 'Section 01' })).toBeNull()
  })

  it('separates selection, expansion, copy navigation, and master navigation', () => {
    const props = createProps()
    render(<BlueprintAssignmentList {...props} />)
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Alpha assignment' })
    )
    const expand = screen.getByRole('button', {
      name: 'Sections for Alpha assignment'
    })
    fireEvent.click(expand)
    expect(expand.getAttribute('aria-expanded')).toBe('true')
    expect(
      document.getElementById(expand.getAttribute('aria-controls') ?? '')
    ).toBeTruthy()
    const copyLink = screen.getByRole('link')
    expect(copyLink.getAttribute('href')).toBe('/admin/course/5/assignment/100')
    copyLink.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(copyLink)
    expect(props.onOpenMaster).not.toHaveBeenCalled()

    const master = screen.getByRole('button', { name: 'Alpha assignment' })
    expect(master.tagName).toBe('BUTTON')
    fireEvent.click(master)
    expect(props.onOpenMaster).toHaveBeenCalledExactlyOnceWith(10)
    fireEvent.click(screen.getByText('Week 2'))
    expect(props.onOpenMaster).toHaveBeenLastCalledWith(11)
  })

  it('keeps server pagination available when this page has no search matches', () => {
    const props = createProps()
    render(<BlueprintAssignmentList {...props} />)
    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: 'on another page' }
    })
    expect(
      screen.getByText("No assignments match this page's search.")
    ).toBeTruthy()
    expect(screen.getByText('Searches this page only.')).toBeTruthy()
    const next = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Next'
    })
    expect(next.disabled).toBe(false)
    fireEvent.click(next)
    expect(props.pagination.onNext).toHaveBeenCalledOnce()
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Previous' })
        .disabled
    ).toBe(true)
    expect(
      screen.queryByRole('button', { name: /create|edit|delete|import/i })
    ).toBeNull()
  })

  it('does not retain stale content for loading, error, permission, or missing results', () => {
    const props = createProps()
    const { rerender } = render(<BlueprintAssignmentList {...props} />)
    const onRetry = vi.fn()
    const states: BlueprintReadState<readonly BlueprintAssignmentSummary[]>[] =
      [
        { status: 'loading' },
        { status: 'error', onRetry },
        { status: 'forbidden' },
        { status: 'not-found' }
      ]

    for (const state of states) {
      rerender(<BlueprintAssignmentList {...props} state={state} />)
      expect(screen.queryByRole('table')).toBeNull()
      expect(screen.queryByText('Alpha assignment')).toBeNull()
      if (state.status === 'error') {
        fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
      }
    }
    expect(onRetry).toHaveBeenCalledOnce()

    rerender(
      <BlueprintAssignmentList
        {...props}
        state={{ status: 'success', data: [] }}
      />
    )
    expect(screen.getByText('No assignments on this page.')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe(
      '0 of 0 selected on this page'
    )
  })
})
