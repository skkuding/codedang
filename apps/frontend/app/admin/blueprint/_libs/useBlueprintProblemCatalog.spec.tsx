import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  problemRow as row,
  problemPage as page,
  problemCatalogWrapper as wrapper,
  type ProblemQueryMock
} from '../_test/problemCatalogFixtures'
import { useBlueprintProblemCatalog } from './useBlueprintProblemCatalog'

afterEach(cleanup)

const firstPage = Array.from({ length: 50 }, (_, index) => row(index + 1))
function setup(mocks: ProblemQueryMock[]) {
  return renderHook(() => useBlueprintProblemCatalog({ enabled: true }), {
    wrapper: wrapper(mocks)
  })
}
function failure(
  mode: 'my' | 'shared',
  cursor: number | null,
  statusCode?: number
) {
  const response = page(mode, [], cursor)
  response.error = Object.assign(new Error('Problem request failed'), {
    statusCode
  })
  delete response.result
  return response
}

describe('Blueprint problem catalogue using Apollo pages', () => {
  it('waits until enabled, merges shared IDs and preserves the latest metadata', async () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useBlueprintProblemCatalog({ enabled }),
      {
        initialProps: { enabled: false },
        wrapper: wrapper([
          page('my', [row(1)]),
          page('shared', [row(1, { title: 'Shared title' }), row(2)])
        ])
      }
    )
    expect(result.current.status).toBe('idle')
    rerender({ enabled: true })
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.problems.map(({ id, title }) => [id, title])).toEqual(
      [
        [1, 'Shared title'],
        [2, 'Problem 2']
      ]
    )
    expect(result.current.hasMore).toBe(false)
  })

  it('loads both streams with their own cursors, blocks duplicate clicks and stops at the last page', async () => {
    const nextMy = page('my', [row(51)], 50)
    const nextShared = page('shared', [row(151)], 150)
    nextMy.result = vi.fn(() => ({ data: { getProblems: [row(51)] } }))
    nextShared.result = vi.fn(() => ({ data: { getProblems: [row(151)] } }))
    const { result } = setup([
      page('my', firstPage),
      page(
        'shared',
        Array.from({ length: 50 }, (_, index) => row(index + 101))
      ),
      nextMy,
      nextShared
    ])
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => {
      result.current.loadMore()
      result.current.loadMore()
    })
    await waitFor(() => expect(result.current.problems).toHaveLength(102))
    expect(result.current.problems[0].id).toBe(1)
    expect(result.current.problems.at(-1)?.id).toBe(151)
    expect(result.current.hasMore).toBe(false)
    act(() => result.current.loadMore())
    expect(nextMy.result).toHaveBeenCalledOnce()
    expect(nextShared.result).toHaveBeenCalledOnce()
  })

  it('shows a failed stream as an error and retries it without discarding the successful stream', async () => {
    const { result } = setup([
      page('my', [row(1)]),
      failure('shared', null),
      page('shared', [row(2)])
    ])
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.problems.map((problem) => problem.id)).toEqual([1])
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.problems.map((problem) => problem.id)).toEqual([1, 2])
  })

  it('preserves loaded pages on a later failure and retries the same next cursor', async () => {
    const { result } = setup([
      page('my', firstPage),
      page('shared', []),
      failure('my', 50),
      page('my', [row(51)], 50)
    ])
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => result.current.loadMore())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.problems).toHaveLength(50)
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.problems).toHaveLength(51)
  })

  it.each([
    { rows: firstPage },
    { rows: [...firstPage.slice(1), firstPage[0]] }
  ])(
    'rejects repeated or cyclic pages without losing loaded metadata',
    async ({ rows }) => {
      const { result } = setup([
        page('my', firstPage),
        page('shared', []),
        page('my', rows, 50),
        page('my', [row(51)], 50)
      ])
      await waitFor(() => expect(result.current.status).toBe('ready'))
      act(() => result.current.loadMore())
      await waitFor(() => expect(result.current.status).toBe('error'))
      expect(result.current.problems).toHaveLength(50)
      act(() => result.current.retry())
      await waitFor(() => expect(result.current.status).toBe('ready'))
      expect(result.current.problems).toHaveLength(51)
    }
  )

  it.each([
    [undefined, 403, 'forbidden'],
    [403, 401, 'unauthenticated']
  ] as const)(
    'waits for both streams and prioritizes access failures before retrying fresh pages',
    async (firstCode, secondCode, status) => {
      const first = failure('my', 50, firstCode)
      const second = { ...failure('shared', 50, secondCode), delay: 60 }
      const link = new MockLink([
        page('my', firstPage),
        page('shared', firstPage),
        first,
        second,
        page('my', [row(1001)]),
        page('shared', [row(1002)])
      ])
      const request = vi.spyOn(link, 'request')
      const client = new ApolloClient({ cache: new InMemoryCache(), link })
      const { result } = renderHook(
        () => useBlueprintProblemCatalog({ enabled: true }),
        {
          wrapper: ({ children }: PropsWithChildren) => (
            <ApolloProvider client={client}>{children}</ApolloProvider>
          )
        }
      )
      await waitFor(() => expect(result.current.status).toBe('ready'))
      act(() => result.current.loadMore())
      await act(() => new Promise<void>((resolve) => setTimeout(resolve, 10)))
      act(() => {
        result.current.retry()
        result.current.loadMore()
      })
      expect(request).toHaveBeenCalledTimes(4)
      await waitFor(() => expect(result.current.status).toBe(status))
      expect(result.current.problems).toEqual([])
      act(() => result.current.retry())
      await waitFor(() => expect(result.current.status).toBe('ready'))
      expect(result.current.problems.map((problem) => problem.id)).toEqual([
        1001, 1002
      ])
      client.stop()
    }
  )

  it('unsubscribes old page reads when a scope unmounts instead of mixing them into the new owner', async () => {
    const old = page('my', [row(1, { title: 'Old owner' })])
    old.delay = 100
    old.result = vi.fn(() => ({
      data: { getProblems: [row(1, { title: 'Old owner' })] }
    }))
    const link = new MockLink([
      old,
      page('shared', []),
      page('my', [row(1, { title: 'Current owner' })]),
      page('shared', [])
    ])
    const client = new ApolloClient({ cache: new InMemoryCache(), link })
    const provider = ({ children }: PropsWithChildren) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    )
    const previous = renderHook(
      () => useBlueprintProblemCatalog({ enabled: true }),
      { wrapper: provider }
    )
    previous.unmount()
    const current = renderHook(
      () => useBlueprintProblemCatalog({ enabled: true }),
      { wrapper: provider }
    )
    await waitFor(() => expect(current.result.current.status).toBe('ready'))
    await act(() => new Promise<void>((resolve) => setTimeout(resolve, 120)))
    expect(current.result.current.problems[0].title).toBe('Current owner')
    expect(old.result).not.toHaveBeenCalled()
    client.stop()
  })

  it('distinguishes an invalid response from an empty result and can refetch it', async () => {
    const { result } = setup([
      page('my', [row(0)]),
      page('shared', []),
      page('my', [])
    ])
    await waitFor(() => expect(result.current.status).toBe('error'))
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.problems).toEqual([])
    expect(result.current.hasMore).toBe(false)
  })
})
