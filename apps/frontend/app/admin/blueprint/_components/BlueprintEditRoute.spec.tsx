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
import { BlueprintManagementSourceProvider } from '../_libs/BlueprintManagementSource'
import { emptyBlueprintCreateDraft } from '../_libs/createTypes'
import {
  isCompleteBlueprintEditData,
  type BlueprintEditData,
  type BlueprintManagementSource
} from '../_libs/editTypes'
import {
  createTestOptions,
  createTestProblemCatalog,
  createTestProblems,
  createTestSchedule
} from '../_test/createFixtures'
import '../_test/createFormEnvironment'
import '../_test/mockCreateIcons'
import { BlueprintEditRoute } from './BlueprintEditRoute'
import { BlueprintProblemCatalogProvider } from './BlueprintProblemCatalogBoundary'

const navigation = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push })
}))
vi.mock('./BlueprintWorkspace', () => ({
  useBlueprintWorkspace: () => ({
    blueprintId: 51,
    kind: 'assignment',
    location: { cursor: 190, take: 2, page: 2 }
  })
}))

function editData(assignmentId = 101): BlueprintEditData {
  const options = createTestOptions()
  return {
    blueprintId: 51,
    assignmentId,
    isExercise: false,
    options: { ...options, sections: options.sections.slice(0, 1) },
    draft: {
      ...emptyBlueprintCreateDraft(),
      title: `Original ${assignmentId}`,
      week: 1,
      description: '<p>Existing description</p>',
      problems: [{ problemId: 11, score: 35, solution: 'after-due' }],
      sections: [createTestSchedule()]
    },
    problems: createTestProblems()
  }
}

const clients: QueryClient[] = []
function setup(source: BlueprintManagementSource | null = null) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  clients.push(client)
  const tree = (assignmentId: number) => (
    <QueryClientProvider client={client}>
      <BlueprintManagementSourceProvider source={source}>
        <BlueprintProblemCatalogProvider value={createTestProblemCatalog()}>
          <BlueprintEditRoute assignmentId={assignmentId} />
        </BlueprintProblemCatalogProvider>
      </BlueprintManagementSourceProvider>
    </QueryClientProvider>
  )
  const view = render(tree(101))
  return { client, navigate: (id: number) => view.rerender(tree(id)) }
}

function sourceFor(data: BlueprintEditData | null): BlueprintManagementSource {
  return {
    readEdit: vi.fn(() =>
      Promise.resolve({ status: 'success' as const, data })
    ),
    readDeletionImpact: () => Promise.resolve({ status: 'forbidden' })
  }
}

async function expectRestricted(data: unknown) {
  expect(isCompleteBlueprintEditData(data)).toBe(false)
  setup(sourceFor(data as BlueprintEditData | null))
  await screen.findByText(/Complete edit information is unavailable/)
  expect(screen.queryByRole('textbox')).toBeNull()
}

beforeEach(() => navigation.push.mockReset())
afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})

describe('Blueprint editing read boundary', () => {
  it('retains the original detail path and page query while disconnected', () => {
    setup()
    expect(screen.queryByRole('textbox')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Back to Master Information' })
    )
    expect(navigation.push).toHaveBeenCalledWith(
      '/admin/blueprint/51/assignment/101?cursor=190&take=2&page=2'
    )
    expect(screen.getByText(/Blueprint editing is not connected/)).toBeTruthy()
  })

  it.each([
    null,
    { ...editData(), draft: { ...editData().draft, enableCopyPaste: null } },
    { ...editData(), draft: { ...editData().draft, sections: null } },
    {
      ...editData(),
      problems: [{ id: 11, title: 'Unknown Solution', level: 'Level1' }]
    },
    {
      ...editData(),
      draft: { ...editData().draft, problems: [{ problemId: 11, score: 5 }] }
    }
  ])(
    'rejects incomplete editor data without creating replacement values: %j',
    expectRestricted
  )

  it.each([
    '2026-11-15T00:00:00.000Z',
    '2026-11-15T00:00:00+09:00',
    '2026-02-30T00:00'
  ])('restricts dates the local input cannot represent: %s', async (date) => {
    const input = document.createElement('input')
    input.type = 'datetime-local'
    input.value = date
    expect(input.value).toBe('')
    const data = editData()
    data.draft.sections = [createTestSchedule(1, { startTime: date })]
    await expectRestricted(data)
    expect(data.draft.sections[0].startTime).toBe(date)
  })

  it('restricts a Week absent from its provided options without choosing another', async () => {
    const data = editData()
    data.draft.week = 19
    await expectRestricted(data)
    expect(data.draft.week).toBe(19)
  })

  it.each(['manual', 'after-due'] as const)(
    'keeps unsupported manual input restricted while release is %s',
    async (solution) => {
      const data = editData()
      data.draft.problems = [
        {
          problemId: 11,
          score: 0,
          solution,
          manualReleaseTime: '2026-11-16T00:00:00Z'
        }
      ]
      await expectRestricted(data)
      expect(data.draft.problems[0].manualReleaseTime).toBe(
        '2026-11-16T00:00:00Z'
      )
    }
  )

  it('preserves known zero values and original zero-second local times without a diff', async () => {
    const data = editData()
    data.draft.isJudgeResultVisible = false
    data.draft.enableCopyPaste = false
    data.draft.problems = [
      {
        problemId: 11,
        score: 0,
        solution: 'manual',
        manualReleaseTime: '2026-11-16T00:00:00'
      }
    ]
    data.draft.sections = [
      createTestSchedule(1, {
        startTime: '2026-11-15T00:00:00',
        endTime: '2026-11-20T00:00:00',
        dueTime: ''
      })
    ]
    expect(isCompleteBlueprintEditData(data)).toBe(true)
    setup(sourceFor(data))
    await screen.findByDisplayValue('Original 101')
    expect(
      screen.getByRole<HTMLInputElement>('spinbutton', {
        name: 'Score for Alpha'
      }).value
    ).toBe('0')
    expect(
      screen
        .getByRole('switch', { name: 'Disable Copy/Paste' })
        .getAttribute('aria-checked')
    ).toBe('true')
    expect(
      screen.getByLabelText<HTMLInputElement>(
        'Manual solution release for Alpha (Asia/Seoul)'
      ).value
    ).toBe('2026-11-16T00:00')
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Sections' }), {
      button: 0,
      ctrlKey: false
    })
    expect(
      screen.getByLabelText<HTMLInputElement>('Start Time for Section 1').value
    ).toBe('2026-11-15T00:00')
    expect(
      screen.getByLabelText<HTMLInputElement>('Due Time for Section 1').value
    ).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'Review changes' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('콘텐츠 변경 없음')).toBeTruthy()
    expect(
      within(dialog).getByRole('region', { name: 'Changed section schedules' })
        .textContent
    ).toContain('(0)')
    expect(data.draft.sections[0].startTime).toBe('2026-11-15T00:00:00')
    expect(data.draft.problems[0].manualReleaseTime).toBe('2026-11-16T00:00:00')
    expect(data.draft.isJudgeResultVisible).toBe(false)
  })

  it('accepts explicitly empty problem and linked-section arrays', async () => {
    const data = editData()
    data.options.sections = []
    data.draft.sections = []
    data.draft.problems = []
    data.problems = []
    expect(isCompleteBlueprintEditData(data)).toBe(true)
    setup(sourceFor(data))
    await screen.findByDisplayValue('Original 101')
    expect(screen.getByText('No problems added.')).toBeTruthy()
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Sections' }), {
      button: 0,
      ctrlKey: false
    })
    expect(screen.getByText('No sections are currently linked.')).toBeTruthy()
  })

  it('keeps a known empty required time blank and leaves its validation to the form', async () => {
    const data = editData()
    data.draft.sections = [createTestSchedule(1, { startTime: '' })]
    expect(isCompleteBlueprintEditData(data)).toBe(true)
    setup(sourceFor(data))
    await screen.findByDisplayValue('Original 101')
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Sections' }), {
      button: 0,
      ctrlKey: false
    })
    expect(
      screen.getByLabelText<HTMLInputElement>('Start Time for Section 1').value
    ).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'Review changes' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(
      screen.getByText('Enter a valid start time (Asia/Seoul).')
    ).toBeTruthy()
    expect(data.draft.sections[0].startTime).toBe('')
  })

  it.each([
    { ...editData(), blueprintId: 52 },
    { ...editData(), assignmentId: 102 },
    { ...editData(), isExercise: true }
  ])('rejects data from a different scope', async (data) => {
    setup(sourceFor(data))
    await screen.findByRole('alert')
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('preserves typed input across errors and incomplete refetches without replacing its baseline', async () => {
    const source = sourceFor(editData())
    const view = setup(source)
    const title = await screen.findByLabelText<HTMLInputElement>(/Title/)
    fireEvent.change(title, { target: { value: 'Unsaved change' } })
    vi.mocked(source.readEdit).mockRejectedValueOnce(new Error('Read failed'))
    await act(async () => {
      await view.client.refetchQueries()
    })
    await screen.findByText('Could not load Blueprint content.')
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Unsaved change'
    )
    vi.mocked(source.readEdit).mockResolvedValueOnce({
      status: 'success',
      data: {
        ...editData(),
        draft: { ...editData().draft, title: 'Changed on server' }
      }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    await waitFor(() =>
      expect(screen.queryByText('Could not load Blueprint content.')).toBeNull()
    )
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Unsaved change'
    )
    const unsupportedDate = editData()
    unsupportedDate.draft.sections = [
      createTestSchedule(1, { startTime: '2026-11-15T00:00:00Z' })
    ]
    const unsupportedWeek = editData()
    unsupportedWeek.draft.week = 19
    for (const data of [null, unsupportedDate, unsupportedWeek]) {
      vi.mocked(source.readEdit).mockResolvedValueOnce({
        status: 'success',
        data
      })
      await act(async () => {
        await view.client.refetchQueries()
      })
      await screen.findByText(/Complete edit information is unavailable/)
      expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
        'Unsaved change'
      )
      expect(
        screen.getByRole<HTMLButtonElement>('button', {
          name: 'Review changes'
        }).disabled
      ).toBe(true)
    }
    await act(async () => {
      await view.client.refetchQueries()
    })
    await waitFor(() =>
      expect(
        screen.queryByText(/Complete edit information is unavailable/)
      ).toBeNull()
    )
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Unsaved change'
    )
  })

  it('starts the next original without leaking the previous draft or delayed response', async () => {
    let finish:
      | ((
          value: Awaited<ReturnType<BlueprintManagementSource['readEdit']>>
        ) => void)
      | undefined
    const source = sourceFor(null)
    vi.mocked(source.readEdit).mockImplementation((_, id) =>
      id === 101
        ? new Promise((resolve) => {
            finish = resolve
          })
        : Promise.resolve({ status: 'success', data: editData(id) })
    )
    const view = setup(source)
    view.navigate(102)
    await screen.findByDisplayValue('Original 102')
    await act(() => {
      finish?.({ status: 'success', data: editData() })
    })
    expect(screen.queryByDisplayValue('Original 101')).toBeNull()
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Original 102'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(navigation.push).toHaveBeenLastCalledWith(
      '/admin/blueprint/51/assignment/102?cursor=190&take=2&page=2'
    )
  })
})
