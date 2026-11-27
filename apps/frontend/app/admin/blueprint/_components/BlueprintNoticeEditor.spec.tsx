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
import { afterEach, describe, expect, it, vi } from 'vitest'
import type {
  BlueprintNoticeEditData,
  BlueprintNoticeSource
} from '../_libs/noticeTypes'
import { createTestOptions } from '../_test/createFixtures'
import '../_test/createFormEnvironment'
import { deferred } from '../_test/deferred'
import { BlueprintNoticeDataSourceProvider } from './BlueprintNoticeDataSourceProvider'
import { BlueprintNoticeEditor } from './BlueprintNoticeEditor'

const sections = createTestOptions().sections.slice(0, 2)
function editData(noticeId = 101): BlueprintNoticeEditData {
  return {
    blueprintCourseId: 51,
    noticeId,
    sections,
    values: {
      title: `Notice ${noticeId}`,
      content: '<p>Original body</p>',
      sectionGroupIds: [1]
    }
  }
}
function sourceFor(data: unknown = editData()): BlueprintNoticeSource {
  return {
    readNotices: vi.fn(() =>
      Promise.resolve({
        status: 'success' as const,
        data: { items: [], nextCursor: null, hasNextPage: false }
      })
    ),
    readOptions: vi.fn(() =>
      Promise.resolve({ status: 'success' as const, data: { sections } })
    ),
    readNotice: vi.fn(() =>
      Promise.resolve({
        status: 'success' as const,
        data: data as BlueprintNoticeEditData
      })
    )
  }
}
const clients: QueryClient[] = []
function setup(
  source: BlueprintNoticeSource | null = sourceFor(),
  noticeId: number | null = 101,
  open = true
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  clients.push(client)
  const onOpenChange = vi.fn()
  const tree = (id: number | null, visible: boolean) => {
    const editor = (
      <BlueprintNoticeEditor
        blueprintId={51}
        noticeId={id}
        open={visible}
        onOpenChange={onOpenChange}
      />
    )
    return (
      <QueryClientProvider client={client}>
        {source ? (
          <BlueprintNoticeDataSourceProvider source={source}>
            {editor}
          </BlueprintNoticeDataSourceProvider>
        ) : (
          editor
        )}
      </QueryClientProvider>
    )
  }
  const view = render(tree(noticeId, open))
  return {
    client,
    onOpenChange,
    show: (id: number | null, visible = true) =>
      view.rerender(tree(id, visible))
  }
}
function setBody(value: string) {
  fireEvent.change(
    within(screen.getByRole('group', { name: 'Main Text' })).getByRole(
      'textbox'
    ),
    { target: { value } }
  )
}
function openConfirmation(editing: boolean) {
  const button = screen.getByRole('button', {
    name: editing ? 'Update' : 'Create'
  })
  button.focus()
  fireEvent.click(button)
  return screen.findByRole('dialog', {
    name: editing ? '변경사항을 저장할까요?' : '2개 분반에 저장할까요?'
  })
}
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
  vi.restoreAllMocks()
})

describe('Blueprint Notice editor', () => {
  it('shows a disconnected boundary without inventing form values', async () => {
    setup(null)
    expect(
      await screen.findByText('Blueprint Notice information is not connected.')
    ).toBeTruthy()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it.each([
    { ...editData(), values: { ...editData().values, content: null } },
    {
      ...editData(),
      values: { ...editData().values, sectionGroupIds: undefined }
    },
    { ...editData(), blueprintCourseId: 52 }
  ])(
    'restricts missing or differently scoped data without defaults: %j',
    async (data) => {
      setup(sourceFor(data))
      await screen.findByText(/Complete Notice information is unavailable/)
      expect(screen.queryByRole('textbox')).toBeNull()
    }
  )

  it('validates Course UI limits, selects sections and preserves Create input after confirmation Cancel', async () => {
    setup(sourceFor(), null)
    await screen.findByLabelText(/Title/)
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(
      screen.getByText('Select at least one available section.')
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'N'.repeat(36) }
    })
    setBody(`<p>${'B'.repeat(401)}</p>`)
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))
    expect(
      screen.getByText('Enter a title between 1 and 35 characters.')
    ).toBeTruthy()
    expect(
      screen.getByText('Enter Main Text between 1 and 400 characters.')
    ).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'New Notice' }
    })
    setBody('<p>Draft body</p>')
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select all Notice sections' })
    )
    const confirmation = await openConfirmation(false)
    expect(within(confirmation).getByText('Section 1')).toBeTruthy()
    expect(within(confirmation).getByText('Section 2')).toBeTruthy()
    expect(screen.queryByText(/Schedule|Week|Solution|Score/)).toBeNull()
    fireEvent.click(
      within(confirmation).getByRole('button', { name: 'Cancel' })
    )
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'New Notice'
    )
    expect(
      within(
        screen.getByRole('group', { name: 'Main Text' })
      ).getByRole<HTMLTextAreaElement>('textbox').value
    ).toBe('<p>Draft body</p>')
    expect(
      screen
        .getByRole('checkbox', { name: 'Select all Notice sections' })
        .getAttribute('data-state')
    ).toBe('checked')
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Create' })
      )
    )
  })

  it('fixes linked sections, blocks unchanged review, and displays edit differences without saving', async () => {
    const request = vi.spyOn(globalThis, 'fetch')
    setup()
    await screen.findByDisplayValue('Notice 101')
    expect(screen.queryByRole('checkbox')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Update' }))
    expect(screen.getByText('No Notice changes to review.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Updated Notice' }
    })
    setBody('<p>Changed body</p>')
    const confirmation = await openConfirmation(true)
    expect(within(confirmation).getByText('Before: Notice 101')).toBeTruthy()
    expect(within(confirmation).getByText('After: Updated Notice')).toBeTruthy()
    expect(within(confirmation).getByText('Before: Original body')).toBeTruthy()
    expect(within(confirmation).getByText('After: Changed body')).toBeTruthy()
    expect(within(confirmation).queryByText('Section 2')).toBeNull()
    fireEvent.keyDown(confirmation, { key: 'Escape' })
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Update' })
      )
    )
    const next = await openConfirmation(true)
    const confirm = within(next).getByRole('button', { name: 'Confirm' })
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    expect(
      screen.getByText(
        'Blueprint Notice updates are not connected. No notice has been updated.'
      )
    ).toBeTruthy()
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Updated Notice'
    )
    expect(request).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Update' })
      )
    )
  })

  it('counts decoded body text consistently and rejects blank or oversized content', async () => {
    setup(sourceFor(), null)
    await screen.findByLabelText(/Title/)
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Notice with entities' }
    })
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select all Notice sections' })
    )
    setBody(`<p>${'&amp;'.repeat(400)}</p>`)
    expect(screen.getByText('400/400')).toBeTruthy()
    const confirmation = await openConfirmation(false)
    fireEvent.click(
      within(confirmation).getByRole('button', { name: 'Cancel' })
    )
    for (const body of [
      `<p>${'&amp;'.repeat(401)}</p>`,
      '<p>&nbsp;&#160;&#xA0;&#9;&#10;</p>'
    ]) {
      setBody(body)
      fireEvent.click(screen.getByRole('button', { name: 'Create' }))
      expect(
        screen.getByText('Enter Main Text between 1 and 400 characters.')
      ).toBeTruthy()
      expect(
        screen.queryByRole('dialog', { name: '2개 분반에 저장할까요?' })
      ).toBeNull()
    }
  })

  it('compares decoded text and renders encoded markup only as text', async () => {
    const data = editData()
    const text = '&lt;img src=x onerror=alert(1)&gt; &amp; text'
    data.values.content = `<p>${text}</p>`
    setup(sourceFor(data))
    await screen.findByDisplayValue('Notice 101')
    setBody(`<p><strong>${text}</strong></p>`)
    const confirmation = await openConfirmation(true)
    expect(
      within(confirmation).getByText(
        'Before: <img src=x onerror=alert(1)> & text'
      )
    ).toBeTruthy()
    expect(
      within(confirmation).getByText(
        'After: <img src=x onerror=alert(1)> & text'
      )
    ).toBeTruthy()
    expect(
      within(confirmation).getByText(
        'Formatting or embedded content has changed.'
      )
    ).toBeTruthy()
    expect(confirmation.querySelector('img, script, style')).toBeNull()
  })

  it.each(['incomplete', 'forbidden', 'error', 'linked-change'] as const)(
    'closes confirmation and preserves the draft across a %s refetch',
    async (failure) => {
      const source = sourceFor()
      const view = setup(source)
      await screen.findByDisplayValue('Notice 101')
      fireEvent.change(screen.getByLabelText(/Title/), {
        target: { value: 'Unsaved draft' }
      })
      await openConfirmation(true)
      if (failure === 'error') {
        vi.mocked(source.readNotice).mockRejectedValueOnce(
          new Error('Read failed')
        )
      } else if (failure === 'forbidden') {
        vi.mocked(source.readNotice).mockResolvedValueOnce({
          status: 'forbidden'
        })
      } else {
        const data =
          failure === 'incomplete'
            ? { ...editData(), values: { ...editData().values, content: null } }
            : {
                ...editData(),
                values: { ...editData().values, sectionGroupIds: [2] }
              }
        vi.mocked(source.readNotice).mockResolvedValueOnce({
          status: 'success',
          data: data as BlueprintNoticeEditData
        })
      }
      await act(async () => {
        await view.client.refetchQueries()
      })
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: '변경사항을 저장할까요?' })
        ).toBeNull()
      )
      expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
        'Unsaved draft'
      )
      expect(
        screen.getByLabelText<HTMLInputElement>(/Title/).matches(':disabled')
      ).toBe(true)
      if (failure === 'forbidden') {
        expect(
          screen.queryByRole('form', { name: 'Edit Blueprint Notice' })
        ).toBeNull()
      }
      await act(async () => {
        await view.client.refetchQueries()
      })
      await waitFor(() =>
        expect(
          screen.getByRole<HTMLButtonElement>('button', { name: 'Update' })
            .disabled
        ).toBe(false)
      )
      expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
        'Unsaved draft'
      )
      expect(
        screen.queryByRole('dialog', { name: '변경사항을 저장할까요?' })
      ).toBeNull()
    }
  )

  it('does not mix a delayed earlier Notice into another editor', async () => {
    const pending =
      deferred<Awaited<ReturnType<BlueprintNoticeSource['readNotice']>>>()
    const source = sourceFor()
    vi.mocked(source.readNotice).mockImplementation((_, id) =>
      id === 101
        ? pending.promise
        : Promise.resolve({ status: 'success', data: editData(id) })
    )
    const view = setup(source)
    expect(source.readNotice).toHaveBeenCalledWith(51, 101)
    view.show(102)
    await screen.findByDisplayValue('Notice 102')
    await act(() => {
      pending.resolve({ status: 'success', data: editData() })
    })
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Notice 102'
    )
  })

  it('keeps an explicitly empty linked list distinct from missing targets', async () => {
    const data = editData()
    setup(
      sourceFor({
        ...data,
        sections: [],
        values: { ...data.values, sectionGroupIds: [] }
      })
    )
    await screen.findByDisplayValue('Notice 101')
    expect(screen.getByText('No sections are currently linked.')).toBeTruthy()
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Changed without targets' }
    })
    const confirmation = await openConfirmation(true)
    expect(within(confirmation).getByText('No linked sections.')).toBeTruthy()
  })

  it('waits for a fresh read before seeding a reopened editor from cached data', async () => {
    const source = sourceFor()
    const view = setup(source, 101, false)
    expect(source.readNotice).not.toHaveBeenCalled()
    view.show(101)
    await screen.findByDisplayValue('Notice 101')
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Discarded draft' }
    })
    view.show(101, false)
    const pending =
      deferred<Awaited<ReturnType<BlueprintNoticeSource['readNotice']>>>()
    vi.mocked(source.readNotice).mockImplementationOnce(() => pending.promise)
    view.show(101)
    await waitFor(() => expect(source.readNotice).toHaveBeenCalledTimes(2))
    expect(screen.queryAllByRole('textbox')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Update' })).toBeNull()
    const fresh = editData()
    fresh.values = {
      ...fresh.values,
      title: 'Fresh title',
      content: '<p>Fresh body</p>'
    }
    await act(() => {
      pending.resolve({ status: 'success', data: fresh })
    })
    await screen.findByDisplayValue('Fresh title')
    expect(
      within(
        screen.getByRole('group', { name: 'Main Text' })
      ).getByRole<HTMLTextAreaElement>('textbox').value
    ).toBe('<p>Fresh body</p>')
    expect(screen.queryByDisplayValue('Notice 101')).toBeNull()
    expect(screen.queryByDisplayValue('Discarded draft')).toBeNull()
    await act(async () => {
      await view.client.resetQueries()
    })
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Update' })
          .disabled
      ).toBe(false)
    )
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Fresh title'
    )
    expect(
      within(
        screen.getByRole('group', { name: 'Main Text' })
      ).getByRole<HTMLTextAreaElement>('textbox').value
    ).toBe('<p>Fresh body</p>')
  })
})
