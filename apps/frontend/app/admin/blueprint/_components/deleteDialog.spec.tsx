import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BlueprintManagementSourceProvider } from '../_libs/BlueprintManagementSource'
import type {
  BlueprintDeletionImpact,
  BlueprintManagementSource
} from '../_libs/editTypes'
import { blueprintKeys } from '../_libs/queries'
import type { BlueprintReadResult } from '../_libs/types'
import { BlueprintDeleteDialog } from './BlueprintDeleteDialog'

const impact: BlueprintDeletionImpact = {
  deletable: true,
  submissionCount: 0,
  recordedStudentCount: 0,
  sectionCount: 2,
  assignmentCount: 2,
  studentCount: 18,
  qnaCount: 0,
  noticeCount: 0
}
const targets = [
  { id: 191, title: 'First original' },
  { id: 192, title: 'Second original' }
]

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function setup(
  read: BlueprintManagementSource['readDeletionImpact'] | null,
  isExercise = false,
  client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  }),
  initialTargets: readonly { id: number; title: string }[] = targets
) {
  const onClose = vi.fn()
  const tree = (currentTargets = initialTargets, blueprintId = 51) => (
    <QueryClientProvider client={client}>
      <BlueprintManagementSourceProvider
        source={
          read
            ? {
                readEdit: () => Promise.resolve({ status: 'not-found' }),
                readDeletionImpact: read
              }
            : null
        }
      >
        <BlueprintDeleteDialog
          blueprintId={blueprintId}
          isExercise={isExercise}
          targets={currentTargets}
          onClose={onClose}
        />
      </BlueprintManagementSourceProvider>
    </QueryClientProvider>
  )
  const view = render(tree())
  return {
    onClose,
    rerender: (
      nextTargets: readonly { id: number; title: string }[],
      blueprintId = 51
    ) => view.rerender(tree(nextTargets, blueprintId))
  }
}

function confirm() {
  return screen.getByRole<HTMLButtonElement>('button', { name: 'Confirm' })
}

describe('Blueprint deletion confirmation', () => {
  it('blocks confirmation when deletion impact is not connected', () => {
    setup(null)
    expect(
      screen.getAllByText('Deletion impact is not connected.')
    ).toHaveLength(2)
    expect(confirm().disabled).toBe(true)
    expect(screen.getByRole('dialog').textContent).toContain(
      'Deletion effects on section copies are not confirmed.'
    )
  })

  it.each([false, true])(
    'shows all original IDs and impact counts without a delete request (exercise=%s)',
    async (isExercise) => {
      const fetch = vi.spyOn(globalThis, 'fetch')
      const read = vi.fn(() =>
        Promise.resolve({ status: 'success' as const, data: impact })
      )
      const { onClose } = setup(read, isExercise)
      expect(confirm().disabled).toBe(true)
      await waitFor(() => expect(confirm().disabled).toBe(false))
      for (const target of targets) {
        const row = within(
          screen.getByRole('region', {
            name: `${target.title} (ID ${target.id})`
          })
        )
        expect(row.getByRole('heading').textContent).toContain(`#${target.id}`)
        expect(row.getByText('Sections with copies')).not.toBeNull()
        expect(row.getByText('18')).not.toBeNull()
        expect(row.getByText('Submissions')).not.toBeNull()
        expect(read).toHaveBeenCalledWith(51, target.id)
      }
      fireEvent.click(confirm())
      fireEvent.click(confirm())
      expect(
        screen.getByText(
          'Blueprint deletion is not connected. No content has been deleted.'
        )
      ).not.toBeNull()
      expect(confirm().disabled).toBe(true)
      expect(read).toHaveBeenCalledTimes(2)
      expect(fetch).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
      expect(screen.getByText('First original')).not.toBeNull()
      expect(screen.getByText('Second original')).not.toBeNull()
    }
  )

  it.each([
    {
      result: { status: 'forbidden' },
      message: 'You do not have access to this Blueprint content.'
    },
    {
      result: { status: 'not-found' },
      message: 'This Blueprint content could not be found.'
    },
    {
      result: { status: 'success', data: { ...impact, submissionCount: 1 } },
      message: 'Learning records prevent deletion.'
    },
    {
      result: { status: 'success', data: { ...impact, deletable: false } },
      message: 'Deletion is not allowed for this original.'
    },
    {
      result: {
        status: 'success',
        data: { ...impact, recordedStudentCount: undefined }
      },
      message: 'Deletion impact is incomplete. Deletion cannot be confirmed.'
    }
  ])(
    'blocks the whole selection when $message',
    async ({ result, message }) => {
      setup((_, id) =>
        Promise.resolve(
          id === 191
            ? (result as BlueprintReadResult<BlueprintDeletionImpact>)
            : { status: 'success', data: impact }
        )
      )
      await screen.findByText(message)
      expect(confirm().disabled).toBe(true)
      expect(screen.getByText('Second original')).not.toBeNull()
    }
  )

  it('retries a failed impact without discarding the other target', async () => {
    let attempts = 0
    const read = vi.fn((_: number, id: number) => {
      if (id === 191 && attempts++ === 0) {
        return Promise.reject(new Error('Lookup unavailable'))
      }
      return Promise.resolve({ status: 'success' as const, data: impact })
    })
    setup(read)
    await screen.findByText('Could not load Blueprint content.')
    expect(confirm().disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() => expect(confirm().disabled).toBe(false))
    expect(read.mock.calls.filter(([, id]) => id === 192)).toHaveLength(1)
    expect(screen.getByText('First original')).not.toBeNull()
    expect(screen.getByText('Second original')).not.toBeNull()
  })

  it.each(['blocked', 'error'])(
    'blocks cached permissions while a new impact read is pending and then %s',
    async (outcome) => {
      const client = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      })
      for (const target of targets) {
        client.setQueryData(blueprintKeys.deletionImpact(51, target.id), {
          status: 'success',
          data: impact
        })
      }
      let finish = () => {}
      const pending = new Promise<BlueprintReadResult<BlueprintDeletionImpact>>(
        (resolve, reject) => {
          finish =
            outcome === 'blocked'
              ? () =>
                  resolve({
                    status: 'success',
                    data: { ...impact, deletable: false }
                  })
              : () => reject(new Error('Impact refresh failed'))
        }
      )
      const read = vi.fn((_: number, id: number) =>
        id === 191
          ? pending
          : Promise.resolve({ status: 'success' as const, data: impact })
      )
      setup(read, false, client)
      await waitFor(() => expect(read).toHaveBeenCalledTimes(2))
      expect(confirm().disabled).toBe(true)
      finish()
      await screen.findByText(
        outcome === 'blocked'
          ? 'Deletion is not allowed for this original.'
          : 'Could not load Blueprint content.'
      )
      expect(confirm().disabled).toBe(true)
    }
  )

  it.each([
    { blueprintId: 51, target: targets[1] },
    { blueprintId: 52, target: targets[0] }
  ])(
    'keeps a late response outside the current scope: %j',
    async ({ blueprintId, target }) => {
      let finish:
        | ((value: BlueprintReadResult<BlueprintDeletionImpact>) => void)
        | undefined
      const pending = new Promise<BlueprintReadResult<BlueprintDeletionImpact>>(
        (resolve) => {
          finish = resolve
        }
      )
      const read = vi.fn((blueprint: number, id: number) =>
        blueprint === 51 && id === 191
          ? pending
          : Promise.resolve({
              status: 'success' as const,
              data: { ...impact, deletable: false }
            })
      )
      const view = setup(read, false, undefined, [targets[0]])
      await waitFor(() => expect(read).toHaveBeenCalledWith(51, 191))
      view.rerender([target], blueprintId)
      await screen.findByText('Deletion is not allowed for this original.')
      await act(async () => {
        finish?.({ status: 'success', data: impact })
        await pending
      })
      await waitFor(() => expect(confirm().disabled).toBe(true))
      expect(screen.getAllByRole('region')).toHaveLength(1)
      expect(screen.getByRole('region').getAttribute('aria-label')).toBe(
        `${target.title} (ID ${target.id})`
      )
      expect(read).toHaveBeenCalledWith(blueprintId, target.id)
    }
  )

  it.each(['Cancel', 'Escape'])(
    '%s closes without applying changes to the selected targets',
    async (action) => {
      const before = JSON.stringify(targets)
      const onClose = vi.fn()
      function Review() {
        const [open, setOpen] = useState(false)
        return (
          <>
            <button onClick={() => setOpen(true)}>Delete originals</button>
            {open && (
              <BlueprintDeleteDialog
                blueprintId={51}
                isExercise={false}
                targets={targets}
                onClose={() => {
                  onClose()
                  setOpen(false)
                }}
              />
            )}
          </>
        )
      }
      render(
        <QueryClientProvider client={new QueryClient()}>
          <Review />
        </QueryClientProvider>
      )
      const trigger = screen.getByRole('button', { name: 'Delete originals' })
      trigger.focus()
      fireEvent.click(trigger)
      await screen.findByRole('dialog')
      if (action === 'Cancel') {
        fireEvent.click(screen.getByRole('button', { name: action }))
      } else {
        fireEvent.keyDown(screen.getByRole('dialog'), { key: action })
      }
      expect(onClose).toHaveBeenCalledOnce()
      expect(JSON.stringify(targets)).toBe(before)
      await waitFor(() => expect(document.activeElement).toBe(trigger))
    }
  )
})
