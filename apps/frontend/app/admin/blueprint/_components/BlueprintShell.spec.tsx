import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BlueprintCourseInformation,
  BlueprintReadState
} from '../_libs/types'
import { BlueprintShell } from './BlueprintShell'

afterEach(cleanup)

const information: BlueprintReadState<BlueprintCourseInformation> = {
  status: 'success',
  data: {
    title: 'Provided course title',
    courseCode: 'CODE-42',
    semester: '2026 Fall'
  }
}

describe('BlueprintShell', () => {
  it.each(['assignment', 'exercise'] as const)(
    'uses provided metadata and marks the active %s route, including detail views',
    (kind) => {
      render(
        <BlueprintShell blueprintId={72} kind={kind} information={information}>
          <p>Page content</p>
        </BlueprintShell>
      )

      expect(
        screen.getByRole('heading', { name: kind.toUpperCase() })
      ).toBeTruthy()
      expect(
        screen.getByText('[CODE-42] Provided course title ㆍ 2026 Fall')
      ).toBeTruthy()
      expect(screen.getByText('Blueprint')).toBeTruthy()
      expect(screen.getByRole('main').textContent).toBe('Page content')
      const nav = screen.getByRole('navigation', { name: 'Blueprint content' })
      const assignment = within(nav).getByRole('link', { name: 'Assignment' })
      const exercise = within(nav).getByRole('link', { name: 'Exercise' })
      expect(assignment.getAttribute('href')).toBe(
        '/admin/blueprint/72/assignment'
      )
      expect(exercise.getAttribute('href')).toBe('/admin/blueprint/72/exercise')
      expect(
        (kind === 'assignment' ? assignment : exercise).getAttribute(
          'aria-current'
        )
      ).toBe('page')
      expect(
        (kind === 'assignment' ? exercise : assignment).hasAttribute(
          'aria-current'
        )
      ).toBe(false)
    }
  )

  it('links back to Course List and never links to unimplemented or excluded tabs', () => {
    render(
      <BlueprintShell blueprintId={72} kind="assignment" information={null}>
        <p>Page content</p>
      </BlueprintShell>
    )
    expect(
      screen
        .getByRole('link', { name: 'Back to Course List' })
        .getAttribute('href')
    ).toBe('/admin/course')
    const notice = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Notice'
    })
    expect(notice.disabled).toBe(true)
    expect(notice.getAttribute('aria-disabled')).toBe('true')
    expect(screen.queryByRole('link', { name: 'Notice' })).toBeNull()
    expect(screen.queryByText(/^(Home|Member|Q&A)$/)).toBeNull()
    expect(screen.getAllByRole('navigation')).toHaveLength(1)
  })

  it('does not fabricate course metadata before a data source is connected', () => {
    render(
      <BlueprintShell blueprintId={72} kind="assignment" information={null}>
        <p>Page content</p>
      </BlueprintShell>
    )
    expect(screen.getByRole('status').textContent).toBe(
      'Blueprint information is unavailable.'
    )
    expect(
      screen.queryByText(
        /undefined|null|CHS1330|2026 Fall|Provided course title/
      )
    ).toBeNull()
  })

  it('omits missing optional metadata instead of adding placeholder values', () => {
    render(
      <BlueprintShell
        blueprintId={72}
        kind="assignment"
        information={{ status: 'success', data: { title: 'Title only' } }}
      >
        <p>Page content</p>
      </BlueprintShell>
    )
    expect(screen.getByText('Title only')).toBeTruthy()
    expect(screen.queryByText(/undefined|null|ㆍ|\[72\]/)).toBeNull()
  })

  it('replaces prior metadata for loading, denied, missing and failed reads', () => {
    const onRetry = vi.fn()
    const { rerender } = render(
      <BlueprintShell
        blueprintId={72}
        kind="assignment"
        information={information}
      >
        <p>Page content</p>
      </BlueprintShell>
    )
    const states: BlueprintReadState<BlueprintCourseInformation>[] = [
      { status: 'loading' },
      { status: 'forbidden' },
      { status: 'not-found' },
      { status: 'error', onRetry }
    ]
    for (const state of states) {
      rerender(
        <BlueprintShell blueprintId={72} kind="assignment" information={state}>
          <p>Page content</p>
        </BlueprintShell>
      )
      expect(screen.queryByText(/Provided course title/)).toBeNull()
      expect(screen.getByText('Page content')).toBeTruthy()
    }
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
