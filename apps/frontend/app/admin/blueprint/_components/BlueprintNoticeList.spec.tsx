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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { blueprintNoticeKeys } from '../_libs/noticeQueries'
import type {
  BlueprintNoticePage,
  BlueprintNoticeSource
} from '../_libs/noticeTypes'
import type { BlueprintListLocation } from '../_libs/routes'
import '../_test/mockCreateIcons'
import { BlueprintNoticeDataSourceProvider } from './BlueprintNoticeDataSourceProvider'
import { BlueprintNoticeListRoute } from './BlueprintNoticeList'
import { BlueprintNoticeWorkspace } from './BlueprintNoticeWorkspace'

const navigation = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push })
}))
vi.mock('@/public/icons/pen.svg', () => ({ default: () => <svg /> }))
vi.mock('./BlueprintNoticeEditor', () => ({
  BlueprintNoticeEditor: ({
    blueprintId,
    noticeId,
    onOpenChange
  }: {
    blueprintId: number
    noticeId: number | null
    onOpenChange: (open: boolean) => void
  }) => (
    <div role="dialog" aria-label="Notice editor">
      <p>
        Editor {blueprintId}:{noticeId ?? 'new'}
      </p>
      <button onClick={() => onOpenChange(false)}>Cancel editor</button>
    </div>
  )
}))

const page: BlueprintNoticePage = {
  items: [
    { id: 11, title: 'Alpha notice', createdAt: '2026-11-01T00:00:00Z' },
    { id: 12, title: 'Beta notice', createdAt: null }
  ],
  hasNextPage: false,
  nextCursor: null
}
const location: BlueprintListLocation = { cursor: null, take: 10, page: 1 }
const clients: QueryClient[] = []

function setup(read: BlueprintNoticeSource['readNotices'] | null) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  clients.push(client)
  const source: BlueprintNoticeSource | null = read
    ? {
        readNotices: read,
        readOptions: () => Promise.resolve({ status: 'forbidden' }),
        readNotice: () => Promise.resolve({ status: 'forbidden' })
      }
    : null
  const tree = (blueprintId = 51, currentLocation = location) => {
    const content = (
      <BlueprintNoticeWorkspace
        blueprintId={blueprintId}
        location={currentLocation}
      >
        <BlueprintNoticeListRoute />
      </BlueprintNoticeWorkspace>
    )
    return (
      <QueryClientProvider client={client}>
        {source ? (
          <BlueprintNoticeDataSourceProvider source={source}>
            {content}
          </BlueprintNoticeDataSourceProvider>
        ) : (
          content
        )}
      </QueryClientProvider>
    )
  }
  const view = render(tree())
  return {
    client,
    changeScope: (blueprintId: number, nextLocation = location) =>
      view.rerender(tree(blueprintId, nextLocation))
  }
}

beforeEach(() => navigation.push.mockReset())
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
  vi.restoreAllMocks()
})

describe('Blueprint Notice list', () => {
  it('keeps Create available while product reads are disconnected', async () => {
    setup(null)
    expect(
      screen.getByText('Blueprint Notice data is not connected.')
    ).not.toBeNull()
    expect(screen.queryByText('No notices on this page.')).toBeNull()
    const create = screen.getByRole('button', { name: 'Create' })
    fireEvent.click(create)
    expect(screen.getByText('Editor 51:new')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel editor' }))
    await waitFor(() => expect(document.activeElement).toBe(create))
  })

  it('searches the loaded page, preserves hidden selections and opens row editing with the original ID', async () => {
    const read = vi.fn(() =>
      Promise.resolve({ status: 'success' as const, data: page })
    )
    setup(read)
    await screen.findByText('Alpha notice')
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Alpha notice' })
    )
    const search = screen.getByRole<HTMLInputElement>('textbox', {
      name: 'Search this page'
    })
    fireEvent.change(search, { target: { value: 'Beta' } })
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select all visible notices' })
    )
    expect(screen.getByText('2 of 2 selected on this page')).not.toBeNull()
    expect(screen.queryByText('Alpha notice')).toBeNull()
    expect(screen.getByText('Unavailable')).not.toBeNull()
    expect(screen.getByText('Searches this page only.')).not.toBeNull()
    const edit = screen.getByRole('button', { name: 'Edit Beta notice' })
    fireEvent.click(edit)
    expect(screen.getByText('Editor 51:12')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel editor' }))
    await waitFor(() => expect(document.activeElement).toBe(edit))
    expect(search.value).toBe('Beta')
    expect(screen.getByText('2 of 2 selected on this page')).not.toBeNull()
    expect(read).toHaveBeenCalledOnce()
    expect(screen.queryByRole('columnheader', { name: 'Week' })).toBeNull()
    expect(screen.queryByRole('columnheader', { name: 'Sections' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Import/ })).toBeNull()
  })

  it.each(['Cancel', 'Escape'])(
    'preserves selection and restores Delete focus after %s',
    async (action) => {
      const fetch = vi.spyOn(globalThis, 'fetch')
      setup(() => Promise.resolve({ status: 'success', data: page }))
      await screen.findByText('Alpha notice')
      fireEvent.click(
        screen.getByRole('checkbox', { name: 'Select all visible notices' })
      )
      fireEvent.change(
        screen.getByRole('textbox', { name: 'Search this page' }),
        { target: { value: 'Beta' } }
      )
      const trigger = screen.getByRole('button', { name: 'Delete (2)' })
      fireEvent.click(trigger)
      const dialog = await screen.findByRole('dialog')
      const modal = within(dialog)
      expect(modal.getByText('Alpha notice')).not.toBeNull()
      expect(modal.getByText('#11')).not.toBeNull()
      expect(modal.getByText('Beta notice')).not.toBeNull()
      expect(modal.getByText('#12')).not.toBeNull()
      expect(
        modal.getByRole<HTMLButtonElement>('button', { name: 'Confirm' })
          .disabled
      ).toBe(true)
      expect(
        modal.getByText(/impact and permissions have not been confirmed/)
      ).not.toBeNull()
      fireEvent.click(modal.getByRole('button', { name: 'Confirm' }))
      if (action === 'Cancel') {
        fireEvent.click(modal.getByRole('button', { name: 'Cancel' }))
      } else {
        fireEvent.keyDown(dialog, { key: 'Escape' })
      }
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      await waitFor(() => expect(document.activeElement).toBe(trigger))
      expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe('Beta')
      expect(screen.getByText('2 of 2 selected on this page')).not.toBeNull()
      expect(
        screen
          .getByRole('checkbox', { name: 'Select Beta notice' })
          .getAttribute('data-state')
      ).toBe('checked')
      expect(fetch).not.toHaveBeenCalled()
    }
  )

  it('purges removed IDs only on successful data and retains the remaining selection across an error and Retry', async () => {
    const read = vi.fn(() =>
      Promise.resolve({ status: 'success' as const, data: page })
    )
    const { client } = setup(read)
    await screen.findByText('Alpha notice')
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select all visible notices' })
    )
    const next = { ...page, items: [page.items[1]] }
    await act(() => {
      client.setQueryData(
        blueprintNoticeKeys.list({
          kind: 'notice',
          blueprintCourseId: 51,
          ...location
        }),
        { status: 'success', data: next }
      )
    })
    await screen.findByText('1 of 1 selected on this page')
    read.mockRejectedValueOnce(new Error('Read failed'))
    await act(async () => {
      await client.refetchQueries()
    })
    await screen.findByText('Could not load Blueprint content.')
    expect(screen.queryByText('No notices on this page.')).toBeNull()
    read.mockResolvedValueOnce({ status: 'success', data: next })
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await screen.findByText('1 of 1 selected on this page')
    expect(
      screen
        .getByRole('checkbox', { name: 'Select Beta notice' })
        .getAttribute('data-state')
    ).toBe('checked')
  })

  it.each(['forbidden', 'not-found'] as const)(
    'shows %s without an empty-success fallback',
    async (status) => {
      setup(() => Promise.resolve({ status }))
      await screen.findByRole('alert')
      expect(screen.queryByText('No notices on this page.')).toBeNull()
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Create' })
          .disabled
      ).toBe(false)
    }
  )

  it('shows an explicit empty page with selection and navigation disabled', async () => {
    setup(() =>
      Promise.resolve({
        status: 'success',
        data: { items: [], hasNextPage: false, nextCursor: null }
      })
    )
    await screen.findByText('No notices on this page.')
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Delete (0)' })
        .disabled
    ).toBe(true)
    expect(
      screen.getByRole<HTMLButtonElement>('checkbox', {
        name: 'Select all visible notices'
      }).disabled
    ).toBe(true)
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Next' }).disabled
    ).toBe(true)
  })

  it('preserves notice page parameters and disables unavailable or repeating cursors', async () => {
    const paged: BlueprintNoticePage = {
      ...page,
      hasNextPage: true,
      nextCursor: 99,
      previousCursor: 20
    }
    const read = vi.fn(() =>
      Promise.resolve({ status: 'success' as const, data: paged })
    )
    const { client, changeScope } = setup(read)
    changeScope(52, { cursor: 44, take: 2, page: 2 })
    await screen.findByText('Alpha notice')
    expect(read).toHaveBeenCalledWith({
      kind: 'notice',
      blueprintCourseId: 52,
      cursor: 44,
      take: 2,
      page: 2
    })
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(navigation.push).toHaveBeenLastCalledWith(
      '/admin/blueprint/52/notice?cursor=20&take=2'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(navigation.push).toHaveBeenLastCalledWith(
      '/admin/blueprint/52/notice?cursor=99&take=2&page=3'
    )
    await act(() => {
      client.setQueryData(
        blueprintNoticeKeys.list({
          kind: 'notice',
          blueprintCourseId: 52,
          cursor: 44,
          take: 2,
          page: 2
        }),
        {
          status: 'success',
          data: { ...paged, previousCursor: undefined, nextCursor: 44 }
        }
      )
    })
    await waitFor(() => {
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Previous' })
          .disabled
      ).toBe(true)
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Next' }).disabled
      ).toBe(true)
    })
  })

  it('closes a scoped editor and resets list state instead of reopening it after a Blueprint round trip', async () => {
    const { changeScope } = setup(() =>
      Promise.resolve({ status: 'success', data: page })
    )
    await screen.findByText('Alpha notice')
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Alpha notice' })
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Alpha' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Edit Alpha notice' }))
    expect(screen.getByText('Editor 51:11')).not.toBeNull()
    changeScope(52)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    changeScope(51)
    await screen.findByText('Alpha notice')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole<HTMLInputElement>('textbox').value).toBe('')
    expect(screen.getByText('0 of 2 selected on this page')).not.toBeNull()
  })
})
