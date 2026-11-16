import { GET_PROBLEM_DETAIL } from '@/graphql/problem/queries'
import { useApolloClient } from '@apollo/client'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import type { Session } from 'next-auth'
import type * as NextAuthReact from 'next-auth/react'
import { StrictMode, useEffect, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ClientApolloProvider } from './ApolloProvider'

const auth = vi.hoisted(() => ({
  session: null as Session | null,
  status: 'authenticated' as 'authenticated' | 'loading' | 'unauthenticated',
  delayed: false,
  release: null as (() => void) | null,
  requests: [] as (string | undefined)[],
  delivered: [] as (string | undefined)[]
}))
vi.mock('next-auth/react', async (original) => ({
  ...(await original<typeof NextAuthReact>()),
  useSession: () => ({ data: auth.session, status: auth.status })
}))
vi.mock('apollo-upload-client/createUploadLink.mjs', async () => {
  const { ApolloLink, Observable } = await import('@apollo/client')
  return {
    default: () =>
      new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            const token = operation.getContext().headers.authorization as
              | string
              | undefined
            auth.requests.push(token)
            const deliver = () => {
              auth.delivered.push(token)
              observer.next({
                data: {
                  getProblem: { title: token ?? 'anonymous', description: '' }
                }
              })
              observer.complete()
            }
            let timer: ReturnType<typeof setTimeout> | undefined
            if (auth.delayed && token === 'first-token') {
              auth.release = deliver
            } else {
              timer = setTimeout(deliver, 0)
            }
            return () => clearTimeout(timer)
          })
      )
  }
})

afterEach(cleanup)
function session(username = 'owner', accessToken = 'first-token'): Session {
  return {
    user: { username, role: 'Admin' },
    token: {
      accessToken,
      refreshToken: 'test-refresh',
      accessTokenExpires: 9999999999999,
      refreshTokenExpires: 9999999999999
    },
    expires: '2099-01-01T00:00:00Z'
  }
}
beforeEach(() => {
  auth.session = session()
  auth.status = 'authenticated'
  auth.delayed = false
  auth.release = null
  auth.requests = []
  auth.delivered = []
})

function setup() {
  const clients = new Set<ReturnType<typeof useApolloClient>>()
  const caches = new Set<QueryClient>()
  function Editor() {
    const client = useApolloClient()
    const cache = useQueryClient()
    const [draft, setDraft] = useState('')
    const [title, setTitle] = useState('')
    useEffect(() => {
      clients.add(client)
      caches.add(cache)
    }, [client, cache])
    return (
      <>
        <input
          aria-label="Draft"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
        />
        <button
          onClick={async () => {
            const { data } = await client.query({
              query: GET_PROBLEM_DETAIL,
              variables: { id: 1 },
              fetchPolicy: 'no-cache'
            })
            setTitle(data.getProblem.title)
          }}
        >
          Read
        </button>
        <p>{title}</p>
      </>
    )
  }
  const snapshot = session()
  const tree = () => (
    <StrictMode>
      <ClientApolloProvider session={snapshot}>
        <Editor />
      </ClientApolloProvider>
    </StrictMode>
  )
  const view = render(tree())
  return { clients, caches, update: () => view.rerender(tree()) }
}

describe('Admin Apollo session ownership', () => {
  it('uses the latest same-account token without replacing the editor or query caches', async () => {
    auth.session = null
    auth.status = 'loading'
    const view = setup()
    fireEvent.change(screen.getByLabelText('Draft'), {
      target: { value: 'Keep my input' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Read' }))
    await screen.findByText('first-token')
    auth.session = session('owner', 'refreshed-token')
    auth.status = 'loading'
    view.update()
    auth.status = 'authenticated'
    view.update()
    fireEvent.click(screen.getByRole('button', { name: 'Read' }))
    await screen.findByText('refreshed-token')
    expect(screen.getByLabelText<HTMLInputElement>('Draft').value).toBe(
      'Keep my input'
    )
    expect(auth.requests).toEqual(['first-token', 'refreshed-token'])
    expect(view.clients.size).toBe(1)
    expect(view.caches.size).toBe(1)
  })

  it.each(['account', 'role', 'logout'] as const)(
    'replaces owned data after %s and ignores a late previous-account response',
    async (change) => {
      const view = setup()
      const previous = [...view.clients][0]
      const previousCache = [...view.caches][0]
      previousCache.setQueryData(['private'], 'old account')
      auth.delayed = true
      fireEvent.change(screen.getByLabelText('Draft'), {
        target: { value: 'Old draft' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Read' }))
      await waitFor(() => expect(auth.requests).toHaveLength(1))
      auth.session =
        change === 'logout'
          ? null
          : session(change === 'account' ? 'other' : 'owner', 'other-token')
      if (change === 'role' && auth.session) {
        auth.session.user.role = 'User'
      }
      auth.status = change === 'logout' ? 'unauthenticated' : 'authenticated'
      view.update()
      expect(screen.getByLabelText<HTMLInputElement>('Draft').value).toBe('')
      const current = [...view.clients].at(-1)
      expect(current).not.toBe(previous)
      expect(current?.cache.extract()).toEqual({})
      expect([...view.caches].at(-1)?.getQueryData(['private'])).toBeUndefined()
      fireEvent.click(screen.getByRole('button', { name: 'Read' }))
      await screen.findByText(change === 'logout' ? 'anonymous' : 'other-token')
      auth.release?.()
      await waitFor(() => expect(auth.delivered).toContain('first-token'))
      expect(screen.queryByText('first-token')).toBeNull()
      expect(auth.requests.at(-1)).toBe(
        change === 'logout' ? undefined : 'other-token'
      )
    }
  )
})
