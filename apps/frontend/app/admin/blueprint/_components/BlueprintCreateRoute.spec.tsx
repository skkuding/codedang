import { MockedProvider } from '@apollo/client/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import type { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  BlueprintCreateOptions,
  BlueprintCreateSource
} from '../_libs/createTypes'
import type { BlueprintReadState } from '../_libs/types'
import {
  createTestOptions,
  createTestProblemCatalog
} from '../_test/createFixtures'
import { fillCreateForm } from '../_test/createFormActions'
import '../_test/createFormEnvironment'
import '../_test/mockCreateIcons'
import { problemPage, problemRow } from '../_test/problemCatalogFixtures'
import { BlueprintCreateRoute } from './BlueprintCreateRoute'
import { BlueprintProblemCatalogProvider } from './BlueprintProblemCatalogBoundary'

const context = vi.hoisted(() => ({
  state: null as BlueprintReadState<BlueprintCreateOptions> | null,
  source: null as BlueprintCreateSource | null,
  blueprintId: 51,
  push: vi.fn()
}))

vi.mock('../_libs/useBlueprintRead', () => ({
  useBlueprintRead: () => context.state
}))
vi.mock('./BlueprintCreateSourceProvider', () => ({
  useBlueprintCreateSource: () => context.source
}))
vi.mock('./BlueprintWorkspace', () => ({
  useBlueprintWorkspace: () => ({
    blueprintId: context.blueprintId,
    kind: 'assignment',
    location: { cursor: 190, take: 2, page: 2 }
  })
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: context.push })
}))
afterEach(cleanup)

const options = createTestOptions()
const problemCatalog = createTestProblemCatalog()

beforeEach(() => {
  context.blueprintId = 51
  context.state = { status: 'success', data: options }
  context.source = {
    readOptions: () => Promise.resolve({ status: 'success', data: options })
  }
  context.push.mockReset()
})

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  const tree = () => (
    <QueryClientProvider client={client}>
      <BlueprintProblemCatalogProvider value={problemCatalog}>
        <BlueprintCreateRoute />
      </BlueprintProblemCatalogProvider>
    </QueryClientProvider>
  )
  const { rerender } = render(tree())
  return (state: BlueprintReadState<BlueprintCreateOptions>) => {
    context.state = state
    rerender(tree())
  }
}

describe('Blueprint create options refresh', () => {
  it('starts a fresh product catalogue owner when the Blueprint changes during a read', async () => {
    const session: Session = {
      user: { username: 'test-owner', role: 'Admin' },
      token: {
        accessToken: 'test-access',
        refreshToken: 'test-refresh',
        accessTokenExpires: 9999999999999,
        refreshTokenExpires: 9999999999999
      },
      expires: '2099-01-01T00:00:00Z'
    }
    const oldPage = problemPage('my', [
      problemRow(1, { title: 'Old Blueprint response' })
    ])
    const oldResult = vi.fn(() => ({
      data: {
        getProblems: [problemRow(1, { title: 'Old Blueprint response' })]
      }
    }))
    const mocks = [
      { ...oldPage, delay: 100, result: oldResult },
      { ...problemPage('shared', []), delay: 100 },
      problemPage('my', [problemRow(2, { title: 'New Blueprint response' })]),
      problemPage('shared', [])
    ]
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    const tree = () => (
      <SessionProvider
        session={session}
        basePath="/next-auth/api/auth"
        refetchOnWindowFocus={false}
      >
        <MockedProvider mocks={mocks} addTypename={false}>
          <QueryClientProvider client={client}>
            <BlueprintCreateRoute />
          </QueryClientProvider>
        </MockedProvider>
      </SessionProvider>
    )
    const view = render(tree())
    fireEvent.change(screen.getByLabelText('Title', { exact: false }), {
      target: { value: 'First Blueprint draft' }
    })
    context.blueprintId = 52
    view.rerender(tree())
    expect(
      screen.getByLabelText<HTMLInputElement>('Title', { exact: false }).value
    ).toBe('')
    fireEvent.click(screen.getByRole('button', { name: 'Edit Problem' }))
    await screen.findByRole('checkbox', {
      name: 'Include New Blueprint response'
    })
    await waitFor(() => expect(oldResult).toHaveBeenCalledOnce())
    expect(
      screen.queryByRole('checkbox', { name: 'Include Old Blueprint response' })
    ).toBeNull()
  })

  it('preserves entered content while an options refresh fails and recovers', async () => {
    const updateRead = setup()
    fireEvent.change(screen.getByLabelText(/Title/), {
      target: { value: 'Preserved title' }
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
      target: { value: '<p>Preserved description</p>' }
    })
    updateRead({ status: 'error', onRetry: vi.fn() })
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Preserved title'
    )
    expect(
      screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Description' })
        .value
    ).toBe('<p>Preserved description</p>')
    expect(
      screen.getByRole<HTMLButtonElement>('button', {
        name: 'Create in 0 sections'
      }).disabled
    ).toBe(true)
    updateRead({ status: 'success', data: options })
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLButtonElement>('button', {
          name: 'Create in 0 sections'
        }).disabled
      ).toBe(false)
    )
    expect(screen.getByLabelText<HTMLInputElement>(/Title/).value).toBe(
      'Preserved title'
    )
    expect(
      screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Description' })
        .value
    ).toBe('<p>Preserved description</p>')
  })

  it('returns to the original list query after confirmation cancellation', async () => {
    setup()
    await fillCreateForm()
    fireEvent.click(
      screen.getByRole('button', { name: 'Create in 3 sections' })
    )
    const dialog = await screen.findByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(context.push).toHaveBeenCalledWith(
      '/admin/blueprint/51/assignment?cursor=190&take=2&page=2'
    )
  })
})
