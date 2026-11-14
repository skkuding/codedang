import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import type {
  BlueprintAssignmentDetail,
  BlueprintAssignmentPage,
  BlueprintDataSource,
  BlueprintReadResult
} from '../_libs/types'
import { BlueprintDataSourceProvider } from './BlueprintDataSourceProvider'
import {
  BlueprintDetailRoute,
  BlueprintListRoute
} from './BlueprintRouteContent'
import { BlueprintWorkspace } from './BlueprintWorkspace'

const navigation = vi.hoisted(() => ({
  pathname: '/admin/blueprint/31/assignment',
  search: '',
  push: vi.fn()
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ push: navigation.push })
}))

vi.mock('@/public/icons/arrow-bottom-thin.svg', () => ({
  default: () => null
}))
vi.mock('@/public/icons/arrow-top.svg', () => ({ default: () => null }))

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

function assignment(isExercise = false): BlueprintAssignmentDetail {
  return {
    id: isExercise ? 191 : 91,
    title: isExercise ? 'Route exercise' : 'Route assignment',
    week: 4,
    isExercise,
    description: '<p>Adapter-provided instructions</p>',
    assignment: [
      {
        id: 703,
        groupId: 7,
        sectionLabel: 'Fixture Section',
        startTime: '2026-11-13T00:00:00Z',
        dueTime: null,
        endTime: '2026-11-20T09:00:00Z'
      }
    ],
    blueprintAssignmentProblem: [],
    isVisible: true,
    isRankVisible: false,
    isJudgeResultVisible: null,
    enableCopyPaste: true,
    autoFinalizeScore: false
  }
}

function createSource() {
  return {
    readCourse: vi.fn<BlueprintDataSource['readCourse']>(() =>
      Promise.resolve({
        status: 'success',
        data: { title: 'Adapter course', courseCode: 'ADAPTER-31' }
      })
    ),
    readAssignments: vi.fn<BlueprintDataSource['readAssignments']>((scope) =>
      Promise.resolve({
        status: 'success',
        data: {
          items: [assignment(scope.isExercise)],
          previousCursor: null,
          nextCursor: 91
        }
      })
    ),
    readAssignment: vi.fn<BlueprintDataSource['readAssignment']>((_, id) =>
      Promise.resolve({ status: 'success', data: assignment(id === 191) })
    )
  }
}

const clients: QueryClient[] = []

function renderRoutes(source?: BlueprintDataSource, initialDetail?: number) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  clients.push(client)
  function tree(detail?: number) {
    const workspace = (
      <BlueprintWorkspace blueprintId={31}>
        {detail === undefined ? (
          <BlueprintListRoute />
        ) : (
          <BlueprintDetailRoute assignmentId={detail} />
        )}
      </BlueprintWorkspace>
    )
    return (
      <QueryClientProvider client={client}>
        {source ? (
          <BlueprintDataSourceProvider source={source}>
            {workspace}
          </BlueprintDataSourceProvider>
        ) : (
          workspace
        )}
      </QueryClientProvider>
    )
  }
  const result = render(tree(initialDetail))
  return {
    navigate(pathname: string, search = '', detail?: number) {
      navigation.pathname = pathname
      navigation.search = search
      result.rerender(tree(detail))
    }
  }
}

beforeEach(() => {
  navigation.pathname = '/admin/blueprint/31/assignment'
  navigation.search = ''
  navigation.push.mockReset()
})

afterEach(() => {
  cleanup()
  clients.splice(0).forEach((client) => client.clear())
})

describe('Blueprint routed workspace', () => {
  it('renders unavailable information without a source and retains a usable detail Back link', () => {
    navigation.search = '?cursor=60&take=20&page=3'
    const routes = renderRoutes()
    expect(
      screen.getByText('Blueprint information is unavailable.')
    ).toBeTruthy()
    expect(
      screen.getByText('Blueprint content is currently unavailable.')
    ).toBeTruthy()
    expect(screen.queryByText(/Adapter course|Route assignment/)).toBeNull()

    routes.navigate('/admin/blueprint/31/assignment/91', navigation.search, 91)
    expect(
      screen
        .getByRole('link', { name: 'Back to Assignments' })
        .getAttribute('href')
    ).toBe('/admin/blueprint/31/assignment?cursor=60&take=20&page=3')
  })

  it('loads header and list through the supplied adapter with Blueprint scope', async () => {
    const source = createSource()
    navigation.search = '?cursor=60&take=20&page=3'
    renderRoutes(source)

    expect(await screen.findByText('[ADAPTER-31] Adapter course')).toBeTruthy()
    expect(
      await screen.findByRole('button', {
        name: 'Route assignment'
      })
    ).toBeTruthy()
    expect(source.readCourse).toHaveBeenCalledWith(31)
    expect(source.readAssignments).toHaveBeenCalledWith(
      expect.objectContaining({
        blueprintCourseId: 31,
        isExercise: false,
        cursor: 60,
        take: 20
      })
    )
    expect(screen.getByLabelText('Page 3')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(navigation.push).toHaveBeenLastCalledWith(
      '/admin/blueprint/31/assignment?cursor=91&take=20&page=4'
    )
  })

  it.each(['assignment', 'exercise'] as const)(
    'changes the %s page size from a cursor page to the first page and clears list state',
    async (kind) => {
      navigation.pathname = `/admin/blueprint/31/${kind}`
      navigation.search = '?cursor=60&take=2&page=3'
      const source = createSource()
      const routes = renderRoutes(source)
      const title = kind === 'exercise' ? 'Route exercise' : 'Route assignment'
      await screen.findByRole('button', { name: title })
      fireEvent.change(screen.getByLabelText('Search this page'), {
        target: { value: 'route' }
      })
      fireEvent.click(screen.getByRole('checkbox', { name: `Select ${title}` }))
      fireEvent.click(
        screen.getByRole('button', { name: `Sections for ${title}` })
      )
      fireEvent.keyDown(
        screen.getByRole('combobox', { name: 'Rows per page' }),
        { key: 'ArrowDown' }
      )
      fireEvent.click(
        await screen.findByRole('option', { name: '20', exact: true })
      )
      expect(navigation.push).toHaveBeenLastCalledWith(
        `/admin/blueprint/31/${kind}?take=20`
      )

      routes.navigate(`/admin/blueprint/31/${kind}`, '?take=20')
      await screen.findByRole('button', { name: title })
      expect(source.readAssignments).toHaveBeenLastCalledWith(
        expect.objectContaining({ cursor: null, take: 20, page: 1 })
      )
      expect(
        screen.getByLabelText<HTMLInputElement>('Search this page').value
      ).toBe('')
      expect(
        screen
          .getByRole('checkbox', { name: `Select ${title}` })
          .getAttribute('aria-checked')
      ).toBe('false')
      expect(
        screen
          .getByRole('button', { name: `Sections for ${title}` })
          .getAttribute('aria-expanded')
      ).toBe('false')
      expect(screen.getByLabelText('Page 1')).toBeTruthy()
    }
  )

  it('keeps list location and view state across a real workspace child switch', async () => {
    navigation.search = '?cursor=60&take=20&page=3'
    const source = createSource()
    const routes = renderRoutes(source)
    await screen.findByRole('button', { name: 'Route assignment' })
    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: 'route' }
    })
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Route assignment' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Sections for Route assignment' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Route assignment' }))
    expect(navigation.push).toHaveBeenLastCalledWith(
      '/admin/blueprint/31/assignment/91?cursor=60&take=20&page=3'
    )

    routes.navigate('/admin/blueprint/31/assignment/91', navigation.search, 91)
    expect(
      await screen.findByText('Adapter-provided instructions')
    ).toBeTruthy()
    expect(source.readAssignment).toHaveBeenCalledWith(31, 91)
    expect(screen.queryByLabelText('Search this page')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Back to Assignments' }))
    expect(navigation.push).toHaveBeenLastCalledWith(
      '/admin/blueprint/31/assignment?cursor=60&take=20&page=3'
    )

    routes.navigate('/admin/blueprint/31/assignment', navigation.search)
    await screen.findByRole('button', { name: 'Route assignment' })
    expect(
      screen.getByLabelText<HTMLInputElement>('Search this page').value
    ).toBe('route')
    expect(
      screen
        .getByRole('checkbox', { name: 'Select Route assignment' })
        .getAttribute('aria-checked')
    ).toBe('true')
    expect(
      screen
        .getByRole('button', { name: 'Sections for Route assignment' })
        .getAttribute('aria-expanded')
    ).toBe('true')
    expect(screen.getByRole('link', { name: 'Fixture Section' })).toBeTruthy()
  })

  it('resets the active list state when changing routed content kind and returning', async () => {
    const routes = renderRoutes(createSource())
    await screen.findByRole('button', { name: 'Route assignment' })
    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: 'route' }
    })
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Route assignment' })
    )
    routes.navigate('/admin/blueprint/31/exercise')
    await screen.findByRole('button', { name: 'Route exercise' })
    expect(
      screen
        .getByRole('link', { name: 'Exercise' })
        .getAttribute('aria-current')
    ).toBe('page')
    expect(
      screen.getByLabelText<HTMLInputElement>('Search this page').value
    ).toBe('')
    routes.navigate('/admin/blueprint/31/assignment')
    await screen.findByRole('button', { name: 'Route assignment' })
    expect(
      screen
        .getByRole('checkbox', { name: 'Select Route assignment' })
        .getAttribute('aria-checked')
    ).toBe('false')
    expect(
      screen.getByLabelText<HTMLInputElement>('Search this page').value
    ).toBe('')
  })

  it('resets on screen page identity changes even when a cursor has not changed', async () => {
    const routes = renderRoutes(createSource())
    await screen.findByRole('button', { name: 'Route assignment' })
    fireEvent.change(screen.getByLabelText('Search this page'), {
      target: { value: 'route' }
    })
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Route assignment' })
    )
    routes.navigate('/admin/blueprint/31/assignment', '?page=2')
    await screen.findByRole('button', { name: 'Route assignment' })
    expect(
      screen.getByLabelText<HTMLInputElement>('Search this page').value
    ).toBe('')
    expect(
      screen
        .getByRole('checkbox', { name: 'Select Route assignment' })
        .getAttribute('aria-checked')
    ).toBe('false')
  })

  it('shows a pending adapter read and then renders the returned page', async () => {
    const source = createSource()
    let complete:
      | ((result: BlueprintReadResult<BlueprintAssignmentPage>) => void)
      | undefined
    source.readAssignments.mockImplementation(
      () =>
        new Promise((resolve) => {
          complete = resolve
        })
    )
    renderRoutes(source)
    await screen.findByText('[ADAPTER-31] Adapter course')
    expect(screen.getByText('Loading Blueprint content…')).toBeTruthy()
    complete?.({
      status: 'success',
      data: { items: [assignment()], nextCursor: null }
    })
    expect(
      await screen.findByRole('button', {
        name: 'Route assignment'
      })
    ).toBeTruthy()
  })

  it.each(['forbidden', 'not-found'] as const)(
    'renders the adapter %s result on list and detail',
    async (status) => {
      const source = createSource()
      source.readAssignments.mockResolvedValue({ status })
      source.readAssignment.mockResolvedValue({ status })
      const routes = renderRoutes(source)
      const text =
        status === 'forbidden'
          ? 'You do not have access to this Blueprint content.'
          : 'This Blueprint content could not be found.'
      expect(await screen.findByText(text)).toBeTruthy()
      expect(
        screen.queryByRole('button', { name: 'Route assignment' })
      ).toBeNull()
      routes.navigate('/admin/blueprint/31/assignment/91', '', 91)
      expect(await screen.findByText(text)).toBeTruthy()
      expect(
        screen.getByRole('button', { name: 'Back to Assignments' })
      ).toBeTruthy()
    }
  )

  it('retries an adapter failure without adding a fake successful response', async () => {
    const source = createSource()
    source.readAssignments.mockRejectedValueOnce(
      new Error('Fixture read failure')
    )
    renderRoutes(source)
    expect(
      await screen.findByText('Could not load Blueprint content.')
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(
      await screen.findByRole('button', {
        name: 'Route assignment'
      })
    ).toBeTruthy()
    await waitFor(() => expect(source.readAssignments).toHaveBeenCalledTimes(2))
  })
})
